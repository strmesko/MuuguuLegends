const ACTION_KIND = Object.freeze({
    Timed: "timed",
    Instant: "instant",
});

// --- Focus ---------------------------------------------------------------
// Focus is an instant action that can be used only while at least one
// regular (non-restoration) timed action is running. It fast-forwards the
// whole simulation by its power in seconds and spends mana equal to
// power ^ 1.1.
function hasActiveNonRestAction() {
    return ACTIONS.some(function (action) {
        return action.kind === ACTION_KIND.Timed
            && isActionActive(action.id)
            && !isRestorationAction(action);
    });
}

// Same pattern as other actions: a stat and the matching skill under a square
// root, then the shared action-effectiveness multiplier.
function getFocusPower() {
    const intellect = Math.max(0, getEffectiveLevel("int") || 0);
    const focus = Math.max(0, getEffectiveLevel("focus") || 0);
    return Math.sqrt(intellect * focus) * getActionEffectivenessMultiplier("focus");
}

function getFocusManaCost(power) {
    const value = Math.max(0, Number(power) || 0);
    return Math.pow(value, 1.1);
}

// Equipment modifiers. Focus timeskip is a positive bonus; focus cost is
// stored as a positive reduction (displayed with a minus sign), the same
// convention as reduceHungerUse.
function getFocusTimeskipMultiplier() {
    return Math.max(0, getGlobalPropertyMultiplier("focusTimeskip"));
}

function getFocusCostMultiplier() {
    const reduction = Math.max(
        0,
        Number(getGlobalPropertyMultiplier("focusCost")) - 1
    );
    return Math.max(0, 1 - reduction);
}

// Seconds actually skipped, including the timeskip equipment modifier.
function getFocusSkipSeconds() {
    return Math.max(0, getFocusPower()) / 10
        * getFocusTimeskipMultiplier();
}

// Mana spent for the resulting skip, including the cost modifier.
function getFocusSkipManaCost() {
    return getFocusManaCost(getFocusSkipSeconds())
        * getFocusCostMultiplier();
}

function isFocusAvailable() {
    return hasActiveNonRestAction();
}

function performFocus() {
    if (!isFocusAvailable()) {
        logMessage("Focus requires an active action other than Rest.");
        return false;
    }

    const power = getFocusSkipSeconds();
    const manaCost = getFocusSkipManaCost();
    if (!(Number(player.mana) >= manaCost)) {
        logMessage("Not enough mana to Focus.");
        return false;
    }

    const manaBefore = Number(player.mana) || 0;
    player.mana = round2(Math.max(0, manaBefore - manaCost));
    const manaSpent = round2(Math.max(0, manaBefore - Number(player.mana)));
    // Every point of mana actually spent while focusing becomes Wizardy exp.
    if (manaSpent > 0 && player.wizardy) player.wizardy.addexp(manaSpent);
    // The Focus action trains its matching skill as well. At least one point
    // is awarded so the Focus skill bar appears on first use.
    if (power > 0 && player.focus) {
        if (typeof createSkillBar === "function") createSkillBar("focus");
        player.focus.addexp(Math.max(1, round2(power)));
    }
    logMessage(
        "You focus and skip " + round2(power)
        + " seconds. Mana spent: " + round2(manaCost) + "."
    );

    if (typeof simulateTimePassage === "function") {
        // Focus must not profit from mana regeneration during the skipped
        // time: the mana spent is the only mana change caused by the action.
        simulateTimePassage(power, { skipManaRegen: true });
    }
    return true;
}

function canMove() {
    return currentTile.revealed >= EXPLORATION_COMPLETE;
}

const BURN_ACTION_DEFS = Object.freeze([
    Object.freeze({ id: "burnbranches", name: "Branches", resourceId: RESOURCE_IDS.BRANCHES, baseAmount: 1000, baseHeat: 10, baseAsh: 1 }),
    Object.freeze({ id: "burnleaves", name: "Leaves", resourceId: RESOURCE_IDS.LEAVES, baseAmount: 1000, baseHeat: 10, baseAsh: 1 }),
    Object.freeze({ id: "burnsticks", name: "Sticks", resourceId: RESOURCE_IDS.STICKS, baseAmount: 100, baseHeat: 12, baseAsh: 1 }),
    Object.freeze({ id: "burngrass", name: "Grass", resourceId: RESOURCE_IDS.GRASS, baseAmount: 1000, baseHeat: 9, baseAsh: 1 }),
    Object.freeze({ id: "burnpeat", name: "Peat", resourceId: RESOURCE_IDS.PEAT, baseAmount: 100, baseHeat: 15, baseAsh: 1 }),
    Object.freeze({ id: "burncoal", name: "Coal", resourceId: RESOURCE_IDS.COAL, baseAmount: 100, baseHeat: 250, baseAsh: 1 }),
]);

function formatBurnAmount(value) {
    return String(round2(value));
}

function getBurnActionLabel(fuel) {
    return "Burn " + fuel.name + " x" + formatBurnAmount(
        getBurnScaledAmount(fuel.baseAmount)
    );
}

function createBurnAction(fuel) {
    return {
        id: fuel.id,
        label: "Burn " + fuel.name,
        tags: ["Production", "Instant"],
        description: function () {
            const required = getBurnScaledAmount(fuel.baseAmount);
            const heat = getBurnScaledAmount(fuel.baseHeat);
            const ash = getBurnScaledAmount(fuel.baseAsh);
            return "Burn " + fuel.name + " for Heat Units and Ash."
                + "<br>Consumes: " + formatBurnAmount(required) + " " + fuel.name
                + "<br>Produces: " + formatBurnAmount(heat) + " Heat Units and "
                + formatBurnAmount(ash) + " Ash."
                + "<br>Multiplier: WorkPower(STR, Smithing) x Smelt power = "
                + formatBurnAmount(getBurnMultiplier()) + "."
                + "<br>Requires a completed Smelter on the current tile.";
        },
        kind: ACTION_KIND.Instant,
        initialState: Activity.Idle,
        isVisible: function () {
            return getBurnSmeltPower() > 0;
        },
        isEnabled: function () {
            return canBurnFuel(fuel);
        },
        unavailableMessage: "Not enough " + fuel.name + " or Smelt power to burn.",
        getLabel: function () {
            return getBurnActionLabel(fuel);
        },
        run: function () {
            performBurnFuel(fuel);
        },
    };
}

