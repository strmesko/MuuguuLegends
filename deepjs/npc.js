// NPC entity model.
//
// NPCs share the player's Character skills and stats, but are generated from
// per-type presets. All NPC-specific data and logic lives in this file.

const NPC_MOOD_MIN = 0;
const NPC_MOOD_MAX = 100;
const NPC_MOOD_STRONG_THRESHOLD = 1000;
const NPC_MOOD_EXTREME_THRESHOLD = 10000;
const NPC_ANGRY_MIN = 0;
const NPC_ANGRY_MAX = 100;
const NPC_FOOD_PREFERENCE_MIN = 1;
const NPC_FOOD_PREFERENCE_MAX = 3;

const NPC_TYPE_IDS = Object.freeze({
    FAIRY: "fairy",
});

function createNpcGrowth(base, perLevel) {
    return Object.freeze({
        base: Math.max(0, Number(base) || 0),
        perLevel: Number(perLevel) || 0,
    });
}

// Presets describe the starting value and the gain per NPC level. Level 1
// therefore uses the base value; every next level adds the per-level growth.
const NPC_PRESETS = Object.freeze({
    [NPC_TYPE_IDS.FAIRY]: Object.freeze({
        id: NPC_TYPE_IDS.FAIRY,
        name: "Fairy",
        description: "A small winged spirit of field and forest.",
        image: "images/NPC/fairy.webp",
        stats: Object.freeze({
            str: createNpcGrowth(1, 1),
            agi: createNpcGrowth(3, 3),
            vit: createNpcGrowth(2, 1),
            per: createNpcGrowth(5, 3),
            int: createNpcGrowth(2, 2),
            ins: createNpcGrowth(6, 2),
            sou: createNpcGrowth(8, 2),
        }),
        skills: Object.freeze({
            forage: createNpcGrowth(10, 3),
            gardening: createNpcGrowth(15, 3),
            cooking: createNpcGrowth(5, 1),
            meditation: createNpcGrowth(10, 2),
        }),
        mood: Object.freeze({ base: 50, variance: 10 }),
        favor: Object.freeze({ base: 0, variance: 0 }),
        foodPreferenceTag: "berry",
    }),
});

const NPC_PRESET_IDS = Object.freeze(Object.keys(NPC_PRESETS));

let npcs = [];
let nextNpcUid = 1;

function getNpcPreset(typeId) {
    const id = String(typeId || "");
    return NPC_PRESETS[id] || null;
}

function getNpcPresetIds() {
    return NPC_PRESET_IDS.slice();
}

function getNpcLevelForTile(x, y) {
    const level = typeof getMobLevelForTile === "function"
        ? getMobLevelForTile(x, y)
        : 1;
    return Math.max(1, Math.floor(Number(level) || 1));
}

function getNpcGrowthValue(growth, level) {
    if (!growth) return 0;
    const base = Number(growth.base) || 0;
    const perLevel = Number(growth.perLevel) || 0;
    const levelsGained = Math.max(0, Math.floor(Number(level) || 1) - 1);
    return Math.max(0, round2(base + perLevel * levelsGained));
}

function rollNpcParameter(definition) {
    const base = Number(definition && definition.base) || 0;
    const variance = Math.max(
        0,
        Number(definition && definition.variance) || 0
    );
    return base + (Math.random() * 2 - 1) * variance;
}

function clampNpcMood(value) {
    return round2(Math.max(NPC_MOOD_MIN, Math.min(NPC_MOOD_MAX, Number(value) || 0)));
}

// Favor is intentionally uncapped. It can grow through repeated positive
// interactions and is never clamped to the old 0..100 range.
function normalizeNpcFavor(value) {
    const number = Number(value);
    return Number.isFinite(number) ? round2(number) : 0;
}

function normalizeNpcBoredom(value) {
    const number = Number(value);
    return Number.isFinite(number) ? round2(number) : 0;
}

function normalizeNpcHappy(value) {
    const number = Number(value);
    return Number.isFinite(number) ? round2(number) : 0;
}

function clampNpcAngryOmeter(value) {
    return round2(Math.max(
        NPC_ANGRY_MIN,
        Math.min(NPC_ANGRY_MAX, Number(value) || 0)
    ));
}

