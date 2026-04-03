// Debug the regex patterns for counter detection

const testDescriptions = [
    "Whenever you hit, you build a Lucky Bullet counter. Once that counter reaches 6, your next attack causes the target to become Hindered and its movement speed is reduced by 70% for 8 seconds. This effect has an internal recharge time of 30 seconds.",
    "Whenever you penetrate, you build a Third Degree counter. When this counter reaches 3, you also cause the target to become Afflicted with a damage over time effect that deals 23 magical damage every second for 4 seconds.",
    "Whenever you finish activating an ability on a target you have Afflicted, you build a Fatal Flourish counter. As soon as you reach 5 counters, the count will reset and you will gain beneficial effect which increases your Penetration Chance 20% for 5 seconds. Fatal Flourish counters cannot be gained while this effect is active."
];

function testCounterRegex() {
    console.log("Testing counter detection regex patterns:\n");
    
    testDescriptions.forEach((desc, index) => {
        console.log(`--- Test ${index + 1} ---`);
        console.log(`Description: ${desc.substring(0, 100)}...`);
        
        // Test the current regex
        const counterMatch = desc.match(/(?:once (?:you )?(?:reach|es)|when (?:the )?counter reaches|as soon as you reach)\s*(\d+)\s*counters?/i);
        console.log(`Current regex match:`, counterMatch);
        
        // Test alternative patterns
        const altMatch1 = desc.match(/counter.*?(\d+)/i);
        console.log(`Alternative 1 (counter.*?\\d+):`, altMatch1);
        
        const altMatch2 = desc.match(/reaches\s+(\d+)/i);
        console.log(`Alternative 2 (reaches\\s+\\d+):`, altMatch2);
        
        const altMatch3 = desc.match(/reach\s+(\d+)/i);
        console.log(`Alternative 3 (reach\\s+\\d+):`, altMatch3);
        
        console.log("");
    });
}

testCounterRegex();