const ACTIONS = [
    {
        id: "focus",
        label: "Focus",
        tags: ["Magic", "Instant"],
        description: function () {
            const timeskipBonus = getFocusTimeskipMultiplier() - 1;
            const costReduction = 1 - getFocusCostMultiplier();
            return "Skip time while another action is running."
                + "<br>Power: sqrt(Int * Focus) x action effectiveness."
                + "<br>Skips " + round2(getFocusSkipSeconds()) + " seconds"
                + (timeskipBonus > 0
                    ? " (+" + round2(timeskipBonus * PERCENT) + "% from equipment)"
                    : "")
                + "."
                + "<br>Mana cost: " + round2(getFocusSkipManaCost())
                + (costReduction > 0
                    ? " (-" + round2(costReduction * PERCENT) + "% from equipment)"
                    : "")
                + "."
                + "<br>Mana does not regenerate during the skipped time."
                + "<br>Requires an active action other than Rest or Sleep.";
        },
        kind: ACTION_KIND.Instant,
        initialState: Activity.Idle,
        isVisible: function () {
            return true;
        },
        isEnabled: isFocusAvailable,
        unavailableMessage: "Focus requires an active action other than Rest.",
        run: performFocus,
    },
    {
        id: "entercombat",
        label: "Enter combat",
        tags: ["combat"],
        description: "Fight a random mob. All other actions are blocked until combat ends.",
        kind: ACTION_KIND.Instant,
        initialState: Activity.Idle,
        isVisible: function () {
            return !(typeof isTraveling === "function" && isTraveling())
                && !(typeof isCombatActive === "function" && isCombatActive());
        },
        isEnabled: function () {
            return !(typeof isTraveling === "function" && isTraveling())
                && !(typeof isCombatActive === "function" && isCombatActive())
                && !!(typeof player !== "undefined" && player && player.hp > 0);
        },
        unavailableMessage: "You cannot enter combat right now.",
        run: function () {
            return typeof enterCombat === "function"
                ? enterCombat()
                : false;
        },
    },
    {
        id: "explore",
        label: "Explore",
        description: "Explore the entire tile for further investigate. <br>Full tile exploration reveals neighbour tiles",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        staminaPerSecond: ACTION_STAMINA_PER_SECOND,
        startMessage: "You begin explore the area",
        stopMessage: "You stop explore the area",
        isVisible: function () {
            return currentTile.revealed !== EXPLORATION_COMPLETE;
        },
        isComplete: function () {
            return currentTile.revealed >= EXPLORATION_COMPLETE;
        },
        completeMessage: "Dude. Looks like you explore the area. Well done. Go doing something else ore somewhere else.",
        run: runExploreProduction,
    },
    {
        id: "search",
        label: "Search",
        description: "Memorize points of interests for further interaction",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        staminaPerSecond: ACTION_STAMINA_PER_SECOND,
        startMessage: "You start yo search things",
        stopMessage: "You stop to search things",
        isVisible: function () {
            return currentTile.revealed > SEARCH_MIN_REVEAL && currentTile.investigated < currentTile.revealed;
        },
        isComplete: function () {
            return currentTile.investigated >= currentTile.revealed;
        },
        completeMessage: "Looks like you have investigated everything here.",
        run: runSearchProduction,
    },
    {
        id: "forage",
        label: "Forage",
        tags: ["harvest"],
        description: "Find things around. Probably garbage, but sometimes food.<br>Also gathers wild herbs, vegetables and crops. What you can find depends on the current biome, temperature and humidity.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Done,
        startMessage: "You start to gather things",
        stopMessage: "You stop foraging",
        availableMessage: "You are now understand how to find things. How about gather things which laying around?",
        isVisible: function () {
            return getEffectiveLevel("exploration") > FORAGE_UNLOCK_LEVEL && currentTile.hiddenstuff > 0;
        },
        isComplete: function () {
            return currentTile.hiddenstuff <= 0;
        },
        run: runForageProduction,
    },
    {
        id: "treesharvest",
        label: "Trees Harvest",
        tags: ["harvest"],
        description: "Harvest a random fruit or nut tree for its resource every second. After 60 seconds the tree gains the Harvested property until the next in-game month.<br>Amount per second: sqrt((AGI + PER) / 2 * (Gardening + Foraging / 2)) / 100.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start harvesting trees",
        stopMessage: "You stop harvesting trees",
        completeMessage: "There are no more fruit or nut trees to harvest here",
        isVisible: function () {
            return typeof hasHarvestableTrees === "function" && hasHarvestableTrees();
        },
        isComplete: function () {
            return typeof hasHarvestableTrees === "function" && !hasHarvestableTrees();
        },
        run: runTreesHarvestProduction,
    },
    {
        id: "cuttree",
        label: "Cut Tree",
        tags: ["harvest"],
        description: "Fell trees for timber. Every 2 minutes one tree on the current tile is replaced by 1 Fertile Soil.<br>Each felled tree yields Wooden logs, plus Branches, Sticks and Leaves equal to 1/2 of the action power. Action power: 1 + sqrt(STR * Lumberjack) + Chopping power; it scales the amount and quality of the logs and the stamina cost. Chop yield properties increase tree output but never Fertile Soil.<br>Requires trees on the tile and at least 1 Chopping power.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        staminaPerSecond: getCutTreeStaminaPerSecond,
        startMessage: "You start cutting trees",
        stopMessage: "You stop cutting trees",
        completeMessage: "There are no more trees to cut here",
        isVisible: function () {
            return typeof hasCuttableTrees === "function"
                && hasCuttableTrees()
                && typeof getCharacterToolPower === "function"
                && getCharacterToolPower("chopping") >= 1;
        },
        isComplete: function () {
            return typeof hasCuttableTrees === "function"
                && !hasCuttableTrees();
        },
        onStart: resetCutTreeProgress,
        run: runCutTreeProduction,
    },
    {
        id: "dig",
        label: "Dig",
        tags: ["harvest"],
        description: "DIGGERS. STRIKE THE EARTH NOW! This soil is your prey.<br>Action power: 1 + sqrt(Digging * (STR + VIT) / 2) + Digging power. Digging trains Digging and Strength.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start digging",
        stopMessage: "You stop digging",
        isVisible: function () {
            return player.stamina >= getDigStaminaPerSecond()
                && typeof getCharacterToolPower === "function"
                && getCharacterToolPower("digging") >= 1
                && typeof hasDigSpace === "function"
                && hasDigSpace();
        },
        run: runDigProduction,
    },
    {
        id: "mining",
        label: "Mining",
        tags: ["harvest"],
        description: "MINERS. STRIKE THE STONE NOW! This rock is your prey.<br>Action power: 1 + sqrt(STR * Mining) + Mining power. Mining trains Mining and Strength.<br>Each mined Rock has a 1/10 chance to become Limestone or Coal at Mining power 10, or Rocksalt at Mining power 20.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start mining",
        stopMessage: "You stop mining",
        isVisible: function () {
            return player.stamina >= getMiningStaminaPerSecond()
                && typeof getCharacterToolPower === "function"
                && getCharacterToolPower("mining") >= 1
                && typeof hasMiningSpace === "function"
                && hasMiningSpace();
        },
        run: runMiningProduction,
    },
    {
        id: "grindflour",
        label: "Grind Flour",
        tags: ["Production"],
        description: "Grind every seed resource into flour with a Big Grinding stone.<br>Every 10 seconds, 1 of each available seed becomes 1 flour. Only seed types you currently have are processed. Trains Milling and Vitality.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start grinding flour",
        stopMessage: "You stop grinding flour",
        isVisible: function () {
            return typeof hasBigGrindingStone === "function"
                && hasBigGrindingStone()
                && getEffectiveLevel("milling") >= 1
                && typeof hasSeedResources === "function"
                && hasSeedResources()
                && player.stamina >= getGrindStaminaPerSecond();
        },
        isComplete: function () {
            return typeof hasBigGrindingStone !== "function"
                || !hasBigGrindingStone()
                || typeof hasSeedResources !== "function"
                || !hasSeedResources();
        },
        completeMessage: "You have no seeds left to grind",
        run: runGrindFlourProduction,
    },
    {
        id: "makesugarfromsugarcane",
        label: "Make sugar from sugarcane",
        tags: ["Production"],
        description: "Grind sugarcane into sugar with a Big Grinding stone.<br>Every second 0.5 Sugarcane becomes 0.1 Sugar. Trains Cooking and Vitality.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making sugar from sugarcane",
        stopMessage: "You stop making sugar from sugarcane",
        isVisible: function () {
            return typeof hasBigGrindingStone === "function"
                && hasBigGrindingStone()
                && getEffectiveLevel("cooking") >= 1
                && !!resources[SUGARCANE_RESOURCE_ID]
                && resources[SUGARCANE_RESOURCE_ID].amount >= SUGAR_INPUT_PER_BATCH
                && player.stamina >= SUGAR_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return typeof hasBigGrindingStone !== "function"
                || !hasBigGrindingStone()
                || !resources[SUGARCANE_RESOURCE_ID]
                || resources[SUGARCANE_RESOURCE_ID].amount < SUGAR_INPUT_PER_BATCH;
        },
        completeMessage: "You have no sugarcane left to make sugar",
        run: runMakeSugarFromSugarcaneProduction,
    },
    {
        id: "makesugarfrombeetroot",
        label: "Make sugar from beetroots",
        tags: ["Production"],
        description: "Grind beetroots into sugar with a Big Grinding stone.<br>Every second 0.5 Beetroot becomes 0.1 Sugar. Trains Cooking and Vitality.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making sugar from beetroots",
        stopMessage: "You stop making sugar from beetroots",
        isVisible: function () {
            return typeof hasBigGrindingStone === "function"
                && hasBigGrindingStone()
                && getEffectiveLevel("cooking") >= 1
                && !!resources[BEETROOT_RESOURCE_ID]
                && resources[BEETROOT_RESOURCE_ID].amount >= SUGAR_INPUT_PER_BATCH
                && player.stamina >= SUGAR_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return typeof hasBigGrindingStone !== "function"
                || !hasBigGrindingStone()
                || !resources[BEETROOT_RESOURCE_ID]
                || resources[BEETROOT_RESOURCE_ID].amount < SUGAR_INPUT_PER_BATCH;
        },
        completeMessage: "You have no beetroots left to make sugar",
        run: runMakeSugarFromBeetrootProduction,
    },
    {
        id: "makefibers",
        label: "Make fibers",
        tags: ["Production"],
        description: "Slaugher grass and exctract a fibers from them. A horrible way to make a basic rope resource",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making fibers",
        stopMessage: "You stop making fibers",
        isVisible: function () {
            return getEffectiveLevel("survival") >= 5
                && !!resources[RESOURCE_IDS.GRASS]
                && resources[RESOURCE_IDS.GRASS].amount >= 1
                && player.stamina >= FIBER_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return !resources[RESOURCE_IDS.GRASS]
                || resources[RESOURCE_IDS.GRASS].amount < 1;
        },
        completeMessage: "You have no grass left to process",
        run: runMakeFibersProduction,
    },
    {
        id: "makeshafts",
        label: "Make shafts",
        tags: ["Production"],
        description: "Cut sticks into straight wooden shafts. 1 Stick becomes 1 Shaft. Trains Carpentry and a little Agility. Cutting power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making shafts",
        stopMessage: "You stop making shafts",
        isVisible: function () {
            return getEffectiveLevel("carpentry") >= 1
                && !!resources[RESOURCE_IDS.STICKS]
                && resources[RESOURCE_IDS.STICKS].amount >= 1
                && player.stamina >= SHAFT_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return !resources[RESOURCE_IDS.STICKS]
                || resources[RESOURCE_IDS.STICKS].amount < 1;
        },
        completeMessage: "You have no sticks left to process",
        run: runMakeShaftsProduction,
    },
    {
        id: "makehandles",
        label: "Make Handle",
        tags: ["Production"],
        description: "Shape shafts into comfortable wooden handles. 0.4 Shafts become 1 Handle. Trains Carpentry and a little Agility. Cutting power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making handles",
        stopMessage: "You stop making handles",
        isVisible: function () {
            return getEffectiveLevel("carpentry") >= 1
                && !!resources[RESOURCE_IDS.SHAFTS]
                && resources[RESOURCE_IDS.SHAFTS].amount >= HANDLE_SHAFTS_PER_BATCH
                && player.stamina >= HANDLE_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return !resources[RESOURCE_IDS.SHAFTS]
                || resources[RESOURCE_IDS.SHAFTS].amount < HANDLE_SHAFTS_PER_BATCH;
        },
        completeMessage: "You have no shafts left to process",
        run: runMakeHandlesProduction,
    },
    {
        id: "makeplanks",
        label: "Make Planks",
        tags: ["Production"],
        description: "Plane wooden logs into wooden planks. Each second 0.01 Wooden logs become 0.1 Wooden Plank. Trains Carpentry and a little Agility. Chopping power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making planks",
        stopMessage: "You stop making planks",
        isVisible: function () {
            return getEffectiveLevel("carpentry") >= 1
                && !!resources[RESOURCE_IDS.WOODEN_LOGS]
                && resources[RESOURCE_IDS.WOODEN_LOGS].amount >= PLANK_LOGS_PER_BATCH
                && player.stamina >= PLANK_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return !resources[RESOURCE_IDS.WOODEN_LOGS]
                || resources[RESOURCE_IDS.WOODEN_LOGS].amount < PLANK_LOGS_PER_BATCH;
        },
        completeMessage: "You have no logs left to process",
        run: runMakePlanksProduction,
    },
    {
        id: "makewoodenbeams",
        label: "Make Wooden Beams",
        tags: ["Production"],
        description: "Square wooden logs into heavy wooden beams. Each second 0.1 Wooden logs become 0.01 Wooden Beams. Trains Carpentry and a little Agility. Chopping power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making wooden beams",
        stopMessage: "You stop making wooden beams",
        isVisible: function () {
            return getEffectiveLevel("carpentry") >= 1
                && !!resources[RESOURCE_IDS.WOODEN_LOGS]
                && resources[RESOURCE_IDS.WOODEN_LOGS].amount >= BEAM_LOGS_PER_BATCH
                && player.stamina >= BEAM_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return !resources[RESOURCE_IDS.WOODEN_LOGS]
                || resources[RESOURCE_IDS.WOODEN_LOGS].amount < BEAM_LOGS_PER_BATCH;
        },
        completeMessage: "You have no logs left to square into beams",
        run: runMakeWoodenBeamsProduction,
    },
    {
        id: "makemortar",
        label: "Make Mortar",
        tags: ["Production"],
        description: "Mix 20 Sand and 20 Clay with water into 1 Mortar per second. Requires Alchemy and water on the current tile. Trains Alchemy and a little Agility.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start making mortar",
        stopMessage: "You stop making mortar",
        isVisible: function () {
            return getEffectiveLevel("alchemy") >= 1
                && hasWaterOnCurrentTile()
                && !!resources[RESOURCE_IDS.SAND]
                && resources[RESOURCE_IDS.SAND].amount >= MORTAR_SAND_PER_BATCH
                && !!resources[RESOURCE_IDS.CLAY]
                && resources[RESOURCE_IDS.CLAY].amount >= MORTAR_CLAY_PER_BATCH
                && player.stamina >= MORTAR_STAMINA_PER_BATCH;
        },
        isComplete: function () {
            return !hasWaterOnCurrentTile()
                || !resources[RESOURCE_IDS.SAND]
                || resources[RESOURCE_IDS.SAND].amount < MORTAR_SAND_PER_BATCH
                || !resources[RESOURCE_IDS.CLAY]
                || resources[RESOURCE_IDS.CLAY].amount < MORTAR_CLAY_PER_BATCH;
        },
        completeMessage: "You have no sand, clay or water left to make mortar",
        run: runMakeMortarProduction,
    },
    {
        id: "smeltcopper",
        label: "Smelt Copper",
        tags: ["Production"],
        description: "Smelt copper ore into copper bars. Requires 1 Smelt power. Each batch consumes 10 Copper Ore and 100 Heat Units and produces 1 Copper Bar. Trains Smithing and Vitality; Smelt power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start smelting copper",
        stopMessage: "You stop smelting copper",
        isVisible: function () {
            return canSmeltOre(RESOURCE_IDS.COPPER_ORE, SMELT_COPPER_POWER);
        },
        isComplete: function () {
            return isSmeltComplete(RESOURCE_IDS.COPPER_ORE, SMELT_COPPER_POWER);
        },
        completeMessage: "You have no copper ore or heat left to smelt",
        run: function (diff) {
            runSmeltProduction(diff, "smeltcopper", RESOURCE_IDS.COPPER_ORE, RESOURCE_IDS.COPPER_BAR, SMELT_COPPER_POWER);
        },
    },
    {
        id: "smelttin",
        label: "Smelt Tin",
        tags: ["Production"],
        description: "Smelt tin ore into tin bars. Requires 1 Smelt power. Each batch consumes 10 Tin Ore and 100 Heat Units and produces 1 Tin Bar. Trains Smithing and Vitality; Smelt power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start smelting tin",
        stopMessage: "You stop smelting tin",
        isVisible: function () {
            return canSmeltOre(RESOURCE_IDS.TIN_ORE, SMELT_TIN_POWER);
        },
        isComplete: function () {
            return isSmeltComplete(RESOURCE_IDS.TIN_ORE, SMELT_TIN_POWER);
        },
        completeMessage: "You have no tin ore or heat left to smelt",
        run: function (diff) {
            runSmeltProduction(diff, "smelttin", RESOURCE_IDS.TIN_ORE, RESOURCE_IDS.TIN_BAR, SMELT_TIN_POWER);
        },
    },
    {
        id: "smeltiron",
        label: "Smelt Iron",
        tags: ["Production"],
        description: "Smelt iron ore into iron bars. Requires 2 Smelt power. Each batch consumes 10 Iron Ore and 100 Heat Units and produces 1 Iron Bar. Trains Smithing and Vitality; Smelt power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start smelting iron",
        stopMessage: "You stop smelting iron",
        isVisible: function () {
            return canSmeltOre(RESOURCE_IDS.IRON_ORE, SMELT_IRON_POWER);
        },
        isComplete: function () {
            return isSmeltComplete(RESOURCE_IDS.IRON_ORE, SMELT_IRON_POWER);
        },
        completeMessage: "You have no iron ore or heat left to smelt",
        run: function (diff) {
            runSmeltProduction(diff, "smeltiron", RESOURCE_IDS.IRON_ORE, RESOURCE_IDS.IRON_BAR, SMELT_IRON_POWER);
        },
    },
    {
        id: "smeltgold",
        label: "Smelt Gold",
        tags: ["Production"],
        description: "Smelt gold ore into gold bars. Requires 3 Smelt power. Each batch consumes 10 Gold Ore and 100 Heat Units and produces 1 Gold Bar. Trains Smithing and Vitality; Smelt power increases processing speed.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start smelting gold",
        stopMessage: "You stop smelting gold",
        isVisible: function () {
            return canSmeltOre(RESOURCE_IDS.GOLD_ORE, SMELT_GOLD_POWER);
        },
        isComplete: function () {
            return isSmeltComplete(RESOURCE_IDS.GOLD_ORE, SMELT_GOLD_POWER);
        },
        completeMessage: "You have no gold ore or heat left to smelt",
        run: function (diff) {
            runSmeltProduction(diff, "smeltgold", RESOURCE_IDS.GOLD_ORE, RESOURCE_IDS.GOLD_BAR, SMELT_GOLD_POWER);
        },
    },
    ...BURN_ACTION_DEFS.map(createBurnAction),
    {
        id: "research",
        label: "Research",
        description: "Study the world around you and uncover new knowledge.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        staminaPerSecond: ACTION_STAMINA_PER_SECOND,
        startMessage: "You begin researching",
        stopMessage: "You stop researching",
        completeMessage: "Research complete",
        isVisible: function () {
            return researchUnlocked;
        },
        isComplete: function () {
            return activeResearchTechnology === null;
        },
        run: runResearchProduction,
    },
    {
        id: "rest",
        tags: ["restoration"],
        label: "Rest",
        description: "Just doing nothing are not enough. Let's enjoy it to the fullest!",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Done,
        startMessage: "Lets rest",
        stopMessage: "Your rest is over",
        availableMessage: "How about rest?",
        isVisible: function () {
            return player.stamina < player.maxstamina;
        },
        isComplete: function () {
            return player.stamina >= player.maxstamina;
        },
        completeMessage: "You are rested enough",
        run: runRestProduction,
    },
    {
        id: "sleep",
        tags: ["restoration"],
        label: "Sleep",
        description: function () {
            return "Sleep and let the tiredness drain away. Available above "
                + round2(getSleepThreshold())
                + " sleepyness.<br>Sleep quality: " + round2(getSleepQuality())
                + " sleepyness per second; HP, MANA and SP regeneration x"
                + round2(getSleepQuality())
                + ".<br>Each second: " + round2(getSleepPotentialChance() * PERCENT)
                + "% chance to raise a random skill's potential by "
                + round2(getSleepQuality()) + "%."
                + "<br>Also trains INS and SOU by "
                + round2(getSleepQuality() / 2) + " exp per second."
                + "<br>Stops automatically at 0 sleepyness.";
        },
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You go to sleep",
        stopMessage: "You wake up",
        isVisible: function () {
            // Once asleep, the action runs until sleepyness reaches 0, even
            // after it falls below the entry threshold.
            return isActionActive("sleep") || player.sleepyness > getSleepThreshold();
        },
        isComplete: function () {
            return (Number(player.sleepyness) || 0) <= 0;
        },
        completeMessage: "You wake up fully rested",
        run: runSleepProduction,
    },
    {
        id: "daydream",
        label: "DayDream",
        description: "Stare into the void for a while. Sometimes the void stares back with a useful thought.",
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You space out and start daydreaming",
        stopMessage: "You snap back to reality",
        isVisible: function () {
            return dayDreamUnlocked;
        },
        run: runDayDreamProduction,
    },
    {
        id: "movetoxy",
        label: "MoveToXY",
        tags: ["moverment"],
        hasButton: false,
        description: "Travel to the selected map tile along the shortest four-directional path.",
        kind: ACTION_KIND.Instant,
        initialState: Activity.Idle,
        run: function () {
            return startMoveToXYTravel(pendingMoveToXY);
        },
    },
    {
        id: "north",
        label: "Go north",
        getLabel: getMovementActionLabel,
        tags: ["Moverment"],
        description: "Freeze to death.",
        kind: ACTION_KIND.Instant,
        isVisible: canMove,
        move: { dx: 0, dy: -1, message: "north yoo" },
    },
    {
        id: "south",
        label: "Go south",
        getLabel: getMovementActionLabel,
        tags: ["Moverment"],
        description: "Roastlands",
        kind: ACTION_KIND.Instant,
        isVisible: canMove,
        move: { dx: 0, dy: 1, message: "south yoo" },
    },
    {
        id: "east",
        label: "Go east",
        getLabel: getMovementActionLabel,
        tags: ["Moverment"],
        description: "Enjoy the anime.",
        kind: ACTION_KIND.Instant,
        isVisible: canMove,
        move: { dx: 1, dy: 0, message: "north yoo" },
    },
    {
        id: "west",
        label: "Go west",
        getLabel: getMovementActionLabel,
        tags: ["Moverment"],
        description: "Doing columbus.",
        kind: ACTION_KIND.Instant,
        isVisible: canMove,
        move: { dx: -1, dy: 0, message: "west yoo" },
    },
];

