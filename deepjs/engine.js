const LEARNED_SKILLS = [
    { barId: 'skillsplaceexploration', key: 'exploration', label: 'exploration', descriptionKey: 'exploration' },
    { barId: 'skillsplaceforage', key: 'forage', label: 'forage', descriptionKey: 'exploration' },
    { barId: 'skillsplacerest', key: 'rest', label: 'rest', descriptionKey: 'rest' },
    { barId: 'skillsplaceregeneration', key: 'regeneration', label: 'Regeneration', descriptionKey: 'regeneration' },
    { barId: 'skillsplacefocus', key: 'focus', label: 'Focus', descriptionKey: 'focus' },
    { barId: 'skillsplacewizardy', key: 'wizardy', label: 'Wizardy', descriptionKey: 'wizardy' },
    { barId: 'skillsplacealchemy', key: 'alchemy', label: 'Alchemy', descriptionKey: 'alchemy' },
    { barId: 'skillsplacemasonry', key: 'masonry', label: 'Masonry', descriptionKey: 'masonry' },
    { barId: 'skillsplacepottery', key: 'pottery', label: 'Pottery', descriptionKey: 'pottery' },
    { barId: 'skillsplaceautism', key: 'autism', label: 'Autism', descriptionKey: 'autism' },
    { barId: 'skillsplacescience', key: 'science', label: 'Science', descriptionKey: 'science' },
    { barId: 'skillsplacetraveling', key: 'traveling', label: 'Traveling', descriptionKey: 'traveling' },
    { barId: 'skillsplacedreammastery', key: 'dreammastery', label: 'DreamMastery', descriptionKey: 'dreammastery' },
    { barId: 'skillsplacesurvival', key: 'survival', label: 'Survival', descriptionKey: 'survival' },
    { barId: 'skillsplaceropemaking', key: 'ropemaking', label: 'Ropemaking', descriptionKey: 'ropemaking' },
    { barId: 'skillsplacetailoring', key: 'tailoring', label: 'Tailoring', descriptionKey: 'tailoring' },
    { barId: 'skillsplacecarpentry', key: 'carpentry', label: 'Carpentry', descriptionKey: 'carpentry' },
    { barId: 'skillsplacearchitecture', key: 'architecture', label: 'Architecture', descriptionKey: 'architecture' },
    { barId: 'skillsplacegardening', key: 'gardening', label: 'Gardening', descriptionKey: 'gardening' },
    { barId: 'skillsplacedigging', key: 'digging', label: 'Digging', descriptionKey: 'digging' },
    { barId: 'skillsplacelumberjack', key: 'lumberjack', label: 'Lumberjack', descriptionKey: 'lumberjack' },
    { barId: 'skillsplacemining', key: 'mining', label: 'Mining', descriptionKey: 'mining' },
    { barId: 'skillsplacesmithing', key: 'smithing', label: 'Smithing', descriptionKey: 'smithing' },
    { barId: 'skillsplacecooking', key: 'cooking', label: 'Cooking', descriptionKey: 'cooking' },
];

function updateCharacterHeader() {
    const nameInput = document.getElementById("charactername");
    if (nameInput && document.activeElement !== nameInput) {
        nameInput.value = player.name;
    }

    const levelText = document.getElementById("characterlevel");
    if (levelText) levelText.innerText = "lv" + player.lvl;
}

function updateGUI() {
    calculateStats();
    updateCharacterHeader();
    updateStatusBars();
    updateMenuStatus();
    if (typeof renderGameClock === "function") renderGameClock();
    updateCoreStatsGUI();
    if (typeof updateCharacterPowerGUI === "function") updateCharacterPowerGUI();
    renderResources();
    if (typeof refreshCraftAvailability === "function") refreshCraftAvailability();
    if (typeof refreshBuildAvailability === "function") refreshBuildAvailability();
    if (typeof refreshImproveAvailability === "function") refreshImproveAvailability();
    renderStatusIcons();
    removeStaleTooltips();
    updateLearnedSkillsGUI();
}

function updateBar(barId, textId, current, maximum, label) {
    document.getElementById(textId).innerHTML = "<b>" + round2(current).toString() + "/" + round2(maximum).toString() + label + "</b>";
    document.getElementById(barId).style.width = PERCENT * (current / maximum) + '%';
}

function updateStatusBars() {
    updateBar("hpbar", "hpbartext", player.hp, player.maxhp, "HP");
    updateBar("manabar", "manabartext", player.mana, player.maxmana, "MANA");
    updateBar("staminabar", "staminabartext", player.stamina, player.maxstamina, "SP");
    updateBar("expbar", "expbartext", player.exp, player.maxexp, "EXP");
}

function updateSleepyness(diff) {
    if (!player) return;
    if (!Number.isFinite(diff) || diff <= 0) return;

    // One point per second for every action running at the same time.
    const activeActions = getActiveActionCount();
    if (activeActions <= 0) return;

    // Vitality may resist the whole increase for this tick.
    if (Math.random() < getSleepynessResistChance()) return;

    player.sleepyness = clampSleepyness(
        (Number(player.sleepyness) || 0) + diff * activeActions
    );
}

// 1 / sqrt(vit), capped at 99%. Higher vitality means sleep pressure is
// resisted more often.
function getSleepynessResistChance() {
    const vit = getEffectiveLevel("vit");
    if (!Number.isFinite(vit) || vit <= 0) return SLEEPYNESS_RESIST_MAX_CHANCE;

    return Math.min(SLEEPYNESS_RESIST_MAX_CHANCE, 1 / Math.sqrt(vit));
}

function getActiveActionCount() {
    let count = 0;
    Object.keys(actionStates).forEach(function (actionId) {
        if (actionStates[actionId] === Activity.Active) count += 1;
    });
    return count;
}

function getActiveSleepynessStatuses() {
    const sleepyness = Number(player && player.sleepyness) || 0;
    return SLEEPYNESS_STATUSES.filter(function (status) {
        return isSleepynessStatusActive(status, sleepyness);
    });
}

function getActiveSleepynessDebuffs() {
    return getActiveSleepynessStatuses().filter(function (status) {
        return status.kind === "debuff";
    });
}

// Energetic / Snoozy / Sleepy modify gameplay by a few plain fractions.
// Active statuses are summed, so both Snoozy and Sleepy count at 950.
function getSleepynessEffectTotals() {
    const totals = { actionEffectiveness: 0, travelTime: 0, staminaRegen: 0 };

    getActiveSleepynessStatuses().forEach(function (status) {
        const effects = status.effects || {};
        Object.keys(totals).forEach(function (key) {
            const value = Number(effects[key]);
            if (Number.isFinite(value)) totals[key] += value;
        });
    });

    return totals;
}

// --- Hunger ---------------------------------------------------------------
// Hunger is hidden from the UI as a number. It rises by 1 for every 10 points
// of stamina (SP) or mana spent and never exceeds maxHunger. Debuffs are
// tiered: only the strongest active tier applies.
const HUNGER_MAX_BASE = 1000;
const HUNGER_MAX_PER_VIT = 5;
const HUNGER_MAX_PER_SOU = 3;
const HUNGER_POINTS_PER_SPEND = 10;

const HUNGER_TIERS = Object.freeze([
    {
        id: "hungry",
        name: "Hungry",
        threshold: 0.5,
        aboveOnly: true,
        actionMultiplier: 0.8,
        regenMultiplier: 0.8,
        color: "#e0a029",
        icon: "fa-cutlery",
    },
    {
        id: "very-hungry",
        name: "Very hungry",
        threshold: 0.7,
        aboveOnly: false,
        actionMultiplier: 0.5,
        regenMultiplier: 0.5,
        color: "#e05c1a",
        icon: "fa-cutlery",
    },
    {
        id: "starving",
        name: "Starving",
        threshold: 0.9,
        aboveOnly: false,
        actionMultiplier: 0.5,
        regenMultiplier: 0,
        color: "#c81e1e",
        icon: "fa-cutlery",
    },
]);

function getHungerMax() {
    const vit = Math.max(0, Number(getEffectiveLevel("vit")) || 0);
    const sou = Math.max(0, Number(getEffectiveLevel("sou")) || 0);
    return Math.max(
        1,
        (HUNGER_MAX_BASE + vit * HUNGER_MAX_PER_VIT + sou * HUNGER_MAX_PER_SOU)
        * getGlobalPropertyMultiplier("maxHunger")
    );
}

// ReduceHungerUse is stored as a positive reduction and subtracts from the
// hunger gain multiplier. It is capped at 100%, so hunger can never decrease
// from spending.
function getHungerUseMultiplier() {
    const reduction = Math.max(
        0,
        Number(getGlobalPropertyMultiplier("reduceHungerUse")) - 1
    );
    return Math.max(0, 1 - reduction);
}

function getHungerValue() {
    const hunger = Number(player && player.hunger);
    return Number.isFinite(hunger) && hunger > 0 ? hunger : 0;
}

function getActiveHungerTier() {
    const max = getHungerMax();
    const hunger = getHungerValue();

    // Strongest tier first, so only one debuff is ever active.
    for (let index = HUNGER_TIERS.length - 1; index >= 0; index--) {
        const tier = HUNGER_TIERS[index];
        const active = tier.aboveOnly
            ? hunger > max * tier.threshold
            : hunger >= max * tier.threshold;
        if (active) return tier;
    }

    return null;
}

function getHungerActionMultiplier() {
    const tier = getActiveHungerTier();
    return tier ? tier.actionMultiplier : 1;
}

// Hungry and Very hungry reduce HP and stamina regeneration. Starving stops
// every regeneration, which is handled by the per-resource multipliers below.
function getHungerRegenMultiplier() {
    const tier = getActiveHungerTier();
    return tier ? tier.regenMultiplier : 1;
}

function getHungerManaRegenMultiplier() {
    const tier = getActiveHungerTier();
    return tier && tier.id === "starving" ? 0 : 1;
}

const hungerSpendRemainders = { stamina: 0, mana: 0 };

function addHunger(amount) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return;

    const gained = numeric * getHungerUseMultiplier();
    player.hunger = Math.min(
        getHungerMax(),
        round2(getHungerValue() + gained)
    );
}

// Spending is tracked per resource with a remainder, so 10 spent points give
// exactly 1 hunger and smaller amounts are not lost.
function trackHungerSpending(resource, amount) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return;

    const key = resource === "mana" ? "mana" : "stamina";
    const total = (hungerSpendRemainders[key] || 0) + numeric;
    const points = Math.floor(total / HUNGER_POINTS_PER_SPEND);

    hungerSpendRemainders[key] = total - points * HUNGER_POINTS_PER_SPEND;
    if (points > 0) addHunger(points);
}

function getHungerStatus() {
    const tier = getActiveHungerTier();
    if (!tier) return null;

    const lines = ["<b>" + tier.name + "</b>"];
    if (tier.id === "starving") {
        lines.push("-50% action effectiveness");
        lines.push("All regeneration stopped");
        lines.push("Lose 1% of max HP every 40-59 seconds");
    } else {
        const penalty = Math.round((1 - tier.actionMultiplier) * PERCENT);
        lines.push("-" + penalty + "% action effectiveness");
        lines.push("-" + penalty + "% HP and SP regeneration");
    }
    lines.push("Hunger is hidden. It rises when you spend SP or mana.");
    lines.push("You automatically eat edible resources while hungry.");

    return {
        id: tier.id,
        name: tier.name,
        kind: "debuff",
        color: tier.color,
        icon: tier.icon,
        tooltip: lines.join("<br>"),
    };
}

// The starving damage timer is runtime state only: it is not saved and starts
// fresh after a load or after leaving the Starving tier.
let hungerStarvationTimer = null;

function rollHungerStarvationInterval() {
    // rand(20) + 40 seconds, i.e. 40-59 seconds.
    return 40 + Math.floor(Math.random() * 20);
}

function updateHungerStarvationTick(diff) {
    const tier = getActiveHungerTier();
    if (!tier || tier.id !== "starving") {
        hungerStarvationTimer = null;
        return;
    }

    if (hungerStarvationTimer == null) {
        hungerStarvationTimer = rollHungerStarvationInterval();
    }

    const seconds = Number(diff) || 0;
    if (seconds <= 0) return;

    hungerStarvationTimer -= seconds;
    while (hungerStarvationTimer <= 0) {
        hungerStarvationTimer += rollHungerStarvationInterval();

        const damage = Math.max(0.01, round2(player.maxhp * 0.01));
        player.hp = Math.max(0, round2(player.hp - damage));
        logMessage("Starving: you lose " + damage + " HP");
    }
}

// Automatic eating uses the canonical resource tag, not a hardcoded list of
// edible categories. Everything tagged "Edible" can be eaten raw.
function getEdibleResourceIds(excludedId) {
    const ids = [];
    Object.keys(RESOURCE_DEFS).forEach(function (resourceIdText) {
        const resourceId = Number(resourceIdText);
        if (resourceId === excludedId) return;

        const stack = resources[resourceId];
        if (!hasResourceTag(resourceId, RESOURCE_TAGS.Edible)) return;
        if (!stack || !(Number(stack.amount) > 0)) return;

        ids.push(resourceId);
    });
    return ids;
}

function getInventoryFoodIndices() {
    const indices = [];
    if (!player || !Array.isArray(player.equipinventory)) return indices;

    player.equipinventory.forEach(function (item, index) {
        if (item && typeof isConsumableFoodItem === "function" && isConsumableFoodItem(item)) {
            indices.push(index);
        }
    });
    return indices;
}

function foodMatchesDietPriority(item, priorityStat) {
    if (!item || !priorityStat) return false;

    if (item.potentialBonuses
        && Number(item.potentialBonuses[priorityStat]) > 0) {
        return true;
    }

    return item.sourceResourceId != null
        && typeof getFoodStatBinding === "function"
        && getFoodStatBinding(item.sourceResourceId) === priorityStat;
}

// DietBasics 3: cooked food in the inventory is eaten before raw resources.
// The level 2 priority stat is honoured when the cooked food grants it.
function getAutoEatInventoryFoodIndex() {
    const indices = getInventoryFoodIndices();
    if (!indices.length) return -1;

    const priorityStat = typeof getDietPriorityStat === "function"
        ? getDietPriorityStat()
        : null;
    let pool = indices;
    if (priorityStat) {
        const preferred = indices.filter(function (index) {
            return foodMatchesDietPriority(player.equipinventory[index], priorityStat);
        });
        if (preferred.length) pool = preferred;
    }

    return pool[Math.floor(Math.random() * pool.length)];
}

// DietBasics level 2 can prioritise food bound to one stat. If no such food is
// available, or the stack runs out, the normal random selection is used.
function getAutoEatCandidates(excludedId) {
    const candidates = getEdibleResourceIds(excludedId);
    const priorityStat = typeof getDietPriorityStat === "function"
        ? getDietPriorityStat()
        : null;
    if (!priorityStat) return candidates;

    const prioritized = candidates.filter(function (resourceId) {
        return typeof getFoodStatBinding === "function"
            && getFoodStatBinding(resourceId) === priorityStat;
    });
    return prioritized.length ? prioritized : candidates;
}

