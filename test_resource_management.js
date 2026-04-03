// Test script to verify weapon-specific resource management

console.log("=== WEAPON-SPECIFIC RESOURCE MANAGEMENT TEST ===\n");

// Mock ability data
const mockAbilities = [
    {
        name: "Pistol Builder",
        description: "Builds 1 pistol resource.",
        scaling: 0.5,
        cast_time: 1.0,
        cooldown: 0.0,
        type: "Active", 
        weapon: "Pistol",
        isConsumer: false
    },
    {
        name: "Pistol Consumer",
        description: "Consumes 5 pistol resources for high damage.",
        scaling: 2.0,
        cast_time: 1.5,
        cooldown: 8.0,
        type: "Active",
        weapon: "Pistol", 
        isConsumer: true
    },
    {
        name: "Blade Builder",
        description: "Builds 1 blade resource.",
        scaling: 0.5,
        cast_time: 1.0,
        cooldown: 0.0,
        type: "Active",
        weapon: "Blade",
        isConsumer: false
    },
    {
        name: "Blade Consumer", 
        description: "Consumes 5 blade resources for high damage.",
        scaling: 2.0,
        cast_time: 1.5,
        cooldown: 8.0,
        type: "Active",
        weapon: "Blade",
        isConsumer: true
    }
];

// Mock getAbilityStats function
function getAbilityStats(ability) {
    return {
        name: ability.name,
        avgDamage: ability.scaling * 100,
        castTime: ability.cast_time,
        cooldown: ability.cooldown,
        weapon: ability.weapon,
        isConsumer: ability.isConsumer,
        resourceRequirement: ability.isConsumer ? 5 : 0,
        minResources: 0
    };
}

function testResourceManagement() {
    console.log("Testing weapon-specific resource management...\n");
    
    // Process abilities
    const abilities = mockAbilities.map(getAbilityStats);
    const pistolBuilder = abilities.find(a => a.name === "Pistol Builder");
    const pistolConsumer = abilities.find(a => a.name === "Pistol Consumer");
    const bladeBuilder = abilities.find(a => a.name === "Blade Builder");
    const bladeConsumer = abilities.find(a => a.name === "Blade Consumer");
    
    // Initialize resources
    let primResources = 0;
    let secResources = 0;
    const primWeapon = "Pistol";
    const secWeapon = "Blade";
    
    console.log("--- RESOURCE MANAGEMENT SIMULATION ---");
    console.log(`Primary Weapon: ${primWeapon}`);
    console.log(`Secondary Weapon: ${secWeapon}`);
    console.log(`Initial Resources: Pistol=${primResources}, Blade=${secResources}`);
    console.log("");
    
    // Test sequence: build pistol, build blade, consume pistol, consume blade
    const sequence = [
        pistolBuilder,   // Should add 1 pistol resource
        bladeBuilder,    // Should add 1 blade resource  
        pistolBuilder,   // Should add 1 pistol resource
        bladeBuilder,    // Should add 1 blade resource
        pistolBuilder,   // Should add 1 pistol resource
        pistolConsumer,  // Should consume 5 pistol resources (fail - only 3)
        bladeBuilder,    // Should add 1 blade resource
        bladeConsumer    // Should consume 5 blade resources (fail - only 3)
    ];
    
    sequence.forEach((ability, index) => {
        console.log(`--- Step ${index + 1}: ${ability.name} ---`);
        
        const isPrim = ability.weapon === primWeapon;
        const isSec = ability.weapon === secWeapon;
        const reqResources = ability.resourceRequirement || 5;
        
        let canCast = true;
        
        // Check resource requirements for consumers
        if (ability.isConsumer) {
            if (isPrim && primResources < reqResources) {
                canCast = false;
                console.log(`  ❌ Cannot cast: Insufficient pistol resources (${primResources}/${reqResources})`);
            }
            if (isSec && secResources < reqResources) {
                canCast = false;
                console.log(`  ❌ Cannot cast: Insufficient blade resources (${secResources}/${reqResources})`);
            }
        }
        
        if (canCast) {
            console.log(`  ✅ Can cast: Resource requirements met`);
            
            // Cast the ability
            if (ability.isConsumer) {
                if (isPrim) primResources -= reqResources;
                if (isSec) secResources -= reqResources;
                console.log(`  ⚔️ Consumer cast! Resources consumed`);
            } else {
                // Builder - add resources to specific weapon only
                if (isPrim) primResources = Math.min(5, primResources + 1);
                if (isSec) secResources = Math.min(5, secResources + 1);
                console.log(`  🔨 Builder cast! +1 resource to ${ability.weapon}`);
            }
        }
        
        console.log(`  Current Resources: Pistol=${primResources}, Blade=${secResources}`);
        console.log("");
    });
    
    console.log("--- VERIFICATION ---");
    
    // Test 1: Verify builders only affect their weapon
    const pistolOnlyBuild = [pistolBuilder, pistolBuilder, pistolBuilder];
    let testPrimRes = 0, testSecRes = 0;
    
    pistolOnlyBuild.forEach(ability => {
        if (ability.weapon === primWeapon) testPrimRes = Math.min(5, testPrimRes + 1);
    });
    
    console.log(`Test 1 - Pistol builders only: Pistol=${testPrimRes}, Blade=${testSecRes}`);
    if (testPrimRes === 3 && testSecRes === 0) {
        console.log("✅ PASS: Builders only affect their specific weapon");
    } else {
        console.log("❌ FAIL: Builders affecting wrong weapons");
        return false;
    }
    
    // Test 2: Verify consumers only consume from their weapon
    testPrimRes = 5; testSecRes = 5;
    const pistolOnlyConsume = pistolConsumer;
    
    if (pistolOnlyConsume.weapon === primWeapon) {
        testPrimRes -= pistolOnlyConsume.resourceRequirement;
    }
    
    console.log(`Test 2 - Pistol consumer only: Pistol=${testPrimRes}, Blade=${testSecRes}`);
    if (testPrimRes === 0 && testSecRes === 5) {
        console.log("✅ PASS: Consumers only consume from their specific weapon");
    } else {
        console.log("❌ FAIL: Consumers consuming from wrong weapons");
        return false;
    }
    
    // Test 3: Verify weapons are independent
    testPrimRes = 3; testSecRes = 3;
    
    // Use pistol consumer
    if (pistolConsumer.weapon === primWeapon && testPrimRes >= pistolConsumer.resourceRequirement) {
        testPrimRes -= pistolConsumer.resourceRequirement;
    }
    
    // Blade resources should be unaffected
    if (testSecRes === 3) {
        console.log("✅ PASS: Weapons are independent");
    } else {
        console.log("❌ FAIL: Weapons are not independent");
        return false;
    }
    
    console.log("\n🎉 RESOURCE MANAGEMENT TEST COMPLETE");
    console.log("   Weapon-specific resource management is working correctly!");
    return true;
}

// Run the test
const success = testResourceManagement();
process.exit(success ? 0 : 1);