const ACTIONS_BY_ID = Object.create(null);
ACTIONS.forEach(function (action) {
    ACTIONS_BY_ID[action.id] = action;
});

const actionStates = {};
const actionVisibility = {};
let dayDreamUnlocked = false;
let researchUnlocked = false;
let activeResearchTechnology = null;
let ResearchLeft = 0;
const MAX_RESEARCH_QUEUE = 2;
const researchQueue = [];
// Every non-restoration timed action the player starts is remembered here,
// so Lazy basics level 2 can resume all of them after rest or sleep.
let previousTimedActionIds = [];
let activeTravel = null;

function getResearchQueueLimit() {
    return MAX_RESEARCH_QUEUE + SCIENTIFIC_PLANS_TECHNOLOGY.level;
}
let idleWithoutActions = 0;

function resetActionStates() {
    ACTIONS.forEach(function (action) {
        actionStates[action.id] = action.initialState ?? Activity.Idle;
        actionVisibility[action.id] = false;
    });
}

function getAction(actionId) {
    return ACTIONS_BY_ID[actionId];
}

function getActionState(actionId) {
    return actionStates[actionId];
}

function isActionActive(actionId) {
    return actionStates[actionId] === Activity.Active;
}

function isActionVisible(action) {
    return action.isVisible ? action.isVisible() : true;
}