// Automatic eating starts at the DietBasics threshold when it is researched,
// otherwise at the first hunger debuff. Once active it continues until hunger
// is exactly 0, even if it drops below the threshold.
// DietBasics 3 eats cooked food from the inventory first; level 4 may cook a
// dish when no cooked food remains. Raw resources are the final fallback.
// One unit restores (1 + quality^1.2) hunger, so the amount needed for the
// current hunger is Hunger / (1 + ql^1.2). If a stack is too small, it is
// consumed completely and another edible resource is tried.
function updateAutoHungerEating() {
    let hunger = getHungerValue();
    if (hunger <= 0) {
        player.autoEatActive = false;
        return;
    }

    if (player.autoEatActive !== true) {
        if (typeof DIET_BASICS_TECHNOLOGY !== "undefined"
            && DIET_BASICS_TECHNOLOGY.level >= 1) {
            const thresholdHunger = getHungerMax()
                * getDietAutoEatThresholdPercent() / PERCENT;
            if (hunger < thresholdHunger) return;
        } else if (!getActiveHungerTier()) {
            return;
        }
        player.autoEatActive = true;
    }

    let excludedId = null;
    let safety = 0;

    while (hunger > 0 && safety < 1000) {
        safety += 1;

        // DietBasics 3: inventory food comes before raw edible resources.
        if (DIET_BASICS_TECHNOLOGY.level >= 3) {
            const foodIndex = getAutoEatInventoryFoodIndex();
            if (foodIndex !== -1) {
                const ate = typeof consumeInventoryFood === "function"
                    && consumeInventoryFood(foodIndex);
                if (ate) {
                    hunger = getHungerValue();
                    if (hunger <= 0) break;
                    continue;
                }
            }

            // DietBasics 4: no cooked food left, so try to cook one. If
            // cooking is impossible (no power, ingredients or free slot), the
            // loop falls back to raw edible resources below.
            if (DIET_BASICS_TECHNOLOGY.level >= 4
                && typeof autoCookDietFood === "function"
                && autoCookDietFood()) {
                continue;
            }
        }

        const candidates = getAutoEatCandidates(excludedId);
        if (!candidates.length) break;

        const candidateIndex = Math.min(
            candidates.length - 1,
            Math.floor(Math.random() * candidates.length)
        );
        const resourceId = candidates[candidateIndex];
        const stack = resources[resourceId];
        const definition = RESOURCE_DEFS[resourceId];
        if (!stack || !definition) break;

        const available = Math.max(0, Number(stack.amount) || 0);
        if (available <= 0) {
            excludedId = resourceId;
            continue;
        }

        const quality = Number.isFinite(stack.quality) && stack.quality > 0
            ? stack.quality
            : RESOURCE_DEFAULT_QUALITY;
        const feastHungerMultiplier = typeof getEquippedFeastEfficiencyMultiplier === "function"
            ? getEquippedFeastEfficiencyMultiplier()
            : 1;
        const restorePerUnit = (1 + Math.pow(quality, 1.2)) * feastHungerMultiplier;
        const needed = hunger / restorePerUnit;
        const consumed = Math.min(needed, available);

        stack.amount = round2(Math.max(0, available - consumed));
        hunger = round2(Math.max(0, hunger - consumed * restorePerUnit));
        player.hunger = hunger;

        // Eating also restores the bound stat's potential. One unit restores
        // 1 + ResourceQuality / 10 potential; the best SittingPlace building's
        // FeastModifier increases that gain by BuildingQuality percent.
        const statKey = typeof getFoodStatBinding === "function"
            ? getFoodStatBinding(resourceId)
            : null;
        const boundStat = statKey && player ? player[statKey] : null;
        if (boundStat) {
            const feastMultiplier = typeof getFeastModifier === "function"
                ? 1 + getFeastModifier(currentTile) / 100
                : 1;
            increasePotential(
                boundStat,
                consumed * (1 + quality / 10) * feastMultiplier
            );
        }

        logMessage(
            "You eat " + round2(consumed) + " " + definition.name
            + (hunger > 0 ? " (still hungry)" : "")
        );

        if (hunger <= 0) {
            player.hunger = 0;
            break;
        }

        // The selected stack could not finish the job; the next iteration must
        // use a different edible resource.
        excludedId = resourceId;
    }

    if (getHungerValue() <= 0) {
        player.hunger = 0;
        player.autoEatActive = false;
    }
}

// Output of timed actions: Energetic +20%, Sleepy -20%, Snoozy -10%, the
// active hunger tier's penalty and the current weather penalty.
function getActionEffectivenessMultiplier(action) {
    return Math.max(
        0.01,
        (1 + getSleepynessEffectTotals().actionEffectiveness)
            * getHungerActionMultiplier()
            * (typeof getGameWeatherActionMultiplier === "function"
                ? getGameWeatherActionMultiplier(action)
                : 1)
    );
}

// Shared hunger + weather multiplier for production actions that do not use
// getActionEffectivenessMultiplier directly. A completed WorkBench on the
// current tile additionally scales only actions tagged Production.
function getActionProductionMultiplier(actionId) {
    let workBenchMultiplier = 1;
    if (typeof getWorkBenchProductionMultiplier === "function"
        && typeof getAction === "function"
        && typeof hasActionTag === "function") {
        const action = getAction(actionId);
        if (action && hasActionTag(action, "Production")) {
            workBenchMultiplier = getWorkBenchProductionMultiplier(currentTile);
        }
    }

    return getHungerActionMultiplier()
        * (typeof getGameWeatherActionMultiplier === "function"
            ? getGameWeatherActionMultiplier(actionId)
            : 1)
        * workBenchMultiplier;
}

// Tile-to-tile travel duration: Energetic -20%, Sleepy +20%, Snoozy +10%.
function getTravelSleepynessMultiplier() {
    return Math.max(0.01, 1 + getSleepynessEffectTotals().travelTime);
}

// Stamina (SP) regen: Energetic +50%, Sleepy -50%, Snoozy -25%, multiplied by
// the best SittingPlace building bonus on the tile.
function getStaminaRegenMultiplier() {
    const sittingPlaceMultiplier = typeof getSittingPlaceStaminaRegenMultiplier === "function"
        ? getSittingPlaceStaminaRegenMultiplier(currentTile)
        : 1;
    return Math.max(0, 1 + getSleepynessEffectTotals().staminaRegen)
        * sittingPlaceMultiplier;
}

function formatSleepynessEffectPercent(value) {
    const percent = round2(value * PERCENT);
    return (percent > 0 ? "+" : "") + percent + "%";
}

function getSleepynessEffectDescriptions(status) {
    const effects = status.effects || {};
    const lines = [];

    if (effects.actionEffectiveness) {
        lines.push(formatSleepynessEffectPercent(effects.actionEffectiveness)
            + " action effectiveness");
    }
    if (effects.travelTime) {
        lines.push(formatSleepynessEffectPercent(effects.travelTime) + " travel time");
    }
    if (effects.staminaRegen) {
        lines.push(formatSleepynessEffectPercent(effects.staminaRegen) + " stamina regen");
    }
    if (status.id === "needs-to-sleep") {
        lines.push("Chance to fall asleep: "
            + round2(getForcedSleepChance() * PERCENT) + "% per second");
    }

    return lines;
}

// --- Sleep action --------------------------------------------------------
function getDreamMasteryLevel() {
    const level = getEffectiveLevel("dreammastery");
    return Number.isFinite(level) && level > 0 ? level : 0;
}

// Sleep is available above this sleepyness. DreamMastery lowers the bar.
function getSleepThreshold() {
    return Math.max(0, SLEEP_THRESHOLD_BASE - getDreamMasteryLevel());
}

// 1 + sqrt((ins + sou) / 2 * DreamMastery)
function getSleepQuality() {
    const ins = Math.max(0, getEffectiveLevel("ins") || 0);
    const sou = Math.max(0, getEffectiveLevel("sou") || 0);
    const mastery = getDreamMasteryLevel();

    let quality = 1 + Math.sqrt(((ins + sou) / 2) * mastery);

    // A completed Leaf Bedroll on the current tile adds 1 + quality/100.
    // Only the best completed bedroll applies (see build.js).
    if (typeof getSleepQualityBuildingBonus === "function") {
        quality += getSleepQualityBuildingBonus(currentTile);
    }

    // SleepSpeed is an efficiency multiplier: it scales regeneration,
    // sleepyness drain and sleep experience together with the base quality.
    quality *= getSleepSpeedMultiplier();
    quality *= getHearthfireSleepMultiplier();
    if (typeof getDarkSleepQualityMultiplier === "function") {
        quality *= getDarkSleepQualityMultiplier();
    }

    return quality;
}

// Multiplier from equipped SleepSpeed item properties. Percent globals are
// already rolled with 50%-150% variance and rarity scaling in itemdefs.js.
function getSleepSpeedMultiplier() {
    return Math.max(0, getGlobalPropertyMultiplier("sleepSpeed"));
}

function isSleeping() {
    return typeof actionStates !== "undefined"
        && actionStates.sleep === Activity.Active;
}

// While sleeping, every HP / MANA / SP regeneration tick is multiplied by
// SleepQuality.
function getSleepRegenMultiplier() {
    return isSleeping() ? getSleepQuality() : 1;
}

function runSleepProduction(diff) {
    if (actionStates.sleep !== Activity.Active) return;

    const quality = getSleepQuality();
    const weatherMultiplier = typeof getGameWeatherActionMultiplier === "function"
        ? getGameWeatherActionMultiplier("sleep")
        : 1;
    const sleepDiff = Math.max(0, Number(diff) || 0) * weatherMultiplier;

    // Sleep removes SleepQuality sleepyness every second.
    const drained = quality * sleepDiff * getGlobalPropertyMultiplier("sleepRegen");
    player.sleepyness = clampSleepyness(
        (Number(player.sleepyness) || 0) - drained
    );

    // Sleeping is how DreamMastery is trained.
    if (player.dreammastery) player.dreammastery.addexp(sleepDiff);

    // A deep sleep also trains Insight and Soul: SleepQuality / 2 exp each.
    const statExp = (quality / 2) * sleepDiff;
    if (player.ins) player.ins.addexp(statExp);
    if (player.sou) player.sou.addexp(statExp);

    // A good dream can permanently raise one random skill's potential.
    tryDreamPotentialGain(sleepDiff);
}

// --- Hearthfire buff ------------------------------------------------------
// A completed Campfire on the current tile grants Hearthfire. The buff has
// Quality * Rarity stacks and burns 1 Stick + 1 Leaf every 50 seconds.
const HEARTHFIRE_STACK_REGEN_BONUS = 0.05;
const HEARTHFIRE_STACK_SLEEP_BONUS = 0.05;
const HEARTHFIRE_FUEL_INTERVAL_SECONDS = 50;
const HEARTHFIRE_FUEL_STICKS = 1;
const HEARTHFIRE_FUEL_LEAVES = 1;
const HEARTHFIRE_ASH_PER_SECOND = 0.01;

let hearthfireStacks = 0;
let hearthfireFuelElapsed = 0;
let hearthfireActiveCampfireUid = null;

function getHearthfireRegenMultiplier() {
    return 1 + Math.max(0, hearthfireStacks) * HEARTHFIRE_STACK_REGEN_BONUS;
}

function getHearthfireSleepMultiplier() {
    return 1 + Math.max(0, hearthfireStacks) * HEARTHFIRE_STACK_SLEEP_BONUS;
}

function clearHearthfire(silent) {
    const wasActive = hearthfireStacks > 0;
    hearthfireStacks = 0;
    hearthfireFuelElapsed = 0;
    hearthfireActiveCampfireUid = null;

    if (!silent && wasActive) {
        logMessage("The Hearthfire fades away.");
    }
}

function getHearthfireStatus() {
    if (!(hearthfireStacks > 0)) return null;

    const regenBonus = round2(
        hearthfireStacks * HEARTHFIRE_STACK_REGEN_BONUS * PERCENT
    );
    const sleepBonus = round2(
        hearthfireStacks * HEARTHFIRE_STACK_SLEEP_BONUS * PERCENT
    );
    const nextFuel = Math.max(
        0,
        HEARTHFIRE_FUEL_INTERVAL_SECONDS - hearthfireFuelElapsed
    );

    const lines = [
        "<b>Hearthfire</b>",
        "Stacks: " + round2(hearthfireStacks),
    ];

    const campfireInfo = typeof getBestCampfireOnTile === "function"
        ? getBestCampfireOnTile(currentTile)
        : null;
    if (campfireInfo
        && typeof getBuildingRarityId === "function"
        && typeof getRarityLabel === "function") {
        lines.push(
            "Campfire: Q" + round2(campfireInfo.building.quality)
            + " | " + getRarityLabel(getBuildingRarityId(campfireInfo.building))
        );
    }

    lines.push(
        "HP, Mana and SP regen: +" + regenBonus + "%",
        "Sleep quality: +" + sleepBonus + "%",
        "Ash: +" + HEARTHFIRE_ASH_PER_SECOND + "/s while burning",
        "Fuel: " + HEARTHFIRE_FUEL_STICKS + " Stick + "
            + HEARTHFIRE_FUEL_LEAVES + " Leaf every "
            + HEARTHFIRE_FUEL_INTERVAL_SECONDS + " seconds.",
        "Next fuel in: " + round2(nextFuel) + "s"
    );

    return {
        id: "hearthfire",
        kind: "buff",
        name: "Hearthfire",
        color: "#ff9a1f",
        icon: "fa-fire",
        stacks: hearthfireStacks,
        tooltip: lines.join("<br>"),
    };
}

function getHearthfireFuelUnits() {
    const sticks = resources[RESOURCE_IDS.STICKS];
    const leaves = resources[RESOURCE_IDS.LEAVES];
    const stickAmount = sticks ? Math.max(0, Number(sticks.amount) || 0) : 0;
    const leafAmount = leaves ? Math.max(0, Number(leaves.amount) || 0) : 0;

    return Math.min(
        Math.floor(stickAmount / HEARTHFIRE_FUEL_STICKS),
        Math.floor(leafAmount / HEARTHFIRE_FUEL_LEAVES)
    );
}

// Ash is a slow by-product of a burning Hearthfire. It accumulates only while
// the campfire is active, i.e. has fuel and grants its buff.
function produceHearthfireAsh(seconds) {
    if (!(hearthfireStacks > 0)) return;
    if (!(seconds > 0)) return;
    addResource(RESOURCE_IDS.ASH, HEARTHFIRE_ASH_PER_SECOND * seconds);
}

function consumeHearthfireFuel(intervals) {
    const sticks = resources[RESOURCE_IDS.STICKS];
    const leaves = resources[RESOURCE_IDS.LEAVES];
    const available = getHearthfireFuelUnits();
    const consumed = Math.min(intervals, available);

    if (consumed > 0) {
        sticks.amount = round2(Math.max(
            0,
            (Number(sticks.amount) || 0) - consumed * HEARTHFIRE_FUEL_STICKS
        ));
        leaves.amount = round2(Math.max(
            0,
            (Number(leaves.amount) || 0) - consumed * HEARTHFIRE_FUEL_LEAVES
        ));
    }

    return consumed;
}

function runHearthfireProduction(diff) {
    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return;

    // The character must actually be standing on the tile, not travelling.
    if (typeof isTraveling === "function" && isTraveling()) {
        clearHearthfire();
        return;
    }

    const campfireInfo = typeof getBestCampfireOnTile === "function"
        ? getBestCampfireOnTile(currentTile)
        : null;

    if (!campfireInfo || campfireInfo.stacks <= 0) {
        clearHearthfire();
        return;
    }

    // A cold campfire cannot light without at least one full fuel payment.
    if (!(hearthfireStacks > 0) && getHearthfireFuelUnits() < 1) {
        clearHearthfire(true);
        return;
    }

    // Keep the fuel interval running when the best campfire on the tile
    // changes; only leaving the tile resets it.
    if (hearthfireActiveCampfireUid !== campfireInfo.building.uid) {
        hearthfireActiveCampfireUid = campfireInfo.building.uid;
    }

    hearthfireStacks = campfireInfo.stacks;

    // Only the time actually covered by available fuel produces Ash. This
    // prevents a long background tick from paying Ash after the fire is out.
    const fuelSeconds = getHearthfireFuelUnits() * HEARTHFIRE_FUEL_INTERVAL_SECONDS;
    produceHearthfireAsh(Math.min(seconds, fuelSeconds));

    hearthfireFuelElapsed += seconds;

    const intervals = Math.floor(
        hearthfireFuelElapsed / HEARTHFIRE_FUEL_INTERVAL_SECONDS
    );
    if (intervals <= 0) return;

    const consumed = consumeHearthfireFuel(intervals);
    hearthfireFuelElapsed -= consumed * HEARTHFIRE_FUEL_INTERVAL_SECONDS;

    if (consumed < intervals) {
        logMessage("The campfire burns out: not enough sticks and leaves.");
        clearHearthfire(true);
        return;
    }

    // The last payment kept the previous interval alive. Without fuel for the
    // next interval the campfire goes out now instead of granting it for free.
    if (getHearthfireFuelUnits() < 1) {
        logMessage("The campfire burns out.");
        clearHearthfire(true);
    }
}

// 1 / (100 - luck / 10) per second of sleep. Guarded so it never leaves 0..1.
function getSleepPotentialChance() {
    const luck = Math.max(0, getEffectiveLevel("luck") || 0);
    const denominator = Math.max(
        1,
        SLEEP_POTENTIAL_CHANCE_BASE - luck / SLEEP_POTENTIAL_LUCK_DIVISOR
    );
    return Math.min(1, 1 / denominator);
}

// Every Skill on the character, discovered dynamically: skills added in the
// future are included automatically, stats (Stat class) are never included.
function getPotentialSkills() {
    if (!player) return [];

    return Object.keys(player)
        .map(function (key) { return player[key]; })
        .filter(function (value) { return value instanceof Skill; });
}

function tryDreamPotentialGain(diff) {
    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return;

    // Convert the per-second chance into one roll for the whole tick.
    const chancePerSecond = getSleepPotentialChance();
    const chance = 1 - Math.pow(1 - chancePerSecond, seconds);
    if (Math.random() >= chance) return;

    const skills = getPotentialSkills();
    if (skills.length === 0) return;

    const skill = skills[Math.floor(Math.random() * skills.length)];
    const requested = getSleepQuality();
    const gained = increasePotential(skill, MAX_POTENTIAL * requested / PERCENT);

    if (gained > 0) {
        logMessage("You dream about " + skill.name
            + " and its potential grows by " + round2(gained) + "%");
    } else {
        logMessage("You dream about " + skill.name
            + ", but its potential is already at maximum");
    }
}

