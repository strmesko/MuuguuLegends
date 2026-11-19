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
    8,
    [
        "Unlocks the automatic eating threshold in Habits.",
        "Allows choosing a priority stat; food bound to it is eaten first.",
        "Eats cooked food from the inventory before raw edible resources.",
        "During auto-eating, if no cooked food is in the inventory, automatically cooks a random dish without bonus ingredients.",
        "During auto-cooking, fills every available bonus ingredient slot with spices, sauces and other suitable extras when the habit is enabled.",
        "During auto-cooking, chooses ingredients bound to the priority stat.",
        "Before auto-cooking, crafts missing ingredient items (such as flat bread) and includes their cost when deciding whether the dish is affordable.",
        "Allows restricting auto-cooking to one cuisine category in Habits.",
    ]
);
const FAUNA_BULLY_TECHNOLOGY = new Technology(
    "Fauna bully",
    "Learn to pick fights with the local wildlife on your own terms. Each level makes the habit smarter and more survivable.<br>Requires: DietBasics level 1, Autism level 10 (+5 per level)",
    function (level) {
        return 20000 + 10000 * level;
    },
    "habitfaunabully",
    function (technology) {
        return DIET_BASICS_TECHNOLOGY.level >= 1
            && player.autism.lvl >= 10 + 5 * technology.level;
    },
    null,
    4,
    [
        "Unlocks the Bully local fauna habit. When enabled, combat starts automatically at full HP if you are not resting or travelling.",
        "Will not attack monsters with a higher level than the character.",
        "Automatically uses Spirit Speak during combat when HP is below half and there is enough mana.",
        "Automatically uses Spirit Speak when current HP plus the heal amount is below Max HP.",
    ],
    function () {
        if (typeof updateHabitVisibility === "function") updateHabitVisibility();
        if (typeof updateHabitSettings === "function") updateHabitSettings();
    }
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
const SURVIVAL_101_TECHNOLOGY = new Technology(
    "Survival 101",
    "There are so much funky things to do in the wilderness, but first things first",
    function (level) {
        return 4000 + 2000 * level;
    },
    "knowledgesurvival101",
    function (technology) {
        return player.autism.lvl >= 2 + technology.level * 2
            && SKILL_POTENTIAL_TECHNOLOGY.level >= 1;
    },
    null,
    9,
    [
        "Unlocks the Make fibers action.",
        "Unlocks building the Campfire.",
        "Unlocks crafting the stick kebob.",
        "Unlocks leaf shirt, leaf trousers, leaf leggings and leaf boots.",
        "Unlocks the rest of the leaf clothing set.",
        "Unlocks the Survival Pounch and Straw basket backpack.",
        "Unlocks the Stone Axe and Stone Hammer.",
        "Unlocks the Flint Spear, Flint Knife and Flint Pickaxe.",
        "Unlocks building the Tent and Leaf Bedroll.",
    ],
    function () {
        refreshUnlockedContent();
    }
);

const BUILDINGS_TECHNOLOGY = new Technology(
    "Buildings",
    "endless wandering would be tiresome. why wont to settle down?",
    function (level) {
        return 100000 + 10000 * level;
    },
    "knowledgebuildings",
    function (technology) {
        return player.autism.lvl >= 10 + technology.level * 5
            && SURVIVAL_101_TECHNOLOGY.level >= 9;
    },
    null,
    4,
    [
        "Unlocks building the Stone house.",
        "Unlocks building the Log cabin.",
        "Unlocks building the Stone shed.",
        "Unlocks building the Clay House.",
    ],
    function () {
        refreshUnlockedContent();
    }
);

const TECHNOLOGIES = [LAZY_BASICS_TECHNOLOGY, COZY_SCIENCE_TECHNOLOGY, DIET_BASICS_TECHNOLOGY, HARVEST_THE_YUMMIES_TECHNOLOGY, SCIENTIFIC_PLANS_TECHNOLOGY, SKILL_POTENTIAL_TECHNOLOGY, NOT_SO_WORTHLESS_TECHNOLOGY, SURVIVAL_101_TECHNOLOGY, BUILDINGS_TECHNOLOGY];

// --- unified content unlocks ------------------------------------------------
// Every gated crafting recipe, building and action declares its technology
// requirement once, here. Craft, build and action code all ask these helpers,
// so a new gate only needs one entry instead of a check in every system.
const CONTENT_UNLOCK_TECHNOLOGIES = Object.freeze({
    survival101: SURVIVAL_101_TECHNOLOGY,
    buildings: BUILDINGS_TECHNOLOGY,
});

const CONTENT_UNLOCK_REQUIREMENTS = Object.freeze({
    // Survival 101: crafting
    "craft:kebob-on-stick": Object.freeze({ technology: "survival101", level: 3 }),
    "craft:leaf-shirt": Object.freeze({ technology: "survival101", level: 4 }),
    "craft:leaf-trousers": Object.freeze({ technology: "survival101", level: 4 }),
    "craft:leaf-leggings": Object.freeze({ technology: "survival101", level: 4 }),
    "craft:leaf-boots": Object.freeze({ technology: "survival101", level: 4 }),
    "craft:leaf-of-nature": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-hood": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-mask": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-necklace": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-shoulderpads": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-cloak": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-belt": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-glove-i": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-wristband-i": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-anklet-i": Object.freeze({ technology: "survival101", level: 5 }),
    "craft:leaf-survival-pounch": Object.freeze({ technology: "survival101", level: 6 }),
    "craft:leaf-straw-basket-backpack": Object.freeze({ technology: "survival101", level: 6 }),
    "craft:stone-axe": Object.freeze({ technology: "survival101", level: 7 }),
    "craft:stone-hammer": Object.freeze({ technology: "survival101", level: 7 }),
    "craft:flint-spear": Object.freeze({ technology: "survival101", level: 8 }),
    "craft:flint-knife": Object.freeze({ technology: "survival101", level: 8 }),
    "craft:flint-pickaxe": Object.freeze({ technology: "survival101", level: 8 }),
    // Survival 101: buildings and actions
    "building:campfire": Object.freeze({ technology: "survival101", level: 2 }),
    "building:tent": Object.freeze({ technology: "survival101", level: 9 }),
    "building:leaf-bedroll": Object.freeze({ technology: "survival101", level: 9 }),
    "action:makefibers": Object.freeze({ technology: "survival101", level: 1 }),
    // Buildings technology: houses
    "building:stone-house": Object.freeze({ technology: "buildings", level: 1 }),
    "building:log-cabin": Object.freeze({ technology: "buildings", level: 2 }),
    "building:stone-shed": Object.freeze({ technology: "buildings", level: 3 }),
    "building:clay-house": Object.freeze({ technology: "buildings", level: 4 }),
});

function getContentUnlockRequirement(contentType, contentId) {
    if (!contentType || !contentId) return null;
    return CONTENT_UNLOCK_REQUIREMENTS[String(contentType) + ":" + String(contentId)]
        || null;
}

function getContentUnlockTechnology(technologyKey) {
    return CONTENT_UNLOCK_TECHNOLOGIES[technologyKey] || null;
}

function getContentUnlockLevel(contentType, contentId) {
    const requirement = getContentUnlockRequirement(contentType, contentId);
    return requirement ? Math.max(0, Number(requirement.level) || 0) : 0;
}

function isContentUnlocked(contentType, contentId) {
    const requirement = getContentUnlockRequirement(contentType, contentId);
    if (!requirement) return true;

    const technology = getContentUnlockTechnology(requirement.technology);
    if (!technology) return false;

    const currentLevel = Math.max(0, Number(technology.level) || 0);
    return currentLevel >= Math.max(0, Number(requirement.level) || 0);
}

// Called when a gating technology gains a level, so open panels immediately
// show the newly unlocked recipes, buildings and actions.
function refreshUnlockedContent() {
    if (typeof renderCraftPanels === "function") renderCraftPanels();
    if (typeof renderBuildPanels === "function") renderBuildPanels();
    if (typeof renderBuildingsPanels === "function") renderBuildingsPanels();
    if (typeof renderHousesPanels === "function") renderHousesPanels();
    if (typeof renderFurniturePanels === "function") renderFurniturePanels();
    if (typeof refreshActionButtons === "function") refreshActionButtons();
}

const DIET_AUTO_EAT_MIN_PERCENT = 1;
const DIET_AUTO_EAT_MAX_PERCENT = 100;
const DIET_AUTO_EAT_DEFAULT_PERCENT = 50;
var dietAutoEatThresholdPercent = DIET_AUTO_EAT_DEFAULT_PERCENT;
var dietPriorityStat = "";
var dietAutoCookCategory = "";
var harvestTreePriorityStat = "";
var numberFormat = "standard";
// Cheat-menu display toggle: reveal tabs, technologies and locked recipes,
// but never the action buttons.
var showSpoilers = false;
const NUMBER_FORMAT_OPTIONS = Object.freeze([
    Object.freeze({ value: "standard", label: "Standard" }),
    Object.freeze({ value: "suffix", label: "Suffix (1.23K)" }),
    Object.freeze({ value: "scientific", label: "Scientific" }),
    Object.freeze({ value: "engineering", label: "Engineering" }),
]);
const NUMBER_SUFFIX_UNITS = Object.freeze([
    "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc",
]);
const DIET_AUTO_COOK_CATEGORIES = Object.freeze([
    "soviet",
    "arabic",
    "asian",
    "italian",
    "pizza",
    "shawarma",
]);

function getNumberFormat() {
    return NUMBER_FORMAT_OPTIONS.some(function (option) {
        return option.value === numberFormat;
    }) ? numberFormat : "standard";
}

function trimFormattedNumber(value) {
    return value.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function formatSuffixNumber(value) {
    const sign = value < 0 ? "-" : "";
    const absolute = Math.abs(value);
    if (!Number.isFinite(absolute)) return String(value);
    if (absolute < 1000) {
        return sign + absolute.toFixed(2);
    }

    let tier = Math.floor(Math.log10(absolute) / 3);
    tier = Math.min(tier, NUMBER_SUFFIX_UNITS.length - 1);
    const scaled = absolute / Math.pow(1000, tier);
    return sign + scaled.toFixed(2) + NUMBER_SUFFIX_UNITS[tier];
}

function formatScientificNumber(value) {
    if (!Number.isFinite(value) || value === 0) return String(value);
    return value.toExponential(2);
}

function formatEngineeringNumber(value) {
    if (!Number.isFinite(value) || value === 0) return String(value);
    const sign = value < 0 ? "-" : "";
    const absolute = Math.abs(value);
    let exponent = Math.floor(Math.log10(absolute));
    exponent = Math.floor(exponent / 3) * 3;
    const mantissa = absolute / Math.pow(10, exponent);
    return sign + mantissa.toFixed(2)
        + "e" + (exponent >= 0 ? "+" : "") + exponent;
}

function formatGameNumber(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    // Small values keep their exact form in every mode.
    if (numeric >= -1000 && numeric <= 1000) return String(numeric);

    switch (getNumberFormat()) {
        case "suffix":
            return formatSuffixNumber(numeric);
        case "scientific":
            return formatScientificNumber(numeric);
        case "engineering":
            return formatEngineeringNumber(numeric);
        default:
            return String(numeric);
    }
}

function formatDisplayText(text) {
    if (getNumberFormat() === "standard") return String(text);
    return String(text).replace(/-?\d+(?:\.\d+)?/g, function (match, offset, whole) {
        const rest = whole.slice(offset + match.length);
        // Percent values are explicitly excluded from the number format.
        if (/^\s*%/.test(rest)) return match;
        const value = Number(match);
        if (!Number.isFinite(value)) return match;
        return formatGameNumber(value);
    });
}

function formatDisplayMarkup(markup) {
    if (getNumberFormat() === "standard") return markup;
    return String(markup).split(/(<[^>]*>)/).map(function (part) {
        return part.charAt(0) === "<" ? part : formatDisplayText(part);
    }).join("");
}

function formatTextNodes(root) {
    if (!root || getNumberFormat() === "standard") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === "SCRIPT" || tag === "STYLE") {
                return NodeFilter.FILTER_REJECT;
            }
            return /\d/.test(node.nodeValue || "")
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
        },
    });
    let node = walker.nextNode();
    while (node) {
        const raw = node.nodeValue;
        const formatted = formatDisplayText(raw);
        if (formatted !== raw) node.nodeValue = formatted;
        node = walker.nextNode();
    }
}

