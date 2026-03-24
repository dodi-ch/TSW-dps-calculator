import csv

# Fix TSW Ability Wheel - Abilities.csv
with open('TSW Ability Wheel - Abilities.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('TSW Ability Wheel - Abilities.csv', 'w', encoding='utf-8') as f:
    for line in lines:
        if ',Quantum Brace,' in line:
            line = line.replace(',Quantum Brace,', ',Quantum,')
        f.write(line)

# Fix sheet1.csv
with open('sheet1.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('sheet1.csv', 'w', encoding='utf-8') as f:
    for line in lines:
        if line.startswith('Quantum Brace,'):
            line = line.replace('Quantum Brace,', 'Quantum,')
        f.write(line)

print("Fixed Quantum naming.")