function getMainMenuText() {
    let text = document.getElementById("mainmenutext");
    if (text) return text;

    // The coordinates live in their own span, so the status icons in the same
    // bar survive the per-tick text update.
    text = document.createElement("span");
    text.id = "mainmenutext";
    text.className = "mainmenutext";
    mainMenu.insertBefore(text, mainMenu.firstChild);
    return text;
}

function updateMenuStatus() {
    const travelStatus = activeTravel
        ? " Traveling. Time left: " + formatTravelTime(activeTravel.remaining) + "."
        : "";
    getMainMenuText().innerHTML = "Coordinates " + currentTile.x + ", " + currentTile.y + ". Scouted " + round2(currentTile.revealed) + "% and thereis " + round2(currentTile.investigated) + "% explored. Search units: " + round2(currentTile.hiddenstuff) + "." + travelStatus;
}

function updateCoreStatsGUI() {
    CORE_STAT_NAMES.forEach(function (statName) {
        const stat = player[statName];
        updateSkillGUI(statName, stat.lvl, stat.exp, stat.description, stat.potential);
    });
}

function updateLearnedSkillsGUI() {
    const skillBars = document.getElementsByClassName('skillsbar');
    for (let index = CORE_STAT_COUNT; index < skillBars.length; index++) {
        const skill = LEARNED_SKILLS.find(function (entry) {
            return entry.barId === skillBars[index].id;
        });
        if (!skill) continue;

        const playerSkill = player[skill.key];
        const descriptionSkill = player[skill.descriptionKey];
        updateSkillGUI(
            skill.label,
            playerSkill.lvl,
            playerSkill.exp,
            descriptionSkill.description,
            playerSkill.potential
        );
    }
}

function removeStaleTooltips() {
    const elements = document.getElementsByClassName("tooltip");
    while (elements.length > 1) elements[0].remove();
}
function calculateStats(){
    player.maxhp = round2(Math.pow((getEffectiveLevel("str") + getEffectiveLevel("vit") * 3 + getEffectiveLevel("sou")), (1.01 + (0.01 * player.lvl))) * getGlobalPropertyMultiplier("maxhp"));
    player.maxmana = round2(Math.pow((getEffectiveLevel("int") * 2 + getEffectiveLevel("sou") + getEffectiveLevel("ins") * 2), (1.01 + (0.01 * player.lvl))) * getGlobalPropertyMultiplier("maxmana"));
    player.maxstamina = round2(Math.pow((getEffectiveLevel("str") + getEffectiveLevel("agi") +  getEffectiveLevel("vit") * 2 + getEffectiveLevel("sou")), (1.01 + (0.01 * player.lvl))) * getGlobalPropertyMultiplier("maxsp"));
    player.maxHunger = round2(getHungerMax());
    if (player.hunger > player.maxHunger) {player.hunger = player.maxHunger};
    if (player.hp > player.maxhp) {player.hp = player.maxhp};
    if (player.mana > player.maxmana) {player.mana = player.maxmana};
    if (player.stamina > player.maxstamina) {player.stamina = player.maxstamina};
    //updateGUI();
    }



function updateSkillGUI(skillName, lvl, exp, description, potential) {
    const skillKey = getSkillBarKey(skillName);
    document.getElementById('skillsplace'+skillKey).childNodes[0].nodeValue = skillName+ " LVL:" + lvl + " EXP remain:" + round2(round2(exp / (lvl * BASE_EXP)) * PERCENT) + "%"; //double dounded because paranoid
    document.getElementById('skillbar'+skillKey).style.width = (PERCENT - PERCENT*(exp/(lvl*BASE_EXP))) + '%';

    // Clothing bonuses are listed under the usual level/exp line, but only
    // when something equipped actually affects this stat or skill.
    const clothingBonuses = getEquippedPropertyTooltipHtml(skillKey);
    const potentialValue = Math.max(0, Number(potential) || 0);
    const potentialOverflow = Math.max(0, potentialValue - MAX_POTENTIAL);
    const potentialLabel = potentialOverflow > 0
        ? round2(potentialValue) + "% (+" + round2(potentialOverflow) + "% above 100%)"
        : round2(potentialValue) + "%";
    const tooltip = description + "<br> LVL:" + lvl + " EXP remain:" + round2(exp)
        + "<br>Potential: " + potentialLabel
        + (clothingBonuses ? "<br>" + clothingBonuses : "");
    document.getElementById('skillsplace'+skillKey).setAttribute('data-tooltip', tooltip);
// $('#skillsbar' + skillname).contents()[0].nodeValue = skillname + " LVL:" + lvl + " EXP remain:" + exp;
//    document.getElementById('skillsbar'+ skillname).= skillname + " LVL:" + lvl + " EXP remain:" + exp;

}

function productionLoop(diff, options) {
    if (diff == null) diff = 1;

    // No mana cost exists yet; a net mana loss during the tick is treated as
    // spending so future mana costs feed hunger automatically.
    const manaBefore = Number(player.mana) || 0;
    const skipManaRegen = !!(options && options.skipManaRegen);

    runHearthfireProduction(diff);
    staminaRegen(diff);
    hpRegen(diff);
    if (!skipManaRegen) manaRegen(diff);
    updateDayDreamUnlock(diff);
    runTravelProduction(diff);
    runActiveActions(diff);

    const manaAfter = Number(player.mana) || 0;
    if (manaAfter < manaBefore) {
        trackHungerSpending("mana", manaBefore - manaAfter);
    }

    tryActivateAutoRest();
}

// Fast-forwards the whole simulation by `seconds`. Used by instant actions
// such as Focus: active actions, regeneration, hunger, starvation, sleep
// pressure and the game clock all advance exactly as they would in mainLoop.
// Focus passes skipManaRegen so the skipped time never refills mana.
function simulateTimePassage(seconds, options) {
    const value = Math.max(0, Number(seconds) || 0);
    if (value <= 0) return;

    updateSleepyness(value);
    tryFallAsleep(value);
    productionLoop(value, options);
    updateAutoHungerEating();
    updateHungerStarvationTick(value);
    if (typeof advanceGameClock === "function") advanceGameClock(value);
    updateGUI();
    if (typeof refreshActionButtons === "function") refreshActionButtons(true);
}

function runExploreProduction(diff) {
    if (actionStates.explore !== Activity.Active) return;
    if (currentTile.revealed >= EXPLORATION_COMPLETE) return;

    const distanceDivisor = 1 + Math.abs(currentTile.x + currentTile.y) / 10;
    currentTile.revealed = Math.min(EXPLORATION_COMPLETE, currentTile.revealed + EXPLORATION_PROGRESS_RATE * (Math.sqrt(getEffectiveLevel("per") * getEffectiveLevel("exploration")) * (getEffectiveLevel("speed") / PERCENT)) * diff / distanceDivisor * getActionEffectivenessMultiplier("explore"));
    player.per.addexp(0.5 * diff);
    player.exploration.addexp(1 * diff);
}

const LAND_ROLLS = {
    0: [["water", 1]],
    1: [["water", 1]],
    2: [["water", 0.9], ["rocks", 1]],
    3: [["grass", 0.6], ["trees", 0.8], ["rocks", 1]],
    4: [["grass", 0.7], ["trees", 0.8], ["water", 0.95], ["rocks", 1]],
    5: [["trees", 0.6], ["grass", 0.85], ["rocks", 0.95], ["water", 1]],
    6: [["trees", 0.9], ["rocks", 0.95], ["water", 1]],
    7: [["grass", 0.4], ["trees", 0.2], ["rocks", 1]],
    8: [["rocks", 0.9], ["trees", 0.15], ["water", 1]],
    9: [["rocks", 0.7], ["water", 1]],
    10: [["rocks", 0.7], ["water", 0.9], ["grass", 1]],
    11: [["grass", 0.8], ["trees", 0.9], ["water", 1]],
    12: [["trees", 0.7], ["grass", 0.9], ["rocks", 1]],
    13: [["grass", 0.6], ["rocks", 1]],
    14: [["water", 0.5], ["grass", 0.8], ["trees", 0.95], ["rocks", 1]],
    15: [["trees", 0.9], ["grass", 0.95], ["water", 1]],
    16: [["rocks", 0.8], ["water", 1]],
    17: [["water", 0.8], ["rocks", 1]],
    18: [["water", 0.5], ["grass", 0.6], ["rocks", 1]],
    19: [["grass", 0.5], ["trees", 0.8], ["water", 1]],
    20: [["water", 0.9], ["grass", 1]],
    86: [["water", 0.6], ["grass", 0.9], ["trees", 1]],
    87: [["rocks", 0.9], ["water", 1]],
    88: [["rocks", 1]],
    89: [["trees", 0.9], ["grass", 0.95], ["rocks", 1]],
    90: [["trees", 0.9], ["grass", 0.95], ["rocks", 1]],
    91: [["grass", 0.8], ["trees", 0.9], ["water", 1]],
    92: [["water", 1]],
    93: [["rocks", 1]],
    94: [["rocks", 1]],
    95: [["rocks", 1]],
    96: [["rocks", 1]],
    97: [["water", 0.6], ["grass", 0.8], ["rocks", 1]],
    98: [["rocks", 1]],
    99: [["rocks", 1]],
};
const DEFAULT_LAND_ROLLS = [["grass", 0.6], ["trees", 0.8], ["rocks", 0.95], ["water", 1]];

function generateLand(tile) {
    if (!tile) return;

    const rolls = LAND_ROLLS[tile.type] || DEFAULT_LAND_ROLLS;
    const value = Math.random();
    const roll = rolls.find(([, threshold]) => value < threshold) || rolls[rolls.length - 1];
    const resource = roll[0];

    if (!tile.land) tile.land = { trees: 0, grass: 0, rocks: 0, water: 0 };
    landTotals[resource] += 1;
    tile.land[resource] += 1;
}

function runSearchProduction(diff) {
    if (actionStates.search !== Activity.Active) return;
    if (currentTile.revealed <= 0) return;

    const distanceDivisor = 1 + Math.abs(currentTile.x + currentTile.y) / 10;
    const searchPower = (Math.sqrt(getEffectiveLevel("per") * getEffectiveLevel("exploration")) * (getEffectiveLevel("speed") / PERCENT)) * diff / distanceDivisor * getActionEffectivenessMultiplier("search");
    currentTile.hiddenstuff = round2(currentTile.hiddenstuff + SEARCH_UNITS_RATE * searchPower);
    currentTile.investigated = Math.min(currentTile.revealed, currentTile.investigated + SEARCH_INVESTIGATION_RATE * searchPower);
    for (let t = 0; t < round2(searchPower); t++) {
        generateLand(currentTile);
    }
    player.per.addexp(0.5 * diff);
    player.exploration.addexp(1 * diff);
}

function runRestProduction(diff) {
    if (actionStates.rest !== Activity.Active) return;

    const restMultiplier = typeof getGameWeatherActionMultiplier === "function"
        ? getGameWeatherActionMultiplier("rest")
        : 1;
    const restAmount = diff * (2 + (0.1 * (getEffectiveLevel("rest") + getEffectiveLevel("vit") / 5)))
        * restMultiplier;

    staminaRegen(restAmount);
    if (player.stamina > player.maxstamina) player.stamina = player.maxstamina;
    player.rest.addexp(restAmount);
    player.vit.addexp(restAmount / 10);
}

function runResearchProduction(diff) {
    if (actionStates.research !== Activity.Active) return;

    const technology = activeResearchTechnology;
    if (!technology) return;

    const researchPower = getEffectiveLevel("int") * getEffectiveLevel("science") * diff * getActionEffectivenessMultiplier("research");
    const levelCompleted = technology.applyResearchProgress(researchPower, player);

    if (levelCompleted) {
        logMessage(technology.status === TechnologyStatus.Completed
            ? technology.name + " has been fully researched"
            : technology.name + " has been researched to level " + technology.level);

        const nextTechnology = getNextQueuedResearch();
        if (nextTechnology) {
            beginResearch(nextTechnology);
            logMessage("Now researching " + nextTechnology.name);
        } else {
            const autoTechnology = COZY_SCIENCE_TECHNOLOGY.level >= 2 && isHabitEnabled("cozyScienceAutoNext")
                ? getCheapestAvailableResearch()
                : null;
            if (autoTechnology) {
                beginResearch(autoTechnology);
                logMessage("Cozy science starts researching " + autoTechnology.name);
            } else {
                researchUnlocked = false;
                activeResearchTechnology = null;
                updateTechnologyButtons();
            }
        }
    }
}

function runDayDreamProduction(diff) {
    if (actionStates.daydream !== Activity.Active) return;

    if (getEffectiveLevel("int") > 1) {
        player.autism.addexp(((getEffectiveLevel("int") + getEffectiveLevel("ins") + getEffectiveLevel("sou")) / 3) * diff);
    }

    const chance = 1 - Math.pow(1 - DAYDREAM_EXP_CHANCE, diff);
    if (Math.random() >= chance) return;

    const stats = [player.int, player.ins, player.sou];
    const stat = stats[Math.floor(Math.random() * stats.length)];
    stat.addexp(25 * getActionEffectivenessMultiplier("daydream"));

    const dayDreamMessages = [
        "Your mind wanders and you gain a little " + stat.name + " experience",
        "A random thought grants you some " + stat.name + " experience",
        "You daydream about something useful and gain " + stat.name + " experience",
        "Your imagination sharpens your " + stat.name + " a little",
        "Lost in thought, you learn something new about " + stat.name,
        "You stare at the clouds and suddenly understand your " + stat.name,
        "A stray idea bumps into your " + stat.name + " and leaves some experience",
        "While doing absolutely nothing, your " + stat.name + " grows a tiny bit",
        "Your " + stat.name + " benefits from a thoroughly unproductive daydream",
        "You imagine something absurd and your " + stat.name + " quietly improves",
        "A pointless thought turns out to be surprisingly educational for your " + stat.name,
        "You get lost in a daydream and return with a little " + stat.name + " experience",
        "Somewhere in your wandering thoughts, your " + stat.name + " finds a spark",
        "Your " + stat.name + " absorbs a random daydream",
        "You ponder the meaning of nothing and gain " + stat.name + " experience",
        "A lazy epiphany adds a little to your " + stat.name,
        "Your " + stat.name + " levels up its imagination, slightly",
        "You mentally chase a butterfly and catch some " + stat.name + " experience",
        "Nothing happens, but your " + stat.name + " learns something anyway",
        "You blankly stare ahead and your " + stat.name + " makes a small leap",
        "An intrusive thought donates a bit of experience to your " + stat.name,
        "You daydream about a better world and your " + stat.name + " approves",
        "Your " + stat.name + " quietly appreciates this moment of wasted time",
        "A fleeting fantasy leaves a faint trace of " + stat.name + " experience",
        "You wonder why you are even doing this and your " + stat.name + " rewards you with experience",
    ];
    logMessage(dayDreamMessages[Math.floor(Math.random() * dayDreamMessages.length)]);
}

function getForagePower() {
    const tile = typeof currentTile !== "undefined" && currentTile ? currentTile : {};
    const land = tile.land || {};
    const space = tile.space || {};

    // Local land only: what was actually generated on this tile. Global
    // landTotals grows forever and made remote exploration buff every tile.
    const localLand = Math.max(1,
        (Number(land.trees) || 0)
        + (Number(land.grass) || 0)
        + (Number(space.Bushes) || 0));

    const explorationFactor = 0.5 + getEffectiveLevel("exploration") / 10;

    return Math.pow(
        getEffectiveLevel("agi") * 0.9 * getEffectiveLevel("forage") * explorationFactor,
        1 / 3
    ) * (1 + Math.log(localLand) / 10);
}

function getActionEffectiveness(actionId) {
    const distanceDivisor = 1 + Math.abs(currentTile.x + currentTile.y) / 10;

    switch (actionId) {
        case "explore":
        case "search":
            return Math.sqrt(getEffectiveLevel("per") * getEffectiveLevel("exploration")) * (getEffectiveLevel("speed") / PERCENT) / distanceDivisor;
        case "research":
            return getEffectiveLevel("int") * getEffectiveLevel("science");
        case "forage":
            return getForagePower();
        case "makefibers":
            return getMakeFibersEffectiveness();
        case "daydream":
            return (getEffectiveLevel("int") + getEffectiveLevel("ins") + getEffectiveLevel("sou")) / 3;
        case "rest":
            return 1 + (0.1 * (getEffectiveLevel("rest") + getEffectiveLevel("vit") / 5));
        default:
            return 1;
    }
}

function consumeActionStamina(action, diff) {
    const staminaPerSecond = typeof action.staminaPerSecond === "function"
        ? action.staminaPerSecond()
        : action.staminaPerSecond;
    if (!staminaPerSecond) return;

    const consumption = staminaPerSecond * getActionEffectiveness(action.id) * diff;
    const staminaBefore = player.stamina;
    player.stamina = Math.max(0, player.stamina - consumption);
    trackHungerSpending("stamina", staminaBefore - player.stamina);
}

