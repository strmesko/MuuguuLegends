// Building system: data, tile-bound building instances, build UI and the
// construction action that finishes an unfinished building.
//
// Buildings are created at the current tile. Their effects only apply once the
// building is completed, so every instance carries a `completed` flag.

const BUILDING_IDS = Object.freeze({
    CAMPFIRE: "campfire",
    TENT: "tent",
    LEAF_BEDROLL: "leaf-bedroll",
    WELL: "well",
    MINE_ENTRANCE: "mine-entrance",
    PREPARE_FOUNDATIONS: "prepare-foundations",
    DUGOUT_HOUSE: "dugout-house",
    LOG_CABIN: "log-cabin",
    STONE_SHED: "stone-shed",
    CLAY_HOUSE: "clay-house",
    WORKBENCH: "workbench",
    STRAY_BED: "stray-bed",
    HAMMOCK: "hammock",
    STUMP_CHAIR: "stump-chair",
    SMELTER: "smelter",
});

const BUILDING_CATEGORY = Object.freeze({
    id: "camping",
    name: "Camping",
    buttonId: "buildcamping",
    placeholderId: "campingplace",
});

const BUILDINGS_CATEGORY = Object.freeze({
    id: "buildings",
    name: "Buildings",
    buttonId: "buildbuildings",
    placeholderId: "buildingsplace",
});

const HOUSES_CATEGORY = Object.freeze({
    id: "houses",
    name: "Houses",
    buttonId: "buildhouses",
    placeholderId: "housesplace",
});

const FURNITURE_CATEGORY = Object.freeze({
    id: "furniture",
    name: "Furniture",
    buttonId: "buildfurniture",
    placeholderId: "furnitureplace",
});

const BUILDING_IMPROVE_CATEGORY = Object.freeze({
    id: "improve",
    name: "Improve",
    buttonId: "buildimprove",
    placeholderId: "improveplace",
});

const BUILDING_CATEGORIES = Object.freeze([
    BUILDING_CATEGORY,
    BUILDINGS_CATEGORY,
    HOUSES_CATEGORY,
    FURNITURE_CATEGORY,
    BUILDING_IMPROVE_CATEGORY,
]);

const HOUSE_POWER_TYPES = Object.freeze({
    smelt: Object.freeze({ id: "smelt", label: "Smelt power" }),
    cooking: Object.freeze({ id: "cooking", label: "Cooking power" }),
});

const BUILDING_DEFS = Object.freeze({
    [BUILDING_IDS.CAMPFIRE]: Object.freeze({
        id: BUILDING_IDS.CAMPFIRE,
        name: "Campfire",
        category: BUILDING_CATEGORY.id,
        description: "A warm campfire for the camp. Finish the construction to make its effect available.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 30 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FLINT, amount: 10 }),
            Object.freeze({ resourceId: RESOURCE_IDS.BRANCHES, amount: 50 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 10 }),
        ]),
        workPoints: 200,
        improveCost: Object.freeze({
            workPoints: 20,
            resources: Object.freeze([
                Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.FLINT, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.BRANCHES, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 1 }),
            ]),
        }),
        emptySpace: 1,
        skill: "survival",
        housePowers: Object.freeze([
            Object.freeze({ type: "cooking", base: 1, perQuality: 0.01 }),
        ]),
        effects: Object.freeze([]),
        iconClass: "fa-fire",
        effectText: "Hearthfire: Quality * Rarity stacks while standing on this tile. Burns 1 Stick + 1 Leaf every 50 seconds and slowly produces Ash. CookingPower: 1 + 0.01 * BuildingQuality.",
    }),
    [BUILDING_IDS.TENT]: Object.freeze({
        id: BUILDING_IDS.TENT,
        name: "Tent",
        category: BUILDING_CATEGORY.id,
        description: "A sturdy tent for a proper camp. Completing it adds 3 RoomSpace to this tile.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.STICKS, amount: 20 }),
            Object.freeze({ resourceId: RESOURCE_IDS.BRANCHES, amount: 60 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 10 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 100 }),
        ]),
        workPoints: 2000,
        improveCost: Object.freeze({
            workPoints: 200,
            resources: Object.freeze([
                Object.freeze({ resourceId: RESOURCE_IDS.STICKS, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.BRANCHES, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 1 }),
            ]),
        }),
        emptySpace: 1,
        roomSpace: 0,
        roomSpaceReward: 3,
        skill: "survival",
        effects: Object.freeze([]),
        iconClass: "fa-home",
        effectText: "+3 RoomSpace on completion.",
    }),
    [BUILDING_IDS.LEAF_BEDROLL]: Object.freeze({
        id: BUILDING_IDS.LEAF_BEDROLL,
        name: "Leaf Bedroll",
        category: BUILDING_CATEGORY.id,
        description: "A soft bedroll made of leaves and fibers. Only one bedroll effect works per tile.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 25 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 50 }),
        ]),
        workPoints: 1000,
        improveCost: Object.freeze({
            workPoints: 100,
            resources: Object.freeze([
                Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 1 }),
                Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 1 }),
            ]),
        }),
        emptySpace: 0,
        roomSpace: 1,
        roomSpaceReward: 0,
        skill: "survival",
        tags: Object.freeze(["SleepingPlace"]),
        sleepQualityDivisor: 100,
        effects: Object.freeze([]),
        iconClass: "fa-bed",
        effectText: "Sleep quality +1 + (BuildingQuality / 100). Only the best SleepingPlace bonus on a tile applies.",
    }),
    [BUILDING_IDS.WELL]: Object.freeze({
        id: BUILDING_IDS.WELL,
        name: "Well",
        category: BUILDINGS_CATEGORY.id,
        description: "A deep stone well. Once completed, it supplies water on this tile for Mortar and future water-based recipes.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FLINT, amount: 250 }),
            Object.freeze({ resourceId: RESOURCE_IDS.MORTAR, amount: 100 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_BEAMS, amount: 2 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 50 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_PLANK, amount: 50 }),
        ]),
        workPoints: 4000,
        emptySpace: 1,
        requiredDiggingPower: 20,
        skill: "digging",
        effects: Object.freeze([]),
        iconClass: "fa-tint",
        effectText: "Acts as a water source for Mortar and future water-based recipes.",
    }),
    [BUILDING_IDS.MINE_ENTRANCE]: Object.freeze({
        id: BUILDING_IDS.MINE_ENTRANCE,
        name: "Mine entrance",
        category: BUILDINGS_CATEGORY.id,
        description: "A reinforced entrance into the rock. Completed mine entrances boost Mining on this tile.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_BEAMS, amount: 100 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_PLANK, amount: 50 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 50 }),
        ]),
        workPoints: 5000,
        spaceElementRequirements: Object.freeze([
            Object.freeze({ element: "Rock", amount: 1 }),
        ]),
        skill: "survival",
        effects: Object.freeze([]),
        iconClass: "fa-mountain",
        effectText: "Multiplies Mining efficiency by the average completed Mine entrance quality while on this tile. Each extra mine multiplies the result by 1.2.",
    }),
    [BUILDING_IDS.PREPARE_FOUNDATIONS]: Object.freeze({
        id: BUILDING_IDS.PREPARE_FOUNDATIONS,
        name: "Prepare foundations",
        category: BUILDINGS_CATEGORY.id,
        description: "Prepare a solid foundation on fertile land. Construction consumes 1 FertileLand; when the work is finished, this project is removed and leaves 1 EmptySpace behind. Unfortunately, there is no way to turn fertile soil back",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.DIRT, amount: 5000 }),
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 500 }),
        ]),
        workPoints: 20000,
        spaceElementRequirements: Object.freeze([
            Object.freeze({ element: "FertileLand", amount: 1 }),
        ]),
        consumeSpaceElements: true,
        completionEmptySpace: 1,
        removeOnCompletion: true,
        skill: "digging",
        effects: Object.freeze([]),
        iconClass: "fa-th-large",
        effectText: "On completion, the project is removed and leaves 1 EmptySpace.",
    }),
    [BUILDING_IDS.DUGOUT_HOUSE]: Object.freeze({
        id: BUILDING_IDS.DUGOUT_HOUSE,
        name: "Dugout house",
        category: HOUSES_CATEGORY.id,
        description: "A sturdy house dug into the earth. Its quality depends on your Digging power and Strength.",
        resources: Object.freeze([]),
        workPoints: 40000,
        emptySpace: 3,
        roomSpaceReward: 8,
        roomSpaceBonusFromQuality: true,
        skill: "digging",
        effects: Object.freeze([]),
        iconClass: "fa-home",
        effectText: "Provides 8 RoomSpace plus a bonus equal to sqrt(BuildingQuality).",
    }),
    [BUILDING_IDS.LOG_CABIN]: Object.freeze({
        id: BUILDING_IDS.LOG_CABIN,
        name: "Log cabin",
        category: HOUSES_CATEGORY.id,
        description: "A spacious cabin built from logs, beams and planks. A proper carpentry project.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_LOGS, amount: 300 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_BEAMS, amount: 20 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_PLANK, amount: 50 }),
            Object.freeze({ resourceId: RESOURCE_IDS.SHAFTS, amount: 100 }),
        ]),
        workPoints: 30000,
        emptySpace: 5,
        roomSpaceReward: 20,
        skill: "carpentry",
        effects: Object.freeze([]),
        iconClass: "fa-home",
        effectText: "Provides 20 RoomSpace.",
    }),
    [BUILDING_IDS.STONE_SHED]: Object.freeze({
        id: BUILDING_IDS.STONE_SHED,
        name: "Stone shed",
        category: HOUSES_CATEGORY.id,
        description: "A solid shed raised from stone, mortar and timber. Its masonry creates a large amount of usable EmptySpace.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 2000 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FLINT, amount: 500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.MORTAR, amount: 500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_BEAMS, amount: 10 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 50 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_PLANK, amount: 50 }),
        ]),
        workPoints: 50000,
        emptySpace: 2,
        completionEmptySpace: 20,
        skill: "masonry",
        effects: Object.freeze([]),
        iconClass: "fa-cubes",
        effectText: "Provides 20 EmptySpace on completion.",
    }),
    [BUILDING_IDS.CLAY_HOUSE]: Object.freeze({
        id: BUILDING_IDS.CLAY_HOUSE,
        name: "Clay House",
        category: HOUSES_CATEGORY.id,
        description: "A comfortable house shaped from clay and bound with fibers and timber. Its thick walls create plenty of room.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FLINT, amount: 100 }),
            Object.freeze({ resourceId: RESOURCE_IDS.CLAY, amount: 2500 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 30 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_LOGS, amount: 10 }),
        ]),
        workPoints: 50000,
        emptySpace: 2,
        roomSpaceReward: 25,
        skill: "pottery",
        effects: Object.freeze([]),
        iconClass: "fa-home",
        effectText: "Provides 25 RoomSpace.",
    }),
    [BUILDING_IDS.WORKBENCH]: Object.freeze({
        id: BUILDING_IDS.WORKBENCH,
        name: "WorkBench",
        category: FURNITURE_CATEGORY.id,
        description: "A solid workbench for processing raw materials. Its quality determines how much faster Production actions become.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_LOGS, amount: 4 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_BEAMS, amount: 4 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_PLANK, amount: 10 }),
        ]),
        workPoints: 4000,
        roomSpace: 1,
        skill: "carpentry",
        effects: Object.freeze([]),
        iconClass: "fa-wrench",
        effectText: "Production action efficiency x(1 + 0.2 * BuildingQuality). Only the best completed WorkBench on the tile applies.",
    }),
    [BUILDING_IDS.STRAY_BED]: Object.freeze({
        id: BUILDING_IDS.STRAY_BED,
        name: "Stray bed",
        category: FURNITURE_CATEGORY.id,
        description: "A simple bed stuffed with leaves and fibers on a wooden frame. A much better place to sleep than a bedroll.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 10 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 100 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_BEAMS, amount: 4 }),
            Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_PLANK, amount: 10 }),
        ]),
        workPoints: 4000,
        roomSpace: 1,
        skill: "carpentry",
        tags: Object.freeze(["SleepingPlace"]),
        sleepQualityDivisor: 20,
        effects: Object.freeze([]),
        iconClass: "fa-bed",
        effectText: "Sleep quality +1 + (BuildingQuality / 20). Only the best SleepingPlace bonus on a tile applies.",
    }),
    [BUILDING_IDS.HAMMOCK]: Object.freeze({
        id: BUILDING_IDS.HAMMOCK,
        name: "Hammock",
        category: FURNITURE_CATEGORY.id,
        description: "A light hammock woven from strong fibers and lined with leaves. Comfortable, portable and easy to hang.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 100 }),
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 50 }),
        ]),
        workPoints: 4000,
        skill: "tailoring",
        tags: Object.freeze(["SleepingPlace"]),
        sleepQualityDivisor: 70,
        effects: Object.freeze([]),
        iconClass: "fa-bed",
        effectText: "Sleep quality +1 + (BuildingQuality / 70). Only the best SleepingPlace bonus on a tile applies.",
    }),
    [BUILDING_IDS.STUMP_CHAIR]: Object.freeze({
        id: BUILDING_IDS.STUMP_CHAIR,
        name: "Stump chair",
        category: FURNITURE_CATEGORY.id,
        description: "A chair carved from a tree stump with an axe. A comfortable place to sit and enjoy a meal.",
        resources: Object.freeze([]),
        workPoints: 1000,
        requiredChoppingPower: 3,
        skill: "carpentry",
        tags: Object.freeze(["SittingPlace"]),
        effects: Object.freeze([]),
        iconClass: "fa-tree",
        effectText: "Stamina regeneration +BuildingQuality% and FeastModifier +BuildingQuality%. Only the best SittingPlace bonus on a tile applies.",
    }),
    [BUILDING_IDS.SMELTER]: Object.freeze({
        id: BUILDING_IDS.SMELTER,
        name: "Smelter",
        category: FURNITURE_CATEGORY.id,
        description: "A stone furnace for melting and cooking. While you stay on its tile, it provides house powers.",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.ROCKS, amount: 300 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FLINT, amount: 100 }),
            Object.freeze({ resourceId: RESOURCE_IDS.MORTAR, amount: 200 }),
        ]),
        workPoints: 20000,
        roomSpace: 3,
        skill: "masonry",
        housePowers: Object.freeze([
            Object.freeze({ type: "smelt", base: 3, perQuality: 1 }),
            Object.freeze({ type: "cooking", base: 1, perQuality: 0.5 }),
        ]),
        effects: Object.freeze([]),
        iconClass: "fa-industry",
        effectText: "Provides 3 + 1 * BuildingQuality Smelt power and 1 + 0.5 * BuildingQuality Cooking power while you are on this tile.",
    }),
});

