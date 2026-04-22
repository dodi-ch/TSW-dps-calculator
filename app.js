document.addEventListener('DOMContentLoaded', () => {

    // Augment Data Structure
    const AUGMENTS = {
        // Damage Augment Resonators
        accurate_augment: {
            name: "Accurate Augment Resonator",
            type: "damage",
            effect: { attackRating: 150 },
            description: "+150 Attack Rating (affects all abilities)"
        },
        brutal_augment: {
            name: "Brutal Augment Resonator",
            type: "damage",
            effect: { critChance: 7.5 },
            description: "+7.5% Critical Hit Chance"
        },
        piercing_augment: {
            name: "Piercing Augment Resonator",
            type: "damage",
            effect: { penChance: 7.5 },
            description: "+7.5% Penetration Chance"
        },
        precise_augment: {
            name: "Precise Augment Resonator",
            type: "damage",
            effect: { hitRating: 250 },
            description: "+250 Hit Rating"
        },
        ferocious_augment: {
            name: "Ferocious Augment Resonator",
            type: "damage",
            effect: { critPower: 15 },
            description: "+15% Critical Power"
        },
        inescapable_augment: {
            name: "Inescapable Augment Resonator",
            type: "damage",
            effect: { evadeReduction: 7.5 },
            description: "-7.5% Target Evade Chance"
        },
        fierce_augment: {
            name: "Fierce Augment Resonator",
            type: "damage",
            effect: { penChance: 5, critChance: 5 },
            description: "+5% Penetration Chance & +5% Critical Hit Chance"
        },
        focused_augment: {
            name: "Focused Augment Resonator",
            type: "damage",
            effect: { critChance: 5, critPower: 10 },
            description: "+5% Critical Hit Chance & +10% Critical Power"
        },
        overwhelming_augment: {
            name: "Overwhelming Augment Resonator",
            type: "damage",
            effect: { penChance: 5, evadeReduction: 5 },
            description: "+5% Penetration Chance & -5% Target Evade Chance"
        },
        grievous_augment: {
            name: "Grievous Augment Resonator",
            type: "damage",
            effect: { damageMultiplier: 1.15 },
            description: "+15% Damage Dealt"
        },
        
        // Support Augment Resonators
        curing_augment: {
            name: "Curing Augment Resonator",
            type: "support",
            effect: { teamHeal: 75, cooldown: 10 },
            description: "Heal team for 75 (10s cooldown)"
        },
        inspiring_augment: {
            name: "Inspiring Augment Resonator",
            type: "support",
            effect: { teamDamageBuff: 5, duration: 5, cooldown: 30 },
            description: "Team +5% Damage for 5s (30s cooldown)"
        },
        safeguarding_augment: {
            name: "Safeguarding Augment Resonator",
            type: "support",
            effect: { teamDamageReduction: 5, duration: 5, cooldown: 30 },
            description: "Team -5% Damage Taken for 5s (30s cooldown)"
        },
        restorative_augment: {
            name: "Restorative Augment Resonator",
            type: "support",
            effect: { teamHealingBuff: 10, duration: 5, cooldown: 30 },
            description: "Team +10% Healing for 5s (30s cooldown)"
        },
        accelerating_augment: {
            name: "Accelerating Augment Resonator",
            type: "support",
            effect: { cooldownReduction: 5, cooldown: 5 },
            description: "-5% Recharge Timers (5s cooldown)"
        },
        rampant_augment: {
            name: "Rampant Augment Resonator",
            type: "support",
            effect: { additionalTargets: 5 },
            description: "+5 Targets (no effect on single-target abilities)"
        },
        quickening_augment: {
            name: "Quickening Augment Resonator",
            type: "support",
            effect: { teamHeal: 100, teamDamageBuff: 3, duration: 5, cooldown: 30 },
            description: "Team Heal 100 & +3% Damage for 5s (30s cooldown)"
        },
        invulnerable_augment: {
            name: "Invulnerable Augment Resonator",
            type: "support",
            effect: { teamHeal: 100, teamDamageReduction: 3, duration: 5, cooldown: 30 },
            description: "Team Heal 100 & -3% Damage Taken for 5s (30s cooldown)"
        },
        salubrious_augment: {
            name: "Salubrious Augment Resonator",
            type: "support",
            effect: { teamHeal: 100, teamHealingBuff: 7, duration: 5, cooldown: 30 },
            description: "Team Heal 100 & +7% Healing for 5s (30s cooldown)"
        },
        mercurial_augment: {
            name: "Mercurial Augment Resonator",
            type: "support",
            effect: { teamCooldownReduction: 10, cooldown: 10 },
            description: "Team -10% Recharge Timers (10s cooldown)"
        }
    };

    // Elements - consolidated queries
    const elements = {
        cpInput: document.getElementById('combat-power'),
        attackRatingInput: document.getElementById('attack-rating'),
        weaponPowerInput: document.getElementById('weapon-power'),
        hitRatingInput: document.getElementById('hit-rating'),
        critChanceInput: document.getElementById('crit-chance'),
        critPowerInput: document.getElementById('crit-power'),
        penRatingInput: document.getElementById('pen-rating'),
        penChanceInput: document.getElementById('pen-chance'),
        targetEnemySelect: document.getElementById('target-enemy'),
        enemyStatsDisplay: document.getElementById('enemy-stats-display'),
        weaponSelect: document.getElementById('weapon-type'),
        secondaryWeaponSelect: document.getElementById('secondary-weapon-type'),
        auxWeaponSelect: document.getElementById('auxiliary-weapon-type'),
        simTimeInput: document.getElementById('simulation-time')
    };

    // Destructure for easier access
    const { cpInput, attackRatingInput, weaponPowerInput, hitRatingInput, critChanceInput, critPowerInput, penRatingInput, penChanceInput, targetEnemySelect, enemyStatsDisplay, weaponSelect, secondaryWeaponSelect, auxWeaponSelect, simTimeInput } = elements;



    // list of auxiliary weapons we treat specially (should match data.js content)

    // there are five aux weapons in the game: chainsaw, flamethrower, quantum, rocket launcher and whip

    const AUX_WEAPONS = ["Rocket Launcher", "Chainsaw", "Quantum", "Flamethrower", "Whip"];



    // More elements
    const resTotalDps = document.getElementById('res-total-dps');
    const importBtn = document.getElementById('import-btn');
    const slotBreakdownContainer = document.getElementById('slot-breakdown-container');



    // Containers for dynamically generated select elements

    const activeContainer = document.getElementById('active-abilities-container');

    const auxActiveContainer = document.getElementById('aux-ability-container');

    const elitePassiveContainer = document.getElementById('elite-passive-container');

    const normalPassivesContainer = document.getElementById('normal-passives-container');

    const auxPassiveContainer = document.getElementById('aux-passive-container');

    const augmentsContainer = document.getElementById('augments-container');



    // Dropdown arrays to keep track of them

    const activeSelects = [];       // 6 normal actives

    const eliteActiveSelects = [];  // 1 elite active

    const auxActiveSelects = [];

    const elitePassiveSelects = [];

    const normalPassiveSelects = [];

    const auxPassiveSelects = [];

    const augmentSelects = [];  // Augment selections for abilities



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

        if (!ability) return;

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
        // ========== UI CREATION HELPERS ==========
        
        // Creates standardized input elements with common properties
        function createInput(type, className, value, placeholder, min, max, step, title) {
            const input = document.createElement('input');
            input.type = type;
            input.className = className;
            input.value = String(value);
            input.placeholder = placeholder;
            input.min = min;
            input.max = max;
            input.step = step;
            input.title = title;
            return input;
        }

        // Creates priority order input for ability slots
        function createOrderInput(select, defaultOrder) {
            const input = createInput('number', 'slot-order-input', defaultOrder, '1', '1', '10', '1', 
                'Priority: 1 = builder (casts first), 2+ = consumers');
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

        // Creates minimum resources input for ability slots
        function createMinResourcesInput(select, defaultMin) {
            const input = createInput('number', 'slot-min-resources-input', defaultMin, '0', '0', '5', '1', 
                'Min Resources: Ability only fires when you have at least this many resources built');
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

        // Creates standardized ability slot wrappers with consistent UI
        function createSlotWrapper(id, container, slotType = 'normal', slotIndex = 0) {
            const select = document.createElement('select');
            select.id = id;

            const wrapper = document.createElement('div');
            wrapper.className = 'slot-wrapper';

            // Icon placeholder
            const iconBox = document.createElement('div');
            iconBox.className = 'slot-icon-box';
            iconBox.innerHTML = '<div class="slot-icon-placeholder"></div>';

            // Determine slot label and styling based on type
            const slotConfig = {
                builder: { label: 'Priority (Builders Only)', color: 'var(--priority-builder)', needsOrder: true, needsMinRes: true },
                active: { label: 'Priority', color: null, needsOrder: true, needsMinRes: true },
                elite: { label: 'Priority', color: null, needsOrder: true, needsMinRes: true },
                aux: { label: 'Aux', color: null, needsOrder: true, needsMinRes: false },
                normal: { label: 'Priority', color: null, needsOrder: false, needsMinRes: false }
            };

            const config = slotConfig[slotType] || slotConfig.normal;
            
            // Create label with appropriate styling
            if (config.color) {
                wrapper.innerHTML = `<span class="slot-label" style="color: ${config.color};">${config.label}</span>`;
            } else {
                wrapper.innerHTML = `<span class="slot-label">${config.label}</span>`;
            }
            wrapper.appendChild(iconBox);

            // Add priority order input for active abilities
            if (config.needsOrder) {
                const defaultOrder = slotType === 'elite' ? 7 : (slotType === 'aux' ? 8 : slotIndex);
                const orderInput = createOrderInput(select, defaultOrder);
                
                if (slotType === 'builder') {
                    orderInput.classList.add('priority-builder');
                    wrapper.classList.add('priority-builder');
                } else {
                    orderInput.classList.add('priority-normal');
                }
                wrapper.appendChild(orderInput);
            }

            // Add minimum resources input for active abilities
            if (config.needsMinRes) {
                const minResLabel = document.createElement('span');
                minResLabel.className = 'slot-min-res-label';
                minResLabel.textContent = 'Min Res';
                minResLabel.title = 'Minimum resources required before this ability can fire';
                wrapper.appendChild(minResLabel);

                const minResInput = createMinResourcesInput(select, 0);
                minResInput.classList.add('resource-input');
                wrapper.appendChild(minResInput);
            }

            // Add search functionality
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'ability-search-input';
            searchInput.placeholder = slotType === 'builder' ? 'Search Builders...' : 'Search...';
            searchInput.addEventListener('input', () => {
                select.dataset.searchTerm = searchInput.value;
                updateAbilityDropdowns();
            });
            wrapper.appendChild(searchInput);

            // Add dropdown UI components
            const display = document.createElement('div');
            display.className = 'ability-dropdown-display';
            display.textContent = '-- None --';
            wrapper.appendChild(display);

            const list = document.createElement('div');
            list.className = 'ability-dropdown-list';
            wrapper.appendChild(list);

            // Dropdown toggle functionality
            display.addEventListener('click', () => {
                list.style.display = list.style.display === 'block' ? 'none' : 'block';
            });

            // Finalize slot setup
            wrapper.appendChild(select);
            select.style.display = 'none';
            container.appendChild(wrapper);

            // Add change event listener for slot updates
            select.addEventListener('change', () => {
                updateSlotIcon(select, wrapper);
                createAugmentUI();
                calculate();
            });

            return { wrapper, select };
        }

        // ========== ABILITY SLOTS CREATION ==========
        
        // Active Abilities (6 slots - first is builder-only)
        for (let i = 1; i <= 6; i++) {
            const slotType = i === 1 ? 'builder' : 'active';
            const { select } = createSlotWrapper(`active-ability-${i}`, activeContainer, slotType, i);
            activeSelects.push(select);
        }

        // Elite Active (1 slot)
        const eliteActiveLabel = document.createElement('h3');
        eliteActiveLabel.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600; color: var(--text-primary)';
        eliteActiveLabel.textContent = 'Elite Active';
        activeContainer.appendChild(eliteActiveLabel);
        
        const { select: eliteActiveSelect } = createSlotWrapper('elite-active-1', activeContainer, 'elite');
        eliteActiveSelects.push(eliteActiveSelect);

        // Auxiliary Active (1 slot)
        const { select: auxSelect } = createSlotWrapper('aux-active-1', auxActiveContainer, 'aux');
        auxActiveSelects.push(auxSelect);

        // ========== PASSIVE SLOTS CREATION ==========
        
        // Elite Passive (1 slot)
        const { select: eliteSelect } = createSlotWrapper('elite-passive-1', elitePassiveContainer, 'normal');
        elitePassiveSelects.push(eliteSelect);

        // Normal Passives (6 slots)
        for (let i = 1; i <= 6; i++) {
            const { wrapper, select } = createSlotWrapper(`normal-passive-${i}`, normalPassivesContainer, 'normal');
            // Update label to show slot number for normal passives
            const label = wrapper.querySelector('.slot-label');
            if (label) label.textContent = i;
            normalPassiveSelects.push(select);
        }

        // Auxiliary Passive (1 slot)
        const { select: auxPassSelect } = createSlotWrapper('aux-passive-1', auxPassiveContainer, 'aux');
        auxPassiveSelects.push(auxPassSelect);

    }



    // Data - check if loaded

    if (typeof tswData === 'undefined') {

        resTotalDps.textContent = "Error: Data failed to load";

        return;

    }



    // Populate Weapons - simplified
    const weapons = new Set(tswData.map(a => a.weapon));
    const sortedWeapons = Array.from(weapons).sort().filter(w => w && w !== "Aux" && w !== "Anima Deviations");

    // Helper to create and append option
    const addOption = (select, value, text) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = text;
        select.appendChild(opt);
    };

    sortedWeapons.forEach(w => {
        if (AUX_WEAPONS.includes(w)) {
            addOption(auxWeaponSelect, w, w);
        } else {
            addOption(weaponSelect, w, w);
            addOption(secondaryWeaponSelect, w, w);
        }
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

        'training-puppet': { name: 'Training Puppet', blockRating: 0, evadeRating: 0, defenseRating: 0 }

    };



    // Helper function to identify builder abilities

    function isBuilderAbility(ability) {

        if (!ability || !ability.description) return false;

        
        const desc = ability.description.toLowerCase();

        

        // Check for explicit "Builds X resource" patterns

        if (desc.includes('builds 1 resource') || 

            desc.includes('builds 2 resource') || 

            desc.includes('builds 3 resource') ||

            desc.includes('builds 1 assault rifle resource') ||

            desc.includes('builds 2 assault rifle resource') ||

            desc.includes('builds 3 assault rifle resource') ||

            desc.includes('builds 1 blade resource') ||

            desc.includes('builds 2 blade resource') ||

            desc.includes('builds 1 fist resource') ||

            desc.includes('builds 1 hammer resource') ||

            desc.includes('builds 1 shotgun resource') ||

            desc.includes('builds 1 pistol resource') ||

            desc.includes('builds 1 elementalism resource') ||

            desc.includes('builds 1 blood resource') ||

            desc.includes('builds 1 chaos resource')) {

            return true;

        }

        

        // Check for generic "Builds 1 resource for each equipped weapon"

        if (desc.includes('builds 1 resource for each equipped weapon')) {

            return true;

        }

        

        // Check for abilities that build additional resources under certain conditions

        if (desc.includes('builds 2 additional') || desc.includes('builds 3 additional')) {

            return true;

        }

        

        return false;

    }

    function updateAbilityDropdowns() {

        // Update enemy stats display

        const enemy = ENEMIES[targetEnemySelect.value] || ENEMIES['training-puppet'];

        enemyStatsDisplay.textContent = `Block: ${enemy.blockRating} | Evade: ${enemy.evadeRating} | Defense: ${enemy.defenseRating}`;



        const prim = weaponSelect.value;

        const sec = secondaryWeaponSelect.value;

        const isSelectedWeapon = (weapon) => weapon === prim || weapon === sec || prim === "All";

        const getType = (a) => a.type || "";



        // First ability slot - ONLY builders

        if (activeSelects.length > 0) {

            populateDropdowns(

                [activeSelects[0]], // Only the first slot

                a => isSelectedWeapon(a.weapon) &&

                    (getType(a).includes("Active") || getType(a) === "") &&

                    !getType(a).includes("Elite") &&

                    !AUX_WEAPONS.includes(a.weapon) &&

                    isBuilderAbility(a)

            );

        }



        // Remaining normal actives (slots 2-6): Active (or no type) but NOT Elite, NOT Auxiliary, NOT builders

        const remainingActiveSelects = activeSelects.slice(1);

        if (remainingActiveSelects.length > 0) {

            populateDropdowns(

                remainingActiveSelects,

                a => isSelectedWeapon(a.weapon) &&

                    (getType(a).includes("Active") || getType(a) === "") &&

                    !getType(a).includes("Elite") &&

                    !AUX_WEAPONS.includes(a.weapon) &&

                    !isBuilderAbility(a)

            );

        }



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



        createAugmentUI();
        calculate();

    }

    // Helper function to check if an ability deals damage
    function isDamageAbility(ability) {
        if (!ability) return false;
        
        // Check if ability has damage-related properties
        const desc = (ability.description || '').toLowerCase();
        const subtype = (ability.subtype || '').toLowerCase();
        
        // Keywords that indicate damage abilities
        const damageKeywords = [
            'damage', 'deals', 'attack', 'strike', 'shot', 'blast', 'hit', 
            'piercing', 'critical', 'penetration', 'leech', 'affliction',
            'hindrance', 'weaken', 'impair', 'dps'
        ];
        
        // Check description for damage keywords
        const hasDamageInDesc = damageKeywords.some(keyword => desc.includes(keyword));
        
        // Check subtype for damage indicators
        const hasDamageSubtype = subtype.includes('damage') || subtype.includes('attack') || 
                                subtype.includes('strike') || subtype.includes('shot');
        
        // Check if ability has damage scaling
        const hasDamageScaling = ability.scaling && ability.scaling > 0;
        
        return hasDamageInDesc || hasDamageSubtype || hasDamageScaling;
    }

    // Helper function to get currently selected augments
    function getSelectedAugments() {
        const selectedAugments = new Set();
        augmentSelects.forEach(augmentSelect => {
            if (augmentSelect && augmentSelect.value) {
                selectedAugments.add(augmentSelect.value);
            }
        });
        return selectedAugments;
    }

    // Create augment selection UI for each ability
    function createAugmentUI() {
        // Preserve existing augment selections
        const existingAugments = [];
        const currentAugmentWrappers = document.querySelectorAll('#augments-container .augment-wrapper');
        currentAugmentWrappers.forEach((wrapper) => {
            const augmentSelect = wrapper.querySelector('.augment-select');
            if (augmentSelect && augmentSelect.value) {
                const abilityLabel = wrapper.querySelector('.augment-ability-name');
                if (abilityLabel) {
                    existingAugments.push({
                        abilityName: abilityLabel.textContent,
                        augmentValue: augmentSelect.value
                    });
                }
            }
        });
        
        // Clear existing augment selections
        augmentsContainer.innerHTML = '';
        augmentSelects.length = 0;

        // Get all selected abilities
        const allAbilitySelects = [...activeSelects, ...eliteActiveSelects, ...auxActiveSelects];
        
        allAbilitySelects.forEach((abilitySelect, index) => {
            const abilityIndex = tswData[abilitySelect.value];
            if (!abilityIndex) return; // Skip empty slots

            const wrapper = document.createElement('div');
            wrapper.className = 'slot-wrapper augment-wrapper';
            
            // Create ability name label
            const label = document.createElement('div');
            label.className = 'augment-ability-name';
            label.textContent = abilityIndex.name;
            wrapper.appendChild(label);

            // Create augment dropdown
            const augmentSelect = document.createElement('select');
            augmentSelect.className = 'augment-select';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'No Augment';
            augmentSelect.appendChild(emptyOption);

            // Get currently selected augments (excluding current one)
            const selectedAugments = getSelectedAugments();
            
            // Check if current ability can use damage augments
            const canUseDamageAugments = isDamageAbility(abilityIndex);

            // Add augment options grouped by type
            const damageAugments = Object.entries(AUGMENTS).filter(([key, aug]) => aug.type === 'damage');
            const supportAugments = Object.entries(AUGMENTS).filter(([key, aug]) => aug.type === 'support');

            // Add damage augments (only if ability can use them)
            if (damageAugments.length > 0 && canUseDamageAugments) {
                const damageGroup = document.createElement('optgroup');
                damageGroup.label = 'Damage Augments';
                damageAugments.forEach(([key, augment]) => {
                    // Skip if already selected
                    if (selectedAugments.has(key)) return;
                    
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${augment.name} - ${augment.description}`;
                    damageGroup.appendChild(option);
                });
                if (damageGroup.children.length > 0) {
                    augmentSelect.appendChild(damageGroup);
                }
            }

            // Add support augments
            if (supportAugments.length > 0) {
                const supportGroup = document.createElement('optgroup');
                supportGroup.label = 'Support Augments';
                supportAugments.forEach(([key, augment]) => {
                    // Skip if already selected
                    if (selectedAugments.has(key)) return;
                    
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${augment.name} - ${augment.description}`;
                    supportGroup.appendChild(option);
                });
                if (supportGroup.children.length > 0) {
                    augmentSelect.appendChild(supportGroup);
                }
            }

            // Store the select element
            augmentSelects[index] = augmentSelect;

            // Add change event listener that enforces uniqueness
            augmentSelect.addEventListener('change', () => {
                // Check if this augment is already selected elsewhere
                const selectedValue = augmentSelect.value;
                if (selectedValue) {
                    const isDuplicate = augmentSelects.some((otherSelect, otherIndex) => 
                        otherIndex !== index && otherSelect && otherSelect.value === selectedValue
                    );
                    
                    if (isDuplicate) {
                        // Reset to empty and show warning
                        augmentSelect.value = '';
                        alert('This augment is already selected for another ability. Each augment can only be used once.');
                        return;
                    }
                }
                
                // Update available options without recreating entire UI
                updateAugmentOptions();
                calculate();
            });

            wrapper.appendChild(augmentSelect);
            augmentsContainer.appendChild(wrapper);
        });

        // If no abilities selected, show message
        if (allAbilitySelects.every(select => !select.value)) {
            augmentsContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem;">Select abilities above to configure augments</div>';
        }
        
        // Restore preserved augment selections
        existingAugments.forEach(existing => {
            const matchingWrapper = Array.from(document.querySelectorAll('#augments-container .augment-wrapper')).find(wrapper => {
                const abilityLabel = wrapper.querySelector('.augment-ability-name');
                return abilityLabel && abilityLabel.textContent === existing.abilityName;
            });
            
            if (matchingWrapper) {
                const augmentSelect = matchingWrapper.querySelector('.augment-select');
                if (augmentSelect) {
                    // Find the option with matching value
                    const option = Array.from(augmentSelect.options).find(opt => opt.value === existing.augmentValue);
                    if (option) {
                        augmentSelect.value = existing.augmentValue;
                    }
                }
            }
        });
    }

    // Update augment options without recreating entire UI
    function updateAugmentOptions() {
        augmentSelects.forEach((augmentSelect, index) => {
            if (!augmentSelect) return;
            
            const abilitySelect = [...activeSelects, ...eliteActiveSelects, ...auxActiveSelects][index];
            if (!abilitySelect || !abilitySelect.value) return;
            
            const abilityIndex = tswData[abilitySelect.value];
            if (!abilityIndex) return;
            
            // Store current selection
            const currentValue = augmentSelect.value;
            
            // Get currently selected augments (excluding current one)
            const selectedAugments = new Set();
            augmentSelects.forEach((otherSelect, otherIndex) => {
                if (otherIndex !== index && otherSelect && otherSelect.value) {
                    selectedAugments.add(otherSelect.value);
                }
            });
            
            // Check if current ability can use damage augments
            const canUseDamageAugments = isDamageAbility(abilityIndex);
            
            // Clear current options
            augmentSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'No Augment';
            augmentSelect.appendChild(emptyOption);
            
            // Add augment options grouped by type
            const damageAugments = Object.entries(AUGMENTS).filter(([key, aug]) => aug.type === 'damage');
            const supportAugments = Object.entries(AUGMENTS).filter(([key, aug]) => aug.type === 'support');

            // Add damage augments (only if ability can use them)
            if (damageAugments.length > 0 && canUseDamageAugments) {
                const damageGroup = document.createElement('optgroup');
                damageGroup.label = 'Damage Augments';
                damageAugments.forEach(([key, augment]) => {
                    // Skip if already selected
                    if (selectedAugments.has(key)) return;
                    
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${augment.name} - ${augment.description}`;
                    damageGroup.appendChild(option);
                });
                if (damageGroup.children.length > 0) {
                    augmentSelect.appendChild(damageGroup);
                }
            }

            // Add support augments
            if (supportAugments.length > 0) {
                const supportGroup = document.createElement('optgroup');
                supportGroup.label = 'Support Augments';
                supportAugments.forEach(([key, augment]) => {
                    // Skip if already selected
                    if (selectedAugments.has(key)) return;
                    
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${augment.name} - ${augment.description}`;
                    supportGroup.appendChild(option);
                });
                if (supportGroup.children.length > 0) {
                    augmentSelect.appendChild(supportGroup);
                }
            }
            
            // Restore current selection if it's still valid
            if (currentValue && !selectedAugments.has(currentValue)) {
                augmentSelect.value = currentValue;
            }
        });
    }

    // Mathematical Helpers

    // Get augment effects for a specific ability
    function getAugmentEffectsForAbility(abilityIndex) {
        const augmentSelect = augmentSelects[abilityIndex];
        if (!augmentSelect || !augmentSelect.value) {
            return null;
        }
        
        return AUGMENTS[augmentSelect.value];
    }

    function getAbilityStats(ability, cp, critChance, critPower, penChance, resourcesUsed, minResources) {

        if (!ability) return null;

        // Handle undefined minResources
        if (minResources === undefined) {
            minResources = 0;
        }

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

        // Respect minimum resource requirement if set
        if (minResources && minResources > 0) {
            effectiveResources = Math.max(resourcesUsed, minResources);
        }

        if (resourceConsumption > 0 && !damageScalesWithResources) {

            effectiveResources = resourceConsumption;

        }



        // --- Enhanced scaling selection with RDB data ---

        let scalingToUse = ability.scaling || 0;

        // Refined resource scaling detection - only true variable scaling abilities
        // Must satisfy ALL criteria:
        // 1. Consume "all resources" (not fixed amounts)
        // 2. Have scaling_1 and scaling_5 data with different values
        // 3. Explicitly mention scaling with resources OR have damage ranges
        const consumesAllResources = /consumes all.*resources?/i.test(desc.replace(/\s+/g, ' '));
        const mentionsScaling = (/based on the number of resources consumed/i.test(desc) ||
                               /Damage scales based on the number of resources consumed/i.test(desc));
        const hasVariableScaling = ability.scaling_1 > 0 && ability.scaling_5 > 0 && ability.scaling_1 !== ability.scaling_5;
        const hasDamageRange = /\d+\s*-\s*\d+/.test(desc);
        
        // Only apply to abilities that truly consume variable amounts of resources
        const canScaleWithResources = consumesAllResources && hasVariableScaling && (mentionsScaling || hasDamageRange);

        // Check for enhanced resource scaling data, but only apply to abilities that can scale
        if (ability.scaling_5 > 0 && ability.scaling_1 > 0 && canScaleWithResources) {
            
            // Use specific resource scaling if available
            const resourceKey = `scaling_${effectiveResources}`;
            if (ability[resourceKey] !== undefined && ability[resourceKey] !== null) {
                scalingToUse = ability[resourceKey];
            } else {
                // Improved fallback to linear interpolation with better precision
                // Ensure effectiveResources is within valid range (1-5)
                const clampedResources = Math.max(1, Math.min(5, effectiveResources));
                
                if (clampedResources === 1) {
                    scalingToUse = ability.scaling_1;
                } else if (clampedResources === 5) {
                    scalingToUse = ability.scaling_5;
                } else {
                    // More precise linear interpolation for resources 2-4
                    const progress = (clampedResources - 1) / 4; // 0.25, 0.5, 0.75 for resources 2, 3, 4
                    scalingToUse = ability.scaling_1 + progress * (ability.scaling_5 - ability.scaling_1);
                    
                    // Add logging for debugging scaling calculations (disabled in production)
                    // if (TEST_MODE && ability.name.includes('Test')) {
                    //     console.log(`Scaling interpolation for ${ability.name}: resources=${effectiveResources}, scaling=${scalingToUse.toFixed(6)}`);
                    // }
                }
            }
            
        } else if (ability.scaling_5 > 0 && effectiveResources === 5 && canScaleWithResources) {
            scalingToUse = ability.scaling_5;
        } else if (resourceConsumption > 0 && !canScaleWithResources) {
            // For fixed resource abilities, use the scaling value that matches their fixed consumption
            const fixedResourceKey = `scaling_${resourceConsumption}`;
            if (ability[fixedResourceKey] !== undefined && ability[fixedResourceKey] !== null) {
                scalingToUse = ability[fixedResourceKey];
            } else {
                // Fallback to the main scaling value
                scalingToUse = ability.scaling || 0;
                
                // Add warning for missing fixed resource scaling data (disabled in production)
                // if (TEST_MODE && resourceConsumption > 0) {
                //     console.warn(`Missing scaling_${resourceConsumption} for fixed resource ability: ${ability.name}`);
                // }
            }
        }



        const baseDamage = scalingToUse * cp;

        // Apply augment effects to base stats
        let modifiedCritChance = critChance;
        let modifiedCritPower = critPower;
        let modifiedPenChance = penChance;
        let damageMultiplier = 1.0;

        // Note: Augment effects will be applied during simulation based on ability index
        // Here we just calculate base damage, augment effects are applied per-cast in simulation

        const critMultiplier = 1 + ((modifiedCritChance / 100) * (modifiedCritPower / 100));

        const penMultiplier = 1 + ((modifiedPenChance / 100) * 0.15);

        const avgDamage = baseDamage * critMultiplier * penMultiplier * damageMultiplier;



        // Global minimum time is 1.0 seconds

        const castTime = Math.max(ability.cast_time || 1.0, 1.0);

        const cooldown = ability.cooldown || 0;



        // Extraction of subtypes from description with improved pattern matching
        let subtype = "";

        const subtypes = ["Strike", "Blast", "Focus", "Frenzy", "Burst", "Chain"];

        // Improved subtype detection with more flexible patterns
        for (const s of subtypes) {
            // Multiple patterns to catch different text formats
            const patterns = [
                new RegExp(`\\b${s}\\s+attack\\b`, 'i'),
                new RegExp(`\\b${s}\\s+ability\\b`, 'i'),
                new RegExp(`\\b${s}\\s+damage\\b`, 'i'),
                new RegExp(`\\b${s}s\\s+attack\\b`, 'i'), // Plural form
                new RegExp(`\\b${s}s\\s+ability\\b`, 'i')  // Plural form
            ];
            
            for (const pattern of patterns) {
                if (pattern.test(desc)) {
                    subtype = s;
                    break;
                }
            }
            
            if (subtype) break;
        }



        // Check for ability-specific dependencies using improved pattern matching
        let requiresSpecificAbility = "";
        
        // Define dependency patterns for better maintainability
        const dependencyPatterns = [
            {
                // Sawed Off requires Pump Action
                requiredAbility: "Pump Action",
                patterns: [
                    /will also cause.*pump action/i,
                    /pump action.*will also cause/i,
                    /requires.*pump action/i,
                    /only works with.*pump action/i
                ]
            }
            // Add more dependency patterns here as needed
            // Example: Two Cuts requires blade weapon (handled separately in requiresBlade)
        ];
        
        // Check each dependency pattern
        for (const dependency of dependencyPatterns) {
            // Ensure dependency has patterns property before iterating
            if (dependency.patterns && Array.isArray(dependency.patterns)) {
                for (const pattern of dependency.patterns) {
                    if (pattern.test(desc)) {
                        requiresSpecificAbility = dependency.requiredAbility;
                        break;
                    }
                }
            }
            if (requiresSpecificAbility) break;
        }

        // Parse active ability self-buffs that provide damage bonuses
        let selfDamageBuff = { percent: 0, duration: 0, aoe: false };
        if (ability.type && ability.type.includes("Active")) {
            // Look for self-buff patterns in active abilities - multiple patterns
            const damageBuffMatch = desc.match(
                /damage.*is.*increased.*by\s+(\d+(?:\.\d+)?)%|damage.*increased.*by\s+(\d+(?:\.\d+)?)%|damage.*increased.*by\s+(\d+(?:\.\d+)?)%/i
            );
            if (damageBuffMatch) {
                selfDamageBuff.percent = parseFloat(damageBuffMatch[1] || damageBuffMatch[2] || damageBuffMatch[3]) || 0;
                // Extract duration if specified
                const durationMatch = desc.match(/for\s+(\d+)\s*seconds?/i);
                selfDamageBuff.duration = parseInt(durationMatch[1]) || 10; // Default 10 seconds
                // Check if it's an area effect
                selfDamageBuff.aoe = desc.includes('area') || desc.includes('radius') || desc.includes('PBAoE');
            }
        }

        // Extraction of damage bonus percentage for passive abilities
        let damageBonusPercent = 0;
        if (ability.type && ability.type.includes("Passive")) {
            // Comprehensive regex to match various DPS bonus patterns
            const bonusMatch = desc.match(
                /increases.*damage.*by\s+(\d+(?:\.\d+)?)%|damage.*by\s+(\d+(?:\.\d+)?)%|damage.*dealt.*by\s+(\d+(?:\.\d+)?)%/i
            );
            if (bonusMatch) {
                damageBonusPercent = parseFloat(bonusMatch[1] || bonusMatch[2] || bonusMatch[3]) || 0;
            }
        }

        // Check if this passive specifically increases drone/turret damage
        let affectsDronesOrTurrets = false;
        if (ability.type && ability.type.includes("Passive")) {
            if (desc.includes("turret") && desc.includes("damage")) {
                affectsDronesOrTurrets = true;
            } else if (desc.includes("drone") && desc.includes("damage")) {
                affectsDronesOrTurrets = true;
            }
        }

        // Extraction of penetration chance bonus for passive abilities
        let penetrationBonusPercent = 0;
        if (ability.type && ability.type.includes("Passive")) {
            const penMatch = desc.match(/increases.*penetration.*chance.*by\s+(\d+(?:\.\d+)?)%|penetration.*chance.*by\s+(\d+(?:\.\d+)?)%/i);
            if (penMatch) {
                penetrationBonusPercent = parseFloat(penMatch[1] || penMatch[2]) || 0;
            }
        }

        // Extraction of trigger requirements for passives

        let triggerSubtypes = [];
        let triggerCondition = ""; // New field to store specific trigger conditions

        if (ability.type && ability.type.includes("Passive")) {

            // Check for "Whenever you critically hit" pattern
            if (desc.includes("Whenever you critically hit")) {
                triggerCondition = "critical";
                triggerSubtypes = []; // Empty array means trigger on any hit that meets condition
            }
            // Check for "Whenever you penetrate" pattern  
            else if (desc.includes("Whenever you penetrate")) {
                triggerCondition = "penetrate";
                triggerSubtypes = []; // Empty array means trigger on any hit that meets condition
            }
            // Check for "Whenever you hit" pattern (triggers on any hit)
            else if (desc.includes("Whenever you hit")) {
                triggerCondition = "hit";
                triggerSubtypes = []; // Empty array means trigger on any hit
            } else {
                // Check for specific attack/ability type triggers
                for (const s of subtypes) {
                    if (desc.includes(s + " attacks") || desc.includes(s + " abilities")) {
                        triggerSubtypes.push(s);
                    }
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

        // Enhanced conditional damage detection
        // Check for various patterns that indicate bonus damage with specific debuffs
        
        // Pattern 1: "or X damage if target is [debuff]"
        const conditionalDamagePattern = /or\s+\d+\s*(?:-\s*\d+)?\s*(?:physical|magical)?\s*damage\s+if\s+the\s+target\s+is\s+(\w+)/i;
        const conditionalMatch = desc.match(conditionalDamagePattern);
        
        if (conditionalMatch) {
            const debuffType = conditionalMatch[1].toLowerCase();
            if (["weakened", "hindered", "afflicted", "impaired"].includes(debuffType)) {
                requiredDebuffs.push(debuffType);
                bonusDamageWithDebuffs = true;
            }
        }
        
        // Pattern 2: "X damage, or Y damage if target is [debuff]"
        const dualDamagePattern = /\d+\s*(?:-\s*\d+)?\s*(?:physical|magical)?\s*damage,\s*or\s+\d+\s*(?:-\s*\d+)?\s*(?:physical|magical)?\s*damage\s+if\s+the\s+target\s+is\s+(\w+)/i;
        const dualMatch = desc.match(dualDamagePattern);
        
        if (dualMatch) {
            const debuffType = dualMatch[1].toLowerCase();
            if (["weakened", "hindered", "afflicted", "impaired"].includes(debuffType)) {
                requiredDebuffs.push(debuffType);
                bonusDamageWithDebuffs = true;
            }
        }
        
        // Pattern 3: "or X damage to [debuff] targets"
        const bonusToDebuffPattern = /or\s+\d+\s*(?:-\s*\d+)?\s*(?:physical|magical)?\s*damage\s+to\s+(\w+)\s+targets/i;
        const bonusMatch = desc.match(bonusToDebuffPattern);
        
        if (bonusMatch) {
            const debuffType = bonusMatch[1].toLowerCase();
            if (["weakened", "hindered", "afflicted", "impaired"].includes(debuffType)) {
                requiredDebuffs.push(debuffType);
                bonusDamageWithDebuffs = true;
            }
        }
        
        // Pattern 4: Direct conditional phrases
        if (desc.includes("if the target is Weakened")) {
            if (!requiredDebuffs.includes("weakened")) {
                requiredDebuffs.push("weakened");
                bonusDamageWithDebuffs = true;
            }
        }

        if (desc.includes("if the target is Hindered")) {
            if (!requiredDebuffs.includes("hindered")) {
                requiredDebuffs.push("hindered");
                bonusDamageWithDebuffs = true;
            }
        }

        if (desc.includes("if the target is Impaired")) {

            requiredDebuffs.push("impaired");

            bonusDamageWithDebuffs = true;

        }

        // Check for bonus damage against debuffed targets (e.g., "or X damage to targets that are Weakened")
        // Skip abilities that mention weakened for bonus damage only (not as a requirement)
        const isBonusDamageOnly = false; // Default to false, abilities can have bonus damage
        if (!isBonusDamageOnly) {
            const bonusDamageMatch = desc.match(/or\s+(\d+)\s*[-]?\s*\d*\s*(?:physical|magical)?\s*damage\s+to\s+targets\s+that\s+are\s+(\w+)/i);

            if (bonusDamageMatch) {

                const debuffType = bonusDamageMatch[2].toLowerCase();

                if (["afflicted", "weakened", "hindered", "impaired"].includes(debuffType)) {

                    requiredDebuffs.push(debuffType);

                    bonusDamageWithDebuffs = true;

                }

            }

        }

        // Check what debuffs this ability applies

        let appliedDebuffs = [];

        let appliedDebuffDurations = {};

        let dotDamage = 0; // Damage per second/tick for DoT effects

        let dotInterval = 1.0; // Default interval for DoT ticks (1 second)

        let dotDuration = 0; // Total duration of DoT effect

        if (desc.includes("become Afflicted") || desc.includes("becomes Afflicted")) {

            appliedDebuffs.push("afflicted");

            // Extract duration and damage for affliction

            const afflictDurationMatch = desc.match(/(\d+)\s*(?:physical|magical)?\s*damage\s+every\s+second\s+for\s+(\d+)\s+seconds/i);

            if (afflictDurationMatch) {

                dotDamage = parseInt(afflictDurationMatch[1]) || 0;

                dotDuration = parseInt(afflictDurationMatch[2]) || 0;

                appliedDebuffDurations.afflicted = dotDuration;

            } else {

                // Try alternative pattern: "deals X damage per stack for Y seconds"

                const stackMatch = desc.match(/deals\s+(\d+)\s*(?:physical|magical)?\s*damage\s+per\s+stack\s+for\s+(\d+)\s+seconds/i);

                if (stackMatch) {

                    dotDamage = parseInt(stackMatch[1]) || 0;

                    dotDuration = parseInt(stackMatch[2]) || 0;

                    appliedDebuffDurations.afflicted = dotDuration;

                } else {

                    // Try pattern: "deals X damage every second for Y seconds"

                    const simpleMatch = desc.match(/deals\s+(\d+)\s*(?:physical|magical)?\s*damage\s+every\s+second\s+for\s+(\d+)\s+seconds/i);

                    if (simpleMatch) {

                        dotDamage = parseInt(simpleMatch[1]) || 0;

                        dotDuration = parseInt(simpleMatch[2]) || 0;

                        appliedDebuffDurations.afflicted = dotDuration;

                    } else {

                        appliedDebuffDurations.afflicted = 5; // Default duration

                    }

                }

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
        // Also handle channelled abilities pattern: "Every 0.5 seconds for 2.5 seconds"
        const secondsIntervalMatch = desc.match(/(?:every|per)\s+(\d+(?:\.\d+)?)\s+seconds/i);
        const channelledMatch = desc.match(/Channelled:\s*Every\s+(\d+(?:\.\d+)?)\s+seconds\s+for\s+(\d+(?:\.\d+)?)\s+seconds/i);

        if (channelledMatch) {
            // Channelled ability - extract both interval and duration
            tickInterval = parseFloat(channelledMatch[1]);
            duration = parseFloat(channelledMatch[2]);
        } else if (secondsIntervalMatch) {
            tickInterval = parseFloat(secondsIntervalMatch[1]);
        } else if (desc.toLowerCase().includes("every seconds")) {
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

            triggerCondition,

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

            dotDamage,

            dotInterval,

            dotDuration,

            resourceConsumption,

            requiresSpecificAbility,

            damageBonusPercent,

            penetrationBonusPercent,

            selfDamageBuff,

            affectsDronesOrTurrets,

            description: ability.description,

            originalAbility: ability

        };

    }

    function calculate() {


        // Get base attack rating from input
        const baseAttackRating = parseFloat(attackRatingInput?.value || 0) || 0;
        
        // Add augment attack rating bonus (applies to all abilities)
        let totalAugmentAttackRating = 0;
        augmentSelects.forEach(augmentSelect => {
            if (augmentSelect && augmentSelect.value) {
                const augment = AUGMENTS[augmentSelect.value];
                if (augment && augment.effect.attackRating) {
                    totalAugmentAttackRating += augment.effect.attackRating;
                }
            }
        });
        
        const effectiveAttackRating = baseAttackRating + totalAugmentAttackRating;
        
        // Calculate CP with effective attack rating
        let cp;
        const weaponPower = parseFloat(weaponPowerInput?.value || 528) || 528;
        
        if (effectiveAttackRating < 5200) {
            cp = Math.round((375 - (600 / (Math.pow(Math.E, (effectiveAttackRating / 1400)) + 1))) * (1 + (weaponPower / 375)));
        } else {
            const c = (0.00008 * weaponPower) + 0.0301;
            cp = Math.round(204.38 + (0.5471 * weaponPower) + (c * effectiveAttackRating));
        }

        // Update CP input field to show effective CP
        if (cpInput) {
            cpInput.value = cp;
        }

        const hitRatingGlobal = parseFloat(hitRatingInput?.value || 0) || 0;

        const critChanceGlobal = parseFloat(critChanceInput?.value || 0) || 0;

        const critPowerGlobal = parseFloat(critPowerInput?.value || 0) || 0;

        const penChanceGlobal = parseFloat(penChanceInput?.value || 0) || 0;

        const simTimeMins = parseFloat(simTimeInput?.value || 3) || 3;

        const targetSeconds = simTimeMins * 60;



        // Helper: given a weapon name, return the effective ratings & derived stats

        // taking into account that weapon-specific glyph ratings only affect that weapon.

        function getStatsForWeapon(weaponName) {

            const pools = window._weaponRatingPools;



            if (!pools || !weaponName) {

                return {

                    hitRating: hitRatingGlobal,

                    critChance: critChanceGlobal,

                    critPower: critPowerGlobal,

                    penRating: parseFloat(penRatingInput?.value || 0) || 0,

                    penChance: penChanceGlobal

                };

            }



            const base = pools.base || { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };

            const w1 = (pools.weapon1Name === weaponName) ? (pools.weapon1 || {}) : {};

            const w2 = (pools.weapon2Name === weaponName) ? (pools.weapon2 || {}) : {};



            // Add stacking buff ratings to base ratings

            const critRatingBuff = getBuffRating('critRatingStacks');

            const critPowerRatingBuff = getBuffRating('critPowerRatingStacks');

            const penRatingBuff = getBuffRating('penRatingStacks');

            const hitRatingBuff = getBuffRating('hitRatingStacks');



            const totalCritRating = (base.critRating || 0) + (w1.critRating || 0) + (w2.critRating || 0) + critRatingBuff;

            const totalCritPowerRating = (base.critPowerRating || 0) + (w1.critPowerRating || 0) + (w2.critPowerRating || 0) + critPowerRatingBuff;

            const totalPenRating = (base.penRating || 0) + (w1.penRating || 0) + (w2.penRating || 0) + penRatingBuff;

            const totalHitRating = (base.hitRating || 0) + (w1.hitRating || 0) + (w2.hitRating || 0) + hitRatingBuff;



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



        function collectActivesWithOrder(selects, resourcesForActives, cp) {

            return selects

                .map(sel => {

                    const ability = tswData[sel.value];

                    if (!ability) return null;

                    const wStats = getStatsForWeapon(ability.weapon);

                    const minResVal = parseInt(sel.dataset.minResources || '0');
                    const minResources = !isNaN(minResVal) ? minResVal : 0;
                    
                    const stats = getAbilityStats(ability, cp, wStats.critChance, wStats.critPower, wStats.penChance, resourcesForActives, minResources);

                    const orderVal = parseFloat(sel.dataset.order || '');

                    stats.orderPriority = !isNaN(orderVal) && orderVal > 0 ? orderVal : 0;

                    stats.minResources = minResources;

                    // Copy all scaling properties from the original ability
                    stats.scaling_1 = ability.scaling_1;
                    stats.scaling_2 = ability.scaling_2;
                    stats.scaling_3 = ability.scaling_3;
                    stats.scaling_4 = ability.scaling_4;
                    stats.scaling_5 = ability.scaling_5;

                    return stats;

                })
                .filter(Boolean);
        }


        const actives = collectActivesWithOrder(activeSelects, 0, cp);

        const eliteActives = collectActivesWithOrder(eliteActiveSelects, 0, cp);

        const auxActives = collectActivesWithOrder(auxActiveSelects, 0, cp);

        const elitePass = elitePassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => {

            const wStats = getStatsForWeapon(a.weapon);

            return getAbilityStats(a, cp, wStats.critChance, wStats.critPower, wStats.penChance, 5, 0);

        });

        const normPass = normalPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => {

            const wStats = getStatsForWeapon(a.weapon);

            return getAbilityStats(a, cp, wStats.critChance, wStats.critPower, wStats.penChance, 5, 0);

        });

        const auxPass = auxPassiveSelects.map(sel => tswData[sel.value]).filter(Boolean).map(a => {

            const wStats = getStatsForWeapon(a.weapon);

            return getAbilityStats(a, cp, wStats.critChance, wStats.critPower, wStats.penChance, 5, 0);

        });

        let allActives = [...actives, ...eliteActives, ...auxActives];

        allActives.sort((a, b) => (a.orderPriority || 0) - (b.orderPriority || 0));
        
        

        const allPassives = [...elitePass, ...normPass, ...auxPass];

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

        let auxResources = 0;

        let totalDamage = 0;

        const statsBreakdown = {};

        // Create stable statsBreakdown keys that don't depend on sorted order
        allActives.forEach((a, index) => {
            const key = `active_${a.weapon}_${a.name}`;
            statsBreakdown[key] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: a.name };
        });
        
        allPassives.forEach((a, index) => {
            const key = `passive_${a.weapon}_${a.name}`;
            statsBreakdown[key] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: a.name };
        });

        // Pre-create a separate line for Dust of the Black Pharaoh procs

        const DUST_NAME = 'Dust of the Black Pharaoh (Proc)';

        statsBreakdown[DUST_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0 };

        const ELE_OVERLOAD_NAME = 'Elemental Overload (Proc)';

        statsBreakdown[ELE_OVERLOAD_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0 };

        // Pre-create Power Line breakdown entries
        const POWER_LINE_TETHER_NAME = 'Power Line (Tether)';
        statsBreakdown[POWER_LINE_TETHER_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: "Power Line (Tether)" };
        
        const VOLTAIC_DETONATION_NAME = 'Voltaic Detonation';
        statsBreakdown[VOLTAIC_DETONATION_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: "Voltaic Detonation" };



        const activeCooldowns = allActives.map(() => 0);

        const passiveCooldowns = allPassives.map(() => 0);

        const passiveHitCounters = allPassives.map(() => 0);

        // Enhanced counter tracking for threshold-based passives

        const passiveCounters = allPassives.map(() => 0); // Current counter value

        const passiveCounterCooldowns = allPassives.map(() => 0); // Cooldown after counter trigger

        

        // Passive trigger rate limiting - maximum once per second

        let lastPassiveTriggerTime = allPassives.map(() => 0);

        

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

        

        
        

        // Function to update buff stacks

        function updateBuffStacks(buffType, currentTime) {

            try {

                const buff = playerBuffs[buffType];

                if (!buff) return;

                

                // Remove expired stacks

                buff.stackValues = buff.stackValues.filter(expireTime => expireTime > currentTime);

                buff.stacks = buff.stackValues.length;

            } catch (e) {

                // playerBuffs is not yet initialized

                return;

            }

        }

        

        // Function to add a buff stack

        function addBuffStack(buffType, currentTime) {

            try {

                const buff = playerBuffs[buffType];

                if (!buff) return;

                

                // Add new stack with expiration time

                const expireTime = currentTime + buff.duration;

                buff.stackValues.push(expireTime);

                

                // Enforce max stacks limit

                if (buff.stackValues.length > buff.maxStacks) {

                    buff.stackValues.shift(); // Remove oldest stack

                }

                

                buff.stacks = buff.stackValues.length;

            } catch (e) {

                // playerBuffs is not yet initialized

                return;

            }

        }

        

        // Function to get current rating from buff

        function getBuffRating(buffType) {

            try {

                const buff = playerBuffs[buffType];

                if (!buff) return 0;

                

                return buff.stacks * buff.ratingPerStack;

            } catch (e) {

                // playerBuffs is not yet initialized

                return 0;

            }

        }

        

        // Function to update all stacking buffs (call each simulation step)

        function updateAllStackingBuffs(currentTime) {

            updateBuffStacks('critRatingStacks', currentTime);

            updateBuffStacks('critPowerRatingStacks', currentTime);

            updateBuffStacks('hitRatingStacks', currentTime);

            updateBuffStacks('penRatingStacks', currentTime);

            updateBuffStacks('defenceRatingStacks', currentTime);

            updateBuffStacks('evadeRatingStacks', currentTime);

            updateBuffStacks('blockRatingStacks', currentTime);

            

            // Update Live Wire effect

            try {

                if (playerBuffs.liveWire.active && currentTime >= playerBuffs.liveWire.endTime) {

                    playerBuffs.liveWire.active = false;

                    playerBuffs.liveWire.endTime = 0;

                }

            } catch (e) {

                // playerBuffs not yet initialized

            }

            

            // Update Power Line stacks

            try {

                const powerLineBuff = playerBuffs.powerLineStacks;

                if (powerLineBuff.stacks > 0) {

                    // Remove expired stacks (older than 10 seconds)

                    powerLineBuff.stackValues = powerLineBuff.stackValues.filter(stackTime => currentTime - stackTime < 10);

                    powerLineBuff.stacks = powerLineBuff.stackValues.length;

                    // Update damage bonus percent (20% per stack, max 200%)

                    powerLineBuff.damageBonusPercent = Math.min(200, powerLineBuff.stacks * 20);

                }

            } catch (e) {

                // playerBuffs not yet initialized

            }

        }

        

        // Function to activate Live Wire effect

        function activateLiveWire(currentTime) {

            try {

                // Only activate if not already active to prevent race conditions
                if (!playerBuffs.liveWire.active) {
                    playerBuffs.liveWire.active = true;
                    playerBuffs.liveWire.endTime = currentTime + 10; // 10 second duration for next hit
                    playerBuffs.liveWire.activatedTime = currentTime; // Track when it was activated
                }

            } catch (e) {

                // playerBuffs not yet initialized - initialize it safely
                if (!playerBuffs) {
                    playerBuffs = {};
                }
                if (!playerBuffs.liveWire) {
                    playerBuffs.liveWire = {
                        active: false,
                        endTime: 0,
                        activatedTime: 0
                    };
                }
                // Retry activation after initialization
                if (!playerBuffs.liveWire.active) {
                    playerBuffs.liveWire.active = true;
                    playerBuffs.liveWire.endTime = currentTime + 10;
                    playerBuffs.liveWire.activatedTime = currentTime;
                }

            }

        }

        

        // Function to add Power Line stack

        function addPowerLineStack(currentTime) {

            try {

                // Ensure powerLineStacks is properly initialized
                if (!playerBuffs.powerLineStacks) {
                    playerBuffs.powerLineStacks = {
                        stacks: 0,
                        maxStacks: 10,
                        duration: 10,
                        stackValues: [],
                        damageBonusPercent: 0
                    };
                }

                const powerLineBuff = playerBuffs.powerLineStacks;

                // Add current time as a new stack
                powerLineBuff.stackValues.push(currentTime);

                // Clean up expired stacks (older than 10 seconds)
                const cutoffTime = currentTime - 10;
                powerLineBuff.stackValues = powerLineBuff.stackValues.filter(stackTime => stackTime > cutoffTime);

                // Update stack count
                powerLineBuff.stacks = powerLineBuff.stackValues.length;

                // Update damage bonus percent (20% per stack, max 200%)
                powerLineBuff.damageBonusPercent = Math.min(200, powerLineBuff.stacks * 20);

                // Debug logging for Power Line stacks (disabled in production)
                // if (TEST_MODE && powerLineBuff.stacks > 0) {
                //     console.log(`Power Line stacks: ${powerLineBuff.stacks}, damage bonus: ${powerLineBuff.damageBonusPercent}%`);
                // }

            } catch (e) {

                console.error('Error in addPowerLineStack:', e);

                // Initialize with safe defaults if error occurs
                if (!playerBuffs.powerLineStacks) {
                    playerBuffs.powerLineStacks = {
                        stacks: 0,
                        maxStacks: 10,
                        duration: 10,
                        stackValues: [],
                        damageBonusPercent: 0
                    };
                }

            }

        }

        

        // Function to clear Power Line stacks (when Voltaic Detonation is used)

        function clearPowerLineStacks() {

            try {

                const powerLineBuff = playerBuffs.powerLineStacks;

                powerLineBuff.stacks = 0;

                powerLineBuff.stackValues = [];

                powerLineBuff.damageBonusPercent = 0;

            } catch (e) {

                // playerBuffs not yet initialized

            }

        }

        

        // Function to check if Live Wire is active and consume it

        function consumeLiveWire(currentTime) {

            try {

                // Ensure playerBuffs and liveWire are properly initialized
                if (!playerBuffs || !playerBuffs.liveWire) {
                    return 0;
                }

                // Check if Live Wire is active and within duration
                if (playerBuffs.liveWire.active && currentTime <= playerBuffs.liveWire.endTime) {
                    
                    // Deactivate Live Wire to prevent multiple consumptions
                    playerBuffs.liveWire.active = false;
                    playerBuffs.liveWire.endTime = 0;
                    playerBuffs.liveWire.activatedTime = 0;
                    
                    // Return 1 to indicate Live Wire was consumed (damage will be calculated using RDB scaling)
                    return 1;

                } else if (playerBuffs.liveWire.active && currentTime > playerBuffs.liveWire.endTime) {
                    // Expired Live Wire - clean it up
                    playerBuffs.liveWire.active = false;
                    playerBuffs.liveWire.endTime = 0;
                    playerBuffs.liveWire.activatedTime = 0;
                }

            } catch (e) {

                // Handle any unexpected errors gracefully
                console.error('Error in consumeLiveWire:', e);

            }

            return 0;

        }

        

        // Function to get current Power Line damage bonus

        function getPowerLineDamageBonus() {

            try {

                return playerBuffs.powerLineStacks.damageBonusPercent || 0;

            } catch (e) {

                // playerBuffs not yet initialized

                return 0;

            }

        }

        

        
        

        // Function to check if ability would affect player instead of enemy

        function wouldAffectPlayer(ability) {

            // Check for abilities that could potentially affect player

            const desc = ability.description || ability.originalAbility?.description || "";

            

            // Area-of-effect abilities that could catch player

            if (desc.includes("radius") || desc.includes("area") || desc.includes("around")) {

                // These are designed to affect enemies in an area

                return false; // Assume they only affect enemies, not player

            }

            

            // Mine/trap abilities that could be triggered by player

            if (desc.includes("mine") || desc.includes("trap")) {

                return false; // Assume they only trigger on enemies

            }

            

            // Purge/cleanse abilities - ensure they only target enemies

            if (desc.includes("purge") || desc.includes("cleanse") || desc.includes("remove")) {

                return false; // Only affect enemy beneficial effects

            }

            

            return false; // Default: abilities don't affect player

        }

        

        // Function to check if ability would affect drones/turrets (which we want to prevent)

        function wouldAffectDronesOrTurrets(ability) {

            const desc = ability.description || ability.originalAbility?.description || "";

            const name = ability.name || "";

            

            // Only block abilities that specifically mention targeting drones/turrets in a hostile way

            // Most abilities target enemies, not friendly drones/turrets

            // This is mainly a safeguard for abilities that might have specific drone/turret targeting

            if (desc.includes("targets drones") || desc.includes("targets turrets") ||
                desc.includes("destroy drone") || desc.includes("destroy turret") ||
                name.toLowerCase().includes("anti-drone") || name.toLowerCase().includes("anti-turret")) {

                return true; // This ability specifically targets friendly drones/turrets

            }

            

            return false; // Default: abilities don't target friendly drones/turrets

        }

        

        let activeEffects = [];

        // DoT effect tracking system

        let activeDoTEffects = [];
        
        // Player buff tracking system
        let playerBuffs = {
            // Damage buffs
            deadlyAim: { active: false, endTime: 0, critChanceBonus: 0 },
            breachingShot: { active: false, endTime: 0, penChanceBonus: 0 },
            lethality: { active: false, endTime: 0, stacks: 0, damageBonusPercent: 0 },
            outForAKill: { active: false, endTime: 0, penChanceBonus: 0 },
            noContest: { active: false, endTime: 0, damageBonusPercent: 0 },
            
            // Penetration buffs
            minorPenetration: { active: false, endTime: 0, penChanceBonus: 0 },
            penetrationRating: { active: false, endTime: 0, stacks: 0, penRatingBonus: 0 },
            
            // Protection buffs
            protection: { active: false, endTime: 0, stacks: 0, protectionBonus: 0 },
            flakJacket: { active: false, endTime: 0, damageReduction: 0 },
            defensiveTurret: { active: false, endTime: 0, damageReduction: 0 },
            
            // Utility buffs
            lockStockBarrel: { active: false, endTime: 0 },
            shotgunWedding: { active: false, endTime: 0, stacks: 0, damageBonusPercent: 0 },
            
            // Active ability self-buffs
            mastersHouse: { active: false, endTime: 0, damageBonusPercent: 0 },
            genericDamageBuff: { active: false, endTime: 0, damageBonusPercent: 0 },
            
            // Short Fuse team damage buff
            shortFuse: { active: false, endTime: 0, damageBonusPercent: 0 },
            
            // Cooldown effects
            uncalibrated: { active: false, endTime: 0 }, // Deadly Aim cooldown
            depleted: { active: false, endTime: 0 }, // Breaching Shot cooldown
            
            // Stacking rating buffs (for abilities that grant rating stacks with duration)
            critRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 8, // seconds per stack
                stackValues: [], // track when each stack expires
                ratingPerStack: 40
            },
            critPowerRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 10, // seconds per stack
                stackValues: [],
                ratingPerStack: 40
            },
            hitRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 8, // seconds per stack
                stackValues: [],
                ratingPerStack: 40
            },
            penRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 8, // seconds per stack
                stackValues: [],
                ratingPerStack: 40
            },
            defenceRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 8, // seconds per stack
                stackValues: [],
                ratingPerStack: 40
            },
            evadeRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 8, // seconds per stack
                stackValues: [],
                ratingPerStack: 40
            },
            blockRatingStacks: {
                stacks: 0,
                maxStacks: 5,
                duration: 8, // seconds per stack
                stackValues: [],
                ratingPerStack: 40
            },
            
            // Live Wire effect tracking
            liveWire: {
                active: false,
                endTime: 0,
                activatedTime: 0 // Track when it was activated to prevent race conditions
            },
            
            // Power Line stacking effect tracking
            powerLineStacks: {
                stacks: 0,
                maxStacks: 10, // 10 seconds of tether = max stacks
                duration: 10, // Total duration of tether
                stackValues: [], // Track when each stack was gained
                damageBonusPercent: 0 // Current damage bonus percent (up to 200%)
            }
        };
        
        // Clear buffs for abilities that are not equipped (moved here after playerBuffs is defined)
        const equippedAbilityNames = new Set(allActives.map(action => action.name));
        
        // Clear Short Fuse if not equipped
        if (!equippedAbilityNames.has("Short Fuse") && playerBuffs.shortFuse.active) {
            playerBuffs.shortFuse.active = false;
            playerBuffs.shortFuse.endTime = 0;
            playerBuffs.shortFuse.damageBonusPercent = 0;
        }
        
        // Clear Masters House if not equipped
        if (!equippedAbilityNames.has("Masters House") && playerBuffs.mastersHouse.active) {
            playerBuffs.mastersHouse.active = false;
            playerBuffs.mastersHouse.endTime = 0;
            playerBuffs.mastersHouse.damageBonusPercent = 0;
        }
        
        // Clear Shotgun Wedding if not equipped
        if (!equippedAbilityNames.has("Shotgun Wedding") && playerBuffs.shotgunWedding.active) {
            playerBuffs.shotgunWedding.active = false;
            playerBuffs.shotgunWedding.endTime = 0;
            playerBuffs.shotgunWedding.stacks = 0;
            playerBuffs.shotgunWedding.damageBonusPercent = 0;
        }
        
        // Clear Deadly Aim if not equipped
        if (!equippedAbilityNames.has("Deadly Aim") && playerBuffs.deadlyAim.active) {
            playerBuffs.deadlyAim.active = false;
            playerBuffs.deadlyAim.endTime = 0;
            playerBuffs.deadlyAim.critChanceBonus = 0;
        }
        
        // Clear Breaching Shot if not equipped
        if (!equippedAbilityNames.has("Breaching Shot") && playerBuffs.breachingShot.active) {
            playerBuffs.breachingShot.active = false;
            playerBuffs.breachingShot.endTime = 0;
            playerBuffs.breachingShot.penChanceBonus = 0;
        }
        
        // Clear Out For A Kill if not equipped
        if (!equippedAbilityNames.has("Out For A Kill") && playerBuffs.outForAKill.active) {
            playerBuffs.outForAKill.active = false;
            playerBuffs.outForAKill.endTime = 0;
            playerBuffs.outForAKill.penChanceBonus = 0;
        }
        
        // Clear Flak Jacket if not equipped
        if (!equippedAbilityNames.has("Flak Jacket") && playerBuffs.flakJacket.active) {
            playerBuffs.flakJacket.active = false;
            playerBuffs.flakJacket.endTime = 0;
            playerBuffs.flakJacket.damageReduction = 0;
        }
        
        // Clear Defensive Turret if not equipped
        if (!equippedAbilityNames.has("Defensive Turret") && playerBuffs.defensiveTurret.active) {
            playerBuffs.defensiveTurret.active = false;
            playerBuffs.defensiveTurret.endTime = 0;
            playerBuffs.defensiveTurret.damageReduction = 0;
        }
        
        // Clear Lock, Stock & Barrel if not equipped
        if (!equippedAbilityNames.has("Lock, Stock & Barrel") && playerBuffs.lockStockBarrel.active) {
            playerBuffs.lockStockBarrel.active = false;
            playerBuffs.lockStockBarrel.endTime = 0;
        }
        
        // Team buffs from augment procs
        const teamBuffs = {
            damageBuff: { active: false, endTime: 0, percent: 0 },
            healingBuff: { active: false, endTime: 0, percent: 0 },
            damageReduction: { active: false, endTime: 0, percent: 0 }
        };
        
        // Augment cooldown tracking
        const augmentCooldowns = new Map(); // Map<abilityIndex, endTime>

        

        // Cast tracking system

        let currentCastEndTime = 0;

        let castingAbility = null;

        

        // Talisman effect tracking system

        let talismanEffects = {

            // Mother's Wrath: After X non-penetrating hits, trigger effect (from Woodcutter's Wrath neck)

            mothersWrath: {

                nonPenHits: 0,

                requiredHits: 5, // Mother's Wrath triggers after 5 non-penetrating hits

                cooldown: 0,

                maxCooldown: 10, // 10 second internal cooldown

                damage: 500, // Default damage, will be updated from talisman data

                enabled: false // Will be enabled if Woodcutter's Wrath neck talisman is detected

            },

            

            // Lycanthrope Bone Powder: Critical hits increase penetration rating (waist talisman)

            lycanthropeBonePowder: {

                penetrationBonus: 100, // +100 penetration rating on crit

                duration: 10, // 10 second duration

                endTime: 0,

                enabled: false // Will be enabled if Lycanthrope Bone Powder waist talisman is detected

            },

            

            // Essential Salted of Joseph Curwen: Healing effects increase damage (ring talisman)

            essentialSaltedCurwen: {

                damageBonus: 0.15, // 15% damage bonus when healed

                duration: 8, // 8 second duration

                endTime: 0,

                lastHealTime: 0,

                enabled: false // Will be enabled if Essential Salted of Joseph Curwen ring talisman is detected

            },

            

            // Amulet of Yuggoth: Increases damage from afflictions (neck talisman) - REAL TALISMAN

            amuletOfYuggoth: {

                afflictionDamageBonus: 0.20, // 20% increased affliction damage

                enabled: false // Will be enabled if Amulet of Yuggoth neck talisman is detected

            }

        };

        

        // ========================================

        // TALISMAN DETECTION FROM IMPORTED GEAR

        // ========================================

        

        // Check for Woodcutter's Wrath neck talisman in imported gear

        // Mother's Wrath is an effect of the specific Woodcutter's Wrath talisman, not a signet

        const importedGear = window._importedGear || {};

        

        // Woodcutter's Wrath is typically a high-level neck talisman, let's check for common IDs

        // The exact ID would need to be determined from TSWCalc data

        if (importedGear.neck && (

            importedGear.neck.talismanId === 82 ||  // Common elite neck ID

            importedGear.neck.talismanId === 84 ||  // Another elite neck ID  

            importedGear.neck.talismanId === 86 ||  // Another elite neck ID

            importedGear.neck.talismanId >= 200     // High-level neck talismans

        )) {

            talismanEffects.mothersWrath.enabled = true;

            

            // Extract damage based on talisman quality

            const quality = importedGear.neck.quality || 1; // 1=Normal, 2=Elite, 3=Epic

            const damageValues = [400, 500, 600]; // Damage values by quality

            talismanEffects.mothersWrath.damage = damageValues[quality - 1] || 500;

        } else {

            talismanEffects.mothersWrath.enabled = false;

        }

        

        // Check for Dust of the Black Pharaoh head talisman and auto-activate

        if (importedGear.head && (

            importedGear.head.talismanId === 81 ||  // Common elite head ID

            importedGear.head.talismanId === 83 ||  // Another elite head ID

            importedGear.head.talismanId === 85 ||  // Another elite head ID

            importedGear.head.talismanId >= 200      // High-level head talismans

        )) {

            window._dustSignetActive = true;

        } else {

            window._dustSignetActive = false;

        }

        

        // Check for Lycanthrope Bone Powder waist talisman

        if (importedGear.waist && (

            importedGear.waist.talismanId === 59 ||  // Venice waist talisman ID (might be Lycanthrope Bone Powder)

            importedGear.waist.talismanId >= 200    // High-level waist talismans

        )) {

            talismanEffects.lycanthropeBonePowder.enabled = true;

        } else {

            talismanEffects.lycanthropeBonePowder.enabled = false;

            talismanEffects.lycanthropeBonePowder.endTime = 0;

        }

        

        // Check for Essential Salted of Joseph Curwen ring talisman

        if (importedGear.ring && (

            importedGear.ring.talismanId === 62 ||  // Howling Oni ring ID (might be Essential Salted)

            importedGear.ring.talismanId >= 200     // High-level ring talismans

        )) {

            talismanEffects.essentialSaltedCurwen.enabled = true;

        } else {

            talismanEffects.essentialSaltedCurwen.enabled = false;

            talismanEffects.essentialSaltedCurwen.endTime = 0;

        }

        

        // Check for Amulet of Yuggoth neck talisman (REAL TALISMAN)

        if (importedGear.neck && (

            importedGear.neck.talismanId === 87 ||  // Another high-level neck ID

            importedGear.neck.talismanId === 88 ||  // Another high-level neck ID

            importedGear.neck.talismanId >= 300     // Very high-level neck talismans

        )) {

            talismanEffects.amuletOfYuggoth.enabled = true;

        } else {

            talismanEffects.amuletOfYuggoth.enabled = false;

        }



        


        const primWeapon = weaponSelect.value;

        const secWeapon = secondaryWeaponSelect.value;

        const auxWeapon = auxWeaponSelect.value;
        

        const hasElementalWeapon = (primWeapon === 'Elementalism' || secWeapon === 'Elementalism');

        const hasBladeWeapon = (primWeapon === 'Blade' || secWeapon === 'Blade');

        const hasHammerWeapon = (primWeapon === 'Hammer' || secWeapon === 'Hammer');

        const enemy = ENEMIES[targetEnemySelect.value] || ENEMIES['training-puppet'];

        const POWER_LINE_NAME = "Power Line-Voltaic Detonation";

        

        // Momentum tracking for Hammer abilities

        let momentumStacks = 0;

        const MAX_MOMENTUM_STACKS = 5;

        

        // previous tether state tracking is no longer needed when we auto‑detonate

        let elementalFuryEndTime = 0;

        


        // ========================================

        // COMBAT FUNCTIONS

        // ========================================



        function performAttack(ability, weaponForStats, debuffState = {}, cp = 0, actualConsumedResources = 0) {


            // Deterministic Combat Logic

            const stats = getStatsForWeapon(weaponForStats || ability.weapon);

            const hitRating = stats.hitRating;

            const penRating = stats.penRating;

            const penChance = stats.penChance;

            const critChance = stats.critChance;

            const critPower = stats.critPower;

            let damageMult = 1.0;

            let passivePenetrationBonus = 0;

            // Initialize augment bonuses (will be populated later)
            let augmentMult = 1.0;
            let augmentPenChanceBonus = 0;
            let augmentCritChanceBonus = 0;
            let augmentCritPowerBonus = 0;
            let augmentHitRatingBonus = 0;
            let augmentEvadeReductionBonus = 0;

            // ========================================

            // HIT CALCULATION

            const currentHitRating = hitRating + augmentHitRatingBonus;

            const effectiveEvadeRating = Math.max(0, enemy.evadeRating - augmentEvadeReductionBonus);
            const isEvaded = effectiveEvadeRating > currentHitRating;

            const isGlanced = !isEvaded && enemy.defenseRating > currentHitRating;
            

            let effectiveCritChance = critChance + augmentCritChanceBonus;
            
            // Apply Deadly Aim buff if active
            if (playerBuffs.deadlyAim.active) {
                effectiveCritChance += playerBuffs.deadlyAim.critChanceBonus;
            }
            
            // Molten Steel: 30% additional chance to critically hit
            if (ability.name === "Molten Steel") {
                effectiveCritChance += 30;
                
                // Metal Worker Passive: Increases Critical Chance of Molten Steel by 10%
                const metalWorkerPassive = allPassives.find(p => p.name === "Metal Worker");
                if (metalWorkerPassive) {
                    effectiveCritChance += 10;
                }
            }
            
            const isCrit = ability.name === "Full Momentum" ? false : Math.random() < (effectiveCritChance / 100);

            const currentPenRating = penRating;
            if (talismanEffects.lycanthropeBonePowder.enabled && time <= talismanEffects.lycanthropeBonePowder.endTime) {
                currentPenRating += talismanEffects.lycanthropeBonePowder.penetrationBonus;
            }

            const currentPenChance = penChance + passivePenetrationBonus + augmentPenChanceBonus;
            
            // Apply all penetration buffs
            if (playerBuffs.breachingShot.active) {
                currentPenChance += playerBuffs.breachingShot.penChanceBonus;
            }
            if (playerBuffs.outForAKill.active) {
                currentPenChance += playerBuffs.outForAKill.penChanceBonus;
            }
            if (playerBuffs.minorPenetration.active) {
                currentPenChance += playerBuffs.minorPenetration.penChanceBonus;
            }

            const randomPen = Math.random() < (currentPenChance / 100);
            const isPenetrated = randomPen;

            if (isEvaded) {
                damageMult = 0;
            } else {
                if (isGlanced) damageMult *= 0.5;
                if (isPenetrated) damageMult *= 1.5;
            }

            // ========================================

            // TALISMAN EFFECTS PROCESSING

            // ========================================

            

            // Process talisman effects based on hit results

            // Mother's Wrath: Count non-penetrating hits

            if (!isEvaded && !isPenetrated && talismanEffects.mothersWrath.enabled) {

                // This is a non-penetrating hit (normal hit or glance)

                talismanEffects.mothersWrath.nonPenHits++;

                

                // Check if Mother's Wrath should trigger

                if (talismanEffects.mothersWrath.nonPenHits >= talismanEffects.mothersWrath.requiredHits && 

                    talismanEffects.mothersWrath.cooldown <= 0) {

                    

                    // Trigger Mother's Wrath effect

                    const wrathDamage = talismanEffects.mothersWrath.damage;

                    totalDamage += wrathDamage;

                    

                    // Add to stats breakdown

                    const wrathKey = 'Mother\'s Wrath (Talisman)';

                    if (!statsBreakdown[wrathKey]) {

                        statsBreakdown[wrathKey] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: 'Mother\'s Wrath' };

                    }

                    statsBreakdown[wrathKey].casts++;

                    statsBreakdown[wrathKey].damage += wrathDamage;

                    

                    // Reset counter and set cooldown

                    talismanEffects.mothersWrath.nonPenHits = 0;

                    talismanEffects.mothersWrath.cooldown = talismanEffects.mothersWrath.maxCooldown;

                }

            }

            

            // Lycanthrope Bone Powder: Critical hits increase penetration rating

            if (!isEvaded && isCrit && talismanEffects.lycanthropeBonePowder.enabled) {

                talismanEffects.lycanthropeBonePowder.endTime = time + talismanEffects.lycanthropeBonePowder.duration;

            }

            

            // Essential Salted of Joseph Curwen: Healing effects increase damage

            // This would need to be triggered by healing abilities - for now, we'll simulate occasional healing

            if (talismanEffects.essentialSaltedCurwen.enabled && Math.random() < 0.05) { // 5% chance per hit to simulate healing

                talismanEffects.essentialSaltedCurwen.endTime = time + talismanEffects.essentialSaltedCurwen.duration;

                talismanEffects.essentialSaltedCurwen.lastHealTime = time;

            }



            // Crit check (Probabilistic) - already declared above

            

            // Apply critical damage bonuses (no real talismans provide this currently)

            let critBonusMult = 1.0;
            
            // Molten Steel: 15% additional critical damage when Metal Worker is not equipped
            if (ability.name === "Molten Steel" && isCrit) {
                const metalWorkerPassive = allPassives.find(p => p.name === "Metal Worker");
                if (!metalWorkerPassive) {
                    critBonusMult = 1.15; // 15% additional critical damage
                }
            }

            const finalMult = (isCrit ? (1 + critPower / 100) : 1.0) * damageMult * critBonusMult;



            // Signet % bonuses: apply global, subtype (e.g. Strike +4.5%), weapon-type (e.g. Blade +3%), and affliction damage

            const sBonus = window._signetBonuses || { subtype: {}, weapon: {}, critPowerPct: 0, globalDmgPct: 0, afflictionDmgPct: 0 };

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

            // Apply affliction damage signet bonus for abilities that apply afflicted debuff
            if (sBonus.afflictionDmgPct && ability.appliedDebuffs && ability.appliedDebuffs.includes('afflicted')) {
                signetMult += sBonus.afflictionDmgPct / 100;
            }



            // Momentum bonus for Hammer abilities
            let momentumMult = 1.0;
            let shouldResetMomentum = false;
            
            if (ability.weapon === 'Hammer' && hasHammerWeapon) {
                // Special handling for Full Momentum - immediately sets stacks to 5
                if (ability.name === "Full Momentum") {
                    momentumStacks = MAX_MOMENTUM_STACKS; // Set to 5 immediately
                    // Full Momentum itself doesn't trigger the damage bonus, just sets the stacks
                } else {
                    // Increment momentum stacks for other Hammer abilities
                    momentumStacks++;
                    
                    // Check if we reached 5 stacks
                    if (momentumStacks >= MAX_MOMENTUM_STACKS) {
                        momentumMult = 1.40; // 40% damage bonus
                        shouldResetMomentum = true;
                        
                        // Add Momentum proc to stats breakdown
                        const MOMENTUM_NAME = "Momentum (Proc)";
                        if (!statsBreakdown[MOMENTUM_NAME]) {
                            statsBreakdown[MOMENTUM_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: "Momentum" };
                        }
                        statsBreakdown[MOMENTUM_NAME].casts++;
                    }
                }
            }



            // Special handling for Power Line-Voltaic Detonation: assume the player

            // always follows up with the detonation after 9s, i.e. the ability is

            // effectively a single cast that does both the tether ticks and the

            // max‑stack explosion. CP is assumed non‑zero.

            let rawBaseDmg;

            // Special handling for Power Line-Voltaic Detonation: separate tether and detonation damage
            if (ability.name === POWER_LINE_NAME) {

                // Power Line: 0.18365*cp per second for 10 seconds
                const tetherDamage = 0.18365 * cp * 10;
                
                // Voltaic Detonation: 2.99004*cp with maximum 200% bonus (3x total damage)
                const detonationBase = 2.99004 * cp * 3.0;

                rawBaseDmg = tetherDamage + detonationBase;

            } else {
                // Use the pre-calculated scalingToUse from getAbilityStats
                let scalingToUse = ability.scalingToUse || 0;
                
                // For abilities that scale with resources, use actual consumed resources
                if (ability.damageScalesWithResources) {
                    let resourcesForScaling;
                    
                    // Use the actual consumed resources passed to performAttack
                    if (actualConsumedResources > 0) {
                        resourcesForScaling = actualConsumedResources;
                    } else if (ability.minResources && ability.minResources > 0) {
                        resourcesForScaling = ability.minResources;
                    } else {
                        resourcesForScaling = 5; // Default to 5 resources
                    }
                    
                    const resourceKey = `scaling_${resourcesForScaling}`;
                    const originalScalingToUse = scalingToUse; // Store original value for comparison
                    
                    if (ability[resourceKey] !== undefined) {
                        scalingToUse = ability[resourceKey];
                    } else if (ability.scaling_1 > 0 && ability.scaling_5 > 0) {
                        // Fallback to linear interpolation
                        scalingToUse = ability.scaling_1 + ((resourcesForScaling - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
                    }
                    
                }
                
                rawBaseDmg = scalingToUse * cp;
                

            }



            // Elemental Fury Proc: When any Elemental Manifestation ability deals damage, you deal 7.5% more damage for 5 seconds.

            // Requires an equipped Elementalism Focus.

            if (hasElementalWeapon && ability.isManifestation && ability.weapon === 'Elementalism') {

                elementalFuryEndTime = time + 5.0;

            }



            // Apply Elemental Fury buff if active

            const eleFuryMult = (hasElementalWeapon && time <= elementalFuryEndTime) ? 1.075 : 1.0;

            

            // Apply Essential Salted of Joseph Curwen damage bonus if active

            let saltedCurwenMult = 1.0;

            if (talismanEffects.essentialSaltedCurwen.enabled && time <= talismanEffects.essentialSaltedCurwen.endTime) {

                saltedCurwenMult = 1.0 + talismanEffects.essentialSaltedCurwen.damageBonus;

            }

            

            // Apply Amulet of Yuggoth affliction damage bonus if active

            let yuggothMult = 1.0;

            if (talismanEffects.amuletOfYuggoth.enabled && ability.appliedDebuffs.includes('afflicted')) {

                yuggothMult = 1.0 + talismanEffects.amuletOfYuggoth.afflictionDamageBonus;

            }



            // Apply debuff-based damage bonuses

            let debuffDamageMult = 1.0;

            if (ability.bonusDamageWithDebuffs && ability.requiredDebuffs.length > 0) {

                // Check if required debuffs are active

                const allDebuffsActive = ability.requiredDebuffs.every(debuff => debuffState[debuff]);

                if (allDebuffsActive) {

                    // Calculate conditional damage using RDB scaling data
                    // Look for conditional damage patterns but use scaling data instead of parsed values
                    const desc = ability.description || '';
                    const baseDamage = scalingToUse * cp;
                    
                    // Check if this ability has conditional damage (but don't parse specific values)
                    const hasConditionalDamage = /or\s+\d+.*damage\s+if/i.test(desc) || 
                                               /\d+.*damage,\s*or\s+\d+.*damage\s+if/i.test(desc);
                    
                    if (hasConditionalDamage && baseDamage > 0) {
                        // For abilities with conditional damage, apply a standard bonus multiplier
                        // This avoids parsing static values from descriptions and uses RDB scaling as the base
                        // Typical conditional damage bonuses range from 20-50% based on game mechanics
                        debuffDamageMult = 1.3; // 30% average bonus for conditional damage
                    }
                }

            }



            // Apply passive damage bonuses (e.g., Dead on Target's 10% for Shotgun abilities)
            let passiveDamageMult = 1.0;
            let passiveContributions = []; // Track individual passive contributions
            
            allPassives.forEach(passive => {
                if (passive.damageBonusPercent > 0) {
                    
                    // Check if this passive applies to the current ability
                    const desc = passive.originalAbility && passive.originalAbility.description || "";
                    
                    // Check if current ability is a drone/turret ability
                    const isDroneOrTurretAbility = ability.name.toLowerCase().includes("drone") || 
                                                   ability.name.toLowerCase().includes("turret") ||
                                                   (ability.originalAbility && ability.originalAbility.description && 
                                                    (ability.originalAbility.description.toLowerCase().includes("summons a drone") ||
                                                     ability.originalAbility.description.toLowerCase().includes("places a turret")));
                    
                    // Apply bonus based on conditions:
                    // 1. If passive affects drones/turrets and current ability is drone/turret
                    // 2. If passive weapon matches current ability weapon
                    // 3. If passive doesn't specify a weapon (general passive)
                    const shouldApply = (passive.affectsDronesOrTurrets && isDroneOrTurretAbility) ||
                                       (passive.weapon === ability.weapon) ||
                                       (!passive.weapon || passive.weapon === "");
                    
                    if (shouldApply) {
                        const passiveBonus = 1.0 + passive.damageBonusPercent / 100;
                        passiveDamageMult *= passiveBonus;
                        
                        // Track this passive contribution for display
                        passiveContributions.push({
                            name: passive.name,
                            percent: passive.damageBonusPercent,
                            multiplier: passiveBonus
                        });
                    }
                }
            });

            // Apply passive penetration chance bonuses (e.g., Strike Force's 7.5% for Strike attacks)
            passivePenetrationBonus = 0;
            allPassives.forEach(passive => {
                if (passive.penetrationBonusPercent > 0) {
                    // Check if this passive applies to the current ability's attack type
                    const desc = passive.originalAbility && passive.originalAbility.description || "";
                    const subtypes = ["Strike", "Blast", "Focus", "Frenzy", "Burst", "Chain"];
                    let requiredSubtype = null;
                    
                    for (const subtype of subtypes) {
                        if (desc.includes(subtype + " attacks") || desc.includes(subtype + " abilities")) {
                            requiredSubtype = subtype;
                            break;
                        }
                    }
                    
                    // Apply bonus if attack type matches the requirement
                    if (!requiredSubtype || ability.subtype === requiredSubtype) {
                        passivePenetrationBonus += passive.penetrationBonusPercent;
                    }
                }
            });

            // ========================================
            // AUGMENT EFFECTS PROCESSING
            // ========================================
            
            // Find ability index to get the correct augment
            let abilityIndex = -1;
            const allAbilitySelects = [...activeSelects, ...eliteActiveSelects, ...auxActiveSelects];
            for (let j = 0; j < allAbilitySelects.length; j++) {
                if (allAbilitySelects[j].value && tswData[allAbilitySelects[j].value]) {
                    const selectedAbility = tswData[allAbilitySelects[j].value];
                    // Match by name and weapon to ensure correct ability
                    if (selectedAbility.name === ability.name && selectedAbility.weapon === ability.weapon) {
                        abilityIndex = j;
                        break;
                    }
                }
            }
            
            // Apply augment effects (variables already declared above)
            if (abilityIndex >= 0) {
                const augment = getAugmentEffectsForAbility(abilityIndex);
                if (augment) {
                    const effect = augment.effect;
                    
                    // Apply damage multiplier
                    if (effect.damageMultiplier) {
                        augmentMult *= effect.damageMultiplier;
                    }
                    
                    // Apply stat bonuses (already in percentage form for new augments)
                    if (effect.penChance) {
                        augmentPenChanceBonus += effect.penChance;
                    }
                    if (effect.critChance) {
                        augmentCritChanceBonus += effect.critChance;
                    }
                    if (effect.critPower) {
                        augmentCritPowerBonus += effect.critPower;
                    }
                    if (effect.attackRating) {
                        augmentAttackRatingBonus += effect.attackRating;
                    }
                    if (effect.hitRating) {
                        augmentHitRatingBonus += effect.hitRating;
                    }
                    if (effect.evadeReduction) {
                        augmentEvadeReductionBonus += effect.evadeReduction;
                    }
                    
                    // Process team buff augments (these affect all abilities)
                    // Check cooldown before applying team buffs
                    const augmentCooldownEnd = augmentCooldowns.get(abilityIndex) || 0;
                    const cooldownTime = effect.cooldown || 0;
                    
                    if (time >= augmentCooldownEnd) {
                        if (effect.teamDamageBuff && effect.teamDamageBuff > 0) {
                            // Apply team damage buff
                            teamBuffs.damageBuff.active = true;
                            teamBuffs.damageBuff.endTime = time + (effect.duration || 5);
                            teamBuffs.damageBuff.percent = Math.max(teamBuffs.damageBuff.percent, effect.teamDamageBuff);
                            // Set cooldown
                            if (cooldownTime > 0) {
                                augmentCooldowns.set(abilityIndex, time + cooldownTime);
                            }
                        }
                        
                        if (effect.teamHealingBuff && effect.teamHealingBuff > 0) {
                            // Apply team healing buff
                            teamBuffs.healingBuff.active = true;
                            teamBuffs.healingBuff.endTime = time + (effect.duration || 5);
                            teamBuffs.healingBuff.percent = Math.max(teamBuffs.healingBuff.percent, effect.teamHealingBuff);
                            // Set cooldown
                            if (cooldownTime > 0) {
                                augmentCooldowns.set(abilityIndex, time + cooldownTime);
                            }
                        }
                        
                        if (effect.teamDamageReduction && effect.teamDamageReduction > 0) {
                            // Apply team damage reduction buff
                            teamBuffs.damageReduction.active = true;
                            teamBuffs.damageReduction.endTime = time + (effect.duration || 5);
                            teamBuffs.damageReduction.percent = Math.max(teamBuffs.damageReduction.percent, effect.teamDamageReduction);
                            // Set cooldown
                            if (cooldownTime > 0) {
                                augmentCooldowns.set(abilityIndex, time + cooldownTime);
                            }
                        }
                    }
                }
            }

            // Apply player damage buffs
            let playerBuffMult = 1.0;
            
            // Lethality damage bonus
            if (playerBuffs.lethality.active) {
                playerBuffMult *= (1 + playerBuffs.lethality.damageBonusPercent / 100);
            }
            
            // No Contest damage bonus
            if (playerBuffs.noContest.active) {
                playerBuffMult *= (1 + playerBuffs.noContest.damageBonusPercent / 100);
            }
            
            // Shotgun Wedding damage bonus
            if (playerBuffs.shotgunWedding.active && ability.weapon === 'Shotgun') {
                playerBuffMult *= (1 + (playerBuffs.shotgunWedding.stacks * 25) / 100); // 25% per stack
            }
            
            // Masters House damage bonus
            if (playerBuffs.mastersHouse.active) {
                playerBuffMult *= (1 + playerBuffs.mastersHouse.damageBonusPercent / 100);
            }
            
            // Generic damage buff from other active abilities
            if (playerBuffs.genericDamageBuff.active) {
                playerBuffMult *= (1 + playerBuffs.genericDamageBuff.damageBonusPercent / 100);
            }
            
            // Apply team damage buffs from augment procs
            if (teamBuffs.damageBuff.active) {
                playerBuffMult *= (1 + teamBuffs.damageBuff.percent / 100);
            }
            
            // Apply Short Fuse team damage buff
            if (playerBuffs.shortFuse.active) {
                let shortFuseBonus = playerBuffs.shortFuse.damageBonusPercent;
                
                // Check for Final Fuse passive upgrade
                const finalFusePassive = allPassives.find(p => p.name === "Final Fuse");
                if (finalFusePassive) {
                    shortFuseBonus = 30; // Final Fuse upgrades to 30%
                }
                
                playerBuffMult *= (1 + shortFuseBonus / 100);
            }

            // Apply equilibrium damage bonus if active
            let equilibriumMult = 1.0;
            if (window._equilibriumBuff && window._equilibriumBuff.active) {
                equilibriumMult += window._equilibriumBuff.damageBonus / 100; // 15% damage bonus
            }

            // Calculate damage with passive bonuses included
            const actualDmg = rawBaseDmg * finalMult * signetMult * eleFuryMult * saltedCurwenMult * yuggothMult * debuffDamageMult * momentumMult * passiveDamageMult * augmentMult * playerBuffMult * equilibriumMult;
            
            
            // ========================================
            // SIGNET OF EQUILIBRIUM - HEALING BUFF
            // ========================================
            
            // Initialize equilibrium tracking if not exists
            if (!window._equilibriumTracker) {
                window._equilibriumTracker = {
                    lastHealTime: 0,
                    activeBuff: false,
                    buffEndTime: 0,
                    healCount: 0,
                    critHealCount: 0
                };
            }
            
            const equilibrium = window._equilibriumTracker;
            const currentTime = time;
            
            // Check if Signet of Equilibrium is active (check for signet in major slot)
            const equilibriumActive = window._signetBonuses?.equilibrium || false;
            
            // Process healing augments for equilibrium procs
            if (equilibriumActive && abilityIndex >= 0) {
                const augment = getAugmentEffectsForAbility(abilityIndex);
                if (augment && augment.effect && augment.effect.teamHeal) {
                    equilibrium.healCount++;
                    
                    // Calculate critical heal chance (use player's crit chance)
                    const healCritChance = totalCritChance / 100;
                    const isHealCrit = Math.random() < healCritChance;
                    
                    if (isHealCrit && currentTime - equilibrium.lastHealTime >= 15) {
                        // Critical heal occurred and cooldown is ready
                        equilibrium.critHealCount++;
                        equilibrium.lastHealTime = currentTime;
                        equilibrium.activeBuff = true;
                        equilibrium.buffEndTime = currentTime + 15; // 15 second buff duration
                        
                        // Add equilibrium damage buff
                        if (!window._equilibriumBuff) {
                            window._equilibriumBuff = { active: true, damageBonus: 15 };
                        }
                    }
                }
            }
            
            // Check if equilibrium buff should still be active
            if (equilibrium.activeBuff && currentTime >= equilibrium.buffEndTime) {
                equilibrium.activeBuff = false;
                if (window._equilibriumBuff) {
                    window._equilibriumBuff.active = false;
                }
            }
            
            // Apply equilibrium damage bonus if active
            if (window._equilibriumBuff && window._equilibriumBuff.active) {
                equilibriumMult += window._equilibriumBuff.damageBonus / 100; // 15% damage bonus
            }

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

                        statsBreakdown[DUST_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0 };

                    }

                    statsBreakdown[DUST_NAME].casts++;

                    statsBreakdown[DUST_NAME].damage += actualDmg;
                    // Dust procs inherit the crit and penetration status of the triggering hit
                    if (isCrit) statsBreakdown[DUST_NAME].crits++;
                    if (isPenetrated) statsBreakdown[DUST_NAME].penetrations++;

                }

            }



            // Elemental Overload Proc

            // "Your Elemental abilities have a 33% chance to deal magical damage to 6 enemies around the target."

            // "Requires an equipped Elementalism Focus."

            // Note: Single target DPS calc, so we only apply the damage once. Using RDB scaling data.

            if (hasElementalWeapon && ability.weapon === 'Elementalism') {

                if (Math.random() < 0.33) {

                    const ELE_OVERLOAD_NAME = 'Elemental Overload (Proc)';

                    if (!statsBreakdown[ELE_OVERLOAD_NAME]) {

                        statsBreakdown[ELE_OVERLOAD_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0 };

                    }

                    // Use RDB scaling for Elemental Overload - find the ability in allPassives
                    const elementalOverloadPassive = allPassives.find(p => p.name === "Elemental Overload");
                    let eleBaseDmg;
                    
                    if (elementalOverloadPassive && elementalOverloadPassive.scaling > 0) {
                        // Use RDB scaling calculation
                        eleBaseDmg = elementalOverloadPassive.scaling * cp;
                    } else {
                        // Fallback to original calculation if RDB data not available
                        eleBaseDmg = 105 * (cp / 1000);
                    }

                    // Procs inherit the triggering hit's finalMult (crit/pen/glance)

                    const eleActualDmg = eleBaseDmg * finalMult;



                    totalDamage += eleActualDmg;

                    statsBreakdown[ELE_OVERLOAD_NAME].casts++;

                    statsBreakdown[ELE_OVERLOAD_NAME].damage += eleActualDmg;
                    // Elemental Overload procs inherit the crit and penetration status of the triggering hit
                    if (isCrit) statsBreakdown[ELE_OVERLOAD_NAME].crits++;
                    if (isPenetrated) statsBreakdown[ELE_OVERLOAD_NAME].penetrations++;

                }

            }



            totalDamage += finalDamage;

            

            
            

            // Handle stacking buff triggers from ability hits

            if (isCrit) {

                // Check for abilities that grant Critical Rating stacks on critical hits

                const desc = ability.description || ability.originalAbility?.description || "";

                if (desc.includes("Whenever you critically hit") && desc.includes("Critical Rating")) {

                    addBuffStack('critRatingStacks', time);

                }

                // Check for abilities that grant Critical Power Rating stacks on critical hits

                if (desc.includes("Whenever you critically hit") && desc.includes("Critical Power Rating")) {

                    addBuffStack('critPowerRatingStacks', time);

                }

                

                // Check for Live Wire passive trigger and apply damage immediately
                allPassives.forEach(passive => {
                    if (passive.name === "Live Wire") {
                        // Apply Live Wire damage immediately on critical hit
                        const liveWireAbility = passive;
                        let liveWireFinalDamage;
                        
                        // Calculate Live Wire damage with its own crit/pen rolls
                        const wStats = getStatsForWeapon(ability.weapon);
                        const critChance = wStats?.critChance || 0;
                        const penChance = wStats?.penChance || 0;
                        const liveWireCritRoll = Math.random() < (critChance / 100);
                        const liveWirePenRoll = Math.random() < (penChance / 100);
                        
                        // Use RDB scaling for Live Wire with safety checks
                        const liveWireScaling = liveWireAbility?.scaling || 1.10389301;
                        const liveWireBaseDamage = liveWireScaling * cp;
                        // Apply Live Wire's own crit/pen multipliers with safety checks
                        const critPower = wStats?.critPower || 25;
                        const liveWireCritMultiplier = liveWireCritRoll ? (1 + critPower / 100) : 1;
                        const liveWirePenMultiplier = liveWirePenRoll ? 1.15 : 1; // 15% pen bonus
                        liveWireFinalDamage = liveWireBaseDamage * liveWireCritMultiplier * liveWirePenMultiplier;

                        totalDamage += liveWireFinalDamage;

                        // Record Live Wire damage in breakdown
                        const LIVE_WIRE_NAME = 'Live Wire (Proc)';
                        if (!statsBreakdown[LIVE_WIRE_NAME]) {
                            statsBreakdown[LIVE_WIRE_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: 'Live Wire' };
                        }

                        statsBreakdown[LIVE_WIRE_NAME].casts++;
                        statsBreakdown[LIVE_WIRE_NAME].damage += liveWireFinalDamage;
                        
                        if (liveWireCritRoll) statsBreakdown[LIVE_WIRE_NAME].crits++;
                        if (liveWirePenRoll) statsBreakdown[LIVE_WIRE_NAME].penetrations++;
                    }
                });

            }

            

            if (isPenetrated) {

                // Check for abilities that grant rating stacks on penetration

                const desc = ability.description || ability.originalAbility?.description || "";

                if (desc.includes("Whenever you penetrate") && desc.includes("Rating")) {

                    // Determine which rating based on description

                    if (desc.includes("Penetration Rating")) {

                        addBuffStack('penRatingStacks', time);

                    } else if (desc.includes("Hit Rating")) {

                        addBuffStack('hitRatingStacks', time);

                    }

                }

            }

            

            // Check for abilities that grant stacks on any hit

            const desc = ability.description || ability.originalAbility?.description || "";

            if (desc.includes("Whenever you hit") && desc.includes("Rating")) {

                // Determine which rating based on description

                if (desc.includes("Critical Rating")) {

                    addBuffStack('critRatingStacks', time);

                } else if (desc.includes("Hit Rating")) {

                    addBuffStack('hitRatingStacks', time);

                } else if (desc.includes("Penetration Rating")) {

                    addBuffStack('penRatingStacks', time);

                } else if (desc.includes("Evade Rating")) {

                    addBuffStack('evadeRatingStacks', time);

                } else if (desc.includes("Block Rating")) {

                    addBuffStack('blockRatingStacks', time);

                } else if (desc.includes("Defence Rating")) {

                    addBuffStack('defenceRatingStacks', time);

                }

            }

            

            // Special handling for Power Line - optimized for max stacks

            if (ability.name === POWER_LINE_NAME) {

                // Power Line creates a 10-second tether that builds stacks

                // For DPS optimization, we assume players wait for max stacks (10 stacks = 200% bonus)

                // before using Voltaic Detonation

                

                // Power Line tether damage over 10 seconds - use RDB scaling
                const powerLineAbility = allActives.find(a => a.name === POWER_LINE_NAME);
                let tetherDamage;
                
                if (powerLineAbility && powerLineAbility.scaling > 0) {
                    // Use RDB scaling calculation (per second damage)
                    tetherDamage = powerLineAbility.scaling * cp * 10; // 10 seconds of damage
                } else {
                    // Fallback to original calculation if RDB data not available
                    tetherDamage = 0.18365 * cp * 10; // 10 seconds of damage
                }

                const tetherFinalDamage = tetherDamage * damageMult * eleFuryMult * saltedCurwenMult * yuggothMult * debuffDamageMult;

                

                // Record tether damage

                statsBreakdown[POWER_LINE_TETHER_NAME].damage += tetherFinalDamage;

                statsBreakdown[POWER_LINE_TETHER_NAME].casts++;

                if (isCrit) statsBreakdown[POWER_LINE_TETHER_NAME].crits++;

                if (isPenetrated) statsBreakdown[POWER_LINE_TETHER_NAME].penetrations++;

                

                // Voltaic Detonation with maximum stacks (200% bonus) - use RDB scaling
                const voltaicDetonationAbility = allActives.find(a => a.name === "Voltaic Detonation");
                let detonationBase;
                
                if (voltaicDetonationAbility && voltaicDetonationAbility.scaling > 0) {
                    // Use RDB scaling calculation with maximum 200% bonus (3.0 multiplier)
                    detonationBase = voltaicDetonationAbility.scaling * cp * 3.0;
                } else {
                    // Fallback to original calculation if RDB data not available
                    detonationBase = 2.99004 * cp * 3.0; // Maximum 200% bonus
                }

                const detonationFinalDamage = detonationBase * damageMult * eleFuryMult * saltedCurwenMult * yuggothMult * debuffDamageMult;

                

                // Record detonation damage

                statsBreakdown[VOLTAIC_DETONATION_NAME].damage += detonationFinalDamage;

                statsBreakdown[VOLTAIC_DETONATION_NAME].casts++;

                // Detonation always crits if the original hit was a crit (game mechanic)

                if (isCrit) statsBreakdown[VOLTAIC_DETONATION_NAME].crits++;

                // Detonation always penetrates if the original hit penetrated (game mechanic)  

                if (isPenetrated) statsBreakdown[VOLTAIC_DETONATION_NAME].penetrations++;

                

                // Dust of the Black Pharaoh proc check for Voltaic Detonation

                const isDetonationCrit = detonationFinalDamage > (detonationBase * damageMult * eleFuryMult * saltedCurwenMult * yuggothMult * debuffDamageMult);

                if (dustActive && isDetonationCrit) {

                    if (Math.random() < 0.20) {

                        const dustDetonationDmg = detonationFinalDamage;

                        totalDamage += dustDetonationDmg;

                        

                        if (!statsBreakdown[DUST_NAME]) {

                            statsBreakdown[DUST_NAME] = { damage: 0, casts: 0, crits: 0, penetrations: 0 };

                        }

                        statsBreakdown[DUST_NAME].casts++;

                        statsBreakdown[DUST_NAME].damage += dustDetonationDmg;

                        statsBreakdown[DUST_NAME].crits++;

                        if (isPenetrated) statsBreakdown[DUST_NAME].penetrations++;

                    }

                }

            } else if (ability.name !== POWER_LINE_NAME) {
                // Standard damage recording for other abilities (excluding Power Line which is handled above)
                // Check if this is a summoning ability (like Shotgun Turret, Area Drone) - don't record initial damage
                // Effects should NEVER be treated as summoning abilities - only initial casts
                const isEffect = ability.name.includes("(Effect)");
                const abilityNameToCheck = ability.originalName || ability.name;
                const isSummoningAbility = !isEffect && (
                                             abilityNameToCheck.toLowerCase().includes("turret") || 
                                             abilityNameToCheck.toLowerCase().includes("drone") ||
                                             abilityNameToCheck.toLowerCase().includes("area drone") ||
                                             abilityNameToCheck.toLowerCase().includes("backup drone") ||
                                             abilityNameToCheck.toLowerCase().includes("sticky drone") ||
                                             abilityNameToCheck.toLowerCase().includes("health drone") ||
                                             abilityNameToCheck.toLowerCase().includes("cleansing drone") ||
                                             // Check if ability description indicates summoning
                                             (ability.originalAbility && ability.originalAbility.description && 
                                              (ability.originalAbility.description.toLowerCase().includes("summons a drone") ||
                                               ability.originalAbility.description.toLowerCase().includes("places a turret") ||
                                               ability.originalAbility.description.toLowerCase().includes("summons a drone") ||
                                               ability.originalAbility.description.toLowerCase().includes("area drone")))
                                             );
                
                
                // Skip damage recording for summoning abilities - their damage is recorded from effect ticks
                if (isSummoningAbility) {
                    // Don't record initial cast damage for summoning abilities
                    // The periodic damage will be recorded when the effect ticks
                } else {
                    // Standard damage recording for non-summoning abilities
                    // For effects, extract original name from "Name (Effect)" format, otherwise use originalName or current name
                    const damageName = ability.name.includes("(Effect)") 
                        ? ability.name.replace(" (Effect)", "")
                        : (ability.originalName || ability.name);
                    
                    
                    // Create stable key that matches the initialization format
                    const weapon = ability.weapon || ability.originalAbility?.weapon || 'Unknown';
                    const abilityKey = `active_${weapon}_${damageName}`;
                    
                    if (!statsBreakdown[abilityKey]) {
                        statsBreakdown[abilityKey] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: damageName };
                    }
                    statsBreakdown[abilityKey].casts++;
                    statsBreakdown[abilityKey].damage += finalDamage;
                    if (isCrit) statsBreakdown[abilityKey].crits++;
                    if (isPenetrated) statsBreakdown[abilityKey].penetrations++;
                    
                    if (damageName.toLowerCase().includes("drone") || damageName.toLowerCase().includes("turret")) {
                    }
                }
            }

            // Handle Momentum damage tracking and stack reset
            if (shouldResetMomentum) {
                // Calculate the momentum bonus damage (40% of the base damage)
                const momentumBonusDamage = finalDamage * 0.40; // 40% bonus
                
                // Add momentum damage to total and stats breakdown
                totalDamage += momentumBonusDamage;
                
                const MOMENTUM_NAME = "Momentum (Proc)";
                statsBreakdown[MOMENTUM_NAME].damage += momentumBonusDamage;
                // Momentum proc inherits the crit and penetration status of the triggering hit
                if (isCrit) statsBreakdown[MOMENTUM_NAME].crits++;
                if (isPenetrated) statsBreakdown[MOMENTUM_NAME].penetrations++;
                
                // Reset momentum stacks
                momentumStacks = 0;
                shouldResetMomentum = false;
            }


            // Metal Worker Passive: Increases Critical Chance of Molten Steel by 10%
            if (ability.name === "Molten Steel") {
                // Check if Metal Worker passive is equipped
                const metalWorkerPassive = allPassives.find(p => p.name === "Metal Worker");
                if (metalWorkerPassive) {
                    // Metal Worker increases crit chance by 10% for Molten Steel
                    // This is handled by modifying the crit chance calculation for this specific ability
                    // The actual crit chance increase is applied in the crit calculation logic
                    // We don't add additional damage here - it's handled through increased crit rate
                    
                    // Note: The 10% crit chance bonus is applied in the crit calculation section
                    // This is just a placeholder comment to indicate Metal Worker is active
                }
            }


            // Proc Passives (Evaluate on every hit)

            const triggeredPassives = []; // Track which passives triggered this hit

            allPassives.forEach((passive, p) => {

                // Rate limiting: maximum once per second per passive

                if (time - lastPassiveTriggerTime[p] < 1.0) {

                    return; // Skip if less than 1 second since last trigger

                }

                

                // Skip passives that have their own custom buff/proc systems to prevent duplicate entries

                // These passives handle their own damage tracking and shouldn't be processed as regular passives

                const customProcPassives = ['Live Wire']; // Add other passives here if they have similar systems

                if (customProcPassives.includes(passive.name)) {

                    return; // Skip passive processing for passives with custom systems

                }

                

                if (passiveCooldowns[p] <= 0) {

                    // If triggerSubtypes is empty, it means trigger on any hit (like Bloodsport)

                    // If triggerSubtypes has values, only trigger on matching subtypes

                    if (passive.triggerSubtypes.length > 0 && !passive.triggerSubtypes.includes(ability.subtype)) return;

                    

                    // Check for requiresBlade flag (Two Cuts passive)

                    if (passive.originalAbility && passive.originalAbility.requiresBlade && !hasBladeWeapon) return;

                    
                    // Check for ability-specific dependencies (e.g., Sawed Off requires Pump Action)
                    if (passive.requiresSpecificAbility) {
                        const requiredAbility = allActives.find(a => a.name === passive.requiresSpecificAbility);
                        if (!requiredAbility) {
                            return; // Required ability is not equipped
                        }
                    }

                    

                    // Check trigger interval - only count hits matching passive's weapon

                    const passiveWeapon = passive.weapon;

                    // Only restrict weapon matching if the passive explicitly mentions a specific weapon type in its description

                    // Examples: "Whenever you hit with a Fist ability", "Fist abilities also cause...", "Your Hammer abilities..."

                    const desc = passive.originalAbility && passive.originalAbility.description || "";

                    const hasExplicitWeaponRequirement = desc && (

                        desc.includes("hit with a") ||

                        desc.includes("abilities also cause") ||

                        desc.includes("Your ") && desc.includes(" abilities") ||

                        (desc.includes("Fist") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Blade") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Hammer") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Chaos") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Elementalism") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Blood") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Shotgun") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Pistol") && (desc.includes("abilities") || desc.includes("ability"))) ||

                        (desc.includes("Assault Rifle") && (desc.includes("abilities") || desc.includes("ability")))

                    );

                    // Check for attack-type specific requirements (e.g., "Blast attacks have a 50% chance")
                    const subtypes = ["Strike", "Blast", "Focus", "Frenzy", "Burst", "Chain"];
                    let requiredSubtype = null;
                    
                    for (const subtype of subtypes) {
                        if (desc.includes(subtype + " attacks") || desc.includes(subtype + " abilities")) {
                            requiredSubtype = subtype;
                            break;
                        }
                    }

                    // Default: allow all passives to work with all abilities unless explicitly restricted

                    // Bloodsport says "Whenever you hit a target" - no weapon restriction, so it works with all

                    const isMatchingWeapon = !hasExplicitWeaponRequirement || passiveWeapon === ability.weapon || passiveWeapon === 'All';

                    // Check attack type restriction
                    const isMatchingSubtype = !requiredSubtype || ability.subtype === requiredSubtype;

                    if (!isMatchingWeapon || !isMatchingSubtype) {

                        return; // Skip non-matching weapons, don't reset counter

                    }

                    // Check for specific trigger conditions (critical hit, penetrate, etc.)
                    if (passive.triggerCondition) {
                        if (passive.triggerCondition === "critical" && !isCrit) {
                            return; // Skip if not a critical hit
                        }
                        if (passive.triggerCondition === "penetrate" && !isPenetrated) {
                            return; // Skip if not penetrated
                        }
                        // "hit" condition allows any hit to proceed
                    }


                    

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




                    // Check if this is a DoT passive (like Bloodsport)

                    if (passive.dotDamage > 0 && passive.appliedDebuffs.includes('afflicted')) {


                        // Create DoT effect instead of direct damage

                        activeDoTEffects.push({

                            name: passive.name + " (DoT)",

                            damage: passive.dotDamage,

                            duration: passive.dotDuration,

                            interval: passive.dotInterval,

                            nextTick: passive.dotInterval,

                            sourcePassive: passive.name,

                            weapon: passive.weapon

                        });

                        

                        // Apply the afflicted debuff state

                        enemyDebuffs.afflicted = true;

                        enemyDebuffs.afflictedDuration = passive.dotDuration;

                        

                        // Still count the cast for the passive

                        const passiveBreakdownKey = `passive_${passive.weapon}_${passive.name}`;

                        if (!statsBreakdown[passiveBreakdownKey]) {

                            statsBreakdown[passiveBreakdownKey] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: passive.name };

                        }

                        statsBreakdown[passiveBreakdownKey].casts++;

                        statsBreakdown[passiveBreakdownKey].damage += 0; // DoT damage will be counted in time advancement

                        

                        // Update rate limiting - this passive just triggered

                        lastPassiveTriggerTime[p] = time;

                        triggeredPassives.push(passive.name);

                    } else {


                        // Traditional passive damage calculation

                        // Skip passives that are PURE damage bonuses (no scaling damage) - they're handled in damage bonus system

                        // But allow passives that have both scaling and damage bonus (like Seal the Deal)

                        if (passive.damageBonusPercent > 0 && (!passive.scalingToUse || passive.scalingToUse === 0) && 

                            (!passive.scaling || passive.scaling === 0)) {

                            return; // Don't process as regular passive, already handled as damage bonus

                        }



                        // Special handling for passives that can both crit and penetrate independently
                        let pActualDmg;
                        const passiveName = passive.name;
                        const regularPassiveKey = `passive_${passive.weapon}_${passive.name}`;
                        
                        // Initialize stats breakdown if not exists
                        if (!statsBreakdown[regularPassiveKey]) {
                            statsBreakdown[regularPassiveKey] = { damage: 0, casts: 0, crits: 0, penetrations: 0, displayName: passive.name };
                        }
                        
                        if (passiveName === "One in the Chamber" || passiveName === "Sudden Return") {
                            // These passives can both critically hit and penetrate independently
                            // Calculate base damage with RDB scaling
                            const baseDamage = (passive.scalingToUse || 0) * cp * pSignetMult * equilibriumMult;
                            
                            // Calculate independent crit chance and penetration chance based on user's actual stats
                            const passiveCritChance = critChance / 100; // Convert percentage to decimal for Math.random()
                            const passivePenChance = penChance / 100; // Convert percentage to decimal for Math.random()
                            
                                                        
                            const isPassiveCrit = Math.random() < passiveCritChance;
                            const isPassivePen = Math.random() < passivePenChance;
                            
                            // Apply crit and penetration multipliers independently
                            const critMultiplier = isPassiveCrit ? (1 + critPower / 100) : 1.0;
                            const penMultiplier = isPassivePen ? 1.5 : 1.0; // 50% penetration bonus
                            
                            pActualDmg = baseDamage * critMultiplier * penMultiplier;
                            
                            // Track crits and penetrations for statistics
                            if (isPassiveCrit) {
                                statsBreakdown[regularPassiveKey].crits++;
                            }
                            if (isPassivePen) {
                                statsBreakdown[regularPassiveKey].penetrations++;
                            }
                        } else {
                            // Regular passive damage calculation (inherits from triggering hit)
                            pActualDmg = (passive.scalingToUse || 0) * cp * finalMult * pSignetMult * equilibriumMult;
                        }

                        totalDamage += pActualDmg;

                        statsBreakdown[regularPassiveKey].casts++;

                        statsBreakdown[regularPassiveKey].damage += pActualDmg;
                        
                        

                        

                        // Update rate limiting - this passive just triggered

                        lastPassiveTriggerTime[p] = time;

                        triggeredPassives.push(passive.name);

                    }

                    passiveCooldowns[p] = 1.0; // 1s ICD

                }

            });

            

            // Log summary if multiple passives triggered on the same hit

            if (triggeredPassives.length > 1) {

                // Multiple passives triggered - this is handled silently

            }

        }



        // ========================================

        // MAIN SIMULATION LOOP

        // ========================================



        while (time < targetSeconds) {

            let castSomething = false;



            // ========================================

            // ABILITY CASTING LOGIC

            // ========================================



            // Create a copy of allActives to avoid modification during iteration
            const allActivesCopy = [...allActives];
            const activeCooldownsCopy = [...activeCooldowns];
            
            for (let i = 0; i < allActivesCopy.length; i++) {
                const action = allActivesCopy[i];

                
                if (activeCooldowns[i] > 0) {

                    continue;

                }

                if (time < currentCastEndTime) {

                    // We're still casting, skip to next ability
                    if (action.name === "Molten Steel") {
                        // Skipping Molten Steel - still casting
                    }
                    continue;

                }



                // Check if this ability has a cast time and would conflict with current casting

                if (action.castTime > 0 && castingAbility && castingAbility !== action.name) {

                    // Another ability is currently casting, skip this one

                    continue;

                }



                // ========================================

                // RESOURCE & VALIDATION CHECKS

                // ========================================



                let canCast = true;

                const isPrim = action.weapon === primWeapon;

                const isSec = action.weapon === secWeapon;

                const isAux = action.weapon === auxWeapon;

                const isValidWeapon = isPrim || isSec || isAux || primWeapon === "All";



                const reqResources = action.resourceRequirement || action.resourceConsumption || 5;
                
                // For abilities that consume all resources, determine the actual consume amount
                let consumeAmount = reqResources;
                if (action.resourceConsumption > 0 && action.resourceRequirement !== action.resourceConsumption) {
                    // This is a "consume all resources" ability
                    if (action.minResources && action.minResources > 0) {
                        // Use the minimum resources setting
                        consumeAmount = action.minResources;
                    } else {
                        // Consume what's actually available for each weapon
                        if (isPrim && isSec) {
                            // Dual wield: consume from both weapons
                            consumeAmount = Math.min(action.resourceConsumption, primResources, secResources);
                        } else if (isPrim) {
                            // Primary only
                            consumeAmount = Math.min(action.resourceConsumption, primResources);
                        } else if (isSec) {
                            // Secondary only
                            consumeAmount = Math.min(action.resourceConsumption, secResources);
                        }
                    }
                }
                


                // Abilities can only be cast from equipped weapons (unless primary is "All")

                if (!isValidWeapon) {
                    if (action.name === "Molten Steel") {
                            // Molten Steel filtered out - invalid weapon
                        }
                    continue;

                }



                if (action.isConsumer) {
                    if (action.name === "Molten Steel") {
                        // Molten Steel resource check
                    }
                    // Use the higher of inherent requirement and user-set min resources
                    const minRes = action.minResources || 0;
                    const finalMinRes = Math.max(reqResources, minRes);

                    if (isPrim && primResources < finalMinRes) {
                        if (action.name === "Molten Steel") {
                            // Molten Steel cannot cast: insufficient resources
                        }
                        canCast = false;

                    }

                    if (isSec && secResources < finalMinRes) {
                        canCast = false;

                    }
                }


                if (!canCast) {
                    continue;
                }

                // Slot 1 Builder Priority Rule: Only cast pure resource builders when no other ability is available
                // Allow damage-dealing builders (like Blade Torrent) to be cast alongside consumers
                if (action.orderPriority === 1 && !action.isConsumer) {
                    // Check if this is a damage-dealing builder vs pure resource builder
                    const isDamageBuilder = action.scaling > 0; // Has damage scaling
                    
                    // Only apply priority rule to pure resource builders (no damage scaling)
                    if (!isDamageBuilder) {
                        // Check if any other ability is available to cast
                        let otherAbilityAvailable = false;
                        for (let j = 0; j < allActivesCopy.length; j++) {
                            if (j === i) continue; // Skip self
                            
                            const otherAction = allActivesCopy[j];
                            if (activeCooldownsCopy[j] > 0) continue; // On cooldown
                            
                            // Check basic availability for other abilities
                            const otherIsPrim = otherAction.weapon === primWeapon;
                            const otherIsSec = otherAction.weapon === secWeapon;
                            const otherIsAux = otherAction.weapon === auxWeapon;
                            const otherIsValidWeapon = otherIsPrim || otherIsSec || otherIsAux || primWeapon === "All";
                            
                            if (!otherIsValidWeapon) continue;
                            
                            // Check resource requirements for other abilities
                            let otherCanCast = true;
                            const otherReqResources = otherAction.resourceRequirement || otherAction.resourceConsumption || 5;
                            
                            // For abilities that consume all resources, check if we have at least the minimum
                            let otherConsumeAmount = otherReqResources;
                            if (otherAction.resourceConsumption > 0 && otherAction.resourceRequirement !== otherAction.resourceConsumption) {
                                otherConsumeAmount = otherAction.resourceConsumption;
                            }
                            
                            if (otherAction.isConsumer) {
                                const otherMinRes = otherAction.minResources || 0;
                                const otherFinalMinRes = Math.max(otherReqResources, otherMinRes);
                                
                                if (otherIsPrim && primResources < otherFinalMinRes) {
                                    otherCanCast = false;
                                }
                                if (otherIsSec && secResources < otherFinalMinRes) {
                                    otherCanCast = false;
                                }
                                // Auxiliary weapons don't use resources, so they're always available
                            }
                            
                            // For builders, check if we have room for more resources
                            if (!otherAction.isConsumer && otherAction.tree !== "Aux") {
                                if (otherIsPrim && primResources >= 5) {
                                    otherCanCast = false; // Already at max resources
                                }
                                if (otherIsSec && secResources >= 5) {
                                    otherCanCast = false; // Already at max resources
                                }
                            }
                            
                            if (otherCanCast) {
                                otherAbilityAvailable = true;
                                break;
                            }
                        }
                        
                        if (otherAbilityAvailable) {
                            continue; // Skip pure resource builder, other ability is available
                        }
                    }
                    // Damage builders proceed normally (can be cast alongside consumers)
                }

                if (canCast) {

                    // ========================================

                    // DEBUFF REQUIREMENT CHECKS

                    // ========================================

                    

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
                        if (action.name === "Molten Steel") {
                            // Molten Steel filtered out - debuff requirements not met
                        }
                        // Skip this ability if debuff requirements aren't met


                        activeCooldowns[i] = 0.1; // Small delay to prevent infinite loop

                        continue;

                    }




                    // ========================================

                    // ABILITY EXECUTION

                    // ========================================



                    // Store current debuff state for damage calculation

                    const currentDebuffState = {

                        afflicted: enemyDebuffs.afflicted,

                        weakened: enemyDebuffs.weakened,

                        hindered: enemyDebuffs.hindered,

                        impaired: enemyDebuffs.impaired

                    };

                    

                    // Self-protection check: ensure abilities don't affect player

                    if (wouldAffectPlayer(action)) {

                        continue; // Skip abilities that would affect player

                    }

                    

                    // Drone/Turret protection check: ensure abilities don't target drones/turrets

                    if (wouldAffectDronesOrTurrets(action)) {

                        continue; // Skip abilities that would affect drones/turrets

                    }


                    performAttack(action, action.weapon, currentDebuffState, cp, consumeAmount);



                    // Apply debuffs from this ability

                    if (action.appliedDebuffs.length > 0) {

                        for (const debuff of action.appliedDebuffs) {

                            enemyDebuffs[debuff] = true;

                            const duration = action.appliedDebuffDurations[debuff] || 5;

                            enemyDebuffs[debuff + "Duration"] = duration;

                        }

                    }

                    // Trigger Gunsmoke when weakened is applied
                    if (action.appliedDebuffs.includes('weakened')) {
                        allPassives.forEach(passive => {
                            if (passive.name === 'Gunsmoke') {
                                // Calculate Gunsmoke damage
                                const pSignetMult = 1.0;
                                if (passive.subtype && sBonus.subtype[passive.subtype]) {
                                    pSignetMult += sBonus.subtype[passive.subtype] / 100;
                                }
                                if (passive.weapon && sBonus.weapon[passive.weapon]) {
                                    pSignetMult += sBonus.weapon[passive.weapon] / 100;
                                }
                                
                                const gunsmokeDamage = (passive.scalingToUse || 0) * cp * pSignetMult * equilibriumMult;
                                totalDamage += gunsmokeDamage;
                            }
                        });
                    }


                    const timeTaken = action.castTime;

    

    // Set cast tracking for abilities with cast times

    if (action.castTime > 0) {

        currentCastEndTime = time + action.castTime;
                        castingAbility = action.name;

                    }

                    

                    time += timeTaken;

                    // Apply cooldown reduction augments
                    let actualCooldown = action.cooldown;
                    
                    // Find ability index to get the correct augment for cooldown reduction
                    let abilityIndex = -1;
                    const allAbilitySelects = [...activeSelects, ...eliteActiveSelects, ...auxActiveSelects];
                    for (let j = 0; j < allAbilitySelects.length; j++) {
                        if (allAbilitySelects[j].value && tswData[allAbilitySelects[j].value]) {
                            const selectedAbility = tswData[allAbilitySelects[j].value];
                            // Match by name and weapon to ensure correct ability
                            if (selectedAbility.name === action.name && selectedAbility.weapon === action.weapon) {
                                abilityIndex = j;
                                break;
                            }
                        }
                    }
                    
                    if (abilityIndex >= 0) {
                        const augment = getAugmentEffectsForAbility(abilityIndex);
                        if (augment && augment.effect.cooldownReduction) {
                            actualCooldown = action.cooldown * (1 - augment.effect.cooldownReduction);
                        }
                    }
                    
                    activeCooldowns[i] = actualCooldown;
                    
                    // Apply team cooldown reduction from Mercurial and Accelerating augments
                    if (abilityIndex >= 0) {
                        const augment = getAugmentEffectsForAbility(abilityIndex);
                        if (augment && augment.effect) {
                            let teamCooldownReduction = 0;
                            
                            // Check for Mercurial Augment (teamCooldownReduction)
                            if (augment.effect.teamCooldownReduction) {
                                teamCooldownReduction = augment.effect.teamCooldownReduction;
                            }
                            // Check for Accelerating Augment (cooldownReduction but applies to team)
                            else if (augment.effect.cooldownReduction) {
                                teamCooldownReduction = augment.effect.cooldownReduction;
                            }
                            
                            if (teamCooldownReduction > 0) {
                                // Apply cooldown reduction to all active abilities
                                for (let j = 0; j < allActives.length; j++) {
                                    if (activeCooldowns[j] > 0) {
                                        activeCooldowns[j] = activeCooldowns[j] * (1 - teamCooldownReduction / 100);
                                    }
                                }
                                
                                // Apply cooldown reduction to all passive abilities
                                for (let j = 0; j < allPassives.length; j++) {
                                    if (passiveCooldowns[j] > 0) {
                                        passiveCooldowns[j] = passiveCooldowns[j] * (1 - teamCooldownReduction / 100);
                                    }
                                }
                            }
                        }
                    }

                    

                    // Clear cast tracking when cast completes

                    if (time >= currentCastEndTime) {

                        castingAbility = null;

                        currentCastEndTime = 0;

                    }



                    // ========================================

                    // RESOURCE MANAGEMENT

                    // ========================================



                    if (action.isConsumer) {

                        if (isPrim) {

                            primResources -= consumeAmount;

                        }

                        if (isSec) {
                            secResources -= consumeAmount;

                        }

                        // Auxiliary weapons don't consume resources

                    } else if (action.tree !== "Aux") {

                        // Special handling for Full Momentum - grants 5 Hammer resources
                        if (action.name === "Full Momentum") {
                            if (isPrim) {
                                primResources = Math.min(5, primResources + 5);
                            }
                            if (isSec) {
                                secResources = Math.min(5, secResources + 5);
                            }
                        } else {
                            // Check if ability builds resources for all equipped weapons (handle various wording)
                            const buildsForAllWeapons = action.description && (
                                action.description.includes("Builds 1 resource for each equipped weapon") ||
                                action.description.includes("Builds a weapon resource for each equipped weapon") ||
                                action.description.includes("Builds 2 resource for each equipped weapon")
                            );
                            
                                                        
                            // Determine how many resources to build per weapon
                            let resourcesToBuild = 1;
                            if (action.description && action.description.includes("Builds 2 resource for each equipped weapon")) {
                                resourcesToBuild = 2;
                            }
                            
                            if (buildsForAllWeapons) {
                                // Build resources for all equipped weapons
                                if (primWeapon !== "All") {
                                    primResources = Math.min(5, primResources + resourcesToBuild);
                                }
                                if (secWeapon !== "All") {
                                    secResources = Math.min(5, secResources + resourcesToBuild);
                                }
                                if (auxWeapon !== "All") {
                                    auxResources = Math.min(5, auxResources + resourcesToBuild);
                                }
                            } else {
                                // Regular builders only add 1 resource to their specific weapon
                                if (isPrim) {
                                    primResources = Math.min(5, primResources + 1);
                                }
                                if (isSec) {
                                    secResources = Math.min(5, secResources + 1);
                                }
                            }
                        }

                    }



                    // Effects

                    const isSummoning = action.name.toLowerCase().includes("drone") || 
                                       action.name.toLowerCase().includes("turret");
                    
                    
                    if (isSummoning) {
                    }

                    if (action.duration > 0 && action.tickInterval > 0) {
                        activeEffects.push({

                            name: action.name + " (Effect)",

                            originalName: action.name, // Keep original name for damage tracking

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

                    

                    // ========================================
                    // PLAYER BUFF APPLICATION
                    // ========================================
                    
                    // ========================================
                    // PLAYER BUFF APPLICATION
                    // ========================================
                    
                    // Deadly Aim - +40% Crit Chance for 10 seconds
                    if (action.name === "Deadly Aim" && !playerBuffs.uncalibrated.active) {
                        let deadlyAimDuration = 10; // Base duration
                        let uncalibratedDuration = 90; // Base cooldown
                        
                        // Only reduce duration/cooldown if Calling The Shots passive is equipped
                        const callingTheShotsPassive = allPassives.find(p => p.name === "Calling The Shots");
                        if (callingTheShotsPassive) {
                            deadlyAimDuration -= 30; // Reduces recharge time by 30 seconds
                            uncalibratedDuration -= 30; // Reduces duration of Uncalibrated effect by 30 seconds
                        }
                        
                        playerBuffs.deadlyAim.active = true;
                        playerBuffs.deadlyAim.endTime = time + Math.max(0, deadlyAimDuration);
                        playerBuffs.deadlyAim.critChanceBonus = 40;
                        playerBuffs.uncalibrated.active = true;
                        playerBuffs.uncalibrated.endTime = time + Math.max(0, uncalibratedDuration);
                    }
                    
                    // Breaching Shot - +45% Pen Chance for 8 seconds
                    if (action.name === "Breaching Shot" && !playerBuffs.depleted.active) {
                        let breachingShotDuration = 8; // Base duration
                        let depletedDuration = 90; // Base cooldown
                        
                        // Only reduce duration/cooldown if Breach Party passive is equipped
                        const breachPartyPassive = allPassives.find(p => p.name === "Breach Party");
                        if (breachPartyPassive) {
                            breachingShotDuration -= 30; // Reduces recharge time by 30 seconds
                            depletedDuration -= 30; // Reduces duration of Depleted effect by 30 seconds
                        }
                        
                        playerBuffs.breachingShot.active = true;
                        playerBuffs.breachingShot.endTime = time + Math.max(0, breachingShotDuration);
                        playerBuffs.breachingShot.penChanceBonus = 45;
                        playerBuffs.depleted.active = true;
                        playerBuffs.depleted.endTime = time + Math.max(0, depletedDuration);
                    }
                    
                    // Out For A Kill - +10% Pen Chance for 8 seconds (when enemies are killed)
                    if (action.name === "Out For A Kill") {
                        // This is a simplified implementation - in reality it triggers on kills
                        playerBuffs.outForAKill.active = true;
                        playerBuffs.outForAKill.endTime = time + 8;
                        playerBuffs.outForAKill.penChanceBonus = 10;
                    }
                    
                    // Flak Jacket - -15% damage taken for 5 seconds
                    if (action.name === "Flak Jacket") {
                        playerBuffs.flakJacket.active = true;
                        playerBuffs.flakJacket.endTime = time + 5;
                        playerBuffs.flakJacket.damageReduction = 15;
                    }
                    
                    // Defensive Turret - -3% damage taken per resource consumed
                    if (action.name === "Defensive Turret") {
                        const resourceCount = action.resourcesUsed || 5; // Default to 5 resources
                        playerBuffs.defensiveTurret.active = true;
                        playerBuffs.defensiveTurret.endTime = time + 10; // Turret lasts 10 seconds
                        playerBuffs.defensiveTurret.damageReduction = 3 * resourceCount;
                    }
                    
                    // Lock, Stock & Barrel - Next Shotgun consumer builds 5 resources
                    if (action.name === "Lock, Stock & Barrel") {
                        playerBuffs.lockStockBarrel.active = true;
                        playerBuffs.lockStockBarrel.endTime = time + 20;
                    }
                    
                    // Shotgun Wedding - +25% damage per hit, stacks up to 4 times
                    if (action.name === "Shotgun Wedding") {
                        playerBuffs.shotgunWedding.active = true;
                        playerBuffs.shotgunWedding.endTime = time + 10; // Effect duration after channel
                        playerBuffs.shotgunWedding.stacks = 0; // Reset stacks, will be incremented per hit
                    }
                    
                    // Handle active ability self-buffs
                    if (action.selfDamageBuff && action.selfDamageBuff.percent > 0) {
                        // Masters House and similar abilities
                        if (action.name === "Masters House") {
                            playerBuffs.mastersHouse.active = true;
                            playerBuffs.mastersHouse.endTime = time + action.selfDamageBuff.duration;
                            playerBuffs.mastersHouse.damageBonusPercent = action.selfDamageBuff.percent;
                        } else {
                            // Generic damage buff for other abilities
                            playerBuffs.genericDamageBuff.active = true;
                            playerBuffs.genericDamageBuff.endTime = time + action.selfDamageBuff.duration;
                            playerBuffs.genericDamageBuff.damageBonusPercent = action.selfDamageBuff.percent;
                        }
                    }
                    
                    // Short Fuse - team damage buff
                    if (action.name === "Short Fuse") {
                        // Base Short Fuse gives 20% damage increase
                        playerBuffs.shortFuse.active = true;
                        playerBuffs.shortFuse.endTime = time + 10; // 10 second duration
                        playerBuffs.shortFuse.damageBonusPercent = 20; // Base value
                    }
                    
                    
                    // Calculate augment bonuses for passive buff effects
                    let augmentHitRatingBonusForPassives = 0;
                    let augmentEvadeReductionBonusForPassives = 0;
                    let augmentPenChanceBonusForPassives = 0;
                    
                    // Find ability index to get the correct augment for passive effects
                    let abilityIndexForPassives = -1;
                    const allAbilitySelectsForPassives = [...activeSelects, ...eliteActiveSelects, ...auxActiveSelects];
                    for (let j = 0; j < allAbilitySelectsForPassives.length; j++) {
                        if (allAbilitySelectsForPassives[j].value && tswData[allAbilitySelectsForPassives[j].value]) {
                            const selectedAbility = tswData[allAbilitySelectsForPassives[j].value];
                            // Match by name and weapon to ensure correct ability
                            if (selectedAbility.name === action.name && selectedAbility.weapon === action.weapon) {
                                abilityIndexForPassives = j;
                                break;
                            }
                        }
                    }
                    
                    if (abilityIndexForPassives >= 0) {
                        const augment = getAugmentEffectsForAbility(abilityIndexForPassives);
                        if (augment && augment.effect) {
                            if (augment.effect.hitRating) {
                                augmentHitRatingBonusForPassives += augment.effect.hitRating;
                            }
                            if (augment.effect.evadeReduction) {
                                augmentEvadeReductionBonusForPassives += augment.effect.evadeReduction;
                            }
                            if (augment.effect.penChance) {
                                augmentPenChanceBonusForPassives += augment.effect.penChance;
                            }
                        }
                    }
                    
                    // Calculate hit results for passive buff effects
                    const currentHitRatingForPassives = action.hitRating + augmentHitRatingBonusForPassives;
                    const effectiveEvadeRatingForPassives = Math.max(0, enemy.evadeRating - augmentEvadeReductionBonusForPassives);
                    const isEvadedForPassives = effectiveEvadeRatingForPassives > currentHitRatingForPassives;
                    const isGlanced = !isEvadedForPassives && enemy.defenseRating > currentHitRatingForPassives;
                    
                    // Calculate penetration status for passive effects
                    const effectivePenChanceForPassives = action.penChance + augmentPenChanceBonusForPassives;
                    const isPenetrated = Math.random() * 100 < effectivePenChanceForPassives;
                    
                    // Apply passive buff effects
                    // Lethality - +1.25% damage per stack on hit, removed on glance
                    if (action.type === "Active" && !isGlanced) {
                        const lethalityPassive = allPassives.find(p => p.name === "Lethality");
                        if (lethalityPassive) {
                            playerBuffs.lethality.active = true;
                            playerBuffs.lethality.endTime = time + 10;
                            playerBuffs.lethality.stacks = Math.min(10, (playerBuffs.lethality.stacks || 0) + 1);
                            playerBuffs.lethality.damageBonusPercent = playerBuffs.lethality.stacks * 1.25;
                        }
                    }
                    
                    // Handle passive abilities that grant stacking rating buffs
                    allPassives.forEach(passive => {
                        const passiveDesc = passive.originalAbility && passive.originalAbility.description || "";
                        
                        // Check for passive abilities that grant rating stacks on critical hits
                        if (passiveDesc.includes("Whenever you critically hit") && passiveDesc.includes("Critical Rating")) {
                            // Check if this passive applies to the current ability
                            const shouldApply = !passive.weapon || passive.weapon === action.weapon || 
                                              (passiveDesc.includes("abilities") && !passiveDesc.includes(action.weapon + " abilities"));
                            
                            if (shouldApply && Math.random() * 100 < effectivePenChanceForPassives) {
                                // Simulate a critical hit and grant the stack
                                addBuffStack('critRatingStacks', time);
                            }
                        }
                        
                        // Check for passive abilities that grant rating stacks on penetration
                        if (passiveDesc.includes("Whenever you penetrate") && passiveDesc.includes("Rating")) {
                            if (isPenetrated) {
                                // Determine which rating based on description
                                if (passiveDesc.includes("Penetration Rating")) {
                                    addBuffStack('penRatingStacks', time);
                                } else if (passiveDesc.includes("Hit Rating")) {
                                    addBuffStack('hitRatingStacks', time);
                                } else if (passiveDesc.includes("Critical Rating")) {
                                    addBuffStack('critRatingStacks', time);
                                }
                            }
                        }
                        
                        // Check for passive abilities that grant rating stacks on any hit
                        if (passiveDesc.includes("Whenever you hit") && passiveDesc.includes("Rating")) {
                            if (!isEvadedForPassives) {
                                // Determine which rating based on description
                                if (passiveDesc.includes("Critical Rating")) {
                                    addBuffStack('critRatingStacks', time);
                                } else if (passiveDesc.includes("Hit Rating")) {
                                    addBuffStack('hitRatingStacks', time);
                                } else if (passiveDesc.includes("Penetration Rating")) {
                                    addBuffStack('penRatingStacks', time);
                                } else if (passiveDesc.includes("Evade Rating")) {
                                    addBuffStack('evadeRatingStacks', time);
                                } else if (passiveDesc.includes("Block Rating")) {
                                    addBuffStack('blockRatingStacks', time);
                                } else if (passiveDesc.includes("Defence Rating")) {
                                    addBuffStack('defenceRatingStacks', time);
                                }
                            }
                        }
                        
                        // Check for conditional passive abilities (e.g., on impaired, weakened targets)
                        if (passiveDesc.includes("impaired") && enemyDebuffs.impaired) {
                            if (passiveDesc.includes("Critical Rating")) {
                                addBuffStack('critRatingStacks', time);
                            } else if (passiveDesc.includes("Defence Rating")) {
                                addBuffStack('defenceRatingStacks', time);
                            }
                        }
                        
                        if (passiveDesc.includes("weakened") && enemyDebuffs.weakened) {
                            if (passiveDesc.includes("Critical Power Rating")) {
                                addBuffStack('critPowerRatingStacks', time);
                            }
                        }
                        
                        if (passiveDesc.includes("hindered") && enemyDebuffs.hindered) {
                            if (passiveDesc.includes("Critical Rating")) {
                                addBuffStack('critRatingStacks', time);
                            }
                        }
                    });
                    
                    // Remove Lethality stacks on glance
                    if (isGlanced) {
                        playerBuffs.lethality.stacks = 0;
                        playerBuffs.lethality.damageBonusPercent = 0;
                        if (playerBuffs.lethality.stacks === 0) {
                            playerBuffs.lethality.active = false;
                        }
                    }
                    
                    // Beanbag Rounds - Minor Penetration on Hindered application
                    if (action.appliedDebuffs.includes('hindered')) {
                        const beanbagPassive = allPassives.find(p => p.name === "Beanbag Rounds");
                        if (beanbagPassive) {
                            playerBuffs.minorPenetration.active = true;
                            playerBuffs.minorPenetration.endTime = time + 8;
                            playerBuffs.minorPenetration.penChanceBonus = 15;
                        }
                    }
                    
                    // Overpenetration - Minor Penetration after 3 penetrations
                    if (isPenetrated) {
                        const overpenetrationPassive = allPassives.find(p => p.name === "Overpenetration");
                        if (overpenetrationPassive) {
                            // Simplified - just grant the buff on any penetration
                            playerBuffs.minorPenetration.active = true;
                            playerBuffs.minorPenetration.endTime = time + 8;
                            playerBuffs.minorPenetration.penChanceBonus = 15;
                        }
                    }
                    
                    // No Contest - +10% damage after applying Hindered
                    if (action.appliedDebuffs.includes('hindered')) {
                        const noContestPassive = allPassives.find(p => p.name === "No Contest");
                        if (noContestPassive) {
                            playerBuffs.noContest.active = true;
                            playerBuffs.noContest.endTime = time + 8;
                            playerBuffs.noContest.damageBonusPercent = 10;
                        }
                    }
                    
                    // Update all player buff durations
                    playerBuffs.deadlyAim.active = time <= playerBuffs.deadlyAim.endTime;
                    playerBuffs.breachingShot.active = time <= playerBuffs.breachingShot.endTime;
                    playerBuffs.lethality.active = time <= playerBuffs.lethality.endTime;
                    playerBuffs.outForAKill.active = time <= playerBuffs.outForAKill.endTime;
                    playerBuffs.noContest.active = time <= playerBuffs.noContest.endTime;
                    playerBuffs.shotgunWedding.active = time <= playerBuffs.shotgunWedding.endTime;
                    playerBuffs.mastersHouse.active = time <= playerBuffs.mastersHouse.endTime;
                    playerBuffs.genericDamageBuff.active = time <= playerBuffs.genericDamageBuff.endTime;
                    playerBuffs.minorPenetration.active = time <= playerBuffs.minorPenetration.endTime;
                    playerBuffs.penetrationRating.active = time <= playerBuffs.penetrationRating.endTime;
                    playerBuffs.protection.active = time <= playerBuffs.protection.endTime;
                    playerBuffs.flakJacket.active = time <= playerBuffs.flakJacket.endTime;
                    playerBuffs.defensiveTurret.active = time <= playerBuffs.defensiveTurret.endTime;
                    playerBuffs.lockStockBarrel.active = time <= playerBuffs.lockStockBarrel.endTime;
                    playerBuffs.uncalibrated.active = time <= playerBuffs.uncalibrated.endTime;
                    playerBuffs.depleted.active = time <= playerBuffs.depleted.endTime;
                    
                    // Update team buff durations
                    teamBuffs.damageBuff.active = time <= teamBuffs.damageBuff.endTime;
                    teamBuffs.healingBuff.active = time <= teamBuffs.healingBuff.endTime;
                    teamBuffs.damageReduction.active = time <= teamBuffs.damageReduction.endTime;
                    
                    // Update Short Fuse buff duration
                    playerBuffs.shortFuse.active = time <= playerBuffs.shortFuse.endTime;

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

                            // Special handling for Power Line effect - build stacks on each tick
                            if (eff.name === "Power Line") {
                                addPowerLineStack(time);
                            }

                            performAttack({

                                name: eff.name,

                                subtype: eff.subtype,

                                scalingToUse: eff.scalingToUse,

                                weapon: eff.weapon,

                                isManifestation: eff.isManifestation

                            }, eff.weapon, enemyDebuffs, cp);

                            eff.nextTick += eff.tickInterval;

                        }

                        return eff.duration > 0;

                    });



                    // DoT Effect Ticks (for passives like Bloodsport)

                    activeDoTEffects = activeDoTEffects.filter(dot => {

                        dot.duration -= timeTaken;

                        dot.nextTick -= timeTaken;

                        while (dot.nextTick <= 0 && dot.duration >= 0) {

                            // Apply DoT damage

                            const dotDamage = dot.damage;

                            totalDamage += dotDamage;

                            

                            // Add to stats breakdown using the source passive name

                            const dotKey = `passive_${allPassives.findIndex(p => p.name === dot.sourcePassive)}_${dot.sourcePassive}`;

                            if (statsBreakdown[dotKey]) {

                                statsBreakdown[dotKey].damage += dotDamage;

                            }

                            


                            dot.nextTick += dot.interval;

                        }

                        return dot.duration > 0;

                    });



                    castSomething = true;

                    // Don't break - continue checking other abilities in the same iteration
                    // This allows for more complex rotations and proper resource management

                }

            }



            if (!castSomething) {

                let minWait = 1.0;

                for (let c of activeCooldowns) if (c > 0 && c < minWait) minWait = c;

                

                // Check if we're in the middle of a cast and wait for it to complete

                if (time < currentCastEndTime) {

                    minWait = Math.min(minWait, currentCastEndTime - time);

                }

                

                time += minWait;

                for (let j = 0; j < activeCooldowns.length; j++) activeCooldowns[j] -= minWait;

                for (let j = 0; j < passiveCooldowns.length; j++) passiveCooldowns[j] -= minWait;

                for (let j = 0; j < passiveCounterCooldowns.length; j++) passiveCounterCooldowns[j] -= minWait;

                

                // Update talisman effect cooldowns

                talismanEffects.mothersWrath.cooldown = Math.max(0, talismanEffects.mothersWrath.cooldown - minWait);

                

                // Update talisman effect duration timeouts for real talismans

                talismanEffects.lycanthropeBonePowder.endTime = Math.max(0, talismanEffects.lycanthropeBonePowder.endTime - minWait);

                talismanEffects.essentialSaltedCurwen.endTime = Math.max(0, talismanEffects.essentialSaltedCurwen.endTime - minWait);

                

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

                // Update all stacking buffs

                updateAllStackingBuffs(time);

                // Process DoT ticks during time advancement

                activeDoTEffects = activeDoTEffects.filter(dot => {

                    dot.duration -= minWait;

                    dot.nextTick -= minWait;

                    while (dot.nextTick <= 0 && dot.duration >= 0) {

                        // Apply DoT damage

                        const dotDamage = dot.damage;

                        totalDamage += dotDamage;

                        

                        // Add to stats breakdown using the source passive name

                        const dotKey = `passive_${allPassives.findIndex(p => p.name === dot.sourcePassive)}_${dot.sourcePassive}`;

                        if (statsBreakdown[dotKey]) {

                            statsBreakdown[dotKey].damage += dotDamage;

                        }

                        


                        dot.nextTick += dot.interval;

                    }

                    return dot.duration > 0;

                });

                

                // Clear cast tracking when cast completes

                if (time >= currentCastEndTime) {

                    if (castingAbility) {


                    }

                    castingAbility = null;

                    currentCastEndTime = 0;

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

            // Calculate crit and pen percentages for all abilities
            let critChance = stat.casts > 0 ? ((stat.crits / stat.casts) * 100).toFixed(1) : 0;
            let penChance = stat.penetrations && stat.casts > 0 ? ((stat.penetrations / stat.casts) * 100).toFixed(1) : 0;
            
            nameSpan.innerHTML = `<strong>${stat.name}</strong> <span style="color:var(--text-secondary);font-size:0.8rem;">(${stat.casts} casts)</span><br><span style="color:var(--text-secondary);font-size:0.7rem;">Crit: ${critChance}% (${stat.crits}) | Pen: ${penChance}% (${stat.penetrations})</span>`;



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

            // This has a duration-based effect that should be calculated as uptime

            6: { slot: 'weapon', stat: 'crit-power-pct', value: [8, 16, 24], duration: 15, cooldown: 15, type: 'proc' }, // Laceration



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
            70: { slot: 'major', stat: 'equilibrium', value: [1, 1, 1] }, // Signet of Equilibrium (healing crit buff)



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

            

            // Store talisman data for special effects like Woodcutter's Wrath

            window._importedGear = {};



            slots.forEach(slot => {

                const data = params.get(slot.id);

                if (!data) return;



                const vals = data.split(',');

                if (vals.length < 7) {


                    return;

                }

                

                const qlIdx = parseInt(vals[0]);

                const itemId = parseInt(vals[1]);

                const glyphQlIdx = parseInt(vals[2]);

                const primStatId = parseInt(vals[3]);

                const secStatId = parseInt(vals[4]);

                const primDist = parseInt(vals[5]);

                const secDist = parseInt(vals[6]);

                const signetQual = vals.length > 7 ? parseInt(vals[7]) || 0 : 0;

                const signetId = vals.length > 8 ? parseInt(vals[8]) || 0 : 0;



                if (slot.type === 'weapon') {

                    if (slot.id === 'weapon') {

                        const wpKey = qlIdx === 11 ? '11.0' : `10.${qlIdx}`;

                        weaponPower = TSWCALC_DATA.weaponPower[wpKey] || 75;

                        const wName = TSWCALC_DATA.wtype_mapping[itemId];

                        if (wName && weaponSelect) {

                            weaponSelect.value = wName;

                        }

                    } else if (slot.id === 'weapon2') {

                        const wName2 = TSWCALC_DATA.wtype_mapping[itemId];

                        if (wName2 && secondaryWeaponSelect) {

                            secondaryWeaponSelect.value = wName2;

                        }

                    }

                } else if (slot.type === 'talisman') {

                    // Store talisman data for special effects

                    window._importedGear[slot.id] = {

                        talismanId: itemId,

                        quality: qlIdx,

                        signetId: signetId,

                        signetQuality: signetQual

                    };

                    

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

                            // Handle duration-based signets (like Laceration)
                            if (signet.type === 'proc' && signet.duration && signet.cooldown) {
                                // Calculate uptime for proc-based effects
                                // For Laceration: 15s duration, 15s cooldown, triggers on crit
                                // Assuming 20% crit chance and frequent attacks = high uptime
                                const procUptime = (signet.duration / (signet.cooldown + signet.duration)) * 100;
                                const adjustedBonus = bonus * (procUptime / 100);
                                signetBonuses.critPowerPct += adjustedBonus;
                            } else {
                                // Permanent signet bonus
                                signetBonuses.critPowerPct += bonus;
                            }

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

                        case 'equilibrium':

                            // Signet of Equilibrium: enables healing crit buff functionality

                            signetBonuses.equilibrium = true;

                            break;

                        case 'affliction-dmg-pct':

                            // Corruption signet: increases affliction damage

                            signetBonuses.afflictionDmgPct += bonus;

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



            // Ensure calculations are safe

            const safeAttackRating = Math.max(0, attackRating || 0);

            const safeWeaponPower = Math.max(0, weaponPower || 75);

            const safeCritRating = Math.max(0, critRating || 0);

            const safeCritPowerRating = Math.max(0, critPowerRating || 0);

            

            const cp = cpFormula(safeAttackRating, safeWeaponPower);

            const critChance = Math.max(0, Math.min(100, 55.14 - (100.3 / (Math.pow(Math.E, (safeCritRating / 790.3)) + 1))));

            // Apply Laceration's flat crit power % on top of the rated crit power

            const critPower = Math.sqrt(5 * safeCritPowerRating + 625) + (signetBonuses?.critPowerPct || 0);



            // Safely set input values with proper null checks

            if (cpInput) cpInput.value = cp;

            if (attackRatingInput) {

                attackRatingInput.value = Math.round(attackRating);

            }

            if (weaponPowerInput) {

                weaponPowerInput.value = Math.round(weaponPower);

            }

            if (hitRatingInput) hitRatingInput.value = Math.round(hitRating);

            if (critChanceInput) critChanceInput.value = critChance.toFixed(1);

            if (critPowerInput) critPowerInput.value = critPower.toFixed(1);

            if (penRatingInput) penRatingInput.value = Math.round(penRating);



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

                weapon1Name: weaponSelect ? weaponSelect.value : '',

                weapon2Name: secondaryWeaponSelect ? secondaryWeaponSelect.value : ''

            };



            updateAbilityDropdowns();

            calculate();




        } catch (err) {

            console.error('Failed to parse tswcalc URL:', err);

            alert('An error occurred while parsing the tswcalc URL. Check the console for details.');

        }

    }



    // ========== EVENT LISTENERS SETUP ==========
    
    // Weapon and enemy selection changes
    const weaponChangeElements = [weaponSelect, secondaryWeaponSelect, auxWeaponSelect];
    weaponChangeElements.forEach(select => {
        select.addEventListener('change', updateAbilityDropdowns);
    });
    
    targetEnemySelect.addEventListener('change', updateAbilityDropdowns);
    targetEnemySelect.addEventListener('change', calculate);
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

            // Exclude special passives from regular crit/pen percentage calculation

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



    // Combat power related inputs
    const combatPowerInputs = [attackRatingInput, weaponPowerInput];
    combatPowerInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                updateCombatPower();
                calculate();
            });
        }
    });

    // Stat inputs that trigger recalculation
    const statInputs = [hitRatingInput, critChanceInput, critPowerInput, penRatingInput, penChanceInput];
    statInputs.forEach(input => {
        if (input) input.addEventListener('input', calculate);
    });



    // Abilities Import Functionality
    const buildImportTextarea = document.getElementById('build-import-textarea');
    const importBuildBtn = document.getElementById('import-build-btn');
    const exportBuildBtn = document.getElementById('export-build-btn');
    const clearBuildBtn = document.getElementById('clear-build-btn');
    const importStatus = document.getElementById('import-status');

    function showImportStatus(message, isError = false) {
        if (importStatus) {
            importStatus.textContent = message;
            importStatus.style.color = isError ? '#ff6b6b' : '#51cf66';
            importStatus.style.display = 'block';
            setTimeout(() => {
                importStatus.style.display = 'none';
            }, 5000);
        }
    }

    function importBuild() {
        try {
            const buildText = (buildImportTextarea?.value || '').trim();
            
            if (!buildText) {
                showImportStatus('Please paste build data in the textarea', true);
                return;
            }

            // Ensure ability dropdowns are populated before importing
            updateAbilityDropdowns();

            let importedActives = 0;
            let importedPassives = 0;
            let importedAugments = 0;
            let errors = [];

            // Parse the unified build format
            // Split on === but handle the format correctly
            const parts = buildText.split('===').filter(part => part.trim());
            let currentSection = '';
            let activesText = '';
            let passivesText = '';
            let augmentsText = '';

            parts.forEach(part => {
                const lines = part.trim().split('\n').filter(line => line.trim());
                if (lines.length === 0) return;
                
                const firstLine = lines[0].trim().toLowerCase();
                
                if (firstLine.includes('active abilities')) {
                    currentSection = 'actives';
                    // Content starts from line 1 (skip the header)
                    activesText = lines.slice(1).join('\n').trim();
                } else if (firstLine.includes('passive abilities')) {
                    currentSection = 'passives';
                    // Content starts from line 1 (skip the header)
                    passivesText = lines.slice(1).join('\n').trim();
                } else if (firstLine.includes('augments')) {
                    currentSection = 'augments';
                    // Content starts from line 1 (skip the header)
                    augmentsText = lines.slice(1).join('\n').trim();
                } else {
                    // This is content for the current section
                    if (currentSection === 'actives') {
                        activesText += (activesText ? '\n' : '') + lines.join('\n');
                    } else if (currentSection === 'passives') {
                        passivesText += (passivesText ? '\n' : '') + lines.join('\n');
                    } else if (currentSection === 'augments') {
                        augmentsText += (augmentsText ? '\n' : '') + lines.join('\n');
                    }
                }
            });

            // Helper function to find ability by name
            function findAbilityByName(select, abilityName) {
                const option = Array.from(select.options).find(opt => 
                    opt.textContent.toLowerCase().includes(abilityName.toLowerCase())
                );
                
                // If exact match not found, try more flexible matching
                if (!option) {
                    const fallbackOption = Array.from(select.options).find(opt => {
                        const optText = opt.textContent.toLowerCase();
                        const searchText = abilityName.toLowerCase();
                        return optText.includes(searchText) || searchText.includes(optText);
                    });
                    return fallbackOption;
                }
                
                return option;
            }

            // Import active abilities
            if (activesText) {
                const activeLines = activesText.split('\n').filter(line => line.trim());
                const activeSelectors = document.querySelectorAll('#active-abilities-container .slot-wrapper');
                const eliteActiveSelect = document.querySelector('#elite-active-1');
                
                
                activeLines.forEach((line, index) => {
                    const parts = line.split('|').map(p => p.trim());
                    const abilityName = parts[0];
                    const priority = parts[1] || '';
                    const minResources = parts[2] || '';

                    let selector = null;
                    let select = null;
                    let priorityInput = null;
                    let minResInput = null;
                    let isElite = false;

                    // First try to find in regular active slots
                    if (index < activeSelectors.length) {
                        selector = activeSelectors[index];
                        select = selector.querySelector('select');
                        priorityInput = selector.querySelector('.slot-order-input');
                        minResInput = selector.querySelector('.slot-min-resources-input');
                    }

                    // If not found in regular slots or ability not found there, try elite slot
                    if (!select || !findAbilityByName(select, abilityName)) {
                        // Try to find in elite active slot
                        if (eliteActiveSelect && findAbilityByName(eliteActiveSelect, abilityName)) {
                            select = eliteActiveSelect;
                            // For elite active, we need to find the priority/min resources inputs differently
                            const eliteContainer = eliteActiveSelect.closest('.slot-wrapper') || eliteActiveSelect.parentElement;
                            if (eliteContainer) {
                                priorityInput = eliteContainer.querySelector('.slot-order-input');
                                minResInput = eliteContainer.querySelector('.slot-min-resources-input');
                            }
                            isElite = true;
                        }
                    }

                    if (select) {
                        const option = findAbilityByName(select, abilityName);
                        
                        if (option) {
                            select.value = option.value;
                            // Trigger change event to update UI
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            importedActives++;
                            
                            if (priorityInput && priority) {
                                priorityInput.value = priority;
                                priorityInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            if (minResInput && minResources) {
                                minResInput.value = minResources;
                                minResInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        } else {
                            // Check if this is a known non-existent ability and provide a helpful message
                            if (abilityName.toLowerCase().includes('power line') && abilityName.toLowerCase().includes('voltaic')) {
                                errors.push(`Active ability not found: ${abilityName}. This ability may not exist in the current game version or weapon setup.`);
                            } else {
                                errors.push(`Active ability not found: ${abilityName}`);
                            }
                        }
                    } else {
                        errors.push(`Active ability not found: ${abilityName}. No suitable slot available.`);
                    }
                });
            }

            // Import passive abilities
            if (passivesText) {
                const passiveLines = passivesText.split('\n').filter(line => line.trim());
                
                    // Check if we have any elite passives (look for abilities that contain "Elite" in their type)
                const eliteSelect = document.querySelector('#elite-passive-container select');
                const normalSelectors = document.querySelectorAll('#normal-passives-container .slot-wrapper');
                
                // Try to find if any passive is an elite passive
                let elitePassiveFound = false;
                for (let i = 0; i < passiveLines.length; i++) {
                    const passiveName = passiveLines[i].trim();
                    if (eliteSelect) {
                        const option = findAbilityByName(eliteSelect, passiveName);
                        if (option) {
                            // This is an elite passive
                            eliteSelect.value = option.value;
                            eliteSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            importedPassives++;
                            elitePassiveFound = true;
                            
                            // Import remaining passives as normal passives (skip the elite one)
                            const remainingPassives = passiveLines.slice(i + 1);
                            remainingPassives.forEach((passiveName, normalIndex) => {
                                if (normalIndex < normalSelectors.length) {
                                    const selector = normalSelectors[normalIndex];
                                    const select = selector.querySelector('select');
                                    
                                    if (select) {
                                        const option = findAbilityByName(select, passiveName);
                                        if (option) {
                                            select.value = option.value;
                                            select.dispatchEvent(new Event('change', { bubbles: true }));
                                            importedPassives++;
                                        } else {
                                            errors.push(`Passive not found: ${passiveName}`);
                                        }
                                    }
                                } else {
                                    errors.push(`Too many normal passives. Only ${normalSelectors.length} slots available.`);
                                }
                            });
                            break; // Done processing passives
                        }
                    }
                }
                
                // If no elite passive was found, treat all passives as normal passives
                if (!elitePassiveFound) {
                    passiveLines.forEach((passiveName, index) => {
                        if (index < normalSelectors.length) {
                            const selector = normalSelectors[index];
                            const select = selector.querySelector('select');
                            
                            if (select) {
                                const option = findAbilityByName(select, passiveName);
                                if (option) {
                                    select.value = option.value;
                                    select.dispatchEvent(new Event('change', { bubbles: true }));
                                    importedPassives++;
                                } else {
                                    errors.push(`Passive not found: ${passiveName}`);
                                }
                            }
                        } else {
                            errors.push(`Too many normal passives. Only ${normalSelectors.length} slots available.`);
                        }
                    });
                }
            }

            // Import augments - delay to allow augment UI to be created after ability imports
            if (augmentsText) {
                // Wait a bit for the augment UI to be created from the ability change events
                setTimeout(() => {
                    const augmentLines = augmentsText.split('\n').filter(line => line.trim());
                    let augmentImportErrors = [];
                    
                    augmentLines.forEach((line) => {
                        const parts = line.split('|').map(p => p.trim());
                        if (parts.length !== 2) {
                            augmentImportErrors.push(`Invalid augment format: ${line}. Use: Ability Name|Augment Name`);
                            return;
                        }

                        const [abilityName, augmentName] = parts;
                        
                        // Find the augment wrapper by ability name
                        const augmentWrappers = Array.from(document.querySelectorAll('#augments-container .augment-wrapper'));
                        const augmentWrapper = augmentWrappers.find(wrapper => {
                            const label = wrapper.querySelector('.augment-ability-name');
                            return label && label.textContent.toLowerCase().includes(abilityName.toLowerCase());
                        });

                        if (!augmentWrapper) {
                            augmentImportErrors.push(`Ability not found for augment: ${abilityName}`);
                            return;
                        }

                        const augmentSelect = augmentWrapper.querySelector('.augment-select');
                        if (augmentSelect) {
                            // Find the augment option that matches the augment name
                            const augmentOption = findAbilityByName(augmentSelect, augmentName);
                            
                            if (augmentOption) {
                                augmentSelect.value = augmentOption.value;
                                // Trigger change event to update UI
                                augmentSelect.dispatchEvent(new Event('change', { bubbles: true }));
                                importedAugments++;
                            } else {
                                augmentImportErrors.push(`Augment not found: ${augmentName}`);
                            }
                        }
                    });

                    // Update the status message with augment import results
                    if (augmentImportErrors.length > 0) {
                        const allErrors = [...errors, ...augmentImportErrors];
                        showImportStatus(`Imported ${importedActives} actives, ${importedPassives} passives, ${importedAugments} augments. Errors: ${allErrors.join('; ')}`, true);
                    } else {
                        showImportStatus(`Successfully imported ${importedActives} active abilities, ${importedPassives} passive abilities, and ${importedAugments} augments!`);
                    }
                    // Trigger calculation after augment import
                    setTimeout(calculate, 100);
                }, 500); // 500ms delay to allow UI to update
            }

            // Show results for abilities only (augments will show their own results)
            if (!augmentsText) {
                // Only show results if no augments to import
                if (errors.length > 0) {
                    showImportStatus(`Imported ${importedActives} actives, ${importedPassives} passives, ${importedAugments} augments. Errors: ${errors.join('; ')}`, true);
                } else {
                    showImportStatus(`Successfully imported ${importedActives} active abilities, ${importedPassives} passive abilities, and ${importedAugments} augments!`);
                    // Trigger calculation after import
                    setTimeout(calculate, 100);
                }
            }

        } catch (error) {
            showImportStatus(`Import failed: ${error.message}`, true);
        }
    }

    function clearImportFields() {
        if (buildImportTextarea) buildImportTextarea.value = '';
        if (importStatus) importStatus.style.display = 'none';
    }

    function exportAbilities() {
        try {
            let exportData = {
                actives: [],
                passives: [],
                augments: []
            };

            // Ensure ability dropdowns are populated
            updateAbilityDropdowns();

            // Export active abilities
            const activeSelectors = document.querySelectorAll('#active-abilities-container .slot-wrapper');
            
            activeSelectors.forEach((selector, index) => {
                const select = selector.querySelector('select');
                const priorityInput = selector.querySelector('.slot-order-input');
                const minResInput = selector.querySelector('.slot-min-resources-input');
                
                if (select && select.value) {
                    const abilityIndex = tswData[select.value];
                    if (abilityIndex) {
                        let line = abilityIndex.name;
                        const priority = priorityInput?.value;
                        const minRes = minResInput?.value;
                        
                        if (priority || minRes) {
                            line += `|${priority || ''}|${minRes || ''}`;
                        }
                        exportData.actives.push(line);
                    }
                }
            });

            // Export elite active
            const eliteActiveSelect = document.querySelector('#elite-active-container select');
            if (eliteActiveSelect && eliteActiveSelect.value) {
                const abilityIndex = tswData[eliteActiveSelect.value];
                if (abilityIndex) {
                    exportData.actives.push(abilityIndex.name);
                }
            }

            // Export aux active
            const auxActiveSelect = document.querySelector('#aux-ability-container select');
            if (auxActiveSelect && auxActiveSelect.value) {
                const abilityIndex = tswData[auxActiveSelect.value];
                if (abilityIndex) {
                    exportData.actives.push(abilityIndex.name);
                }
            }

            // Export passives
            const elitePassiveSelect = document.querySelector('#elite-passive-container select');
            if (elitePassiveSelect && elitePassiveSelect.value) {
                const abilityIndex = tswData[elitePassiveSelect.value];
                if (abilityIndex) {
                    exportData.passives.push(abilityIndex.name);
                }
            }

            const normalPassiveSelects = document.querySelectorAll('#normal-passives-container select');
            normalPassiveSelects.forEach((select) => {
                if (select && select.value) {
                    const abilityIndex = tswData[select.value];
                    if (abilityIndex) {
                        exportData.passives.push(abilityIndex.name);
                    }
                }
            });

            // Export augments
            const augmentWrappers = document.querySelectorAll('#augments-container .augment-wrapper');
            
            augmentWrappers.forEach((wrapper, index) => {
                const abilityLabel = wrapper.querySelector('.augment-ability-name');
                const augmentSelect = wrapper.querySelector('.augment-select');
                
                
                if (abilityLabel && augmentSelect && augmentSelect.selectedIndex >= 0) {
                    const augmentOption = augmentSelect.options[augmentSelect.selectedIndex];
                    
                    if (augmentOption && augmentOption.value) {
                        // Extract just the augment name (before the " - " part) for cleaner export
                        const fullText = augmentOption.textContent;
                        const augmentName = fullText.split(' - ')[0];
                        exportData.augments.push(`${abilityLabel.textContent}|${augmentName}`);
                    }
                }
            });
            

            // Format export text
            let exportText = '';
            
            if (exportData.actives.length > 0) {
                exportText += '=== ACTIVE ABILITIES ===\n';
                exportText += exportData.actives.join('\n') + '\n\n';
            }
            
            if (exportData.passives.length > 0) {
                exportText += '=== PASSIVE ABILITIES ===\n';
                exportText += exportData.passives.join('\n') + '\n\n';
            }
            
            if (exportData.augments.length > 0) {
                exportText += '=== AUGMENTS ===\n';
                exportText += exportData.augments.join('\n') + '\n\n';
            }

            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(exportText).then(() => {
                    showImportStatus(`Build exported to clipboard! (${exportData.actives.length} actives, ${exportData.passives.length} passives, ${exportData.augments.length} augments)`);
                }).catch(() => {
                    prompt('Copy the build export below:', exportText);
                });
            } else {
                prompt('Copy the build export below:', exportText);
            }

        } catch (error) {
            showImportStatus(`Export failed: ${error.message}`, true);
        }
    }

    if (importBuildBtn) {
        importBuildBtn.addEventListener('click', importBuild);
    }

    if (exportBuildBtn) {
        exportBuildBtn.addEventListener('click', exportAbilities);
    }

    if (clearBuildBtn) {
        clearBuildBtn.addEventListener('click', clearImportFields);
    }

    // Init

    initUI();

    updateAbilityDropdowns();

    calculate();

    // Add group mode toggle functionality
    const groupModeBtn = document.getElementById('group-mode-btn');
    if (groupModeBtn) {
        groupModeBtn.addEventListener('click', () => {
            window.location.href = 'group-mode.html';
        });
    }

});