function runForageProduction(diff) {
    if (actionStates.forage !== Activity.Active) return;
    if (currentTile.hiddenstuff <= 0) return;

    const powerPerSecond = getForagePower()
        * getActionEffectivenessMultiplier("forage")
        * (typeof getDarkForageMultiplier === "function"
            ? getDarkForageMultiplier()
            : 1);
    if (powerPerSecond <= 0) return;

    // Resource generation has its own clock: one generation tick every
    // FORAGE_RESOURCE_TICK_SECONDS seconds. Each tick processes one second of
    // forage power, so resources come 10x slower than before while
    // experience keeps its old per-second rate.
    currentTile.forageTickProgress =
        (currentTile.forageTickProgress || 0) + diff;

    let ticks = Math.floor(
        currentTile.forageTickProgress / FORAGE_RESOURCE_TICK_SECONDS
    );
    if (ticks <= 0) return;

    // Full ticks are consumed even when the safety cap drops some of them, so
    // a background tab does not leave a huge backlog behind it.
    currentTile.forageTickProgress -= ticks * FORAGE_RESOURCE_TICK_SECONDS;
    ticks = Math.min(ticks, FORAGE_MAX_RESOURCE_TICKS_PER_LOOP);

    for (let tick = 0; tick < ticks; tick++) {
        if (currentTile.hiddenstuff <= 0) break;
        runForageGenerationTick(powerPerSecond);
    }
}

function runForageGenerationTick(powerPerSecond) {
    const foragePower = Math.min(powerPerSecond, currentTile.hiddenstuff);
    if (foragePower <= 0) return;

    const forageBudget = (currentTile.forageRemainder || 0) + foragePower;
    const forageBatches = Math.min(
        Math.floor(forageBudget),
        FORAGE_MAX_BATCHES_PER_TICK
    );

    currentTile.forageRemainder = forageBudget - forageBatches;
    currentTile.hiddenstuff = round2(
        Math.max(0, currentTile.hiddenstuff - foragePower)
    );

    // One tick replaces 10 seconds of the old per-second experience gain.
    player.per.addexp(
        (1 + FORAGE_PERCEPTION_EXP_PER_UNIT * foragePower)
        * FORAGE_RESOURCE_TICK_EXP_MULTIPLIER
    );
    player.forage.addexp(
        (1 + FORAGE_EXP_PER_UNIT * foragePower * 50)
        * FORAGE_RESOURCE_TICK_EXP_MULTIPLIER
    );

    if (forageBatches > 0) forage(forageBatches);
}

// "Make fibers": each effectiveness unit processes 10 grass into 0.1 fibers.
// Agility is used as the dexterity value in the formula.
function getMakeFibersEffectiveness() {
    const dexterity = getEffectiveLevel("agi");
    const survival = getEffectiveLevel("survival");
    const ropemaking = getEffectiveLevel("ropemaking");
    const tailoring = getEffectiveLevel("tailoring");

    return Math.sqrt(
        dexterity * (survival * 5 + ropemaking * 3 + tailoring * 2) / 5
    );
}

function getMakeFibersQuality() {
    const grassStack = resources[RESOURCE_IDS.GRASS];
    const grassQuality = grassStack && Number.isFinite(grassStack.quality)
        ? grassStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2((
        getEffectiveLevel("survival")
        + getEffectiveLevel("ropemaking")
        + getEffectiveLevel("tailoring")
        + grassQuality
    ) / 4);
}

function runMakeFibersProduction(diff) {
    if (actionStates.makefibers !== Activity.Active) return;

    const grassStack = resources[RESOURCE_IDS.GRASS];
    if (!grassStack || grassStack.amount <= 0) return;

    const effectiveness = getMakeFibersEffectiveness() * getActionProductionMultiplier("makefibers");
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / FIBER_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        grassStack.amount / FIBER_GRASS_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < FIBER_STAMINA_PER_BATCH) {
            logMessage("You are too tired to make fibers");
            stopTimedAction(getAction("makefibers"));
        }
        return;
    }

    grassStack.amount = round2(Math.max(
        0,
        grassStack.amount - batches * FIBER_GRASS_PER_BATCH
    ));
    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * FIBER_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(
        RESOURCE_IDS.FIBERS,
        round2(batches * FIBER_OUTPUT_PER_BATCH),
        getMakeFibersQuality()
    );

    player.survival.addexp(batches * FIBER_SURVIVAL_EXP);
    player.ropemaking.addexp(batches * FIBER_ROPEMAKING_EXP);
    player.tailoring.addexp(batches * FIBER_TAILORING_EXP);
}

// "Make shafts": each effectiveness unit turns 1 stick into 1 shaft.
// Carpentry replaces Survival, and Cutting power speeds the work up.
function getMakeShaftsEffectiveness() {
    const dexterity = getEffectiveLevel("agi");
    const carpentry = getEffectiveLevel("carpentry");

    const base = Math.sqrt(dexterity * carpentry);
    const cuttingPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("cutting") || 0)
        : 0;

    return base * (1 + cuttingPower * SHAFT_CUTTING_POWER_SPEED);
}

function getMakeShaftsQuality() {
    const stickStack = resources[RESOURCE_IDS.STICKS];
    const stickQuality = stickStack && Number.isFinite(stickStack.quality)
        ? stickStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2((getEffectiveLevel("carpentry") + stickQuality) / 2);
}

function runMakeShaftsProduction(diff) {
    if (actionStates.makeshafts !== Activity.Active) return;

    const stickStack = resources[RESOURCE_IDS.STICKS];
    if (!stickStack || stickStack.amount <= 0) return;

    const effectiveness = getMakeShaftsEffectiveness() * getActionProductionMultiplier("makeshafts");
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / SHAFT_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        stickStack.amount / SHAFT_STICKS_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < SHAFT_STAMINA_PER_BATCH) {
            logMessage("You are too tired to make shafts");
            stopTimedAction(getAction("makeshafts"));
        }
        return;
    }

    stickStack.amount = round2(Math.max(
        0,
        stickStack.amount - batches * SHAFT_STICKS_PER_BATCH
    ));
    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * SHAFT_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(
        RESOURCE_IDS.SHAFTS,
        round2(batches * SHAFT_OUTPUT_PER_BATCH),
        getMakeShaftsQuality()
    );

    player.carpentry.addexp(batches * SHAFT_CARPENTRY_EXP);
    player.agi.addexp(batches * SHAFT_AGI_EXP);
}

// "Make handle": each effectiveness unit turns 0.4 shafts into 1 handle.
// Everything else works exactly like Make shafts.
function getMakeHandlesEffectiveness() {
    const dexterity = getEffectiveLevel("agi");
    const carpentry = getEffectiveLevel("carpentry");

    const base = Math.sqrt(dexterity * carpentry);
    const cuttingPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("cutting") || 0)
        : 0;

    return base * (1 + cuttingPower * HANDLE_CUTTING_POWER_SPEED);
}

function getMakeHandlesQuality() {
    const shaftStack = resources[RESOURCE_IDS.SHAFTS];
    const shaftQuality = shaftStack && Number.isFinite(shaftStack.quality)
        ? shaftStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2((getEffectiveLevel("carpentry") + shaftQuality) / 2);
}

function runMakeHandlesProduction(diff) {
    if (actionStates.makehandles !== Activity.Active) return;

    const shaftStack = resources[RESOURCE_IDS.SHAFTS];
    if (!shaftStack || shaftStack.amount <= 0) return;

    const effectiveness = getMakeHandlesEffectiveness() * getActionProductionMultiplier("makehandles");
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / HANDLE_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        shaftStack.amount / HANDLE_SHAFTS_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < HANDLE_STAMINA_PER_BATCH) {
            logMessage("You are too tired to make handles");
            stopTimedAction(getAction("makehandles"));
        }
        return;
    }

    shaftStack.amount = round2(Math.max(
        0,
        shaftStack.amount - batches * HANDLE_SHAFTS_PER_BATCH
    ));
    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * HANDLE_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(
        RESOURCE_IDS.HANDLES,
        round2(batches * HANDLE_OUTPUT_PER_BATCH),
        getMakeHandlesQuality()
    );

    player.carpentry.addexp(batches * HANDLE_CARPENTRY_EXP);
    player.agi.addexp(batches * HANDLE_AGI_EXP);
}

// "Make planks": each effectiveness unit consumes 0.01 Wooden logs and turns
// them into 0.1 Wooden Plank. Carpentry and Agility drive the work, and
// Chopping power speeds it up.
function getMakePlanksEffectiveness() {
    const dexterity = getEffectiveLevel("agi");
    const carpentry = getEffectiveLevel("carpentry");

    const base = Math.sqrt(dexterity * carpentry);
    const choppingPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("chopping") || 0)
        : 0;

    return base * (1 + choppingPower * PLANK_CHOPPING_POWER_SPEED);
}

function getMakePlanksQuality() {
    const logStack = resources[RESOURCE_IDS.WOODEN_LOGS];
    const logQuality = logStack && Number.isFinite(logStack.quality)
        ? logStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2((getEffectiveLevel("carpentry") + logQuality) / 2);
}

function runMakePlanksProduction(diff) {
    if (actionStates.makeplanks !== Activity.Active) return;

    const logStack = resources[RESOURCE_IDS.WOODEN_LOGS];
    if (!logStack || logStack.amount <= 0) return;

    const effectiveness = getMakePlanksEffectiveness() * getActionProductionMultiplier("makeplanks");
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / PLANK_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        logStack.amount / PLANK_LOGS_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < PLANK_STAMINA_PER_BATCH) {
            logMessage("You are too tired to make planks");
            stopTimedAction(getAction("makeplanks"));
        }
        return;
    }

    // Keep four decimals so the 0.01 log -> 0.1 plank ratio stays exact even
    // when Chopping power makes the processing faster than one batch per tick.
    const consumedLogs = Math.round(
        batches * PLANK_LOGS_PER_BATCH * 10000
    ) / 10000;
    const producedPlanks = Math.round(
        batches * PLANK_OUTPUT_PER_BATCH * 10000
    ) / 10000;
    logStack.amount = Math.max(0, logStack.amount - consumedLogs);

    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * PLANK_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(
        RESOURCE_IDS.WOODEN_PLANK,
        producedPlanks,
        getMakePlanksQuality()
    );

    player.carpentry.addexp(batches * PLANK_CARPENTRY_EXP);
    player.agi.addexp(batches * PLANK_AGI_EXP);
}

// "Make wooden beams": each effectiveness unit consumes 0.1 Wooden logs and
// turns them into 0.01 Wooden Beams. Carpentry and Agility drive the work, and
// Chopping power speeds it up.
function getMakeWoodenBeamsEffectiveness() {
    const dexterity = getEffectiveLevel("agi");
    const carpentry = getEffectiveLevel("carpentry");

    const base = Math.sqrt(dexterity * carpentry);
    const choppingPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("chopping") || 0)
        : 0;

    return base * (1 + choppingPower * BEAM_CHOPPING_POWER_SPEED);
}

function getMakeWoodenBeamsQuality() {
    const logStack = resources[RESOURCE_IDS.WOODEN_LOGS];
    const logQuality = logStack && Number.isFinite(logStack.quality)
        ? logStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2((getEffectiveLevel("carpentry") + logQuality) / 2);
}

function runMakeWoodenBeamsProduction(diff) {
    if (actionStates.makewoodenbeams !== Activity.Active) return;

    const logStack = resources[RESOURCE_IDS.WOODEN_LOGS];
    if (!logStack || logStack.amount <= 0) return;

    const effectiveness = getMakeWoodenBeamsEffectiveness() * getActionProductionMultiplier("makewoodenbeams");
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / BEAM_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        logStack.amount / BEAM_LOGS_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < BEAM_STAMINA_PER_BATCH) {
            logMessage("You are too tired to make wooden beams");
            stopTimedAction(getAction("makewoodenbeams"));
        }
        return;
    }

    // Keep four decimals so the 0.1 log -> 0.01 beam ratio stays exact even
    // when Chopping power makes the processing faster than one batch per tick.
    const consumedLogs = Math.round(
        batches * BEAM_LOGS_PER_BATCH * 10000
    ) / 10000;
    const producedBeams = Math.round(
        batches * BEAM_OUTPUT_PER_BATCH * 10000
    ) / 10000;
    logStack.amount = Math.max(0, logStack.amount - consumedLogs);

    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * BEAM_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(
        RESOURCE_IDS.WOODEN_BEAMS,
        producedBeams,
        getMakeWoodenBeamsQuality()
    );

    player.carpentry.addexp(batches * BEAM_CARPENTRY_EXP);
    player.agi.addexp(batches * BEAM_AGI_EXP);
}

// Water may come from the tile's generated space, a river, searched land or a
// water biome. Salt water is accepted too, since it is still water.
const WATER_TILE_TYPE_IDS = Object.freeze([0, 1, 2, 17, 20, 92]);

function hasWaterOnCurrentTile() {
    if (typeof currentTile === "undefined" || !currentTile) return false;

    // A completed Well is a permanent water source for Mortar and any future
    // water-based recipe.
    if (typeof BUILDING_IDS !== "undefined"
        && BUILDING_IDS.WELL
        && typeof getBestCompletedBuildingQuality === "function"
        && getBestCompletedBuildingQuality(BUILDING_IDS.WELL, currentTile) !== null) {
        return true;
    }

    const space = currentTile.space || {};
    if ((Number(space.Water) || 0) > 0
        || (Number(space.SaltWater) || 0) > 0) {
        return true;
    }
    if (currentTile.land && (Number(currentTile.land.water) || 0) > 0) {
        return true;
    }
    if (currentTile.river === true) return true;

    return WATER_TILE_TYPE_IDS.includes(Number(currentTile.type));
}

// "Make mortar": each effectiveness unit consumes 20 Sand and 20 Clay and
// produces 1 Mortar. Agility and Alchemy drive the work.
function getMakeMortarEffectiveness() {
    const agility = getEffectiveLevel("agi");
    const alchemy = getEffectiveLevel("alchemy");
    return Math.sqrt(agility * alchemy);
}

function getMakeMortarQuality() {
    const sandStack = resources[RESOURCE_IDS.SAND];
    const clayStack = resources[RESOURCE_IDS.CLAY];
    const sandQuality = sandStack && Number.isFinite(sandStack.quality)
        ? sandStack.quality
        : RESOURCE_DEFAULT_QUALITY;
    const clayQuality = clayStack && Number.isFinite(clayStack.quality)
        ? clayStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2(
        (getEffectiveLevel("alchemy") + (sandQuality + clayQuality) / 2) / 2
    );
}

function runMakeMortarProduction(diff) {
    if (actionStates.makemortar !== Activity.Active) return;

    if (!hasWaterOnCurrentTile()) {
        logMessage("You need water to make mortar");
        stopTimedAction(getAction("makemortar"));
        return;
    }

    const sandStack = resources[RESOURCE_IDS.SAND];
    const clayStack = resources[RESOURCE_IDS.CLAY];
    if (!sandStack || !clayStack || sandStack.amount <= 0 || clayStack.amount <= 0) {
        return;
    }

    const effectiveness = getMakeMortarEffectiveness() * getActionProductionMultiplier("makemortar");
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / MORTAR_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        sandStack.amount / MORTAR_SAND_PER_BATCH,
        clayStack.amount / MORTAR_CLAY_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < MORTAR_STAMINA_PER_BATCH) {
            logMessage("You are too tired to make mortar");
            stopTimedAction(getAction("makemortar"));
        }
        return;
    }

    const consumedSand = Math.round(
        batches * MORTAR_SAND_PER_BATCH * 10000
    ) / 10000;
    const consumedClay = Math.round(
        batches * MORTAR_CLAY_PER_BATCH * 10000
    ) / 10000;
    const producedMortar = Math.round(
        batches * MORTAR_OUTPUT_PER_BATCH * 10000
    ) / 10000;

    sandStack.amount = Math.max(0, sandStack.amount - consumedSand);
    clayStack.amount = Math.max(0, clayStack.amount - consumedClay);

    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * MORTAR_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(
        RESOURCE_IDS.MORTAR,
        producedMortar,
        getMakeMortarQuality()
    );

    player.alchemy.addexp(batches * MORTAR_ALCHEMY_EXP);
    player.agi.addexp(batches * MORTAR_AGI_EXP);
}

// "Smelt ore" actions: Vitality, Smithing and the current tile's Smelt power
// drive the work. A batch consumes 10 ore and 100 Heat Units and produces one
// metal bar. Richer metals require more Smelt power.
function getSmithingEffectiveness() {
    const vitality = Math.max(1, getEffectiveLevel("vit") || 0);
    const smithing = Math.max(1, getEffectiveLevel("smithing") || 0);
    const smeltPower = typeof getCharacterHousePower === "function"
        ? Math.max(0, getCharacterHousePower("smelt"))
        : 0;

    return Math.sqrt(vitality * smithing)
        * (1 + smeltPower * SMELT_POWER_SPEED);
}

