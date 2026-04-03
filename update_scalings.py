import json
import re
import math

with open('excel_output.json', 'r', encoding='utf-8') as f:
    excel_data = json.load(f)

excel_scalings = []
for sheet, rows in excel_data.items():
    excel_scalings.extend(rows)

scaling_data = {}

for row in excel_scalings:
    raw_name = row.get("Name")
    if not isinstance(raw_name, str):
        continue
    scaling_val = row.get("Scaling")
    if scaling_val is None or (isinstance(scaling_val, float) and math.isnan(scaling_val)):
        continue
    
    level = 0
    if ' @1' in raw_name: level = 1
    elif ' @5' in raw_name: level = 5
    
    name = re.sub(r'\[.*?\]', '', raw_name)
    name = re.sub(r'\s+@\d+', '', name)
    name = re.sub(r'\s+\d+(st|nd|rd|th)', '', name)
    name = re.sub(r'\s+Proc$', '', name, flags=re.IGNORECASE)
    name = name.strip()
    
    if not name: continue
        
    try:
        scaling_val = float(scaling_val)
    except ValueError:
        continue
        
    if name not in scaling_data:
        scaling_data[name] = {'scaling': 0.0, 'scaling_1': 0.0, 'scaling_5': 0.0}
        
    if level == 1:
        scaling_data[name]['scaling_1'] = scaling_val
    elif level == 5:
        scaling_data[name]['scaling_5'] = scaling_val
    else:
        scaling_data[name]['scaling'] = scaling_val

with open('data.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

json_str = data_content[data_content.find('['):data_content.rfind(']')+1]

try:
    tsw_abilities = json.loads(json_str)
except Exception as e:
    print("Error parsing data.js JSON content")
    exit(1)

updated_count = 0
for ability in tsw_abilities:
    name = ability.get("name", "")
    if name in scaling_data:
        s = scaling_data[name]
        ability["scaling"] = s["scaling"]
        ability["scaling_1"] = s["scaling_1"]
        ability["scaling_5"] = s["scaling_5"]
        updated_count += 1

new_json_str = json.dumps(tsw_abilities, indent=2)
new_data_content = data_content[:data_content.find('[')] + new_json_str + data_content[data_content.rfind(']')+1:]

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(new_data_content)

print(f"Successfully updated {updated_count} abilities in data.js")
