
// Mock data and functions from app.js
const tswData = [
    {
        "tree": "Enforce",
        "name": "Pump Action (Builder)",
        "scaling": 0.0,
        "scaling_1": 0.0,
        "scaling_5": 0.0,
        "cast_time": 1.0,
        "cooldown": 0.0,
        "weapon": "Shotgun",
        "type": "Active"
    },
    {
        "tree": "Enforce",
        "name": "Out for a Kill (Consumer)",
        "scaling": 0.0,
        "scaling_1": 1.19608,
        "scaling_5": 2.36832,
        "cast_time": 1.0,
        "cooldown": 4.0,
        "weapon": "Shotgun",
        "type": "Active"
    }
];

function getAbilityStats(ability, cp, targetResources) {
    let scalingToUse = ability.scaling || 0;
    if (ability.scaling_5 > 0 && ability.scaling_1 > 0) {
        scalingToUse = ability.scaling_1 + ((targetResources - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
    } else if (ability.scaling_5 > 0 && targetResources === 5) {
        scalingToUse = ability.scaling_5;
    }

    const avgDamage = scalingToUse * cp;
    const castTime = Math.max(ability.cast_time || 1.0, 1.0);
    const cooldown = ability.cooldown || 0;

    return {
        name: ability.name,
        avgDamage,
        castTime,
        cooldown,
        tree: ability.tree, // This is the bug: using tree instead of weapon
        weapon: ability.weapon,
        isConsumer: ability.scaling_1 > 0 || ability.scaling_5 > 0,
        type: ability.type || "Unknown"
    };
}

function simulate(actives, primWeaponName) {
    let time = 0;
    let targetSeconds = 30; // 30 seconds
    let primResources = 0;
    let totalDamage = 0;
    let targetResources = 5;

    const statsBreakdown = {};
    actives.forEach(a => {
        statsBreakdown[a.name] = { damage: 0, casts: 0 };
    });

    const activeCooldowns = actives.map(() => 0);

    while (time < targetSeconds) {
        let castSomething = false;

        for (let i = 0; i < actives.length; i++) {
            const action = actives[i];
            if (activeCooldowns[i] > 0) continue;

            let canCast = true;
            // The BUG: action.tree is compared to primWeaponName (e.g., "Enforce" vs "Shotgun")
            const isPrim = action.tree === primWeaponName;

            if (action.isConsumer) {
                if (isPrim && primResources < targetResources) canCast = false;
            }

            if (canCast) {
                totalDamage += action.avgDamage;
                statsBreakdown[action.name].casts++;

                const timeTaken = action.castTime;
                time += timeTaken;
                activeCooldowns[i] = action.cooldown;

                if (action.isConsumer) {
                    if (isPrim) primResources -= targetResources;
                } else {
                    primResources = Math.min(5, primResources + 1);
                }

                for (let j = 0; j < activeCooldowns.length; j++) {
                    activeCooldowns[j] -= timeTaken;
                }
                castSomething = true;
                break;
            }
        }

        if (!castSomething) {
            time += 1.0;
            for (let j = 0; j < activeCooldowns.length; j++) {
                activeCooldowns[j] -= 1.0;
            }
        }
    }

    console.log("Results:");
    for (let name in statsBreakdown) {
        console.log(`${name}: ${statsBreakdown[name].casts} casts`);
    }
}

const cp = 1000;
const targetResources = 5;
const weapon = "Shotgun";

console.log("--- Test 1: Builder in Slot 0, Consumer in Slot 1 ---");
const actives1 = [
    getAbilityStats(tswData[0], cp, targetResources),
    getAbilityStats(tswData[1], cp, targetResources)
];
simulate(actives1, weapon);

console.log("\n--- Test 2: Consumer in Slot 0, Builder in Slot 1 ---");
const actives2 = [
    getAbilityStats(tswData[1], cp, targetResources),
    getAbilityStats(tswData[0], cp, targetResources)
];
simulate(actives2, weapon);