const BUILDING_SKILL_EXP_PER_WORKPOINT = 0.1;

// Building rarity is derived from construction quality: every 10 quality
// points unlock the next item rarity tier, from Common to Galaxic.
const BUILDING_RARITY_ORDER = Object.freeze([
    ITEM_RARITIES.Common,
    ITEM_RARITIES.Uncommon,
    ITEM_RARITIES.SomewhatRare,
    ITEM_RARITIES.Rare,
    ITEM_RARITIES.RareRare,
    ITEM_RARITIES.Unique,
    ITEM_RARITIES.MoreUniq,
    ITEM_RARITIES.Epic,
    ITEM_RARITIES.Galaxic,
]);
const BUILDING_RARITY_QUALITY_STEP = 10;

let lastMapCoordinatesRefresh = 0;
let mapCoordinatesRefreshTimer = null;

let buildings = [];
let nextBuildingUid = 1;
let selectedBuildingId = BUILDING_IDS.CAMPFIRE;
let selectedBuildingsBuildingId = BUILDING_IDS.WELL;
let selectedHousesBuildingId = BUILDING_IDS.DUGOUT_HOUSE;
let selectedFurnitureBuildingId = BUILDING_IDS.WORKBENCH;
let selectedImprovementUid = null;
const buildingActions = Object.create(null);

function getBuildingDefinition(defId) {
    return BUILDING_DEFS[defId] || null;
}

function getBuildingTags(buildingOrDef) {
    if (!buildingOrDef) return [];
    const def = buildingOrDef.defId
        ? getBuildingDefinition(buildingOrDef.defId)
        : buildingOrDef;
    return def && Array.isArray(def.tags) ? def.tags : [];
}

function hasBuildingTag(buildingOrDef, tag) {
    const target = String(tag).toLowerCase();
    return getBuildingTags(buildingOrDef).some(function (buildingTag) {
        return String(buildingTag).toLowerCase() === target;
    });
}

// ImproveCost is 10% of the construction WorkPoints plus 1 of every resource
// required to build the same building type. Campfire, Tent and Leaf Bedroll
// keep their explicit legacy costs; every other building uses this fallback.
function getBuildingImproveCost(buildingOrDef) {
    if (!buildingOrDef) return null;
    if (buildingOrDef.improveCost) return buildingOrDef.improveCost;

    const def = getBuildingDefinition(buildingOrDef.defId || buildingOrDef);
    if (!def) return null;
    if (def.improveCost) return def.improveCost;

    const workPoints = Math.max(1, Math.round((Number(def.workPoints) || 0) * 0.1));
    const seenResources = {};
    const resources = [];

    (Array.isArray(def.resources) ? def.resources : []).forEach(function (requirement) {
        if (!requirement || requirement.resourceId == null) return;
        const key = String(requirement.resourceId);
        if (seenResources[key]) return;
        seenResources[key] = true;
        resources.push(Object.freeze({
            resourceId: requirement.resourceId,
            amount: 1,
        }));
    });

    return Object.freeze({
        workPoints: workPoints,
        resources: Object.freeze(resources),
    });
}

function getSelectedBuildingDefinition() {
    return getBuildingDefinition(selectedBuildingId);
}

function getSelectedBuildingsBuildingDefinition() {
    return getBuildingDefinition(selectedBuildingsBuildingId);
}

function getSelectedHousesBuildingDefinition() {
    return getBuildingDefinition(selectedHousesBuildingId);
}

function getSelectedFurnitureBuildingDefinition() {
    return getBuildingDefinition(selectedFurnitureBuildingId);
}

function getCharacterDiggingPower() {
    return typeof getCharacterToolPower === "function"
        ? Math.max(0, Number(getCharacterToolPower("digging")) || 0)
        : 0;
}

function getCharacterChoppingPower() {
    return typeof getCharacterToolPower === "function"
        ? Math.max(0, Number(getCharacterToolPower("chopping")) || 0)
        : 0;
}

// Mining efficiency from completed Mine entrances on the same tile. Multiple
// entrances use their average quality and gain x1.2 for every extra mine.
function getMineEntranceMiningMultiplier(tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return 1;

    const mines = targetTile.buildings.filter(function (building) {
        return building
            && building.defId === BUILDING_IDS.MINE_ENTRANCE
            && building.completed;
    });
    if (!mines.length) return 1;

    const totalQuality = mines.reduce(function (sum, building) {
        return sum + getBuildingQualityValue(building);
    }, 0);
    const averageQuality = totalQuality / mines.length;
    const extraMineMultiplier = Math.pow(1.2, Math.max(0, mines.length - 1));

    return Math.max(0, averageQuality * extraMineMultiplier);
}

function getBuildingResourceAmount(resourceId) {
    const stack = resources ? resources[resourceId] : null;
    return stack ? Number(stack.amount) || 0 : 0;
}

