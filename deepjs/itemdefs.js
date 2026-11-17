// Items live in their own namespace, separate from RESOURCE_IDS / RESOURCE_DEFS.
// Resources are raw materials (berries, rocks, sticks), items are crafted,
// carried or equipped objects with their own ids, slots and stats.
const ITEM_ID_BASE = 5000;

const ITEM_IDS = Object.freeze({
    HANDY_STICK: ITEM_ID_BASE + 1,
    LEAF_OF_NATURE: ITEM_ID_BASE + 2,
    // Leaf clothing set: head, body and leg slots plus the paired glove,
    // wrist and ankle slots. Rings and earrings are excluded; arms use
    // foraging tools such as the Handy Stick or Flint Knife. Pants keep
    // Leaf of Nature as the default item.
    // Removed items leave their old ids unused so existing ids never shift:
    // +10/+11 arm wraps, +13 glove II, +15 wristband II, +20 anklet II.
    LEAF_HOOD: ITEM_ID_BASE + 3,
    LEAF_MASK: ITEM_ID_BASE + 4,
    LEAF_NECKLACE: ITEM_ID_BASE + 5,
    LEAF_SHIRT: ITEM_ID_BASE + 6,
    LEAF_SHOULDERPADS: ITEM_ID_BASE + 7,
    LEAF_CLOAK: ITEM_ID_BASE + 8,
    LEAF_BELT: ITEM_ID_BASE + 9,
    LEAF_GLOVE_I: ITEM_ID_BASE + 12,
    LEAF_WRISTBAND_I: ITEM_ID_BASE + 14,
    LEAF_TROUSERS: ITEM_ID_BASE + 16,
    LEAF_LEGGINGS: ITEM_ID_BASE + 17,
    LEAF_BOOTS: ITEM_ID_BASE + 18,
    LEAF_ANKLET_I: ITEM_ID_BASE + 19,
    // Tools derived from the Handy Stick. Only knives keep its foraging bonus.
    FLINT_KNIFE: ITEM_ID_BASE + 21,
    STONE_HAMMER: ITEM_ID_BASE + 22,
    // Id 23 used to be the Flint Shovel. Keeping the id turns old saved
    // shovels into pickaxes instead of deleting them.
    FLINT_PICKAXE: ITEM_ID_BASE + 23,
    FLINT_SPEAR: ITEM_ID_BASE + 24,
    SURVIVAL_POUNCH: ITEM_ID_BASE + 25,
    STRAW_BASKET_BACKPACK: ITEM_ID_BASE + 26,
    STONE_AXE: ITEM_ID_BASE + 27,
    KEBOB_ON_STICK: ITEM_ID_BASE + 28,
    LADLE: ITEM_ID_BASE + 29,
    WOODEN_FORK: ITEM_ID_BASE + 30,
    WOODEN_SPOON: ITEM_ID_BASE + 31,
    WOODEN_BOWL: ITEM_ID_BASE + 32,
    WOODEN_LITTLE_SPOON: ITEM_ID_BASE + 33,
    WOODEN_MUG: ITEM_ID_BASE + 34,
    CARVED_WOODEN_PLATE: ITEM_ID_BASE + 35,
    CLAY_POT: ITEM_ID_BASE + 36,
    PORRIDGE: ITEM_ID_BASE + 37,
    SALAD: ITEM_ID_BASE + 38,
    FRUITS_SALAD: ITEM_ID_BASE + 39,
    FLAT_BREAD: ITEM_ID_BASE + 40,
    SHAWERMA: ITEM_ID_BASE + 41,
    SOUP: ITEM_ID_BASE + 42,
    DOUGH: ITEM_ID_BASE + 43,
    SWEET_DOUGH: ITEM_ID_BASE + 44,
    BREAD: ITEM_ID_BASE + 45,
    TOAST_BREAD: ITEM_ID_BASE + 46,
    RAW_SPAGHETTI: ITEM_ID_BASE + 47,
    LINGUINE: ITEM_ID_BASE + 48,
    CAPELLINI: ITEM_ID_BASE + 49,
    BUCATINI: ITEM_ID_BASE + 50,
    TAGLIATELLE: ITEM_ID_BASE + 51,
    FETTUCCINE: ITEM_ID_BASE + 52,
    PAPPARDELLE: ITEM_ID_BASE + 53,
    PENNE: ITEM_ID_BASE + 54,
    MACARONI: ITEM_ID_BASE + 55,
    RIGATONI: ITEM_ID_BASE + 56,
    FUSILLI: ITEM_ID_BASE + 57,
    FARFALLE: ITEM_ID_BASE + 58,
    RAVIOLI: ITEM_ID_BASE + 59,
    TORTELLINI: ITEM_ID_BASE + 60,
    LASAGNE_SHEETS: ITEM_ID_BASE + 61,
    NOODLES: ITEM_ID_BASE + 62,
    BONE_HELM: ITEM_ID_BASE + 63,
    WOLF_HOOD: ITEM_ID_BASE + 64,
    IRON_MASK: ITEM_ID_BASE + 65,
    BEAST_NECKLACE: ITEM_ID_BASE + 66,
    BONE_CHESTPLATE: ITEM_ID_BASE + 67,
    SPIKED_PAULDRONS: ITEM_ID_BASE + 68,
    HUNTER_CLOAK: ITEM_ID_BASE + 69,
    WAR_BELT: ITEM_ID_BASE + 70,
    LEATHER_GLOVES: ITEM_ID_BASE + 71,
    BONE_BRACERS: ITEM_ID_BASE + 72,
    PADDED_TROUSERS: ITEM_ID_BASE + 73,
    IRON_GREAVES: ITEM_ID_BASE + 74,
    STEEL_BOOTS: ITEM_ID_BASE + 75,
    RING_OF_FURY: ITEM_ID_BASE + 76,
    PREDATOR_BAND: ITEM_ID_BASE + 77,
    FOCUS_EARRING: ITEM_ID_BASE + 78,
    SWIFT_ANKLET: ITEM_ID_BASE + 79,
    BONE_CLUB: ITEM_ID_BASE + 80,
    IRON_SWORD: ITEM_ID_BASE + 81,
    HUNTING_SPEAR: ITEM_ID_BASE + 82,
    POISONED_DAGGER: ITEM_ID_BASE + 83,
    BUTCHER_CLEAVER: ITEM_ID_BASE + 84,
    GUARDBREAKER_AXE: ITEM_ID_BASE + 85,
    MAYONNAISE: ITEM_ID_BASE + 86,
    KETCHUP: ITEM_ID_BASE + 87,
    MUSTARD_SAUCE: ITEM_ID_BASE + 88,
    PESTO: ITEM_ID_BASE + 89,
    CARBONARA_SAUCE: ITEM_ID_BASE + 90,
    AIOLI: ITEM_ID_BASE + 91,
    TARTAR_SAUCE: ITEM_ID_BASE + 92,
    TZATZIKI: ITEM_ID_BASE + 93,
    MARINARA_SAUCE: ITEM_ID_BASE + 94,
    BOLOGNESE_SAUCE: ITEM_ID_BASE + 95,
    ARRABBIATA_SAUCE: ITEM_ID_BASE + 96,
    ALFREDO_SAUCE: ITEM_ID_BASE + 97,
    PESTO_ROSSO: ITEM_ID_BASE + 98,
    SALSA_VERDE: ITEM_ID_BASE + 99,
    CHIMICHURRI: ITEM_ID_BASE + 100,
    ROMESCO: ITEM_ID_BASE + 101,
    TAHINI: ITEM_ID_BASE + 102,
    HUMMUS: ITEM_ID_BASE + 103,
    SATAY_SAUCE: ITEM_ID_BASE + 104,
    TERIYAKI_SAUCE: ITEM_ID_BASE + 105,
    SWEET_CHILI_SAUCE: ITEM_ID_BASE + 106,
    BBQ_SAUCE: ITEM_ID_BASE + 107,
    HONEY_MUSTARD_SAUCE: ITEM_ID_BASE + 108,
    GARLIC_HERB_SAUCE: ITEM_ID_BASE + 109,
    CURRY_SAUCE: ITEM_ID_BASE + 110,
    MUSHROOM_SAUCE: ITEM_ID_BASE + 111,
    PEPPER_SAUCE: ITEM_ID_BASE + 112,
    AVOCADO_SAUCE: ITEM_ID_BASE + 113,
    POMEGRANATE_SAUCE: ITEM_ID_BASE + 114,
    APPLE_SAUCE: ITEM_ID_BASE + 115,
    SPAGHETTI_AGLIO_E_OLIO: ITEM_ID_BASE + 116,
    SPAGHETTI_CARBONARA: ITEM_ID_BASE + 117,
    SPAGHETTI_BOLOGNESE: ITEM_ID_BASE + 118,
    PENNE_ARABBIATA: ITEM_ID_BASE + 119,
    LINGUINE_PESTO: ITEM_ID_BASE + 120,
    RIGATONI_MARINARA: ITEM_ID_BASE + 121,
    FETTUCCINE_ALFREDO: ITEM_ID_BASE + 122,
    LASAGNE: ITEM_ID_BASE + 123,
    RAVIOLI_DISH: ITEM_ID_BASE + 124,
    TORTELLINI_DISH: ITEM_ID_BASE + 125,
    MACARONI_BAKE: ITEM_ID_BASE + 126,
    GNOCCHI: ITEM_ID_BASE + 127,
    RISOTTO: ITEM_ID_BASE + 128,
    POLENTA: ITEM_ID_BASE + 129,
    PIZZA_MARGHERITA: ITEM_ID_BASE + 130,
    BRUSCHETTA: ITEM_ID_BASE + 131,
    CAPRESE_SALAD: ITEM_ID_BASE + 132,
    PANZANELLA: ITEM_ID_BASE + 133,
    ARANCINI: ITEM_ID_BASE + 134,
    FRITTATA: ITEM_ID_BASE + 135,
    BORSCHT: ITEM_ID_BASE + 136,
    SHCHI: ITEM_ID_BASE + 137,
    RASSOLNIK: ITEM_ID_BASE + 138,
    SOLYANKA: ITEM_ID_BASE + 139,
    OLIVIER_SALAD: ITEM_ID_BASE + 140,
    VINAIGRETTE: ITEM_ID_BASE + 141,
    PELMENI: ITEM_ID_BASE + 142,
    VARENYKY: ITEM_ID_BASE + 143,
    BEEF_STROGANOFF: ITEM_ID_BASE + 144,
    CHICKEN_KIEV: ITEM_ID_BASE + 145,
    GOLUBTSY: ITEM_ID_BASE + 146,
    PLOV: ITEM_ID_BASE + 147,
    BUCKWHEAT_MUSHROOMS: ITEM_ID_BASE + 148,
    MASHED_POTATOES: ITEM_ID_BASE + 149,
    FRIED_POTATOES: ITEM_ID_BASE + 150,
    DRANIKI: ITEM_ID_BASE + 151,
    MILLET_KASHA: ITEM_ID_BASE + 152,
    OATMEAL: ITEM_ID_BASE + 153,
    BLINI: ITEM_ID_BASE + 154,
    PIROZHKI: ITEM_ID_BASE + 155,
    BELYASH: ITEM_ID_BASE + 156,
    CHEBUREKI: ITEM_ID_BASE + 157,
    MUSHROOM_SOUP: ITEM_ID_BASE + 158,
    PEA_SOUP: ITEM_ID_BASE + 159,
    MAKARONY_FLOTSKI: ITEM_ID_BASE + 160,
    TUSHONKA: ITEM_ID_BASE + 161,
    KOTLETA: ITEM_ID_BASE + 162,
    BEET_SALAD: ITEM_ID_BASE + 163,
    CARROT_SALAD: ITEM_ID_BASE + 164,
    CABBAGE_SALAD: ITEM_ID_BASE + 165,
    KOMPOT: ITEM_ID_BASE + 166,
    KISSEL: ITEM_ID_BASE + 167,
    BAKED_APPLES: ITEM_ID_BASE + 168,
    APPLE_CHARLOTTE: ITEM_ID_BASE + 169,
    NAPOLEON_CAKE: ITEM_ID_BASE + 170,
    HONEY_CAKE: ITEM_ID_BASE + 171,
    PIZZA_DIAVOLA: ITEM_ID_BASE + 172,
    PIZZA_CAPRICCIOSA: ITEM_ID_BASE + 173,
    PIZZA_QUATTRO_STAGIONI: ITEM_ID_BASE + 174,
    PIZZA_FUNGHI: ITEM_ID_BASE + 175,
    PIZZA_POLLO: ITEM_ID_BASE + 176,
    PIZZA_BBQ_CHICKEN: ITEM_ID_BASE + 177,
    PIZZA_PESTO: ITEM_ID_BASE + 178,
    PIZZA_MARINARA: ITEM_ID_BASE + 179,
    PIZZA_NAPOLETANA: ITEM_ID_BASE + 180,
    PIZZA_MEDITERRANEAN: ITEM_ID_BASE + 181,
    PIZZA_VEGETARIANA: ITEM_ID_BASE + 182,
    PIZZA_SPINACI: ITEM_ID_BASE + 183,
    PIZZA_PATATE: ITEM_ID_BASE + 184,
    PIZZA_CIPOLLA: ITEM_ID_BASE + 185,
    PIZZA_UOVO: ITEM_ID_BASE + 186,
    PIZZA_RUSTICA: ITEM_ID_BASE + 187,
    PIZZA_ZUCCA: ITEM_ID_BASE + 188,
    PIZZA_BARBABIETOLA: ITEM_ID_BASE + 189,
    PIZZA_CAVOLO: ITEM_ID_BASE + 190,
    PIZZA_PISELLI: ITEM_ID_BASE + 191,
    PIZZA_MAIS: ITEM_ID_BASE + 192,
    PIZZA_AGLIO_ERBE: ITEM_ID_BASE + 193,
    PIZZA_DOLCE: ITEM_ID_BASE + 194,
    PIZZA_FRUTTI_BOSCO: ITEM_ID_BASE + 195,
    SOY_SAUCE: ITEM_ID_BASE + 300,
    HOISIN_SAUCE: ITEM_ID_BASE + 301,
    SRIRACHA: ITEM_ID_BASE + 302,
    GOCHUJANG_SAUCE: ITEM_ID_BASE + 303,
    PONZU_SAUCE: ITEM_ID_BASE + 304,
    PLUM_SAUCE: ITEM_ID_BASE + 305,
    KOREAN_BBQ_SAUCE: ITEM_ID_BASE + 306,
    GYOZA_SAUCE: ITEM_ID_BASE + 307,
    TEMPURA_SAUCE: ITEM_ID_BASE + 308,
    RAMEN: ITEM_ID_BASE + 310,
    PAD_THAI: ITEM_ID_BASE + 311,
    FRIED_RICE: ITEM_ID_BASE + 312,
    CHICKEN_TERIYAKI: ITEM_ID_BASE + 313,
    BULGOGI: ITEM_ID_BASE + 314,
    BIBIMBAP: ITEM_ID_BASE + 315,
    GYOZA: ITEM_ID_BASE + 316,
    SPRING_ROLLS: ITEM_ID_BASE + 317,
    TEMPURA: ITEM_ID_BASE + 318,
    CHICKEN_KATSU: ITEM_ID_BASE + 319,
    JAPANESE_CURRY: ITEM_ID_BASE + 320,
    KUNG_PAO_CHICKEN: ITEM_ID_BASE + 321,
    SWEET_SOUR_CHICKEN: ITEM_ID_BASE + 322,
    CHOW_MEIN: ITEM_ID_BASE + 323,
    NASI_GORENG: ITEM_ID_BASE + 324,
    OKONOMIYAKI: ITEM_ID_BASE + 325,
    YAKITORI: ITEM_ID_BASE + 326,
});

const ITEM_KINDS = Object.freeze({
    Equipment: "equipment",
    Tool: "tool",
    Consumable: "consumable",
    Trinket: "trinket",
});

