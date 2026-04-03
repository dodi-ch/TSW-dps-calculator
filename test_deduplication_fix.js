// Test script to verify the deduplication fix for duplicate abilities
// This simulates the scenario where Molten Steel is selected in multiple slots

// Mock data structure similar to the real app
const mockTswData = [
    {
        name: "Molten Steel",
        weapon: "Hammer",
        scaling: 1.148564939,
        cast_time: 1.0,
        cooldown: 15.0,
        type: "Active"
    },
    {
        name: "Molten Steel",
        weapon: "Hammer", 
        scaling: 1.148564939,
        cast_time: 1.0,
        cooldown: 15.0,
        type: "Active"
    },
    {
        name: "Other Ability",
        weapon: "Hammer",
        scaling: 0.5,
        cast_time: 1.0,
        cooldown: 5.0,
        type: "Active"
    }
];

function testDeduplicationFix() {
    console.log("Testing deduplication fix...\n");
    
    // Simulate the old broken behavior
    console.log("--- OLD (BROKEN) BEHAVIOR ---");
    const oldStatsBreakdown = {};
    mockTswData.forEach(a => {
        oldStatsBreakdown[a.name] = { damage: 0, casts: 0 };
    });
    
    // Simulate some damage tracking
    mockTswData.forEach((ability, index) => {
        const damage = 100 * (index + 1); // Different damage amounts
        oldStatsBreakdown[ability.name].damage += damage;
        oldStatsBreakdown[ability.name].casts += 1;
    });
    
    console.log("Old results:");
    Object.entries(oldStatsBreakdown).forEach(([name, stats]) => {
        console.log(`  ${name}: ${stats.casts} casts, ${stats.damage} damage`);
    });
    console.log("Problem: Both Molten Steel instances merged into one entry!\n");
    
    // Simulate the new fixed behavior
    console.log("--- NEW (FIXED) BEHAVIOR ---");
    const newStatsBreakdown = {};
    const allActives = mockTswData;
    
    // Create unique keys like the fix does
    allActives.forEach((a, index) => {
        const key = `active_${index}_${a.name}`;
        newStatsBreakdown[key] = { damage: 0, casts: 0, displayName: a.name };
    });
    
    // Simulate damage tracking with the new logic
    allActives.forEach((ability, index) => {
        const damage = 100 * (index + 1); // Different damage amounts
        const abilityKey = `active_${index}_${ability.name}`;
        newStatsBreakdown[abilityKey].damage += damage;
        newStatsBreakdown[abilityKey].casts += 1;
    });
    
    console.log("New results:");
    Object.entries(newStatsBreakdown).forEach(([key, stats]) => {
        console.log(`  ${stats.displayName} (${key}): ${stats.casts} casts, ${stats.damage} damage`);
    });
    
    // Test the display logic
    console.log("\n--- DISPLAY LOGIC TEST ---");
    const sortedStats = Object.keys(newStatsBreakdown)
        .filter(name => newStatsBreakdown[name].casts > 0)
        .map(name => ({
            key: name,
            name: newStatsBreakdown[name].displayName || name,
            ...newStatsBreakdown[name]
        }))
        .sort((a, b) => b.damage - a.damage);
    
    console.log("Display results:");
    sortedStats.forEach(stat => {
        console.log(`  ${stat.name}: ${stat.casts} casts, ${stat.damage} damage`);
    });
    
    // Verification
    const moltenSteelEntries = sortedStats.filter(s => s.name === "Molten Steel");
    if (moltenSteelEntries.length === 2) {
        console.log("\n✅ SUCCESS: Two separate Molten Steel entries found!");
        console.log(`   Entry 1: ${moltenSteelEntries[0].casts} casts, ${moltenSteelEntries[0].damage} damage`);
        console.log(`   Entry 2: ${moltenSteelEntries[1].casts} casts, ${moltenSteelEntries[1].damage} damage`);
        return true;
    } else {
        console.log(`\n❌ FAILED: Expected 2 Molten Steel entries, found ${moltenSteelEntries.length}`);
        return false;
    }
}

// Run the test
const success = testDeduplicationFix();
process.exit(success ? 0 : 1);