function getNpcMoodDescription(npc) {
    if (!npc) return "Neutral";

    const candidates = [
        {
            value: normalizeNpcBoredom(npc.boredom),
            negative: "Bored",
            positive: "Curious",
            extremeNegative: "Extremely bored",
            extremePositive: "Extremely curious",
        },
        {
            value: normalizeNpcHappy(npc.happy),
            negative: "Unhappy",
            positive: "Happy",
            extremeNegative: "Sad",
            extremePositive: "Excited",
        },
    ];

    let strongest = null;
    candidates.forEach(function (candidate) {
        if (Math.abs(candidate.value) < NPC_MOOD_STRONG_THRESHOLD) return;
        if (!strongest || Math.abs(candidate.value) > Math.abs(strongest.value)) {
            strongest = candidate;
        }
    });

    if (!strongest) return "Neutral";

    const extreme = Math.abs(strongest.value) >= NPC_MOOD_EXTREME_THRESHOLD;
    if (strongest.value < 0) {
        return extreme ? strongest.extremeNegative : strongest.negative;
    }
    return extreme ? strongest.extremePositive : strongest.positive;
}

function refreshNpcMoodDescription(npc) {
    if (!npc) return "Neutral";
    npc.moodDescription = getNpcMoodDescription(npc);
    return npc.moodDescription;
}

function getNpcFoodPreferencePool(preset) {
    const allFood = Object.keys(RESOURCE_DEFS)
        .map(Number)
        .filter(function (resourceId) {
            const definition = RESOURCE_DEFS[resourceId];
            return !!definition
                && (definition.RestoresHunger === true
                    || definition.category === RESOURCE_CATEGORIES.Food);
        });

    if (preset && preset.foodPreferenceTag === "berry"
        && typeof BERRY_RESOURCE_IDS !== "undefined") {
        const berries = BERRY_RESOURCE_IDS.filter(function (resourceId) {
            return allFood.indexOf(resourceId) !== -1;
        });
        if (berries.length) return berries;
    }

    return allFood;
}

function generateNpcFoodPreferences(preset) {
    const pool = getNpcFoodPreferencePool(preset).slice();
    if (!pool.length) return [];

    const wanted = NPC_FOOD_PREFERENCE_MIN + Math.floor(
        Math.random() * (NPC_FOOD_PREFERENCE_MAX - NPC_FOOD_PREFERENCE_MIN + 1)
    );
    const count = Math.min(pool.length, wanted);

    for (let index = pool.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const temporary = pool[index];
        pool[index] = pool[swapIndex];
        pool[swapIndex] = temporary;
    }

    return pool.slice(0, count);
}

function getNpcFoodPreferenceNames(npc) {
    if (!npc || !Array.isArray(npc.foodPreferences)) return [];
    return npc.foodPreferences.map(function (resourceId) {
        const definition = RESOURCE_DEFS[resourceId];
        return definition ? definition.name : null;
    }).filter(Boolean);
}

function setNpcEntryLevel(entry, level) {
    if (!entry) return;
    entry.lvl = level;
    entry.exp = typeof getExperienceRequiredForLevel === "function"
        ? getExperienceRequiredForLevel(level)
        : entry.exp;
}

function recalculateNpcStats(npc) {
    if (!npc) return;

    const lvl = Math.max(1, Number(npc.lvl) || 1);
    const ratio = 1.01 + 0.01 * lvl;
    const str = Math.max(0, Number(npc.str && npc.str.lvl) || 0);
    const agi = Math.max(0, Number(npc.agi && npc.agi.lvl) || 0);
    const vit = Math.max(0, Number(npc.vit && npc.vit.lvl) || 0);
    const int = Math.max(0, Number(npc.int && npc.int.lvl) || 0);
    const ins = Math.max(0, Number(npc.ins && npc.ins.lvl) || 0);
    const sou = Math.max(0, Number(npc.sou && npc.sou.lvl) || 0);

    npc.maxhp = round2(Math.pow(str + vit * 3 + sou, ratio));
    npc.maxmana = round2(Math.pow(int * 2 + sou + ins * 2, ratio));
    npc.maxstamina = round2(Math.pow(str + agi + vit * 2 + sou, ratio));

    npc.hp = npc.maxhp;
    npc.mana = npc.maxmana;
    npc.stamina = npc.maxstamina;
}

