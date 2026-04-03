import json
import re
import math

with open('excel_output.json', 'r', encoding='utf-8') as f:
    excel_data = json.load(f)

# Combine all scalings from all sheets
excel_scalings = []
for sheet, rows in excel_data.items():
    excel_scalings.extend(rows)

# Read data.js
with open('data.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

# Extract json part
json_str = data_content[data_content.find('['):data_content.rfind(']')+1]
tsw_data = json.loads(json_str)

# Build a map of abilities by name from data.js
tsw_map = {item['name']: item for item in tsw_data}

updates = []
unmatched = []

for row in excel_scalings:
    name = row.get("Name")
    scaling = row.get("Scaling")
    if not isinstance(name, str):
        continue
    if scaling is None or (isinstance(scaling, float) and math.isnan(scaling)):
        continue
    
    # Clean up name to match
    original_excel_name = name
    
    is_at_1 = "@1" in name
    is_at_5 = "@5" in name
    
    base_name = name.split(" @")[0].strip()
    
    # Special cases: Big 45, Start & Finish 1st, etc.
    # Let's just find the exact base name in tsw_map
    if base_name in tsw_map:
        updates.append((base_name, name, scaling, is_at_1, is_at_5))
    else:
        unmatched.append((name, scaling))

for update in updates:
    print(f"Matched: {update[0]} <- {update[1]} : {update[2]}")

print("\n--- UNMATCHED ---")
for un in unmatched[:30]:
    print(f"Unmatched: {un}")

