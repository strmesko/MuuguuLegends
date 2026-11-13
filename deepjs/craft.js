// Crafting system: recipes turn raw resources into item instances.
// To add a new craft, add an entry to CRAFT_RECIPES. The category filters,
// craft list, required-resource panel and result preview are generated
// automatically from the recipe data.
//
// Every recipe names the main skill it trains (`skill`). The resources define
// the base quality of the result, the skill level softcaps that quality and
// the skill gains experience from every crafted item.

const CRAFT_CATEGORIES = Object.freeze([
    Object.freeze({
        id: "common",
        name: "Common",
        placeholderId: "commonplace",
        buttonId: "craftcommon",
    }),
    Object.freeze({
        id: "food",
        name: "Food",
        placeholderId: "foodplace",
        buttonId: "craftfood",
    }),
    Object.freeze({
        id: "tools",
        name: "Tools",
        placeholderId: "toolsplace",
        buttonId: "crafttools",
    }),
    Object.freeze({
        id: "cultery",
        name: "Cultery",
        placeholderId: "culteryplace",
        buttonId: "craftcultery",
    }),
]);

// Tools share the Tools category and the Survival skill. Resource costs are
// passed as [resourceId, amount] pairs so new tools stay one line each.
function createToolRecipe(id, itemId, resources) {
    return Object.freeze({
        id: id,
        category: "tools",
        itemId: itemId,
        skill: "survival",
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    });
}

// The leaf clothing set shares one recipe shape: leaves, branches and fibers.
// Survival Pounch uses the same recipe with twice as many fibers.
function createLeafClothingRecipe(id, itemId, fibers) {
    const fiberAmount = Number.isFinite(fibers) && fibers > 0 ? fibers : 1;

    return Object.freeze({
        id: "leaf-" + id,
        category: "common",
        itemId: itemId,
        skill: "tailoring",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 1 }),
            Object.freeze({ resourceId: RESOURCE_IDS.BRANCHES, amount: 1 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: fiberAmount }),
        ]),
    });
}

const KEBOB_INGREDIENT_IDS = Object.freeze(
    MUSHROOM_RESOURCE_IDS.concat(
        VEGETABLE_RESOURCE_IDS,
        [RESOURCE_IDS.BUG_MEAT, RESOURCE_IDS.CHICKEN_MEAT]
    )
);

// Porridge accepts any grain that can be ground into flour as its main
// ingredient, and any kebob ingredient as the optional bonus.
const PORRIDGE_GRAIN_IDS = Object.freeze(CROP_RESOURCE_IDS.slice());
const PORRIDGE_BONUS_INGREDIENT_IDS = KEBOB_INGREDIENT_IDS;

// Salads take three of one vegetable/fruit plus one aromatic herb or nuts.
const SALAD_HERB_IDS = Object.freeze(
    HERB_EDIBLE_RESOURCE_IDS.concat(HERB_SPICE_RESOURCE_IDS)
);

// Metal tools, metal cutlery and metal pots use the matching metal bars.
// Tools and cutlery also need a wooden handle/shaft; pots do not.
function createMetalVariantRecipes() {
    const variants = (typeof METAL_VARIANT_ITEMS !== "undefined" ? METAL_VARIANT_ITEMS : [])
        .concat(typeof METAL_POT_ITEMS !== "undefined" ? METAL_POT_ITEMS : []);

    return variants.map(function (variant) {
        const resources = [];
        if (variant.handleResourceId) {
            resources.push(Object.freeze({
                resourceId: variant.handleResourceId,
                amount: 1,
            }));
        }
        resources.push(Object.freeze({
            resourceId: variant.barResourceId,
            amount: variant.barAmount,
        }));

        return Object.freeze({
            id: "metal-" + variant.metalKey + "-" + variant.baseKey,
            category: variant.category,
            itemId: variant.itemId,
            skill: "smithing",
            resources: Object.freeze(resources),
        });
    });
}

const METAL_VARIANT_RECIPES = Object.freeze(createMetalVariantRecipes());

// Cutlery shares the Cultery category and Carpentry skill. Every recipe uses
// 10 sticks; some also need a minimum amount of Cutting power.
function createCutleryRecipe(id, itemId, cuttingPower) {
    const recipe = {
        id: "cutlery-" + id,
        category: "cultery",
        itemId: itemId,
        skill: "carpentry",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.STICKS, amount: 10 }),
        ]),
    };

    const requiredPower = Number(cuttingPower);
    if (Number.isFinite(requiredPower) && requiredPower > 0) {
        recipe.requiredToolPower = Object.freeze({
            type: "cutting",
            power: requiredPower,
        });
    }

    return Object.freeze(recipe);
}

const CRAFT_RECIPES = Object.freeze([
    Object.freeze({
        id: "kebob-on-stick",
        category: "food",
        itemId: ITEM_IDS.KEBOB_ON_STICK,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.STICKS, amount: 1 }),
        ]),
        choiceResourceIds: KEBOB_INGREDIENT_IDS,
        choiceAmount: 1,
        resultNameSuffix: " stick kebob",
        bonusChoiceSlotsFromCooking: true,
        bonusChoiceAmount: 1,
        requiresCookingPower: true,
        multiplyQualityByCookingPower: true,
    }),
    Object.freeze({
        id: "porridge",
        category: "food",
        itemId: ITEM_IDS.PORRIDGE,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        choiceResourceIds: PORRIDGE_GRAIN_IDS,
        choiceAmount: 1,
        choiceLabel: "Choose grain:",
        resultNameSuffix: " porridge",
        bonusChoiceSlots: 1,
        bonusChoiceResourceIds: PORRIDGE_BONUS_INGREDIENT_IDS,
        bonusChoiceAmount: 1,
        requiresCookingPower: true,
        multiplyQualityByCookingPower: true,
        requiresEquippedSlot: "pot",
        requiresWater: true,
        requiresCampfire: true,
    }),
    Object.freeze({
        id: "salad",
        category: "food",
        itemId: ITEM_IDS.SALAD,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        choiceSlots: Object.freeze([
            Object.freeze({
                id: "vegetable1",
                resourceIds: VEGETABLE_RESOURCE_IDS,
                amount: 1,
                label: "Choose vegetable 1:",
            }),
            Object.freeze({
                id: "vegetable2",
                resourceIds: VEGETABLE_RESOURCE_IDS,
                amount: 1,
                label: "Choose vegetable 2:",
            }),
            Object.freeze({
                id: "vegetable3",
                resourceIds: VEGETABLE_RESOURCE_IDS,
                amount: 1,
                label: "Choose vegetable 3:",
            }),
            Object.freeze({
                id: "herbs",
                resourceIds: SALAD_HERB_IDS,
                amount: 1,
                label: "Choose herb:",
            }),
        ]),
        requiredToolPower: Object.freeze({
            type: "cutting",
            power: 2,
            exclusive: true,
        }),
    }),
    Object.freeze({
        id: "fruits-salad",
        category: "food",
        itemId: ITEM_IDS.FRUITS_SALAD,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        choiceSlots: Object.freeze([
            Object.freeze({
                id: "fruit1",
                resourceIds: FRUIT_RESOURCE_IDS,
                amount: 1,
                label: "Choose fruit 1:",
            }),
            Object.freeze({
                id: "fruit2",
                resourceIds: FRUIT_RESOURCE_IDS,
                amount: 1,
                label: "Choose fruit 2:",
            }),
            Object.freeze({
                id: "fruit3",
                resourceIds: FRUIT_RESOURCE_IDS,
                amount: 1,
                label: "Choose fruit 3:",
            }),
            Object.freeze({
                id: "nuts",
                resourceIds: NUT_RESOURCE_IDS,
                amount: 1,
                label: "Choose nuts:",
            }),
        ]),
        requiredToolPower: Object.freeze({
            type: "cutting",
            power: 2,
            exclusive: true,
        }),
    }),
    createCutleryRecipe("ladle", ITEM_IDS.LADLE, 1),
    createCutleryRecipe("wooden-fork", ITEM_IDS.WOODEN_FORK, 3),
    createCutleryRecipe("wooden-spoon", ITEM_IDS.WOODEN_SPOON, 1),
    createCutleryRecipe("wooden-bowl", ITEM_IDS.WOODEN_BOWL, 1),
    createCutleryRecipe("wooden-little-spoon", ITEM_IDS.WOODEN_LITTLE_SPOON, null),
    createCutleryRecipe("wooden-mug", ITEM_IDS.WOODEN_MUG, null),
    createCutleryRecipe("carved-wooden-plate", ITEM_IDS.CARVED_WOODEN_PLATE, null),
    Object.freeze({
        id: "pottery-clay-pot",
        category: "cultery",
        itemId: ITEM_IDS.CLAY_POT,
        skill: "pottery",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.CLAY, amount: 20 }),
        ]),
    }),
    createToolRecipe("handy-stick", ITEM_IDS.HANDY_STICK, [
        [RESOURCE_IDS.STICKS, 1],
    ]),
    createToolRecipe("flint-knife", ITEM_IDS.FLINT_KNIFE, [
        [RESOURCE_IDS.BRANCHES, 3],
        [RESOURCE_IDS.FLINT, 2],
    ]),
    createToolRecipe("stone-hammer", ITEM_IDS.STONE_HAMMER, [
        [RESOURCE_IDS.ROCKS, 15],
        [RESOURCE_IDS.STICKS, 3],
        [RESOURCE_IDS.FIBERS, 2],
    ]),
    createToolRecipe("stone-axe", ITEM_IDS.STONE_AXE, [
        [RESOURCE_IDS.ROCKS, 15],
        [RESOURCE_IDS.STICKS, 3],
        [RESOURCE_IDS.FIBERS, 2],
    ]),
    createToolRecipe("flint-pickaxe", ITEM_IDS.FLINT_PICKAXE, [
        [RESOURCE_IDS.FLINT, 5],
        [RESOURCE_IDS.FIBERS, 2],
        [RESOURCE_IDS.STICKS, 5],
    ]),
    createToolRecipe("flint-spear", ITEM_IDS.FLINT_SPEAR, [
        [RESOURCE_IDS.STICKS, 15],
        [RESOURCE_IDS.FIBERS, 2],
        [RESOURCE_IDS.FLINT, 2],
    ]),
    Object.freeze({
        id: "leaf-of-nature",
        category: "common",
        itemId: ITEM_IDS.LEAF_OF_NATURE,
        skill: "tailoring",
        resources: Object.freeze([
            Object.freeze({ resourceId: RESOURCE_IDS.LEAVES, amount: 1 }),
            Object.freeze({ resourceId: RESOURCE_IDS.FIBERS, amount: 1 }),
        ]),
    }),
    createLeafClothingRecipe("hood", ITEM_IDS.LEAF_HOOD),
    createLeafClothingRecipe("mask", ITEM_IDS.LEAF_MASK),
    createLeafClothingRecipe("necklace", ITEM_IDS.LEAF_NECKLACE),
    createLeafClothingRecipe("shirt", ITEM_IDS.LEAF_SHIRT),
    createLeafClothingRecipe("shoulderpads", ITEM_IDS.LEAF_SHOULDERPADS),
    createLeafClothingRecipe("cloak", ITEM_IDS.LEAF_CLOAK),
    createLeafClothingRecipe("belt", ITEM_IDS.LEAF_BELT),
    createLeafClothingRecipe("survival-pounch", ITEM_IDS.SURVIVAL_POUNCH, 2),
    createLeafClothingRecipe("straw-basket-backpack", ITEM_IDS.STRAW_BASKET_BACKPACK),
    createLeafClothingRecipe("glove-i", ITEM_IDS.LEAF_GLOVE_I),
    createLeafClothingRecipe("wristband-i", ITEM_IDS.LEAF_WRISTBAND_I),
    createLeafClothingRecipe("trousers", ITEM_IDS.LEAF_TROUSERS),
    createLeafClothingRecipe("leggings", ITEM_IDS.LEAF_LEGGINGS),
    createLeafClothingRecipe("boots", ITEM_IDS.LEAF_BOOTS),
    createLeafClothingRecipe("anklet-i", ITEM_IDS.LEAF_ANKLET_I),
    ...METAL_VARIANT_RECIPES,
]);

