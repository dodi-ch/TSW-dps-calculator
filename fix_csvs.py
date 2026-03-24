import os

with open('sheet1.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('sheet1.csv', 'w', encoding='utf-8') as f:
    for line in lines:
        if 'AveragedWhip,Crack' in line:
            f.write(',Anima Deviation,0.74089,741,,-,-,,,,X,Averaged\n')
            break
        elif line.startswith('Whip,'):
            break
        f.write(line)

with open('TSW Ability Wheel - Abilities.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('TSW Ability Wheel - Abilities.csv', 'w', encoding='utf-8') as f:
    for line in lines:
        if line.startswith('Crack,Whip,Auxiliary,Whip,50,Damage,Active'):
            break
        f.write(line)

print('Fixed CSVs.')