function getCurrentTileEmptySpace() {
    if (!currentTile || !currentTile.space) return 0;
    const value = Number(currentTile.space.EmptySpace);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function getCurrentTileSpaceElementAmount(elementName) {
    if (!currentTile || !currentTile.space) return 0;
    if (typeof getTileSpaceAmount === "function") {
        return getTileSpaceAmount(currentTile.space, elementName);
    }

    const target = String(elementName).toLowerCase();
    return Object.keys(currentTile.space).reduce(function (sum, key) {
        return String(key).toLowerCase() === target
            ? sum + Math.max(0, Number(currentTile.space[key]) || 0)
            : sum;
    }, 0);
}

function consumeCurrentTileSpaceElement(elementName, amount) {
    if (!currentTile || !currentTile.space) return false;

    const required = Math.max(0, Number(amount) || 0);
    if (required <= 0) return true;

    const target = String(elementName).toLowerCase();
    const key = Object.keys(currentTile.space).find(function (spaceKey) {
        return String(spaceKey).toLowerCase() === target;
    });
    if (!key) return false;

    const available = Math.max(0, Number(currentTile.space[key]) || 0);
    if (available < required) return false;

    const remaining = round2(available - required);
    if (remaining > 0) {
        currentTile.space[key] = remaining;
    } else {
        delete currentTile.space[key];
    }
    return true;
}

function getCurrentTileRoomSpace() {
    if (!currentTile || !currentTile.space) return 0;
    const value = Number(currentTile.space.RoomSpace);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
}

// Unified building quality formula for every category.
// Quality is the amount-weighted average quality of all required materials.
// Buildings that are carved from the earth or wood without material costs
// fall back to the builder's relevant tool power and Strength so they still
// have a meaningful quality value.
function getBuildingQuality(def) {
    if (!def) return RESOURCE_DEFAULT_QUALITY;

    const requirements = Array.isArray(def.resources) ? def.resources : [];
    let weightedQuality = 0;
    let totalAmount = 0;

    requirements.forEach(function (requirement) {
        const stack = resources ? resources[requirement.resourceId] : null;
        const rawQuality = stack ? Number(stack.quality) : RESOURCE_DEFAULT_QUALITY;
        const quality = Number.isFinite(rawQuality) && rawQuality > 0
            ? rawQuality
            : RESOURCE_DEFAULT_QUALITY;

        weightedQuality += quality * requirement.amount;
        totalAmount += requirement.amount;
    });

    if (totalAmount > 0) {
        return round2(weightedQuality / totalAmount);
    }

    const usesChopping = (Number(def.requiredChoppingPower) || 0) > 0;
    const toolPower = Math.max(
        1,
        usesChopping ? getCharacterChoppingPower() : getCharacterDiggingPower()
    );
    const strength = Math.max(1, getEffectiveLevel("str") || 0);
    return round2(Math.sqrt(toolPower * strength));
}

function getBuildingQualityValue(buildingOrValue) {
    const rawQuality = typeof buildingOrValue === "object" && buildingOrValue
        ? buildingOrValue.quality
        : buildingOrValue;
    const quality = Number(rawQuality);
    return Number.isFinite(quality) && quality > 0
        ? quality
        : RESOURCE_DEFAULT_QUALITY;
}

function getBuildingRoomSpaceReward(building, def) {
    const baseReward = Number(def && def.roomSpaceReward) || 0;
    if (def && def.roomSpaceBonusFromQuality) {
        return round2(baseReward + Math.sqrt(getBuildingQualityValue(building)));
    }
    return baseReward;
}

function getBuildingRarityId(buildingOrQuality) {
    const quality = Math.max(0, getBuildingQualityValue(buildingOrQuality));
    const tier = Math.min(
        BUILDING_RARITY_ORDER.length - 1,
        Math.floor(quality / BUILDING_RARITY_QUALITY_STEP)
    );
    return BUILDING_RARITY_ORDER[tier];
}

function getBuildingRarityMultiplier(buildingOrQuality) {
    return getRarityMultiplier(getBuildingRarityId(buildingOrQuality));
}

// Campfire Hearthfire stacks: Quality * Rarity. Quality is the campfire's
// construction quality (including fractions), rarity is the numeric
// multiplier of its derived rarity tier.
function getCampfireStackCount(building) {
    if (!building
        || building.defId !== BUILDING_IDS.CAMPFIRE
        || !building.completed) {
        return 0;
    }

    return Math.max(
        0,
        round2(getBuildingQualityValue(building) * getBuildingRarityMultiplier(building))
    );
}

// The best completed campfire on the tile activates. "Best" means the one
// that grants the most Hearthfire stacks.
function getBestCampfireOnTile(tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return null;

    let bestBuilding = null;
    let bestStacks = 0;

    targetTile.buildings.forEach(function (building) {
        if (!building
            || building.defId !== BUILDING_IDS.CAMPFIRE
            || !building.completed) {
            return;
        }

        const stacks = getCampfireStackCount(building);
        if (stacks > bestStacks) {
            bestBuilding = building;
            bestStacks = stacks;
        }
    });

    return bestBuilding ? { building: bestBuilding, stacks: bestStacks } : null;
}

// Improvement resources are consumed one by one, so their quality target is
// the plain arithmetic mean of the current stacks (not weighted by amount).
function getImprovementResourceQuality(buildingOrDef) {
    const isBuilding = !!(buildingOrDef && buildingOrDef.defId);
    const def = isBuilding
        ? getBuildingDefinition(buildingOrDef.defId)
        : (buildingOrDef && buildingOrDef.id ? buildingOrDef : getBuildingDefinition(buildingOrDef));
    const cost = getBuildingImproveCost(def);
    if (!def || !cost) {
        return RESOURCE_DEFAULT_QUALITY;
    }

    // Buildings without material costs are improved through work alone.
    // Their target is one quality point above the current value.
    if (!Array.isArray(cost.resources) || !cost.resources.length) {
        const currentQuality = isBuilding
            ? getBuildingQualityValue(buildingOrDef)
            : getBuildingQuality(def);
        return round2(currentQuality + 1);
    }

    let totalQuality = 0;
    cost.resources.forEach(function (requirement) {
        const stack = resources ? resources[requirement.resourceId] : null;
        const rawQuality = stack ? Number(stack.quality) : RESOURCE_DEFAULT_QUALITY;
        totalQuality += Number.isFinite(rawQuality) && rawQuality > 0
            ? rawQuality
            : RESOURCE_DEFAULT_QUALITY;
    });

    return totalQuality / cost.resources.length;
}

// A skilled builder can use the full 10% step. If the skill is below the
// resource quality, the step is scaled down and the result stays closer to
// the quality before the improvement.
function getImprovementSkillFactor(buildingOrDef) {
    const def = buildingOrDef && buildingOrDef.defId
        ? getBuildingDefinition(buildingOrDef.defId)
        : (buildingOrDef && buildingOrDef.id ? buildingOrDef : getBuildingDefinition(buildingOrDef));
    if (!def) return 0;

    const targetQuality = getImprovementResourceQuality(buildingOrDef);
    if (targetQuality <= 0) return 0;

    const skillLevel = Math.max(0, getEffectiveLevel(def.skill) || 0);
    return Math.max(0, Math.min(1, skillLevel / targetQuality));
}

function getImprovedBuildingQuality(building) {
    if (!building) return RESOURCE_DEFAULT_QUALITY;

    const def = getBuildingDefinition(building.defId);
    const currentQuality = getBuildingQualityValue(building);
    const targetQuality = getImprovementResourceQuality(building);
    const difference = targetQuality - currentQuality;
    if (difference <= 0) return currentQuality;

    return currentQuality + difference * 0.1 * getImprovementSkillFactor(building);
}

function getImprovementCandidates(tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return [];

    return targetTile.buildings.filter(function (building) {
        if (!building || !building.completed) return false;

        const def = getBuildingDefinition(building.defId);
        if (!def || !getBuildingImproveCost(def)) return false;

        return getImprovementResourceQuality(building) > getBuildingQualityValue(building);
    });
}

function canImproveBuilding(building) {
    if (!building || !building.completed || !isBuildingOnCurrentTile(building)) return false;

    const def = getBuildingDefinition(building.defId);
    const cost = getBuildingImproveCost(def);
    if (!def || !cost) return false;
    if (getImprovementResourceQuality(building) <= getBuildingQualityValue(building)) return false;

    return cost.resources.every(function (requirement) {
        return getBuildingResourceAmount(requirement.resourceId) >= requirement.amount;
    });
}

function canBuildBuilding(def) {
    if (!def || !currentTile) return false;
    if (getCurrentTileEmptySpace() < (def.emptySpace || 0)) return false;
    if (getCurrentTileRoomSpace() < (def.roomSpace || 0)) return false;
    if (getCharacterDiggingPower() < (Number(def.requiredDiggingPower) || 0)) {
        return false;
    }
    if (getCharacterChoppingPower() < (Number(def.requiredChoppingPower) || 0)) {
        return false;
    }

    if (Array.isArray(def.spaceElementRequirements)
        && def.spaceElementRequirements.some(function (requirement) {
            return getCurrentTileSpaceElementAmount(requirement.element)
                < requirement.amount;
        })) {
        return false;
    }

    return def.resources.every(function (requirement) {
        return getBuildingResourceAmount(requirement.resourceId) >= requirement.amount;
    });
}

function getBuildingActionId(building) {
    return "build:" + building.uid;
}

function getBuildingByUid(uid) {
    return buildings.find(function (building) {
        return building.uid === uid;
    }) || null;
}

function isBuildingOnCurrentTile(building) {
    return !!building
        && !!currentTile
        && building.x === currentTile.x
        && building.y === currentTile.y;
}

function isUnfinishedBuildingOnCurrentTile(building) {
    return isBuildingOnCurrentTile(building)
        && !building.completed
        && building.workPoints > 0;
}

function getHubBuildingList() {
    return buildings;
}

function getCurrentTileBuildings() {
    if (!currentTile) return [];
    if (!Array.isArray(currentTile.buildings)) currentTile.buildings = [];
    return currentTile.buildings;
}

function attachBuildingsToTile(tile) {
    if (!tile) return [];
    if (!Array.isArray(tile.buildings)) tile.buildings = [];

    tile.buildings = buildings.filter(function (building) {
        return building.x === tile.x && building.y === tile.y;
    });
    return tile.buildings;
}

function attachBuildingsToCurrentTile() {
    return attachBuildingsToTile(currentTile);
}

function refreshMapCoordinates(force) {
    if (!window.mapView || typeof window.mapView.refreshCoordinates !== "function") return;

    const apply = function () {
        if (mapCoordinatesRefreshTimer) {
            clearTimeout(mapCoordinatesRefreshTimer);
            mapCoordinatesRefreshTimer = null;
        }
        lastMapCoordinatesRefresh = Date.now();
        window.mapView.refreshCoordinates();
        if (typeof window.mapView.refresh === "function") {
            window.mapView.refresh();
        }
    };

    if (force) {
        apply();
        return;
    }

    // Construction updates the progress every tick, so throttle the DOM write
    // but keep a trailing update so the final percentage is never lost.
    const elapsed = Date.now() - lastMapCoordinatesRefresh;
    if (elapsed >= 250) {
        apply();
        return;
    }

    if (!mapCoordinatesRefreshTimer) {
        mapCoordinatesRefreshTimer = setTimeout(apply, 250 - elapsed);
    }
}

function getBuildingWorkPerSecond(buildingOrDef) {
    const def = buildingOrDef && buildingOrDef.defId
        ? getBuildingDefinition(buildingOrDef.defId)
        : buildingOrDef;
    if (!def) return 0;

    const averageStat = (
        getEffectiveLevel("agi")
        + getEffectiveLevel("vit")
        + getEffectiveLevel("int")
    ) / 3;
    const skillLevel = getEffectiveLevel(def.skill);
    const weatherMultiplier = typeof getGameWeatherActionMultiplier === "function"
        ? getGameWeatherActionMultiplier("build")
        : 1;
    return Math.max(0, averageStat * skillLevel * weatherMultiplier);
}

function getBestCompletedBuildingQuality(defId, tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return null;

    let bestQuality = null;
    targetTile.buildings.forEach(function (building) {
        if (!building || building.defId !== defId || !building.completed) return;

        const rawQuality = Number(building.quality);
        const quality = Number.isFinite(rawQuality) && rawQuality > 0
            ? rawQuality
            : RESOURCE_DEFAULT_QUALITY;

        if (bestQuality === null || quality > bestQuality) {
            bestQuality = quality;
        }
    });

    return bestQuality;
}

// Any completed building tagged SleepingPlace can improve sleep quality.
// Every candidate grants +1 + (BuildingQuality / its divisor); only the
// single largest bonus on the tile applies.
function getSleepQualityBuildingBonus(tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return 0;

    let bestBonus = 0;

    targetTile.buildings.forEach(function (building) {
        if (!building || !building.completed) return;

        const def = getBuildingDefinition(building.defId);
        if (!def || !hasBuildingTag(def, "SleepingPlace")) return;

        const divisor = Number(def.sleepQualityDivisor);
        if (!Number.isFinite(divisor) || divisor <= 0) return;

        const bonus = 1 + getBuildingQualityValue(building) / divisor;
        if (bonus > bestBonus) {
            bestBonus = bonus;
        }
    });

    return bestBonus;
}

// Only the single completed SittingPlace building with the largest quality
// bonus on the tile applies. Its quality percentage is used both for stamina
// regeneration and for the FeastModifier.
function getBestSittingPlaceBuilding(tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return null;

    let bestBuilding = null;
    let bestQuality = -1;

    targetTile.buildings.forEach(function (building) {
        if (!building || !building.completed) return;

        const def = getBuildingDefinition(building.defId);
        if (!def || !hasBuildingTag(def, "SittingPlace")) return;

        const quality = getBuildingQualityValue(building);
        if (quality > bestQuality) {
            bestBuilding = building;
            bestQuality = quality;
        }
    });

    return bestBuilding;
}

function getSittingPlaceBonus(tile) {
    const building = getBestSittingPlaceBuilding(tile);
    return building ? getBuildingQualityValue(building) : 0;
}

function getFeastModifier(tile) {
    const sittingBonus = getSittingPlaceBonus(tile);
    const equipmentBonus = typeof getEquippedFeastModifierTotal === "function"
        ? getEquippedFeastModifierTotal()
        : 0;
    return round2(sittingBonus + equipmentBonus);
}

function getSittingPlaceStaminaRegenMultiplier(tile) {
    return 1 + getSittingPlaceBonus(tile) / 100;
}

// House powers come from completed buildings on the current tile. Every
// matching completed building contributes its base value plus its quality
// scaling. Smelter and Campfire both supply Cooking power; other buildings may
// add more types later.
function getHousePowerTotal(type, tile) {
    const targetTile = tile || currentTile;
    if (!targetTile || !Array.isArray(targetTile.buildings)) return 0;

    let total = 0;

    targetTile.buildings.forEach(function (building) {
        if (!building || !building.completed) return;

        const def = getBuildingDefinition(building.defId);
        if (!def || !Array.isArray(def.housePowers)) return;

        const quality = getBuildingQualityValue(building);
        def.housePowers.forEach(function (power) {
            if (!power || power.type !== type) return;
            total += (Number(power.base) || 0)
                + (Number(power.perQuality) || 0) * quality;
        });
    });

    return round2(total);
}

function getCharacterHousePower(type, tile) {
    const buildingPower = getHousePowerTotal(type, tile);
    if (type !== "cooking") return buildingPower;

    // Cooking pots and other equipped cookware add their Cooking power on top
    // of the power supplied by completed buildings on the current tile.
    const itemPower = typeof getEquippedStatBonus === "function"
        ? getEquippedStatBonus("cookingPower")
        : 0;
    return round2(buildingPower + itemPower);
}

// Only the best completed WorkBench on the tile applies. Production action
// efficiency is multiplied by 1 + 0.2 * BuildingQuality.
function getWorkBenchProductionMultiplier(tile) {
    const bestQuality = getBestCompletedBuildingQuality(BUILDING_IDS.WORKBENCH, tile);
    if (bestQuality === null) return 1;
    return Math.max(0, 1 + 0.2 * bestQuality);
}

function removeBuildingInstance(building) {
    if (!building) return;

    const worldIndex = buildings.indexOf(building);
    if (worldIndex !== -1) buildings.splice(worldIndex, 1);

    if (currentTile && Array.isArray(currentTile.buildings)) {
        const tileIndex = currentTile.buildings.indexOf(building);
        if (tileIndex !== -1) currentTile.buildings.splice(tileIndex, 1);
    }

    building.removed = true;

    // The construction action is still running at this point, so remove it
    // after runActiveActions finishes iterating.
    setTimeout(function () {
        if (typeof pruneBuildingActions === "function") {
            pruneBuildingActions();
        }
        if (typeof refreshActionButtons === "function") {
            refreshActionButtons();
        }
    }, 0);
}

function applyBuildingCompletion(building) {
    const def = building ? getBuildingDefinition(building.defId) : null;
    if (!def) return;

    // Effects are deliberately applied only here, after workPoints reach zero.
    // Campfire has none yet, so this is currently just the completion gate.
    const roomSpaceReward = getBuildingRoomSpaceReward(building, def);
    if (roomSpaceReward > 0 && !building.roomSpaceApplied) {
        if (!currentTile.space) currentTile.space = { EmptySpace: 1000, RoomSpace: 0 };
        currentTile.space.RoomSpace = round2(
            (Number(currentTile.space.RoomSpace) || 0) + roomSpaceReward
        );
        building.roomSpaceApplied = true;
    }

    const completionEmptySpace = Math.max(
        0,
        Number(def.completionEmptySpace) || 0
    );
    if (completionEmptySpace > 0) {
        if (!currentTile.space) currentTile.space = { EmptySpace: 1000, RoomSpace: 0 };
        currentTile.space.EmptySpace = round2(
            (Number(currentTile.space.EmptySpace) || 0) + completionEmptySpace
        );
    }

    if (Array.isArray(def.effects)) {
        def.effects.forEach(function (effect) {
            if (effect && typeof effect.apply === "function") {
                effect.apply(building, currentTile);
            }
        });
    }

    if (def.removeOnCompletion) {
        removeBuildingInstance(building);
    }

    refreshMapCoordinates(true);
}

function runBuildingProduction(building, diff) {
    if (!building || building.completed) return;
    if (!isBuildingOnCurrentTile(building)) return;

    const seconds = Number(diff) || 0;
    if (seconds <= 0) return;

    const def = getBuildingDefinition(building.defId);
    if (!def) return;

    const work = getBuildingWorkPerSecond(building) * seconds;
    if (work <= 0) return;

    building.workPoints = Math.max(0, building.workPoints - work);
    refreshMapCoordinates();

    if (player && player[def.skill] && typeof player[def.skill].addexp === "function") {
        player[def.skill].addexp(work * BUILDING_SKILL_EXP_PER_WORKPOINT);
    }

    // Infrastructure and housing projects also train Architecture.
    if (player && player.architecture
        && typeof player.architecture.addexp === "function"
        && (def.category === BUILDINGS_CATEGORY.id
            || def.category === HOUSES_CATEGORY.id)) {
        player.architecture.addexp(work * BUILDING_SKILL_EXP_PER_WORKPOINT);
    }

    if (building.workPoints <= 0) {
        building.workPoints = 0;
        building.completed = true;
        applyBuildingCompletion(building);
        if (typeof refreshBuildingInstanceRows === "function") {
            refreshBuildingInstanceRows();
        }
        if (typeof renderBuildingsPanels === "function") {
            renderBuildingsPanels();
        }
        if (typeof renderHousesPanels === "function") {
            renderHousesPanels();
        }
        if (typeof renderFurniturePanels === "function") {
            renderFurniturePanels();
        }
        if (typeof renderImprovePanels === "function") {
            renderImprovePanels();
        }
    }
}

function createBuildingAction(building) {
    const def = getBuildingDefinition(building.defId);

    return {
        id: getBuildingActionId(building),
        label: "build " + def.name,
        description: function () {
            return "Build " + def.name + " at " + building.x + ", " + building.y + "."
                + "<br>WorkPoints: " + round2(building.workPoints) + " / " + def.workPoints
                + "<br>Construction speed: " + round2(getBuildingWorkPerSecond(building))
                + " WorkPoints per second."
                + "<br>Only buildings on the current tile can be built.";
        },
        kind: ACTION_KIND.Timed,
        initialState: Activity.Idle,
        startMessage: "You start building " + def.name + ".",
        stopMessage: "You stop building " + def.name + ".",
        completeMessage: def.name + " is complete.",
        isVisible: function () {
            return isUnfinishedBuildingOnCurrentTile(building);
        },
        isComplete: function () {
            return building.completed || building.workPoints <= 0;
        },
        run: function (diff) {
            runBuildingProduction(building, diff);
        },
    };
}

function registerBuildingAction(building) {
    const actionId = getBuildingActionId(building);
    if (ACTIONS_BY_ID[actionId]) return false;

    const action = createBuildingAction(building);
    ACTIONS.push(action);
    ACTIONS_BY_ID[actionId] = action;
    buildingActions[actionId] = building;
    actionStates[actionId] = Activity.Idle;
    actionVisibility[actionId] = false;
    return true;
}

function removeBuildingAction(actionId, keepHistory) {
    const index = ACTIONS.findIndex(function (action) {
        return action.id === actionId;
    });
    if (index !== -1) ACTIONS.splice(index, 1);

    delete ACTIONS_BY_ID[actionId];
    delete actionStates[actionId];
    delete actionVisibility[actionId];
    delete buildingActions[actionId];

    const button = getActionButton(actionId);
    if (button) button.remove();

    if (!keepHistory && Array.isArray(previousTimedActionIds)) {
        previousTimedActionIds = previousTimedActionIds.filter(function (id) {
            return id !== actionId;
        });
    }
}

function clearBuildingActions() {
    Object.keys(buildingActions).forEach(function (actionId) {
        removeBuildingAction(actionId, true);
    });
}

function pruneBuildingActions() {
    Object.keys(buildingActions).forEach(function (actionId) {
        const building = buildingActions[actionId];
        if (actionStates[actionId] === Activity.Active) return;
        if (!building
            || building.completed
            || building.workPoints <= 0
            || !isBuildingOnCurrentTile(building)) {
            removeBuildingAction(actionId);
        }
    });
}

function refreshBuildingActions() {
    pruneBuildingActions();

    let added = false;
    getCurrentTileBuildings().forEach(function (building) {
        if (building.completed || building.workPoints <= 0) return;
        if (registerBuildingAction(building)) added = true;
    });

    if (added) refreshActionButtons();
}

function serializeBuildings() {
    return buildings.map(function (building) {
        return {
            uid: building.uid,
            defId: building.defId,
            x: building.x,
            y: building.y,
            workPoints: round2(building.workPoints),
            completed: building.completed === true,
            quality: round2(building.quality),
            roomSpaceApplied: building.roomSpaceApplied === true,
        };
    });
}

function restoreBuildings(savedBuildings) {
    clearBuildingActions();
    buildings = [];
    nextBuildingUid = 1;

    (Array.isArray(savedBuildings) ? savedBuildings : []).forEach(function (saved) {
        if (!saved) return;

        const def = getBuildingDefinition(saved.defId);
        const x = Number(saved.x);
        const y = Number(saved.y);
        if (!def || !Number.isFinite(x) || !Number.isFinite(y)) return;

        const rawUid = Number(saved.uid);
        const uid = Number.isInteger(rawUid) && rawUid > 0 ? rawUid : nextBuildingUid;
        nextBuildingUid = Math.max(nextBuildingUid, uid + 1);

        const rawWork = Number(saved.workPoints);
        const workPoints = Number.isFinite(rawWork)
            ? Math.max(0, Math.min(def.workPoints, rawWork))
            : def.workPoints;
        const completed = saved.completed === true || workPoints <= 0;
        const rawQuality = Number(saved.quality);
        const quality = Number.isFinite(rawQuality) && rawQuality > 0
            ? rawQuality
            : RESOURCE_DEFAULT_QUALITY;

        const building = {
            uid: uid,
            defId: def.id,
            x: x,
            y: y,
            workPoints: completed ? 0 : workPoints,
            completed: completed,
            quality: quality,
            roomSpaceApplied: saved.roomSpaceApplied === true || completed,
        };

        buildings.push(building);
        if (!completed) registerBuildingAction(building);
    });

    attachBuildingsToCurrentTile();
    refreshMapCoordinates(true);
}

// --- build interface -------------------------------------------------------

function createBuildPanelTitle(text) {
    const title = document.createElement("div");
    title.className = "craftpanel-title";
    title.innerText = text;
    return title;
}

function ensureBuildPanel() {
    const place = document.getElementById(BUILDING_CATEGORY.placeholderId);
    if (!place) return false;

    if (!document.getElementById("buildinglist")) {
        place.innerHTML = "";

        const list = document.createElement("div");
        list.className = "craftlist";
        list.id = "buildinglist";

        const description = document.createElement("div");
        description.className = "craftdescription";
        description.id = "buildingdescription";

        const details = document.createElement("div");
        details.className = "craftdetails";
        details.id = "buildingdetails";

        place.appendChild(list);
        place.appendChild(description);
        place.appendChild(details);
    }

    return true;
}

function renderBuildList() {
    const list = document.getElementById("buildinglist");
    if (!list) return;

    list.innerHTML = "";

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = BUILDING_CATEGORY.name;
    group.appendChild(groupTitle);

    const defs = Object.keys(BUILDING_DEFS).map(getBuildingDefinition).filter(function (def) {
        return def && def.category === BUILDING_CATEGORY.id;
    });

    if (!defs.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing to build here yet.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    const buildingList = document.createElement("ul");
    buildingList.className = "habitlist";

    defs.forEach(function (def) {
        const item = document.createElement("li");
        item.className = "habititem craftrecipe";
        item.id = "buildingrecipe-" + def.id;
        item.dataset.buildingId = def.id;
        item.classList.toggle("selected", def.id === selectedBuildingId);
        item.classList.toggle("unavailable", !canBuildBuilding(def));

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            def.name + "<br>WorkPoints: " + def.workPoints
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = def.name;

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        item.appendChild(switchElement);
        item.addEventListener("click", function () {
            selectedBuildingId = def.id;
            renderBuildPanels();
        });

        buildingList.appendChild(item);
    });

    group.appendChild(buildingList);
    list.appendChild(group);
}

function createBuildResourceRow(def, requirement) {
    const resourceDefinition = RESOURCE_DEFS[requirement.resourceId];
    if (!resourceDefinition) return null;

    const have = getBuildingResourceAmount(requirement.resourceId);
    const row = document.createElement("div");
    row.className = "craftresource " + (have >= requirement.amount ? "enough" : "missing");
    row.dataset.buildResource = requirement.resourceId;
    row.setAttribute("data-tooltip", resourceDefinition.description);

    row.appendChild(createItemImage(resourceDefinition.name, "craftresourceicon"));

    const name = document.createElement("span");
    name.className = "craftresource-name";
    name.innerText = resourceDefinition.name;

    const amount = document.createElement("span");
    amount.className = "craftresource-amount";
    amount.innerText = round2(have) + " / " + requirement.amount;

    row.appendChild(name);
    row.appendChild(amount);
    return row;
}

function createBuildValueRow(label, value, dataKey) {
    const row = document.createElement("div");
    row.className = "craftresource";
    if (dataKey) row.dataset.buildRequirement = dataKey;

    const name = document.createElement("span");
    name.className = "craftresource-name";
    name.innerText = label;

    const amount = document.createElement("span");
    amount.className = "craftresource-amount";
    amount.innerText = value;

    row.appendChild(name);
    row.appendChild(amount);
    return row;
}

function renderBuildResources() {
    const panel = document.getElementById("buildingdescription");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createBuildPanelTitle("Required resources"));

    const def = getSelectedBuildingDefinition();
    if (!def) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Select a building from the list.";
        panel.appendChild(empty);
        return;
    }

    const container = document.createElement("div");
    container.className = "craftresources";

    def.resources.forEach(function (requirement) {
        const row = createBuildResourceRow(def, requirement);
        if (row) container.appendChild(row);
    });

    container.appendChild(createBuildValueRow(
        "WorkPoints",
        String(def.workPoints),
        "work"
    ));

    if ((def.emptySpace || 0) > 0) {
        const emptySpace = getCurrentTileEmptySpace();
        const spaceRow = createBuildValueRow(
            "Empty space",
            round2(emptySpace) + " / " + def.emptySpace,
            "emptySpace"
        );
        spaceRow.classList.add(emptySpace >= def.emptySpace ? "enough" : "missing");
        container.appendChild(spaceRow);
    }

    if ((def.roomSpace || 0) > 0) {
        const roomSpace = getCurrentTileRoomSpace();
        const roomRow = createBuildValueRow(
            "Room space",
            round2(roomSpace) + " / " + def.roomSpace,
            "roomSpace"
        );
        roomRow.classList.add(roomSpace >= def.roomSpace ? "enough" : "missing");
        container.appendChild(roomRow);
    }

    panel.appendChild(container);

    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow";
    skillRow.dataset.buildSkill = "1";
    skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
        + def.skill.slice(1) + " Lv " + round2(getEffectiveLevel(def.skill));
    panel.appendChild(skillRow);

    const speedRow = document.createElement("div");
    speedRow.className = "craftskillrow";
    speedRow.dataset.buildSpeed = "1";
    speedRow.innerText = "Construction speed: "
        + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
    panel.appendChild(speedRow);
}