function applyNpcPreset(npc, preset) {
    if (!npc || !preset) return;

    Object.keys(preset.stats || {}).forEach(function (key) {
        if (!npc[key]) return;
        setNpcEntryLevel(
            npc[key],
            getNpcGrowthValue(preset.stats[key], npc.lvl)
        );
    });

    Object.keys(preset.skills || {}).forEach(function (key) {
        if (!npc[key]) return;
        setNpcEntryLevel(
            npc[key],
            getNpcGrowthValue(preset.skills[key], npc.lvl)
        );
    });

    recalculateNpcStats(npc);
}

class Npc extends Character {
    constructor(preset, level, x, y) {
        super(0, 0, 0);

        this.isNpc = true;
        this.uid = nextNpcUid++;
        this.type = preset.id;
        this.name = preset.name;
        this.description = preset.description;
        this.image = preset.image;
        this.x = Math.floor(Number(x) || 0);
        this.y = Math.floor(Number(y) || 0);
        this.lvl = Math.max(1, Math.floor(Number(level) || 1));
        this.level = this.lvl;
        this.exp = 0;
        this.maxexp = typeof getExperienceRequiredForLevel === "function"
            ? getExperienceRequiredForLevel(this.lvl)
            : BASE_EXP;
        this.mood = clampNpcMood(rollNpcParameter(preset.mood));
        this.favor = normalizeNpcFavor(rollNpcParameter(preset.favor));
        this.boredom = 0;
        this.happy = 0;
        this.angryOmeter = 0;
        this.foodPreferences = generateNpcFoodPreferences(preset);
        this.moodDescription = "Neutral";
        refreshNpcMoodDescription(this);
        this.attack = 1;

        applyNpcPreset(this, preset);
    }
}

function createNpc(typeId, x, y, options) {
    const preset = getNpcPreset(typeId);
    if (!preset) return null;

    const forcedLevel = options && Number(options.level);
    const level = Number.isFinite(forcedLevel) && forcedLevel > 0
        ? Math.floor(forcedLevel)
        : getNpcLevelForTile(x, y);

    return new Npc(preset, level, x, y);
}

function spawnNpc(typeId, x, y, options) {
    const npc = createNpc(typeId, x, y, options);
    if (!npc) return null;

    npcs.push(npc);
    return npc;
}

function generateNpcHere(typeId, options) {
    if (typeof currentTile === "undefined" || !currentTile) return null;

    return spawnNpc(
        typeId || NPC_TYPE_IDS.FAIRY,
        currentTile.x,
        currentTile.y,
        options
    );
}

function getNpcByUid(uid) {
    const id = Number(uid);
    return npcs.find(function (npc) {
        return npc.uid === id;
    }) || null;
}

function getNpcsAtTile(x, y) {
    const tileX = Math.floor(Number(x) || 0);
    const tileY = Math.floor(Number(y) || 0);

    return npcs.filter(function (npc) {
        return npc.x === tileX && npc.y === tileY;
    });
}

function removeNpc(uid) {
    const id = Number(uid);
    const index = npcs.findIndex(function (npc) {
        return npc.uid === id;
    });
    if (index === -1) return false;

    npcs.splice(index, 1);
    return true;
}

function clearNpcs() {
    npcs = [];
    nextNpcUid = 1;
}

function serializeNpcs() {
    return npcs.map(function (npc) {
        return {
            uid: npc.uid,
            type: npc.type,
            level: npc.lvl,
            x: npc.x,
            y: npc.y,
            mood: npc.mood,
            moodDescription: refreshNpcMoodDescription(npc),
            favor: npc.favor,
            boredom: npc.boredom,
            happy: npc.happy,
            angryOmeter: npc.angryOmeter,
            foodPreferences: Array.isArray(npc.foodPreferences)
                ? npc.foodPreferences.slice()
                : [],
        };
    });
}

