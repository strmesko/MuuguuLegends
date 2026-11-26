// --- Unified automatic behavior --------------------------------------------
// One priority model owns every automatic action decision. Habit switches and
// the automatic action systems all feed this list instead of competing with
// each other:
//
//   1. Sleep
//   2. Rest
//   3. Harvest trees
//   4. Quartermaster resource actions
//   5. Research
//   6. Saved actions (last N actions, excluding habit-managed ones)
//   7. Daydream
//
// Higher tiers may preempt lower tiers when no action slot is free. Lower
// tiers only fill free slots and never interrupt a higher tier.

const PLAYER_BEHAVIOR_PRIORITIES = Object.freeze([
    { id: "sleep", name: "Sleep", rank: 1 },
    { id: "rest", name: "Rest", rank: 2 },
    { id: "treesharvest", name: "Harvest trees", rank: 3 },
    { id: "quartermaster", name: "Manage resources", rank: 4 },
    { id: "research", name: "Research", rank: 5 },
    { id: "saved", name: "Saved actions", rank: 6 },
    { id: "daydream", name: "Daydream", rank: 7 },
]);

function isBehaviorBlocked() {
    if (typeof isOfflineSimulationRunning === "function"
        && isOfflineSimulationRunning()) {
        return true;
    }
    if (typeof isCombatActive === "function" && isCombatActive()) return true;
    if (typeof isTraveling === "function" && isTraveling()) return true;
    if (typeof isNpcDialogueActive === "function"
        && isNpcDialogueActive()) return true;
    return false;
}

function getActiveTimedActionIdsForBehavior() {
    if (typeof ACTIONS === "undefined"
        || typeof actionStates === "undefined"
        || typeof Activity === "undefined") {
        return [];
    }
    return ACTIONS.filter(function (action) {
        return action
            && action.kind === ACTION_KIND.Timed
            && actionStates[action.id] === Activity.Active;
    }).map(function (action) {
        return action.id;
    });
}

function hasActiveRestorationActionForBehavior() {
    if (typeof isRestorationAction !== "function") return false;
    return getActiveTimedActionIdsForBehavior().some(function (actionId) {
        const action = typeof getAction === "function"
            ? getAction(actionId)
            : null;
        return action && isRestorationAction(action);
    });
}

function getQuartermisterHabitForAction(actionId) {
    if (typeof getQuartermisterHabits !== "function"
        || typeof QUARTERMISTER_TECHNOLOGY === "undefined") {
        return null;
    }
    return getQuartermisterHabits().find(function (habit) {
        if (!habit || habit.actionId !== actionId) return false;
        if (QUARTERMISTER_TECHNOLOGY.level < habit.requiredLevel) return false;
        return typeof getQuartermisterTarget === "function"
            && getQuartermisterTarget(habit.id) > 0;
    }) || null;
}

// True when an action is already owned by a habit and must not be resumed as
// an ordinary saved action.
function isActionManagedByEnabledHabit(actionId) {
    if (!actionId) return false;
    if (actionId === "research") return true;
    if (actionId === "rest") {
        return typeof LAZY_BASICS_TECHNOLOGY !== "undefined"
            && LAZY_BASICS_TECHNOLOGY.level >= 1
            && typeof isHabitEnabled === "function"
            && isHabitEnabled("autoRest");
    }
    if (actionId === "treesharvest") {
        return typeof HARVEST_THE_YUMMIES_TECHNOLOGY !== "undefined"
            && HARVEST_THE_YUMMIES_TECHNOLOGY.level >= 1
            && typeof isHabitEnabled === "function"
            && isHabitEnabled("harvestTrees");
    }
    if (actionId === "daydream") {
        return typeof LAZY_BASICS_TECHNOLOGY !== "undefined"
            && LAZY_BASICS_TECHNOLOGY.level >= 5
            && typeof isHabitEnabled === "function"
            && isHabitEnabled("daydreamIdle");
    }
    return getQuartermisterHabitForAction(actionId) !== null;
}

function getBehaviorRank(actionId) {
    if (actionId === "sleep") return 1;
    if (actionId === "rest") return 2;
    if (actionId === "treesharvest") {
        return isActionManagedByEnabledHabit("treesharvest") ? 3 : 6;
    }
    if (getQuartermisterHabitForAction(actionId)) return 4;
    if (actionId === "research") return 5;
    if (actionId === "daydream") return 7;
    return 6;
}