function renderBuildingInstanceRows(container, def) {
    container.innerHTML = "";
    const tileBuildings = getCurrentTileBuildings();
    container.dataset.buildingCount = String(tileBuildings.length);

    if (!tileBuildings.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No buildings on this tile.";
        container.appendChild(empty);
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = document.createElement("div");
        row.className = "buildinginstance";
        row.dataset.buildingUid = String(building.uid);
        row.classList.toggle("completed", building.completed);

        const name = document.createElement("div");
        name.className = "buildinginstance-name";
        name.innerText = def.name + " #" + building.uid;

        const status = document.createElement("div");
        status.className = "buildinginstance-status";
        status.innerText = getBuildingInstanceStatus(building, def);

        row.appendChild(name);
        row.appendChild(status);
        container.appendChild(row);
    });
}

function getBuildingInstanceStatus(building, def) {
    const quality = Number.isFinite(building.quality)
        ? building.quality
        : RESOURCE_DEFAULT_QUALITY;
    const qualityText = "Q" + round2(quality);

    if (building.completed) {
        if (building.defId === BUILDING_IDS.CAMPFIRE) {
            return "Completed | " + qualityText
                + " | " + getRarityLabel(getBuildingRarityId(building))
                + " | Hearthfire: " + round2(getCampfireStackCount(building)) + " stacks";
        }
        return "Completed | " + qualityText;
    }

    return "WorkPoints: " + round2(building.workPoints)
        + " / " + def.workPoints + " | " + qualityText;
}

function refreshBuildingInstanceRows() {
    const container = document.getElementById("buildinginstances");
    const def = getSelectedBuildingDefinition();
    if (!container || !def) return;

    const tileBuildings = getCurrentTileBuildings();
    if (container.dataset.buildingCount !== String(tileBuildings.length)) {
        renderBuildDetails();
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = container.querySelector(
            '[data-building-uid="' + building.uid + '"]'
        );
        if (!row) {
            renderBuildDetails();
            return;
        }

        const status = row.querySelector(".buildinginstance-status");
        if (status) {
            status.innerText = getBuildingInstanceStatus(building, def);
        }
        row.classList.toggle("completed", building.completed);
    });
}

function renderBuildDetails() {
    const panel = document.getElementById("buildingdetails");
    if (!panel) return;

    panel.innerHTML = "";

    const def = getSelectedBuildingDefinition();
    if (!def) {
        panel.appendChild(createBuildPanelTitle("Building"));
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No building selected.";
        panel.appendChild(empty);
        return;
    }

    panel.appendChild(createBuildPanelTitle("Building"));

    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    const icon = document.createElement("div");
    icon.className = "buildingicon";
    icon.innerHTML = '<i class="fa ' + (def.iconClass || "fa-fire") + '"></i>';
    info.appendChild(icon);

    const heading = document.createElement("div");
    heading.className = "buildingtitle";
    heading.innerText = def.name;
    info.appendChild(heading);

    const summaryParts = ["WorkPoints: " + def.workPoints];
    if ((def.emptySpace || 0) > 0) {
        summaryParts.push("Empty space: " + def.emptySpace);
    }
    if ((def.roomSpace || 0) > 0) {
        summaryParts.push("Room space: " + def.roomSpace);
    }
    summaryParts.push("Skill: " + def.skill);

    const work = document.createElement("div");
    work.className = "craftnote";
    work.innerText = summaryParts.join(" | ");
    info.appendChild(work);

    if (def.effectText) {
        const effect = document.createElement("div");
        effect.className = "craftnote buildingeffect";
        effect.innerText = "Effect: " + def.effectText;
        info.appendChild(effect);
    }

    const description = document.createElement("div");
    description.className = "craftitemdescription";
    description.innerText = def.description;
    info.appendChild(description);

    panel.appendChild(info);

    panel.appendChild(createBuildPanelTitle("On this tile"));

    const instances = document.createElement("div");
    instances.className = "buildinginstances";
    instances.id = "buildinginstances";
    renderBuildingInstanceRows(instances, def);
    panel.appendChild(instances);

    const button = document.createElement("button");
    button.type = "button";
    button.id = "buildbutton";
    button.className = "craftbutton";
    button.innerText = "Build";
    button.disabled = !canBuildBuilding(def);
    button.addEventListener("click", function () {
        performBuild(def);
    });
    panel.appendChild(button);
}

function renderBuildPanels() {
    if (!ensureBuildPanel()) return;

    renderBuildList();
    renderBuildResources();
    renderBuildDetails();
    renderBuildingsPanels();
    renderHousesPanels();
    renderFurniturePanels();
    refreshBuildAvailability();
    renderImprovePanels();
}

