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
        const container = document.getElementById('players-container');
        const templatePanel = container.querySelector('.player-panel');
        
        if (!templatePanel) {
            console.error('Player panel template not found');
            return;
        }
        
        // Create panels for players 2-5
        for (let playerNumber = 2; playerNumber <= 5; playerNumber++) {
            const clonedPanel = templatePanel.cloneNode(true);
            clonedPanel.dataset.player = playerNumber;
            
            updateAllPlayerPanelIds(clonedPanel, playerNumber);
            container.appendChild(clonedPanel);
        }
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
            createAbilitySlotsForPlayer(i);
        }
    }
    
    // Create ability slots for a specific player
    function createAbilitySlotsForPlayer(playerId) {
        const activeContainer = document.getElementById(`player-${playerId}-active-abilities-container`);
        const passiveContainer = document.getElementById(`player-${playerId}-passive-abilities-container`);
        
        if (!activeContainer || !passiveContainer) return;
        
        // Clear existing content
        activeContainer.innerHTML = '';
        passiveContainer.innerHTML = '';
        
        // Create active ability slots (7 total: 6 normal + 1 elite)
        for (let j = 1; j <= 7; j++) {
            const slotType = j === 1 ? 'builder' : (j === 7 ? 'elite' : 'active');
            const slotId = `player-${playerId}-active-${j}`;
            const slot = createAbilitySlot(slotId, slotType, j);
            activeContainer.appendChild(slot);
        }
        
        // Create auxiliary active slot
        const auxSlot = createAbilitySlot(`player-${playerId}-aux-1`, 'auxiliary', 8);
        activeContainer.appendChild(auxSlot);
        
        // Create passive ability slots (8 total: 1 elite + 7 normal)
        const elitePassiveSlot = createAbilitySlot(`player-${playerId}-elite-passive-1`, 'elite-passive', 1);
        passiveContainer.appendChild(elitePassiveSlot);
        
        for (let j = 1; j <= 7; j++) {
            const slotId = `player-${playerId}-passive-${j}`;
            const slot = createAbilitySlot(slotId, 'passive', j + 1);
            passiveContainer.appendChild(slot);
        }
        
        // Create auxiliary passive slot
        const auxPassiveSlot = createAbilitySlot(`player-${playerId}-aux-passive-1`, 'aux-passive', 9);
        passiveContainer.appendChild(auxPassiveSlot);
    }
    
    // Create a single ability slot
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
        
        // Add search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'ability-search-input';
        searchInput.placeholder = 'Search...';
        
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
        wrapper.appendChild(searchInput);
        wrapper.appendChild(display);
        wrapper.appendChild(list);
        
        // Add event listeners
        display.addEventListener('click', () => {
            list.style.display = list.style.display === 'block' ? 'none' : 'block';
        });
        
        searchInput.addEventListener('input', () => {
            updateAbilityDropdown(playerId, select, slotType, searchInput.value);
        });
        
        select.addEventListener('change', () => {
            updateSlotDisplay(select, display);
            updateAugmentsForPlayer(playerId);
            calculatePlayerDps(playerId);
        });
        
        if (priorityInput) {
            priorityInput.addEventListener('input', () => {
                calculatePlayerDps(playerId);
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
    
    // Update ability dropdown for a specific slot
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
                    getType(a).includes("Active") &&
                    getType(a).includes("Elite") &&
                    !AUX_WEAPONS.includes(a.weapon);
                break;
            case 'auxiliary':
                filterFn = a => AUX_WEAPONS.includes(a.weapon) &&
                    (!aux || a.weapon === aux) &&
                    getType(a).includes("Active");
                break;
            case 'elite-passive':
                filterFn = a => getType(a).includes("Elite") && getType(a).includes("Passive");
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
        
        if (searchTerm) {
            const filtered = abilities.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
            populateDropdown(select, filtered);
        } else {
            populateDropdown(select, abilities);
        }
    }
    
    // Populate dropdown with abilities
    function populateDropdown(select, abilities) {
        const currentValue = select.value;
        const wrapper = select.closest('.slot-wrapper');
        const display = wrapper.querySelector('.ability-dropdown-display');
        const list = wrapper.querySelector('.ability-dropdown-list');
        
        select.innerHTML = '<option value="">-- None --</option>';
        list.innerHTML = '';
        
        abilities.forEach(ability => {
            const globalIndex = tswData.indexOf(ability);
            const option = document.createElement('option');
            option.value = globalIndex;
            option.textContent = ability.name;
            select.appendChild(option);
            
            // Add to dropdown list
            const item = document.createElement('div');
            item.className = 'ability-dropdown-item';
            
            // Add icon if available
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
        
        // Restore selection if possible
        if (currentValue && Array.from(select.options).some(o => o.value === currentValue)) {
            select.value = currentValue;
            updateSlotDisplay(select, display);
        }
    }
    
    // Update slot display
    function updateSlotDisplay(select, display) {
        const ability = tswData[select.value];
        display.textContent = ability ? ability.name : '-- None --';
    }
    
    // Update augments for a player
    function updateAugmentsForPlayer(playerId) {
        const player = groupState.players[playerId - 1];
        const augmentContainer = document.getElementById(`player-${playerId}-augments-container`);
        
        if (!augmentContainer) return;
        
        augmentContainer.innerHTML = '';
        
        // Get all selected abilities for this player
        const activeSelects = document.querySelectorAll(`[id^="player-${playerId}-active-"] select`);
        const eliteSelects = document.querySelectorAll(`[id^="player-${playerId}-elite-"] select`);
        const auxSelects = document.querySelectorAll(`[id^="player-${playerId}-aux-"] select`);
        
        const allSelects = [...activeSelects, ...eliteSelects, ...auxSelects];
        
        allSelects.forEach(select => {
            const ability = tswData[select.value];
            if (!ability) return;
            
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
                calculatePlayerDps(playerId);
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
                    
                    calculatePlayerDps(playerId);
                });
            }
        });
        
        // Weapon selects
        ['weapon-type', 'secondary-weapon-type', 'auxiliary-weapon-type'].forEach(weaponType => {
            const select = document.getElementById(`player-${playerId}-${weaponType}`);
            if (select) {
                select.addEventListener('change', (e) => {
                    const weaponKey = weaponType.replace('-type', '').replace('weapon', '');
                    if (weaponKey === 'primary') {
                        player.weapons.primary = e.target.value;
                    } else if (weaponKey === 'secondary') {
                        player.weapons.secondary = e.target.value;
                    } else if (weaponKey === 'auxiliary') {
                        player.weapons.auxiliary = e.target.value;
                    }
                    
                    // Update ability dropdowns for this player
                    updateAllAbilityDropdownsForPlayer(playerId);
                    calculatePlayerDps(playerId);
                });
            }
        });
    }
    
    // Update all ability dropdowns for a player
    function updateAllAbilityDropdownsForPlayer(playerId) {
        const slots = document.querySelectorAll(`[id^="player-${playerId}-"] select`);
        slots.forEach(select => {
            const slotId = select.id;
            let slotType = 'active';
            
            if (slotId.includes('elite')) slotType = 'elite';
            else if (slotId.includes('aux')) slotType = 'auxiliary';
            else if (slotId.includes('passive')) slotType = 'passive';
            else if (slotId.includes('active-1')) slotType = 'builder';
            
            updateAbilityDropdown(playerId, select, slotType);
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
        
        // This would use the same calculation logic as the original app
        // For now, we'll create a placeholder calculation
        const baseDps = calculateBaseDps(player);
        const augmentBonus = calculateAugmentBonus(player);
        const totalDps = baseDps + augmentBonus;
        
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
            console.error('TSW data not loaded');
            return;
        }
        
        initializePlayers();
        initializeUI();
        calculateAllPlayers();
    }
    
    // Start the application
    init();
});