const ITEM_RARITIES = Object.freeze({
    Junk: "junk",
    Common: "common",
    Uncommon: "uncommon",
    SomewhatRare: "somewhat-rare",
    Rare: "rare",
    RareRare: "rare-rare",
    Unique: "unique",
    MoreUniq: "more-uniq",
    Epic: "epic",
    Galaxic: "galaxic",
});

// Single source of truth for rarity colours and multipliers.
// `color` is the fill, `outlineColor` is the outline around it and
// `outlineWidth` is that outline in pixels. `multiplier` scales the
// effective quality and stats of an ItemInstance (see ItemInstance below).
const ITEM_RARITY_DEFS = Object.freeze({
    [ITEM_RARITIES.Junk]: Object.freeze({
        id: ITEM_RARITIES.Junk,
        label: "Junk",
        color: "#a3a3a3",
        outlineColor: "#000000",
        outlineWidth: 1,
        multiplier: 0.5,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.Common]: Object.freeze({
        id: ITEM_RARITIES.Common,
        label: "Common",
        color: "#ffffff",
        outlineColor: "#000000",
        outlineWidth: 1,
        multiplier: 1,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.Uncommon]: Object.freeze({
        id: ITEM_RARITIES.Uncommon,
        label: "Uncommon",
        color: "#4fc45c",
        outlineColor: "#145c22",
        outlineWidth: 1,
        multiplier: 1.2,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.SomewhatRare]: Object.freeze({
        id: ITEM_RARITIES.SomewhatRare,
        label: "Somewhat rare",
        color: "#8fd8ff",
        outlineColor: "#1f5fa8",
        outlineWidth: 1,
        multiplier: 1.6,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.Rare]: Object.freeze({
        id: ITEM_RARITIES.Rare,
        label: "Rare",
        color: "#3b82f6",
        outlineColor: "#102b6b",
        outlineWidth: 1,
        multiplier: 2,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.RareRare]: Object.freeze({
        id: ITEM_RARITIES.RareRare,
        label: "RareRare",
        color: "#b45cff",
        outlineColor: "#15236b",
        outlineWidth: 1,
        multiplier: 2.5,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.Unique]: Object.freeze({
        id: ITEM_RARITIES.Unique,
        label: "Unique",
        color: "#ffd700",
        outlineColor: "#ff8c00",
        outlineWidth: 1,
        multiplier: 3,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.MoreUniq]: Object.freeze({
        id: ITEM_RARITIES.MoreUniq,
        label: "MoreUniq",
        color: "#ff9a1f",
        outlineColor: "#8b0000",
        outlineWidth: 1,
        multiplier: 4,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.Epic]: Object.freeze({
        id: ITEM_RARITIES.Epic,
        label: "Epic",
        color: "#ff2020",
        outlineColor: "#7a0000",
        outlineWidth: 2,
        multiplier: 5,
        bold: false,
        glow: null,
    }),
    [ITEM_RARITIES.Galaxic]: Object.freeze({
        id: ITEM_RARITIES.Galaxic,
        label: "Galaxic",
        color: "#0a0a0a",
        outlineColor: "#b026ff",
        outlineWidth: 1,
        multiplier: 7,
        bold: true,
        glow: "#b026ff",
    }),
});

// --- random item properties (affixes) -------------------------------------
// New properties are either a level bonus or a growth bonus, targeting one
// core stat or learnable skill. Every item value uses the same unified power
// formula: base * sqrt(quality * rarity) * variance, where quality is the
// item's level and variance is a 50%-150% roll.
const ITEM_PROPERTY_LEVEL_BASE_PERCENT = 0.2;
const ITEM_PROPERTY_GROWTH_BASE_PERCENT = 0.2;
const ITEM_PROPERTY_VARIANCE_MIN = 0.5;
const ITEM_PROPERTY_VARIANCE_MAX = 1.5;

// Standalone item effects that do not target a stat/skill.
const ITEM_GLOBAL_PROPERTY_DEFS = Object.freeze([
    { key: "maxhp", label: "Max HP", basePercent: 0.05 },
    { key: "maxmana", label: "Max Mana", basePercent: 0.05 },
    { key: "maxsp", label: "Max SP", basePercent: 0.05 },
    { key: "hpregen", label: "HP regen", basePercent: 0.05 },
    { key: "manaregen", label: "Mana regen", basePercent: 0.05 },
    { key: "spregen", label: "SP regen", basePercent: 0.05 },
    { key: "characterExp", label: "Character level exp", basePercent: 0.10 },
    { key: "sleepRegen", label: "Sleepyness regen while sleeping", basePercent: 0.10 },
    { key: "travelSpeed", label: "Travelling speed", basePercent: 0.10 },
    { key: "pounchSlots", label: "Pounch slots", flatValue: 1, kind: "flat" },
    { key: "itemSlots", label: "Inventory slots", flatValue: 3, kind: "flat" },
    { key: "rareItemsChance", label: "Rare items chance", basePercent: 0.10, kind: "percent" },
    { key: "tilesMoveSpeed", label: "Tiles move speed", basePercent: 0.20, kind: "percent" },
    { key: "sleepSpeed", label: "Sleep speed", basePercent: 0.10, kind: "percent" },
    // Focus modifiers. The timeskip bonus is a straight increase of the
    // skipped seconds; the cost reduction is stored as a positive percentage
    // and displayed with a minus sign, like reduceHungerUse above.
    { key: "focusTimeskip", label: "Focus time skip", basePercent: 0.10 },
    { key: "focusCost", label: "Focus cost", basePercent: 0.05, displaySign: -1 },
    // These buffs use the same unified quality * rarity scaling as every other
    // item value. `displaySign: -1` shows ReduceHungerUse as a negative value
    // even though its stored bonus is positive and is subtracted from the
    // hunger gain multiplier.
    { key: "reduceHungerUse", label: "Hunger use", basePercent: 0.10, displaySign: -1 },
    { key: "maxHunger", label: "Max Hunger", basePercent: 0.15 },
    { key: "harvestFruitAmount", label: "Harvest fruit amount", basePercent: 0.05 },
    { key: "harvestForageAmount", label: "Harvest forage amount", basePercent: 0.05 },
    // Tool power modifiers. AllToolsPowerMult multiplies every tool power;
    // ToolPowerX targets one randomly chosen power type and the two multiply
    // each other. ChopYield increases Cut Tree output, but never Fertile Soil.
    { key: "allToolsPowerMult", label: "All tools power", basePercent: 0.10 },
    { key: "chopYield", label: "Chop yield", basePercent: 0.05 },
]);

// ToolPowerX is stored as one key per power type, for example
// "toolPower:chopping". A single template algorithm picks one random type at
// property roll time, so the player never sees a generic "all types" variant.
const TOOL_POWER_PROPERTY_PREFIX = "toolPower:";

function getToolPowerPropertyKey(type) {
    return TOOL_POWER_PROPERTY_PREFIX + String(type);
}

function getToolPowerTypeFromPropertyKey(key) {
    if (typeof key !== "string"
        || key.indexOf(TOOL_POWER_PROPERTY_PREFIX) !== 0) {
        return null;
    }

    const type = key.slice(TOOL_POWER_PROPERTY_PREFIX.length);
    return type || null;
}

const ITEM_RARITY_PROPERTY_COUNTS = Object.freeze({
    [ITEM_RARITIES.Junk]: 0,
    [ITEM_RARITIES.Common]: 0,
    [ITEM_RARITIES.Uncommon]: 1,
    [ITEM_RARITIES.SomewhatRare]: 2,
    [ITEM_RARITIES.Rare]: 3,
    [ITEM_RARITIES.RareRare]: 4,
    [ITEM_RARITIES.Unique]: 5,
    [ITEM_RARITIES.MoreUniq]: 6,
    [ITEM_RARITIES.Epic]: 8,
    [ITEM_RARITIES.Galaxic]: 10,
});

// `quality` below is a fixed base grade of the item definition, a plain number.
// It is deliberately not the same value as ResourceStack.quality:
// resource quality is a running weighted average of gathered batches,
// while item quality is a property of the item itself. A live ItemInstance
// gets its own `quality`, which starts from the definition value and may be
// changed by crafting, wear or upgrades.
// Every leaf clothing item is mechanically identical to Leaf of Nature. Only
// the name, slot and icon differ, so the shared properties live in one place.
function createLeafClothingDefinition(id, name, slot, icon, equipSlots, description) {
    const allowedSlots = Array.isArray(equipSlots) && equipSlots.length
        ? equipSlots.slice()
        : [slot];

    return Object.freeze({
        id: id,
        name: name,
        kind: ITEM_KINDS.Equipment,
        slot: slot,
        equipSlots: Object.freeze(allowedSlots),
        stackable: false,
        weight: 0.01,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 10,
        icon: icon,
        stats: Object.freeze({ defence: 1 }),
        description: description || "Just like Adam or Eva. Better than nothing!",
    });
}

// Every tool can be held in either arm. Tools share the same combat stats;
// only the Handy Stick and knives additionally help with foraging. Individual
// tools may carry one or several tool power options (cutting, chopping,
// mining, digging or smash).
const TOOL_BASE_STATS = Object.freeze({
    attack: 1,
});
const FORAGING_TOOL_STATS = Object.freeze({
    attack: TOOL_BASE_STATS.attack,
    forageFindChance: 2,
    forageQuantity: 1.2,
});
const FORAGING_TOOL_SLOTS = Object.freeze(["arm1", "arm2"]);
const TOOL_DESCRIPTION = "A sturdy tool for gathering materials and fighting.";
const FORAGING_TOOL_DESCRIPTION = "A stick that would be handful with searching a forage stuff<br>that below of grass or between bushes without exceed moverment. <br>Very helpful in foraging.";

// Every arm-held item trains one weapon skill. The skill adds 1% damage and
// 1 hit per level while the item is equipped.
const WEAPON_SKILL_LABELS = Object.freeze({
    axechopping: "Axe chopping",
    swordsswingin: "Swords swingin",
    knifesstabbing: "Knifes stabbing",
    spearsspooning: "Spears spooning",
    brawlbaps: "Brawl Baps",
    hammerscrushworks: "Hammers crushworks",
});

// Cutting, mining, digging, smashing and chopping share the "tool power" type.
// A tool definition may store one or several powers. The effective value of
// each is computed per item instance as
// CurrentPower * sqrt(ItemQuality * ItemRarity) * variance.
const ITEM_TOOL_POWER_TYPES = Object.freeze({
    cutting: Object.freeze({ id: "cutting", label: "Cutting power" }),
    chopping: Object.freeze({ id: "chopping", label: "Chopping power" }),
    mining: Object.freeze({ id: "mining", label: "Mining power" }),
    digging: Object.freeze({ id: "digging", label: "Digging power" }),
    smash: Object.freeze({ id: "smash", label: "Smash power" }),
});

function normalizeToolPowerConfig(config) {
    if (!config || typeof config !== "object") return null;

    const typeDefinition = ITEM_TOOL_POWER_TYPES[config.type];
    if (!typeDefinition) return null;

    const power = Number(config.power);
    if (!Number.isFinite(power) || power <= 0) return null;

    return Object.freeze({
        type: typeDefinition.id,
        power: power,
    });
}

// A tool can carry several powers at once (the Stone Axe cuts and chops), so
// definitions accept either one config or an array of configs. Older single
// power definitions keep working through `toolPower`.
function normalizeToolPowerConfigs(config) {
    const source = Array.isArray(config) ? config : (config ? [config] : []);
    return Object.freeze(source.map(normalizeToolPowerConfig).filter(Boolean));
}

function createToolDefinition(id, name, icon, toolPower, description, stats, weaponSkill) {
    const toolPowers = normalizeToolPowerConfigs(toolPower);

    return Object.freeze({
        id: id,
        name: name,
        kind: ITEM_KINDS.Equipment,
        slot: "arm1",
        equipSlots: FORAGING_TOOL_SLOTS,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 10,
        durability: 40,
        icon: icon,
        stats: Object.freeze(stats || TOOL_BASE_STATS),
        // Legacy first power plus the full list for tools with several powers.
        toolPower: toolPowers[0] || null,
        toolPowers: toolPowers,
        weaponSkill: WEAPON_SKILL_LABELS[weaponSkill] ? weaponSkill : null,
        description: description || TOOL_DESCRIPTION,
    });
}

function createForagingToolDefinition(id, name, icon, toolPower, description, weaponSkill) {
    return createToolDefinition(
        id, name, icon, toolPower,
        description || FORAGING_TOOL_DESCRIPTION,
        FORAGING_TOOL_STATS,
        weaponSkill
    );
}

// Raw dough and uncooked pasta are cooking intermediates: they are not edible
// on their own and exist only as ingredients for later recipes.
function createRawCookingItemDefinition(id, name, icon, description) {
    return Object.freeze({
        id: id,
        name: name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.3,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: icon,
        description: description,
    });
}

function createBakedFoodDefinition(id, name, icon, weight, hungerRestore, description) {
    return Object.freeze({
        id: id,
        name: name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: weight,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: hungerRestore }),
        description: description,
    });
}

// Combat gear shares one shape: a slot (or a list of interchangeable slots),
// combat stats and an icon. Weapons also train a weapon skill.
const RING_SLOT_IDS = Object.freeze(Array.from({ length: 10 }, function (_, index) {
    return "ring" + (index + 1);
}));

function createCombatGearDefinition(id, name, slot, icon, stats, equipSlots, description, weaponSkill) {
    const allowedSlots = Array.isArray(equipSlots) && equipSlots.length
        ? equipSlots.slice()
        : [slot];

    return Object.freeze({
        id: id,
        name: name,
        kind: ITEM_KINDS.Equipment,
        slot: slot,
        equipSlots: Object.freeze(allowedSlots),
        stackable: false,
        weight: 1,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 80,
        icon: icon,
        stats: Object.freeze(stats),
        weaponSkill: WEAPON_SKILL_LABELS[weaponSkill] ? weaponSkill : null,
        description: description,
    });
}

// Every raw pasta shape shares one definition; only name and icon differ.
const PASTA_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_ID_BASE + 47, name: "Raw Spaghetti", icon: "rawspaghetti", description: "Long thin strands of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 48, name: "Linguine", icon: "linguine", description: "Flat narrow strands of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 49, name: "Capellini", icon: "capellini", description: "Very fine hair-thin strands of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 50, name: "Bucatini", icon: "bucatini", description: "Thick hollow tubes of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 51, name: "Tagliatelle", icon: "tagliatelle", description: "Wide flat ribbons of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 52, name: "Fettuccine", icon: "fettuccine", description: "Flat ribbons of raw pasta, a little narrower than tagliatelle." }),
    Object.freeze({ id: ITEM_ID_BASE + 53, name: "Pappardelle", icon: "pappardelle", description: "Very wide ribbons of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 54, name: "Penne", icon: "penne", description: "Short diagonal tubes of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 55, name: "Macaroni", icon: "macaroni", description: "Short curved elbows of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 56, name: "Rigatoni", icon: "rigatoni", description: "Short ridged tubes of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 57, name: "Fusilli", icon: "fusilli", description: "Spiral twists of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 58, name: "Farfalle", icon: "farfalle", description: "Little bow ties of raw pasta." }),
    Object.freeze({ id: ITEM_ID_BASE + 59, name: "Ravioli", icon: "ravioli", description: "Raw pasta parcels with a filling sealed inside." }),
    Object.freeze({ id: ITEM_ID_BASE + 60, name: "Tortellini", icon: "tortellini", description: "Raw pasta rings folded around a filling." }),
    Object.freeze({ id: ITEM_ID_BASE + 61, name: "Lasagne raw sheets", icon: "lasagnerawsheets", description: "Wide flat sheets of raw pasta for layering." }),
    Object.freeze({ id: ITEM_ID_BASE + 62, name: "Noodles", icon: "noodles", description: "Long soft strands of raw noodle dough." }),
]);

const PASTA_ITEM_DEFS = {};
PASTA_ITEM_DEFINITIONS.forEach(function (pasta) {
    PASTA_ITEM_DEFS[pasta.id] = createRawCookingItemDefinition(
        pasta.id, pasta.name, pasta.icon, pasta.description
    );
});

// Sauces are cold-mixed condiments. They are edible on their own, but their
// real value is the potential bonus they carry from oils and fresh
// ingredients into a dish.
const SAUCE_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_ID_BASE + 86, name: "Mayonnaise", icon: "mayonnaise", hunger: 25, description: "A thick, glossy egg and oil emulsion. French kitchen magic." }),
    Object.freeze({ id: ITEM_ID_BASE + 87, name: "Ketchup", icon: "ketchup", hunger: 30, description: "Sweet, tangy tomato sauce. American diner staple." }),
    Object.freeze({ id: ITEM_ID_BASE + 88, name: "Mustard", icon: "mustardsauce", hunger: 20, description: "A sharp yellow paste of crushed mustard and salt. Ancient Roman favourite." }),
    Object.freeze({ id: ITEM_ID_BASE + 89, name: "Pesto", icon: "pesto", hunger: 35, description: "Basil, nuts, garlic and oil pounded into a vivid green paste. Genoese classic." }),
    Object.freeze({ id: ITEM_ID_BASE + 90, name: "Carbonara Sauce", icon: "carbonarasauce", hunger: 40, description: "Egg, meat, garlic and oil whisked into a silky Roman sauce." }),
    Object.freeze({ id: ITEM_ID_BASE + 91, name: "Aioli", icon: "aioli", hunger: 25, description: "A pungent garlic and oil emulsion from the Mediterranean coast." }),
    Object.freeze({ id: ITEM_ID_BASE + 92, name: "Tartar Sauce", icon: "tartarsauce", hunger: 25, description: "Mayonnaise sharpened with cucumber, dill and lemon. French seafood companion." }),
    Object.freeze({ id: ITEM_ID_BASE + 93, name: "Tzatziki", icon: "tzatziki", hunger: 20, description: "Cool cucumber, garlic, mint and oil. Greek summer in a bowl." }),
    Object.freeze({ id: ITEM_ID_BASE + 94, name: "Marinara Sauce", icon: "marinara", hunger: 30, description: "Tomato, garlic and oregano simmered with oil. Southern Italian everyday sauce." }),
    Object.freeze({ id: ITEM_ID_BASE + 95, name: "Bolognese Sauce", icon: "bolognese", hunger: 40, description: "Rich tomato and meat sauce from Bologna. Slow, sturdy and savoury." }),
    Object.freeze({ id: ITEM_ID_BASE + 96, name: "Arrabbiata Sauce", icon: "arrabbiata", hunger: 30, description: "Angry tomato sauce fired up with chili and garlic. Roman heat." }),
    Object.freeze({ id: ITEM_ID_BASE + 97, name: "Alfredo Sauce", icon: "alfredo", hunger: 35, description: "Garlic, egg and oil whipped into a pale, clinging sauce. Roman trattoria fare." }),
    Object.freeze({ id: ITEM_ID_BASE + 98, name: "Pesto Rosso", icon: "pestoroso", hunger: 35, description: "Sun-dried tomato, almond and garlic pesto. Sicilian red cousin of the green." }),
    Object.freeze({ id: ITEM_ID_BASE + 99, name: "Salsa Verde", icon: "salsaverde", hunger: 25, description: "A bright green herb, garlic and oil sauce. Italian table companion." }),
    Object.freeze({ id: ITEM_ID_BASE + 100, name: "Chimichurri", icon: "chimichurri", hunger: 25, description: "Parsley, oregano, garlic and oil. Argentine grill master's secret." }),
    Object.freeze({ id: ITEM_ID_BASE + 101, name: "Romesco", icon: "romesco", hunger: 30, description: "Tomato, almond and garlic sauce from Catalonia. Thick and smoky." }),
    Object.freeze({ id: ITEM_ID_BASE + 102, name: "Tahini", icon: "tahini", hunger: 30, description: "Ground sesame and oil beaten into a pale Middle Eastern paste." }),
    Object.freeze({ id: ITEM_ID_BASE + 103, name: "Hummus", icon: "hummus", hunger: 35, description: "Peas, sesame, garlic, lemon and oil. Levantine mezze staple." }),
    Object.freeze({ id: ITEM_ID_BASE + 104, name: "Satay Sauce", icon: "sataysauce", hunger: 35, description: "Nutty, chili-hot sauce from Southeast Asian street grills." }),
    Object.freeze({ id: ITEM_ID_BASE + 105, name: "Teriyaki Sauce", icon: "teriyaki", hunger: 30, description: "Sweet, glossy garlic and ginger glaze. Japanese home cooking." }),
    Object.freeze({ id: ITEM_ID_BASE + 106, name: "Sweet Chili Sauce", icon: "sweetchili", hunger: 25, description: "Sticky sweet chili dip. Thai table regular." }),
    Object.freeze({ id: ITEM_ID_BASE + 107, name: "BBQ Sauce", icon: "bbqsauce", hunger: 35, description: "Smoky tomato, sugar and paprika sauce. American barbecue tradition." }),
    Object.freeze({ id: ITEM_ID_BASE + 108, name: "Honey Mustard", icon: "honeymustard", hunger: 25, description: "Sweet and sharp mustard blend. A diner and picnic classic." }),
    Object.freeze({ id: ITEM_ID_BASE + 109, name: "Garlic Herb Sauce", icon: "garlicherbsauce", hunger: 25, description: "Garlic and herbs steeped in oil. A simple Mediterranean finish." }),
    Object.freeze({ id: ITEM_ID_BASE + 110, name: "Curry Sauce", icon: "currysauce", hunger: 30, description: "Turmeric, cumin and coriander bloomed in oil. South Asian spice base." }),
    Object.freeze({ id: ITEM_ID_BASE + 111, name: "Mushroom Sauce", icon: "mushroomsauce", hunger: 30, description: "Mushrooms and garlic cooked down in oil. Foresty and savoury." }),
    Object.freeze({ id: ITEM_ID_BASE + 112, name: "Pepper Sauce", icon: "peppersauce", hunger: 25, description: "Sweet bell pepper and garlic sauce. Hungarian-inspired and mellow." }),
    Object.freeze({ id: ITEM_ID_BASE + 113, name: "Avocado Sauce", icon: "avocadosauce", hunger: 30, description: "Creamy avocado, lemon, mint and oil. Mexican green sauce." }),
    Object.freeze({ id: ITEM_ID_BASE + 114, name: "Pomegranate Sauce", icon: "pomegranatesauce", hunger: 25, description: "Tart pomegranate reduced with sugar and lemon. Persian and Caucasian classic." }),
    Object.freeze({ id: ITEM_ID_BASE + 115, name: "Apple Sauce", icon: "applesauce", hunger: 30, description: "Soft apples cooked with sugar and lemon. A homely European side." }),
]);

const SAUCE_ITEM_DEFS = {};
SAUCE_ITEM_DEFINITIONS.forEach(function (sauce) {
    SAUCE_ITEM_DEFS[sauce.id] = Object.freeze({
        id: sauce.id,
        name: sauce.name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.2,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: sauce.icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: sauce.hunger }),
        description: sauce.description,
    });
});