function getSmeltingQuality(oreId) {
    const oreStack = resources[oreId];
    const oreQuality = oreStack && Number.isFinite(oreStack.quality)
        ? oreStack.quality
        : RESOURCE_DEFAULT_QUALITY;

    return round2(
        (getEffectiveLevel("smithing") + oreQuality) / 2
    );
}

function canSmeltOre(oreId, requiredPower) {
    if (typeof getCharacterHousePower !== "function") return false;
    if (getCharacterHousePower("smelt") < requiredPower) return false;
    if (getEffectiveLevel("smithing") < 1) return false;

    const oreStack = resources[oreId];
    const heatStack = resources[RESOURCE_IDS.HEAT_UNITS];
    return !!oreStack
        && oreStack.amount >= SMELT_ORE_PER_BATCH
        && !!heatStack
        && heatStack.amount >= SMELT_HEAT_PER_BATCH
        && player.stamina >= SMELT_STAMINA_PER_BATCH;
}

function isSmeltComplete(oreId, requiredPower) {
    if (typeof getCharacterHousePower !== "function") return true;
    if (getCharacterHousePower("smelt") < requiredPower) return true;

    const oreStack = resources[oreId];
    const heatStack = resources[RESOURCE_IDS.HEAT_UNITS];
    return !oreStack
        || oreStack.amount < SMELT_ORE_PER_BATCH
        || !heatStack
        || heatStack.amount < SMELT_HEAT_PER_BATCH;
}

function runSmeltProduction(diff, actionId, oreId, barId, requiredPower) {
    if (actionStates[actionId] !== Activity.Active) return;

    const oreStack = resources[oreId];
    const heatStack = resources[RESOURCE_IDS.HEAT_UNITS];
    if (!oreStack || !heatStack) return;

    if (typeof getCharacterHousePower !== "function"
        || getCharacterHousePower("smelt") < requiredPower) {
        logMessage("You need at least " + requiredPower + " Smelt power");
        stopTimedAction(getAction(actionId));
        return;
    }

    const effectiveness = getSmithingEffectiveness()
        * getActionProductionMultiplier(actionId);
    if (effectiveness <= 0) return;

    const batchesByStamina = player.stamina / SMELT_STAMINA_PER_BATCH;
    const batches = Math.min(
        effectiveness * diff,
        oreStack.amount / SMELT_ORE_PER_BATCH,
        heatStack.amount / SMELT_HEAT_PER_BATCH,
        batchesByStamina
    );

    if (batches <= 0) {
        if (player.stamina < SMELT_STAMINA_PER_BATCH) {
            logMessage("You are too tired to smelt metal");
            stopTimedAction(getAction(actionId));
        }
        return;
    }

    const consumedOre = Math.round(
        batches * SMELT_ORE_PER_BATCH * 10000
    ) / 10000;
    const consumedHeat = Math.round(
        batches * SMELT_HEAT_PER_BATCH * 10000
    ) / 10000;
    const producedBars = Math.round(
        batches * SMELT_OUTPUT_PER_BATCH * 10000
    ) / 10000;

    oreStack.amount = Math.max(0, oreStack.amount - consumedOre);
    heatStack.amount = Math.max(0, heatStack.amount - consumedHeat);

    const staminaBefore = player.stamina;
    player.stamina = round2(Math.max(
        0,
        player.stamina - batches * SMELT_STAMINA_PER_BATCH
    ));
    trackHungerSpending("stamina", staminaBefore - player.stamina);

    addResource(barId, producedBars, getSmeltingQuality(oreId));

    player.smithing.addexp(batches * SMELT_SMITHING_EXP);
    player.vit.addexp(batches * SMELT_VIT_EXP);
}

// Burning fuel is an instant Production action. WorkPower(STR, Smithing)
// scales the fuel cost, the Heat Units produced and the Ash produced. Smelt
// power multiplies that amount again.
function getBurnWorkPower() {
    const strength = Math.max(1, getEffectiveLevel("str") || 0);
    const smithing = Math.max(1, getEffectiveLevel("smithing") || 0);
    return 1 + Math.sqrt(strength * smithing);
}

function getBurnSmeltPower() {
    return typeof getCharacterHousePower === "function"
        ? Math.max(0, getCharacterHousePower("smelt"))
        : 0;
}

function getBurnMultiplier() {
    return getBurnWorkPower() * getBurnSmeltPower();
}

function getBurnScaledAmount(baseAmount) {
    const base = Math.max(0, Number(baseAmount) || 0);
    return round2(base * getBurnMultiplier());
}

function canBurnFuel(fuel) {
    if (!fuel) return false;
    if (getBurnMultiplier() <= 0) return false;

    const stack = resources[fuel.resourceId];
    return !!stack
        && stack.amount >= getBurnScaledAmount(fuel.baseAmount);
}

function performBurnFuel(fuel) {
    if (!fuel) return false;

    const multiplier = getBurnMultiplier();
    if (multiplier <= 0) {
        logMessage("You need Smelt power to burn fuel");
        return false;
    }

    const stack = resources[fuel.resourceId];
    const required = getBurnScaledAmount(fuel.baseAmount);
    if (!stack || stack.amount < required) {
        const definition = RESOURCE_DEFS[fuel.resourceId];
        logMessage("Not enough " + (definition ? definition.name : "fuel") + " to burn");
        return false;
    }

    const quality = Number.isFinite(stack.quality) && stack.quality > 0
        ? stack.quality
        : RESOURCE_DEFAULT_QUALITY;
    const heat = getBurnScaledAmount(fuel.baseHeat);
    const ash = getBurnScaledAmount(fuel.baseAsh);

    stack.amount = round2(Math.max(0, stack.amount - required));
    addResource(RESOURCE_IDS.HEAT_UNITS, heat, quality);
    addResource(RESOURCE_IDS.ASH, ash, quality);

    const definition = RESOURCE_DEFS[fuel.resourceId];
    logMessage("Burned " + required + " " + (definition ? definition.name : "fuel")
        + " for " + heat + " Heat Units and " + ash + " Ash.");

    if (typeof renderResources === "function") renderResources();
    if (typeof refreshActionButtons === "function") refreshActionButtons(true);
    return true;
}

const FORAGE_ROLLS = [
    [3, RESOURCE_IDS.BLUEBERRY, 0.1],
    [5, RESOURCE_IDS.RASPBERRY, 0.1],
    [10, RESOURCE_IDS.CORNBERRY, 0.1],
    [15, RESOURCE_IDS.STRAWBERRY, 0.1],
    [18, RESOURCE_IDS.HONEYSUCKLE, 0.1],
    [20, RESOURCE_IDS.SEABUCKTHORN, 0.1],
    [25, RESOURCE_IDS.WATERMELON, 15],
    [4, RESOURCE_IDS.BLACKBERRY, 0.1],
    [6, RESOURCE_IDS.LINGONBERRY, 0.1],
    [8, RESOURCE_IDS.CLOUDBERRY, 0.1],
    [10, RESOURCE_IDS.GOOSEBERRY, 0.1],
    [12, RESOURCE_IDS.ELDERBERRY, 0.1],
    [9, RESOURCE_IDS.CURRANT, 0.1],
    [14, RESOURCE_IDS.CRANBERRY, 0.1],
    [20, RESOURCE_IDS.MULBERRY, 0.1],
    [3, RESOURCE_IDS.BUTTON_MUSHROOM, 0.15],
    [5, RESOURCE_IDS.MEADOW_MUSHROOM, 0.15],
    [6, RESOURCE_IDS.OYSTER_MUSHROOM, 0.15],
    [7, RESOURCE_IDS.HONEY_FUNGUS, 0.12],
    [8, RESOURCE_IDS.CHANTERELLE, 0.1],
    [9, RESOURCE_IDS.RUSSULA, 0.12],
    [10, RESOURCE_IDS.SHIITAKE, 0.1],
    [12, RESOURCE_IDS.PORCINI, 0.1],
    [14, RESOURCE_IDS.BOLETE, 0.08],
    [18, RESOURCE_IDS.MOREL, 0.08],
    [8, RESOURCE_IDS.BANANAS, 0.2],
    [9, RESOURCE_IDS.COCONUTS, 0.2],
    [4, RESOURCE_IDS.APPLES, 0.15],
    [5, RESOURCE_IDS.PEARS, 0.15],
    [7, RESOURCE_IDS.ORANGES, 0.15],
    [8, RESOURCE_IDS.LEMONS, 0.12],
    [8, RESOURCE_IDS.LIMES, 0.12],
    [5, RESOURCE_IDS.CHERRIES, 0.1],
    [5, RESOURCE_IDS.PLUMS, 0.12],
    [7, RESOURCE_IDS.PEACHES, 0.15],
    [7, RESOURCE_IDS.APRICOTS, 0.12],
    [8, RESOURCE_IDS.FIGS, 0.12],
    [9, RESOURCE_IDS.POMEGRANATES, 0.12],
    [8, RESOURCE_IDS.OLIVES, 0.1],
    [10, RESOURCE_IDS.MANGOES, 0.2],
    [10, RESOURCE_IDS.PAPAYAS, 0.2],
    [9, RESOURCE_IDS.AVOCADOS, 0.18],
    [8, RESOURCE_IDS.GRAPEFRUITS, 0.15],
    [6, RESOURCE_IDS.PERSIMMONS, 0.12],
    [5, RESOURCE_IDS.QUINCES, 0.12],
    [9, RESOURCE_IDS.GUAVAS, 0.15],
    [10, RESOURCE_IDS.LYCHEES, 0.12],
    [12, RESOURCE_IDS.DRAGONFRUITS, 0.15],
    [5, RESOURCE_IDS.MULBERRIES, 0.1],
    [4, RESOURCE_IDS.ROWAN_BERRIES, 0.1],
    [4, RESOURCE_IDS.BIRD_CHERRIES, 0.1],
    [5, RESOURCE_IDS.MEDLARS, 0.1],
    [4, RESOURCE_IDS.SERVICEBERRIES, 0.1],
    [6, RESOURCE_IDS.WALNUTS, 0.1],
    [5, RESOURCE_IDS.HAZELNUTS, 0.1],
    [8, RESOURCE_IDS.ALMONDS, 0.1],
    [6, RESOURCE_IDS.CHESTNUTS, 0.1],
    [8, RESOURCE_IDS.PECANS, 0.1],
    [9, RESOURCE_IDS.PISTACHIOS, 0.1],
    [10, RESOURCE_IDS.CASHEWS, 0.1],
    [10, RESOURCE_IDS.MACADAMIAS, 0.1],
    [12, RESOURCE_IDS.BRAZIL_NUTS, 0.1],
    [7, RESOURCE_IDS.HICKORY_NUTS, 0.1],
    [5, RESOURCE_IDS.BEECHNUTS, 0.08],
    [3, RESOURCE_IDS.ACORNS, 0.1],
    [4, RESOURCE_IDS.PINE_NUTS, 0.08],
    [2, RESOURCE_IDS.ROCKS, 1],
    [1, RESOURCE_IDS.BRANCHES, 0.5],
    [3, RESOURCE_IDS.STICKS, 1],
    [1, RESOURCE_IDS.LEAVES, 0.1],
    [1, RESOURCE_IDS.GRASS, 0.1],
    [4, RESOURCE_IDS.FLINT, 1],
];

const FORAGE_SPACE_DEPENDENCIES = Object.freeze({
    [RESOURCE_IDS.BLUEBERRY]: ["Bushes"],
    [RESOURCE_IDS.RASPBERRY]: ["Bushes"],
    [RESOURCE_IDS.CORNBERRY]: ["Bushes"],
    [RESOURCE_IDS.STRAWBERRY]: ["Bushes"],
    [RESOURCE_IDS.HONEYSUCKLE]: ["Bushes"],
    [RESOURCE_IDS.SEABUCKTHORN]: ["Bushes"],
    [RESOURCE_IDS.WATERMELON]: ["Bushes"],
    [RESOURCE_IDS.BLACKBERRY]: ["Bushes"],
    [RESOURCE_IDS.LINGONBERRY]: ["Bushes"],
    [RESOURCE_IDS.CLOUDBERRY]: ["Bushes"],
    [RESOURCE_IDS.GOOSEBERRY]: ["Bushes"],
    [RESOURCE_IDS.ELDERBERRY]: ["Bushes"],
    [RESOURCE_IDS.CURRANT]: ["Bushes"],
    [RESOURCE_IDS.CRANBERRY]: ["Bushes", "Swamp"],
    [RESOURCE_IDS.MULBERRY]: ["Bushes", "Tree"],
    [RESOURCE_IDS.BUTTON_MUSHROOM]: ["Bushes", "Grass"],
    [RESOURCE_IDS.OYSTER_MUSHROOM]: ["Tree"],
    [RESOURCE_IDS.CHANTERELLE]: ["Tree", "Bushes"],
    [RESOURCE_IDS.PORCINI]: ["Tree"],
    [RESOURCE_IDS.SHIITAKE]: ["Tree"],
    [RESOURCE_IDS.MOREL]: ["Grass", "FertileLand"],
    [RESOURCE_IDS.HONEY_FUNGUS]: ["Tree", "Bushes"],
    [RESOURCE_IDS.RUSSULA]: ["Bushes", "Tree"],
    [RESOURCE_IDS.BOLETE]: ["Tree", "Bushes"],
    [RESOURCE_IDS.MEADOW_MUSHROOM]: ["Grass"],
    [RESOURCE_IDS.BANANAS]: ["Banana Tree"],
    [RESOURCE_IDS.COCONUTS]: ["Coconut Palm"],
    [RESOURCE_IDS.APPLES]: ["Apple Tree"],
    [RESOURCE_IDS.PEARS]: ["Pear Tree"],
    [RESOURCE_IDS.ORANGES]: ["Orange Tree"],
    [RESOURCE_IDS.LEMONS]: ["Lemon Tree"],
    [RESOURCE_IDS.LIMES]: ["Lime Tree"],
    [RESOURCE_IDS.CHERRIES]: ["Cherry Tree"],
    [RESOURCE_IDS.PLUMS]: ["Plum Tree"],
    [RESOURCE_IDS.PEACHES]: ["Peach Tree"],
    [RESOURCE_IDS.APRICOTS]: ["Apricot Tree"],
    [RESOURCE_IDS.FIGS]: ["Fig Tree"],
    [RESOURCE_IDS.POMEGRANATES]: ["Pomegranate Tree"],
    [RESOURCE_IDS.OLIVES]: ["Olive Tree"],
    [RESOURCE_IDS.MANGOES]: ["Mango Tree"],
    [RESOURCE_IDS.PAPAYAS]: ["Papaya Tree"],
    [RESOURCE_IDS.AVOCADOS]: ["Avocado Tree"],
    [RESOURCE_IDS.GRAPEFRUITS]: ["Grapefruit Tree"],
    [RESOURCE_IDS.PERSIMMONS]: ["Persimmon Tree"],
    [RESOURCE_IDS.QUINCES]: ["Quince Tree"],
    [RESOURCE_IDS.GUAVAS]: ["Guava Tree"],
    [RESOURCE_IDS.LYCHEES]: ["Lychee Tree"],
    [RESOURCE_IDS.DRAGONFRUITS]: ["Dragonfruit Tree"],
    [RESOURCE_IDS.MULBERRIES]: ["Mulberry Tree"],
    [RESOURCE_IDS.ROWAN_BERRIES]: ["Rowan Tree"],
    [RESOURCE_IDS.BIRD_CHERRIES]: ["Bird Cherry Tree"],
    [RESOURCE_IDS.MEDLARS]: ["Medlar Tree"],
    [RESOURCE_IDS.SERVICEBERRIES]: ["Service Tree"],
    [RESOURCE_IDS.WALNUTS]: ["Walnut Tree"],
    [RESOURCE_IDS.HAZELNUTS]: ["Hazelnut Tree"],
    [RESOURCE_IDS.ALMONDS]: ["Almond Tree"],
    [RESOURCE_IDS.CHESTNUTS]: ["Chestnut Tree"],
    [RESOURCE_IDS.PECANS]: ["Pecan Tree"],
    [RESOURCE_IDS.PISTACHIOS]: ["Pistachio Tree"],
    [RESOURCE_IDS.CASHEWS]: ["Cashew Tree"],
    [RESOURCE_IDS.MACADAMIAS]: ["Macadamia Tree"],
    [RESOURCE_IDS.BRAZIL_NUTS]: ["Brazil Nut Tree"],
    [RESOURCE_IDS.HICKORY_NUTS]: ["Hickory Tree"],
    [RESOURCE_IDS.BEECHNUTS]: ["Beech Tree"],
    [RESOURCE_IDS.ACORNS]: ["Oak Tree"],
    [RESOURCE_IDS.PINE_NUTS]: ["Pine Tree"],
    [RESOURCE_IDS.ROCKS]: ["Rock"],
    [RESOURCE_IDS.BRANCHES]: ["Bushes", "Tree"],
    [RESOURCE_IDS.STICKS]: ["Bushes", "Tree"],
    [RESOURCE_IDS.LEAVES]: ["Bushes", "Tree"],
    [RESOURCE_IDS.GRASS]: ["Bushes", "Tree"],
    [RESOURCE_IDS.FLINT]: ["Rock"],
});