function restoreNpcs(savedNpcs) {
    clearNpcs();

    (Array.isArray(savedNpcs) ? savedNpcs : []).forEach(function (saved) {
        if (!saved) return;

        const preset = getNpcPreset(saved.type);
        if (!preset) return;

        const level = Math.max(1, Math.floor(Number(saved.level) || 1));
        const npc = new Npc(
            preset,
            level,
            Number(saved.x) || 0,
            Number(saved.y) || 0
        );

        const savedUid = Number(saved.uid);
        if (Number.isInteger(savedUid) && savedUid > 0) {
            npc.uid = savedUid;
            nextNpcUid = Math.max(nextNpcUid, savedUid + 1);
        }

        if (saved.mood != null) npc.mood = clampNpcMood(saved.mood);
        if (saved.favor != null) npc.favor = normalizeNpcFavor(saved.favor);
        if (saved.boredom != null) {
            npc.boredom = normalizeNpcBoredom(saved.boredom);
        }
        if (saved.happy != null) npc.happy = normalizeNpcHappy(saved.happy);
        if (saved.angryOmeter != null) {
            npc.angryOmeter = clampNpcAngryOmeter(saved.angryOmeter);
        }

        if (Array.isArray(saved.foodPreferences)) {
            const validPreferences = [];
            saved.foodPreferences.forEach(function (resourceId) {
                const id = Number(resourceId);
                if (!RESOURCE_DEFS[id]) return;
                if (validPreferences.indexOf(id) === -1) validPreferences.push(id);
            });
            if (validPreferences.length) npc.foodPreferences = validPreferences;
        }

        refreshNpcMoodDescription(npc);
        npcs.push(npc);
    });
}

function getNpcDisplayName(npc) {
    if (!npc) return "NPC";
    return npc.name + " Lv " + npc.lvl;
}

function setNpcMood(npc, value) {
    if (!npc) return false;
    npc.mood = clampNpcMood(value);
    return true;
}

function adjustNpcMood(npc, delta) {
    if (!npc) return false;
    npc.mood = clampNpcMood(npc.mood + (Number(delta) || 0));
    return true;
}

function setNpcFavor(npc, value) {
    if (!npc) return false;
    npc.favor = normalizeNpcFavor(value);
    return true;
}

function adjustNpcFavor(npc, delta) {
    if (!npc) return false;
    npc.favor = normalizeNpcFavor(npc.favor + (Number(delta) || 0));
    return true;
}

function setNpcBoredom(npc, value) {
    if (!npc) return false;
    npc.boredom = normalizeNpcBoredom(value);
    refreshNpcMoodDescription(npc);
    return true;
}

function adjustNpcBoredom(npc, delta) {
    if (!npc) return false;
    npc.boredom = normalizeNpcBoredom(npc.boredom + (Number(delta) || 0));
    refreshNpcMoodDescription(npc);
    return true;
}

function setNpcHappy(npc, value) {
    if (!npc) return false;
    npc.happy = normalizeNpcHappy(value);
    refreshNpcMoodDescription(npc);
    return true;
}

function adjustNpcHappy(npc, delta) {
    if (!npc) return false;
    npc.happy = normalizeNpcHappy(npc.happy + (Number(delta) || 0));
    refreshNpcMoodDescription(npc);
    return true;
}

function setNpcAngryOmeter(npc, value) {
    if (!npc) return false;
    npc.angryOmeter = clampNpcAngryOmeter(value);
    return true;
}

function adjustNpcAngryOmeter(npc, delta) {
    if (!npc) return false;
    npc.angryOmeter = clampNpcAngryOmeter(
        npc.angryOmeter + (Number(delta) || 0)
    );
    return true;
}

function moveNpcMoodTowardZero(value, step) {
    const current = Number(value) || 0;
    const amount = Math.max(0, Number(step) || 0);
    if (current > 0) return Math.max(0, current - amount);
    if (current < 0) return Math.min(0, current + amount);
    return 0;
}

function getNpcAngryDecayForMood(npc) {
    const mood = getNpcMoodDescription(npc);
    if (mood === "Excited") return 5;
    if (mood === "Happy") return 2;
    return 1;
}

