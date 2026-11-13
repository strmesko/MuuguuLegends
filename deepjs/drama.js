// Drama system: a slow-building chaos meter and random world events.
// This file owns the meter, the event list and the event roll. The main loop
// only calls updateDrama(diff).

var DramaMeter = 0;
var dramaEventTimer = 0;
var catchedColdRemaining = 0;
var earthShakingRemaining = 0;
var dramaDebuffs = {};

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

const DRAMA_STAT_LABELS = Object.freeze({
    str: "Strength",
    agi: "Agility",
    vit: "Vitality",
    per: "Perception",
    int: "Intellect",
    ins: "Insight",
    sou: "Soul",
    luck: "Luck",
    speed: "Speed",
});

// Timed injuries and illnesses. Each multiplier is applied directly to the
// corresponding core stat by getEffectiveLevel().
const DRAMA_DEBUFF_DEFS = Object.freeze({
    "twisted-ankle": Object.freeze({
        name: "Twisted ankle", duration: 180, icon: "fa-bolt", color: "#c98b3b",
        stats: Object.freeze({ agi: 0.7, speed: 0.8 }),
    }),
    "strained-back": Object.freeze({
        name: "Strained back", duration: 240, icon: "fa-user-md", color: "#a06a4a",
        stats: Object.freeze({ str: 0.7, agi: 0.9 }),
    }),
    "concussion": Object.freeze({
        name: "Concussion", duration: 300, icon: "fa-medkit", color: "#8e7cc3",
        stats: Object.freeze({ int: 0.75, per: 0.85 }),
    }),
    "broken-finger": Object.freeze({
        name: "Broken finger", duration: 240, icon: "fa-hand-paper-o", color: "#b07d3a",
        stats: Object.freeze({ agi: 0.8, str: 0.9 }),
    }),
    "deep-cut": Object.freeze({
        name: "Deep cut", duration: 180, icon: "fa-tint", color: "#c0504d",
        stats: Object.freeze({ str: 0.85, vit: 0.85 }),
    }),
    "infected-wound": Object.freeze({
        name: "Infected wound", duration: 300, icon: "fa-plus-square", color: "#8a5a00",
        stats: Object.freeze({ vit: 0.8, str: 0.9 }),
    }),
    "fever": Object.freeze({
        name: "Fever", duration: 180, icon: "fa-fire", color: "#d96b3b",
        stats: Object.freeze({ vit: 0.8, int: 0.85 }),
    }),
    "migraine": Object.freeze({
        name: "Migraine", duration: 180, icon: "fa-frown-o", color: "#7b5ea7",
        stats: Object.freeze({ int: 0.75, per: 0.9 }),
    }),
    "nausea": Object.freeze({
        name: "Nausea", duration: 120, icon: "fa-meh-o", color: "#7aa35a",
        stats: Object.freeze({ vit: 0.8, sou: 0.9 }),
    }),
    "blurred-vision": Object.freeze({
        name: "Blurred vision", duration: 120, icon: "fa-eye-slash", color: "#6f8fa8",
        stats: Object.freeze({ per: 0.7 }),
    }),
    "ringing-ears": Object.freeze({
        name: "Ringing ears", duration: 120, icon: "fa-deaf", color: "#8f8f8f",
        stats: Object.freeze({ per: 0.8, int: 0.9 }),
    }),
    "sprained-wrist": Object.freeze({
        name: "Sprained wrist", duration: 180, icon: "fa-hand-paper-o", color: "#b07d3a",
        stats: Object.freeze({ str: 0.8, agi: 0.9 }),
    }),
    "bruised-ribs": Object.freeze({
        name: "Bruised ribs", duration: 240, icon: "fa-heartbeat", color: "#c0504d",
        stats: Object.freeze({ vit: 0.8, agi: 0.9 }),
    }),
    "sore-muscles": Object.freeze({
        name: "Sore muscles", duration: 300, icon: "fa-bed", color: "#7a6a5a",
        stats: Object.freeze({ str: 0.85, agi: 0.85 }),
    }),
    "exhaustion": Object.freeze({
        name: "Exhaustion", duration: 180, icon: "fa-bed", color: "#6f6f6f",
        stats: Object.freeze({ vit: 0.8, speed: 0.9 }),
    }),
    "chill": Object.freeze({
        name: "Chill", duration: 180, icon: "fa-snowflake-o", color: "#6fa8dc",
        stats: Object.freeze({ vit: 0.85, agi: 0.9 }),
    }),
    "heatstroke": Object.freeze({
        name: "Heatstroke", duration: 240, icon: "fa-fire", color: "#e07b39",
        stats: Object.freeze({ vit: 0.8, int: 0.85 }),
    }),
    "food-poisoning": Object.freeze({
        name: "Food poisoning", duration: 300, icon: "fa-flask", color: "#6b8e23",
        stats: Object.freeze({ vit: 0.75, sou: 0.85 }),
    }),
    "allergy": Object.freeze({
        name: "Allergy", duration: 180, icon: "fa-leaf", color: "#7aa35a",
        stats: Object.freeze({ per: 0.85, vit: 0.9 }),
    }),
    "splinter": Object.freeze({
        name: "Splinter", duration: 120, icon: "fa-tree", color: "#a06a4a",
        stats: Object.freeze({ agi: 0.9, luck: 0.9 }),
    }),
});

