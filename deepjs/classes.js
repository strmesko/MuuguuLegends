const BASE_EXP = 100;
// 100% is the baseline potential scale used by experience calculations. It is
// not a hard cap: research and minimum-potential bonuses can push it above 100.
const MAX_POTENTIAL = 100;
const MIN_POTENTIAL = 1;
const MIN_POTENTIAL_BONUS_PER_LEVEL = 1;
const STAT_POTENTIAL_DECAY = 0.90;
const SKILL_POTENTIAL_DECAY = 0.95;
let minPotentialBonusPercent = 0;
// A loaded save can replay a long offline catch-up, which may level Autism
// many times at once. Its level-up messages are hidden for that first tick.
let suppressAutismLevelLogs = false;

function getMinPotential() {
    return MIN_POTENTIAL + MAX_POTENTIAL * minPotentialBonusPercent / PERCENT;
}

function increaseMinPotential(percent) {
    minPotentialBonusPercent += percent;
    const minPotential = getMinPotential();

    CORE_STAT_NAMES.forEach(function (statName) {
        const stat = player && player[statName];
        if (stat && stat.potential < minPotential) stat.potential = minPotential;
    });
    LEARNABLE_SKILL_KEYS.forEach(function (skillName) {
        const skill = player && player[skillName];
        if (skill && skill.potential < minPotential) skill.potential = minPotential;
    });
}
const STARTING_SPEED_LEVEL = 100;
const BASE_TRAVEL_TIME_SECONDS = 5 * 60;
// Traveling skill: every level shortens tile-to-tile travel by 1% of the
// current duration. The cap keeps travel from collapsing to zero at very high
// levels (which would make traveling instant).
const TRAVEL_TIME_REDUCTION_PER_LEVEL = 0.01;
const TRAVEL_MAX_TIME_REDUCTION = 0.99;
// Walking trains the character: 1 exp per second to Speed and Traveling.
const TRAVEL_EXP_PER_SECOND = 1;
// Five visible inventory slots by default. The backing array keeps room for
// bonus slots and for items from older saves, so reducing the visible capacity
// never destroys stored items.
const INVENTORY_SLOTS = 5;
const MAX_INVENTORY_STORAGE = 1000;
const MAX_POUNCH_SLOTS = 100;
const EQUIPMENT_SLOTS = MAX_INVENTORY_STORAGE; // legacy alias for saved characters
const DEFAULT_MAX_ACTIONS = 1;
const DEFAULT_LOG_LENGTH = 25;
const DEFAULT_MAX_INVENTORY = INVENTORY_SLOTS;
const TICK_INTERVAL_MS = 1000;
const MILLISECONDS_PER_SECOND = 1000;
const EXPLORATION_COMPLETE = 100;
const SEARCH_MIN_REVEAL = 1;
const FORAGE_UNLOCK_LEVEL = 5;
const DEFAULT_RESOURCE_MULTIPLIER = 1;

// Sleepyness: sleep pressure that builds up while the character is busy.
// It grows by 1 per active action every second and is capped by the limit.
const SLEEPYNESS_LIMIT = 1000;
const SLEEPYNESS_STATUS_ICON = "fa-bed";
// Sleep becomes available above (750 - DreamMastery) sleepyness.
const SLEEP_THRESHOLD_BASE = 750;
// Above this sleepyness the character may fall asleep against their will:
// chance per second is (sleepyness - 900)%.
const FORCED_SLEEP_THRESHOLD = 900;
// Vitality can shrug off sleep pressure: 1 / sqrt(vit) chance that an
// increase of sleepyness is skipped. Never above 99%.
const SLEEPYNESS_RESIST_MAX_CHANCE = 0.99;
// Every second of sleep has a 1 / (100 - luck / 10) chance to raise the
// potential of one random skill by SleepQuality percent.
const SLEEP_POTENTIAL_CHANCE_BASE = 100;
const SLEEP_POTENTIAL_LUCK_DIVISOR = 10;
// One buff and three debuffs. They all share the same icon and differ only by
// colour. Effects are plain fractions and stack additively while active:
//   actionEffectiveness - output of timed actions (explore, search, forage,
//                         research, daydream)
//   travelTime          - tile-to-tile travel duration (- is faster)
//   staminaRegen        - stamina (SP) regeneration
// Debuffs are cumulative: at 950 both Snoozy and Sleepy are active.
const SLEEPYNESS_STATUSES = Object.freeze([
    {
        id: "energetic",
        name: "Energetic",
        kind: "buff",
        threshold: 250,
        showAbove: false,
        color: "#33cc33",
        effects: { actionEffectiveness: 0.2, travelTime: -0.2, staminaRegen: 0.5 },
    },
    {
        id: "snoozy",
        name: "Snoozy",
        kind: "debuff",
        threshold: 500,
        showAbove: true,
        color: "#ffcc00",
        // The same as Sleepy, but half as strong.
        effects: { actionEffectiveness: -0.1, travelTime: 0.1, staminaRegen: -0.25 },
    },
    {
        id: "sleepy",
        name: "Sleepy",
        kind: "debuff",
        threshold: 750,
        showAbove: true,
        color: "#ff8800",
        effects: { actionEffectiveness: -0.2, travelTime: 0.2, staminaRegen: -0.5 },
    },
    {
        id: "needs-to-sleep",
        name: "Needs to sleep",
        kind: "debuff",
        threshold: 900,
        showAbove: true,
        color: "#ff2b2b",
        // No mechanical effect yet, only the icon.
        effects: {},
    },
]);

function isSleepynessStatusActive(status, sleepyness) {
    return status.showAbove
        ? sleepyness > status.threshold
        : sleepyness < status.threshold;
}

function clampSleepyness(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return 0;
    return Math.min(SLEEPYNESS_LIMIT, numeric);
}
const RESOURCE_CATEGORIES = Object.freeze({
    Food: "food",
    Raw: "raw",
    Material: "material",
    Intermediate: "intermediate",
});

// Canonical resource tags. Tags describe what a resource can be used for
// directly, independently of the storage category it is shown in.
const RESOURCE_TAGS = Object.freeze({
    Edible: "Edible",
    Seed: "seed",
});

const POUNCH_SLOT_IDS = Object.freeze(Array.from(
    { length: MAX_POUNCH_SLOTS },
    function (_, index) {
        return index === 0 ? "pounch" : "pounch" + (index + 1);
    }
));

const EQUIPMENT_SLOT_GROUPS = Object.freeze([
    {
        id: "head",
        name: "Head & Neck",
        slots: [
            { id: "head", label: "Head", description: "A place for a helmet, hat or crown." },
            { id: "face", label: "Face", description: "A place for a mask or glasses." },
            { id: "neck", label: "Neck", description: "A place for a necklace or amulet." },
            { id: "ear1", label: "Ear I", description: "A place for an earring." },
            { id: "ear2", label: "Ear II", description: "A place for an earring." },
        ],
    },
    {
        id: "body",
        name: "Body",
        slots: [
            { id: "torso", label: "Torso", description: "A place for a shirt, robe or chest armor." },
            { id: "shoulders", label: "Shoulders", description: "A place for shoulder pads or a cape." },
            { id: "back", label: "Back", description: "A place for a backpack or cloak." },
            { id: "backpack", label: "Backpack", description: "A place for a backpack or basket." },
            { id: "belt", label: "Belt", description: "A place for a belt or pouch." },
        ],
    },
    {
        id: "arms",
        name: "Arms",
        slots: [
            { id: "arm1", label: "Arm I", description: "A stuff that you handle in right arm." },
            { id: "arm2", label: "Arm II", description: "so called left arm" },
            { id: "glove1", label: "Glove I", description: "A place for glove that you can equip to the right hand" },
            { id: "glove2", label: "Glove II", description: "A place for glove that you can equip to the left hand" },
            { id: "wrist1", label: "Wrist I", description: "A place for bracer that you can equip to the left hand" },
            { id: "wrist2", label: "Wrist II", description: "A place for bracer that you can equip to the right hand" },
        ],
    },
    {
        id: "legs",
        name: "Legs & Feet",
        slots: [
            { id: "pants", label: "Pants", description: "A place for pants, shorts or something that covers your shame." },
            { id: "legs", label: "Legs", description: "A place for pants or leg armor." },
            { id: "feet", label: "Feet", description: "A place for boots or shoes." },
            { id: "ankle1", label: "Ankle I", description: "A place for an ankle bracelet." },
            { id: "ankle2", label: "Ankle II", description: "A place for an ankle bracelet." },
        ],
    },
    {
        id: "rings",
        name: "Rings",
        slots: Array.from({ length: 10 }, function (_, index) {
            const number = index + 1;
            return { id: "ring" + number, label: "Ring " + number, description: "A place for a ring." };
        }),
    },
    {
        id: "pounch",
        name: "Pounch",
        slots: POUNCH_SLOT_IDS.map(function (slotId, index) {
            return {
                id: slotId,
                label: index === 0 ? "Pounch" : "Pounch " + (index + 1),
                description: "A place for a survival pounch.",
            };
        }),
    },
    {
        id: "cultery",
        name: "Cultery",
        slots: [
            { id: "ladle", label: "Ladle", description: "A place for a ladle." },
            { id: "fork", label: "Fork", description: "A place for a fork." },
            { id: "spoon", label: "Spoon", description: "A place for a spoon." },
            { id: "bowl", label: "Bowl", description: "A place for a bowl." },
            { id: "littlespoon", label: "Little Spoon", description: "A place for a little spoon." },
            { id: "mug", label: "Mug", description: "A place for a mug." },
            { id: "plate", label: "Plate", description: "A place for a plate." },
            { id: "pot", label: "Pot", description: "A place for a cooking pot." },
        ],
    },
]);

const EQUIPMENT_SLOT_IDS = Object.freeze(
    EQUIPMENT_SLOT_GROUPS.flatMap(function (group) {
        return group.slots.map(function (slot) {
            return slot.id;
        });
    })
);

function createEmptyEquipment() {
    const equipment = {};
    EQUIPMENT_SLOT_IDS.forEach(function (slotId) {
        equipment[slotId] = null;
    });
    return equipment;
}

// A Leaf Belt grants extra inventory slots from Rare upward. Rarity tiers are
// counted from Rare: Rare +1, RareRare +2, Unique +3, MoreUniq +4, Epic +5,
// Galaxic +6.
const LEAF_BELT_SLOT_BONUS_BY_RARITY = Object.freeze({
    "rare": 1,
    "rare-rare": 2,
    "unique": 3,
    "more-uniq": 4,
    "epic": 5,
    "galaxic": 6,
});

function getItemDefinitionForInventoryBonus(item) {
    if (!item) return null;

    if (item.definition && typeof item.definition === "object") {
        return item.definition;
    }

    if (typeof ITEM_DEFS !== "undefined" && item.itemId != null) {
        return ITEM_DEFS[item.itemId] || null;
    }

    return null;
}

function getBonusItemQuality(item, definition) {
    const rawQuality = Number(item.quality);
    return Number.isFinite(rawQuality) && rawQuality >= 0
        ? rawQuality
        : (Number(definition.quality) || 1);
}

function getBonusItemRarity(item, definition) {
    if (typeof item.rarityMultiplier === "number" && Number.isFinite(item.rarityMultiplier)) {
        return item.rarityMultiplier;
    }

    if (typeof getRarityMultiplier === "function") {
        const rarityId = typeof item.rarityId === "string"
            ? item.rarityId
            : (typeof item.rarity === "string" ? item.rarity : definition.rarity);
        return getRarityMultiplier(rarityId);
    }

    return 1;
}

function getItemInventorySlotBonus(item) {
    const definition = getItemDefinitionForInventoryBonus(item);
    if (!definition) return 0;

    const isLeafBelt = typeof ITEM_IDS !== "undefined"
        ? definition.id === ITEM_IDS.LEAF_BELT
        : definition.name === "Leaf Belt";

    if (isLeafBelt) {
        const rarity = typeof item.rarityId === "string"
            ? item.rarityId
            : (typeof item.rarity === "string" ? item.rarity : definition.rarity);
        return LEAF_BELT_SLOT_BONUS_BY_RARITY[rarity] || 0;
    }

    const isSurvivalPounch = typeof ITEM_IDS !== "undefined"
        ? definition.id === ITEM_IDS.SURVIVAL_POUNCH
        : definition.name === "Survival Pounch";
    const isStrawBasketBackpack = typeof ITEM_IDS !== "undefined"
        ? definition.id === ITEM_IDS.STRAW_BASKET_BACKPACK
        : definition.name === "Straw basket backpack";

    if (!isSurvivalPounch && !isStrawBasketBackpack) return 0;

    const quality = getBonusItemQuality(item, definition);
    const rarity = getBonusItemRarity(item, definition);

    if (isSurvivalPounch) {
        // Survival Pounch: 3 + sqrt(Quality) + Rarity, rounded to a whole number.
        return Math.max(0, Math.round(3 + Math.sqrt(quality) + rarity));
    }

    // Straw basket backpack: 10 + sqrt(Quality) * (Rarity + 1), rounded.
    return Math.max(0, Math.round(10 + Math.sqrt(quality) * (rarity + 1)));
}

function getItemPounchSlotBonus(item) {
    const definition = getItemDefinitionForInventoryBonus(item);
    if (!definition) return 0;

    const isStrawBasketBackpack = typeof ITEM_IDS !== "undefined"
        ? definition.id === ITEM_IDS.STRAW_BASKET_BACKPACK
        : definition.name === "Straw basket backpack";
    if (!isStrawBasketBackpack) return 0;

    const quality = getBonusItemQuality(item, definition);
    const rarity = getBonusItemRarity(item, definition);

    // Straw basket backpack: 2 + sqrt(Quality) + Rarity pounch slots.
    return Math.max(0, Math.round(2 + Math.sqrt(quality) + rarity));
}

function getActivePounchSlotCount(character) {
    const target = character || (typeof player !== "undefined" ? player : null);
    const backpack = target && target.equipment ? target.equipment.backpack : null;
    let bonus = getItemPounchSlotBonus(backpack);

    if (typeof getEquippedGlobalFlatBonus === "function") {
        bonus += getEquippedGlobalFlatBonus("pounchSlots", target);
    }

    return Math.min(MAX_POUNCH_SLOTS, 1 + bonus);
}

function getActivePounchSlotIds(character) {
    return POUNCH_SLOT_IDS.slice(0, getActivePounchSlotCount(character));
}

