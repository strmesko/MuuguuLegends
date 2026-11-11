//creatin you character
var player = new Character(10,10,10);
player.name = "You";
player.equipinventory[0] = createItemInstance(ITEM_IDS.HANDY_STICK);
ensurePantsEquipped(player);
const LAZY_BASICS_TECHNOLOGY = new Technology(
    "Lazy basics",
    "Clicking Rest every time is so annoying! What you want? You want to automate it, right?<br>Requires: Autism level 1",
    60,
    "habitlazybasics",
    function () {
        return player.autism.lvl >= 1;
    },
    {
        int: BASE_EXP / 10,
        ins: BASE_EXP / 5,
    },
    6,
    [
        "Automatically rest when stamina is low (can be disabled in Habits).",
        "Automatically resume all previous actions after resting (daydreaming is handled separately at level 5).",
        "Automatically start searching after exploration is complete.",
        "Automatically start foraging after searching is complete.",
        "Automatically start daydreaming when there is nothing to do.",
        "Start a new action even with no free action points by cancelling active actions.",
    ]
);
const COZY_SCIENCE_TECHNOLOGY = new Technology(
    "Cozy science",
    "Make science routine less horrible. Lets automate it too.<br>Requires: Lazy basics researched, Intellect level 3, Autism level 5",
    360,
    "habitcozyscience",
    function () {
        return LAZY_BASICS_TECHNOLOGY.level > 0
            && player.int.lvl >= 3
            && player.autism.lvl >= 5;
    },
    null,
    3,
    [
        "Cancel the current action and start research on selection when no research is queued (can be disabled in Habits).",
        "Automatically start the cheapest available research after finishing research (can be disabled in Habits). Also unlocks Scientific plans requirements.",
        "No additional effect yet.",
    ]
);
const DIET_BASICS_TECHNOLOGY = new Technology(
    "DietBasics",
    "Turn eating into a routine instead of a panic. Unlocks automatic eating settings in Habits.<br>Requires: Lazy basics level 1, Autism level 5",
    1200,
    "habitdietbasics",
    function () {
        return LAZY_BASICS_TECHNOLOGY.level >= 1
            && player.autism.lvl >= 5;
    },
    null,
    6,
    [
        "Unlocks the automatic eating threshold in Habits.",
        "Allows choosing a priority stat; food bound to it is eaten first.",
        "Eats cooked food from the inventory before raw edible resources.",
        "During auto-eating, if no cooked food is in the inventory, automatically cooks a random dish without bonus ingredients.",
        "During auto-cooking, fills every available bonus ingredient slot.",
        "During auto-cooking, chooses ingredients bound to the priority stat.",
    ]
);
const HARVEST_THE_YUMMIES_TECHNOLOGY = new Technology(
    "Harvest the yummies",
    "Fruit and nuts are just lying around, waiting to be picked. Automate tree harvesting and make it respect your favourite stat.<br>Requires: Lazy basics Lv6, DietBasics Lv1, Gardening Lv3",
    function (level) {
        return level <= 0 ? 6000 : 10000;
    },
    "habitharvesttheyummies",
    function () {
        return LAZY_BASICS_TECHNOLOGY.level >= 6
            && DIET_BASICS_TECHNOLOGY.level >= 1
            && player.gardening.lvl >= 3;
    },
    null,
    2,
    [
        "Adds the Harvest trees habit. When enabled, automatically starts Trees Harvest if fruit or nut trees are available. Enabling costs 2 focus points; disabling refunds them. Trees Harvest is not remembered as a previous action while enabled.",
        "Allows choosing a priority stat in Habits. Trees whose harvested resource is bound to that stat are chosen first.",
    ]
);
const SCIENTIFIC_PLANS_TECHNOLOGY = new Technology(
    "Scientific plans",
    function (technology) {
        return "Plan your research ahead. Each level increases the research queue by 1.<br>Requires: Cozy science level 2, Autism level " + (3 + technology.level) + ", Science level " + (1 + technology.level);
    },
    function (level) {
        return 600 * (level + 1);
    },
    "habitscientificplans",
    function (technology) {
        return COZY_SCIENCE_TECHNOLOGY.level >= 2
            && player.autism.lvl >= 3 + technology.level
            && player.science.lvl >= 1 + technology.level;
    },
    null,
    Infinity,
    function () {
        return "Every level: research queue +1 (infinite levels).";
    }
);
const SKILL_POTENTIAL_TECHNOLOGY = new Technology(
    "My skills needs potental",
    "You feel little dumb with just 100% potential, right? Lets shiver your brains and get beyond to the infinity",
    function (level) {
        return 1000 * Math.pow(1.05, level);
    },
    "knowledgepotental",
    function () {
        return player.autism.lvl >= 10 && player.science.lvl >= 5;
    },
    null,
    Infinity,
    function () {
        return "Every level: +1% potential for all skills and stats, even above 100%.<br>Requires: Autism level 10, Science level 5.<br>Research cost increases by 5% per level.";
    },
    function () {
        increaseAllPotentials(1);
    }
);
const NOT_SO_WORTHLESS_TECHNOLOGY = new Technology(
    "NotSoWorthless",
    "Maybe you are not completely worthless after all. Sharpen your body and mind.",
    function (level) {
        return 2000 * Math.pow(1.2, level);
    },
    "knowledgenotsoworthless",
    function (technology) {
        const requiredStatLevel = 1 + technology.level;
        const requiredStats = ["str", "agi", "vit", "per", "int", "ins"];

        return player.autism.lvl >= 10
            && player.science.lvl >= requiredStatLevel
            && requiredStats.every(function (statName) {
                return player[statName].lvl >= requiredStatLevel;
            });
    },
    null,
    Infinity,
    function (technology) {
        return "Every level: +1% minimum potential for all skills and stats (cumulative).<br>Requires: Autism level 10, Science level " + (1 + technology.level) + ", str/agi/vit/per/int/ins level " + (1 + technology.level) + ".<br>Research cost increases by 20% per level.";
    },
    function () {
        increaseMinPotential(MIN_POTENTIAL_BONUS_PER_LEVEL);
    }
);
const TECHNOLOGIES = [LAZY_BASICS_TECHNOLOGY, COZY_SCIENCE_TECHNOLOGY, DIET_BASICS_TECHNOLOGY, HARVEST_THE_YUMMIES_TECHNOLOGY, SCIENTIFIC_PLANS_TECHNOLOGY, SKILL_POTENTIAL_TECHNOLOGY, NOT_SO_WORTHLESS_TECHNOLOGY];

