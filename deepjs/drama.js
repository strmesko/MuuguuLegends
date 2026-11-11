// Drama system: a slow-building chaos meter and random world events.
// This file owns the meter, the event list and the event roll. The main loop
// only calls updateDrama(diff).

var DramaMeter = 0;
var dramaEventTimer = 0;
var catchedColdRemaining = 0;
var earthShakingRemaining = 0;

const DRAMA_METER_MAX = 10000;
const DRAMA_EVENT_INTERVAL_SECONDS = 5;
const DRAMA_LUCK_CHANCE_PER_LEVEL = 0.06;
const CATCHED_COLD_DURATION_SECONDS = 5 * 60;
const CATCHED_COLD_ACTION_MULTIPLIER = 0.8;
const CATCHED_COLD_SPEED_MULTIPLIER = 0.8;
const EARTH_SHAKING_DURATION_SECONDS = 10;
const EARTH_SHAKING_ACTION_MULTIPLIER = 0.2;

const DRAMA_EVENT_TYPES = Object.freeze({
    Negative: "Negative",
    Positive: "Positive",
});

function clampDramaMeter(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(DRAMA_METER_MAX, number));
}

function getDramaMeter() {
    return DramaMeter;
}

function setDramaMeter(value) {
    DramaMeter = clampDramaMeter(value);
    return DramaMeter;
}

function addDramaMeter(amount) {
    return setDramaMeter(DramaMeter + (Number(amount) || 0));
}

function getDramaLuckMultiplier() {
    const luck = typeof getEffectiveLevel === "function"
        ? Math.max(0, Number(getEffectiveLevel("luck")) || 0)
        : 0;
    return 1 + luck * DRAMA_LUCK_CHANCE_PER_LEVEL;
}

// Negative events become less likely with luck; future positive events can
// use the same multiplier in the opposite direction.
function getDramaEventChance(event) {
    if (!event) return 0;

    const rawChance = typeof event.getChance === "function"
        ? event.getChance(event)
        : event.chance;
    const baseChance = Math.max(0, Math.min(1, Number(rawChance) || 0));
    const luckMultiplier = getDramaLuckMultiplier();
    const chance = event.type === DRAMA_EVENT_TYPES.Negative
        ? baseChance / luckMultiplier
        : baseChance * luckMultiplier;
    const situationalMultiplier = typeof event.getChanceMultiplier === "function"
        ? Math.max(0, Number(event.getChanceMultiplier(event)) || 0)
        : 1;

    return Math.max(0, Math.min(1, chance * situationalMultiplier));
}

function hasBootsEquipped() {
    return !!(typeof player !== "undefined"
        && player
        && player.equipment
        && player.equipment.feet);
}

function isForageBelowTwenty() {
    return typeof getEffectiveLevel === "function"
        && Math.max(0, Number(getEffectiveLevel("forage")) || 0) < 20;
}

function formatDramaDuration(seconds) {
    const total = Math.max(0, Math.ceil(Number(seconds) || 0));
    return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
}

function getCurrentDramaTemperature() {
    if (typeof gameTime === "undefined"
        || typeof gameMinutesToDateTime !== "function"
        || typeof getGameTemperature !== "function") {
        return 0;
    }
    return getGameTemperature(gameMinutesToDateTime(gameTime.totalMinutes));
}

function hasHouseOrCampfireOnTile(tile) {
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!target) return false;

    const list = Array.isArray(target.buildings)
        ? target.buildings
        : (typeof getCurrentTileBuildings === "function"
            ? getCurrentTileBuildings()
            : []);

    return list.some(function (building) {
        if (!building || !building.completed) return false;
        if (building.defId === "campfire") return true;

        const def = typeof getBuildingDefinition === "function"
            ? getBuildingDefinition(building.defId)
            : null;
        return !!(def && def.category === "houses");
    });
}

function hasCatchedCold() {
    return catchedColdRemaining > 0;
}

function applyCatchedCold() {
    catchedColdRemaining = CATCHED_COLD_DURATION_SECONDS;
}

function getCatchedColdActionMultiplier() {
    return hasCatchedCold() ? CATCHED_COLD_ACTION_MULTIPLIER : 1;
}

function getCatchedColdSpeedMultiplier() {
    return hasCatchedCold() ? CATCHED_COLD_SPEED_MULTIPLIER : 1;
}