// Italian dishes use the raw pasta items, breads, sauces, oils and garden
// produce that already exist in the game. No invented cheese or cured meat is
// required, so every recipe can be cooked from current resources.
const ITALIAN_DISH_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_IDS.SPAGHETTI_AGLIO_E_OLIO, name: "Spaghetti Aglio e Olio", icon: "spaghettiaglio", hunger: 110, description: "Spaghetti tossed with garlic, chili and good oil. A late-night Roman classic." }),
    Object.freeze({ id: ITEM_IDS.SPAGHETTI_CARBONARA, name: "Spaghetti Carbonara", icon: "spaghetticarbonara", hunger: 150, description: "Spaghetti coated in egg, meat, garlic and oil. Roman comfort without cream." }),
    Object.freeze({ id: ITEM_IDS.SPAGHETTI_BOLOGNESE, name: "Spaghetti Bolognese", icon: "spaghettibolognese", hunger: 160, description: "Spaghetti under a thick tomato and meat sauce from Bologna." }),
    Object.freeze({ id: ITEM_IDS.PENNE_ARABBIATA, name: "Penne Arrabbiata", icon: "pennearrabbiata", hunger: 120, description: "Penne in a fiery tomato, garlic and chili sauce. Angry on purpose." }),
    Object.freeze({ id: ITEM_IDS.LINGUINE_PESTO, name: "Linguine al Pesto", icon: "linguinepesto", hunger: 130, description: "Linguine folded through vivid basil, pine nut and garlic pesto. Genoese green." }),
    Object.freeze({ id: ITEM_IDS.RIGATONI_MARINARA, name: "Rigatoni Marinara", icon: "rigatonimarinara", hunger: 125, description: "Ridged rigatoni in a simple tomato, garlic and oregano sauce." }),
    Object.freeze({ id: ITEM_IDS.FETTUCCINE_ALFREDO, name: "Fettuccine Alfredo", icon: "fettuccinealfredo", hunger: 140, description: "Ribbons of fettuccine in a pale garlic, egg and oil sauce." }),
    Object.freeze({ id: ITEM_IDS.LASAGNE, name: "Lasagne", icon: "lasagne", hunger: 180, description: "Layered pasta sheets with tomato, meat and onion. A patient oven dish." }),
    Object.freeze({ id: ITEM_IDS.RAVIOLI_DISH, name: "Ravioli", icon: "raviolidish", hunger: 145, description: "Pasta parcels filled with mushrooms and herbs, dressed with oil." }),
    Object.freeze({ id: ITEM_IDS.TORTELLINI_DISH, name: "Tortellini", icon: "tortellinidish", hunger: 140, description: "Folded pasta rings filled with meat and egg, finished with oil." }),
    Object.freeze({ id: ITEM_IDS.MACARONI_BAKE, name: "Macaroni Bake", icon: "macaronibake", hunger: 150, description: "Macaroni baked with tomato, meat and oregano. Italian home comfort." }),
    Object.freeze({ id: ITEM_IDS.GNOCCHI, name: "Gnocchi", icon: "gnocchi", hunger: 130, description: "Soft potato and flour dumplings tossed in oil. Northern Italian warmth." }),
    Object.freeze({ id: ITEM_IDS.RISOTTO, name: "Risotto", icon: "risotto", hunger: 140, description: "Creamy rice slowly cooked with mushrooms, onion and oil. Lombard patience." }),
    Object.freeze({ id: ITEM_IDS.POLENTA, name: "Polenta", icon: "polenta", hunger: 120, description: "Golden maize porridge stirred until thick, then dressed with oil." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_MARGHERITA, name: "Pizza Margherita", icon: "pizzamargherita", hunger: 160, description: "Flat bread topped with tomato, oregano and oil. Naples in miniature." }),
    Object.freeze({ id: ITEM_IDS.BRUSCHETTA, name: "Bruschetta", icon: "bruschetta", hunger: 90, description: "Toasted bread rubbed with garlic and piled with tomato and oil." }),
    Object.freeze({ id: ITEM_IDS.CAPRESE_SALAD, name: "Caprese Salad", icon: "caprese", hunger: 80, description: "Tomato and basil dressed with oil. A cool southern Italian starter." }),
    Object.freeze({ id: ITEM_IDS.PANZANELLA, name: "Panzanella", icon: "panzanella", hunger: 100, description: "Torn bread, tomato, cucumber and basil in an oil dressing. Tuscan thrift." }),
    Object.freeze({ id: ITEM_IDS.ARANCINI, name: "Arancini", icon: "arancini", hunger: 140, description: "Rice and egg balls rolled in bread crumbs and fried in oil. Sicilian street food." }),
    Object.freeze({ id: ITEM_IDS.FRITTATA, name: "Frittata", icon: "frittata", hunger: 130, description: "Eggs, pepper and onion cooked in a pan with oil. Italian skillet supper." }),
]);

const ITALIAN_DISH_ITEM_DEFS = {};
ITALIAN_DISH_ITEM_DEFINITIONS.forEach(function (dish) {
    ITALIAN_DISH_ITEM_DEFS[dish.id] = Object.freeze({
        id: dish.id,
        name: dish.name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: dish.icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: dish.hunger }),
        description: dish.description,
    });
});

