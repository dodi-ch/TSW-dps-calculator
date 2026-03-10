// Minimal reproduction script for skill subtype matching verification
const tswData = [
    {
        "name": "Strike Builder",
        "description": "A single target Strike attack.",
        "scaling": 0.5,
        "cast_time": 1.0,
        "cooldown": 0.0,
        "type": "Active",
        "weapon": "Shotgun"
    },
    {
        "name": "Blast Builder",
        "description": "A column Blast attack.",
        "scaling": 0.5,
        "cast_time": 1.0,
        "cooldown": 0.0,
        "type": "Active",
        "weapon": "Shotgun"
    },
    {
        "name": "Strike Passive",
        "description": "Increases the Penetration Chance of Strike attacks by 7.5%. Deals 100 damage.",
        "scaling": 0,
        "cast_time": 0,
        "cooldown": 0,
        "type": "Passive",
        "weapon": "Shotgun",
        "avgDamage": 100 // Manually set for simulation testing
    },
    {
        "name": "Blast Passive",
        "description": "Blast attacks have a 50% chance to purge. Deals 200 damage.",
        "scaling": 0,
        "cast_time": 0,
        "cooldown": 0,
        "type": "Passive",
        "weapon": "Shotgun",
        "avgDamage": 200 // Manually set for simulation testing
    }
];

// Mock getAbilityStats if needed or just use the logic
function getAbilityStats(ability) {
    let subtype = "";
    const desc = ability.description || "";
    const subtypes = ["Strike", "Blast", "Focus", "Frenzy", "Burst", "Chain"];
    for (const s of subtypes) {
        if (desc.includes(s + " attack") || desc.includes(s + " ability")) {
            subtype = s;
            break;
        }
    }

    let triggerSubtypes = [];
    if (ability.type && ability.type.includes("Passive")) {
        for (const s of subtypes) {
            if (desc.includes(s + " attacks") || desc.includes(s + " abilities")) {
                triggerSubtypes.push(s);
            }
        }
    }

    return {
        name: ability.name,
        subtype,
        triggerSubtypes,
        avgDamage: ability.avgDamage || 10,
        castTime: ability.cast_time || 1.0,
        cooldown: ability.cooldown || 0,
        type: ability.type
    };
}

const strikeBuilder = getAbilityStats(tswData[0]);
const blastBuilder = getAbilityStats(tswData[1]);
const strikePassive = getAbilityStats(tswData[2]);
const blastPassive = getAbilityStats(tswData[3]);

console.log("Strike Builder Subtype:", strikeBuilder.subtype);
console.log("Blast Builder Subtype:", blastBuilder.subtype);
console.log("Strike Passive Triggers:", strikePassive.triggerSubtypes);
console.log("Blast Passive Triggers:", blastPassive.triggerSubtypes);

// Simple simulation test
function simulate(action, passives) {
    let damage = action.avgDamage;
    console.log(`Casting ${action.name} (${action.subtype})`);
    for (const p of passives) {
        if (p.triggerSubtypes.length > 0) {
            if (p.triggerSubtypes.includes(action.subtype)) {
                console.log(`  Proc: ${p.name}`);
                damage += p.avgDamage;
            } else {
                console.log(`  Skip: ${p.name} (Subtype mismatch)`);
            }
        } else {
            console.log(`  Proc: ${p.name} (General)`);
            damage += p.avgDamage;
        }
    }
    return damage;
}

const passives = [strikePassive, blastPassive];

const strikeDmg = simulate(strikeBuilder, passives);
console.log(`Total Strike Damage: ${strikeDmg} (Expected 110: 10 + 100)`);

const blastDmg = simulate(blastBuilder, passives);
console.log(`Total Blast Damage: ${blastDmg} (Expected 210: 10 + 200)`);

if (strikeDmg === 110 && blastDmg === 210) {
    console.log("VERIFICATION SUCCESSFUL");
} else {
    console.log("VERIFICATION FAILED");
    process.exit(1);
}
