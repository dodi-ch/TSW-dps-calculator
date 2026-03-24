// Test the FIXED glyph lookup logic from app.js against expected values
// Uses a realistic full-gear URL matching the reference screenshot values

const TSWCALC_DATA = {
    weaponPower: {
        "10.0": 398, "10.1": 411, "10.2": 423, "10.3": 434, "10.4": 446, "10.5": 457,
        "10.6": 464, "10.7": 475, "10.8": 492, "10.9": 510, "11.0": 528
    },
    talismanRating: {
        head:  { 0: 559, 1: 596, 2: 636, 3: 682, 4: 735, 5: 788, 6: 846, 7: 936, 8: 1011, 9: 1077, 10: 1144, 11: 1144 },
        major: { 0: 505, 1: 538, 2: 575, 3: 616, 4: 664, 5: 712, 6: 764, 7: 845, 8: 913,  9: 972,  10: 1033, 11: 1033 },
        minor: { 0: 325, 1: 346, 2: 369, 3: 396, 4: 427, 5: 458, 6: 491, 7: 543, 8: 587,  9: 625,  10: 664,  11: 664  }
    },
    glyphQlMap: ['10.0','10.1','10.2','10.3','10.4','10.5',null,null,null,null,null,'11.0'],
    glyphData: {
        'critical-rating': {
            '10.0': { head:[0,56,112,167,223],  weapon:[0,56,112,167,223],  major:[0,50,101,151,202], minor:[0,32,65,97,130]  },
            '10.1': { head:[0,60,120,181,241],  weapon:[0,60,120,181,241],  major:[0,54,109,163,217], minor:[0,35,70,105,140] },
            '10.2': { head:[0,65,130,195,260],  weapon:[0,65,130,195,260],  major:[0,59,117,176,235], minor:[0,38,75,113,151] },
            '10.3': { head:[0,71,141,212,283],  weapon:[0,71,141,212,283],  major:[0,64,127,191,255], minor:[0,41,82,123,164] },
            '10.4': { head:[0,77,155,232,309],  weapon:[0,77,155,232,309],  major:[0,70,140,209,279], minor:[0,45,90,135,180] },
            '10.5': { head:[0,84,168,252,336],  weapon:[0,84,168,252,336],  major:[0,76,151,227,303], minor:[0,49,97,146,195] },
            '11.0': { head:[0,0,181,0,362],     weapon:[0,0,181,0,362],     major:[0,0,163,0,327],    minor:[0,0,105,0,210]  }
        },
        'critical-power': {
            '10.0': { head:[0,60,119,179,238],  weapon:[0,60,119,179,238],  major:[0,54,108,161,215], minor:[0,35,69,104,138] },
            '10.1': { head:[0,64,128,191,255],  weapon:[0,64,128,191,255],  major:[0,58,115,173,231], minor:[0,37,74,111,148] },
            '10.2': { head:[0,68,136,205,273],  weapon:[0,68,136,205,273],  major:[0,62,123,185,246], minor:[0,40,79,119,158] },
            '10.3': { head:[0,73,145,218,291],  weapon:[0,73,145,218,291],  major:[0,66,128,197,263], minor:[0,42,84,127,169] },
            '10.4': { head:[0,77,155,232,310],  weapon:[0,77,155,232,310],  major:[0,70,140,210,280], minor:[0,45,90,135,180] },
            '10.5': { head:[0,82,164,246,328],  weapon:[0,82,164,246,328],  major:[0,74,148,222,296], minor:[0,48,95,143,191] },
            '11.0': { head:[0,0,173,0,347],     weapon:[0,0,173,0,347],     major:[0,0,156,0,313],    minor:[0,0,100,0,201]  }
        },
        'penetration-rating': {
            '10.0': { head:[0,50,101,151,202],  weapon:[0,50,101,151,202],  major:[0,46,91,137,182],  minor:[0,29,59,88,117]  },
            '10.1': { head:[0,56,111,166,221],  weapon:[0,56,111,166,221],  major:[0,50,100,150,200], minor:[0,32,64,96,129]  },
            '10.2': { head:[0,61,123,184,245],  weapon:[0,61,123,184,245],  major:[0,55,111,166,221], minor:[0,36,71,107,142] },
            '10.3': { head:[0,69,138,207,276],  weapon:[0,69,138,207,276],  major:[0,62,125,187,249], minor:[0,40,80,120,160] },
            '10.4': { head:[0,80,160,240,319],  weapon:[0,80,160,240,319],  major:[0,72,144,216,288], minor:[0,46,93,139,185] },
            '10.5': { head:[0,91,182,272,363],  weapon:[0,91,182,272,363],  major:[0,82,164,246,328], minor:[0,53,105,158,211] },
            '11.0': { head:[0,0,203,0,407],     weapon:[0,0,203,0,407],     major:[0,0,183,0,367],    minor:[0,0,118,0,236]  }
        },
        'hit-rating': {
            '10.0': { head:[0,50,101,151,202],  weapon:[0,50,101,151,202],  major:[0,46,91,137,182],  minor:[0,29,59,88,117]  },
            '10.1': { head:[0,56,111,166,221],  weapon:[0,56,111,166,221],  major:[0,50,100,150,200], minor:[0,32,64,96,129]  },
            '10.2': { head:[0,61,123,184,245],  weapon:[0,61,123,184,245],  major:[0,55,111,166,221], minor:[0,36,71,107,142] },
            '10.3': { head:[0,69,138,207,276],  weapon:[0,69,138,207,276],  major:[0,62,125,187,249], minor:[0,40,80,120,160] },
            '10.4': { head:[0,80,160,240,319],  weapon:[0,80,160,240,319],  major:[0,72,144,216,288], minor:[0,46,93,139,185] },
            '10.5': { head:[0,91,182,272,363],  weapon:[0,91,182,272,363],  major:[0,82,164,246,328], minor:[0,53,105,158,211] },
            '11.0': { head:[0,0,203,0,407],     weapon:[0,0,203,0,407],     major:[0,0,183,0,367],    minor:[0,0,118,0,236]  }
        }
    },
    stat_mapping: { 1: 'critical-rating', 2: 'critical-power', 3: 'penetration-rating', 4: 'hit-rating' },
    wtype_mapping: { 1:'Blade',2:'Hammer',3:'Fist',4:'Blood',5:'Chaos',6:'Elementalism',7:'Shotgun',8:'Pistol',9:'Assault Rifle' }
};