// Soviet dishes use only existing produce, grains, meat, eggs, oil and jelly.
// There are deliberately no dairy or kefir recipes.
const SOVIET_DISH_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_IDS.BORSCHT, name: "Borscht", icon: "borscht", hunger: 160, description: "Deep red beetroot soup with cabbage, potato and meat. A Soviet table cornerstone." }),
    Object.freeze({ id: ITEM_IDS.SHCHI, name: "Shchi", icon: "shchi", hunger: 140, description: "Cabbage soup with potato, carrot and herbs. Humble, warming and endlessly familiar." }),
    Object.freeze({ id: ITEM_IDS.RASSOLNIK, name: "Rassolnik", icon: "rassolnik", hunger: 150, description: "Hearty potato and cucumber soup with meat. Sour, savoury and filling." }),
    Object.freeze({ id: ITEM_IDS.SOLYANKA, name: "Solyanka", icon: "solyanka", hunger: 170, description: "Thick, tangy soup of meat, cabbage, tomato and cucumber. A Soviet canteen classic." }),
    Object.freeze({ id: ITEM_IDS.OLIVIER_SALAD, name: "Olivier Salad", icon: "olivier", hunger: 140, description: "Potato, carrot, egg, cucumber, peas and meat bound with mayonnaise. The holiday table must-have." }),
    Object.freeze({ id: ITEM_IDS.VINAIGRETTE, name: "Vinaigrette", icon: "vinaigrette", hunger: 100, description: "Beetroot, potato, carrot, cucumber and onion dressed with oil. A bright Soviet winter salad." }),
    Object.freeze({ id: ITEM_IDS.PELMENI, name: "Pelmeni", icon: "pelmeni", hunger: 170, description: "Small meat dumplings boiled by the dozen. A freezer drawer's greatest achievement." }),
    Object.freeze({ id: ITEM_IDS.VARENYKY, name: "Varenyky", icon: "varenyky", hunger: 150, description: "Potato and onion dumplings, boiled and slicked with oil. Ukrainian-Soviet comfort food." }),
    Object.freeze({ id: ITEM_IDS.BEEF_STROGANOFF, name: "Beef Stroganoff", icon: "stroganoff", hunger: 180, description: "Sliced meat, onion and tomato in a flour-thickened sauce. A restaurant favourite of the USSR." }),
    Object.freeze({ id: ITEM_IDS.CHICKEN_KIEV, name: "Chicken Kiev", icon: "chickenkiev", hunger: 175, description: "Breaded chicken roll with a rich egg and oil centre. A showpiece of Soviet dining." }),
    Object.freeze({ id: ITEM_IDS.GOLUBTSY, name: "Golubtsy", icon: "golubtsy", hunger: 165, description: "Cabbage leaves stuffed with rice, meat and tomato. Slow-cooked Soviet home cooking." }),
    Object.freeze({ id: ITEM_IDS.PLOV, name: "Plov", icon: "plov", hunger: 180, description: "Rice steamed with meat, carrot and onion in oil. The great Soviet communal pot." }),
    Object.freeze({ id: ITEM_IDS.BUCKWHEAT_MUSHROOMS, name: "Buckwheat with Mushrooms", icon: "buckwheatmushrooms", hunger: 130, description: "Toasted buckwheat and mushrooms with onion. A plain but beloved Soviet staple." }),
    Object.freeze({ id: ITEM_IDS.MASHED_POTATOES, name: "Mashed Potatoes", icon: "mashedpotatoes", hunger: 120, description: "Potatoes boiled and mashed with oil. The reliable side of every Soviet dinner." }),
    Object.freeze({ id: ITEM_IDS.FRIED_POTATOES, name: "Fried Potatoes", icon: "friedpotatoes", hunger: 125, description: "Potato slices fried with onion until golden. A late supper from every Soviet kitchen." }),
    Object.freeze({ id: ITEM_IDS.DRANIKI, name: "Draniki", icon: "draniki", hunger: 130, description: "Crisp potato pancakes bound with flour and egg. Belarussian-Soviet breakfast royalty." }),
    Object.freeze({ id: ITEM_IDS.MILLET_KASHA, name: "Millet Kasha", icon: "milletkasha", hunger: 115, description: "Millet simmered until soft and dressed with oil. Simple Soviet porridge." }),
    Object.freeze({ id: ITEM_IDS.OATMEAL, name: "Oatmeal", icon: "oatmeal", hunger: 100, description: "Oats boiled into a plain, sturdy porridge. The morning ration of millions." }),
    Object.freeze({ id: ITEM_IDS.BLINI, name: "Blini", icon: "blini", hunger: 120, description: "Thin flour and egg pancakes fried in oil. A Soviet Shrovetide favourite." }),
    Object.freeze({ id: ITEM_IDS.PIROZHKI, name: "Pirozhki", icon: "pirozhki", hunger: 140, description: "Small baked or fried buns filled with meat and onion. Street-corner Soviet comfort." }),
    Object.freeze({ id: ITEM_IDS.BELYASH, name: "Belyash", icon: "belyash", hunger: 150, description: "Round fried dough pocket packed with meat and onion. A canteen and market classic." }),
    Object.freeze({ id: ITEM_IDS.CHEBUREKI, name: "Chebureki", icon: "chebureki", hunger: 155, description: "Thin fried dough turnovers with juicy meat and onion. Soviet street food at its best." }),
    Object.freeze({ id: ITEM_IDS.MUSHROOM_SOUP, name: "Mushroom Soup", icon: "mushroomsoup", hunger: 120, description: "Mushrooms, potato and onion simmered into a fragrant broth. A forest-to-table Soviet soup." }),
    Object.freeze({ id: ITEM_IDS.PEA_SOUP, name: "Pea Soup", icon: "peasoup", hunger: 135, description: "Split peas, potato, onion and meat cooked into a thick soup. A Soviet canteen regular." }),
    Object.freeze({ id: ITEM_IDS.MAKARONY_FLOTSKI, name: "Makarony po-Flotski", icon: "makaronyflotski", hunger: 160, description: "Pasta with meat and onion, fried until crisp at the edges. The navy's gift to Soviet cooking." }),
    Object.freeze({ id: ITEM_IDS.TUSHONKA, name: "Tushonka", icon: "tushonka", hunger: 170, description: "Meat stewed with onion and tomato until spoon-tender. A jar that fed a country." }),
    Object.freeze({ id: ITEM_IDS.KOTLETA, name: "Kotleta", icon: "kotleta", hunger: 150, description: "A minced meat patty bound with egg and flour, fried in oil. Soviet cafeteria staple." }),
    Object.freeze({ id: ITEM_IDS.BEET_SALAD, name: "Beet Salad", icon: "beetsalad", hunger: 90, description: "Grated beetroot with garlic and oil. Bright, earthy and always on the table." }),
    Object.freeze({ id: ITEM_IDS.CARROT_SALAD, name: "Carrot Salad", icon: "carrotsalad", hunger: 85, description: "Grated carrot with garlic and oil. Sweet, sharp and cheap." }),
    Object.freeze({ id: ITEM_IDS.CABBAGE_SALAD, name: "Cabbage Salad", icon: "cabbagesalad", hunger: 80, description: "Shredded cabbage and carrot with oil. The everyday Soviet side dish." }),
    Object.freeze({ id: ITEM_IDS.KOMPOT, name: "Kompot", icon: "kompot", hunger: 70, description: "Berries boiled with sugar and jelly into a sweet fruit drink. The Soviet answer to juice." }),
    Object.freeze({ id: ITEM_IDS.KISSEL, name: "Kissel", icon: "kissel", hunger: 65, description: "A thick berry jelly drink, sweet and softly set. A Soviet childhood memory." }),
    Object.freeze({ id: ITEM_IDS.BAKED_APPLES, name: "Baked Apples", icon: "bakedapples", hunger: 80, description: "Apples baked with sugar until soft and caramelised. A simple Soviet dessert." }),
    Object.freeze({ id: ITEM_IDS.APPLE_CHARLOTTE, name: "Apple Charlotte", icon: "applecharlotte", hunger: 130, description: "A light flour and egg sponge layered with apples. The Soviet Union's favourite home cake." }),
    Object.freeze({ id: ITEM_IDS.NAPOLEON_CAKE, name: "Napoleon Cake", icon: "napoleoncake", hunger: 150, description: "Crisp flour layers with a sweet egg and oil filling. A celebration cake of the USSR." }),
    Object.freeze({ id: ITEM_IDS.HONEY_CAKE, name: "Honey Cake", icon: "honeycake", hunger: 145, description: "Soft honey-sweetened cake layers with an egg and oil filling. A Soviet tea-table legend." }),
]);

const SOVIET_DISH_ITEM_DEFS = {};
SOVIET_DISH_ITEM_DEFINITIONS.forEach(function (dish) {
    SOVIET_DISH_ITEM_DEFS[dish.id] = Object.freeze({
        id: dish.id,
        name: dish.name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: dish.icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: dish.hunger }),
        description: dish.description,
    });
});

// Pizza varieties share the flat bread base and campfire, and differ by their
// toppings. Cheese is not a resource in the game, so these are topping-led
// pizzas rather than cheese-heavy ones.
const PIZZA_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_IDS.PIZZA_DIAVOLA, name: "Pizza Diavola", icon: "pizzadiavola", hunger: 165, description: "Chicken, chili and tomato on a blistering flat bread base. Devilishly hot." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_CAPRICCIOSA, name: "Pizza Capricciosa", icon: "pizzacapricciosa", hunger: 170, description: "Mushrooms, chicken, peppers and olives scattered over tomato. The capricious classic." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_QUATTRO_STAGIONI, name: "Pizza Quattro Stagioni", icon: "pizzaquattrostagioni", hunger: 175, description: "Four seasons in topping form: mushroom, chicken, pepper and olive." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_FUNGHI, name: "Pizza Funghi", icon: "pizzafunghi", hunger: 150, description: "A forest of mushrooms over tomato and oregano. Simple and earthy." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_POLLO, name: "Pizza Pollo", icon: "pizzapollo", hunger: 165, description: "Chicken and sweet onion on a tomato base. A filling everyday pizza." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_BBQ_CHICKEN, name: "Pizza BBQ Chicken", icon: "pizzabbqchicken", hunger: 175, description: "Smoky sweet tomato, paprika and chicken. Barbecue energy without the grill." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_PESTO, name: "Pizza Pesto", icon: "pizzapesto", hunger: 160, description: "Basil, pine nuts and garlic over oiled flat bread. Green, fragrant and nutty." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_MARINARA, name: "Pizza Marinara", icon: "pizzamarinara", hunger: 140, description: "Tomato, garlic and oregano with nothing to hide. The sailor's plain pizza." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_NAPOLETANA, name: "Pizza Napoletana", icon: "pizzanapoletana", hunger: 150, description: "Tomato, garlic and oregano with a generous oil finish. Naples in a flat round." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_MEDITERRANEAN, name: "Pizza Mediterranean", icon: "pizzamediterranean", hunger: 160, description: "Olives, tomato, onion and oregano. A sunny southern sea on a crust." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_VEGETARIANA, name: "Pizza Vegetariana", icon: "pizzavegetariana", hunger: 150, description: "Zucchini, peppers and onion piled over tomato. The garden on a pizza." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_SPINACI, name: "Pizza Spinaci", icon: "pizzaspinaci", hunger: 145, description: "Spinach, mushrooms and garlic over a tomato base. Dark green and savoury." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_PATATE, name: "Pizza Patate", icon: "pizzapatate", hunger: 155, description: "Thin potato slices and rosemary on oiled flat bread. A sturdy northern pizza." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_CIPOLLA, name: "Pizza Cipolla", icon: "pizzacipolla", hunger: 140, description: "Sweet onion and chili over tomato. Sharp, hot and unapologetic." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_UOVO, name: "Pizza Uovo", icon: "pizzauovo", hunger: 155, description: "Egg and onion baked onto a tomato base. Breakfast meets dinner." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_RUSTICA, name: "Pizza Rustica", icon: "pizzarustica", hunger: 160, description: "Eggplant, pepper and tomato on a rustic crust. Country cooking, city shape." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_ZUCCA, name: "Pizza Zucca", icon: "pizzazucca", hunger: 150, description: "Sweet pumpkin and sage over oiled flat bread. Autumn on a pizza." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_BARBABIETOLA, name: "Pizza Barbabietola", icon: "pizzabarbabietola", hunger: 145, description: "Beetroot and garlic over tomato. Earthy, pink and surprisingly good." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_CAVOLO, name: "Pizza Cavolo", icon: "pizzacavolo", hunger: 140, description: "Cabbage and onion baked until sweet. A thrifty pizza with character." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_PISELLI, name: "Pizza Piselli", icon: "pizzapiselli", hunger: 145, description: "Green peas and onion over tomato. Sweet little green pockets." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_MAIS, name: "Pizza Mais", icon: "pizzamais", hunger: 150, description: "Golden maize kernels and peppers on a tomato base. Sweet and sunny." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_AGLIO_ERBE, name: "Pizza Aglio e Erbe", icon: "pizzaaglioerbe", hunger: 140, description: "Garlic, basil and oregano with a slick of oil. The herb garden, baked." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_DOLCE, name: "Pizza Dolce", icon: "pizzadolce", hunger: 150, description: "Apple slices and sugar on a baked flat bread. Dessert disguised as dinner." }),
    Object.freeze({ id: ITEM_IDS.PIZZA_FRUTTI_BOSCO, name: "Pizza Frutti di Bosco", icon: "pizzafruttibosco", hunger: 145, description: "Forest berries and sugar on a warm flat bread. A sweet Soviet-Italian hybrid." }),
]);

const PIZZA_ITEM_DEFS = {};
PIZZA_ITEM_DEFINITIONS.forEach(function (pizza) {
    PIZZA_ITEM_DEFS[pizza.id] = Object.freeze({
        id: pizza.id,
        name: pizza.name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.55,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: pizza.icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: pizza.hunger }),
        description: pizza.description,
    });
});

const ASIAN_SAUCE_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_IDS.SOY_SAUCE, name: "Soy Sauce", icon: "soysauce", hunger: 10, description: "A dark, salty fermented soybean sauce. The backbone of East Asian cooking." }),
    Object.freeze({ id: ITEM_IDS.HOISIN_SAUCE, name: "Hoisin Sauce", icon: "hoisinsauce", hunger: 25, description: "Thick, sweet and savoury bean sauce with garlic and chili. Cantonese roast companion." }),
    Object.freeze({ id: ITEM_IDS.SRIRACHA, name: "Sriracha", icon: "sriracha", hunger: 20, description: "A bright red chili and garlic sauce. Thai heat in a bottle." }),
    Object.freeze({ id: ITEM_IDS.GOCHUJANG_SAUCE, name: "Gochujang Sauce", icon: "gochujangsauce", hunger: 25, description: "Fermented chili, soybean and garlic paste. Korean depth and fire." }),
    Object.freeze({ id: ITEM_IDS.PONZU_SAUCE, name: "Ponzu Sauce", icon: "ponzusauce", hunger: 15, description: "Soy sauce sharpened with citrus and mushroom. A Japanese dipping sauce." }),
    Object.freeze({ id: ITEM_IDS.PLUM_SAUCE, name: "Plum Sauce", icon: "plumsauce", hunger: 30, description: "Sweet-tart plum sauce with chili and garlic. Chinese duck and spring roll dip." }),
    Object.freeze({ id: ITEM_IDS.KOREAN_BBQ_SAUCE, name: "Korean BBQ Sauce", icon: "koreanbbqsauce", hunger: 30, description: "Soy, sugar, sesame and chili glaze. Korean grill favourite." }),
    Object.freeze({ id: ITEM_IDS.GYOZA_SAUCE, name: "Gyoza Sauce", icon: "gyozasauce", hunger: 20, description: "Soy, citrus, chili and garlic dip for dumplings. Japanese izakaya staple." }),
    Object.freeze({ id: ITEM_IDS.TEMPURA_SAUCE, name: "Tempura Sauce", icon: "tempurasauce", hunger: 20, description: "Light soy, ginger and sugar dipping broth for fried food." }),
]);

const ASIAN_SAUCE_ITEM_DEFS = {};
ASIAN_SAUCE_ITEM_DEFINITIONS.forEach(function (sauce) {
    ASIAN_SAUCE_ITEM_DEFS[sauce.id] = Object.freeze({
        id: sauce.id,
        name: sauce.name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.25,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: sauce.icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: sauce.hunger }),
        description: sauce.description,
    });
});

const ASIAN_DISH_ITEM_DEFINITIONS = Object.freeze([
    Object.freeze({ id: ITEM_IDS.RAMEN, name: "Ramen", icon: "ramen", hunger: 170, description: "Noodle soup with egg, chicken and a deep soybean broth. Japanese comfort in a bowl." }),
    Object.freeze({ id: ITEM_IDS.PAD_THAI, name: "Pad Thai", icon: "padthai", hunger: 165, description: "Stir-fried noodles with egg, chicken, citrus and soybean savour. Thai street classic." }),
    Object.freeze({ id: ITEM_IDS.FRIED_RICE, name: "Fried Rice", icon: "friedrice", hunger: 150, description: "Rice tossed with egg, peas, carrot and soy flavour. East Asian everyday food." }),
    Object.freeze({ id: ITEM_IDS.CHICKEN_TERIYAKI, name: "Chicken Teriyaki", icon: "chickenteriyaki", hunger: 175, description: "Chicken glazed with sweet soy and ginger. Japanese home cooking." }),
    Object.freeze({ id: ITEM_IDS.BULGOGI, name: "Bulgogi", icon: "bulgogi", hunger: 180, description: "Sweet soy and sesame marinated chicken, seared hot. Korean barbecue favourite." }),
    Object.freeze({ id: ITEM_IDS.BIBIMBAP, name: "Bibimbap", icon: "bibimbap", hunger: 170, description: "Rice with egg, vegetables, sesame and savoury soybean dressing. Korean mixed bowl." }),
    Object.freeze({ id: ITEM_IDS.GYOZA, name: "Gyoza", icon: "gyoza", hunger: 150, description: "Pan-fried dumplings filled with chicken, cabbage and garlic. Japanese izakaya staple." }),
    Object.freeze({ id: ITEM_IDS.SPRING_ROLLS, name: "Spring Rolls", icon: "springrolls", hunger: 140, description: "Crisp rolls of cabbage, carrot and soybean savour. Chinese takeaway classic." }),
    Object.freeze({ id: ITEM_IDS.TEMPURA, name: "Tempura", icon: "tempura", hunger: 145, description: "Light battered vegetables fried until crisp. Portuguese-Japanese import." }),
    Object.freeze({ id: ITEM_IDS.CHICKEN_KATSU, name: "Chicken Katsu", icon: "chickenkatsu", hunger: 175, description: "Breaded chicken cutlet fried golden. Japanese comfort with a crunchy shell." }),
    Object.freeze({ id: ITEM_IDS.JAPANESE_CURRY, name: "Japanese Curry", icon: "japanesecurry", hunger: 180, description: "Rice with chicken, potato, carrot and a thick spiced curry sauce. Japanese yoshoku." }),
    Object.freeze({ id: ITEM_IDS.KUNG_PAO_CHICKEN, name: "Kung Pao Chicken", icon: "kungpaochicken", hunger: 170, description: "Chicken, chili and nuts in a hot sweet soybean sauce. Sichuan wok classic." }),
    Object.freeze({ id: ITEM_IDS.SWEET_SOUR_CHICKEN, name: "Sweet and Sour Chicken", icon: "sweetsourchicken", hunger: 165, description: "Chicken, peppers and citrus in a sticky sweet-sour sauce. Chinese restaurant staple." }),
    Object.freeze({ id: ITEM_IDS.CHOW_MEIN, name: "Chow Mein", icon: "chowmein", hunger: 155, description: "Stir-fried noodles with cabbage, carrot and soybean savour. Chinese street food." }),
    Object.freeze({ id: ITEM_IDS.NASI_GORENG, name: "Nasi Goreng", icon: "nasigoreng", hunger: 160, description: "Indonesian fried rice with egg, chicken, chili and soybean seasoning." }),
    Object.freeze({ id: ITEM_IDS.OKONOMIYAKI, name: "Okonomiyaki", icon: "okonomiyaki", hunger: 155, description: "Cabbage and flour pancake with egg and savoury soybean glaze. Japanese griddle food." }),
    Object.freeze({ id: ITEM_IDS.YAKITORI, name: "Yakitori", icon: "yakitori", hunger: 160, description: "Skewered chicken glazed with sweet soy and garlic. Japanese street grill." }),
]);