function getEquippedInventorySlotBonus(character) {
    const target = character || (typeof player !== "undefined" ? player : null);
    if (!target || !target.equipment) return 0;

    let bonus = getItemInventorySlotBonus(target.equipment.belt)
        + getItemInventorySlotBonus(target.equipment.backpack);

    if (typeof getEquippedGlobalFlatBonus === "function") {
        bonus += getEquippedGlobalFlatBonus("itemSlots", target);
    }

    getActivePounchSlotIds(target).forEach(function (slotId) {
        bonus += getItemInventorySlotBonus(target.equipment[slotId]);
    });

    return bonus;
}

function getEffectiveInventorySlots(character) {
    return Math.min(
        MAX_INVENTORY_STORAGE,
        INVENTORY_SLOTS + getEquippedInventorySlotBonus(character)
    );
}

const RESOURCE_IDS = Object.freeze({
    BLUEBERRY: 1001,
    RASPBERRY: 1002,
    CORNBERRY: 1003,
    STRAWBERRY: 1004,
    HONEYSUCKLE: 1005,
    WATERMELON: 1006,
    SEABUCKTHORN: 1007,
    ROCKS: 1,
    BRANCHES: 2,
    STICKS: 3,
    LEAVES: 4,
    FLINT: 5,
    GRASS: 6,
    FIBERS: 7,
    DIRT: 8,
    CLAY: 9,
    FERTILE_SOIL: 10,
    PEAT: 11,
    TAR: 12,
    ICE: 13,
    IRON_ORE: 14,
    COPPER_ORE: 15,
    GOLD_ORE: 16,
    MARBLE_SLAB: 17,
    OBSIDIAN_CHUNKS: 18,
    CORALS: 19,
    TIN_ORE: 20,
    SAND: 21,
    SHAFTS: 22,
    HANDLES: 23,
    BUTTON_MUSHROOM: 24,
    OYSTER_MUSHROOM: 25,
    CHANTERELLE: 26,
    PORCINI: 27,
    SHIITAKE: 28,
    MOREL: 29,
    HONEY_FUNGUS: 30,
    RUSSULA: 31,
    BOLETE: 32,
    MEADOW_MUSHROOM: 33,
    BLACKBERRY: 34,
    LINGONBERRY: 35,
    CLOUDBERRY: 36,
    GOOSEBERRY: 37,
    ELDERBERRY: 38,
    CURRANT: 39,
    CRANBERRY: 40,
    MULBERRY: 41,
    BANANAS: 42,
    COCONUTS: 43,
    APPLES: 44,
    PEARS: 45,
    ORANGES: 46,
    LEMONS: 47,
    LIMES: 48,
    CHERRIES: 49,
    PLUMS: 50,
    PEACHES: 51,
    APRICOTS: 52,
    FIGS: 53,
    POMEGRANATES: 54,
    OLIVES: 55,
    MANGOES: 56,
    PAPAYAS: 57,
    AVOCADOS: 58,
    GRAPEFRUITS: 59,
    PERSIMMONS: 60,
    QUINCES: 61,
    GUAVAS: 62,
    LYCHEES: 63,
    DRAGONFRUITS: 64,
    MULBERRIES: 65,
    ROWAN_BERRIES: 66,
    BIRD_CHERRIES: 67,
    MEDLARS: 68,
    SERVICEBERRIES: 69,
    WALNUTS: 70,
    HAZELNUTS: 71,
    ALMONDS: 72,
    CHESTNUTS: 73,
    PECANS: 74,
    PISTACHIOS: 75,
    CASHEWS: 76,
    MACADAMIAS: 77,
    BRAZIL_NUTS: 78,
    HICKORY_NUTS: 79,
    BEECHNUTS: 80,
    ACORNS: 81,
    PINE_NUTS: 82,
    ASH: 83,
    WOODEN_LOGS: 84,
    WOODEN_PLANK: 85,
    WOODEN_BEAMS: 86,
    MORTAR: 87,
    LIMESTONE: 88,
    COAL: 89,
    ROCKSALT: 90,
    HEAT_UNITS: 91,
    COPPER_BAR: 92,
    IRON_BAR: 93,
    STEEL_BAR: 94,
    GOLD_BAR: 95,
    TIN_BAR: 96,
    BRONZE_BAR: 97,
    IRON_NAILS: 98,
    COPPER_NAILS: 99,
    TIN_NAILS: 100,
    BRONZE_NAILS: 101,
    STEEL_NAILS: 102,
    GOLD_NAILS: 103,
    IRON_RIVETS: 104,
    COPPER_RIVETS: 105,
    TIN_RIVETS: 106,
    BRONZE_RIVETS: 107,
    STEEL_RIVETS: 108,
    GOLD_RIVETS: 109,
    IRON_TUBES: 110,
    COPPER_TUBES: 111,
    TIN_TUBES: 112,
    BRONZE_TUBES: 113,
    STEEL_TUBES: 114,
    GOLD_TUBES: 115,
    IRON_SHEET_PLATES: 116,
    COPPER_SHEET_PLATES: 117,
    TIN_SHEET_PLATES: 118,
    BRONZE_SHEET_PLATES: 119,
    STEEL_SHEET_PLATES: 120,
    GOLD_SHEET_PLATES: 121,
    IRON_CHAIN: 122,
    COPPER_CHAIN: 123,
    TIN_CHAIN: 124,
    BRONZE_CHAIN: 125,
    STEEL_CHAIN: 126,
    GOLD_CHAIN: 127,
});