// Crafting rules.
// Quality of the result starts as the weighted average quality of the used
// resources. Anything above the recipe skill level is softcapped: only half of
// the excess is kept.
const CRAFT_SOFTCAP_EXCESS_FACTOR = 0.5;
// If the resource quality exceeds the skill level, every craft has a 50%
// chance to come out as Junk.
const CRAFT_JUNK_CHANCE = 0.5;
// Skill experience: 10 * product level (quality) * rarity multiplier.
const CRAFT_SKILL_EXP_MULTIPLIER = 10;
// Luck improves every rarity roll during crafting by 1% per Luck level and
// makes Junk proportionally less likely.
const CRAFT_LUCK_RARITY_CHANCE_PER_LEVEL = 0.01;
// Crafting an item of Uncommon rarity or higher grants Luck experience equal
// to 5 ^ rarityTier, where rarityTier is the position of the rarity in
// ITEM_RARITY_DEFS (Junk = 0, Common = 1, Uncommon = 2, ...).
const CRAFT_LUCK_EXP_BASE = 5;
// Rarity ladder above Common. Each next tier is half as likely as the
// previous one: Uncommon 1/2, SomewhatRare 1/4, Rare 1/8, ...
const CRAFT_RARITY_LADDER = Object.freeze(
    Object.keys(ITEM_RARITY_DEFS).filter(function (rarityId) {
        return rarityId !== ITEM_RARITIES.Junk && rarityId !== ITEM_RARITIES.Common;
    })
);

// Which recipe is selected in each category. Kept in memory only: it is a UI
// detail and does not need to be saved.
const selectedCraftByCategory = {};
// Selected mushroom/vegetable for recipes that let the player choose one
// flexible ingredient. Keyed by recipe id.
const selectedCraftChoiceByRecipe = {};
// Optional bonus ingredients. Keyed by recipe id, each entry is an array of
// resource ids or null for an empty "-None-" slot.
const selectedCraftBonusChoicesByRecipe = {};
// Extra mandatory ingredient slots (for example 3 vegetables + 1 herb).
// Keyed by recipe id and then by slot id.
const selectedCraftSlotChoicesByRecipe = {};

function getCraftCategory(categoryId) {
    return CRAFT_CATEGORIES.find(function (category) {
        return category.id === categoryId;
    }) || null;
}

function getCraftRecipesByCategory(categoryId) {
    return CRAFT_RECIPES.filter(function (recipe) {
        return recipe.category === categoryId;
    });
}

function getCraftChoiceResourceIds(recipe) {
    return recipe && Array.isArray(recipe.choiceResourceIds)
        ? recipe.choiceResourceIds
        : [];
}

// A recipe may also need several independent mandatory picks, each with its
// own resource list and amount (salads need 3 vegetables and 1 herb).
function getCraftChoiceSlots(recipe) {
    return recipe && Array.isArray(recipe.choiceSlots) ? recipe.choiceSlots : [];
}

function getCraftSlotChoices(recipe) {
    const slots = getCraftChoiceSlots(recipe);
    if (!slots.length) return {};

    let state = selectedCraftSlotChoicesByRecipe[recipe.id];
    if (!state || typeof state !== "object") state = {};

    slots.forEach(function (slot) {
        const allowed = Array.isArray(slot.resourceIds) ? slot.resourceIds : [];
        const stored = Number(state[slot.id]);
        if (allowed.indexOf(stored) !== -1) return;

        const required = Math.max(1, Number(slot.amount) || 1);
        const available = allowed.find(function (resourceId) {
            return getResourceAmount(resourceId) >= required;
        });
        state[slot.id] = available != null ? available : allowed[0];
    });

    selectedCraftSlotChoicesByRecipe[recipe.id] = state;
    return state;
}

function setCraftSlotChoice(recipe, slotId, resourceId) {
    const slot = getCraftChoiceSlots(recipe).find(function (entry) {
        return entry.id === slotId;
    });
    if (!slot) return false;

    const chosen = Number(resourceId);
    if ((slot.resourceIds || []).indexOf(chosen) === -1) return false;

    const state = getCraftSlotChoices(recipe);
    state[slot.id] = chosen;
    selectedCraftSlotChoicesByRecipe[recipe.id] = state;
    return true;
}

function getSelectedCraftChoice(recipe) {
    const choices = getCraftChoiceResourceIds(recipe);
    if (!recipe || !choices.length) return null;

    const stored = Number(selectedCraftChoiceByRecipe[recipe.id]);
    if (Number.isFinite(stored) && choices.indexOf(stored) !== -1) {
        return stored;
    }

    const required = Math.max(1, Number(recipe.choiceAmount) || 1);
    const available = choices.find(function (resourceId) {
        return getResourceAmount(resourceId) >= required;
    });
    const chosen = available != null ? available : choices[0];
    selectedCraftChoiceByRecipe[recipe.id] = chosen;
    return chosen;
}