const DIET_AUTO_EAT_MIN_PERCENT = 1;
const DIET_AUTO_EAT_MAX_PERCENT = 100;
const DIET_AUTO_EAT_DEFAULT_PERCENT = 50;
var dietAutoEatThresholdPercent = DIET_AUTO_EAT_DEFAULT_PERCENT;
var dietPriorityStat = "";
var harvestTreePriorityStat = "";
const HARVEST_TREES_FOCUS_COST = 2;

function clampDietAutoEatThreshold(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return DIET_AUTO_EAT_DEFAULT_PERCENT;
    return Math.min(
        DIET_AUTO_EAT_MAX_PERCENT,
        Math.max(DIET_AUTO_EAT_MIN_PERCENT, Math.round(numeric))
    );
}

function getDietAutoEatThresholdPercent() {
    return DIET_BASICS_TECHNOLOGY.level >= 1
        ? clampDietAutoEatThreshold(dietAutoEatThresholdPercent)
        : DIET_AUTO_EAT_DEFAULT_PERCENT;
}

function getDietPriorityStat() {
    return DIET_BASICS_TECHNOLOGY.level >= 2
        && CORE_STAT_NAMES.includes(dietPriorityStat)
        ? dietPriorityStat
        : null;
}

function getHarvestTreePriorityStat() {
    return HARVEST_THE_YUMMIES_TECHNOLOGY.level >= 2
        && CORE_STAT_NAMES.includes(harvestTreePriorityStat)
        ? harvestTreePriorityStat
        : null;
}

function isHarvestTreesAutomationEnabled() {
    return HARVEST_THE_YUMMIES_TECHNOLOGY.level >= 1
        && isHabitEnabled("harvestTrees");
}

maxInventory = DEFAULT_MAX_INVENTORY;
var lastUpdate = Date.now();
var currentTile = {
    x: 0,
    y: 0,
    revealed: 0,
    investigated: 0,
    hiddenstuff: 0,
    land: {
        trees: 0,
        grass: 0,
        rocks: 0,
        water: 0,
    },
    resourceMultipliers: {},
    space: {
        EmptySpace: 1000,
        RoomSpace: 0,
    },
    harvestedTrees: {},
};
logLength = DEFAULT_LOG_LENGTH;
maxActions = DEFAULT_MAX_ACTIONS;
actionsCount = maxActions;
searchOpened = 0;
var focusPoints = 0;

