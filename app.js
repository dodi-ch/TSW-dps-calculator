document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const cpInput = document.getElementById('combat-power');
    const attackRatingInput = document.getElementById('attack-rating');
    const weaponPowerInput = document.getElementById('weapon-power');
    const hitRatingInput = document.getElementById('hit-rating');
    const critChanceInput = document.getElementById('crit-chance');
    const critPowerInput = document.getElementById('crit-power');
    const penRatingInput = document.getElementById('pen-rating');
    const penChanceInput = document.getElementById('pen-chance');
    const targetEnemySelect = document.getElementById('target-enemy');
    const enemyStatsDisplay = document.getElementById('enemy-stats-display');

    const weaponSelect = document.getElementById('weapon-type');
    const secondaryWeaponSelect = document.getElementById('secondary-weapon-type');
    const auxWeaponSelect = document.getElementById('auxiliary-weapon-type');
    const simTimeInput = document.getElementById('simulation-time');
    const dustSignetCheckbox = document.getElementById('signet-dust');

    // list of auxiliary weapons we treat specially (should match data.js content)
    // there are five aux weapons in the game: chainsaw, flamethrower, quantum, rocket launcher and whip
    const AUX_WEAPONS = ["Rocket Launcher", "Chainsaw", "Quantum", "Flamethrower", "Whip"];

    const resTotalDps = document.getElementById('res-total-dps');
    const importBtn = document.getElementById('import-btn');
    const slotBreakdownContainer = document.getElementById('slot-breakdown-container');

    // Containers for dynamically generated select elements
    const activeContainer = document.getElementById('active-abilities-container');
    const auxActiveContainer = document.getElementById('aux-ability-container');
    const elitePassiveContainer = document.getElementById('elite-passive-container');
    const normalPassivesContainer = document.getElementById('normal-passives-container');
    const auxPassiveContainer = document.getElementById('aux-passive-container');

    // Dropdown arrays to keep track of them
    const activeSelects = [];       // 6 normal actives
    const eliteActiveSelects = [];  // 1 elite active
    const auxActiveSelects = [];
    const elitePassiveSelects = [];
    const normalPassiveSelects = [];
    const auxPassiveSelects = [];

    // --- ICON SYSTEM ---
    // Cache: ability name (lowercase) -> resolved local file URL or null
    const iconCache = new Map();

    function getLocalIconUrlForAbility(ability) {
        if (!ability || !ability.weapon || !ability.name) return null;
        const folder = ability.weapon === "Quantum" ? "Quantum Brace" : ability.weapon;
        const fileName = ability.icon || `${ability.name.toLowerCase()}.png`;
        return `ability_icons/${folder}/${fileName}`;
    }

    function getIconBox(wrapper) {
        return wrapper.querySelector('.slot-icon-box');
    }

    function setIconBoxState(box, state, url) {
        if (!box) return;
        if (state === 'empty') {
            box.classList.remove('has-icon');
            box.innerHTML = '<div class="slot-icon-placeholder"></div>';
        } else if (state === 'loading') {
            box.classList.remove('has-icon');
            box.innerHTML = '<div class="slot-icon-loading"></div>';
        } else if (state === 'loaded' && url) {
            box.classList.add('has-icon');
            box.innerHTML = `<img src="${url}" alt="" draggable="false" />`;
        }
    }

    function updateSlotIcon(select, wrapper) {
        const box = getIconBox(wrapper);
        if (!select.value || !tswData[select.value]) {
            setIconBoxState(box, 'empty');
            return;
        }
        const ability = tswData[select.value];
        const key = ability.name.toLowerCase();
        let url = iconCache.get(key);
        if (!url) {
            url = getLocalIconUrlForAbility(ability);
            if (url) iconCache.set(key, url);
        }
        setIconBoxState(box, url ? 'loaded' : 'empty', url);
    }

    // Custom dropdown rendering (icons inside list, text to the right)
    function updateCustomDropdownForSelect(select, filteredData, emptyLabel) {
        const wrapper = select.closest('.slot-wrapper');
        if (!wrapper) return;

        const display = wrapper.querySelector('.ability-dropdown-display');
        const list = wrapper.querySelector('.ability-dropdown-list');
        if (!display || !list) return;

        const currentVal = select.value;
        const currentAbility = tswData[currentVal];
        display.textContent = currentAbility ? currentAbility.name : emptyLabel;

        list.innerHTML = '';

        filteredData.forEach(ability => {
            const globalIndex = tswData.indexOf(ability);
            const item = document.createElement('div');
            item.className = 'ability-dropdown-item';

            const iconUrl = getLocalIconUrlForAbility(ability);
            if (iconUrl) {
                const img = document.createElement('img');
                img.src = iconUrl;
                img.alt = '';
                img.draggable = false;
                item.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'ability-dropdown-item-noicon';
                item.appendChild(placeholder);
            }

            const nameSpan = document.createElement('span');
            nameSpan.textContent = ability.name;
            item.appendChild(nameSpan);

            item.addEventListener('click', () => {
                select.value = String(globalIndex);
                select.dispatchEvent(new Event('change'));
                display.textContent = ability.name;
                list.style.display = 'none';
            });

            list.appendChild(item);
        });
    }

    // Initialize all the UI elements
    function initUI() {
        function createOrderInput(select, defaultOrder) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '10';
            input.step = '1';
            input.className = 'slot-order-input';
            input.value = String(defaultOrder);
            input.placeholder = '1';
            input.title = 'Priority: 1 = builder (casts first), 2+ = consumers';
            select.dataset.order = String(defaultOrder);
            input.addEventListener('input', () => {
                const val = parseFloat(input.value);
                if (!isNaN(val) && val > 0) {
                    select.dataset.order = String(val);
                    calculate();
                }
            });
            return input;
        }
        
        function createMinResourcesInput(select, defaultMin) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = '5';
            input.step = '1';
            input.className = 'slot-min-resources-input';
            input.value = String(defaultMin);
            input.placeholder = '0';
            input.title = 'Min Resources: Ability only fires when you have at least this many resources built';
            select.dataset.minResources = String(defaultMin);
            input.addEventListener('input', () => {
                const val = parseInt(input.value);
                if (!isNaN(val) && val >= 0 && val <= 5) {
                    select.dataset.minResources = String(val);
                    calculate();
                }
            });
            return input;
        }
        // Active Abilities (6 normal slots)
        for (let i = 1; i <= 6; i++) {
            const select = document.createElement('select');
            select.id = `active-ability-${i}`;

            const wrapper = document.createElement('div');
            wrapper.className = 'slot-wrapper';

            const iconBox = document.createElement('div');
            iconBox.className = 'slot-icon-box';
            iconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';

            wrapper.innerHTML = `<span class="slot-label">Priority</span>`;
            wrapper.appendChild(iconBox);

            const orderInput = createOrderInput(select, i);
            wrapper.appendChild(orderInput);

            const minResLabel = document.createElement('span');
            minResLabel.className = 'slot-min-res-label';
            minResLabel.textContent = 'Min Res';
            minResLabel.title = 'Minimum resources required before this ability can fire';
            wrapper.appendChild(minResLabel);

            const minResInput = createMinResourcesInput(select, 0);
            wrapper.appendChild(minResInput);

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'ability-search-input';
            searchInput.placeholder = 'Search...';
            searchInput.addEventListener('input', () => {
                select.dataset.searchTerm = searchInput.value;
                updateAbilityDropdowns();
            });
            wrapper.appendChild(searchInput);

            const display = document.createElement('div');
            display.className = 'ability-dropdown-display';
            display.textContent = '-- None --';
            wrapper.appendChild(display);

            const list = document.createElement('div');
            list.className = 'ability-dropdown-list';
            wrapper.appendChild(list);

            display.addEventListener('click', () => {
                list.style.display = list.style.display === 'block' ? 'none' : 'block';
            });

            wrapper.appendChild(select);
            select.style.display = 'none';
            activeContainer.appendChild(wrapper);

            select.addEventListener('change', () => {
                updateSlotIcon(select, wrapper);
                calculate();
            });
            activeSelects.push(select);
        }

        // Elite Active (1 dedicated slot)
        const eliteActiveWrapper = document.createElement('div');
        eliteActiveWrapper.className = 'slot-wrapper';
        const eliteActiveIconBox = document.createElement('div');
        eliteActiveIconBox.className = 'slot-icon-box';
        eliteActiveIconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';
        eliteActiveWrapper.innerHTML = '<span class="slot-label">Priority</span>';
        eliteActiveWrapper.appendChild(eliteActiveIconBox);
        const eliteActiveSelect = document.createElement('select');
        eliteActiveSelect.id = 'elite-active-1';
        const eliteOrderInput = createOrderInput(eliteActiveSelect, 7);
        eliteOrderInput.title = 'Priority: 7 = after main abilities (default)';
        eliteActiveWrapper.appendChild(eliteOrderInput);
        const eliteMinResLabel = document.createElement('span');
        eliteMinResLabel.className = 'slot-min-res-label';
        eliteMinResLabel.textContent = 'Min Res';
        eliteMinResLabel.title = 'Minimum resources required before this ability can fire';
        eliteActiveWrapper.appendChild(eliteMinResLabel);
        const eliteMinResInput = createMinResourcesInput(eliteActiveSelect, 0);
        eliteActiveWrapper.appendChild(eliteMinResInput);
        const eliteActiveSearchInput = document.createElement('input');
        eliteActiveSearchInput.type = 'text';
        eliteActiveSearchInput.className = 'ability-search-input';
        eliteActiveSearchInput.placeholder = 'Search...';
        eliteActiveSearchInput.addEventListener('input', () => {
            eliteActiveSelect.dataset.searchTerm = eliteActiveSearchInput.value;
            updateAbilityDropdowns();
        });
        eliteActiveWrapper.appendChild(eliteActiveSearchInput);
        const eliteActiveDisplay = document.createElement('div');
        eliteActiveDisplay.className = 'ability-dropdown-display';
        eliteActiveDisplay.textContent = '-- None --';
        eliteActiveWrapper.appendChild(eliteActiveDisplay);
        const eliteActiveList = document.createElement('div');
        eliteActiveList.className = 'ability-dropdown-list';
        eliteActiveWrapper.appendChild(eliteActiveList);
        eliteActiveDisplay.addEventListener('click', () => {
            eliteActiveList.style.display = eliteActiveList.style.display === 'block' ? 'none' : 'block';
        });
        eliteActiveWrapper.appendChild(eliteActiveSelect);
        eliteActiveSelect.style.display = 'none';
        activeContainer.appendChild(eliteActiveWrapper);
        eliteActiveSelect.addEventListener('change', () => {
            updateSlotIcon(eliteActiveSelect, eliteActiveWrapper);
            calculate();
        });
        eliteActiveSelects.push(eliteActiveSelect);

        // Aux Active (1 slot)
        const auxWrapper = document.createElement('div');
        auxWrapper.className = 'slot-wrapper';
        const auxIconBox = document.createElement('div');
        auxIconBox.className = 'slot-icon-box';
        auxIconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';
        auxWrapper.innerHTML = '<span class="slot-label">Aux</span>';
        auxWrapper.appendChild(auxIconBox);
        const auxSelect = document.createElement('select');
        auxSelect.id = `aux-active-1`;
        const auxOrderInput = createOrderInput(auxSelect, 8);
        auxWrapper.appendChild(auxOrderInput);
        const auxSearchInput = document.createElement('input');
        auxSearchInput.type = 'text';
        auxSearchInput.className = 'ability-search-input';
        auxSearchInput.placeholder = 'Search...';
        auxSearchInput.addEventListener('input', () => {
            auxSelect.dataset.searchTerm = auxSearchInput.value;
            updateAbilityDropdowns();
        });
        auxWrapper.appendChild(auxSearchInput);

        const auxDisplay = document.createElement('div');
        auxDisplay.className = 'ability-dropdown-display';
        auxDisplay.textContent = '-- None --';
        auxWrapper.appendChild(auxDisplay);

        const auxList = document.createElement('div');
        auxList.className = 'ability-dropdown-list';
        auxWrapper.appendChild(auxList);

        auxDisplay.addEventListener('click', () => {
            auxList.style.display = auxList.style.display === 'block' ? 'none' : 'block';
        });

        auxWrapper.appendChild(auxSelect);
        auxSelect.style.display = 'none';
        auxActiveContainer.appendChild(auxWrapper);
        auxSelect.addEventListener('change', () => {
            updateSlotIcon(auxSelect, auxWrapper);
            calculate();
        });
        auxActiveSelects.push(auxSelect);

        // Elite Passive (1 slot)
        const eliteWrapper = document.createElement('div');
        eliteWrapper.className = 'slot-wrapper';
        const eliteIconBox = document.createElement('div');
        eliteIconBox.className = 'slot-icon-box';
        eliteIconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';
        eliteWrapper.innerHTML = '<span class="slot-label">Elite</span>';
        eliteWrapper.appendChild(eliteIconBox);
        const eliteSelect = document.createElement('select');
        eliteSelect.id = `elite-passive-1`;
        const eliteSearchInput = document.createElement('input');
        eliteSearchInput.type = 'text';
        eliteSearchInput.className = 'ability-search-input';
        eliteSearchInput.placeholder = 'Search...';
        eliteSearchInput.addEventListener('input', () => {
            eliteSelect.dataset.searchTerm = eliteSearchInput.value;
            updateAbilityDropdowns();
        });
        eliteWrapper.appendChild(eliteSearchInput);

        const eliteDisplay = document.createElement('div');
        eliteDisplay.className = 'ability-dropdown-display';
        eliteDisplay.textContent = '-- None --';
        eliteWrapper.appendChild(eliteDisplay);

        const eliteList = document.createElement('div');
        eliteList.className = 'ability-dropdown-list';
        eliteWrapper.appendChild(eliteList);

        eliteDisplay.addEventListener('click', () => {
            eliteList.style.display = eliteList.style.display === 'block' ? 'none' : 'block';
        });

        eliteWrapper.appendChild(eliteSelect);
        eliteSelect.style.display = 'none';
        elitePassiveContainer.appendChild(eliteWrapper);
        eliteSelect.addEventListener('change', () => {
            updateSlotIcon(eliteSelect, eliteWrapper);
            calculate();
        });
        elitePassiveSelects.push(eliteSelect);

        // Normal Passives (6 slots)
        for (let i = 1; i <= 6; i++) {
            const select = document.createElement('select');
            select.id = `normal-passive-${i}`;

            const wrapper = document.createElement('div');
            wrapper.className = 'slot-wrapper';

            const iconBox = document.createElement('div');
            iconBox.className = 'slot-icon-box';
            iconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';

            wrapper.innerHTML = `<span class="slot-label">${i}</span>`;
            wrapper.appendChild(iconBox);

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'ability-search-input';
            searchInput.placeholder = 'Search...';
            searchInput.addEventListener('input', () => {
                select.dataset.searchTerm = searchInput.value;
                updateAbilityDropdowns();
            });
            wrapper.appendChild(searchInput);

            const display = document.createElement('div');
            display.className = 'ability-dropdown-display';
            display.textContent = '-- None --';
            wrapper.appendChild(display);

            const list = document.createElement('div');
            list.className = 'ability-dropdown-list';
            wrapper.appendChild(list);

            display.addEventListener('click', () => {
                list.style.display = list.style.display === 'block' ? 'none' : 'block';
            });

            wrapper.appendChild(select);
            select.style.display = 'none';
            normalPassivesContainer.appendChild(wrapper);

            select.addEventListener('change', () => {
                updateSlotIcon(select, wrapper);
                calculate();
            });
            normalPassiveSelects.push(select);
        }

        // Aux Passive (1 slot)
        const auxPassWrapper = document.createElement('div');
        auxPassWrapper.className = 'slot-wrapper';
        const auxPassIconBox = document.createElement('div');
        auxPassIconBox.className = 'slot-icon-box';
        auxPassIconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';
        auxPassWrapper.innerHTML = '<span class="slot-label">Aux</span>';
        auxPassWrapper.appendChild(auxPassIconBox);
        const auxPassSelect = document.createElement('select');
        auxPassSelect.id = `aux-passive-1`;
        const auxPassSearchInput = document.createElement('input');
        auxPassSearchInput.type = 'text';
        auxPassSearchInput.className = 'ability-search-input';
        auxPassSearchInput.placeholder = 'Search...';
        auxPassSearchInput.addEventListener('input', () => {
            auxPassSelect.dataset.searchTerm = auxPassSearchInput.value;
            updateAbilityDropdowns();
        });
        auxPassWrapper.appendChild(auxPassSearchInput);

        const auxPassDisplay = document.createElement('div');
        auxPassDisplay.className = 'ability-dropdown-display';
        auxPassDisplay.textContent = '-- None --';
        auxPassWrapper.appendChild(auxPassDisplay);

        const auxPassList = document.createElement('div');
        auxPassList.className = 'ability-dropdown-list';
        auxPassWrapper.appendChild(auxPassList);

        auxPassDisplay.addEventListener('click', () => {
            auxPassList.style.display = auxPassList.style.display === 'block' ? 'none' : 'block';
        });

        auxPassWrapper.appendChild(auxPassSelect);
        auxPassSelect.style.display = 'none';
        auxPassiveContainer.appendChild(auxPassWrapper);
        auxPassSelect.addEventListener('change', () => {
            updateSlotIcon(auxPassSelect, auxPassWrapper);
            calculate();
        });
        auxPassiveSelects.push(auxPassSelect);
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
        // Exclude placeholders
        if (!w || w === "Aux" || w === "Anima Deviations") return;

        // auxiliary weapons get their own dropdown
        if (AUX_WEAPONS.includes(w)) {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            auxWeaponSelect.appendChild(opt);
            return;
        }

        const option1 = document.createElement('option');
        option1.value = w;
        option1.textContent = w;
        weaponSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = w;
        option2.textContent = w;
        secondaryWeaponSelect.appendChild(option2);
    });

    auxWeaponSelect.value = "";

    // Filtering Helpers
    function populateDropdowns(selectElements, filterFn, emptyLabel = "-- None --") {
        const baseData = tswData.filter(filterFn).sort((a, b) => a.name.localeCompare(b.name));

        selectElements.forEach(select => {
            // save current selection to attempt to restore it
            const currentVal = select.value;
            const searchTerm = (select.dataset.searchTerm || "").toLowerCase();

            const filteredData = searchTerm
                ? baseData.filter(a => a.name.toLowerCase().includes(searchTerm))
                : baseData;

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

            // Update custom dropdown UI (icons + text list)
            updateCustomDropdownForSelect(select, filteredData, emptyLabel);
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

        // Normal actives: Active (or no type) but NOT Elite, NOT Auxiliary
        populateDropdowns(
            activeSelects,
            a => isSelectedWeapon(a.weapon) &&
                (getType(a).includes("Active") || getType(a) === "") &&
                !getType(a).includes("Elite") &&
                !AUX_WEAPONS.includes(a.weapon)
        );

        // Elite active: Active + Elite, NOT Auxiliary
        populateDropdowns(
            eliteActiveSelects,
            a => isSelectedWeapon(a.weapon) &&
                getType(a).includes("Active") &&
                getType(a).includes("Elite") &&
                !AUX_WEAPONS.includes(a.weapon)
        );

        // Aux Actives: Filter by the selected auxiliary weapon (or show all)
        const selectedAux = auxWeaponSelect.value; // empty string means no filter
        populateDropdowns(auxActiveSelects, a =>
            AUX_WEAPONS.includes(a.weapon) &&
            (!selectedAux || a.weapon === selectedAux) &&
            getType(a).includes("Active")
        );

        // Elite Passives: Any weapon (regardless of selection), type contains Elite and Passive
        populateDropdowns(elitePassiveSelects, a => getType(a).includes("Elite") && getType(a).includes("Passive"));

        // Normal Passives: Any weapon (regardless of selection), type contains Passive, NOT Elite, NOT Auxiliary
        populateDropdowns(normalPassiveSelects, a => getType(a).includes("Passive") && !getType(a).includes("Elite") && !AUX_WEAPONS.includes(a.weapon));

        // Aux Passives: analogous filtering
        populateDropdowns(auxPassiveSelects, a =>
            AUX_WEAPONS.includes(a.weapon) &&
            (!selectedAux || a.weapon === selectedAux) &&
            getType(a).includes("Passive")
        );

        calculate();
    }

    // Mathematical Helpers
    function getAbilityStats(ability, cp, critChance, critPower, penChance, resourcesUsed) {
        if (!ability) return null;

        const desc = ability.description || "";

        // --- Resource usage semantics ---
        // Some abilities require a fixed number of resources but their damage
        // does NOT scale with additional resources. Others explicitly say
        // "based on the number of resources consumed". We derive simple flags
        // from the description so the simulation can treat them correctly.
        let resourceRequirement = 0;
        let resourceConsumption = 0;
        let damageScalesWithResources = false;

        // Detect explicit "Consumes X <Weapon> Resources" (fixed consumption)
        const fixedConsumeMatch = desc.match(/Consumes?\s+(\d+)\s+\w+\s+Resources?/i);
        if (fixedConsumeMatch) {
            resourceRequirement = parseInt(fixedConsumeMatch[1], 10) || 0;
            resourceConsumption = resourceRequirement; // Fixed amount consumed
        }

        // Detect "Consumes all <Weapon> Resources" (variable consumption)
        if (/Consumes all\s+\w+\s+Resources?/i.test(desc)) {
            // Treat "all" as "whatever the user configured" (resourcesUsed)
            resourceRequirement = 1; // Need at least 1 resource to cast
            resourceConsumption = resourcesUsed || 5; // Consume all available resources
        }

        // Detect that damage/heal output actually scales with resources
        if (/based on the number of resources consumed/i.test(desc) ||
            /Damage scales based on the number of resources consumed/i.test(desc)) {
            damageScalesWithResources = true;
        }

        // If this ability has a fixed requirement but no text indicating
        // that damage scales with resources, clamp the effective resources
        // used to that requirement so damage doesn't change with the slider.
        let effectiveResources = resourcesUsed;
        if (resourceConsumption > 0 && !damageScalesWithResources) {
            effectiveResources = resourceConsumption;
        }

        // --- Scaling selection ---
        let scalingToUse = ability.scaling || 0;
        if (ability.scaling_5 > 0 && ability.scaling_1 > 0) {
            scalingToUse = ability.scaling_1 + ((effectiveResources - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
        } else if (ability.scaling_5 > 0 && effectiveResources === 5) {
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

        // Extraction of trigger interval (e.g., "every second X ability" or "every 2nd hit")
        let triggerInterval = 1;
        const intervalMatch = desc.match(/every\s+(second|third|fourth|fifth)?\s*(\d+)?\s*(st|nd|rd|th)?\s*(hit|ability|attack)/i);
        if (intervalMatch) {
            const numWords = { 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5 };
            const numStr = intervalMatch[2];
            if (numStr) {
                triggerInterval = parseInt(numStr) || 1;
            } else {
                triggerInterval = numWords[intervalMatch[1]] || 1;
            }
        }

        // Extraction of counter threshold (e.g., "once you reach 5 counters", "when the counter reaches 6")
        let counterThreshold = 0;
        let counterTriggerCondition = ""; // What triggers the counter to build (hit, penetrate, etc.)
        let counterResetCondition = ""; // What happens when counter triggers
        let hasCounterCooldown = false;
        let counterCooldownTime = 0;
        
        // Check for counter-based passives - more comprehensive regex
        const counterMatch = desc.match(/counter.*?(\d+)|reaches.*?(\d+)|reach.*?(\d+)/i);
        if (counterMatch) {
            counterThreshold = parseInt(counterMatch[1] || counterMatch[2] || counterMatch[3]);
            triggerInterval = counterThreshold;
            
            // Extract trigger condition (what builds the counter)
            if (desc.includes("penetrate")) {
                counterTriggerCondition = "penetrate";
            } else if (desc.includes("hit")) {
                counterTriggerCondition = "hit";
            } else if (desc.includes("leech ability")) {
                counterTriggerCondition = "leech";
            } else if (desc.includes("finish activating")) {
                counterTriggerCondition = "finish_activating";
            }
            
            // Check for internal cooldown on counter trigger
            const cooldownMatch = desc.match(/internal recharge time of (\d+)\s*seconds?/i);
            if (cooldownMatch) {
                hasCounterCooldown = true;
                counterCooldownTime = parseInt(cooldownMatch[1]);
            }
        }

        // Extraction of duration and interval for entities (turrets, manifestations, drones)
        let duration = 0;
        let tickInterval = 0;

        // Debuff condition parsing - what debuffs are required for this ability
        let requiredDebuffs = [];
        let bonusDamageWithDebuffs = false;
        
        // Check if ability requires specific debuffs
        if (desc.includes("if the target is Afflicted")) {
            requiredDebuffs.push("afflicted");
            bonusDamageWithDebuffs = true;
        }
        if (desc.includes("if the target is Weakened")) {
            requiredDebuffs.push("weakened");
            bonusDamageWithDebuffs = true;
        }
        if (desc.includes("if the target is Hindered")) {
            requiredDebuffs.push("hindered");
            bonusDamageWithDebuffs = true;
        }
        if (desc.includes("if the target is Impaired")) {
            requiredDebuffs.push("impaired");
            bonusDamageWithDebuffs = true;
        }
        
        // Check for bonus damage against debuffed targets (e.g., "or X damage to targets that are Weakened")
        const bonusDamageMatch = desc.match(/or\s+(\d+)\s*[-–]?\s*\d*\s*(?:physical|magical)?\s*damage\s+to\s+targets\s+that\s+are\s+(\w+)/i);
        if (bonusDamageMatch) {
            const debuffType = bonusDamageMatch[2].toLowerCase();
            if (["afflicted", "weakened", "hindered", "impaired"].includes(debuffType)) {
                requiredDebuffs.push(debuffType);
                bonusDamageWithDebuffs = true;
            }
        }
        
        // Check what debuffs this ability applies
        let appliedDebuffs = [];
        let appliedDebuffDurations = {};
        
        if (desc.includes("become Afflicted")) {
            appliedDebuffs.push("afflicted");
            // Extract duration for affliction
            const afflictDurationMatch = desc.match(/(\d+)\s*(?:physical|magical)?\s*damage\s+every\s+second\s+for\s+(\d+)\s+seconds/i);
            if (afflictDurationMatch) {
                appliedDebuffDurations.afflicted = parseInt(afflictDurationMatch[2]);
            } else {
                appliedDebuffDurations.afflicted = 5; // Default duration
            }
        }
        
        if (desc.includes("become Weakened")) {
            appliedDebuffs.push("weakened");
            appliedDebuffDurations.weakened = 10; // Default for weakened
        }
        
        if (desc.includes("become Hindered")) {
            appliedDebuffs.push("hindered");
            // Extract duration for hindered
            const hinderDurationMatch = desc.match(/reduced\s+by\s+\d+%?\s+for\s+(\d+)\s+seconds/i);
            if (hinderDurationMatch) {
                appliedDebuffDurations.hindered = parseInt(hinderDurationMatch[1]);
            } else {
                appliedDebuffDurations.hindered = 4; // Default duration
            }
        }
        
        if (desc.includes("become Impaired")) {
            appliedDebuffs.push("impaired");
            appliedDebuffDurations.impaired = 3; // Default for impaired
        }

        // Regex for "for X seconds" or "lasting X seconds"
        const durationMatch = desc.match(/(?:for|lasting)\s+(\d+(?:\.\d+)?)\s+seconds/i);
        if (durationMatch) {
            duration = parseFloat(durationMatch[1]);
        }

        // Regex for "every X seconds" or "per X seconds"
        const secondsIntervalMatch = desc.match(/(?:every|per)\s+(\d+(?:\.\d+)?)\s+seconds/i);
        if (secondsIntervalMatch) {
            tickInterval = parseFloat(secondsIntervalMatch[1]);
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
            triggerInterval,
            duration,
            tickInterval,
            scalingToUse,
            resourceRequirement,
            damageScalesWithResources,
            isManifestation: ability.name.toLowerCase().includes("manifestation"),
            counterThreshold,
            counterTriggerCondition,
            counterResetCondition,
            hasCounterCooldown,
            counterCooldownTime,
            requiredDebuffs,
            bonusDamageWithDebuffs,
            appliedDebuffs,
            appliedDebuffDurations,
            resourceConsumption,
            originalAbility: ability
        };
    }

    function calculate() {
        const cp = parseFloat(cpInput.value) || 0;
        const hitRatingGlobal = parseFloat(hitRatingInput.value) || 0;
        const critChanceGlobal = parseFloat(critChanceInput.value) || 0;
        const critPowerGlobal = parseFloat(critPowerInput.value) || 0;
        const penChanceGlobal = parseFloat(penChanceInput.value) || 0;
        const simTimeMins = parseFloat(simTimeInput.value) || 3;
        const targetSeconds = simTimeMins * 60;

        // Update global toggle for Dust of the Black Pharaoh
        if (dustSignetCheckbox) {
            window._dustSignetActive = !!dustSignetCheckbox.checked;
        }

        // Helper: given a weapon name, return the effective ratings & derived stats
        // taking into account that weapon-specific glyph ratings only affect that weapon.
        function getStatsForWeapon(weaponName) {
            const pools = window._weaponRatingPools;

            if (!pools || !weaponName) {
                return {
                    hitRating: hitRatingGlobal,
                    critChance: critChanceGlobal,
                    critPower: critPowerGlobal,
                    penRating: parseFloat(penRatingInput.value) || 0,
                    penChance: penChanceGlobal
                };
            }

            const base = pools.base || { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };
            const w1 = (pools.weapon1Name === weaponName) ? (pools.weapon1 || {}) : {};
            const w2 = (pools.weapon2Name === weaponName) ? (pools.weapon2 || {}) : {};

            const totalCritRating = (base.critRating || 0) + (w1.critRating || 0) + (w2.critRating || 0);
            const totalCritPowerRating = (base.critPowerRating || 0) + (w1.critPowerRating || 0) + (w2.critPowerRating || 0);
            const totalPenRating = (base.penRating || 0) + (w1.penRating || 0) + (w2.penRating || 0);
            const totalHitRating = (base.hitRating || 0) + (w1.hitRating || 0) + (w2.hitRating || 0);

            // Use the same formulas as the importer for rating -> % conversions
            const critChance = 55.14 - (100.3 / (Math.pow(Math.E, (totalCritRating / 790.3)) + 1));
            const sBonus = window._signetBonuses || { subtype: {}, weapon: {}, critPowerPct: 0 };
            const critPower = Math.sqrt(5 * totalCritPowerRating + 625) + (sBonus.critPowerPct || 0);

            return {
                hitRating: totalHitRating,
                critChance,
                critPower,
                penRating: totalPenRating,
                penChance: penChanceGlobal
            };
        }

        function collectActivesWithOrder(selects, resourcesForActives) {
            return selects
                .map(sel => {
                    const ability = tswData[sel.value];
                    if (!ability) return null;
                    const wStats = getStatsForWeapon(ability.weapon);
                    const stats = getAbilityStats(ability, cp, wStats.critChance, wStats.critPower, wStats.penChance, resourcesForActives);
                    const orderVal = parseFloat(sel.dataset.order || '');
                    stats.orderPriority = !isNaN(orderVal) && orderVal > 0 ? orderVal : 0;
                    const minResVal = parseInt(sel.dataset.minResources || '0');
                    stats.minResources = !isNaN(minResVal) ? minResVal : 0;
                    return stats;
                })
                .filter(Boolean);
        }

        const actives = collectActivesWithOrder(activeSelects, 0);
        const eliteActives = collectActivesWithOrder(eliteActiveSelects, 0);
        const auxActives = collectActivesWithOrder(auxActiveSelects, 0);
        
        console.log("Actives breakdown:", {
            normal: actives.map(a => a.name),
            elite: eliteActives.map(a => a.name),
            aux: auxActives.map(a => a.name)
        });
        const elitePass = elitePassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => {
            const wStats = getStatsForWeapon(a.weapon);
            return getAbilityStats(a, cp, wStats.critChance, wStats.critPower, wStats.penChance, 5);
        });
        const normPass = normalPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => {
            const wStats = getStatsForWeapon(a.weapon);
            return getAbilityStats(a, cp, wStats.critChance, wStats.critPower, wStats.penChance, 5);
        });
        const auxPass = auxPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => {
            const wStats = getStatsForWeapon(a.weapon);
            return getAbilityStats(a, cp, wStats.critChance, wStats.critPower, wStats.penChance, 5);
        });

        let allActives = [...actives, ...eliteActives, ...auxActives];
        allActives.sort((a, b) => (a.orderPriority || 0) - (b.orderPriority || 0));
        const allPassives = [...elitePass, ...normPass, ...auxPass];

        // Debug logging
        console.log("Selected actives:", allActives.map(a => a.name));
        console.log("allActives length:", allActives.length);
        allActives.forEach((a, i) => {
            console.log(`  [${i}] ${a.name} - weapon=${a.weapon}, isConsumer=${a.isConsumer}, cooldown=${a.cooldown}`);
        });

        if (allActives.length === 0) {
            resTotalDps.textContent = "0";
            slotBreakdownContainer.innerHTML = "<em>No active abilities selected</em>";
            return;
        }

        if (eliteActives.length > 1) {
            resTotalDps.textContent = "Error: Too many Elite Actives";
            slotBreakdownContainer.innerHTML = `<em style="color: #ffaa55;">Only 1 Elite Active ability may be equipped. Clear the extra one.</em>`;
            return;
        }

        const elitePassives = allPassives.filter(a => a.type.includes("Elite"));
        if (elitePassives.length > 1) {
            resTotalDps.textContent = "Error: Too many Elite Passives";
            slotBreakdownContainer.innerHTML = `<em style="color: #ffaa55;">Only 1 Elite Passive ability may be equipped. Clear the extra one.</em>`;
            return;
        }

        // --- SIMULATION ENGINE ---
        let time = 0;
        let primResources = 0;
        let secResources = 0;
        let totalDamage = 0;

        const statsBreakdown = {};
        [...allActives, ...allPassives].forEach((a, index) => {
            const key = index < allActives.length ? `active_${index}_${a.name}` : `passive_${index - allActives.length}_${a.name}`;
            statsBreakdown[key] = { damage: 0, casts: 0, displayName: a.name };
        });
        // Pre-create a separate line for Dust of the Black Pharaoh procs
        const DUST_NAME = 'Dust of the Black Pharaoh (Proc)';
        statsBreakdown[DUST_NAME] = { damage: 0, casts: 0 };
        const ELE_OVERLOAD_NAME = 'Elemental Overload (Proc)';
        statsBreakdown[ELE_OVERLOAD_NAME] = { damage: 0, casts: 0 };

        const activeCooldowns = allActives.map(() => 0);
        const passiveCooldowns = allPassives.map(() => 0);
        const passiveHitCounters = allPassives.map(() => 0);
        // Enhanced counter tracking for threshold-based passives
        const passiveCounters = allPassives.map(() => 0); // Current counter value
        const passiveCounterCooldowns = allPassives.map(() => 0); // Cooldown after counter trigger
        
        // Enemy debuff tracking system
        const enemyDebuffs = {
            afflicted: false,
            weakened: false,
            hindered: false,
            impaired: false,
            // Debuffs with durations
            afflictedDuration: 0,
            weakenedDuration: 0,
            hinderedDuration: 0,
            impairedDuration: 0
        };
        
        let activeEffects = [];

        let moltenSteelCheckCount = 0;

        const primWeapon = weaponSelect.value;
        const secWeapon = secondaryWeaponSelect.value;
        
        console.log("Simulation starting with weapons:", { primWeapon, secWeapon });
        
        const hasElementalWeapon = (primWeapon === 'Elementalism' || secWeapon === 'Elementalism');
        const hasBladeWeapon = (primWeapon === 'Blade' || secWeapon === 'Blade');
        const enemy = ENEMIES[targetEnemySelect.value] || ENEMIES['training-puppet'];
        const POWER_LINE_NAME = "Power Line-Voltaic Detonation";
        // previous tether state tracking is no longer needed when we auto‑detonate
        let elementalFuryEndTime = 0;

        function performAttack(ability, weaponForStats, debuffState = {}) {
            // Deterministic Combat Logic
            const stats = getStatsForWeapon(weaponForStats || ability.weapon);
            const hitRating = stats.hitRating;
            const penRating = stats.penRating;
            const penChance = stats.penChance;
            const critChance = stats.critChance;
            const critPower = stats.critPower;
            const hasElementalWeapon = (primWeapon === 'Elementalism' || secWeapon === 'Elementalism');
            let damageMult = 1.0;
            const isEvaded = enemy.evadeRating > hitRating;
            const isGlanced = !isEvaded && enemy.defenseRating > hitRating;
            const guaranteedPen = penRating > enemy.blockRating;
            const randomPen = Math.random() < (penChance / 100);
            const isPenetrated = guaranteedPen || randomPen;

            if (isEvaded) {
                damageMult = 0;
            } else {
                if (isGlanced) damageMult *= 0.5;
                if (isPenetrated) damageMult *= 1.5;
            }

            // Crit check (Probabilistic)
            const isCrit = Math.random() < (critChance / 100);
            const finalMult = (isCrit ? (1 + critPower / 100) : 1.0) * damageMult;

            // Signet % bonuses: apply global, subtype (e.g. Strike +4.5%) and weapon-type (e.g. Blade +3%)
            const sBonus = window._signetBonuses || { subtype: {}, weapon: {}, critPowerPct: 0, globalDmgPct: 0 };
            let signetMult = 1.0;
            if (sBonus.globalDmgPct) {
                signetMult += sBonus.globalDmgPct / 100;
            }
            if (ability.subtype && sBonus.subtype[ability.subtype]) {
                signetMult += sBonus.subtype[ability.subtype] / 100;
            }
            if (ability.weapon && sBonus.weapon[ability.weapon]) {
                signetMult += sBonus.weapon[ability.weapon] / 100;
            }

            // Special handling for Power Line-Voltaic Detonation: assume the player
            // always follows up with the detonation after 9s, i.e. the ability is
            // effectively a single cast that does both the tether ticks and the
            // max‑stack explosion. CP is assumed non‑zero.
            let rawBaseDmg;
            if (ability.name === POWER_LINE_NAME) {
                const cpFactor = (cp > 0 ? cp / 1000 : 1);
                const tetherDamage = 14 * 10;            // ten ticks worth
                const detonationBase = 226 * 3;          // 3x base at 10 stacks
                rawBaseDmg = tetherDamage + detonationBase * cpFactor;
            } else {
                // Use scaling * cp for base damage
                rawBaseDmg = (ability.scalingToUse || 0) * cp;
            }

            // Elemental Fury Proc: When any Elemental Manifestation ability deals damage, you deal 7.5% more damage for 5 seconds.
            // Requires an equipped Elementalism Focus.
            if (hasElementalWeapon && ability.isManifestation && ability.weapon === 'Elementalism') {
                elementalFuryEndTime = time + 5.0;
            }

            // Apply Elemental Fury buff if active
            const eleFuryMult = (hasElementalWeapon && time <= elementalFuryEndTime) ? 1.075 : 1.0;

            // Apply debuff-based damage bonuses
            let debuffDamageMult = 1.0;
            if (ability.bonusDamageWithDebuffs && ability.requiredDebuffs.length > 0) {
                // Check if required debuffs are active
                const allDebuffsActive = ability.requiredDebuffs.every(debuff => debuffState[debuff]);
                if (allDebuffsActive) {
                    // Extract bonus damage from description (this is a simplified approach)
                    // In a full implementation, we'd parse the exact bonus values
                    debuffDamageMult = 1.2; // 20% bonus as an example
                    console.log(`${ability.name} gets debuff bonus damage (x${debuffDamageMult})`);
                }
            }

            const actualDmg = rawBaseDmg * finalMult * signetMult * eleFuryMult * debuffDamageMult;

            // Dust of the Black Pharaoh: whenever you critically hit,
            // you have a 20% chance to deal an additional hit for 100%
            // of the damage dealt. We record these extra hits separately.
            let finalDamage = actualDmg;
            const dustActive = !!window._dustSignetActive;
            const DUST_NAME = 'Dust of the Black Pharaoh (Proc)';
            if (dustActive && isCrit) {
                if (Math.random() < 0.20) {
                    finalDamage += actualDmg;
                    // Track the extra hit as its own breakdown entry
                    if (!statsBreakdown[DUST_NAME]) {
                        statsBreakdown[DUST_NAME] = { damage: 0, casts: 0 };
                    }
                    statsBreakdown[DUST_NAME].casts++;
                    statsBreakdown[DUST_NAME].damage += actualDmg;
                }
            }

            // Elemental Overload Proc
            // "Your Elemental abilities have a 33% chance to deal 105 magical damage to 6 enemies around the target."
            // "Requires an equipped Elementalism Focus."
            // Note: Single target DPS calc, so we only apply the damage once. Base 105 damage loosely scaled to 1000 CP.
            if (hasElementalWeapon && ability.weapon === 'Elementalism') {
                if (Math.random() < 0.33) {
                    const ELE_OVERLOAD_NAME = 'Elemental Overload (Proc)';
                    if (!statsBreakdown[ELE_OVERLOAD_NAME]) {
                        statsBreakdown[ELE_OVERLOAD_NAME] = { damage: 0, casts: 0 };
                    }
                    const eleBaseDmg = 105 * (cp / 1000);
                    // Procs inherit the triggering hit's finalMult (crit/pen/glance)
                    const eleActualDmg = eleBaseDmg * finalMult;

                    totalDamage += eleActualDmg;
                    statsBreakdown[ELE_OVERLOAD_NAME].casts++;
                    statsBreakdown[ELE_OVERLOAD_NAME].damage += eleActualDmg;
                }
            }

            totalDamage += finalDamage;
            // Find the correct key for this ability based on its index in allActives
            const abilityIndex = allActives.findIndex(a => a === ability);
            const abilityKey = abilityIndex >= 0 ? `active_${abilityIndex}_${ability.name}` : ability.name;
            if (!statsBreakdown[abilityKey]) statsBreakdown[abilityKey] = { damage: 0, casts: 0, displayName: ability.name };
            statsBreakdown[abilityKey].casts++;
            statsBreakdown[abilityKey].damage += finalDamage;

            // Proc Passives (Evaluate on every hit)
            allPassives.forEach((passive, p) => {
                if (passiveCooldowns[p] <= 0) {
                    if (passive.triggerSubtypes.length > 0 && !passive.triggerSubtypes.includes(ability.subtype)) return;
                    
                    // Check for requiresBlade flag (Two Cuts passive)
                    if (passive.originalAbility && passive.originalAbility.requiresBlade && !hasBladeWeapon) return;
                    
                    // Check trigger interval - only count hits matching passive's weapon
                    const passiveWeapon = passive.weapon;
                    const isMatchingWeapon = !passiveWeapon || passiveWeapon === 'All' || passiveWeapon === ability.weapon;
                    
                    if (!isMatchingWeapon) return; // Skip non-matching weapons, don't reset counter
                    
                    // Enhanced counter-based trigger system
                    let shouldTrigger = false;
                    
                    if (passive.counterThreshold > 0) {
                        // Counter-based passive
                        let conditionMet = false;
                        
                        // Check if the trigger condition is met
                        if (passive.counterTriggerCondition === "penetrate" && isPenetrated) {
                            conditionMet = true;
                        } else if (passive.counterTriggerCondition === "hit") {
                            conditionMet = true; // Any hit counts
                        } else if (passive.counterTriggerCondition === "leech" && ability.name.toLowerCase().includes("leech")) {
                            conditionMet = true;
                        } else if (passive.counterTriggerCondition === "finish_activating") {
                            conditionMet = true; // Any ability activation counts
                        }
                        
                        if (conditionMet && passiveCounterCooldowns[p] <= 0) {
                            passiveCounters[p]++;
                            console.log(`Counter build: ${passive.name} - ${passiveCounters[p]}/${passive.counterThreshold}`);
                            
                            if (passiveCounters[p] >= passive.counterThreshold) {
                                shouldTrigger = true;
                                passiveCounters[p] = 0; // Reset counter after triggering
                                
                                // Set counter cooldown if applicable
                                if (passive.hasCounterCooldown) {
                                    passiveCounterCooldowns[p] = passive.counterCooldownTime;
                                }
                            }
                        }
                    } else {
                        // Traditional interval-based passive
                        const interval = passive.triggerInterval || 1;
                        passiveHitCounters[p]++;
                        if (passiveHitCounters[p] < interval) return;
                        // Reset counter after triggering
                        passiveHitCounters[p] = 0;
                        shouldTrigger = true;
                    }
                    
                    if (!shouldTrigger) return;

                    // Passives inherit the same signet multiplier as the triggering hit
                    let pSignetMult = 1.0;
                    if (passive.subtype && sBonus.subtype[passive.subtype]) {
                        pSignetMult += sBonus.subtype[passive.subtype] / 100;
                    }
                    if (passive.weapon && sBonus.weapon[passive.weapon]) {
                        pSignetMult += sBonus.weapon[passive.weapon] / 100;
                    }

                    const pActualDmg = (passive.scalingToUse || 0) * cp * finalMult * pSignetMult;
                    totalDamage += pActualDmg;
                    const passiveKey = `passive_${p}_${passive.name}`;
                    statsBreakdown[passiveKey].casts++;
                    statsBreakdown[passiveKey].damage += pActualDmg;
                    passiveCooldowns[p] = 1.0; // 1s ICD
                }
            });
        }

        while (time < targetSeconds) {
            let castSomething = false;

            for (let i = 0; i < allActives.length; i++) {
                const action = allActives[i];
                if (activeCooldowns[i] > 0) {
                    if (action.name === "Molten Steel") {
                        console.log(`${action.name}: cd blocked (${activeCooldowns[i].toFixed(2)}s remaining)`);
                    }
                    continue;
                }

                let canCast = true;
                const isPrim = action.weapon === primWeapon;
                const isSec = action.weapon === secWeapon;
                const isValidWeapon = isPrim || isSec || primWeapon === "All";

                const reqResources = action.resourceRequirement || action.resourceConsumption || 5;

                // Abilities can only be cast from equipped weapons (unless primary is "All")
                if (!isValidWeapon) {
                    if (action.name === "Molten Steel") {
                        console.log(`${action.name}: weapon mismatch. action.weapon=${action.weapon}, primWeapon=${primWeapon}, secWeapon=${secWeapon}`);
                    }
                    continue;
                }

                if (action.name === "Molten Steel") {
                    moltenSteelCheckCount++;
                    console.log(`[${moltenSteelCheckCount}] Checking ${action.name}: isConsumer=${action.isConsumer}, isPrim=${isPrim}, isSec=${isSec}, primResources=${primResources}, secResources=${secResources}, reqResources=${reqResources}`);
                }

                if (action.isConsumer) {
                    if (isPrim && primResources < reqResources) {
                        canCast = false;
                        if (action.name === "Molten Steel") console.log(`${action.name}: insufficient primary resources ${primResources}/${reqResources}`);
                    }
                    if (isSec && secResources < reqResources) {
                        canCast = false;
                        if (action.name === "Molten Steel") console.log(`${action.name}: insufficient secondary resources ${secResources}/${reqResources}`);
                    }
                    
                    // Check min resources requirement
                    const minRes = action.minResources || 0;
                    if (minRes > 0) {
                        const currentRes = isPrim ? primResources : (isSec ? secResources : 0);
                        if (currentRes < minRes) {
                            canCast = false;
                            if (action.name === "Molten Steel") console.log(`${action.name}: min resources not met ${currentRes}/${minRes}`);
                        }
                    }
                } else if (action.cooldown === 0 && action.tree !== "Aux") {
                    // Builders can always cast - they generate resources
                    canCast = true;
                }

                if (canCast) {
                    // Check debuff requirements before casting
                    let canCastWithDebuffs = true;
                    if (action.requiredDebuffs.length > 0) {
                        for (const requiredDebuff of action.requiredDebuffs) {
                            if (!enemyDebuffs[requiredDebuff]) {
                                canCastWithDebuffs = false;
                                break;
                            }
                        }
                    }
                    
                    if (!canCastWithDebuffs) {
                        // Skip this ability if debuff requirements aren't met
                        activeCooldowns[i] = 0.1; // Small delay to prevent infinite loop
                        continue;
                    }

                    if (action.name === "Molten Steel") {
                        console.log(`Casting ${action.name} at time ${time.toFixed(2)}s`);
                    }
                    
                    // Store current debuff state for damage calculation
                    const currentDebuffState = {
                        afflicted: enemyDebuffs.afflicted,
                        weakened: enemyDebuffs.weakened,
                        hindered: enemyDebuffs.hindered,
                        impaired: enemyDebuffs.impaired
                    };
                    
                    performAttack(action, action.weapon, currentDebuffState);

                    // Apply debuffs from this ability
                    if (action.appliedDebuffs.length > 0) {
                        for (const debuff of action.appliedDebuffs) {
                            enemyDebuffs[debuff] = true;
                            const duration = action.appliedDebuffDurations[debuff] || 5;
                            enemyDebuffs[debuff + "Duration"] = duration;
                            console.log(`${action.name} applies ${debuff} for ${duration}s`);
                        }
                    }

                    const timeTaken = action.castTime;
                    time += timeTaken;
                    activeCooldowns[i] = action.cooldown;

                    // Resources
                    if (action.isConsumer) {
                        const consumeAmount = action.resourceConsumption || reqResources;
                        if (isPrim) {
                            console.log(`🔫 ${action.name} consumes ${consumeAmount} pistol resources (${primResources} -> ${primResources - consumeAmount})`);
                            primResources -= consumeAmount;
                        }
                        if (isSec) {
                            console.log(`⚔️ ${action.name} consumes ${consumeAmount} blade resources (${secResources} -> ${secResources - consumeAmount})`);
                            secResources -= consumeAmount;
                        }
                    } else if (action.tree !== "Aux") {
                        // Builders only add resources to their specific weapon
                        if (isPrim) {
                            console.log(`🔫 ${action.name} builds 1 pistol resource (${primResources} -> ${Math.min(5, primResources + 1)})`);
                            primResources = Math.min(5, primResources + 1);
                        }
                        if (isSec) {
                            console.log(`⚔️ ${action.name} builds 1 blade resource (${secResources} -> ${Math.min(5, secResources + 1)})`);
                            secResources = Math.min(5, secResources + 1);
                        }
                    }

                    // Effects
                    if (action.duration > 0 && action.tickInterval > 0) {
                        activeEffects.push({
                            name: action.name + " (Effect)",
                            duration: action.duration,
                            tickInterval: action.tickInterval,
                            nextTick: action.tickInterval,
                            subtype: action.subtype,
                            scalingToUse: action.scalingToUse,
                            weapon: action.weapon,
                            isManifestation: action.isManifestation
                        });
                    }

                    // CD reduction
                    for (let j = 0; j < activeCooldowns.length; j++) activeCooldowns[j] -= timeTaken;
                    for (let j = 0; j < passiveCooldowns.length; j++) passiveCooldowns[j] -= timeTaken;
                    for (let j = 0; j < passiveCounterCooldowns.length; j++) passiveCounterCooldowns[j] -= timeTaken;
                    
                    // Update debuff durations
                    enemyDebuffs.afflictedDuration = Math.max(0, enemyDebuffs.afflictedDuration - timeTaken);
                    enemyDebuffs.weakenedDuration = Math.max(0, enemyDebuffs.weakenedDuration - timeTaken);
                    enemyDebuffs.hinderedDuration = Math.max(0, enemyDebuffs.hinderedDuration - timeTaken);
                    enemyDebuffs.impairedDuration = Math.max(0, enemyDebuffs.impairedDuration - timeTaken);
                    
                    // Update debuff active states based on durations
                    enemyDebuffs.afflicted = enemyDebuffs.afflictedDuration > 0;
                    enemyDebuffs.weakened = enemyDebuffs.weakenedDuration > 0;
                    enemyDebuffs.hindered = enemyDebuffs.hinderedDuration > 0;
                    enemyDebuffs.impaired = enemyDebuffs.impairedDuration > 0;

                    // Effect Ticks
                    activeEffects = activeEffects.filter(eff => {
                        eff.duration -= timeTaken;
                        eff.nextTick -= timeTaken;
                        while (eff.nextTick <= 0 && eff.duration >= 0) {
                            performAttack({
                                name: eff.name,
                                subtype: eff.subtype,
                                scalingToUse: eff.scalingToUse,
                                weapon: eff.weapon,
                                isManifestation: eff.isManifestation
                            }, eff.weapon, enemyDebuffs);
                            eff.nextTick += eff.tickInterval;
                        }
                        return eff.duration > 0;
                    });

                    castSomething = true;
                    // Only break if a consumer cast (since they consume resources)
                    // Builders should continue so other abilities can cast
                    if (action.isConsumer) {
                        break;
                    }
                }
            }

            if (!castSomething) {
                let minWait = 1.0;
                for (let c of activeCooldowns) if (c > 0 && c < minWait) minWait = c;
                time += minWait;
                for (let j = 0; j < activeCooldowns.length; j++) activeCooldowns[j] -= minWait;
                for (let j = 0; j < passiveCooldowns.length; j++) passiveCooldowns[j] -= minWait;
                for (let j = 0; j < passiveCounterCooldowns.length; j++) passiveCounterCooldowns[j] -= minWait;
                
                // Update debuff durations
                enemyDebuffs.afflictedDuration = Math.max(0, enemyDebuffs.afflictedDuration - minWait);
                enemyDebuffs.weakenedDuration = Math.max(0, enemyDebuffs.weakenedDuration - minWait);
                enemyDebuffs.hinderedDuration = Math.max(0, enemyDebuffs.hinderedDuration - minWait);
                enemyDebuffs.impairedDuration = Math.max(0, enemyDebuffs.impairedDuration - minWait);
                
                // Update debuff active states based on durations
                enemyDebuffs.afflicted = enemyDebuffs.afflictedDuration > 0;
                enemyDebuffs.weakened = enemyDebuffs.weakenedDuration > 0;
                enemyDebuffs.hindered = enemyDebuffs.hinderedDuration > 0;
                enemyDebuffs.impaired = enemyDebuffs.impairedDuration > 0;
            }
        }

        console.log(`Simulation complete. Molten Steel was checked ${moltenSteelCheckCount} times.`);
        
        const finalDps = totalDamage / targetSeconds;
        resTotalDps.textContent = Math.round(finalDps).toLocaleString() + ` DPS (over ${simTimeMins}m)`;

        // Render Breakdown
        slotBreakdownContainer.innerHTML = '';
        const sortedStats = Object.keys(statsBreakdown)
            .filter(name => statsBreakdown[name].casts > 0)
            .map(name => ({
                key: name,
                name: statsBreakdown[name].displayName || name,
                ...statsBreakdown[name]
            }))
            .sort((a, b) => b.damage - a.damage);

        // Store for sharing
        window._lastDpsBreakdown = {
            totalDamage,
            targetSeconds,
            simTimeMins,
            stats: sortedStats
        };

        sortedStats.forEach(stat => {
            const itemDps = stat.damage / targetSeconds;
            const percent = ((stat.damage / totalDamage) * 100).toFixed(1);

            const div = document.createElement('div');
            div.style.background = 'rgba(0,0,0,0.2)';
            div.style.padding = '0.5rem 0.75rem';
            div.style.borderRadius = '8px';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '0.75rem';

            // Icon element (loads async below)
            const iconEl = document.createElement('img');
            iconEl.className = 'breakdown-icon';
            iconEl.alt = '';
            iconEl.style.display = 'none'; // hidden until loaded

            const nameSpan = document.createElement('span');
            nameSpan.style.flex = '1';
            nameSpan.style.minWidth = '0';
            nameSpan.innerHTML = `<strong>${stat.name}</strong> <span style="color:var(--text-secondary);font-size:0.8rem;">(${stat.casts} casts)</span>`;

            const dpsSpan = document.createElement('span');
            dpsSpan.style.whiteSpace = 'nowrap';
            dpsSpan.style.color = 'var(--accent)';
            dpsSpan.style.fontWeight = '600';
            dpsSpan.textContent = `${Math.round(itemDps).toLocaleString()} DPS (${percent}%)`;

            div.appendChild(iconEl);
            div.appendChild(nameSpan);
            div.appendChild(dpsSpan);
            slotBreakdownContainer.appendChild(div);

            // Fetch icon from local folder (strip " (Effect)" suffix for proc names)
            const lookupName = stat.name.replace(/ \(Effect\)$/, '');
            const cachedUrl = iconCache.get(lookupName.toLowerCase());
            if (cachedUrl) {
                iconEl.src = cachedUrl;
                iconEl.style.display = '';
            } else if (cachedUrl === undefined) {
                // Not yet cached – try to resolve from tswData by name
                const ability = tswData.find(a => a.name === lookupName);
                const url = getLocalIconUrlForAbility(ability);
                if (url) {
                    iconCache.set(lookupName.toLowerCase(), url);
                    iconEl.src = url;
                    iconEl.style.display = '';
                }
            }
        });
    }

    // --- TSWCALC IMPORT LOGIC ---
    const TSWCALC_DATA = {
        weaponPower: {
            "10.0": 398, "10.1": 411, "10.2": 423, "10.3": 434, "10.4": 446, "10.5": 457,
            "10.6": 464, "10.7": 475, "10.8": 492, "10.9": 510, "11.0": 528
        },
        talismanRating: {
            head: { 0: 559, 1: 596, 2: 636, 3: 682, 4: 735, 5: 788, 6: 846, 7: 936, 8: 1011, 9: 1077, 10: 1144, 11: 1144 },
            major: { 0: 505, 1: 538, 2: 575, 3: 616, 4: 664, 5: 712, 6: 764, 7: 845, 8: 913, 9: 972, 10: 1033, 11: 1033 },
            minor: { 0: 325, 1: 346, 2: 369, 3: 396, 4: 427, 5: 458, 6: 491, 7: 543, 8: 587, 9: 625, 10: 664, 11: 664 }
        },
        // glyph QL index in URL: 0=QL10.0, 1=QL10.1, 2=QL10.2, 3=QL10.3, 4=QL10.4, 5=QL10.5, 11=QL11.0
        glyphQlMap: ['10.0', '10.1', '10.2', '10.3', '10.4', '10.5', null, null, null, null, null, '11.0'],
        // Direct lookup: glyphData[stat][qlStr][slotGroup][dist] = rating value
        // Data sourced directly from tswcalc-data.min.js (joakibj.github.io/tswcalc)
        // Weapon slots use their own 'weapon' key (same values as 'head' in tswcalc data)
        glyphData: {
            'critical-rating': {
                '10.0': { head: [0,56,112,167,223], weapon: [0,56,112,167,223], major: [0,50,101,151,202], minor: [0,32,65,97,130] },
                '10.1': { head: [0,60,120,181,241], weapon: [0,60,120,181,241], major: [0,54,109,163,217], minor: [0,35,70,105,140] },
                '10.2': { head: [0,65,130,195,260], weapon: [0,65,130,195,260], major: [0,59,117,176,235], minor: [0,38,75,113,151] },
                '10.3': { head: [0,71,141,212,283], weapon: [0,71,141,212,283], major: [0,64,127,191,255], minor: [0,41,82,123,164] },
                '10.4': { head: [0,77,155,232,309], weapon: [0,77,155,232,309], major: [0,70,140,209,279], minor: [0,45,90,135,180] },
                '10.5': { head: [0,84,168,252,336], weapon: [0,84,168,252,336], major: [0,76,151,227,303], minor: [0,49,97,146,195] },
                '11.0': { head: [0,0,181,0,362],    weapon: [0,0,181,0,362],    major: [0,0,163,0,327],    minor: [0,0,105,0,210] }
            },
            'critical-power': {
                '10.0': { head: [0,60,119,179,238], weapon: [0,60,119,179,238], major: [0,54,108,161,215], minor: [0,35,69,104,138] },
                '10.1': { head: [0,64,128,191,255], weapon: [0,64,128,191,255], major: [0,58,115,173,231], minor: [0,37,74,111,148] },
                '10.2': { head: [0,68,136,205,273], weapon: [0,68,136,205,273], major: [0,62,123,185,246], minor: [0,40,79,119,158] },
                '10.3': { head: [0,73,145,218,291], weapon: [0,73,145,218,291], major: [0,66,128,197,263], minor: [0,42,84,127,169] },
                '10.4': { head: [0,77,155,232,310], weapon: [0,77,155,232,310], major: [0,70,140,210,280], minor: [0,45,90,135,180] },
                '10.5': { head: [0,82,164,246,328], weapon: [0,82,164,246,328], major: [0,74,148,222,296], minor: [0,48,95,143,191] },
                '11.0': { head: [0,0,173,0,347],    weapon: [0,0,173,0,347],    major: [0,0,156,0,313],    minor: [0,0,100,0,201] }
            },
            'penetration-rating': {
                '10.0': { head: [0,50,101,151,202], weapon: [0,50,101,151,202], major: [0,46,91,137,182],  minor: [0,29,59,88,117] },
                '10.1': { head: [0,56,111,166,221], weapon: [0,56,111,166,221], major: [0,50,100,150,200], minor: [0,32,64,96,129] },
                '10.2': { head: [0,61,123,184,245], weapon: [0,61,123,184,245], major: [0,55,111,166,221], minor: [0,36,71,107,142] },
                '10.3': { head: [0,69,138,207,276], weapon: [0,69,138,207,276], major: [0,62,125,187,249], minor: [0,40,80,120,160] },
                '10.4': { head: [0,80,160,240,319], weapon: [0,80,160,240,319], major: [0,72,144,216,288], minor: [0,46,93,139,185] },
                '10.5': { head: [0,91,182,272,363], weapon: [0,91,182,272,363], major: [0,82,164,246,328], minor: [0,53,105,158,211] },
                '11.0': { head: [0,0,203,0,407],    weapon: [0,0,203,0,407],    major: [0,0,183,0,367],    minor: [0,0,118,0,236] }
            },
            'hit-rating': {
                '10.0': { head: [0,50,101,151,202], weapon: [0,50,101,151,202], major: [0,46,91,137,182],  minor: [0,29,59,88,117] },
                '10.1': { head: [0,56,111,166,221], weapon: [0,56,111,166,221], major: [0,50,100,150,200], minor: [0,32,64,96,129] },
                '10.2': { head: [0,61,123,184,245], weapon: [0,61,123,184,245], major: [0,55,111,166,221], minor: [0,36,71,107,142] },
                '10.3': { head: [0,69,138,207,276], weapon: [0,69,138,207,276], major: [0,62,125,187,249], minor: [0,40,80,120,160] },
                '10.4': { head: [0,80,160,240,319], weapon: [0,80,160,240,319], major: [0,72,144,216,288], minor: [0,46,93,139,185] },
                '10.5': { head: [0,91,182,272,363], weapon: [0,91,182,272,363], major: [0,82,164,246,328], minor: [0,53,105,158,211] },
                '11.0': { head: [0,0,203,0,407],    weapon: [0,0,203,0,407],    major: [0,0,183,0,367],    minor: [0,0,118,0,236] }
            }
        },
        stat_mapping: { 1: 'critical-rating', 2: 'critical-power', 3: 'penetration-rating', 4: 'hit-rating' },
        wtype_mapping: { 1: 'Blade', 2: 'Hammer', 3: 'Fist', 4: 'Blood', 5: 'Chaos', 6: 'Elementalism', 7: 'Shotgun', 8: 'Pistol', 9: 'Assault Rifle' },
        // weapon: weapon slot signets; head: head slot signets; minor: minor talisman signets; major: major talisman signets
        signets: {
            // --- Weapon signets (flat rating bonuses) ---
            1: { slot: 'weapon', stat: 'dmg-pct', value: [5, 10, 15] }, // Aggression (ID 1 in tswcalc)
            21: { slot: 'weapon', stat: 'attack-rating', value: [47, 94, 141] }, // Violence
            56: { slot: 'weapon', stat: 'attack-rating', value: [0, 0, 117] },   // Chernobog
            62: { slot: 'ring', stat: 'attack-rating', value: [38, 78, 117] }, // Howling Oni
            68: { slot: 'wrist', stat: 'attack-rating', value: [38, 78, 117] }, // Repulsor Technology

            // --- Weapon signets (% bonus) ---
            // Laceration: +crit damage % (8/16/24%) when you critically hit (15s duration, 15s CD = ~100% uptime after first proc)
            // We model it as a flat crit power increase on the importer
            6: { slot: 'weapon', stat: 'crit-power-pct', value: [8, 16, 24] }, // Laceration

            // --- Head signets (% damage by type - applied via signetDamageMult in simulation) ---
            // These are passive % boosts active all the time
            16: { slot: 'head', stat: 'affliction-dmg-pct', value: [7, 14, 21] }, // Corruption (affliction)

            // --- Minor talisman signets (attack subtype % or weapon type %) ---
            24: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Strike', value: [1.5, 3, 4.5] }, // Assassination
            25: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Blast', value: [1.5, 3, 4.5] }, // Barrage
            26: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Focus', value: [1.5, 3, 4.5] }, // Cleaving
            27: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Chaos', value: [1, 2, 3] },     // Distortion (Chaos weapon)
            28: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Assault Rifle', value: [1, 2, 3] },     // Execution
            29: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Elementalism', value: [1, 2, 3] },     // Flux
            30: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Pistol', value: [1, 2, 3] },     // Liquidation
            31: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Frenzy', value: [1.5, 3, 4.5] }, // Rage
            32: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Chain', value: [1.5, 3, 4.5] }, // Recursion
            33: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Fist', value: [1, 2, 3] },     // Serration
            34: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Shotgun', value: [1, 2, 3] },     // Shards
            35: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Hammer', value: [1, 2, 3] },     // Shattering
            36: { slot: 'minor', stat: 'subtype-dmg-pct', subtype: 'Burst', value: [1.5, 3, 4.5] }, // Storms
            37: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Blade', value: [1, 2, 3] },     // Swords
            38: { slot: 'minor', stat: 'weapon-dmg-pct', weapon: 'Blood', value: [1, 2, 3] },     // Tomes

            // --- Major talisman signets ---
            23: { slot: 'major', stat: 'attack-rating', value: [47, 94, 141] }, // Amelioration (heal - not DPS relevant)

            // --- Generic Damage % signets ---
            59: { slot: 'waist', stat: 'dmg-pct', value: [0.5, 1, 1.5] }, // Venice
            65: { slot: 'occult', stat: 'dmg-pct', value: [0.5, 1, 1.5] }, // Nure-onna's Coils
        }
    };

    function parseTswcalcUrl() {
        const urlInput = document.getElementById('tswcalc-url');
        const url = (urlInput.value || '').trim();
        if (!url) {
            alert('Please enter a tswcalc URL first.');
            return;
        }

        if (!url.includes('#')) {
            alert('Invalid tswcalc URL format. Please ensure it contains a "#" fragment.');
            return;
        }

        try {
            // Handle both #weapon=... and #/weapon=... formats
            let fragment = url.split('#')[1];
            if (fragment.startsWith('/')) {
                fragment = fragment.substring(1);
            }
            const params = new URLSearchParams(fragment);

            if (!params.has('weapon') && !params.has('head')) {
                alert('This does not look like a valid tswcalc build URL.');
                return;
            }

            let attackRating = 0;
            let weaponPower = 75;
            let critRating = 0;
            let critPowerRating = 0;
            let penRating = 0;
            let hitRating = 0;

            // Accumulated percentage-based signet bonuses applied during simulation
            // Format: {
            //   subtype: { 'Strike': 5, 'Blast': 3, ... },
            //   weapon: { 'Blade': 3 },
            //   critPowerPct: 24,
            //   globalDmgPct: 3
            // }
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

            // Track base (talisman) vs weapon-specific glyph ratings
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
                        const wpKey = qlIdx === 11 ? '11.0' : `10.${qlIdx}`;
                        weaponPower = TSWCALC_DATA.weaponPower[wpKey] || 75;
                        const wName = TSWCALC_DATA.wtype_mapping[itemId];
                        if (wName) weaponSelect.value = wName;
                    } else if (slot.id === 'weapon2') {
                        const wName2 = TSWCALC_DATA.wtype_mapping[itemId];
                        if (wName2) secondaryWeaponSelect.value = wName2;
                    }
                } else if (slot.type === 'talisman') {
                    // Role check: itemId 1=Tank, 2=Healer, 3=DPS, default to DPS if unknown/special
                    const isDpsRole = itemId === 3 || itemId === 82 || itemId === 84 || itemId === 86 || itemId >= 200 || (itemId !== 1 && itemId !== 2 && itemId !== 81 && itemId !== 83 && itemId !== 85 && itemId !== 202 && itemId !== 203 && itemId !== 205 && itemId !== 207);
                    if (isDpsRole) {
                        attackRating += TSWCALC_DATA.talismanRating[slot.group][qlIdx] || 0;
                    }
                }

                // Glyphs — use direct lookup table (stat → qlStr → slotGroup → dist)
                [{ id: primStatId, dist: primDist }, { id: secStatId, dist: secDist }].forEach(g => {
                    const statName = TSWCALC_DATA.stat_mapping[g.id];
                    if (statName && g.dist > 0 && TSWCALC_DATA.glyphData[statName]) {
                        const isWeaponSlot = slot.type === 'weapon';
                        const glyphGroup = isWeaponSlot ? 'weapon' : slot.group;
                        const qlStr = TSWCALC_DATA.glyphQlMap[glyphQlIdx] || '10.0';
                        const qlTable = TSWCALC_DATA.glyphData[statName][qlStr];
                        const val = (qlTable && qlTable[glyphGroup]) ? (qlTable[glyphGroup][g.dist] || 0) : 0;

                        // If this glyph is on a weapon, keep it weapon-specific;
                        // otherwise, treat it as a global (talisman) rating.
                        const targetBucket = !isWeaponSlot
                            ? 'base'
                            : (slot.id === 'weapon' ? 'weapon1' : (slot.id === 'weapon2' ? 'weapon2' : 'base'));

                        function addToBucket(bucket, field, amount) {
                            if (bucket === 'base') {
                                if (field === 'critical-rating') baseCritRating += amount;
                                if (field === 'critical-power') baseCritPowerRating += amount;
                                if (field === 'penetration-rating') basePenRating += amount;
                                if (field === 'hit-rating') baseHitRating += amount;
                            } else if (bucket === 'weapon1') {
                                if (field === 'critical-rating') weapon1Glyph.critRating += amount;
                                if (field === 'critical-power') weapon1Glyph.critPowerRating += amount;
                                if (field === 'penetration-rating') weapon1Glyph.penRating += amount;
                                if (field === 'hit-rating') weapon1Glyph.hitRating += amount;
                            } else if (bucket === 'weapon2') {
                                if (field === 'critical-rating') weapon2Glyph.critRating += amount;
                                if (field === 'critical-power') weapon2Glyph.critPowerRating += amount;
                                if (field === 'penetration-rating') weapon2Glyph.penRating += amount;
                                if (field === 'hit-rating') weapon2Glyph.hitRating += amount;
                            }
                        }

                        addToBucket(targetBucket, statName, val);
                    }
                });

                // Signets
                const signet = TSWCALC_DATA.signets[signetId];
                if (signet && signetQual > 0) {
                    const qualIndex = signetQual - 1; // 1=Normal, 2=Elite, 3=Epic
                    const bonus = signet.value[qualIndex] || 0;

                    switch (signet.stat) {
                        case 'attack-rating':
                            attackRating += bonus;
                            break;
                        case 'crit-power-pct':
                            // Laceration: add directly to critPower % after calculation
                            signetBonuses.critPowerPct += bonus;
                            break;
                        case 'dmg-pct':
                            // Venice, Nure-onna's Coils, etc.
                            signetBonuses.globalDmgPct += bonus;
                            break;
                        case 'subtype-dmg-pct':
                            // e.g. Assassination gives +% to Strike abilities
                            if (signet.subtype) {
                                signetBonuses.subtype[signet.subtype] = (signetBonuses.subtype[signet.subtype] || 0) + bonus;
                            }
                            break;
                        case 'weapon-dmg-pct':
                            // e.g. Swords gives +% to Blade abilities
                            if (signet.weapon) {
                                signetBonuses.weapon[signet.weapon] = (signetBonuses.weapon[signet.weapon] || 0) + bonus;
                            }
                            break;
                        // Other stats (heal-rating, etc.) are not DPS relevant
                    }
                }
            });

            // Aggregate totals for display (all sources)
            critRating = baseCritRating + weapon1Glyph.critRating;
            critPowerRating = baseCritPowerRating + weapon1Glyph.critPowerRating;
            penRating = basePenRating + weapon1Glyph.penRating;
            hitRating = baseHitRating + weapon1Glyph.hitRating;

            // Final Display AR = Gear + Signets (matches tswcalc's total)
            const cpFormula = (ar, wp) => {
                if (ar < 5200) {
                    return Math.round((375 - (600 / (Math.pow(Math.E, (ar / 1400)) + 1))) * (1 + (wp / 375)));
                } else {
                    const c = (0.00008 * wp) + 0.0301;
                    return Math.round(204.38 + (0.5471 * wp) + (c * ar));
                }
            };

            const cp = cpFormula(attackRating, weaponPower);
            const critChance = 55.14 - (100.3 / (Math.pow(Math.E, (critRating / 790.3)) + 1));
            // Apply Laceration's flat crit power % on top of the rated crit power
            const critPower = Math.sqrt(5 * critPowerRating + 625) + signetBonuses.critPowerPct;

            cpInput.value = cp;
            if (attackRatingInput) {
                attackRatingInput.value = Math.round(attackRating);
            }
            if (weaponPowerInput) {
                weaponPowerInput.value = Math.round(weaponPower);
            }
            hitRatingInput.value = Math.round(hitRating);
            critChanceInput.value = critChance.toFixed(1);
            critPowerInput.value = critPower.toFixed(1);
            penRatingInput.value = Math.round(penRating);

            // Store signet bonuses and weapon-specific rating pools for calculate() to pick up
            window._signetBonuses = signetBonuses;
            window._weaponRatingPools = {
                base: {
                    critRating: baseCritRating,
                    critPowerRating: baseCritPowerRating,
                    penRating: basePenRating,
                    hitRating: baseHitRating
                },
                weapon1: weapon1Glyph,
                weapon2: weapon2Glyph,
                weapon1Name: weaponSelect.value,
                weapon2Name: secondaryWeaponSelect.value
            };

            updateAbilityDropdowns();
            calculate();

            console.log('Successfully imported build from tswcalc');
        } catch (err) {
            console.error('Failed to parse tswcalc URL:', err);
            alert('An error occurred while parsing the tswcalc URL. Check the console for details.');
        }
    }

    targetEnemySelect.addEventListener('change', updateAbilityDropdowns);
    targetEnemySelect.addEventListener('change', calculate);
    weaponSelect.addEventListener('change', updateAbilityDropdowns);
    secondaryWeaponSelect.addEventListener('change', updateAbilityDropdowns);
    auxWeaponSelect.addEventListener('change', updateAbilityDropdowns);
    simTimeInput.addEventListener('input', calculate);

    const copyBreakdownBtn = document.getElementById('copy-breakdown-btn');
    const importBreakdownInput = document.getElementById('import-breakdown-input');
    const importBreakdownBtn = document.getElementById('import-breakdown-btn');

    if (copyBreakdownBtn) {
        copyBreakdownBtn.addEventListener('click', () => {
            const data = window._lastDpsBreakdown;
            if (!data || !data.stats || data.stats.length === 0) {
                alert('No DPS breakdown available yet. Run a simulation first.');
                return;
            }

            const lines = [];
            lines.push(`Total DPS: ${Math.round((data.totalDamage / data.targetSeconds) || 0)} over ${data.simTimeMins} minutes`);
            lines.push('');
            lines.push('Ability / Source\tCasts\tDPS\tPercent');

            data.stats.forEach(stat => {
                const itemDps = stat.damage / data.targetSeconds;
                const percent = ((stat.damage / data.totalDamage) * 100).toFixed(1);
                lines.push(`${stat.name}\t${stat.casts}\t${Math.round(itemDps)}\t${percent}%`);
            });

            lines.push('');
            lines.push('JSON:');
            lines.push(JSON.stringify(data, null, 2));

            const text = lines.join('\n');

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    alert('DPS breakdown copied to clipboard.');
                }).catch(() => {
                    alert('Failed to copy to clipboard.');
                });
            } else {
                // Fallback
                prompt('Copy the DPS breakdown below:', text);
            }
        });
    }

    function renderImportedBreakdown(data) {
        if (!data || !Array.isArray(data.stats) || !data.totalDamage || !data.targetSeconds) return;

        const totalDamage = data.totalDamage;
        const targetSeconds = data.targetSeconds;
        const simTimeMins = data.simTimeMins || (targetSeconds / 60);

        const finalDps = totalDamage / targetSeconds;
        resTotalDps.textContent = Math.round(finalDps).toLocaleString() + ` DPS (over ${simTimeMins}m, imported)`;

        slotBreakdownContainer.innerHTML = '';
        const sortedStats = data.stats.slice().sort((a, b) => b.damage - a.damage);

        sortedStats.forEach(stat => {
            const itemDps = stat.damage / targetSeconds;
            const percent = ((stat.damage / totalDamage) * 100).toFixed(1);

            const div = document.createElement('div');
            div.style.background = 'rgba(0,0,0,0.2)';
            div.style.padding = '0.5rem 0.75rem';
            div.style.borderRadius = '8px';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '0.75rem';

            const iconEl = document.createElement('img');
            iconEl.className = 'breakdown-icon';
            iconEl.alt = '';
            iconEl.style.display = 'none';

            const nameSpan = document.createElement('span');
            nameSpan.style.flex = '1';
            nameSpan.style.minWidth = '0';
            nameSpan.innerHTML = `<strong>${stat.name}</strong> <span style="color:var(--text-secondary);font-size:0.8rem;">(${stat.casts} casts)</span>`;

            const dpsSpan = document.createElement('span');
            dpsSpan.style.whiteSpace = 'nowrap';
            dpsSpan.style.color = 'var(--accent)';
            dpsSpan.style.fontWeight = '600';
            dpsSpan.textContent = `${Math.round(itemDps).toLocaleString()} DPS (${percent}%)`;

            div.appendChild(iconEl);
            div.appendChild(nameSpan);
            div.appendChild(dpsSpan);
            slotBreakdownContainer.appendChild(div);

            const lookupName = stat.name.replace(/ \(Effect\)$/, '');
            const cachedUrl = iconCache.get(lookupName.toLowerCase());
            if (cachedUrl) {
                iconEl.src = cachedUrl;
                iconEl.style.display = '';
            } else if (cachedUrl === undefined) {
                const ability = tswData.find(a => a.name === lookupName);
                const url = getLocalIconUrlForAbility(ability);
                if (url) {
                    iconCache.set(lookupName.toLowerCase(), url);
                    iconEl.src = url;
                    iconEl.style.display = '';
                }
            }
        });
    }

    if (importBreakdownBtn && importBreakdownInput) {
        importBreakdownBtn.addEventListener('click', () => {
            const text = (importBreakdownInput.value || '').trim();
            if (!text) {
                alert('Paste a shared DPS breakdown first.');
                return;
            }

            let jsonPart = text;
            const idx = text.indexOf('JSON:');
            if (idx !== -1) {
                jsonPart = text.slice(idx + 5).trim();
            }

            try {
                const data = JSON.parse(jsonPart);
                if (!data || !Array.isArray(data.stats)) {
                    alert('Could not find a valid JSON DPS breakdown in the pasted text.');
                    return;
                }
                window._lastDpsBreakdown = data;
                renderImportedBreakdown(data);
            } catch (e) {
                alert('Failed to parse JSON from pasted breakdown text.');
            }
        });
    }

    if (importBtn) {
        importBtn.addEventListener('click', parseTswcalcUrl);
    }

    function updateCombatPower() {
        const attackRating = parseFloat(attackRatingInput.value) || 0;
        const weaponPower = parseFloat(weaponPowerInput?.value) || 528;
        
        let cp;
        if (attackRating < 5200) {
            cp = Math.round((375 - (600 / (Math.pow(Math.E, (attackRating / 1400)) + 1))) * (1 + (weaponPower / 375)));
        } else {
            const c = (0.00008 * weaponPower) + 0.0301;
            cp = Math.round(204.38 + (0.5471 * weaponPower) + (c * attackRating));
        }
        cpInput.value = cp;
    }

    [attackRatingInput, weaponPowerInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                updateCombatPower();
                calculate();
            });
        }
    });

    [hitRatingInput, critChanceInput, critPowerInput, penRatingInput, penChanceInput].forEach(input => {
        if (input) input.addEventListener('input', calculate);
    });

    // Init
    initUI();
    updateAbilityDropdowns();
    calculate();
});