function getActionButton(actionId) {
    return document.getElementById("actionbutton-" + actionId);
}

function getActionTags(action) {
    if (!action || !Array.isArray(action.tags)) return [];
    return action.tags.filter(function (tag) {
        return typeof tag === "string" && tag.length > 0;
    });
}

function getActionDescription(action) {
    const description = typeof action.description === "function"
        ? action.description()
        : action.description;
    const tags = getActionTags(action);
    const tagsLine = tags.length
        ? '<br><span class="actiontooltip-tags">Tags: '
            + tags.join(", ") + "</span>"
        : "";

    return String(description || "") + tagsLine;
}

const MOVEMENT_WATER_TILE_NAMES = Object.freeze([
    "Ocean", "Deep Ocean", "Sea", "Deep Sea", "Lake",
]);
const MOVEMENT_MOUNTAIN_TILE_NAMES = Object.freeze([
    "Mountains", "Snowy Mountains", "High Mountains", "Volcano",
    "Mountain Peaks",
]);

function getMovementDestinationTile(action) {
    if (!action || !action.move
        || typeof currentTile === "undefined" || !currentTile) {
        return null;
    }

    const targetX = Number(currentTile.x) + Number(action.move.dx);
    const targetY = Number(currentTile.y) + Number(action.move.dy);
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return null;

    const world = typeof window !== "undefined" && window.mapView
        ? window.mapView.world
        : null;
    if (!world || typeof world.getTileData !== "function") return null;

    return world.getTileData(targetX, targetY);
}

function getMovementTileTypeName(tile) {
    if (!tile || typeof tile.type === "undefined") return "";

    const world = typeof window !== "undefined" && window.mapView
        ? window.mapView.world
        : null;
    const tileTypes = world && Array.isArray(world.tileTypes)
        ? world.tileTypes
        : [];
    const definition = tileTypes.find(function (type) {
        return type.id === tile.type;
    });

    return definition && definition.name ? definition.name : "";
}

function getMovementActionLabel(action) {
    const baseLabel = action && action.label ? String(action.label) : "";
    const match = baseLabel.match(/^Go\s+(.+)$/i);
    if (!match) return baseLabel;

    const direction = match[1];
    const tileName = getMovementTileTypeName(getMovementDestinationTile(action));

    if (MOVEMENT_WATER_TILE_NAMES.includes(tileName)) {
        return "Sail " + direction;
    }
    if (MOVEMENT_MOUNTAIN_TILE_NAMES.includes(tileName)) {
        return "Climb to " + direction;
    }
    return baseLabel;
}