const ASIAN_DISH_ITEM_DEFS = {};
ASIAN_DISH_ITEM_DEFINITIONS.forEach(function (dish) {
    ASIAN_DISH_ITEM_DEFS[dish.id] = Object.freeze({
        id: dish.id,
        name: dish.name,
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: dish.icon,
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: dish.hunger }),
        description: dish.description,
    });
});

function getItemWeaponSkill(item) {
    if (!item) return null;

    const definition = item.definition && typeof item.definition === "object"
        ? item.definition
        : (item.itemId != null ? getItemDefinition(item.itemId) : null);
    const skill = definition && typeof definition.weaponSkill === "string"
        ? definition.weaponSkill
        : null;
    return WEAPON_SKILL_LABELS[skill] ? skill : null;
}

// Metal tool and utensil variants. Every recipe uses the matching metal bar
// and a wooden handle/shaft. Each metal has a common stat multiplier; gold
// additionally grants a Luck bonus, which is ten times the original value.
const METAL_VARIANT_ITEM_ID_BASE = 5200;
const METAL_VARIANT_MULTIPLIERS = Object.freeze({
    copper: 3,
    tin: 5,
    iron: 12,
    bronze: 17,
    gold: 30,
});
const GOLD_LUCK_BONUS = 10;

const METAL_VARIANT_METALS = Object.freeze([
    Object.freeze({
        key: "copper", name: "Copper", barId: RESOURCE_IDS.COPPER_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.copper, luckBonus: 0,
    }),
    Object.freeze({
        key: "tin", name: "Tin", barId: RESOURCE_IDS.TIN_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.tin, luckBonus: 0,
    }),
    Object.freeze({
        key: "iron", name: "Iron", barId: RESOURCE_IDS.IRON_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.iron, luckBonus: 0,
    }),
    Object.freeze({
        key: "bronze", name: "Bronze", barId: RESOURCE_IDS.BRONZE_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.bronze, luckBonus: 0,
    }),
    Object.freeze({
        key: "gold", name: "Gold", barId: RESOURCE_IDS.GOLD_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.gold, luckBonus: GOLD_LUCK_BONUS,
    }),
]);

const METAL_VARIANT_TOOL_BASES = Object.freeze([
    Object.freeze({
        key: "knife", name: "Knife", category: "tools", icon: "flintknife",
        weight: 0.5, durability: 40, handleResourceId: RESOURCE_IDS.HANDLES,
        toolPowers: Object.freeze([{ type: "cutting", power: 3 }]),
        weaponSkill: "knifesstabbing",
    }),
    Object.freeze({
        key: "hammer", name: "Hammer", category: "tools", icon: "stonehammer",
        weight: 0.5, durability: 40, handleResourceId: RESOURCE_IDS.HANDLES,
        toolPowers: Object.freeze([{ type: "smash", power: 2 }]),
        weaponSkill: "hammerscrushworks",
    }),
    Object.freeze({
        key: "axe", name: "Axe", category: "tools", icon: "stoneaxe",
        weight: 0.5, durability: 40, handleResourceId: RESOURCE_IDS.HANDLES,
        toolPowers: Object.freeze([{ type: "cutting", power: 1 }, { type: "chopping", power: 2 }]),
        weaponSkill: "axechopping",
    }),
    Object.freeze({
        key: "pickaxe", name: "Pickaxe", category: "tools", icon: "flintpickaxe",
        weight: 0.5, durability: 40, handleResourceId: RESOURCE_IDS.SHAFTS,
        toolPowers: Object.freeze([{ type: "mining", power: 1 }]),
        weaponSkill: "axechopping",
    }),
    Object.freeze({
        key: "shovel", name: "Shovel", category: "tools", icon: "metalshovel",
        weight: 0.5, durability: 40, handleResourceId: RESOURCE_IDS.SHAFTS,
        toolPowers: Object.freeze([{ type: "digging", power: 1 }]),
        weaponSkill: "hammerscrushworks",
    }),
    Object.freeze({
        key: "spear", name: "Spear", category: "tools", icon: "flintspear",
        weight: 0.5, durability: 40, handleResourceId: RESOURCE_IDS.HANDLES,
        toolPowers: Object.freeze([]),
        weaponSkill: "spearsspooning",
    }),
]);

const METAL_VARIANT_UTENSIL_BASES = Object.freeze([
    Object.freeze({ key: "ladle", name: "Ladle", category: "cultery", icon: "ladle", slot: "ladle", weight: 0.4 }),
    Object.freeze({ key: "fork", name: "Fork", category: "cultery", icon: "woodenfork", slot: "fork", weight: 0.2 }),
    Object.freeze({ key: "spoon", name: "Spoon", category: "cultery", icon: "woodenspoon", slot: "spoon", weight: 0.2 }),
    Object.freeze({ key: "bowl", name: "Bowl", category: "cultery", icon: "woodenbowl", slot: "bowl", weight: 0.5 }),
    Object.freeze({ key: "little-spoon", name: "Little Spoon", category: "cultery", icon: "woodenlittlespoon", slot: "littlespoon", weight: 0.1 }),
    Object.freeze({ key: "mug", name: "Mug", category: "cultery", icon: "woodenmug", slot: "mug", weight: 0.4 }),
    Object.freeze({ key: "plate", name: "Plate", category: "cultery", icon: "carvedwoodenplate", slot: "plate", weight: 0.5 }),
]);

function normalizeMetalVariantName(name) {
    return String(name || "").toLowerCase().replace(/[\s_-]+/g, "");
}

function createMetalVariantStats(metal, grantsForaging) {
    const multiplier = metal.multiplier;
    const stats = {
        attack: roundItemNumber(TOOL_BASE_STATS.attack * multiplier),
    };
    if (grantsForaging) {
        stats.forageFindChance = roundItemNumber(FORAGING_TOOL_STATS.forageFindChance * multiplier);
        stats.forageQuantity = roundItemNumber(FORAGING_TOOL_STATS.forageQuantity * multiplier);
    }
    if (metal.luckBonus > 0) stats.luck = metal.luckBonus;
    return Object.freeze(stats);
}

const METAL_VARIANT_ITEMS = [];
const METAL_VARIANT_ITEM_DEFS = {};
let nextMetalVariantItemId = METAL_VARIANT_ITEM_ID_BASE;

METAL_VARIANT_METALS.forEach(function (metal) {
    METAL_VARIANT_TOOL_BASES.forEach(function (base) {
        const itemId = nextMetalVariantItemId++;
        const name = metal.name + " " + base.name;
        const toolPowers = normalizeToolPowerConfigs(base.toolPowers.map(function (power) {
            return {
                type: power.type,
                power: roundItemNumber(power.power * metal.multiplier),
            };
        }));

        METAL_VARIANT_ITEM_DEFS[itemId] = Object.freeze({
            id: itemId,
            name: name,
            kind: ITEM_KINDS.Equipment,
            slot: "arm1",
            equipSlots: FORAGING_TOOL_SLOTS,
            stackable: false,
            weight: base.weight,
            rarity: ITEM_RARITIES.Common,
            quality: 10,
            durability: base.durability,
            icon: normalizeMetalVariantName(name),
            stats: createMetalVariantStats(metal, base.key === "knife"),
            toolPower: toolPowers[0] || null,
            toolPowers: toolPowers,
            weaponSkill: base.weaponSkill || null,
            description: metal.name + " " + base.name.toLowerCase()
                + " forged from refined metal and mounted on a sturdy wooden "
                + (base.handleResourceId === RESOURCE_IDS.SHAFTS ? "shaft." : "handle."),
        });

        METAL_VARIANT_ITEMS.push(Object.freeze({
            itemId: itemId,
            name: name,
            category: "tools",
            baseKey: base.key,
            metalKey: metal.key,
            metalName: metal.name,
            metalMultiplier: metal.multiplier,
            barResourceId: metal.barId,
            barAmount: 2,
            handleResourceId: base.handleResourceId,
        }));
    });

    METAL_VARIANT_UTENSIL_BASES.forEach(function (base) {
        const itemId = nextMetalVariantItemId++;
        const name = metal.name + " " + base.name;
        const stats = { feastModifier: metal.multiplier };
        if (metal.luckBonus > 0) stats.luck = metal.luckBonus;

        METAL_VARIANT_ITEM_DEFS[itemId] = Object.freeze({
            id: itemId,
            name: name,
            kind: ITEM_KINDS.Tool,
            stackable: false,
            weight: base.weight,
            rarity: ITEM_RARITIES.Common,
            quality: 1,
            durability: 1,
            icon: normalizeMetalVariantName(name),
            slot: base.slot,
            stats: Object.freeze(stats),
            description: metal.name + " " + base.name.toLowerCase()
                + " made from refined metal.",
        });

        METAL_VARIANT_ITEMS.push(Object.freeze({
            itemId: itemId,
            name: name,
            category: "cultery",
            baseKey: base.key,
            metalKey: metal.key,
            metalName: metal.name,
            metalMultiplier: metal.multiplier,
            barResourceId: metal.barId,
            barAmount: 1,
            handleResourceId: RESOURCE_IDS.HANDLES,
        }));
    });
});

// Metal cooking pots use 20 bars of their metal and need no wooden handle.
// Steel has no shared tool/utensil multiplier yet, so pots use a dedicated
// value placed between bronze and gold.
const STEEL_POT_MULTIPLIER = 20;
const METAL_POT_METALS = Object.freeze([
    Object.freeze({
        key: "copper", name: "Copper", barId: RESOURCE_IDS.COPPER_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.copper, luckBonus: 0,
    }),
    Object.freeze({
        key: "tin", name: "Tin", barId: RESOURCE_IDS.TIN_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.tin, luckBonus: 0,
    }),
    Object.freeze({
        key: "iron", name: "Iron", barId: RESOURCE_IDS.IRON_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.iron, luckBonus: 0,
    }),
    Object.freeze({
        key: "bronze", name: "Bronze", barId: RESOURCE_IDS.BRONZE_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.bronze, luckBonus: 0,
    }),
    Object.freeze({
        key: "steel", name: "Steel", barId: RESOURCE_IDS.STEEL_BAR,
        multiplier: STEEL_POT_MULTIPLIER, luckBonus: 0,
    }),
    Object.freeze({
        key: "gold", name: "Gold", barId: RESOURCE_IDS.GOLD_BAR,
        multiplier: METAL_VARIANT_MULTIPLIERS.gold, luckBonus: GOLD_LUCK_BONUS,
    }),
]);

const METAL_POT_ITEMS = [];
const METAL_POT_ITEM_DEFS = {};

METAL_POT_METALS.forEach(function (metal) {
    const itemId = nextMetalVariantItemId++;
    const name = metal.name + " Pot";
    const stats = {
        feastModifier: metal.multiplier,
        cookingPower: metal.multiplier,
    };
    if (metal.luckBonus > 0) stats.luck = metal.luckBonus;

    METAL_POT_ITEM_DEFS[itemId] = Object.freeze({
        id: itemId,
        name: name,
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 2,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: normalizeMetalVariantName(name),
        slot: "pot",
        stats: Object.freeze(stats),
        description: metal.name + " pot forged from refined metal for cooking and boiling.",
    });

    METAL_POT_ITEMS.push(Object.freeze({
        itemId: itemId,
        name: name,
        category: "cultery",
        baseKey: "pot",
        metalKey: metal.key,
        metalName: metal.name,
        metalMultiplier: metal.multiplier,
        barResourceId: metal.barId,
        barAmount: 20,
        handleResourceId: null,
    }));
});

// Metal frying pans are forged from sheet plates and rivets of the matching
// metal instead of bars. The wooden handle is the only non-metal part.
const METAL_PAN_METALS = Object.freeze([
    Object.freeze({
        key: "copper", name: "Copper",
        sheetId: RESOURCE_IDS.COPPER_SHEET_PLATES,
        rivetId: RESOURCE_IDS.COPPER_RIVETS,
        multiplier: METAL_VARIANT_MULTIPLIERS.copper, luckBonus: 0,
    }),
    Object.freeze({
        key: "tin", name: "Tin",
        sheetId: RESOURCE_IDS.TIN_SHEET_PLATES,
        rivetId: RESOURCE_IDS.TIN_RIVETS,
        multiplier: METAL_VARIANT_MULTIPLIERS.tin, luckBonus: 0,
    }),
    Object.freeze({
        key: "iron", name: "Iron",
        sheetId: RESOURCE_IDS.IRON_SHEET_PLATES,
        rivetId: RESOURCE_IDS.IRON_RIVETS,
        multiplier: METAL_VARIANT_MULTIPLIERS.iron, luckBonus: 0,
    }),
    Object.freeze({
        key: "bronze", name: "Bronze",
        sheetId: RESOURCE_IDS.BRONZE_SHEET_PLATES,
        rivetId: RESOURCE_IDS.BRONZE_RIVETS,
        multiplier: METAL_VARIANT_MULTIPLIERS.bronze, luckBonus: 0,
    }),
    Object.freeze({
        key: "steel", name: "Steel",
        sheetId: RESOURCE_IDS.STEEL_SHEET_PLATES,
        rivetId: RESOURCE_IDS.STEEL_RIVETS,
        multiplier: STEEL_POT_MULTIPLIER, luckBonus: 0,
    }),
    Object.freeze({
        key: "gold", name: "Gold",
        sheetId: RESOURCE_IDS.GOLD_SHEET_PLATES,
        rivetId: RESOURCE_IDS.GOLD_RIVETS,
        multiplier: METAL_VARIANT_MULTIPLIERS.gold, luckBonus: GOLD_LUCK_BONUS,
    }),
]);

const METAL_PAN_ITEMS = [];
const METAL_PAN_ITEM_DEFS = {};

METAL_PAN_METALS.forEach(function (metal) {
    const itemId = nextMetalVariantItemId++;
    const name = metal.name + " Frying Pan";
    const stats = { cookingPower: metal.multiplier };
    if (metal.luckBonus > 0) stats.luck = metal.luckBonus;

    METAL_PAN_ITEM_DEFS[itemId] = Object.freeze({
        id: itemId,
        name: name,
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 1.2,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: normalizeMetalVariantName(name),
        slot: "pan",
        stats: Object.freeze(stats),
        description: metal.name + " frying pan riveted from sheet plates and mounted on a wooden handle.",
    });

    METAL_PAN_ITEMS.push(Object.freeze({
        itemId: itemId,
        name: name,
        category: "cultery",
        baseKey: "fryingpan",
        metalKey: metal.key,
        metalName: metal.name,
        metalMultiplier: metal.multiplier,
        barResourceId: metal.sheetId,
        barAmount: 2,
        handleResourceId: RESOURCE_IDS.HANDLES,
        extraResources: Object.freeze([
            Object.freeze({ resourceId: metal.rivetId, amount: 1 }),
        ]),
    }));
});