function refreshBuildAvailability() {
    if (typeof BUILDING_DEFS === "undefined") return;

    if (typeof refreshBuildingsAvailability === "function") {
        refreshBuildingsAvailability();
    }
    if (typeof refreshHousesAvailability === "function") {
        refreshHousesAvailability();
    }
    if (typeof refreshFurnitureAvailability === "function") {
        refreshFurnitureAvailability();
    }

    const def = getSelectedBuildingDefinition();
    if (!def) return;

    const row = document.getElementById("buildingrecipe-" + def.id);
    if (row) row.classList.toggle("unavailable", !canBuildBuilding(def));

    const resourcesPanel = document.getElementById("buildingdescription");
    if (resourcesPanel) {
        def.resources.forEach(function (requirement) {
            const resourceRow = resourcesPanel.querySelector(
                '[data-build-resource="' + requirement.resourceId + '"]'
            );
            if (!resourceRow) return;

            const have = getBuildingResourceAmount(requirement.resourceId);
            const amount = resourceRow.querySelector(".craftresource-amount");
            if (amount) {
                amount.innerText = round2(have) + " / " + requirement.amount;
            }

            resourceRow.classList.toggle("enough", have >= requirement.amount);
            resourceRow.classList.toggle("missing", have < requirement.amount);
        });

        if ((def.emptySpace || 0) > 0) {
            const emptySpace = getCurrentTileEmptySpace();
            const spaceRow = resourcesPanel.querySelector(
                '[data-build-requirement="emptySpace"]'
            );
            if (spaceRow) {
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(emptySpace) + " / " + def.emptySpace;
                }
                spaceRow.classList.toggle("enough", emptySpace >= def.emptySpace);
                spaceRow.classList.toggle("missing", emptySpace < def.emptySpace);
            }
        }

        if ((def.roomSpace || 0) > 0) {
            const roomSpace = getCurrentTileRoomSpace();
            const roomRow = resourcesPanel.querySelector(
                '[data-build-requirement="roomSpace"]'
            );
            if (roomRow) {
                const amount = roomRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(roomSpace) + " / " + def.roomSpace;
                }
                roomRow.classList.toggle("enough", roomSpace >= def.roomSpace);
                roomRow.classList.toggle("missing", roomSpace < def.roomSpace);
            }
        }

        const skillRow = resourcesPanel.querySelector("[data-build-skill]");
        if (skillRow) {
            skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
                + def.skill.slice(1) + " Lv "
                + round2(getEffectiveLevel(def.skill));
        }

        const speedRow = resourcesPanel.querySelector("[data-build-speed]");
        if (speedRow) {
            speedRow.innerText = "Construction speed: "
                + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
        }
    }

    const button = document.getElementById("buildbutton");
    if (button) button.disabled = !canBuildBuilding(def);

    refreshBuildingInstanceRows();
    refreshBuildingActions();
}

// --- "Buildings" category interface ---------------------------------------
// Camping has its own panel above; this panel covers the separate Buildings
// subsection (Well and future structures).

function ensureBuildingsPanel() {
    const place = document.getElementById(BUILDINGS_CATEGORY.placeholderId);
    if (!place) return false;

    if (!document.getElementById("buildingsbuildinglist")) {
        place.innerHTML = "";

        const list = document.createElement("div");
        list.className = "craftlist";
        list.id = "buildingsbuildinglist";

        const description = document.createElement("div");
        description.className = "craftdescription";
        description.id = "buildingsbuildingdescription";

        const details = document.createElement("div");
        details.className = "craftdetails";
        details.id = "buildingsbuildingdetails";

        place.appendChild(list);
        place.appendChild(description);
        place.appendChild(details);
    }

    return true;
}

function renderBuildingsList() {
    const list = document.getElementById("buildingsbuildinglist");
    if (!list) return;

    list.innerHTML = "";

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = BUILDINGS_CATEGORY.name;
    group.appendChild(groupTitle);

    const defs = Object.keys(BUILDING_DEFS).map(getBuildingDefinition).filter(function (def) {
        return def && def.category === BUILDINGS_CATEGORY.id;
    });

    if (!defs.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing to build here yet.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    if (!defs.some(function (def) { return def.id === selectedBuildingsBuildingId; })) {
        selectedBuildingsBuildingId = defs[0].id;
    }

    const buildingList = document.createElement("ul");
    buildingList.className = "habitlist";

    defs.forEach(function (def) {
        const item = document.createElement("li");
        item.className = "habititem craftrecipe";
        item.id = "buildingsbuildingrecipe-" + def.id;
        item.dataset.buildingId = def.id;
        item.classList.toggle("selected", def.id === selectedBuildingsBuildingId);
        item.classList.toggle("unavailable", !canBuildBuilding(def));

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            def.name + "<br>WorkPoints: " + def.workPoints
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = def.name;

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        item.appendChild(switchElement);
        item.addEventListener("click", function () {
            selectedBuildingsBuildingId = def.id;
            renderBuildingsPanels();
        });

        buildingList.appendChild(item);
    });

    group.appendChild(buildingList);
    list.appendChild(group);
}

function renderBuildingsResources() {
    const panel = document.getElementById("buildingsbuildingdescription");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createBuildPanelTitle("Required resources"));

    const def = getSelectedBuildingsBuildingDefinition();
    if (!def) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Select a building from the list.";
        panel.appendChild(empty);
        return;
    }

    const container = document.createElement("div");
    container.className = "craftresources";

    def.resources.forEach(function (requirement) {
        const row = createBuildResourceRow(def, requirement);
        if (row) container.appendChild(row);
    });

    container.appendChild(createBuildValueRow(
        "WorkPoints",
        String(def.workPoints),
        "work"
    ));

    if ((def.emptySpace || 0) > 0) {
        const emptySpace = getCurrentTileEmptySpace();
        const spaceRow = createBuildValueRow(
            "Empty space",
            round2(emptySpace) + " / " + def.emptySpace,
            "emptySpace"
        );
        spaceRow.classList.add(emptySpace >= def.emptySpace ? "enough" : "missing");
        container.appendChild(spaceRow);
    }

    if ((Number(def.requiredDiggingPower) || 0) > 0) {
        const diggingPower = getCharacterDiggingPower();
        const powerRow = createBuildValueRow(
            "Digging power",
            round2(diggingPower) + " / " + def.requiredDiggingPower,
            "diggingPower"
        );
        powerRow.classList.add(
            diggingPower >= def.requiredDiggingPower ? "enough" : "missing"
        );
        container.appendChild(powerRow);
    }

    if (Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            const have = getCurrentTileSpaceElementAmount(requirement.element);
            const row = createBuildValueRow(
                "Space: " + requirement.element,
                round2(have) + " / " + requirement.amount,
                "space:" + requirement.element
            );
            row.classList.add(have >= requirement.amount ? "enough" : "missing");
            container.appendChild(row);
        });
    }

    panel.appendChild(container);

    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow";
    skillRow.dataset.buildSkill = "1";
    skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
        + def.skill.slice(1) + " Lv " + round2(getEffectiveLevel(def.skill));
    panel.appendChild(skillRow);

    const speedRow = document.createElement("div");
    speedRow.className = "craftskillrow";
    speedRow.dataset.buildSpeed = "1";
    speedRow.innerText = "Construction speed: "
        + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
    panel.appendChild(speedRow);
}

function renderBuildingsInstanceRows(container, def) {
    container.innerHTML = "";

    const tileBuildings = getCurrentTileBuildings().filter(function (building) {
        return building && building.defId === def.id;
    });
    container.dataset.buildingCount = String(tileBuildings.length);

    if (!tileBuildings.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No buildings on this tile.";
        container.appendChild(empty);
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = document.createElement("div");
        row.className = "buildinginstance";
        row.dataset.buildingUid = String(building.uid);
        row.classList.toggle("completed", building.completed);

        const name = document.createElement("div");
        name.className = "buildinginstance-name";
        name.innerText = def.name + " #" + building.uid;

        const status = document.createElement("div");
        status.className = "buildinginstance-status";
        status.innerText = getBuildingInstanceStatus(building, def);

        row.appendChild(name);
        row.appendChild(status);
        container.appendChild(row);
    });
}

function refreshBuildingsInstanceRows() {
    const container = document.getElementById("buildingsbuildinginstances");
    const def = getSelectedBuildingsBuildingDefinition();
    if (!container || !def) return;

    const tileBuildings = getCurrentTileBuildings().filter(function (building) {
        return building && building.defId === def.id;
    });
    if (container.dataset.buildingCount !== String(tileBuildings.length)) {
        renderBuildingsDetails();
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = container.querySelector(
            '[data-building-uid="' + building.uid + '"]'
        );
        if (!row) {
            renderBuildingsDetails();
            return;
        }

        const status = row.querySelector(".buildinginstance-status");
        if (status) status.innerText = getBuildingInstanceStatus(building, def);
        row.classList.toggle("completed", building.completed);
    });
}

function renderBuildingsDetails() {
    const panel = document.getElementById("buildingsbuildingdetails");
    if (!panel) return;

    panel.innerHTML = "";

    const def = getSelectedBuildingsBuildingDefinition();
    if (!def) {
        panel.appendChild(createBuildPanelTitle("Building"));
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No building selected.";
        panel.appendChild(empty);
        return;
    }

    panel.appendChild(createBuildPanelTitle("Building"));

    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    const icon = document.createElement("div");
    icon.className = "buildingicon";
    icon.innerHTML = '<i class="fa ' + (def.iconClass || "fa-tint") + '"></i>';
    info.appendChild(icon);

    const heading = document.createElement("div");
    heading.className = "buildingtitle";
    heading.innerText = def.name;
    info.appendChild(heading);

    const summaryParts = ["WorkPoints: " + def.workPoints];
    if ((def.emptySpace || 0) > 0) {
        summaryParts.push("Empty space: " + def.emptySpace);
    }
    if ((Number(def.requiredDiggingPower) || 0) > 0) {
        summaryParts.push("Digging power: " + def.requiredDiggingPower);
    }
    if (Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            summaryParts.push("Space: " + requirement.element + " " + requirement.amount);
        });
    }
    summaryParts.push("Skill: " + def.skill);

    const work = document.createElement("div");
    work.className = "craftnote";
    work.innerText = summaryParts.join(" | ");
    info.appendChild(work);

    if (def.effectText) {
        const effect = document.createElement("div");
        effect.className = "craftnote buildingeffect";
        effect.innerText = "Effect: " + def.effectText;
        info.appendChild(effect);
    }

    const description = document.createElement("div");
    description.className = "craftitemdescription";
    description.innerText = def.description;
    info.appendChild(description);

    panel.appendChild(info);

    panel.appendChild(createBuildPanelTitle("On this tile"));

    const instances = document.createElement("div");
    instances.className = "buildinginstances";
    instances.id = "buildingsbuildinginstances";
    renderBuildingsInstanceRows(instances, def);
    panel.appendChild(instances);

    const button = document.createElement("button");
    button.type = "button";
    button.id = "buildingsbuildbutton";
    button.className = "craftbutton";
    button.innerText = "Build";
    button.disabled = !canBuildBuilding(def);
    button.addEventListener("click", function () {
        performBuild(def);
    });
    panel.appendChild(button);
}

function renderBuildingsPanels() {
    if (!ensureBuildingsPanel()) return;

    renderBuildingsList();
    renderBuildingsResources();
    renderBuildingsDetails();
    refreshBuildingsAvailability();
}

function refreshBuildingsAvailability() {
    if (typeof BUILDING_DEFS === "undefined") return;

    const def = getSelectedBuildingsBuildingDefinition();
    if (!def) return;

    const row = document.getElementById("buildingsbuildingrecipe-" + def.id);
    if (row) row.classList.toggle("unavailable", !canBuildBuilding(def));

    const resourcesPanel = document.getElementById("buildingsbuildingdescription");
    if (resourcesPanel) {
        def.resources.forEach(function (requirement) {
            const resourceRow = resourcesPanel.querySelector(
                '[data-build-resource="' + requirement.resourceId + '"]'
            );
            if (!resourceRow) return;

            const have = getBuildingResourceAmount(requirement.resourceId);
            const amount = resourceRow.querySelector(".craftresource-amount");
            if (amount) {
                amount.innerText = round2(have) + " / " + requirement.amount;
            }

            resourceRow.classList.toggle("enough", have >= requirement.amount);
            resourceRow.classList.toggle("missing", have < requirement.amount);
        });

        if ((def.emptySpace || 0) > 0) {
            const emptySpace = getCurrentTileEmptySpace();
            const spaceRow = resourcesPanel.querySelector(
                '[data-build-requirement="emptySpace"]'
            );
            if (spaceRow) {
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(emptySpace) + " / " + def.emptySpace;
                }
                spaceRow.classList.toggle("enough", emptySpace >= def.emptySpace);
                spaceRow.classList.toggle("missing", emptySpace < def.emptySpace);
            }
        }

        if ((Number(def.requiredDiggingPower) || 0) > 0) {
            const diggingPower = getCharacterDiggingPower();
            const powerRow = resourcesPanel.querySelector(
                '[data-build-requirement="diggingPower"]'
            );
            if (powerRow) {
                const amount = powerRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(diggingPower)
                        + " / " + def.requiredDiggingPower;
                }
                powerRow.classList.toggle(
                    "enough",
                    diggingPower >= def.requiredDiggingPower
                );
                powerRow.classList.toggle(
                    "missing",
                    diggingPower < def.requiredDiggingPower
                );
            }
        }

        if (Array.isArray(def.spaceElementRequirements)) {
            def.spaceElementRequirements.forEach(function (requirement) {
                const have = getCurrentTileSpaceElementAmount(requirement.element);
                const spaceRow = resourcesPanel.querySelector(
                    '[data-build-requirement="space:' + requirement.element + '"]'
                );
                if (!spaceRow) return;
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(have) + " / " + requirement.amount;
                }
                spaceRow.classList.toggle("enough", have >= requirement.amount);
                spaceRow.classList.toggle("missing", have < requirement.amount);
            });
        }

        const skillRow = resourcesPanel.querySelector("[data-build-skill]");
        if (skillRow) {
            skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
                + def.skill.slice(1) + " Lv "
                + round2(getEffectiveLevel(def.skill));
        }

        const speedRow = resourcesPanel.querySelector("[data-build-speed]");
        if (speedRow) {
            speedRow.innerText = "Construction speed: "
                + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
        }
    }

    const button = document.getElementById("buildingsbuildbutton");
    if (button) button.disabled = !canBuildBuilding(def);

    refreshBuildingsInstanceRows();
}