function getActionLabel(action) {
    if (action && typeof action.getLabel === "function") {
        return action.getLabel(action);
    }
    return action && action.label ? action.label : "";
}

function getActionIdleColor(action) {
    if (hasActionTag(action, "Magic")) return ACTION_MAGIC_IDLE_COLOR;
    if (hasActionTag(action, "restoration")) return ACTION_RESTORATION_IDLE_COLOR;
    if (hasActionTag(action, "harvest")) return ACTION_HARVEST_IDLE_COLOR;
    if (hasActionTag(action, "Production")) return ACTION_PRODUCTION_IDLE_COLOR;
    if (hasActionTag(action, "Moverment")) return ACTION_MOVEMENT_IDLE_COLOR;
    if (hasActionTag(action, "combat")) return ACTION_COMBAT_IDLE_COLOR;
    return ACTION_IDLE_COLOR;
}

function createActionButton(action) {
    const button = document.createElement("button");
    button.className = "actionbutton";
    button.id = "actionbutton-" + action.id;
    button.dataset.action = action.id;
    button.dataset.state = "idle";
    if (hasActionTag(action, "Magic")) {
        button.classList.add("action-magic");
    } else if (hasActionTag(action, "restoration")) {
        button.classList.add("action-restoration");
    } else if (hasActionTag(action, "harvest")) {
        button.classList.add("action-harvest");
    } else if (hasActionTag(action, "Production")) {
        button.classList.add("action-production");
    } else if (hasActionTag(action, "Moverment")) {
        button.classList.add("action-moverment");
    } else if (hasActionTag(action, "combat")) {
        button.classList.add("action-combat");
    }
    button.style.visibility = "visible";

    const label = document.createElement("span");
    label.className = "actionbutton-label";
    label.innerText = getActionLabel(action);
    button.appendChild(label);

    const tags = getActionTags(action);
    if (tags.length) {
        const tagLine = document.createElement("span");
        tagLine.className = "actionbutton-tags";
        tagLine.innerText = tags.join(", ");
        button.appendChild(tagLine);
    }

    button.setAttribute("data-tooltip", getActionDescription(action));
    return button;
}

function updateActionButton(actionId) {
    const button = getActionButton(actionId);
    if (!button) return;

    // Action descriptions may depend on live values (Sleep does).
    const action = getAction(actionId);
    if (action) {
        button.setAttribute("data-tooltip", getActionDescription(action));
        const label = button.querySelector(".actionbutton-label");
        if (label) label.innerText = getActionLabel(action);
        const combatLocked = typeof isCombatActive === "function"
            && isCombatActive();
        const enabled = !combatLocked
            && (typeof action.isEnabled !== "function"
                || action.isEnabled() === true);
        button.disabled = !enabled;
        button.classList.toggle("actiondisabled", !enabled);
    }

    const state = isActionActive(actionId) ? "active" : "idle";
    // Apply the colour even when the state did not change: freshly created
    // buttons start with data-state="idle" before their first paint.
    button.style.backgroundColor = state === "active"
        ? ACTION_ACTIVE_COLOR
        : getActionIdleColor(action);
    if (button.dataset.state === state) return;

    button.dataset.state = state;
    button.setAttribute("aria-pressed", state === "active" ? "true" : "false");
}

function normalizePreviousTimedActionIds(ids, legacyId) {
    const source = ids !== undefined ? ids : legacyId;

    if (Array.isArray(source)) {
        return source.filter(function (actionId, index) {
            return typeof actionId === "string"
                && actionId
                && source.indexOf(actionId) === index;
        });
    }

    return typeof source === "string" && source ? [source] : [];
}

function hasActionTag(action, tag) {
    if (!action || !Array.isArray(action.tags)) return false;
    const wanted = String(tag).toLowerCase();
    return action.tags.some(function (actionTag) {
        return String(actionTag).toLowerCase() === wanted;
    });
}

function isRestorationAction(action) {
    return hasActionTag(action, "restoration");
}

function shouldRememberPreviousTimedAction(action) {
    if (!action || isRestorationAction(action)) return false;
    // Lazy basics 5+ starts daydreaming itself whenever the character is idle.
    // Do not also feed it into the level 2 resume list.
    if (action.id === "daydream" && LAZY_BASICS_TECHNOLOGY.level >= 5) return false;
    // Harvest the yummies owns automatic tree harvesting. While its habit is
    // enabled, Trees Harvest must not also be resumed as a previous action.
    if (action.id === "treesharvest"
        && typeof isHarvestTreesAutomationEnabled === "function"
        && isHarvestTreesAutomationEnabled()) {
        return false;
    }
    return true;
}

function startTimedAction(action) {
    if (typeof isCombatActive === "function" && isCombatActive()) {
        logMessage("You cannot start actions during combat.");
        return false;
    }
    if (actionsCount <= 0) {
        logMessage("No action points.");
        return false;
    }

    logMessage(action.startMessage);
    if (typeof action.onStart === "function") action.onStart();
    actionStates[action.id] = Activity.Active;
    // Restoration actions are recovery, never something to auto-resume.
    // Remember every started action so several can be resumed together.
    if (shouldRememberPreviousTimedAction(action)
        && previousTimedActionIds.indexOf(action.id) === -1) {
        previousTimedActionIds.push(action.id);
    }
    actionsCount -= 1;
    updateActionButton(action.id);
    if (action.id !== "focus") updateActionButton("focus");
    return true;
}

function stopTimedAction(action) {
    if (!isActionActive(action.id)) return false;

    logMessage(action.stopMessage);
    actionStates[action.id] = Activity.Idle;
    actionsCount += 1;
    updateActionButton(action.id);
    if (action.id !== "focus") updateActionButton("focus");
    return true;
}

function finishAction(actionId) {
    if (!isActionActive(actionId)) return;

    actionStates[actionId] = Activity.Done;
    actionsCount += 1;
    refreshActionButtons();
}

function startSearchAfterExploration() {
    if (LAZY_BASICS_TECHNOLOGY.level < 3) return;
    if (!isHabitEnabled("searchAfterExplore")) return;

    const searchAction = getAction("search");
    if (!searchAction || isActionActive(searchAction.id)) return;
    if (!isActionVisible(searchAction)) return;
    if (searchAction.isComplete && searchAction.isComplete()) return;
    if (actionsCount <= 0) return;

    refreshActionButtons();
    startTimedAction(searchAction);
}

function startForageAfterSearch() {
    if (LAZY_BASICS_TECHNOLOGY.level < 4) return;

    const forageAction = getAction("forage");
    if (!forageAction || isActionActive(forageAction.id)) return;
    if (!isActionVisible(forageAction)) return;
    if (forageAction.isComplete && forageAction.isComplete()) return;
    if (actionsCount <= 0) return;

    refreshActionButtons();
    startTimedAction(forageAction);
}

function startTreeHarvestIfEnabled() {
    if (typeof isHarvestTreesAutomationEnabled !== "function"
        || !isHarvestTreesAutomationEnabled()) {
        return false;
    }
    if (typeof isTraveling === "function" && isTraveling()) return false;

    const treeHarvestAction = getAction("treesharvest");
    if (!treeHarvestAction || isActionActive(treeHarvestAction.id)) return false;
    if (!isActionVisible(treeHarvestAction)) return false;
    if (treeHarvestAction.isComplete && treeHarvestAction.isComplete()) return false;
    if (actionsCount <= 0) return false;

    refreshActionButtons();
    return startTimedAction(treeHarvestAction);
}

function startDayDreamIfIdle() {
    if (LAZY_BASICS_TECHNOLOGY.level < 5) return;
    if (!isHabitEnabled("daydreamIdle")) return;

    const dayDreamAction = getAction("daydream");
    if (!dayDreamAction || isActionActive(dayDreamAction.id)) return;
    if (!isActionVisible(dayDreamAction)) return;
    if (actionsCount <= 0) return;

    const busy = ACTIONS.some(function (action) {
        return action.kind === ACTION_KIND.Timed && isActionActive(action.id);
    });
    if (busy) return;

    refreshActionButtons();
    startTimedAction(dayDreamAction);
}

