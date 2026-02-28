document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const cpInput = document.getElementById('combat-power');
    const hitRatingInput = document.getElementById('hit-rating');
    const critChanceInput = document.getElementById('crit-chance');
    const critPowerInput = document.getElementById('crit-power');
    const penRatingInput = document.getElementById('pen-rating');
    const targetEnemySelect = document.getElementById('target-enemy');
    const enemyStatsDisplay = document.getElementById('enemy-stats-display');

    const weaponSelect = document.getElementById('weapon-type');
    const secondaryWeaponSelect = document.getElementById('secondary-weapon-type');
    const resourcesInput = document.getElementById('resources-used');
    const simTimeInput = document.getElementById('simulation-time');

    const resTotalDps = document.getElementById('res-total-dps');
    const slotBreakdownContainer = document.getElementById('slot-breakdown-container');

    // Containers for dynamically generated select elements
    const activeContainer = document.getElementById('active-abilities-container');
    const auxActiveContainer = document.getElementById('aux-ability-container');
    const elitePassiveContainer = document.getElementById('elite-passive-container');
    const normalPassivesContainer = document.getElementById('normal-passives-container');
    const auxPassiveContainer = document.getElementById('aux-passive-container');

    // Dropdown arrays to keep track of them
    const activeSelects = [];
    const auxActiveSelects = [];
    const elitePassiveSelects = [];
    const normalPassiveSelects = [];
    const auxPassiveSelects = [];

    // Initialize all the UI elements
    function initUI() {
        // Active Abilities (7 slots)
        for (let i = 1; i <= 7; i++) {
            const select = document.createElement('select');
            select.id = `active-ability-${i}`;
            select.addEventListener('change', calculate);
            activeSelects.push(select);

            const wrapper = document.createElement('div');
            wrapper.className = 'slot-wrapper';
            wrapper.innerHTML = `<span class="slot-label">${i}</span>`;
            wrapper.appendChild(select);
            activeContainer.appendChild(wrapper);
        }

        // Aux Active (1 slot)
        const auxSelect = document.createElement('select');
        auxSelect.id = `aux-active-1`;
        auxSelect.addEventListener('change', calculate);
        auxActiveSelects.push(auxSelect);
        auxActiveContainer.appendChild(auxSelect);

        // Elite Passive (1 slot)
        const eliteSelect = document.createElement('select');
        eliteSelect.id = `elite-passive-1`;
        eliteSelect.addEventListener('change', calculate);
        elitePassiveSelects.push(eliteSelect);
        elitePassiveContainer.appendChild(eliteSelect);

        // Normal Passives (6 slots)
        for (let i = 1; i <= 6; i++) {
            const select = document.createElement('select');
            select.id = `normal-passive-${i}`;
            select.addEventListener('change', calculate);
            normalPassiveSelects.push(select);

            const wrapper = document.createElement('div');
            wrapper.className = 'slot-wrapper';
            wrapper.innerHTML = `<span class="slot-label">${i}</span>`;
            wrapper.appendChild(select);
            normalPassivesContainer.appendChild(wrapper);
        }

        // Aux Passive (1 slot)
        const auxPassSelect = document.createElement('select');
        auxPassSelect.id = `aux-passive-1`;
        auxPassSelect.addEventListener('change', calculate);
        auxPassiveSelects.push(auxPassSelect);
        auxPassiveContainer.appendChild(auxPassSelect);

    }

    // Data - check if loaded
    if (typeof tswData === 'undefined') {
        resTotalDps.textContent = "Error: Data failed to load";
        return;
    }

    // Populate Weapons
    const weapons = new Set(tswData.map(a => a.weapon));
    const sortedWeapons = Array.from(weapons).sort();

    sortedWeapons.forEach(w => {
        // Exclude Aux/Deviations from main weapons list if they are in there
        if (w === "Aux" || w === "Anima Deviations" || w === "") return;

        const option1 = document.createElement('option');
        option1.value = w;
        option1.textContent = w;
        weaponSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = w;
        option2.textContent = w;
        secondaryWeaponSelect.appendChild(option2);
    });

    // Filtering Helpers
    function populateDropdowns(selectElements, filterFn, emptyLabel = "-- None --") {
        const filteredData = tswData.filter(filterFn);
        filteredData.sort((a, b) => a.name.localeCompare(b.name));

        selectElements.forEach(select => {
            // save current selection to attempt to restore it
            const currentVal = select.value;
            select.innerHTML = `<option value="">${emptyLabel}</option>`;

            filteredData.forEach(a => {
                const globalIndex = tswData.indexOf(a);
                const option = document.createElement('option');
                option.value = globalIndex;
                option.textContent = a.name;
                select.appendChild(option);
            });

            // Restore if possible
            if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
                select.value = currentVal;
            }
        });
    }

    const ENEMIES = {
        'training-puppet': { name: 'Training Puppet', blockRating: 0, evadeRating: 0, defenseRating: 0 },
        'eidolon': { name: 'Eidolon', blockRating: 300, evadeRating: 300, defenseRating: 300 }
    };

    function updateAbilityDropdowns() {
        // Update enemy stats display
        const enemy = ENEMIES[targetEnemySelect.value] || ENEMIES['training-puppet'];
        enemyStatsDisplay.textContent = `Block: ${enemy.blockRating} | Evade: ${enemy.evadeRating} | Defense: ${enemy.defenseRating}`;

        const prim = weaponSelect.value;
        const sec = secondaryWeaponSelect.value;
        const isSelectedWeapon = (weapon) => weapon === prim || weapon === sec || prim === "All";
        const getType = (a) => a.type || "";

        populateDropdowns(activeSelects, a => isSelectedWeapon(a.weapon) && (getType(a).includes("Active") || getType(a) === ""));

        // Aux Actives: Fixed list of auxiliary weapons
        const auxWeapons = ["Rocket Launcher", "Chainsaw", "Quantum", "Whiplash", "Flamethrower"];
        populateDropdowns(auxActiveSelects, a => auxWeapons.includes(a.weapon) && getType(a).includes("Active"));

        // Elite Passives: Any weapon (regardless of selection), type contains Elite and Passive
        populateDropdowns(elitePassiveSelects, a => getType(a).includes("Elite") && getType(a).includes("Passive"));

        // Normal Passives: Any weapon (regardless of selection), type contains Passive, NOT Elite
        populateDropdowns(normalPassiveSelects, a => getType(a).includes("Passive") && !getType(a).includes("Elite"));

        // Aux Passives: Use aux weapon list
        populateDropdowns(auxPassiveSelects, a => auxWeapons.includes(a.weapon) && getType(a).includes("Passive"));

        calculate();
    }

    // Mathematical Helpers
    function getAbilityStats(ability, cp, critChance, critPower, penChance, resourcesUsed) {
        if (!ability) return null;

        let scalingToUse = ability.scaling || 0;
        if (ability.scaling_5 > 0 && ability.scaling_1 > 0) {
            scalingToUse = ability.scaling_1 + ((resourcesUsed - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
        } else if (ability.scaling_5 > 0 && resourcesUsed === 5) {
            scalingToUse = ability.scaling_5;
        }

        const baseDamage = scalingToUse * cp;
        const critMultiplier = 1 + ((critChance / 100) * (critPower / 100));
        const penMultiplier = 1 + ((penChance / 100) * 0.15);
        const avgDamage = baseDamage * critMultiplier * penMultiplier;

        // Global minimum time is 1.0 seconds
        const castTime = Math.max(ability.cast_time || 1.0, 1.0);
        const cooldown = ability.cooldown || 0;

        // Extraction of subtypes from description
        let subtype = "";
        const desc = ability.description || "";
        const subtypes = ["Strike", "Blast", "Focus", "Frenzy", "Burst", "Chain"];
        for (const s of subtypes) {
            if (desc.includes(s + " attack") || desc.includes(s + " ability")) {
                subtype = s;
                break;
            }
        }

        // Extraction of trigger requirements for passives
        let triggerSubtypes = [];
        if (ability.type && ability.type.includes("Passive")) {
            for (const s of subtypes) {
                if (desc.includes(s + " attacks") || desc.includes(s + " abilities")) {
                    triggerSubtypes.push(s);
                }
            }
        }

        // Extraction of duration and interval for entities (turrets, manifestations, drones)
        let duration = 0;
        let tickInterval = 0;

        // Regex for "for X seconds" or "lasting X seconds"
        const durationMatch = desc.match(/(?:for|lasting)\s+(\d+(?:\.\d+)?)\s+seconds/i);
        if (durationMatch) {
            duration = parseFloat(durationMatch[1]);
        }

        // Regex for "every X seconds" or "per X seconds"
        const intervalMatch = desc.match(/(?:every|per)\s+(\d+(?:\.\d+)?)\s+seconds/i);
        if (intervalMatch) {
            tickInterval = parseFloat(intervalMatch[1]);
        } else if (desc.includes("every seconds")) {
            tickInterval = 1.0;
        }

        return {
            name: ability.name,
            avgDamage,
            castTime,
            cooldown,
            tree: ability.tree,
            isConsumer: (ability.scaling_1 > 0 || ability.scaling_5 > 0) && (ability.cooldown === 0 || ability.cooldown === 4.0), // Focus/Strike consumers have 4s CD
            weapon: ability.weapon,
            type: ability.type || "Unknown",
            subtype,
            triggerSubtypes,
            duration,
            tickInterval,
            scalingToUse,
            originalAbility: ability
        };
    }

    function calculate() {
        const cp = parseFloat(cpInput.value) || 0;
        const hitRating = parseFloat(hitRatingInput.value) || 0;
        const critChance = parseFloat(critChanceInput.value) || 0;
        const critPower = parseFloat(critPowerInput.value) || 0;
        const penRating = parseFloat(penRatingInput.value) || 0;
        const targetResources = parseInt(resourcesInput.value) || 5;
        const simTimeMins = parseFloat(simTimeInput.value) || 3;
        const targetSeconds = simTimeMins * 60;

        const actives = activeSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, 0, targetResources));
        const auxActives = auxActiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, 0, targetResources));
        const elitePass = elitePassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, 0, 5));
        const normPass = normalPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, 0, 5));
        const auxPass = auxPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, 0, 5));

        const allActives = [...actives, ...auxActives];
        const allPassives = [...elitePass, ...normPass, ...auxPass];

        if (allActives.length === 0) {
            resTotalDps.textContent = "0";
            slotBreakdownContainer.innerHTML = "<em>No active abilities selected</em>";
            return;
        }

        const eliteActives = actives.filter(a => a.type.includes("Elite"));
        if (eliteActives.length > 1) {
            resTotalDps.textContent = "Error: Too many Elite Actives";
            slotBreakdownContainer.innerHTML = `<em style="color: #ffaa55;">You can only select a maximum of 1 Elite Active.</em>`;
            return;
        }

        // --- SIMULATION ENGINE ---
        let time = 0;
        let primResources = 0;
        let secResources = 0;
        let totalDamage = 0;

        const statsBreakdown = {};
        [...allActives, ...allPassives].forEach(a => {
            statsBreakdown[a.name] = { damage: 0, casts: 0 };
        });

        const activeCooldowns = allActives.map(() => 0);
        const passiveCooldowns = allPassives.map(() => 0);
        let activeEffects = [];

        const primWeapon = weaponSelect.value;
        const secWeapon = secondaryWeaponSelect.value;
        const enemy = ENEMIES[targetEnemySelect.value] || ENEMIES['training-puppet'];

        function performAttack(ability) {
            // Deterministic Combat Logic
            let damageMult = 1.0;
            const isEvaded = enemy.evadeRating > hitRating;
            const isGlanced = !isEvaded && enemy.defenseRating > hitRating;
            const isPenetrated = penRating > enemy.blockRating;

            if (isEvaded) {
                damageMult = 0;
            } else {
                if (isGlanced) damageMult *= 0.5;
                if (isPenetrated) damageMult *= 1.5;
            }

            // Crit check (Probabilistic)
            const isCrit = Math.random() < (critChance / 100);
            const finalMult = (isCrit ? (critPower / 100) : 1.0) * damageMult;

            // Use scaling * cp for base damage
            const rawBaseDmg = (ability.scalingToUse || 0) * cp;
            const actualDmg = rawBaseDmg * finalMult;

            totalDamage += actualDmg;
            if (!statsBreakdown[ability.name]) statsBreakdown[ability.name] = { damage: 0, casts: 0 };
            statsBreakdown[ability.name].casts++;
            statsBreakdown[ability.name].damage += actualDmg;

            // Proc Passives (Evaluate on every hit)
            allPassives.forEach((passive, p) => {
                if (passiveCooldowns[p] <= 0) {
                    if (passive.triggerSubtypes.length > 0 && !passive.triggerSubtypes.includes(ability.subtype)) return;

                    const pActualDmg = (passive.scalingToUse || 0) * cp * finalMult;
                    totalDamage += pActualDmg;
                    statsBreakdown[passive.name].casts++;
                    statsBreakdown[passive.name].damage += pActualDmg;
                    passiveCooldowns[p] = 1.0; // 1s ICD
                }
            });
        }

        while (time < targetSeconds) {
            let castSomething = false;

            for (let i = 0; i < allActives.length; i++) {
                const action = allActives[i];
                if (activeCooldowns[i] > 0) continue;

                let canCast = true;
                const isPrim = action.weapon === primWeapon;
                const isSec = action.weapon === secWeapon;

                if (action.isConsumer) {
                    if (isPrim && primResources < targetResources) canCast = false;
                    if (isSec && secResources < targetResources) canCast = false;
                } else if (action.cooldown === 0 && action.tree !== "Aux") {
                    // Logic for builders: don't overbuild
                    if (isPrim && primResources >= 5) canCast = false;
                    if (isSec && secResources >= 5) canCast = false;
                }

                if (canCast) {
                    performAttack(action);

                    const timeTaken = action.castTime;
                    time += timeTaken;
                    activeCooldowns[i] = action.cooldown;

                    // Resources
                    if (action.isConsumer) {
                        if (isPrim) primResources -= targetResources;
                        if (isSec) secResources -= targetResources;
                    } else if (action.tree !== "Aux") {
                        primResources = Math.min(5, primResources + 1);
                        if (secWeapon !== "None") secResources = Math.min(5, secResources + 1);
                    }

                    // Effects
                    if (action.duration > 0 && action.tickInterval > 0) {
                        activeEffects.push({
                            name: action.name + " (Effect)",
                            duration: action.duration,
                            tickInterval: action.tickInterval,
                            nextTick: action.tickInterval,
                            subtype: action.subtype,
                            scalingToUse: action.scalingToUse
                        });
                    }

                    // CD reduction
                    for (let j = 0; j < activeCooldowns.length; j++) activeCooldowns[j] -= timeTaken;
                    for (let j = 0; j < passiveCooldowns.length; j++) passiveCooldowns[j] -= timeTaken;

                    // Effect Ticks
                    activeEffects = activeEffects.filter(eff => {
                        eff.duration -= timeTaken;
                        eff.nextTick -= timeTaken;
                        while (eff.nextTick <= 0 && eff.duration >= 0) {
                            performAttack({ name: eff.name, subtype: eff.subtype, scalingToUse: eff.scalingToUse });
                            eff.nextTick += eff.tickInterval;
                        }
                        return eff.duration > 0;
                    });

                    castSomething = true;
                    break;
                }
            }

            if (!castSomething) {
                let minWait = 1.0;
                for (let c of activeCooldowns) if (c > 0 && c < minWait) minWait = c;
                time += minWait;
                for (let j = 0; j < activeCooldowns.length; j++) activeCooldowns[j] -= minWait;
                for (let j = 0; j < passiveCooldowns.length; j++) passiveCooldowns[j] -= minWait;
            }
        }

        const finalDps = totalDamage / targetSeconds;
        resTotalDps.textContent = Math.round(finalDps).toLocaleString() + ` DPS (over ${simTimeMins}m)`;

        // Render Breakdown
        slotBreakdownContainer.innerHTML = '';
        const sortedStats = Object.keys(statsBreakdown)
            .filter(name => statsBreakdown[name].casts > 0)
            .map(name => ({
                name,
                ...statsBreakdown[name]
            }))
            .sort((a, b) => b.damage - a.damage);

        sortedStats.forEach(stat => {
            const itemDps = stat.damage / targetSeconds;
            const percent = ((stat.damage / totalDamage) * 100).toFixed(1);

            const div = document.createElement('div');
            div.style.background = 'rgba(0,0,0,0.2)';
            div.style.padding = '0.5rem';
            div.style.borderRadius = 'var(--border-radius)';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';

            div.innerHTML = `
                <span><strong>${stat.name}</strong> (${stat.casts} casts)</span>
                <span>${Math.round(itemDps).toLocaleString()} DPS (${percent}%)</span>
            `;
            slotBreakdownContainer.appendChild(div);
        });
    }

    // --- TSWCALC IMPORT LOGIC ---
    const TSWCALC_DATA = {
        weaponPower: {
            "10.0": 398, "10.1": 411, "10.2": 423, "10.3": 434, "10.4": 446, "10.5": 457,
            "10.6": 464, "10.7": 475, "10.8": 492, "10.9": 510, "11.0": 528
        },
        talismanRating: {
            head: { 0: 559, 1: 596, 2: 636, 3: 682, 4: 735, 5: 788, 6: 846, 7: 936, 8: 1011, 9: 1077, 10: 1144 },
            major: { 0: 505, 1: 538, 2: 575, 3: 616, 4: 664, 5: 712, 6: 764, 7: 845, 8: 913, 9: 972, 10: 1033 },
            minor: { 0: 325, 1: 346, 2: 369, 3: 396, 4: 427, 5: 458, 6: 491, 7: 543, 8: 587, 9: 625, 10: 664 }
        },
        glyphData: {
            // Mapping for Rating based on QL (0-10) and Distribution (0-4)
            'critical-rating': {
                head: [0, 56, 112, 167, 223], major: [0, 50, 101, 151, 202], minor: [0, 32, 65, 97, 130],
                ql_mult: [1, 1.08, 1.22, 1.3, 1.39, 1.48, 1.54, 1.63, 1.76, 1.9, 2.0]
            },
            'critical-power': {
                head: [0, 77, 155, 232, 310], major: [0, 70, 140, 209, 279], minor: [0, 45, 90, 135, 180],
                ql_mult: [1, 1.08, 1.22, 1.3, 1.39, 1.48, 1.54, 1.63, 1.76, 1.9, 2.0]
            },
            'penetration-rating': {
                head: [0, 50, 101, 151, 202], major: [0, 46, 91, 137, 182], minor: [0, 29, 59, 88, 117],
                ql_mult: [1, 1.12, 1.22, 1.36, 1.58, 1.8, 1.88, 2.05, 2.3, 2.5, 2.7]
            },
            'hit-rating': {
                head: [0, 50, 101, 151, 202], major: [0, 46, 91, 137, 182], minor: [0, 29, 59, 88, 117],
                ql_mult: [1, 1.12, 1.22, 1.36, 1.58, 1.8, 1.88, 2.05, 2.3, 2.5, 2.7]
            }
        },
        signets: {
            21: { stat: 'attack-rating', value: [47, 94, 141] }, // Violence
            56: { stat: 'attack-rating', value: [0, 0, 117] },  // Chernobog
            23: { stat: 'heal-rating', value: [47, 94, 141] },   // Amelioration
        },
        stat_mapping: { 1: 'critical-rating', 2: 'critical-power', 3: 'penetration-rating', 4: 'hit-rating' },
        wtype_mapping: { 1: 'Blade', 2: 'Hammer', 3: 'Fist', 4: 'Blood', 5: 'Chaos', 6: 'Elementalism', 7: 'Shotgun', 8: 'Pistol', 9: 'Assault Rifle' }
    };

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
                    if (wName) weaponSelect.value = wName;
                } else if (slot.id === 'weapon2') {
                    const wName2 = TSWCALC_DATA.wtype_mapping[itemId];
                    if (wName2) secondaryWeaponSelect.value = wName2;
                }
            } else if (slot.type === 'talisman') {
                attackRating += TSWCALC_DATA.talismanRating[slot.group][qlIdx] || 0;
            }

            [{ id: primStatId, dist: primDist }, { id: secStatId, dist: secDist }].forEach(g => {
                const statName = TSWCALC_DATA.stat_mapping[g.id];
                if (statName && TSWCALC_DATA.glyphData[statName]) {
                    const base = TSWCALC_DATA.glyphData[statName][slot.group][g.dist];
                    const mult = TSWCALC_DATA.glyphData[statName].ql_mult[glyphQlIdx] || 1;
                    const val = base * mult;

                    if (statName === 'critical-rating') critRating += val;
                    if (statName === 'critical-power') critPowerRating += val;
                    if (statName === 'penetration-rating') penRating += val;
                    if (statName === 'hit-rating') hitRating += val;
                }
            });

            const signet = TSWCALC_DATA.signets[signetId];
            if (signet && signetQual > 0) {
                const bonus = signet.value[signetQual - 1] || 0;
                if (signet.stat === 'attack-rating') attackRating += bonus;
            }
        });

        const cp = Math.round((375 - (600 / (Math.pow(Math.E, (attackRating / 1400)) + 1))) * (1 + (weaponPower / 375)));
        const critChance = 55.14 - (100.3 / (Math.pow(Math.E, (critRating / 790.3)) + 1));
        const critPower = Math.sqrt(5 * critPowerRating + 625);

        cpInput.value = cp;
        hitRatingInput.value = Math.round(hitRating);
        critChanceInput.value = critChance.toFixed(1);
        critPowerInput.value = critPower.toFixed(1);
        penRatingInput.value = Math.round(penRating);

        updateAbilityDropdowns();
        calculate();
    }

    targetEnemySelect.addEventListener('change', updateAbilityDropdowns);
    targetEnemySelect.addEventListener('change', calculate);
    weaponSelect.addEventListener('change', updateAbilityDropdowns);
    secondaryWeaponSelect.addEventListener('change', updateAbilityDropdowns);
    resourcesInput.addEventListener('input', calculate);
    simTimeInput.addEventListener('input', calculate);

    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', parseTswcalcUrl);
    }

    [cpInput, hitRatingInput, critChanceInput, critPowerInput, penRatingInput].forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Init
    initUI();
    updateAbilityDropdowns();
});
