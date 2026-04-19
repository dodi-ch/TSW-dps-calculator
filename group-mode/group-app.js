document.addEventListener('DOMContentLoaded', () => {
    // Group Mode Application
    const GROUP_SIZE = 5;
    const MAX_ACTIVE_ABILITIES = 6;
    const MAX_PASSIVE_ABILITIES = 6;
    
    // Enemy data (simplified version from main app)
    const ENEMIES = {
        'training-puppet': {
            name: 'Training Puppet',
            block: 0,
            evade: 0,
            defense: 0
        }
    };
    
    // Player data structure
    let players = [];
    
    // Initialize the application
    function init() {
        console.log('=== INITIALIZING GROUP MODE ===');
        initializePlayers();
        console.log('Players initialized:', players.length);
        renderPlayers();
        console.log('Players rendered');
        populateWeaponSelects();
        console.log('Weapon selects populated');
        populateAbilitySelects();
        console.log('Ability selects populated');
        setupEventListeners();
        console.log('Event listeners setup');
        debugAbilityCounts();
        setTimeout(() => {
            setupAbilityIcons();
            players.forEach(player => {
                updatePlayerAbilityIcons(player.id);
            });
        }, 100); // Setup icons after populating
        console.log('=== INITIALIZATION COMPLETE ===');
    }
    
    // Initialize player data
    function initializePlayers() {
        for (let i = 0; i < GROUP_SIZE; i++) {
            players.push({
                id: i + 1,
                name: `Player ${i + 1}`,
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
                    auxiliary: 'None'
                },
                abilities: {
                    active: [],
                    eliteActive: null,
                    auxiliaryActive: null,
                    elitePassive: null,
                    normalPassives: [],
                    auxiliaryPassive: null
                },
                augments: {},
                dps: 0
            });
        }
    }
    
    // Get unique weapon types from data
    function getWeaponTypes() {
        const weapons = new Set(['All', 'None']);
        tswData.forEach(item => {
            if (item.weapon && item.weapon !== 'None') {
                weapons.add(item.weapon);
            }
        });
        return Array.from(weapons).sort();
    }
    
    // Get auxiliary weapons
    function getAuxiliaryWeapons() {
        const auxWeapons = new Set(['None']);
        const auxiliaryWeaponTypes = ['Whip', 'Flamethrower', 'Quantum', 'Chainsaw', 'Rocket Launcher'];
        tswData.forEach(item => {
            if (item.type === 'Active' && item.weapon && auxiliaryWeaponTypes.includes(item.weapon)) {
                auxWeapons.add(item.weapon);
            }
        });
        return Array.from(auxWeapons).sort();
    }
    
    // Populate weapon selects
    function populateWeaponSelects() {
        console.log('=== POPULATING WEAPON SELECTS ===');
        const weaponTypes = getWeaponTypes();
        const auxWeapons = getAuxiliaryWeapons();
        
        console.log('Weapon types found:', weaponTypes);
        console.log('Auxiliary weapons found:', auxWeapons);
        
        players.forEach(player => {
            console.log('Populating weapons for player', player.id);
            const primarySelect = document.getElementById(`primary-weapon-${player.id}`);
            const secondarySelect = document.getElementById(`secondary-weapon-${player.id}`);
            const auxiliarySelect = document.getElementById(`auxiliary-weapon-${player.id}`);
            
            console.log('Weapon select elements found:', {
                primary: !!primarySelect,
                secondary: !!secondarySelect,
                auxiliary: !!auxiliarySelect
            });
            
            if (primarySelect) {
                primarySelect.innerHTML = weaponTypes.map(weapon => 
                    `<option value="${weapon}">${weapon}</option>`
                ).join('');
            }
            
            if (secondarySelect) {
                secondarySelect.innerHTML = ['None', ...weaponTypes.filter(w => w !== 'All')].map(weapon => 
                    `<option value="${weapon}">${weapon}</option>`
                ).join('');
            }
            
            if (auxiliarySelect) {
                auxiliarySelect.innerHTML = auxWeapons.map(weapon => 
                    `<option value="${weapon}">${weapon}</option>`
                ).join('');
            }
        });
    }
    
    // Get abilities by weapon and type
    function getAbilitiesByWeapon(weapon, type = 'Active') {
        return tswData.filter(item => 
            item.type === type && 
            (weapon === 'All' || item.weapon === weapon)
        );
    }
    
    // Populate ability selects with custom dropdowns
    function populateAbilitySelects() {
        console.log('=== POPULATING ABILITY SELECTS ===');
        players.forEach(player => {
            // Get selected weapons for this player
            const primaryWeapon = document.getElementById(`primary-weapon-${player.id}`)?.value || 'All';
            const secondaryWeapon = document.getElementById(`secondary-weapon-${player.id}`)?.value || 'None';
            
            // Filter abilities based on selected weapons
            let activeAbilities;
            let passiveAbilities;
            
            if (primaryWeapon === 'All') {
                // If primary is 'All', show all abilities except auxiliary weapons
                const auxiliaryWeaponTypes = ['Whip', 'Flamethrower', 'Quantum', 'Chainsaw', 'Rocket Launcher'];
                activeAbilities = getAbilitiesByWeapon('All', 'Active').filter(ability => 
                    !auxiliaryWeaponTypes.includes(ability.weapon)
                );
                passiveAbilities = getAbilitiesByWeapon('All', 'Passive').filter(ability => 
                    !auxiliaryWeaponTypes.includes(ability.weapon)
                );
            } else {
                // Filter by selected weapons
                const weapons = [primaryWeapon];
                if (secondaryWeapon !== 'None') {
                    weapons.push(secondaryWeapon);
                }
                
                activeAbilities = [];
                passiveAbilities = [];
                
                weapons.forEach(weapon => {
                    activeAbilities.push(...getAbilitiesByWeapon(weapon, 'Active'));
                    passiveAbilities.push(...getAbilitiesByWeapon(weapon, 'Passive'));
                });
                
                // Remove duplicates
                activeAbilities = activeAbilities.filter((ability, index, self) => 
                    index === self.findIndex(a => a.name === ability.name)
                );
                passiveAbilities = passiveAbilities.filter((ability, index, self) => 
                    index === self.findIndex(a => a.name === ability.name)
                );
            }
            
            console.log('Player', player.id, 'Active abilities:', activeAbilities.length, 'Passive abilities:', passiveAbilities.length);
            
            // Active abilities (6 slots)
            const activeContainer = document.getElementById(`active-abilities-${player.id}`);
            console.log('Active container found:', !!activeContainer);
            if (activeContainer) {
                activeContainer.innerHTML = '';
                for (let i = 0; i < MAX_ACTIVE_ABILITIES; i++) {
                    const slot = document.createElement('div');
                    slot.className = 'ability-slot';
                    
                    const dropdown = createCustomDropdown(`active-ability-${player.id}-${i}`, activeAbilities);
                    console.log('Created dropdown for active ability', i, dropdown ? 'success' : 'failed');
                    const priorityWrapper = document.createElement('div');
                    priorityWrapper.className = 'input-wrapper';
                    const priorityLabel = document.createElement('label');
                    priorityLabel.textContent = 'Priority';
                    priorityLabel.setAttribute('for', `priority-${player.id}-${i}`);
                    priorityLabel.title = 'Lower numbers cast first. Use 1 for builders, 2-6 for consumers.';
                    const priorityInput = document.createElement('input');
                    priorityInput.type = 'number';
                    priorityInput.id = `priority-${player.id}-${i}`;
                    priorityInput.placeholder = 'Priority';
                    priorityInput.min = '1';
                    priorityInput.max = '10';
                    priorityInput.value = i + 1;
                    priorityInput.title = 'Lower numbers cast first. Use 1 for builders, 2-6 for consumers.';
                    
                    priorityWrapper.appendChild(priorityLabel);
                    priorityWrapper.appendChild(priorityInput);
                    
                    const minResWrapper = document.createElement('div');
                    minResWrapper.className = 'input-wrapper';
                    const minResLabel = document.createElement('label');
                    minResLabel.textContent = 'Min Res';
                    minResLabel.setAttribute('for', `min-res-${player.id}-${i}`);
                    minResLabel.title = 'Minimum resources needed before this ability can be used.';
                    const minResInput = document.createElement('input');
                    minResInput.type = 'number';
                    minResInput.id = `min-res-${player.id}-${i}`;
                    minResInput.placeholder = 'Min Res';
                    minResInput.min = '0';
                    minResInput.max = '5';
                    minResInput.value = '0';
                    minResInput.title = 'Minimum resources needed before this ability can be used.';
                    
                    minResWrapper.appendChild(minResLabel);
                    minResWrapper.appendChild(minResInput);
                    
                    slot.appendChild(dropdown);
                    slot.appendChild(priorityWrapper);
                    slot.appendChild(minResWrapper);
                    activeContainer.appendChild(slot);
                    console.log('Added slot to active container, total slots:', activeContainer.children.length);
                }
            }
            console.log('Finished populating active abilities for player', player.id);
            
            // Check if containers exist and have content
            setTimeout(() => {
                const activeContainer = document.getElementById(`active-abilities-${player.id}`);
                console.log('Active container after population:', {
                    exists: !!activeContainer,
                    children: activeContainer ? activeContainer.children.length : 0,
                    innerHTML: activeContainer ? activeContainer.innerHTML.substring(0, 200) : 'null'
                });
                
                const dropdowns = activeContainer ? activeContainer.querySelectorAll('.custom-dropdown') : [];
                console.log('Dropdowns found in active container:', dropdowns.length);
                dropdowns.forEach((dd, i) => {
                    console.log(`Dropdown ${i}:`, {
                        id: dd.id,
                        classes: dd.className,
                        trigger: !!dd.querySelector('.custom-dropdown-trigger'),
                        options: !!dd.querySelector('.custom-dropdown-options')
                    });
                });
            }, 100);
            
            // Elite active ability
            const eliteActiveContainer = document.getElementById(`elite-active-${player.id}`);
            if (eliteActiveContainer) {
                eliteActiveContainer.innerHTML = '';
                const dropdown = createCustomDropdown(`elite-active-${player.id}`, activeAbilities);
                
                const priorityWrapper = document.createElement('div');
                priorityWrapper.className = 'input-wrapper';
                const priorityLabel = document.createElement('label');
                priorityLabel.textContent = 'Priority';
                priorityLabel.setAttribute('for', `elite-priority-${player.id}`);
                priorityLabel.title = 'Lower numbers cast first. Elite abilities typically use 7.';
                const priorityInput = document.createElement('input');
                priorityInput.type = 'number';
                priorityInput.id = `elite-priority-${player.id}`;
                priorityInput.placeholder = 'Priority';
                priorityInput.min = '1';
                priorityInput.max = '10';
                priorityInput.value = '7';
                priorityInput.title = 'Lower numbers cast first. Elite abilities typically use 7.';
                
                priorityWrapper.appendChild(priorityLabel);
                priorityWrapper.appendChild(priorityInput);
                
                const minResWrapper = document.createElement('div');
                minResWrapper.className = 'input-wrapper';
                const minResLabel = document.createElement('label');
                minResLabel.textContent = 'Min Res';
                minResLabel.setAttribute('for', `elite-min-res-${player.id}`);
                minResLabel.title = 'Minimum resources needed before this ability can be used.';
                const minResInput = document.createElement('input');
                minResInput.type = 'number';
                minResInput.id = `elite-min-res-${player.id}`;
                minResInput.placeholder = 'Min Res';
                minResInput.min = '0';
                minResInput.max = '5';
                minResInput.value = '0';
                minResInput.title = 'Minimum resources needed before this ability can be used.';
                
                minResWrapper.appendChild(minResLabel);
                minResWrapper.appendChild(minResInput);
                
                eliteActiveContainer.appendChild(dropdown);
                eliteActiveContainer.appendChild(priorityWrapper);
                eliteActiveContainer.appendChild(minResWrapper);
            }
            
            // Active auxiliary ability
            const auxActiveContainer = document.getElementById(`auxiliary-active-${player.id}`);
            if (auxActiveContainer) {
                auxActiveContainer.innerHTML = '';
                // Only get abilities from auxiliary weapons
                const auxiliaryWeaponTypes = ['Whip', 'Flamethrower', 'Quantum', 'Chainsaw', 'Rocket Launcher'];
                const auxiliaryActiveAbilities = activeAbilities.filter(ability => 
                    auxiliaryWeaponTypes.includes(ability.weapon)
                );
                const dropdown = createCustomDropdown(`auxiliary-active-${player.id}`, auxiliaryActiveAbilities);
                
                const priorityWrapper = document.createElement('div');
                priorityWrapper.className = 'input-wrapper';
                const priorityLabel = document.createElement('label');
                priorityLabel.textContent = 'Priority';
                priorityLabel.setAttribute('for', `aux-active-priority-${player.id}`);
                priorityLabel.title = 'Lower numbers cast first. Auxiliary abilities typically use 8.';
                const priorityInput = document.createElement('input');
                priorityInput.type = 'number';
                priorityInput.id = `aux-active-priority-${player.id}`;
                priorityInput.placeholder = 'Priority';
                priorityInput.min = '1';
                priorityInput.max = '10';
                priorityInput.value = '8';
                priorityInput.title = 'Lower numbers cast first. Auxiliary abilities typically use 8.';
                
                priorityWrapper.appendChild(priorityLabel);
                priorityWrapper.appendChild(priorityInput);
                
                const minResWrapper = document.createElement('div');
                minResWrapper.className = 'input-wrapper';
                const minResLabel = document.createElement('label');
                minResLabel.textContent = 'Min Res';
                minResLabel.setAttribute('for', `aux-active-min-res-${player.id}`);
                minResLabel.title = 'Minimum resources needed before this ability can be used.';
                const minResInput = document.createElement('input');
                minResInput.type = 'number';
                minResInput.id = `aux-active-min-res-${player.id}`;
                minResInput.placeholder = 'Min Res';
                minResInput.min = '0';
                minResInput.max = '5';
                minResInput.value = '0';
                minResInput.title = 'Minimum resources needed before this ability can be used.';
                
                minResWrapper.appendChild(minResLabel);
                minResWrapper.appendChild(minResInput);
                
                auxActiveContainer.appendChild(dropdown);
                auxActiveContainer.appendChild(priorityWrapper);
                auxActiveContainer.appendChild(minResWrapper);
            }
            
            // Passive abilities
            const passiveContainer = document.getElementById(`passive-abilities-${player.id}`);
            if (passiveContainer) {
                passiveContainer.innerHTML = '';
                
                // Elite passive
                const elitePassiveGroup = document.createElement('div');
                elitePassiveGroup.className = 'form-group';
                const elitePassiveLabel = document.createElement('label');
                elitePassiveLabel.textContent = 'Elite Passive';
                elitePassiveLabel.setAttribute('for', `elite-passive-${player.id}`);
                const elitePassiveDropdown = createCustomDropdown(`elite-passive-${player.id}`, passiveAbilities);
                elitePassiveGroup.appendChild(elitePassiveLabel);
                elitePassiveGroup.appendChild(elitePassiveDropdown);
                passiveContainer.appendChild(elitePassiveGroup);
                
                // Normal passives (6 slots)
                for (let i = 0; i < MAX_PASSIVE_ABILITIES; i++) {
                    const group = document.createElement('div');
                    group.className = 'form-group';
                    const label = document.createElement('label');
                    label.textContent = `Passive ${i + 1}`;
                    label.setAttribute('for', `normal-passive-${player.id}-${i}`);
                    const dropdown = createCustomDropdown(`normal-passive-${player.id}-${i}`, passiveAbilities);
                    group.appendChild(label);
                    group.appendChild(dropdown);
                    passiveContainer.appendChild(group);
                }
                
                // Auxiliary passive
                const auxPassiveGroup = document.createElement('div');
                auxPassiveGroup.className = 'form-group';
                const auxPassiveLabel = document.createElement('label');
                auxPassiveLabel.textContent = 'Passive Auxiliary';
                auxPassiveLabel.setAttribute('for', `auxiliary-passive-${player.id}`);
                // Only get passives from auxiliary weapons
                const auxiliaryWeaponTypes = ['Whip', 'Flamethrower', 'Quantum', 'Chainsaw', 'Rocket Launcher'];
                const auxiliaryPassiveAbilities = passiveAbilities.filter(ability => 
                    auxiliaryWeaponTypes.includes(ability.weapon)
                );
                const auxPassiveDropdown = createCustomDropdown(`auxiliary-passive-${player.id}`, auxiliaryPassiveAbilities);
                auxPassiveGroup.appendChild(auxPassiveLabel);
                auxPassiveGroup.appendChild(auxPassiveDropdown);
                passiveContainer.appendChild(auxPassiveGroup);
            }
        });
        
        // Add weapon change event listeners
        players.forEach(player => {
            const primarySelect = document.getElementById(`primary-weapon-${player.id}`);
            const secondarySelect = document.getElementById(`secondary-weapon-${player.id}`);
            
            if (primarySelect) {
                primarySelect.addEventListener('change', () => {
                    console.log('Primary weapon changed for player', player.id);
                    populateAbilitySelects();
                    // Re-select current abilities after repopulation
                    const playerData = collectPlayerData(player.id);
                    updatePlayerForm(playerData);
                });
            }
            
            if (secondarySelect) {
                secondarySelect.addEventListener('change', () => {
                    console.log('Secondary weapon changed for player', player.id);
                    populateAbilitySelects();
                    // Re-select current abilities after repopulation
                    const playerData = collectPlayerData(player.id);
                    updatePlayerForm(playerData);
                });
            }
        });
    }
    
    // Render player cards
    function renderPlayers() {
        const container = document.getElementById('players-container');
        container.innerHTML = '';
        
        players.forEach(player => {
            const playerCard = createPlayerCard(player);
            container.appendChild(playerCard);
        });
        
    }
    
    // Debug function to count abilities
    function debugAbilityCounts() {
        const allActives = getAbilitiesByWeapon('All', 'Active');
        const allPassives = getAbilitiesByWeapon('All', 'Passive');
        const weapons = [...new Set(tswData.map(item => item.weapon))];
        const auxWeapons = ['Whip', 'Flamethrower', 'Quantum', 'Chainsaw', 'Rocket Launcher'];
        const auxActives = allActives.filter(a => auxWeapons.includes(a.weapon));
        const auxPassives = allPassives.filter(a => auxWeapons.includes(a.weapon));
        
        console.log('=== DEBUG: Ability Counts ===');
        console.log('Total weapons:', weapons.length);
        console.log('All weapons:', weapons.join(', '));
        console.log('Total active abilities:', allActives.length);
        console.log('Total passive abilities:', allPassives.length);
        console.log('Auxiliary weapons:', auxWeapons.filter(w => weapons.includes(w)).join(', '));
        console.log('Auxiliary actives found:', auxActives.length);
        console.log('Auxiliary passives found:', auxPassives.length);
        console.log('Auxiliary active names:', auxActives.map(a => `${a.name} (${a.weapon})`).join(', '));
        console.log('Auxiliary passive names:', auxPassives.map(a => `${a.name} (${a.weapon})`).join(', '));
        console.log('========================');
    }
    
    // Create custom dropdown with icons and search
    function createCustomDropdown(id, abilities, placeholder = 'None') {
        console.log('Creating dropdown:', id, 'with', abilities.length, 'abilities');
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown';
        dropdown.id = id;
        
        // Create trigger
        const trigger = document.createElement('div');
        trigger.className = 'custom-dropdown-trigger';
        trigger.innerHTML = `
            <div class="selected-content">
                <span>${placeholder}</span>
            </div>
            <div class="dropdown-arrow"></div>
        `;
        
        // Create options container
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-dropdown-options';
        
        // Create search bar
        const searchContainer = document.createElement('div');
        searchContainer.className = 'dropdown-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search abilities...';
        searchContainer.appendChild(searchInput);
        
        // Create options list
        const optionsList = document.createElement('div');
        optionsList.className = 'dropdown-options-list';
        
        // Add None option
        const noneOption = document.createElement('div');
        noneOption.className = 'custom-dropdown-option';
        noneOption.dataset.value = '';
        noneOption.innerHTML = `
            <div class="option-text">${placeholder}</div>
        `;
        optionsList.appendChild(noneOption);
        
        // Add ability options
        abilities.forEach(ability => {
            const option = document.createElement('div');
            option.className = 'custom-dropdown-option';
            option.dataset.value = ability.name;
            option.dataset.searchText = ability.name.toLowerCase();
            
            const iconPath = ability.icon ? `../ability_icons/${ability.weapon}/${ability.icon}` : '../ability_icons/Misc/empty.png';
            
            option.innerHTML = `
                <img class="option-icon" src="${iconPath}" alt="${ability.name}" onerror="this.style.display='none'">
                <div class="option-text">${ability.name}</div>
            `;
            
            optionsList.appendChild(option);
        });
        
        // Add no results message
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No abilities found';
        noResults.style.display = 'none';
        optionsList.appendChild(noResults);
        
        optionsContainer.appendChild(searchContainer);
        optionsContainer.appendChild(optionsList);
        dropdown.appendChild(trigger);
        dropdown.appendChild(optionsContainer);
        
        // Search functionality
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const options = optionsList.querySelectorAll('.custom-dropdown-option:not(.no-results)');
            let visibleCount = 0;
            
            options.forEach(option => {
                const searchText = option.dataset.searchText || option.querySelector('.option-text').textContent.toLowerCase();
                if (searchText.includes(searchTerm)) {
                    option.classList.remove('hidden');
                    visibleCount++;
                } else {
                    option.classList.add('hidden');
                }
            });
            
            // Show/hide no results message
            if (visibleCount === 0 && searchTerm !== '') {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        });
        
        // Clear search when dropdown opens
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            // Close other dropdowns
            document.querySelectorAll('.custom-dropdown.open').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
            
            // Focus search input and clear it
            if (dropdown.classList.contains('open')) {
                setTimeout(() => {
                    searchInput.value = '';
                    searchInput.focus();
                    // Reset all options to visible
                    optionsList.querySelectorAll('.custom-dropdown-option').forEach(option => {
                        option.classList.remove('hidden');
                    });
                    noResults.style.display = 'none';
                }, 100);
            }
        });
        
        // Handle option selection
        optionsList.addEventListener('click', function(e) {
            e.stopPropagation();
            const option = e.target.closest('.custom-dropdown-option');
            if (option && !option.classList.contains('no-results')) {
                const value = option.dataset.value;
                const text = option.querySelector('.option-text').textContent;
                const icon = option.querySelector('.option-icon');
                
                // Update trigger
                const selectedContent = trigger.querySelector('.selected-content');
                if (value && icon && icon.src && !icon.src.includes('empty.png')) {
                    selectedContent.innerHTML = `
                        <img class="selected-icon" src="${icon.src}" alt="${text}" onerror="this.style.display='none'">
                        <span>${text}</span>
                    `;
                } else {
                    selectedContent.innerHTML = `<span>${placeholder}</span>`;
                }
                
                // Update selected state
                optionsList.querySelectorAll('.custom-dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                // Clear search and close dropdown
                searchInput.value = '';
                dropdown.classList.remove('open');
                
                // Reset all options to visible
                optionsList.querySelectorAll('.custom-dropdown-option').forEach(option => {
                    option.classList.remove('hidden');
                });
                noResults.style.display = 'none';
                
                // Trigger change event
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
                // Clear search when closing
                searchInput.value = '';
                // Reset all options to visible
                optionsList.querySelectorAll('.custom-dropdown-option').forEach(option => {
                    option.classList.remove('hidden');
                });
                noResults.style.display = 'none';
            }
        });
        
        // Handle keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                searchInput.value = '';
                optionsList.querySelectorAll('.custom-dropdown-option').forEach(option => {
                    option.classList.remove('hidden');
                });
                noResults.style.display = 'none';
            }
        });
        
        return dropdown;
    }
    
    // Get dropdown value
    function getDropdownValue(dropdown) {
        const selectedOption = dropdown.querySelector('.custom-dropdown-option.selected');
        return selectedOption ? selectedOption.dataset.value : '';
    }
    
    // Set dropdown value
    function setDropdownValue(dropdown, value) {
        const options = dropdown.querySelectorAll('.custom-dropdown-option');
        const trigger = dropdown.querySelector('.custom-dropdown-trigger');
        const selectedContent = trigger.querySelector('.selected-content');
        
        options.forEach(option => {
            if (option.dataset.value === value) {
                option.classList.add('selected');
                const text = option.querySelector('.option-text').textContent;
                const icon = option.querySelector('.option-icon');
                
                if (value && icon && icon.src && !icon.src.includes('empty.png')) {
                    selectedContent.innerHTML = `
                        <img class="selected-icon" src="${icon.src}" alt="${text}" onerror="this.style.display='none'">
                        <span>${text}</span>
                    `;
                } else {
                    selectedContent.innerHTML = `<span>None</span>`;
                }
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // Setup icon display for custom dropdowns
    function setupAbilityIcons() {
        document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', function() {
                // Update player's ability icon display
                const playerId = this.id.match(/player-(\d+)/)?.[1];
                if (playerId) {
                    updatePlayerAbilityIcons(parseInt(playerId));
                }
            });
        });
    }
    
    // Update player ability icons display
    function updatePlayerAbilityIcons(playerId) {
        const iconsContainer = document.getElementById(`player-ability-icons-${playerId}`);
        if (!iconsContainer) return;
        
        const player = players.find(p => p.id === playerId);
        if (!player) return;
        
        // Collect all selected abilities
        const selectedAbilities = [];
        
        // Active abilities
        player.abilities.active.forEach(ability => {
            const abilityData = tswData.find(item => item.name === ability.name);
            if (abilityData && abilityData.icon) {
                selectedAbilities.push({
                    icon: `../ability_icons/${abilityData.weapon}/${abilityData.icon}`,
                    name: ability.name,
                    type: 'active'
                });
            }
        });
        
        // Elite active
        if (player.abilities.eliteActive) {
            const abilityData = tswData.find(item => item.name === player.abilities.eliteActive.name);
            if (abilityData && abilityData.icon) {
                selectedAbilities.push({
                    icon: `../ability_icons/${abilityData.weapon}/${abilityData.icon}`,
                    name: abilityData.name,
                    type: 'elite-active'
                });
            }
        }
        
        // Active auxiliary
        if (player.abilities.auxiliaryActive) {
            const abilityData = tswData.find(item => item.name === player.abilities.auxiliaryActive.name);
            if (abilityData && abilityData.icon) {
                selectedAbilities.push({
                    icon: `../ability_icons/${abilityData.weapon}/${abilityData.icon}`,
                    name: abilityData.name,
                    type: 'auxiliary-active'
                });
            }
        }
        
        // Elite passive
        if (player.abilities.elitePassive) {
            const abilityData = tswData.find(item => item.name === player.abilities.elitePassive);
            if (abilityData && abilityData.icon) {
                selectedAbilities.push({
                    icon: `../ability_icons/${abilityData.weapon}/${abilityData.icon}`,
                    name: abilityData.name,
                    type: 'elite-passive'
                });
            }
        }
        
        // Normal passives (show first 3 to avoid overcrowding)
        player.abilities.normalPassives.slice(0, 3).forEach(passiveName => {
            const abilityData = tswData.find(item => item.name === passiveName);
            if (abilityData && abilityData.icon) {
                selectedAbilities.push({
                    icon: `../ability_icons/${abilityData.weapon}/${abilityData.icon}`,
                    name: abilityData.name,
                    type: 'passive'
                });
            }
        });
        
        // Auxiliary passive
        if (player.abilities.auxiliaryPassive) {
            const abilityData = tswData.find(item => item.name === player.abilities.auxiliaryPassive);
            if (abilityData && abilityData.icon) {
                selectedAbilities.push({
                    icon: `../ability_icons/${abilityData.weapon}/${abilityData.icon}`,
                    name: abilityData.name,
                    type: 'auxiliary-passive'
                });
            }
        }
        
        // Clear existing icons
        iconsContainer.innerHTML = '';
        
        // Add ability icons
        selectedAbilities.forEach(ability => {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = `ability-icon-wrapper ability-type-${ability.type}`;
            iconWrapper.title = ability.name;
            
            const icon = document.createElement('img');
            icon.src = ability.icon;
            icon.alt = ability.name;
            icon.className = 'player-ability-icon';
            icon.onerror = function() {
                this.style.display = 'none'; // Hide broken images
            };
            
            iconWrapper.appendChild(icon);
            iconsContainer.appendChild(iconWrapper);
        });
        
        // Add count if there are many abilities
        if (selectedAbilities.length > 8) {
            const moreIndicator = document.createElement('div');
            moreIndicator.className = 'more-abilities-indicator';
            moreIndicator.textContent = `+${selectedAbilities.length - 8}`;
            iconsContainer.appendChild(moreIndicator);
        }
    }
    
    // Create player card HTML
    function createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.id = `player-card-${player.id}`;
        
        card.innerHTML = `
            <div class="player-header">
                <div class="player-info">
                    <h3 class="player-title">Player ${player.id}</h3>
                    <input type="text" class="player-name" id="player-name-${player.id}" 
                           value="${player.name}" placeholder="Enter name...">
                </div>
                <div class="player-ability-icons" id="player-ability-icons-${player.id}">
                    <!-- Ability icons will be displayed here -->
                </div>
            </div>
            
            <div class="player-stats">
                <div class="form-group">
                    <label for="attack-rating-${player.id}">Attack Rating</label>
                    <input type="number" id="attack-rating-${player.id}" value="${player.stats.attackRating}" min="0">
                </div>
                <div class="form-group">
                    <label for="weapon-power-${player.id}">Weapon Power</label>
                    <input type="number" id="weapon-power-${player.id}" value="${player.stats.weaponPower}" min="0">
                </div>
                <div class="form-group">
                    <label for="hit-rating-${player.id}">Hit Rating</label>
                    <input type="number" id="hit-rating-${player.id}" value="${player.stats.hitRating}" min="0">
                </div>
                <div class="form-group">
                    <label for="crit-chance-${player.id}">Crit Chance (%)</label>
                    <input type="number" id="crit-chance-${player.id}" value="${player.stats.critChance}" min="0" max="100">
                </div>
                <div class="form-group">
                    <label for="crit-power-${player.id}">Crit Power (%)</label>
                    <input type="number" id="crit-power-${player.id}" value="${player.stats.critPower}" min="25">
                </div>
                <div class="form-group">
                    <label for="pen-chance-${player.id}">Pen Chance (%)</label>
                    <input type="number" id="pen-chance-${player.id}" value="${player.stats.penChance}" min="0" max="100">
                </div>
            </div>
            
            <div class="weapon-selects">
                <div class="form-group">
                    <label for="primary-weapon-${player.id}">Primary</label>
                    <select id="primary-weapon-${player.id}">
                        <option value="All">All Weapons</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="secondary-weapon-${player.id}">Secondary</label>
                    <select id="secondary-weapon-${player.id}">
                        <option value="None">None</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="auxiliary-weapon-${player.id}">Auxiliary</label>
                    <select id="auxiliary-weapon-${player.id}">
                        <option value="None">None</option>
                    </select>
                </div>
            </div>
            
            <div class="abilities-section">
                <h4>Active Abilities</h4>
                <div class="ability-slots" id="active-abilities-${player.id}">
                    <!-- Custom dropdowns will be populated here -->
                </div>
            </div>
            
            <div class="abilities-section">
                <h4>Elite Active</h4>
                <div class="ability-slot" id="elite-active-${player.id}">
                    <!-- Custom dropdown will be populated here -->
                </div>
            </div>
            
            <div class="abilities-section">
                <h4>Active Auxiliary</h4>
                <div class="ability-slot" id="auxiliary-active-${player.id}">
                    <!-- Custom dropdown will be populated here -->
                </div>
            </div>
            
            <div class="abilities-section">
                <h4>Passive Abilities</h4>
                <div class="passive-slots" id="passive-abilities-${player.id}">
                    <!-- Custom dropdowns will be populated here -->
                </div>
            </div>
            
            <div class="player-dps">
                <div class="dps-value" id="player-dps-${player.id}">0</div>
                <div class="dps-label">DPS</div>
            </div>
        `;
        
        return card;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Calculate group DPS button
        document.getElementById('calculate-group-btn').addEventListener('click', calculateGroupDPS);
        
        // Clear all button
        document.getElementById('clear-all-btn').addEventListener('click', clearAllPlayers);
        
        // Export group button
        document.getElementById('export-group-btn').addEventListener('click', exportGroup);
        
        // Import group button
        document.getElementById('import-group-btn').addEventListener('click', importGroup);
        
        // Enemy selection
        document.getElementById('target-enemy').addEventListener('change', updateEnemyDisplay);
        
        // Initialize enemy display
        updateEnemyDisplay();
    }
    
    // Update enemy stats display
    function updateEnemyDisplay() {
        const enemySelect = document.getElementById('target-enemy');
        const enemy = ENEMIES[enemySelect.value];
        const display = document.getElementById('enemy-stats-display');
        
        if (enemy) {
            display.textContent = `Block: ${enemy.block} | Evade: ${enemy.evade} | Defense: ${enemy.defense}`;
        }
    }
    
    // Collect player data from form
    function collectPlayerData(playerId) {
        const player = players.find(p => p.id === playerId);
        if (!player) return null;
        
        // Update name
        const nameInput = document.getElementById(`player-name-${playerId}`);
        if (nameInput) player.name = nameInput.value || `Player ${playerId}`;
        
        // Update stats
        player.stats.attackRating = parseInt(document.getElementById(`attack-rating-${playerId}`).value) || 0;
        player.stats.weaponPower = parseInt(document.getElementById(`weapon-power-${playerId}`).value) || 528;
        player.stats.hitRating = parseInt(document.getElementById(`hit-rating-${playerId}`).value) || 0;
        player.stats.critChance = parseFloat(document.getElementById(`crit-chance-${playerId}`).value) || 10;
        player.stats.critPower = parseFloat(document.getElementById(`crit-power-${playerId}`).value) || 25;
        player.stats.penChance = parseFloat(document.getElementById(`pen-chance-${playerId}`).value) || 0;
        player.stats.combatPower = player.stats.attackRating + player.stats.weaponPower;
        
        // Update weapons
        player.weapons.primary = document.getElementById(`primary-weapon-${playerId}`).value || 'All';
        player.weapons.secondary = document.getElementById(`secondary-weapon-${playerId}`).value || 'None';
        player.weapons.auxiliary = document.getElementById(`auxiliary-weapon-${playerId}`).value || 'None';
        
        // Update abilities
        player.abilities.active = [];
        for (let i = 0; i < MAX_ACTIVE_ABILITIES; i++) {
            const abilityDropdown = document.getElementById(`active-ability-${playerId}-${i}`);
            const priorityInput = document.getElementById(`priority-${playerId}-${i}`);
            const minResInput = document.getElementById(`min-res-${playerId}-${i}`);
            
            if (abilityDropdown) {
                const abilityValue = getDropdownValue(abilityDropdown);
                if (abilityValue) {
                    player.abilities.active.push({
                        name: abilityValue,
                        priority: parseInt(priorityInput.value) || (i + 1),
                        minResources: parseInt(minResInput.value) || 0
                    });
                }
            }
        }
        
        // Elite active ability
        const eliteActiveDropdown = document.getElementById(`elite-active-${playerId}`);
        if (eliteActiveDropdown) {
            const eliteValue = getDropdownValue(eliteActiveDropdown);
            if (eliteValue) {
                player.abilities.eliteActive = {
                    name: eliteValue,
                    priority: parseInt(document.getElementById(`elite-priority-${playerId}`).value) || 7,
                    minResources: parseInt(document.getElementById(`elite-min-res-${playerId}`).value) || 0
                };
            } else {
                player.abilities.eliteActive = null;
            }
        }
        
        // Active auxiliary ability
        const auxActiveDropdown = document.getElementById(`auxiliary-active-${playerId}`);
        if (auxActiveDropdown) {
            const auxValue = getDropdownValue(auxActiveDropdown);
            if (auxValue) {
                player.abilities.auxiliaryActive = {
                    name: auxValue,
                    priority: parseInt(document.getElementById(`aux-active-priority-${playerId}`).value) || 8,
                    minResources: parseInt(document.getElementById(`aux-active-min-res-${playerId}`).value) || 0
                };
            } else {
                player.abilities.auxiliaryActive = null;
            }
        }
        
        // Elite passive
        const elitePassiveDropdown = document.getElementById(`elite-passive-${playerId}`);
        if (elitePassiveDropdown) {
            const eliteValue = getDropdownValue(elitePassiveDropdown);
            player.abilities.elitePassive = eliteValue || null;
        }
        
        // Normal passives
        player.abilities.normalPassives = [];
        for (let i = 0; i < MAX_PASSIVE_ABILITIES; i++) {
            const passiveDropdown = document.getElementById(`normal-passive-${playerId}-${i}`);
            if (passiveDropdown) {
                const passiveValue = getDropdownValue(passiveDropdown);
                if (passiveValue) {
                    player.abilities.normalPassives.push(passiveValue);
                }
            }
        }
        
        // Auxiliary passive
        const auxPassiveDropdown = document.getElementById(`auxiliary-passive-${playerId}`);
        if (auxPassiveDropdown) {
            const auxValue = getDropdownValue(auxPassiveDropdown);
            player.abilities.auxiliaryPassive = auxValue || null;
        }
        
        // Update ability icons display
        updatePlayerAbilityIcons(playerId);
        
        return player;
    }
    
    // Calculate CP (Combat Power) using same formula as single player mode
    function calculateCP(attackRating, weaponPower) {
        if (attackRating < 5200) {
            return Math.round((375 - (600 / (Math.pow(Math.E, (attackRating / 1400)) + 1))) * (1 + (weaponPower / 375)));
        } else {
            const c = (0.00008 * weaponPower) + 0.0301;
            return Math.round(204.38 + (0.5471 * weaponPower) + (c * attackRating));
        }
    }
    
    // Calculate ability damage using same scaling logic as single player mode
    function calculateAbilityDamage(ability, player, effectiveResources = 0) {
        if (!ability || !ability.scaling) return 0;
        
        const cp = calculateCP(player.stats.attackRating, player.stats.weaponPower);
        const desc = ability.description || '';
        
        // Enhanced scaling selection with RDB data (same as single player mode)
        let scalingToUse = ability.scaling || 0;
        
        // Refined resource scaling detection
        const consumesAllResources = /consumes all.*resources?/i.test(desc.replace(/\s+/g, ' '));
        const mentionsScaling = (/based on the number of resources consumed/i.test(desc) ||
                               /Damage scales based on the number of resources consumed/i.test(desc));
        const hasVariableScaling = ability.scaling_1 > 0 && ability.scaling_5 > 0 && ability.scaling_1 !== ability.scaling_5;
        const hasDamageRange = /\d+\s*-\s*\d+/.test(desc);
        
        const canScaleWithResources = consumesAllResources && hasVariableScaling && (mentionsScaling || hasDamageRange);
        
        // Check for enhanced resource scaling data
        if (ability.scaling_5 > 0 && ability.scaling_1 > 0 && canScaleWithResources) {
            const resourceKey = `scaling_${effectiveResources}`;
            if (ability[resourceKey] !== undefined) {
                scalingToUse = ability[resourceKey];
            } else {
                scalingToUse = ability.scaling_1 + ((effectiveResources - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
            }
        } else if (ability.scaling_5 > 0 && effectiveResources === 5 && canScaleWithResources) {
            scalingToUse = ability.scaling_5;
        }
        
        const baseDamage = scalingToUse * cp;
        
        // Apply critical and penetration multipliers
        const critMultiplier = 1 + ((player.stats.critChance / 100) * (player.stats.critPower / 100));
        const penMultiplier = 1 + (player.stats.penChance / 100) * 0.5; // Penetration does 50% more damage
        
        const avgDamagePerHit = baseDamage * critMultiplier * penMultiplier;
        
        // Calculate average damage per second considering cooldown
        const cooldown = ability.cooldown || 1;
        const castTime = ability.cast_time || 1;
        const avgDamagePerSecond = avgDamagePerHit / Math.max(cooldown, castTime);
        
        return avgDamagePerSecond;
    }
    
    // Calculate DPS for a single player using same logic as single player mode
    function calculatePlayerDPS(player) {
        let totalDPS = 0;
        
        // Calculate damage from active abilities
        player.abilities.active.forEach(ability => {
            const abilityData = tswData.find(item => item.name === ability.name);
            if (abilityData) {
                const damage = calculateAbilityDamage(abilityData, player, ability.minResources || 0);
                totalDPS += damage;
            }
        });
        
        // Add elite active ability damage
        if (player.abilities.eliteActive) {
            const abilityData = tswData.find(item => item.name === player.abilities.eliteActive.name);
            if (abilityData) {
                const damage = calculateAbilityDamage(abilityData, player, player.abilities.eliteActive.minResources || 0);
                totalDPS += damage;
            }
        }
        
        // Add active auxiliary ability damage
        if (player.abilities.auxiliaryActive) {
            const abilityData = tswData.find(item => item.name === player.abilities.auxiliaryActive.name);
            if (abilityData) {
                const damage = calculateAbilityDamage(abilityData, player, player.abilities.auxiliaryActive.minResources || 0);
                totalDPS += damage;
            }
        }
        
        // Add passive damage bonuses (simplified calculation)
        player.abilities.normalPassives.forEach(passiveName => {
            const passiveData = tswData.find(item => item.name === passiveName);
            if (passiveData && passiveData.description) {
                const bonusMatch = passiveData.description.match(
                    /increases.*damage.*by\s+(\d+(?:\.\d+)?)%|damage.*by\s+(\d+(?:\.\d+)?)%|damage.*dealt.*by\s+(\d+(?:\.\d+)?)%/i
                );
                if (bonusMatch) {
                    const bonusPercent = parseFloat(bonusMatch[1] || bonusMatch[2] || bonusMatch[3]) || 0;
                    totalDPS *= (1 + bonusPercent / 100);
                }
            }
        });
        
        // Add elite passive damage bonuses
        if (player.abilities.elitePassive) {
            const passiveData = tswData.find(item => item.name === player.abilities.elitePassive);
            if (passiveData && passiveData.description) {
                const bonusMatch = passiveData.description.match(
                    /increases.*damage.*by\s+(\d+(?:\.\d+)?)%|damage.*by\s+(\d+(?:\.\d+)?)%|damage.*dealt.*by\s+(\d+(?:\.\d+)?)%/i
                );
                if (bonusMatch) {
                    const bonusPercent = parseFloat(bonusMatch[1] || bonusMatch[2] || bonusMatch[3]) || 0;
                    totalDPS *= (1 + bonusPercent / 100);
                }
            }
        }
        
        return Math.round(totalDPS);
    }
    
    // Calculate group DPS
    function calculateGroupDPS() {
        let totalGroupDPS = 0;
        const playerResults = [];
        
        for (let i = 1; i <= GROUP_SIZE; i++) {
            const player = collectPlayerData(i);
            if (player) {
                player.dps = calculatePlayerDPS(player);
                totalGroupDPS += player.dps;
                playerResults.push(player);
                
                // Update individual player DPS display
                const dpsDisplay = document.getElementById(`player-dps-${i}`);
                if (dpsDisplay) {
                    dpsDisplay.textContent = player.dps.toLocaleString();
                }
            }
        }
        
        // Update group results
        updateGroupResults(totalGroupDPS, playerResults);
    }
    
    // Update group results display
    function updateGroupResults(totalDPS, playerResults) {
        document.getElementById('group-total-dps').textContent = totalDPS.toLocaleString();
        
        const averageDPS = playerResults.length > 0 ? Math.round(totalDPS / playerResults.length) : 0;
        document.getElementById('average-dps').textContent = averageDPS.toLocaleString();
        
        // Update player breakdown
        const breakdownContainer = document.getElementById('player-breakdown');
        breakdownContainer.innerHTML = '';
        
        playerResults.forEach(player => {
            const resultCard = document.createElement('div');
            resultCard.className = 'player-result-card';
            resultCard.innerHTML = `
                <div class="player-result-name">${player.name}</div>
                <div class="player-result-dps">${player.dps.toLocaleString()} DPS</div>
            `;
            breakdownContainer.appendChild(resultCard);
        });
    }
    
    // Clear all players
    function clearAllPlayers() {
        if (confirm('Are you sure you want to clear all player data?')) {
            initializePlayers();
            renderPlayers();
            
            // Clear results
            document.getElementById('group-total-dps').textContent = '0';
            document.getElementById('average-dps').textContent = '0';
            document.getElementById('player-breakdown').innerHTML = '';
        }
    }
    
    // Export group configuration
    function exportGroup() {
        const groupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            settings: {
                simulationTime: document.getElementById('simulation-time').value,
                targetEnemy: document.getElementById('target-enemy').value
            },
            players: []
        };
        
        for (let i = 1; i <= GROUP_SIZE; i++) {
            const player = collectPlayerData(i);
            if (player && (player.abilities.active.length > 0 || player.abilities.normalPassives.length > 0)) {
                groupData.players.push({
                    name: player.name,
                    stats: player.stats,
                    weapons: player.weapons,
                    abilities: player.abilities
                });
            }
        }
        
        const exportText = JSON.stringify(groupData, null, 2);
        
        // Copy to clipboard
        navigator.clipboard.writeText(exportText).then(() => {
            alert('Group build copied to clipboard!');
        }).catch(() => {
            // Fallback: show in textarea
            const textarea = document.createElement('textarea');
            textarea.value = exportText;
            textarea.style.position = 'fixed';
            textarea.style.top = '50%';
            textarea.style.left = '50%';
            textarea.style.transform = 'translate(-50%, -50%)';
            textarea.style.width = '80%';
            textarea.style.height = '200px';
            textarea.style.zIndex = '10000';
            document.body.appendChild(textarea);
            textarea.select();
            
            setTimeout(() => {
                document.body.removeChild(textarea);
                alert('Group build data displayed. Please copy manually.');
            }, 100);
        });
    }
    
    // Import group configuration
    function importGroup() {
        const importTextarea = document.getElementById('import-group-textarea');
        const importText = importTextarea.value.trim();
        
        if (!importText) {
            alert('Please paste group build data in the textarea.');
            return;
        }
        
        try {
            const groupData = JSON.parse(importText);
            
            // Validate data structure
            if (!groupData.players || !Array.isArray(groupData.players)) {
                throw new Error('Invalid group data format.');
            }
            
            // Clear existing data
            initializePlayers();
            
            // Import settings
            if (groupData.settings) {
                if (groupData.settings.simulationTime) {
                    document.getElementById('simulation-time').value = groupData.settings.simulationTime;
                }
                if (groupData.settings.targetEnemy) {
                    document.getElementById('target-enemy').value = groupData.settings.targetEnemy;
                    updateEnemyDisplay();
                }
            }
            
            // Import player data
            groupData.players.forEach((importedPlayer, index) => {
                if (index < GROUP_SIZE) {
                    const player = players[index];
                    
                    // Update player data
                    Object.assign(player, importedPlayer);
                    
                    // Update form fields
                    setTimeout(() => {
                        updatePlayerForm(player);
                    }, 100);
                }
            });
            
            // Re-render players
            renderPlayers();
            
            // Clear import textarea
            importTextarea.value = '';
            
            alert('Group build imported successfully!');
            
        } catch (error) {
            alert('Error importing group build: ' + error.message);
        }
    }
    
    // Update player form with data
    function updatePlayerForm(player) {
        // Update name
        const nameInput = document.getElementById(`player-name-${player.id}`);
        if (nameInput) nameInput.value = player.name;
        
        // Update stats
        document.getElementById(`attack-rating-${player.id}`).value = player.stats.attackRating;
        document.getElementById(`weapon-power-${player.id}`).value = player.stats.weaponPower;
        document.getElementById(`hit-rating-${player.id}`).value = player.stats.hitRating;
        document.getElementById(`crit-chance-${player.id}`).value = player.stats.critChance;
        document.getElementById(`crit-power-${player.id}`).value = player.stats.critPower;
        document.getElementById(`pen-chance-${player.id}`).value = player.stats.penChance;
        
        // Update weapons
        document.getElementById(`primary-weapon-${player.id}`).value = player.weapons.primary;
        document.getElementById(`secondary-weapon-${player.id}`).value = player.weapons.secondary;
        document.getElementById(`auxiliary-weapon-${player.id}`).value = player.weapons.auxiliary;
        
        // Update abilities
        player.abilities.active.forEach((ability, index) => {
            if (index < MAX_ACTIVE_ABILITIES) {
                const dropdown = document.getElementById(`active-ability-${player.id}-${index}`);
                if (dropdown) {
                    setDropdownValue(dropdown, ability.name);
                }
                document.getElementById(`priority-${player.id}-${index}`).value = ability.priority;
                document.getElementById(`min-res-${player.id}-${index}`).value = ability.minResources;
            }
        });
        
        // Elite active ability
        if (player.abilities.eliteActive) {
            const dropdown = document.getElementById(`elite-active-${player.id}`);
            if (dropdown) {
                setDropdownValue(dropdown, player.abilities.eliteActive.name);
            }
            document.getElementById(`elite-priority-${player.id}`).value = player.abilities.eliteActive.priority;
            document.getElementById(`elite-min-res-${player.id}`).value = player.abilities.eliteActive.minResources;
        }
        
        // Active auxiliary ability
        if (player.abilities.auxiliaryActive) {
            const dropdown = document.getElementById(`auxiliary-active-${player.id}`);
            if (dropdown) {
                setDropdownValue(dropdown, player.abilities.auxiliaryActive.name);
            }
            document.getElementById(`aux-active-priority-${player.id}`).value = player.abilities.auxiliaryActive.priority;
            document.getElementById(`aux-active-min-res-${player.id}`).value = player.abilities.auxiliaryActive.minResources;
        }
        
        // Elite passive
        if (player.abilities.elitePassive) {
            const dropdown = document.getElementById(`elite-passive-${player.id}`);
            if (dropdown) {
                setDropdownValue(dropdown, player.abilities.elitePassive);
            }
        }
        
        // Normal passives
        player.abilities.normalPassives.forEach((passive, index) => {
            if (index < MAX_PASSIVE_ABILITIES) {
                const dropdown = document.getElementById(`normal-passive-${player.id}-${index}`);
                if (dropdown) {
                    setDropdownValue(dropdown, passive);
                }
            }
        });
        
        // Auxiliary passive
        if (player.abilities.auxiliaryPassive) {
            const dropdown = document.getElementById(`auxiliary-passive-${player.id}`);
            if (dropdown) {
                setDropdownValue(dropdown, player.abilities.auxiliaryPassive);
            }
        }
    }
    
    // Initialize the application
    init();
});
