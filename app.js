document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const cpInput = document.getElementById('combat-power');
    const critChanceInput = document.getElementById('crit-chance');
    const critPowerInput = document.getElementById('crit-power');
    const penChanceInput = document.getElementById('pen-chance');

    const weaponSelect = document.getElementById('weapon-type');
    const secondaryWeaponSelect = document.getElementById('secondary-weapon-type');
    const abilitySelect = document.getElementById('ability-select');
    const resourcesInput = document.getElementById('resources-used');

    const resName = document.getElementById('res-ability-name');
    const resBase = document.getElementById('res-base-dmg');
    const resAvg = document.getElementById('res-avg-dmg');
    const resDps = document.getElementById('res-dps');
    const resCast = document.getElementById('res-cast');
    const resCd = document.getElementById('res-cd');
    const resDesc = document.getElementById('res-desc');

    // Data - check if loaded
    if (typeof tswData === 'undefined') {
        resName.textContent = "Error: Data failed to load";
        return;
    }

    // Populate Weapons
    const weapons = new Set(tswData.map(a => a.tree));
    const sortedWeapons = Array.from(weapons).sort();

    sortedWeapons.forEach(w => {
        const option1 = document.createElement('option');
        option1.value = w;
        option1.textContent = w;
        weaponSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = w;
        option2.textContent = w;
        secondaryWeaponSelect.appendChild(option2);
    });

    // Populate Abilities based on Weapon
    function updateAbilityDropdown() {
        const selectedPrimary = weaponSelect.value;
        const selectedSecondary = secondaryWeaponSelect.value;

        abilitySelect.innerHTML = '<option value="">-- Choose an ability --</option>';

        let filtered = tswData;
        if (selectedPrimary !== 'All') {
            filtered = tswData.filter(a => {
                return a.tree === selectedPrimary || a.tree === selectedSecondary;
            });
        }

        // Sort alphabetically
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        filtered.forEach((a, index) => {
            const option = document.createElement('option');
            // use index in the main array as value to easily fetch later
            const originalIndex = tswData.indexOf(a);
            option.value = originalIndex;
            option.textContent = a.name;
            abilitySelect.appendChild(option);
        });

        calculate();
    }

    function calculate() {
        const abilityIdx = abilitySelect.value;
        if (!abilityIdx) {
            resName.textContent = "No Ability Selected";
            resBase.textContent = "0";
            resAvg.textContent = "0";
            resDps.textContent = "0";
            resCast.textContent = "0";
            resCd.textContent = "0";
            resDesc.textContent = "";
            return;
        }

        const ability = tswData[abilityIdx];

        // Stats
        const cp = parseFloat(cpInput.value) || 0;
        const critChance = parseFloat(critChanceInput.value) || 0;
        const critPower = parseFloat(critPowerInput.value) || 0;
        const penChance = parseFloat(penChanceInput.value) || 0;
        const resources = parseInt(resourcesInput.value) || 5;

        // Base Calc with Resource Scaling
        let scalingToUse = ability.scaling || 0;

        // If the ability has linear scaling from 1 to 5 resources
        if (ability.scaling_5 > 0 && ability.scaling_1 > 0) {
            scalingToUse = ability.scaling_1 + ((resources - 1) / 4) * (ability.scaling_5 - ability.scaling_1);
        } else if (ability.scaling_5 > 0 && resources === 5) {
            // Some abilities only get a bonus specifically at 5 resources (e.g. Buckshot) 
            scalingToUse = ability.scaling_5;
        }

        const baseDamage = scalingToUse * cp;

        // Averages (Crit mapping)
        // Avg Dmg = Base * (1 + (Crit Chance / 100) * (Crit Power / 100))
        // Assuming pen adds ~50% damage flat when it hits in standard setups or bypasses mitigation.
        // We will add a simplistic 15% bonus per pen as a generic stand-in, as exact TSW mitigation math depends on target.
        const critMultiplier = 1 + ((critChance / 100) * (critPower / 100));
        const penMultiplier = 1 + ((penChance / 100) * 0.15); // estimation for standard target

        const avgDamage = baseDamage * critMultiplier * penMultiplier;

        // DPS
        // Total time to execute = Cast time + Cooldown
        // If it's a spammable builder, CD is 0.
        const castTime = ability.cast_time || 1.0; // Assume 1s global cooldown if not listed
        const cooldown = ability.cooldown || 0;
        const totalTime = Math.max(castTime, 1.0) + cooldown; // taking 1s global cooldown floor

        const dps = avgDamage / totalTime;

        // Render UI
        resName.textContent = ability.name;
        resBase.textContent = Math.round(baseDamage).toLocaleString();
        resAvg.textContent = Math.round(avgDamage).toLocaleString();
        resDps.textContent = Math.round(dps).toLocaleString();

        resCast.textContent = ability.cast_time || "N/A";
        resCd.textContent = ability.cooldown || "0";
        resDesc.textContent = ability.description || ability.note || "No description available.";
    }

    // Event Listeners
    weaponSelect.addEventListener('change', updateAbilityDropdown);
    secondaryWeaponSelect.addEventListener('change', updateAbilityDropdown);
    abilitySelect.addEventListener('change', calculate);
    resourcesInput.addEventListener('input', calculate);

    [cpInput, critChanceInput, critPowerInput, penChanceInput].forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Init
    updateAbilityDropdown();
});