// --- ascension / rebirth ---------------------------------------------------
// Ascension state, death handling and the Limbo screen live in limbo.js.

function installNumberFormatHooks() {
    if (typeof HTMLElement === "undefined" || HTMLElement.prototype.numberFormatHooked) {
        return;
    }
    HTMLElement.prototype.numberFormatHooked = true;

    const innerTextDescriptor = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "innerText"
    );
    if (innerTextDescriptor && innerTextDescriptor.set) {
        Object.defineProperty(HTMLElement.prototype, "innerText", {
            configurable: true,
            enumerable: innerTextDescriptor.enumerable,
            get: innerTextDescriptor.get,
            set: function (value) {
                innerTextDescriptor.set.call(this, formatDisplayText(value));
            },
        });
    }

    const textContentDescriptor = Object.getOwnPropertyDescriptor(
        Node.prototype,
        "textContent"
    );
    if (textContentDescriptor && textContentDescriptor.set) {
        Object.defineProperty(Node.prototype, "textContent", {
            configurable: true,
            enumerable: textContentDescriptor.enumerable,
            get: textContentDescriptor.get,
            set: function (value) {
                textContentDescriptor.set.call(this, formatDisplayText(value));
            },
        });
    }

    const innerHtmlDescriptor = Object.getOwnPropertyDescriptor(
        Element.prototype,
        "innerHTML"
    );
    if (innerHtmlDescriptor && innerHtmlDescriptor.set) {
        Object.defineProperty(Element.prototype, "innerHTML", {
            configurable: true,
            enumerable: innerHtmlDescriptor.enumerable,
            get: innerHtmlDescriptor.get,
            set: function (value) {
                innerHtmlDescriptor.set.call(this, value);
                formatTextNodes(this);
            },
        });
    }

    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
        if (String(name).toLowerCase() === "data-tooltip") {
            return originalSetAttribute.call(
                this,
                name,
                formatDisplayMarkup(value)
            );
        }
        return originalSetAttribute.call(this, name, value);
    };
}