// Moods drift back toward neutral every in-game hour. AngryOmeter always
// falls, but a Happy or Excited NPC calms down faster.
function updateNpcForGameHours(npc, hours) {
    if (!npc) return false;

    const totalHours = Math.max(0, Math.floor(Number(hours) || 0));
    for (let index = 0; index < totalHours; index++) {
        const angryDecay = getNpcAngryDecayForMood(npc);
        npc.angryOmeter = clampNpcAngryOmeter(npc.angryOmeter - angryDecay);
        npc.boredom = normalizeNpcBoredom(
            moveNpcMoodTowardZero(npc.boredom, 100)
        );
        npc.happy = normalizeNpcHappy(
            moveNpcMoodTowardZero(npc.happy, 100)
        );
        refreshNpcMoodDescription(npc);
    }
    return totalHours > 0;
}

function updateNpcsForGameHours(hours) {
    const count = Math.max(0, Math.floor(Number(hours) || 0));
    if (count <= 0) return 0;

    npcs.forEach(function (npc) {
        updateNpcForGameHours(npc, count);
    });
    return count;
}

function getNpcCheckLevel(key) {
    if (typeof getEffectiveLevel === "function") {
        return Math.max(0, Number(getEffectiveLevel(key)) || 0);
    }
    const entry = typeof player !== "undefined" && player
        ? player[key]
        : null;
    return Math.max(0, Number(entry && entry.lvl) || 0);
}

function getNpcMoodCharismaMultiplier(npc) {
    switch (getNpcMoodDescription(npc)) {
        case "Bored":
        case "Unhappy":
            return 0.8;
        case "Extremely bored":
        case "Sad":
            return 0.5;
        case "Curious":
        case "Happy":
            return 1.2;
        case "Extremely curious":
        case "Excited":
            return 1.5;
        default:
            return 1;
    }
}

// CharismaCheck = (Social * Charisma + Autism) / Autism, then adjusted by the
// target NPC's current mood.
function getNpcCharismaCheck(npc) {
    const social = Math.max(1, getNpcCheckLevel("social"));
    const cha = Math.max(1, getNpcCheckLevel("cha"));
    const autism = Math.max(1, getNpcCheckLevel("autism"));
    const base = (social * cha + autism) / autism;
    return round2(Math.max(
        0,
        base * getNpcMoodCharismaMultiplier(npc)
    ));
}

function getCurrentGameHour() {
    if (typeof gameTime === "undefined"
        || typeof GAME_MINUTES_PER_HOUR === "undefined") {
        return 0;
    }
    return Math.floor(
        Math.max(0, Number(gameTime.totalMinutes) || 0)
        / GAME_MINUTES_PER_HOUR
    );
}

// Talk actions per game hour: 1 at Social 1, then +1 for every two
// Social levels: 2 -> 2, 4 -> 3, 6 -> 4, 8 -> 5, 20 -> 11.
function getMaxTalkActionsPerHour(level) {
    const rawLevel = level != null
        ? Number(level)
        : (typeof getNpcCheckLevel === "function"
            ? getNpcCheckLevel("social")
            : 1);
    const social = Math.max(1, Math.floor(Number(rawLevel) || 1));
    return 1 + Math.floor(social / 2);
}

function getTalkActionUsage() {
    const hour = getCurrentGameHour();
    const max = getMaxTalkActionsPerHour();

    if (typeof player === "undefined" || !player) {
        return { hour: hour, max: max, used: 0, remaining: max };
    }

    const savedHour = Number(player.lastTalkGameHour);
    if (!Number.isFinite(savedHour) || savedHour !== hour) {
        player.lastTalkGameHour = hour;
        player.talkActionsUsed = 0;
    }

    const used = Math.max(0, Math.floor(Number(player.talkActionsUsed) || 0));
    player.talkActionsUsed = used;

    return {
        hour: hour,
        max: max,
        used: used,
        remaining: Math.max(0, max - used),
    };
}

function getRemainingTalkActions() {
    return getTalkActionUsage().remaining;
}

function canUseTalkAction() {
    return getTalkActionUsage().remaining > 0;
}

