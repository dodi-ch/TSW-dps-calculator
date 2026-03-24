import csv
import os

whip_abilities = [
    ("Crack", "Active"),
    ("Giddy Up", "Active"),
    ("Jones In The Fast Lane", "Passive"),
    ("Sonic Boom", "Passive"),
    ("Whip It Good", "Active"),
    ("Whiplash", "Passive"),
    ("Whippersnapper", "Active")
]

csv_path = 'TSW Ability Wheel - Abilities.csv'
sheet_path = 'sheet1.csv'

# Append to main CSV
with open(csv_path, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for ability, atype in whip_abilities:
        writer.writerow([
            ability, "Whip", "Auxiliary", "Whip", "50", "Damage", atype,
            "Single Hit", "Single Target", "Normal", "None", "None", "No",
            "1000", "15000", "N/A", "", "", f"{ability} - A Whip attack placeholder."
        ])

# Append to sheet1.csv
with open(sheet_path, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for ability, atype in whip_abilities:
        writer.writerow([
            "Whip", ability, "0", "0", "0", "", "", "", "", "", "", ""
        ])

print("Whip abilities appended to CSVs.")