function getCatchedColdStatus() {
    if (!hasCatchedCold()) return null;

    return {
        id: "catched-cold",
        name: "Catched a cold",
        kind: "debuff",
        color: "#6fa8dc",
        icon: "fa-snowflake-o",
        tooltip: [
            "<b>Catched a cold</b>",
            "-20% action effectiveness",
            "-20% Speed",
            "Remaining: " + formatDramaDuration(catchedColdRemaining),
        ].join("<br>"),
    };
}

function hasEarthShaking() {
    return earthShakingRemaining > 0;
}

function applyEarthShaking() {
    earthShakingRemaining = EARTH_SHAKING_DURATION_SECONDS;
}

function getEarthShakingActionMultiplier() {
    return hasEarthShaking() ? EARTH_SHAKING_ACTION_MULTIPLIER : 1;
}

function getEarthShakingStatus() {
    if (!hasEarthShaking()) return null;

    return {
        id: "earth-shaking",
        name: "The earth is shaking!",
        kind: "debuff",
        color: "#b07d3a",
        icon: "fa-bolt",
        tooltip: [
            "<b>The earth is shaking!</b>",
            "-80% action effectiveness",
            "Remaining: " + formatDramaDuration(earthShakingRemaining),
        ].join("<br>"),
    };
}

function hasEdibleResources() {
    if (typeof resources === "undefined" || !resources
        || typeof RESOURCE_DEFS === "undefined"
        || typeof hasResourceTag !== "function") {
        return false;
    }

    return Object.keys(RESOURCE_DEFS).some(function (resourceId) {
        const stack = resources[resourceId];
        return stack
            && Number(stack.amount) > 0
            && hasResourceTag(resourceId, "Edible");
    });
}

function decayEdibleResources() {
    if (typeof resources === "undefined" || !resources
        || typeof RESOURCE_DEFS === "undefined"
        || typeof hasResourceTag !== "function") {
        return 0;
    }

    let changed = 0;
    Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
        const stack = resources[resourceId];
        if (!stack || !hasResourceTag(resourceId, "Edible")) return;

        const amount = Math.max(0, Number(stack.amount) || 0);
        if (amount <= 0) return;

        stack.amount = round2(amount * 0.9);
        changed += 1;
    });

    return changed;
}

function damageBuildingsOnCurrentTile() {
    if (typeof currentTile === "undefined" || !currentTile) return 0;

    const list = Array.isArray(currentTile.buildings)
        ? currentTile.buildings
        : (typeof getCurrentTileBuildings === "function"
            ? getCurrentTileBuildings()
            : []);

    let changed = 0;
    list.forEach(function (building) {
        if (!building) return;
        const quality = Number(building.quality);
        if (!Number.isFinite(quality) || quality <= 0) return;

        building.quality = Math.max(0.01, round2(quality * 0.9));
        changed += 1;
    });

    return changed;
}