const ITEM_DEFS = Object.freeze({
    ...PASTA_ITEM_DEFS,
    ...SAUCE_ITEM_DEFS,
    ...ITALIAN_DISH_ITEM_DEFS,
    ...SOVIET_DISH_ITEM_DEFS,
    ...PIZZA_ITEM_DEFS,
    ...ASIAN_SAUCE_ITEM_DEFS,
    ...ASIAN_DISH_ITEM_DEFS,
    [ITEM_IDS.HANDY_STICK]: createForagingToolDefinition(
        ITEM_IDS.HANDY_STICK, "Handy Stick", "handystick",
        { type: "digging", power: 1 },
        null, "spearsspooning"
    ),
    [ITEM_IDS.FLINT_KNIFE]: createForagingToolDefinition(
        ITEM_IDS.FLINT_KNIFE, "Flint Knife", "flintknife",
        { type: "cutting", power: 3 },
        null, "knifesstabbing"
    ),
    [ITEM_IDS.STONE_HAMMER]: createToolDefinition(
        ITEM_IDS.STONE_HAMMER, "Stone Hammer", "stonehammer",
        { type: "smash", power: 2 },
        "A heavy stone hammer for smashing stone and driving wedges.",
        null, "hammerscrushworks"
    ),
    [ITEM_IDS.STONE_AXE]: createToolDefinition(
        ITEM_IDS.STONE_AXE, "Stone Axe", "stoneaxe",
        [
            { type: "cutting", power: 1 },
            { type: "chopping", power: 2 },
        ],
        "A sturdy stone axe for chopping wood and shaping shafts.",
        null, "axechopping"
    ),
    [ITEM_IDS.KEBOB_ON_STICK]: Object.freeze({
        id: ITEM_IDS.KEBOB_ON_STICK,
        name: "Kebob on stick",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.4,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "kebobonstick",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 100 }),
        description: "A hot skewer of mushrooms or vegetables cooked over a fire. Restores hunger and grants potential when eaten.",
    }),
    [ITEM_IDS.PORRIDGE]: Object.freeze({
        id: ITEM_IDS.PORRIDGE,
        name: "Porridge",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "porridge",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 120 }),
        description: "A thick bowl of grain porridge cooked in a pot over a campfire. Warm, filling and impossible to rush.",
    }),
    [ITEM_IDS.SALAD]: Object.freeze({
        id: ITEM_IDS.SALAD,
        name: "Salad",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.4,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "salad",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 90 }),
        description: "A fresh bowl of chopped vegetables with herbs. Simple, crunchy and honest.",
    }),
    [ITEM_IDS.FRUITS_SALAD]: Object.freeze({
        id: ITEM_IDS.FRUITS_SALAD,
        name: "Fruits salad",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "fruitssalad",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 80 }),
        description: "A sweet pile of sliced fruit with crushed nuts on top.",
    }),
    [ITEM_IDS.FLAT_BREAD]: Object.freeze({
        id: ITEM_IDS.FLAT_BREAD,
        name: "Flat bread",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.3,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "flatbread",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 70 }),
        description: "A thin flat bread baked from flour and water. Simple travel food.",
    }),
    [ITEM_IDS.SHAWERMA]: Object.freeze({
        id: ITEM_IDS.SHAWERMA,
        name: "Shawerma",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.6,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "shawerma",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 150 }),
        description: "Flat bread stuffed with vegetables and meat. The finest street food of the wilderness.",
    }),
    [ITEM_IDS.SOUP]: Object.freeze({
        id: ITEM_IDS.SOUP,
        name: "Soup",
        kind: ITEM_KINDS.Consumable,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "soup",
        primaryStat: "sou",
        food: Object.freeze({ hungerRestore: 130 }),
        description: "A hot bowl of whatever was edible, simmered with herbs until it became a meal.",
    }),
    [ITEM_IDS.DOUGH]: createRawCookingItemDefinition(
        ITEM_IDS.DOUGH, "Dough", "dough",
        "A soft ball of flour and water. Needs baking or shaping before it becomes food."
    ),
    [ITEM_IDS.SWEET_DOUGH]: createRawCookingItemDefinition(
        ITEM_IDS.SWEET_DOUGH, "Sweet dough", "sweetdough",
        "Flour, water and sugar kneaded into a sweet dough."
    ),
    [ITEM_IDS.BREAD]: createBakedFoodDefinition(
        ITEM_IDS.BREAD, "Bread", "bread", 0.4, 100,
        "A simple loaf baked from dough. The backbone of every meal."
    ),
    [ITEM_IDS.TOAST_BREAD]: createBakedFoodDefinition(
        ITEM_IDS.TOAST_BREAD, "Toast bread", "toastbread", 0.3, 110,
        "A slice of bread toasted until crisp and warm."
    ),
    // --- combat gear -------------------------------------------------------
    [ITEM_IDS.BONE_HELM]: createCombatGearDefinition(
        ITEM_IDS.BONE_HELM, "Bone helm", "head", "bonehelm",
        { defence: 3, vit: 1 }, null,
        "A helmet lashed together from bones. Ugly, but it stops teeth."
    ),
    [ITEM_IDS.WOLF_HOOD]: createCombatGearDefinition(
        ITEM_IDS.WOLF_HOOD, "Wolf hood", "head", "wolfhood",
        { defence: 4, agi: 1, flee: 6 }, null,
        "A hood made from a wolf's head. The wolf no longer needs it."
    ),
    [ITEM_IDS.IRON_MASK]: createCombatGearDefinition(
        ITEM_IDS.IRON_MASK, "Iron mask", "face", "ironmask",
        { defence: 2, hit: 5 }, null,
        "A narrow iron mask with eye slits. Keeps your face and your focus intact."
    ),
    [ITEM_IDS.BEAST_NECKLACE]: createCombatGearDefinition(
        ITEM_IDS.BEAST_NECKLACE, "Beast fang necklace", "neck", "beastnecklace",
        { attack: 2, critChance: 5 }, null,
        "A necklace of predator fangs. It remembers how to bite."
    ),
    [ITEM_IDS.BONE_CHESTPLATE]: createCombatGearDefinition(
        ITEM_IDS.BONE_CHESTPLATE, "Bone chestplate", "torso", "bonechestplate",
        { defence: 7, vit: 2 }, null,
        "Ribs of something large, strapped across your ribs."
    ),
    [ITEM_IDS.SPIKED_PAULDRONS]: createCombatGearDefinition(
        ITEM_IDS.SPIKED_PAULDRONS, "Spiked pauldrons", "shoulders", "spikedpauldrons",
        { defence: 3, attack: 2, attackPercent: 5 }, null,
        "Shoulder guards with spikes. Shrugging now counts as an attack."
    ),
    [ITEM_IDS.HUNTER_CLOAK]: createCombatGearDefinition(
        ITEM_IDS.HUNTER_CLOAK, "Hunter cloak", "back", "huntercloak",
        { flee: 10, defence: 2, lootChance: 10 }, null,
        "A patched cloak that smells of old blood and older luck."
    ),
    [ITEM_IDS.WAR_BELT]: createCombatGearDefinition(
        ITEM_IDS.WAR_BELT, "War belt", "belt", "warbelt",
        { attack: 2, defence: 1, doubleAttackChance: 5 }, null,
        "A heavy belt with a weighted buckle. Good for follow-up swings."
    ),
    [ITEM_IDS.LEATHER_GLOVES]: createCombatGearDefinition(
        ITEM_IDS.LEATHER_GLOVES, "Leather gloves", "glove1", "leathergloves",
        { attack: 2, hit: 3 }, ["glove1", "glove2"],
        "Stiff leather gloves. Your grip stops slipping at the worst moment."
    ),
    [ITEM_IDS.BONE_BRACERS]: createCombatGearDefinition(
        ITEM_IDS.BONE_BRACERS, "Bone bracers", "wrist1", "bonebracers",
        { defence: 2, attackPercent: 5 }, ["wrist1", "wrist2"],
        "Bracers cut from hollow bones. Light, hard and slightly haunted."
    ),
    [ITEM_IDS.PADDED_TROUSERS]: createCombatGearDefinition(
        ITEM_IDS.PADDED_TROUSERS, "Padded trousers", "pants", "paddedtrousers",
        { defence: 4, vit: 1 }, null,
        "Thick quilted trousers. The legs are usually the first thing to go."
    ),
    [ITEM_IDS.IRON_GREAVES]: createCombatGearDefinition(
        ITEM_IDS.IRON_GREAVES, "Iron greaves", "legs", "irongreaves",
        { defence: 5, agi: 1 }, null,
        "Iron plates for the shins. Heavy, but they keep you standing."
    ),
    [ITEM_IDS.STEEL_BOOTS]: createCombatGearDefinition(
        ITEM_IDS.STEEL_BOOTS, "Steel boots", "feet", "steelboots",
        { defence: 3, flee: 6 }, null,
        "Boots with steel caps. Kicking is now a valid debate tactic."
    ),
    [ITEM_IDS.RING_OF_FURY]: createCombatGearDefinition(
        ITEM_IDS.RING_OF_FURY, "Ring of fury", "ring1", "ringoffury",
        { attackPercent: 10, critChance: 5, critDamage: 10 }, RING_SLOT_IDS,
        "A hot iron ring. Your anger finds the gaps in armour."
    ),
    [ITEM_IDS.PREDATOR_BAND]: createCombatGearDefinition(
        ITEM_IDS.PREDATOR_BAND, "Predator band", "ring1", "predatorband",
        { lootChance: 15, lootAmount: 20, mobLevelBonus: 1 }, RING_SLOT_IDS,
        "A band of predator bone. It attracts stronger prey and better spoils."
    ),
    [ITEM_IDS.FOCUS_EARRING]: createCombatGearDefinition(
        ITEM_IDS.FOCUS_EARRING, "Focus earring", "ear1", "focuseering",
        { hit: 5, critChance: 3, critDamage: 10 }, ["ear1", "ear2"],
        "A small polished stone. The world narrows to a single point."
    ),
    [ITEM_IDS.SWIFT_ANKLET]: createCombatGearDefinition(
        ITEM_IDS.SWIFT_ANKLET, "Swift anklet", "ankle1", "swiftanklet",
        { flee: 8, hit: 2, doubleAttackChance: 3 }, ["ankle1", "ankle2"],
        "A light anklet that clicks when you move. Your feet learn the rhythm."
    ),
    [ITEM_IDS.BONE_CLUB]: createCombatGearDefinition(
        ITEM_IDS.BONE_CLUB, "Bone club", "arm1", "boneclub",
        { attack: 6, defence: 1 }, FORAGING_TOOL_SLOTS,
        "A heavy femur with a wrapped grip. Simple and honest violence.",
        "hammerscrushworks"
    ),
    [ITEM_IDS.IRON_SWORD]: createCombatGearDefinition(
        ITEM_IDS.IRON_SWORD, "Iron sword", "arm1", "ironsword",
        { attack: 8, hit: 4 }, FORAGING_TOOL_SLOTS,
        "A straight iron blade with a short crossguard. Heavy enough to matter.",
        "swordsswingin"
    ),
    [ITEM_IDS.HUNTING_SPEAR]: createCombatGearDefinition(
        ITEM_IDS.HUNTING_SPEAR, "Hunting spear", "arm1", "huntingspear",
        { attack: 7, hit: 3, flee: 3 }, FORAGING_TOOL_SLOTS,
        "A long spear with a barbed head. Keeps the argument at a distance.",
        "spearsspooning"
    ),
    [ITEM_IDS.POISONED_DAGGER]: createCombatGearDefinition(
        ITEM_IDS.POISONED_DAGGER, "Poisoned dagger", "arm1", "poisoneddagger",
        { attack: 5, critChance: 8, poisonOnHit: 20 }, FORAGING_TOOL_SLOTS,
        "A thin blade coated in something the spiders taught you.",
        "knifesstabbing"
    ),
    [ITEM_IDS.BUTCHER_CLEAVER]: createCombatGearDefinition(
        ITEM_IDS.BUTCHER_CLEAVER, "Butcher cleaver", "arm1", "butchercleaver",
        { attack: 6, lootAmount: 25 }, FORAGING_TOOL_SLOTS,
        "A wide cleaver made for cutting meat. Excellent at getting more of it.",
        "hammerscrushworks"
    ),
    [ITEM_IDS.GUARDBREAKER_AXE]: createCombatGearDefinition(
        ITEM_IDS.GUARDBREAKER_AXE, "Guardbreaker axe", "arm1", "guardbreakeraxe",
        { attack: 7, attackPercent: 10, weakenOnDefend: 20 }, FORAGING_TOOL_SLOTS,
        "A notched axe with a hooked back. Every block leaves the enemy weaker.",
        "axechopping"
    ),
    [ITEM_IDS.LADLE]: Object.freeze({
        id: ITEM_IDS.LADLE,
        name: "Ladle",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.4,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "ladle",
        slot: "ladle",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A carved wooden ladle for serving soups and stews.",
    }),
    [ITEM_IDS.WOODEN_FORK]: Object.freeze({
        id: ITEM_IDS.WOODEN_FORK,
        name: "Wooden Fork",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.2,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "woodenfork",
        slot: "fork",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A simple wooden fork carved from sturdy sticks.",
    }),
    [ITEM_IDS.WOODEN_SPOON]: Object.freeze({
        id: ITEM_IDS.WOODEN_SPOON,
        name: "Wooden Spoon",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.2,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "woodenspoon",
        slot: "spoon",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A simple wooden spoon carved from sturdy sticks.",
    }),
    [ITEM_IDS.WOODEN_BOWL]: Object.freeze({
        id: ITEM_IDS.WOODEN_BOWL,
        name: "Wooden Bowl",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "woodenbowl",
        slot: "bowl",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A shallow bowl carved from a solid piece of wood.",
    }),
    [ITEM_IDS.WOODEN_LITTLE_SPOON]: Object.freeze({
        id: ITEM_IDS.WOODEN_LITTLE_SPOON,
        name: "Wooden Little Spoon",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.1,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "woodenlittlespoon",
        slot: "littlespoon",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A small wooden spoon for spices, honey and small portions.",
    }),
    [ITEM_IDS.WOODEN_MUG]: Object.freeze({
        id: ITEM_IDS.WOODEN_MUG,
        name: "Wooden Mug",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.4,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "woodenmug",
        slot: "mug",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A carved wooden mug with a sturdy handle.",
    }),
    [ITEM_IDS.CARVED_WOODEN_PLATE]: Object.freeze({
        id: ITEM_IDS.CARVED_WOODEN_PLATE,
        name: "Carved Wooden Plate",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 0.5,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "carvedwoodenplate",
        slot: "plate",
        stats: Object.freeze({ feastModifier: 1 }),
        description: "A shallow wooden plate with a carved rim.",
    }),
    [ITEM_IDS.CLAY_POT]: Object.freeze({
        id: ITEM_IDS.CLAY_POT,
        name: "Clay Pot",
        kind: ITEM_KINDS.Tool,
        stackable: false,
        weight: 2,
        rarity: ITEM_RARITIES.Common,
        quality: 1,
        durability: 1,
        icon: "claypot",
        slot: "pot",
        stats: Object.freeze({ cookingPower: 1 }),
        description: "A fired clay pot for cooking, boiling and storing food.",
    }),
    [ITEM_IDS.FLINT_PICKAXE]: createToolDefinition(
        ITEM_IDS.FLINT_PICKAXE, "Flint Pickaxe", "flintpickaxe",
        { type: "mining", power: 1 },
        "A flint-headed pickaxe for breaking stone and ore.",
        null, "axechopping"
    ),
    [ITEM_IDS.FLINT_SPEAR]: createToolDefinition(
        ITEM_IDS.FLINT_SPEAR, "Flint Spear", "flintspear",
        null,
        "A flint-tipped spear for hunting and fighting.",
        null, "spearsspooning"
    ),
    [ITEM_IDS.LEAF_OF_NATURE]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_OF_NATURE, "Leaf of Nature", "pants", "leafofnature"
    ),
    [ITEM_IDS.LEAF_HOOD]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_HOOD, "Leaf Hood", "head", "leafhood"
    ),
    [ITEM_IDS.LEAF_MASK]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_MASK, "Leaf Mask", "face", "leafmask"
    ),
    [ITEM_IDS.LEAF_NECKLACE]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_NECKLACE, "Leaf Necklace", "neck", "leafnecklace"
    ),
    [ITEM_IDS.LEAF_SHIRT]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_SHIRT, "Leaf Shirt", "torso", "leafshirt"
    ),
    [ITEM_IDS.LEAF_SHOULDERPADS]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_SHOULDERPADS, "Leaf Shoulderpads", "shoulders", "leafshoulderpads"
    ),
    [ITEM_IDS.LEAF_CLOAK]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_CLOAK, "Leaf Cloak", "back", "leafcloak"
    ),
    [ITEM_IDS.LEAF_BELT]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_BELT, "Leaf Belt", "belt", "leafbelt"
    ),
    [ITEM_IDS.SURVIVAL_POUNCH]: createLeafClothingDefinition(
        ITEM_IDS.SURVIVAL_POUNCH, "Survival Pounch", "pounch", "leafbelt"
    ),
    [ITEM_IDS.STRAW_BASKET_BACKPACK]: createLeafClothingDefinition(
        ITEM_IDS.STRAW_BASKET_BACKPACK, "Straw basket backpack", "backpack",
        "strawbasketbackpack", null,
        "A simple bag to storage descent amount of equipment"
    ),
    [ITEM_IDS.LEAF_GLOVE_I]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_GLOVE_I, "Leaf Glove I", "glove1", "leafglovei",
        ["glove1", "glove2"]
    ),
    [ITEM_IDS.LEAF_WRISTBAND_I]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_WRISTBAND_I, "Leaf Wristband I", "wrist1", "leafwristbandi",
        ["wrist1", "wrist2"]
    ),
    [ITEM_IDS.LEAF_TROUSERS]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_TROUSERS, "Leaf Trousers", "pants", "leaftrousers"
    ),
    [ITEM_IDS.LEAF_LEGGINGS]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_LEGGINGS, "Leaf Leggings", "legs", "leafleggings"
    ),
    [ITEM_IDS.LEAF_BOOTS]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_BOOTS, "Leaf Boots", "feet", "leafboots"
    ),
    [ITEM_IDS.LEAF_ANKLET_I]: createLeafClothingDefinition(
        ITEM_IDS.LEAF_ANKLET_I, "Leaf Anklet I", "ankle1", "leafankleti",
        ["ankle1", "ankle2"]
    ),
    ...METAL_VARIANT_ITEM_DEFS,
    ...METAL_POT_ITEM_DEFS,
    ...METAL_PAN_ITEM_DEFS,
});

