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
        foodPreferenceMin: 5,
        foodPreferenceMax: 10,
        favoriteTags: Object.freeze(["leaf set"]),
        tags: Object.freeze(["childish"]),
    }),
});

let npcs = [];
let nextNpcUid = 1;

function getNpcPreset(typeId) {
    const id = String(typeId || "");
    return NPC_PRESETS[id] || null;
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

    const minPreferences = Math.max(1, Math.floor(
        Number(preset && preset.foodPreferenceMin)
        || NPC_FOOD_PREFERENCE_MIN
    ));
    const maxPreferences = Math.max(minPreferences, Math.floor(
        Number(preset && preset.foodPreferenceMax)
        || NPC_FOOD_PREFERENCE_MAX
    ));
    const wanted = minPreferences + Math.floor(
        Math.random() * (maxPreferences - minPreferences + 1)
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
        this.lastGiftGameHour = null;
        this.tags = Array.isArray(preset.tags) ? preset.tags.slice() : [];
        this.favoriteTags = Array.isArray(preset.favoriteTags)
            ? preset.favoriteTags.slice()
            : [];
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
    if (typeof registerNpcPlayAction === "function") {
        registerNpcPlayAction(npc);
    }
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

function getNpcTags(npc) {
    if (!npc || !Array.isArray(npc.tags)) return [];
    const tags = [];
    npc.tags.forEach(function (tag) {
        const value = String(tag || "").trim().toLowerCase();
        if (value && tags.indexOf(value) === -1) tags.push(value);
    });
    return tags;
}

function hasNpcTag(npc, tag) {
    const wanted = String(tag || "").trim().toLowerCase();
    return !!wanted && getNpcTags(npc).indexOf(wanted) !== -1;
}

function getSocialImpact() {
    const social = Math.max(1, getNpcCheckLevel("social"));
    const cha = Math.max(1, getNpcCheckLevel("cha"));
    return round2(Math.sqrt(social * cha));
}

function canPlayWithNpc(npc) {
    return !!npc
        && hasNpcTag(npc, "childish")
        && Number(npc.favor) > 50;
}

function getNpcPlayActionId(npcOrUid) {
    const uid = npcOrUid && typeof npcOrUid === "object"
        ? npcOrUid.uid
        : npcOrUid;
    return "playwith-" + Number(uid);
}

function isNpcPlayableByUid(uid) {
    const npc = getNpcByUid(uid);
    if (!npc || !canPlayWithNpc(npc)) return false;
    if (typeof currentTile === "undefined" || !currentTile) return false;
    if (npc.x !== currentTile.x || npc.y !== currentTile.y) return false;
    if (typeof isTraveling === "function" && isTraveling()) return false;
    if (typeof isCombatActive === "function" && isCombatActive()) return false;
    if (typeof isNpcDialogueActive === "function" && isNpcDialogueActive()) {
        return false;
    }
    return true;
}

function createNpcPlayAction(npc) {
    const npcUid = npc.uid;
    const actionId = getNpcPlayActionId(npc);
    let progress = 0;

    return {
        id: actionId,
        label: "Play with " + npc.name,
        tags: ["social", "childish"],
        noRepetitionBoredom: true,
        description: function () {
            const impact = getSocialImpact();
            return "Play with " + npc.name + ". Requires the Childish tag and Favor above 50."
                + "<br>Every 30 seconds: Favor and Boredom +" + impact
                + " (Social impact = sqrt(Social * Charisma))."
                + "<br>Stamina cost: " + impact + " per second."
                + "<br>This action never causes the repeated-action boredom penalty.";
        },
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start playing with " + npc.name + ".",
        stopMessage: "You stop playing with " + npc.name + ".",
        completeMessage: "You stop playing with " + npc.name + ".",
        isVisible: function () {
            return isNpcPlayableByUid(npcUid);
        },
        isComplete: function () {
            if (!isNpcPlayableByUid(npcUid)) return true;
            return typeof player !== "undefined"
                && !!player
                && Number(player.stamina) < getSocialImpact();
        },
        isEnabled: function () {
            return typeof player !== "undefined"
                && !!player
                && Number(player.hp) > 0
                && Number(player.stamina) >= getSocialImpact();
        },
        staminaPerSecond: function () {
            return getSocialImpact();
        },
        onStart: function () {
            progress = 0;
        },
        run: function (diff) {
            const seconds = Math.max(0, Number(diff) || 0);
            if (seconds <= 0) return;

            const staminaCost = getSocialImpact();
            if (typeof player !== "undefined"
                && player
                && Number(player.stamina) < staminaCost) {
                if (typeof logMessage === "function") {
                    logMessage("You are too tired to play with "
                        + npc.name + ".");
                }
                const currentAction = typeof getAction === "function"
                    ? getAction(actionId)
                    : null;
                if (currentAction
                    && typeof stopTimedAction === "function") {
                    stopTimedAction(currentAction);
                }
                return;
            }

            progress += seconds;
            while (progress >= 30) {
                progress -= 30;
                const target = getNpcByUid(npcUid);
                if (!target || !canPlayWithNpc(target)) {
                    if (typeof actionStates !== "undefined") {
                        actionStates[actionId] = Activity.Done;
                    }
                    return;
                }

                const impact = getSocialImpact();
                adjustNpcFavor(target, impact);
                adjustNpcBoredom(target, impact);
                refreshNpcMoodDescription(target);

                if (typeof logMessage === "function") {
                    logMessage("You play with " + target.name
                        + ". Favor +" + impact + ", boredom +" + impact + ".");
                }
                if (typeof isNpcDialogueActive === "function"
                    && isNpcDialogueActive()
                    && typeof renderNpcDialogue === "function") {
                    renderNpcDialogue();
                }
                if (typeof updateGUI === "function") updateGUI();
            }
        },
    };
}

function registerNpcPlayAction(npc) {
    if (!npc
        || typeof ACTIONS === "undefined"
        || typeof ACTIONS_BY_ID === "undefined") {
        return false;
    }

    const actionId = getNpcPlayActionId(npc);
    if (ACTIONS_BY_ID[actionId]) return false;

    const action = createNpcPlayAction(npc);
    ACTIONS.push(action);
    ACTIONS_BY_ID[actionId] = action;
    actionStates[actionId] = Activity.Idle;
    actionVisibility[actionId] = false;
    return true;
}

function unregisterNpcPlayAction(uid) {
    if (typeof ACTIONS === "undefined" || typeof ACTIONS_BY_ID === "undefined") {
        return false;
    }

    const actionId = getNpcPlayActionId(uid);
    const index = ACTIONS.findIndex(function (action) {
        return action && action.id === actionId;
    });
    if (index !== -1) ACTIONS.splice(index, 1);

    delete ACTIONS_BY_ID[actionId];
    if (typeof actionStates !== "undefined") delete actionStates[actionId];
    if (typeof actionVisibility !== "undefined") delete actionVisibility[actionId];

    const button = typeof getActionButton === "function"
        ? getActionButton(actionId)
        : document.getElementById("actionbutton-" + actionId);
    if (button) button.remove();
    return true;
}

function clearNpcPlayActions() {
    if (typeof ACTIONS === "undefined") return;
    const ids = ACTIONS
        .filter(function (action) {
            return action && String(action.id).indexOf("playwith-") === 0;
        })
        .map(function (action) { return action.id; });
    ids.forEach(function (actionId) {
        const rawUid = String(actionId).slice("playwith-".length);
        unregisterNpcPlayAction(rawUid);
    });
}

function syncNpcPlayActions() {
    clearNpcPlayActions();
    npcs.forEach(function (npc) {
        registerNpcPlayAction(npc);
    });
}

function isNpcFriend(npc) {
    return !!npc && Number(npc.favor) >= 10000;
}

function getNpcStatusLabel(npc) {
    return isNpcFriend(npc) ? "Friend" : "Neutral";
}

function getNpcEffectiveLevel(npc, key) {
    if (!npc) return 0;

    const entry = npc[key];
    let level = entry ? Number(entry.lvl) || 0 : 0;
    if (typeof getEquippedStatBonus === "function") {
        level += Number(getEquippedStatBonus(key, npc)) || 0;
    }
    if (typeof getEquippedPropertyLevelBonus === "function") {
        level += Number(getEquippedPropertyLevelBonus(key, npc)) || 0;
    }
    return Math.max(0, level);
}

function serializeNpcProgress(entry) {
    if (!entry) return null;
    return {
        lvl: Number(entry.lvl) || 0,
        exp: Number(entry.exp) || 0,
        potential: Number(entry.potential) || 0,
    };
}

function restoreNpcProgress(entry, saved) {
    if (!entry || !saved || typeof saved !== "object") return;
    if (Number.isFinite(Number(saved.lvl))) entry.lvl = Number(saved.lvl);
    if (Number.isFinite(Number(saved.exp))) entry.exp = Number(saved.exp);
    if (Number.isFinite(Number(saved.potential))) {
        entry.potential = Number(saved.potential);
    }
}

function getNpcWorldTile(npc) {
    if (!npc) return null;

    if (typeof window !== "undefined"
        && window.mapView
        && window.mapView.world
        && typeof window.mapView.world.getTileData === "function") {
        const raw = window.mapView.world.getTileData(npc.x, npc.y);
        if (raw && typeof ensureGameplayTileState === "function") {
            return ensureGameplayTileState(raw, npc.x, npc.y);
        }
        if (raw) return raw;
    }

    if (typeof currentTile !== "undefined" && currentTile
        && currentTile.x === npc.x && currentTile.y === npc.y) {
        return currentTile;
    }
    return null;
}

function getNpcForageSpaceInfo(tile, resourceId) {
    if (!tile || typeof FORAGE_SPACE_DEPENDENCIES === "undefined") return null;
    const dependencies = FORAGE_SPACE_DEPENDENCIES[resourceId];
    if (!Array.isArray(dependencies) || !dependencies.length) return null;

    const space = tile.space || {};
    const totalSpace = Object.keys(space).reduce(function (sum, key) {
        return sum + (Number(space[key]) || 0);
    }, 0) || 1000;
    const amount = dependencies.reduce(function (sum, element) {
        return sum + (Number(space[element]) || 0);
    }, 0);
    return { amount: amount, totalSpace: totalSpace };
}

function getNpcForageSpaceMultiplier(tile, resourceId) {
    const info = getNpcForageSpaceInfo(tile, resourceId);
    if (!info || info.totalSpace <= 0) return 1;
    return Math.min(1, info.amount / info.totalSpace);
}

function getNpcForageQuantityMultiplier(tile, resourceId) {
    const info = getNpcForageSpaceInfo(tile, resourceId);
    return info ? 1 + info.amount / 1000 : 1;
}

function getNpcForagePower(npc, tile) {
    if (!npc || !tile) return 0;

    const land = tile.land || {};
    const space = tile.space || {};
    const localLand = Math.max(1,
        (Number(land.trees) || 0)
        + (Number(land.grass) || 0)
        + (Number(space.Bushes) || 0));
    const explorationFactor = 0.5
        + getNpcEffectiveLevel(npc, "exploration") / 10;
    const agi = Math.max(0.01, getNpcEffectiveLevel(npc, "agi"));
    const forage = Math.max(0.01, getNpcEffectiveLevel(npc, "forage"));

    return Math.pow(agi * 0.9 * forage * explorationFactor, 1 / 3)
        * (1 + Math.log(localLand) / 10);
}

function getNpcForageQuality(npc, tile) {
    return round2(1 + getNpcForagePower(npc, tile));
}

function getNpcForageAmount(npc, tile, resourceId, profitAmount) {
    if (!tile) return 0;

    const divisor = Number(FORAGE_AMOUNT_DIVISOR) || 1;
    const multiplier = getResourceMultiplier(tile, resourceId);
    const spaceMultiplier = getNpcForageQuantityMultiplier(tile, resourceId);
    const equipmentMultiplier = typeof getEquippedStatMultiplier === "function"
        ? getEquippedStatMultiplier("forageQuantity", npc)
        : 1;

    return (Number(profitAmount) || 0)
        * multiplier
        * spaceMultiplier
        * equipmentMultiplier
        / divisor;
}

function npcForageRoll(npc, tile, difficulty, resourceId, profitAmount) {
    if (!npc || !tile) return false;

    const multiplier = getResourceMultiplier(tile, resourceId);
    const spaceMultiplier = getNpcForageSpaceMultiplier(tile, resourceId);
    if (spaceMultiplier <= 0) return false;

    const effectiveDifficulty = (Number(difficulty) || 0) * multiplier;
    const perception = Math.max(0.01, getNpcEffectiveLevel(npc, "per"));
    const forage = Math.max(0.01, getNpcEffectiveLevel(npc, "forage"));
    const luck = Math.max(0, getNpcEffectiveLevel(npc, "luck"));
    const foragePower = Math.sqrt(perception * forage * (1 + luck * 0.01))
        * spaceMultiplier;
    if (foragePower <= 0) return false;

    const baseChance = Math.max(0, Math.min(
        1,
        1 - effectiveDifficulty / foragePower
    ));
    const findMultiplier = typeof getEquippedStatMultiplier === "function"
        ? getEquippedStatMultiplier("forageFindChance", npc)
        : 1;
    const chance = Math.min(1, baseChance * findMultiplier);
    if (Math.random() >= chance) return false;

    const amount = getNpcForageAmount(npc, tile, resourceId, profitAmount);
    if (amount > 0) {
        addResource(
            resourceId,
            amount,
            getNpcForageQuality(npc, tile)
        );
    }
    return true;
}

function chooseNpcForageEntry(entries) {
    if (!Array.isArray(entries) || !entries.length) return null;

    const totalWeight = entries.reduce(function (sum, entry) {
        return sum + Math.max(0, Number(entry.weight) || 0);
    }, 0);
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        roll -= Math.max(0, Number(entry.weight) || 0);
        if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
}

function npcForageHerbRoll(npc, tile) {
    if (typeof getEligibleHerbsOnTile !== "function") return false;
    const herb = chooseNpcForageEntry(getEligibleHerbsOnTile(tile));
    if (!herb) return false;
    return npcForageRoll(npc, tile, herb.difficulty, herb.id, herb.amount);
}

function npcForagePlantRoll(npc, tile) {
    if (typeof getEligiblePlantsOnTile !== "function") return false;
    const plant = chooseNpcForageEntry(getEligiblePlantsOnTile(tile));
    if (!plant) return false;
    return npcForageRoll(npc, tile, plant.difficulty, plant.id, plant.amount);
}

function performNpcForageBatch(npc, tile) {
    if (typeof FORAGE_ROLLS !== "undefined") {
        FORAGE_ROLLS.forEach(function (entry) {
            npcForageRoll(npc, tile, entry[0], entry[1], entry[2]);
        });
    }
    npcForageHerbRoll(npc, tile);
    npcForagePlantRoll(npc, tile);
}

function performNpcFairyForage(npc) {
    if (!npc || !isNpcFriend(npc)) return false;

    const tile = getNpcWorldTile(npc);
    if (!tile) return false;
    if (!Number.isFinite(Number(tile.hiddenstuff))) tile.hiddenstuff = 0;
    if (Number(tile.hiddenstuff) <= 0) return false;

    const power = getNpcForagePower(npc, tile);
    if (power <= 0) return false;

    const gameMinutesPerSecond = Number(GAME_MINUTES_PER_REAL_SECOND) || 1;
    const durationSeconds = (4 * 60) / gameMinutesPerSecond;
    const tickSeconds = Number(FORAGE_RESOURCE_TICK_SECONDS) || 10;
    const maxTicks = Math.max(1, Math.min(
        240,
        Math.floor(durationSeconds / tickSeconds)
    ));

    let remainder = 0;
    let batchesTotal = 0;
    let searchUsed = 0;

    for (let tick = 0; tick < maxTicks; tick += 1) {
        if (Number(tile.hiddenstuff) <= 0) break;

        const tickPower = power * tickSeconds;
        const used = Math.min(tickPower, Number(tile.hiddenstuff) || 0);
        if (used <= 0) break;

        tile.hiddenstuff = round2(
            Math.max(0, (Number(tile.hiddenstuff) || 0) - used)
        );
        searchUsed += used;
        remainder += used;

        const batches = Math.min(
            Math.floor(remainder),
            typeof FORAGE_MAX_BATCHES_PER_TICK !== "undefined"
                ? FORAGE_MAX_BATCHES_PER_TICK
                : 20
        );
        remainder -= batches;

        const expMultiplier = Number(FORAGE_RESOURCE_TICK_EXP_MULTIPLIER) || 1;
        if (npc.per && typeof npc.per.addexp === "function") {
            npc.per.addexp((1 + used * 0.1) * expMultiplier);
        }
        if (npc.forage && typeof npc.forage.addexp === "function") {
            npc.forage.addexp((1 + used * 0.5) * expMultiplier);
        }

        for (let batch = 0; batch < batches; batch += 1) {
            performNpcForageBatch(npc, tile);
            batchesTotal += 1;
        }
    }

    if (typeof refreshMapCoordinates === "function") {
        refreshMapCoordinates(true);
    }
    if (typeof logMessage === "function") {
        logMessage(npc.name + " forages for you. Batches: " + batchesTotal
            + ", search units spent: " + round2(searchUsed) + ".");
    }
    if (typeof updateGUI === "function") updateGUI();
    return batchesTotal > 0;
}

function processNpcDailyNoon(days) {
    const dayCount = Math.max(0, Math.floor(Number(days) || 0));
    if (dayCount <= 0) return 0;

    for (let day = 0; day < dayCount; day += 1) {
        npcs.forEach(function (npc) {
            if (!npc) return;

            if (typeof LEARNABLE_SKILL_KEYS !== "undefined") {
                LEARNABLE_SKILL_KEYS.forEach(function (key) {
                    if (npc[key] && typeof increasePotential === "function") {
                        increasePotential(
                            npc[key],
                            getMaxPotential() * 0.10
                        );
                    }
                });
            }

            if (isNpcFriend(npc) && npc.type === NPC_TYPE_IDS.FAIRY) {
                performNpcFairyForage(npc);
            }
        });
    }
    return dayCount;
}

function clearNpcs() {
    clearNpcPlayActions();
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
            lastGiftGameHour: npc.lastGiftGameHour != null
                && Number.isFinite(Number(npc.lastGiftGameHour))
                ? Number(npc.lastGiftGameHour)
                : null,
            foodPreferences: Array.isArray(npc.foodPreferences)
                ? npc.foodPreferences.slice()
                : [],
            stats: CORE_STAT_NAMES.reduce(function (result, name) {
                result[name] = serializeNpcProgress(npc[name]);
                return result;
            }, {}),
            skills: LEARNABLE_SKILL_KEYS.reduce(function (result, name) {
                result[name] = serializeNpcProgress(npc[name]);
                return result;
            }, {}),
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
        const savedGiftHour = saved.lastGiftGameHour != null
            ? Number(saved.lastGiftGameHour)
            : null;
        npc.lastGiftGameHour = Number.isFinite(savedGiftHour)
            ? savedGiftHour
            : null;

        if (Array.isArray(saved.foodPreferences)) {
            const validPreferences = [];
            saved.foodPreferences.forEach(function (resourceId) {
                const id = Number(resourceId);
                if (!RESOURCE_DEFS[id]) return;
                if (validPreferences.indexOf(id) === -1) validPreferences.push(id);
            });
            if (validPreferences.length) npc.foodPreferences = validPreferences;
        }
        if (saved.stats && typeof saved.stats === "object") {
            CORE_STAT_NAMES.forEach(function (name) {
                restoreNpcProgress(npc[name], saved.stats[name]);
            });
        }
        if (saved.skills && typeof saved.skills === "object") {
            LEARNABLE_SKILL_KEYS.forEach(function (name) {
                restoreNpcProgress(npc[name], saved.skills[name]);
            });
        }

        refreshNpcMoodDescription(npc);
        npcs.push(npc);
    });

    syncNpcPlayActions();
}