function resumePreviousTimedActions() {
    if (LAZY_BASICS_TECHNOLOGY.level < 2) return 0;
    if (!Array.isArray(previousTimedActionIds) || previousTimedActionIds.length === 0) return 0;

    // Old saves may still contain daydreaming in the resume list. At level 5+
    // the dedicated idle daydream automation owns it instead.
    if (LAZY_BASICS_TECHNOLOGY.level >= 5) {
        previousTimedActionIds = previousTimedActionIds.filter(function (actionId) {
            return actionId !== "daydream";
        });
    }
    if (typeof isHarvestTreesAutomationEnabled === "function"
        && isHarvestTreesAutomationEnabled()) {
        previousTimedActionIds = previousTimedActionIds.filter(function (actionId) {
            return actionId !== "treesharvest";
        });
    }

    refreshActionButtons();
    let resumed = 0;

    // Snapshot the list: starting an action remembers it again.
    previousTimedActionIds.slice().forEach(function (actionId) {
        if (actionsCount <= 0) return;

        const previousAction = getAction(actionId);
        if (!previousAction || isRestorationAction(previousAction)) return;
        if (previousAction.kind !== ACTION_KIND.Timed) return;
        if (isActionActive(previousAction.id)) return;
        if (!isActionVisible(previousAction)) return;
        if (previousAction.isComplete && previousAction.isComplete()) return;

        if (startTimedAction(previousAction)) resumed += 1;
    });

    return resumed;
}

function stopActiveTimedActions() {
    ACTIONS.forEach(function (activeAction) {
        if (activeAction.kind === ACTION_KIND.Timed && isActionActive(activeAction.id)) {
            stopTimedAction(activeAction);
        }
    });
}

function toggleTimedAction(action) {
    if (isActionActive(action.id)) {
        stopTimedAction(action);
    } else if (isActionVisible(action)) {
        if (LAZY_BASICS_TECHNOLOGY.level >= 6 && actionsCount <= 0) {
            stopActiveTimedActions();
        }
        startTimedAction(action);
    }
}

function isTraveling() {
    return activeTravel !== null;
}

function updateTravelOverlay() {
    const actionPlace = document.getElementById("actionplace");
    if (!actionPlace) return;

    let overlay = document.getElementById("traveloperlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "traveloperlay";
        overlay.className = "traveloperlay";
        actionPlace.appendChild(overlay);
    }

    const traveling = isTraveling();
    // The remaining time is refreshed on every action-button refresh, so the
    // overlay counts down with the travel itself.
    overlay.textContent = traveling
        ? "Travelling... " + formatTravelTime(activeTravel.remaining)
        : "Travelling...";
    overlay.style.display = traveling ? "flex" : "none";
}

function getTravelTimeMultiplier() {
    const level = Math.max(0, getEffectiveLevel("traveling"));
    const reduction = Math.min(
        TRAVEL_MAX_TIME_REDUCTION,
        level * TRAVEL_TIME_REDUCTION_PER_LEVEL
    );
    return 1 - reduction;
}

function getTravelPassabilityForTile(targetX, targetY) {
    if (!window.mapView || typeof window.mapView.getTilePassability !== "function") {
        return 1;
    }

    const passability = Number(window.mapView.getTilePassability(targetX, targetY));
    return Number.isFinite(passability) && passability > 0 ? passability : 1;
}

function getTravelPassabilityMultiplier(dx, dy) {
    const targetX = currentTile.x + (Number(dx) || 0);
    const targetY = currentTile.y + (Number(dy) || 0);
    return getTravelPassabilityForTile(targetX, targetY);
}

function getTravelBaseDurationSeconds() {
    // Both old travel speed and the newer tiles move speed shorten the time
    // spent travelling between tiles.
    const speed = Math.max(1, getEffectiveLevel("speed"))
        * getGlobalPropertyMultiplier("travelSpeed")
        * getGlobalPropertyMultiplier("tilesMoveSpeed");
    const baseDuration = BASE_TRAVEL_TIME_SECONDS * STARTING_SPEED_LEVEL / speed;
    // Traveling is applied to the full travel time, so each level takes away
    // exactly 1% of it. Energetic / Snoozy / Sleepy then scale the result.
    return baseDuration * getTravelTimeMultiplier()
        * getTravelSleepynessMultiplier()
        * (typeof getGameWeatherTravelTimeMultiplier === "function"
            ? getGameWeatherTravelTimeMultiplier()
            : 1)
        * (typeof getDarkTravelTimeMultiplier === "function"
            ? getDarkTravelTimeMultiplier()
            : 1);
}

function getTravelDurationSecondsTo(targetX, targetY) {
    // The destination tile's passability is a speed multiplier: lower values
    // make the crossing take proportionally longer. Rounding keeps the tick
    // count clean (no 3.0000000002s).
    return round2(
        getTravelBaseDurationSeconds()
        / getTravelPassabilityForTile(targetX, targetY)
    );
}

function getTravelDurationSeconds(dx, dy) {
    return getTravelDurationSecondsTo(
        currentTile.x + (Number(dx) || 0),
        currentTile.y + (Number(dy) || 0)
    );
}

function addTravelExperience(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;

    const exp = seconds * TRAVEL_EXP_PER_SECOND;
    if (player.speed) player.speed.addexp(exp);
    if (player.traveling) player.traveling.addexp(exp);
}

function formatTravelTime(seconds) {
    const totalSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return minutes + "m " + String(remainingSeconds).padStart(2, "0") + "s";
}

// --- MoveToXY --------------------------------------------------------------
// A* movement over the map. Four-directional only: diagonal steps are never
// considered. The edge cost is the current travel time for entering a tile,
// so slower terrain is naturally avoided when a faster route exists.
const MOVE_TO_XY_SEARCH_MARGIN = 8;
const MOVE_TO_XY_MAX_NODES = 40000;

let pendingMoveToXY = null;

function getMaxTilePassability() {
    const world = typeof window !== "undefined" && window.mapView
        ? window.mapView.world
        : null;
    const tileTypes = world && Array.isArray(world.tileTypes)
        ? world.tileTypes
        : [];
    let maxPassability = 1;
    tileTypes.forEach(function (type) {
        const passability = Number(type && type.passability);
        if (Number.isFinite(passability) && passability > maxPassability) {
            maxPassability = passability;
        }
    });
    return maxPassability;
}

function getMoveToXYTileKey(x, y) {
    return x + "," + y;
}

function findMoveToXYPath(startX, startY, targetX, targetY) {
    const fromX = Math.trunc(Number(startX));
    const fromY = Math.trunc(Number(startY));
    const toX = Math.trunc(Number(targetX));
    const toY = Math.trunc(Number(targetY));
    if (![fromX, fromY, toX, toY].every(Number.isFinite)) return null;
    if (fromX === toX && fromY === toY) {
        return { path: [], travelAmount: 0 };
    }

    const baseDuration = getTravelBaseDurationSeconds();
    const heuristicStepCost = baseDuration / getMaxTilePassability();
    const heuristic = function (x, y) {
        return (Math.abs(x - toX) + Math.abs(y - toY)) * heuristicStepCost;
    };

    const minX = Math.min(fromX, toX) - MOVE_TO_XY_SEARCH_MARGIN;
    const maxX = Math.max(fromX, toX) + MOVE_TO_XY_SEARCH_MARGIN;
    const minY = Math.min(fromY, toY) - MOVE_TO_XY_SEARCH_MARGIN;
    const maxY = Math.max(fromY, toY) + MOVE_TO_XY_SEARCH_MARGIN;

    const open = new MinHeap();
    const closed = new Set();
    const gScore = new Map();
    const cameFrom = new Map();
    const startKey = getMoveToXYTileKey(fromX, fromY);

    gScore.set(startKey, 0);
    open.push({
        x: fromX,
        y: fromY,
        priority: heuristic(fromX, fromY),
    });

    const directions = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
    ];
    let visited = 0;

    while (open.size > 0 && visited < MOVE_TO_XY_MAX_NODES) {
        const current = open.pop();
        const currentKey = getMoveToXYTileKey(current.x, current.y);
        if (closed.has(currentKey)) continue;
        closed.add(currentKey);
        visited += 1;

        if (current.x === toX && current.y === toY) {
            const path = [];
            let cursor = { x: toX, y: toY };
            while (!(cursor.x === fromX && cursor.y === fromY)) {
                path.push({ x: cursor.x, y: cursor.y });
                cursor = cameFrom.get(getMoveToXYTileKey(cursor.x, cursor.y));
                if (!cursor) return null;
            }
            path.reverse();

            let travelAmount = 0;
            path.forEach(function (step) {
                travelAmount += getTravelDurationSecondsTo(step.x, step.y);
            });

            return {
                path: path,
                travelAmount: round2(travelAmount),
            };
        }

        const currentG = gScore.get(currentKey);
        if (!Number.isFinite(currentG)) continue;

        directions.forEach(function (direction) {
            const nextX = current.x + direction.x;
            const nextY = current.y + direction.y;
            if (nextX < minX || nextX > maxX || nextY < minY || nextY > maxY) {
                return;
            }

            const nextKey = getMoveToXYTileKey(nextX, nextY);
            if (closed.has(nextKey)) return;

            const passability = getTravelPassabilityForTile(nextX, nextY);
            const stepCost = baseDuration / passability;
            const tentativeG = currentG + stepCost;
            const previousG = gScore.get(nextKey);

            if (previousG !== undefined && tentativeG >= previousG) return;

            cameFrom.set(nextKey, { x: current.x, y: current.y });
            gScore.set(nextKey, tentativeG);
            open.push({
                x: nextX,
                y: nextY,
                priority: tentativeG + heuristic(nextX, nextY),
            });
        });
    }

    return null;
}