// Human-readable metadata for every stat an item can grant while equipped.
// Any item with `stats` gets tooltip bonus lines automatically; only new stat
// keys need an entry here. `kind` decides how the number is shown:
//   "flat"       -> "+1 Attack"
//   "multiplier" -> "x2 chance to find something while foraging"
// Unknown stat keys fall back to a humanised name and the "flat" format.
const ITEM_STAT_DEFS = Object.freeze({
    attack: Object.freeze({
        label: "Attack",
        kind: "flat",
    }),
    defence: Object.freeze({
        label: "Defence",
        kind: "flat",
    }),
    // Combat equipment stats. Percentage values are stored as points: 10
    // means +10%.
    attackPercent: Object.freeze({
        label: "Attack",
        kind: "percentStat",
    }),
    defencePercent: Object.freeze({
        label: "Defence",
        kind: "percentStat",
    }),
    hit: Object.freeze({
        label: "Hit",
        kind: "flat",
    }),
    flee: Object.freeze({
        label: "Flee",
        kind: "flat",
    }),
    critChance: Object.freeze({
        label: "Crit chance",
        kind: "percentStat",
    }),
    critDamage: Object.freeze({
        label: "Crit damage",
        kind: "percentStat",
    }),
    doubleAttackChance: Object.freeze({
        label: "Double attack chance",
        kind: "percentStat",
    }),
    lootChance: Object.freeze({
        label: "Loot chance",
        kind: "percentStat",
    }),
    lootAmount: Object.freeze({
        label: "Loot amount",
        kind: "percentStat",
    }),
    mobLevelBonus: Object.freeze({
        label: "Mob level",
        kind: "flat",
    }),
    poisonOnHit: Object.freeze({
        label: "Poison on hit",
        kind: "percentStat",
    }),
    weakenOnDefend: Object.freeze({
        label: "Weaken on defence",
        kind: "percentStat",
    }),
    forageFindChance: Object.freeze({
        label: "chance to find something while foraging",
        kind: "multiplier",
    }),
    forageQuantity: Object.freeze({
        label: "amount of items found while foraging",
        kind: "multiplier",
    }),
    feastModifier: Object.freeze({
        label: "Feast modifier",
        kind: "flat",
    }),
    cookingPower: Object.freeze({
        label: "Cooking power",
        kind: "flat",
    }),
});

function humanizeItemStatName(statName) {
    const spaced = String(statName ?? "")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .trim()
        .toLowerCase();

    if (!spaced) return String(statName ?? "");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Feast efficiency is derived from FeastModifier:
//   (modifier * 0.06) / (1 - modifier * 0.06)
// The value is a fraction of hunger restoration removed by the equipped item.
function getFeastEfficiencyFromModifier(modifier) {
    const value = Math.max(0, Number(modifier) || 0);
    if (value <= 0) return 0;
    const scaled = Math.min(0.5, value * 0.06);
    return Math.min(0.95, scaled / (1 - scaled));
}

function describeItemStat(statName, value) {
    const meta = ITEM_STAT_DEFS[statName] || null;
    const amount = roundItemNumber(value);

    if (meta && meta.kind === "multiplier") {
        return "x" + amount + " " + meta.label;
    }

    const label = meta ? meta.label : humanizeItemStatName(statName);

    if (meta && meta.kind === "percentStat") {
        return (amount >= 0 ? "+" : "") + amount + "% " + label;
    }

    return (amount >= 0 ? "+" : "") + amount + " " + label;
}

function getItemPotentialBonusDescriptions(item) {
    const descriptions = [];
    if (!item || !item.potentialBonuses || typeof item.potentialBonuses !== "object") {
        return descriptions;
    }

    Object.keys(item.potentialBonuses).forEach(function (statName) {
        const value = Number(item.potentialBonuses[statName]);
        if (!Number.isFinite(value) || value <= 0) return;
        const stat = typeof player !== "undefined" && player
            ? player[statName]
            : null;
        const label = stat && stat.name ? stat.name : String(statName).toUpperCase();
        descriptions.push("+" + roundItemNumber(value) + " " + label + " potential");
    });

    return descriptions;
}

// Returns one readable line per stat the item grants while equipped.
// Works for ItemInstance objects and for plain saved item data.
function getItemBonusDescriptions(item) {
    if (!item) return [];

    const stats = typeof item.getStats === "function"
        ? item.getStats()
        : (item.stats && typeof item.stats === "object" ? item.stats : null);
    const descriptions = stats ? Object.keys(stats).map(function (statName) {
        return describeItemStat(statName, stats[statName]);
    }).filter(function (text) {
        return !!text;
    }) : [];

    const feastModifier = stats ? Number(stats.feastModifier) || 0 : 0;
    if (feastModifier > 0) {
        const feastEfficiency = getFeastEfficiencyFromModifier(feastModifier);
        descriptions.push(
            "Feast efficiency: -"
            + roundItemNumber(feastEfficiency * 100)
            + "% hunger restoration"
        );
    }

    Array.prototype.push.apply(
        descriptions,
        getItemPotentialBonusDescriptions(item)
    );

    if (typeof getItemToolPowers === "function") {
        getItemToolPowers(item).forEach(function (toolPower) {
            if (toolPower && toolPower.power > 0) {
                descriptions.push(
                    "+" + toolPower.power + " " + toolPower.label
                );
            }
        });
    }

    const weaponSkill = typeof getItemWeaponSkill === "function"
        ? getItemWeaponSkill(item)
        : null;
    if (weaponSkill && WEAPON_SKILL_LABELS[weaponSkill]) {
        descriptions.push("Weapon skill: " + WEAPON_SKILL_LABELS[weaponSkill]);
    }

    if (typeof getItemInventorySlotBonus === "function") {
        const slotBonus = getItemInventorySlotBonus(item);
        if (slotBonus > 0) {
            descriptions.push(
                "+" + slotBonus + " inventory slot" + (slotBonus === 1 ? "" : "s")
            );
        }
    }

    if (typeof getItemPounchSlotBonus === "function") {
        const pounchBonus = getItemPounchSlotBonus(item);
        if (pounchBonus > 0) {
            descriptions.push(
                "+" + pounchBonus + " pounch slot" + (pounchBonus === 1 ? "" : "s")
            );
        }
    }

    return descriptions;
}

function getItemDefinition(itemId) {
    return ITEM_DEFS[itemId] || null;
}

function getRarityDefinition(rarity) {
    if (rarity && typeof rarity === "object") return rarity;
    return ITEM_RARITY_DEFS[rarity] || null;
}

function getRarityLabel(rarity) {
    const definition = getRarityDefinition(rarity);
    return definition ? definition.label : String(rarity || "");
}

function getRarityMultiplier(rarity) {
    const definition = getRarityDefinition(rarity);
    return definition ? definition.multiplier : 1;
}

// Effective tool powers for one item instance. Uses the same unified formula
// as every other item value:
//   CurrentPower * sqrt(ItemQuality * ItemRarity) * variance
// Works for ItemInstance objects and plain saved item data.
function getItemToolPowers(item) {
    if (!item) return [];

    const definition = item.definition && typeof item.definition === "object"
        ? item.definition
        : (item.itemId != null ? getItemDefinition(item.itemId) : null);
    if (!definition) return [];

    const source = Array.isArray(definition.toolPowers)
        ? definition.toolPowers
        : definition.toolPower;
    const configs = normalizeToolPowerConfigs(source);
    if (configs.length === 0) return [];

    const rawQuality = Number(item.quality);
    const quality = Number.isFinite(rawQuality) && rawQuality >= 0
        ? rawQuality
        : (Number(definition.quality) || 1);

    const raritySource = item.rarityId ?? item.rarity ?? definition.rarity;
    const rarity = Math.max(0, Number(getRarityMultiplier(raritySource)) || 0);

    return configs.map(function (config) {
        return {
            type: config.type,
            label: ITEM_TOOL_POWER_TYPES[config.type].label,
            basePower: config.power,
            quality: quality,
            rarity: rarity,
            power: roundItemNumber(
                config.power * getItemPowerMultiplier(
                    quality,
                    rarity,
                    item.powerVariance
                )
            ),
        };
    });
}

// Legacy accessor: the first tool power of an item. Tools with several powers
// expose all of them through getItemToolPowers().
function getItemToolPower(item) {
    const toolPowers = getItemToolPowers(item);
    return toolPowers.length > 0 ? toolPowers[0] : null;
}

// Highest equipped tool power for one action type (cutting, chopping, smash,
// mining or digging). Only the best tool counts: holding two shovels does not
// stack their power.
function getEquippedToolPower(type, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 0;

    let best = 0;

    Object.keys(character.equipment).forEach(function (slotId) {
        getItemToolPowers(character.equipment[slotId]).forEach(function (toolPower) {
            if (toolPower.type !== type) return;
            if (toolPower.power > best) best = toolPower.power;
        });
    });

    if (best <= 0) return 0;
    return roundItemNumber(best * getEquippedToolPowerMultiplier(type, targetPlayer));
}

// AllToolsPowerMult and ToolPowerX are multiplicative. ToolPowerX only affects
// its own power type (the type is encoded in the property key).
function getEquippedToolPowerMultiplier(type, targetPlayer) {
    const allToolsMultiplier = 1 + getEquippedGlobalPropertyBonus(
        "allToolsPowerMult",
        targetPlayer
    );
    const specificMultiplier = 1 + getEquippedGlobalPropertyBonus(
        getToolPowerPropertyKey(type),
        targetPlayer
    );

    return allToolsMultiplier * specificMultiplier;
}

// Character tool power is the best matching item anywhere in the inventory or
// in an equipment slot. Carrying a tool is enough; it does not have to be worn.
function getCharacterToolPower(type, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character) return 0;

    let best = 0;

    function consider(item) {
        getItemToolPowers(item).forEach(function (toolPower) {
            if (toolPower.type !== type) return;
            if (toolPower.power > best) best = toolPower.power;
        });
    }

    if (character.equipment) {
        Object.keys(character.equipment).forEach(function (slotId) {
            consider(character.equipment[slotId]);
        });
    }

    if (Array.isArray(character.equipinventory)) {
        character.equipinventory.forEach(consider);
    }

    if (best <= 0) return 0;
    return roundItemNumber(best * getEquippedToolPowerMultiplier(type, targetPlayer));
}

// Every rarity has the same chance (1 / number of rarities).
function getRandomRarityId() {
    const rarityIds = Object.keys(ITEM_RARITY_DEFS);
    return rarityIds[Math.floor(Math.random() * rarityIds.length)];
}