function getNpcDisplayName(npc) {
    if (!npc) return "NPC";
    return npc.name + " Lv " + npc.lvl;
}

function adjustNpcFavor(npc, delta) {
    if (!npc) return false;
    npc.favor = normalizeNpcFavor(npc.favor + (Number(delta) || 0));
    return true;
}

function adjustNpcBoredom(npc, delta) {
    if (!npc) return false;
    npc.boredom = normalizeNpcBoredom(npc.boredom + (Number(delta) || 0));
    refreshNpcMoodDescription(npc);
    return true;
}

function adjustNpcHappy(npc, delta) {
    if (!npc) return false;
    npc.happy = normalizeNpcHappy(npc.happy + (Number(delta) || 0));
    refreshNpcMoodDescription(npc);
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

function canGreetNpc(npc) {
    if (!npc) return false;

    const hour = getCurrentGameHour();
    return !(typeof player !== "undefined"
        && player
        && player.lastGreetGameHour != null
        && Number(player.lastGreetGameHour) === hour);
}

function applyNpcConversationGains(npc, factor) {
    if (!npc) return null;

    const multiplier = Math.max(0, Number(factor) || 0);
    const check = getNpcCharismaCheck(npc);
    const favorGain = round2(check * multiplier);
    const moodGain = round2((check / 2) * multiplier);

    adjustNpcFavor(npc, favorGain);
    if (typeof player !== "undefined" && player
        && player.social
        && typeof player.social.addexp === "function") {
        player.social.addexp(favorGain);
    }
    adjustNpcBoredom(npc, moodGain);
    adjustNpcHappy(npc, moodGain);

    return {
        check: check,
        favorGain: favorGain,
        moodGain: moodGain,
    };
}

function getGiftItemTags(item) {
    if (!item) return [];

    const tags = [];
    const add = function (tag) {
        if (typeof tag === "string" && tag && tags.indexOf(tag) === -1) {
            tags.push(tag);
        }
    };

    (Array.isArray(item.tags) ? item.tags : []).forEach(add);
    const definition = item.definition
        || (item.itemId != null ? ITEM_DEFS[item.itemId] : null);
    if (definition && Array.isArray(definition.tags)) {
        definition.tags.forEach(add);
    }
    const source = item.sourceResourceId != null
        ? RESOURCE_DEFS[item.sourceResourceId]
        : null;
    if (source && Array.isArray(source.tags)) source.tags.forEach(add);
    return tags;
}

function getNpcFavoriteTags(npc) {
    if (!npc) return [];

    const tags = [];
    const add = function (tag) {
        if (typeof tag === "string" && tag
            && tag !== RESOURCE_TAGS.Edible
            && tag !== RESOURCE_TAGS.Seed
            && tag !== RESOURCE_TAGS.Gemstone
            && tags.indexOf(tag) === -1) {
            tags.push(tag);
        }
    };

    if (Array.isArray(npc.favoriteTags)) {
        npc.favoriteTags.forEach(add);
    }

    if (Array.isArray(npc.foodPreferences)) {
        npc.foodPreferences.forEach(function (resourceId) {
            const definition = RESOURCE_DEFS[resourceId];
            if (definition && Array.isArray(definition.tags)) {
                definition.tags.forEach(add);
            }
        });
    }
    return tags;
}

function getGiftFavoriteTagCount(npc, item) {
    const favoriteTags = getNpcFavoriteTags(npc);
    if (!favoriteTags.length) return 0;

    return getGiftItemTags(item).filter(function (tag) {
        return favoriteTags.indexOf(tag) !== -1;
    }).length;
}

function getGiftFavorValue(npc, item) {
    if (!item) return 0;

    const quality = Math.max(0, Number(item.quality) || 0);
    const rarity = typeof getRarityMultiplier === "function"
        ? getRarityMultiplier(getItemRarityId(item))
        : 1;
    const favoriteCount = getGiftFavoriteTagCount(npc, item);
    return round2(quality * rarity * Math.pow(2, favoriteCount));
}

function getGiftEquipmentScore(item) {
    if (!item) return 0;

    let score = 0;
    if (typeof item.getStats === "function") {
        const stats = item.getStats();
        Object.keys(stats || {}).forEach(function (key) {
            score += Math.abs(Number(stats[key]) || 0);
        });
    }
    (Array.isArray(item.properties) ? item.properties : []).forEach(function (property) {
        if (!property) return;
        score += Math.abs(Number(property.value) || 0);
        score += Math.abs(Number(property.effect) || 0);
    });
    return round2(score);
}

function isGemstoneGift(item) {
    if (!item) return false;
    if (getGiftItemTags(item).indexOf(RESOURCE_TAGS.Gemstone) !== -1) {
        return true;
    }
    const source = item.sourceResourceId != null
        ? RESOURCE_DEFS[item.sourceResourceId]
        : null;
    return !!(source && source.gemstone);
}

function getGiftEquipmentSlots(item) {
    if (!item || typeof EQUIPMENT_SLOT_IDS === "undefined") return [];
    return EQUIPMENT_SLOT_IDS.filter(function (slotId) {
        return typeof canEquipItemToSlot === "function"
            && canEquipItemToSlot(item, slotId);
    });
}

function getBestGiftEquipmentSlot(npc, item) {
    if (!npc || !npc.equipment) return null;

    const slots = getGiftEquipmentSlots(item);
    if (!slots.length) return null;

    let bestSlot = null;
    let bestScore = Infinity;
    slots.forEach(function (slotId) {
        const current = npc.equipment[slotId] || null;
        const currentScore = current ? getGiftEquipmentScore(current) : -1;
        if (currentScore < bestScore) {
            bestScore = currentScore;
            bestSlot = slotId;
        }
    });

    if (!bestSlot) return null;
    const current = npc.equipment[bestSlot] || null;
    if (current && getGiftEquipmentScore(item) <= getGiftEquipmentScore(current)) {
        return null;
    }
    return bestSlot;
}

function removeGiftItemFromPlayer(item) {
    if (!item || typeof player === "undefined" || !player
        || !Array.isArray(player.equipinventory)) {
        return false;
    }

    const inventory = player.equipinventory;
    const index = inventory.findIndex(function (entry) {
        return entry === item
            || (entry && item && entry.instanceId === item.instanceId);
    });
    if (index === -1) return false;

    if (Number(item.count) > 1) {
        item.count = Number(item.count) - 1;
    } else {
        inventory[index] = null;
    }
    return true;
}

function applyNpcFoodGift(npc, item) {
    if (!npc || !item || !item.definition || !item.definition.food) {
        return { hunger: 0, potential: [] };
    }

    const base = Number(item.definition.food.hungerRestore) || 0;
    const hungerRestore = round2(base * (1 + item.effectiveQuality / 10));
    npc.hunger = Math.max(
        -100,
        (Number(npc.hunger) || 0) - hungerRestore
    );

    const gained = [];
    const bonuses = item.potentialBonuses || {};
    Object.keys(bonuses).forEach(function (statName) {
        const stat = npc[statName];
        const amount = Number(bonuses[statName]) || 0;
        if (stat && amount > 0 && typeof increasePotential === "function") {
            increasePotential(stat, amount);
            gained.push(statName + " +" + round2(amount));
        }
    });

    return { hunger: hungerRestore, potential: gained };
}

function giveGiftToNpc(npc, item) {
    if (!npc || !item) return null;

    let favor = getGiftFavorValue(npc, item);
    const isFood = typeof isConsumableFoodItem === "function"
        && isConsumableFoodItem(item);
    const isGem = isGemstoneGift(item);
    const isEquipment = !isFood && !isGem
        && getGiftEquipmentSlots(item).length > 0;
    let equipped = false;
    let destroyedOld = null;

    if (isFood) {
        applyNpcFoodGift(npc, item);
    } else if (isEquipment) {
        const slotId = getBestGiftEquipmentSlot(npc, item);
        if (slotId) {
            destroyedOld = npc.equipment[slotId] || null;
            npc.equipment[slotId] = item;
            equipped = true;
            if (typeof recalculateNpcStats === "function") {
                recalculateNpcStats(npc);
            }
        } else {
            favor = round2(favor / 4);
        }
    }

    removeGiftItemFromPlayer(item);
    adjustNpcFavor(npc, favor);

    const hour = getCurrentGameHour();
    let boredomGain = 0;
    if (npc.lastGiftGameHour == null
        || Number(npc.lastGiftGameHour) !== hour) {
        boredomGain = round2(favor / 2);
        adjustNpcBoredom(npc, boredomGain);
        npc.lastGiftGameHour = hour;
    }

    refreshNpcMoodDescription(npc);
    if (typeof logMessage === "function") {
        let message = "You give " + item.name + " to "
            + getNpcDisplayName(npc) + ". Favor +" + favor + ".";
        if (isFood) message += " The NPC eats it.";
        if (isGem) message += " The gemstone is consumed.";
        if (isEquipment && equipped) {
            message += " The NPC equips it";
            if (destroyedOld) message += " and discards the old item";
            message += ".";
        } else if (isEquipment) {
            message += " It is worse than the NPC's current equipment and is discarded.";
        }
        if (boredomGain > 0) {
            message += " Boredom +" + boredomGain + ".";
        }
        logMessage(message);
    }
    if (activeNpcDialogue && activeNpcDialogue.npcUid === npc.uid) {
        activeNpcDialogue.speechKey = "gift";
    }
    if (typeof renderNpcDialogue === "function"
        && typeof isNpcDialogueActive === "function"
        && isNpcDialogueActive()) {
        renderNpcDialogue();
    }
    if (typeof renderInventory === "function") renderInventory();
    if (typeof updateGUI === "function") updateGUI();
    return { favor: favor, isFood: isFood, isGem: isGem, equipped: equipped };
}

function getGiftableInventoryItems() {
    if (typeof player === "undefined"
        || !player
        || !Array.isArray(player.equipinventory)) {
        return [];
    }

    const entries = [];
    player.equipinventory.forEach(function (item, index) {
        if (!item || item.locked === true) return;
        if (Number(item.count || 1) <= 0) return;
        entries.push({ index: index, item: item });
    });
    return entries;
}

function ensureGiftChooserOverlay() {
    let overlay = document.getElementById("giftchooseroverlay");
    if (overlay) return overlay;

    const parent = document.getElementById("actionplace") || document.body;
    overlay = document.createElement("div");
    overlay.id = "giftchooseroverlay";
    overlay.className = "combatoverlay npcdialogueoverlay giftchooseroverlay";
    overlay.style.display = "flex";

    const panel = document.createElement("div");
    panel.className = "combat-panel npcdialogue-panel";

    const title = document.createElement("div");
    title.className = "combat-title";
    title.id = "giftchoosertitle";
    title.innerText = "Choose a gift";
    panel.appendChild(title);

    const list = document.createElement("div");
    list.id = "giftchooserlist";
    list.className = "npcdialogue-npclist giftchooserlist";
    panel.appendChild(list);

    const actions = document.createElement("div");
    actions.className = "npcdialogue-actions";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.id = "giftchoosercancel";
    cancelButton.className = "combatclosebutton";
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", closeGiftChooser);
    actions.appendChild(cancelButton);

    panel.appendChild(actions);
    overlay.appendChild(panel);
    parent.appendChild(overlay);
    return overlay;
}

function renderGiftChooser() {
    const state = activeGiftChooser;
    if (!state || !state.npc) return;

    const npc = state.npc;
    const overlay = ensureGiftChooserOverlay();
    overlay.style.display = "flex";

    const title = document.getElementById("giftchoosertitle");
    if (title) {
        title.innerText = "Choose a gift for " + getNpcDisplayName(npc);
    }

    const list = document.getElementById("giftchooserlist");
    if (!list) return;
    list.innerHTML = "";

    const entries = getGiftableInventoryItems();
    if (!entries.length) {
        closeGiftChooser();
        if (typeof logMessage === "function") {
            logMessage("You have no items to give.");
        }
        return;
    }

    entries.forEach(function (entry) {
        const item = entry.item;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "npcdialogue-npcchoice giftchooser-item";

        const image = document.createElement("img");
        image.src = getItemImagePath(getInventoryItemName(item));
        image.alt = getInventoryItemName(item);
        button.appendChild(image);

        const info = document.createElement("span");
        info.className = "npcdialogue-npcchoice-info";

        const name = document.createElement("span");
        name.className = "npcdialogue-npcchoice-name";
        name.innerText = getInventoryItemName(item);
        info.appendChild(name);

        const meta = document.createElement("span");
        meta.className = "npcdialogue-npcchoice-meta";
        meta.innerText = "Q" + round2(item.quality)
            + " | " + item.rarityLabel
            + " | Favor +" + getGiftFavorValue(npc, item);
        info.appendChild(meta);

        button.appendChild(info);
        button.addEventListener("click", function () {
            closeGiftChooser();
            giveGiftToNpc(npc, item);
        });
        list.appendChild(button);
    });
}

function openGiftItemChooser(npc) {
    if (!npc) return false;
    if (typeof isCombatActive === "function" && isCombatActive()) {
        return false;
    }
    if (!getGiftableInventoryItems().length) {
        if (typeof logMessage === "function") {
            logMessage("You have no items to give.");
        }
        return false;
    }

    activeGiftChooser = { npc: npc };
    renderGiftChooser();
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    return true;
}

function openGiftActiveNpc() {
    const npc = getActiveNpcDialogueNpc();
    if (!npc) return false;
    return openGiftItemChooser(npc);
}

function closeGiftChooser() {
    const wasActive = !!activeGiftChooser;
    activeGiftChooser = null;

    const overlay = document.getElementById("giftchooseroverlay");
    if (overlay) overlay.remove();

    if (wasActive && typeof refreshActionButtons === "function") {
        refreshActionButtons();
    }
    return wasActive;
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

function escapeNpcLogText(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getNpcAmbientActionId() {
    if (typeof ACTIONS !== "undefined" && typeof actionStates !== "undefined") {
        const activeState = typeof Activity !== "undefined" ? Activity.Active : 1;
        for (let index = 0; index < ACTIONS.length; index++) {
            const id = ACTIONS[index].id;
            if (actionStates[id] === activeState) return id;
        }
    }
    if (typeof lastSelectedActionId !== "undefined" && lastSelectedActionId) {
        return lastSelectedActionId;
    }
    return null;
}

let npcAmbientLogTimer = 0;

function updateNpcAmbientLines(diff) {
    if (typeof isOfflineSimulationRunning === "function"
        && isOfflineSimulationRunning()) {
        return 0;
    }
    if (typeof isTraveling === "function" && isTraveling()) return 0;
    if (typeof currentTile === "undefined" || !currentTile) return 0;
    if (typeof getNpcsAtTile !== "function" || typeof logMessage !== "function") {
        return 0;
    }

    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return 0;

    npcAmbientLogTimer += seconds;
    const ticks = Math.min(12, Math.floor(npcAmbientLogTimer / 5));
    if (ticks <= 0) return 0;
    npcAmbientLogTimer -= ticks * 5;

    const npcsHere = getNpcsAtTile(currentTile.x, currentTile.y);
    if (!npcsHere.length) return 0;

    let logged = 0;
    for (let tick = 0; tick < ticks; tick++) {
        const actionId = getNpcAmbientActionId();
        npcsHere.forEach(function (npc) {
            if (Math.random() >= 0.05) return;
            const line = typeof getKanojoNpcLine === "function"
                ? getKanojoNpcLine(npc, actionId)
                : "";
            if (!line) return;

            const style = typeof getKanojoNpcStyle === "function"
                ? getKanojoNpcStyle(npc)
                : null;
            const color = style ? style.border : "#1f8f2f";
            const background = style ? style.background : "#c8ff9e";
            const text = npc.name + ": " + line;
            const html = '<span style="color:' + color
                + ';background-color:' + background
                + ';border:1px solid ' + color
                + ';padding:0 2px;">'
                + escapeNpcLogText(text)
                + "</span>";
            logMessage(text, { html: html });
            logged += 1;
        });
    }
    return logged;
}

// --- conversation ---------------------------------------------------------

let activeNpcDialogue = null;
let activeNpcChooser = null;
let activeGiftChooser = null;

function isNpcDialogueActive() {
    return !!activeNpcDialogue || !!activeNpcChooser || !!activeGiftChooser;
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

    const speech = document.createElement("div");
    speech.id = "npcdialoguespeech";
    speech.className = "npcdialoguespeech";
    panel.appendChild(speech);

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
    addStat("npcdialoguestatus", "Status", true);
    addStat("npcdialogueboredom", "Boredom");
    addStat("npcdialoguehappy", "Happiness");
    addStat("npcdialogueangry", "Angry-O-Meter");
    addStat("npcdialoguefoodpreferences", "Food preferences", true);
    addStat("npcdialoguetags", "Tags", true);
    addStat("npcdialoguefavoritetags", "Favorite tags", true);

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

    const commonChatButton = document.createElement("button");
    commonChatButton.type = "button";
    commonChatButton.id = "npcdialoguecommonchat";
    commonChatButton.className = "combatclosebutton";
    commonChatButton.innerText = "Common chat";
    commonChatButton.addEventListener("click", commonChatActiveNpc);
    actions.appendChild(commonChatButton);

    const giftButton = document.createElement("button");
    giftButton.type = "button";
    giftButton.id = "npcdialoguegift";
    giftButton.className = "combatclosebutton";
    giftButton.innerText = "Gift";
    giftButton.addEventListener("click", openGiftActiveNpc);
    actions.appendChild(giftButton);

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

function getNpcChooserCandidates() {
    if (typeof currentTile === "undefined" || !currentTile) return [];
    return typeof getNpcsAtTile === "function"
        ? getNpcsAtTile(currentTile.x, currentTile.y)
        : [];
}

function ensureNpcChooserOverlay() {
    let overlay = document.getElementById("npcchooseroverlay");
    if (overlay) return overlay;

    const parent = document.getElementById("actionplace") || document.body;
    overlay = document.createElement("div");
    overlay.id = "npcchooseroverlay";
    overlay.className = "combatoverlay npcdialogueoverlay npcchooseroverlay";
    overlay.style.display = "flex";

    const panel = document.createElement("div");
    panel.className = "combat-panel npcdialogue-panel";

    const title = document.createElement("div");
    title.className = "combat-title";
    title.id = "npcchoosertitle";
    title.innerText = "Who do you want to talk to?";
    panel.appendChild(title);

    const list = document.createElement("div");
    list.id = "npcchooserlist";
    list.className = "npcdialogue-npclist";
    panel.appendChild(list);

    const actions = document.createElement("div");
    actions.className = "npcdialogue-actions";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.id = "npcchoosercancel";
    cancelButton.className = "combatclosebutton";
    cancelButton.innerText = "Cancel";
    cancelButton.addEventListener("click", closeNpcChooser);
    actions.appendChild(cancelButton);

    panel.appendChild(actions);
    overlay.appendChild(panel);
    parent.appendChild(overlay);
    return overlay;
}

function getNpcChooserState() {
    return activeNpcChooser && typeof activeNpcChooser === "object"
        ? activeNpcChooser
        : null;
}

function renderNpcChooser() {
    const state = getNpcChooserState();
    if (!state) return;

    const overlay = ensureNpcChooserOverlay();
    overlay.style.display = "flex";

    const title = document.getElementById("npcchoosertitle");
    if (title) {
        title.innerText = state.title || "Who do you want to talk to?";
    }

    const list = document.getElementById("npcchooserlist");
    if (!list) return;
    list.innerHTML = "";

    const candidates = Array.isArray(state.candidates)
        ? state.candidates
        : [];
    if (!candidates.length) {
        closeNpcChooser();
        return;
    }

    candidates.forEach(function (npc) {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.className = "npcdialogue-npcchoice";

        const image = document.createElement("img");
        image.src = npc.image;
        image.alt = "";

        const info = document.createElement("span");
        info.className = "npcdialogue-npcchoice-info";

        const name = document.createElement("span");
        name.className = "npcdialogue-npcchoice-name";
        name.innerText = getNpcDisplayName(npc);

        const meta = document.createElement("span");
        meta.className = "npcdialogue-npcchoice-meta";
        meta.innerText = "Favor " + round2(npc.favor)
            + " | " + refreshNpcMoodDescription(npc);

        info.appendChild(name);
        info.appendChild(meta);
        choice.appendChild(image);
        choice.appendChild(info);
        choice.addEventListener("click", function () {
            const onSelect = state.onSelect;
            closeNpcChooser();
            if (typeof onSelect === "function") onSelect(npc);
        });
        list.appendChild(choice);
    });
}

function openNpcChooser(candidates, options) {
    if (activeNpcDialogue) return false;

    const list = Array.isArray(candidates)
        ? candidates
        : getNpcChooserCandidates();
    if (!list.length) return false;

    const settings = options && typeof options === "object" ? options : {};
    const onSelect = typeof settings.onSelect === "function"
        ? settings.onSelect
        : startNpcDialogue;
    if (list.length === 1) return onSelect(list[0]);

    activeNpcChooser = {
        candidates: list.slice(),
        title: settings.title || "Who do you want to talk to?",
        onSelect: onSelect,
    };
    renderNpcChooser();

    const message = settings.logMessage === undefined
        ? "Several NPCs are here. Choose who to talk to."
        : settings.logMessage;
    if (message && typeof logMessage === "function") {
        logMessage(message);
    }
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    return true;
}

function closeNpcChooser() {
    const wasActive = !!activeNpcChooser;
    activeNpcChooser = null;

    const overlay = document.getElementById("npcchooseroverlay");
    if (overlay) overlay.remove();

    if (wasActive && typeof refreshActionButtons === "function") {
        refreshActionButtons();
    }
    return wasActive;
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
    const npcStatus = document.getElementById("npcdialoguestatus");
    const boredom = document.getElementById("npcdialogueboredom");
    const happy = document.getElementById("npcdialoguehappy");
    const angry = document.getElementById("npcdialogueangry");
    const foodPreferences = document.getElementById("npcdialoguefoodpreferences");
    const npcTags = document.getElementById("npcdialoguetags");
    const npcFavoriteTags = document.getElementById("npcdialoguefavoritetags");

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
    if (npcStatus) npcStatus.innerText = getNpcStatusLabel(npc);
    if (boredom) boredom.innerText = round2(npc.boredom);
    if (happy) happy.innerText = round2(npc.happy);
    if (angry) {
        angry.innerText = round2(npc.angryOmeter) + " / " + NPC_ANGRY_MAX;
    }
    if (foodPreferences) {
        const names = getNpcFoodPreferenceNames(npc);
        foodPreferences.innerText = names.length ? names.join(", ") : "None";
    }
    if (npcTags) {
        const tags = getNpcTags(npc);
        npcTags.innerText = tags.length
            ? tags.map(function (tag) {
                return tag.charAt(0).toUpperCase() + tag.slice(1);
            }).join(", ")
            : "None";
    }
    if (npcFavoriteTags) {
        const favoriteTags = getNpcFavoriteTags(npc);
        npcFavoriteTags.innerText = favoriteTags.length
            ? favoriteTags.map(function (tag) {
                return tag.charAt(0).toUpperCase() + tag.slice(1);
            }).join(", ")
            : "None";
    }

    const speech = document.getElementById("npcdialoguespeech");
    if (speech) {
        const style = typeof getKanojoNpcStyle === "function"
            ? getKanojoNpcStyle(npc)
            : null;
        if (style) {
            speech.style.backgroundColor = style.background;
            speech.style.borderColor = style.border;
            speech.style.borderWidth = style.borderWidth || "1px";
            speech.style.borderStyle = "solid";
        }
        const speechAction = (typeof lastSelectedActionId !== "undefined"
            && lastSelectedActionId)
            || "talktonpc";
        const speechKey = activeNpcDialogue
            ? activeNpcDialogue.speechKey
            : null;
        const line = typeof getKanojoNpcLine === "function"
            ? getKanojoNpcLine(npc, speechAction, undefined, speechKey)
            : "";
        speech.innerText = line || "Hello!";
    }

    const check = getNpcCharismaCheck(npc);
    const greetButton = document.getElementById("npcdialoguegreet");
    if (greetButton) {
        const canGreet = canGreetNpc(npc);
        greetButton.disabled = !canGreet;
        greetButton.style.opacity = canGreet ? "" : "0.45";
        greetButton.title = canGreet
            ? "Favor +" + round2(check)
                + ", Social exp +" + round2(check)
                + ", Boredom/Happiness +" + round2(check / 2) + "."
            : "Greet can be used once per game hour.";
    }

    const commonChatButton = document.getElementById("npcdialoguecommonchat");
    if (commonChatButton) {
        commonChatButton.title = "Half of Greet: Favor +" + round2(check / 2)
            + ", Social exp +" + round2(check / 2)
            + ", Boredom/Happiness +" + round2(check / 4) + ".";
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
    if (activeNpcDialogue || activeNpcChooser) return false;
    if (typeof isCombatActive === "function" && isCombatActive()) return false;
    if (typeof isTraveling === "function" && isTraveling()) {
        if (typeof logMessage === "function") {
            logMessage("You cannot talk while travelling.");
        }
        return false;
    }
    if (typeof currentTile === "undefined" || !currentTile) return false;

    const requestedTarget = npc != null;
    let target = npc || null;
    if (target && !(target instanceof Npc)) {
        target = getNpcByUid(target);
    }
    if (!target) {
        if (requestedTarget) return false;
        const candidates = getNpcsAtTile(currentTile.x, currentTile.y);
        if (candidates.length > 1) {
            return openNpcChooser(candidates);
        }
        target = candidates[0] || null;
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
        speechKey: "talk",
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

    if (!canGreetNpc(npc)) {
        if (typeof logMessage === "function") {
            logMessage("You can greet " + getNpcDisplayName(npc)
                + " only once per game hour.");
        }
        renderNpcDialogue();
        return false;
    }

    const gains = applyNpcConversationGains(npc, 1);
    if (typeof player !== "undefined" && player) {
        player.lastGreetGameHour = getCurrentGameHour();
    }
    if (activeNpcDialogue) activeNpcDialogue.speechKey = "greet";

    if (typeof logMessage === "function" && gains) {
        logMessage("You greet " + getNpcDisplayName(npc)
            + ". Favor +" + gains.favorGain
            + ", boredom +" + gains.moodGain
            + ", happiness +" + gains.moodGain + ".");
    }

    renderNpcDialogue();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}

function commonChatActiveNpc() {
    if (!activeNpcDialogue) return false;

    const npc = getActiveNpcDialogueNpc();
    if (!npc) {
        endNpcDialogue();
        return false;
    }

    const gains = applyNpcConversationGains(npc, 0.5);
    if (activeNpcDialogue) activeNpcDialogue.speechKey = "commonchat";
    if (typeof logMessage === "function" && gains) {
        logMessage("You have a common chat with " + getNpcDisplayName(npc)
            + ". Favor +" + gains.favorGain
            + ", boredom +" + gains.moodGain
            + ", happiness +" + gains.moodGain + ".");
    }

    renderNpcDialogue();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}