// --- "Houses" category interface ---------------------------------------
// Camping has its own panel above; this panel covers the separate Houses
// subsection (Dugout house and future structures).

function ensureHousesPanel() {
    const place = document.getElementById(HOUSES_CATEGORY.placeholderId);
    if (!place) return false;

    if (!document.getElementById("housesbuildinglist")) {
        place.innerHTML = "";

        const list = document.createElement("div");
        list.className = "craftlist";
        list.id = "housesbuildinglist";

        const description = document.createElement("div");
        description.className = "craftdescription";
        description.id = "housesbuildingdescription";

        const details = document.createElement("div");
        details.className = "craftdetails";
        details.id = "housesbuildingdetails";

        place.appendChild(list);
        place.appendChild(description);
        place.appendChild(details);
    }

    return true;
}

function renderHousesList() {
    const list = document.getElementById("housesbuildinglist");
    if (!list) return;

    list.innerHTML = "";

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = HOUSES_CATEGORY.name;
    group.appendChild(groupTitle);

    const defs = Object.keys(BUILDING_DEFS).map(getBuildingDefinition).filter(function (def) {
        return def && def.category === HOUSES_CATEGORY.id;
    });

    if (!defs.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing to build here yet.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    if (!defs.some(function (def) { return def.id === selectedHousesBuildingId; })) {
        selectedHousesBuildingId = defs[0].id;
    }

    const buildingList = document.createElement("ul");
    buildingList.className = "habitlist";

    defs.forEach(function (def) {
        const item = document.createElement("li");
        item.className = "habititem craftrecipe";
        item.id = "housesbuildingrecipe-" + def.id;
        item.dataset.buildingId = def.id;
        item.classList.toggle("selected", def.id === selectedHousesBuildingId);
        item.classList.toggle("unavailable", !canBuildBuilding(def));

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            def.name + "<br>WorkPoints: " + def.workPoints
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = def.name;

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        item.appendChild(switchElement);
        item.addEventListener("click", function () {
            selectedHousesBuildingId = def.id;
            renderHousesPanels();
        });

        buildingList.appendChild(item);
    });

    group.appendChild(buildingList);
    list.appendChild(group);
}

function renderHousesResources() {
    const panel = document.getElementById("housesbuildingdescription");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createBuildPanelTitle("Required resources"));

    const def = getSelectedHousesBuildingDefinition();
    if (!def) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Select a building from the list.";
        panel.appendChild(empty);
        return;
    }

    const container = document.createElement("div");
    container.className = "craftresources";

    def.resources.forEach(function (requirement) {
        const row = createBuildResourceRow(def, requirement);
        if (row) container.appendChild(row);
    });

    container.appendChild(createBuildValueRow(
        "WorkPoints",
        String(def.workPoints),
        "work"
    ));

    if ((def.emptySpace || 0) > 0) {
        const emptySpace = getCurrentTileEmptySpace();
        const spaceRow = createBuildValueRow(
            "Empty space",
            round2(emptySpace) + " / " + def.emptySpace,
            "emptySpace"
        );
        spaceRow.classList.add(emptySpace >= def.emptySpace ? "enough" : "missing");
        container.appendChild(spaceRow);
    }

    if ((Number(def.requiredDiggingPower) || 0) > 0) {
        const diggingPower = getCharacterDiggingPower();
        const powerRow = createBuildValueRow(
            "Digging power",
            round2(diggingPower) + " / " + def.requiredDiggingPower,
            "diggingPower"
        );
        powerRow.classList.add(
            diggingPower >= def.requiredDiggingPower ? "enough" : "missing"
        );
        container.appendChild(powerRow);
    }

    if (Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            const have = getCurrentTileSpaceElementAmount(requirement.element);
            const row = createBuildValueRow(
                "Space: " + requirement.element,
                round2(have) + " / " + requirement.amount,
                "space:" + requirement.element
            );
            row.classList.add(have >= requirement.amount ? "enough" : "missing");
            container.appendChild(row);
        });
    }

    panel.appendChild(container);

    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow";
    skillRow.dataset.buildSkill = "1";
    skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
        + def.skill.slice(1) + " Lv " + round2(getEffectiveLevel(def.skill));
    panel.appendChild(skillRow);

    const speedRow = document.createElement("div");
    speedRow.className = "craftskillrow";
    speedRow.dataset.buildSpeed = "1";
    speedRow.innerText = "Construction speed: "
        + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
    panel.appendChild(speedRow);
}

function renderHousesInstanceRows(container, def) {
    container.innerHTML = "";

    const tileBuildings = getCurrentTileBuildings().filter(function (building) {
        return building && building.defId === def.id;
    });
    container.dataset.buildingCount = String(tileBuildings.length);

    if (!tileBuildings.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No buildings on this tile.";
        container.appendChild(empty);
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = document.createElement("div");
        row.className = "buildinginstance";
        row.dataset.buildingUid = String(building.uid);
        row.classList.toggle("completed", building.completed);

        const name = document.createElement("div");
        name.className = "buildinginstance-name";
        name.innerText = def.name + " #" + building.uid;

        const status = document.createElement("div");
        status.className = "buildinginstance-status";
        status.innerText = getBuildingInstanceStatus(building, def);

        row.appendChild(name);
        row.appendChild(status);
        container.appendChild(row);
    });
}

function refreshHousesInstanceRows() {
    const container = document.getElementById("housesbuildinginstances");
    const def = getSelectedHousesBuildingDefinition();
    if (!container || !def) return;

    const tileBuildings = getCurrentTileBuildings().filter(function (building) {
        return building && building.defId === def.id;
    });
    if (container.dataset.buildingCount !== String(tileBuildings.length)) {
        renderHousesDetails();
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = container.querySelector(
            '[data-building-uid="' + building.uid + '"]'
        );
        if (!row) {
            renderHousesDetails();
            return;
        }

        const status = row.querySelector(".buildinginstance-status");
        if (status) status.innerText = getBuildingInstanceStatus(building, def);
        row.classList.toggle("completed", building.completed);
    });
}

function renderHousesDetails() {
    const panel = document.getElementById("housesbuildingdetails");
    if (!panel) return;

    panel.innerHTML = "";

    const def = getSelectedHousesBuildingDefinition();
    if (!def) {
        panel.appendChild(createBuildPanelTitle("Building"));
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No building selected.";
        panel.appendChild(empty);
        return;
    }

    panel.appendChild(createBuildPanelTitle("Building"));

    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    const icon = document.createElement("div");
    icon.className = "buildingicon";
    icon.innerHTML = '<i class="fa ' + (def.iconClass || "fa-house") + '"></i>';
    info.appendChild(icon);

    const heading = document.createElement("div");
    heading.className = "buildingtitle";
    heading.innerText = def.name;
    info.appendChild(heading);

    const summaryParts = ["WorkPoints: " + def.workPoints];
    if ((def.emptySpace || 0) > 0) {
        summaryParts.push("Empty space: " + def.emptySpace);
    }
    if ((Number(def.requiredDiggingPower) || 0) > 0) {
        summaryParts.push("Digging power: " + def.requiredDiggingPower);
    }
    if (Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            summaryParts.push("Space: " + requirement.element + " " + requirement.amount);
        });
    }
    summaryParts.push("Skill: " + def.skill);

    const work = document.createElement("div");
    work.className = "craftnote";
    work.innerText = summaryParts.join(" | ");
    info.appendChild(work);

    if (def.effectText) {
        const effect = document.createElement("div");
        effect.className = "craftnote buildingeffect";
        effect.innerText = "Effect: " + def.effectText;
        info.appendChild(effect);
    }

    const description = document.createElement("div");
    description.className = "craftitemdescription";
    description.innerText = def.description;
    info.appendChild(description);

    panel.appendChild(info);

    panel.appendChild(createBuildPanelTitle("On this tile"));

    const instances = document.createElement("div");
    instances.className = "buildinginstances";
    instances.id = "housesbuildinginstances";
    renderHousesInstanceRows(instances, def);
    panel.appendChild(instances);

    const button = document.createElement("button");
    button.type = "button";
    button.id = "housesbuildbutton";
    button.className = "craftbutton";
    button.innerText = "Build";
    button.disabled = !canBuildBuilding(def);
    button.addEventListener("click", function () {
        performBuild(def);
    });
    panel.appendChild(button);
}

function renderHousesPanels() {
    if (!ensureHousesPanel()) return;

    renderHousesList();
    renderHousesResources();
    renderHousesDetails();
    refreshHousesAvailability();
}

function refreshHousesAvailability() {
    if (typeof BUILDING_DEFS === "undefined") return;

    const def = getSelectedHousesBuildingDefinition();
    if (!def) return;

    const row = document.getElementById("housesbuildingrecipe-" + def.id);
    if (row) row.classList.toggle("unavailable", !canBuildBuilding(def));

    const resourcesPanel = document.getElementById("housesbuildingdescription");
    if (resourcesPanel) {
        def.resources.forEach(function (requirement) {
            const resourceRow = resourcesPanel.querySelector(
                '[data-build-resource="' + requirement.resourceId + '"]'
            );
            if (!resourceRow) return;

            const have = getBuildingResourceAmount(requirement.resourceId);
            const amount = resourceRow.querySelector(".craftresource-amount");
            if (amount) {
                amount.innerText = round2(have) + " / " + requirement.amount;
            }

            resourceRow.classList.toggle("enough", have >= requirement.amount);
            resourceRow.classList.toggle("missing", have < requirement.amount);
        });

        if ((def.emptySpace || 0) > 0) {
            const emptySpace = getCurrentTileEmptySpace();
            const spaceRow = resourcesPanel.querySelector(
                '[data-build-requirement="emptySpace"]'
            );
            if (spaceRow) {
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(emptySpace) + " / " + def.emptySpace;
                }
                spaceRow.classList.toggle("enough", emptySpace >= def.emptySpace);
                spaceRow.classList.toggle("missing", emptySpace < def.emptySpace);
            }
        }

        if ((Number(def.requiredDiggingPower) || 0) > 0) {
            const diggingPower = getCharacterDiggingPower();
            const powerRow = resourcesPanel.querySelector(
                '[data-build-requirement="diggingPower"]'
            );
            if (powerRow) {
                const amount = powerRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(diggingPower)
                        + " / " + def.requiredDiggingPower;
                }
                powerRow.classList.toggle(
                    "enough",
                    diggingPower >= def.requiredDiggingPower
                );
                powerRow.classList.toggle(
                    "missing",
                    diggingPower < def.requiredDiggingPower
                );
            }
        }

        if (Array.isArray(def.spaceElementRequirements)) {
            def.spaceElementRequirements.forEach(function (requirement) {
                const have = getCurrentTileSpaceElementAmount(requirement.element);
                const spaceRow = resourcesPanel.querySelector(
                    '[data-build-requirement="space:' + requirement.element + '"]'
                );
                if (!spaceRow) return;
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(have) + " / " + requirement.amount;
                }
                spaceRow.classList.toggle("enough", have >= requirement.amount);
                spaceRow.classList.toggle("missing", have < requirement.amount);
            });
        }

        const skillRow = resourcesPanel.querySelector("[data-build-skill]");
        if (skillRow) {
            skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
                + def.skill.slice(1) + " Lv "
                + round2(getEffectiveLevel(def.skill));
        }

        const speedRow = resourcesPanel.querySelector("[data-build-speed]");
        if (speedRow) {
            speedRow.innerText = "Construction speed: "
                + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
        }
    }

    const button = document.getElementById("housesbuildbutton");
    if (button) button.disabled = !canBuildBuilding(def);

    refreshHousesInstanceRows();
}

// --- "Furniture" category interface ---------------------------------------
// Camping has its own panel above; this panel covers the separate Furniture
// subsection (WorkBench and future furniture).

function ensureFurniturePanel() {
    const place = document.getElementById(FURNITURE_CATEGORY.placeholderId);
    if (!place) return false;

    if (!document.getElementById("furniturebuildinglist")) {
        place.innerHTML = "";

        const list = document.createElement("div");
        list.className = "craftlist";
        list.id = "furniturebuildinglist";

        const description = document.createElement("div");
        description.className = "craftdescription";
        description.id = "furniturebuildingdescription";

        const details = document.createElement("div");
        details.className = "craftdetails";
        details.id = "furniturebuildingdetails";

        place.appendChild(list);
        place.appendChild(description);
        place.appendChild(details);
    }

    return true;
}

