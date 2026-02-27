import csv
import json

def parse_sheet1():
    abilities = {}
    
    with open('sheet1.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        current_tree = None
        for row in reader:
            tree = row.get('Tree', '').strip()
            if tree:
                current_tree = tree
            
            name = row.get('Name', '').strip()
            scaling = row.get('Scaling', '').strip()
            if not name or name == 'Active' or name == 'Passive' or not current_tree:
                continue
            
            try:
                scaling_val = float(scaling)
            except ValueError:
                scaling_val = 0.0
                
            base_name = name
            level = None
            if base_name.endswith(' @1'):
                base_name = base_name[:-3]
                level = 1
            elif base_name.endswith(' @5'):
                base_name = base_name[:-3]
                level = 5

            if base_name not in abilities:
                abilities[base_name] = {
                    'tree': current_tree,
                    'name': base_name,
                    'scaling': 0.0,
                    'scaling_1': 0.0,
                    'scaling_5': 0.0,
                    'note': row.get('Note', '').strip()
                }
            
            # Only update note if we actually have one
            note = row.get('Note', '').strip()
            if note:
                # If note exists and we have an existing note, append it
                if abilities[base_name]['note'] and abilities[base_name]['note'] != note:
                    abilities[base_name]['note'] += "; " + note
                else:
                    abilities[base_name]['note'] = note

            if level == 1:
                abilities[base_name]['scaling_1'] = scaling_val
            elif level == 5:
                abilities[base_name]['scaling_5'] = scaling_val
            else:
                abilities[base_name]['scaling'] = scaling_val

    return abilities

def parse_sheet2(abilities):
    with open('sheet2.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('Name', '').strip()
            
            cast_time = row.get('Cast Time', '').strip()
            cooldown = row.get('Cooldown', '').strip()
            desc = row.get('Description', '').strip()
            type_ = row.get('Type', '').strip()
            weapon = row.get('Weapon', '').strip()
            
            try:
                ct = float(cast_time) / 1000.0 if cast_time and cast_time != 'N/A' else 0.0
            except:
                ct = 0.0
                
            try:
                cd = float(cooldown) / 1000.0 if cooldown and cooldown != 'N/A' else 0.0
            except:
                cd = 0.0
            
            # Special case mapping of name mismatches
            if name == 'Big Forty Five':
                name = 'Big 45'
            elif name == 'The Art of War':
                name = 'The Art of War'
            
            # Map into abilities if present
            if name in abilities:
                abilities[name]['cast_time'] = ct
                abilities[name]['cooldown'] = cd
                abilities[name]['description'] = desc
                abilities[name]['type'] = type_
                abilities[name]['weapon'] = weapon

def main():
    abs = parse_sheet1()
    parse_sheet2(abs)
    
    # Filter out empty entries that have no scaling at all
    final_abilities = []
    for k, v in abs.items():
        if v.get('scaling', 0) > 0 or v.get('scaling_1', 0) > 0 or v.get('scaling_5', 0) > 0:
            final_abilities.append(v)
            
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("const tswData = " + json.dumps(final_abilities, indent=2) + ";\n")

if __name__ == '__main__':
    main()