function consumeTalkAction() {
    const usage = getTalkActionUsage();
    if (usage.remaining <= 0) return false;
    if (typeof player === "undefined" || !player) return false;

    player.talkActionsUsed = usage.used + 1;
    return true;
}

function getNpcGreetTarget(tile) {
    const target = tile
        || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!target || typeof getNpcsAtTile !== "function") return null;

    const npcsHere = getNpcsAtTile(target.x, target.y);
    return npcsHere.length ? npcsHere[0] : null;
}

function canGreetNpcAtTile(tile) {
    const target = getNpcGreetTarget(tile);
    if (!target) return false;

    const hour = getCurrentGameHour();
    return !(typeof player !== "undefined"
        && player
        && player.lastGreetGameHour != null
        && Number(player.lastGreetGameHour) === hour);
}

function greetNpcAtTile(tile) {
    const target = getNpcGreetTarget(tile);
    if (!target) return false;

    const hour = getCurrentGameHour();
    if (typeof player !== "undefined"
        && player
        && player.lastGreetGameHour != null
        && Number(player.lastGreetGameHour) === hour) {
        return false;
    }

    const check = getNpcCharismaCheck(target);
    adjustNpcFavor(target, check);

    if (typeof player !== "undefined" && player) {
        if (player.social
            && typeof player.social.addexp === "function") {
            player.social.addexp(check);
        }
        player.lastGreetGameHour = hour;
    }

    const half = round2(check / 2);
    adjustNpcBoredom(target, half);
    adjustNpcHappy(target, half);

    if (typeof logMessage === "function") {
        logMessage("You greet " + getNpcDisplayName(target)
            + ". Favor +" + round2(check)
            + ", boredom +" + half + ", happiness +" + half + ".");
    }
    if (typeof renderNpcDialogue === "function"
        && typeof isNpcDialogueActive === "function"
        && isNpcDialogueActive()) {
        renderNpcDialogue();
    }
    if (typeof updateGUI === "function") updateGUI();
    return true;
}

// Repeating the exact same action bores the NPCs standing on the tile.
// The second consecutive selection costs 50 boredom, the third 100, then the
// penalty doubles for every further repetition.
let lastSelectedActionId = null;
let consecutiveActionSelections = 0;

function applyActionRepetitionBoredom(actionId) {
    const id = actionId ? String(actionId) : "";
    if (!id) return 0;

    if (lastSelectedActionId === id) {
        consecutiveActionSelections += 1;
    } else {
        lastSelectedActionId = id;
        consecutiveActionSelections = 1;
        return 0;
    }

    const repeats = consecutiveActionSelections - 1;
    if (repeats < 1) return 0;

    const penalty = 50 * Math.pow(2, repeats - 1);
    const target = typeof currentTile !== "undefined" ? currentTile : null;
    if (target && typeof getNpcsAtTile === "function") {
        getNpcsAtTile(target.x, target.y).forEach(function (npc) {
            adjustNpcBoredom(npc, -penalty);
        });
    }
    return penalty;
}

function resetActionRepetitionTracking() {
    lastSelectedActionId = null;
    consecutiveActionSelections = 0;
}

// --- conversation ---------------------------------------------------------

const NPC_GREET_FAVOR_GAIN = 10;
const NPC_GREET_MOOD_GAIN = 10;
const NPC_GREET_REPEAT_MOOD_LOSS = 5;

let activeNpcDialogue = null;

function isNpcDialogueActive() {
    return !!activeNpcDialogue;
}

function getActiveNpcDialogueNpc() {
    if (!activeNpcDialogue) return null;
    return getNpcByUid(activeNpcDialogue.npcUid);
}

function createNpcDialogueFighter(side, nameId, imageId) {
    const fighter = document.createElement("div");
    fighter.className = "combat-fighter combat-" + side;

    const name = document.createElement("div");
    name.className = "combat-name";
    name.id = nameId;
    fighter.appendChild(name);

    const portrait = document.createElement("div");
    portrait.className = "combat-portrait";
    const image = document.createElement("img");
    image.id = imageId;
    image.className = "combat-sprite";
    image.alt = "";
    portrait.appendChild(image);
    fighter.appendChild(portrait);

    return fighter;
}