const RESOURCE_DEFS = {
    [RESOURCE_IDS.BLUEBERRY]: { name: "blueberry", weight: 4, unitType: "kg", description: "Yummy black pearls of the forest", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.RASPBERRY]: { name: "raspberry", weight: 5, unitType: "kg", description: "Crimson honeycomb of pleasure", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CORNBERRY]: { name: "cornberry", weight: 5, unitType: "kg", description: "Because YOU NEED CORN. Imagine...", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.STRAWBERRY]: { name: "strawberry", weight: 5, unitType: "kg", description: "Tasty red Bolid of vitamins. Yum!", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.HONEYSUCKLE]: { name: "honeysuckle", weight: 5, unitType: "kg", description: "Are this taste of epilepsy?", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.SEABUCKTHORN]: { name: "seabuckthorn", weight: 5, unitType: "kg", description: "Amber abyss of sour", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.WATERMELON]: { name: "watermelon", weight: 5, unitType: "kg", description: "KFC AN WATERMELONS. Yeah, watermelon are berry too.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BLACKBERRY]: { name: "Blackberry", weight: 5, unitType: "kg", description: "Dark clusters of sweet-tart berries guarded by thorns.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.LINGONBERRY]: { name: "Lingonberry", weight: 5, unitType: "kg", description: "Tiny tart red berries that love cool forests.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CLOUDBERRY]: { name: "Cloudberry", weight: 5, unitType: "kg", description: "Golden amber berries from the damp north.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.GOOSEBERRY]: { name: "Gooseberry", weight: 5, unitType: "kg", description: "Green translucent berries with a sharp tang.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.ELDERBERRY]: { name: "Elderberry", weight: 5, unitType: "kg", description: "Tiny dark berries in flat clusters.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CURRANT]: { name: "Currant", weight: 5, unitType: "kg", description: "Bright translucent berries in dangling strings.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CRANBERRY]: { name: "Cranberry", weight: 5, unitType: "kg", description: "Sour red berries from wet, boggy ground.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MULBERRY]: { name: "Mulberry", weight: 5, unitType: "kg", description: "Sweet dark berries that stain your fingers.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BUTTON_MUSHROOM]: { name: "Button Mushroom", weight: 2, unitType: "kg", description: "A humble edible mushroom. Safe and filling.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.OYSTER_MUSHROOM]: { name: "Oyster Mushroom", weight: 2, unitType: "kg", description: "Soft fan-shaped mushrooms growing on wood.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CHANTERELLE]: { name: "Chanterelle", weight: 2, unitType: "kg", description: "Golden funnel-shaped mushrooms with a peppery aroma.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PORCINI]: { name: "Porcini", weight: 3, unitType: "kg", description: "A prized meaty mushroom with a nutty taste.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.SHIITAKE]: { name: "Shiitake", weight: 2, unitType: "kg", description: "An earthy mushroom that loves old wood.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MOREL]: { name: "Morel", weight: 2, unitType: "kg", description: "A honeycombed spring mushroom with a rich flavour.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.HONEY_FUNGUS]: { name: "Honey Fungus", weight: 2, unitType: "kg", description: "Clustered amber mushrooms growing on trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.RUSSULA]: { name: "Russula", weight: 2, unitType: "kg", description: "A brittle cap with a bright, peppery bite.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BOLETE]: { name: "Bolete", weight: 3, unitType: "kg", description: "A sturdy mushroom with a spongy underside.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MEADOW_MUSHROOM]: { name: "Meadow Mushroom", weight: 2, unitType: "kg", description: "A common field mushroom with a mild taste.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BANANAS]: { name: "Bananas", weight: 4, unitType: "kg", description: "Sweet yellow fruit growing in bunches on banana trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.COCONUTS]: { name: "Coconuts", weight: 4, unitType: "kg", description: "Hard-shelled tropical fruit with sweet water and white flesh.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.APPLES]: { name: "Apples", weight: 4, unitType: "kg", description: "Crisp fruit from apple trees. A classic survivor's snack.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PEARS]: { name: "Pears", weight: 4, unitType: "kg", description: "Soft, sweet fruit from pear trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.ORANGES]: { name: "Oranges", weight: 4, unitType: "kg", description: "Bright citrus fruit from orange trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.LEMONS]: { name: "Lemons", weight: 4, unitType: "kg", description: "Sour yellow citrus fruit from lemon trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.LIMES]: { name: "Limes", weight: 4, unitType: "kg", description: "Small green citrus fruit from lime trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CHERRIES]: { name: "Cherries", weight: 4, unitType: "kg", description: "Small red stone fruit from cherry trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PLUMS]: { name: "Plums", weight: 4, unitType: "kg", description: "Juicy purple stone fruit from plum trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PEACHES]: { name: "Peaches", weight: 4, unitType: "kg", description: "Soft fuzzy stone fruit from peach trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.APRICOTS]: { name: "Apricots", weight: 4, unitType: "kg", description: "Small golden stone fruit from apricot trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.FIGS]: { name: "Figs", weight: 4, unitType: "kg", description: "Sweet soft fruit from fig trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.POMEGRANATES]: { name: "Pomegranates", weight: 4, unitType: "kg", description: "Red fruit full of juicy seeds from pomegranate trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.OLIVES]: { name: "Olives", weight: 4, unitType: "kg", description: "Small bitter fruit from olive trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MANGOES]: { name: "Mangoes", weight: 4, unitType: "kg", description: "Sweet tropical fruit from mango trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PAPAYAS]: { name: "Papayas", weight: 4, unitType: "kg", description: "Soft orange tropical fruit from papaya trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.AVOCADOS]: { name: "Avocados", weight: 4, unitType: "kg", description: "Creamy green fruit from avocado trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.GRAPEFRUITS]: { name: "Grapefruits", weight: 4, unitType: "kg", description: "Large bitter citrus fruit from grapefruit trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PERSIMMONS]: { name: "Persimmons", weight: 4, unitType: "kg", description: "Orange fruit from persimmon trees. Sweet when ripe.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.QUINCES]: { name: "Quinces", weight: 4, unitType: "kg", description: "Hard fragrant fruit from quince trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.GUAVAS]: { name: "Guavas", weight: 4, unitType: "kg", description: "Fragrant tropical fruit from guava trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.LYCHEES]: { name: "Lychees", weight: 4, unitType: "kg", description: "Small sweet fruit from lychee trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.DRAGONFRUITS]: { name: "Dragonfruits", weight: 4, unitType: "kg", description: "Bright tropical fruit from dragonfruit trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MULBERRIES]: { name: "Mulberries", weight: 4, unitType: "kg", description: "Sweet dark fruit from mulberry trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.ROWAN_BERRIES]: { name: "Rowan Berries", weight: 4, unitType: "kg", description: "Tart red berries from rowan trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BIRD_CHERRIES]: { name: "Bird Cherries", weight: 4, unitType: "kg", description: "Small dark fruit from bird cherry trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MEDLARS]: { name: "Medlars", weight: 4, unitType: "kg", description: "Brown fruit from medlar trees. Best after frost.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.SERVICEBERRIES]: { name: "Serviceberries", weight: 4, unitType: "kg", description: "Small purple fruit from service trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.WALNUTS]: { name: "Walnuts", weight: 4, unitType: "kg", description: "Hard-shelled nuts from walnut trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.HAZELNUTS]: { name: "Hazelnuts", weight: 4, unitType: "kg", description: "Small round nuts from hazelnut trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.ALMONDS]: { name: "Almonds", weight: 4, unitType: "kg", description: "Oval nuts from almond trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CHESTNUTS]: { name: "Chestnuts", weight: 4, unitType: "kg", description: "Starchy nuts from chestnut trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PECANS]: { name: "Pecans", weight: 4, unitType: "kg", description: "Sweet rich nuts from pecan trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PISTACHIOS]: { name: "Pistachios", weight: 4, unitType: "kg", description: "Green nuts from pistachio trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.CASHEWS]: { name: "Cashews", weight: 4, unitType: "kg", description: "Curved nuts from cashew trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.MACADAMIAS]: { name: "Macadamias", weight: 4, unitType: "kg", description: "Hard round nuts from macadamia trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BRAZIL_NUTS]: { name: "Brazil Nuts", weight: 4, unitType: "kg", description: "Large oily nuts from Brazil nut trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.HICKORY_NUTS]: { name: "Hickory Nuts", weight: 4, unitType: "kg", description: "Hard-shelled nuts from hickory trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.BEECHNUTS]: { name: "Beechnuts", weight: 4, unitType: "kg", description: "Tiny triangular nuts from beech trees.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.ACORNS]: { name: "Acorns", weight: 4, unitType: "kg", description: "Bitter nuts from oak trees. Edible when prepared.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.PINE_NUTS]: { name: "Pine Nuts", weight: 4, unitType: "kg", description: "Small seeds from pine cones.", category: RESOURCE_CATEGORIES.Food },
    [RESOURCE_IDS.ROCKS]: { name: "Rocks", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.BRANCHES]: { name: "Branches", weight: 0.5, unitType: "", description: "just light version of branch", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.STICKS]: { name: "Sticks", weight: 2, unitType: "", description: "A big stick", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.LEAVES]: { name: "Leaves", weight: 0.01, unitType: "kg", description: "Kinda coverable. Not edible, i say IT'S NOT EDIBLE", category: RESOURCE_CATEGORIES.Raw },
    // Flint is a full copy of Rocks, only its forage difficulty differs.
    [RESOURCE_IDS.FLINT]: { name: "Flint", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    // Grass copies the Leaves parameters; it is foraged at difficulty 1.
    [RESOURCE_IDS.GRASS]: { name: "Grass", weight: 0.01, unitType: "kg", description: "Directly stolen from herbivores", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.FIBERS]: { name: "Fibers", weight: 0.01, unitType: "kg", description: "You slaugher so many grass for that...", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.SHAFTS]: { name: "Shafts", weight: 0.01, unitType: "kg", description: "Sticks cut into straight wooden shafts. The base for many tools.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.HANDLES]: { name: "Handles", weight: 0.01, unitType: "kg", description: "Shafts shaped into comfortable wooden handles for tools.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.ASH]: { name: "Ash", weight: 0.01, unitType: "kg", description: "Fine grey ash left behind by a burning campfire. Alchemical base.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.WOODEN_LOGS]: { name: "Wooden logs", weight: 2, unitType: "kg", description: "Freshly cut logs. The raw wood behind every proper timber project.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.WOODEN_PLANK]: { name: "Wooden Plank", weight: 0.5, unitType: "kg", description: "A smooth plank planed from a wooden log. The base for advanced carpentry.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.WOODEN_BEAMS]: { name: "Wooden Beams", weight: 2, unitType: "kg", description: "Heavy squared timber beams. Essential for sturdy frames and construction.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.MORTAR]: { name: "Mortar", weight: 2, unitType: "kg", description: "A thick grey binding paste made from sand, clay and water. Essential for masonry.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.LIMESTONE]: { name: "Limestone", weight: 2, unitType: "", description: "Pale sedimentary stone. A useful source of lime for masonry and alchemy.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.COAL]: { name: "Coal", weight: 2, unitType: "", description: "Dark combustible stone. Burns hot and long.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.ROCKSALT]: { name: "Rocksalt", weight: 2, unitType: "", description: "Coarse crystalline salt mined from ancient deposits.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.HEAT_UNITS]: { name: "Heat Units", weight: 0.01, unitType: "", description: "Stored furnace heat, measured in abstract units. Needed for smelting ore.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.COPPER_BAR]: { name: "Copper Bar", weight: 2, unitType: "kg", description: "A refined copper bar, ready for smithing.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.IRON_BAR]: { name: "Iron Bar", weight: 2, unitType: "kg", description: "A refined iron bar, ready for smithing.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.STEEL_BAR]: { name: "Steel Bar", weight: 2, unitType: "kg", description: "A hard bar of refined steel.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.GOLD_BAR]: { name: "Gold Bar", weight: 2, unitType: "kg", description: "A gleaming bar of refined gold.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.TIN_BAR]: { name: "Tin Bar", weight: 2, unitType: "kg", description: "A soft bar of refined tin.", category: RESOURCE_CATEGORIES.Intermediate },
    [RESOURCE_IDS.BRONZE_BAR]: { name: "Bronze Bar", weight: 2, unitType: "kg", description: "A bar of bronze, an alloy of copper and tin.", category: RESOURCE_CATEGORIES.Intermediate },
    // Digging resources are full copies of Rocks; only their names differ.
    [RESOURCE_IDS.DIRT]: { name: "Dirt", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.CLAY]: { name: "Clay", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.FERTILE_SOIL]: { name: "Fertile Soil", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.PEAT]: { name: "Peat", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.TAR]: { name: "Tar", weight: 2, unitType: "", description: "Common rocks which can be founded everywhere. Yeah it's somewhat heavy", category: RESOURCE_CATEGORIES.Raw },
    // Mining resources are tied to the matching SPACE_ELEMENT_NAMES.
    [RESOURCE_IDS.ICE]: { name: "Ice", weight: 2, unitType: "", description: "Frozen water. Cold, clear and slippery.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.IRON_ORE]: { name: "Iron Ore", weight: 2, unitType: "", description: "Rock laced with iron veins.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.COPPER_ORE]: { name: "Copper Ore", weight: 2, unitType: "", description: "Rock laced with copper veins.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.GOLD_ORE]: { name: "Gold Ore", weight: 2, unitType: "", description: "Rock sparkling with gold veins.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.MARBLE_SLAB]: { name: "Marble Slab", weight: 2, unitType: "", description: "A smooth slab of pale marble.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.OBSIDIAN_CHUNKS]: { name: "Obsidian Chunks", weight: 2, unitType: "", description: "Sharp black shards of volcanic glass.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.CORALS]: { name: "Corals", weight: 2, unitType: "", description: "Colorful fragments of coral.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.TIN_ORE]: { name: "Tin Ore", weight: 2, unitType: "", description: "Rock laced with tin veins.", category: RESOURCE_CATEGORIES.Raw },
    [RESOURCE_IDS.SAND]: { name: "Sand", weight: 2, unitType: "", description: "Loose grains of sand. Warm, dry and everywhere.", category: RESOURCE_CATEGORIES.Raw },
};

// Smithing components come in six metals. The sprites and resource folder are
// shared by the whole family, while the display names include the metal.
const SMITHING_METALS = Object.freeze([
    Object.freeze({
        name: "Iron",
        ids: Object.freeze([
            RESOURCE_IDS.IRON_NAILS,
            RESOURCE_IDS.IRON_RIVETS,
            RESOURCE_IDS.IRON_TUBES,
            RESOURCE_IDS.IRON_SHEET_PLATES,
            RESOURCE_IDS.IRON_CHAIN,
        ]),
    }),
    Object.freeze({
        name: "Copper",
        ids: Object.freeze([
            RESOURCE_IDS.COPPER_NAILS,
            RESOURCE_IDS.COPPER_RIVETS,
            RESOURCE_IDS.COPPER_TUBES,
            RESOURCE_IDS.COPPER_SHEET_PLATES,
            RESOURCE_IDS.COPPER_CHAIN,
        ]),
    }),
    Object.freeze({
        name: "Tin",
        ids: Object.freeze([
            RESOURCE_IDS.TIN_NAILS,
            RESOURCE_IDS.TIN_RIVETS,
            RESOURCE_IDS.TIN_TUBES,
            RESOURCE_IDS.TIN_SHEET_PLATES,
            RESOURCE_IDS.TIN_CHAIN,
        ]),
    }),
    Object.freeze({
        name: "Bronze",
        ids: Object.freeze([
            RESOURCE_IDS.BRONZE_NAILS,
            RESOURCE_IDS.BRONZE_RIVETS,
            RESOURCE_IDS.BRONZE_TUBES,
            RESOURCE_IDS.BRONZE_SHEET_PLATES,
            RESOURCE_IDS.BRONZE_CHAIN,
        ]),
    }),
    Object.freeze({
        name: "Steel",
        ids: Object.freeze([
            RESOURCE_IDS.STEEL_NAILS,
            RESOURCE_IDS.STEEL_RIVETS,
            RESOURCE_IDS.STEEL_TUBES,
            RESOURCE_IDS.STEEL_SHEET_PLATES,
            RESOURCE_IDS.STEEL_CHAIN,
        ]),
    }),
    Object.freeze({
        name: "Gold",
        ids: Object.freeze([
            RESOURCE_IDS.GOLD_NAILS,
            RESOURCE_IDS.GOLD_RIVETS,
            RESOURCE_IDS.GOLD_TUBES,
            RESOURCE_IDS.GOLD_SHEET_PLATES,
            RESOURCE_IDS.GOLD_CHAIN,
        ]),
    }),
]);

const SMITHING_PARTS = Object.freeze([
    Object.freeze({ name: "Nails", weight: 0.1, unitType: "kg", suffix: "for fastening wood, plates and fittings." }),
    Object.freeze({ name: "Rivets", weight: 0.1, unitType: "kg", suffix: "for joining metal plates and frames." }),
    Object.freeze({ name: "Tubes", weight: 0.5, unitType: "kg", suffix: "for pipes, frames and mechanisms." }),
    Object.freeze({ name: "Sheet Plates", weight: 1, unitType: "kg", suffix: "for panels, armor and machine parts." }),
    Object.freeze({ name: "Chain", weight: 0.5, unitType: "kg", suffix: "for pulling, lifting and securing heavy loads." }),
]);

const SMITHING_RESOURCE_IDS = [
    RESOURCE_IDS.HEAT_UNITS,
    RESOURCE_IDS.COPPER_BAR,
    RESOURCE_IDS.IRON_BAR,
    RESOURCE_IDS.STEEL_BAR,
    RESOURCE_IDS.GOLD_BAR,
    RESOURCE_IDS.TIN_BAR,
    RESOURCE_IDS.BRONZE_BAR,
];

SMITHING_METALS.forEach(function (metal) {
    SMITHING_PARTS.forEach(function (part, index) {
        const resourceId = metal.ids[index];
        RESOURCE_DEFS[resourceId] = Object.freeze({
            name: metal.name + " " + part.name,
            weight: part.weight,
            unitType: part.unitType,
            description: metal.name + " " + part.name.toLowerCase() + " " + part.suffix,
            category: RESOURCE_CATEGORIES.Intermediate,
        });
        SMITHING_RESOURCE_IDS.push(resourceId);
    });
});

Object.freeze(SMITHING_RESOURCE_IDS);

// --- herbs -----------------------------------------------------------------
// Every herb is a normal resource that can be gathered with Forage. Whether a
// herb can be found is decided by the current tile's biome id and temperature;
// `biomes` lists the tile types and `tempMin`/`tempMax` the tile temperature
// range (world temperature, roughly -2..2).
const HERB_USE = Object.freeze({
    Edible: "edible",
    Medical: "medical",
    Spice: "spice",
    Alchemical: "alchemical",
    Magical: "magical",
});

const HERB_USE_META = Object.freeze({
    [HERB_USE.Edible]: {
        label: "Edible",
        category: RESOURCE_CATEGORIES.Food,
        description: "A wild edible herb. Chewing it fills the belly and lifts the spirits.",
        tastymeter: 6,
    },
    [HERB_USE.Medical]: {
        label: "Medical",
        category: RESOURCE_CATEGORIES.Raw,
        description: "A medicinal herb. Herbalists prize it for its healing properties.",
        tastymeter: 2,
    },
    [HERB_USE.Spice]: {
        label: "Spice",
        category: RESOURCE_CATEGORIES.Raw,
        description: "An aromatic spice herb. Makes bland survival food taste like a meal.",
        tastymeter: 8,
    },
    [HERB_USE.Alchemical]: {
        label: "Alchemical",
        category: RESOURCE_CATEGORIES.Intermediate,
        description: "An alchemical herb. Reagents like this are the backbone of every proper concoction.",
        tastymeter: 1,
    },
    [HERB_USE.Magical]: {
        label: "Magical",
        category: RESOURCE_CATEGORIES.Intermediate,
        description: "A magical herb humming with faint power. Alchemists would pay dearly for it.",
        tastymeter: 1,
    },
});

const HERB_DEFS = [];

function registerHerb(id, name, use, biomes, tempMin, tempMax, difficulty, amount, weight) {
    const meta = HERB_USE_META[use];
    const definition = {
        id: id,
        name: name,
        use: use,
        useLabel: meta.label,
        biomes: Object.freeze((biomes || []).slice()),
        tempMin: tempMin,
        tempMax: tempMax,
        difficulty: difficulty,
        amount: amount,
        weight: weight || 1,
        description: meta.description,
        tastymeter: meta.tastymeter,
    };

    RESOURCE_DEFS[id] = {
        name: name,
        weight: 0.01,
        unitType: "kg",
        description: meta.description,
        category: meta.category,
        herb: true,
        herbUse: use,
        herbBiomes: definition.biomes,
        herbTempMin: tempMin,
        herbTempMax: tempMax,
        Tastymeter: meta.tastymeter,
    };
    HERB_DEFS.push(Object.freeze(definition));
}

// Edible herbs
registerHerb(3001, "Sassafras", HERB_USE.Edible, [4, 5, 11, 89, 91], 0.0, 0.7, 8, 0.02);
registerHerb(3002, "Oregano", HERB_USE.Edible, [4, 7, 11, 91], 0.0, 0.7, 8, 0.02);
registerHerb(3003, "Wild Basil", HERB_USE.Edible, [4, 11, 19, 91], 0.3, 1.2, 10, 0.02);
registerHerb(3004, "Thyme", HERB_USE.Edible, [7, 10, 11, 91], 0.2, 1.2, 10, 0.02);
registerHerb(3005, "Sage", HERB_USE.Edible, [7, 10, 11, 91], 0.2, 1.0, 10, 0.02);
registerHerb(3006, "Rosemary", HERB_USE.Edible, [7, 10, 19], 0.4, 1.4, 12, 0.02);
registerHerb(3007, "Mint", HERB_USE.Edible, [4, 5, 14, 20, 91], -0.2, 0.9, 8, 0.02);
registerHerb(3008, "Lemon Balm", HERB_USE.Edible, [4, 5, 91], 0.0, 0.7, 10, 0.02);
registerHerb(3009, "Chamomile", HERB_USE.Edible, [4, 11, 13, 91], -0.5, 0.8, 7, 0.02);
registerHerb(3010, "Dandelion", HERB_USE.Edible, [4, 5, 11, 13, 91], -0.9, 0.9, 6, 0.02);
registerHerb(3011, "Sorrel", HERB_USE.Edible, [5, 6, 12, 89], -0.9, 0.5, 9, 0.02);
registerHerb(3012, "Wild Garlic", HERB_USE.Edible, [5, 6, 89, 90], -0.5, 0.5, 12, 0.02);
registerHerb(3013, "Ramps", HERB_USE.Edible, [5, 6, 89, 90], -0.5, 0.5, 14, 0.02);
registerHerb(3014, "Watercress", HERB_USE.Edible, [14, 20, 86], -0.5, 1.0, 10, 0.02);
registerHerb(3015, "Chickweed", HERB_USE.Edible, [4, 5, 13, 91], -1.0, 0.7, 6, 0.02);
registerHerb(3016, "Wood Sorrel", HERB_USE.Edible, [5, 6, 89], -0.5, 0.7, 8, 0.02);
registerHerb(3017, "Purslane", HERB_USE.Edible, [10, 11, 19], 0.5, 1.5, 9, 0.02);
registerHerb(3018, "Fennel", HERB_USE.Edible, [4, 7, 11, 91], 0.1, 0.9, 10, 0.02);
registerHerb(3019, "Caraway", HERB_USE.Edible, [4, 11, 91], -0.2, 0.7, 9, 0.02);
registerHerb(3020, "Lovage", HERB_USE.Edible, [5, 7, 91], -0.5, 0.6, 11, 0.02);
registerHerb(3021, "Sweet Cicely", HERB_USE.Edible, [5, 6, 89], -0.7, 0.5, 12, 0.02);
registerHerb(3022, "Borage", HERB_USE.Edible, [3, 4, 91], 0.0, 0.8, 9, 0.02);
registerHerb(3023, "Marjoram", HERB_USE.Edible, [7, 10, 11], 0.3, 1.2, 11, 0.02);
registerHerb(3024, "Tarragon", HERB_USE.Edible, [7, 11, 91], 0.1, 1.0, 11, 0.02);

// Medical herbs
registerHerb(3025, "Plantain", HERB_USE.Medical, [4, 5, 7, 11, 91], -0.7, 1.0, 5, 0.02);
registerHerb(3026, "Belladonna", HERB_USE.Medical, [5, 6, 89, 90], -0.3, 0.6, 20, 0.02);
registerHerb(3027, "Yarrow", HERB_USE.Medical, [4, 7, 11, 13, 91], -0.9, 0.9, 8, 0.02);
registerHerb(3028, "St. John's Wort", HERB_USE.Medical, [4, 5, 7, 11, 91], -0.4, 0.9, 10, 0.02);
registerHerb(3029, "Echinacea", HERB_USE.Medical, [4, 11, 91], 0.0, 0.8, 12, 0.02);
registerHerb(3030, "Goldenseal", HERB_USE.Medical, [5, 6, 89], -0.5, 0.5, 18, 0.02);
registerHerb(3031, "Comfrey", HERB_USE.Medical, [4, 5, 7, 14], -0.5, 0.9, 10, 0.02);
registerHerb(3032, "Calendula", HERB_USE.Medical, [3, 4, 11, 91], 0.0, 0.9, 9, 0.02);
registerHerb(3033, "Valerian", HERB_USE.Medical, [5, 14, 20], -0.6, 0.6, 14, 0.02);
registerHerb(3034, "Feverfew", HERB_USE.Medical, [4, 5, 7, 91], -0.4, 0.8, 10, 0.02);
registerHerb(3035, "Nettle", HERB_USE.Medical, [4, 5, 11, 13, 91], -0.9, 0.9, 6, 0.02);
registerHerb(3036, "Burdock", HERB_USE.Medical, [4, 5, 11, 91], -0.7, 0.8, 8, 0.02);
registerHerb(3037, "Mullein", HERB_USE.Medical, [4, 7, 10, 11], -0.5, 1.1, 9, 0.02);
registerHerb(3038, "Coltsfoot", HERB_USE.Medical, [4, 11, 13, 18], -1.0, 0.6, 8, 0.02);
registerHerb(3039, "Marshmallow", HERB_USE.Medical, [4, 14, 20], -0.5, 0.9, 12, 0.02);
registerHerb(3040, "Witch Hazel", HERB_USE.Medical, [5, 6, 89, 90], -0.6, 0.5, 17, 0.02);
registerHerb(3041, "Boneset", HERB_USE.Medical, [5, 14, 20], -0.5, 0.7, 13, 0.02);
registerHerb(3042, "Hyssop", HERB_USE.Medical, [7, 10, 11], 0.2, 1.1, 11, 0.02);
registerHerb(3043, "Rue", HERB_USE.Medical, [7, 10, 19], 0.4, 1.3, 14, 0.02);
registerHerb(3044, "Wormwood", HERB_USE.Medical, [7, 10, 11, 13], 0.0, 1.2, 12, 0.02);
registerHerb(3045, "Tansy", HERB_USE.Medical, [4, 7, 11, 91], -0.3, 0.9, 10, 0.02);

// Spice herbs
registerHerb(3046, "Dill", HERB_USE.Spice, [4, 5, 91], -0.3, 0.7, 7, 0.02);
registerHerb(3047, "Coriander", HERB_USE.Spice, [3, 4, 11, 91], 0.2, 1.1, 8, 0.02);
registerHerb(3048, "Cumin", HERB_USE.Spice, [10, 11, 19], 0.5, 1.4, 9, 0.02);
registerHerb(3049, "Chili Pepper", HERB_USE.Spice, [10, 15, 19], 0.6, 1.6, 12, 0.02);
registerHerb(3050, "Saffron", HERB_USE.Spice, [10, 19], 0.7, 1.5, 24, 0.01);
registerHerb(3051, "Turmeric", HERB_USE.Spice, [15, 19], 0.8, 1.6, 18, 0.02);
registerHerb(3052, "Ginger", HERB_USE.Spice, [15, 19], 0.8, 1.6, 16, 0.02);
registerHerb(3053, "Cardamom", HERB_USE.Spice, [15], 0.8, 1.6, 20, 0.02);
registerHerb(3054, "Anise", HERB_USE.Spice, [4, 11, 19], 0.2, 1.1, 10, 0.02);
registerHerb(3055, "Mustard", HERB_USE.Spice, [4, 11, 91], 0.0, 0.9, 7, 0.02);
registerHerb(3056, "Horseradish", HERB_USE.Spice, [4, 5, 91], -0.6, 0.7, 12, 0.02);
registerHerb(3057, "Juniper", HERB_USE.Spice, [7, 8, 12, 13], -1.2, 0.2, 14, 0.02);
registerHerb(3058, "Bay Laurel", HERB_USE.Spice, [7, 19], 0.4, 1.3, 16, 0.02);
registerHerb(3059, "Paprika", HERB_USE.Spice, [10, 15, 19], 0.6, 1.5, 12, 0.02);

// Alchemical herbs
registerHerb(3060, "Nightshade", HERB_USE.Alchemical, [5, 6, 89, 90], -0.4, 0.7, 20, 0.02);
registerHerb(3061, "Henbane", HERB_USE.Alchemical, [4, 7, 10, 11], 0.1, 1.0, 18, 0.02);
registerHerb(3062, "Wolfsbane", HERB_USE.Alchemical, [7, 8, 12, 13], -1.2, 0.1, 22, 0.02);
registerHerb(3063, "Foxglove", HERB_USE.Alchemical, [5, 6, 89, 90], -0.5, 0.6, 18, 0.02);
registerHerb(3064, "Hemlock", HERB_USE.Alchemical, [5, 6, 14, 89], -0.4, 0.7, 20, 0.02);
registerHerb(3065, "Mugwort", HERB_USE.Alchemical, [4, 5, 7, 11, 91], -0.6, 0.9, 12, 0.02);
registerHerb(3066, "Poppy", HERB_USE.Alchemical, [4, 7, 11, 91], 0.0, 1.0, 14, 0.02);
registerHerb(3067, "Datura", HERB_USE.Alchemical, [10, 15, 19], 0.6, 1.5, 22, 0.02);
registerHerb(3068, "Bloodroot", HERB_USE.Alchemical, [5, 6, 89, 90], -0.5, 0.5, 20, 0.02);
registerHerb(3069, "Bittercress", HERB_USE.Alchemical, [5, 14, 20], -0.4, 0.7, 12, 0.02);
registerHerb(3070, "Copperleaf", HERB_USE.Alchemical, [7, 96, 98], -0.2, 1.0, 16, 0.02);
registerHerb(3071, "Ironweed", HERB_USE.Alchemical, [7, 8, 98], -0.8, 0.8, 16, 0.02);
registerHerb(3072, "Saltmoss", HERB_USE.Alchemical, [3, 18, 92], -0.5, 1.2, 12, 0.02);
registerHerb(3073, "Tarbloom", HERB_USE.Alchemical, [14, 97], 0.2, 1.0, 18, 0.02);
registerHerb(3074, "Ashen Herb", HERB_USE.Alchemical, [7, 87, 93], 0.0, 1.4, 18, 0.02);

// Magical herbs
registerHerb(3075, "Mandrake", HERB_USE.Magical, [6, 86, 89, 90], -0.5, 0.9, 30, 0.01);
registerHerb(3076, "Moonflower", HERB_USE.Magical, [6, 86, 90], -0.6, 0.8, 26, 0.01);
registerHerb(3077, "Starflower", HERB_USE.Magical, [9, 86, 90], -1.0, 0.6, 28, 0.01);
registerHerb(3078, "Mana Thistle", HERB_USE.Magical, [86, 90], -0.5, 1.0, 24, 0.01);
registerHerb(3079, "Whispergrass", HERB_USE.Magical, [6, 86, 90], -0.7, 0.7, 22, 0.01);
registerHerb(3080, "Silverleaf", HERB_USE.Magical, [9, 86, 90], -1.0, 0.6, 28, 0.01);
registerHerb(3081, "Dreamroot", HERB_USE.Magical, [6, 86, 90], -0.6, 0.8, 26, 0.01);
registerHerb(3082, "Ghostbloom", HERB_USE.Magical, [6, 86, 93], -0.8, 0.8, 26, 0.01);
registerHerb(3083, "Sunspire", HERB_USE.Magical, [15, 19, 86], 0.5, 1.6, 24, 0.01);
registerHerb(3084, "Voidbloom", HERB_USE.Magical, [86, 87, 93], 0.2, 1.6, 30, 0.01);
registerHerb(3085, "Elven Reed", HERB_USE.Magical, [20, 86, 90], -0.3, 0.9, 20, 0.01);
registerHerb(3086, "Phoenix Fern", HERB_USE.Magical, [15, 86, 87], 0.3, 1.6, 28, 0.01);

const HERB_RESOURCE_IDS = Object.freeze(HERB_DEFS.map(function (herb) {
    return herb.id;
}));

const HERB_EDIBLE_RESOURCE_IDS = Object.freeze(HERB_DEFS
    .filter(function (herb) { return herb.use === HERB_USE.Edible; })
    .map(function (herb) { return herb.id; }));
const HERB_MEDICAL_RESOURCE_IDS = Object.freeze(HERB_DEFS
    .filter(function (herb) { return herb.use === HERB_USE.Medical; })
    .map(function (herb) { return herb.id; }));
const HERB_SPICE_RESOURCE_IDS = Object.freeze(HERB_DEFS
    .filter(function (herb) { return herb.use === HERB_USE.Spice; })
    .map(function (herb) { return herb.id; }));
const HERB_ALCHEMY_RESOURCE_IDS = Object.freeze(HERB_DEFS
    .filter(function (herb) {
        return herb.use === HERB_USE.Alchemical || herb.use === HERB_USE.Magical;
    })
    .map(function (herb) { return herb.id; }));

function getHerbDefinition(resourceId) {
    const id = Number(resourceId);
    return HERB_DEFS.find(function (herb) { return herb.id === id; }) || null;
}

function isHerbResource(resourceId) {
    return getHerbDefinition(resourceId) !== null;
}

const HERB_BIOME_NAMES = Object.freeze({
    3: "Beach",
    4: "Plains",
    5: "Forest",
    6: "Dark Forest",
    7: "Hills",
    8: "Mountains",
    9: "Snowy Mountains",
    10: "Desert",
    11: "Savanna",
    12: "Taiga",
    13: "Tundra",
    14: "Swamp",
    15: "Jungle",
    16: "Mountain Peaks",
    18: "Winter Beach",
    19: "Oasis",
    20: "Lake",
    86: "Mana Pool",
    87: "Volcano",
    89: "Autumn Forest",
    90: "Elven Forest",
    91: "Meadows",
    92: "Corals",
    93: "Obsidian",
    96: "Copper",
    97: "Tar",
    98: "Iron",
    99: "Clay",
});

function getHerbBiomeNames(herb) {
    if (!herb) return [];
    return (herb.biomes || []).map(function (biomeId) {
        return HERB_BIOME_NAMES[biomeId] || ("Biome " + biomeId);
    });
}

// --- vegetables and crops --------------------------------------------------
// Both are ordinary edible Food resources, but the resource panel keeps them
// under Nature instead of raw food. Their definitions copy Leaves: light,
// measured in kilograms and gathered as small batches. Forage uses the same
// biome/temperature/humidity climate rules as herbs.
const PLANT_CLIMATES = Object.freeze({
    Temperate: {
        biomes: [4, 5, 7, 11, 89, 91],
        tempMin: -0.6, tempMax: 1.0,
        humidityMin: -2.0, humidityMax: 2.0,
    },
    Cool: {
        biomes: [5, 6, 12, 13, 89],
        tempMin: -1.2, tempMax: 0.4,
        humidityMin: -2.0, humidityMax: 2.0,
    },
    Garden: {
        biomes: [4, 5, 7, 11, 91],
        tempMin: 0.0, tempMax: 1.1,
        humidityMin: -1.0, humidityMax: 1.5,
    },
    Warm: {
        biomes: [10, 11, 15, 19],
        tempMin: 0.4, tempMax: 1.6,
        humidityMin: -2.0, humidityMax: 2.0,
    },
    Tropical: {
        biomes: [15, 19],
        tempMin: 0.7, tempMax: 1.6,
        humidityMin: 0.2, humidityMax: 2.0,
    },
    Mediterranean: {
        biomes: [3, 7, 19],
        tempMin: 0.3, tempMax: 1.4,
        humidityMin: -1.5, humidityMax: 0.8,
    },
    Wetland: {
        biomes: [14, 20, 86],
        tempMin: -0.3, tempMax: 1.2,
        humidityMin: 0.1, humidityMax: 2.0,
    },
    Arid: {
        biomes: [10, 19],
        tempMin: 0.6, tempMax: 1.6,
        humidityMin: -2.0, humidityMax: 0.2,
    },
    Highland: {
        biomes: [7, 8, 9, 12],
        tempMin: -1.0, tempMax: 0.6,
        humidityMin: -2.0, humidityMax: 2.0,
    },
    Coastal: {
        biomes: [3, 18, 92],
        tempMin: -0.5, tempMax: 1.2,
        humidityMin: -2.0, humidityMax: 2.0,
    },
});

const PLANT_DEFS = [];
const VEGETABLE_RESOURCE_IDS = [];
const CROP_RESOURCE_IDS = [];

function registerFoodPlant(id, plant, kind, resourceIds, description, tastymeter) {
    const climate = plant.climate;
    const humidityMin = Number.isFinite(climate.humidityMin)
        ? climate.humidityMin
        : -2.0;
    const humidityMax = Number.isFinite(climate.humidityMax)
        ? climate.humidityMax
        : 2.0;

    const definition = {
        id: id,
        name: plant.name,
        kind: kind,
        biomes: Object.freeze((climate.biomes || []).slice()),
        tempMin: climate.tempMin,
        tempMax: climate.tempMax,
        humidityMin: humidityMin,
        humidityMax: humidityMax,
        difficulty: plant.difficulty,
        amount: plant.amount,
        weight: plant.weight || 1,
    };

    RESOURCE_DEFS[id] = {
        name: plant.name,
        weight: 0.01,
        unitType: "kg",
        description: description,
        category: RESOURCE_CATEGORIES.Food,
        tags: kind === "crop" ? [RESOURCE_TAGS.Seed] : [],
        plantKind: kind,
        plantBiomes: definition.biomes,
        plantTempMin: definition.tempMin,
        plantTempMax: definition.tempMax,
        plantHumidityMin: definition.humidityMin,
        plantHumidityMax: definition.humidityMax,
        Tastymeter: tastymeter,
    };
    PLANT_DEFS.push(Object.freeze(definition));
    resourceIds.push(id);
}

const VEGETABLE_DEFS = [
    { name: "Carrot", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Potato", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.05 },
    { name: "Tomato", climate: PLANT_CLIMATES.Garden, difficulty: 5, amount: 0.04 },
    { name: "Cucumber", climate: PLANT_CLIMATES.Garden, difficulty: 5, amount: 0.04 },
    { name: "Pumpkin", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.06 },
    { name: "Zucchini", climate: PLANT_CLIMATES.Garden, difficulty: 5, amount: 0.05 },
    { name: "Butternut Squash", climate: PLANT_CLIMATES.Garden, difficulty: 6, amount: 0.06 },
    { name: "Cabbage", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.06 },
    { name: "Cauliflower", climate: PLANT_CLIMATES.Cool, difficulty: 6, amount: 0.05 },
    { name: "Broccoli", climate: PLANT_CLIMATES.Cool, difficulty: 6, amount: 0.05 },
    { name: "Brussels Sprouts", climate: PLANT_CLIMATES.Cool, difficulty: 7, amount: 0.04 },
    { name: "Kale", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.04 },
    { name: "Spinach", climate: PLANT_CLIMATES.Cool, difficulty: 4, amount: 0.03 },
    { name: "Lettuce", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Radish", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.02 },
    { name: "Turnip", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.04 },
    { name: "Beetroot", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.04 },
    { name: "Onion", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.04 },
    { name: "Garlic", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.03 },
    { name: "Leek", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.04 },
    { name: "Celery", climate: PLANT_CLIMATES.Wetland, difficulty: 6, amount: 0.03 },
    { name: "Parsnip", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.04 },
    { name: "Eggplant", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.05 },
    { name: "Bell Pepper", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.04 },
    { name: "Green Peas", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
    { name: "Green Beans", climate: PLANT_CLIMATES.Garden, difficulty: 5, amount: 0.03 },
    { name: "Asparagus", climate: PLANT_CLIMATES.Temperate, difficulty: 7, amount: 0.03 },
    { name: "Artichoke", climate: PLANT_CLIMATES.Mediterranean, difficulty: 8, amount: 0.04 },
    { name: "Sweet Potato", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.06 },
    { name: "Yam", climate: PLANT_CLIMATES.Tropical, difficulty: 7, amount: 0.07 },
    { name: "Okra", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.04 },
    { name: "Rhubarb", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.05 },
    { name: "Arugula", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.02 },
    { name: "Bok Choy", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.04 },
    { name: "Water Chestnut", climate: PLANT_CLIMATES.Wetland, difficulty: 7, amount: 0.05 },
    { name: "Lotus Root", climate: PLANT_CLIMATES.Wetland, difficulty: 8, amount: 0.06 },
    { name: "Bamboo Shoot", climate: PLANT_CLIMATES.Tropical, difficulty: 8, amount: 0.05 },
    { name: "Daikon", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.05 },
    { name: "Jicama", climate: PLANT_CLIMATES.Tropical, difficulty: 7, amount: 0.06 },
    { name: "Kohlrabi", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.05 },
    { name: "Rutabaga", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.06 },
    { name: "Celeriac", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.05 },
    { name: "Endive", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Escarole", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Radicchio", climate: PLANT_CLIMATES.Mediterranean, difficulty: 5, amount: 0.04 },
    { name: "Swiss Chard", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.04 },
    { name: "Collard Greens", climate: PLANT_CLIMATES.Cool, difficulty: 4, amount: 0.04 },
    { name: "Mustard Greens", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Water Spinach", climate: PLANT_CLIMATES.Wetland, difficulty: 5, amount: 0.04 },
    { name: "Bitter Gourd", climate: PLANT_CLIMATES.Tropical, difficulty: 7, amount: 0.04 },
    { name: "Bottle Gourd", climate: PLANT_CLIMATES.Tropical, difficulty: 7, amount: 0.06 },
    { name: "Chayote", climate: PLANT_CLIMATES.Tropical, difficulty: 7, amount: 0.05 },
    { name: "Cassava", climate: PLANT_CLIMATES.Tropical, difficulty: 8, amount: 0.08 },
    { name: "Taro", climate: PLANT_CLIMATES.Wetland, difficulty: 8, amount: 0.07 },
    { name: "Jerusalem Artichoke", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.05 },
    { name: "Salsify", climate: PLANT_CLIMATES.Cool, difficulty: 6, amount: 0.04 },
    { name: "Scorzonera", climate: PLANT_CLIMATES.Cool, difficulty: 6, amount: 0.04 },
    { name: "Oca", climate: PLANT_CLIMATES.Highland, difficulty: 7, amount: 0.04 },
    { name: "Ulluco", climate: PLANT_CLIMATES.Highland, difficulty: 7, amount: 0.04 },
    { name: "Mashua", climate: PLANT_CLIMATES.Highland, difficulty: 7, amount: 0.04 },
    { name: "Parsley Root", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
    { name: "Skirret", climate: PLANT_CLIMATES.Wetland, difficulty: 6, amount: 0.03 },
    { name: "Fiddlehead Fern", climate: PLANT_CLIMATES.Cool, difficulty: 6, amount: 0.03 },
    { name: "Sea Kale", climate: PLANT_CLIMATES.Coastal, difficulty: 6, amount: 0.04 },
    { name: "Samphire", climate: PLANT_CLIMATES.Coastal, difficulty: 5, amount: 0.03 },
    { name: "Warrigal Greens", climate: PLANT_CLIMATES.Coastal, difficulty: 5, amount: 0.03 },
    { name: "New Zealand Spinach", climate: PLANT_CLIMATES.Coastal, difficulty: 5, amount: 0.03 },
    { name: "Orache", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Good King Henry", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
    { name: "Strawberry Spinach", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
    { name: "Malabar Spinach", climate: PLANT_CLIMATES.Tropical, difficulty: 6, amount: 0.04 },
    { name: "Chicory", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
];

const CROP_DEFS = [
    { name: "Wheat", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.05 },
    { name: "Barley", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.05 },
    { name: "Oats", climate: PLANT_CLIMATES.Cool, difficulty: 4, amount: 0.05 },
    { name: "Rye", climate: PLANT_CLIMATES.Cool, difficulty: 5, amount: 0.05 },
    { name: "Rice", climate: PLANT_CLIMATES.Wetland, difficulty: 6, amount: 0.06 },
    { name: "Millet", climate: PLANT_CLIMATES.Arid, difficulty: 5, amount: 0.04 },
    { name: "Sorghum", climate: PLANT_CLIMATES.Arid, difficulty: 6, amount: 0.05 },
    { name: "Buckwheat", climate: PLANT_CLIMATES.Highland, difficulty: 5, amount: 0.04 },
    { name: "Quinoa", climate: PLANT_CLIMATES.Highland, difficulty: 6, amount: 0.04 },
    { name: "Maize", climate: PLANT_CLIMATES.Warm, difficulty: 5, amount: 0.08 },
    { name: "Spelt", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.05 },
    { name: "Emmer", climate: PLANT_CLIMATES.Temperate, difficulty: 7, amount: 0.05 },
    { name: "Einkorn", climate: PLANT_CLIMATES.Highland, difficulty: 7, amount: 0.04 },
    { name: "Triticale", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.05 },
    { name: "Teff", climate: PLANT_CLIMATES.Arid, difficulty: 6, amount: 0.03 },
    { name: "Amaranth", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.03 },
    { name: "Rapeseed", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
    { name: "Flax", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
    { name: "Sunflower", climate: PLANT_CLIMATES.Garden, difficulty: 5, amount: 0.05 },
    { name: "Safflower", climate: PLANT_CLIMATES.Arid, difficulty: 6, amount: 0.04 },
    { name: "Sesame", climate: PLANT_CLIMATES.Arid, difficulty: 6, amount: 0.03 },
    { name: "Hemp", climate: PLANT_CLIMATES.Temperate, difficulty: 6, amount: 0.04 },
    { name: "Chia", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.02 },
    { name: "Cotton", climate: PLANT_CLIMATES.Warm, difficulty: 6, amount: 0.04 },
    { name: "Sugarcane", climate: PLANT_CLIMATES.Tropical, difficulty: 7, amount: 0.10 },
    { name: "Alfalfa", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Clover", climate: PLANT_CLIMATES.Temperate, difficulty: 4, amount: 0.03 },
    { name: "Lupin", climate: PLANT_CLIMATES.Mediterranean, difficulty: 5, amount: 0.04 },
    { name: "Fonio", climate: PLANT_CLIMATES.Arid, difficulty: 6, amount: 0.03 },
    { name: "Finger Millet", climate: PLANT_CLIMATES.Arid, difficulty: 5, amount: 0.03 },
    { name: "Pearl Millet", climate: PLANT_CLIMATES.Arid, difficulty: 5, amount: 0.04 },
    { name: "Proso Millet", climate: PLANT_CLIMATES.Temperate, difficulty: 5, amount: 0.03 },
];

VEGETABLE_DEFS.forEach(function (plant, index) {
    registerFoodPlant(
        4001 + index,
        plant,
        "vegetable",
        VEGETABLE_RESOURCE_IDS,
        "A fresh garden vegetable. Edible raw, but much better cooked.",
        5
    );
});

CROP_DEFS.forEach(function (plant, index) {
    registerFoodPlant(
        4101 + index,
        plant,
        "crop",
        CROP_RESOURCE_IDS,
        "A cultivated grain crop. Hardy, filling and easy to store.",
        4
    );
});

// Flour is generated for every seed crop. It is Food so it remains edible and
// receives the usual food stat binding, but the resource panel groups it under
// Intermediate -> Cooking -> Flour.
const FLOUR_RESOURCE_ID_BASE = 6001;
const FLOUR_RESOURCE_IDS = [];
const FLOUR_RESOURCE_IDS_BY_SEED = {};

CROP_DEFS.forEach(function (plant, index) {
    const seedResourceId = 4101 + index;
    const flourResourceId = FLOUR_RESOURCE_ID_BASE + index;

    RESOURCE_DEFS[flourResourceId] = {
        name: plant.name + " flour",
        weight: 0.01,
        unitType: "kg",
        description: "Stone-ground " + plant.name.toLowerCase() + " flour. Edible and useful for cooking.",
        category: RESOURCE_CATEGORIES.Food,
        flour: true,
        seedResourceId: seedResourceId,
        Tastymeter: 3,
    };

    FLOUR_RESOURCE_IDS.push(flourResourceId);
    FLOUR_RESOURCE_IDS_BY_SEED[seedResourceId] = flourResourceId;
});

Object.freeze(FLOUR_RESOURCE_IDS);
Object.freeze(FLOUR_RESOURCE_IDS_BY_SEED);
Object.freeze(VEGETABLE_RESOURCE_IDS);
Object.freeze(CROP_RESOURCE_IDS);

function isVegetableResource(resourceId) {
    return VEGETABLE_RESOURCE_IDS.indexOf(Number(resourceId)) !== -1;
}

function isCropResource(resourceId) {
    return CROP_RESOURCE_IDS.indexOf(Number(resourceId)) !== -1;
}

function isSeedResource(resourceId) {
    return isCropResource(resourceId)
        && typeof hasResourceTag === "function"
        && hasResourceTag(resourceId, RESOURCE_TAGS.Seed);
}

function isFlourResource(resourceId) {
    return FLOUR_RESOURCE_IDS.indexOf(Number(resourceId)) !== -1;
}

function getFlourResourceIdForSeed(seedResourceId) {
    return FLOUR_RESOURCE_IDS_BY_SEED[Number(seedResourceId)] || null;
}

function getPlantDefinition(resourceId) {
    const id = Number(resourceId);
    return PLANT_DEFS.find(function (plant) { return plant.id === id; }) || null;
}

function getPlantBiomeNames(plant) {
    if (!plant) return [];
    return (plant.biomes || []).map(function (biomeId) {
        return HERB_BIOME_NAMES[biomeId] || ("Biome " + biomeId);
    });
}

// Edible mushrooms are stored as Food, but shown under raw resources/mushrooms.
const MUSHROOM_RESOURCE_IDS = Object.freeze([
    RESOURCE_IDS.BUTTON_MUSHROOM,
    RESOURCE_IDS.OYSTER_MUSHROOM,
    RESOURCE_IDS.CHANTERELLE,
    RESOURCE_IDS.PORCINI,
    RESOURCE_IDS.SHIITAKE,
    RESOURCE_IDS.MOREL,
    RESOURCE_IDS.HONEY_FUNGUS,
    RESOURCE_IDS.RUSSULA,
    RESOURCE_IDS.BOLETE,
    RESOURCE_IDS.MEADOW_MUSHROOM,
]);

// Mushrooms that are edible only after cooking. They remain Food and still
// restore hunger when used in a recipe, but they are not tagged "Edible" and
// are therefore never chosen by automatic raw eating.
const RAW_INEDIBLE_MUSHROOM_IDS = Object.freeze([
    RESOURCE_IDS.CHANTERELLE,
    RESOURCE_IDS.SHIITAKE,
    RESOURCE_IDS.MOREL,
    RESOURCE_IDS.HONEY_FUNGUS,
    RESOURCE_IDS.BOLETE,
]);

// Fruits and nuts are gathered from the matching named tree species.
const FRUIT_RESOURCE_IDS = Object.freeze([
    RESOURCE_IDS.BANANAS,
    RESOURCE_IDS.COCONUTS,
    RESOURCE_IDS.APPLES,
    RESOURCE_IDS.PEARS,
    RESOURCE_IDS.ORANGES,
    RESOURCE_IDS.LEMONS,
    RESOURCE_IDS.LIMES,
    RESOURCE_IDS.CHERRIES,
    RESOURCE_IDS.PLUMS,
    RESOURCE_IDS.PEACHES,
    RESOURCE_IDS.APRICOTS,
    RESOURCE_IDS.FIGS,
    RESOURCE_IDS.POMEGRANATES,
    RESOURCE_IDS.OLIVES,
    RESOURCE_IDS.MANGOES,
    RESOURCE_IDS.PAPAYAS,
    RESOURCE_IDS.AVOCADOS,
    RESOURCE_IDS.GRAPEFRUITS,
    RESOURCE_IDS.PERSIMMONS,
    RESOURCE_IDS.QUINCES,
    RESOURCE_IDS.GUAVAS,
    RESOURCE_IDS.LYCHEES,
    RESOURCE_IDS.DRAGONFRUITS,
    RESOURCE_IDS.MULBERRIES,
    RESOURCE_IDS.ROWAN_BERRIES,
    RESOURCE_IDS.BIRD_CHERRIES,
    RESOURCE_IDS.MEDLARS,
    RESOURCE_IDS.SERVICEBERRIES,
]);

const NUT_RESOURCE_IDS = Object.freeze([
    RESOURCE_IDS.WALNUTS,
    RESOURCE_IDS.HAZELNUTS,
    RESOURCE_IDS.ALMONDS,
    RESOURCE_IDS.CHESTNUTS,
    RESOURCE_IDS.PECANS,
    RESOURCE_IDS.PISTACHIOS,
    RESOURCE_IDS.CASHEWS,
    RESOURCE_IDS.MACADAMIAS,
    RESOURCE_IDS.BRAZIL_NUTS,
    RESOURCE_IDS.HICKORY_NUTS,
    RESOURCE_IDS.BEECHNUTS,
    RESOURCE_IDS.ACORNS,
    RESOURCE_IDS.PINE_NUTS,
]);

// Every Food resource is edible, but not every one can be eaten raw. While
// definitions are being enriched (before the freeze), tags are assembled here.
function getResourceTags(resourceId) {
    const definition = RESOURCE_DEFS[resourceId];
    return definition && Array.isArray(definition.tags) ? definition.tags : [];
}

function hasResourceTag(resourceId, tag) {
    const wanted = String(tag || "").toLowerCase();
    if (!wanted) return false;
    return getResourceTags(resourceId).some(function (entry) {
        return String(entry).toLowerCase() === wanted;
    });
}

function addResourceTag(resourceId, tag) {
    const definition = RESOURCE_DEFS[resourceId];
    if (!definition || !tag) return false;
    if (!Array.isArray(definition.tags)) definition.tags = [];
    if (hasResourceTag(resourceId, tag)) return false;
    definition.tags.push(tag);
    return true;
}

function removeResourceTag(resourceId, tag) {
    const definition = RESOURCE_DEFS[resourceId];
    if (!definition || !Array.isArray(definition.tags)) return false;
    const wanted = String(tag || "").toLowerCase();
    const filtered = definition.tags.filter(function (entry) {
        return String(entry).toLowerCase() !== wanted;
    });
    if (filtered.length === definition.tags.length) return false;
    definition.tags = filtered;
    return true;
}

// RestoresHunger means the resource is food. Tastymeter is descriptive only.
const FOOD_TASTYMETER_DEFAULTS = Object.freeze({
    berries: 7,
    mushrooms: 4,
    nuts: 6,
    fruits: 8,
});

function getFoodTastymeter(resourceId) {
    if (MUSHROOM_RESOURCE_IDS.indexOf(resourceId) !== -1) {
        return FOOD_TASTYMETER_DEFAULTS.mushrooms;
    }
    if (FRUIT_RESOURCE_IDS.indexOf(resourceId) !== -1) {
        return FOOD_TASTYMETER_DEFAULTS.fruits;
    }
    if (NUT_RESOURCE_IDS.indexOf(resourceId) !== -1) {
        return FOOD_TASTYMETER_DEFAULTS.nuts;
    }
    return FOOD_TASTYMETER_DEFAULTS.berries;
}

// 1. Every resource gets a tags array so callers never need to special-case it.
// 2. Every current Food resource is edible in some form and gets the tag.
// 3. Raw-edible herbs are explicitly tagged as well, even if their storage
//    category changes in the future.
// 4. Mushrooms that require cooking lose the raw "Edible" tag.
Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
    const definition = RESOURCE_DEFS[resourceId];
    if (!definition) return;
    if (!Array.isArray(definition.tags)) definition.tags = [];
});

Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
    const definition = RESOURCE_DEFS[resourceId];
    if (!definition || definition.category !== RESOURCE_CATEGORIES.Food) return;

    definition.RestoresHunger = true;
    addResourceTag(resourceId, RESOURCE_TAGS.Edible);
    if (!Number.isFinite(Number(definition.Tastymeter))) {
        definition.Tastymeter = getFoodTastymeter(Number(resourceId));
    }
});

HERB_EDIBLE_RESOURCE_IDS.forEach(function (resourceId) {
    addResourceTag(resourceId, RESOURCE_TAGS.Edible);
});

RAW_INEDIBLE_MUSHROOM_IDS.forEach(function (resourceId) {
    removeResourceTag(resourceId, RESOURCE_TAGS.Edible);
});

Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
    const definition = RESOURCE_DEFS[resourceId];
    if (definition && Array.isArray(definition.tags)) {
        Object.freeze(definition.tags);
    }
});
Object.freeze(RESOURCE_DEFS);

const SPACE_ELEMENT_NAMES = Object.freeze([
    "EmptySpace",
    "River",
    "SaltWater",
    "Water",
    "Sand",
    "Grass",
    "Tree",
    "Bushes",
    "FertileLand",
    "Rock",
    "Moss",
    "Snow",
    "Swamp",
    "Ice",
    "Clay",
    "Iron",
    "Copper",
    "Gold",
    "Marble",
    "Obsidian",
    "Coral",
    "Tar",
    "ManaPool",
    "Tin",
    "Lava",
    "Magma",
]);
const SPACE_ELEMENT_NAME_BY_LOWER = new Map(SPACE_ELEMENT_NAMES.map((name) => [name.toLowerCase(), name]));

// Fruit and nut tree species replace part of the generic "Tree" space during
// world generation. Each species only appears inside its own temperature and
// humidity range, so bananas stay tropical while pears grow in colder places.
const TREE_SPECIES = Object.freeze([
    // Fruit trees
    { name: "Banana Tree", kind: "fruit", tempMin: 1.0, tempMax: 2.0, humidityMin: 0.5, humidityMax: 2.0 },
    { name: "Coconut Palm", kind: "fruit", tempMin: 0.9, tempMax: 2.0, humidityMin: 0.4, humidityMax: 2.0 },
    { name: "Apple Tree", kind: "fruit", tempMin: -0.6, tempMax: 0.7, humidityMin: -1.0, humidityMax: 1.0 },
    { name: "Pear Tree", kind: "fruit", tempMin: -0.8, tempMax: 0.5, humidityMin: -1.0, humidityMax: 1.0 },
    { name: "Orange Tree", kind: "fruit", tempMin: 0.7, tempMax: 2.0, humidityMin: 0.0, humidityMax: 1.5 },
    { name: "Lemon Tree", kind: "fruit", tempMin: 0.8, tempMax: 2.0, humidityMin: 0.0, humidityMax: 1.5 },
    { name: "Lime Tree", kind: "fruit", tempMin: 0.8, tempMax: 2.0, humidityMin: 0.2, humidityMax: 1.6 },
    { name: "Cherry Tree", kind: "fruit", tempMin: -0.6, tempMax: 0.5, humidityMin: -0.6, humidityMax: 1.0 },
    { name: "Plum Tree", kind: "fruit", tempMin: -0.5, tempMax: 0.6, humidityMin: -0.6, humidityMax: 1.2 },
    { name: "Peach Tree", kind: "fruit", tempMin: 0.4, tempMax: 1.4, humidityMin: -0.3, humidityMax: 1.0 },
    { name: "Apricot Tree", kind: "fruit", tempMin: 0.3, tempMax: 1.4, humidityMin: -0.6, humidityMax: 0.8 },
    { name: "Fig Tree", kind: "fruit", tempMin: 0.6, tempMax: 1.7, humidityMin: -0.3, humidityMax: 1.2 },
    { name: "Pomegranate Tree", kind: "fruit", tempMin: 0.7, tempMax: 1.8, humidityMin: -0.8, humidityMax: 0.8 },
    { name: "Olive Tree", kind: "fruit", tempMin: 0.6, tempMax: 1.6, humidityMin: -1.0, humidityMax: 0.5 },
    { name: "Mango Tree", kind: "fruit", tempMin: 1.0, tempMax: 2.0, humidityMin: 0.3, humidityMax: 1.5 },
    { name: "Papaya Tree", kind: "fruit", tempMin: 1.0, tempMax: 2.0, humidityMin: 0.4, humidityMax: 1.8 },
    { name: "Avocado Tree", kind: "fruit", tempMin: 0.8, tempMax: 1.8, humidityMin: 0.2, humidityMax: 1.5 },
    { name: "Grapefruit Tree", kind: "fruit", tempMin: 0.7, tempMax: 1.8, humidityMin: 0.0, humidityMax: 1.2 },
    { name: "Persimmon Tree", kind: "fruit", tempMin: 0.2, tempMax: 1.2, humidityMin: -0.3, humidityMax: 1.0 },
    { name: "Quince Tree", kind: "fruit", tempMin: -0.2, tempMax: 0.9, humidityMin: -0.6, humidityMax: 1.0 },
    { name: "Guava Tree", kind: "fruit", tempMin: 0.8, tempMax: 2.0, humidityMin: 0.2, humidityMax: 1.6 },
    { name: "Lychee Tree", kind: "fruit", tempMin: 0.9, tempMax: 2.0, humidityMin: 0.4, humidityMax: 1.6 },
    { name: "Dragonfruit Tree", kind: "fruit", tempMin: 1.1, tempMax: 2.0, humidityMin: -0.5, humidityMax: 0.8 },
    { name: "Mulberry Tree", kind: "fruit", tempMin: -0.2, tempMax: 1.0, humidityMin: -0.4, humidityMax: 1.0 },
    { name: "Rowan Tree", kind: "fruit", tempMin: -1.0, tempMax: 0.6, humidityMin: -1.0, humidityMax: 1.0 },
    { name: "Bird Cherry Tree", kind: "fruit", tempMin: -1.0, tempMax: 0.4, humidityMin: -0.8, humidityMax: 1.2 },
    { name: "Medlar Tree", kind: "fruit", tempMin: -0.4, tempMax: 0.7, humidityMin: -0.8, humidityMax: 1.0 },
    { name: "Service Tree", kind: "fruit", tempMin: -0.6, tempMax: 0.8, humidityMin: -0.8, humidityMax: 1.0 },
    // Nut trees
    { name: "Walnut Tree", kind: "nut", tempMin: -0.6, tempMax: 0.8, humidityMin: -1.0, humidityMax: 1.0 },
    { name: "Hazelnut Tree", kind: "nut", tempMin: -0.8, tempMax: 0.6, humidityMin: -1.0, humidityMax: 1.0 },
    { name: "Almond Tree", kind: "nut", tempMin: 0.3, tempMax: 1.4, humidityMin: -1.0, humidityMax: 0.6 },
    { name: "Chestnut Tree", kind: "nut", tempMin: -0.5, tempMax: 0.8, humidityMin: -0.5, humidityMax: 1.2 },
    { name: "Pecan Tree", kind: "nut", tempMin: 0.2, tempMax: 1.3, humidityMin: -0.5, humidityMax: 1.0 },
    { name: "Pistachio Tree", kind: "nut", tempMin: 0.6, tempMax: 1.6, humidityMin: -1.0, humidityMax: 0.3 },
    { name: "Cashew Tree", kind: "nut", tempMin: 0.9, tempMax: 2.0, humidityMin: 0.0, humidityMax: 1.2 },
    { name: "Macadamia Tree", kind: "nut", tempMin: 0.8, tempMax: 1.8, humidityMin: 0.2, humidityMax: 1.5 },
    { name: "Brazil Nut Tree", kind: "nut", tempMin: 1.0, tempMax: 2.0, humidityMin: 0.6, humidityMax: 2.0 },
    { name: "Hickory Tree", kind: "nut", tempMin: -0.6, tempMax: 0.6, humidityMin: -0.8, humidityMax: 1.0 },
    { name: "Beech Tree", kind: "nut", tempMin: -0.7, tempMax: 0.6, humidityMin: -0.8, humidityMax: 1.1 },
    { name: "Oak Tree", kind: "nut", tempMin: -0.8, tempMax: 0.8, humidityMin: -1.0, humidityMax: 1.2 },
    { name: "Pine Tree", kind: "nut", tempMin: -1.0, tempMax: 0.7, humidityMin: -1.0, humidityMax: 1.2 },
]);

const TREE_SPECIES_BY_LOWER = new Map(
    TREE_SPECIES.map((species) => [species.name.toLowerCase(), species])
);
// Resource obtained by the Trees Harvest action from each named tree.
const TREE_HARVEST_RESOURCES = Object.freeze({
    "Banana Tree": RESOURCE_IDS.BANANAS,
    "Coconut Palm": RESOURCE_IDS.COCONUTS,
    "Apple Tree": RESOURCE_IDS.APPLES,
    "Pear Tree": RESOURCE_IDS.PEARS,
    "Orange Tree": RESOURCE_IDS.ORANGES,
    "Lemon Tree": RESOURCE_IDS.LEMONS,
    "Lime Tree": RESOURCE_IDS.LIMES,
    "Cherry Tree": RESOURCE_IDS.CHERRIES,
    "Plum Tree": RESOURCE_IDS.PLUMS,
    "Peach Tree": RESOURCE_IDS.PEACHES,
    "Apricot Tree": RESOURCE_IDS.APRICOTS,
    "Fig Tree": RESOURCE_IDS.FIGS,
    "Pomegranate Tree": RESOURCE_IDS.POMEGRANATES,
    "Olive Tree": RESOURCE_IDS.OLIVES,
    "Mango Tree": RESOURCE_IDS.MANGOES,
    "Papaya Tree": RESOURCE_IDS.PAPAYAS,
    "Avocado Tree": RESOURCE_IDS.AVOCADOS,
    "Grapefruit Tree": RESOURCE_IDS.GRAPEFRUITS,
    "Persimmon Tree": RESOURCE_IDS.PERSIMMONS,
    "Quince Tree": RESOURCE_IDS.QUINCES,
    "Guava Tree": RESOURCE_IDS.GUAVAS,
    "Lychee Tree": RESOURCE_IDS.LYCHEES,
    "Dragonfruit Tree": RESOURCE_IDS.DRAGONFRUITS,
    "Mulberry Tree": RESOURCE_IDS.MULBERRIES,
    "Rowan Tree": RESOURCE_IDS.ROWAN_BERRIES,
    "Bird Cherry Tree": RESOURCE_IDS.BIRD_CHERRIES,
    "Medlar Tree": RESOURCE_IDS.MEDLARS,
    "Service Tree": RESOURCE_IDS.SERVICEBERRIES,
    "Walnut Tree": RESOURCE_IDS.WALNUTS,
    "Hazelnut Tree": RESOURCE_IDS.HAZELNUTS,
    "Almond Tree": RESOURCE_IDS.ALMONDS,
    "Chestnut Tree": RESOURCE_IDS.CHESTNUTS,
    "Pecan Tree": RESOURCE_IDS.PECANS,
    "Pistachio Tree": RESOURCE_IDS.PISTACHIOS,
    "Cashew Tree": RESOURCE_IDS.CASHEWS,
    "Macadamia Tree": RESOURCE_IDS.MACADAMIAS,
    "Brazil Nut Tree": RESOURCE_IDS.BRAZIL_NUTS,
    "Hickory Tree": RESOURCE_IDS.HICKORY_NUTS,
    "Beech Tree": RESOURCE_IDS.BEECHNUTS,
    "Oak Tree": RESOURCE_IDS.ACORNS,
    "Pine Tree": RESOURCE_IDS.PINE_NUTS,
});
// Chosen by the world generator to decide whether a generic Tree becomes a
// named fruit or nut tree.
const TREE_SPECIES_REPLACEMENT_CHANCE = 0.4;

function getTreeSpeciesByName(name) {
    return TREE_SPECIES_BY_LOWER.get(String(name).toLowerCase()) || null;
}

function isTreeSpaceElement(name) {
    const lower = String(name).toLowerCase();
    return lower === "tree" || TREE_SPECIES_BY_LOWER.has(lower);
}

function getEligibleTreeSpecies(temperature, humidity) {
    const temp = Number(temperature);
    const humid = Number(humidity);
    if (!Number.isFinite(temp) || !Number.isFinite(humid)) return [];

    return TREE_SPECIES.filter(function (species) {
        return temp >= species.tempMin && temp <= species.tempMax
            && humid >= species.humidityMin && humid <= species.humidityMax;
    });
}

function normalizeSpaceElementName(name) {
    const elementName = String(name);
    return SPACE_ELEMENT_NAME_BY_LOWER.get(elementName.toLowerCase()) || elementName;
}

function getResourceMultiplier(tile, resourceId) {
    if (!tile || !tile.resourceMultipliers) return DEFAULT_RESOURCE_MULTIPLIER;

    const multiplier = tile.resourceMultipliers[resourceId];
    return typeof multiplier === "number" ? multiplier : DEFAULT_RESOURCE_MULTIPLIER;
}

const PERCENT = 100;
const CORE_STAT_COUNT = 9;
const CORE_STAT_NAMES = ["str", "agi", "vit", "per", "int", "ins", "sou", "luck", "speed"];
const LEARNABLE_SKILL_KEYS = ["exploration", "forage", "rest", "focus", "wizardy", "alchemy", "masonry", "pottery", "regeneration", "autism", "science", "traveling", "dreammastery", "survival", "ropemaking", "tailoring", "carpentry", "architecture", "gardening", "digging", "lumberjack", "mining", "smithing", "cooking", "milling"];

// Every edible resource is bound to one core stat for the whole playthrough.
// The binding is rolled once when a new game starts and is stored in saves.
// Herbs use the same binding even when they are not edible (medical, spice,
// alchemical and magical herbs), so their future use can restore potential.
var foodStatBindings = {};

// The map seed is generated before the map itself so that new-game rolls can
// use it while the scripts are still loading. MapView consumes the same value.
function getOrCreateMapSeed() {
    if (typeof window === "undefined") return 0;
    if (window.mapView && typeof window.mapView.getSeed === "function") {
        return window.mapView.getSeed();
    }
    if (typeof window.pendingMapSeed !== "number"
        || !Number.isFinite(window.pendingMapSeed)) {
        window.pendingMapSeed = Math.floor(Math.random() * 1000000);
    }
    return window.pendingMapSeed;
}

// Stable hash: the same map seed always produces the same stat for a resource,
// independently of resource iteration order or future resource additions.
function hashFoodStatBindingSeed(seed, resourceId) {
    let hash = 2166136261;
    const text = String(seed) + "|" + String(resourceId);
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0x5bd1e995);
    hash ^= hash >>> 15;
    return hash >>> 0;
}

function rollFoodStatBinding(resourceId, seed) {
    const index = hashFoodStatBindingSeed(seed, resourceId) % CORE_STAT_NAMES.length;
    return CORE_STAT_NAMES[index];
}

function canHaveFoodStatBinding(resourceId) {
    const definition = RESOURCE_DEFS[resourceId];
    if (!definition) return false;
    if (definition.RestoresHunger) return true;
    return typeof isHerbResource === "function" && isHerbResource(resourceId);
}

function getFoodStatBinding(resourceId) {
    const statKey = foodStatBindings[String(resourceId)];
    return CORE_STAT_NAMES.includes(statKey) ? statKey : null;
}

function getFoodStatBindingName(resourceId) {
    const statKey = getFoodStatBinding(resourceId);
    const stat = statKey && typeof player !== "undefined" && player
        ? player[statKey]
        : null;
    return stat && stat.name ? stat.name : statKey;
}

// Fills in bindings for every edible resource and every herb that does not
// have a valid one. Existing bindings are preserved, so loading a save never
// rerolls them. When a seed is supplied, every new roll is deterministic.
function ensureFoodStatBindings(seed) {
    const bindingSeed = seed == null ? getOrCreateMapSeed() : seed;
    Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
        if (!canHaveFoodStatBinding(resourceId)) return;
        if (getFoodStatBinding(resourceId)) return;

        foodStatBindings[resourceId] = rollFoodStatBinding(resourceId, bindingSeed);
    });
    return foodStatBindings;
}

function setFoodStatBindings(savedBindings, seed) {
    foodStatBindings = {};
    if (savedBindings && typeof savedBindings === "object") {
        Object.keys(savedBindings).forEach(function (resourceId) {
            const definition = RESOURCE_DEFS[resourceId];
            const statKey = savedBindings[resourceId];
            if (definition && canHaveFoodStatBinding(resourceId)
                && CORE_STAT_NAMES.includes(statKey)) {
                foodStatBindings[resourceId] = statKey;
            }
        });
    }
    return ensureFoodStatBindings(seed);
}

// Effective level of a stat/skill: base level plus item property bonuses.
// Base levels are still used for experience, saving and the UI.
function getEffectiveLevel(key) {
    const entry = typeof player !== "undefined" && player ? player[key] : null;
    if (!entry) return 0;

    const base = Number(entry.lvl) || 0;
    const equipmentBonus = typeof getEquippedStatBonus === "function"
        ? getEquippedStatBonus(key)
        : 0;
    let effective = base + equipmentBonus;
    if (typeof getEquippedPropertyLevelBonus === "function") {
        effective = base * (1 + getEquippedPropertyLevelBonus(key)) + equipmentBonus;
    }

    // Catched a cold slows the character: -20% effective Speed.
    if (key === "speed"
        && typeof getCatchedColdSpeedMultiplier === "function") {
        effective *= getCatchedColdSpeedMultiplier();
    }

    return effective;
}

// Multiplier for standalone item properties such as Max HP or travel speed.
function getGlobalPropertyMultiplier(key) {
    return typeof getEquippedGlobalPropertyMultiplier === "function"
        ? getEquippedGlobalPropertyMultiplier(key)
        : 1;
}
const ACTION_ACTIVE_COLOR = "#fcf088";
// Action colours by tag: ordinary green, harvesting orange, restoration blue,
// magic very light purple, resource-processing a muted green and movement a
// light salad green.
const ACTION_IDLE_COLOR = "#caf37d";
const ACTION_HARVEST_IDLE_COLOR = "#ffc27a";
const ACTION_RESTORATION_IDLE_COLOR = "#b9e2ff";
const ACTION_MAGIC_IDLE_COLOR = "#f0dcff";
const ACTION_PRODUCTION_IDLE_COLOR = "#b7e3a1";
const ACTION_MOVEMENT_IDLE_COLOR = "#d9f7c0";
const MIN_STAMINA_TO_FORAGE = 0.1;
const EXPLORATION_PROGRESS_RATE = 0.01;
const SEARCH_UNITS_RATE = 1;
const SEARCH_INVESTIGATION_RATE = 0.0001;
const FORAGE_STAMINA_COST = 0.1;
// Forage yields were reduced by 100x; tree harvest, digging and mining use
// their own amounts and are not affected by this divisor.
const FORAGE_AMOUNT_DIVISOR = 100;
// Safety caps for background tabs / long pauses: forage simulates at most
// one minute and a limited number of batches per tick.
const FORAGE_MAX_DIFF_SECONDS = 60;
const FORAGE_MAX_BATCHES_PER_TICK = 1500;
// Resources are generated in separate ticks: one second of forage power every
// FORAGE_RESOURCE_TICK_SECONDS seconds. Experience is multiplied so its
// per-second rate stays exactly the same.
const FORAGE_RESOURCE_TICK_SECONDS = 10;
const FORAGE_RESOURCE_TICK_EXP_MULTIPLIER = 10;
const FORAGE_MAX_RESOURCE_TICKS_PER_LOOP =
    FORAGE_MAX_DIFF_SECONDS / FORAGE_RESOURCE_TICK_SECONDS;
// Forage experience is tied to the hiddenstuff actually processed, not to
// raw elapsed time. At power 10 this matches the old 1 exp/s (forage) and
// 0.5 exp/s (perception).
const FORAGE_EXP_PER_UNIT = 0.1;
const FORAGE_PERCEPTION_EXP_PER_UNIT = 0.05;
// "Make fibers" action: 10 grass -> 0.1 fibers per effectiveness unit.
const FIBER_GRASS_PER_BATCH = 10;
const FIBER_OUTPUT_PER_BATCH = 0.1;
const FIBER_STAMINA_PER_BATCH = 3;
const FIBER_SURVIVAL_EXP = 5;
const FIBER_ROPEMAKING_EXP = 3;
const FIBER_TAILORING_EXP = 2;
// "Make shafts" action: 1 stick -> 1 shaft per effectiveness unit.
const SHAFT_STICKS_PER_BATCH = 1;
const SHAFT_OUTPUT_PER_BATCH = 1;
const SHAFT_STAMINA_PER_BATCH = 3;
const SHAFT_CARPENTRY_EXP = 5;
// Woodworking trains agility a little.
const SHAFT_AGI_EXP = 0.5;
// Each point of Cutting power speeds up shaft processing by 10%.
const SHAFT_CUTTING_POWER_SPEED = 0.1;
// "Make handle" action: 0.4 shafts -> 1 handle per effectiveness unit.
const HANDLE_SHAFTS_PER_BATCH = 0.4;
const HANDLE_OUTPUT_PER_BATCH = 1;
const HANDLE_STAMINA_PER_BATCH = 3;
const HANDLE_CARPENTRY_EXP = 5;
const HANDLE_AGI_EXP = 0.5;
const HANDLE_CUTTING_POWER_SPEED = 0.1;
// "Make planks" action: each effectiveness unit consumes 0.01 logs and turns
// them into 0.1 Wooden Plank. Chopping power speeds the work up.
const PLANK_LOGS_PER_BATCH = 0.01;
const PLANK_OUTPUT_PER_BATCH = 0.1;
const PLANK_STAMINA_PER_BATCH = 15;
const PLANK_CARPENTRY_EXP = 5;
const PLANK_AGI_EXP = 0.5;
const PLANK_CHOPPING_POWER_SPEED = 0.1;
// "Make wooden beams" action: each effectiveness unit consumes 0.1 Wooden logs
// and turns them into 0.01 Wooden Beams. Chopping power speeds the work up.
const BEAM_LOGS_PER_BATCH = 0.1;
const BEAM_OUTPUT_PER_BATCH = 0.01;
const BEAM_STAMINA_PER_BATCH = 30;
const BEAM_CARPENTRY_EXP = 5;
const BEAM_AGI_EXP = 0.5;
const BEAM_CHOPPING_POWER_SPEED = 0.1;
// "Make Mortar" action: each effectiveness unit consumes 20 Sand and 20 Clay
// and produces 1 Mortar. Agility and Alchemy drive the work.
const MORTAR_SAND_PER_BATCH = 20;
const MORTAR_CLAY_PER_BATCH = 20;
const MORTAR_OUTPUT_PER_BATCH = 1;
const MORTAR_STAMINA_PER_BATCH = 1;
const MORTAR_ALCHEMY_EXP = 5;
const MORTAR_AGI_EXP = 0.5;
// "Smelt ore" actions: each effectiveness unit consumes 10 ore and 100 Heat
// Units and produces 1 metal bar. Vitality, Smithing and Smelt power drive it.
const SMELT_ORE_PER_BATCH = 10;
const SMELT_HEAT_PER_BATCH = 100;
const SMELT_OUTPUT_PER_BATCH = 1;
const SMELT_STAMINA_PER_BATCH = 15;
const SMELT_SMITHING_EXP = 5;
const SMELT_VIT_EXP = 0.5;
const SMELT_POWER_SPEED = 0.1;
const SMELT_COPPER_POWER = 1;
const SMELT_TIN_POWER = 1;
const SMELT_IRON_POWER = 2;
const SMELT_GOLD_POWER = 3;
// "Trees Harvest" action: one selected fruit/nut tree is harvested for a
// minute, then gains the Harvested property until the next in-game month.
const TREE_HARVEST_DURATION_SECONDS = 60;
const TREE_HARVEST_AMOUNT_DIVISOR = 100;
const TREE_HARVEST_GARDENING_EXP_PER_SECOND = 0.5;
const TREE_HARVEST_FORAGE_EXP_PER_SECOND = 0.25;
// "Cut Tree" action: one tree is felled exactly every two minutes. The action
// power (Strength, Lumberjack and Chopping power) decides how many Wooden logs
// the felled tree yields.
const CUT_TREE_SECONDS_PER_TREE = 120;
const CUT_TREE_LOGS_PER_POWER = 1;
// Every felled tree also gives Branches, Sticks and Leaves equal to half of
// the action power.
const CUT_TREE_BYPRODUCTS_PER_POWER = 0.5;
// Stamina per second is proportional to the action power: stronger chops cost
// more stamina.
const CUT_TREE_STAMINA_PER_POWER_PER_SECOND = 0.01;
const CUT_TREE_STR_EXP_PER_SECOND = 0.5;
const CUT_TREE_LUMBERJACK_EXP_PER_SECOND = 1;
const ACTION_STAMINA_PER_SECOND = 0.01;
const DAYDREAM_UNLOCK_SECONDS = 30;
const DAYDREAM_EXP_CHANCE = 0.01;
const Activity = Object.freeze({
    Idle: 0,
    Active: 1,
    Done: 2,
});
const TechnologyStatus = Object.freeze({
    NotResearched: "Не исследовано",
    Researching: "исследуется",
    Completed: "Исследование выполнено",
});

let nextStatId = 0;
class Character {
    constructor(maxhp, maxmana, maxstamina)
    {
        this.name = "NameMe";
        this.maxhp = maxhp;
        this.maxmana = maxmana;
        this.maxstamina = maxstamina;
        this.hp = maxhp;
        this.mana = maxmana;
        this.stamina = maxstamina;
        this.hunger = 0;
        this.maxHunger = 1000;
        this.autoEatActive = false;
        this.exp = 0;
        this.lvl = 1;
        this.maxexp = BASE_EXP;
        this.attack = 1;
        this.exploration = new Skill("exploration", "This wonderfull world are just wait ot being explored. you this skill are helps with it.");
        this.forage = new Skill("forage", "Gather the garbage things like a vacuum sucker");
        this.rest = new Skill("rest", "The art of sloth. Poor way to regain stamina");
        this.focus = new Skill("Focus", "The art of concentrating the mind and bending time around a running task.");
        this.wizardy = new Skill("Wizardy", "The art of channeling spent mana into arcane understanding.");
        this.alchemy = new Skill("Alchemy", "The art of mixing minerals, ash and water into useful compounds.");
        this.masonry = new Skill("Masonry", "The art of raising durable stone structures from rocks, mortar and timber.");
        this.pottery = new Skill("Pottery", "The art of shaping clay into sturdy walls, vessels and other fired goods.");
        this.regeneration = new Skill("Regeneration", "WHOA YOUR SEVERED LIMB ARE GROWS BACK AGAIN!");
        this.autism = new Skill("Autism", "The ability to hyperfocus on absolutely random things.");
        this.science = new Skill("Science", "The art of turning curiosity into progress.");
        this.traveling = new Skill("Traveling", "The art of getting somewhere on foot. Each level reduces travel time between tiles by 1%, and every second of travel trains Speed.");
        this.dreammastery = new Skill("DreamMastery", "The art of sleeping with purpose. Each level lowers the sleepyness needed for Sleep and deepens your rest.");
        this.survival = new Skill("Survival", "The art of turning garbage into something slightly less garbage. Required for crafting, and every craft trains it.");
        this.ropemaking = new Skill("Ropemaking", "Twisting plant fibers into ropes, strings and other useful knots.");
        this.tailoring = new Skill("Tailoring", "The art of turning fibers into cloth and other soft things.");
        this.carpentry = new Skill("Carpentry", "The art of turning sticks into straight shafts and useful wooden parts.");
        this.architecture = new Skill("Architecture", "The art of planning and raising durable buildings.");
        this.gardening = new Skill("Gardening", "The art of tending fruit and nut trees and gathering their harvest.");
        this.digging = new Skill("Digging", "The art of moving earth, stone and foundations.");
        this.mining = new Skill("Mining", "The art of breaking stone and extracting ore from the earth.");
        this.smithing = new Skill("Smithing", "The art of smelting ore and working refined metal into bars.");
        this.cooking = new Skill("Cooking", "The art of turning raw ingredients into proper meals.");
    this.milling = new Skill("Milling", "The art of grinding grain into flour with a stone.");
        this.lumberjack = new Skill("Lumberjack", "The art of felling trees and turning them into useful timber.");
        this.str = new Stat("Strengh", "Be stronk, smash hard");
        this.agi = new Stat("Agility", "I AM SICK **CK A LIKE A QUICK **CK");
        this.vit = new Stat("Vitality", "Be unstoppable working horse");
        this.per = new Stat("Perception", "You smell it? Is it's stinks or tasty? How it's looks? Are you notice something?<br> Yeah, perception is helps to answer that questions");
        this.int = new Stat("Intellect", "Some situations need a logical solution. But using it <br>in wrong situations can blow your mind, or skull.");
        this.ins = new Stat("Insight", "Inner guide which helps you to solve solutions where intellect cant. <br>You dont know how it's works. Your inner guide");
        this.sou = new Stat("Soul", "Are you lack of soul? HOW DARE YOU!");
        this.luck = new Stat("Luck", "You dont know how it works... probably.");
        this.speed = new Stat("Speed", "GOTTA GO FAST");
        this.speed.lvl = STARTING_SPEED_LEVEL;
        this.speed.exp = this.speed.lvl * BASE_EXP;
        this.equipinventory = new Array(EQUIPMENT_SLOTS);
        this.equipment = createEmptyEquipment();
        this.sleepyness = 0;
    }
}
function addPlayerExp(amount) {
    if (!player || amount <= 0) return;

    amount *= getGlobalPropertyMultiplier("characterExp");

    player.maxexp = player.maxexp || BASE_EXP;
    player.exp += amount;

    while (player.exp >= player.maxexp) {
        player.exp -= player.maxexp;
        player.lvl += 1;
        player.maxexp = player.lvl * BASE_EXP;
        logMessage("Your character are now level " + player.lvl);
    }

    if (typeof calculateStats === "function") calculateStats();
}
// Potential is not capped at 100%: values above 100% increase experience gain.
// Returns the amount actually added.
function increasePotential(entry, amount) {
    if (!entry || !Number.isFinite(amount) || amount <= 0) return 0;

    const current = Number.isFinite(entry.potential) ? entry.potential : 0;
    entry.potential = current + amount;
    return amount;
}
function increaseAllPotentials(percent) {
    const amount = MAX_POTENTIAL * percent / PERCENT;

    CORE_STAT_NAMES.forEach(function (statName) {
        if (player && player[statName]) increasePotential(player[statName], amount);
    });
    LEARNABLE_SKILL_KEYS.forEach(function (skillName) {
        if (player && player[skillName]) increasePotential(player[skillName], amount);
    });
}
function addStatLevels(statNames, amount) {
    statNames.forEach(function (statName) {
        const stat = player && player[statName];
        if (!stat) return;

        for (let level = 0; level < amount; level++) {
            stat.lvl += 1;
            stat.exp = stat.lvl * BASE_EXP;
            stat.potential = Math.max(getMinPotential(), stat.potential * STAT_POTENTIAL_DECAY);
            logMessage("Your " + stat.name + " are now level " + stat.lvl);
            addPlayerExp(stat.lvl);

            if (statName === "int" && typeof focusPoints === "number") {
                focusPoints += 1;
                updateFocusPointsDisplay();
            }
        }
    });
}
class Technology {
    constructor(name, description, requiredResearch, buttonId, requirements, rewards, maxLevel, levelDescriptions, onComplete)
    {
        this.name = name;
        this.description = description;
        this.requiredResearch = requiredResearch;
        this.buttonId = buttonId;
        this.requirements = requirements;
        this.rewards = rewards || null;
        this.maxLevel = maxLevel || 1;
        this.levelDescriptions = levelDescriptions || null;
        this.onComplete = onComplete || null;
        this.level = 0;
        this.researchPoints = this.getRequiredResearch();
        this.status = TechnologyStatus.NotResearched;
    }
    getLevelsDescription() {
        if (!this.levelDescriptions) return "";

        if (typeof this.levelDescriptions === "function") {
            return this.levelDescriptions(this);
        }

        return this.levelDescriptions.map(function (description, index) {
            return "Lv" + (index + 1) + ": " + description;
        }).join("<br>");
    }
    getRequiredResearch() {
        return typeof this.requiredResearch === "function"
            ? this.requiredResearch(this.level)
            : this.requiredResearch;
    }
    getDescription() {
        return typeof this.description === "function"
            ? this.description(this)
            : this.description;
    }
    get researchProgress() {
        const required = this.getRequiredResearch();
        return required > 0 ? 1 - this.researchPoints / required : 1;
    }
    meetsRequirements() {
        return !this.requirements || this.requirements(this);
    }
    addResearch(amount) {
        if (this.status === TechnologyStatus.Completed || amount <= 0) return 0;

        const before = this.researchPoints;
        this.researchPoints = Math.max(0, this.researchPoints - amount);
        const spent = before - this.researchPoints;

        if (this.researchPoints > 0 && this.status !== TechnologyStatus.Researching) {
            this.status = TechnologyStatus.Researching;
        }

        return spent;
    }
    grantRewards(player) {
        if (!this.rewards) return;

        const rewards = this.rewards;
        Object.keys(rewards).forEach(function (statKey) {
            if (player[statKey]) player[statKey].addexp(rewards[statKey]);
        });
    }
    completeResearchLevel(player) {
        if (this.status === TechnologyStatus.Completed) return;

        this.level += 1;
        this.grantRewards(player);
        if (typeof this.onComplete === "function") this.onComplete(player, this);

        if (this.level >= this.maxLevel) {
            this.status = TechnologyStatus.Completed;
        } else {
            this.researchPoints = this.getRequiredResearch();
            this.status = TechnologyStatus.NotResearched;
        }
    }
    applyResearchProgress(amount, player) {
        if (this.status === TechnologyStatus.Completed) return false;

        const spent = this.addResearch(amount);
        if (spent > 0 && player.science) player.science.addexp(spent);

        if (this.researchPoints <= 0) {
            this.completeResearchLevel(player);
            return true;
        }

        return false;
    }
}
class Equipment {
    constructor (slot, attack, def, rarity, quality)
    {
        this.slot = slot;
        this.attack = attack;
        this.def = def;
        this.rarity = rarity;
        this.quality = quality;
    }
}

function getStatPropertyKey(stat) {
    if (typeof player === "undefined" || !player) return null;

    for (let index = 0; index < CORE_STAT_NAMES.length; index++) {
        const key = CORE_STAT_NAMES[index];
        if (player[key] === stat) return key;
    }

    return null;
}

class Stat {
    constructor (name, description)
    {
        this.description = description;
        this.name = name;
        this.exp = BASE_EXP;
        this.lvl = 1;
        this.potential = MAX_POTENTIAL;
        this.id = nextStatId;
        nextStatId++;
    }
    addexp(amount){
        if (typeof getEquippedPropertyMultiplier === "function") {
            const propertyKey = getStatPropertyKey(this);
            if (propertyKey) {
                amount *= getEquippedPropertyMultiplier("stat", propertyKey);
            }
        }
        while (amount > 0) {
            if ((amount * this.potential/MAX_POTENTIAL) > this.exp)
            {
                this.lvl +=1;
                amount -= this.exp/this.potential*MAX_POTENTIAL;
                this.exp = this.lvl*BASE_EXP;
                this.potential = Math.max(getMinPotential(), this.potential * STAT_POTENTIAL_DECAY);
                logMessage("Your " + this.name + " are now level " + this.lvl);
                addPlayerExp(this.lvl);
                if (typeof player !== "undefined" && player && player.int === this) {
                    focusPoints += 1;
                    updateFocusPointsDisplay();
                }
                
            }
            else {this.exp -= ( amount * this.potential/MAX_POTENTIAL); amount = 0; calculateStats();}

        }
    }
    clone(cloned){
        this.name = cloned.name;
        this.exp = cloned.exp;
        this.lvl = cloned.lvl;
        this.potential = cloned.potential;
        this.description = cloned.description;
    }
}
class Skill {
    constructor (name, description)
    {
        this.name = name;
        this.exp = BASE_EXP;
        this.lvl = 1;
        this.potential = MAX_POTENTIAL;
        this.description = description
    }
    addexp(amount){
        if (typeof getEquippedPropertyMultiplier === "function") {
            amount *= getEquippedPropertyMultiplier("skill", this.name.toLowerCase());
        }
        while (amount > 0) {
            const skillKey = this.name.toLowerCase();
            if (this.lvl == 1 && this.exp == BASE_EXP && this.potential && LEARNABLE_SKILL_KEYS.includes(skillKey)){
               createSkillBar(skillKey);
            }
            if ((amount * this.potential/MAX_POTENTIAL) > this.exp)
            {
                this.lvl +=1;
                amount -= this.exp * MAX_POTENTIAL / this.potential;
                this.exp = this.lvl*BASE_EXP;
                this.potential = Math.max(getMinPotential(), this.potential * SKILL_POTENTIAL_DECAY);
                if (!(skillKey === "autism" && suppressAutismLevelLogs)) {
                    logMessage("Your " + this.name + " are now level " + this.lvl);
                }
                addPlayerExp(this.lvl);
            }
            else {this.exp -= ( amount * this.potential/MAX_POTENTIAL); amount = 0}
        }
    }
    clone(cloned){
        this.name = cloned.name;
        this.exp = cloned.exp;
        this.lvl = cloned.lvl;
        this.potential = cloned.potential;
        this.description = cloned.description;
    }
}
const RESOURCE_DEFAULT_QUALITY = 1;

class ResourceStack{
    constructor(resourceId)
    {
        if (!RESOURCE_DEFS[resourceId]) {
            throw new Error("Unknown resource id: " + resourceId);
        }

        this.id = resourceId;
        // Resource quality works like item quality: a plain number, 1 by default.
        // Gathered batches are blended into it by weight in modify().
        this.quality = RESOURCE_DEFAULT_QUALITY;
        this.amount = 0;
    }
    get definition(){
        return RESOURCE_DEFS[this.id];
    }
    get name(){
        return this.definition.name;
    }
    get weight(){
        return this.definition.weight;
    }
    get unitType(){
        return this.definition.unitType;
    }
    get description(){
        return this.definition.description;
    }
    get category(){
        return this.definition.category;
    }
    get RestoresHunger(){
        return this.definition.RestoresHunger === true;
    }
    get Tastymeter(){
        return this.definition.Tastymeter;
    }
    // Weighted average: every added batch shifts the stack quality exactly by
    // its share of the total amount.
    //   Q = (Q_old * amount_old + Q_new * amount_new) / (amount_old + amount_new)
    // Amount is incremented by the caller (addResource) after this call.
    modify(volume, quality){
        const added = Number(volume);
        if (!Number.isFinite(added) || added <= 0) {
            if (added === 0) logMessage("ZERO IN VOLUME! U BROEK IT! U BROKE THE STONKS!");
            return this.quality;
        }

        const currentAmount = Number.isFinite(this.amount) ? this.amount : 0;
        const currentQuality = Number.isFinite(this.quality)
            ? this.quality
            : RESOURCE_DEFAULT_QUALITY;
        const batchQuality = Number.isFinite(quality) && quality > 0
            ? quality
            : RESOURCE_DEFAULT_QUALITY;
        const total = currentAmount + added;

        this.quality = (currentQuality * currentAmount + batchQuality * added) / total;
        return this.quality;
    }
}


