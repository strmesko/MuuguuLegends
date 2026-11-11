// Drama system: a slow-building chaos meter and random world events.
// This file owns the meter, the event list and the event roll. The main loop
// only calls updateDrama(diff).

var DramaMeter = 0;
var dramaEventTimer = 0;

const DRAMA_METER_MAX = 10000;
const DRAMA_EVENT_INTERVAL_SECONDS = 5;
const DRAMA_LUCK_CHANCE_PER_LEVEL = 0.06;

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
]);

function canTriggerDramaEvent(event) {
    if (!event || !event.id || !event.apply) return false;
    if (DramaMeter < (Number(event.cost) || 0)) return false;
    if (typeof event.condition === "function" && !event.condition(event)) {
        return false;
    }
    return true;
}

function tryTriggerDramaEvent() {
    if (!DRAMA_EVENTS.length) return false;

    const event = DRAMA_EVENTS[Math.floor(Math.random() * DRAMA_EVENTS.length)];
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

    addDramaMeter(seconds);
    dramaEventTimer += seconds;

    while (dramaEventTimer >= DRAMA_EVENT_INTERVAL_SECONDS) {
        dramaEventTimer -= DRAMA_EVENT_INTERVAL_SECONDS;
        tryTriggerDramaEvent();
    }
}

function restoreDramaState(savedMeter, savedTimer) {
    setDramaMeter(savedMeter);
    const timer = Number(savedTimer);
    dramaEventTimer = Number.isFinite(timer) && timer >= 0
        ? Math.min(DRAMA_EVENT_INTERVAL_SECONDS, timer)
        : 0;
}