function getForageSpaceElementAmount(space, element) {
    if (element === "Tree") {
        // Every named fruit/nut tree counts as Tree for tree-dependent forage.
        return Object.keys(space).reduce(function (sum, name) {
            const isTree = typeof isTreeSpaceElement === "function"
                ? isTreeSpaceElement(name)
                : name === "Tree";
            return sum + (isTree ? (Number(space[name]) || 0) : 0);
        }, 0);
    }

    return Number(space[element]) || 0;
}

function getForageSpaceInfo(resourceId) {
    const dependencies = FORAGE_SPACE_DEPENDENCIES[resourceId];
    if (!dependencies) return null;

    const space = currentTile.space || {};
    const totalSpace = Object.values(space).reduce((sum, amount) => sum + (Number(amount) || 0), 0) || 1000;
    const amount = dependencies.reduce(function (sum, element) {
        return sum + getForageSpaceElementAmount(space, element);
    }, 0);
    return { amount, totalSpace };
}

function getForageSpaceMultiplier(resourceId) {
    const info = getForageSpaceInfo(resourceId);
    if (!info) return 1;
    return Math.min(1, info.amount / info.totalSpace);
}

function getForageQuantityMultiplier(resourceId) {
    const info = getForageSpaceInfo(resourceId);
    return info ? 1 + info.amount / 1000 : 1;
}

// Base amount produced by the tile/space curve. Equipment bonuses are applied
// after this function returns, so items never change the base forage formula.
function getForageBaseAmount(resourceId, profitAmount) {
    const resourceMultiplier = getResourceMultiplier(currentTile, resourceId);
    const spaceQuantityMultiplier = getForageQuantityMultiplier(resourceId);
    return profitAmount * resourceMultiplier * spaceQuantityMultiplier;
}

// Final forage amount: base formula first, equipped-item bonus strictly last.
function getForageAmount(resourceId, profitAmount) {
    const baseAmount = getForageBaseAmount(resourceId, profitAmount);
    const itemAmountMultiplier = getEquippedStatMultiplier("forageQuantity")
        * getGlobalPropertyMultiplier("harvestForageAmount");
    return baseAmount * itemAmountMultiplier / FORAGE_AMOUNT_DIVISOR;
}

function forage(amount){
    logMessage('foragerolls' + amount);
    while (amount > 0){
        if (player.stamina > MIN_STAMINA_TO_FORAGE){
            for (const [difficulty, resourceId, profitAmount] of FORAGE_ROLLS) {
                forageRoll(difficulty, resourceId, profitAmount);
            }
            forageHerbRoll();
            foragePlantRoll();
            amount -= 1;
            logMessage('berrydice X'+ amount);
            const staminaBefore = player.stamina;
            player.stamina = Math.max(0, player.stamina - FORAGE_STAMINA_COST * getActionEffectiveness("forage"));
            trackHungerSpending("stamina", staminaBefore - player.stamina);
        } else {
            clickAction("forage");
            logMessage('you are too tired and cannot forage anymore');
            amount = 0;

        }
    }
}

// A herb can be foraged only on a tile with a matching biome and tile
// temperature. The biome list and temperature range live in HERB_DEFS.
function isHerbAvailableOnTile(herb, tile) {
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!herb || !target) return false;

    const biome = Number(target.type);
    if (Number.isFinite(biome) && herb.biomes.indexOf(biome) === -1) {
        return false;
    }

    const temperature = Number(target.temperature);
    if (Number.isFinite(temperature)
        && (temperature < herb.tempMin || temperature > herb.tempMax)) {
        return false;
    }

    return true;
}

function getEligibleHerbsOnTile(tile) {
    if (typeof HERB_DEFS === "undefined" || !Array.isArray(HERB_DEFS)) return [];
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!target) return [];

    return HERB_DEFS.filter(function (herb) {
        return isHerbAvailableOnTile(herb, target);
    });
}

// One herb roll per forage tick. All currently eligible herbs compete by
// weight, so biome and temperature decide the local herb pool.
function forageHerbRoll() {
    const herbs = getEligibleHerbsOnTile();
    if (!herbs.length) return;

    const totalWeight = herbs.reduce(function (sum, herb) {
        return sum + Math.max(0, Number(herb.weight) || 0);
    }, 0);
    if (totalWeight <= 0) return;

    let roll = Math.random() * totalWeight;
    let chosen = herbs[herbs.length - 1];
    for (let index = 0; index < herbs.length; index++) {
        roll -= Math.max(0, Number(herbs[index].weight) || 0);
        if (roll <= 0) {
            chosen = herbs[index];
            break;
        }
    }

    forageRoll(chosen.difficulty, chosen.id, chosen.amount);
}

// Vegetables and crops follow the same climate rules as herbs: biome,
// temperature and (when restricted) humidity.
function isPlantAvailableOnTile(plant, tile) {
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!plant || !target) return false;

    const biome = Number(target.type);
    if (Number.isFinite(biome) && plant.biomes.indexOf(biome) === -1) {
        return false;
    }

    const temperature = Number(target.temperature);
    if (Number.isFinite(temperature)
        && (temperature < plant.tempMin || temperature > plant.tempMax)) {
        return false;
    }

    const humidity = Number(target.humidity);
    if (Number.isFinite(humidity)
        && (humidity < plant.humidityMin || humidity > plant.humidityMax)) {
        return false;
    }

    return true;
}

function getEligiblePlantsOnTile(tile, kind) {
    if (typeof PLANT_DEFS === "undefined" || !Array.isArray(PLANT_DEFS)) return [];
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!target) return [];

    return PLANT_DEFS.filter(function (plant) {
        if (kind && plant.kind !== kind) return false;
        return isPlantAvailableOnTile(plant, target);
    });
}

// One vegetable/crop roll per forage tick. All climate-appropriate plants
// compete by weight, so the local biome and weather decide what can be found.
function foragePlantRoll() {
    const plants = getEligiblePlantsOnTile();
    if (!plants.length) return;

    const totalWeight = plants.reduce(function (sum, plant) {
        return sum + Math.max(0, Number(plant.weight) || 0);
    }, 0);
    if (totalWeight <= 0) return;

    let roll = Math.random() * totalWeight;
    let chosen = plants[plants.length - 1];
    for (let index = 0; index < plants.length; index++) {
        roll -= Math.max(0, Number(plants[index].weight) || 0);
        if (roll <= 0) {
            chosen = plants[index];
            break;
        }
    }

    forageRoll(chosen.difficulty, chosen.id, chosen.amount);
}
// Quality of a freshly gathered resource batch. Uses the same forage power
// that drives processing speed, not the per-resource roll power, so quality
// depends on the player and the tile and not on which resource was rolled.
function getForageResourceQuality() {
    return 1 + getForagePower();
}

function forageRoll(difficulty, resourceId, profitAmount){
    const multiplier = getResourceMultiplier(currentTile, resourceId);
    const spaceMultiplier = getForageSpaceMultiplier(resourceId);
    if (spaceMultiplier <= 0) return;

    const effectiveDifficulty = difficulty * multiplier;
    const foragePower = Math.pow(
        (getEffectiveLevel("per") * getEffectiveLevel("forage")) * (1 + getEffectiveLevel("luck") * 0.01),
        1 / 2
    ) * spaceMultiplier;
    const baseChance = foragePower > 0
        ? Math.max(0, Math.min(1, 1 - effectiveDifficulty / foragePower))
        : 0;

    // Equipment find-chance bonus is applied last, to the finished base chance.
    const chance = Math.min(1, baseChance * getEquippedStatMultiplier("forageFindChance"));
    const roll = Math.random();

    if (roll < chance) {
        addResource(
            resourceId,
            getForageAmount(resourceId, profitAmount),
            getForageResourceQuality()
        );
        const isNamedPlant = (typeof isHerbResource === "function"
            && isHerbResource(resourceId))
            || (typeof isVegetableResource === "function"
                && isVegetableResource(resourceId))
            || (typeof isCropResource === "function"
                && isCropResource(resourceId));
        logMessage(isNamedPlant
            ? "You gather " + RESOURCE_DEFS[resourceId].name + "."
            : "whoa berry");
        logMessage(round2(roll * 100) + "% < " + round2(chance * 100) + "%");
    }
}
// --- Trees Harvest action ------------------------------------------------
// One random fruit or nut tree on the current tile is harvested for a minute.
// The tile stores only counts, so `harvestedTrees[species]` marks how many of
// that species are currently Harvested. The property is cleared at the start
// of every in-game month.
const treeHarvestState = {
    tileX: null,
    tileY: null,
    species: null,
    progress: 0,
};

function getTreeHarvestTile() {
    return typeof currentTile !== "undefined" && currentTile ? currentTile : null;
}

// Amount per second: sqrt((AGI + PER) / 2 * (Gardening + Foraging / 2)).
function getTreeHarvestPower() {
    const agi = Math.max(0, Number(getEffectiveLevel("agi")) || 0);
    const per = Math.max(0, Number(getEffectiveLevel("per")) || 0);
    const gardening = Math.max(0, Number(getEffectiveLevel("gardening")) || 0);
    const forage = Math.max(0, Number(getEffectiveLevel("forage")) || 0);

    return Math.sqrt(((agi + per) / 2) * (gardening + forage / 2));
}

function getTreeHarvestAmountPerSecond() {
    return getTreeHarvestPower()
        * getActionEffectivenessMultiplier("treesharvest")
        * getGlobalPropertyMultiplier("harvestFruitAmount")
        / TREE_HARVEST_AMOUNT_DIVISOR;
}

// Quality uses the same harvesting formula, offset like forage quality so it
// starts above 1 and grows smoothly with the relevant stats.
function getTreeHarvestQuality() {
    return round2(1 + getTreeHarvestPower());
}

function getHarvestedTreeCount(tile, speciesName) {
    if (!tile || !tile.harvestedTrees) return 0;
    const amount = Number(tile.harvestedTrees[speciesName]);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function getAvailableTreeHarvestCount(tile, speciesName) {
    const targetTile = tile || getTreeHarvestTile();
    if (!targetTile || !targetTile.space) return 0;

    const total = Math.max(0, Number(targetTile.space[speciesName]) || 0);
    return Math.max(0, total - getHarvestedTreeCount(targetTile, speciesName));
}

function getHarvestableTreeSpecies(tile) {
    const targetTile = tile || getTreeHarvestTile();
    if (!targetTile) return [];

    const options = [];
    TREE_SPECIES.forEach(function (species) {
        const amount = getAvailableTreeHarvestCount(targetTile, species.name);
        if (amount > 0 && TREE_HARVEST_RESOURCES[species.name] != null) {
            options.push({ name: species.name, amount: amount });
        }
    });
    return options;
}

function hasHarvestableTrees(tile) {
    return getHarvestableTreeSpecies(tile).length > 0;
}

function resetTreeHarvestTarget() {
    treeHarvestState.tileX = null;
    treeHarvestState.tileY = null;
    treeHarvestState.species = null;
    treeHarvestState.progress = 0;
}

function selectTreeHarvestTarget(tile) {
    let options = getHarvestableTreeSpecies(tile);
    if (!options.length) return null;

    // Harvest the yummies level 2: prefer trees whose harvested resource is
    // bound to the chosen stat. Fall back to all trees when none match.
    const priorityStat = typeof getHarvestTreePriorityStat === "function"
        ? getHarvestTreePriorityStat()
        : null;
    if (priorityStat && typeof getFoodStatBinding === "function") {
        const preferred = options.filter(function (option) {
            const resourceId = TREE_HARVEST_RESOURCES[option.name];
            return resourceId != null
                && getFoodStatBinding(resourceId) === priorityStat;
        });
        if (preferred.length) options = preferred;
    }

    const total = options.reduce(function (sum, option) {
        return sum + option.amount;
    }, 0);
    if (total <= 0) return null;

    let roll = Math.random() * total;
    for (let index = 0; index < options.length; index++) {
        roll -= options[index].amount;
        if (roll < 0) return options[index].name;
    }

    return options[options.length - 1].name;
}

function ensureTreeHarvestTarget(tile) {
    if (!tile) return null;

    if (treeHarvestState.tileX !== tile.x || treeHarvestState.tileY !== tile.y) {
        resetTreeHarvestTarget();
        treeHarvestState.tileX = tile.x;
        treeHarvestState.tileY = tile.y;
    }

    if (treeHarvestState.species
        && getAvailableTreeHarvestCount(tile, treeHarvestState.species) > 0) {
        return treeHarvestState.species;
    }

    const species = selectTreeHarvestTarget(tile);
    treeHarvestState.species = species;
    treeHarvestState.progress = 0;
    if (species) logMessage("You start harvesting " + species);
    return species;
}

function markTreeHarvested(tile, speciesName) {
    if (!tile || !speciesName) return;

    const total = Math.max(0, Number(tile.space && tile.space[speciesName]) || 0);
    const harvested = getHarvestedTreeCount(tile, speciesName);
    if (harvested >= total) return;

    if (!tile.harvestedTrees) tile.harvestedTrees = {};
    tile.harvestedTrees[speciesName] = harvested + 1;
}

function runTreesHarvestProduction(diff) {
    if (actionStates.treesharvest !== Activity.Active) return;

    const tile = getTreeHarvestTile();
    if (!tile || !hasHarvestableTrees(tile)) return;

    let remaining = Math.max(0, Number(diff) || 0);
    if (remaining <= 0) return;

    const amountPerSecond = getTreeHarvestAmountPerSecond();
    const quality = getTreeHarvestQuality();
    if (amountPerSecond <= 0) return;

    while (remaining > 0) {
        const species = ensureTreeHarvestTarget(tile);
        if (!species) break;

        const resourceId = TREE_HARVEST_RESOURCES[species];
        if (resourceId == null) break;

        const secondsLeft = Math.max(
            0,
            TREE_HARVEST_DURATION_SECONDS - treeHarvestState.progress
        );

        if (secondsLeft <= 0) {
            markTreeHarvested(tile, species);
            logMessage(species + " is now Harvested");
            treeHarvestState.species = null;
            treeHarvestState.progress = 0;
            continue;
        }

        const seconds = Math.min(remaining, secondsLeft);
        const amount = round2(amountPerSecond * seconds);
        if (amount > 0) addResource(resourceId, amount, quality);

        player.gardening.addexp(
            seconds * TREE_HARVEST_GARDENING_EXP_PER_SECOND
        );
        player.forage.addexp(
            seconds * TREE_HARVEST_FORAGE_EXP_PER_SECOND
        );

        treeHarvestState.progress += seconds;
        remaining -= seconds;

        if (treeHarvestState.progress >= TREE_HARVEST_DURATION_SECONDS) {
            markTreeHarvested(tile, species);
            logMessage(species + " is now Harvested");
            treeHarvestState.species = null;
            treeHarvestState.progress = 0;
        }
    }
}

// Called by the game clock exactly when the calendar month changes.
function resetHarvestedTreesForNewMonth() {
    if (typeof window !== "undefined"
        && window.mapView
        && window.mapView.world
        && typeof window.mapView.world.resetHarvestedTrees === "function") {
        window.mapView.world.resetHarvestedTrees();
    }

    const tile = getTreeHarvestTile();
    if (tile && Number(tile.revealed) > 0) tile.harvestedTrees = {};
    resetTreeHarvestTarget();

    // The monthly growth changes tile space values, so refresh the visible map
    // and coordinate tooltip immediately.
    if (typeof refreshMapCoordinates === "function") {
        refreshMapCoordinates(true);
    }
}

// --- Cut Tree action -----------------------------------------------------
// One tree is felled exactly every two minutes. Generic Trees are used first;
// once only named fruit/nut species remain, one of them is chosen at random.
// Every felled tree yields Wooden logs and one Fertile Soil. Action power is
// sqrt(STR * Lumberjack) plus the best carried Chopping power, and scales both
// the amount and the quality of the logs.
const cutTreeState = {
    tileX: null,
    tileY: null,
    progress: 0,
};

function getCutTreeTile() {
    return typeof currentTile !== "undefined" && currentTile ? currentTile : null;
}

function getTileSpaceAmount(space, elementName) {
    if (!space) return 0;

    const target = String(elementName).toLowerCase();
    let amount = 0;
    Object.keys(space).forEach(function (key) {
        if (String(key).toLowerCase() !== target) return;
        amount += Math.max(0, Number(space[key]) || 0);
    });
    return amount;
}

function decrementTileSpace(space, elementName, amount) {
    if (!space) return false;

    const target = String(elementName).toLowerCase();
    let remaining = Math.max(0, Number(amount) || 0);
    Object.keys(space).forEach(function (key) {
        if (remaining <= 0 || String(key).toLowerCase() !== target) return;

        const current = Math.max(0, Number(space[key]) || 0);
        const taken = Math.min(current, remaining);
        const next = current - taken;
        remaining -= taken;

        if (next > 0) {
            space[key] = next;
        } else {
            delete space[key];
        }
    });

    return remaining <= 0;
}

function addTileSpace(space, elementName, amount) {
    if (!space) return;

    const target = String(elementName).toLowerCase();
    const existingKey = Object.keys(space).find(function (key) {
        return String(key).toLowerCase() === target;
    });
    const key = existingKey || elementName;
    space[key] = (Number(space[key]) || 0) + Math.max(0, Number(amount) || 0);
}

function getTileTreeOptions(tile) {
    const targetTile = tile || getCutTreeTile();
    if (!targetTile || !targetTile.space) return [];

    const options = [];
    const genericTrees = getTileSpaceAmount(targetTile.space, "Tree");
    if (genericTrees > 0) {
        options.push({ name: "Tree", amount: genericTrees, generic: true });
    }

    TREE_SPECIES.forEach(function (species) {
        const amount = getTileSpaceAmount(targetTile.space, species.name);
        if (amount > 0) {
            options.push({ name: species.name, amount: amount, generic: false });
        }
    });

    return options;
}

function getTileTreeCount(tile) {
    return getTileTreeOptions(tile).reduce(function (sum, option) {
        return sum + option.amount;
    }, 0);
}

function hasCuttableTrees(tile) {
    return getTileTreeCount(tile) > 0;
}

function clampHarvestedTreesAfterCut(tile, speciesName) {
    if (!tile || !tile.harvestedTrees || !speciesName) return;

    const total = getTileSpaceAmount(tile.space, speciesName);
    const harvested = getHarvestedTreeCount(tile, speciesName);
    if (harvested <= total) return;

    if (total > 0) {
        tile.harvestedTrees[speciesName] = total;
    } else {
        delete tile.harvestedTrees[speciesName];
    }
}

// Removes exactly one tree from the tile. Returns the removed space element
// name, or null when the tile has no trees left.
function removeOneTreeFromTile(tile) {
    const targetTile = tile || getCutTreeTile();
    const options = getTileTreeOptions(targetTile);
    if (!targetTile || options.length === 0) return null;

    const total = options.reduce(function (sum, option) {
        return sum + option.amount;
    }, 0);
    let roll = Math.random() * total;
    let chosen = options[options.length - 1];

    for (let index = 0; index < options.length; index++) {
        roll -= options[index].amount;
        if (roll < 0) {
            chosen = options[index];
            break;
        }
    }

    if (!decrementTileSpace(targetTile.space, chosen.name, 1)) return null;
    clampHarvestedTreesAfterCut(targetTile, chosen.name);
    return chosen.name;
}

function resetCutTreeProgress() {
    cutTreeState.tileX = null;
    cutTreeState.tileY = null;
    cutTreeState.progress = 0;
}

function setCutTreeTile(tile) {
    if (!tile) return;

    if (cutTreeState.tileX !== tile.x || cutTreeState.tileY !== tile.y) {
        resetCutTreeProgress();
        cutTreeState.tileX = tile.x;
        cutTreeState.tileY = tile.y;
    }
}

function getCutTreePower() {
    const strength = Math.max(1, Number(getEffectiveLevel("str")) || 0);
    const lumberjack = Math.max(1, Number(getEffectiveLevel("lumberjack")) || 0);
    const choppingPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, Number(getCharacterToolPower("chopping")) || 0)
        : 0;

    return 1 + Math.sqrt(strength * lumberjack) + choppingPower;
}