function renderFurnitureList() {
    const list = document.getElementById("furniturebuildinglist");
    if (!list) return;

    list.innerHTML = "";

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = FURNITURE_CATEGORY.name;
    group.appendChild(groupTitle);

    const defs = Object.keys(BUILDING_DEFS).map(getBuildingDefinition).filter(function (def) {
        return def && def.category === FURNITURE_CATEGORY.id;
    });

    if (!defs.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing to build here yet.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    if (!defs.some(function (def) { return def.id === selectedFurnitureBuildingId; })) {
        selectedFurnitureBuildingId = defs[0].id;
    }

    const buildingList = document.createElement("ul");
    buildingList.className = "habitlist";

    defs.forEach(function (def) {
        const item = document.createElement("li");
        item.className = "habititem craftrecipe";
        item.id = "furniturebuildingrecipe-" + def.id;
        item.dataset.buildingId = def.id;
        item.classList.toggle("selected", def.id === selectedFurnitureBuildingId);
        item.classList.toggle("unavailable", !canBuildBuilding(def));

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            def.name + "<br>WorkPoints: " + def.workPoints
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = def.name;

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        item.appendChild(switchElement);
        item.addEventListener("click", function () {
            selectedFurnitureBuildingId = def.id;
            renderFurniturePanels();
        });

        buildingList.appendChild(item);
    });

    group.appendChild(buildingList);
    list.appendChild(group);
}

function renderFurnitureResources() {
    const panel = document.getElementById("furniturebuildingdescription");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createBuildPanelTitle("Required resources"));

    const def = getSelectedFurnitureBuildingDefinition();
    if (!def) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Select a building from the list.";
        panel.appendChild(empty);
        return;
    }

    const container = document.createElement("div");
    container.className = "craftresources";

    def.resources.forEach(function (requirement) {
        const row = createBuildResourceRow(def, requirement);
        if (row) container.appendChild(row);
    });

    container.appendChild(createBuildValueRow(
        "WorkPoints",
        String(def.workPoints),
        "work"
    ));

    if ((def.emptySpace || 0) > 0) {
        const emptySpace = getCurrentTileEmptySpace();
        const spaceRow = createBuildValueRow(
            "Empty space",
            round2(emptySpace) + " / " + def.emptySpace,
            "emptySpace"
        );
        spaceRow.classList.add(emptySpace >= def.emptySpace ? "enough" : "missing");
        container.appendChild(spaceRow);
    }

    if ((def.roomSpace || 0) > 0) {
        const roomSpace = getCurrentTileRoomSpace();
        const roomRow = createBuildValueRow(
            "Room space",
            round2(roomSpace) + " / " + def.roomSpace,
            "roomSpace"
        );
        roomRow.classList.add(roomSpace >= def.roomSpace ? "enough" : "missing");
        container.appendChild(roomRow);
    }
    if ((Number(def.requiredDiggingPower) || 0) > 0) {
        const diggingPower = getCharacterDiggingPower();
        const powerRow = createBuildValueRow(
            "Digging power",
            round2(diggingPower) + " / " + def.requiredDiggingPower,
            "diggingPower"
        );
        powerRow.classList.add(
            diggingPower >= def.requiredDiggingPower ? "enough" : "missing"
        );
        container.appendChild(powerRow);
    }
    if ((Number(def.requiredChoppingPower) || 0) > 0) {
        const choppingPower = getCharacterChoppingPower();
        const powerRow = createBuildValueRow(
            "Chopping power",
            round2(choppingPower) + " / " + def.requiredChoppingPower,
            "choppingPower"
        );
        powerRow.classList.add(
            choppingPower >= def.requiredChoppingPower ? "enough" : "missing"
        );
        container.appendChild(powerRow);
    }

    if (Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            const have = getCurrentTileSpaceElementAmount(requirement.element);
            const row = createBuildValueRow(
                "Space: " + requirement.element,
                round2(have) + " / " + requirement.amount,
                "space:" + requirement.element
            );
            row.classList.add(have >= requirement.amount ? "enough" : "missing");
            container.appendChild(row);
        });
    }

    panel.appendChild(container);

    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow";
    skillRow.dataset.buildSkill = "1";
    skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
        + def.skill.slice(1) + " Lv " + round2(getEffectiveLevel(def.skill));
    panel.appendChild(skillRow);

    const speedRow = document.createElement("div");
    speedRow.className = "craftskillrow";
    speedRow.dataset.buildSpeed = "1";
    speedRow.innerText = "Construction speed: "
        + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
    panel.appendChild(speedRow);
}

function renderFurnitureInstanceRows(container, def) {
    container.innerHTML = "";

    const tileBuildings = getCurrentTileBuildings().filter(function (building) {
        return building && building.defId === def.id;
    });
    container.dataset.buildingCount = String(tileBuildings.length);

    if (!tileBuildings.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No buildings on this tile.";
        container.appendChild(empty);
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = document.createElement("div");
        row.className = "buildinginstance";
        row.dataset.buildingUid = String(building.uid);
        row.classList.toggle("completed", building.completed);

        const name = document.createElement("div");
        name.className = "buildinginstance-name";
        name.innerText = def.name + " #" + building.uid;

        const status = document.createElement("div");
        status.className = "buildinginstance-status";
        status.innerText = getBuildingInstanceStatus(building, def);

        row.appendChild(name);
        row.appendChild(status);
        container.appendChild(row);
    });
}

function refreshFurnitureInstanceRows() {
    const container = document.getElementById("furniturebuildinginstances");
    const def = getSelectedFurnitureBuildingDefinition();
    if (!container || !def) return;

    const tileBuildings = getCurrentTileBuildings().filter(function (building) {
        return building && building.defId === def.id;
    });
    if (container.dataset.buildingCount !== String(tileBuildings.length)) {
        renderFurnitureDetails();
        return;
    }

    tileBuildings.forEach(function (building) {
        const row = container.querySelector(
            '[data-building-uid="' + building.uid + '"]'
        );
        if (!row) {
            renderFurnitureDetails();
            return;
        }

        const status = row.querySelector(".buildinginstance-status");
        if (status) status.innerText = getBuildingInstanceStatus(building, def);
        row.classList.toggle("completed", building.completed);
    });
}

function renderFurnitureDetails() {
    const panel = document.getElementById("furniturebuildingdetails");
    if (!panel) return;

    panel.innerHTML = "";

    const def = getSelectedFurnitureBuildingDefinition();
    if (!def) {
        panel.appendChild(createBuildPanelTitle("Building"));
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No building selected.";
        panel.appendChild(empty);
        return;
    }

    panel.appendChild(createBuildPanelTitle("Building"));

    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    const icon = document.createElement("div");
    icon.className = "buildingicon";
    icon.innerHTML = '<i class="fa ' + (def.iconClass || "fa-house") + '"></i>';
    info.appendChild(icon);

    const heading = document.createElement("div");
    heading.className = "buildingtitle";
    heading.innerText = def.name;
    info.appendChild(heading);

    const summaryParts = ["WorkPoints: " + def.workPoints];
    if ((def.emptySpace || 0) > 0) {
        summaryParts.push("Empty space: " + def.emptySpace);
    }
    if ((def.roomSpace || 0) > 0) {
        summaryParts.push("Room space: " + def.roomSpace);
    }
    if ((Number(def.requiredDiggingPower) || 0) > 0) {
        summaryParts.push("Digging power: " + def.requiredDiggingPower);
    }
    if ((Number(def.requiredChoppingPower) || 0) > 0) {
        summaryParts.push("Chopping power: " + def.requiredChoppingPower);
    }
    if (Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            summaryParts.push("Space: " + requirement.element + " " + requirement.amount);
        });
    }
    summaryParts.push("Skill: " + def.skill);

    const work = document.createElement("div");
    work.className = "craftnote";
    work.innerText = summaryParts.join(" | ");
    info.appendChild(work);

    if (def.effectText) {
        const effect = document.createElement("div");
        effect.className = "craftnote buildingeffect";
        effect.innerText = "Effect: " + def.effectText;
        info.appendChild(effect);
    }

    const description = document.createElement("div");
    description.className = "craftitemdescription";
    description.innerText = def.description;
    info.appendChild(description);

    panel.appendChild(info);

    panel.appendChild(createBuildPanelTitle("On this tile"));

    const instances = document.createElement("div");
    instances.className = "buildinginstances";
    instances.id = "furniturebuildinginstances";
    renderFurnitureInstanceRows(instances, def);
    panel.appendChild(instances);

    const button = document.createElement("button");
    button.type = "button";
    button.id = "furniturebuildbutton";
    button.className = "craftbutton";
    button.innerText = "Build";
    button.disabled = !canBuildBuilding(def);
    button.addEventListener("click", function () {
        performBuild(def);
    });
    panel.appendChild(button);
}

function renderFurniturePanels() {
    if (!ensureFurniturePanel()) return;

    renderFurnitureList();
    renderFurnitureResources();
    renderFurnitureDetails();
    refreshFurnitureAvailability();
}

function refreshFurnitureAvailability() {
    if (typeof BUILDING_DEFS === "undefined") return;

    const def = getSelectedFurnitureBuildingDefinition();
    if (!def) return;

    const row = document.getElementById("furniturebuildingrecipe-" + def.id);
    if (row) row.classList.toggle("unavailable", !canBuildBuilding(def));

    const resourcesPanel = document.getElementById("furniturebuildingdescription");
    if (resourcesPanel) {
        def.resources.forEach(function (requirement) {
            const resourceRow = resourcesPanel.querySelector(
                '[data-build-resource="' + requirement.resourceId + '"]'
            );
            if (!resourceRow) return;

            const have = getBuildingResourceAmount(requirement.resourceId);
            const amount = resourceRow.querySelector(".craftresource-amount");
            if (amount) {
                amount.innerText = round2(have) + " / " + requirement.amount;
            }

            resourceRow.classList.toggle("enough", have >= requirement.amount);
            resourceRow.classList.toggle("missing", have < requirement.amount);
        });

        if ((def.emptySpace || 0) > 0) {
            const emptySpace = getCurrentTileEmptySpace();
            const spaceRow = resourcesPanel.querySelector(
                '[data-build-requirement="emptySpace"]'
            );
            if (spaceRow) {
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(emptySpace) + " / " + def.emptySpace;
                }
                spaceRow.classList.toggle("enough", emptySpace >= def.emptySpace);
                spaceRow.classList.toggle("missing", emptySpace < def.emptySpace);
            }
        }

        if ((def.roomSpace || 0) > 0) {
            const roomSpace = getCurrentTileRoomSpace();
            const roomRow = resourcesPanel.querySelector(
                '[data-build-requirement="roomSpace"]'
            );
            if (roomRow) {
                const amount = roomRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(roomSpace) + " / " + def.roomSpace;
                }
                roomRow.classList.toggle("enough", roomSpace >= def.roomSpace);
                roomRow.classList.toggle("missing", roomSpace < def.roomSpace);
            }
        }
        if ((Number(def.requiredDiggingPower) || 0) > 0) {
            const diggingPower = getCharacterDiggingPower();
            const powerRow = resourcesPanel.querySelector(
                '[data-build-requirement="diggingPower"]'
            );
            if (powerRow) {
                const amount = powerRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(diggingPower)
                        + " / " + def.requiredDiggingPower;
                }
                powerRow.classList.toggle(
                    "enough",
                    diggingPower >= def.requiredDiggingPower
                );
                powerRow.classList.toggle(
                    "missing",
                    diggingPower < def.requiredDiggingPower
                );
            }
        }
        if ((Number(def.requiredChoppingPower) || 0) > 0) {
            const choppingPower = getCharacterChoppingPower();
            const powerRow = resourcesPanel.querySelector(
                '[data-build-requirement="choppingPower"]'
            );
            if (powerRow) {
                const amount = powerRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(choppingPower)
                        + " / " + def.requiredChoppingPower;
                }
                powerRow.classList.toggle(
                    "enough",
                    choppingPower >= def.requiredChoppingPower
                );
                powerRow.classList.toggle(
                    "missing",
                    choppingPower < def.requiredChoppingPower
                );
            }
        }

        if (Array.isArray(def.spaceElementRequirements)) {
            def.spaceElementRequirements.forEach(function (requirement) {
                const have = getCurrentTileSpaceElementAmount(requirement.element);
                const spaceRow = resourcesPanel.querySelector(
                    '[data-build-requirement="space:' + requirement.element + '"]'
                );
                if (!spaceRow) return;
                const amount = spaceRow.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(have) + " / " + requirement.amount;
                }
                spaceRow.classList.toggle("enough", have >= requirement.amount);
                spaceRow.classList.toggle("missing", have < requirement.amount);
            });
        }

        const skillRow = resourcesPanel.querySelector("[data-build-skill]");
        if (skillRow) {
            skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
                + def.skill.slice(1) + " Lv "
                + round2(getEffectiveLevel(def.skill));
        }

        const speedRow = resourcesPanel.querySelector("[data-build-speed]");
        if (speedRow) {
            speedRow.innerText = "Construction speed: "
                + round2(getBuildingWorkPerSecond(def)) + " WorkPoints / second";
        }
    }

    const button = document.getElementById("furniturebuildbutton");
    if (button) button.disabled = !canBuildBuilding(def);

    refreshFurnitureInstanceRows();
}

// --- improve interface ------------------------------------------------------

function getSelectedImprovementBuilding() {
    if (selectedImprovementUid === null) return null;

    return getImprovementCandidates().find(function (building) {
        return building.uid === selectedImprovementUid;
    }) || null;
}

