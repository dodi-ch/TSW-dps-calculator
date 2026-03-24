import csv

missing_list = [
    ("Chainsaw", "Degradation", "Passive"),
    ("Chainsaw", "Diamond Grit", "Active"),
    ("Chainsaw", "Hurlyburly", "Active"),
    ("Chainsaw", "No Love Lost", "Passive"),
    ("Chainsaw", "Revved Up", "Passive"),
    ("Chainsaw", "The Carvers Art", "Active"),
    ("Chainsaw", "Timber", "Active"),
    ("Flamethrower", "Assiduous Burn", "Passive"),
    ("Flamethrower", "Cremate", "Active"),
    ("Flamethrower", "Dragons Breath", "Active"),
    ("Flamethrower", "Fire It Up", "Active"),
    ("Flamethrower", "Scorched Earth", "Active"),
    ("Flamethrower", "Searing Magnesium", "Passive"),
    ("Flamethrower", "Smells Like Victory", "Active"),
    ("Flamethrower", "Viscous Accelerant", "Passive"),
    ("Quantum Brace", "Charge Density", "Active"),
    ("Quantum Brace", "Collider Collapse", "Active"),
    ("Quantum Brace", "Energy Transfer", "Passive"),
    ("Quantum Brace", "Polestar Oblivion", "Active"),
    ("Quantum Brace", "Probability Rules", "Passive"),
    ("Quantum Brace", "Supersymmetry", "Passive"),
    ("Quantum Brace", "Vector Space", "Active"),
    ("Rocket Launcher", "Big Red Button", "Active"),
    ("Rocket Launcher", "Clusterstruck", "Active"),
    ("Rocket Launcher", "Death From Above", "Active"),
    ("Rocket Launcher", "Pop Shot", "Active"),
    ("Rocket Launcher", "Rangefinder", "Passive"),
    ("Rocket Launcher", "Rocket Science", "Passive"),
    ("Rocket Launcher", "Warhead", "Passive")
]

csv_path = 'TSW Ability Wheel - Abilities.csv'
sheet_path = 'sheet1.csv'

# Append to main CSV
with open(csv_path, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for weapon, ability, atype in missing_list:
        writer.writerow([
            ability, weapon, "Auxiliary", weapon, "50", "Damage", atype,
            "Single Hit", "Single Target", "Normal", "None", "None", "No",
            "1000", "15000", "N/A", "", "", f"{ability} - A {weapon} attack placeholder."
        ])

# Append to sheet1.csv
with open(sheet_path, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for weapon, ability, atype in missing_list:
        writer.writerow([
            weapon, ability, "0", "0", "0", "", "", "", "", "", "", ""
        ])

print("Missing auxiliary abilities appended to CSVs.")