function setSelectedCraftChoice(recipe, resourceId) {
    if (!recipe) return false;

    const choices = getCraftChoiceResourceIds(recipe);
    const chosen = Number(resourceId);
    if (choices.indexOf(chosen) === -1) return false;

    selectedCraftChoiceByRecipe[recipe.id] = chosen;
    return true;
}

// Cooking level's square root decides how many optional bonus ingredients the
// food recipe offers. Level 1 gives one slot, level 4 gives two, level 9
// gives three, and so on.
function getCookingBonusSlotCount() {
    const cooking = Math.max(1, Math.floor(Number(getEffectiveLevel("cooking")) || 1));
    return Math.max(1, Math.floor(Math.sqrt(cooking)));
}

function getCraftBonusSlotCount(recipe) {
    if (!recipe) return 0;
    if (recipe.bonusChoiceSlotsFromCooking === true) {
        return getCookingBonusSlotCount();
    }
    return Math.max(0, Math.floor(Number(recipe.bonusChoiceSlots) || 0));
}

function getCraftBonusChoices(recipe) {
    const count = getCraftBonusSlotCount(recipe);
    if (count <= 0) return [];

    let choices = selectedCraftBonusChoicesByRecipe[recipe.id];
    if (!Array.isArray(choices)) choices = [];

    if (choices.length > count) {
        choices = choices.slice(0, count);
    }
    while (choices.length < count) {
        choices.push(null);
    }

    selectedCraftBonusChoicesByRecipe[recipe.id] = choices;
    return choices;
}

// Bonus ingredients usually reuse the main ingredient list, but a recipe may
// accept a wider set (porridge takes grain as the base and anything edible as
// the bonus).
function getCraftBonusResourceIds(recipe) {
    if (recipe && Array.isArray(recipe.bonusChoiceResourceIds)
        && recipe.bonusChoiceResourceIds.length) {
        return recipe.bonusChoiceResourceIds;
    }
    return getCraftChoiceResourceIds(recipe);
}

function setCraftBonusChoice(recipe, index, resourceId) {
    if (!recipe) return false;

    const choices = getCraftBonusChoices(recipe);
    const slot = Number(index);
    if (!Number.isInteger(slot) || slot < 0 || slot >= choices.length) {
        return false;
    }

    if (resourceId == null || resourceId === "") {
        choices[slot] = null;
        return true;
    }

    const chosen = Number(resourceId);
    if (getCraftBonusResourceIds(recipe).indexOf(chosen) === -1) {
        return false;
    }

    choices[slot] = chosen;
    return true;
}

// Fixed requirements plus the selected flexible ingredient and any optional
// bonus ingredients. Duplicate resource ids are merged so affordability and
// consumption always match the displayed amounts.
function getCraftRequirements(recipe) {
    const merged = Object.create(null);

    function addRequirement(resourceId, amount) {
        const id = Number(resourceId);
        const value = Math.max(1, Number(amount) || 1);
        if (!Number.isFinite(id)) return;

        if (!merged[id]) {
            merged[id] = { resourceId: id, amount: 0 };
        }
        merged[id].amount += value;
    }

    (recipe && Array.isArray(recipe.resources) ? recipe.resources : []).forEach(function (requirement) {
        addRequirement(requirement.resourceId, requirement.amount);
    });

    if (recipe && getCraftChoiceResourceIds(recipe).length) {
        const choice = getSelectedCraftChoice(recipe);
        if (choice != null) {
            addRequirement(choice, recipe.choiceAmount);
        }

        getCraftBonusChoices(recipe).forEach(function (bonusResourceId) {
            if (bonusResourceId != null) {
                addRequirement(bonusResourceId, recipe.bonusChoiceAmount || 1);
            }
        });
    }

    const slots = getCraftChoiceSlots(recipe);
    if (slots.length) {
        const slotState = getCraftSlotChoices(recipe);
        slots.forEach(function (slot) {
            const chosen = slotState[slot.id];
            if (chosen != null) addRequirement(chosen, slot.amount);
        });
    }

    return Object.keys(merged).map(function (key) {
        return merged[key];
    });
}

// Recipe that produces the given item, used by the inventory scrap action.
function getCraftRecipeForItem(itemId) {
    return CRAFT_RECIPES.find(function (recipe) {
        return recipe.itemId === itemId;
    }) || null;
}

function getCraftResultName(recipe) {
    if (recipe && getCraftChoiceResourceIds(recipe).length) {
        const choice = getSelectedCraftChoice(recipe);
        const choiceDefinition = choice != null ? RESOURCE_DEFS[choice] : null;
        if (choiceDefinition) {
            const suffix = typeof recipe.resultNameSuffix === "string"
                ? recipe.resultNameSuffix
                : " stick kebob";
            return choiceDefinition.name + suffix;
        }
    }

    const definition = getItemDefinition(recipe.itemId);
    return definition ? definition.name : "Unknown item";
}

function getCraftSkill(recipe) {
    const skillKey = recipe && typeof recipe.skill === "string" ? recipe.skill : null;
    if (!skillKey || typeof player === "undefined" || !player) return null;

    const skill = player[skillKey];
    return skill instanceof Skill ? skill : null;
}

function getCraftSkillLevel(recipe) {
    const skill = getCraftSkill(recipe);
    return skill ? getEffectiveLevel(recipe.skill) : null;
}

function getCraftSkillName(recipe) {
    const skill = getCraftSkill(recipe);
    if (skill) return skill.name;

    const skillKey = recipe && typeof recipe.skill === "string" ? recipe.skill : "";
    return skillKey ? skillKey.charAt(0).toUpperCase() + skillKey.slice(1) : "Unknown";
}

function getSelectedCraftRecipe(categoryId) {
    const recipes = getCraftRecipesByCategory(categoryId);
    if (!recipes.length) return null;

    const selectedId = selectedCraftByCategory[categoryId];
    const selected = recipes.find(function (recipe) {
        return recipe.id === selectedId;
    });
    if (selected) return selected;

    selectedCraftByCategory[categoryId] = recipes[0].id;
    return recipes[0];
}

function getResourceAmount(resourceId) {
    const stack = resources[resourceId];
    return stack && Number.isFinite(stack.amount) ? stack.amount : 0;
}

function getResourceQuality(resourceId) {
    const stack = resources[resourceId];
    const quality = stack ? Number(stack.quality) : RESOURCE_DEFAULT_QUALITY;
    return Number.isFinite(quality) && quality > 0 ? quality : RESOURCE_DEFAULT_QUALITY;
}

function canAffordCraft(recipe) {
    if (!recipe) return false;

    return getCraftRequirements(recipe).every(function (requirement) {
        return getResourceAmount(requirement.resourceId) >= requirement.amount;
    });
}

function getCraftCookingPower() {
    return typeof getCharacterHousePower === "function"
        ? Math.max(0, getCharacterHousePower("cooking"))
        : 0;
}

function getCraftRequiredToolPower(recipe) {
    const requirement = recipe && recipe.requiredToolPower;
    if (!requirement || !requirement.type) return null;

    return {
        type: requirement.type,
        power: Math.max(0, Number(requirement.power) || 0),
        exclusive: requirement.exclusive === true,
    };
}

function getCraftToolPower(type) {
    return typeof getCharacterToolPower === "function"
        ? Math.max(0, Number(getCharacterToolPower(type)) || 0)
        : 0;
}

function meetsCraftToolPower(requirement, currentPower) {
    if (!requirement) return true;
    return requirement.exclusive
        ? currentPower > requirement.power
        : currentPower >= requirement.power;
}

function hasCraftToolPower(recipe) {
    const requirement = getCraftRequiredToolPower(recipe);
    if (!requirement) return true;
    return meetsCraftToolPower(requirement, getCraftToolPower(requirement.type));
}

function getCraftQualityMultiplier(recipe) {
    if (!recipe || recipe.multiplyQualityByCookingPower !== true) return 1;
    return getCraftCookingPower();
}

function hasEquippedCraftSlot(slotId) {
    return !!(typeof player !== "undefined"
        && player
        && player.equipment
        && player.equipment[slotId]);
}

function getCraftSlotLabel(slotId) {
    if (typeof EQUIPMENT_SLOT_GROUPS !== "undefined") {
        for (const group of EQUIPMENT_SLOT_GROUPS) {
            const slot = group.slots.find(function (entry) {
                return entry.id === slotId;
            });
            if (slot) return slot.label;
        }
    }
    return String(slotId || "");
}

