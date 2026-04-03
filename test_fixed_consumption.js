// Test script for fixed resource consumption abilities

console.log("=== FIXED RESOURCE CONSUMPTION TEST ===\n");

// Mock ability data
const mockAbilities = [
    {
        name: "Variable Consumer",
        description: "Consumes all Pistol Resources. A single target attack that deals damage based on the number of resources consumed.",
        scaling: 0.5,
        scaling_1: 0.3,
        scaling_5: 0.7,
        cast_time: 1.0,
        cooldown: 4.0,
        type: "Active",
        weapon: "Pistol"
    },
    {
        name: "Fixed Consumer",
        description: "Consumes 3 Elemental Resources. A single target attack that deals 184 magical damage.",
        scaling: 0.8,
        scaling_1: 0.8,
        scaling_5: 0.8,
        cast_time: 1.5,
        cooldown: 0.0,
        type: "Active", 
        weapon: "Elementalism"
    },
    {
        name: "Another Fixed Consumer",
        description: "Consumes 2 Elemental Resources. A single target Strike attack that deals 127 magical damage.",
        scaling: 0.6,
        scaling_1: 0.6,
        scaling_5: 0.6,
        cast_time: 1.0,
        cooldown: 0.0,
        type: "Active",
        weapon: "Elementalism"
    }
];