function findPreemptableBehaviorAction(desiredRank) {
    let victim = null;
    getActiveTimedActionIdsForBehavior().forEach(function (actionId) {
        // Recovery always keeps running.
        if (actionId === "sleep" || actionId === "rest") return;
        const rank = getBehaviorRank(actionId);
        if (rank <= desiredRank) return;
        if (!victim || rank > victim.rank) {
            victim = { id: actionId, rank: rank };
        }
    });
    return victim;
}

function ensureBehaviorSlot(desiredRank) {
    if (typeof actionsCount === "undefined") return true;
    if (actionsCount > 0) return true;

    const victim = findPreemptableBehaviorAction(desiredRank);
    if (!victim || typeof getAction !== "function"
        || typeof stopTimedAction !== "function") {
        return false;
    }
    const action = getAction(victim.id);
    if (!action) return false;
    stopTimedAction(action);
    return actionsCount > 0;
}

function tryBehaviorRest() {
    if (typeof LAZY_BASICS_TECHNOLOGY === "undefined"
        || LAZY_BASICS_TECHNOLOGY.level < 1) {
        return false;
    }
    if (typeof isHabitEnabled !== "function"
        || !isHabitEnabled("autoRest")) {
        return false;
    }
    if (typeof player === "undefined" || !player) return false;
    if (player.stamina > MIN_STAMINA_TO_FORAGE) return false;
    if (player.stamina >= player.maxstamina) return false;
    if (hasActiveRestorationActionForBehavior()) return false;
    if (typeof isActionActive === "function" && isActionActive("rest")) {
        return false;
    }

    const restAction = typeof getAction === "function" ? getAction("rest") : null;
    if (!restAction) return false;
    if (typeof isActionVisible === "function" && !isActionVisible(restAction)) {
        return false;
    }
    if (!ensureBehaviorSlot(2)) return false;
    if (typeof tryActivateAutoRest === "function") {
        return tryActivateAutoRest();
    }
    return false;
}

function tryBehaviorHarvestTrees() {
    if (typeof isHarvestTreesAutomationEnabled !== "function"
        || !isHarvestTreesAutomationEnabled()) {
        return false;
    }
    if (hasActiveRestorationActionForBehavior()) return false;

    const action = typeof getAction === "function"
        ? getAction("treesharvest")
        : null;
    if (!action || (typeof isActionActive === "function"
        && isActionActive(action.id))) {
        return false;
    }
    if (typeof isActionVisible === "function" && !isActionVisible(action)) {
        return false;
    }
    if (action.isComplete && action.isComplete()) return false;
    if (!ensureBehaviorSlot(3)) return false;

    return typeof startTreeHarvestIfEnabled === "function"
        ? startTreeHarvestIfEnabled()
        : false;
}

function needsQuartermisterBehavior() {
    if (typeof QUARTERMISTER_TECHNOLOGY === "undefined"
        || QUARTERMISTER_TECHNOLOGY.level < 1) {
        return false;
    }
    if (typeof getQuartermisterHabits !== "function"
        || typeof isQuartermisterActionNeeded !== "function") {
        return false;
    }
    return getQuartermisterHabits().some(function (habit) {
        return isQuartermisterActionNeeded(habit);
    });
}

function tryBehaviorQuartermaster() {
    if (!needsQuartermisterBehavior()) return false;
    if (hasActiveRestorationActionForBehavior()) return false;

    const quartermisterActionActive = getQuartermisterHabits().some(function (habit) {
        const action = typeof getAction === "function"
            ? getAction(habit.actionId)
            : null;
        return action && typeof isActionActive === "function"
            && isActionActive(action.id);
    });
    if (!quartermisterActionActive && !ensureBehaviorSlot(4)) return false;
    if (typeof updateQuartermisterAutomation === "function") {
        updateQuartermisterAutomation(1);
    }
    return true;
}

function hasBehaviorResearchTarget() {
    if (typeof activeResearchTechnology !== "undefined"
        && activeResearchTechnology) {
        return true;
    }
    if (typeof researchQueue !== "undefined"
        && Array.isArray(researchQueue)
        && researchQueue.length > 0) {
        return true;
    }
    if (typeof COZY_SCIENCE_TECHNOLOGY !== "undefined"
        && COZY_SCIENCE_TECHNOLOGY.level >= 2
        && typeof isHabitEnabled === "function"
        && isHabitEnabled("cozyScienceAutoNext")) {
        return typeof getCheapestAvailableResearch === "function"
            && getCheapestAvailableResearch() !== null;
    }
    return false;
}