// A campfire has to be built and finished on the current tile.
function hasCampfireOnCurrentTile() {
    if (typeof currentTile === "undefined" || !currentTile) return false;
    if (typeof BUILDING_IDS === "undefined" || !BUILDING_IDS.CAMPFIRE) return false;

    if (typeof getBestCompletedBuildingQuality === "function") {
        return getBestCompletedBuildingQuality(BUILDING_IDS.CAMPFIRE, currentTile) !== null;
    }

    return Array.isArray(currentTile.buildings) && currentTile.buildings.some(function (building) {
        return !!building
            && building.defId === BUILDING_IDS.CAMPFIRE
            && building.completed === true;
    });
}

// Station requirements: an equipped tool (the pot), water and a campfire.
// Each entry reports whether it is satisfied and the message to log when it is
// not, so the craft UI and performCraft share one source of truth.
function getCraftStationRequirements(recipe) {
    const requirements = [];
    if (!recipe) return requirements;

    if (recipe.requiresEquippedSlot) {
        const slotId = String(recipe.requiresEquippedSlot);
        const label = getCraftSlotLabel(slotId);
        const equipped = hasEquippedCraftSlot(slotId);
        requirements.push({
            id: "slot-" + slotId,
            label: label + " equipped",
            short: label,
            ok: equipped,
            message: "You need a " + label.toLowerCase() + " equipped to cook "
                + getCraftResultName(recipe),
        });
    }

    if (recipe.requiresWater === true) {
        const hasWater = typeof hasWaterOnCurrentTile === "function"
            && hasWaterOnCurrentTile();
        requirements.push({
            id: "water",
            label: "Water on this tile",
            short: "Water",
            ok: hasWater,
            message: "You need water on this tile to cook " + getCraftResultName(recipe),
        });
    }

    if (recipe.requiresCampfire === true) {
        const hasCampfire = hasCampfireOnCurrentTile();
        requirements.push({
            id: "campfire",
            label: "Campfire on this tile",
            short: "Campfire",
            ok: hasCampfire,
            message: "You need a campfire on this tile to cook " + getCraftResultName(recipe),
        });
    }

    return requirements;
}

function canMeetCraftStationRequirements(recipe) {
    return getCraftStationRequirements(recipe).every(function (requirement) {
        return requirement.ok;
    });
}

function canCraftRecipe(recipe) {
    if (!recipe || !getCraftSkill(recipe)) return false;
    if (recipe.requiresCookingPower === true && getCraftCookingPower() <= 0) {
        return false;
    }
    if (!hasCraftToolPower(recipe)) {
        return false;
    }
    if (!canMeetCraftStationRequirements(recipe)) {
        return false;
    }
    return canAffordCraft(recipe);
}