function getDramaDebuffDefinition(id) {
    return DRAMA_DEBUFF_DEFS[id] || null;
}

function hasDramaDebuff(id) {
    return (Number(dramaDebuffs[id]) || 0) > 0;
}

function applyDramaDebuff(id) {
    const def = getDramaDebuffDefinition(id);
    if (!def) return false;

    dramaDebuffs[id] = Math.max(Number(dramaDebuffs[id]) || 0, def.duration);
    if (typeof calculateStats === "function") calculateStats();
    return true;
}

// Multiplies every matching core stat. Multiple active injuries stack
// multiplicatively so a badly beaten character really feels it.
function getDramaStatMultiplier(statKey) {
    let multiplier = 1;

    Object.keys(dramaDebuffs).forEach(function (id) {
        const remaining = Number(dramaDebuffs[id]) || 0;
        if (remaining <= 0) return;

        const def = getDramaDebuffDefinition(id);
        if (!def || !def.stats) return;

        const value = Number(def.stats[statKey]);
        if (Number.isFinite(value) && value > 0) multiplier *= value;
    });

    return Math.max(0.05, multiplier);
}

function createDramaDebuffStatus(id) {
    const def = getDramaDebuffDefinition(id);
    const remaining = Number(dramaDebuffs[id]) || 0;
    if (!def || remaining <= 0) return null;

    const lines = ["<b>" + def.name + "</b>"];
    Object.keys(def.stats).forEach(function (statKey) {
        const value = Number(def.stats[statKey]);
        if (!Number.isFinite(value) || value <= 0 || value >= 1) return;
        const label = DRAMA_STAT_LABELS[statKey] || statKey;
        lines.push("-" + Math.round((1 - value) * 100) + "% " + label);
    });
    lines.push("Remaining: " + formatDramaDuration(remaining));

    return {
        id: id,
        name: def.name,
        kind: "debuff",
        color: def.color,
        icon: def.icon,
        tooltip: lines.join("<br>"),
    };
}

function getDramaDebuffStatusById(id) {
    return createDramaDebuffStatus(id);
}

function getActiveDramaDebuffStatuses() {
    return Object.keys(dramaDebuffs).map(function (id) {
        return createDramaDebuffStatus(id);
    }).filter(Boolean);
}