function getItemPropertyCount(rarityId) {
    const count = ITEM_RARITY_PROPERTY_COUNTS[rarityId];
    return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

function normalizeItemPropertyEffect(effect) {
    if (effect === "special") return "special";
    return effect === "level" || effect === "growth" ? effect : "both";
}

function rollItemPropertyVariance() {
    return ITEM_PROPERTY_VARIANCE_MIN
        + Math.random() * (ITEM_PROPERTY_VARIANCE_MAX - ITEM_PROPERTY_VARIANCE_MIN);
}

// Single source of truth for item power. Every value an item grants (base
// stats, tool power and every affix) is scaled the same way:
//   base * sqrt(quality * rarity) * variance
// `quality` is the item's level. Variance is a 0.5-1.5 roll; when it is not
// supplied the value is treated as already rolled (factor 1).
function getItemPowerMultiplier(quality, rarityMultiplier, variance) {
    const numericQuality = Number(quality);
    const effectiveQuality = Number.isFinite(numericQuality) && numericQuality >= 0
        ? numericQuality
        : 1;
    const rarity = Math.max(0, Number(rarityMultiplier) || 0);
    const numericVariance = Number(variance);
    const effectiveVariance = Number.isFinite(numericVariance) && numericVariance > 0
        ? numericVariance
        : 1;

    return Math.sqrt(Math.max(0.01, effectiveQuality) * rarity)
        * effectiveVariance;
}

// Properties saved before variance/rarity scaling are marked as unscaled and
// are migrated once: their old percentage becomes the base bonus.
function normalizeItemProperty(property, rarityId, quality) {
    if (!property
        || (property.type !== "stat"
            && property.type !== "skill"
            && property.type !== "global")) {
        return null;
    }
    if (typeof property.key !== "string" || !property.key) return null;

    // Old items may still carry the removed Meditation skill property or the
    // old meditation* global modifier keys. Meditation is a skill again, so
    // the skill property is kept; only Focus action globals are renamed.
    let propertyKey = property.key;
    if (property.type === "global") {
        if (propertyKey === "meditationTimeskip") propertyKey = "focusTimeskip";
        if (propertyKey === "meditationCost") propertyKey = "focusCost";
    }

    const globalDefinition = property.type === "global"
        ? getItemGlobalPropertyDef(propertyKey)
        : null;
    if (property.type === "global" && !globalDefinition) return null;

    const effect = property.type === "global"
        ? "special"
        : normalizeItemPropertyEffect(property.effect);

    if (isFlatGlobalPropertyDef(globalDefinition)) {
        const rawValue = Number(property.value);
        const fallbackValue = Number(globalDefinition.flatValue);
        const baseValue = Number.isFinite(rawValue) && rawValue > 0
            ? rawValue
            : fallbackValue;
        if (!Number.isFinite(baseValue) || baseValue <= 0) return null;

        const value = property.scaled === true
            ? Math.round(baseValue)
            : Math.max(1, Math.round(
                baseValue * getItemPowerMultiplier(
                    quality,
                    getRarityMultiplier(rarityId),
                    rollItemPropertyVariance()
                )
            ));

        return {
            type: property.type,
            key: propertyKey,
            effect: effect,
            value: value,
            scaled: true,
        };
    }

    const percent = Number(property.percent);
    if (!Number.isFinite(percent) || percent <= 0) return null;

    if (property.scaled === true) {
        return {
            type: property.type,
            key: propertyKey,
            effect: effect,
            percent: roundItemNumber(percent),
            scaled: true,
        };
    }

    return {
        type: property.type,
        key: propertyKey,
        effect: effect,
        percent: roundItemNumber(
            percent * getItemPowerMultiplier(
                quality,
                getRarityMultiplier(rarityId),
                rollItemPropertyVariance()
            )
        ),
        scaled: true,
    };
}

function getItemGlobalPropertyDef(key) {
    const toolPowerType = getToolPowerTypeFromPropertyKey(key);
    if (toolPowerType && ITEM_TOOL_POWER_TYPES[toolPowerType]) {
        const typeLabel = ITEM_TOOL_POWER_TYPES[toolPowerType].label
            .replace(/ power$/i, "");
        return {
            key: key,
            label: "Tool power: " + typeLabel,
            basePercent: 0.10,
            kind: "percent",
        };
    }

    return ITEM_GLOBAL_PROPERTY_DEFS.find(function (definition) {
        return definition.key === key;
    }) || null;
}

function isFlatGlobalPropertyDef(definition) {
    return !!definition && definition.kind === "flat";
}

function getItemPropertyTemplates() {
    const templates = [];

    CORE_STAT_NAMES.forEach(function (key) {
        templates.push({
            type: "stat",
            key: key,
            effect: "level",
            basePercent: ITEM_PROPERTY_LEVEL_BASE_PERCENT,
        });
        templates.push({
            type: "stat",
            key: key,
            effect: "growth",
            basePercent: ITEM_PROPERTY_GROWTH_BASE_PERCENT,
        });
    });
    LEARNABLE_SKILL_KEYS.forEach(function (key) {
        templates.push({
            type: "skill",
            key: key,
            effect: "level",
            basePercent: ITEM_PROPERTY_LEVEL_BASE_PERCENT,
        });
        templates.push({
            type: "skill",
            key: key,
            effect: "growth",
            basePercent: ITEM_PROPERTY_GROWTH_BASE_PERCENT,
        });
    });
    ITEM_GLOBAL_PROPERTY_DEFS.forEach(function (definition) {
        templates.push({
            type: "global",
            key: definition.key,
            effect: "special",
            kind: definition.kind || "percent",
            basePercent: definition.basePercent,
            flatValue: definition.flatValue,
        });
    });

    // ToolPowerX: one template per power type. The property roller picks one
    // template uniformly, so every roll chooses exactly one random power type.
    Object.keys(ITEM_TOOL_POWER_TYPES).forEach(function (type) {
        templates.push({
            type: "global",
            key: getToolPowerPropertyKey(type),
            effect: "special",
            kind: "percent",
            basePercent: 0.10,
        });
    });

    return templates;
}

// Picks distinct property templates (stat/skill level, stat/skill growth or a
// standalone global effect). Every value uses the unified quality * rarity
// scaling and a 50%-150% variance roll.
function rollItemProperties(rarityId, quality) {
    const count = getItemPropertyCount(rarityId);
    if (count <= 0) return [];

    const pool = getItemPropertyTemplates();
    const rarityMultiplier = getRarityMultiplier(rarityId);
    const properties = [];

    for (let index = 0; index < count; index++) {
        if (!pool.length) {
            Array.prototype.push.apply(pool, getItemPropertyTemplates());
        }

        const poolIndex = Math.floor(Math.random() * pool.length);
        const template = pool.splice(poolIndex, 1)[0];

        const property = {
            type: template.type,
            key: template.key,
            effect: template.effect,
            scaled: true,
        };

        if (template.type === "global" && template.kind === "flat") {
            const baseValue = Number(template.flatValue);
            if (!Number.isFinite(baseValue) || baseValue <= 0) continue;
            property.value = Math.max(1, Math.round(
                baseValue * getItemPowerMultiplier(
                    quality,
                    rarityMultiplier,
                    rollItemPropertyVariance()
                )
            ));
        } else {
            property.percent = roundItemNumber(
                template.basePercent * getItemPowerMultiplier(
                    quality,
                    rarityMultiplier,
                    rollItemPropertyVariance()
                )
            );
        }

        properties.push(property);
    }

    return properties;
}

function getItemPropertyTargetName(property) {
    if (!property) return "";

    const entry = typeof player !== "undefined" && player
        ? player[property.key]
        : null;
    const name = entry && typeof entry.name === "string" && entry.name
        ? entry.name
        : property.key;

    return name.charAt(0).toUpperCase() + name.slice(1);
}

function getItemPropertyLabel(property) {
    const percent = roundItemNumber(Number(property.percent) * 100);

    if (property.type === "global") {
        const definition = getItemGlobalPropertyDef(property.key);

        if (isFlatGlobalPropertyDef(definition)) {
            const rawValue = Number(property.value);
            const value = Number.isFinite(rawValue) && rawValue > 0
                ? Math.round(rawValue)
                : (Number(definition.flatValue) || 0);
            let label = definition.label || property.key;
            if (value === 1 && label.endsWith("s")) {
                label = label.slice(0, -1);
            }
            return "+" + value + " " + label;
        }

        const sign = definition && definition.displaySign === -1 ? "-" : "+";
        return sign + percent + "% "
            + (definition ? definition.label : property.key);
    }

    const effect = normalizeItemPropertyEffect(property.effect);
    const suffix = effect === "level"
        ? " level"
        : (effect === "growth" ? " growth" : " level & growth");

    return "+" + percent + "% " + getItemPropertyTargetName(property) + suffix;
}

// Sums all level/growth bonuses for one stat or skill from equipped items.
// Used by skill and stat tooltips so the player can see what the clothing
// currently adds, regardless of which item grants it.
function getEquippedPropertyTotals(key, targetPlayer) {
    const totals = { level: 0, growth: 0 };
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return totals;

    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item || !Array.isArray(item.properties)) return;

        item.properties.forEach(function (property) {
            if (!property || property.type === "global" || property.key !== key) return;

            const percent = Number(property.percent);
            if (!Number.isFinite(percent) || percent <= 0) return;

            const effect = normalizeItemPropertyEffect(property.effect);
            if (effect === "level" || effect === "both") totals.level += percent;
            if (effect === "growth" || effect === "both") totals.growth += percent;
        });
    });

    return totals;
}

// Tooltip block for a stat/skill description. Returns an empty string when
// nothing equipped affects that key, so ordinary descriptions stay unchanged.
function getEquippedPropertyTooltipHtml(key, targetPlayer) {
    const totals = getEquippedPropertyTotals(key, targetPlayer);
    const lines = [];

    if (totals.level > 0) {
        lines.push('<span class="itemproperty">' + getItemPropertyLabel({
            type: "stat",
            key: key,
            effect: "level",
            percent: totals.level,
        }) + "</span>");
    }

    if (totals.growth > 0) {
        lines.push('<span class="itemproperty">' + getItemPropertyLabel({
            type: "stat",
            key: key,
            effect: "growth",
            percent: totals.growth,
        }) + "</span>");
    }

    if (!lines.length) return "";

    return '<span class="itemproperties-title">Equipment bonuses:</span><br>'
        + lines.join("<br>");
}

function getItemPropertiesHtml(item) {
    // Food uses potential instead of random equipment properties. This also
    // hides old properties stored on food crafted before the change.
    const definition = item && item.itemId != null ? getItemDefinition(item.itemId) : null;
    if (definition && definition.food) return "";

    const properties = item && Array.isArray(item.properties) ? item.properties : [];
    if (!properties.length) return "";

    const lines = properties.map(function (property) {
        return '<span class="itemproperty">'
            + getItemPropertyLabel(property) + "</span>";
    });

    return '<span class="itemproperties-title">Properties:</span><br>'
        + lines.join("<br>");
}

// Total bonus granted by a single item. `effect` filters level/growth; the
// legacy combined effect ("both") matches either filter.
function getItemPropertyBonus(item, type, key, effect) {
    const properties = item && Array.isArray(item.properties) ? item.properties : [];
    let bonus = 0;

    properties.forEach(function (property) {
        if (!property || property.type !== type || property.key !== key) return;

        const propertyEffect = normalizeItemPropertyEffect(property.effect);
        if (effect && propertyEffect !== effect && propertyEffect !== "both") {
            return;
        }

        const percent = Number(property.percent);
        if (Number.isFinite(percent) && percent > 0) bonus += percent;
    });

    return bonus;
}

// Growth multiplier from all currently equipped items, stacking additively.
function getEquippedPropertyMultiplier(type, key, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 1;

    let bonus = 0;

    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item) return;
        bonus += getItemPropertyBonus(item, type, key, "growth");
    });

    return 1 + bonus;
}

// Level/value bonus from all currently equipped item properties. A key can
// only belong to one type, so both are summed safely.
function getEquippedPropertyLevelBonus(key, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 0;

    let bonus = 0;

    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item) return;
        bonus += getItemPropertyBonus(item, "stat", key, "level");
        bonus += getItemPropertyBonus(item, "skill", key, "level");
    });

    return bonus;
}

// Standalone (non stat/skill) property bonus, stacking additively.
function getEquippedGlobalPropertyBonus(key, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 0;

    let bonus = 0;

    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item || !Array.isArray(item.properties)) return;

        item.properties.forEach(function (property) {
            if (!property || property.type !== "global" || property.key !== key) return;

            const percent = Number(property.percent);
            if (Number.isFinite(percent) && percent > 0) bonus += percent;
        });
    });

    return bonus;
}

function getEquippedGlobalPropertyMultiplier(key, targetPlayer) {
    return 1 + getEquippedGlobalPropertyBonus(key, targetPlayer);
}

// Flat global bonuses (for example +1 Pounch slot or +3 inventory slots) use
// `value` instead of `percent`, so they never pass through percentage scaling.
function getEquippedGlobalFlatBonus(key, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 0;

    let bonus = 0;

    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item || !Array.isArray(item.properties)) return;

        item.properties.forEach(function (property) {
            if (!property || property.type !== "global" || property.key !== key) return;

            const value = Number(property.value);
            if (Number.isFinite(value) && value > 0) bonus += value;
        });
    });

    return bonus;
}

function roundItemNumber(value) {
    return Math.round(value * 100) / 100;
}

// Multipliers granted by currently equipped items. Items in the inventory do
// not count. `getStats()` already applies the unified quality/rarity/variance
// scaling, so a rarer Handy Stick gives a stronger forage bonus.
function getEquippedStatMultiplier(statName, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 1;

    let multiplier = 1;

    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item) return;

        const stats = typeof item.getStats === "function"
            ? item.getStats()
            : (item.stats && typeof item.stats === "object" ? item.stats : null);
        if (!stats) return;

        const value = stats[statName];
        if (typeof value === "number" && value > 0) {
            multiplier *= value;
        }
    });

    return multiplier;
}

let nextItemInstanceId = 0;

class ItemInstance {
    constructor(itemId, options) {
        const definition = getItemDefinition(itemId);
        if (!definition) {
            throw new Error("Unknown item id: " + itemId);
        }

        const settings = options || {};
        this.instanceId = ++nextItemInstanceId;
        this.itemId = itemId;

        const requestedRarity = settings.rarity ?? settings.rarityId;
        this.rarityId = typeof requestedRarity === "string" && ITEM_RARITY_DEFS[requestedRarity]
            ? requestedRarity
            : definition.rarity;

        this.quality = typeof settings.quality === "number" ? settings.quality : definition.quality;
        // One variance roll per instance. It is saved with the item, so stats
        // and tool power stay stable across reloads.
        const requestedVariance = Number(settings.powerVariance);
        this.powerVariance = Number.isFinite(requestedVariance) && requestedVariance > 0
            ? requestedVariance
            : rollItemPropertyVariance();
        this.durability = typeof settings.durability === "number"
            ? settings.durability
            : definition.durability;
        // Inventory lock: set when a double-click cannot find a free equipment
        // slot. Locked items are protected from the bulk "Scrap all" action.
        this.locked = settings.locked === true;
        this.count = definition.stackable
            ? Math.max(1, Math.floor(settings.count || 1))
            : 1;
        this.displayName = typeof settings.displayName === "string"
            && settings.displayName.trim()
            ? settings.displayName
            : null;
        this.sourceResourceId = settings.sourceResourceId != null
            ? settings.sourceResourceId
            : null;
        this.primaryStat = settings.primaryStat || definition.primaryStat || null;
        this.potentialBonuses = settings.potentialBonuses
            && typeof settings.potentialBonuses === "object"
            ? Object.assign({}, settings.potentialBonuses)
            : null;

        const savedProperties = Array.isArray(settings.properties)
            ? settings.properties.map(function (property) {
                return normalizeItemProperty(property, this.rarityId, this.quality);
            }, this).filter(Boolean)
            : null;

        // Food does not use equipment properties; its crafting bonuses are
        // stored as potential instead.
        this.properties = savedProperties
            || (definition.food ? [] : rollItemProperties(this.rarityId, this.quality));
    }

    get definition() {
        return ITEM_DEFS[this.itemId];
    }

    get name() {
        return this.displayName || this.definition.name;
    }

    get description() {
        return this.definition.description;
    }

    get kind() {
        return this.definition.kind;
    }

    get rarity() {
        return this.rarityId;
    }

    get rarityDefinition() {
        return getRarityDefinition(this.rarity);
    }

    get rarityLabel() {
        return getRarityLabel(this.rarity);
    }

    get rarityMultiplier() {
        return getRarityMultiplier(this.rarity);
    }

    get effectiveQuality() {
        return roundItemNumber(this.quality * this.rarityMultiplier);
    }

    getStats() {
        const baseStats = this.definition.stats || {};
        // Unified item power: base * sqrt(quality * rarity) * variance.
        const multiplier = getItemPowerMultiplier(
            this.quality,
            this.rarityMultiplier,
            this.powerVariance
        );
        const stats = {};

        Object.keys(baseStats).forEach(function (statName) {
            stats[statName] = roundItemNumber(baseStats[statName] * multiplier);
        });

        return stats;
    }

    get slot() {
        return this.definition.slot;
    }

    get weight() {
        return this.definition.weight * this.count;
    }
}

function createItemInstance(itemId, options) {
    return new ItemInstance(itemId, options);
}

function restoreItemInstance(savedItem) {
    if (!savedItem || typeof savedItem !== "object") return null;
    if (savedItem instanceof ItemInstance) return savedItem;

    const itemId = savedItem.itemId ?? savedItem.id;
    if (!getItemDefinition(itemId)) return null;

    return createItemInstance(itemId, {
        quality: savedItem.quality,
        durability: savedItem.durability,
        count: savedItem.count,
        rarity: savedItem.rarity ?? savedItem.rarityId,
        properties: savedItem.properties,
        powerVariance: savedItem.powerVariance,
        locked: savedItem.locked === true,
        displayName: savedItem.displayName,
        sourceResourceId: savedItem.sourceResourceId,
        primaryStat: savedItem.primaryStat,
        potentialBonuses: savedItem.potentialBonuses,
    });
}

// The pants slot is never allowed to stay empty: a fresh Leaf of Nature is
// created and equipped as soon as the slot is free. Called on a new game,
// after loading a save and on every equipment render (which covers removing
// the previous leaf by drag and drop).
function ensurePantsEquipped(targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return null;
    if (character.equipment.pants) return null;

    const leaf = createItemInstance(ITEM_IDS.LEAF_OF_NATURE, {
        rarity: getRandomRarityId(),
    });
    character.equipment.pants = leaf;
    return leaf;
}
