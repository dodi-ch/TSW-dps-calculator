
// Mock tswData
const tswData = [
    { name: "Pistol Basic", weapon: "Pistol", type: "Active" },
    { name: "Blade Strike", weapon: "Blade", type: "Active" }
];

// Mock TSWCALC_DATA (simplified)
const TSWCALC_DATA = {
    weaponPower: { "11.0": 528 },
    talismanRating: {
        head: { 10: 1144 },
        major: { 10: 1033 },
        minor: { 10: 664 }
    },
    glyphData: {
        'critical-rating': {
            head: [0, 56, 112, 167, 223],
            ql_mult: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3.42]
        },
        'critical-power': {
            head: [0, 77, 155, 232, 310],
            ql_mult: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3.42]
        },
        'penetration-rating': {
            head: [0, 50, 101, 151, 202],
            ql_mult: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4.0]
        },
        'hit-rating': {
            head: [0, 50, 101, 151, 202],
            ql_mult: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4.0]
        }
    },
    stat_mapping: { 1: 'critical-rating', 2: 'critical-power', 3: 'penetration-rating', 4: 'hit-rating' },
    wtype_mapping: { 1: 'Blade', 8: 'Pistol' },
    signets: {}
};

// Mock DOM
const mockElements = {
    'tswcalc-url': { value: 'https://joakibj.github.io/tswcalc/#weapon=11,1,11,1,1,4,0,0,0' },
    'combat-power': { value: '' },
    'attack-rating': { value: '' },
    'weapon-power': { value: '' },
    'hit-rating': { value: '' },
    'crit-chance': { value: '' },
    'crit-power': { value: '' },
    'pen-rating': { value: '' },
    'weapon-type': { value: '' },
    'secondary-weapon-type': { value: '' }
};

global.document = {
    getElementById: (id) => mockElements[id] || { value: '', style: {} }
};

global.tswData = tswData;
global.URLSearchParams = require('url').URLSearchParams;
global.Math.E = Math.E;

// Simplified versions of functions from app.js
function updateAbilityDropdowns() { console.log("updateAbilityDropdowns called"); }
function calculate() { console.log("calculate called"); }