function getDramaDebuffsSnapshot() {
    const snapshot = {};
    Object.keys(dramaDebuffs).forEach(function (id) {
        const remaining = Number(dramaDebuffs[id]) || 0;
        if (remaining > 0 && getDramaDebuffDefinition(id)) {
            snapshot[id] = remaining;
        }
    });
    return snapshot;
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

function applyDramaDamage(fraction, message) {
    if (typeof player === "undefined" || !player) return 0;

    const maxHp = Number(player.maxhp) || 0;
    const currentHp = Number(player.hp) || 0;
    if (maxHp <= 0 || currentHp <= 0) return 0;

    const damage = Math.max(0.01, round2(maxHp * Math.max(0, fraction)));
    player.hp = Math.max(0, round2(currentHp - damage));
    logMessage(message);
    return damage;
}

function createDramaDamageEvent(id, name, cost, chance, fraction, message) {
    return Object.freeze({
        id: id,
        name: name,
        cost: cost,
        type: DRAMA_EVENT_TYPES.Negative,
        message: message,
        getChance: function () {
            return chance;
        },
        condition: function () {
            return !!(typeof player !== "undefined"
                && player
                && Number(player.hp) > 0
                && Number(player.maxhp) > 0);
        },
        apply: function () {
            applyDramaDamage(fraction, message);
        },
    });
}

function createDramaDebuffEvent(id, name, cost, chance, debuffId, message) {
    return Object.freeze({
        id: id,
        name: name,
        cost: cost,
        type: DRAMA_EVENT_TYPES.Negative,
        message: message,
        getChance: function () {
            return chance;
        },
        isAvailable: function () {
            return !hasDramaDebuff(debuffId);
        },
        condition: function () {
            return !hasDramaDebuff(debuffId);
        },
        apply: function () {
            applyDramaDebuff(debuffId);
            logMessage(message);
        },
    });
}

const DRAMA_DAMAGE_EVENTS = Object.freeze([
    createDramaDamageEvent(
        "Thorn_scratch", "Thorn scratch", 50, 0.05, 0.03,
        "A thorn tears your hand. You lose 3% HP."
    ),
    createDramaDamageEvent(
        "Slipped_on_rocks", "Slipped on rocks", 100, 0.03, 0.06,
        "You slipped on wet rocks and hit the ground. You lose 6% HP."
    ),
    createDramaDamageEvent(
        "Burning_hand", "Burning hand", 100, 0.02, 0.05,
        "You burned your hand on the campfire. You lose 5% HP."
    ),
    createDramaDamageEvent(
        "Fell_from_a_tree", "Fell from a tree", 150, 0.02, 0.08,
        "You fell from a tree. You lose 8% HP."
    ),
    createDramaDamageEvent(
        "Heavy_branch", "Heavy branch", 200, 0.015, 0.10,
        "A heavy branch falls on you. You lose 10% HP."
    ),
    createDramaDamageEvent(
        "Fell_into_a_hole", "Fell into a hole", 200, 0.02, 0.10,
        "You fell into a hidden hole. You lose 10% HP."
    ),
    createDramaDamageEvent(
        "Snake_bite", "Snake bite", 250, 0.02, 0.12,
        "A snake bites your leg. You lose 12% HP."
    ),
    createDramaDamageEvent(
        "Wolf_scratch", "Wolf scratch", 300, 0.015, 0.15,
        "A wolf scratches you. You lose 15% HP."
    ),
    createDramaDamageEvent(
        "Rockfall", "Rockfall", 350, 0.01, 0.18,
        "A rockfall hits you. You lose 18% HP."
    ),
    createDramaDamageEvent(
        "Bee_swarm", "Bee swarm", 80, 0.04, 0.04,
        "A swarm of bees stings you. You lose 4% HP."
    ),
]);

const DRAMA_DEBUFF_EVENTS = Object.freeze([
    createDramaDebuffEvent(
        "Twisted_ankle", "Twisted ankle", 120, 0.03, "twisted-ankle",
        "You twisted your ankle on uneven ground."
    ),
    createDramaDebuffEvent(
        "Strained_back", "Strained back", 100, 0.03, "strained-back",
        "You strained your back while lifting too much."
    ),
    createDramaDebuffEvent(
        "Concussion", "Concussion", 250, 0.01, "concussion",
        "A falling branch strikes your head. Everything spins."
    ),
    createDramaDebuffEvent(
        "Broken_finger", "Broken finger", 150, 0.02, "broken-finger",
        "You crushed your finger between two stones."
    ),
    createDramaDebuffEvent(
        "Deep_cut", "Deep cut", 180, 0.02, "deep-cut",
        "A sharp edge opens a deep cut."
    ),
    createDramaDebuffEvent(
        "Infected_wound", "Infected wound", 220, 0.015, "infected-wound",
        "A small wound becomes infected."
    ),
    createDramaDebuffEvent(
        "Fever", "Fever", 160, 0.025, "fever",
        "A sudden fever weakens your body."
    ),
    createDramaDebuffEvent(
        "Migraine", "Migraine", 140, 0.025, "migraine",
        "A throbbing migraine clouds your thoughts."
    ),
    createDramaDebuffEvent(
        "Nausea", "Nausea", 100, 0.03, "nausea",
        "A wave of nausea twists your stomach."
    ),
    createDramaDebuffEvent(
        "Blurred_vision", "Blurred vision", 90, 0.03, "blurred-vision",
        "Your vision blurs and refuses to focus."
    ),
    createDramaDebuffEvent(
        "Ringing_ears", "Ringing ears", 90, 0.03, "ringing-ears",
        "A loud ringing fills your ears."
    ),
    createDramaDebuffEvent(
        "Sprained_wrist", "Sprained wrist", 130, 0.025, "sprained-wrist",
        "You sprained your wrist."
    ),
    createDramaDebuffEvent(
        "Bruised_ribs", "Bruised ribs", 180, 0.02, "bruised-ribs",
        "You bruised your ribs."
    ),
    createDramaDebuffEvent(
        "Sore_muscles", "Sore muscles", 120, 0.03, "sore-muscles",
        "Every muscle in your body aches."
    ),
    createDramaDebuffEvent(
        "Exhaustion", "Exhaustion", 200, 0.02, "exhaustion",
        "A wave of exhaustion drains your strength."
    ),
    createDramaDebuffEvent(
        "Chill", "Chill", 150, 0.02, "chill",
        "A deep chill settles into your bones."
    ),
    createDramaDebuffEvent(
        "Heatstroke", "Heatstroke", 180, 0.02, "heatstroke",
        "The heat overwhelms you."
    ),
    createDramaDebuffEvent(
        "Food_poisoning", "Food poisoning", 220, 0.015, "food-poisoning",
        "Something you ate was rotten."
    ),
    createDramaDebuffEvent(
        "Allergy", "Allergy", 100, 0.03, "allergy",
        "Pollen and dust make your eyes water."
    ),
    createDramaDebuffEvent(
        "Splinter", "Splinter", 60, 0.04, "splinter",
        "A splinter digs under your skin."
    ),
]);

// Forced fights. Drama can drag the player into combat without their consent;
// the mob may be stronger than the local one and may carry a prefix that
// boosts a single combat attribute.
function canStartDramaCombat() {
    if (typeof enterCombat !== "function") return false;
    if (typeof isCombatActive === "function" && isCombatActive()) return false;
    if (typeof isTraveling === "function" && isTraveling()) return false;
    return !!(typeof player !== "undefined"
        && player
        && Number(player.hp) > 0);
}

function getDramaCombatMobLevel(levelOffset) {
    if (typeof getMobLevelForTile !== "function") return undefined;

    const tile = typeof currentTile !== "undefined" && currentTile
        ? currentTile
        : null;
    const baseLevel = getMobLevelForTile(
        tile ? Number(tile.x) || 0 : 0,
        tile ? Number(tile.y) || 0 : 0
    );
    const offset = Number(levelOffset);
    return Math.max(1, Math.floor(
        (Number(baseLevel) || 1) + (Number.isFinite(offset) ? offset : 0)
    ));
}

function createDramaCombatEvent(id, name, cost, chance, levelOffset, prefixes, message) {
    return Object.freeze({
        id: id,
        name: name,
        cost: cost,
        type: DRAMA_EVENT_TYPES.Negative,
        message: message,
        getChance: function () {
            return chance;
        },
        isAvailable: function () {
            return canStartDramaCombat();
        },
        condition: function () {
            return canStartDramaCombat();
        },
        apply: function () {
            logMessage(message);
            if (!canStartDramaCombat()) return;

            enterCombat(null, {
                level: getDramaCombatMobLevel(levelOffset),
                prefixes: prefixes,
                forced: true,
            });
        },
    });
}

const DRAMA_COMBAT_EVENTS = Object.freeze([
    createDramaCombatEvent(
        "Ambush", "Ambush", 1000, 0.02, 0, [],
        "Something rustles behind you. A mob ambushes you!"
    ),
    createDramaCombatEvent(
        "Elite_ambush", "Elite ambush", 2000, 0.012, 3, [],
        "A larger and meaner mob steps out of the dark. There is no way around it."
    ),
    createDramaCombatEvent(
        "Deadly_ambush", "Deadly ambush", 3500, 0.008, 6, [],
        "A creature far beyond your strength has found you."
    ),
    createDramaCombatEvent(
        "Fat_ambush", "Fat ambush", 2200, 0.009, 0, ["fat"],
        "A bloated mob rolls out of the bushes and blocks your path."
    ),
    createDramaCombatEvent(
        "Fierce_ambush", "Fierce ambush", 2400, 0.009, 0, ["fierce"],
        "A furious mob rushes at you with blinding speed."
    ),
    createDramaCombatEvent(
        "Brute_ambush", "Brute ambush", 2400, 0.008, 0, ["brute"],
        "A brutal mob swings at you with terrible force."
    ),
    createDramaCombatEvent(
        "Armored_ambush", "Armored ambush", 2600, 0.008, 0, ["armored"],
        "A heavily armoured mob clanks toward you."
    ),
    createDramaCombatEvent(
        "Precise_ambush", "Precise ambush", 2300, 0.008, 0, ["precise"],
        "Something with perfect aim takes a shot at you."
    ),
    createDramaCombatEvent(
        "Cruel_ambush", "Cruel ambush", 2600, 0.008, 0, ["cruel"],
        "A cruel mob goes straight for your weak spots."
    ),
    createDramaCombatEvent(
        "Elusive_ambush", "Elusive ambush", 2300, 0.008, 0, ["elusive"],
        "An elusive mob slips past your guard."
    ),
    createDramaCombatEvent(
        "Mighty_ambush", "Mighty ambush", 2500, 0.008, 0, ["mighty"],
        "A mighty mob flexes and charges."
    ),
    createDramaCombatEvent(
        "Nimble_ambush", "Nimble ambush", 2400, 0.008, 0, ["nimble"],
        "A nimble mob darts at you from cover."
    ),
    createDramaCombatEvent(
        "Hardy_ambush", "Hardy ambush", 2500, 0.008, 0, ["hardy"],
        "A hardy mob takes your first hit and keeps coming."
    ),
    createDramaCombatEvent(
        "Keen_ambush", "Keen ambush", 2200, 0.008, 0, ["keen"],
        "A keen-eyed mob is tracking your every move."
    ),
    createDramaCombatEvent(
        "Lucky_ambush", "Lucky ambush", 2600, 0.007, 0, ["lucky"],
        "A lucky mob strolls into the fight and finds every opening."
    ),
    createDramaCombatEvent(
        "Swift_ambush", "Swift ambush", 2400, 0.008, 0, ["swift"],
        "A swift mob blurs toward you."
    ),
    createDramaCombatEvent(
        "Nightmare_ambush", "Nightmare ambush", 5000, 0.004, 3,
        ["fat", "fierce", "brute"],
        "A nightmare mob bears down on you. Fat, fierce and brutal."
    ),
]);

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
    ...DRAMA_DAMAGE_EVENTS,
    ...DRAMA_DEBUFF_EVENTS,
    ...DRAMA_COMBAT_EVENTS,
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

    let dramaDebuffExpired = false;
    Object.keys(dramaDebuffs).forEach(function (id) {
        const previousRemaining = Number(dramaDebuffs[id]) || 0;
        if (previousRemaining <= 0) {
            delete dramaDebuffs[id];
            return;
        }

        const remaining = Math.max(0, previousRemaining - seconds);
        if (remaining > 0) {
            dramaDebuffs[id] = remaining;
            return;
        }

        delete dramaDebuffs[id];
        dramaDebuffExpired = true;
        const def = getDramaDebuffDefinition(id);
        if (def) logMessage(def.name + " has worn off.");
    });
    if (dramaDebuffExpired && typeof calculateStats === "function") {
        calculateStats();
    }

    addDramaMeter(seconds);
    dramaEventTimer += seconds;

    while (dramaEventTimer >= DRAMA_EVENT_INTERVAL_SECONDS) {
        dramaEventTimer -= DRAMA_EVENT_INTERVAL_SECONDS;
        tryTriggerDramaEvent();
    }
}

function restoreDramaState(savedMeter, savedTimer, savedColdRemaining, savedEarthShakingRemaining, savedDebuffs) {
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

    dramaDebuffs = {};
    if (savedDebuffs && typeof savedDebuffs === "object") {
        Object.keys(savedDebuffs).forEach(function (id) {
            const def = getDramaDebuffDefinition(id);
            const remaining = Number(savedDebuffs[id]);
            if (!def || !Number.isFinite(remaining) || remaining <= 0) return;
            dramaDebuffs[id] = Math.min(def.duration, remaining);
        });
    }
    if (typeof calculateStats === "function") calculateStats();
}
