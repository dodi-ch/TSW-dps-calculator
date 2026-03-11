# Search Results: Ability Filtering & Deduplication Analysis

## Summary
Found one major deduplication/tracking issue that would cause abilities appearing multiple times to lose damage tracking.

---

## Issues Found

### 1. **CRITICAL: statsBreakdown Object Deduplication Issue**
**Location**: [app.js](app.js#L751-L755)  
**Lines**: 751-755

```javascript
const statsBreakdown = {};
[...allActives, ...allPassives].forEach(a => {
    statsBreakdown[a.name] = { damage: 0, casts: 0 };
});
```

**Problem**: This creates an object keyed by ability name. If the same ability is selected in multiple slots:
- Example: If "Molten Steel" is selected in slot 1 AND slot 3
- `allActives` array will contain TWO separate Molten Steel entries (at index 0 and 2)
- But `statsBreakdown` will only have ONE entry: `statsBreakdown['Molten Steel']`
- Both instances will write to the same breakdown entry, creating confusion in tracking

**Impact on Molten Steel**: If a player selects Molten Steel multiple times, only ONE entry will appear in the damage breakdown, but it will accumulate damage/casts from all instances.

---

### 2. **No Filtering to Prevent Duplicate Ability Selection**
**Location**: [app.js](app.js#L447-L475) (populateDropdowns function)

```javascript
function populateDropdowns(selectElements, filterFn, emptyLabel = "-- None --") {
    const baseData = tswData.filter(filterFn).sort((a, b) => a.name.localeCompare(b.name));
    
    selectElements.forEach(select => {
        // ... filtering by search term ...
        const filteredData = searchTerm
            ? baseData.filter(a => a.name.toLowerCase().includes(searchTerm))
            : baseData;
        // ... creates options for all filtered abilities ...
    });
}
```

**Finding**: There is NO logic that:
- Prevents the same ability from being selected multiple times
- Checks if an ability is already selected in another slot
- Enforces "one ability per weapon" rule
- Deduplicates abilities before populating dropdowns

All 6 normal active slots can theoretically have the SAME ability selected, and the UI will allow it.

---

### 3. **Collection of Actives (No Deduplication)**
**Location**: [app.js](app.js#L697-L705)

```javascript
function collectActivesWithOrder(selects, resourcesForActives) {
    return selects
        .map(sel => {
            const ability = tswData[sel.value];
            if (!ability) return null;  // Filters null selections only
            // ... creates stats ...
            return stats;
        })
        .filter(Boolean);  // Only filters out nulls, NOT duplicates
}

const actives = collectActivesWithOrder(activeSelects, targetResources);
const eliteActives = collectActivesWithOrder(eliteActiveSelects, targetResources);
const auxActives = collectActivesWithOrder(auxActiveSelects, targetResources);
```

**Finding**: No deduplication here either. If Molten Steel is in slots 1 and 3:
- `activeSelects[0].value` = index of Molten Steel
- `activeSelects[2].value` = index of Molten Steel  
- Both get added to the `actives` array

---

### 4. **Simulation Loop Handles Duplicates (Kind Of)**
**Location**: [app.js](app.js#L906-980)

```javascript
while (time < targetSeconds) {
    let castSomething = false;

    for (let i = 0; i < allActives.length; i++) {
        const action = allActives[i];
        if (activeCooldowns[i] > 0) continue;  // Tracked by INDEX, not by name
        
        // ... can cast logic ...
        performAttack(action, action.weapon);
        activeCooldowns[i] = action.cooldown;
        // ... cast handling ...
    }
}
```

**Finding**: The simulation correctly handles duplicate abilities in terms of cooldown tracking:
- Each ability in `allActives` has a corresponding entry in `activeCooldowns[]`
- If Molten Steel is at index 0 and index 2, they have separate cooldown timers
- Each can cast independently

**BUT**: When damage is recorded (in `performAttack`), it writes to:
```javascript
statsBreakdown[ability.name].casts++;
statsBreakdown[ability.name].damage += finalDamage;
```

So if two instances of Molten Steel cast, both updates go to the same `statsBreakdown['Molten Steel']` entry.

---

### 5. **Special Handling for Other Abilities - NONE FOUND FOR MOLTEN STEEL**
**Search Result**: No special case handling for "Molten Steel" exists in app.js

Checked for:
- ✓ Name-based filters: None for Molten Steel
- ✓ Weapon-based restrictions: None found
- ✓ Type-based exclusions: None found
- ✓ Deduplication logic: No array.filter or array.find operations that would exclude Molten Steel

---

## Conclusion

**Molten Steel would NOT be missing from the breakdown**, but if selected multiple times:

1. ✓ It WOULD appear in the damage breakdown
2. ✓ Its damage WOULD be tracked (cumulative from all instances)
3. ✓ Its casts WOULD be counted (cumulative from all instances)
4. ⚠️ But it would NOT show separate tracking for each instance
5. ⚠️ Each instance tracks cooldowns independently, so they can all cast OK

**The root cause of Molten Steel being missing might be elsewhere** (data.js, or the data file itself), not in the filtering/deduplication logic of app.js.