// Simulate a realistic full QL11 DPS build URL
// weapon=11,1,11,3,1,4,4,3,6   => blade,QL11, glyph QL11, pen(3)+crit(1), dist 4+4, Laceration epic
// weapon2=11,9,11,4,2,4,4,0,0  => AR,QL11, glyph QL11, hit(4)+critpow(2), dist 4+4
// head=11,3,11,3,4,4,4,3,24    => DPS, QL11, glyph QL11, pen(3)+hit(4), dist 4+4, Assassination epic
// ring=11,3,11,1,2,4,4,0,0     => DPS, QL11, glyph QL11, crit(1)+critpow(2), dist 4+4
// neck=11,3,11,1,2,4,4,0,0
// wrist=11,3,11,1,2,4,4,0,0
// luck=11,3,11,1,2,4,4,0,0
// waist=11,3,11,1,2,4,4,0,0
// occult=11,3,11,1,2,4,4,0,0
const testUrl = 'https://joakibj.github.io/tswcalc/#weapon=11,1,11,3,1,4,4,3,6&weapon2=11,9,11,4,2,4,4,0,0&head=11,3,11,3,4,4,4,0,0&ring=11,3,11,1,2,4,4,0,0&neck=11,3,11,1,2,4,4,0,0&wrist=11,3,11,1,2,4,4,0,0&luck=11,3,11,1,2,4,4,0,0&waist=11,3,11,1,2,4,4,0,0&occult=11,3,11,1,2,4,4,0,0';

const fragment = testUrl.split('#')[1];
const params = new URLSearchParams(fragment);

const slots = [
    { id: 'weapon',  type: 'weapon',   group: 'weapon' },
    { id: 'weapon2', type: 'weapon',   group: 'weapon' },
    { id: 'head',    type: 'talisman', group: 'head'   },
    { id: 'ring',    type: 'talisman', group: 'major'  },
    { id: 'neck',    type: 'talisman', group: 'major'  },
    { id: 'wrist',   type: 'talisman', group: 'major'  },
    { id: 'luck',    type: 'talisman', group: 'minor'  },
    { id: 'waist',   type: 'talisman', group: 'minor'  },
    { id: 'occult',  type: 'talisman', group: 'minor'  }
];

let attackRating = 0, weaponPower = 75;
let baseCritRating = 0, baseCritPowerRating = 0, basePenRating = 0, baseHitRating = 0;
let weapon1Glyph = { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };
let weapon2Glyph = { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };
const signetBonuses = { subtype:{}, weapon:{}, critPowerPct:0, globalDmgPct:0 };