var HABIT_CATEGORIES = [
    {
        id: "explore",
        name: "Explore",
        habits: [
            {
                id: "autoRest",
                name: "Auto rest when stamina is low",
                description: "Lazy basics: automatically start resting when stamina is low.",
                requiredLevel: 1,
            },
            {
                id: "searchAfterExplore",
                name: "start searching after explore",
                description: "Lazy basics: automatically start searching after exploration is complete.",
                requiredLevel: 3,
            },
        ],
    },
    {
        id: "science",
        name: "Science",
        habits: [
            {
                id: "daydreamIdle",
                name: "Daydream where is nothing to do",
                description: "Lazy basics: automatically start daydreaming when no timed action is active.",
                requiredLevel: 5,
            },
            {
                id: "cozyScienceAutoResearch",
                name: "Auto switch to research on selection",
                description: "Cozy science: cancel the current action and start researching when no research is queued.",
                requiredTechnology: "cozyScience",
                requiredLevel: 1,
            },
            {
                id: "cozyScienceAutoNext",
                name: "Auto start cheapest available research",
                description: "Cozy science: after finishing research, automatically start the cheapest available research.",
                requiredTechnology: "cozyScience",
                requiredLevel: 2,
            },
        ],
    },
    {
        id: "diet",
        name: "Diet",
        habits: [
            {
                id: "dietAutoEatThreshold",
                name: "Auto-eat threshold",
                description: "DietBasics: automatically eat when hunger reaches this percentage of maximum hunger.",
                requiredTechnology: "dietBasics",
                requiredLevel: 1,
                control: "range",
                min: DIET_AUTO_EAT_MIN_PERCENT,
                max: DIET_AUTO_EAT_MAX_PERCENT,
                step: 1,
            },
            {
                id: "dietPriorityStat",
                name: "Priority stat",
                description: "DietBasics level 2: eat food bound to this stat before all other food. Level 6: auto-cooking chooses ingredients bound to this stat.",
                requiredTechnology: "dietBasics",
                requiredLevel: 2,
                control: "select",
            },
        ],
    },
    {
        id: "gathering",
        name: "Gathering",
        habits: [
            {
                id: "harvestTrees",
                name: "Harvest trees",
                description: "Harvest the yummies: automatically start Trees Harvest when fruit or nut trees are available. Enabling costs 2 focus points; disabling refunds them.",
                requiredTechnology: "harvestTheYummies",
                requiredLevel: 1,
                defaultEnabled: false,
            },
            {
                id: "harvestTreePriorityStat",
                name: "Harvest priority stat",
                description: "Harvest the yummies level 2: trees whose harvested resource is bound to this stat are chosen first.",
                requiredTechnology: "harvestTheYummies",
                requiredLevel: 2,
                control: "select",
            },
        ],
    },
];

var habitToggles = {};
HABIT_CATEGORIES.forEach(function (category) {
    category.habits.forEach(function (habit) {
        if (habit.control) return;
        habitToggles[habit.id] = habit.defaultEnabled !== false;
    });
});

function isHabitEnabled(habitId) {
    return habitToggles[habitId] !== false;
}

function updateFocusPointsDisplay() {
    const display = document.getElementById('focuspoints');
    if (display) display.innerText = 'Focus points: ' + focusPoints;
}

var landTotals = {
    trees: 0,
    grass: 0,
    rocks: 0,
    water: 0,
};
//stonks being here
var resources = {};
Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
    resources[resourceId] = new ResourceStack(Number(resourceId));
});

// New game: every edible resource gets its permanent stat binding here.
// The roll is deterministic and depends on the seed of the generated map.
ensureFoodStatBindings(getOrCreateMapSeed());

function addResource(resourceId, amount, quality) {
    const stack = resources[resourceId];
    if (!stack) {
        logMessage("Unknown resource id: " + resourceId);
        return false;
    }
    // Quality is optional: anything that does not provide it adds resource of
    // default quality. The stack quality is a weighted average, so it shifts
    // proportionally to the amount already stored and the amount being added.
    const batchQuality = Number.isFinite(quality) && quality > 0
        ? quality
        : RESOURCE_DEFAULT_QUALITY;
    if (Number.isFinite(amount) && amount > 0) {
        stack.modify(amount, batchQuality);
        stack.amount += amount;
    }
    return true;
}