const DRAMA_EVENTS = Object.freeze([
    Object.freeze({
        id: "Wrong_Step",
        name: "Wrong Step",
        cost: 50,
        type: DRAMA_EVENT_TYPES.Negative,
        message: "You tripped over a stone and lost 1/10 of your health.",
        getChance: function () {
            return hasBootsEquipped() ? 0.10 : 0.90;
        },
        getChanceMultiplier: function () {
            return typeof isTraveling === "function" && isTraveling() ? 2 : 1;
        },
        condition: function () {
            return !!(typeof player !== "undefined"
                && player
                && Number(player.hp) > 0
                && Number(player.maxhp) > 0);
        },
        apply: function () {
            const damage = Math.max(0.01, round2(Number(player.maxhp) / 10));
            player.hp = Math.max(0, round2(Number(player.hp) - damage));
            logMessage(this.message);
        },
    }),
    Object.freeze({
        id: "Catch_a_cold",
        name: "Catch a cold",
        cost: 200,
        type: DRAMA_EVENT_TYPES.Negative,
        message: "You caught a cold.",
        getChance: function () {
            const temperature = getCurrentDramaTemperature();
            const sheltered = hasHouseOrCampfireOnTile();
            return temperature < 0 && !sheltered ? 0.20 : 0.01;
        },
        isAvailable: function () {
            return !hasCatchedCold();
        },
        condition: function () {
            return !hasCatchedCold();
        },
        apply: function () {
            applyCatchedCold();
            logMessage(this.message);
        },
    }),
    Object.freeze({
        id: "Wrong_food",
        name: "Wrong food",
        cost: 20,
        type: DRAMA_EVENT_TYPES.Negative,
        message: "You ate a wrong berry and vomit. now you are very very hungry",
        getChance: function () {
            return isForageBelowTwenty() ? 0.05 : 0;
        },
        isAvailable: function () {
            return isForageBelowTwenty();
        },
        condition: function () {
            return !!(typeof player !== "undefined"
                && player
                && Number(player.maxHunger) > 0);
        },
        apply: function () {
            player.hunger = player.maxHunger;
            logMessage(this.message);
        },
    }),
    Object.freeze({
        id: "A_wave_of_decay",
        name: "A wave of decay",
        cost: 250,
        type: DRAMA_EVENT_TYPES.Negative,
        message: "A wave of decay spoils 1/10 of all edible resources.",
        getChance: function () {
            return 0.01;
        },
        isAvailable: function () {
            return hasEdibleResources();
        },
        condition: function () {
            return hasEdibleResources();
        },
        apply: function () {
            decayEdibleResources();
            logMessage(this.message);
            if (typeof renderResources === "function") renderResources();
        },
    }),
    Object.freeze({
        id: "Earthquake",
        name: "Earthquake",
        cost: 2500,
        type: DRAMA_EVENT_TYPES.Negative,
        message: "Earthquake! The earth is shaking!",
        getChance: function () {
            return 0.001;
        },
        condition: function () {
            return !!(typeof player !== "undefined" && player);
        },
        apply: function () {
            const damaged = damageBuildingsOnCurrentTile();
            applyEarthShaking();
            logMessage(this.message);
            if (damaged > 0 && typeof renderBuildPanels === "function") {
                renderBuildPanels();
            }
            if (typeof refreshMapCoordinates === "function") {
                refreshMapCoordinates(true);
            }
        },
    }),
]);

function canTriggerDramaEvent(event) {
    if (!event || !event.id || !event.apply) return false;
    if (DramaMeter < (Number(event.cost) || 0)) return false;
    if (typeof event.condition === "function" && !event.condition(event)) {
        return false;
    }
    return true;
}

function getAvailableDramaEvents() {
    return DRAMA_EVENTS.filter(function (event) {
        return typeof event.isAvailable !== "function" || event.isAvailable(event);
    });
}

function tryTriggerDramaEvent() {
    const availableEvents = getAvailableDramaEvents();
    if (!availableEvents.length) return false;

    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    if (!canTriggerDramaEvent(event)) return false;

    const chance = getDramaEventChance(event);
    if (chance <= 0 || Math.random() >= chance) return false;

    setDramaMeter(DramaMeter - (Number(event.cost) || 0));
    event.apply(event);
    return true;
}

function updateDrama(diff) {
    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return;

    if (catchedColdRemaining > 0) {
        const previousRemaining = catchedColdRemaining;
        catchedColdRemaining = Math.max(0, catchedColdRemaining - seconds);
        if (previousRemaining > 0 && catchedColdRemaining <= 0) {
            logMessage("Catched a cold has worn off.");
        }
    }

    if (earthShakingRemaining > 0) {
        const previousRemaining = earthShakingRemaining;
        earthShakingRemaining = Math.max(0, earthShakingRemaining - seconds);
        if (previousRemaining > 0 && earthShakingRemaining <= 0) {
            logMessage("The earth has stopped shaking.");
        }
    }

    addDramaMeter(seconds);
    dramaEventTimer += seconds;

    while (dramaEventTimer >= DRAMA_EVENT_INTERVAL_SECONDS) {
        dramaEventTimer -= DRAMA_EVENT_INTERVAL_SECONDS;
        tryTriggerDramaEvent();
    }
}

function restoreDramaState(savedMeter, savedTimer, savedColdRemaining, savedEarthShakingRemaining) {
    setDramaMeter(savedMeter);
    const timer = Number(savedTimer);
    dramaEventTimer = Number.isFinite(timer) && timer >= 0
        ? Math.min(DRAMA_EVENT_INTERVAL_SECONDS, timer)
        : 0;

    const cold = Number(savedColdRemaining);
    catchedColdRemaining = Number.isFinite(cold) && cold > 0
        ? Math.min(CATCHED_COLD_DURATION_SECONDS, cold)
        : 0;

    const shaking = Number(savedEarthShakingRemaining);
    earthShakingRemaining = Number.isFinite(shaking) && shaking > 0
        ? Math.min(EARTH_SHAKING_DURATION_SECONDS, shaking)
        : 0;
}