function tryBehaviorResearch() {
    if (typeof getAction !== "function" || typeof isActionActive !== "function") {
        return false;
    }
    if (typeof researchAutoStartBlocked !== "undefined"
        && researchAutoStartBlocked) {
        return false;
    }
    if (isActionActive("research")) return false;
    if (hasActiveRestorationActionForBehavior()) return false;
    if (!hasBehaviorResearchTarget()) return false;

    const researchAction = getAction("research");
    if (!researchAction
        || (typeof isActionVisible === "function"
            && !isActionVisible(researchAction))) {
        return false;
    }
    if (!ensureBehaviorSlot(5)) return false;

    let technology = typeof activeResearchTechnology !== "undefined"
        ? activeResearchTechnology
        : null;
    if (!technology && typeof researchQueue !== "undefined"
        && Array.isArray(researchQueue) && researchQueue.length > 0
        && typeof getNextQueuedResearch === "function") {
        technology = getNextQueuedResearch();
    }
    if (!technology
        && typeof COZY_SCIENCE_TECHNOLOGY !== "undefined"
        && COZY_SCIENCE_TECHNOLOGY.level >= 2
        && typeof isHabitEnabled === "function"
        && isHabitEnabled("cozyScienceAutoNext")
        && typeof getCheapestAvailableResearch === "function") {
        technology = getCheapestAvailableResearch();
    }
    if (!technology || !technology.meetsRequirements()) return false;

    if (typeof beginResearch === "function") {
        beginResearch(technology);
    }
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    return startTimedAction(researchAction, { remember: false });
}

function tryBehaviorSavedActions() {
    if (hasActiveRestorationActionForBehavior()) return false;
    if (typeof resumePreviousTimedActions === "function") {
        resumePreviousTimedActions();
    }
    return true;
}

function tryBehaviorDayDream() {
    if (typeof startDayDreamIfIdle !== "function") return false;
    if (hasActiveRestorationActionForBehavior()) return false;
    return startDayDreamIfIdle();
}

function runPlayerBehavior(reason) {
    if (isBehaviorBlocked()) return false;
    if (typeof isActionActive === "function" && isActionActive("sleep")) {
        return false;
    }

    // Sleep is owned by the forced-sleep roll in tryFallAsleep. If sleep is
    // due right now, do not start anything below it.
    if (typeof getForcedSleepChance === "function"
        && getForcedSleepChance() >= 1
        && typeof isActionActive === "function"
        && !isActionActive("sleep")) {
        return false;
    }

    tryBehaviorRest();
    // Recovery is exclusive: lower tiers wait until rest or sleep ends.
    if (hasActiveRestorationActionForBehavior()) {
        updateBehaviorSummary();
        return true;
    }

    tryBehaviorHarvestTrees();
    tryBehaviorQuartermaster();
    tryBehaviorResearch();
    tryBehaviorSavedActions();
    tryBehaviorDayDream();

    updateBehaviorSummary();
    return true;
}

let behaviorSummaryCache = "";

function updateBehaviorSummary() {
    const container = document.getElementById("habitbehavior");
    if (!container) return;

    const priorityList = document.getElementById("habitbehaviorpriority");
    const savedList = document.getElementById("habitbehaviorsaved");
    if (!priorityList || !savedList) return;

    const max = typeof getMaxActionSlots === "function"
        ? getMaxActionSlots()
        : 1;
    const saved = typeof previousTimedActionIds !== "undefined"
        && Array.isArray(previousTimedActionIds)
        ? previousTimedActionIds.map(function (actionId) {
            const action = typeof getAction === "function"
                ? getAction(actionId)
                : null;
            return action && action.label ? action.label : actionId;
        })
        : [];
    const priorityText = PLAYER_BEHAVIOR_PRIORITIES
        .map(function (entry) { return entry.name; })
        .join(" → ");
    const savedText = "Saved actions: " + saved.length + " / " + max
        + (saved.length ? " (" + saved.join(", ") + ")" : "");
    const cacheKey = priorityText + "|" + savedText;
    if (cacheKey === behaviorSummaryCache
        && priorityList.textContent
        && savedList.textContent) {
        return;
    }
    behaviorSummaryCache = cacheKey;

    priorityList.textContent = priorityText;
    savedList.textContent = savedText;
}
