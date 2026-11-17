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

// --- craft list grouping ---------------------------------------------------
// Recipes are shown in small named groups inside every craft tab instead of
// one flat list.
const CRAFT_GROUP_NAMES = Object.freeze({
    meals: "Meals",
    bread: "Bread & dough",
    pasta: "Raw pasta",
    sticks: "Sticks",
    knives: "Knives",
    hammers: "Hammers",
    axes: "Axes",
    pickaxes: "Pickaxes",
    shovels: "Shovels",
    spears: "Spears",
    "leaf-clothing": "Leaf clothing",
    containers: "Containers",
    cutlery: "Cutlery",
    pots: "Pots",
    pans: "Pans",
    sauces: "Sauces",
    italian: "Italian",
    soviet: "Soviet",
    pizza: "Pizza",
    asian: "Asian",
    arabic: "Arabic",
    other: "Other",
});

function getCraftRecipeGroupId(recipe) {
    if (recipe && typeof recipe.group === "string" && recipe.group) {
        return recipe.group;
    }
    return (recipe && CRAFT_RECIPE_GROUPS_BY_ID[recipe.id]) || "other";
}

function getCraftRecipeGroupName(groupId) {
    return CRAFT_GROUP_NAMES[groupId] || "Other";
}

// Craft tags describe what a dish is, not which section it lives in. They are
// deliberately independent from CRAFT_GROUP_NAMES so a pizza can also be a
// dessert and a soup can also be a meat dish.
const CRAFT_TAG_LABELS = Object.freeze({
    salad: "SaladType",
    soup: "SoupType",
    dessert: "Dessert",
    ingredient: "Ingredient dish",
    baking: "Baking",
    drinks: "Drinks",
    fried: "Fried",
    porridge: "Porridge",
    dumplings: "Dumplings",
    pasta: "Pasta dish",
    meat: "Meat dish",
    spicy: "Spicy",
    sweet: "Sweet",
    streetfood: "Street food",
    holiday: "Holiday",
    vegetarian: "Vegetarian",
});

const CRAFT_RECIPE_TAGS = Object.freeze({
    porridge: ["porridge"],
    salad: ["salad", "vegetarian"],
    "fruits-salad": ["salad", "dessert", "sweet", "vegetarian"],
    shawerma: ["meat"],
    soup: ["soup"],
    "flat-bread": ["baking", "ingredient"],
    dough: ["ingredient"],
    "sweet-dough": ["ingredient", "sweet"],
    bread: ["baking", "ingredient"],
    "toast-bread": ["baking", "ingredient"],
    "italian-spaghetti-aglio-e-olio": ["pasta", "vegetarian"],
    "italian-spaghetti-carbonara": ["pasta", "meat"],
    "italian-spaghetti-bolognese": ["pasta", "meat"],
    "italian-penne-arrabbiata": ["pasta", "spicy", "vegetarian"],
    "italian-linguine-pesto": ["pasta", "vegetarian"],
    "italian-rigatoni-marinara": ["pasta", "vegetarian"],
    "italian-fettuccine-alfredo": ["pasta", "vegetarian"],
    "italian-lasagne": ["pasta", "meat", "baking"],
    "italian-ravioli": ["pasta", "dumplings", "vegetarian"],
    "italian-tortellini": ["pasta", "dumplings", "meat"],
    "italian-macaroni-bake": ["pasta", "meat", "baking"],
    "italian-gnocchi": ["dumplings", "vegetarian"],
    "italian-risotto": ["porridge", "vegetarian"],
    "italian-polenta": ["porridge", "vegetarian"],
    "italian-bruschetta": ["baking", "vegetarian"],
    "italian-caprese": ["salad", "vegetarian"],
    "italian-panzanella": ["salad", "vegetarian"],
    "italian-arancini": ["fried", "streetfood", "vegetarian"],
    "italian-frittata": ["fried", "vegetarian"],
    "soviet-borscht": ["soup", "meat"],
    "soviet-shchi": ["soup", "vegetarian"],
    "soviet-rassolnik": ["soup", "meat"],
    "soviet-solyanka": ["soup", "meat"],
    "soviet-olivier": ["salad", "holiday"],
    "soviet-vinaigrette": ["salad", "vegetarian"],
    "soviet-pelmeni": ["dumplings", "meat"],
    "soviet-varenyky": ["dumplings", "vegetarian"],
    "soviet-stroganoff": ["meat"],
    "soviet-chicken-kiev": ["meat", "fried"],
    "soviet-golubtsy": ["meat"],
    "soviet-plov": ["meat"],
    "soviet-buckwheat-mushrooms": ["vegetarian"],
    "soviet-mashed-potatoes": ["vegetarian"],
    "soviet-fried-potatoes": ["fried", "vegetarian"],
    "soviet-draniki": ["fried", "vegetarian"],
    "soviet-millet-kasha": ["porridge", "vegetarian"],
    "soviet-oatmeal": ["porridge", "vegetarian"],
    "soviet-blini": ["fried"],
    "soviet-pirozhki": ["baking", "streetfood", "meat"],
    "soviet-belyash": ["fried", "streetfood", "meat"],
    "soviet-chebureki": ["fried", "streetfood", "meat"],
    "soviet-mushroom-soup": ["soup", "vegetarian"],
    "soviet-pea-soup": ["soup", "meat"],
    "soviet-makarony-flotski": ["pasta", "meat"],
    "soviet-tushonka": ["meat"],
    "soviet-kotleta": ["meat", "fried"],
    "soviet-beet-salad": ["salad", "vegetarian"],
    "soviet-carrot-salad": ["salad", "vegetarian"],
    "soviet-cabbage-salad": ["salad", "vegetarian"],
    "soviet-kompot": ["drinks", "sweet"],
    "soviet-kissel": ["drinks", "dessert", "sweet"],
    "soviet-baked-apples": ["dessert", "baking", "sweet"],
    "soviet-apple-charlotte": ["dessert", "baking", "sweet"],
    "soviet-napoleon-cake": ["dessert", "baking", "holiday", "sweet"],
    "soviet-honey-cake": ["dessert", "baking", "sweet"],
    "pizza-margherita": ["baking", "vegetarian"],
    "pizza-diavola": ["baking", "meat", "spicy"],
    "pizza-capricciosa": ["baking", "meat"],
    "pizza-quattro-stagioni": ["baking", "meat"],
    "pizza-funghi": ["baking", "vegetarian"],
    "pizza-pollo": ["baking", "meat"],
    "pizza-bbq-chicken": ["baking", "meat"],
    "pizza-pesto": ["baking", "vegetarian"],
    "pizza-marinara": ["baking", "vegetarian"],
    "pizza-napoletana": ["baking", "vegetarian"],
    "pizza-mediterranean": ["baking", "vegetarian"],
    "pizza-vegetariana": ["baking", "vegetarian"],
    "pizza-spinaci": ["baking", "vegetarian"],
    "pizza-patate": ["baking", "vegetarian"],
    "pizza-cipolla": ["baking", "vegetarian", "spicy"],
    "pizza-uovo": ["baking", "vegetarian"],
    "pizza-rustica": ["baking", "vegetarian"],
    "pizza-zucca": ["baking", "vegetarian"],
    "pizza-barbabietola": ["baking", "vegetarian"],
    "pizza-cavolo": ["baking", "vegetarian"],
    "pizza-piselli": ["baking", "vegetarian"],
    "pizza-mais": ["baking", "vegetarian"],
    "pizza-aglio-erbe": ["baking", "vegetarian"],
    "pizza-dolce": ["baking", "dessert", "sweet"],
    "pizza-frutti-bosco": ["baking", "dessert", "sweet"],
    "asian-ramen": ["soup", "meat", "pasta"],
    "asian-pad-thai": ["pasta", "meat", "fried"],
    "asian-fried-rice": ["fried", "vegetarian"],
    "asian-chicken-teriyaki": ["meat", "fried"],
    "asian-bulgogi": ["meat", "fried"],
    "asian-bibimbap": ["vegetarian"],
    "asian-gyoza": ["dumplings", "meat", "fried"],
    "asian-spring-rolls": ["fried", "streetfood", "vegetarian"],
    "asian-tempura": ["fried", "vegetarian"],
    "asian-chicken-katsu": ["meat", "fried"],
    "asian-japanese-curry": ["meat", "spicy"],
    "asian-kung-pao-chicken": ["meat", "spicy", "fried"],
    "asian-sweet-sour-chicken": ["meat", "fried"],
    "asian-chow-mein": ["pasta", "vegetarian", "fried"],
    "asian-nasi-goreng": ["meat", "fried", "spicy"],
    "asian-okonomiyaki": ["fried", "vegetarian"],
    "asian-yakitori": ["meat", "fried", "streetfood"],
    "asian-mapo-chicken": ["meat", "spicy", "fried"],
    "asian-char-siu-chicken": ["meat", "fried", "sweet"],
    "asian-wonton-soup": ["soup", "meat", "dumplings"],
    "asian-hot-sour-soup": ["soup", "spicy", "vegetarian"],
    "asian-egg-drop-soup": ["soup", "vegetarian"],
    "asian-sichuan-noodles": ["pasta", "spicy", "vegetarian"],
    "asian-steamed-dumplings": ["dumplings", "meat"],
    "asian-tom-yum-soup": ["soup", "spicy", "vegetarian"],
    "asian-thai-green-curry": ["meat", "spicy"],
    "asian-thai-red-curry": ["meat", "spicy"],
    "asian-massaman-curry": ["meat"],
    "asian-thai-basil-chicken": ["meat", "spicy", "fried"],
    "asian-coconut-rice": ["vegetarian"],
    "asian-mango-sticky-rice": ["dessert", "sweet", "vegetarian"],
    "asian-pho": ["soup", "meat", "pasta"],
    "asian-banh-mi": ["meat"],
    "asian-vietnamese-spring-rolls": ["fried", "meat", "streetfood"],
    "asian-bun-cha": ["meat", "pasta", "fried"],
    "asian-vietnamese-curry": ["meat"],
    "asian-sushi-rolls": ["pasta", "vegetarian"],
    "asian-nigiri-sushi": ["meat"],
    "arabic-falafel": ["fried", "vegetarian", "streetfood"],
    "arabic-hummus-plate": ["vegetarian"],
    "arabic-baba-ganoush": ["vegetarian"],
    "arabic-tabbouleh": ["salad", "vegetarian"],
    "arabic-fattoush": ["salad", "vegetarian"],
    "arabic-shish-tawook": ["meat", "fried"],
    "arabic-chicken-shawarma": ["meat", "streetfood"],
    "arabic-kofta": ["meat", "fried"],
    "arabic-kebab": ["meat", "fried"],
    "arabic-shawarma-plate": ["meat"],
    "arabic-mujadara": ["vegetarian"],
    "arabic-lentil-soup": ["soup", "vegetarian"],
    "arabic-chickpea-stew": ["vegetarian"],
    "arabic-chickpea-tagine": ["vegetarian"],
    "arabic-chicken-tagine": ["meat"],
    "arabic-stuffed-eggplant": ["vegetarian"],
    "arabic-stuffed-peppers": ["meat"],
    "arabic-maqluba": ["meat"],
    "arabic-kabsa": ["meat"],
    "arabic-mandi": ["meat"],
    "arabic-batata-harra": ["fried", "vegetarian", "spicy"],
    "arabic-fried-cauliflower": ["fried", "vegetarian"],
    "arabic-shakshuka": ["vegetarian"],
    "arabic-pomegranate-chicken": ["meat"],
    "arabic-muhammara": ["vegetarian"],
    "arabic-baklava": ["dessert", "baking", "sweet"],
    "arabic-basbousa": ["dessert", "baking", "sweet"],
    "arabic-halva": ["dessert", "sweet"],
});

function getCraftRecipeTags(recipe) {
    if (!recipe) return [];
    if (Array.isArray(recipe.tags)) return recipe.tags;
    if (CRAFT_RECIPE_TAGS[recipe.id]) return CRAFT_RECIPE_TAGS[recipe.id];
    if (recipe.group === "pasta") return ["ingredient"];
    if (recipe.group === "sauces") return ["ingredient"];
    if (recipe.group === "pizza") return ["baking"];
    return [];
}

function getCraftTagLabel(tagId) {
    return CRAFT_TAG_LABELS[tagId] || String(tagId || "");
}

// Crafting recipes ask the shared technology unlock table. A recipe without
// an entry is always available.
function isCraftRecipeUnlocked(recipe) {
    if (!recipe) return false;
    if (typeof isContentUnlocked !== "function") return true;
    return isContentUnlocked("craft", recipe.id);
}

const TOOL_RECIPE_GROUPS = Object.freeze({
    "handy-stick": "sticks",
    "flint-knife": "knives",
    "stone-hammer": "hammers",
    "stone-axe": "axes",
    "flint-pickaxe": "pickaxes",
    "flint-spear": "spears",
});

const METAL_TOOL_GROUPS = Object.freeze({
    knife: "knives",
    hammer: "hammers",
    axe: "axes",
    pickaxe: "pickaxes",
    shovel: "shovels",
    spear: "spears",
});

// Recipes defined as plain literals get their group here.
const CRAFT_RECIPE_GROUPS_BY_ID = Object.freeze({
    "kebob-on-stick": "meals",
    porridge: "meals",
    salad: "meals",
    "fruits-salad": "meals",
    shawerma: "meals",
    soup: "meals",
    "flat-bread": "bread",
    dough: "bread",
    "sweet-dough": "bread",
    bread: "bread",
    "toast-bread": "bread",
    "leaf-of-nature": "leaf-clothing",
    "pottery-clay-pot": "pots",
});