function setNumberFormat(value) {
    const next = NUMBER_FORMAT_OPTIONS.some(function (option) {
        return option.value === value;
    }) ? value : "standard";
    numberFormat = next;

    const select = document.getElementById("numberformatselect");
    if (select) select.value = next;

    if (typeof refreshNumberFormatDisplay === "function") {
        refreshNumberFormatDisplay();
    }
}

installNumberFormatHooks();
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

function getDietAutoCookCategory() {
    return DIET_BASICS_TECHNOLOGY.level >= 8
        && DIET_AUTO_COOK_CATEGORIES.includes(dietAutoCookCategory)
        ? dietAutoCookCategory
        : "";
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
    maxSearchUnits: 0,
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
var startX = null;
var startY = null;

function ensureStartCoordinates(x, y) {
    const nextX = Number(x);
    const nextY = Number(y);
    if (Number.isFinite(nextX) && Number.isFinite(nextY)) {
        startX = nextX;
        startY = nextY;
        return;
    }
    if (Number.isFinite(startX) && Number.isFinite(startY)) return;
    if (typeof currentTile !== "undefined" && currentTile) {
        const tileX = Number(currentTile.x);
        const tileY = Number(currentTile.y);
        if (Number.isFinite(tileX) && Number.isFinite(tileY)) {
            startX = tileX;
            startY = tileY;
        }
    }
}

function getStartCoordinates() {
    ensureStartCoordinates();
    return {
        x: Number.isFinite(startX) ? startX : 0,
        y: Number.isFinite(startY) ? startY : 0,
    };
}

function restoreStartCoordinates(savedX, savedY) {
    const nextX = Number(savedX);
    const nextY = Number(savedY);
    if (Number.isFinite(nextX) && Number.isFinite(nextY)) {
        startX = nextX;
        startY = nextY;
        return;
    }
    if (typeof currentTile !== "undefined" && currentTile) {
        const tileX = Number(currentTile.x);
        const tileY = Number(currentTile.y);
        if (Number.isFinite(tileX) && Number.isFinite(tileY)) {
            startX = tileX;
            startY = tileY;
            return;
        }
    }
    startX = 0;
    startY = 0;
}
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
            {
                id: "dietAutoCookExtras",
                name: "Auto-cook bonus ingredients",
                description: "DietBasics level 5: automatically add available spices, sauces and other bonus ingredients when auto-cooking.",
                requiredTechnology: "dietBasics",
                requiredLevel: 5,
                defaultEnabled: true,
            },
            {
                id: "dietAutoCookCategory",
                name: "Auto-cook category",
                description: "DietBasics level 8: restrict automatic cooking to one cuisine. Ingredient dishes and pre-crafted ingredients are not affected.",
                requiredTechnology: "dietBasics",
                requiredLevel: 8,
                control: "select",
                options: [
                    { value: "", label: "All dishes" },
                    { value: "soviet", label: "Soviet" },
                    { value: "arabic", label: "Arabic" },
                    { value: "asian", label: "Asian" },
                    { value: "italian", label: "Italian" },
                    { value: "pizza", label: "Pizza" },
                    { value: "shawarma", label: "Shawarma" },
                ],
            },
        ],
    },
    {
        id: "combat",
        name: "Combat",
        habits: [
            {
                id: "bullyLocalFauna",
                name: "Bully local fauna",
                description: "Fauna bully: automatically start combat at full HP when not resting or travelling. Higher levels avoid stronger mobs and use Spirit Speak automatically.",
                requiredTechnology: "faunaBully",
                requiredLevel: 1,
                defaultEnabled: false,
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
