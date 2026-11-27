// --- Unified automatic behavior --------------------------------------------
// One priority model owns every automatic action decision. Habit switches and
// the automatic action systems all feed this list instead of competing with
// each other:
//
//   1. Sleep
//   2. Rest
//   3. Harvest trees
//   4. Quartermaster resource actions
//   5. TileHabits model
//   6. Research
//   7. Saved actions (last N actions, excluding habit-managed ones)
//   8. Daydream
//
// Higher tiers may preempt lower tiers when no action slot is free. Lower
// tiers only fill free slots and never interrupt a higher tier.

const PLAYER_BEHAVIOR_PRIORITIES = Object.freeze([
    { id: "sleep", name: "Sleep", rank: 1 },
    { id: "rest", name: "Rest", rank: 2 },
    { id: "treesharvest", name: "Harvest trees", rank: 3 },
    { id: "quartermaster", name: "Manage resources", rank: 4 },
    { id: "tilehabits", name: "Tile habits", rank: 4.5 },
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
    const tileHabit = typeof getSelectedTileHabitModel === "function"
        ? getSelectedTileHabitModel()
        : null;
    if (tileHabit) {
        if (tileHabit.id === "explore"
            && (actionId === "explore" || actionId === "search")) {
            return true;
        }
        if (tileHabit.id === "foodbringer" && actionId === "treesharvest") {
            return true;
        }
        if (tileHabit.id === "deforester" && actionId === "cuttree") {
            return true;
        }
    }
    return getQuartermisterHabitForAction(actionId) !== null;
}

function getBehaviorRank(actionId) {
    if (actionId === "sleep") return 1;
    if (actionId === "rest") return 2;
    const tileHabit = typeof getSelectedTileHabitModel === "function"
        ? getSelectedTileHabitModel()
        : null;
    if (actionId === "treesharvest") {
        const harvestHabitManaged = typeof HARVEST_THE_YUMMIES_TECHNOLOGY !== "undefined"
            && HARVEST_THE_YUMMIES_TECHNOLOGY.level >= 1
            && typeof isHabitEnabled === "function"
            && isHabitEnabled("harvestTrees");
        if (harvestHabitManaged) return 3;
        if (tileHabit && tileHabit.id === "foodbringer") {
            return TILE_HABIT_BEHAVIOR_RANK;
        }
        return 6;
    }
    if (actionId === "explore" || actionId === "search") {
        if (tileHabit && tileHabit.id === "explore") {
            return TILE_HABIT_BEHAVIOR_RANK;
        }
    }
    if (actionId === "cuttree") {
        if (tileHabit && tileHabit.id === "deforester") {
            return TILE_HABIT_BEHAVIOR_RANK;
        }
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
    const threshold = typeof getAutoRestStaminaThreshold === "function"
        ? getAutoRestStaminaThreshold()
        : MIN_STAMINA_TO_FORAGE;
    if (!autoRestRequested && player.stamina > threshold) return false;
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

// --- TileHabits ------------------------------------------------------------
// The selected model works across neighbouring tiles. It has a lower priority
// than Manage Resources and a higher priority than Research.

let tileHabitNextTravelAttempt = 0;

function collectTileHabitCandidates(predicate, limit) {
    if (typeof window === "undefined" || !window.mapView
        || !window.mapView.world
        || !(window.mapView.world.chunks instanceof Map)) {
        return [];
    }
    const world = window.mapView.world;
    const tile = typeof currentTile !== "undefined" ? currentTile : null;
    if (!tile) return [];

    const currentX = Math.trunc(Number(tile.x) || 0);
    const currentY = Math.trunc(Number(tile.y) || 0);
    const chunkSize = Math.max(1, Math.trunc(Number(world.chunkSize) || 16));
    const maxResults = Math.max(1, Math.trunc(Number(limit) || 12));
    const candidates = [];

    world.chunks.forEach(function (chunk, key) {
        if (!Array.isArray(chunk)) return;
        const parts = String(key).split(",");
        const chunkX = Math.trunc(Number(parts[0]));
        const chunkY = Math.trunc(Number(parts[1]));
        if (!Number.isFinite(chunkX) || !Number.isFinite(chunkY)) return;

        for (let localY = 0; localY < chunk.length; localY++) {
            const row = chunk[localY];
            if (!Array.isArray(row)) continue;
            for (let localX = 0; localX < row.length; localX++) {
                const candidate = row[localX];
                if (!candidate || candidate.discovered !== true) continue;
                const x = chunkX * chunkSize + localX;
                const y = chunkY * chunkSize + localY;
                if (x === currentX && y === currentY) continue;
                if (!predicate(candidate, x, y)) continue;
                candidates.push({
                    tile: candidate,
                    x: x,
                    y: y,
                    distance: Math.abs(x - currentX) + Math.abs(y - currentY),
                });
            }
        }
    });

    candidates.sort(function (a, b) {
        return a.distance - b.distance;
    });

    // Tiles at the same distance are equally good destinations, so shuffle
    // each distance group instead of always walking to the same one. Farther
    // groups stay behind nearer ones, but the slice below still picks a random
    // selection when the nearest group alone does not fill the result limit.
    let groupStart = 0;
    while (groupStart < candidates.length) {
        let groupEnd = groupStart + 1;
        while (groupEnd < candidates.length
            && candidates[groupEnd].distance === candidates[groupStart].distance) {
            groupEnd += 1;
        }
        for (let index = groupEnd - 1; index > groupStart; index--) {
            const swapIndex = groupStart
                + Math.floor(Math.random() * (index - groupStart + 1));
            const swap = candidates[index];
            candidates[index] = candidates[swapIndex];
            candidates[swapIndex] = swap;
        }
        groupStart = groupEnd;
    }

    return candidates.slice(0, maxResults);
}

function startTileHabitTimedAction(actionId) {
    if (typeof getAction !== "function" || typeof isActionVisible !== "function"
        || typeof startTimedAction !== "function") {
        return false;
    }
    const action = getAction(actionId);
    if (!action) return false;
    if (typeof isActionActive === "function" && isActionActive(action.id)) {
        return false;
    }
    if (!isActionVisible(action)) return false;
    if (typeof action.isComplete === "function" && action.isComplete()) {
        return false;
    }
    if (!ensureBehaviorSlot(TILE_HABIT_BEHAVIOR_RANK)) return false;
    return startTimedAction(action, { remember: false });
}

function travelToNearestTileHabitCandidate(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) return false;
    if (Date.now() < tileHabitNextTravelAttempt) return false;
    if (typeof currentTile === "undefined" || !currentTile) return false;
    if (typeof findMoveToXYPath !== "function"
        || typeof startMoveToXYTravel !== "function") {
        return false;
    }
    if (typeof areMovementActionsAvailable === "function"
        && !areMovementActionsAvailable()) {
        return false;
    }

    for (let index = 0; index < candidates.length; index++) {
        const candidate = candidates[index];
        const pathInfo = findMoveToXYPath(
            currentTile.x,
            currentTile.y,
            candidate.x,
            candidate.y
        );
        if (!pathInfo || !Array.isArray(pathInfo.path)
            || pathInfo.path.length === 0) {
            continue;
        }
        pathInfo.targetX = candidate.x;
        pathInfo.targetY = candidate.y;
        if (startMoveToXYTravel(pathInfo)) return true;
        break;
    }

    tileHabitNextTravelAttempt = Date.now() + 10000;
    return false;
}

function tryTileHabitExplore() {
    const tile = typeof currentTile !== "undefined" ? currentTile : null;
    if (!tile) return false;

    const revealed = Number(tile.revealed) || 0;
    const investigated = Number(tile.investigated) || 0;
    if (revealed < EXPLORATION_COMPLETE) {
        return startTileHabitTimedAction("explore");
    }
    if (investigated < revealed) {
        return startTileHabitTimedAction("search");
    }

    const candidates = collectTileHabitCandidates(function (candidate) {
        const candidateRevealed = Number(candidate.revealed) || 0;
        const candidateInvestigated = Number(candidate.investigated) || 0;
        return candidateRevealed < EXPLORATION_COMPLETE
            || candidateInvestigated < candidateRevealed;
    }, 12);
    return travelToNearestTileHabitCandidate(candidates);
}

function tryTileHabitFoodBringer() {
    const tile = typeof currentTile !== "undefined" ? currentTile : null;
    if (!tile || typeof hasHarvestableTrees !== "function") return false;

    if (hasHarvestableTrees(tile)) {
        return startTileHabitTimedAction("treesharvest");
    }

    const candidates = collectTileHabitCandidates(function (candidate) {
        return (Number(candidate.revealed) || 0) >= EXPLORATION_COMPLETE
            && hasHarvestableTrees(candidate);
    }, 12);
    return travelToNearestTileHabitCandidate(candidates);
}

function tryTileHabitDeforester() {
    const tile = typeof currentTile !== "undefined" ? currentTile : null;
    if (!tile || typeof hasCuttableTrees !== "function") return false;
    if (typeof getCharacterToolPower !== "function"
        || getCharacterToolPower("chopping") < 1) {
        return false;
    }

    if (hasCuttableTrees(tile)) {
        return startTileHabitTimedAction("cuttree");
    }

    const candidates = collectTileHabitCandidates(function (candidate) {
        return hasCuttableTrees(candidate);
    }, 12);
    return travelToNearestTileHabitCandidate(candidates);
}

function tryBehaviorTileHabits() {
    if (hasActiveRestorationActionForBehavior()) return false;
    const model = typeof getSelectedTileHabitModel === "function"
        ? getSelectedTileHabitModel()
        : null;
    if (!model) return false;

    if (model.id === "explore") return tryTileHabitExplore();
    if (model.id === "foodbringer") return tryTileHabitFoodBringer();
    if (model.id === "deforester") return tryTileHabitDeforester();
    return false;
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

function runTileHabitOfflineBehavior() {
    if (typeof isOfflineSimulationRunning !== "function"
        || !isOfflineSimulationRunning()) {
        return false;
    }
    if (typeof isCombatActive === "function" && isCombatActive()) return false;
    if (typeof isTraveling === "function" && isTraveling()) return false;
    if (typeof isNpcDialogueActive === "function"
        && isNpcDialogueActive()) return false;
    if (typeof isActionActive === "function" && isActionActive("sleep")) {
        return false;
    }
    if (hasActiveRestorationActionForBehavior()) return false;
    return tryBehaviorTileHabits();
}

function runPlayerBehavior(reason) {
    if (isBehaviorBlocked()) return false;
    if (typeof isActionActive === "function" && isActionActive("sleep")) {
        return false;
    }

    // Auto rest is sticky: nothing except Sleep may replace it, and it runs
    // until the Rest action completes at full stamina.
    if (typeof autoRestActive !== "undefined" && autoRestActive) {
        if (typeof isActionActive === "function" && isActionActive("rest")) {
            updateBehaviorSummary();
            return true;
        }
        autoRestActive = false;
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
    if ((typeof autoRestActive !== "undefined" && autoRestActive)
        || hasActiveRestorationActionForBehavior()) {
        updateBehaviorSummary();
        return true;
    }

    tryBehaviorHarvestTrees();
    tryBehaviorQuartermaster();
    tryBehaviorTileHabits();
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
        .map(function (entry) {
            if (entry.id !== "tilehabits") return entry.name;
            const model = typeof getSelectedTileHabitModel === "function"
                ? getSelectedTileHabitModel()
                : null;
            return model
                ? "TileHabits (" + model.name + ")"
                : entry.name;
        })
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