// Tools share the Tools category and the Survival skill. Resource costs are
// passed as [resourceId, amount] pairs so new tools stay one line each.
function createToolRecipe(id, itemId, resources) {
    return Object.freeze({
        id: id,
        category: "tools",
        itemId: itemId,
        skill: "survival",
        group: TOOL_RECIPE_GROUPS[id] || "other",
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
    const group = (id === "survival-pounch" || id === "straw-basket-backpack")
        ? "containers"
        : "leaf-clothing";

    return Object.freeze({
        id: "leaf-" + id,
        category: "common",
        itemId: itemId,
        skill: "tailoring",
        group: group,
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

// Every resource tagged as meat can go into shawerma.
const MEAT_RESOURCE_IDS = Object.freeze(
    Object.keys(RESOURCE_DEFS)
        .map(Number)
        .filter(function (resourceId) {
            const definition = RESOURCE_DEFS[resourceId];
            return !!definition && definition.meat === true;
        })
);

// Generated vegetable, crop and herb ids are deterministic, but they have no
// named constants. These aliases keep the sauce recipes readable.
const SAUCE_TOMATO_ID = 4003;
const SAUCE_ONION_ID = 4018;
const SAUCE_GARLIC_ID = 4019;
const SAUCE_CUCUMBER_ID = 4004;
const SAUCE_BELL_PEPPER_ID = 4024;
const SAUCE_GREEN_PEAS_ID = 4025;
const SAUCE_OREGANO_ID = 3002;
const SAUCE_WILD_BASIL_ID = 3003;
const SAUCE_MINT_ID = 3007;
const SAUCE_DILL_ID = 3046;
const SAUCE_CORIANDER_ID = 3047;
const SAUCE_CUMIN_ID = 3048;
const SAUCE_CHILI_ID = 3049;
const SAUCE_TURMERIC_ID = 3051;
const SAUCE_GINGER_ID = 3052;
const SAUCE_MUSTARD_ID = 3055;
const SAUCE_PAPRIKA_ID = 3059;
const SAUCE_PARSLEY_ROOT_ID = 4061;
const SAUCE_SESAME_ID = 4121;

const ITALIAN_RICE_ID = 4105;
const ITALIAN_POTATO_ID = 4002;
const ITALIAN_WHEAT_FLOUR_ID = getFlourResourceIdForSeed(4101);
const ITALIAN_MAIZE_FLOUR_ID = getFlourResourceIdForSeed(4110);

const SOVIET_CARROT_ID = 4001;
const SOVIET_POTATO_ID = 4002;
const SOVIET_CABBAGE_ID = 4008;
const SOVIET_BEETROOT_ID = 4017;
const SOVIET_CUCUMBER_ID = 4004;
const SOVIET_GREEN_PEAS_ID = 4025;
const SOVIET_OATS_ID = 4103;
const SOVIET_RICE_ID = 4105;
const SOVIET_MILLET_ID = 4106;
const SOVIET_BUCKWHEAT_ID = 4108;
const SOVIET_WHEAT_FLOUR_ID = getFlourResourceIdForSeed(4101);
const SOVIET_BERRY_IDS = Object.freeze([
    RESOURCE_IDS.BLUEBERRY,
    RESOURCE_IDS.RASPBERRY,
    RESOURCE_IDS.CORNBERRY,
    RESOURCE_IDS.STRAWBERRY,
    RESOURCE_IDS.HONEYSUCKLE,
    RESOURCE_IDS.SEABUCKTHORN,
    RESOURCE_IDS.BLACKBERRY,
    RESOURCE_IDS.LINGONBERRY,
    RESOURCE_IDS.CLOUDBERRY,
    RESOURCE_IDS.GOOSEBERRY,
    RESOURCE_IDS.ELDERBERRY,
    RESOURCE_IDS.CURRANT,
    RESOURCE_IDS.CRANBERRY,
    RESOURCE_IDS.MULBERRY,
    RESOURCE_IDS.ROWAN_BERRIES,
    RESOURCE_IDS.BIRD_CHERRIES,
    RESOURCE_IDS.SERVICEBERRIES,
]);

// Sauces are cold-mixed, so they only need ingredients and an oil of choice.
// The chosen oil carries its own potential bonus into the finished sauce.
function createSauceRecipe(id, itemId, resources, options) {
    const recipe = {
        id: "sauce-" + id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: "sauces",
        resultNameSuffix: "",
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    };

    const settings = options || {};
    if (settings.oil !== false) {
        recipe.choiceResourceIds = OIL_RESOURCE_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose oil:";
    }
    if (settings.itemId != null) {
        recipe.itemChoice = Object.freeze({
            itemId: settings.itemId,
            label: settings.itemLabel || "Choose ingredient:",
        });
    }
    if (settings.requiresWater === true) {
        recipe.requiresWater = true;
    }
    if (settings.station === "pot") {
        recipe.requiresEquippedSlot = "pot";
        recipe.requiresWater = true;
        recipe.requiresCampfire = true;
    } else if (settings.station === "pan") {
        recipe.requiresEquippedSlot = "pan";
        recipe.requiresCampfire = true;
    }

    return Object.freeze(recipe);
}

// Asian recipes need the soybean crop, which is generated by the plant table.
const ASIAN_SOYBEAN_ID = getPlantResourceId("Soybean");
const ASIAN_SALT_ID = RESOURCE_IDS.ROCKSALT;
const ARABIC_CHICKPEA_ID = getPlantResourceId("Chickpea");
const ARABIC_LENTIL_ID = getPlantResourceId("Lentil");

const SAUCE_RECIPES = Object.freeze([
    createSauceRecipe("mayonnaise", ITEM_IDS.MAYONNAISE, [
        [RESOURCE_IDS.EGG, 2], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("ketchup", ITEM_IDS.KETCHUP, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.SUGAR, 1], [RESOURCE_IDS.LEMONS, 1],
    ], { oil: false }),
    createSauceRecipe("mustard", ITEM_IDS.MUSTARD_SAUCE, [
        [SAUCE_MUSTARD_ID, 2], [RESOURCE_IDS.ROCKSALT, 1],
    ], { oil: false, requiresWater: true }),
    createSauceRecipe("pesto", ITEM_IDS.PESTO, [
        [SAUCE_WILD_BASIL_ID, 3], [RESOURCE_IDS.PINE_NUTS, 2], [SAUCE_GARLIC_ID, 1],
    ]),
    createSauceRecipe("carbonara", ITEM_IDS.CARBONARA_SAUCE, [
        [RESOURCE_IDS.EGG, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_GARLIC_ID, 1],
    ]),
    createSauceRecipe("aioli", ITEM_IDS.AIOLI, [
        [SAUCE_GARLIC_ID, 3], [RESOURCE_IDS.EGG, 1], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("tartar", ITEM_IDS.TARTAR_SAUCE, [
        [SAUCE_CUCUMBER_ID, 2], [SAUCE_DILL_ID, 2], [RESOURCE_IDS.LEMONS, 1],
    ], { itemId: ITEM_IDS.MAYONNAISE, itemLabel: "Choose mayonnaise:" }),
    createSauceRecipe("tzatziki", ITEM_IDS.TZATZIKI, [
        [SAUCE_CUCUMBER_ID, 2], [SAUCE_GARLIC_ID, 2], [SAUCE_MINT_ID, 1],
    ]),
    createSauceRecipe("marinara", ITEM_IDS.MARINARA_SAUCE, [
        [SAUCE_TOMATO_ID, 4], [SAUCE_GARLIC_ID, 2], [SAUCE_OREGANO_ID, 2],
    ]),
    createSauceRecipe("bolognese", ITEM_IDS.BOLOGNESE_SAUCE, [
        [SAUCE_TOMATO_ID, 4], [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_ONION_ID, 2],
    ]),
    createSauceRecipe("arrabbiata", ITEM_IDS.ARRABBIATA_SAUCE, [
        [SAUCE_TOMATO_ID, 4], [SAUCE_CHILI_ID, 2], [SAUCE_GARLIC_ID, 2],
    ]),
    createSauceRecipe("alfredo", ITEM_IDS.ALFREDO_SAUCE, [
        [SAUCE_GARLIC_ID, 3], [RESOURCE_IDS.EGG, 2], [SAUCE_WILD_BASIL_ID, 1],
    ]),
    createSauceRecipe("pesto-rosso", ITEM_IDS.PESTO_ROSSO, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.ALMONDS, 2], [SAUCE_GARLIC_ID, 1],
    ]),
    createSauceRecipe("salsa-verde", ITEM_IDS.SALSA_VERDE, [
        [SAUCE_WILD_BASIL_ID, 3], [SAUCE_GARLIC_ID, 2], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("chimichurri", ITEM_IDS.CHIMICHURRI, [
        [SAUCE_OREGANO_ID, 3], [SAUCE_PARSLEY_ROOT_ID, 3],
        [SAUCE_GARLIC_ID, 3], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("romesco", ITEM_IDS.ROMESCO, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.ALMONDS, 3], [SAUCE_GARLIC_ID, 2],
    ]),
    createSauceRecipe("tahini", ITEM_IDS.TAHINI, [
        [SAUCE_SESAME_ID, 4], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("hummus", ITEM_IDS.HUMMUS, [
        [SAUCE_GREEN_PEAS_ID, 4], [SAUCE_SESAME_ID, 3],
        [SAUCE_GARLIC_ID, 2], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("satay", ITEM_IDS.SATAY_SAUCE, [
        [RESOURCE_IDS.PINE_NUTS, 3], [SAUCE_CHILI_ID, 2], [RESOURCE_IDS.SUGAR, 1],
    ]),
    createSauceRecipe("teriyaki", ITEM_IDS.TERIYAKI_SAUCE, [
        [RESOURCE_IDS.SUGAR, 2], [SAUCE_GARLIC_ID, 2], [SAUCE_GINGER_ID, 1],
    ]),
    createSauceRecipe("sweet-chili", ITEM_IDS.SWEET_CHILI_SAUCE, [
        [SAUCE_CHILI_ID, 3], [RESOURCE_IDS.SUGAR, 2], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createSauceRecipe("bbq", ITEM_IDS.BBQ_SAUCE, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.SUGAR, 2], [SAUCE_PAPRIKA_ID, 1],
    ]),
    createSauceRecipe("honey-mustard", ITEM_IDS.HONEY_MUSTARD_SAUCE, [
        [SAUCE_MUSTARD_ID, 2], [RESOURCE_IDS.SUGAR, 2],
    ]),
    createSauceRecipe("garlic-herb", ITEM_IDS.GARLIC_HERB_SAUCE, [
        [SAUCE_GARLIC_ID, 3], [SAUCE_WILD_BASIL_ID, 2], [SAUCE_OREGANO_ID, 2],
    ]),
    createSauceRecipe("curry", ITEM_IDS.CURRY_SAUCE, [
        [SAUCE_TURMERIC_ID, 2], [SAUCE_CUMIN_ID, 2], [SAUCE_CORIANDER_ID, 2],
    ]),
    createSauceRecipe("mushroom", ITEM_IDS.MUSHROOM_SAUCE, [
        [RESOURCE_IDS.BUTTON_MUSHROOM, 3], [SAUCE_GARLIC_ID, 2],
    ]),
    createSauceRecipe("pepper", ITEM_IDS.PEPPER_SAUCE, [
        [SAUCE_BELL_PEPPER_ID, 3], [SAUCE_GARLIC_ID, 2],
    ]),
    createSauceRecipe("avocado", ITEM_IDS.AVOCADO_SAUCE, [
        [RESOURCE_IDS.AVOCADOS, 2], [RESOURCE_IDS.LEMONS, 1], [SAUCE_MINT_ID, 2],
    ]),
    createSauceRecipe("pomegranate", ITEM_IDS.POMEGRANATE_SAUCE, [
        [RESOURCE_IDS.POMEGRANATES, 3], [RESOURCE_IDS.SUGAR, 1], [RESOURCE_IDS.LEMONS, 1],
    ], { oil: false }),
    createSauceRecipe("apple", ITEM_IDS.APPLE_SAUCE, [
        [RESOURCE_IDS.APPLES, 3], [RESOURCE_IDS.SUGAR, 1], [RESOURCE_IDS.LEMONS, 1],
    ], { oil: false }),
]);

const ASIAN_SAUCE_RECIPES = Object.freeze([
    createSauceRecipe("soy-sauce", ITEM_IDS.SOY_SAUCE, [
        [ASIAN_SOYBEAN_ID, 3], [4101, 2], [ASIAN_SALT_ID, 1],
    ], { oil: false, station: "pot" }),
    createSauceRecipe("hoisin", ITEM_IDS.HOISIN_SAUCE, [
        [ASIAN_SOYBEAN_ID, 2], [RESOURCE_IDS.SUGAR, 2],
        [SAUCE_GARLIC_ID, 1], [SAUCE_CHILI_ID, 1], [ASIAN_SALT_ID, 1],
    ], { oil: false, station: "pot" }),
    createSauceRecipe("sriracha", ITEM_IDS.SRIRACHA, [
        [SAUCE_CHILI_ID, 3], [SAUCE_GARLIC_ID, 2],
        [RESOURCE_IDS.SUGAR, 1], [ASIAN_SALT_ID, 1],
    ], { oil: false, station: "pot" }),
    createSauceRecipe("gochujang-sauce", ITEM_IDS.GOCHUJANG_SAUCE, [
        [ASIAN_SOYBEAN_ID, 2], [SAUCE_CHILI_ID, 2], [RESOURCE_IDS.SUGAR, 1],
        [SAUCE_GARLIC_ID, 1], [ASIAN_SALT_ID, 1],
    ], { oil: false, station: "pot" }),
    createSauceRecipe("ponzu", ITEM_IDS.PONZU_SAUCE, [
        [RESOURCE_IDS.LEMONS, 1], [RESOURCE_IDS.BUTTON_MUSHROOM, 1],
    ], { oil: false, itemId: ITEM_IDS.SOY_SAUCE, itemLabel: "Choose soy sauce:" }),
    createSauceRecipe("plum-sauce", ITEM_IDS.PLUM_SAUCE, [
        [RESOURCE_IDS.PLUMS, 3], [RESOURCE_IDS.SUGAR, 2],
        [SAUCE_CHILI_ID, 1], [SAUCE_GARLIC_ID, 1],
    ], { oil: false, station: "pot" }),
    createSauceRecipe("korean-bbq", ITEM_IDS.KOREAN_BBQ_SAUCE, [
        [RESOURCE_IDS.SUGAR, 1], [SAUCE_GARLIC_ID, 1],
        [SAUCE_SESAME_ID, 1], [SAUCE_CHILI_ID, 1],
    ], { oil: false, itemId: ITEM_IDS.SOY_SAUCE, itemLabel: "Choose soy sauce:" }),
    createSauceRecipe("gyoza-sauce", ITEM_IDS.GYOZA_SAUCE, [
        [RESOURCE_IDS.LEMONS, 1], [SAUCE_CHILI_ID, 1], [SAUCE_GARLIC_ID, 1],
    ], { oil: false, itemId: ITEM_IDS.SOY_SAUCE, itemLabel: "Choose soy sauce:" }),
    createSauceRecipe("tempura-sauce", ITEM_IDS.TEMPURA_SAUCE, [
        [SAUCE_GINGER_ID, 1], [RESOURCE_IDS.SUGAR, 1],
    ], { oil: false, itemId: ITEM_IDS.SOY_SAUCE, itemLabel: "Choose soy sauce:" }),
    createSauceRecipe("bean-paste", ITEM_IDS.BEAN_PASTE, [
        [ASIAN_SOYBEAN_ID, 3], [4101, 2], [ASIAN_SALT_ID, 1],
    ], { oil: false, station: "pot" }),
]);

const ARABIC_SAUCE_RECIPES = Object.freeze([
    createSauceRecipe("harissa-sauce", ITEM_IDS.HARISSA_SAUCE, [
        [SAUCE_CHILI_ID, 3], [SAUCE_GARLIC_ID, 2],
        [SAUCE_CUMIN_ID, 1], [SAUCE_CORIANDER_ID, 1], [ASIAN_SALT_ID, 1],
    ]),
    createSauceRecipe("toum", ITEM_IDS.TOUM, [
        [SAUCE_GARLIC_ID, 4], [RESOURCE_IDS.LEMONS, 1], [ASIAN_SALT_ID, 1],
    ]),
    createSauceRecipe("amba", ITEM_IDS.AMBA, [
        [RESOURCE_IDS.MANGOES, 3], [RESOURCE_IDS.LEMONS, 1],
        [SAUCE_CHILI_ID, 1], [SAUCE_TURMERIC_ID, 1], [ASIAN_SALT_ID, 1],
    ], { oil: false }),
]);

// Italian dishes. Boiled pasta, rice and polenta need a pot, water and a
// campfire; pizza needs the fire; frittata needs a frying pan.
function createItalianDishRecipe(id, itemId, resources, options) {
    const settings = options || {};
    const recipe = {
        id: "italian-" + id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: "italian",
        resultNameSuffix: "",
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    };

    if (settings.oil !== false) {
        recipe.choiceResourceIds = OIL_RESOURCE_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose oil:";
    }
    if (settings.itemChoiceId != null) {
        recipe.itemChoice = Object.freeze({
            itemId: settings.itemChoiceId,
            label: settings.itemLabel || "Choose ingredient:",
        });
    }
    if (settings.stations === true) {
        recipe.requiresEquippedSlot = "pot";
        recipe.requiresWater = true;
        recipe.requiresCampfire = true;
    }
    if (settings.campfire === true) {
        recipe.requiresCampfire = true;
    }
    if (settings.pan === true) {
        recipe.requiresEquippedSlot = "pan";
        recipe.requiresCampfire = true;
    }

    return Object.freeze(recipe);
}

const ITALIAN_DISH_RECIPES = Object.freeze([
    createItalianDishRecipe("spaghetti-aglio-e-olio", ITEM_IDS.SPAGHETTI_AGLIO_E_OLIO, [
        [SAUCE_GARLIC_ID, 2], [SAUCE_CHILI_ID, 1],
    ], { itemChoiceId: ITEM_IDS.RAW_SPAGHETTI, itemLabel: "Choose spaghetti:", stations: true }),
    createItalianDishRecipe("spaghetti-carbonara", ITEM_IDS.SPAGHETTI_CARBONARA, [
        [RESOURCE_IDS.EGG, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_GARLIC_ID, 1],
    ], { itemChoiceId: ITEM_IDS.RAW_SPAGHETTI, itemLabel: "Choose spaghetti:", stations: true }),
    createItalianDishRecipe("spaghetti-bolognese", ITEM_IDS.SPAGHETTI_BOLOGNESE, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_ONION_ID, 1],
    ], { itemChoiceId: ITEM_IDS.RAW_SPAGHETTI, itemLabel: "Choose spaghetti:", stations: true }),
    createItalianDishRecipe("penne-arrabbiata", ITEM_IDS.PENNE_ARABBIATA, [
        [SAUCE_TOMATO_ID, 3], [SAUCE_CHILI_ID, 2], [SAUCE_GARLIC_ID, 2],
    ], { itemChoiceId: ITEM_IDS.PENNE, itemLabel: "Choose penne:", stations: true }),
    createItalianDishRecipe("linguine-pesto", ITEM_IDS.LINGUINE_PESTO, [
        [SAUCE_WILD_BASIL_ID, 3], [RESOURCE_IDS.PINE_NUTS, 2], [SAUCE_GARLIC_ID, 1],
    ], { itemChoiceId: ITEM_IDS.LINGUINE, itemLabel: "Choose linguine:", stations: true }),
    createItalianDishRecipe("rigatoni-marinara", ITEM_IDS.RIGATONI_MARINARA, [
        [SAUCE_TOMATO_ID, 4], [SAUCE_GARLIC_ID, 2], [SAUCE_OREGANO_ID, 1],
    ], { itemChoiceId: ITEM_IDS.RIGATONI, itemLabel: "Choose rigatoni:", stations: true }),
    createItalianDishRecipe("fettuccine-alfredo", ITEM_IDS.FETTUCCINE_ALFREDO, [
        [RESOURCE_IDS.EGG, 2], [SAUCE_GARLIC_ID, 2],
    ], { itemChoiceId: ITEM_IDS.FETTUCCINE, itemLabel: "Choose fettuccine:", stations: true }),
    createItalianDishRecipe("lasagne", ITEM_IDS.LASAGNE, [
        [SAUCE_TOMATO_ID, 4], [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_ONION_ID, 2],
    ], { itemChoiceId: ITEM_IDS.LASAGNE_SHEETS, itemLabel: "Choose lasagne sheets:", stations: true }),
    createItalianDishRecipe("ravioli", ITEM_IDS.RAVIOLI_DISH, [
        [RESOURCE_IDS.BUTTON_MUSHROOM, 3], [SAUCE_GARLIC_ID, 1], [SAUCE_OREGANO_ID, 1],
    ], { itemChoiceId: ITEM_IDS.RAVIOLI, itemLabel: "Choose ravioli:", stations: true }),
    createItalianDishRecipe("tortellini", ITEM_IDS.TORTELLINI_DISH, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [RESOURCE_IDS.EGG, 1], [SAUCE_GARLIC_ID, 1],
    ], { itemChoiceId: ITEM_IDS.TORTELLINI, itemLabel: "Choose tortellini:", stations: true }),
    createItalianDishRecipe("macaroni-bake", ITEM_IDS.MACARONI_BAKE, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_OREGANO_ID, 1],
    ], { itemChoiceId: ITEM_IDS.MACARONI, itemLabel: "Choose macaroni:", stations: true }),
    createItalianDishRecipe("gnocchi", ITEM_IDS.GNOCCHI, [
        [ITALIAN_POTATO_ID, 3], [ITALIAN_WHEAT_FLOUR_ID, 2], [RESOURCE_IDS.EGG, 1],
    ], { stations: true }),
    createItalianDishRecipe("risotto", ITEM_IDS.RISOTTO, [
        [ITALIAN_RICE_ID, 3], [RESOURCE_IDS.BUTTON_MUSHROOM, 2], [SAUCE_ONION_ID, 1],
    ], { stations: true }),
    createItalianDishRecipe("polenta", ITEM_IDS.POLENTA, [
        [ITALIAN_MAIZE_FLOUR_ID, 3],
    ], { stations: true }),
    createItalianDishRecipe("bruschetta", ITEM_IDS.BRUSCHETTA, [
        [SAUCE_TOMATO_ID, 2], [SAUCE_GARLIC_ID, 1],
    ], { itemChoiceId: ITEM_IDS.TOAST_BREAD, itemLabel: "Choose toast bread:" }),
    createItalianDishRecipe("caprese", ITEM_IDS.CAPRESE_SALAD, [
        [SAUCE_TOMATO_ID, 3], [SAUCE_WILD_BASIL_ID, 3],
    ]),
    createItalianDishRecipe("panzanella", ITEM_IDS.PANZANELLA, [
        [SAUCE_TOMATO_ID, 2], [SAUCE_CUCUMBER_ID, 1], [SAUCE_WILD_BASIL_ID, 1],
    ], { itemChoiceId: ITEM_IDS.BREAD, itemLabel: "Choose bread:" }),
    createItalianDishRecipe("arancini", ITEM_IDS.ARANCINI, [
        [ITALIAN_RICE_ID, 2], [RESOURCE_IDS.EGG, 1],
    ], { itemChoiceId: ITEM_IDS.BREAD, itemLabel: "Choose bread for crumbs:", stations: true }),
    createItalianDishRecipe("frittata", ITEM_IDS.FRITTATA, [
        [RESOURCE_IDS.EGG, 3], [SAUCE_BELL_PEPPER_ID, 1], [SAUCE_ONION_ID, 1],
    ], { pan: true }),
]);

// Soviet dishes. Pot dishes need a pot, water and a campfire; pan dishes need
// a frying pan and fire; baked desserts only need the campfire. No recipe uses
// milk, kefir or any other dairy product.
function createSovietDishRecipe(id, itemId, resources, options) {
    const settings = options || {};
    const recipe = {
        id: "soviet-" + id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: "soviet",
        resultNameSuffix: "",
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    };

    if (settings.oil !== false) {
        recipe.choiceResourceIds = OIL_RESOURCE_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose oil:";
    }
    if (settings.berries === true) {
        recipe.choiceResourceIds = SOVIET_BERRY_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose berries:";
    }
    if (settings.itemChoiceId != null) {
        recipe.itemChoice = Object.freeze({
            itemId: settings.itemChoiceId,
            label: settings.itemLabel || "Choose ingredient:",
        });
    }
    if (Array.isArray(settings.itemChoiceIds) && settings.itemChoiceIds.length) {
        recipe.itemChoice = Object.freeze({
            itemIds: Object.freeze(settings.itemChoiceIds.slice()),
            label: settings.itemLabel || "Choose ingredient:",
        });
    }
    if (settings.station === "pot") {
        recipe.requiresEquippedSlot = "pot";
        recipe.requiresWater = true;
        recipe.requiresCampfire = true;
    } else if (settings.station === "pan") {
        recipe.requiresEquippedSlot = "pan";
        recipe.requiresCampfire = true;
    } else if (settings.station === "campfire") {
        recipe.requiresCampfire = true;
    }

    return Object.freeze(recipe);
}

const SOVIET_DISH_RECIPES = Object.freeze([
    createSovietDishRecipe("borscht", ITEM_IDS.BORSCHT, [
        [SOVIET_BEETROOT_ID, 3], [SOVIET_CABBAGE_ID, 2], [SOVIET_POTATO_ID, 2],
        [SOVIET_CARROT_ID, 1], [SAUCE_ONION_ID, 1], [SAUCE_TOMATO_ID, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("shchi", ITEM_IDS.SHCHI, [
        [SOVIET_CABBAGE_ID, 3], [SOVIET_POTATO_ID, 2], [SOVIET_CARROT_ID, 1],
        [SAUCE_ONION_ID, 1], [SAUCE_DILL_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("rassolnik", ITEM_IDS.RASSOLNIK, [
        [SOVIET_POTATO_ID, 2], [SOVIET_CARROT_ID, 1], [SAUCE_ONION_ID, 1],
        [SOVIET_CUCUMBER_ID, 2], [RESOURCE_IDS.CHICKEN_MEAT, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("solyanka", ITEM_IDS.SOLYANKA, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SOVIET_CABBAGE_ID, 2],
        [SAUCE_TOMATO_ID, 2], [SAUCE_ONION_ID, 1], [SOVIET_CUCUMBER_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("olivier", ITEM_IDS.OLIVIER_SALAD, [
        [SOVIET_POTATO_ID, 2], [SOVIET_CARROT_ID, 1], [RESOURCE_IDS.EGG, 2],
        [SOVIET_CUCUMBER_ID, 1], [SOVIET_GREEN_PEAS_ID, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 1],
    ], { itemChoiceId: ITEM_IDS.MAYONNAISE, itemLabel: "Choose mayonnaise:" }),
    createSovietDishRecipe("vinaigrette", ITEM_IDS.VINAIGRETTE, [
        [SOVIET_BEETROOT_ID, 2], [SOVIET_POTATO_ID, 1], [SOVIET_CARROT_ID, 1],
        [SOVIET_CUCUMBER_ID, 1], [SAUCE_ONION_ID, 1],
    ]),
    createSovietDishRecipe("pelmeni", ITEM_IDS.PELMENI, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.EGG, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("varenyky", ITEM_IDS.VARENYKY, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [SOVIET_POTATO_ID, 2],
        [SAUCE_ONION_ID, 1], [RESOURCE_IDS.EGG, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("stroganoff", ITEM_IDS.BEEF_STROGANOFF, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_ONION_ID, 1],
        [SAUCE_TOMATO_ID, 1], [SOVIET_WHEAT_FLOUR_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("chicken-kiev", ITEM_IDS.CHICKEN_KIEV, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [RESOURCE_IDS.EGG, 1],
        [SOVIET_WHEAT_FLOUR_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("golubtsy", ITEM_IDS.GOLUBTSY, [
        [SOVIET_CABBAGE_ID, 3], [SOVIET_RICE_ID, 2],
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_TOMATO_ID, 1],
        [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("plov", ITEM_IDS.PLOV, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SOVIET_CARROT_ID, 2], [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("buckwheat-mushrooms", ITEM_IDS.BUCKWHEAT_MUSHROOMS, [
        [SOVIET_BUCKWHEAT_ID, 3], [RESOURCE_IDS.BUTTON_MUSHROOM, 2],
        [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("mashed-potatoes", ITEM_IDS.MASHED_POTATOES, [
        [SOVIET_POTATO_ID, 4],
    ], { station: "pot" }),
    createSovietDishRecipe("fried-potatoes", ITEM_IDS.FRIED_POTATOES, [
        [SOVIET_POTATO_ID, 4], [SAUCE_ONION_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("draniki", ITEM_IDS.DRANIKI, [
        [SOVIET_POTATO_ID, 4], [SOVIET_WHEAT_FLOUR_ID, 1], [RESOURCE_IDS.EGG, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("millet-kasha", ITEM_IDS.MILLET_KASHA, [
        [SOVIET_MILLET_ID, 3],
    ], { station: "pot" }),
    createSovietDishRecipe("oatmeal", ITEM_IDS.OATMEAL, [
        [SOVIET_OATS_ID, 3],
    ], { station: "pot" }),
    createSovietDishRecipe("blini", ITEM_IDS.BLINI, [
        [SOVIET_WHEAT_FLOUR_ID, 2], [RESOURCE_IDS.EGG, 2],
    ], { station: "pan" }),
    createSovietDishRecipe("pirozhki", ITEM_IDS.PIROZHKI, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.EGG, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 1], [SAUCE_ONION_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("belyash", ITEM_IDS.BELYASH, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SAUCE_ONION_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("chebureki", ITEM_IDS.CHEBUREKI, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SAUCE_ONION_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("mushroom-soup", ITEM_IDS.MUSHROOM_SOUP, [
        [RESOURCE_IDS.BUTTON_MUSHROOM, 3], [SOVIET_POTATO_ID, 2],
        [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("pea-soup", ITEM_IDS.PEA_SOUP, [
        [SOVIET_GREEN_PEAS_ID, 3], [SOVIET_POTATO_ID, 2],
        [SAUCE_ONION_ID, 1], [RESOURCE_IDS.CHICKEN_MEAT, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("makarony-flotski", ITEM_IDS.MAKARONY_FLOTSKI, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_ONION_ID, 1],
    ], { itemChoiceIds: PASTA_ITEM_DEFINITIONS.map(function (pasta) { return pasta.id; }), itemLabel: "Choose pasta:", station: "pan" }),
    createSovietDishRecipe("tushonka", ITEM_IDS.TUSHONKA, [
        [RESOURCE_IDS.CHICKEN_MEAT, 4], [SAUCE_ONION_ID, 1],
        [SAUCE_TOMATO_ID, 1],
    ], { station: "pot" }),
    createSovietDishRecipe("kotleta", ITEM_IDS.KOTLETA, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [RESOURCE_IDS.EGG, 1],
        [SOVIET_WHEAT_FLOUR_ID, 1], [SAUCE_ONION_ID, 1],
    ], { station: "pan" }),
    createSovietDishRecipe("beet-salad", ITEM_IDS.BEET_SALAD, [
        [SOVIET_BEETROOT_ID, 3], [SAUCE_GARLIC_ID, 1],
    ]),
    createSovietDishRecipe("carrot-salad", ITEM_IDS.CARROT_SALAD, [
        [SOVIET_CARROT_ID, 4], [SAUCE_GARLIC_ID, 1],
    ]),
    createSovietDishRecipe("cabbage-salad", ITEM_IDS.CABBAGE_SALAD, [
        [SOVIET_CABBAGE_ID, 4], [SOVIET_CARROT_ID, 1],
    ]),
    createSovietDishRecipe("kompot", ITEM_IDS.KOMPOT, [
        [RESOURCE_IDS.JELLY, 1], [RESOURCE_IDS.SUGAR, 1],
    ], { oil: false, berries: true, station: "pot" }),
    createSovietDishRecipe("kissel", ITEM_IDS.KISSEL, [
        [RESOURCE_IDS.JELLY, 2], [RESOURCE_IDS.SUGAR, 1],
    ], { oil: false, berries: true, station: "pot" }),
    createSovietDishRecipe("baked-apples", ITEM_IDS.BAKED_APPLES, [
        [RESOURCE_IDS.APPLES, 3], [RESOURCE_IDS.SUGAR, 1],
    ], { station: "campfire" }),
    createSovietDishRecipe("apple-charlotte", ITEM_IDS.APPLE_CHARLOTTE, [
        [RESOURCE_IDS.APPLES, 3], [SOVIET_WHEAT_FLOUR_ID, 2],
        [RESOURCE_IDS.EGG, 2], [RESOURCE_IDS.SUGAR, 2],
    ], { station: "campfire" }),
    createSovietDishRecipe("napoleon-cake", ITEM_IDS.NAPOLEON_CAKE, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.EGG, 3],
        [RESOURCE_IDS.SUGAR, 2],
    ], { station: "campfire" }),
    createSovietDishRecipe("honey-cake", ITEM_IDS.HONEY_CAKE, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.EGG, 2],
        [RESOURCE_IDS.SUGAR, 3],
    ], { station: "campfire" }),
]);

// Pizzas all share a flat bread base, a chosen oil and a campfire. The
// toppings are the only difference, which keeps the section easy to extend.
function createPizzaRecipe(id, itemId, resources, options) {
    const settings = options || {};
    const recipe = {
        id: "pizza-" + id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: "pizza",
        resultNameSuffix: "",
        requiresCampfire: true,
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
        itemChoice: Object.freeze({
            itemId: ITEM_IDS.FLAT_BREAD,
            label: "Choose flat bread:",
        }),
    };

    if (settings.berries === true) {
        recipe.choiceResourceIds = SOVIET_BERRY_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose berries:";
    } else {
        recipe.choiceResourceIds = OIL_RESOURCE_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose oil:";
    }

    return Object.freeze(recipe);
}

const PIZZA_RECIPES = Object.freeze([
    createPizzaRecipe("margherita", ITEM_IDS.PIZZA_MARGHERITA, [
        [SAUCE_TOMATO_ID, 2], [SAUCE_OREGANO_ID, 1],
    ]),    createPizzaRecipe("diavola", ITEM_IDS.PIZZA_DIAVOLA, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_CHILI_ID, 2],
    ]),
    createPizzaRecipe("capricciosa", ITEM_IDS.PIZZA_CAPRICCIOSA, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.BUTTON_MUSHROOM, 2],
        [RESOURCE_IDS.CHICKEN_MEAT, 1], [SAUCE_BELL_PEPPER_ID, 1],
        [RESOURCE_IDS.OLIVES, 1],
    ]),
    createPizzaRecipe("quattro-stagioni", ITEM_IDS.PIZZA_QUATTRO_STAGIONI, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.BUTTON_MUSHROOM, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 1], [SAUCE_BELL_PEPPER_ID, 1],
        [RESOURCE_IDS.OLIVES, 1],
    ]),
    createPizzaRecipe("funghi", ITEM_IDS.PIZZA_FUNGHI, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.BUTTON_MUSHROOM, 3],
        [SAUCE_OREGANO_ID, 1],
    ]),
    createPizzaRecipe("pollo", ITEM_IDS.PIZZA_POLLO, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SAUCE_ONION_ID, 2],
    ]),
    createPizzaRecipe("bbq-chicken", ITEM_IDS.PIZZA_BBQ_CHICKEN, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [RESOURCE_IDS.SUGAR, 1], [SAUCE_PAPRIKA_ID, 1],
    ]),
    createPizzaRecipe("pesto", ITEM_IDS.PIZZA_PESTO, [
        [SAUCE_TOMATO_ID, 1], [SAUCE_WILD_BASIL_ID, 3],
        [RESOURCE_IDS.PINE_NUTS, 2], [SAUCE_GARLIC_ID, 1],
    ]),
    createPizzaRecipe("marinara", ITEM_IDS.PIZZA_MARINARA, [
        [SAUCE_TOMATO_ID, 3], [SAUCE_GARLIC_ID, 2], [SAUCE_OREGANO_ID, 2],
    ]),
    createPizzaRecipe("napoletana", ITEM_IDS.PIZZA_NAPOLETANA, [
        [SAUCE_TOMATO_ID, 2], [SAUCE_GARLIC_ID, 2], [SAUCE_OREGANO_ID, 1],
    ]),
    createPizzaRecipe("mediterranean", ITEM_IDS.PIZZA_MEDITERRANEAN, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.OLIVES, 2],
        [SAUCE_ONION_ID, 1], [SAUCE_OREGANO_ID, 1],
    ]),
    createPizzaRecipe("vegetariana", ITEM_IDS.PIZZA_VEGETARIANA, [
        [SAUCE_TOMATO_ID, 2], [4006, 2], [SAUCE_BELL_PEPPER_ID, 1],
        [SAUCE_ONION_ID, 1],
    ]),
    createPizzaRecipe("spinaci", ITEM_IDS.PIZZA_SPINACI, [
        [SAUCE_TOMATO_ID, 2], [4013, 3],
        [RESOURCE_IDS.BUTTON_MUSHROOM, 2], [SAUCE_GARLIC_ID, 1],
    ]),
    createPizzaRecipe("patate", ITEM_IDS.PIZZA_PATATE, [
        [SOVIET_POTATO_ID, 3], [3006, 2],
    ]),
    createPizzaRecipe("cipolla", ITEM_IDS.PIZZA_CIPOLLA, [
        [SAUCE_TOMATO_ID, 2], [SAUCE_ONION_ID, 3], [SAUCE_CHILI_ID, 1],
    ]),
    createPizzaRecipe("uovo", ITEM_IDS.PIZZA_UOVO, [
        [SAUCE_TOMATO_ID, 2], [RESOURCE_IDS.EGG, 2], [SAUCE_ONION_ID, 1],
    ]),
    createPizzaRecipe("rustica", ITEM_IDS.PIZZA_RUSTICA, [
        [SAUCE_TOMATO_ID, 2], [4023, 2], [SAUCE_BELL_PEPPER_ID, 1],
    ]),
    createPizzaRecipe("zucca", ITEM_IDS.PIZZA_ZUCCA, [
        [4005, 3], [3005, 2],
    ]),
    createPizzaRecipe("barbabietola", ITEM_IDS.PIZZA_BARBABIETOLA, [
        [SAUCE_TOMATO_ID, 2], [SOVIET_BEETROOT_ID, 3], [SAUCE_GARLIC_ID, 1],
    ]),
    createPizzaRecipe("cavolo", ITEM_IDS.PIZZA_CAVOLO, [
        [SAUCE_TOMATO_ID, 2], [SOVIET_CABBAGE_ID, 3], [SAUCE_ONION_ID, 1],
    ]),
    createPizzaRecipe("piselli", ITEM_IDS.PIZZA_PISELLI, [
        [SAUCE_TOMATO_ID, 2], [SOVIET_GREEN_PEAS_ID, 3], [SAUCE_ONION_ID, 1],
    ]),
    createPizzaRecipe("mais", ITEM_IDS.PIZZA_MAIS, [
        [SAUCE_TOMATO_ID, 2], [4110, 3], [SAUCE_BELL_PEPPER_ID, 1],
    ]),
    createPizzaRecipe("aglio-erbe", ITEM_IDS.PIZZA_AGLIO_ERBE, [
        [SAUCE_TOMATO_ID, 2], [SAUCE_GARLIC_ID, 3],
        [SAUCE_WILD_BASIL_ID, 2], [SAUCE_OREGANO_ID, 1],
    ]),
    createPizzaRecipe("dolce", ITEM_IDS.PIZZA_DOLCE, [
        [RESOURCE_IDS.APPLES, 3], [RESOURCE_IDS.SUGAR, 2],
    ]),
    createPizzaRecipe("frutti-bosco", ITEM_IDS.PIZZA_FRUTTI_BOSCO, [
        [RESOURCE_IDS.SUGAR, 2],
    ], { berries: true }),
]);

// Asian dishes. Noodle dishes take a raw pasta/noodle item, rice dishes use
// the rice resource, and soybean savour stands in for soy sauce in the base
// recipe so each dish only needs one inventory item slot.
function createAsianDishRecipe(id, itemId, resources, options) {
    const settings = options || {};
    const recipe = {
        id: "asian-" + id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: "asian",
        resultNameSuffix: "",
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    };

    if (settings.oil !== false) {
        recipe.choiceResourceIds = OIL_RESOURCE_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose oil:";
    }
    if (settings.itemChoiceId != null) {
        recipe.itemChoice = Object.freeze({
            itemId: settings.itemChoiceId,
            label: settings.itemLabel || "Choose ingredient:",
        });
    }
    if (settings.station === "pot") {
        recipe.requiresEquippedSlot = "pot";
        recipe.requiresWater = true;
        recipe.requiresCampfire = true;
    } else if (settings.station === "pan") {
        recipe.requiresEquippedSlot = "pan";
        recipe.requiresCampfire = true;
    } else if (settings.station === "campfire") {
        recipe.requiresCampfire = true;
    }

    return Object.freeze(recipe);
}

const ASIAN_DISH_RECIPES = Object.freeze([
    createAsianDishRecipe("ramen", ITEM_IDS.RAMEN, [
        [RESOURCE_IDS.EGG, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SAUCE_ONION_ID, 1], [ASIAN_SOYBEAN_ID, 2],
    ], { itemChoiceId: ITEM_IDS.NOODLES, itemLabel: "Choose noodles:", station: "pot" }),
    createAsianDishRecipe("pad-thai", ITEM_IDS.PAD_THAI, [
        [RESOURCE_IDS.EGG, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [RESOURCE_IDS.LEMONS, 1], [RESOURCE_IDS.SUGAR, 1],
        [ASIAN_SOYBEAN_ID, 1],
    ], { itemChoiceId: ITEM_IDS.NOODLES, itemLabel: "Choose noodles:", station: "pan" }),
    createAsianDishRecipe("fried-rice", ITEM_IDS.FRIED_RICE, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.EGG, 2],
        [SOVIET_GREEN_PEAS_ID, 2], [SOVIET_CARROT_ID, 1],
        [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("chicken-teriyaki", ITEM_IDS.CHICKEN_TERIYAKI, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [ASIAN_SOYBEAN_ID, 1],
        [RESOURCE_IDS.SUGAR, 1], [SAUCE_GINGER_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("bulgogi", ITEM_IDS.BULGOGI, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [ASIAN_SOYBEAN_ID, 1],
        [RESOURCE_IDS.SUGAR, 1], [SAUCE_GARLIC_ID, 2], [SAUCE_SESAME_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("bibimbap", ITEM_IDS.BIBIMBAP, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.EGG, 1],
        [SOVIET_CARROT_ID, 1], [4013, 2], [ASIAN_SOYBEAN_ID, 1],
        [SAUCE_SESAME_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("gyoza", ITEM_IDS.GYOZA, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SOVIET_CABBAGE_ID, 2], [SAUCE_GARLIC_ID, 1], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("spring-rolls", ITEM_IDS.SPRING_ROLLS, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [SOVIET_CABBAGE_ID, 2],
        [SOVIET_CARROT_ID, 2], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("tempura", ITEM_IDS.TEMPURA, [
        [SOVIET_WHEAT_FLOUR_ID, 2], [RESOURCE_IDS.EGG, 1],
        [SAUCE_BELL_PEPPER_ID, 1], [4006, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("chicken-katsu", ITEM_IDS.CHICKEN_KATSU, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SOVIET_WHEAT_FLOUR_ID, 2],
        [RESOURCE_IDS.EGG, 2],
    ], { station: "pan" }),
    createAsianDishRecipe("japanese-curry", ITEM_IDS.JAPANESE_CURRY, [
        [SOVIET_RICE_ID, 3], [getSpiceResourceId("curry-powder"), 1],
        [SOVIET_POTATO_ID, 2], [SOVIET_CARROT_ID, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 2],
    ], { station: "pot" }),
    createAsianDishRecipe("kung-pao-chicken", ITEM_IDS.KUNG_PAO_CHICKEN, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_CHILI_ID, 2],
        [RESOURCE_IDS.PINE_NUTS, 2], [ASIAN_SOYBEAN_ID, 1],
        [RESOURCE_IDS.SUGAR, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("sweet-sour-chicken", ITEM_IDS.SWEET_SOUR_CHICKEN, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [RESOURCE_IDS.SUGAR, 2],
        [RESOURCE_IDS.LEMONS, 1], [SAUCE_BELL_PEPPER_ID, 1],
        [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("chow-mein", ITEM_IDS.CHOW_MEIN, [
        [SOVIET_CABBAGE_ID, 2], [SOVIET_CARROT_ID, 1],
        [ASIAN_SOYBEAN_ID, 1],
    ], { itemChoiceId: ITEM_IDS.NOODLES, itemLabel: "Choose noodles:", station: "pan" }),
    createAsianDishRecipe("nasi-goreng", ITEM_IDS.NASI_GORENG, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.EGG, 1],
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_CHILI_ID, 1],
        [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("okonomiyaki", ITEM_IDS.OKONOMIYAKI, [
        [SOVIET_CABBAGE_ID, 3], [SOVIET_WHEAT_FLOUR_ID, 2],
        [RESOURCE_IDS.EGG, 2], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("yakitori", ITEM_IDS.YAKITORI, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [ASIAN_SOYBEAN_ID, 1],
        [RESOURCE_IDS.SUGAR, 1], [SAUCE_GARLIC_ID, 1],
        [RESOURCE_IDS.STICKS, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("mapo-chicken", ITEM_IDS.MAPO_CHICKEN, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_CHILI_ID, 2],
        [SAUCE_GARLIC_ID, 2],
    ], { itemChoiceId: ITEM_IDS.BEAN_PASTE, itemLabel: "Choose bean paste:", station: "pan" }),
    createAsianDishRecipe("char-siu-chicken", ITEM_IDS.CHAR_SIU_CHICKEN, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [RESOURCE_IDS.SUGAR, 2],
        [SAUCE_GARLIC_ID, 1], [SAUCE_SESAME_ID, 1],
    ], { itemChoiceId: ITEM_IDS.BEAN_PASTE, itemLabel: "Choose bean paste:", station: "pan" }),
    createAsianDishRecipe("wonton-soup", ITEM_IDS.WONTON_SOUP, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SAUCE_ONION_ID, 1], [RESOURCE_IDS.EGG, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("hot-sour-soup", ITEM_IDS.HOT_SOUR_SOUP, [
        [RESOURCE_IDS.BUTTON_MUSHROOM, 2], [RESOURCE_IDS.EGG, 2],
        [SAUCE_CHILI_ID, 1], [RESOURCE_IDS.LEMONS, 1], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("egg-drop-soup", ITEM_IDS.EGG_DROP_SOUP, [
        [RESOURCE_IDS.EGG, 2], [ASIAN_SOYBEAN_ID, 1],
        [SAUCE_ONION_ID, 1], [ASIAN_SALT_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("sichuan-noodles", ITEM_IDS.SICHUAN_NOODLES, [
        [SAUCE_CHILI_ID, 2], [SAUCE_GARLIC_ID, 2], [ASIAN_SOYBEAN_ID, 1],
    ], { itemChoiceId: ITEM_IDS.NOODLES, itemLabel: "Choose noodles:", station: "pan" }),
    createAsianDishRecipe("steamed-dumplings", ITEM_IDS.STEAMED_DUMPLINGS, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SOVIET_CABBAGE_ID, 2], [SAUCE_GARLIC_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("tom-yum-soup", ITEM_IDS.TOM_YUM_SOUP, [
        [RESOURCE_IDS.BUTTON_MUSHROOM, 2], [SAUCE_CHILI_ID, 2],
        [RESOURCE_IDS.LEMONS, 1], [SAUCE_GINGER_ID, 1], [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("thai-green-curry", ITEM_IDS.THAI_GREEN_CURRY, [
        [RESOURCE_IDS.COCONUTS, 1], [SAUCE_WILD_BASIL_ID, 2],
        [SAUCE_CHILI_ID, 2], [RESOURCE_IDS.CHICKEN_MEAT, 2],
    ], { station: "pot" }),
    createAsianDishRecipe("thai-red-curry", ITEM_IDS.THAI_RED_CURRY, [
        [RESOURCE_IDS.COCONUTS, 1], [SAUCE_CHILI_ID, 2],
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_GINGER_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("massaman-curry", ITEM_IDS.MASSAMAN_CURRY, [
        [RESOURCE_IDS.COCONUTS, 1], [SOVIET_POTATO_ID, 2],
        [getSpiceResourceId("curry-powder"), 1], [RESOURCE_IDS.CHICKEN_MEAT, 2],
    ], { station: "pot" }),
    createAsianDishRecipe("thai-basil-chicken", ITEM_IDS.THAI_BASIL_CHICKEN, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_WILD_BASIL_ID, 2],
        [SAUCE_CHILI_ID, 2], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pan" }),
    createAsianDishRecipe("coconut-rice", ITEM_IDS.COCONUT_RICE, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.COCONUTS, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("mango-sticky-rice", ITEM_IDS.MANGO_STICKY_RICE, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.MANGOES, 2],
        [RESOURCE_IDS.COCONUTS, 1], [RESOURCE_IDS.SUGAR, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("pho", ITEM_IDS.PHO, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_ONION_ID, 1],
        [SAUCE_GINGER_ID, 1], [SAUCE_WILD_BASIL_ID, 1],
    ], { itemChoiceId: ITEM_IDS.NOODLES, itemLabel: "Choose noodles:", station: "pot" }),
    createAsianDishRecipe("banh-mi", ITEM_IDS.BANH_MI, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SOVIET_CUCUMBER_ID, 1],
        [SOVIET_CARROT_ID, 1], [SAUCE_CHILI_ID, 1],
    ], { itemChoiceId: ITEM_IDS.BREAD, itemLabel: "Choose bread:" }),
    createAsianDishRecipe("vietnamese-spring-rolls", ITEM_IDS.VIETNAMESE_SPRING_ROLLS, [
        [SOVIET_WHEAT_FLOUR_ID, 3], [SOVIET_CABBAGE_ID, 2],
        [SOVIET_CARROT_ID, 1], [RESOURCE_IDS.CHICKEN_MEAT, 2],
    ], { station: "pan" }),
    createAsianDishRecipe("bun-cha", ITEM_IDS.BUN_CHA, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_WILD_BASIL_ID, 1],
        [SAUCE_CHILI_ID, 1], [SAUCE_GARLIC_ID, 1],
    ], { itemChoiceId: ITEM_IDS.NOODLES, itemLabel: "Choose noodles:", station: "pan" }),
    createAsianDishRecipe("vietnamese-curry", ITEM_IDS.VIETNAMESE_CURRY, [
        [RESOURCE_IDS.COCONUTS, 1], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SOVIET_POTATO_ID, 2], [getSpiceResourceId("curry-powder"), 1],
    ], { station: "pot" }),
    createAsianDishRecipe("sushi-rolls", ITEM_IDS.SUSHI_ROLLS, [
        [SOVIET_RICE_ID, 3], [4064, 2], [SOVIET_CUCUMBER_ID, 1],
        [RESOURCE_IDS.EGG, 1], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pot" }),
    createAsianDishRecipe("nigiri-sushi", ITEM_IDS.NIGIRI_SUSHI, [
        [SOVIET_RICE_ID, 2], [RESOURCE_IDS.CHICKEN_MEAT, 1],
        [RESOURCE_IDS.EGG, 1], [ASIAN_SOYBEAN_ID, 1],
    ], { station: "pot" }),
]);

// Arabic dishes. Chickpeas, lentils, rice, eggplant and flat bread carry most
// of the menu; tahini and harissa join them as prepared ingredients.
function createArabicDishRecipe(id, itemId, resources, options) {
    const settings = options || {};
    const recipe = {
        id: "arabic-" + id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: "arabic",
        resultNameSuffix: "",
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    };

    if (settings.oil !== false) {
        recipe.choiceResourceIds = OIL_RESOURCE_IDS;
        recipe.choiceAmount = 1;
        recipe.choiceLabel = "Choose oil:";
    }
    if (settings.itemChoiceId != null) {
        recipe.itemChoice = Object.freeze({
            itemId: settings.itemChoiceId,
            label: settings.itemLabel || "Choose ingredient:",
        });
    }
    if (settings.station === "pot") {
        recipe.requiresEquippedSlot = "pot";
        recipe.requiresWater = true;
        recipe.requiresCampfire = true;
    } else if (settings.station === "pan") {
        recipe.requiresEquippedSlot = "pan";
        recipe.requiresCampfire = true;
    } else if (settings.station === "campfire") {
        recipe.requiresCampfire = true;
    }

    return Object.freeze(recipe);
}

const ARABIC_DISH_RECIPES = Object.freeze([
    createArabicDishRecipe("falafel", ITEM_IDS.FALAFEL, [
        [ARABIC_CHICKPEA_ID, 3], [SAUCE_ONION_ID, 1], [SAUCE_GARLIC_ID, 2],
        [SAUCE_CORIANDER_ID, 1], [SAUCE_CUMIN_ID, 1], [SOVIET_WHEAT_FLOUR_ID, 1],
    ], { station: "pan" }),
    createArabicDishRecipe("hummus-plate", ITEM_IDS.HUMMUS_PLATE, [
        [ARABIC_CHICKPEA_ID, 3], [RESOURCE_IDS.LEMONS, 1], [SAUCE_GARLIC_ID, 1],
    ], { itemChoiceId: ITEM_IDS.TAHINI, itemLabel: "Choose tahini:", station: "pot" }),
    createArabicDishRecipe("baba-ganoush", ITEM_IDS.BABA_GANOUSH, [
        [4023, 2], [SAUCE_GARLIC_ID, 1], [RESOURCE_IDS.LEMONS, 1],
    ], { itemChoiceId: ITEM_IDS.TAHINI, itemLabel: "Choose tahini:", station: "campfire" }),
    createArabicDishRecipe("tabbouleh", ITEM_IDS.TABBOULEH, [
        [4101, 2], [SAUCE_TOMATO_ID, 2], [SOVIET_CUCUMBER_ID, 1],
        [SAUCE_WILD_BASIL_ID, 2], [SAUCE_PARSLEY_ROOT_ID, 1], [RESOURCE_IDS.LEMONS, 1],
    ]),
    createArabicDishRecipe("fattoush", ITEM_IDS.FATTOUSH, [
        [SAUCE_TOMATO_ID, 2], [SOVIET_CUCUMBER_ID, 1],
        [SAUCE_WILD_BASIL_ID, 1], [SAUCE_MINT_ID, 1], [RESOURCE_IDS.LEMONS, 1],
    ], { itemChoiceId: ITEM_IDS.BREAD, itemLabel: "Choose bread:" }),
    createArabicDishRecipe("shish-tawook", ITEM_IDS.SHISH_TAWOOK, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_GARLIC_ID, 1],
        [RESOURCE_IDS.LEMONS, 1], [getSpiceResourceId("sumac"), 1],
    ], { station: "pan" }),
    createArabicDishRecipe("chicken-shawarma", ITEM_IDS.CHICKEN_SHAWARMA, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_GARLIC_ID, 1],
        [getSpiceResourceId("sumac"), 1], [RESOURCE_IDS.LEMONS, 1],
    ], { itemChoiceId: ITEM_IDS.FLAT_BREAD, itemLabel: "Choose flat bread:", station: "pan" }),
    createArabicDishRecipe("kofta", ITEM_IDS.KOFTA, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_ONION_ID, 1],
        [SAUCE_CORIANDER_ID, 1], [SAUCE_CUMIN_ID, 1],
    ], { station: "pan" }),
    createArabicDishRecipe("kebab", ITEM_IDS.KEBAB, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [SAUCE_ONION_ID, 1],
        [getSpiceResourceId("sumac"), 1], [SAUCE_GARLIC_ID, 1],
    ], { station: "pan" }),
    createArabicDishRecipe("shawarma-plate", ITEM_IDS.SHAWARMA_PLATE, [
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SOVIET_RICE_ID, 2],
        [SAUCE_TOMATO_ID, 1], [SOVIET_CUCUMBER_ID, 1], [SAUCE_GARLIC_ID, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("mujadara", ITEM_IDS.MUJADARA, [
        [ARABIC_LENTIL_ID, 3], [SOVIET_RICE_ID, 2], [SAUCE_ONION_ID, 2],
    ], { station: "pot" }),
    createArabicDishRecipe("lentil-soup", ITEM_IDS.LENTIL_SOUP, [
        [ARABIC_LENTIL_ID, 3], [SAUCE_ONION_ID, 1], [SOVIET_CARROT_ID, 1],
        [SAUCE_CUMIN_ID, 1], [RESOURCE_IDS.LEMONS, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("chickpea-stew", ITEM_IDS.CHICKPEA_STEW, [
        [ARABIC_CHICKPEA_ID, 3], [SAUCE_TOMATO_ID, 2],
        [SAUCE_ONION_ID, 1], [SAUCE_CUMIN_ID, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("chickpea-tagine", ITEM_IDS.CHICKPEA_TAGINE, [
        [ARABIC_CHICKPEA_ID, 3], [SAUCE_TOMATO_ID, 2],
        [RESOURCE_IDS.APRICOTS, 1], [getSpiceResourceId("ras-el-hanout"), 1],
    ], { station: "pot" }),
    createArabicDishRecipe("chicken-tagine", ITEM_IDS.CHICKEN_TAGINE, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [RESOURCE_IDS.OLIVES, 2],
        [RESOURCE_IDS.LEMONS, 1], [SAUCE_ONION_ID, 1],
        [getSpiceResourceId("ras-el-hanout"), 1],
    ], { station: "pot" }),
    createArabicDishRecipe("stuffed-eggplant", ITEM_IDS.STUFFED_EGGPLANT, [
        [4023, 2], [SOVIET_RICE_ID, 2], [SAUCE_TOMATO_ID, 1], [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("stuffed-peppers", ITEM_IDS.STUFFED_PEPPERS, [
        [SAUCE_BELL_PEPPER_ID, 3], [SOVIET_RICE_ID, 2],
        [RESOURCE_IDS.CHICKEN_MEAT, 2], [SAUCE_TOMATO_ID, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("maqluba", ITEM_IDS.MAQLUBA, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [4023, 2], [getSpiceResourceId("sumac"), 1],
    ], { station: "pot" }),
    createArabicDishRecipe("kabsa", ITEM_IDS.KABSA, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 2],
        [SAUCE_TOMATO_ID, 2], [SAUCE_CUMIN_ID, 1], [SAUCE_CORIANDER_ID, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("mandi", ITEM_IDS.MANDI, [
        [SOVIET_RICE_ID, 3], [RESOURCE_IDS.CHICKEN_MEAT, 3],
        [getSpiceResourceId("sumac"), 1], [SAUCE_ONION_ID, 1],
    ], { station: "pot" }),
    createArabicDishRecipe("batata-harra", ITEM_IDS.BATATA_HARRA, [
        [SOVIET_POTATO_ID, 3], [SAUCE_CHILI_ID, 1],
        [SAUCE_GARLIC_ID, 2], [SAUCE_CORIANDER_ID, 1],
    ], { station: "pan" }),
    createArabicDishRecipe("fried-cauliflower", ITEM_IDS.FRIED_CAULIFLOWER, [
        [4009, 3], [RESOURCE_IDS.LEMONS, 1],
    ], { itemChoiceId: ITEM_IDS.TAHINI, itemLabel: "Choose tahini:", station: "pan" }),
    createArabicDishRecipe("shakshuka", ITEM_IDS.SHAKSHUKA, [
        [SAUCE_TOMATO_ID, 3], [RESOURCE_IDS.EGG, 2],
        [SAUCE_BELL_PEPPER_ID, 1], [SAUCE_ONION_ID, 1], [SAUCE_CUMIN_ID, 1],
    ], { station: "pan" }),
    createArabicDishRecipe("pomegranate-chicken", ITEM_IDS.POMEGRANATE_CHICKEN, [
        [RESOURCE_IDS.CHICKEN_MEAT, 3], [RESOURCE_IDS.POMEGRANATES, 2],
        [RESOURCE_IDS.SUGAR, 1], [getSpiceResourceId("sumac"), 1],
    ], { station: "pan" }),
    createArabicDishRecipe("muhammara", ITEM_IDS.MUHAMMARA, [
        [SAUCE_BELL_PEPPER_ID, 2], [RESOURCE_IDS.PINE_NUTS, 2],
        [RESOURCE_IDS.POMEGRANATES, 1], [SAUCE_CUMIN_ID, 1],
    ], { itemChoiceId: ITEM_IDS.BREAD, itemLabel: "Choose bread:" }),
    createArabicDishRecipe("baklava", ITEM_IDS.BAKLAVA, [
        [SOVIET_WHEAT_FLOUR_ID, 2], [RESOURCE_IDS.PINE_NUTS, 3],
        [RESOURCE_IDS.SUGAR, 2],
    ], { station: "campfire" }),
    createArabicDishRecipe("basbousa", ITEM_IDS.BASBOUSA, [
        [SOVIET_WHEAT_FLOUR_ID, 2], [RESOURCE_IDS.SUGAR, 2],
        [RESOURCE_IDS.COCONUTS, 1],
    ], { station: "campfire" }),
    createArabicDishRecipe("halva", ITEM_IDS.HALVA, [
        [SAUCE_SESAME_ID, 3], [RESOURCE_IDS.SUGAR, 2],
    ], { station: "campfire" }),
]);

// Kitchen spices are resource outputs rather than items, so they use their own
// compact list in the Food tab instead of the item craft selection pipeline.
const SPICE_THYME_ID = 3004;
const SPICE_SAGE_ID = 3005;
const SPICE_ROSEMARY_ID = 3006;
const SPICE_CARDAMOM_ID = 3053;
const SPICE_ANISE_ID = 3054;
const SPICE_HORSERADISH_ID = 3056;
const SPICE_JUNIPER_ID = 3057;
const SPICE_BAY_ID = 3058;
const SPICE_SAFFRON_ID = 3050;
const SPICE_CELERY_ID = 4021;
const SPICE_ASH_ID = 83;
const SPICE_SALT_ID = 90;

function createSpiceCraftRecipe(key, resources) {
    return Object.freeze({
        id: "spice-" + key,
        spiceKey: key,
        resources: Object.freeze(resources.map(function (resource) {
            return Object.freeze({
                resourceId: resource[0],
                amount: resource[1],
            });
        })),
    });
}

const SPICE_CRAFT_RECIPES = Object.freeze([
    createSpiceCraftRecipe("ground-oregano", [[SAUCE_OREGANO_ID, 2], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("dried-basil", [[SAUCE_WILD_BASIL_ID, 2], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("thyme-powder", [[SPICE_THYME_ID, 2]]),
    createSpiceCraftRecipe("sage-powder", [[SPICE_SAGE_ID, 2]]),
    createSpiceCraftRecipe("rosemary-powder", [[SPICE_ROSEMARY_ID, 2]]),
    createSpiceCraftRecipe("mint-flakes", [[SAUCE_MINT_ID, 2]]),
    createSpiceCraftRecipe("dill-weed", [[SAUCE_DILL_ID, 2]]),
    createSpiceCraftRecipe("ground-cumin", [[SAUCE_CUMIN_ID, 2]]),
    createSpiceCraftRecipe("ground-coriander", [[SAUCE_CORIANDER_ID, 2]]),
    createSpiceCraftRecipe("ground-turmeric", [[SAUCE_TURMERIC_ID, 2]]),
    createSpiceCraftRecipe("ground-ginger", [[SAUCE_GINGER_ID, 2]]),
    createSpiceCraftRecipe("ground-cardamom", [[SPICE_CARDAMOM_ID, 2]]),
    createSpiceCraftRecipe("ground-anise", [[SPICE_ANISE_ID, 2]]),
    createSpiceCraftRecipe("ground-mustard", [[SAUCE_MUSTARD_ID, 2]]),
    createSpiceCraftRecipe("horseradish-powder", [[SPICE_HORSERADISH_ID, 2]]),
    createSpiceCraftRecipe("juniper-powder", [[SPICE_JUNIPER_ID, 2]]),
    createSpiceCraftRecipe("bay-leaf-powder", [[SPICE_BAY_ID, 2]]),
    createSpiceCraftRecipe("crushed-saffron", [[SPICE_SAFFRON_ID, 1]]),
    createSpiceCraftRecipe("chili-flakes", [[SAUCE_CHILI_ID, 2]]),
    createSpiceCraftRecipe("chili-powder", [[SAUCE_CHILI_ID, 2], [SAUCE_PAPRIKA_ID, 1]]),
    createSpiceCraftRecipe("smoked-paprika", [[SAUCE_PAPRIKA_ID, 2], [SPICE_ASH_ID, 1]]),
    createSpiceCraftRecipe("garlic-powder", [[SAUCE_GARLIC_ID, 3]]),
    createSpiceCraftRecipe("onion-powder", [[SAUCE_ONION_ID, 3]]),
    createSpiceCraftRecipe("celery-salt", [[SPICE_CELERY_ID, 2], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("garlic-salt", [[SAUCE_GARLIC_ID, 2], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("onion-salt", [[SAUCE_ONION_ID, 2], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("herb-salt", [[SAUCE_OREGANO_ID, 1], [SPICE_THYME_ID, 1], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("chili-salt", [[SAUCE_CHILI_ID, 1], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("smoked-salt", [[SPICE_SALT_ID, 2], [SPICE_ASH_ID, 1]]),
    createSpiceCraftRecipe("saffron-salt", [[SPICE_SAFFRON_ID, 1], [SPICE_SALT_ID, 1]]),
    createSpiceCraftRecipe("khmeli-suneli", [
        [SAUCE_CORIANDER_ID, 1], [SAUCE_DILL_ID, 1], [SPICE_BAY_ID, 1],
        [SAUCE_PAPRIKA_ID, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("adjika", [
        [SAUCE_CHILI_ID, 2], [SAUCE_GARLIC_ID, 1], [SPICE_SALT_ID, 1],
        [SAUCE_PAPRIKA_ID, 1],
    ]),
    createSpiceCraftRecipe("garam-masala", [
        [SAUCE_CUMIN_ID, 1], [SAUCE_CORIANDER_ID, 1], [SPICE_CARDAMOM_ID, 1],
    ]),
    createSpiceCraftRecipe("curry-powder", [
        [SAUCE_TURMERIC_ID, 1], [SAUCE_CUMIN_ID, 1],
        [SAUCE_CORIANDER_ID, 1], [SAUCE_GINGER_ID, 1],
    ]),
    createSpiceCraftRecipe("ras-el-hanout", [
        [SAUCE_CUMIN_ID, 1], [SAUCE_CORIANDER_ID, 1], [SPICE_CARDAMOM_ID, 1],
        [SAUCE_GINGER_ID, 1], [SAUCE_TURMERIC_ID, 1],
    ]),
    createSpiceCraftRecipe("five-spice", [
        [SPICE_ANISE_ID, 1], [SAUCE_GINGER_ID, 1], [SAUCE_CORIANDER_ID, 1],
        [SPICE_CARDAMOM_ID, 1], [SPICE_BAY_ID, 1],
    ]),
    createSpiceCraftRecipe("herbes-de-provence", [
        [SPICE_THYME_ID, 1], [SAUCE_OREGANO_ID, 1],
        [SPICE_ROSEMARY_ID, 1], [SPICE_SAGE_ID, 1],
    ]),
    createSpiceCraftRecipe("italian-seasoning", [
        [SAUCE_WILD_BASIL_ID, 1], [SAUCE_OREGANO_ID, 1],
        [SPICE_ROSEMARY_ID, 1], [SPICE_THYME_ID, 1],
    ]),
    createSpiceCraftRecipe("zaatar", [
        [SPICE_THYME_ID, 1], [SAUCE_OREGANO_ID, 1],
        [SAUCE_SESAME_ID, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("baharat", [
        [SAUCE_CUMIN_ID, 1], [SAUCE_CORIANDER_ID, 1],
        [SPICE_CARDAMOM_ID, 1], [SAUCE_PAPRIKA_ID, 1],
    ]),
    createSpiceCraftRecipe("taco-seasoning", [
        [SAUCE_CHILI_ID, 1], [SAUCE_PAPRIKA_ID, 1],
        [SAUCE_CUMIN_ID, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("bbq-rub", [
        [SAUCE_PAPRIKA_ID, 1], [RESOURCE_IDS.SUGAR, 1],
        [SPICE_SALT_ID, 1], [SAUCE_CHILI_ID, 1],
    ]),
    createSpiceCraftRecipe("pickling-spice", [
        [SAUCE_MUSTARD_ID, 1], [SPICE_JUNIPER_ID, 1],
        [SPICE_BAY_ID, 1], [SAUCE_DILL_ID, 1],
    ]),
    createSpiceCraftRecipe("mulling-spice", [
        [SPICE_ANISE_ID, 1], [SPICE_CARDAMOM_ID, 1],
        [SAUCE_GINGER_ID, 1], [RESOURCE_IDS.SUGAR, 1],
    ]),
    createSpiceCraftRecipe("chai-spice", [
        [SPICE_CARDAMOM_ID, 1], [SAUCE_GINGER_ID, 1],
        [SPICE_ANISE_ID, 1], [RESOURCE_IDS.SUGAR, 1],
    ]),
    createSpiceCraftRecipe("pumpkin-spice", [
        [RESOURCE_IDS.SUGAR, 1], [SPICE_ANISE_ID, 1],
        [SAUCE_GINGER_ID, 1], [SPICE_CARDAMOM_ID, 1],
    ]),
    createSpiceCraftRecipe("lemon-herb-seasoning", [
        [RESOURCE_IDS.LEMONS, 1], [SAUCE_OREGANO_ID, 1],
        [SPICE_THYME_ID, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("mushroom-powder", [[RESOURCE_IDS.BUTTON_MUSHROOM, 3]]),
    createSpiceCraftRecipe("tomato-powder", [[SAUCE_TOMATO_ID, 3]]),
    createSpiceCraftRecipe("beet-powder", [[SOVIET_BEETROOT_ID, 3]]),
    createSpiceCraftRecipe("shichimi-togarashi", [
        [SAUCE_CHILI_ID, 2], [SAUCE_SESAME_ID, 1],
        [SAUCE_GINGER_ID, 1], [SAUCE_CORIANDER_ID, 1],
    ]),
    createSpiceCraftRecipe("nanami-togarashi", [
        [SAUCE_CHILI_ID, 2], [SAUCE_SESAME_ID, 1],
        [RESOURCE_IDS.LEMONS, 1], [SPICE_BAY_ID, 1],
    ]),
    createSpiceCraftRecipe("wasabi-powder", [
        [SPICE_HORSERADISH_ID, 2], [SAUCE_MUSTARD_ID, 1], [4013, 1],
    ]),
    createSpiceCraftRecipe("furikake", [
        [SAUCE_SESAME_ID, 2], [getSpiceResourceId("mushroom-powder"), 1],
        [SPICE_SALT_ID, 1], [SAUCE_CHILI_ID, 1],
    ]),
    createSpiceCraftRecipe("gochugaru", [
        [SAUCE_CHILI_ID, 2], [SAUCE_PAPRIKA_ID, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("sumac", [
        [RESOURCE_IDS.LEMONS, 2], [SAUCE_PAPRIKA_ID, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("dukkah", [
        [SAUCE_SESAME_ID, 2], [SAUCE_CORIANDER_ID, 1],
        [SAUCE_CUMIN_ID, 1], [RESOURCE_IDS.PINE_NUTS, 1], [SPICE_SALT_ID, 1],
    ]),
    createSpiceCraftRecipe("harissa-spice", [
        [SAUCE_CHILI_ID, 2], [SAUCE_PAPRIKA_ID, 1],
        [SAUCE_CUMIN_ID, 1], [SAUCE_CORIANDER_ID, 1], [SPICE_SALT_ID, 1],
    ]),
]);

function getSpiceCraftSpiceId(recipe) {
    return recipe && typeof getSpiceResourceId === "function"
        ? getSpiceResourceId(recipe.spiceKey)
        : null;
}

function canCraftSpice(recipe) {
    if (!recipe || getSpiceCraftSpiceId(recipe) == null) return false;
    return recipe.resources.every(function (requirement) {
        return getResourceAmount(requirement.resourceId) >= requirement.amount;
    });
}

function getSpiceCraftQuality(recipe) {
    let totalQuality = 0;
    let totalAmount = 0;
    recipe.resources.forEach(function (requirement) {
        totalQuality += getResourceQuality(requirement.resourceId)
            * Math.max(1, Number(requirement.amount) || 1);
        totalAmount += Math.max(1, Number(requirement.amount) || 1);
    });
    const ingredientQuality = totalAmount > 0
        ? totalQuality / totalAmount
        : RESOURCE_DEFAULT_QUALITY;
    return applyWellFedActionQuality(
        (getEffectiveLevel("cooking") + ingredientQuality) / 2
    );
}

function craftSpice(recipe) {
    if (!canCraftSpice(recipe)) return false;
    const spiceId = getSpiceCraftSpiceId(recipe);
    if (spiceId == null) return false;

    const quality = getSpiceCraftQuality(recipe);
    recipe.resources.forEach(function (requirement) {
        const stack = resources[requirement.resourceId];
        if (!stack) return;
        stack.amount = round2(Math.max(
            0,
            Number(stack.amount) - requirement.amount
        ));
    });

    addResource(spiceId, 1, quality);
    const definition = RESOURCE_DEFS[spiceId];
    logMessage("You grind " + (definition ? definition.name : "a spice") + ".");
    if (player.cooking) player.cooking.addexp(1);
    if (typeof renderResources === "function") renderResources();
    const foodCategory = typeof getCraftCategory === "function"
        ? getCraftCategory("food")
        : null;
    if (foodCategory) {
        renderCraftResources(foodCategory);
        renderCraftDetails(foodCategory);
    }
    refreshCraftAvailability();
    return true;
}

// Flour-and-water cooking recipes: one flour of choice plus water on the tile.
// Raw intermediates (dough, pasta) skip potential bonuses because they are not
// edible until cooked again.
function createFlourWaterRecipe(id, itemId, extraResources, group) {
    return Object.freeze({
        id: id,
        category: "food",
        itemId: itemId,
        skill: "cooking",
        stat: "sou",
        group: group || "bread",
        resources: Object.freeze(extraResources || []),
        choiceResourceIds: FLOUR_RESOURCE_IDS,
        choiceAmount: 1,
        choiceLabel: "Choose flour:",
        resultNameSuffix: "",
        requiresWater: true,
        noPotentialBonuses: true,
    });
}

const PASTA_RECIPES = Object.freeze(PASTA_ITEM_DEFINITIONS.map(function (pasta) {
    return createFlourWaterRecipe(
        "raw-pasta-" + pasta.name.toLowerCase().replace(/\s+/g, "-"),
        pasta.id,
        null,
        "pasta"
    );
}));

const PASTA_ITEM_IDS = Object.freeze(PASTA_ITEM_DEFINITIONS.map(function (pasta) {
    return pasta.id;
}));

// Soup takes any edible resource plus every herb type (medicinal, spice,
// alchemical and magical included).
const SOUP_INGREDIENT_IDS = Object.freeze((function () {
    const ids = [];

    Object.keys(RESOURCE_DEFS).map(Number).forEach(function (resourceId) {
        if (typeof hasResourceTag === "function"
            && hasResourceTag(resourceId, RESOURCE_TAGS.Edible)) {
            ids.push(resourceId);
        }
    });

    HERB_RESOURCE_IDS.forEach(function (resourceId) {
        if (ids.indexOf(resourceId) === -1) ids.push(resourceId);
    });

    return ids;
})());

// Metal tools, metal cutlery and metal pots use the matching metal bars.
// Tools and cutlery also need a wooden handle/shaft; pots do not.
function createMetalVariantRecipes() {
    const variants = (typeof METAL_VARIANT_ITEMS !== "undefined" ? METAL_VARIANT_ITEMS : [])
        .concat(typeof METAL_POT_ITEMS !== "undefined" ? METAL_POT_ITEMS : [])
        .concat(typeof METAL_PAN_ITEMS !== "undefined" ? METAL_PAN_ITEMS : []);

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
        if (Array.isArray(variant.extraResources)) {
            variant.extraResources.forEach(function (extra) {
                resources.push(Object.freeze({
                    resourceId: extra.resourceId,
                    amount: extra.amount,
                }));
            });
        }

        return Object.freeze({
            id: "metal-" + variant.metalKey + "-" + variant.baseKey,
            category: variant.category,
            itemId: variant.itemId,
            skill: "smithing",
            group: variant.category === "tools"
                ? (METAL_TOOL_GROUPS[variant.baseKey] || "other")
                : (variant.baseKey === "pot"
                    ? "pots"
                    : (variant.baseKey === "fryingpan" ? "pans" : "cutlery")),
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
        group: "cutlery",
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
    Object.freeze({
        id: "flat-bread",
        category: "food",
        itemId: ITEM_IDS.FLAT_BREAD,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        choiceResourceIds: FLOUR_RESOURCE_IDS,
        choiceAmount: 1,
        choiceLabel: "Choose flour:",
        resultNameSuffix: "",
        requiresWater: true,
    }),
    Object.freeze({
        id: "shawerma",
        category: "food",
        itemId: ITEM_IDS.SHAWERMA,
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
                id: "meat",
                resourceIds: MEAT_RESOURCE_IDS,
                amount: 1,
                label: "Choose meat:",
            }),
        ]),
        itemChoice: Object.freeze({
            itemId: ITEM_IDS.FLAT_BREAD,
            label: "Choose flat bread:",
            rarityBoost: 1,
        }),
    }),
    Object.freeze({
        id: "soup",
        category: "food",
        itemId: ITEM_IDS.SOUP,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        choiceSlots: Object.freeze([
            Object.freeze({
                id: "ingredient1",
                resourceIds: SOUP_INGREDIENT_IDS,
                amount: 1,
                label: "Choose ingredient 1:",
            }),
            Object.freeze({
                id: "ingredient2",
                resourceIds: SOUP_INGREDIENT_IDS,
                amount: 1,
                label: "Choose ingredient 2:",
            }),
            Object.freeze({
                id: "ingredient3",
                resourceIds: SOUP_INGREDIENT_IDS,
                amount: 1,
                label: "Choose ingredient 3:",
            }),
            Object.freeze({
                id: "ingredient4",
                resourceIds: SOUP_INGREDIENT_IDS,
                amount: 1,
                label: "Choose ingredient 4:",
            }),
            Object.freeze({
                id: "ingredient5",
                resourceIds: SOUP_INGREDIENT_IDS,
                amount: 1,
                label: "Choose ingredient 5:",
            }),
        ]),
        bonusChoiceSlotsFromCooking: true,
        bonusChoiceSlotsMultiplier: 2,
        bonusChoiceResourceIds: SOUP_INGREDIENT_IDS,
        bonusChoiceAmount: 1,
        itemChoice: Object.freeze({
            itemIds: PASTA_ITEM_IDS,
            label: "Add pasta (optional):",
            rowLabel: "Pasta",
            optional: true,
            rarityBoost: 1,
        }),
    }),
    createFlourWaterRecipe("dough", ITEM_IDS.DOUGH),
    createFlourWaterRecipe("sweet-dough", ITEM_IDS.SWEET_DOUGH, [
        Object.freeze({ resourceId: RESOURCE_IDS.SUGAR, amount: 1 }),
    ]),
    Object.freeze({
        id: "bread",
        category: "food",
        itemId: ITEM_IDS.BREAD,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        itemChoice: Object.freeze({
            itemId: ITEM_IDS.DOUGH,
            label: "Choose dough:",
        }),
    }),
    Object.freeze({
        id: "toast-bread",
        category: "food",
        itemId: ITEM_IDS.TOAST_BREAD,
        skill: "cooking",
        stat: "sou",
        resources: Object.freeze([]),
        itemChoice: Object.freeze({
            itemId: ITEM_IDS.BREAD,
            label: "Choose bread:",
        }),
    }),
    ...PASTA_RECIPES,
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
    ...SAUCE_RECIPES,
    ...ASIAN_SAUCE_RECIPES,
    ...ARABIC_SAUCE_RECIPES,
    ...ITALIAN_DISH_RECIPES,
    ...SOVIET_DISH_RECIPES,
    ...PIZZA_RECIPES,
    ...ASIAN_DISH_RECIPES,
    ...ARABIC_DISH_RECIPES,
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
// Collapsed craft groups are kept for the session so rebuilding the list does
// not immediately reopen a category the player closed.
const collapsedCraftGroups = Object.create(null);
// Spice recipes output resources, so they use a separate selection state from
// the item recipes while still sharing the Food tab panels.
let selectedSpiceRecipeId = null;
// Selected mushroom/vegetable for recipes that let the player choose one
// flexible ingredient. Keyed by recipe id.
const selectedCraftChoiceByRecipe = {};
// Optional bonus ingredients. Keyed by recipe id, each entry is an array of
// resource ids or null for an empty "-None-" slot.
const selectedCraftBonusChoicesByRecipe = {};
// Extra mandatory ingredient slots (for example 3 vegetables + 1 herb).
// Keyed by recipe id and then by slot id.
const selectedCraftSlotChoicesByRecipe = {};
// Chosen inventory item for recipes that consume a crafted item (shawerma
// takes one flat bread out of the inventory).
const selectedCraftItemByRecipe = {};
// Optional sauce items added as extra ingredients. Keyed by recipe id and then
// by bonus sauce slot.
const selectedCraftSauceItemsByRecipe = {};

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

// Some recipes consume a crafted item instead of (or besides) resources.
function getCraftItemChoice(recipe) {
    const choice = recipe && recipe.itemChoice;
    if (!choice) return null;
    const hasIds = (Array.isArray(choice.itemIds) && choice.itemIds.length > 0)
        || choice.itemId != null;
    return hasIds ? choice : null;
}

function getCraftItemChoiceIds(choice) {
    if (!choice) return [];
    if (Array.isArray(choice.itemIds) && choice.itemIds.length) {
        return choice.itemIds;
    }
    return choice.itemId != null ? [choice.itemId] : [];
}

function getCraftItemChoices(recipe) {
    const choice = getCraftItemChoice(recipe);
    if (!choice
        || typeof player === "undefined"
        || !player
        || !Array.isArray(player.equipinventory)) {
        return [];
    }

    const allowedIds = getCraftItemChoiceIds(choice);
    return player.equipinventory.filter(function (item) {
        return !!item && allowedIds.indexOf(item.itemId) !== -1;
    });
}

function getCraftItemChoiceName(item) {
    if (!item) return "Item";
    if (typeof getInventoryItemName === "function") {
        const name = getInventoryItemName(item);
        if (name) return name;
    }
    return item.name || "Item";
}

function getCraftItemChoiceLabel(item) {
    if (!item) return "-None-";

    const rarityId = typeof getItemRarityId === "function"
        ? getItemRarityId(item)
        : null;
    return getCraftItemChoiceName(item)
        + " | Q" + round2(Math.max(0, Number(item.quality) || 1))
        + (rarityId ? " | " + getRarityLabel(rarityId) : "");
}

function getSelectedCraftItemChoice(recipe) {
    const choice = getCraftItemChoice(recipe);
    if (!choice) return null;

    const items = getCraftItemChoices(recipe);
    const stored = selectedCraftItemByRecipe[recipe.id];

    if (Object.prototype.hasOwnProperty.call(selectedCraftItemByRecipe, recipe.id)) {
        if (stored === null) return null;

        const found = items.find(function (item) {
            return Number(item.instanceId) === Number(stored);
        });
        if (found) return found;

        // The chosen item was consumed or removed.
        if (choice.optional === true) {
            selectedCraftItemByRecipe[recipe.id] = null;
            return null;
        }
        delete selectedCraftItemByRecipe[recipe.id];
    }

    if (choice.optional === true) {
        selectedCraftItemByRecipe[recipe.id] = null;
        return null;
    }

    if (!items.length) return null;
    selectedCraftItemByRecipe[recipe.id] = Number(items[0].instanceId);
    return items[0];
}

function setCraftItemChoice(recipe, instanceId) {
    const choice = getCraftItemChoice(recipe);
    if (!choice) return false;

    if (instanceId == null || instanceId === "") {
        if (choice.optional !== true) return false;
        selectedCraftItemByRecipe[recipe.id] = null;
        return true;
    }

    const id = Number(instanceId);
    const exists = getCraftItemChoices(recipe).some(function (item) {
        return Number(item.instanceId) === id;
    });
    if (!exists) return false;

    selectedCraftItemByRecipe[recipe.id] = id;
    return true;
}

// Shared accounting for every inventory item a recipe consumes. Quality,
// potential bonuses, affordability and consumption all go through this so an
// item ingredient behaves like any other ingredient.
function getCraftInventoryIngredientItems(recipe) {
    const items = [];
    const choice = getCraftItemChoice(recipe);
    if (choice) {
        const selected = getSelectedCraftItemChoice(recipe);
        if (selected) items.push({ choice: choice, item: selected });
    }
    getSelectedCraftSauceItems(recipe).forEach(function (item) {
        items.push({ sauce: true, item: item });
    });
    return items;
}

function consumeCraftItemChoice(recipe, item) {
    if (!item || typeof player === "undefined" || !player
        || !Array.isArray(player.equipinventory)) {
        return false;
    }

    const index = player.equipinventory.indexOf(item);
    if (index === -1) return false;

    player.equipinventory[index] = null;
    delete selectedCraftItemByRecipe[recipe.id];
    return true;
}

// The selected item's rarity raises the crafted result. The result is at
// least `rarityBoost` tiers above the item, or keeps a higher rolled rarity.
function getItemChoiceBoostedRarity(recipe, baseRarity) {
    const choice = getCraftItemChoice(recipe);
    if (!choice) return baseRarity;

    const boost = Math.max(0, Math.floor(Number(choice.rarityBoost) || 0));
    if (boost <= 0) return baseRarity;

    const ingredient = getCraftInventoryIngredientItems(recipe)[0];
    const item = ingredient ? ingredient.item : null;
    if (!item) return baseRarity;

    const rarityOrder = Object.keys(ITEM_RARITY_DEFS);
    const baseTier = Math.max(0, getRarityTier(baseRarity));
    const itemRarity = typeof getItemRarityId === "function"
        ? getItemRarityId(item)
        : null;
    const itemTier = itemRarity ? Math.max(0, getRarityTier(itemRarity)) : 0;
    const tier = Math.min(
        rarityOrder.length - 1,
        Math.max(baseTier, itemTier + boost)
    );
    return rarityOrder[tier] || baseRarity;
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

function isExtraIngredientDish(recipe) {
    if (!recipe || recipe.category !== "food") return false;
    const tags = getCraftRecipeTags(recipe);
    if (tags.indexOf("dessert") !== -1) return false;
    if (tags.indexOf("ingredient") !== -1) return false;
    if (tags.indexOf("drinks") !== -1) return false;
    return true;
}

function getExtraBonusResourceIds(recipe) {
    const ids = [];
    const add = function (resourceIds) {
        resourceIds.forEach(function (resourceId) {
            if (ids.indexOf(resourceId) === -1) ids.push(resourceId);
        });
    };

    if (!isExtraIngredientDish(recipe)) return ids;

    add(SPICE_RESOURCE_IDS);

    const tags = getCraftRecipeTags(recipe);
    if (tags.indexOf("salad") !== -1) {
        add(NUT_RESOURCE_IDS);
        add(VEGETABLE_RESOURCE_IDS);
        add(FRUIT_RESOURCE_IDS);
    }
    if (tags.indexOf("soup") !== -1) {
        add(VEGETABLE_RESOURCE_IDS);
        add(OIL_RESOURCE_IDS);
    }

    return ids;
}

function getCraftBonusSlotCount(recipe) {
    if (!recipe) return 0;
    const baseCount = recipe.bonusChoiceSlotsFromCooking === true
        ? getCookingBonusSlotCount() * Math.max(
            1,
            Math.floor(Number(recipe.bonusChoiceSlotsMultiplier) || 1)
        )
        : Math.max(0, Math.floor(Number(recipe.bonusChoiceSlots) || 0));

    // Every non-dessert dish gets Cooking-scaled extra slots for spices and
    // other suitable bonus ingredients.
    if (isExtraIngredientDish(recipe)) {
        return Math.max(baseCount, getCookingBonusSlotCount());
    }
    return baseCount;
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
// the bonus). Extra spices, salad produce and soup vegetables are merged on top
// of that pool for every eligible dish.
function getCraftBonusResourceIds(recipe) {
    const base = recipe && Array.isArray(recipe.bonusChoiceResourceIds)
        && recipe.bonusChoiceResourceIds.length
        ? recipe.bonusChoiceResourceIds.slice()
        : getCraftChoiceResourceIds(recipe).slice();

    getExtraBonusResourceIds(recipe).forEach(function (resourceId) {
        if (base.indexOf(resourceId) === -1) base.push(resourceId);
    });
    return base;
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

function getCraftSauceItemIds() {
    return typeof SAUCE_ITEM_DEFINITIONS !== "undefined"
        ? SAUCE_ITEM_DEFINITIONS.map(function (sauce) { return sauce.id; })
        : [];
}

function getCraftSauceSlotCount(recipe) {
    if (!isExtraIngredientDish(recipe)) return 0;
    return getCookingBonusSlotCount();
}

function getCraftSauceChoices(recipe) {
    const count = getCraftSauceSlotCount(recipe);
    if (count <= 0) return [];

    let choices = selectedCraftSauceItemsByRecipe[recipe.id];
    if (!Array.isArray(choices)) choices = [];
    if (choices.length > count) choices = choices.slice(0, count);
    while (choices.length < count) choices.push(null);

    selectedCraftSauceItemsByRecipe[recipe.id] = choices;
    return choices;
}

function getCraftSauceInventoryItems() {
    if (typeof player === "undefined" || !player
        || !Array.isArray(player.equipinventory)) {
        return [];
    }
    const sauceIds = getCraftSauceItemIds();
    return player.equipinventory.filter(function (item) {
        return !!item && sauceIds.indexOf(item.itemId) !== -1;
    });
}

function getSelectedCraftSauceItems(recipe) {
    const choices = getCraftSauceChoices(recipe);
    if (!choices.length) return [];
    const items = getCraftSauceInventoryItems();
    return choices.map(function (instanceId) {
        if (instanceId == null) return null;
        return items.find(function (item) {
            return Number(item.instanceId) === Number(instanceId);
        }) || null;
    }).filter(Boolean);
}

function setCraftSauceChoice(recipe, index, instanceId) {
    if (!recipe) return false;
    const choices = getCraftSauceChoices(recipe);
    const slot = Number(index);
    if (!Number.isInteger(slot) || slot < 0 || slot >= choices.length) {
        return false;
    }

    if (instanceId == null || instanceId === "") {
        choices[slot] = null;
        return true;
    }

    const id = Number(instanceId);
    const exists = getCraftSauceInventoryItems().some(function (item) {
        return Number(item.instanceId) === id;
    });
    if (!exists) return false;

    choices[slot] = id;
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

    if (recipe) {
        if (getCraftChoiceResourceIds(recipe).length) {
            const choice = getSelectedCraftChoice(recipe);
            if (choice != null) {
                addRequirement(choice, recipe.choiceAmount);
            }
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
    if (recipe && getCraftChoiceResourceIds(recipe).length
        && recipe.resultNameSuffix !== "") {
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
    const recipes = getCraftRecipesByCategory(categoryId).filter(isCraftRecipeUnlocked);
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
    if (!isCraftRecipeUnlocked(recipe)) return false;
    if (recipe.requiresCookingPower === true && getCraftCookingPower() <= 0) {
        return false;
    }
    if (!hasCraftToolPower(recipe)) {
        return false;
    }
    if (!canMeetCraftStationRequirements(recipe)) {
        return false;
    }
    const itemChoice = getCraftItemChoice(recipe);
    if (itemChoice && itemChoice.optional !== true
        && !getSelectedCraftItemChoice(recipe)) {
        return false;
    }
    return canAffordCraft(recipe);
}

// Weighted average quality of all ingredient units consumed by the recipe,
// including crafted items taken from the inventory.
function getCraftResourceQuality(recipe) {
    let totalAmount = 0;
    let totalQuality = 0;

    getCraftRequirements(recipe).forEach(function (requirement) {
        const amount = Number(requirement.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;

        totalQuality += getResourceQuality(requirement.resourceId) * amount;
        totalAmount += amount;
    });

    getCraftInventoryIngredientItems(recipe).forEach(function (entry) {
        const quality = Number(entry.item && entry.item.quality);
        totalQuality += Number.isFinite(quality) && quality > 0
            ? quality
            : RESOURCE_DEFAULT_QUALITY;
        totalAmount += 1;
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
    if (recipe.noPotentialBonuses === true) return null;
    if (getCraftChoiceResourceIds(recipe).length === 0
        && getCraftChoiceSlots(recipe).length === 0
        && getCraftInventoryIngredientItems(recipe).length === 0
        && getCraftBonusChoices(recipe).filter(function (resourceId) {
            return resourceId != null;
        }).length === 0) {
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

    // Resources such as oils can define their own fixed potential bonuses.
    requirements.forEach(function (requirement) {
        const definition = typeof RESOURCE_DEFS !== "undefined"
            ? RESOURCE_DEFS[requirement.resourceId]
            : null;
        const source = definition && definition.potentialBonuses;
        if (!source || typeof source !== "object") return;

        const amount = Math.max(1, Number(requirement.amount) || 1);
        const resourceQuality = getResourceQuality(requirement.resourceId);
        const qualityMultiplier = 1 + resourceQuality / 10;

        Object.keys(source).forEach(function (statKey) {
            const value = Number(source[statKey]);
            if (!Number.isFinite(value) || value <= 0) return;
            totals[statKey] = (totals[statKey] || 0)
                + value * amount * qualityMultiplier;
        });
    });

    // Inventory ingredients carry their own potential bonuses into the dish.
    getCraftInventoryIngredientItems(recipe).forEach(function (entry) {
        const source = entry.item && entry.item.potentialBonuses;
        if (!source || typeof source !== "object") return;

        Object.keys(source).forEach(function (statKey) {
            const value = Number(source[statKey]);
            if (!Number.isFinite(value) || value <= 0) return;
            totals[statKey] = (totals[statKey] || 0) + value;
        });
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

    const recipes = getCraftRecipesByCategory(category.id).filter(isCraftRecipeUnlocked);

    if (!recipes.length) {
        const group = document.createElement("div");
        group.className = "habitcategory craftcategory";

        const groupTitle = document.createElement("div");
        groupTitle.className = "habitcategorytitle";
        groupTitle.innerText = category.name;
        group.appendChild(groupTitle);

        const empty = document.createElement("div");
        empty.className = "craftempty";
        empty.innerText = "Nothing to craft here yet.";
        group.appendChild(empty);
        list.appendChild(group);
        return;
    }

    // Keep the selection valid and default it to the first recipe.
    const selectedRecipe = getSelectedCraftRecipe(category.id);

    // Split the flat recipe list into named groups, preserving recipe order.
    const groups = [];
    const groupsById = Object.create(null);
    recipes.forEach(function (recipe) {
        const groupId = getCraftRecipeGroupId(recipe);
        if (!groupsById[groupId]) {
            groupsById[groupId] = {
                id: groupId,
                name: getCraftRecipeGroupName(groupId),
                recipes: [],
            };
            groups.push(groupsById[groupId]);
        }
        groupsById[groupId].recipes.push(recipe);
    });

    groups.forEach(function (groupInfo) {
        const group = document.createElement("div");
        group.className = "habitcategory craftcategory";
        group.dataset.craftGroup = groupInfo.id;

        const groupTitle = document.createElement("div");
        groupTitle.className = "habitcategorytitle";
        groupTitle.innerText = groupInfo.name;
        group.appendChild(groupTitle);

        const groupKey = category.id + ":" + groupInfo.id;
        groupTitle.classList.add("craftcollapsible");
        if (collapsedCraftGroups[groupKey] === true) {
            group.classList.add("collapsed");
        }
        groupTitle.addEventListener("click", function () {
            collapsedCraftGroups[groupKey] = !collapsedCraftGroups[groupKey];
            group.classList.toggle(
                "collapsed",
                collapsedCraftGroups[groupKey] === true
            );
        });

        const recipeList = document.createElement("ul");
        recipeList.className = "habitlist";

        groupInfo.recipes.forEach(function (recipe) {
            const recipeItem = document.createElement("li");
            recipeItem.className = "habititem craftrecipe";
            recipeItem.id = "craftrecipe-" + category.id + "-" + recipe.id;
            recipeItem.dataset.recipeId = recipe.id;
            recipeItem.classList.toggle(
                "selected",
                !selectedSpiceRecipeId
                    && !!selectedRecipe && selectedRecipe.id === recipe.id
            );
            recipeItem.classList.toggle("unavailable", !canCraftRecipe(recipe));

            const switchElement = document.createElement("span");
            switchElement.className = "habitswitch";
            const tagText = getCraftRecipeTags(recipe)
                .map(getCraftTagLabel)
                .join(", ");
            switchElement.setAttribute(
                "data-tooltip",
                "Craft " + getCraftResultName(recipe)
                    + "<br>Skill: " + getCraftSkillName(recipe)
                    + (tagText ? "<br>Tags: " + tagText : "")
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
    });

    if (category.id === "food") renderSpiceCraftGroup(list);
}

// Spice crafting works on resources, not items, so it gets its own compact
// list inside the Food tab. Clicking a row grinds one portion immediately.
function renderSpiceCraftGroup(list) {
    if (!list || typeof SPICE_CRAFT_RECIPES === "undefined") return;

    const group = document.createElement("div");
    group.className = "habitcategory craftcategory";
    group.dataset.craftGroup = "spices";

    const groupTitle = document.createElement("div");
    groupTitle.className = "habitcategorytitle";
    groupTitle.innerText = "Spices";
    group.appendChild(groupTitle);

    const groupKey = "food:spices";
    groupTitle.classList.add("craftcollapsible");
    if (collapsedCraftGroups[groupKey] === true) {
        group.classList.add("collapsed");
    }
    groupTitle.addEventListener("click", function () {
        collapsedCraftGroups[groupKey] = !collapsedCraftGroups[groupKey];
        group.classList.toggle(
            "collapsed",
            collapsedCraftGroups[groupKey] === true
        );
    });

    const recipeList = document.createElement("ul");
    recipeList.className = "habitlist";

    SPICE_CRAFT_RECIPES.forEach(function (recipe) {
        const spiceId = getSpiceCraftSpiceId(recipe);
        const definition = spiceId != null ? RESOURCE_DEFS[spiceId] : null;
        if (!definition) return;

        const recipeItem = document.createElement("li");
        recipeItem.className = "habititem craftrecipe spicerecipe";
        recipeItem.id = "spicerecipe-" + recipe.id;
        recipeItem.dataset.spiceRecipeId = recipe.id;
        recipeItem.classList.toggle("unavailable", !canCraftSpice(recipe));
        recipeItem.classList.toggle(
            "selected",
            selectedSpiceRecipeId === recipe.id
        );

        const costText = recipe.resources.map(function (requirement) {
            const resource = RESOURCE_DEFS[requirement.resourceId];
            return (resource ? resource.name : "resource")
                + " x" + requirement.amount;
        }).join(", ");

        const switchElement = document.createElement("span");
        switchElement.className = "habitswitch";
        switchElement.setAttribute(
            "data-tooltip",
            definition.name + "<br>" + costText
                + "<br>Click to grind one portion."
        );

        const slider = document.createElement("span");
        slider.className = "habitslider";

        const name = document.createElement("span");
        name.className = "habitname";
        name.innerText = definition.name;

        switchElement.appendChild(slider);
        switchElement.appendChild(name);
        recipeItem.appendChild(switchElement);
        recipeItem.addEventListener("click", function () {
            selectSpiceRecipe(recipe.id);
        });

        recipeList.appendChild(recipeItem);
    });

    group.appendChild(recipeList);
    list.appendChild(group);
}

function refreshSpiceCraftRows() {
    if (typeof SPICE_CRAFT_RECIPES === "undefined") return;
    SPICE_CRAFT_RECIPES.forEach(function (recipe) {
        const row = document.getElementById("spicerecipe-" + recipe.id);
        if (row) row.classList.toggle("unavailable", !canCraftSpice(recipe));
        if (row) row.classList.toggle(
            "selected",
            selectedSpiceRecipeId === recipe.id
        );
    });
}

function renderSpiceResources(panel, recipe) {
    panel.appendChild(createCraftPanelTitle("Required resources"));

    const container = document.createElement("div");
    container.className = "craftresources";
    container.dataset.spiceRecipeId = recipe.id;

    recipe.resources.forEach(function (requirement) {
        const definition = RESOURCE_DEFS[requirement.resourceId];
        if (!definition) return;

        const have = getResourceAmount(requirement.resourceId);
        const row = document.createElement("div");
        row.className = "craftresource "
            + (have >= requirement.amount ? "enough" : "missing");
        row.dataset.spiceResource = requirement.resourceId;
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

    const skillRow = document.createElement("div");
    skillRow.className = "craftskillrow";
    skillRow.innerText = "Skill: Cooking Lv "
        + round2(getEffectiveLevel("cooking"));
    panel.appendChild(skillRow);

    const qualityRow = document.createElement("div");
    qualityRow.className = "craftskillrow";
    qualityRow.innerText = "Expected quality: "
        + round2(getSpiceCraftQuality(recipe));
    panel.appendChild(qualityRow);
}

function renderSpiceDetails(panel, recipe) {
    panel.appendChild(createCraftPanelTitle("Result"));

    const spiceId = getSpiceCraftSpiceId(recipe);
    const definition = spiceId != null ? RESOURCE_DEFS[spiceId] : null;
    if (!definition) return;

    const quality = getSpiceCraftQuality(recipe);
    const info = document.createElement("div");
    info.className = "craftdetailsitem";

    info.appendChild(createItemImage(definition.name, "craftitemicon"));

    const heading = document.createElement("div");
    heading.innerText = definition.name + " | quality: " + round2(quality);
    info.appendChild(heading);

    const tagBox = document.createElement("div");
    tagBox.className = "crafttags";
    const tag = document.createElement("span");
    tag.className = "crafttag";
    tag.innerText = "Kitchen spice";
    tagBox.appendChild(tag);
    info.appendChild(tagBox);

    const bonuses = definition.potentialBonuses;
    if (bonuses && typeof bonuses === "object") {
        Object.keys(bonuses).forEach(function (statKey) {
            const value = Number(bonuses[statKey]);
            if (!Number.isFinite(value) || value <= 0) return;
            const row = document.createElement("div");
            row.className = "craftnote";
            row.innerText = "Dish bonus: " + describeItemStat(
                statKey,
                value * (1 + quality / 10)
            );
            info.appendChild(row);
        });
    }

    const description = document.createElement("div");
    description.className = "craftitemdescription";
    description.innerText = definition.description;
    info.appendChild(description);

    panel.appendChild(info);

    const button = document.createElement("button");
    button.type = "button";
    button.id = "foodspicecraftbutton";
    button.className = "craftbutton";
    button.innerText = "Grind 1";
    button.disabled = !canCraftSpice(recipe);
    button.addEventListener("click", function () {
        craftSpice(recipe);
    });
    panel.appendChild(button);

    panel.dataset.craftQuality = "spice:" + String(quality);
}

function refreshSpiceCraftSelection() {
    const recipe = getSelectedSpiceRecipe();
    if (!recipe) return;
    refreshSpiceCraftRows();

    const button = document.getElementById("foodspicecraftbutton");
    if (button) button.disabled = !canCraftSpice(recipe);

    const panel = document.getElementById("foodcraftdescription");
    if (!panel) return;
    const container = panel.querySelector("[data-spice-recipe-id]");
    if (!container || container.dataset.spiceRecipeId !== recipe.id) {
        renderCraftResources(getCraftCategory("food"));
        return;
    }

    recipe.resources.forEach(function (requirement) {
        const row = container.querySelector(
            '[data-spice-resource="' + requirement.resourceId + '"]'
        );
        if (!row) return;
        const have = getResourceAmount(requirement.resourceId);
        const amount = row.querySelector(".craftresource-amount");
        if (amount) amount.innerText = round2(have) + " / " + requirement.amount;
        row.classList.toggle("enough", have >= requirement.amount);
        row.classList.toggle("missing", have < requirement.amount);
    });
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

// Same listbox as the ingredient picker, but for inventory items (flat bread).
function createCraftItemSelect(options) {
    const settings = options || {};
    const items = Array.isArray(settings.items) ? settings.items : [];
    const selectedItem = settings.selectedItem || null;
    const onSelect = typeof settings.onSelect === "function"
        ? settings.onSelect
        : function () {};

    const wrapper = document.createElement("div");
    wrapper.className = "craftingredient-select";
    if (settings.id) wrapper.id = settings.id;
    wrapper.dataset.instanceId = selectedItem
        ? String(selectedItem.instanceId)
        : "";

    const addIcon = function (parent, item) {
        if (!item) {
            const empty = document.createElement("span");
            empty.className = "craftingredient-icon empty";
            parent.appendChild(empty);
            return;
        }
        parent.appendChild(createItemImage(
            getCraftItemChoiceName(item),
            "craftingredient-icon"
        ));
    };

    const current = document.createElement("button");
    current.type = "button";
    current.className = "craftingredient-current";
    addIcon(current, selectedItem);

    const currentName = document.createElement("span");
    currentName.className = "craftingredient-name";
    currentName.innerText = selectedItem
        ? getCraftItemChoiceLabel(selectedItem)
        : "-None-";
    current.appendChild(currentName);

    const arrow = document.createElement("span");
    arrow.className = "craftingredient-arrow";
    arrow.innerText = "▼";
    current.appendChild(arrow);

    const menu = document.createElement("div");
    menu.className = "craftingredient-menu";

    if (settings.includeNone === true) {
        const noneOption = document.createElement("button");
        noneOption.type = "button";
        noneOption.className = "craftingredient-option";
        noneOption.dataset.instanceId = "";

        const noneIcon = document.createElement("span");
        noneIcon.className = "craftingredient-icon empty";
        noneOption.appendChild(noneIcon);

        const noneLabel = document.createElement("span");
        noneLabel.className = "craftingredient-option-label";
        noneLabel.innerText = "-None-";
        noneOption.appendChild(noneLabel);

        noneOption.addEventListener("click", function (event) {
            event.stopPropagation();
            wrapper.classList.remove("open");
            onSelect(null);
        });

        menu.appendChild(noneOption);
    }

    items.forEach(function (item) {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "craftingredient-option";
        option.dataset.instanceId = String(item.instanceId);
        addIcon(option, item);

        const label = document.createElement("span");
        label.className = "craftingredient-option-label";
        label.innerText = getCraftItemChoiceLabel(item);
        option.appendChild(label);

        option.addEventListener("click", function (event) {
            event.stopPropagation();
            wrapper.classList.remove("open");
            onSelect(item.instanceId);
        });

        menu.appendChild(option);
    });

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

    if (category.id === "food") {
        const spiceRecipe = getSelectedSpiceRecipe();
        if (spiceRecipe) {
            renderSpiceResources(panel, spiceRecipe);
            return;
        }
    }

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
    }

    // Bonus ingredients are independent of the main ingredient picker: soups
    // use five fixed ingredient slots but still take Cooking bonus slots.
    const bonusChoices = getCraftBonusChoices(recipe);

    const craftItemChoice = getCraftItemChoice(recipe);
    if (craftItemChoice) {
        const itemChoices = getCraftItemChoices(recipe);
        const selectedItem = getSelectedCraftItemChoice(recipe);
        const itemBox = document.createElement("div");
        itemBox.className = "craftchoice";

        const itemLabel = document.createElement("label");
        itemLabel.className = "craftchoice-label";
        itemLabel.innerText = craftItemChoice.label || "Choose item:";
        itemLabel.htmlFor = "craftitem-" + category.id + "-" + recipe.id;
        itemBox.appendChild(itemLabel);

        itemBox.appendChild(createCraftItemSelect({
            id: itemLabel.htmlFor,
            items: itemChoices,
            selectedItem: selectedItem,
            includeNone: craftItemChoice.optional === true,
            onSelect: function (instanceId) {
                setCraftItemChoice(recipe, instanceId);
                renderCraftList(category);
                renderCraftResources(category);
                renderCraftDetails(category);
                refreshCraftAvailability();
            },
        }));

        panel.appendChild(itemBox);
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

    // Bonus ingredients are optional and come from the Cooking level; soups
    // double the number of these slots.
    if (bonusChoices.length) {
        const bonusBox = document.createElement("div");
        bonusBox.className = "craftchoice craftchoice-bonus";

        const bonusLabel = document.createElement("div");
        bonusLabel.className = "craftchoice-label";
        bonusLabel.innerText = "Bonus ingredients (optional, "
            + bonusChoices.length + " slot"
            + (bonusChoices.length === 1 ? "" : "s")
            + ((recipe.bonusChoiceSlotsFromCooking === true
                || isExtraIngredientDish(recipe)) ? " from Cooking" : "")
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

    const sauceChoices = getCraftSauceChoices(recipe);
    if (sauceChoices.length) {
        const sauceBox = document.createElement("div");
        sauceBox.className = "craftchoice craftchoice-sauce";
        sauceBox.dataset.craftSauceSlots = String(sauceChoices.length);

        const sauceLabel = document.createElement("div");
        sauceLabel.className = "craftchoice-label";
        sauceLabel.innerText = "Extra sauces (optional, "
            + sauceChoices.length + " slot"
            + (sauceChoices.length === 1 ? "" : "s")
            + " from Cooking):";
        sauceBox.appendChild(sauceLabel);

        const inventorySauces = getCraftSauceInventoryItems();
        sauceChoices.forEach(function (selectedInstanceId, index) {
            const usedIds = sauceChoices.filter(function (id, slotIndex) {
                return slotIndex !== index && id != null;
            }).map(Number);
            const available = inventorySauces.filter(function (item) {
                return usedIds.indexOf(Number(item.instanceId)) === -1;
            });
            const selectedItem = inventorySauces.find(function (item) {
                return Number(item.instanceId) === Number(selectedInstanceId);
            }) || null;

            const row = document.createElement("div");
            row.className = "craftchoice-bonus-row";

            const slotLabel = document.createElement("span");
            slotLabel.className = "craftchoice-slot-label";
            slotLabel.innerText = "Sauce " + (index + 1);

            const sauceSelect = createCraftItemSelect({
                id: "craftsauce-" + category.id + "-" + recipe.id + "-" + index,
                items: available,
                selectedItem: selectedItem,
                includeNone: true,
                onSelect: function (instanceId) {
                    setCraftSauceChoice(recipe, index, instanceId);
                    renderCraftResources(category);
                    renderCraftDetails(category);
                    refreshCraftAvailability();
                },
            });

            row.appendChild(slotLabel);
            row.appendChild(sauceSelect);
            sauceBox.appendChild(row);
        });

        panel.appendChild(sauceBox);
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

    if (craftItemChoice) {
        const selectedItem = getSelectedCraftItemChoice(recipe);
        const optional = craftItemChoice.optional === true;
        const firstId = getCraftItemChoiceIds(craftItemChoice)[0];
        const firstDefinition = firstId != null ? ITEM_DEFS[firstId] : null;
        const itemName = craftItemChoice.rowLabel
            || (firstDefinition ? firstDefinition.name : "Item");
        const itemRow = document.createElement("div");
        itemRow.className = "craftskillrow" + (!selectedItem && !optional ? " missing" : "");
        itemRow.dataset.craftItemChoice = "1";
        itemRow.innerText = itemName + (optional ? " (optional)" : "")
            + ": " + (selectedItem ? "1 / 1" : "0 / 1");
        panel.appendChild(itemRow);
    }
}

function renderCraftDetails(category) {
    const panel = document.getElementById(category.id + "craftdetails");
    if (!panel) return;

    panel.innerHTML = "";

    if (category.id === "food") {
        const spiceRecipe = getSelectedSpiceRecipe();
        if (spiceRecipe) {
            renderSpiceDetails(panel, spiceRecipe);
            return;
        }
    }

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

    const tags = getCraftRecipeTags(recipe);
    if (tags.length) {
        const tagBox = document.createElement("div");
        tagBox.className = "crafttags";
        tags.forEach(function (tagId) {
            const tag = document.createElement("span");
            tag.className = "crafttag";
            tag.innerText = getCraftTagLabel(tagId);
            tagBox.appendChild(tag);
        });
        info.appendChild(tagBox);
    }

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

    selectedSpiceRecipeId = null;
    selectedCraftByCategory[categoryId] = recipeId;

    renderCraftList(category);
    renderCraftResources(category);
    renderCraftDetails(category);
    refreshCraftAvailability();
}

function getSelectedSpiceRecipe() {
    if (selectedSpiceRecipeId == null) return null;
    if (typeof SPICE_CRAFT_RECIPES === "undefined") return null;
    return SPICE_CRAFT_RECIPES.find(function (recipe) {
        return recipe.id === selectedSpiceRecipeId;
    }) || null;
}

function selectSpiceRecipe(recipeId) {
    const category = getCraftCategory("food");
    if (!category) return;
    if (typeof SPICE_CRAFT_RECIPES === "undefined") return;
    const exists = SPICE_CRAFT_RECIPES.some(function (recipe) {
        return recipe.id === recipeId;
    });
    if (!exists) return;

    selectedSpiceRecipeId = recipeId;
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
        if (category.id === "food" && getSelectedSpiceRecipe()) {
            refreshSpiceCraftSelection();
            return;
        }

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

            if (getCraftBonusSlotCount(recipe) > 0) {
                const bonusBox = resourcesPanel.querySelector(".craftchoice-bonus");
                const renderedSlots = bonusBox
                    ? bonusBox.querySelectorAll(".craftchoice-bonus-row").length
                    : 0;
                if (renderedSlots !== getCraftBonusChoices(recipe).length) {
                    renderCraftResources(category);
                }
            }

            if (getCraftSauceSlotCount(recipe) > 0) {
                const sauceBox = resourcesPanel.querySelector(".craftchoice-sauce");
                const renderedSauceSlots = sauceBox
                    ? sauceBox.querySelectorAll(".craftchoice-bonus-row").length
                    : 0;
                if (renderedSauceSlots !== getCraftSauceChoices(recipe).length) {
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

            // The flat-bread list can change after every bake, so rebuild the
            // picker when the available items or the selection no longer match.
            if (getCraftItemChoice(recipe)) {
                const itemSelect = resourcesPanel.querySelector(
                    ".craftingredient-select[data-instance-id]"
                );
                const selectedItem = getSelectedCraftItemChoice(recipe);
                const expectedId = selectedItem
                    ? String(selectedItem.instanceId)
                    : "";
                const renderedOptions = resourcesPanel.querySelectorAll(
                    ".craftingredient-option[data-instance-id]"
                ).length;
                const expectedOptions = getCraftItemChoices(recipe).length
                    + (getCraftItemChoice(recipe).optional === true ? 1 : 0);
                if (!itemSelect
                    || itemSelect.dataset.instanceId !== expectedId
                    || renderedOptions !== expectedOptions) {
                    renderCraftResources(category);
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

    refreshSpiceCraftRows();
}

// --- automatic food crafting ----------------------------------------------

function getAutoCookBonusSlotCount(recipe) {
    if (typeof getCraftBonusSlotCount === "function") {
        return getCraftBonusSlotCount(recipe);
    }
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
    // Only edible results are auto-cooked: raw dough and pasta are ingredients.
    const resultDefinition = recipe && getItemDefinition(recipe.itemId);
    if (!resultDefinition || !resultDefinition.food) return null;

    const choiceIds = getCraftChoiceResourceIds(recipe);
    const choiceAmount = Math.max(1, Number(recipe.choiceAmount) || 1);
    const bonusAmount = Math.max(1, Number(recipe.bonusChoiceAmount) || 1);
    const extrasEnabled = level >= 5
        && (typeof isHabitEnabled !== "function"
            || isHabitEnabled("dietAutoCookExtras"));
    const bonusCount = extrasEnabled ? getAutoCookBonusSlotCount(recipe) : 0;
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

    // Mandatory ingredient slots (salads, soup) are filled the same way.
    const slotChoices = {};
    const slots = getCraftChoiceSlots(recipe);
    for (let index = 0; index < slots.length; index++) {
        const slot = slots[index];
        const amount = Math.max(1, Number(slot.amount) || 1);
        const picked = pickAutoCookResource(
            slot.resourceIds,
            amount,
            remaining,
            ingredientPriority
        );
        if (picked == null) return null;
        slotChoices[slot.id] = picked;
    }

    // Inventory ingredient: use whatever is already in the bag. A mandatory
    // one may be crafted just in time at DietBasics level 7.
    let itemInstanceId = null;
    const itemChoice = getCraftItemChoice(recipe);
    if (itemChoice) {
        const items = getCraftItemChoices(recipe);
        if (items.length) {
            const picked = items[Math.floor(Math.random() * items.length)];
            itemInstanceId = picked.instanceId;
        } else if (itemChoice.optional !== true && level < 7) {
            return null;
        }
    }

    const bonusResourceIds = [];
    const bonusCandidateIds = getCraftBonusResourceIds(recipe);
    for (let index = 0; index < bonusCount; index++) {
        if (level < 5 || !bonusCandidateIds.length) {
            bonusResourceIds.push(null);
            continue;
        }

        const bonusResourceId = pickAutoCookResource(
            bonusCandidateIds,
            bonusAmount,
            remaining,
            ingredientPriority
        );
        bonusResourceIds.push(bonusResourceId == null ? null : bonusResourceId);
    }

    const sauceInstanceIds = [];
    if (extrasEnabled && typeof getCraftSauceSlotCount === "function") {
        const sauceCount = getCraftSauceSlotCount(recipe);
        const sauceItems = getCraftSauceInventoryItems().slice();
        for (let index = sauceItems.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            const temporary = sauceItems[index];
            sauceItems[index] = sauceItems[swapIndex];
            sauceItems[swapIndex] = temporary;
        }
        for (let index = 0; index < sauceCount; index++) {
            sauceInstanceIds.push(
                sauceItems[index] ? sauceItems[index].instanceId : null
            );
        }
    }

    return {
        choiceResourceId: choiceResourceId,
        bonusResourceIds: bonusResourceIds,
        slotChoices: slotChoices,
        itemInstanceId: itemInstanceId,
        sauceInstanceIds: sauceInstanceIds,
    };
}

// Level 7: find the recipe for a mandatory inventory ingredient that must be
// crafted before the dish itself.
function getAutoCookPreCraftRecipe(recipe) {
    const itemChoice = getCraftItemChoice(recipe);
    if (!itemChoice || itemChoice.optional === true) return null;
    if (getCraftItemChoices(recipe).length) return null;

    const allowedIds = getCraftItemChoiceIds(itemChoice);
    return CRAFT_RECIPES.find(function (candidate) {
        return allowedIds.indexOf(candidate.itemId) !== -1
            && canCraftRecipe(candidate);
    }) || null;
}

// Combined resource cost of the dish and its pre-crafted ingredient, so the
// auto-cooker never spends resources it still needs for the main recipe.
function canAffordCraftIngredients(recipe, ingredientRecipe) {
    const needed = Object.create(null);

    [recipe, ingredientRecipe].forEach(function (entry) {
        if (!entry) return;
        getCraftRequirements(entry).forEach(function (requirement) {
            const resourceId = Number(requirement.resourceId);
            const amount = Math.max(1, Number(requirement.amount) || 1);
            needed[resourceId] = (needed[resourceId] || 0) + amount;
        });
    });

    return Object.keys(needed).every(function (resourceId) {
        return getResourceAmount(Number(resourceId)) >= needed[resourceId];
    });
}

function tryAutoCookRecipe(recipe, level, priorityStat) {
    const choices = buildAutoCookChoices(recipe, level, priorityStat);
    if (!choices) return false;

    const previousChoice = selectedCraftChoiceByRecipe[recipe.id];
    const previousBonusChoices = selectedCraftBonusChoicesByRecipe[recipe.id];
    const previousSlotChoices = selectedCraftSlotChoicesByRecipe[recipe.id];
    const hadItemChoice = Object.prototype.hasOwnProperty.call(
        selectedCraftItemByRecipe,
        recipe.id
    );
    const previousItemChoice = selectedCraftItemByRecipe[recipe.id];
    const hadSauceChoices = Object.prototype.hasOwnProperty.call(
        selectedCraftSauceItemsByRecipe,
        recipe.id
    );
    const previousSauceChoices = selectedCraftSauceItemsByRecipe[recipe.id];

    if (choices.choiceResourceId != null) {
        selectedCraftChoiceByRecipe[recipe.id] = choices.choiceResourceId;
    } else {
        delete selectedCraftChoiceByRecipe[recipe.id];
    }
    selectedCraftBonusChoicesByRecipe[recipe.id] = choices.bonusResourceIds;
    if (getCraftChoiceSlots(recipe).length) {
        selectedCraftSlotChoicesByRecipe[recipe.id] = Object.assign(
            {},
            choices.slotChoices
        );
    }
    if (getCraftItemChoice(recipe)) {
        selectedCraftItemByRecipe[recipe.id] = choices.itemInstanceId;
    }
    if (choices.sauceInstanceIds.length) {
        selectedCraftSauceItemsByRecipe[recipe.id] =
            choices.sauceInstanceIds.slice();
    } else {
        delete selectedCraftSauceItemsByRecipe[recipe.id];
    }

    let crafted = false;
    try {
        if (level >= 7) {
            const ingredientRecipe = getAutoCookPreCraftRecipe(recipe);
            if (ingredientRecipe) {
                // Never spend an ingredient before the dish itself is
                // guaranteed to be cookable (tool, station and power gates).
                const dishReady = hasCraftToolPower(recipe)
                    && canMeetCraftStationRequirements(recipe)
                    && (recipe.requiresCookingPower !== true
                        || getCraftCookingPower() > 0);
                if (!dishReady
                    || !canAffordCraftIngredients(recipe, ingredientRecipe)
                    || !canCraftRecipe(ingredientRecipe)
                    || !hasFreeInventorySlot()) {
                    return false;
                }

                if (!performCraft(ingredientRecipe)) return false;
                // The fresh ingredient is now part of the inventory; drop the
                // explicit "none" so the mandatory pick selects it.
                delete selectedCraftItemByRecipe[recipe.id];
            }
        }

        const canFit = hasFreeInventorySlot()
            || getCraftInventoryIngredientItems(recipe).length > 0;
        if (canCraftRecipe(recipe) && canFit) {
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

        if (previousSlotChoices === undefined) {
            delete selectedCraftSlotChoicesByRecipe[recipe.id];
        } else {
            selectedCraftSlotChoicesByRecipe[recipe.id] = previousSlotChoices;
        }

        if (hadItemChoice) {
            selectedCraftItemByRecipe[recipe.id] = previousItemChoice;
        } else {
            delete selectedCraftItemByRecipe[recipe.id];
        }

        if (hadSauceChoices) {
            selectedCraftSauceItemsByRecipe[recipe.id] = previousSauceChoices;
        } else {
            delete selectedCraftSauceItemsByRecipe[recipe.id];
        }

        // Auto-cooking temporarily changes the ingredient selection, so put
        // the manual crafting UI back the way the player left it.
        if (typeof renderCraftPanels === "function") {
            renderCraftPanels();
        }
    }

    return crafted;
}

function getAutoCookRecipes() {
    return getCraftRecipesByCategory("food").filter(function (recipe) {
        const definition = typeof getItemDefinition === "function"
            ? getItemDefinition(recipe.itemId)
            : null;
        if (!definition || !definition.food) return false;
        return getCraftRecipeTags(recipe).indexOf("ingredient") === -1;
    });
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

    const recipes = getAutoCookRecipes();

    // Random dish order: every attempt starts with a random available meal.
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

    const itemChoice = getCraftItemChoice(recipe);
    const chosenItem = getSelectedCraftItemChoice(recipe);
    const selectedSauces = getSelectedCraftSauceItems(recipe);
    if (itemChoice && !chosenItem && itemChoice.optional !== true) {
        const neededDefinition = ITEM_DEFS[getCraftItemChoiceIds(itemChoice)[0]];
        logMessage("You need " + (neededDefinition ? neededDefinition.name : "an item")
            + " to craft " + resultName);
        return false;
    }

    if (!canAffordCraft(recipe)) {
        logMessage("Not enough resources to craft " + resultName);
        return false;
    }

    // Consumed items free slots, so a full inventory is fine.
    if (!hasFreeInventorySlot() && !chosenItem && !selectedSauces.length) {
        logMessage("Your inventory is full, cannot craft " + resultName);
        return false;
    }

    const qualityInfo = getCraftQualityInfo(recipe);
    let rarity = rollCraftRarity(qualityInfo.rawQuality, qualityInfo.skillLevel);
    rarity = getItemChoiceBoostedRarity(recipe, rarity);
    const choice = getSelectedCraftChoice(recipe);
    const potentialBonuses = getCraftPotentialBonuses(
        recipe,
        qualityInfo.quality,
        rarity
    );

    if (chosenItem) {
        consumeCraftItemChoice(recipe, chosenItem);
    }

    selectedSauces.forEach(function (sauceItem) {
        const index = player.equipinventory.indexOf(sauceItem);
        if (index !== -1) player.equipinventory[index] = null;
    });
    if (selectedCraftSauceItemsByRecipe[recipe.id]) {
        selectedCraftSauceItemsByRecipe[recipe.id] =
            selectedCraftSauceItemsByRecipe[recipe.id].map(function () {
                return null;
            });
    }

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
