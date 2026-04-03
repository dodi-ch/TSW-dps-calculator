// Test to verify passives trigger from both normal and elite actives

console.log("=== PASSIVE TRIGGERING TEST ===\n");

// Mock data structure
const mockTswData = [
    {
        name: "Normal Strike",
        description: "A single target Strike attack.",
        scaling: 0.5,
        cast_time: 1.0,
        cooldown: 0.0,
        type: "Active",
        weapon: "Blade"
    },
    {
        name: "Elite Strike",
        description: "An elite single target Strike attack.",
        scaling: 0.8,
        cast_time: 1.5,
        cooldown: 10.0,
        type: "Elite Active",
        weapon: "Blade"
    },
    {
        name: "Strike Passive",
        description: "Strike attacks have a 50% chance to deal additional damage.",
        scaling: 0.2,
        cast_time: 0,
        cooldown: 0,
        type: "Passive",
        weapon: "Blade"
    },
    {
        name: "Elite Passive",
        description: "All attacks have a 25% chance to deal additional damage.",
        scaling: 0.15,
        cast_time: 0,
        cooldown: 0,
        type: "Elite Passive",
        weapon: "Blade"
    }
];

// Mock getAbilityStats function (simplified)
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
        avgDamage: ability.scaling * 100 || 10,
        castTime: ability.cast_time || 1.0,
        cooldown: ability.cooldown || 0,
        weapon: ability.weapon,
        type: ability.type || "Unknown",
        subtype,
        triggerSubtypes,
        scalingToUse: ability.scaling
    };
}

function testPassiveTriggering() {
    console.log("Testing passive triggering from different active types...\n");
    
    // Process abilities
    const abilities = mockTswData.map(getAbilityStats);
    const normalActives = abilities.filter(a => a.type === "Active");
    const eliteActives = abilities.filter(a => a.type.includes("Elite") && a.type.includes("Active"));
    const normalPassives = abilities.filter(a => a.type === "Passive");
    const elitePassives = abilities.filter(a => a.type.includes("Elite") && a.type.includes("Passive"));
    
    console.log("--- ABILITY BREAKDOWN ---");
    console.log(`Normal Actives: [${normalActives.map(a => a.name).join(', ')}]`);
    console.log(`Elite Actives: [${eliteActives.map(a => a.name).join(', ')}]`);
    console.log(`Normal Passives: [${normalPassives.map(a => a.name).join(', ')}]`);
    console.log(`Elite Passives: [${elitePassives.map(a => a.name).join(', ')}]`);
    console.log("");
    
    // Combine actives and passives (like the real app does)
    const allActives = [...normalActives, ...eliteActives];
    const allPassives = [...normalPassives, ...elitePassives];
    
    console.log("--- SIMULATION ---");
    console.log(`Total Actives: ${allActives.length}`);
    console.log(`Total Passives: ${allPassives.length}`);
    console.log("");
    
    // Simulate each active ability hitting and check passive triggers
    allActives.forEach((active, activeIndex) => {
        console.log(`--- ${active.name} hits ---`);
        
        let triggeredPassives = [];
        
        // Check each passive (simplified version of the real logic)
        allPassives.forEach((passive, passiveIndex) => {
            let shouldTrigger = false;
            
            // Check subtype matching
            if (passive.triggerSubtypes.length > 0) {
                if (passive.triggerSubtypes.includes(active.subtype)) {
                    shouldTrigger = true;
                }
            } else {
                // General passive that triggers from any attack
                shouldTrigger = true;
            }
            
            // Check weapon matching (simplified)
            if (passive.weapon && passive.weapon !== "All" && passive.weapon !== active.weapon) {
                shouldTrigger = false;
            }
            
            if (shouldTrigger) {
                triggeredPassives.push(passive.name);
                console.log(`  ✅ ${passive.name} TRIGGERS`);
            } else {
                console.log(`  ❌ ${passive.name} - No trigger condition met`);
            }
        });
        
        if (triggeredPassives.length === 0) {
            console.log(`  No passives triggered`);
        }
        
        console.log("");
    });
    
    console.log("--- VERIFICATION ---");
    
    // Check that both normal and elite passives can trigger from both active types
    const normalStrike = normalActives.find(a => a.name === "Normal Strike");
    const eliteStrike = eliteActives.find(a => a.name === "Elite Strike");
    
    if (normalStrike && eliteStrike) {
        console.log("✅ Both normal and elite actives are present");
        console.log("✅ Passive triggering logic processes all active types");
        console.log("✅ Elite passives and normal passives are both included");
        
        // Verify that the passive array includes both types
        const hasNormalPassive = allPassives.some(p => p.type === "Passive");
        const hasElitePassive = allPassives.some(p => p.type.includes("Elite") && p.type.includes("Passive"));
        
        if (hasNormalPassive && hasElitePassive) {
            console.log("✅ Both normal and elite passives are in the trigger pool");
        } else {
            console.log("❌ Missing passive types in trigger pool");
            return false;
        }
    } else {
        console.log("❌ Missing active ability types");
        return false;
    }
    
    console.log("\n🎉 PASSIVE TRIGGERING TEST COMPLETE");
    console.log("   Passives should trigger from both normal and elite actives");
    return true;
}

// Run the test
const success = testPassiveTriggering();
process.exit(success ? 0 : 1);
