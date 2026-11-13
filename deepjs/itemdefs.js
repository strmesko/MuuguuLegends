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

const ITEM_DEFS = Object.freeze({
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
