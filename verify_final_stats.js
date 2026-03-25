
function calculateCP(ar, wp) {
    if (ar < 5200) {
        return Math.round((375 - (600 / (Math.pow(Math.E, (ar / 1400)) + 1))) * (1 + (wp / 375)));
    } else {
        const c = (0.00008 * wp) + 0.0301;
        return Math.round(204.38 + (0.5471 * wp) + (c * ar));
    }
}

function calculateCritChance(rating) {
    return (55.14 - (100.3 / (Math.pow(Math.E, (rating / 790.3)) + 1))).toFixed(1);
}

function calculateCritPower(rating) {
    return Math.sqrt(5 * rating + 625).toFixed(1);
}

const tests = [
    { name: "Combat Power (AR 5460, WP 528)", result: calculateCP(5460, 528), expected: 888 },
    { name: "Crit Chance (Rating 899)", result: calculateCritChance(899), expected: "30.8" },
    { name: "Crit Power (Rating 452)", result: calculateCritPower(452), expected: "53.7" }
];

console.log("Verification Results:");
let allPassed = true;
tests.forEach(t => {
    const passed = String(t.result) === String(t.expected);
    console.log(`${passed ? "✓" : "✗"} ${t.name}: Result ${t.result}, Expected ${t.expected}`);
    if (!passed) allPassed = false;
});

if (allPassed) {
    console.log("\nALL TESTS PASSED! The formulas now perfectly match TSWCalc's output.");
} else {
    console.log("\nSOME TESTS FAILED. Re-check the formulas.");
    process.exit(1);
}
