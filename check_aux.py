import csv

icons = {
    "Chainsaw": [
        "Degradation", "Diamond Grit", "Hurlyburly", "No Love Lost",
        "Revved Up", "The Carvers Art", "Timber"
    ],
    "Quantum Brace": [
        "Charge Density", "Collider Collapse", "Energy Transfer",
        "Polestar Oblivion", "Probability Rules", "Supersymmetry", "Vector Space",
        "Chargedensity", "Collidercollapse", "Polestaroblivion", "Vectorspace"
    ],
    "Rocket Launcher": [
        "Big Red Button", "Clusterstruck", "Death From Above",
        "Pop Shot", "Rangefinder", "Rocket Science", "Warhead"
    ],
    "Flamethrower": [
        "Assiduous Burn", "Cremate", "Dragons Breath", "Scorched Earth",
        "Searing Magnesium", "Smells Like Victory", "Fire It Up", "Viscous Accelerant"
    ],
    "Whip": [
        "Crack", "Giddy Up", "Jones In The Fast Lane", "Sonic Boom",
        "Whip It Good", "Whiplash", "Whippersnapper"
    ]
}

def clean_for_match(name):
    # Remove all non-alphanumeric chars and lowercase
    return ''.join(c for c in name.lower() if c.isalnum())

found = set()

with open('TSW Ability Wheel - Abilities.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row.get('Name', '').strip()
        weapon = row.get('Weapon', '').strip()
        if weapon in ['Chainsaw', 'Quantum', 'Rocket Launcher', 'Flamethrower', 'Whip']:
            found.add(clean_for_match(name))

missing = []

for weapon, ability_list in icons.items():
    for ability in ability_list:
        if clean_for_match(ability) not in found:
            missing.append(f"{weapon}: {ability}")

# Only keep one variant for Quantum Brace if both are missing
clean_missing = []
for m in missing:
    clean_missing.append(m)

print("Missing from CSV:")
for m in sorted(set(clean_missing)):
    print(m)
