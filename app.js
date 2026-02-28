document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const cpInput = document.getElementById('combat-power');
    const critChanceInput = document.getElementById('crit-chance');
    const critPowerInput = document.getElementById('crit-power');
    const penChanceInput = document.getElementById('pen-chance');

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

    function updateAbilityDropdowns() {
        const prim = weaponSelect.value;
        const sec = secondaryWeaponSelect.value;

        // Actives: Primary or Secondary weapon, contains "Active" or empty type (many core abilities have empty type)
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
            originalAbility: ability
        };
    }

    function calculate() {
        const cp = parseFloat(cpInput.value) || 0;
        const critChance = parseFloat(critChanceInput.value) || 0;
        const critPower = parseFloat(critPowerInput.value) || 0;
        const penChance = parseFloat(penChanceInput.value) || 0;
        const targetResources = parseInt(resourcesInput.value) || 5;
        const simTimeMins = parseFloat(simTimeInput.value) || 3;
        const targetSeconds = simTimeMins * 60;

        // Collect configured items
        const actives = activeSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, penChance, targetResources));
        const auxActives = auxActiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, penChance, targetResources));

        // Passives don't consume resources typically, so use 1 or max
        const elitePass = elitePassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, penChance, 5));
        const normPass = normalPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, penChance, 5));
        const auxPass = auxPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => getAbilityStats(a, cp, critChance, critPower, penChance, 5));

        const allActives = [...actives, ...auxActives];
        const allPassives = [...elitePass, ...normPass, ...auxPass];

        if (allActives.length === 0) {
            resTotalDps.textContent = "0";
            slotBreakdownContainer.innerHTML = "<em>No active abilities selected</em>";
            return;
        }

        // Validate Elite Actives (max 1)
        const eliteActives = actives.filter(a => a.type.includes("Elite"));
        if (eliteActives.length > 1) {
            resTotalDps.textContent = "Error: Too many Elite Actives";
            slotBreakdownContainer.innerHTML = `<em style="color: #ffaa55;">You can only select a maximum of 1 Elite Active ability. You have selected ${eliteActives.length}: ${eliteActives.map(a => a.name).join(', ')}.</em>`;
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

        // Track cooldown state
        const activeCooldowns = allActives.map(() => 0);
        const passiveCooldowns = allPassives.map(() => 0);

        const primWeapon = weaponSelect.value;
        const secWeapon = secondaryWeaponSelect.value;

        // Loop until time exceeds target
        while (time < targetSeconds) {
            let castSomething = false;

            // Iterate through actions in priority order (left-to-right UI order)
            for (let i = 0; i < allActives.length; i++) {
                const action = allActives[i];
                if (activeCooldowns[i] > 0) continue; // On cooldown

                // Requirement Check
                let canCast = true;
                const isPrim = action.weapon === primWeapon;
                const isSec = action.weapon === secWeapon;

                if (action.isConsumer) {
                    // Check if we have the target amount of resources
                    if (isPrim && primResources < targetResources) canCast = false;
                    if (isSec && secResources < targetResources) canCast = false;

                    // Simple logic for secondary weapons: if it's a secondary consumer and we don't have resources, 
                    // we might skip it or wait. For now, just enforce the check.
                }

                // Priority logic: if it's a builder and we have plenty of resources, 
                // and there are OTHER abilities (consumers/cooldowns) that might be ready soon, 
                // we should NOT cast the builder if it's in a lower slot? 
                // Actually, the simplest fix for starvation is: 
                // Builders should only be cast if nothing else can be cast.
                const isBuilder = !action.isConsumer && action.cooldown === 0;
                if (isBuilder) {
                    // Check if any NON-BUILDER is ready or will be ready before we can cast again
                    // But wait, builders build resources. We only skip builders if we are at MAX resources.
                    if (isPrim && primResources >= 5) canCast = false;
                    if (isSec && secResources >= 5) canCast = false;

                    // If we have resources but not at max, we still might want to build? 
                    // Actually, let's keep it simple: 
                    // 1. If it's a non-builder, and ready -> Cast.
                    // 2. If it's a builder, and we need resources -> Cast.
                }

                if (canCast) {
                    // 1. Execute Cast
                    totalDamage += action.avgDamage;
                    statsBreakdown[action.name].casts++;
                    statsBreakdown[action.name].damage += action.avgDamage;

                    const timeTaken = action.castTime; // Enforced min 1.0 earlier
                    time += timeTaken;
                    activeCooldowns[i] = action.cooldown;

                    // If it's a consumer, we force a 1.0s "pseudo-cooldown" or just rely on cast time
                    // In TSW, builders and consumers both take time. 
                    // Most are 1.0s. 

                    // 2. Resource Management
                    if (action.isConsumer) {
                        if (isPrim) primResources -= targetResources;
                        if (isSec) secResources -= targetResources;

                        if (primResources < 0) primResources = 0;
                        if (secResources < 0) secResources = 0;
                    } else {
                        // Builder generates 1 resource for both
                        if (action.tree !== "Aux") {
                            primResources = Math.min(5, primResources + 1);
                            if (secWeapon !== "None") {
                                secResources = Math.min(5, secResources + 1);
                            }
                        }
                    }

                    // 3. Proc Passives (Evaluate on every hit)
                    // Simplified: We assume 1 proc max per second, so we check if a passive can proc when we hit
                    // In TSW, passives trigger on crit/pen/hit. Without complex rng, we average out.
                    // For the "maximum once a second" rule, if cooldown > 0, it doesn't proc.
                    for (let p = 0; p < allPassives.length; p++) {
                        const passive = allPassives[p];
                        if (passiveCooldowns[p] <= 0) {
                            // Check if passive has subtype requirements
                            if (passive.triggerSubtypes.length > 0) {
                                if (!passive.triggerSubtypes.includes(action.subtype)) {
                                    continue; // Doesn't match
                                }
                            }

                            // Proc!
                            totalDamage += passive.avgDamage;
                            statsBreakdown[passive.name].casts++;
                            statsBreakdown[passive.name].damage += passive.avgDamage;

                            // Put passive on 1 second internal cooldown
                            passiveCooldowns[p] = 1.0;
                        }
                    }

                    // 4. Reduce Cooldowns
                    for (let j = 0; j < activeCooldowns.length; j++) {
                        activeCooldowns[j] -= timeTaken;
                    }
                    for (let j = 0; j < passiveCooldowns.length; j++) {
                        passiveCooldowns[j] -= timeTaken;
                    }

                    castSomething = true;
                    break; // Back to top priority
                }
            }

            // --- SECOND PASS: If nothing was cast, try builders ---
            if (!castSomething) {
                for (let i = 0; i < allActives.length; i++) {
                    const action = allActives[i];
                    if (activeCooldowns[i] > 0) continue;

                    const isBuilder = !action.isConsumer && action.cooldown === 0;
                    if (!isBuilder) continue;

                    const isPrim = action.weapon === primWeapon;
                    const isSec = action.weapon === secWeapon;

                    // Builders can always be cast as long as resources aren't maxed
                    let canBuild = false;
                    if (isPrim && primResources < 5) canBuild = true;
                    if (isSec && secResources < 5) canBuild = true;
                    if (action.weapon === "Aux") canBuild = true; // Aux weirdness

                    if (canBuild) {
                        totalDamage += action.avgDamage;
                        statsBreakdown[action.name].casts++;
                        statsBreakdown[action.name].damage += action.avgDamage;

                        const timeTaken = action.castTime;
                        time += timeTaken;
                        activeCooldowns[i] = action.cooldown;

                        // Resource Management
                        if (action.weapon !== "Aux") {
                            primResources = Math.min(5, primResources + 1);
                            if (secWeapon !== "None") {
                                secResources = Math.min(5, secResources + 1);
                            }
                        }

                        // Proc Passives 
                        for (let p = 0; p < allPassives.length; p++) {
                            const passive = allPassives[p];
                            if (passiveCooldowns[p] <= 0) {
                                // Check if passive has subtype requirements
                                if (passive.triggerSubtypes.length > 0) {
                                    if (!passive.triggerSubtypes.includes(action.subtype)) {
                                        continue; // Doesn't match
                                    }
                                }

                                totalDamage += passive.avgDamage;
                                statsBreakdown[passive.name].casts++;
                                statsBreakdown[passive.name].damage += passive.avgDamage;
                                passiveCooldowns[p] = 1.0;
                            }
                        }

                        // Reduce Cooldowns
                        for (let j = 0; j < activeCooldowns.length; j++) {
                            activeCooldowns[j] -= timeTaken;
                        }
                        for (let j = 0; j < passiveCooldowns.length; j++) {
                            passiveCooldowns[j] -= timeTaken;
                        }

                        castSomething = true;
                        break;
                    }
                }
            }

            // If we iterated all abilities and none could be cast (waiting on CDs/Resources)
            // advance time slightly to prevent infinite loop.
            // Usually occurs if you select only long-cooldown consumers without builders.
            if (!castSomething) {
                // Find next ability coming off CD, or default to 1 sec wait
                let minWait = 1.0;
                for (let c of activeCooldowns) {
                    if (c > 0 && c < minWait) minWait = c;
                }
                time += minWait;
                for (let j = 0; j < activeCooldowns.length; j++) {
                    activeCooldowns[j] -= minWait;
                }
                for (let j = 0; j < passiveCooldowns.length; j++) {
                    passiveCooldowns[j] -= minWait;
                }
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

    // Event Listeners
    weaponSelect.addEventListener('change', updateAbilityDropdowns);
    secondaryWeaponSelect.addEventListener('change', updateAbilityDropdowns);
    resourcesInput.addEventListener('input', calculate);
    simTimeInput.addEventListener('input', calculate);

    [cpInput, critChanceInput, critPowerInput, penChanceInput].forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Init
    initUI();
    updateAbilityDropdowns();
});