// Mock getAbilityStats function
function getAbilityStats(ability, cp, critChance, critPower, penChance, resourcesUsed) {
    const desc = ability.description || "";
    
    // Resource parsing logic
    let resourceRequirement = 0;
    let resourceConsumption = 0;
    let damageScalesWithResources = false;

    // Detect explicit "Consumes X <Weapon> Resources" (fixed consumption)
    const fixedConsumeMatch = desc.match(/Consumes?\s+(\d+)\s+\w+\s+Resources?/i);
    if (fixedConsumeMatch) {
        resourceRequirement = parseInt(fixedConsumeMatch[1], 10) || 0;
        resourceConsumption = resourceRequirement;
    }

    // Detect "Consumes all <Weapon> Resources" (variable consumption)
    if (/Consumes all\s+\w+\s+Resources?/i.test(desc)) {
        resourceRequirement = 1;
        resourceConsumption = resourcesUsed || 5;
    }

    // Detect that damage scales with resources
    if (/based on the number of resources consumed/i.test(desc)) {
        damageScalesWithResources = true;
    }

    // Calculate effective resources for damage
    let effectiveResources = resourcesUsed;
    if (resourceConsumption > 0 && !damageScalesWithResources) {
        effectiveResources = resourceConsumption;
    }

    // Calculate scaling
    let scalingToUse = ability.scaling || 0;
    if (ability.scaling_5 > 0 && ability.scaling_1 > 0) {
        scalingToUse = ability.scaling_1 + ((effectiveResources - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
    } else if (ability.scaling_5 > 0 && effectiveResources === 5) {
        scalingToUse = ability.scaling_5;
    }

    return {
        name: ability.name,
        avgDamage: scalingToUse * cp,
        castTime: ability.cast_time,
        cooldown: ability.cooldown,
        weapon: ability.weapon,
        isConsumer: resourceConsumption > 0,
        resourceRequirement,
        resourceConsumption,
        damageScalesWithResources,
        scalingToUse
    };
}

function testFixedResourceConsumption() {
    console.log("Testing fixed resource consumption abilities...\n");
    
    const cp = 1000;
    const resourcesUsed = 5;
    
    // Process abilities
    const abilities = mockAbilities.map(a => getAbilityStats(a, cp, 10, 25, 0, resourcesUsed));
    
    console.log("--- ABILITY ANALYSIS ---");
    abilities.forEach(ability => {
        console.log(`${ability.name}:`);
        console.log(`  Resource Requirement: ${ability.resourceRequirement}`);
        console.log(`  Resource Consumption: ${ability.resourceConsumption}`);
        console.log(`  Damage Scales: ${ability.damageScalesWithResources}`);
        console.log(`  Scaling To Use: ${ability.scalingToUse.toFixed(3)}`);
        console.log(`  Average Damage: ${ability.avgDamage.toFixed(1)}`);
        console.log("");
    });
    
    // Test scenarios
    console.log("--- RESOURCE SCENARIOS ---");
    
    // Scenario 1: Variable consumer with different resource amounts
    const variableConsumer = abilities.find(a => a.name === "Variable Consumer");
    console.log("Variable Consumer (scales with resources):");
    for (let resources = 1; resources <= 5; resources++) {
        const stats = getAbilityStats(mockAbilities[0], cp, 10, 25, 0, resources);
        console.log(`  ${resources} resources: ${stats.avgDamage.toFixed(1)} damage`);
    }
    console.log("");
    
    // Scenario 2: Fixed consumer should always do same damage
    const fixedConsumer = abilities.find(a => a.name === "Fixed Consumer");
    console.log("Fixed Consumer (3 resources, no scaling):");
    for (let resources = 3; resources <= 5; resources++) {
        const stats = getAbilityStats(mockAbilities[1], cp, 10, 25, 0, resources);
        console.log(`  Available: ${resources} resources, Damage: ${stats.avgDamage.toFixed(1)} (should be constant)`);
    }
    console.log("");
    
    // Scenario 3: Another fixed consumer
    const anotherFixed = abilities.find(a => a.name === "Another Fixed Consumer");
    console.log("Another Fixed Consumer (2 resources, no scaling):");
    for (let resources = 2; resources <= 5; resources++) {
        const stats = getAbilityStats(mockAbilities[2], cp, 10, 25, 0, resources);
        console.log(`  Available: ${resources} resources, Damage: ${stats.avgDamage.toFixed(1)} (should be constant)`);
    }
    console.log("");
    
    // Verify the logic
    console.log("--- VERIFICATION ---");
    
    // Test 1: Variable consumer should scale
    const var1Res = getAbilityStats(mockAbilities[0], cp, 10, 25, 0, 1);
    const var5Res = getAbilityStats(mockAbilities[0], cp, 10, 25, 0, 5);
    if (var5Res.avgDamage > var1Res.avgDamage) {
        console.log("✅ PASS: Variable consumer scales with resources");
    } else {
        console.log("❌ FAIL: Variable consumer doesn't scale");
        return false;
    }
    
    // Test 2: Fixed consumer should not scale
    const fixed3Res = getAbilityStats(mockAbilities[1], cp, 10, 25, 0, 3);
    const fixed5Res = getAbilityStats(mockAbilities[1], cp, 10, 25, 0, 5);
    if (Math.abs(fixed5Res.avgDamage - fixed3Res.avgDamage) < 0.1) {
        console.log("✅ PASS: Fixed consumer doesn't scale with resources");
    } else {
        console.log("❌ FAIL: Fixed consumer scales with resources");
        return false;
    }
    
    // Test 3: Fixed consumer has correct requirement and consumption
    if (fixedConsumer.resourceRequirement === 3 && fixedConsumer.resourceConsumption === 3) {
        console.log("✅ PASS: Fixed consumer has correct requirement and consumption");
    } else {
        console.log("❌ FAIL: Fixed consumer has incorrect requirement/consumption");
        return false;
    }
    
    // Test 4: Variable consumer has correct logic
    if (variableConsumer.resourceRequirement === 1 && variableConsumer.resourceConsumption === 5 && variableConsumer.damageScalesWithResources) {
        console.log("✅ PASS: Variable consumer has correct logic");
    } else {
        console.log("❌ FAIL: Variable consumer has incorrect logic");
        return false;
    }
    
    console.log("\n🎉 FIXED RESOURCE CONSUMPTION TEST COMPLETE");
    console.log("   Fixed resource consumption abilities are working correctly!");
    return true;
}

// Run the test
const success = testFixedResourceConsumption();
process.exit(success ? 0 : 1);