function getCutTreeStaminaPerSecond() {
    const power = Math.max(0, Number(getCutTreePower()) || 0);
    return round2(power * CUT_TREE_STAMINA_PER_POWER_PER_SECOND);
}

function getCutTreeQuality(power) {
    return round2(1 + power);
}

function runCutTreeProduction(diff) {
    if (actionStates.cuttree !== Activity.Active) return;

    const tile = getCutTreeTile();
    if (!tile || !hasCuttableTrees(tile)) return;

    if (typeof getCharacterToolPower !== "function"
        || getCharacterToolPower("chopping") < 1) {
        logMessage("You need at least 1 Chopping power to cut trees");
        stopTimedAction(getAction("cuttree"));
        return;
    }

    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return;

    setCutTreeTile(tile);

    // Only count time that can actually fell an available tree: a long
    // background tick must not train the skills after the last tree is gone.
    const availableSeconds = Math.max(
        0,
        getTileTreeCount(tile) * CUT_TREE_SECONDS_PER_TREE - cutTreeState.progress
    );
    const actualSeconds = Math.min(seconds, availableSeconds);
    if (actualSeconds <= 0) return;

    cutTreeState.progress += actualSeconds;

    const weatherPowerMultiplier = typeof getGameWeatherActionMultiplier === "function"
        ? getGameWeatherActionMultiplier("cuttree")
        : 1;
    const power = getCutTreePower() * weatherPowerMultiplier;
    const quality = getCutTreeQuality(power);
    // ChopYield multiplies everything Cut Tree extracts from the tree, but
    // explicitly not the Fertile Soil left behind.
    const chopYieldMultiplier = typeof getGlobalPropertyMultiplier === "function"
        ? Math.max(0, getGlobalPropertyMultiplier("chopYield"))
        : 1;
    const logsPerTree = round2(
        power * CUT_TREE_LOGS_PER_POWER * chopYieldMultiplier
    );
    const byproductsPerTree = round2(
        power * CUT_TREE_BYPRODUCTS_PER_POWER * chopYieldMultiplier
    );

    while (cutTreeState.progress >= CUT_TREE_SECONDS_PER_TREE
        && hasCuttableTrees(tile)) {
        cutTreeState.progress -= CUT_TREE_SECONDS_PER_TREE;

        const treeName = removeOneTreeFromTile(tile);
        if (!treeName) break;

        // The felled tree leaves one patch of fertile land behind, and the
        // stump itself yields one unit of Fertile Soil.
        addTileSpace(tile.space, "FertileLand", 1);

        if (logsPerTree > 0) {
            addResource(RESOURCE_IDS.WOODEN_LOGS, logsPerTree, quality);
        }
        if (byproductsPerTree > 0) {
            addResource(RESOURCE_IDS.BRANCHES, byproductsPerTree, quality);
            addResource(RESOURCE_IDS.STICKS, byproductsPerTree, quality);
            addResource(RESOURCE_IDS.LEAVES, byproductsPerTree, quality);
        }
        addResource(RESOURCE_IDS.FERTILE_SOIL, 1, quality);

        logMessage(
            "You fell " + treeName + " and get "
            + RESOURCE_DEFS[RESOURCE_IDS.WOODEN_LOGS].name
            + " x" + round2(logsPerTree)
            + ", Branches x" + round2(byproductsPerTree)
            + ", Sticks x" + round2(byproductsPerTree)
            + ", Leaves x" + round2(byproductsPerTree)
            + " and Fertile Soil x1"
        );
    }

    if (player.str) player.str.addexp(actualSeconds * CUT_TREE_STR_EXP_PER_SECOND);
    if (player.lumberjack) {
        player.lumberjack.addexp(actualSeconds * CUT_TREE_LUMBERJACK_EXP_PER_SECOND);
    }
}

// --- Dig action ----------------------------------------------------------
// Digging is a repeatable timed action: it consumes stamina continuously and
// rolls every soil resource independently. Digging power is the best digging
// tool carried in the inventory or equipped.
const DIG_STAMINA_PER_SECOND = 1.75;
const DIG_MAX_SECONDS_PER_LOOP = 60;
// The base chance is per second; harder soils are proportionally rarer.
const DIG_BASE_CHANCE_PER_SECOND = 0.2;
const DIG_RESOURCE_ROLLS = Object.freeze([
    Object.freeze({ difficulty: 1, resourceId: RESOURCE_IDS.DIRT, amount: 1 }),
    Object.freeze({ difficulty: 1, resourceId: RESOURCE_IDS.SAND, amount: 1 }),
    Object.freeze({ difficulty: 2, resourceId: RESOURCE_IDS.CLAY, amount: 0.5 }),
    Object.freeze({ difficulty: 4, resourceId: RESOURCE_IDS.FERTILE_SOIL, amount: 0.25 }),
    Object.freeze({ difficulty: 6, resourceId: RESOURCE_IDS.PEAT, amount: 0.2 }),
    Object.freeze({ difficulty: 8, resourceId: RESOURCE_IDS.TAR, amount: 0.1 }),
]);

// Soil resources only appear where the tile actually contains the matching
// SPACE_ELEMENT_NAMES. A resource with no matching space cannot be dug.
const DIG_SPACE_DEPENDENCIES = Object.freeze({
    [RESOURCE_IDS.DIRT]: Object.freeze(["EmptySpace", "Grass", "Bushes", "Moss"]),
    [RESOURCE_IDS.SAND]: Object.freeze(["Sand"]),
    [RESOURCE_IDS.CLAY]: Object.freeze(["Clay"]),
    [RESOURCE_IDS.FERTILE_SOIL]: Object.freeze(["FertileLand"]),
    [RESOURCE_IDS.PEAT]: Object.freeze(["Swamp"]),
    [RESOURCE_IDS.TAR]: Object.freeze(["Tar"]),
});

// Shared space-share multiplier for Dig and Mining. It normalises old
// lower-case space keys and returns the matching fraction of the whole tile.
function getSpaceShareMultiplier(dependencies) {
    if (!Array.isArray(dependencies) || dependencies.length === 0) return 1;

    const space = (typeof currentTile !== "undefined" && currentTile && currentTile.space)
        ? currentTile.space
        : {};
    const normalizedSpace = {};
    Object.keys(space).forEach(function (element) {
        const name = typeof normalizeSpaceElementName === "function"
            ? normalizeSpaceElementName(element)
            : element;
        normalizedSpace[name] = (normalizedSpace[name] || 0)
            + (Number(space[element]) || 0);
    });

    const totalSpace = Object.values(normalizedSpace).reduce(function (sum, amount) {
        return sum + (Number(amount) || 0);
    }, 0) || 1000;
    const amount = dependencies.reduce(function (sum, element) {
        return sum + (Number(normalizedSpace[element]) || 0);
    }, 0);

    // The resource's share of the whole tile directly scales its chance:
    // 60% matching space means 60% of the normal digging chance.
    if (amount <= 0) return 0;
    return Math.min(1, amount / totalSpace);
}

function getDigSpaceMultiplier(resourceId) {
    return getSpaceShareMultiplier(DIG_SPACE_DEPENDENCIES[resourceId]);
}

// True when the tile contains at least one space type used by the action.
function hasSpaceDependency(dependencies) {
    if (!dependencies || typeof dependencies !== "object") return false;

    return Object.keys(dependencies).some(function (resourceId) {
        return getSpaceShareMultiplier(dependencies[resourceId]) > 0;
    });
}

function hasDigSpace() {
    return hasSpaceDependency(DIG_SPACE_DEPENDENCIES);
}

function getDigPower() {
    const strength = Math.max(1, getEffectiveLevel("str") || 0);
    const vitality = Math.max(1, getEffectiveLevel("vit") || 0);
    const digging = Math.max(1, getEffectiveLevel("digging") || 0);
    const toolPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("digging") || 0)
        : 0;

    return 1 + Math.sqrt(digging * ((strength + vitality) / 2)) + toolPower;
}

// Dig quality is 1 + power. The same multiplier scales stamina drain, so
// stronger digging also costs more stamina per second.
function getDigQualityMultiplier(power) {
    if (power == null) {
        power = getDigPower() * getActionProductionMultiplier("dig");
    }
    return 1 + power;
}

function getDigStaminaPerSecond() {
    return DIG_STAMINA_PER_SECOND * getDigQualityMultiplier();
}

function getDigResourceChance(difficulty, power) {
    if (!(power > 0)) return 0;
    return Math.min(
        1,
        DIG_BASE_CHANCE_PER_SECOND * power / (power + difficulty)
    );
}

function rollDigResources(power, seconds, quality, foundTotals) {
    DIG_RESOURCE_ROLLS.forEach(function (roll) {
        const spaceMultiplier = getDigSpaceMultiplier(roll.resourceId);
        if (spaceMultiplier <= 0) return;

        const chancePerSecond = getDigResourceChance(roll.difficulty, power)
            * spaceMultiplier;
        const chance = 1 - Math.pow(1 - chancePerSecond, seconds);
        if (Math.random() >= chance) return;

        const amount = round2(roll.amount * seconds);
        if (amount <= 0) return;

        addResource(roll.resourceId, amount, quality);
        foundTotals[roll.resourceId] =
            (foundTotals[roll.resourceId] || 0) + amount;
    });
}

function runDigProduction(diff) {
    if (actionStates.dig !== Activity.Active) return;

    const seconds = Math.min(
        Math.max(0, Number(diff) || 0),
        DIG_MAX_SECONDS_PER_LOOP
    );
    if (seconds <= 0) return;

    if (typeof getCharacterToolPower !== "function"
        || getCharacterToolPower("digging") < 1) {
        logMessage("You need at least 1 Digging power to dig");
        stopTimedAction(getAction("dig"));
        return;
    }

    if (!hasDigSpace()) {
        logMessage("There is no soil here that you can dig up");
        stopTimedAction(getAction("dig"));
        return;
    }

    const power = getDigPower() * getActionProductionMultiplier("dig");
    const quality = getDigQualityMultiplier(power);
    const staminaPerSecond = DIG_STAMINA_PER_SECOND * quality;

    if (player.stamina < staminaPerSecond) {
        logMessage("You are too tired to dig");
        stopTimedAction(getAction("dig"));
        return;
    }

    // Do not let a long background tick consume more stamina than available.
    const actualSeconds = Math.min(
        seconds,
        player.stamina / staminaPerSecond
    );
    player.stamina = round2(Math.max(
        0,
        player.stamina - actualSeconds * staminaPerSecond
    ));
    trackHungerSpending("stamina", actualSeconds * staminaPerSecond);

    const foundTotals = Object.create(null);

    const wholeSeconds = Math.floor(actualSeconds);
    for (let second = 0; second < wholeSeconds; second++) {
        rollDigResources(power, 1, quality, foundTotals);
    }

    const partialSecond = actualSeconds - wholeSeconds;
    if (partialSecond > 0.0001) {
        rollDigResources(power, partialSecond, quality, foundTotals);
    }

    player.str.addexp(0.5 * actualSeconds);
    player.digging.addexp(0.5 * actualSeconds);

    const foundParts = Object.keys(foundTotals).map(function (resourceId) {
        const definition = RESOURCE_DEFS[resourceId];
        return (definition ? definition.name : resourceId)
            + " x" + round2(foundTotals[resourceId]);
    });

    if (foundParts.length) {
        logMessage("You dig up " + foundParts.join(", "));
    }
}

// --- Mining action -------------------------------------------------------
// Mining copies the Dig loop, but uses the character's Mining power (the best
// carried or equipped mining tool) and rolls ore, stone, ice and coral
// resources tied to the tile's space composition.
const MINING_STAMINA_PER_SECOND = 6.25;
const MINING_MAX_SECONDS_PER_LOOP = 60;
const MINING_BASE_CHANCE_PER_SECOND = 0.2;
// Every mined Rock has a 1-in-10 chance to be replaced by a special stone.
const MINING_SPECIAL_REPLACE_CHANCE = 0.1;
const MINING_SPECIAL_STONE_ROLLS = Object.freeze([
    Object.freeze({ resourceId: RESOURCE_IDS.LIMESTONE, requiredMiningPower: 10 }),
    Object.freeze({ resourceId: RESOURCE_IDS.COAL, requiredMiningPower: 10 }),
    Object.freeze({ resourceId: RESOURCE_IDS.ROCKSALT, requiredMiningPower: 20 }),
]);
const MINING_RESOURCE_ROLLS = Object.freeze([
    Object.freeze({ difficulty: 1, resourceId: RESOURCE_IDS.ROCKS, amount: 1 }),
    Object.freeze({ difficulty: 1, resourceId: RESOURCE_IDS.ICE, amount: 1 }),
    Object.freeze({ difficulty: 2, resourceId: RESOURCE_IDS.IRON_ORE, amount: 0.5 }),
    Object.freeze({ difficulty: 3, resourceId: RESOURCE_IDS.COPPER_ORE, amount: 0.5 }),
    Object.freeze({ difficulty: 3, resourceId: RESOURCE_IDS.CORALS, amount: 0.3 }),
    Object.freeze({ difficulty: 4, resourceId: RESOURCE_IDS.TIN_ORE, amount: 0.4 }),
    Object.freeze({ difficulty: 5, resourceId: RESOURCE_IDS.MARBLE_SLAB, amount: 0.3 }),
    Object.freeze({ difficulty: 7, resourceId: RESOURCE_IDS.OBSIDIAN_CHUNKS, amount: 0.2 }),
    Object.freeze({ difficulty: 8, resourceId: RESOURCE_IDS.GOLD_ORE, amount: 0.1 }),
]);

