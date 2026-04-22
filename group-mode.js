/**
 * TSW DPS Calculator - Group Mode
 * Supports 5-player team calculations with independent stats and abilities
 * Each player has their own build configuration and DPS is calculated individually
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ====================
    // CONSTANTS & CONFIG
    // ====================
    
    // Auxiliary weapons that have special handling (from original app)
    const AUX_WEAPONS = ["Rocket Launcher", "Chainsaw", "Quantum", "Flamethrower", "Whip"];
    
    // Available enemies for targeting
    const ENEMIES = {
        'training-puppet': { 
            name: 'Training Puppet', 
            blockRating: 0, 
            evadeRating: 0, 
            defenseRating: 0 
        }
    };
    
    // ====================
    // TSWCALC IMPORT DATA
    // ====================
    
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
    
    // ====================
    // GLOBAL STATE
    // ====================
    
    /**
     * Main application state for group mode
     * Contains all player data and shared settings
     */
    const groupState = {
        players: [],              // Array of 5 player objects
        currentMode: 'group',     // Always 'group' in this mode
        sharedEnemy: 'training-puppet', // Enemy all players target
        simulationTime: 3        // Minutes to simulate
    };
    
    // Flag to prevent import loops
    let isImporting = false;
    
    // Flag to prevent multiple weapon detection during the same import
    let isDetectingWeapons = false;
    
    // ====================
    // PLAYER MANAGEMENT
    // ====================
    
    /**
     * Creates and initializes 5 players with default stats
     * Each player gets a unique ID and default configuration
     */
    function initializePlayers() {
        for (let playerNumber = 1; playerNumber <= 5; playerNumber++) {
            const newPlayer = createDefaultPlayer(playerNumber);
            groupState.players.push(newPlayer);
        }
    }
    
    /**
     * Creates a single player object with default values
     * @param {number} playerId - The player's ID (1-5)
     * @returns {Object} Player configuration object
     */
    function createDefaultPlayer(playerId) {
        return {
            id: playerId,
            name: `Player ${playerId}`,
            stats: {
                attackRating: 0,
                weaponPower: 528,
                combatPower: 1000,
                hitRating: 0,
                critChance: 10,
                critPower: 25,
                penRating: 0,
                penChance: 0
            },
            weapons: {
                primary: 'All',
                secondary: 'None',
                auxiliary: ''
            },
            abilities: {
                actives: [],        // 6 normal active abilities
                elites: [],         // 1 elite active ability
                auxiliaries: [],    // 1 auxiliary active ability
                passives: []        // 8 passive abilities (1 elite + 7 normal)
            },
            augments: {},          // Ability -> augment mapping
            results: {
                totalDps: 0,
                slotBreakdown: []
            }
        };
    }
    
    // ====================
    // UI CREATION & SETUP
    // ====================
    
    /**
     * Creates player panels for players 2-5 by cloning the template panel
     * Updates all IDs and labels to match the new player number
     */
    function createPlayerPanels() {
        // All 5 player cards are now created directly in HTML
        // This function is kept for compatibility but no longer needs to clone cards
    }
    
    /**
     * Recursively updates all element IDs and labels in a player panel
     * @param {HTMLElement} element - The element to update
     * @param {number} playerId - The new player ID (1-5)
     */
    function updateAllPlayerPanelIds(element, playerId) {
        // Update element ID if it exists
        if (element.id) {
            element.id = element.id.replace('player-1', `player-${playerId}`);
        }
        
        // Update label 'for' attribute if it exists
        if (element.htmlFor) {
            element.htmlFor = element.htmlFor.replace('player-1', `player-${playerId}`);
        }
        
        // Update text content (but not for input/textarea elements)
        if (element.textContent && 
            element.tagName !== 'INPUT' && 
            element.tagName !== 'TEXTAREA' &&
            element.tagName !== 'SELECT') {
            element.textContent = element.textContent.replace('Player 1', `Player ${playerId}`);
        }
        
        // Recursively update all child elements
        Array.from(element.children).forEach(child => {
            updateAllPlayerPanelIds(child, playerId);
        });
    }
    
    /**
     * Main UI initialization function
     * Sets up all UI components in the correct order
     */
    function initializeUI() {
        createPlayerPanels();      // Create panels for all 5 players
        populateWeaponSelects();   // Fill weapon dropdowns
        setupEventListeners();      // Set up all event handlers
        initializeAbilitySlots();   // Create ability selection slots
        updateEnemyDisplay();       // Show current enemy stats
    }
    
    // ====================
    // WEAPON SELECTS
    // ====================
    
    /**
     * Populates weapon selection dropdowns for all players
     * Filters weapons appropriately for each slot type
     */
    function populateWeaponSelects() {
        if (typeof tswData === 'undefined') {
            console.error('TSW data not loaded');
            return;
        }
        
        const weapons = new Set(tswData.map(a => a.weapon));
        const sortedWeapons = Array.from(weapons).sort().filter(w => w && w !== "Aux" && w !== "Anima Deviations");
        
        for (let i = 1; i <= 5; i++) {
            const primarySelect = document.getElementById(`player-${i}-weapon-type`);
            const secondarySelect = document.getElementById(`player-${i}-secondary-weapon-type`);
            const auxSelect = document.getElementById(`player-${i}-auxiliary-weapon-type`);
            
            if (primarySelect) {
                primarySelect.innerHTML = '<option value="All">All Weapons</option>';
                sortedWeapons.filter(w => !AUX_WEAPONS.includes(w)).forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = w;
                    opt.textContent = w;
                    primarySelect.appendChild(opt);
                });
            }
            
            if (secondarySelect) {
                secondarySelect.innerHTML = '<option value="None">None</option>';
                sortedWeapons.filter(w => !AUX_WEAPONS.includes(w)).forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = w;
                    opt.textContent = w;
                    secondarySelect.appendChild(opt);
                });
            }
            
            if (auxSelect) {
                auxSelect.innerHTML = '<option value="">None</option>';
                sortedWeapons.filter(w => AUX_WEAPONS.includes(w)).forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = w;
                    opt.textContent = w;
                    auxSelect.appendChild(opt);
                });
            }
        }
    }
    
    // Initialize ability slots for all players
    function initializeAbilitySlots() {
        for (let i = 1; i <= 5; i++) {
            const activeContainer = document.getElementById(`player-${i}-actives-container`);
            const passiveContainer = document.getElementById(`player-${i}-passives-container`);
            
            if (!activeContainer || !passiveContainer) return;
            
            // Clear existing content
            activeContainer.innerHTML = '';
            passiveContainer.innerHTML = '';
            
            // Create active ability slots (7 total: 6 normal + 1 elite)
            for (let j = 1; j <= 7; j++) {
                const slotType = j === 1 ? 'builder' : (j === 7 ? 'elite' : 'active');
                const slotId = `player-${i}-active-${j}`;
                const slot = createAbilitySlot(slotId, slotType, j);
            activeContainer.appendChild(slot);
            }
            
            // Create auxiliary active slot
            const auxSlot = createAbilitySlot(`player-${i}-aux-1`, 'auxiliary', 8);
            activeContainer.appendChild(auxSlot);
            
            // Create passive ability slots (7 total: 1 elite + 6 normal)
            const elitePassiveSlot = createAbilitySlot(`player-${i}-elite-passive-1`, 'elite-passive', 1);
            passiveContainer.appendChild(elitePassiveSlot);
            
            for (let j = 1; j <= 6; j++) {
                const slotId = `player-${i}-passive-${j}`;
                const slot = createAbilitySlot(slotId, 'passive', j + 1);
                passiveContainer.appendChild(slot);
            }
            
            // Create auxiliary passive slot
            const auxPassiveSlot = createAbilitySlot(`player-${i}-aux-passive-1`, 'aux-passive', 9);
            passiveContainer.appendChild(auxPassiveSlot);
        }
    }
    
    // Create a single ability slot with custom dropdown (like single player)
    function createAbilitySlot(slotId, slotType, priority) {
        const wrapper = document.createElement('div');
        wrapper.className = 'slot-wrapper';
        
        const select = document.createElement('select');
        select.id = slotId;
        select.style.display = 'none';
        
        const label = document.createElement('span');
        label.className = 'slot-label';
        label.textContent = getSlotLabel(slotType, priority);
        
        // Add priority input for active abilities
        let priorityInput = null;
        if (slotType === 'builder' || slotType === 'active' || slotType === 'elite' || slotType === 'auxiliary') {
            priorityInput = document.createElement('input');
            priorityInput.type = 'number';
            priorityInput.className = 'slot-order-input';
            priorityInput.value = priority;
            priorityInput.min = '1';
            priorityInput.max = '10';
            priorityInput.title = 'Priority: Lower numbers cast first';
        }
        
        // Add minimum resources input for active abilities
        let minResInput = null;
        if (slotType === 'builder' || slotType === 'active' || slotType === 'elite') {
            minResInput = document.createElement('input');
            minResInput.type = 'number';
            minResInput.className = 'slot-min-resources-input';
            minResInput.value = '0';
            minResInput.min = '0';
            minResInput.max = '5';
            minResInput.title = 'Minimum resources needed before this ability can fire';
        }
        
        // Add search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'ability-search-input';
        searchInput.placeholder = slotType === 'builder' ? 'Search Builders...' : 'Search...';
        
        // Add dropdown display
        const display = document.createElement('div');
        display.className = 'ability-dropdown-display';
        display.textContent = '-- None --';
        
        // Add dropdown list
        const list = document.createElement('div');
        list.className = 'ability-dropdown-list';
        
        // Assemble the slot
        wrapper.appendChild(label);
        wrapper.appendChild(select);
        if (priorityInput) wrapper.appendChild(priorityInput);
        if (minResInput) {
            const minResLabel = document.createElement('span');
            minResLabel.className = 'slot-min-res-label';
            minResLabel.textContent = 'Min Res';
            minResLabel.title = 'Minimum resources required before this ability can fire';
            wrapper.appendChild(minResLabel);
            wrapper.appendChild(minResInput);
        }
        wrapper.appendChild(searchInput);
        wrapper.appendChild(display);
        wrapper.appendChild(list);
        
        // Add event listeners
        display.addEventListener('click', () => {
            list.style.display = list.style.display === 'block' ? 'none' : 'block';
        });
        
        searchInput.addEventListener('input', () => {
            const playerId = slotId.split('-')[1];
            updateAbilityDropdown(playerId, select, slotType, searchInput.value);
        });
        
        select.addEventListener('change', () => {
            // Skip if we're in the middle of importing
            if (isImporting) return;
            
            updateSlotDisplay(select, display);
            // Update augment UI after ability selection
            const playerId = slotId.split('-')[1];
            updateAugmentsForPlayer(playerId);
            // Recalculate all players since ability changes can affect group-wide augments
            calculateAllPlayers();
        });
        
        if (priorityInput) {
            priorityInput.addEventListener('input', () => {
                const playerId = slotId.split('-')[1];
                calculateAllPlayers();
            });
        }
        
        if (minResInput) {
            minResInput.addEventListener('input', () => {
                const playerId = slotId.split('-')[1];
                calculateAllPlayers();
            });
        }
        
        return wrapper;
    }
    
    // Get appropriate label for slot type
    function getSlotLabel(slotType, priority) {
        switch (slotType) {
            case 'builder': return 'Builder';
            case 'active': return `Active ${priority - 1}`;
            case 'elite': return 'Elite';
            case 'auxiliary': return 'Aux';
            case 'elite-passive': return 'Elite Passive';
            case 'passive': return `Passive ${priority - 1}`;
            case 'aux-passive': return 'Aux Passive';
            default: return 'Slot';
        }
    }
    
    // Update ability dropdown for a specific slot with custom rendering
    function updateAbilityDropdown(playerId, select, slotType, searchTerm = '') {
        const player = groupState.players[playerId - 1];
        const prim = player.weapons.primary;
        const sec = player.weapons.secondary;
        const aux = player.weapons.auxiliary;
        
        const isSelectedWeapon = (weapon) => weapon === prim || weapon === sec || prim === "All";
        const getType = (a) => a.type || "";
        
        let filterFn;
        switch (slotType) {
            case 'builder':
                filterFn = a => isSelectedWeapon(a.weapon) &&
                    (getType(a).includes("Active") || getType(a) === "") &&
                    !getType(a).includes("Elite") &&
                    !AUX_WEAPONS.includes(a.weapon) &&
                    isBuilderAbility(a);
                break;
            case 'active':
                filterFn = a => isSelectedWeapon(a.weapon) &&
                    (getType(a).includes("Active") || getType(a) === "") &&
                    !getType(a).includes("Elite") &&
                    !AUX_WEAPONS.includes(a.weapon) &&
                    !isBuilderAbility(a);
                break;
            case 'elite':
                filterFn = a => isSelectedWeapon(a.weapon) &&
                    (getType(a).includes("Elite Active") || (getType(a).includes("Active") && getType(a).includes("Elite"))) &&
                    !AUX_WEAPONS.includes(a.weapon);
                break;
            case 'auxiliary':
                filterFn = a => AUX_WEAPONS.includes(a.weapon) &&
                    (!aux || a.weapon === aux) &&
                    getType(a).includes("Active");
                break;
            case 'elite-passive':
                filterFn = a => getType(a).includes("Elite Passive") || (getType(a).includes("Elite") && getType(a).includes("Passive"));
                break;
            case 'passive':
                filterFn = a => getType(a).includes("Passive") && 
                    !getType(a).includes("Elite") && 
                    !AUX_WEAPONS.includes(a.weapon);
                break;
            case 'aux-passive':
                filterFn = a => AUX_WEAPONS.includes(a.weapon) &&
                    (!aux || a.weapon === aux) &&
                    getType(a).includes("Passive");
                break;
            default:
                filterFn = () => false;
        }
        
        const abilities = tswData.filter(filterFn).sort((a, b) => a.name.localeCompare(b.name));
        
        
        const filteredData = searchTerm
            ? abilities.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : abilities;
        
        // Use custom dropdown rendering like single player
        updateCustomDropdownForSelect(select, filteredData, '-- None --');
    }
    
    // Custom dropdown rendering (icons inside list, text to the right) - exact copy from single player
    function updateCustomDropdownForSelect(select, filteredData, emptyLabel) {
        const wrapper = select.closest('.slot-wrapper');
        if (!wrapper) return;

        const display = wrapper.querySelector('.ability-dropdown-display');
        const list = wrapper.querySelector('.ability-dropdown-list');
        if (!display || !list) return;

        const currentVal = select.value;
        const currentAbility = tswData[currentVal];
        display.textContent = currentAbility ? currentAbility.name : emptyLabel;

        // Populate the hidden select with options (needed for import functionality)
        select.innerHTML = `<option value="">${emptyLabel}</option>`;
        filteredData.forEach(ability => {
            const globalIndex = tswData.indexOf(ability);
            const option = document.createElement('option');
            option.value = String(globalIndex);
            option.textContent = ability.name;
            select.appendChild(option);
        });
        
        // Restore current selection
        if (currentVal) {
            select.value = currentVal;
        }

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

    // Update slot display when selection changes
    function updateSlotDisplay(select, display) {
        const ability = tswData[select.value];
        
        // Clear existing content
        display.innerHTML = '';
        
        if (ability) {
            // Add icon if available
            const iconUrl = getLocalIconUrlForAbility(ability);
            if (iconUrl) {
                const img = document.createElement('img');
                img.src = iconUrl;
                img.alt = '';
                img.draggable = false;
                img.style.width = '20px';
                img.style.height = '20px';
                img.style.marginRight = '0.5rem';
                img.style.objectFit = 'contain';
                display.appendChild(img);
            } else {
                // Add placeholder if no icon
                const placeholder = document.createElement('div');
                placeholder.className = 'ability-dropdown-item-noicon';
                placeholder.style.width = '20px';
                placeholder.style.height = '20px';
                placeholder.style.marginRight = '0.5rem';
                placeholder.style.background = 'rgba(255, 255, 255, 0.1)';
                placeholder.style.borderRadius = '2px';
                placeholder.style.display = 'inline-block';
                display.appendChild(placeholder);
            }
            
            // Add ability name
            const nameSpan = document.createElement('span');
            nameSpan.textContent = ability.name;
            display.appendChild(nameSpan);
        } else {
            // Show '-- None --' when no ability selected
            display.textContent = '-- None --';
        }
    }
    
    // Force update dropdown display for a specific slot
    function forceUpdateDropdownDisplay(playerId, slotId) {
        const select = document.getElementById(slotId);
        if (!select) return;
        
        const wrapper = select.closest('.slot-wrapper');
        const display = wrapper?.querySelector('.ability-dropdown-display');
        if (!display) return;
        
        // Use the same updateSlotDisplay function to ensure consistency
        updateSlotDisplay(select, display);
    }
    
    // Update augments for a player
    function updateAugmentsForPlayer(playerId) {
        const player = groupState.players[playerId - 1];
        const augmentContainer = document.getElementById(`player-${playerId}-augments-container`);
        
        if (!augmentContainer) return;
        
        augmentContainer.innerHTML = '';
        
        // Get all selected abilities for this player
        const activeSelects = document.querySelectorAll(`[id^="player-${playerId}-active-"]`);
        const eliteSelects = document.querySelectorAll(`#player-${playerId}-active-7`); // Elite active is player-X-active-7
        const auxSelects = document.querySelectorAll(`#player-${playerId}-aux-1`); // Aux active is player-X-aux-1
        
        const allSelects = [...activeSelects, ...eliteSelects, ...auxSelects];
        
                
        allSelects.forEach(select => {
            const ability = tswData[select.value];
            if (!ability) {
                return;
            }
            
            const wrapper = document.createElement('div');
            wrapper.className = 'augment-wrapper';
            
            const nameLabel = document.createElement('span');
            nameLabel.className = 'augment-ability-name';
            nameLabel.textContent = ability.name;
            
            const augmentSelect = document.createElement('select');
            augmentSelect.className = 'augment-select';
            augmentSelect.innerHTML = '<option value="">None</option>';
            
            // Add augment options
            Object.entries(AUGMENTS).forEach(([key, augment]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = augment.name;
                augmentSelect.appendChild(option);
            });
            
            augmentSelect.addEventListener('change', () => {
                player.augments[ability.name] = augmentSelect.value;
                // Recalculate all players since group-wide augments affect everyone
                calculateAllPlayers();
            });
            
            wrapper.appendChild(nameLabel);
            wrapper.appendChild(augmentSelect);
            augmentContainer.appendChild(wrapper);
        });
    }
    
    // Helper function to identify builder abilities (copied from original)
    function isBuilderAbility(ability) {
        if (!ability || !ability.description) return false;
        const desc = ability.description.toLowerCase();
        
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
        
        if (desc.includes('builds 1 resource for each equipped weapon')) {
            return true;
        }
        
        if (desc.includes('builds 2 additional') || desc.includes('builds 3 additional')) {
            return true;
        }
        
        return false;
    }
    
    // Icon system (copied from original)
    function getLocalIconUrlForAbility(ability) {
        if (!ability || !ability.weapon || !ability.name) return null;
        const folder = ability.weapon === "Quantum" ? "Quantum Brace" : ability.weapon;
        const fileName = ability.icon || `${ability.name.toLowerCase()}.png`;
        return `ability_icons/${folder}/${fileName}`;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Mode toggle
        document.getElementById('single-mode-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Enemy selection
        document.getElementById('target-enemy').addEventListener('change', (e) => {
            groupState.sharedEnemy = e.target.value;
            updateEnemyDisplay();
            calculateAllPlayers();
        });
        
        // Simulation time
        document.getElementById('simulation-time').addEventListener('input', (e) => {
            groupState.simulationTime = parseInt(e.target.value) || 3;
            calculateAllPlayers();
        });
        
        // Setup player event listeners
        for (let i = 1; i <= 5; i++) {
            setupPlayerEventListeners(i);
        }
        
        // Team import/export
        document.getElementById('import-team-btn').addEventListener('click', importTeam);
        document.getElementById('export-team-btn').addEventListener('click', exportTeam);
        document.getElementById('clear-team-btn').addEventListener('click', clearAllPlayers);
    }
    
    // Setup event listeners for a specific player
    function setupPlayerEventListeners(playerId) {
        const player = groupState.players[playerId - 1];
        
        // Name input
        const nameInput = document.getElementById(`player-${playerId}-name`);
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                player.name = e.target.value || `Player ${playerId}`;
            });
        }
        
        // Stats inputs
        ['attack-rating', 'weapon-power', 'hit-rating', 'crit-chance', 'crit-power', 'pen-rating', 'pen-chance'].forEach(stat => {
            const input = document.getElementById(`player-${playerId}-${stat}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const statKey = stat.replace('-', '').replace('rating', 'Rating').replace('chance', 'Chance').replace('power', 'Power');
                    player.stats[statKey] = value;
                    
                    // Update combat power
                    if (stat === 'attack-rating' || stat === 'weapon-power') {
                        player.stats.combatPower = player.stats.attackRating + player.stats.weaponPower;
                        document.getElementById(`player-${playerId}-combat-power`).value = player.stats.combatPower;
                    }
                    
                    // Recalculate all players since stat changes affect group-wide bonus calculations
                    calculateAllPlayers();
                });
            }
        });
        
        // Weapon selects
        ['weapon-type', 'secondary-weapon-type', 'auxiliary-weapon-type'].forEach(weaponType => {
            const select = document.getElementById(`player-${playerId}-${weaponType}`);
            if (select) {
                select.addEventListener('change', (e) => {
                    // Skip if we're in the middle of importing
                    if (isImporting) return;
                    
                    const weaponKey = e.target.id.split('-')[2]; // weapon-type, secondary-weapon-type, auxiliary-weapon-type
                    if (weaponKey === 'primary') {
                        player.weapons.primary = e.target.value;
                    } else if (weaponKey === 'secondary') {
                        player.weapons.secondary = e.target.value;
                    } else if (weaponKey === 'auxiliary') {
                        player.weapons.auxiliary = e.target.value;
                    }
                    
                    // Update ability dropdowns for this player
                    updateAllAbilityDropdownsForPlayer(playerId);
                    // Recalculate all players since weapon changes affect group-wide bonus calculations
                    calculateAllPlayers();
                });
            }
        });
        
        // Individual player import/export functionality
        setupPlayerImportExport(playerId);
    }
    
    // ====================
    // TSWCALC IMPORT FOR INDIVIDUAL PLAYERS
    // ====================
    
    /**
     * Parses a tswcalc URL and imports gear stats for a specific player
     * @param {number} playerId - The player ID (1-5)
     */
    function parseTswcalcUrlForPlayer(playerId) {
        const urlInput = document.getElementById(`player-${playerId}-tswcalc-url`);
        const statusElement = document.getElementById(`player-${playerId}-import-status`);
        
        if (!urlInput || !statusElement) {
            return;
        }
        
        const url = (urlInput.value || '').trim();
        if (!url) {
            showImportStatus(playerId, 'Please enter a tswcalc URL first.', 'error');
            return;
        }

        if (!url.includes('#')) {
            showImportStatus(playerId, 'Invalid tswcalc URL format. Please ensure it contains a "#" fragment.', 'error');
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
                showImportStatus(playerId, 'This does not look like a valid tswcalc build URL.', 'error');
                return;
            }

            let attackRating = 0;
            let weaponPower = 75;
            let critRating = 0;
            let critPowerRating = 0;
            let penRating = 0;
            let hitRating = 0;

            // Accumulated percentage-based signet bonuses
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

            // Track base vs weapon-specific glyph ratings
            let baseCritRating = 0;
            let baseCritPowerRating = 0;
            let basePenRating = 0;
            let baseHitRating = 0;
            let weapon1Glyph = { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };
            let weapon2Glyph = { critRating: 0, critPowerRating: 0, penRating: 0, hitRating: 0 };
            
            // Store talisman data for special effects
            const importedGear = {};

            slots.forEach(slot => {
                const data = params.get(slot.id);
                if (!data) return;

                const vals = data.split(',');
                if (vals.length < 7) return;
                
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
                        if (wName) {
                            const weaponSelect = document.getElementById(`player-${playerId}-weapon-type`);
                            if (weaponSelect) {
                                weaponSelect.value = wName;
                                weaponSelect.dispatchEvent(new Event('change'));
                            }
                        }
                    } else if (slot.id === 'weapon2') {
                        const wName2 = TSWCALC_DATA.wtype_mapping[itemId];
                        if (wName2) {
                            const secondaryWeaponSelect = document.getElementById(`player-${playerId}-secondary-weapon-type`);
                            if (secondaryWeaponSelect) {
                                secondaryWeaponSelect.value = wName2;
                                secondaryWeaponSelect.dispatchEvent(new Event('change'));
                            }
                        }
                    }
                } else if (slot.type === 'talisman') {
                    // Store talisman data for special effects
                    importedGear[slot.id] = {
                        talismanId: itemId,
                        quality: qlIdx,
                        signetId: signetId,
                        signetQuality: signetQual
                    };
                    
                    // Role check: itemId 1=Tank, 2=Healer, 3=DPS, default to DPS if unknown/special
                    const isDpsRole = itemId === 3 || itemId === 82 || itemId === 84 || itemId === 86 || itemId >= 200 || 
                                     (itemId !== 1 && itemId !== 2 && itemId !== 81 && itemId !== 83 && itemId !== 85 && itemId !== 202 && itemId !== 203 && itemId !== 205 && itemId !== 207);
                    
                    if (isDpsRole) {
                        attackRating += TSWCALC_DATA.talismanRating[slot.group][qlIdx] || 0;
                    }
                }

                // Glyphs
                [{ id: primStatId, dist: primDist }, { id: secStatId, dist: secDist }].forEach(g => {
                    const statName = TSWCALC_DATA.stat_mapping[g.id];
                    if (statName && g.dist > 0 && TSWCALC_DATA.glyphData[statName]) {
                        const isWeaponSlot = slot.type === 'weapon';
                        const glyphGroup = isWeaponSlot ? 'weapon' : slot.group;
                        const qlStr = TSWCALC_DATA.glyphQlMap[glyphQlIdx] || '10.0';
                        const qlTable = TSWCALC_DATA.glyphData[statName][qlStr];
                        const val = (qlTable && qlTable[glyphGroup]) ? (qlTable[glyphGroup][g.dist] || 0) : 0;

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
                            signetBonuses.globalDmgPct += bonus;
                            break;
                        case 'subtype-dmg-pct':
                            if (signet.subtype) {
                                signetBonuses.subtype[signet.subtype] = (signetBonuses.subtype[signet.subtype] || 0) + bonus;
                            }
                            break;
                        case 'weapon-dmg-pct':
                            if (signet.weapon) {
                                signetBonuses.weapon[signet.weapon] = (signetBonuses.weapon[signet.weapon] || 0) + bonus;
                            }
                            break;
                        case 'equilibrium':
                            signetBonuses.equilibrium = true;
                            break;
                        case 'affliction-dmg-pct':
                            signetBonuses.afflictionDmgPct += bonus;
                            break;
                    }
                }
            });

            // Aggregate totals for display
            critRating = baseCritRating + weapon1Glyph.critRating;
            critPowerRating = baseCritPowerRating + weapon1Glyph.critPowerRating;
            penRating = basePenRating + weapon1Glyph.penRating;
            hitRating = baseHitRating + weapon1Glyph.hitRating;

            // Final calculations
            const cpFormula = (ar, wp) => {
                if (ar < 5200) {
                    return Math.round((375 - (600 / (Math.pow(Math.E, (ar / 1400)) + 1))) * (1 + (wp / 375)));
                } else {
                    const c = (0.00008 * wp) + 0.0301;
                    return Math.round(204.38 + (0.5471 * wp) + (c * ar));
                }
            };

            const safeAttackRating = Math.max(0, attackRating || 0);
            const safeWeaponPower = Math.max(0, weaponPower || 75);
            const safeCritRating = Math.max(0, critRating || 0);
            const safeCritPowerRating = Math.max(0, critPowerRating || 0);
            
            const cp = cpFormula(safeAttackRating, safeWeaponPower);
            const critChance = Math.max(0, Math.min(100, 55.14 - (100.3 / (Math.pow(Math.E, (safeCritRating / 790.3)) + 1))));
            const critPower = Math.sqrt(5 * safeCritPowerRating + 625) + (signetBonuses?.critPowerPct || 0);

            // Update player's stat inputs
            const player = groupState.players[playerId - 1];
            if (player) {
                // Update player state
                player.stats.attackRating = Math.round(attackRating);
                player.stats.weaponPower = Math.round(weaponPower);
                player.stats.combatPower = cp;
                player.stats.hitRating = Math.round(hitRating);
                player.stats.critChance = critChance;
                player.stats.critPower = critPower;
                player.stats.penRating = Math.round(penRating);
                
                // Update UI inputs
                const attackRatingInput = document.getElementById(`player-${playerId}-attack-rating`);
                const weaponPowerInput = document.getElementById(`player-${playerId}-weapon-power`);
                const combatPowerInput = document.getElementById(`player-${playerId}-combat-power`);
                const hitRatingInput = document.getElementById(`player-${playerId}-hit-rating`);
                const critChanceInput = document.getElementById(`player-${playerId}-crit-chance`);
                const critPowerInput = document.getElementById(`player-${playerId}-crit-power`);
                const penRatingInput = document.getElementById(`player-${playerId}-pen-rating`);
                
                if (attackRatingInput) attackRatingInput.value = Math.round(attackRating);
                if (weaponPowerInput) weaponPowerInput.value = Math.round(weaponPower);
                if (combatPowerInput) combatPowerInput.value = cp;
                if (hitRatingInput) hitRatingInput.value = Math.round(hitRating);
                if (critChanceInput) critChanceInput.value = critChance.toFixed(1);
                if (critPowerInput) critPowerInput.value = critPower.toFixed(1);
                if (penRatingInput) penRatingInput.value = Math.round(penRating);
                
                // Store signet bonuses for this player
                player.signetBonuses = signetBonuses;
                player.importedGear = importedGear;
            }

            // Update ability dropdowns for this player
            updateAllAbilityDropdownsForPlayer(playerId);
            
            // Recalculate player DPS
            calculatePlayerDps(playerId);
            
            showImportStatus(playerId, 'Gear stats imported successfully!', 'success');

        } catch (err) {
            showImportStatus(playerId, 'An error occurred while parsing the tswcalc URL.', 'error');
        }
    }

    // ====================
    // INDIVIDUAL PLAYER IMPORT/EXPORT
    // ====================
    
    /**
     * Sets up import/export functionality for a specific player
     * @param {number} playerId - The player ID (1-5)
     */
    function setupPlayerImportExport(playerId) {
        // tswcalc import button
        const tswcalcImportBtn = document.getElementById(`player-${playerId}-tswcalc-import-btn`);
        if (tswcalcImportBtn) {
            tswcalcImportBtn.addEventListener('click', () => parseTswcalcUrlForPlayer(playerId));
        }
        
        // Build import button
        const importBtn = document.getElementById(`player-${playerId}-import-btn`);
        if (importBtn) {
            importBtn.addEventListener('click', () => importPlayerBuild(playerId));
        }
        
        // Export button
        const exportBtn = document.getElementById(`player-${playerId}-export-btn`);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => exportPlayerBuild(playerId));
        }
        
        // Clear button
        const clearBtn = document.getElementById(`player-${playerId}-clear-btn`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => clearPlayerBuild(playerId));
        }
    }
    
    /**
     * Imports build data for a specific player
     * @param {number} playerId - The player ID (1-5)
     */
    function importPlayerBuild(playerId) {
        // Prevent recursive imports
        if (isImporting) {
            return;
        }
        
        isImporting = true;
        
        const textarea = document.getElementById(`player-${playerId}-import-textarea`);
        const statusElement = document.getElementById(`player-${playerId}-import-status`);
        
        if (!textarea || !statusElement) return;
        
        try {
            const buildData = textarea.value.trim();
            if (!buildData) {
                showImportStatus(playerId, 'No build data provided', 'warning');
                return;
            }
            
            // Parse the build data
            const parsedBuild = parsePlayerBuildData(buildData);
            
            // Apply the parsed data to the player
            applyPlayerBuildData(playerId, parsedBuild);
            
            showImportStatus(playerId, 'Build imported successfully!', 'success');
            
            // Recalculate player DPS
            calculatePlayerDps(playerId);
            
            
        } catch (error) {
            showImportStatus(playerId, `Error importing build: ${error.message}`, 'error');
        } finally {
            // Reset import flag
            isImporting = false;
        }
    }
    
    /**
     * Exports build data for a specific player
     * @param {number} playerId - The player ID (1-5)
     */
    function exportPlayerBuild(playerId) {
        const player = groupState.players[playerId - 1];
        const textarea = document.getElementById(`player-${playerId}-import-textarea`);
        
        if (!player || !textarea) return;
        
        try {
            const exportData = generatePlayerExportData(playerId);
            textarea.value = exportData;
            
            // Copy to clipboard
            navigator.clipboard.writeText(exportData).then(() => {
                showImportStatus(playerId, 'Build exported and copied to clipboard!', 'success');
            }).catch(() => {
                showImportStatus(playerId, 'Build exported! (Clipboard copy failed)', 'warning');
            });
            
        } catch (error) {
            showImportStatus(playerId, `Error exporting build: ${error.message}`, 'error');
        }
    }
    
    /**
     * Clears all build data for a specific player
     * @param {number} playerId - The player ID (1-5)
     */
    function clearPlayerBuild(playerId) {
        if (!confirm(`Clear all build data for Player ${playerId}?`)) return;
        
        // Clear all ability selections
        const abilitySelects = document.querySelectorAll(`[id^="player-${playerId}-"] select`);
        abilitySelects.forEach(select => {
            if (select.id.includes('active') || select.id.includes('passive')) {
                select.value = '';
                select.dispatchEvent(new Event('change'));
            }
        });
        
        // Clear stats
        const player = groupState.players[playerId - 1];
        if (player) {
            player.stats = {
                attackRating: 0,
                weaponPower: 528,
                combatPower: 528,
                hitRating: 0,
                critChance: 10,
                critPower: 25,
                penRating: 0,
                penChance: 0
            };
            
            // Update UI
            document.getElementById(`player-${playerId}-attack-rating`).value = 0;
            document.getElementById(`player-${playerId}-weapon-power`).value = 528;
            document.getElementById(`player-${playerId}-combat-power`).value = 528;
            document.getElementById(`player-${playerId}-hit-rating`).value = 0;
            document.getElementById(`player-${playerId}-crit-chance`).value = 10;
            document.getElementById(`player-${playerId}-crit-power`).value = 25;
            document.getElementById(`player-${playerId}-pen-rating`).value = 0;
            document.getElementById(`player-${playerId}-pen-chance`).value = 0;
        }
        
        // Clear textarea
        const textarea = document.getElementById(`player-${playerId}-import-textarea`);
        if (textarea) textarea.value = '';
        
        showImportStatus(playerId, 'Build data cleared', 'success');
        calculatePlayerDps(playerId);
    }
    
    /**
     * Parses player build data from text format
     * @param {string} buildData - The raw build data text
     * @returns {Object} Parsed build data object
     */
    function parsePlayerBuildData(buildData) {
        const sections = buildData.split('===').filter(section => section.trim());
        const parsed = {
            actives: [],
            passives: [],
            augments: {},
            gear: {}
        };
        
        let currentSection = '';
        let contentLines = [];
        
        sections.forEach((section, index) => {
            const trimmedSection = section.trim();
            
            // Check if this is a header section
            if (trimmedSection.includes('ACTIVE ABILITIES') || 
                trimmedSection.includes('PASSIVE ABILITIES') || 
                trimmedSection.includes('AUGMENTS') ||
                trimmedSection.includes('GEAR') ||
                trimmedSection.includes('STATS')) {
                
                // If we have a previous section to process, do it now
                if (currentSection && contentLines.length > 0) {
                    const fullSection = currentSection + '\n' + contentLines.join('\n');
                    
                    if (currentSection.includes('ACTIVE ABILITIES')) {
                        parsed.actives = parseAbilitySection(fullSection);
                    } else if (currentSection.includes('PASSIVE ABILITIES')) {
                        parsed.passives = parsePassiveSection(fullSection);
                    } else if (currentSection.includes('AUGMENTS')) {
                        parsed.augments = parseAugmentSection(fullSection);
                    } else if (currentSection.includes('GEAR') || currentSection.includes('STATS')) {
                        parsed.gear = parseGearSection(fullSection);
                    }
                }
                
                // Start new section
                currentSection = trimmedSection;
                contentLines = [];
            } else {
                // This is content for the current section
                contentLines.push(trimmedSection);
            }
        });
        
        // Process the last section
        if (currentSection && contentLines.length > 0) {
            const fullSection = currentSection + '\n' + contentLines.join('\n');
            
            if (currentSection.includes('ACTIVE ABILITIES')) {
                parsed.actives = parseAbilitySection(fullSection);
            } else if (currentSection.includes('PASSIVE ABILITIES')) {
                parsed.passives = parsePassiveSection(fullSection);
            } else if (currentSection.includes('AUGMENTS')) {
                parsed.augments = parseAugmentSection(fullSection);
            } else if (currentSection.includes('GEAR') || currentSection.includes('STATS')) {
                parsed.gear = parseGearSection(fullSection);
            }
        }
        
        return parsed;
    }
    
    /**
     * Parses active abilities section
     * @param {string} section - The active abilities section text
     * @returns {Array} Array of active ability objects
     */
    function parseAbilitySection(section) {
        const lines = section.split('\n').slice(1); // Skip header
        const abilities = [];
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const parts = trimmedLine.split('|');
                if (parts.length >= 3) {
                    abilities.push({
                        name: parts[0].trim(),
                        priority: parseInt(parts[1]) || 1,
                        minResources: parseInt(parts[2]) || 0
                    });
                }
            }
        });
        
        return abilities;
    }
    
    /**
     * Parses passive abilities section
     * @param {string} section - The passive abilities section text
     * @returns {Array} Array of passive ability names
     */
    function parsePassiveSection(section) {
        const lines = section.split('\n').slice(1); // Skip header
        const passives = [];
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                passives.push(trimmedLine);
            }
        });
        
        return passives;
    }
    
    /**
     * Parses augments section
     * @param {string} section - The augments section text
     * @returns {Object} Augment mapping (ability -> augment)
     */
    function parseAugmentSection(section) {
        const lines = section.split('\n').slice(1); // Skip header
        const augments = {};
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const parts = trimmedLine.split('|');
                if (parts.length === 2) {
                    augments[parts[0].trim()] = parts[1].trim();
                }
            }
        });
        
        return augments;
    }
    
    /**
     * Parses gear/stats section
     * @param {string} section - The gear section text
     * @returns {Object} Gear stats object
     */
    function parseGearSection(section) {
        const lines = section.split('\n').slice(1); // Skip header
        const gear = {};
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                // Parse different stat formats
                if (trimmedLine.includes('Attack Rating:')) {
                    gear.attackRating = parseInt(trimmedLine.split(':')[1].trim()) || 0;
                } else if (trimmedLine.includes('Weapon Power:')) {
                    gear.weaponPower = parseInt(trimmedLine.split(':')[1].trim()) || 528;
                } else if (trimmedLine.includes('Hit Rating:')) {
                    gear.hitRating = parseInt(trimmedLine.split(':')[1].trim()) || 0;
                } else if (trimmedLine.includes('Crit Chance:')) {
                    gear.critChance = parseFloat(trimmedLine.split(':')[1].replace('%', '').trim()) || 10;
                } else if (trimmedLine.includes('Crit Power:')) {
                    gear.critPower = parseFloat(trimmedLine.split(':')[1].replace('%', '').trim()) || 25;
                } else if (trimmedLine.includes('Penetration Rating:')) {
                    gear.penRating = parseInt(trimmedLine.split(':')[1].trim()) || 0;
                } else if (trimmedLine.includes('Penetration Chance:')) {
                    gear.penChance = parseFloat(trimmedLine.split(':')[1].replace('%', '').trim()) || 0;
                }
                // Also handle weapon selections
                else if (trimmedLine.includes('Primary Weapon:')) {
                    gear.primaryWeapon = trimmedLine.split(':')[1].trim();
                } else if (trimmedLine.includes('Secondary Weapon:')) {
                    gear.secondaryWeapon = trimmedLine.split(':')[1].trim();
                } else if (trimmedLine.includes('Auxiliary Weapon:')) {
                    gear.auxiliaryWeapon = trimmedLine.split(':')[1].trim();
                }
            }
        });
        
        return gear;
    }
    
    /**
     * Detects weapons from imported abilities and sets them for the player
     * @param {number} playerId - The player ID (1-5)
     * @param {Object} buildData - The parsed build data
     */
    function detectAndSetWeaponsFromImport(playerId, buildData) {
        // Prevent recursive calls during import
        if (!isImporting) {
            return;
        }
        
        // Prevent multiple weapon detection during the same import
        if (isDetectingWeapons) {
            return;
        }
        
        isDetectingWeapons = true;
        
        const player = groupState.players[playerId - 1];
        if (!player) return;
        
        const weaponCounts = {};
        
        // Count weapons from active abilities
        if (buildData.actives && buildData.actives.length > 0) {
            buildData.actives.forEach(abilityData => {
                const abilityName = typeof abilityData === 'string' ? abilityData : abilityData.name;
                const ability = findAbilityInTswData(abilityName);
                if (ability && ability.weapon) {
                    weaponCounts[ability.weapon] = (weaponCounts[ability.weapon] || 0) + 1;
                }
            });
        }
        
        // Count weapons from passive abilities
        if (buildData.passives && buildData.passives.length > 0) {
            buildData.passives.forEach(passiveName => {
                const ability = findAbilityInTswData(passiveName);
                if (ability && ability.weapon) {
                    weaponCounts[ability.weapon] = (weaponCounts[ability.weapon] || 0) + 1;
                }
            });
        }
        
        // Sort weapons by count (most used first)
        const sortedWeapons = Object.entries(weaponCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([weapon]) => weapon);
        
        
                
        // Set primary and secondary weapons
        if (sortedWeapons.length >= 1) {
            player.weapons.primary = sortedWeapons[0];
            
            // Update UI for primary weapon (no change event during import)
            const primarySelect = document.getElementById(`player-${playerId}-weapon-type`);
            if (primarySelect) {
                primarySelect.value = sortedWeapons[0];
            }
        }
        
        if (sortedWeapons.length >= 2) {
            player.weapons.secondary = sortedWeapons[1];
            
            // Update UI for secondary weapon (no change event during import)
            const secondarySelect = document.getElementById(`player-${playerId}-secondary-weapon-type`);
            if (secondarySelect) {
                secondarySelect.value = sortedWeapons[1];
            }
        }
        
        // Update dropdowns with new weapon selections before applying build data
        // Temporarily save the import flag to prevent recursive calls
        const wasImporting = isImporting;
        isImporting = true;
        updateAllAbilityDropdownsForPlayer(playerId);
        isImporting = wasImporting;
        
        // Apply the parsed build data to the player's UI
        applyPlayerBuildData(playerId, buildData);
        
        // Reset weapon detection flag
        isDetectingWeapons = false;
    }
    
    /**
     * Finds ability in tswData by name
     * @param {string} abilityName - The ability name to find
     * @returns {Object|null} The ability object or null
     */
    function findAbilityInTswData(abilityName) {
        for (let i = 0; i < tswData.length; i++) {
            if (tswData[i].name === abilityName) {
                return tswData[i];
            }
        }
        return null;
    }
    
    /**
     * Applies parsed build data to a player using exact single player logic
     * @param {number} playerId - The player ID (1-5)
     * @param {Object} buildData - The parsed build data
     */
    function applyPlayerBuildData(playerId, buildData) {
        let importedActives = 0;
        let importedPassives = 0;
        let importedAugments = 0;
        const errors = [];
        
        // Detect and set weapons from imported abilities before importing
        detectAndSetWeaponsFromImport(playerId, buildData);
        
        // Import active abilities using single player logic
        if (buildData.actives && buildData.actives.length > 0) {
            const allActiveSelectors = document.querySelectorAll(`#player-${playerId}-actives-container .slot-wrapper`);
            // Filter out elite active and auxiliary to get only normal actives
            const activeSelectors = Array.from(allActiveSelectors).filter(wrapper => {
                const select = wrapper.querySelector('select');
                return select && select.id.includes('active-') && !select.id.includes('active-7') && !select.id.includes('aux-');
            });
            const eliteActiveSelect = document.getElementById(`player-${playerId}-active-7`);
            const auxActiveSelect = document.getElementById(`player-${playerId}-aux-1`);
            
            
            buildData.actives.forEach((abilityData, index) => {
                const abilityName = typeof abilityData === 'string' ? abilityData : abilityData.name;
                const priority = abilityData.priority || '';
                const minResources = abilityData.minResources || '';
                
                let selector = null;
                let select = null;
                let priorityInput = null;
                let minResInput = null;
                let isElite = false;

            
            // Check if this is an elite ability (priority 7)
            if (priority === '7' || priority === 7) {
                // Use the dedicated elite active select
                if (eliteActiveSelect) {
                    select = eliteActiveSelect;
                    const eliteWrapper = select.closest('.slot-wrapper');
                    if (eliteWrapper) {
                        selector = eliteWrapper;
                        priorityInput = selector.querySelector('.slot-order-input');
                        minResInput = selector.querySelector('.slot-min-resources-input');
                    }
                    isElite = true;
                }
            } else if (abilityName.toLowerCase().includes('aux') && auxActiveSelect) {
                // Use auxiliary active slot
                select = auxActiveSelect;
                const auxWrapper = select.closest('.slot-wrapper');
                if (auxWrapper) {
                    selector = auxWrapper;
                    priorityInput = selector.querySelector('.slot-order-input');
                    minResInput = selector.querySelector('.slot-min-resources-input');
                }
            } else {
                // Use regular active slots
                if (index < activeSelectors.length) {
                    selector = activeSelectors[index];
                    select = selector.querySelector('select');
                    priorityInput = selector.querySelector('.slot-order-input');
                    minResInput = selector.querySelector('.slot-min-resources-input');
                }
            }

                if (select) {
                    const option = findAbilityByName(select, abilityName);
                    if (option) {
                        select.value = option.value;
                        // Only dispatch change event if not importing
                        if (!isImporting) {
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        importedActives++;
                        
                        // Force update the custom dropdown display
                        forceUpdateDropdownDisplay(playerId, select.id);
                        
                        if (priorityInput && priority) {
                            priorityInput.value = priority;
                            priorityInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        if (minResInput && minResources) {
                            minResInput.value = minResources;
                            minResInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } else {
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

        // Import passive abilities using single player logic
        if (buildData.passives && buildData.passives.length > 0) {
            const eliteSelect = document.getElementById(`player-${playerId}-elite-passive-1`);
            const allPassiveSelectors = document.querySelectorAll(`#player-${playerId}-passives-container .slot-wrapper`);
            // Filter out elite passive and aux passive to get only normal passives
            const normalSelectors = Array.from(allPassiveSelectors).filter(wrapper => {
                const select = wrapper.querySelector('select');
                return select && select.id.includes('passive-') && !select.id.includes('elite-passive') && !select.id.includes('aux-passive');
            });
            const auxPassiveSelect = document.getElementById(`player-${playerId}-aux-passive-1`);
            
            let elitePassiveFound = false;
            
            // Try to find if any passive is an elite passive
            for (let i = 0; i < buildData.passives.length; i++) {
                const passiveName = buildData.passives[i];
                if (eliteSelect) {
                    const option = findAbilityByName(eliteSelect, passiveName);
                    if (option) {
                            // This is an elite passive
                            eliteSelect.value = option.value;
                            // Only dispatch change event if not importing
                            if (!isImporting) {
                                eliteSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            importedPassives++;
                            elitePassiveFound = true;
                            
                            // Force update the custom dropdown display
                            forceUpdateDropdownDisplay(playerId, eliteSelect.id);
                        
                        // Import remaining passives as normal passives (skip the elite one)
                        const remainingPassives = buildData.passives.slice(i + 1);
                        remainingPassives.forEach((passiveName, normalIndex) => {
                            if (normalIndex < normalSelectors.length) {
                                const selector = normalSelectors[normalIndex];
                                const select = selector.querySelector('select');
                                
                                if (select) {
                                    const option = findAbilityByName(select, passiveName);
                                    if (option) {
                                        select.value = option.value;
                                        // Only dispatch change event if not importing
                                        if (!isImporting) {
                                            select.dispatchEvent(new Event('change', { bubbles: true }));
                                        }
                                        importedPassives++;
                                        
                                        // Force update the custom dropdown display
                                        forceUpdateDropdownDisplay(playerId, select.id);
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
                buildData.passives.forEach((passiveName, index) => {
                    // Check if this might be an auxiliary passive
                    if (passiveName.toLowerCase().includes('aux') && auxPassiveSelect) {
                        const option = findAbilityByName(auxPassiveSelect, passiveName);
                        if (option) {
                            auxPassiveSelect.value = option.value;
                            // Only dispatch change event if not importing
                            if (!isImporting) {
                                auxPassiveSelect.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            importedPassives++;
                            
                            // Force update the custom dropdown display
                            forceUpdateDropdownDisplay(playerId, auxPassiveSelect.id);
                            return;
                        }
                    }
                    
                    if (index < normalSelectors.length) {
                        const selector = normalSelectors[index];
                        const select = selector.querySelector('select');
                        
                        if (select) {
                            const option = findAbilityByName(select, passiveName);
                            if (option) {
                                select.value = option.value;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                importedPassives++;
                                
                                // Force update the custom dropdown display
                                forceUpdateDropdownDisplay(playerId, select.id);
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

        // Import augments using single player logic (with delay)
        if (buildData.augments && Object.keys(buildData.augments).length > 0) {
            // Wait longer for abilities to be fully imported and DOM updated before creating augment UI
            setTimeout(() => {
                // Now ensure the augment UI is created by calling updateAugmentsForPlayer
                updateAugmentsForPlayer(playerId);
                
                // Wait a bit more for the augment UI to be created and rendered
                setTimeout(() => {
                    let augmentImportErrors = [];
                
                Object.entries(buildData.augments).forEach(([abilityName, augmentName]) => {
                    // Find the augment wrapper by ability name with improved matching
                    const augmentWrappers = Array.from(document.querySelectorAll(`#player-${playerId}-augments-container .augment-wrapper`));
                    const augmentWrapper = augmentWrappers.find(wrapper => {
                        const label = wrapper.querySelector('.augment-ability-name');
                        if (!label) return false;
                        
                        const labelName = label.textContent.trim();
                        const searchName = abilityName.trim();
                        
                        // Try exact match first
                        if (labelName === searchName) {
                            return true;
                        }
                        
                        // Try case-insensitive exact match
                        if (labelName.toLowerCase() === searchName.toLowerCase()) {
                            return true;
                        }
                        
                        // Try partial match (ability name contains search or vice versa)
                        if (labelName.toLowerCase().includes(searchName.toLowerCase()) || 
                            searchName.toLowerCase().includes(labelName.toLowerCase())) {
                            return true;
                        }
                        
                        return false;
                    });

                    if (!augmentWrapper) {
                        // Debug: Show available abilities vs what we're looking for
                        const availableAbilities = augmentWrappers.map(wrapper => {
                            const label = wrapper.querySelector('.augment-ability-name');
                            return label ? label.textContent.trim() : 'No label';
                        }).join(', ');
                        
                        augmentImportErrors.push(`Ability not found for augment: ${abilityName}. Available: [${availableAbilities}]`);
                        return;
                    }

                    const augmentSelect = augmentWrapper.querySelector('.augment-select');
                    if (augmentSelect) {
                        // Find the augment option that matches the augment name
                        const augmentOption = findAugmentOptionByName(augmentSelect, augmentName);
                        
                        if (augmentOption) {
                            augmentSelect.value = augmentOption.value;
                            // Store the augment in player state
                            const player = groupState.players[playerId - 1];
                            if (player) {
                                player.augments[abilityName] = augmentOption.value;
                            }
                            importedAugments++;
                        } else {
                            augmentImportErrors.push(`Augment not found: ${augmentName}`);
                        }
                    }
                });

                // Update the status message with augment import results
                const allErrors = [...errors, ...augmentImportErrors];
                if (allErrors.length > 0) {
                    showImportStatus(playerId, `Imported ${importedActives} actives, ${importedPassives} passives, ${importedAugments} augments. Errors: ${allErrors.join('; ')}`, 'warning');
                } else {
                    showImportStatus(playerId, `Successfully imported ${importedActives} active abilities, ${importedPassives} passive abilities, and ${importedAugments} augments!`, 'success');
                }
                // Trigger calculation after augment import
                setTimeout(() => calculatePlayerDps(playerId), 100);
                }, 200); // Reduced delay since we explicitly create the UI
            }, 300); // Wait for abilities to be imported first
        }

        // Show results for abilities only (augments will show their own results)
        if (!buildData.augments || Object.keys(buildData.augments).length === 0) {
            if (errors.length > 0) {
                showImportStatus(playerId, `Imported ${importedActives} actives, ${importedPassives} passives, ${importedAugments} augments. Errors: ${errors.join('; ')}`, 'warning');
            } else {
                showImportStatus(playerId, `Successfully imported ${importedActives} active abilities, ${importedPassives} passive abilities, and ${importedAugments} augments!`, 'success');
            }
            // Trigger calculation after import
            setTimeout(() => calculatePlayerDps(playerId), 100);
        }
        
        // Apply gear/stats
        if (buildData.gear) {
            applyGearData(playerId, buildData.gear);
        }
    }
    
    /**
     * Applies gear data to a player
     * @param {number} playerId - The player ID (1-5)
     * @param {Object} gearData - The gear data object
     */
    function applyGearData(playerId, gearData) {
        const player = groupState.players[playerId - 1];
        
        // Apply stats
        if (gearData.attackRating !== undefined) {
            player.stats.attackRating = gearData.attackRating;
            document.getElementById(`player-${playerId}-attack-rating`).value = gearData.attackRating;
        }
        if (gearData.weaponPower !== undefined) {
            player.stats.weaponPower = gearData.weaponPower;
            document.getElementById(`player-${playerId}-weapon-power`).value = gearData.weaponPower;
        }
        if (gearData.hitRating !== undefined) {
            player.stats.hitRating = gearData.hitRating;
            document.getElementById(`player-${playerId}-hit-rating`).value = gearData.hitRating;
        }
        if (gearData.critChance !== undefined) {
            player.stats.critChance = gearData.critChance;
            document.getElementById(`player-${playerId}-crit-chance`).value = gearData.critChance;
        }
        if (gearData.critPower !== undefined) {
            player.stats.critPower = gearData.critPower;
            document.getElementById(`player-${playerId}-crit-power`).value = gearData.critPower;
        }
        if (gearData.penRating !== undefined) {
            player.stats.penRating = gearData.penRating;
            document.getElementById(`player-${playerId}-pen-rating`).value = gearData.penRating;
        }
        if (gearData.penChance !== undefined) {
            player.stats.penChance = gearData.penChance;
            document.getElementById(`player-${playerId}-pen-chance`).value = gearData.penChance;
        }
        
        // Update combat power
        player.stats.combatPower = player.stats.attackRating + player.stats.weaponPower;
        document.getElementById(`player-${playerId}-combat-power`).value = player.stats.combatPower;
        
        // Apply weapons
        if (gearData.primaryWeapon) {
            player.weapons.primary = gearData.primaryWeapon;
            const primarySelect = document.getElementById(`player-${playerId}-weapon-type`);
            if (primarySelect) {
                primarySelect.value = gearData.primaryWeapon;
                primarySelect.dispatchEvent(new Event('change'));
            }
        }
        if (gearData.secondaryWeapon) {
            player.weapons.secondary = gearData.secondaryWeapon;
            const secondarySelect = document.getElementById(`player-${playerId}-secondary-weapon-type`);
            if (secondarySelect) {
                secondarySelect.value = gearData.secondaryWeapon;
                secondarySelect.dispatchEvent(new Event('change'));
            }
        }
        if (gearData.auxiliaryWeapon) {
            player.weapons.auxiliary = gearData.auxiliaryWeapon;
            const auxSelect = document.getElementById(`player-${playerId}-auxiliary-weapon-type`);
            if (auxSelect) {
                auxSelect.value = gearData.auxiliaryWeapon;
                auxSelect.dispatchEvent(new Event('change'));
            }
        }
    }
    
    /**
     * Finds ability by name in a select element (exact match from single player)
     * @param {HTMLSelectElement} select - The select element to search in
     * @param {string} abilityName - The ability name to find
     * @returns {HTMLOptionElement|null} The found option or null
     */
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
    
    /**
     * Finds ability index by name in tswData (for compatibility)
     * @param {string} abilityName - The ability name to find
     * @returns {number} The ability index or -1 if not found
     */
    function findAbilityIndexByName(abilityName) {
        for (let i = 0; i < tswData.length; i++) {
            if (tswData[i].name === abilityName) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Finds augment key by display name
     * @param {string} augmentName - The augment display name
     * @returns {string|null} The augment key or null if not found
     */
    function findAugmentKeyByName(augmentName) {
        for (const [key, augment] of Object.entries(AUGMENTS)) {
            if (augment.name === augmentName) {
                return key;
            }
        }
        return null;
    }
    
    /**
     * Finds augment option by name in a select element
     * @param {HTMLSelectElement} select - The augment select element to search in
     * @param {string} augmentName - The augment name to find
     * @returns {HTMLOptionElement|null} The found option or null
     */
    function findAugmentOptionByName(select, augmentName) {
        // First try exact match on option text
        const exactOption = Array.from(select.options).find(opt => 
            opt.textContent.trim() === augmentName.trim()
        );
        
        if (exactOption) {
            return exactOption;
        }
        
        // Try matching on the augment name part (before " - " if present)
        const partialOption = Array.from(select.options).find(opt => {
            const optionText = opt.textContent.trim();
            const augmentPart = optionText.split(' - ')[0].trim();
            return augmentPart === augmentName.trim() || 
                   optionText.toLowerCase().includes(augmentName.toLowerCase()) ||
                   augmentName.toLowerCase().includes(optionText.toLowerCase());
        });
        
        return partialOption;
    }
    
    /**
     * Generates export data for a player using exact single player logic
     * @param {number} playerId - The player ID (1-5)
     * @returns {string} The formatted export data
     */
    function generatePlayerExportData(playerId) {
        try {
            let exportData = {
                actives: [],
                passives: [],
                augments: []
            };

            // Export active abilities using single player logic
            const activeSelectors = document.querySelectorAll(`#player-${playerId}-active-abilities-container .slot-wrapper`);
            
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
            const eliteActiveSelect = document.getElementById(`player-${playerId}-elite-active-1`);
            if (eliteActiveSelect && eliteActiveSelect.value) {
                const abilityIndex = tswData[eliteActiveSelect.value];
                if (abilityIndex) {
                    exportData.actives.push(abilityIndex.name);
                }
            }

            // Export aux active
            const auxActiveSelect = document.getElementById(`player-${playerId}-aux-1`);
            if (auxActiveSelect && auxActiveSelect.value) {
                const abilityIndex = tswData[auxActiveSelect.value];
                if (abilityIndex) {
                    exportData.actives.push(abilityIndex.name);
                }
            }

            // Export passives
            const elitePassiveSelect = document.getElementById(`player-${playerId}-elite-passive-1`);
            if (elitePassiveSelect && elitePassiveSelect.value) {
                const abilityIndex = tswData[elitePassiveSelect.value];
                if (abilityIndex) {
                    exportData.passives.push(abilityIndex.name);
                }
            }

            const normalPassiveSelects = document.querySelectorAll(`#player-${playerId}-passive-abilities-container .slot-wrapper`);
            normalPassiveSelects.forEach((wrapper) => {
                const select = wrapper.querySelector('select');
                if (select && select.value) {
                    const abilityIndex = tswData[select.value];
                    if (abilityIndex) {
                        exportData.passives.push(abilityIndex.name);
                    }
                }
            });

            // Export aux passive
            const auxPassiveSelect = document.getElementById(`player-${playerId}-aux-passive-1`);
            if (auxPassiveSelect && auxPassiveSelect.value) {
                const abilityIndex = tswData[auxPassiveSelect.value];
                if (abilityIndex) {
                    exportData.passives.push(abilityIndex.name);
                }
            }

            // Export augments using single player logic
            const augmentWrappers = document.querySelectorAll(`#player-${playerId}-augments-container .augment-wrapper`);
            
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

            // Format export text using single player format
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

            return exportText.trim();

        } catch (error) {
            console.error('Export failed:', error);
            return 'Export failed: ' + error.message;
        }
    }
    
    /**
     * Shows import status message for a player
     * @param {number} playerId - The player ID (1-5)
     * @param {string} message - The status message
     * @param {string} type - The message type ('success', 'warning', 'error')
     */
    function showImportStatus(playerId, message, type = 'success') {
        const statusElement = document.getElementById(`player-${playerId}-import-status`);
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        
        // Set color based on type
        switch (type) {
            case 'success':
                statusElement.style.color = 'var(--success-color)';
                break;
            case 'warning':
                statusElement.style.color = 'var(--warning-color)';
                break;
            case 'error':
                statusElement.style.color = '#ff6b6b';
                break;
        }
        
        // Hide after 3 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
    
    // Update all ability dropdowns for a player
    function updateAllAbilityDropdownsForPlayer(playerId) {
        const slots = document.querySelectorAll(`[id^="player-${playerId}-"] select`);
        slots.forEach(select => {
            const slotId = select.id;
            let slotType = 'active';
            
            if (slotId.includes('elite-passive')) slotType = 'elite-passive';
            else if (slotId.includes('active-7')) slotType = 'elite';
            else if (slotId.includes('aux')) slotType = 'auxiliary';
            else if (slotId.includes('passive')) slotType = 'passive';
            else if (slotId.includes('active-1')) slotType = 'builder';
            
            updateAbilityDropdown(playerId, select, slotType, '');
        });
    }
    
    // Update enemy display
    function updateEnemyDisplay() {
        const enemy = ENEMIES[groupState.sharedEnemy] || ENEMIES['training-puppet'];
        const display = document.getElementById('enemy-stats-display');
        if (display) {
            display.textContent = `Block: ${enemy.blockRating} | Evade: ${enemy.evadeRating} | Defense: ${enemy.defenseRating}`;
        }
    }
    
    // Calculate DPS for a single player
    function calculatePlayerDps(playerId) {
        const player = groupState.players[playerId - 1];
        
        // Check if player has any active abilities selected (same validation as original app)
        const activeSelects = document.querySelectorAll(`[id^="player-${playerId}-active-"] select`);
        const eliteSelects = document.querySelectorAll(`[id^="player-${playerId}-elite-"] select`);
        const auxSelects = document.querySelectorAll(`[id^="player-${playerId}-aux-"] select`);
        
        const selectedActives = [...activeSelects, ...eliteSelects, ...auxSelects].filter(select => select.value);
        
        if (selectedActives.length === 0) {
            // No active abilities selected - set DPS to 0
            player.results.totalDps = 0;
            
            // Update UI
            const dpsElement = document.getElementById(`player-${playerId}-total-dps`);
            if (dpsElement) {
                dpsElement.textContent = "0";
            }
            
            // Update team totals
            calculateTeamTotals();
            return;
        }
        
        // Collect all group-wide effects from all players
        const groupEffects = collectGroupWideEffects();
        
        // Calculate base DPS and individual augment bonuses
        const baseDps = calculateBaseDps(player);
        const augmentBonus = calculateAugmentBonus(player);
        
        // Apply group-wide effects to this player
        let groupWideBonus = 0;
        
        // Team damage buffs from all players' support augments
        if (groupEffects.teamDamageBuff > 0) {
            groupWideBonus += baseDps * (groupEffects.teamDamageBuff / 100);
        }
        
        // Team cooldown reduction affects ability uptime (simplified as DPS increase)
        if (groupEffects.teamCooldownReduction > 0) {
            // Simplified: assume cooldown reduction translates to more ability casts
            groupWideBonus += baseDps * (groupEffects.teamCooldownReduction / 100) * 0.5; // Conservative estimate
        }
        
        // Individual cooldown reduction from this player's own augments
        if (groupEffects.cooldownReduction > 0) {
            groupWideBonus += baseDps * (groupEffects.cooldownReduction / 100) * 0.3; // More conservative for self-only
        }
        
        // Evade reduction affects hit chance (simplified as DPS increase)
        if (groupEffects.evadeReduction > 0) {
            // Simplified: assume evade reduction improves effective hit rate
            groupWideBonus += baseDps * (groupEffects.evadeReduction / 100) * 0.2; // Conservative estimate
        }
        
        // Ability-based group-wide effects
        
        // Team Critical Rating from abilities like Social Dynamo and Critical Control
        if (groupEffects.teamCritRating > 0) {
            // Convert Crit Rating to Crit Chance (simplified: ~400 rating = 1% crit chance)
            const critChanceFromRating = (groupEffects.teamCritRating / 400);
            groupWideBonus += baseDps * critChanceFromRating * (player.stats.critPower / 100);
        }
        
        // Team Hit Rating from abilities like Pack Leader
        if (groupEffects.teamHitRating > 0) {
            // Convert Hit Rating to reduced glancing chance (simplified: ~400 rating = 1% less glancing)
            // Assume base 10% glancing chance, each 400 hit rating reduces by 1%
            const glancingReduction = (groupEffects.teamHitRating / 400);
            // Glancing hits do 70% damage, so reducing glancing chance increases average damage
            const avgDamageIncrease = glancingReduction * 0.3; // 30% of the damage that would have been glancing
            groupWideBonus += baseDps * avgDamageIncrease;
        }
        
        // Flat damage buffs from abilities like Short Fuse
        if (groupEffects.teamDamageBuffFlat > 0) {
            groupWideBonus += baseDps * (groupEffects.teamDamageBuffFlat / 100);
        }
        
        // Calculate total DPS
        const totalDps = baseDps + augmentBonus + groupWideBonus;
        
        player.results.totalDps = totalDps;
        
        // Update UI
        const dpsElement = document.getElementById(`player-${playerId}-total-dps`);
        if (dpsElement) {
            dpsElement.textContent = totalDps.toFixed(2);
        }
        
        // Update team totals
        calculateTeamTotals();
    }
    
    // Calculate base DPS (simplified version)
    function calculateBaseDps(player) {
        // This is a placeholder - in reality, this would call the same calculation
        // logic from the original app.js
        const weaponPower = player.stats.weaponPower;
        const attackRating = player.stats.attackRating;
        const critChance = player.stats.critChance / 100;
        const critPower = player.stats.critPower / 100;
        const penChance = player.stats.penChance / 100;
        
        // Simplified DPS calculation
        const baseDamage = weaponPower + (attackRating * 0.5);
        const avgCritMultiplier = 1 + (critChance * critPower);
        const avgPenMultiplier = 1 + (penChance * 0.5); // Penetration does 50% more damage
        
        return baseDamage * avgCritMultiplier * avgPenMultiplier * 0.8; // Base rotation efficiency
    }
    
    // Collect all group-wide effects from all players
    function collectGroupWideEffects() {
        const groupEffects = {
            teamDamageBuff: 0,
            teamDamageReduction: 0,
            teamCriticalHeal: 0,  // Only critical healing matters for Signet of Equilibrium
            teamHealingBuff: 0,   // Keep augment healing buffs for Signet of Equilibrium
            teamCooldownReduction: 0,
            cooldownReduction: 0, // Individual cooldown reduction effects
            evadeReduction: 0,    // Individual evade reduction effects
            // Ability-based group-wide effects (damage-related only)
            teamCritRating: 0,
            teamHitRating: 0,
            teamDamageBuffFlat: 0,
            // Shared enemy debuffs (uptime percentages based on ability cooldowns and durations)
            enemyAfflictedUptime: 0,  // % of time enemy is Afflicted
            enemyWeakenedUptime: 0,   // % of time enemy is Weakened
            enemyHinderedUptime: 0,   // % of time enemy is Hindered
            enemyImpairedUptime: 0,   // % of time enemy is Impaired
            // Player buff uptimes (time-based effects from active abilities)
            shortFuseUptime: 0,       // % uptime for Short Fuse (20% damage buff)
            amorFatiUptime: 0,        // % uptime for Amor Fati (10% damage buff)
            doOrDieUptime: 0          // % uptime for Do or Die (25% damage buff)
        };

        // Collect effects from all players
        groupState.players.forEach(player => {
            // Check if this player can apply enemy debuffs (shared across group)
            const allPlayerAbilitiesForDebuffs = [
                ...player.abilities.actives,
                ...player.abilities.elites,
                ...player.abilities.auxiliaries
            ];
            
            allPlayerAbilitiesForDebuffs.forEach(abilityIndex => {
                const ability = tswData[abilityIndex];
                if (!ability || !ability.description) return;
                
                const desc = ability.description.toLowerCase();
                
                // Extract duration from description
                let duration = 8; // Default duration
                const durationMatch = desc.match(/for (\d+) seconds?/);
                if (durationMatch) {
                    duration = parseInt(durationMatch[1]);
                }
                
                // Calculate uptime: duration / (cooldown + duration)
                const uptime = (duration / (ability.cooldown + duration)) * 100;
                
                // Apply to appropriate debuff type based on description
                if (desc.includes('afflicted') && desc.includes('damage over time')) {
                    groupEffects.enemyAfflictedUptime = Math.max(groupEffects.enemyAfflictedUptime, uptime);
                }
                if (desc.includes('weakened') && (desc.includes('damage dealt') || desc.includes('debilitate') || desc.includes('damage received'))) {
                    groupEffects.enemyWeakenedUptime = Math.max(groupEffects.enemyWeakenedUptime, uptime);
                }
                if (desc.includes('hindered') && desc.includes('movement speed')) {
                    groupEffects.enemyHinderedUptime = Math.max(groupEffects.enemyHinderedUptime, uptime);
                }
                if (desc.includes('impaired') && (desc.includes('unable to act') || desc.includes('unable to activate'))) {
                    groupEffects.enemyImpairedUptime = Math.max(groupEffects.enemyImpairedUptime, uptime);
                }
            });
            
            // Check for active abilities that give buffs and calculate their uptime
            allPlayerAbilitiesForDebuffs.forEach(abilityIndex => {
                const ability = tswData[abilityIndex];
                if (!ability || !ability.description) return;
                
                const desc = ability.description.toLowerCase();
                
                // Extract duration from description
                let duration = 10; // Default duration for buffs
                const durationMatch = desc.match(/for (\d+) seconds?/);
                if (durationMatch) {
                    duration = parseInt(durationMatch[1]);
                }
                
                // Calculate uptime: duration / (cooldown + duration)
                const uptime = (duration / (ability.cooldown + duration)) * 100;
                
                // Apply to appropriate buff type based on ability name and description
                switch (ability.name) {
                    case 'Short Fuse':
                        if (desc.includes('increases all damage by 20%')) {
                            groupEffects.shortFuseUptime = Math.max(groupEffects.shortFuseUptime, uptime);
                        }
                        break;
                    case 'Amor Fati':
                        if (desc.includes('increases all damage dealt by 10%')) {
                            groupEffects.amorFatiUptime = Math.max(groupEffects.amorFatiUptime, uptime);
                        }
                        break;
                    case 'Do or Die':
                        if (desc.includes('increases the direct damage you deal by 25%')) {
                            groupEffects.doOrDieUptime = Math.max(groupEffects.doOrDieUptime, uptime);
                        }
                        break;
                }
            });
            
            // Collect augment effects
            Object.values(player.augments).forEach(augmentKey => {
                const augment = AUGMENTS[augmentKey];
                if (augment) {
                    // Team-wide support effects
                    if (augment.type === 'support') {
                        if (augment.effect.teamDamageBuff) {
                            groupEffects.teamDamageBuff += augment.effect.teamDamageBuff;
                        }
                        if (augment.effect.teamDamageReduction) {
                            groupEffects.teamDamageReduction += augment.effect.teamDamageReduction;
                        }
                        if (augment.effect.teamHeal) {
                            // Only critical healing matters for Signet of Equilibrium
                            // Estimate critical heal chance based on player's crit chance
                            const critChance = player.stats.critChance / 100;
                            const expectedCriticalHeals = augment.effect.teamHeal * critChance;
                            groupEffects.teamCriticalHeal += expectedCriticalHeals;
                        }
                        if (augment.effect.teamHealingBuff) {
                            groupEffects.teamHealingBuff += augment.effect.teamHealingBuff;
                        }
                        if (augment.effect.teamCooldownReduction) {
                            groupEffects.teamCooldownReduction += augment.effect.teamCooldownReduction;
                        }
                    }
                    
                    // Individual effects that still apply to the player
                    if (augment.effect.cooldownReduction) {
                        groupEffects.cooldownReduction += augment.effect.cooldownReduction;
                    }
                    if (augment.effect.evadeReduction) {
                        groupEffects.evadeReduction += augment.effect.evadeReduction;
                    }
                }
            });

            // Collect ability-based group-wide effects
            const allPlayerAbilities = [
                ...player.abilities.actives,
                ...player.abilities.elites,
                ...player.abilities.auxiliaries,
                ...player.abilities.passives
            ];

            allPlayerAbilities.forEach(abilityIndex => {
                const ability = tswData[abilityIndex];
                if (!ability) return;

                // Check for specific damage-related group-wide abilities
                switch (ability.name) {
                    case 'Social Dynamo':
                        // "Whenever you critically hit with Strike abilities, all group members gain a single stack of the Critical Rating effect, which increases Critical Rating by 40 per stack for 8 seconds. This effect can stack up to 5 times."
                        // Realistic calculation: Need Strike abilities and critical hits to trigger
                        // Estimate: 30% of abilities are Strike subtype, 20% crit chance = 6% trigger rate per ability use
                        // With 8s duration and typical ability rotation, maintain ~2-3 stacks on average
                        const socialDynamoStacks = 2.5; // Realistic average stacks maintained
                        groupEffects.teamCritRating += socialDynamoStacks * 40; // 2.5 * 40 = 100 crit rating average
                        break;
                    case 'Critical Control':
                        // "Whenever you hit a Hindered target, all group members gain a single stack of the Critical Rating effect, which increases Critical Rating by 40 per stack for 8 seconds. This effect can stack up to 5 times."
                        // Effectiveness scales with Hindered uptime
                        if (groupEffects.enemyHinderedUptime > 0) {
                            // Realistic calculation: 40% of attacks hit Hindered targets in group content
                            // With 8s duration and typical attack frequency, maintain ~2 stacks on average
                            // Scale by uptime percentage
                            const criticalControlStacks = 2.0 * (groupEffects.enemyHinderedUptime / 100);
                            groupEffects.teamCritRating += criticalControlStacks * 40; // Scaled crit rating bonus
                        }
                        break;
                    case 'Short Fuse':
                        // "Gives all group members the Short Fuse effect, which increases all damage by 20% for 10 seconds"
                        // Scale by uptime percentage
                        const shortFuseBonus = 20 * (groupEffects.shortFuseUptime / 100);
                        groupEffects.teamDamageBuffFlat += shortFuseBonus;
                        break;
                    case 'Amor Fati':
                        // "Gives you a beneficial effect that increases all damage dealt by 10% for 10 seconds"
                        // Individual player buff, scale by uptime
                        const amorFatiBonus = 10 * (groupEffects.amorFatiUptime / 100);
                        groupEffects.teamDamageBuffFlat += amorFatiBonus;
                        break;
                    case 'Do or Die':
                        // "Increases the direct damage you deal by 25% for 10 seconds"
                        // Individual player buff, scale by uptime
                        const doOrDieBonus = 25 * (groupEffects.doOrDieUptime / 100);
                        groupEffects.teamDamageBuffFlat += doOrDieBonus;
                        break;
                    case 'Pack Leader':
                        // "Gives all group members a beneficial effect that reduces the chance of performing glancing hits by 80% for 10 seconds"
                        // 80% glancing reduction is a significant DPS boost, especially for low-hit rating builds
                        // Convert to effective hit rating increase (simplified: ~80% reduction in glancing = ~400 hit rating equivalent)
                        groupEffects.teamHitRating += 400;
                        break;
                    // Conditional abilities that benefit from shared enemy debuffs (scaled by uptime)
                    case 'Third Degree':
                        // "Whenever you penetrate a target that is Afflicted, you gain the Minor Penetration Chance effect, which increases Penetration Chance by 15% for 8 seconds."
                        if (groupEffects.enemyAfflictedUptime > 0) {
                            // Estimate 30% penetration rate, 8s duration, maintain ~1.5 stacks
                            // Scale by Afflicted uptime
                            const thirdDegreeStacks = 1.5 * (groupEffects.enemyAfflictedUptime / 100);
                            groupEffects.teamCritRating += thirdDegreeStacks * 40; // Scaled crit rating equivalent
                        }
                        break;
                    case 'Fever Pitch':
                        // "Whenever you hit a Weakened target, you have a 15% chance to gain the Major Hit Chance effect, which reduces the chance of glancing by 25% for 5 seconds."
                        if (groupEffects.enemyWeakenedUptime > 0) {
                            // 15% chance per hit, 5s duration, assume frequent hits = ~25% uptime
                            // Scale by Weakened uptime
                            const feverPitchBonus = 100 * (groupEffects.enemyWeakenedUptime / 100);
                            groupEffects.teamHitRating += feverPitchBonus; // Scaled glancing reduction
                        }
                        break;
                    case 'Seal the Deal':
                        // "Whenever you hit a Weakened target, you have a 50% chance to gain a single stack of the Hit Rating effect, which increases Hit Rating by 40 per stack for 8 seconds. This effect can stack up to 5 times."
                        if (groupEffects.enemyWeakenedUptime > 0) {
                            // 50% chance per hit, maintain ~2 stacks on average
                            // Scale by Weakened uptime
                            const sealTheDealBonus = 80 * (groupEffects.enemyWeakenedUptime / 100);
                            groupEffects.teamHitRating += sealTheDealBonus; // Scaled hit rating
                        }
                        break;
                    case 'Wheel of Knives':
                        // "\"Wheel of Knives\" performs an additional hit to Weakened and Impaired targets, dealing 6 magical damage."
                        const combinedDebuffUptime = Math.max(groupEffects.enemyWeakenedUptime, groupEffects.enemyImpairedUptime);
                        if (combinedDebuffUptime > 0) {
                            // Additional hit = ~5% damage increase, scaled by uptime
                            const wheelOfKnivesBonus = 5 * (combinedDebuffUptime / 100);
                            groupEffects.teamDamageBuffFlat += wheelOfKnivesBonus;
                        }
                        break;
                    case 'Pulling the Strings':
                        // "Consumes all Chaos Resources. A single target attack with a 7 metre range that deals 87 - 176 magical damage, based on the number of resources consumed. If the target is Weakened, you gain the Minor Hit Chance effect, which reduces the chance of glancing by 10% for 8 seconds."
                        if (groupEffects.enemyWeakenedUptime > 0) {
                            // Scale by Weakened uptime
                            const pullingTheStringsBonus = 40 * (groupEffects.enemyWeakenedUptime / 100);
                            groupEffects.teamHitRating += pullingTheStringsBonus; // Scaled glancing reduction
                        }
                        break;
                    // Passive cooldown reduction abilities (individual effects, not team-wide)
                    case 'Calling the Shots':
                        // "Reduces the recharge time of \"Deadly Aim\" by 30 seconds and reduces the duration of \"Uncalibrated\" effect by 30 seconds."
                        // Deadly Aim: 90s cooldown, 10s buff, 90s Uncalibrated debuff
                        // With Calling the Shots: 60s cooldown, 10s buff, 60s Uncalibrated debuff
                        // This effectively increases Deadly Aim uptime from ~10% to ~14.3% (10s every 100s vs 10s every 70s)
                        // Combined effect: 43% increase in Deadly Aim effectiveness
                        groupEffects.cooldownReduction += 43;
                        break;
                    case 'Breach Party':
                        // "Reduces the recharge time of \"Breaching Shot\" by 30 seconds and reduces the duration of \"Depleted\" effect by 30 seconds."
                        // Breaching Shot: 90s cooldown, 8s buff, 90s Depleted debuff
                        // With Breach Party: 60s cooldown, 8s buff, 60s Depleted debuff
                        // This effectively increases Breaching Shot uptime from ~8% to ~11.4% (8s every 98s vs 8s every 68s)
                        // Combined effect: 42.5% increase in Breaching Shot effectiveness
                        groupEffects.cooldownReduction += 42.5;
                        break;
                    case 'Double Dash':
                        // "Reduces the recharge time of all dash abilities by 50%."
                        groupEffects.cooldownReduction += 50;
                        break;
                    case 'Stone Cold':
                        // "Reduces the recharge time of Stonewalled by 15 seconds."
                        // Assuming Stonewalled has similar cooldown to other defensive abilities
                        groupEffects.cooldownReduction += 20; // Conservative estimate
                        break;
                    case 'Alpha Wolf':
                        // "Reduces the recharge time of \"Pack Leader\" by 30 seconds."
                        // Assuming Pack Leader has similar cooldown to other elite abilities
                        groupEffects.cooldownReduction += 25; // Conservative estimate
                        break;
                    // Remove healing/leech abilities as they don't affect DPS:
                    // - Outbreak Alert (healing)
                    // - Reap and Sew (leech)
                    // - Cold Blooded (healing)
                }
            });
        });

        return groupEffects;
    }

    // Calculate augment bonus
    function calculateAugmentBonus(player) {
        let bonus = 0;
        Object.values(player.augments).forEach(augmentKey => {
            const augment = AUGMENTS[augmentKey];
            if (augment && augment.type === 'damage') {
                if (augment.effect.damageMultiplier) {
                    bonus += calculateBaseDps(player) * (augment.effect.damageMultiplier - 1);
                }
                if (augment.effect.attackRating) {
                    bonus += augment.effect.attackRating * 0.5;
                }
                if (augment.effect.critChance) {
                    bonus += calculateBaseDps(player) * (augment.effect.critChance / 100) * (player.stats.critPower / 100);
                }
                if (augment.effect.critPower) {
                    bonus += calculateBaseDps(player) * (player.stats.critChance / 100) * (augment.effect.critPower / 100);
                }
            }
        });
        return bonus;
    }
    
    // Calculate all players
    function calculateAllPlayers() {
        for (let i = 1; i <= 5; i++) {
            calculatePlayerDps(i);
        }
    }
    
    // Calculate team totals
    function calculateTeamTotals() {
        const teamTotal = groupState.players.reduce((sum, player) => sum + player.results.totalDps, 0);
        const teamAverage = teamTotal / 5;
        
        const teamTotalElement = document.getElementById('team-total-dps');
        const teamAverageElement = document.getElementById('team-average-dps');
        
        if (teamTotalElement) teamTotalElement.textContent = teamTotal.toFixed(2);
        if (teamAverageElement) teamAverageElement.textContent = teamAverage.toFixed(2);
    }
    
    // Import team
    function importTeam() {
        const textarea = document.getElementById('team-import-textarea');
        const status = document.getElementById('team-import-status');
        
        try {
            const data = textarea.value;
            const players = parseTeamImportData(data);
            
            players.forEach((playerData, index) => {
                if (index < 5) {
                    loadPlayerData(index + 1, playerData);
                }
            });
            
            status.textContent = 'Team imported successfully!';
            status.style.color = 'var(--success-color)';
            status.style.display = 'block';
            
            calculateAllPlayers();
        } catch (error) {
            status.textContent = 'Error importing team: ' + error.message;
            status.style.color = 'var(--warning-color)';
            status.style.display = 'block';
        }
    }
    
    // Export team
    function exportTeam() {
        const teamData = exportTeamData();
        const textarea = document.getElementById('team-import-textarea');
        textarea.value = teamData;
        
        const status = document.getElementById('team-import-status');
        status.textContent = 'Team data exported to clipboard! You can copy and share this.';
        status.style.color = 'var(--success-color)';
        status.style.display = 'block';
        
        // Copy to clipboard
        navigator.clipboard.writeText(teamData).catch(err => {
            console.error('Failed to copy to clipboard:', err);
        });
    }
    
    // Clear all players
    function clearAllPlayers() {
        if (confirm('This will clear all player data. Are you sure?')) {
            location.reload();
        }
    }
    
    // Parse team import data
    function parseTeamImportData(data) {
        const players = [];
        const sections = data.split('=== PLAYER');
        
        sections.forEach(section => {
            if (section.trim()) {
                const lines = section.trim().split('\n');
                const playerMatch = lines[0].match(/(\d+) ===/);
                if (playerMatch) {
                    const playerData = {
                        name: lines[1] || '',
                        buildData: lines.slice(2).join('\n')
                    };
                    players.push(playerData);
                }
            }
        });
        
        return players;
    }
    
    // Load player data
    function loadPlayerData(playerId, playerData) {
        const player = groupState.players[playerId - 1];
        
        // Load name
        if (playerData.name) {
            player.name = playerData.name;
            document.getElementById(`player-${playerId}-name`).value = playerData.name;
        }
        
        // Parse and load build data (this would need to be implemented)
        // For now, this is a placeholder
    }
    
    // Export team data
    function exportTeamData() {
        let data = '';
        
        groupState.players.forEach((player, index) => {
            data += `=== PLAYER ${index + 1} ===\n`;
            data += `${player.name}\n`;
            data += `[Build data for ${player.name} would go here]\n\n`;
        });
        
        return data.trim();
    }
    
    // Augment data (copied from original)
    const AUGMENTS = {
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
    
    // Initialize the application
    function init() {
        if (typeof tswData === 'undefined') {
            return;
        }
        
        initializePlayers();
        initializeUI();
        
        // Initialize ability dropdowns for all players
        for (let i = 1; i <= 5; i++) {
            updateAllAbilityDropdownsForPlayer(i);
            // Setup dropdown event listeners for each player's ability slots
            setupDropdownEventListenersForPlayer(i);
        }
        
        calculateAllPlayers();
    }
    
    // Setup dropdown event listeners for a specific player
    function setupDropdownEventListenersForPlayer(playerId) {
        // Get all ability slots for this player
        const slots = document.querySelectorAll(`[id^="player-${playerId}-"] .slot-wrapper`);
        
        slots.forEach(slot => {
            const display = slot.querySelector('.ability-dropdown-display');
            const list = slot.querySelector('.ability-dropdown-list');
            const searchInput = slot.querySelector('.ability-search-input');
            const select = slot.querySelector('select');
            
            if (display && list && select) {
                // Remove existing listeners to prevent duplicates
                const newDisplay = display.cloneNode(true);
                display.parentNode.replaceChild(newDisplay, display);
                
                // Add click listener to toggle dropdown
                newDisplay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close all other dropdowns
                    document.querySelectorAll('.ability-dropdown-list').forEach(otherList => {
                        if (otherList !== list) {
                            otherList.style.display = 'none';
                        }
                    });
                    list.style.display = list.style.display === 'block' ? 'none' : 'block';
                });
            }
            
            if (searchInput) {
                // Remove existing listeners
                const newSearchInput = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newSearchInput, searchInput);
                
                // Add input listener for search
                newSearchInput.addEventListener('input', (e) => {
                    const slotId = select.id;
                    let slotType = 'active';
                    
                    if (slotId.includes('elite')) slotType = 'elite';
                    else if (slotId.includes('aux')) slotType = 'auxiliary';
                    else if (slotId.includes('passive')) slotType = 'passive';
                    else if (slotId.includes('active-1')) slotType = 'builder';
                    
                    updateAbilityDropdown(playerId, select, slotType, e.target.value);
                });
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.slot-wrapper')) {
                document.querySelectorAll('.ability-dropdown-list').forEach(list => {
                    list.style.display = 'none';
                });
            }
        });
    }
    
    // Start the application
    init();
});