function ensureNpcDialogueOverlay() {
    let overlay = document.getElementById("npcdialogueoverlay");
    if (overlay) return overlay;

    const parent = document.getElementById("actionplace") || document.body;
    overlay = document.createElement("div");
    overlay.id = "npcdialogueoverlay";
    overlay.className = "combatoverlay npcdialogueoverlay";
    overlay.style.display = "flex";

    const panel = document.createElement("div");
    panel.className = "combat-panel npcdialogue-panel";

    const title = document.createElement("div");
    title.className = "combat-title";
    title.innerText = "Conversation";
    panel.appendChild(title);

    const arena = document.createElement("div");
    arena.className = "combat-arena";
    arena.appendChild(createNpcDialogueFighter(
        "player",
        "npcdialogueplayername",
        "npcdialogueplayerimage"
    ));

    const vs = document.createElement("div");
    vs.className = "combat-vs";
    vs.innerText = "TALK";
    arena.appendChild(vs);

    arena.appendChild(createNpcDialogueFighter(
        "enemy",
        "npcdialoguenpcname",
        "npcdialoguenpcimage"
    ));
    panel.appendChild(arena);

    const stats = document.createElement("div");
    stats.className = "npcdialogue-stats";

    const addStat = function (id, label, wide) {
        const row = document.createElement("div");
        row.className = "npcdialogue-stat"
            + (wide ? " npcdialogue-stat-wide" : "");
        row.innerText = label + ": ";
        const value = document.createElement("span");
        value.id = id;
        row.appendChild(value);
        stats.appendChild(row);
        return value;
    };

    addStat("npcdialoguefavor", "Favor");
    addStat("npcdialoguemood", "Mood");
    addStat("npcdialoguemooddescription", "Mood state");
    addStat("npcdialogueboredom", "Boredom");
    addStat("npcdialoguehappy", "Happiness");
    addStat("npcdialogueangry", "Angry-O-Meter");
    addStat("npcdialoguefoodpreferences", "Food preferences", true);

    panel.appendChild(stats);

    const actions = document.createElement("div");
    actions.className = "npcdialogue-actions";

    const greetButton = document.createElement("button");
    greetButton.type = "button";
    greetButton.id = "npcdialoguegreet";
    greetButton.className = "combatclosebutton";
    greetButton.innerText = "Greet";
    greetButton.addEventListener("click", greetActiveNpc);
    actions.appendChild(greetButton);

    const goodbyeButton = document.createElement("button");
    goodbyeButton.type = "button";
    goodbyeButton.id = "npcdialoguesaygoodbye";
    goodbyeButton.className = "combatclosebutton";
    goodbyeButton.innerText = "Say goodbye";
    goodbyeButton.addEventListener("click", endNpcDialogue);
    actions.appendChild(goodbyeButton);

    panel.appendChild(actions);
    overlay.appendChild(panel);
    parent.appendChild(overlay);

    return overlay;
}

function renderNpcDialogue() {
    const npc = getActiveNpcDialogueNpc();
    if (!npc) {
        endNpcDialogue();
        return;
    }

    const overlay = ensureNpcDialogueOverlay();
    overlay.style.display = "flex";

    const playerName = document.getElementById("npcdialogueplayername");
    const playerImage = document.getElementById("npcdialogueplayerimage");
    const npcName = document.getElementById("npcdialoguenpcname");
    const npcImage = document.getElementById("npcdialoguenpcimage");
    const favor = document.getElementById("npcdialoguefavor");
    const mood = document.getElementById("npcdialoguemood");
    const moodDescription = document.getElementById("npcdialoguemooddescription");
    const boredom = document.getElementById("npcdialogueboredom");
    const happy = document.getElementById("npcdialoguehappy");
    const angry = document.getElementById("npcdialogueangry");
    const foodPreferences = document.getElementById("npcdialoguefoodpreferences");

    if (playerName) {
        playerName.innerText = (typeof player !== "undefined" && player && player.name)
            ? player.name
            : "You";
    }
    if (playerImage) playerImage.src = "muguu.png";
    if (npcName) npcName.innerText = getNpcDisplayName(npc);
    if (npcImage) npcImage.src = npc.image;
    if (favor) favor.innerText = round2(npc.favor);
    if (mood) mood.innerText = round2(npc.mood) + " / " + NPC_MOOD_MAX;
    if (moodDescription) {
        moodDescription.innerText = refreshNpcMoodDescription(npc);
    }
    if (boredom) boredom.innerText = round2(npc.boredom);
    if (happy) happy.innerText = round2(npc.happy);
    if (angry) {
        angry.innerText = round2(npc.angryOmeter) + " / " + NPC_ANGRY_MAX;
    }
    if (foodPreferences) {
        const names = getNpcFoodPreferenceNames(npc);
        foodPreferences.innerText = names.length ? names.join(", ") : "None";
    }
}

