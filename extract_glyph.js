// Extract the full glyph data for all stats, QLs, slots, distridutions
const fs = require('fs');
const txt = fs.readFileSync('tswcalc_data.js', 'utf8');
const tswcalc = {};
eval(txt.replace(/var tswcalc = tswcalc \|\| {};/g, ''));

const glyphData = tswcalc.data.glyph_data.stat;
const stats = ['critical-rating', 'critical-power', 'penetration-rating', 'hit-rating'];
const slots = ['head', 'weapon', 'major', 'minor'];

// Build mapping object: stat -> ql -> slot -> [d0,d1,d2,d3,d4]
const result = {};
stats.forEach(stat => {
    result[stat] = {};
    const qlData = glyphData[stat].ql;
    Object.keys(qlData).forEach(ql => {
        result[stat][ql] = {};
        slots.forEach(slot => {
            const d = qlData[ql].slot[slot]?.dist;
            if (d) {
                result[stat][ql][slot] = [d[0]||0, d[1]||0, d[2]||0, d[3]||0, d[4]||0];
            }
        });
    });
});

console.log(JSON.stringify(result, null, 2));