slots.forEach(slot => {
    const data = params.get(slot.id);
    if (!data) return;
    const vals = data.split(',');
    const qlIdx      = parseInt(vals[0]);
    const itemId     = parseInt(vals[1]);
    const glyphQlIdx = parseInt(vals[2]);
    const primStatId = parseInt(vals[3]);
    const secStatId  = parseInt(vals[4]);
    const primDist   = parseInt(vals[5]);
    const secDist    = parseInt(vals[6]);

    if (slot.type === 'weapon') {
        if (slot.id === 'weapon') {
            const key = qlIdx === 11 ? '11.0' : `10.${qlIdx}`;
            weaponPower = TSWCALC_DATA.weaponPower[key] || 75;
        }
    } else if (slot.type === 'talisman') {
        const isDpsRole = itemId === 3 || (itemId !== 1 && itemId !== 2 && itemId !== 81 && itemId !== 83 && itemId !== 85);
        if (isDpsRole) {
            attackRating += TSWCALC_DATA.talismanRating[slot.group][qlIdx] || 0;
        }
    }

    [{ id: primStatId, dist: primDist }, { id: secStatId, dist: secDist }].forEach(g => {
        const statName = TSWCALC_DATA.stat_mapping[g.id];
        if (statName && g.dist > 0 && TSWCALC_DATA.glyphData[statName]) {
            const isWeaponSlot = slot.type === 'weapon';
            const glyphGroup = isWeaponSlot ? 'weapon' : slot.group;
            const qlStr = TSWCALC_DATA.glyphQlMap[glyphQlIdx] || '10.0';
            const qlTable = TSWCALC_DATA.glyphData[statName][qlStr];
            const val = (qlTable && qlTable[glyphGroup]) ? (qlTable[glyphGroup][g.dist] || 0) : 0;

            const isW1 = slot.id === 'weapon';
            const isW2 = slot.id === 'weapon2';
            const bucket = !isWeaponSlot ? 'base' : (isW1 ? 'weapon1' : 'weapon2');

            console.log(`  ${slot.id} ${statName} dist=${g.dist} qlStr=${qlStr} group=${glyphGroup} => ${val}`);

            if (bucket === 'base') {
                if (statName === 'critical-rating')    baseCritRating      += val;
                if (statName === 'critical-power')     baseCritPowerRating += val;
                if (statName === 'penetration-rating') basePenRating       += val;
                if (statName === 'hit-rating')         baseHitRating       += val;
            } else if (bucket === 'weapon1') {
                if (statName === 'critical-rating')    weapon1Glyph.critRating      += val;
                if (statName === 'critical-power')     weapon1Glyph.critPowerRating += val;
                if (statName === 'penetration-rating') weapon1Glyph.penRating       += val;
                if (statName === 'hit-rating')         weapon1Glyph.hitRating       += val;
            } else {
                if (statName === 'critical-rating')    weapon2Glyph.critRating      += val;
                if (statName === 'critical-power')     weapon2Glyph.critPowerRating += val;
                if (statName === 'penetration-rating') weapon2Glyph.penRating       += val;
                if (statName === 'hit-rating')         weapon2Glyph.hitRating       += val;
            }
        }
    });
});

// Aggregate totals for display (Primary Weapon only, matching updated app.js)
const critRating = 40 + baseCritRating + weapon1Glyph.critRating;
const critPowerRating = 40 + baseCritPowerRating + weapon1Glyph.critPowerRating;
const penRating  = 40 + basePenRating  + weapon1Glyph.penRating;
const hitRating  = 40 + baseHitRating  + weapon1Glyph.hitRating;

const baseARBonus = 805;
const totalARForCP = attackRating + baseARBonus;
const cp = Math.round((375 - (600 / (Math.pow(Math.E,(totalARForCP/1400))+1))) * (1+(weaponPower/375)));
const critChance = 55.14 - (100.3 / (Math.pow(Math.E,(critRating/790.3))+1));
const critPower = Math.sqrt(5 * critPowerRating + 625) + signetBonuses.critPowerPct;

console.log('\n--- IMPORTED STATS ---');
console.log(`Attack Rating (from gear): ${Math.round(attackRating)}`);
console.log(`Weapon Power: ${Math.round(weaponPower)}`);
console.log(`Combat Power: ${cp}`);
console.log(`Crit Rating: ${Math.round(critRating)}`);
console.log(`Crit Chance: ${critChance.toFixed(1)}%`);
console.log(`Crit Power Rating: ${Math.round(critPowerRating)}`);
console.log(`Crit Power: ${critPower.toFixed(1)}%`);
console.log(`Pen Rating: ${Math.round(penRating)}`);
console.log(`Hit Rating: ${Math.round(hitRating)}`);
console.log('\n--- REFERENCE (white bg screenshot) ---');
console.log('Attack Rating (from gear): 6449 (tswcalc shows 6449 total, minus ~805 base)');
console.log('Weapon Power: 528');
console.log('Crit Rating: +1018');
console.log('Crit Chance: 33.5%');
console.log('Crit Power Rating: +396');
console.log('Crit Power: 51.0%');
console.log('Pen Rating: +643');
console.log('Hit Rating: +485');
