import csv
import json
import os
import re

def clean_name(name):
    if not name: return ""
    # Remove anything in square brackets including the brackets
    name = re.sub(r'\[.*?\]', '', name)
    # Remove suffixes like @1, @5, 1st, Proc
    name = re.sub(r'\s+@\d+', '', name)
    name = re.sub(r'\s+\d+(st|nd|rd|th)', '', name)
    name = re.sub(r'\s+Proc$', '', name, flags=re.IGNORECASE)
    return name.strip()

def build_icon_map():
    icon_map = {}
    base_dir = 'ability_icons'
    if not os.path.exists(base_dir):
        return icon_map
        
    for weapon_dir in os.listdir(base_dir):
        w_path = os.path.join(base_dir, weapon_dir)
        if os.path.isdir(w_path):
            if weapon_dir not in icon_map:
                icon_map[weapon_dir] = {}
            for fname in os.listdir(w_path):
                if fname.lower().endswith('.png'):
                    name_part = fname[:-4]
                    norm = ''.join(c for c in name_part.lower() if c.isalnum())
                    icon_map[weapon_dir][norm] = fname
    return icon_map

def parse_scaling_data():
    scaling_data = {}
    if not os.path.exists('sheet1.csv'):
        return scaling_data
        
    with open('sheet1.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_name = row.get('Name', '').strip()
            if not raw_name: continue
            
            # Identify if it's base, @1, or @5
            level = 0
            if ' @1' in raw_name: level = 1
            elif ' @5' in raw_name: level = 5
            
            name = clean_name(raw_name)
            if not name: continue
            
            scaling_str = row.get('Scaling', '0').strip()
            try:
                scaling_val = float(scaling_str)
            except ValueError:
                scaling_val = 0.0
                
            if name not in scaling_data:
                scaling_data[name] = {'scaling': 0.0, 'scaling_1': 0.0, 'scaling_5': 0.0}
            
            if level == 1:
                scaling_data[name]['scaling_1'] = scaling_val
            elif level == 5:
                scaling_data[name]['scaling_5'] = scaling_val
            else:
                scaling_data[name]['scaling'] = scaling_val
                
    return scaling_data

def integrate():
    scaling_data = parse_scaling_data()
    icon_map = build_icon_map()
    abilities = []
    
    csv_file = 'TSW Ability Wheel - Abilities.csv'
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found")
        return

    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('Name', '').strip()
            if not name: continue
            
            tree = row.get('Ability Tree', '').strip()
            weapon = row.get('Weapon', '').strip()
            type_raw = row.get('Type', '').strip()
            description = row.get('Description', '').strip()
            
            # Normalize Type
            # Expected types in app.js: Active, Passive, Elite
            atype = ""
            if "Elite" in type_raw:
                atype += "Elite"
            if "Active" in type_raw:
                if atype: atype += " "
                atype += "Active"
            elif "Passive" in type_raw:
                if atype: atype += " "
                atype += "Passive"
            
            # Fallback for builders/consumers if not explicitly named
            if "Builder" in type_raw and "Active" not in atype:
                if atype: atype += " "
                atype += "Active"
            if "Consumer" in type_raw and "Active" not in atype:
                if atype: atype += " "
                atype += "Active"
            
            # Scaling from sheet1
            s = scaling_data.get(name, {'scaling': 0.0, 'scaling_1': 0.0, 'scaling_5': 0.0})
            
            # Cast time and cooldown (ms to s)
            def to_sec(val):
                if not val or val == 'N/A': return 0.0
                try:
                    return float(val) / 1000.0
                except:
                    return 0.0
            
            norm_name = ''.join(c for c in name.lower() if c.isalnum())
            weapon_folder = weapon
            if weapon == "Quantum":
                weapon_folder = "Quantum Brace"
            
            icon_filename = None
            if weapon_folder in icon_map and norm_name in icon_map[weapon_folder]:
                icon_filename = icon_map[weapon_folder][norm_name]
            
            ability = {
                "tree": tree,
                "name": name,
                "scaling": s['scaling'],
                "scaling_1": s['scaling_1'],
                "scaling_5": s['scaling_5'],
                "note": row.get('Note', '').strip(),
                "cast_time": to_sec(row.get('Cast Time')),
                "cooldown": to_sec(row.get('Cooldown')),
                "description": description,
                "type": atype,
                "weapon": weapon,
                "icon": icon_filename
            }
            abilities.append(ability)

    # Output to data.js
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("const tswData = " + json.dumps(abilities, indent=2) + ";\n")
    
    print(f"Successfully integrated {len(abilities)} abilities into data.js")

if __name__ == "__main__":
    integrate()