const MINING_SPACE_DEPENDENCIES = Object.freeze({
    [RESOURCE_IDS.ROCKS]: Object.freeze(["Rock"]),
    [RESOURCE_IDS.ICE]: Object.freeze(["Ice"]),
    [RESOURCE_IDS.IRON_ORE]: Object.freeze(["Iron"]),
    [RESOURCE_IDS.COPPER_ORE]: Object.freeze(["Copper"]),
    [RESOURCE_IDS.GOLD_ORE]: Object.freeze(["Gold"]),
    [RESOURCE_IDS.MARBLE_SLAB]: Object.freeze(["Marble"]),
    [RESOURCE_IDS.OBSIDIAN_CHUNKS]: Object.freeze(["Obsidian", "Magma"]),
    [RESOURCE_IDS.CORALS]: Object.freeze(["Coral"]),
    [RESOURCE_IDS.TIN_ORE]: Object.freeze(["Tin"]),
});

function getMiningSpaceMultiplier(resourceId) {
    return getSpaceShareMultiplier(MINING_SPACE_DEPENDENCIES[resourceId]);
}

function hasMiningSpace() {
    return hasSpaceDependency(MINING_SPACE_DEPENDENCIES);
}

function getMiningPower() {
    const strength = Math.max(1, getEffectiveLevel("str") || 0);
    const mining = Math.max(1, getEffectiveLevel("mining") || 0);
    const toolPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("mining") || 0)
        : 0;

    return 1 + Math.sqrt(strength * mining) + toolPower;
}

// Mining quality is 1 + power. The same multiplier scales stamina drain, so
// stronger mining also costs more stamina per second.
function getMiningQualityMultiplier(power) {
    if (power == null) {
        power = getMiningPower() * getActionProductionMultiplier("mining");
    }
    return 1 + power;
}

function getMiningStaminaPerSecond() {
    return MINING_STAMINA_PER_SECOND * getMiningQualityMultiplier();
}

function getMiningResourceChance(difficulty, power) {
    if (!(power > 0)) return 0;
    return Math.min(
        1,
        MINING_BASE_CHANCE_PER_SECOND * power / (power + difficulty)
    );
}

function getAvailableMiningSpecialStones() {
    const miningPower = typeof getCharacterToolPower === "function"
        ? Math.max(0, getCharacterToolPower("mining") || 0)
        : 0;

    return MINING_SPECIAL_STONE_ROLLS.filter(function (roll) {
        return miningPower >= roll.requiredMiningPower;
    });
}

function addMiningRockOrSpecial(amount, quality, foundTotals) {
    const specialStones = getAvailableMiningSpecialStones();
    const wholeUnits = Math.floor(amount);
    let rocks = amount - wholeUnits;

    for (let unit = 0; unit < wholeUnits; unit++) {
        if (specialStones.length > 0
            && Math.random() < MINING_SPECIAL_REPLACE_CHANCE) {
            const special = specialStones[
                Math.floor(Math.random() * specialStones.length)
            ];
            addResource(special.resourceId, 1, quality);
            foundTotals[special.resourceId] =
                (foundTotals[special.resourceId] || 0) + 1;
        } else {
            rocks += 1;
        }
    }

    const roundedRocks = round2(rocks);
    if (roundedRocks <= 0) return;

    addResource(RESOURCE_IDS.ROCKS, roundedRocks, quality);
    foundTotals[RESOURCE_IDS.ROCKS] =
        (foundTotals[RESOURCE_IDS.ROCKS] || 0) + roundedRocks;
}

function rollMiningResources(power, seconds, quality, foundTotals, yieldMultiplier) {
    const multiplier = Number.isFinite(yieldMultiplier) && yieldMultiplier > 0
        ? yieldMultiplier
        : 1;

    MINING_RESOURCE_ROLLS.forEach(function (roll) {
        const spaceMultiplier = getMiningSpaceMultiplier(roll.resourceId);
        if (spaceMultiplier <= 0) return;

        const chancePerSecond = getMiningResourceChance(roll.difficulty, power)
            * spaceMultiplier;
        const chance = 1 - Math.pow(1 - chancePerSecond, seconds);
        if (Math.random() >= chance) return;

        const amount = round2(roll.amount * seconds * multiplier);
        if (amount <= 0) return;

        if (roll.resourceId === RESOURCE_IDS.ROCKS) {
            addMiningRockOrSpecial(amount, quality, foundTotals);
            return;
        }

        addResource(roll.resourceId, amount, quality);
        foundTotals[roll.resourceId] =
            (foundTotals[roll.resourceId] || 0) + amount;
    });
}

function runMiningProduction(diff) {
    if (actionStates.mining !== Activity.Active) return;

    const seconds = Math.min(
        Math.max(0, Number(diff) || 0),
        MINING_MAX_SECONDS_PER_LOOP
    );
    if (seconds <= 0) return;

    if (typeof getCharacterToolPower !== "function"
        || getCharacterToolPower("mining") < 1) {
        logMessage("You need at least 1 Mining power to mine");
        stopTimedAction(getAction("mining"));
        return;
    }

    if (!hasMiningSpace()) {
        logMessage("There is no stone or ore here that you can mine");
        stopTimedAction(getAction("mining"));
        return;
    }

    const basePower = getMiningPower() * getActionProductionMultiplier("mining");
    const quality = getMiningQualityMultiplier(basePower);
    const staminaPerSecond = MINING_STAMINA_PER_SECOND * quality;
    // Completed Mine entrances on this tile multiply the mined output without
    // changing stamina cost or resource quality.
    const mineMultiplier = typeof getMineEntranceMiningMultiplier === "function"
        ? Math.max(0, getMineEntranceMiningMultiplier(currentTile))
        : 1;

    if (player.stamina < staminaPerSecond) {
        logMessage("You are too tired to mine");
        stopTimedAction(getAction("mining"));
        return;
    }

    const actualSeconds = Math.min(
        seconds,
        player.stamina / staminaPerSecond
    );
    player.stamina = round2(Math.max(
        0,
        player.stamina - actualSeconds * staminaPerSecond
    ));
    trackHungerSpending("stamina", actualSeconds * staminaPerSecond);

    const foundTotals = Object.create(null);

    const wholeSeconds = Math.floor(actualSeconds);
    for (let second = 0; second < wholeSeconds; second++) {
        rollMiningResources(basePower, 1, quality, foundTotals, mineMultiplier);
    }

    const partialSecond = actualSeconds - wholeSeconds;
    if (partialSecond > 0.0001) {
        rollMiningResources(basePower, partialSecond, quality, foundTotals, mineMultiplier);
    }

    player.str.addexp(0.5 * actualSeconds);
    player.mining.addexp(0.5 * actualSeconds);

    const foundParts = Object.keys(foundTotals).map(function (resourceId) {
        const definition = RESOURCE_DEFS[resourceId];
        return (definition ? definition.name : resourceId)
            + " x" + round2(foundTotals[resourceId]);
    });

    if (foundParts.length) {
        logMessage("You mine " + foundParts.join(", "));
    }
}

function staminaRegen(timeAmount){
    var regenAmount = round2(Math.pow((getEffectiveLevel("vit") * getEffectiveLevel("rest") * (getEffectiveLevel("sou")* 0.01)), 1/2) * timeAmount * getStaminaRegenMultiplier() * getSleepRegenMultiplier() * getGlobalPropertyMultiplier("spregen") * getHearthfireRegenMultiplier() * getHungerRegenMultiplier());
    if (player.stamina == player.maxstamina) {}
    else if (player.stamina + regenAmount > player.maxstamina){
        player.rest.addexp(round2((player.maxstamina - player.stamina)/ regenAmount * timeAmount));
        player.vit.addexp(round2((player.maxstamina - player.stamina)/ regenAmount / 10 * timeAmount));
        player.stamina = player.maxstamina;
        
    } else {
        player.vit.addexp(0.1);
        player.rest.addexp(1);
        player.stamina += regenAmount;
        
    }
    player.stamina = round2(player.stamina);
}
function hpRegen(timeAmount){
    var regenAmount = round2(Math.pow((getEffectiveLevel("vit") * getEffectiveLevel("regeneration") * (getEffectiveLevel("sou")* 0.01))/5, 1/2) * timeAmount * getSleepRegenMultiplier() * getGlobalPropertyMultiplier("hpregen") * getHearthfireRegenMultiplier() * getHungerRegenMultiplier());
    if (player.hp == player.maxhp) {}
    else if (player.hp + regenAmount > player.maxhp){
        player.regeneration.addexp(round2((player.maxhp - player.hp)/ regenAmount * timeAmount));
        player.vit.addexp(round2((player.maxhp - player.hp)/ regenAmount / 10 * timeAmount));
        player.hp = player.maxhp;
        
    } else {
        player.vit.addexp(0.1);
        player.regeneration.addexp(1);
        player.hp += regenAmount;
        
    }
    player.hp = round2(player.hp);
}
function manaRegen(timeAmount){
    var regenAmount = round2(Math.pow((getEffectiveLevel("int") * getEffectiveLevel("focus") * (getEffectiveLevel("sou")* 0.01)), 1/2) * timeAmount * getSleepRegenMultiplier() * getGlobalPropertyMultiplier("manaregen") * getHearthfireRegenMultiplier() * (typeof getDarkManaRegenMultiplier === "function" ? getDarkManaRegenMultiplier() : 1) * getHungerManaRegenMultiplier());
    if (player.mana == player.maxmana) {}
    else if (player.mana + regenAmount > player.maxmana){
        player.focus.addexp(round2((player.maxmana - player.mana)/ regenAmount * timeAmount));
        player.int.addexp(round2((player.maxmana - player.mana)/ regenAmount / 10 * timeAmount));
        player.sou.addexp(round2((player.maxmana - player.mana)/ regenAmount / 50 * timeAmount));
        player.mana = player.maxmana;
        
    } else {
        player.int.addexp(0.1);
        player.sou.addexp(0.02);
        player.focus.addexp(1);
        player.mana += regenAmount;
        
    }
    player.mana = round2(player.mana);
}
// Carry sub-second time between ticks. Using only whole seconds after updating
// lastUpdate at the END of the loop made most intervals 990-999ms, so parseInt
// often returned 0 and travel (and every other timed action) ran at half speed
// or worse. Keeping the remainder makes one real second always become one tick.
let mainLoopRemainderMilliseconds = 0;

function mainLoop(){
    const now = Date.now();
    const previousUpdate = Number(lastUpdate);
    const elapsedMilliseconds = Number.isFinite(previousUpdate)
        ? Math.max(0, now - previousUpdate)
        : 0;

    lastUpdate = now;
    mainLoopRemainderMilliseconds += elapsedMilliseconds;
    var diff = Math.floor(
        mainLoopRemainderMilliseconds / MILLISECONDS_PER_SECOND
    );
    mainLoopRemainderMilliseconds -= diff * MILLISECONDS_PER_SECOND;

    // Count actions before production may finish or cancel them: sleep builds
    // up for the actions that were running during this interval.
    updateSleepyness(diff);
    // Very high sleepyness can knock the character out and start Sleep.
    tryFallAsleep(diff);
    productionLoop(diff);
    // Hungry characters automatically eat edible resources until hunger is 0.
    updateAutoHungerEating();
    // Starving drains HP on its own 40-59 second timer.
    updateHungerStarvationTick(diff);
    // One real second is one in-game minute, including catch-up ticks.
    if (typeof advanceGameClock === "function") advanceGameClock(diff);
    // The catch-up tick right after a load is over; level-ups log normally
    // again from the next tick on.
    suppressAutismLevelLogs = false;
    updateGUI();

    checkAddContent();
    //messagelog("retardability check");
    //mesasgelog(diff);
}

function checkAddContent() {
    refreshActionButtons();
}

var round2 = function(number){
    return +number.toFixed(2);
}

let logMessageCount = 0;
let logSuppressed = false;
let logHighlightRegex = null;
let showDebugMessages = true;

function setLogSuppressed(suppressed){
    logSuppressed = suppressed;
}

function updateDebugFilterButton() {
    const button = document.getElementById("debugfilterbutton");
    if (!button) return;

    button.innerHTML = '<i class="fa fa-bug"></i> Debug messages: ' + (showDebugMessages ? "ON" : "OFF");
    button.classList.toggle("active", showDebugMessages);
    button.setAttribute("aria-pressed", showDebugMessages ? "true" : "false");

    const panel = document.getElementById("gamelog");
    if (panel) panel.classList.toggle("hide-debug", !showDebugMessages);
    if (!showDebugMessages && typeof closeCheatMenu === "function") {
        closeCheatMenu();
    }
}

function toggleDebugMessages() {
    showDebugMessages = !showDebugMessages;
    updateDebugFilterButton();
}

function escapeLogTerm(term) {
    return String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getLogHighlightRegex() {
    if (logHighlightRegex) return logHighlightRegex;

    const skillTerms = ["HP", "MANA", "SP", "EXP", "Research points", "Research"];
    CORE_STAT_NAMES.forEach(function (statKey) {
        if (player[statKey] && player[statKey].name) skillTerms.push(player[statKey].name);
    });
    LEARNABLE_SKILL_KEYS.forEach(function (skillKey) {
        if (player[skillKey] && player[skillKey].name) skillTerms.push(player[skillKey].name);
    });

    const resourceTerms = Object.values(RESOURCE_DEFS).map(function (definition) {
        return definition.name;
    });

    const uniqueSkillTerms = Array.from(new Set(skillTerms)).sort(function (a, b) { return b.length - a.length; });
    const uniqueResourceTerms = Array.from(new Set(resourceTerms)).sort(function (a, b) { return b.length - a.length; });

    const skillPattern = "\\b(?:" + uniqueSkillTerms.map(escapeLogTerm).join("|") + ")\\b";
    const resourcePattern = "\\b(?:" + uniqueResourceTerms.map(escapeLogTerm).join("|") + ")\\b";

    logHighlightRegex = new RegExp("(\\d+(?:[.,]\\d+)?)|(" + skillPattern + ")|(" + resourcePattern + ")", "gi");
    return logHighlightRegex;
}

function escapeLogHtml(logText) {
    return String(logText)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function highlightLogText(logText) {
    const escaped = escapeLogHtml(logText);

    return escaped.replace(getLogHighlightRegex(), function (match, number, skill, resource) {
        if (number !== undefined) return '<b class="log-number">' + number + '</b>';
        if (skill !== undefined) return '<b class="log-skill">' + skill + '</b>';
        if (resource !== undefined) return '<b class="log-resource">' + resource + '</b>';
        return match;
    });
}

function getLogTypeClass(logText) {
    const text = String(logText);
    if (/click$/i.test(text)
        || /foragerolls|berrydice|derpp|actionbtnid|ZERO IN VOLUME|Unknown resource id/i.test(text)
        || /^\d+(?:[.,]\d+)?>\d+(?:[.,]\d+)?$/.test(text)) {
        return "log-debug";
    }
    if (/are now level/i.test(text)) return "log-levelup";
    if (/has been researched|Game saved|Game loaded|Research complete|gained a little|whoa berry|are rested enough/i.test(text)) {
        return "log-success";
    }
    if (/No action points|No free actions|too tired|cannot|do not meet|turn off all your actions|already researching/i.test(text)) {
        return "log-warning";
    }
    return "log-info";
}

function updateLogCount(entry) {
    const count = Number(entry.dataset.count || "1");
    const counter = entry.querySelector(".log-count");
    if (counter) counter.textContent = count > 1 ? "×" + count : "";
}

function getLogEntryCount() {
    return logScroll.getElementsByClassName("logdiv").length;
}

function trimLog() {
    // Only log entries are trimmed; the status icon panel is not in this list.
    const entries = logScroll.getElementsByClassName("logdiv");
    while (entries.length > logLength) {
        logScroll.removeChild(entries[entries.length - 1]);
    }
}

function logMessage(logText, options){
    if (logSuppressed) return;

    const text = String(logText);
    const logType = getLogTypeClass(text);
    if (!showDebugMessages && logType === "log-debug") return;

    const newest = logScroll.firstElementChild;

    if (newest && newest.dataset.logText === text) {
        newest.dataset.count = String(Number(newest.dataset.count || "1") + 1);
        updateLogCount(newest);
        logScroll.scrollTop = 0;
        return;
    }

    const entry = document.createElement("div");
    entry.className = "logdiv " + logType + " " + (getLogEntryCount() % 2 === 0 ? "logdiv-even" : "logdiv-odd");
    entry.dataset.logText = text;
    entry.dataset.count = "1";

    // Callers may pass already-escaped HTML (for example a rarity-coloured
    // item name). Everything else goes through the normal highlighter.
    const html = options && typeof options.html === "string"
        ? options.html
        : highlightLogText(text);

    entry.innerHTML = '<span class="log-text">' + html + '</span><span class="log-count"></span>';

    logMessageCount++;
    logScroll.prepend(entry);
    trimLog();
    logScroll.scrollTop = 0;
}
setInterval(mainLoop, TICK_INTERVAL_MS);