function captureNpcDialogueResumeActions() {
    if (typeof captureCombatResumeActions === "function") {
        captureCombatResumeActions();
    }
}

function resumeNpcDialogueActions() {
    if (typeof resumeCombatPreviousActions === "function") {
        resumeCombatPreviousActions();
    }
}

function startNpcDialogue(npc) {
    if (activeNpcDialogue) return false;
    if (typeof isCombatActive === "function" && isCombatActive()) return false;
    if (typeof isTraveling === "function" && isTraveling()) {
        if (typeof logMessage === "function") {
            logMessage("You cannot talk while travelling.");
        }
        return false;
    }
    if (typeof currentTile === "undefined" || !currentTile) return false;

    let target = npc || null;
    if (target && !(target instanceof Npc)) {
        target = getNpcByUid(target);
    }
    if (!target) {
        target = getNpcsAtTile(currentTile.x, currentTile.y)[0] || null;
    }
    if (!target || target.x !== currentTile.x || target.y !== currentTile.y) {
        return false;
    }

    if (!consumeTalkAction()) {
        if (typeof logMessage === "function") {
            logMessage("You have used all Talk actions for this game hour.");
        }
        return false;
    }

    captureNpcDialogueResumeActions();
    if (typeof stopActiveTimedActions === "function") {
        stopActiveTimedActions();
    }
    if (typeof closeMapTravelDialog === "function") closeMapTravelDialog();

    activeNpcDialogue = {
        npcUid: target.uid,
        greeted: false,
    };

    renderNpcDialogue();
    if (typeof logMessage === "function") {
        const usage = getTalkActionUsage();
        logMessage("You start talking to " + getNpcDisplayName(target)
            + ". Talk actions left this hour: "
            + usage.remaining + "/" + usage.max + ".");
    }
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    return true;
}

function endNpcDialogue() {
    if (!activeNpcDialogue) return false;

    const npc = getActiveNpcDialogueNpc();
    activeNpcDialogue = null;

    const overlay = document.getElementById("npcdialogueoverlay");
    if (overlay) overlay.remove();

    if (npc && typeof logMessage === "function") {
        logMessage("You say goodbye to " + npc.name + ".");
    }

    resumeNpcDialogueActions();
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}

function greetActiveNpc() {
    if (!activeNpcDialogue) return false;

    const npc = getActiveNpcDialogueNpc();
    if (!npc) {
        endNpcDialogue();
        return false;
    }

    const firstGreeting = activeNpcDialogue.greeted !== true;
    if (firstGreeting) {
        adjustNpcFavor(npc, NPC_GREET_FAVOR_GAIN);
        adjustNpcMood(npc, NPC_GREET_MOOD_GAIN);
        activeNpcDialogue.greeted = true;
        if (typeof logMessage === "function") {
            logMessage("You greet " + npc.name + ". Favor +"
                + NPC_GREET_FAVOR_GAIN + ", mood +" + NPC_GREET_MOOD_GAIN + ".");
        }
    } else {
        adjustNpcMood(npc, -NPC_GREET_REPEAT_MOOD_LOSS);
        if (typeof logMessage === "function") {
            logMessage(npc.name + " is tired of repeated greetings. Mood -"
                + NPC_GREET_REPEAT_MOOD_LOSS + ".");
        }
    }

    if (typeof player !== "undefined" && player && player.social
        && typeof player.social.addexp === "function") {
        player.social.addexp(firstGreeting ? 5 : 1);
    }

    renderNpcDialogue();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}