function areMovementActionsAvailable() {
    if (typeof currentTile === "undefined" || !currentTile) return false;
    if (isTraveling()) return false;

    return ["north", "south", "east", "west"].some(function (actionId) {
        const action = getAction(actionId);
        if (!action) return false;
        if (!isActionVisible(action)) return false;
        return typeof action.isEnabled !== "function"
            || action.isEnabled() === true;
    });
}

function closeMapTravelDialog() {
    const dialog = document.getElementById("maptraveldialog");
    if (dialog) dialog.remove();
}

function showMapTravelDialog(tileX, tileY, pathInfo) {
    closeMapTravelDialog();

    const mapView = typeof window !== "undefined" ? window.mapView : null;
    const container = mapView && mapView.container;
    if (!container) return;

    const dialog = document.createElement("div");
    dialog.id = "maptraveldialog";
    dialog.className = "map-travel-dialog";
    dialog.setAttribute("role", "dialog");

    const text = document.createElement("div");
    text.className = "map-travel-dialog-text";
    text.innerText = "You need " + formatTravelTime(pathInfo.travelAmount)
        + " time to travel, proceed?";
    dialog.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "map-travel-dialog-actions";

    const yesButton = document.createElement("button");
    yesButton.type = "button";
    yesButton.className = "map-travel-dialog-yes";
    yesButton.innerText = "Yes Lets travel";
    yesButton.addEventListener("click", function () {
        pendingMoveToXY = pathInfo;
        closeMapTravelDialog();
        const action = getAction("movetoxy");
        if (action) performAction(action);
    });
    actions.appendChild(yesButton);

    const noButton = document.createElement("button");
    noButton.type = "button";
    noButton.className = "map-travel-dialog-no";
    noButton.innerText = "No";
    noButton.addEventListener("click", closeMapTravelDialog);
    actions.appendChild(noButton);

    dialog.appendChild(actions);
    container.appendChild(dialog);

    // Center the dialog on the clicked tile. The canvas and the dialog share
    // the same container origin, so camera-relative tile coordinates apply.
    const centerX = (tileX + 0.5) * mapView.tileSize - mapView.cameraX;
    const centerY = (tileY + 0.5) * mapView.tileSize - mapView.cameraY;
    dialog.style.left = centerX + "px";
    dialog.style.top = centerY + "px";

    const halfWidth = dialog.offsetWidth / 2;
    const halfHeight = dialog.offsetHeight / 2;
    const safeX = Math.max(halfWidth + 4, Math.min(
        container.clientWidth - halfWidth - 4,
        centerX
    ));
    const safeY = Math.max(halfHeight + 4, Math.min(
        container.clientHeight - halfHeight - 4,
        centerY
    ));
    dialog.style.left = safeX + "px";
    dialog.style.top = safeY + "px";
}

function handleMapTileDoubleClick(tileX, tileY, event) {
    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
    }

    if (!areMovementActionsAvailable()) {
        logMessage("Moverment between tiles is not available right now");
        return;
    }

    const targetX = Math.trunc(Number(tileX));
    const targetY = Math.trunc(Number(tileY));
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) return;

    if (targetX === currentTile.x && targetY === currentTile.y) {
        logMessage("You are already here.");
        return;
    }

    const pathInfo = findMoveToXYPath(
        currentTile.x,
        currentTile.y,
        targetX,
        targetY
    );
    if (!pathInfo || pathInfo.path.length === 0) {
        logMessage("Moverment between tiles is not available right now");
        return;
    }

    pathInfo.targetX = targetX;
    pathInfo.targetY = targetY;
    showMapTravelDialog(targetX, targetY, pathInfo);
}

function startMoveToXYTravel(travel) {
    pendingMoveToXY = null;
    if (!travel || !Array.isArray(travel.path) || travel.path.length === 0) {
        return false;
    }
    if (!areMovementActionsAvailable()) {
        logMessage("Moverment between tiles is not available right now");
        return false;
    }

    stopActiveTimedActions();
    activeTravel = {
        path: travel.path.map(function (step) {
            return { x: step.x, y: step.y };
        }),
        targetX: travel.targetX,
        targetY: travel.targetY,
        message: "You travel to X: " + travel.targetX + ", Y: " + travel.targetY,
        remaining: travel.travelAmount,
        duration: travel.travelAmount,
    };
    logMessage("You start traveling." + formatTravelTime(travel.travelAmount));
    refreshActionButtons();
    return true;
}

function movePlayer(dx, dy, message) {
    if (isTraveling()) {
        logMessage("You are already traveling.");
        return;
    }

    stopActiveTimedActions();

    const duration = getTravelDurationSeconds(dx, dy);
    activeTravel = {
        dx: dx,
        dy: dy,
        message: message,
        remaining: duration,
        duration: duration,
    };
    logMessage("You start traveling." + formatTravelTime(duration));
    refreshActionButtons();
}

function runTravelProduction(diff) {
    if (!activeTravel) return;

    // Only count the time actually spent on the road: a long tick (for example
    // after a background tab) must not grant exp for time after arrival.
    const traveledSeconds = Math.min(
        Math.max(0, diff),
        Math.max(0, activeTravel.remaining)
    );

    activeTravel.remaining -= diff;
    if (traveledSeconds > 0) addTravelExperience(traveledSeconds);
    if (activeTravel.remaining > 0) return;

    const travel = activeTravel;
    activeTravel = null;

    const nextX = travel.targetX !== null && travel.targetX !== undefined
        && Number.isFinite(Number(travel.targetX))
        ? Number(travel.targetX)
        : currentTile.x + travel.dx;
    const nextY = travel.targetY !== null && travel.targetY !== undefined
        && Number.isFinite(Number(travel.targetY))
        ? Number(travel.targetY)
        : currentTile.y + travel.dy;
    if (window.mapView && typeof window.mapView.getGameplayTile === "function") {
        currentTile = window.mapView.getGameplayTile(nextX, nextY);
        if (typeof window.mapView.focusTile === "function") {
            window.mapView.focusTile(nextX, nextY);
        } else {
            window.mapView.refresh();
        }
    }

    logMessage(travel.message);
    logMessage("You have arrived.");
    // Arriving on a new tile is a second weather-change trigger.
    if (typeof notifyGameTileChanged === "function") notifyGameTileChanged();
    refreshActionButtons();
}

function performAction(action) {
    if (typeof isCombatActive === "function" && isCombatActive()) {
        logMessage("All actions are blocked during combat.");
        return;
    }
    if (action.kind === ACTION_KIND.Timed) {
        toggleTimedAction(action);
    } else if (action.move) {
        movePlayer(action.move.dx, action.move.dy, action.move.message);
    } else if (action.run) {
        action.run();
    }
}

function clickAction(actionId) {
    const action = getAction(actionId);
    if (!action) {
        logMessage("actionbtnid" + actionId);
        return;
    }

    if (typeof action.isEnabled === "function" && action.isEnabled() !== true) {
        if (action.unavailableMessage) logMessage(action.unavailableMessage);
        updateActionButton(action.id);
        return;
    }

    performAction(action);
    logMessage("derpp" + action.label);
}

function getNextVisibleActionButton(action) {
    const actionIndex = ACTIONS.indexOf(action);
    for (let index = actionIndex + 1; index < ACTIONS.length; index++) {
        const nextButton = getActionButton(ACTIONS[index].id);
        if (nextButton) return nextButton;
    }
    return null;
}