// Weighted average quality of all resource units consumed by the recipe.
function getCraftResourceQuality(recipe) {
    let totalAmount = 0;
    let totalQuality = 0;

    getCraftRequirements(recipe).forEach(function (requirement) {
        const amount = Number(requirement.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;

        totalQuality += getResourceQuality(requirement.resourceId) * amount;
        totalAmount += amount;
    });

    if (totalAmount <= 0) return RESOURCE_DEFAULT_QUALITY;
    return totalQuality / totalAmount;
}

// The part of the quality above the skill level only counts for half.
function applyCraftSoftcap(quality, skillLevel) {
    if (!Number.isFinite(skillLevel) || skillLevel <= 0) return quality;
    if (quality <= skillLevel) return quality;

    return skillLevel + (quality - skillLevel) * CRAFT_SOFTCAP_EXCESS_FACTOR;
}

function getCraftQualityInfo(recipe) {
    const rawQuality = getCraftResourceQuality(recipe);
    const skillLevel = getCraftSkillLevel(recipe);
    const cappedQuality = skillLevel == null
        ? rawQuality
        : applyCraftSoftcap(rawQuality, skillLevel);
    const powerMultiplier = getCraftQualityMultiplier(recipe);
    const finalQuality = cappedQuality * powerMultiplier;
    const cookingPowerMultiplier = recipe.multiplyQualityByCookingPower === true
        ? getCraftCookingPower()
        : 1;

    return {
        rawQuality: rawQuality,
        quality: roundItemNumber(finalQuality),
        skillLevel: skillLevel,
        softcapped: skillLevel != null && rawQuality > skillLevel,
        powerMultiplier: powerMultiplier,
        cookingPowerMultiplier: cookingPowerMultiplier,
    };
}

// Food does not use random equipment properties. Every property slot the
// rarity would have rolled instead becomes potential. The extra is split
// between the potential types already present on the dish, or goes to the
// recipe's primary stat when the ingredients grant none.
function getCraftFoodRarityPotential(recipe, quality, rarity, existingBonuses) {
    if (!recipe || recipe.category !== "food") return null;
    if (typeof getItemPropertyCount !== "function") return null;

    const propertyCount = getItemPropertyCount(rarity);
    if (propertyCount <= 0) return null;

    const statKeys = existingBonuses ? Object.keys(existingBonuses) : [];
    if (!statKeys.length && recipe.stat) statKeys.push(recipe.stat);
    if (!statKeys.length) return null;

    const perSlot = roundItemNumber(Math.max(0, Number(quality) || 0) * 0.1);
    if (perSlot <= 0) return null;

    const bonuses = {};
    for (let index = 0; index < propertyCount; index++) {
        const statKey = statKeys[index % statKeys.length];
        bonuses[statKey] = roundItemNumber((bonuses[statKey] || 0) + perSlot);
    }
    return bonuses;
}

// Potential bonuses carried by the ingredients are transferred to the cooked
// item. The finished item's quality scales them, and every optional bonus
// ingredient adds its own bonus while multiplying the whole result by 1.2.
// Rarity adds more potential in place of the random ItemDefs properties.
function getCraftPotentialBonuses(recipe, quality, rarity) {
    if (!recipe) return null;
    if (getCraftChoiceResourceIds(recipe).length === 0
        && getCraftChoiceSlots(recipe).length === 0) {
        return null;
    }

    const totals = Object.create(null);
    const requirements = getCraftRequirements(recipe);

    requirements.forEach(function (requirement) {
        if (typeof getFoodStatBinding !== "function") return;
        const statKey = getFoodStatBinding(requirement.resourceId);
        if (!statKey) return;

        const amount = Math.max(1, Number(requirement.amount) || 1);
        const resourceQuality = getResourceQuality(requirement.resourceId);
        const baseBonus = (1 + resourceQuality / 10) * amount;
        totals[statKey] = (totals[statKey] || 0) + baseBonus;
    });

    const bonusIngredients = getCraftBonusChoices(recipe).filter(function (resourceId) {
        return resourceId != null;
    }).length;
    const multiplier = Math.max(0, Number(quality) || 0)
        * Math.pow(1.2, bonusIngredients);
    if (multiplier <= 0) return null;

    const bonuses = {};
    Object.keys(totals).forEach(function (statKey) {
        bonuses[statKey] = roundItemNumber(totals[statKey] * multiplier);
    });

    const rarityBonuses = getCraftFoodRarityPotential(recipe, quality, rarity, bonuses);
    if (rarityBonuses) {
        Object.keys(rarityBonuses).forEach(function (statKey) {
            bonuses[statKey] = roundItemNumber((bonuses[statKey] || 0) + rarityBonuses[statKey]);
        });
    }

    return Object.keys(bonuses).length ? bonuses : null;
}

function getRarityTier(rarityId) {
    return Object.keys(ITEM_RARITY_DEFS).indexOf(rarityId);
}

// Luck level increases every rarity chance during crafting. Equipment
// rareItemsChance is applied on top of it.
function getCraftLuckRarityMultiplier() {
    const luck = Math.max(0, Number(getEffectiveLevel("luck")) || 0);
    return 1 + luck * CRAFT_LUCK_RARITY_CHANCE_PER_LEVEL;
}

// Luck experience for a crafted item. Only Uncommon and above count.
function getCraftLuckExpForRarity(rarityId) {
    const tier = getRarityTier(rarityId);
    const uncommonTier = getRarityTier(ITEM_RARITIES.Uncommon);
    if (tier < uncommonTier) return 0;
    return Math.pow(CRAFT_LUCK_EXP_BASE, tier);
}

// Default is Common. Uncommon has a 1/2 chance, then SomewhatRare 1/4 of the
// time, Rare 1/8 and so on, checking each next tier in order. Luck improves
// every roll and reduces the chance of a Junk result.
function rollCraftRarity(rawQuality, skillLevel) {
    const luckMultiplier = getCraftLuckRarityMultiplier();

    if (skillLevel != null && rawQuality > skillLevel) {
        if (Math.random() < CRAFT_JUNK_CHANCE / luckMultiplier) {
            return ITEM_RARITIES.Junk;
        }
    }

    let rarity = ITEM_RARITIES.Common;
    const rareItemsChanceBonus = typeof getEquippedGlobalPropertyBonus === "function"
        ? Math.max(0, Number(getEquippedGlobalPropertyBonus("rareItemsChance")) || 0)
        : 0;
    const rarityChanceMultiplier = (1 + rareItemsChanceBonus) * luckMultiplier;

    for (let index = 0; index < CRAFT_RARITY_LADDER.length; index++) {
        const baseChance = 1 / Math.pow(2, index + 1);
        const chance = Math.min(1, baseChance * rarityChanceMultiplier);
        if (Math.random() >= chance) break;
        rarity = CRAFT_RARITY_LADDER[index];
    }

    return rarity;
}

function hasFreeInventorySlot() {
    if (!player || !Array.isArray(player.equipinventory)) return false;

    const slotCount = Math.min(
        player.equipinventory.length,
        getEffectiveInventorySlots()
    );

    for (let index = 0; index < slotCount; index++) {
        if (!player.equipinventory[index]) return true;
    }
    return false;
}

function addCraftedItem(item) {
    if (!player || !Array.isArray(player.equipinventory)) return false;

    const slotCount = Math.min(
        player.equipinventory.length,
        getEffectiveInventorySlots()
    );

    for (let index = 0; index < slotCount; index++) {
        if (!player.equipinventory[index]) {
            player.equipinventory[index] = item;
            return true;
        }
    }
    return false;
}

// --- interface -------------------------------------------------------------

function ensureCraftPanel(category) {
    const place = document.getElementById(category.placeholderId);
    if (!place) return false;

    if (!document.getElementById(category.id + "craftlist")) {
        place.innerHTML = "";

        const list = document.createElement("div");
        list.className = "craftlist";
        list.id = category.id + "craftlist";

        const resourcesPanel = document.createElement("div");
        resourcesPanel.className = "craftdescription";
        resourcesPanel.id = category.id + "craftdescription";

        const detailsPanel = document.createElement("div");
        detailsPanel.className = "craftdetails";
        detailsPanel.id = category.id + "craftdetails";

        place.appendChild(list);
        place.appendChild(resourcesPanel);
        place.appendChild(detailsPanel);
    }

    return true;
}

function createCraftPanelTitle(text) {
    const title = document.createElement("div");
    title.className = "craftpanel-title";
    title.innerText = text;
    return title;
}

function renderCraftList(category) {
    const list = document.getElementById(category.id + "craftlist");
    if (!list) return;

    list.innerHTML = "";

    const recipes = getCraftRecipesByCategory(category.id);

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = category.name;
    group.appendChild(groupTitle);

    if (!recipes.length) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing to craft here yet.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    // Keep the selection valid and default it to the first recipe.
    const selectedRecipe = getSelectedCraftRecipe(category.id);

    const recipeList = document.createElement("ul");
    recipeList.className = "habitlist";

    recipes.forEach(function (recipe) {
        const recipeItem = document.createElement("li");
        recipeItem.className = "habititem craftrecipe";
        recipeItem.id = "craftrecipe-" + category.id + "-" + recipe.id;
        recipeItem.dataset.recipeId = recipe.id;
        recipeItem.classList.toggle(
            "selected",
            !!selectedRecipe && selectedRecipe.id === recipe.id
        );
        recipeItem.classList.toggle("unavailable", !canCraftRecipe(recipe));

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            "Craft " + getCraftResultName(recipe)
                + "<br>Skill: " + getCraftSkillName(recipe)
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = getCraftResultName(recipe);

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        recipeItem.appendChild(switchElement);
        recipeItem.addEventListener("click", function () {
            selectCraft(category.id, recipe.id);
        });

        recipeList.appendChild(recipeItem);
    });

    group.appendChild(recipeList);
    list.appendChild(group);
}

function createCraftIngredientIcon(resourceId, className) {
    const iconClass = className || "craftingredient-icon";
    if (resourceId == null) {
        const empty = document.createElement("span");
        empty.className = iconClass + " empty";
        return empty;
    }

    const definition = RESOURCE_DEFS[resourceId];
    if (!definition) {
        const empty = document.createElement("span");
        empty.className = iconClass + " empty";
        return empty;
    }

    return createItemImage(definition.name, iconClass);
}

function getCraftIngredientOptionLabel(resourceId) {
    const definition = RESOURCE_DEFS[resourceId];
    if (!definition) return "";
    return definition.name + " (" + round2(getResourceAmount(resourceId)) + ")";
}

// Native <option> elements cannot reliably show images, so food ingredient
// selection uses a small custom listbox with the resource icon before its name.
function createCraftIngredientSelect(options) {
    const settings = options || {};
    const resourceIds = settings.resourceIds || [];
    const selectedResourceId = settings.selectedResourceId != null
        ? Number(settings.selectedResourceId)
        : null;
    const includeNone = settings.includeNone === true;
    const onSelect = typeof settings.onSelect === "function"
        ? settings.onSelect
        : function () {};

    const wrapper = document.createElement("div");
    wrapper.className = "craftingredient-select";
    if (settings.id) wrapper.id = settings.id;
    wrapper.dataset.resourceId = selectedResourceId != null
        ? String(selectedResourceId)
        : "";

    const current = document.createElement("button");
    current.type = "button";
    current.className = "craftingredient-current";
    current.appendChild(createCraftIngredientIcon(selectedResourceId));

    const currentName = document.createElement("span");
    currentName.className = "craftingredient-name";
    currentName.innerText = selectedResourceId != null
        ? getCraftIngredientOptionLabel(selectedResourceId)
        : "-None-";
    current.appendChild(currentName);

    const arrow = document.createElement("span");
    arrow.className = "craftingredient-arrow";
    arrow.innerText = "▼";
    current.appendChild(arrow);

    const menu = document.createElement("div");
    menu.className = "craftingredient-menu";

    function addOption(resourceId) {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "craftingredient-option";
        option.dataset.resourceId = resourceId != null ? String(resourceId) : "";
        option.appendChild(createCraftIngredientIcon(resourceId));

        const label = document.createElement("span");
        label.className = "craftingredient-option-label";
        label.innerText = resourceId != null
            ? getCraftIngredientOptionLabel(resourceId)
            : "-None-";
        option.appendChild(label);

        option.addEventListener("click", function (event) {
            event.stopPropagation();
            wrapper.classList.remove("open");
            onSelect(resourceId);
        });

        menu.appendChild(option);
    }

    if (includeNone) addOption(null);
    resourceIds.forEach(addOption);

    current.addEventListener("click", function (event) {
        event.stopPropagation();
        wrapper.classList.toggle("open");
    });

    wrapper.appendChild(current);
    wrapper.appendChild(menu);
    return wrapper;
}

document.addEventListener("click", function (event) {
    const openSelects = document.querySelectorAll(".craftingredient-select.open");
    Array.prototype.forEach.call(openSelects, function (select) {
        if (!select.contains(event.target)) {
            select.classList.remove("open");
        }
    });
});

function renderCraftResources(category) {
    const panel = document.getElementById(category.id + "craftdescription");
    if (!panel) return;

    panel.innerHTML = "";
    panel.appendChild(createCraftPanelTitle("Required resources"));

    const recipe = getSelectedCraftRecipe(category.id);
    if (!recipe) {
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Select a craft from the list.";
        panel.appendChild(empty);
        return;
    }

    if (getCraftChoiceResourceIds(recipe).length) {
        const choiceBox = document.createElement("div");
        choiceBox.className = "craftchoice";

        const choiceLabel = document.createElement("label");
        choiceLabel.className = "craftchoice-label";
        choiceLabel.innerText = typeof recipe.choiceLabel === "string" && recipe.choiceLabel
            ? recipe.choiceLabel
            : "Choose mushroom or vegetable:";
        choiceLabel.htmlFor = "craftchoice-" + category.id + "-" + recipe.id;

        const currentChoice = getSelectedCraftChoice(recipe);
        const select = createCraftIngredientSelect({
            id: "craftchoice-" + category.id + "-" + recipe.id,
            resourceIds: getCraftChoiceResourceIds(recipe),
            selectedResourceId: currentChoice,
            includeNone: false,
            onSelect: function (resourceId) {
                setSelectedCraftChoice(recipe, resourceId);
                renderCraftList(category);
                renderCraftResources(category);
                renderCraftDetails(category);
                refreshCraftAvailability();
            },
        });

        choiceBox.appendChild(choiceLabel);
        choiceBox.appendChild(select);
        panel.appendChild(choiceBox);

        const bonusChoices = getCraftBonusChoices(recipe);
        if (bonusChoices.length) {
            const bonusBox = document.createElement("div");
            bonusBox.className = "craftchoice craftchoice-bonus";

            const bonusLabel = document.createElement("div");
            bonusLabel.className = "craftchoice-label";
            bonusLabel.innerText = "Bonus ingredients (optional, "
                + bonusChoices.length + " slot"
                + (bonusChoices.length === 1 ? "" : "s")
                + (recipe.bonusChoiceSlotsFromCooking === true ? " from Cooking" : "")
                + "):";
            bonusBox.appendChild(bonusLabel);

            bonusChoices.forEach(function (selectedResourceId, index) {
                const row = document.createElement("div");
                row.className = "craftchoice-bonus-row";

                const slotLabel = document.createElement("span");
                slotLabel.className = "craftchoice-slot-label";
                slotLabel.innerText = "Bonus " + (index + 1);

                const bonusSelect = createCraftIngredientSelect({
                    id: "craftbonus-" + category.id + "-" + recipe.id + "-" + index,
                    resourceIds: getCraftBonusResourceIds(recipe),
                    selectedResourceId: selectedResourceId,
                    includeNone: true,
                    onSelect: function (resourceId) {
                        setCraftBonusChoice(recipe, index, resourceId);
                        renderCraftResources(category);
                        renderCraftDetails(category);
                        refreshCraftAvailability();
                    },
                });

                row.appendChild(slotLabel);
                row.appendChild(bonusSelect);
                bonusBox.appendChild(row);
            });

            panel.appendChild(bonusBox);
        }
    }

    const choiceSlots = getCraftChoiceSlots(recipe);
    if (choiceSlots.length) {
        const slotState = getCraftSlotChoices(recipe);
        const slotBox = document.createElement("div");
        slotBox.className = "craftchoice";

        choiceSlots.forEach(function (slot) {
            const slotLabel = document.createElement("label");
            slotLabel.className = "craftchoice-label";
            slotLabel.innerText = slot.label || ("Choose " + slot.id + ":");
            slotLabel.htmlFor = "craftslot-" + category.id + "-" + recipe.id + "-" + slot.id;

            const select = createCraftIngredientSelect({
                id: slotLabel.htmlFor,
                resourceIds: slot.resourceIds,
                selectedResourceId: slotState[slot.id],
                includeNone: false,
                onSelect: function (resourceId) {
                    setCraftSlotChoice(recipe, slot.id, resourceId);
                    renderCraftList(category);
                    renderCraftResources(category);
                    renderCraftDetails(category);
                    refreshCraftAvailability();
                },
            });

            slotBox.appendChild(slotLabel);
            slotBox.appendChild(select);
        });

        panel.appendChild(slotBox);
    }

    const container = document.createElement("div");
    container.className = "craftresources";

    getCraftRequirements(recipe).forEach(function (requirement) {
        const definition = RESOURCE_DEFS[requirement.resourceId];
        if (!definition) return;

        const have = getResourceAmount(requirement.resourceId);
        const row = document.createElement("div");
        row.className = "craftresource "
            + (have >= requirement.amount ? "enough" : "missing");
        row.dataset.craftResource = requirement.resourceId;
        row.setAttribute("data-tooltip", definition.description);

        row.appendChild(createItemImage(definition.name, "craftresourceicon"));

        const name = document.createElement("span");
        name.className = "craftresource-name";
        name.innerText = definition.name;

        const amount = document.createElement("span");
        amount.className = "craftresource-amount";
        amount.innerText = round2(have) + " / " + requirement.amount;

        row.appendChild(name);
        row.appendChild(amount);
        container.appendChild(row);
    });

    panel.appendChild(container);

    const skill = getCraftSkill(recipe);
    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow" + (skill ? "" : " missing");
    skillRow.innerText = "Skill: " + getCraftSkillName(recipe)
        + (skill ? " Lv " + round2(getEffectiveLevel(recipe.skill)) : " (missing)");
    panel.appendChild(skillRow);

    const toolPowerRequirement = getCraftRequiredToolPower(recipe);
    if (toolPowerRequirement) {
        const toolDefinition = typeof ITEM_TOOL_POWER_TYPES !== "undefined"
            ? ITEM_TOOL_POWER_TYPES[toolPowerRequirement.type]
            : null;
        const label = toolDefinition ? toolDefinition.label : toolPowerRequirement.type;
        const currentPower = getCraftToolPower(toolPowerRequirement.type);
        const requiredLabel = (toolPowerRequirement.exclusive ? ">" : "")
            + toolPowerRequirement.power;
        const powerRow = document.createElement("div");
        powerRow.className = "craftskillrow"
            + (meetsCraftToolPower(toolPowerRequirement, currentPower) ? "" : " missing");
        powerRow.dataset.craftToolPower = toolPowerRequirement.type;
        powerRow.innerText = label + ": " + round2(currentPower)
            + " / " + requiredLabel;
        panel.appendChild(powerRow);
    }

    if (recipe.requiresCookingPower === true) {
        const cookingPower = getCraftCookingPower();
        const cookingRow = document.createElement("div");
        cookingRow.className = "craftskillrow" + (cookingPower > 0 ? "" : " missing");
        cookingRow.innerText = "Cooking power: " + round2(cookingPower)
            + " / 1 (quality x" + round2(Math.max(0, cookingPower)) + ")";
        panel.appendChild(cookingRow);
    }

    const stationRequirements = getCraftStationRequirements(recipe);
    if (stationRequirements.length) {
        const stationRow = document.createElement("div");
        const stationState = stationRequirements.map(function (requirement) {
            return (requirement.short || requirement.label) + ":"
                + (requirement.ok ? "1" : "0");
        }).join("|");
        stationRow.className = "craftskillrow"
            + (stationRequirements.every(function (requirement) {
                return requirement.ok;
            }) ? "" : " missing");
        stationRow.dataset.craftStationGroup = "1";
        stationRow.dataset.stationState = stationState;
        stationRow.innerText = "Stations: " + stationRequirements.map(function (requirement) {
            return (requirement.short || requirement.label)
                + " " + (requirement.ok ? "yes" : "no");
        }).join(", ");
        panel.appendChild(stationRow);
    }
}

function renderCraftDetails(category) {
    const panel = document.getElementById(category.id + "craftdetails");
    if (!panel) return;

    panel.innerHTML = "";

    const recipe = getSelectedCraftRecipe(category.id);
    if (!recipe) {
        panel.appendChild(createCraftPanelTitle("Result"));
        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "No craft selected.";
        panel.appendChild(empty);
        return;
    }

    const qualityInfo = getCraftQualityInfo(recipe);
    const choice = getSelectedCraftChoice(recipe);
    const potentialBonuses = getCraftPotentialBonuses(
        recipe,
        qualityInfo.quality,
        ITEM_RARITIES.Common
    );

    // Preview uses the computed quality and Common rarity; the final rarity is
    // rolled when the craft is performed.
    const preview = createItemInstance(recipe.itemId, {
        quality: qualityInfo.quality,
        rarity: ITEM_RARITIES.Common,
        displayName: getCraftResultName(recipe),
        primaryStat: recipe.stat || null,
        sourceResourceId: choice,
        potentialBonuses: potentialBonuses,
    });

    panel.appendChild(createCraftPanelTitle("Result"));

    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    info.appendChild(createItemImage(preview.name, "craftitemicon"));

    const heading = document.createElement("div");
    heading.innerHTML = getItemNameHtml(preview, preview.name)
        + " | quality: " + qualityInfo.quality;
    info.appendChild(heading);

    const rarityNote = document.createElement("div");
    rarityNote.className = "craftnote";
    rarityNote.innerText = "Rarity: random (Common by default, power scales with quality and rarity)";
    info.appendChild(rarityNote);

    const propertiesNote = document.createElement("div");
    propertiesNote.className = "craftnote";
    const resultDefinition = typeof getItemDefinition === "function"
        ? getItemDefinition(recipe.itemId)
        : null;
    propertiesNote.innerText = resultDefinition && resultDefinition.food
        ? "Food bonuses: potential only; higher rarity adds more potential instead of random properties"
        : "Properties: random, 50-150% variance, quality- and rarity-scaled";
    info.appendChild(propertiesNote);

    if (recipe.multiplyQualityByCookingPower === true) {
        const powerNote = document.createElement("div");
        powerNote.className = "craftnote";
        powerNote.innerText = "Cooking power x"
            + round2(Math.max(0, qualityInfo.cookingPowerMultiplier))
            + " to final quality";
        info.appendChild(powerNote);
    }

    if (qualityInfo.softcapped) {
        const softcapNote = document.createElement("div");
        softcapNote.className = "craftnote craftwarn";
        softcapNote.innerText = "Quality softcapped by "
            + getCraftSkillName(recipe) + " Lv " + qualityInfo.skillLevel
            + ": " + roundItemNumber(qualityInfo.rawQuality)
            + " -> " + qualityInfo.quality;
        info.appendChild(softcapNote);

        const junkNote = document.createElement("div");
        junkNote.className = "craftnote craftwarn";
        junkNote.innerText = "Quality exceeds the skill: 50% junk chance";
        info.appendChild(junkNote);
    }

    const bonusHtml = getItemBonusHtml(preview);
    if (bonusHtml) {
        const bonuses = document.createElement("div");
        bonuses.innerHTML = bonusHtml;
        info.appendChild(bonuses);
    }

    const description = getItemDescription(preview);
    if (description) {
        const descriptionElement = document.createElement("div");
        descriptionElement.className = "craftitemdescription";
        descriptionElement.innerText = description;
        info.appendChild(descriptionElement);
    }

    panel.appendChild(info);

    const button = document.createElement("button");
    button.type = "button";
    button.id = category.id + "craftbutton";
    button.className = "craftbutton";
    button.innerText = "Craft";
    button.disabled = !canCraftRecipe(recipe) || !hasFreeInventorySlot();
    button.addEventListener("click", function () {
        performCraft(recipe);
    });
    panel.appendChild(button);

    panel.dataset.craftQuality = String(qualityInfo.quality);
}

function renderCraftPanels() {
    CRAFT_CATEGORIES.forEach(function (category) {
        if (!ensureCraftPanel(category)) return;

        renderCraftList(category);
        renderCraftResources(category);
        renderCraftDetails(category);
    });

    refreshCraftAvailability();
}

function selectCraft(categoryId, recipeId) {
    const category = getCraftCategory(categoryId);
    if (!category) return;

    selectedCraftByCategory[categoryId] = recipeId;

    renderCraftList(category);
    renderCraftResources(category);
    renderCraftDetails(category);
    refreshCraftAvailability();
}

// Called every game tick: keeps resource counts and the Craft button in sync
// without rebuilding the panels (so open tooltips are not disturbed).
function refreshCraftAvailability() {
    if (typeof CRAFT_CATEGORIES === "undefined") return;

    CRAFT_CATEGORIES.forEach(function (category) {
        getCraftRecipesByCategory(category.id).forEach(function (recipe) {
            const row = document.getElementById(
                "craftrecipe-" + category.id + "-" + recipe.id
            );
            if (row) row.classList.toggle("unavailable", !canCraftRecipe(recipe));
        });

        const recipe = getSelectedCraftRecipe(category.id);
        if (!recipe) return;

        const resourcesPanel = document.getElementById(
            category.id + "craftdescription"
        );
        if (resourcesPanel) {
            getCraftRequirements(recipe).forEach(function (requirement) {
                const row = resourcesPanel.querySelector(
                    '[data-craft-resource="' + requirement.resourceId + '"]'
                );
                if (!row) return;

                const have = getResourceAmount(requirement.resourceId);
                const amount = row.querySelector(".craftresource-amount");
                if (amount) {
                    amount.innerText = round2(have) + " / " + requirement.amount;
                }

                row.classList.toggle("enough", have >= requirement.amount);
                row.classList.toggle("missing", have < requirement.amount);
            });

            const optionLabels = resourcesPanel.querySelectorAll(".craftingredient-option");
            Array.prototype.forEach.call(optionLabels, function (option) {
                if (!option.dataset.resourceId) return;
                const resourceId = Number(option.dataset.resourceId);
                const label = option.querySelector(".craftingredient-option-label");
                if (label) label.innerText = getCraftIngredientOptionLabel(resourceId);
            });

            const currentSelects = resourcesPanel.querySelectorAll(".craftingredient-select");
            Array.prototype.forEach.call(currentSelects, function (select) {
                if (!select.dataset.resourceId) return;
                const resourceId = Number(select.dataset.resourceId);
                const label = select.querySelector(".craftingredient-name");
                if (label) label.innerText = getCraftIngredientOptionLabel(resourceId);
            });

            const toolPowerRequirement = getCraftRequiredToolPower(recipe);
            if (toolPowerRequirement) {
                const powerRow = resourcesPanel.querySelector(
                    '[data-craft-tool-power="' + toolPowerRequirement.type + '"]'
                );
                if (powerRow) {
                    const toolDefinition = typeof ITEM_TOOL_POWER_TYPES !== "undefined"
                        ? ITEM_TOOL_POWER_TYPES[toolPowerRequirement.type]
                        : null;
                    const label = toolDefinition
                        ? toolDefinition.label
                        : toolPowerRequirement.type;
                    const currentPower = getCraftToolPower(toolPowerRequirement.type);
                    const requiredLabel = (toolPowerRequirement.exclusive ? ">" : "")
                        + toolPowerRequirement.power;
                    powerRow.innerText = label + ": " + round2(currentPower)
                        + " / " + requiredLabel;
                    powerRow.classList.toggle(
                        "missing",
                        !meetsCraftToolPower(toolPowerRequirement, currentPower)
                    );
                }
            }

            if (recipe.bonusChoiceSlotsFromCooking === true) {
                const bonusBox = resourcesPanel.querySelector(".craftchoice-bonus");
                const renderedSlots = bonusBox
                    ? bonusBox.querySelectorAll(".craftchoice-bonus-row").length
                    : 0;
                if (renderedSlots !== getCraftBonusChoices(recipe).length) {
                    renderCraftResources(category);
                }
            }

            // Station rows change with equipment and the tile (pot, water,
            // campfire), so refresh them every tick as well.
            const stationRequirements = getCraftStationRequirements(recipe);
            if (stationRequirements.length) {
                const stationRow = resourcesPanel.querySelector(
                    "[data-craft-station-group]"
                );
                const stationState = stationRequirements.map(function (requirement) {
                    return (requirement.short || requirement.label) + ":"
                        + (requirement.ok ? "1" : "0");
                }).join("|");
                if (!stationRow) {
                    renderCraftResources(category);
                } else if (stationRow.dataset.stationState !== stationState) {
                    stationRow.dataset.stationState = stationState;
                    stationRow.innerText = "Stations: "
                        + stationRequirements.map(function (requirement) {
                            return (requirement.short || requirement.label)
                                + " " + (requirement.ok ? "yes" : "no");
                        }).join(", ");
                    stationRow.classList.toggle(
                        "missing",
                        stationRequirements.some(function (requirement) {
                            return !requirement.ok;
                        })
                    );
                }
            }
        }

        const button = document.getElementById(category.id + "craftbutton");
        if (button) {
            button.disabled = !canCraftRecipe(recipe) || !hasFreeInventorySlot();
        }

        // Resource quality or skill level may have changed; refresh the
        // deterministic quality preview when it no longer matches.
        const detailsPanel = document.getElementById(category.id + "craftdetails");
        const quality = String(getCraftQualityInfo(recipe).quality);
        if (detailsPanel && detailsPanel.dataset.craftQuality !== quality) {
            renderCraftDetails(category);
        }
    });
}

// --- automatic food crafting ----------------------------------------------

function getAutoCookBonusSlotCount(recipe) {
    if (!recipe || recipe.bonusChoiceSlotsFromCooking !== true) return 0;
    return typeof getCookingBonusSlotCount === "function"
        ? getCookingBonusSlotCount()
        : 0;
}

function getAutoCookResourceSnapshot() {
    const remaining = Object.create(null);
    if (typeof resources === "undefined" || !resources) return remaining;

    Object.keys(resources).forEach(function (resourceId) {
        const stack = resources[resourceId];
        remaining[resourceId] = Math.max(0, Number(stack && stack.amount) || 0);
    });
    return remaining;
}

function pickAutoCookResource(candidates, amount, remaining, priorityStat) {
    const available = candidates.filter(function (resourceId) {
        return (remaining[resourceId] || 0) >= amount;
    });
    if (!available.length) return null;

    let pool = available;
    if (priorityStat && typeof getFoodStatBinding === "function") {
        const preferred = available.filter(function (resourceId) {
            return getFoodStatBinding(resourceId) === priorityStat;
        });
        if (preferred.length) pool = preferred;
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    remaining[chosen] = Math.max(0, (remaining[chosen] || 0) - amount);
    return chosen;
}

// DietBasics 4: random dish and no bonus ingredients.
// DietBasics 5: every cooking-granted bonus slot is filled when possible.
// DietBasics 6: main and bonus ingredients prefer the priority stat.
function buildAutoCookChoices(recipe, level, priorityStat) {
    // Recipes with several mandatory pick slots (salads) are left for manual
    // crafting: auto-cook only understands one flexible ingredient.
    if (getCraftChoiceSlots(recipe).length) return null;

    const choiceIds = getCraftChoiceResourceIds(recipe);
    const choiceAmount = Math.max(1, Number(recipe.choiceAmount) || 1);
    const bonusAmount = Math.max(1, Number(recipe.bonusChoiceAmount) || 1);
    const bonusCount = getAutoCookBonusSlotCount(recipe);
    const remaining = getAutoCookResourceSnapshot();
    const ingredientPriority = level >= 6 ? priorityStat : null;

    let choiceResourceId = null;
    if (choiceIds.length) {
        choiceResourceId = pickAutoCookResource(
            choiceIds,
            choiceAmount,
            remaining,
            ingredientPriority
        );
        if (choiceResourceId == null) return null;
    }

    const bonusResourceIds = [];
    for (let index = 0; index < bonusCount; index++) {
        if (level < 5 || !choiceIds.length) {
            bonusResourceIds.push(null);
            continue;
        }

        const bonusResourceId = pickAutoCookResource(
            choiceIds,
            bonusAmount,
            remaining,
            ingredientPriority
        );
        bonusResourceIds.push(bonusResourceId == null ? null : bonusResourceId);
    }

    return {
        choiceResourceId: choiceResourceId,
        bonusResourceIds: bonusResourceIds,
    };
}

function tryAutoCookRecipe(recipe, level, priorityStat) {
    const choices = buildAutoCookChoices(recipe, level, priorityStat);
    if (!choices) return false;

    const previousChoice = selectedCraftChoiceByRecipe[recipe.id];
    const previousBonusChoices = selectedCraftBonusChoicesByRecipe[recipe.id];

    if (choices.choiceResourceId != null) {
        selectedCraftChoiceByRecipe[recipe.id] = choices.choiceResourceId;
    } else {
        delete selectedCraftChoiceByRecipe[recipe.id];
    }
    selectedCraftBonusChoicesByRecipe[recipe.id] = choices.bonusResourceIds;

    let crafted = false;
    try {
        if (canCraftRecipe(recipe) && hasFreeInventorySlot()) {
            crafted = performCraft(recipe);
        }
    } finally {
        if (previousChoice === undefined) {
            delete selectedCraftChoiceByRecipe[recipe.id];
        } else {
            selectedCraftChoiceByRecipe[recipe.id] = previousChoice;
        }

        if (previousBonusChoices === undefined) {
            delete selectedCraftBonusChoicesByRecipe[recipe.id];
        } else {
            selectedCraftBonusChoicesByRecipe[recipe.id] = previousBonusChoices;
        }

        // Auto-cooking temporarily changes the ingredient selection, so put
        // the manual crafting UI back the way the player left it.
        if (crafted && typeof renderCraftPanels === "function") {
            renderCraftPanels();
        }
    }

    return crafted;
}

function autoCookDietFood() {
    if (typeof DIET_BASICS_TECHNOLOGY === "undefined"
        || DIET_BASICS_TECHNOLOGY.level < 4) {
        return false;
    }
    if (!hasFreeInventorySlot()) return false;

    const level = DIET_BASICS_TECHNOLOGY.level;
    const priorityStat = level >= 6 && typeof getDietPriorityStat === "function"
        ? getDietPriorityStat()
        : null;
    const recipes = getCraftRecipesByCategory("food").slice();

    // Random dish order, so future food recipes are picked randomly too.
    for (let index = recipes.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const temporary = recipes[index];
        recipes[index] = recipes[swapIndex];
        recipes[swapIndex] = temporary;
    }

    for (let index = 0; index < recipes.length; index++) {
        if (tryAutoCookRecipe(recipes[index], level, priorityStat)) {
            return true;
        }
    }
    return false;
}

// --- crafting action -------------------------------------------------------

function performCraft(recipe) {
    if (!recipe) return false;

    const resultName = getCraftResultName(recipe);

    if (!getCraftSkill(recipe)) {
        logMessage("You don't know how to craft " + resultName);
        return false;
    }

    const missingStation = getCraftStationRequirements(recipe).find(function (requirement) {
        return !requirement.ok;
    });
    if (missingStation) {
        logMessage(missingStation.message);
        return false;
    }

    if (!canAffordCraft(recipe)) {
        logMessage("Not enough resources to craft " + resultName);
        return false;
    }

    if (!hasFreeInventorySlot()) {
        logMessage("Your inventory is full, cannot craft " + resultName);
        return false;
    }

    const qualityInfo = getCraftQualityInfo(recipe);
    const rarity = rollCraftRarity(qualityInfo.rawQuality, qualityInfo.skillLevel);
    const choice = getSelectedCraftChoice(recipe);
    const potentialBonuses = getCraftPotentialBonuses(
        recipe,
        qualityInfo.quality,
        rarity
    );

    getCraftRequirements(recipe).forEach(function (requirement) {
        const stack = resources[requirement.resourceId];
        if (!stack) return;
        stack.amount = round2(Math.max(0, stack.amount - requirement.amount));
    });

    const item = createItemInstance(recipe.itemId, {
        quality: qualityInfo.quality,
        rarity: rarity,
        displayName: getCraftResultName(recipe),
        primaryStat: recipe.stat || null,
        sourceResourceId: choice,
        potentialBonuses: potentialBonuses,
    });
    addCraftedItem(item);

    const skill = getCraftSkill(recipe);
    const rarityMultiplier = getRarityMultiplier(rarity);
    const exp = round2(
        CRAFT_SKILL_EXP_MULTIPLIER * qualityInfo.quality * rarityMultiplier
    );
    skill.addexp(exp);

    // Rare and better crafts train Luck. The reward grows exponentially with
    // the rarity tier: Uncommon = 5^2, SomewhatRare = 5^3, and so on.
    const luckExp = getCraftLuckExpForRarity(rarity);
    if (luckExp > 0 && player.luck) player.luck.addexp(luckExp);

    const rarityLabel = getRarityLabel(rarity);
    const propertyCount = Array.isArray(item.properties) ? item.properties.length : 0;
    const propertySuffix = propertyCount > 0
        ? ", " + (propertyCount === 1 ? "1 property" : propertyCount + " properties")
        : "";
    const prefix = "You crafted ";
    const suffix = " (" + rarityLabel + ", quality " + qualityInfo.quality
        + propertySuffix + ")";

    logMessage(prefix + resultName + suffix, {
        html: highlightLogText(prefix)
            + '<span class="itemname rarity-' + rarity + '">'
            + escapeLogHtml(resultName)
            + "</span>"
            + highlightLogText(suffix),
    });

    if (typeof renderResources === "function") renderResources();
    if (typeof renderInventorySlots === "function") renderInventorySlots();

    renderCraftPanels();
    return true;
}

// --- category filters / bootstrap ------------------------------------------

function setActiveCraftCategory(categoryId) {
    CRAFT_CATEGORIES.forEach(function (category) {
        const place = document.getElementById(category.placeholderId);
        if (place) {
            place.style.display = category.id === categoryId ? "block" : "none";
        }

        const button = document.getElementById(category.buttonId);
        if (button) button.classList.toggle("active", category.id === categoryId);
    });
}

function getDefaultCraftCategoryId() {
    const withRecipes = CRAFT_CATEGORIES.find(function (category) {
        return getCraftRecipesByCategory(category.id).length > 0;
    });

    return (withRecipes || CRAFT_CATEGORIES[0]).id;
}

function initCraftInterface() {
    if (typeof ITEM_IDS === "undefined" || typeof RESOURCE_IDS === "undefined") {
        return;
    }

    renderCraftPanels();

    CRAFT_CATEGORIES.forEach(function (category) {
        const button = document.getElementById(category.buttonId);
        if (!button) return;

        button.onclick = function () {
            setActiveCraftCategory(category.id);
        };
    });

    setActiveCraftCategory(getDefaultCraftCategoryId());
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCraftInterface);
} else {
    initCraftInterface();
}