function ensureImprovePanel() {
    const place = document.getElementById(BUILDING_IMPROVE_CATEGORY.placeholderId);
    if (!place) return false;

    if (!document.getElementById("improvelist")) {
        place.innerHTML = "";

        const list = document.createElement("div");
        list.className = "craftlist";
        list.id = "improvelist";

        const description = document.createElement("div");
        description.className = "craftdescription";
        description.id = "improvedescription";

        const details = document.createElement("div");
        details.className = "craftdetails";
        details.id = "improvedetails";

        place.appendChild(list);
        place.appendChild(description);
        place.appendChild(details);
    }

    return true;
}

function renderImproveList() {
    const list = document.getElementById("improvelist");
    if (!list) return;

    list.innerHTML = "";

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = BUILDING_IMPROVE_CATEGORY.name;
    group.appendChild(groupTitle);

    const candidates = getImprovementCandidates();
    list.dataset.candidateCount = String(candidates.length);
    list.dataset.candidateSignature = candidates.map(function (building) {
        return building.uid;
    }).join(",");

    if (!candidates.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No completed buildings can be improved right now.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    const buildingList = document.createElement("ul");
    buildingList.className = "habitlist";

    candidates.forEach(function (building) {
        const def = getBuildingDefinition(building.defId);
        if (!def) return;

        const item = document.createElement("li");
        item.className = "habititem craftrecipe";
        item.id = "buildingimprove-" + building.uid;
        item.dataset.buildingUid = String(building.uid);
        item.classList.toggle("selected", building.uid === selectedImprovementUid);
        item.classList.toggle("unavailable", !canImproveBuilding(building));

        const currentQuality = getBuildingQualityValue(building);
        const targetQuality = getImprovementResourceQuality(building);
        const improvedQuality = getImprovedBuildingQuality(building);

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            def.name + " #" + building.uid
                + "<br>Current quality: Q" + round2(currentQuality)
                + "<br>Target quality: Q" + round2(targetQuality)
                + "<br>After improvement: Q" + round2(improvedQuality)
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = def.name + " #" + building.uid
            + " (Q" + round2(currentQuality) + ")";

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        item.appendChild(switchElement);
        item.addEventListener("click", function () {
            selectedImprovementUid = building.uid;
            renderImprovePanels();
        });

        buildingList.appendChild(item);
    });

    group.appendChild(buildingList);
    list.appendChild(group);
}

function renderImproveResources() {
    const panel = document.getElementById("improvedescription");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createBuildPanelTitle("Improvement cost"));

    const building = getSelectedImprovementBuilding();
    if (!building) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Select a completed building from the list.";
        panel.appendChild(empty);
        return;
    }

    const def = getBuildingDefinition(building.defId);
    const cost = getBuildingImproveCost(def);
    if (!def || !cost) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "This building cannot be improved.";
        panel.appendChild(empty);
        return;
    }

    const container = document.createElement("div");
    container.className = "craftresources";

    cost.resources.forEach(function (requirement) {
        const row = createBuildResourceRow(def, requirement);
        if (row) container.appendChild(row);
    });

    container.appendChild(createBuildValueRow(
        "WorkPoints",
        String(cost.workPoints),
        "improveWork"
    ));

    container.appendChild(createBuildValueRow(
        "Current quality",
        "Q" + round2(getBuildingQualityValue(building)),
        "currentQuality"
    ));

    container.appendChild(createBuildValueRow(
        "Target quality",
        "Q" + round2(getImprovementResourceQuality(building)),
        "resourceQuality"
    ));

    container.appendChild(createBuildValueRow(
        "After improvement",
        "Q" + round2(getImprovedBuildingQuality(building)),
        "resultQuality"
    ));

    panel.appendChild(container);

    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow";
    skillRow.dataset.improveSkill = "1";
    skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
        + def.skill.slice(1) + " Lv " + round2(getEffectiveLevel(def.skill))
        + " | Quality step: "
        + round2(getImprovementSkillFactor(building) * 100) + "%";
    panel.appendChild(skillRow);

    const note = document.createElement("div");
    note.className = "craftskillrow";
    note.innerText = "Quality rises by 10% of the difference to the target quality.";
    panel.appendChild(note);
}

function renderImproveDetails() {
    const panel = document.getElementById("improvedetails");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createBuildPanelTitle("Improve"));

    const building = getSelectedImprovementBuilding();
    if (!building) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing selected for improvement.";
        panel.appendChild(empty);
        return;
    }

    const def = getBuildingDefinition(building.defId);
    const cost = getBuildingImproveCost(def);
    if (!def || !cost) return;

    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    const icon = document.createElement("div");
    icon.className = "buildingicon";
    icon.innerHTML = '<i class="fa ' + (def.iconClass || "fa-fire") + '"></i>';
    info.appendChild(icon);

    const heading = document.createElement("div");
    heading.className = "buildingtitle";
    heading.innerText = def.name + " #" + building.uid;
    info.appendChild(heading);

    const work = document.createElement("div");
    work.className = "craftnote";
    work.innerText = "Current quality: Q" + round2(getBuildingQualityValue(building))
        + " | Resource quality: Q" + round2(getImprovementResourceQuality(building))
        + " | After improvement: Q" + round2(getImprovedBuildingQuality(building));
    info.appendChild(work);

    const workCost = document.createElement("div");
    workCost.className = "craftnote";
    workCost.innerText = "Improvement work: " + cost.workPoints + " WorkPoints"
        + " | Skill: " + def.skill;
    info.appendChild(workCost);

    if (def.effectText) {
        const effect = document.createElement("div");
        effect.className = "craftnote buildingeffect";
        effect.innerText = "Effect: " + def.effectText;
        info.appendChild(effect);
    }

    const description = document.createElement("div");
    description.className = "craftitemdescription";
    description.innerText = def.description;
    info.appendChild(description);

    panel.appendChild(info);

    const button = document.createElement("button");
    button.type = "button";
    button.id = "improvebutton";
    button.className = "craftbutton";
    button.innerText = "Improve";
    button.disabled = !canImproveBuilding(building);
    button.addEventListener("click", function () {
        performImprovement(building);
    });
    panel.appendChild(button);
}

function renderImprovePanels() {
    if (!ensureImprovePanel()) return;

    let candidates = getImprovementCandidates();
    if (!candidates.length) {
        selectedImprovementUid = null;
    } else if (!candidates.some(function (building) {
        return building.uid === selectedImprovementUid;
    })) {
        selectedImprovementUid = candidates[0].uid;
    }

    renderImproveList();
    renderImproveResources();
    renderImproveDetails();
    refreshImproveAvailability();
}

function refreshImproveAvailability() {
    const panel = document.getElementById("improvedescription");
    const list = document.getElementById("improvelist");
    if (!panel || !list) return;

    const candidates = getImprovementCandidates();
    const signature = candidates.map(function (building) {
        return building.uid;
    }).join(",");
    if (list.dataset.candidateSignature !== signature) {
        renderImprovePanels();
        return;
    }

    const building = getSelectedImprovementBuilding();
    if (!building) {
        const button = document.getElementById("improvebutton");
        if (button) button.disabled = true;
        return;
    }

    const def = getBuildingDefinition(building.defId);
    const cost = getBuildingImproveCost(def);
    if (!def || !cost) return;

    cost.resources.forEach(function (requirement) {
        const row = panel.querySelector(
            '[data-build-resource="' + requirement.resourceId + '"]'
        );
        if (!row) return;

        const have = getBuildingResourceAmount(requirement.resourceId);
        const amount = row.querySelector(".craftresource-amount");
        if (amount) {
            amount.innerText = round2(have) + " / " + requirement.amount;
        }
        row.classList.toggle("enough", have >= requirement.amount);
        row.classList.toggle("missing", have < requirement.amount);
    });

    const updateValueRow = function (key, text) {
        const row = panel.querySelector('[data-build-requirement="' + key + '"]');
        if (!row) return;
        const amount = row.querySelector(".craftresource-amount");
        if (amount) amount.innerText = text;
    };

    updateValueRow(
        "currentQuality",
        "Q" + round2(getBuildingQualityValue(building))
    );
    updateValueRow(
        "resourceQuality",
        "Q" + round2(getImprovementResourceQuality(building))
    );
    updateValueRow(
        "resultQuality",
        "Q" + round2(getImprovedBuildingQuality(building))
    );

    const skillRow = panel.querySelector("[data-improve-skill]");
    if (skillRow) {
        skillRow.innerText = "Skill: " + def.skill.charAt(0).toUpperCase()
            + def.skill.slice(1) + " Lv " + round2(getEffectiveLevel(def.skill))
            + " | Quality step: "
            + round2(getImprovementSkillFactor(building) * 100) + "%";
    }

    const button = document.getElementById("improvebutton");
    if (button) button.disabled = !canImproveBuilding(building);
}

function performImprovement(building) {
    if (!building) return false;

    if (!canImproveBuilding(building)) {
        logMessage("Not enough resources or quality to improve this building.");
        return false;
    }

    const def = getBuildingDefinition(building.defId);
    const cost = getBuildingImproveCost(def);
    if (!def || !cost) return false;

    const oldQuality = getBuildingQualityValue(building);
    const targetQuality = getImprovementResourceQuality(building);
    const newQuality = getImprovedBuildingQuality(building);

    cost.resources.forEach(function (requirement) {
        const stack = resources[requirement.resourceId];
        if (!stack) return;
        stack.amount = round2(Math.max(0, stack.amount - requirement.amount));
    });

    building.quality = newQuality;

    if (typeof renderResources === "function") renderResources();
    renderBuildPanels();
    refreshMapCoordinates(true);

    logMessage("Improved " + def.name + " #" + building.uid
        + ": Q" + round2(oldQuality) + " -> Q" + round2(newQuality)
        + " (resource quality Q" + round2(targetQuality) + ").");
    return true;
}

function setActiveBuildCategory(categoryId) {
    const activeId = categoryId || BUILDING_CATEGORY.id;

    BUILDING_CATEGORIES.forEach(function (category) {
        const button = document.getElementById(category.buttonId);
        const place = document.getElementById(category.placeholderId);

        if (button) button.classList.toggle("active", category.id === activeId);
        if (place) place.style.display = category.id === activeId ? "block" : "none";
    });
}

function initBuildInterface() {
    const buildPlace = document.getElementById("buildplace");
    if (!buildPlace) return;

    BUILDING_CATEGORIES.forEach(function (category) {
        if (document.getElementById(category.buttonId)) return;

        const button = document.createElement("button");
        button.type = "button";
        button.id = category.buttonId;
        button.className = "buildsub";
        button.innerText = category.name;
        button.setAttribute(
            "data-tooltip",
            category.id === BUILDING_IMPROVE_CATEGORY.id
                ? "Improve completed buildings on the current tile."
                : category.id === BUILDINGS_CATEGORY.id
                    ? "Infrastructure buildings for the camp and its recipes."
                    : category.id === HOUSES_CATEGORY.id
                        ? "Houses that provide RoomSpace."
                        : category.id === FURNITURE_CATEGORY.id
                            ? "Furniture that improves work around the camp."
                            : "Buildings you can construct in the camp."
        );
        button.addEventListener("click", function () {
            setActiveBuildCategory(category.id);
        });

        const place = document.createElement("div");
        place.id = category.placeholderId;
        place.className = "craftsubplace";

        buildPlace.appendChild(button);
        buildPlace.appendChild(place);
    });

    ensureBuildPanel();
    ensureBuildingsPanel();
    ensureHousesPanel();
    ensureFurniturePanel();
    ensureImprovePanel();
    renderBuildPanels();
    renderBuildingsPanels();
    renderHousesPanels();
    renderFurniturePanels();
    renderImprovePanels();
    if (typeof createHousePowerSection === "function") createHousePowerSection();
    if (typeof updateCharacterPowerGUI === "function") updateCharacterPowerGUI();
    setActiveBuildCategory(BUILDING_CATEGORY.id);
}

function performBuild(def) {
    if (!def) return false;

    if (!canBuildBuilding(def)) {
        logMessage("Not enough resources or space to build " + def.name + ".");
        return false;
    }

    const quality = getBuildingQuality(def);

    def.resources.forEach(function (requirement) {
        const stack = resources[requirement.resourceId];
        if (!stack) return;
        stack.amount = round2(Math.max(0, stack.amount - requirement.amount));
    });

    if ((def.emptySpace || 0) > 0) {
        currentTile.space.EmptySpace = round2(
            Math.max(0, getCurrentTileEmptySpace() - def.emptySpace)
        );
    }

    if ((def.roomSpace || 0) > 0) {
        currentTile.space.RoomSpace = round2(
            Math.max(0, getCurrentTileRoomSpace() - def.roomSpace)
        );
    }

    // Some projects turn one tile element into another on completion (for
    // example, fertile land into prepared EmptySpace). Their space cost is
    // consumed when construction starts.
    if (def.consumeSpaceElements && Array.isArray(def.spaceElementRequirements)) {
        def.spaceElementRequirements.forEach(function (requirement) {
            consumeCurrentTileSpaceElement(requirement.element, requirement.amount);
        });
    }

    const building = {
        uid: nextBuildingUid++,
        defId: def.id,
        x: currentTile.x,
        y: currentTile.y,
        workPoints: def.workPoints,
        completed: false,
        quality: quality,
        roomSpaceApplied: false,
    };

    buildings.push(building);
    attachBuildingsToCurrentTile();
    registerBuildingAction(building);

    if (typeof renderResources === "function") renderResources();
    refreshActionButtons();
    renderBuildPanels();
    refreshMapCoordinates(true);

    logMessage("Construction of " + def.name + " started at "
        + building.x + ", " + building.y + ".");
    return true;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBuildInterface);
} else {
    initBuildInterface();
}