function refreshActionButtons(silent) {
    const actionPlace = document.getElementById("actionplace");
    if (!actionPlace) return;

    ACTIONS.forEach(function (action) {
        // Some actions are triggered from the world (MoveToXY) and must never
        // create a button in the actions panel.
        if (action.hasButton === false) {
            actionVisibility[action.id] = false;
            const hiddenButton = getActionButton(action.id);
            if (hiddenButton) hiddenButton.remove();
            return;
        }

        const visible = isActionVisible(action);
        const wasVisible = actionVisibility[action.id] === true;

        if (visible && !wasVisible && !silent && action.availableMessage && getActionState(action.id) === Activity.Done) {
            logMessage(action.availableMessage);
            actionStates[action.id] = Activity.Idle;
        }
        actionVisibility[action.id] = visible;

        let button = getActionButton(action.id);
        if (!visible) {
            if (isActionActive(action.id)) {
                actionStates[action.id] = Activity.Done;
                actionsCount += 1;
            }
            if (button) button.remove();
            return;
        }

        if (!button) {
            button = createActionButton(action);
            const nextButton = getNextVisibleActionButton(action);
            if (nextButton) {
                actionPlace.insertBefore(button, nextButton);
            } else {
                actionPlace.appendChild(button);
            }
        }
        updateActionButton(action.id);
    });

    updateTravelOverlay();
}

function clearActionButtons() {
    const actionPlace = document.getElementById("actionplace");
    if (actionPlace) {
        actionPlace.querySelectorAll(".actionbutton").forEach(function (button) {
            button.remove();
        });
    }

    ACTIONS.forEach(function (action) {
        actionVisibility[action.id] = false;
    });
}

function updateTechnologyButtons() {
    TECHNOLOGIES.forEach(function (technology) {
        const button = document.getElementById(technology.buttonId);
        if (!button) return;

        const researching = technology.status === TechnologyStatus.Researching;
        const completed = technology.status === TechnologyStatus.Completed;

        button.classList.toggle("researching", researching);
        button.classList.toggle("completed", completed);
        button.disabled = completed;
        button.dataset.level = String(technology.level);
        button.dataset.maxLevel = Number.isFinite(Number(technology.maxLevel))
            ? String(technology.maxLevel)
            : "∞";
        const levelsDescription = technology.getLevelsDescription();
        button.setAttribute(
            "data-tooltip",
            technology.getDescription()
                + (levelsDescription ? "<br><br><b>Level effects:</b><br>" + levelsDescription : "")
                + "<br><br>Research points: " + technology.getRequiredResearch()
        );
    });
    if (typeof updateHabitVisibility === "function") updateHabitVisibility();
    if (typeof updateHabitSettings === "function") updateHabitSettings();
}

function tryActivateAutoRest() {
    if (LAZY_BASICS_TECHNOLOGY.level < 1) return;
    if (!isHabitEnabled("autoRest")) return;
    if (player.stamina > MIN_STAMINA_TO_FORAGE) return;
    if (player.stamina >= player.maxstamina) return;

    const restAction = getAction("rest");
    if (!restAction || isActionActive("rest")) return;
    if (!isActionVisible(restAction)) return;
    if (actionsCount <= 0) return;

    const busy = ACTIONS.some(function (action) {
        return action.kind === ACTION_KIND.Timed && isActionActive(action.id);
    });
    if (busy) return;

    refreshActionButtons();
    startTimedAction(restAction);
}

function beginResearch(technology) {
    activeResearchTechnology = technology;
    ResearchLeft = technology.getRequiredResearch();
    technology.status = TechnologyStatus.Researching;
    researchUnlocked = true;
    updateTechnologyButtons();
}

function getNextQueuedResearch() {
    while (researchQueue.length > 0) {
        const technology = researchQueue.shift();
        if (!technology || technology.status === TechnologyStatus.Completed) continue;

        if (!technology.meetsRequirements()) {
            logMessage(technology.name + " cannot be researched yet; skipped.");
            continue;
        }

        return technology;
    }

    return null;
}

function getCheapestAvailableResearch() {
    let cheapest = null;
    let cheapestCost = Infinity;

    TECHNOLOGIES.forEach(function (technology) {
        if (technology.status === TechnologyStatus.Completed) return;
        if (!technology.meetsRequirements()) return;

        const cost = technology.getRequiredResearch();
        if (!Number.isFinite(cost)) return;
        if (cost < cheapestCost) {
            cheapest = technology;
            cheapestCost = cost;
        }
    });

    return cheapest;
}

function tryStartResearch(technology) {
    if (!technology || technology.status === TechnologyStatus.Completed) return;

    if (isActionActive("research")) {
        const queueLimit = getResearchQueueLimit();
        if (researchQueue.length >= queueLimit) {
            logMessage("Research queue is full.");
            return;
        }

        researchQueue.push(technology);
        logMessage(technology.name + " added to research queue (" + researchQueue.length + "/" + queueLimit + ")");
        return;
    }

    const hasActiveTimedAction = ACTIONS.some(function (action) {
        return action.kind === ACTION_KIND.Timed && isActionActive(action.id);
    });
    const canAutoSwitch = hasActiveTimedAction
        && researchQueue.length === 0
        && COZY_SCIENCE_TECHNOLOGY.level >= 1
        && isHabitEnabled("cozyScienceAutoResearch");

    if (canAutoSwitch) {
        if (!technology.meetsRequirements()) {
            logMessage("You do not meet the requirements for " + technology.name + ".");
            return;
        }
        stopActiveTimedActions();
        logMessage("Cozy science cancels the current action to start research.");
    } else if (actionsCount <= 0) {
        logMessage("No free actions to start research.");
        return;
    }

    if (!technology.meetsRequirements()) {
        logMessage("You do not meet the requirements for " + technology.name + ".");
        return;
    }

    beginResearch(technology);
    refreshActionButtons();
    startTimedAction(getAction("research"));
}

function updateDayDreamUnlock(diff) {
    if (dayDreamUnlocked) return;

    const hasActiveAction = ACTIONS.some(function (action) {
        return action.kind === ACTION_KIND.Timed && isActionActive(action.id);
    });

    if (hasActiveAction) {
        idleWithoutActions = 0;
        return;
    }

    idleWithoutActions += Number(diff) || 0;
    if (idleWithoutActions >= DAYDREAM_UNLOCK_SECONDS) {
        dayDreamUnlocked = true;
        logMessage("Doing nothing for so long... how about daydreaming?");
    }
}

function runActiveActions(diff) {
    if (typeof isCombatActive === "function" && isCombatActive()) return;
    ACTIONS.forEach(function (action) {
        if (action.kind !== ACTION_KIND.Timed || !isActionActive(action.id)) return;

        action.run(diff);
        consumeActionStamina(action, diff);

        if (action.isComplete && action.isComplete()) {
            if (action.completeMessage) logMessage(action.completeMessage);
            finishAction(action.id);
            // Every restoration action (rest or sleep) should hand control
            // back to the action that was interrupted, not only Rest.
            if (isRestorationAction(action)) resumePreviousTimedActions();
            if (action.id === "explore") startSearchAfterExploration();
            if (action.id === "search") startForageAfterSearch();
            startTreeHarvestIfEnabled();
            startDayDreamIfIdle();
        }
    });

    startTreeHarvestIfEnabled();
}

// Above 900 sleepyness the character may doze off against their will.
// Never triggers while traveling between tiles.
function getForcedSleepChance() {
    const sleepyness = Number(player && player.sleepyness) || 0;
    return Math.max(
        0,
        Math.min(1, (sleepyness - FORCED_SLEEP_THRESHOLD) / PERCENT)
    );
}

function tryFallAsleep(diff) {
    if (!player || isTraveling()) return;
    if (typeof isCombatActive === "function" && isCombatActive()) return;
    if (isActionActive("sleep")) return;

    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return;

    const chancePerSecond = getForcedSleepChance();
    if (chancePerSecond <= 0) return;

    // Convert the per-second chance into one roll for the whole tick.
    const chance = 1 - Math.pow(1 - chancePerSecond, seconds);
    if (Math.random() >= chance) return;

    const sleepAction = getAction("sleep");
    if (!sleepAction) return;

    logMessage("You can't keep your eyes open...");
    stopActiveTimedActions();
    startTimedAction(sleepAction);
}

document.addEventListener("click", function (event) {
    const button = event.target.closest(".actionbutton");
    if (!button || !button.dataset.action) return;
    clickAction(button.dataset.action);
});

resetActionStates();