// The function to test
function parseTswcalcUrl() {
    const urlInput = document.getElementById('tswcalc-url');
    const url = urlInput.value.trim();
    if (!url || !url.includes('#')) return;

    const fragment = url.split('#')[1];
    const params = new URLSearchParams(fragment);

    let attackRating = 0;
    let weaponPower = 75;
    let critRating = 0;
    let critPowerRating = 0;
    let penRating = 0;
    let hitRating = 0;

    const signetBonuses = { subtype: {}, weapon: {}, critPowerPct: 0, globalDmgPct: 0 };

    const slots = [
        { id: 'weapon', type: 'weapon', group: 'weapon' },
        { id: 'weapon2', type: 'weapon', group: 'weapon' },
        { id: 'head', type: 'talisman', group: 'head' },
        { id: 'ring', type: 'talisman', group: 'major' },
        { id: 'neck', type: 'talisman', group: 'major' },
        { id: 'wrist', type: 'talisman', group: 'major' },
        { id: 'luck', type: 'talisman', group: 'minor' },
        { id: 'waist', type: 'talisman', group: 'minor' },
        { id: 'occult', type: 'talisman', group: 'minor' }
    ];

    let baseCritRating = 0;
    let baseCritPowerRating = 0;
    let basePenRating = 0;
    let baseHitRating = 0;
    let weapon1Glyph = { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };
    let weapon2Glyph = { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };

    slots.forEach(slot => {
        const data = params.get(slot.id);
        if (!data) return;

        const vals = data.split(',');
        const qlIdx = parseInt(vals[0]);
        const itemId = parseInt(vals[1]);
        const glyphQlIdx = parseInt(vals[2]);
        const primStatId = parseInt(vals[3]);
        const secStatId = parseInt(vals[4]);
        const primDist = parseInt(vals[5]);
        const secDist = parseInt(vals[6]);
        const signetQual = parseInt(vals[7]) || 0;
        const signetId = parseInt(vals[8]) || 0;

        if (slot.type === 'weapon') {
            if (slot.id === 'weapon') {
                weaponPower = TSWCALC_DATA.weaponPower[`10.${qlIdx}`] || (qlIdx === 11 ? 528 : 75);
                const wName = TSWCALC_DATA.wtype_mapping[itemId];
                if (wName) document.getElementById('weapon-type').value = wName;
            } else if (slot.id === 'weapon2') {
                const wName2 = TSWCALC_DATA.wtype_mapping[itemId];
                if (wName2) document.getElementById('secondary-weapon-type').value = wName2;
            }
        } else if (slot.type === 'talisman') {
            const isDpsRole = itemId === 3 || itemId === 82 || itemId === 84 || itemId === 86 || itemId >= 200 || (itemId !== 1 && itemId !== 2 && itemId !== 81 && itemId !== 83 && itemId !== 85 && itemId !== 202 && itemId !== 203 && itemId !== 205 && itemId !== 207);
            if (isDpsRole) {
                attackRating += TSWCALC_DATA.talismanRating[slot.group][qlIdx] || 0;
            }
        }

        [{ id: primStatId, dist: primDist }, { id: secStatId, dist: secDist }].forEach(g => {
            const statName = TSWCALC_DATA.stat_mapping[g.id];
            if (statName && TSWCALC_DATA.glyphData[statName]) {
                const isWeaponSlot = slot.type === 'weapon';
                const glyphGroup = isWeaponSlot ? 'head' : slot.group;
                const base = TSWCALC_DATA.glyphData[statName][glyphGroup] ? TSWCALC_DATA.glyphData[statName][glyphGroup][g.dist] : 0;

                let mult = TSWCALC_DATA.glyphData[statName].ql_mult[glyphQlIdx] || 1;
                if (isWeaponSlot && glyphQlIdx === 11) mult *= 0.89;

                const val = base * mult;

                const targetBucket = !isWeaponSlot
                    ? 'base'
                    : (slot.id === 'weapon' ? 'weapon1' : (slot.id === 'weapon2' ? 'weapon2' : 'base'));

                if (targetBucket === 'base') {
                    if (statName === 'critical-rating') baseCritRating += val;
                    if (statName === 'critical-power') baseCritPowerRating += val;
                    if (statName === 'penetration-rating') basePenRating += val;
                    if (statName === 'hit-rating') baseHitRating += val;
                } else if (targetBucket === 'weapon1') {
                    if (statName === 'critical-rating') weapon1Glyph.critRating += val;
                    if (statName === 'critical-power') weapon1Glyph.critPowerRating += val;
                    if (statName === 'penetration-rating') weapon1Glyph.penRating += val;
                    if (statName === 'hit-rating') weapon1Glyph.hitRating += val;
                } else if (targetBucket === 'weapon2') {
                    if (statName === 'critical-rating') weapon2Glyph.critRating += val;
                    if (statName === 'critical-power') weapon2Glyph.critPowerRating += val;
                    if (statName === 'penetration-rating') weapon2Glyph.penRating += val;
                    if (statName === 'hit-rating') weapon2Glyph.hitRating += val;
                }
            }
        });

        const signet = TSWCALC_DATA.signets[signetId];
        if (signet && signetQual > 0) {
            const qualIndex = signetQual - 1;
            const bonus = signet.value[qualIndex] || 0;
            switch (signet.stat) {
                case 'attack-rating': attackRating += bonus; break;
                case 'crit-power-pct': signetBonuses.critPowerPct += bonus; break;
                case 'dmg-pct': signetBonuses.globalDmgPct += bonus; break;
                // ...
            }
        }
    });

    critRating = 40 + baseCritRating + weapon1Glyph.critRating + weapon2Glyph.critRating;
    critPowerRating = 40 + baseCritPowerRating + weapon1Glyph.critPowerRating + weapon2Glyph.critPowerRating;
    penRating = 40 + basePenRating + weapon1Glyph.penRating + weapon2Glyph.penRating;
    hitRating = 40 + baseHitRating + weapon1Glyph.hitRating + weapon2Glyph.hitRating;

    const baseARBonus = 805;
    const totalARForCP = attackRating + baseARBonus;

    const cp = Math.round((375 - (600 / (Math.pow(Math.E, (totalARForCP / 1400)) + 1))) * (1 + (weaponPower / 375)));
    const critChance = 55.14 - (100.3 / (Math.pow(Math.E, (critRating / 790.3)) + 1));
    const critPower = Math.sqrt(5 * critPowerRating + 625) + signetBonuses.critPowerPct;

    document.getElementById('combat-power').value = cp;
    document.getElementById('attack-rating').value = Math.round(attackRating);
    document.getElementById('weapon-power').value = Math.round(weaponPower);
    document.getElementById('hit-rating').value = Math.round(hitRating);
    document.getElementById('crit-chance').value = critChance.toFixed(1);
    document.getElementById('crit-power').value = critPower.toFixed(1);
    document.getElementById('pen-rating').value = Math.round(penRating);

    updateAbilityDropdowns();
    calculate();
}

try {
    parseTswcalcUrl();
    console.log("Results:");
    console.log(JSON.stringify(mockElements, null, 2));
} catch (e) {
    console.error("CRASHED:", e);
}
