const GEAR_IMAGE_DIRECTORY = "images/inv/gear/";
const RESOURCE_IMAGE_DIRECTORY = "images/inv/mini/";
const ITEM_IMAGE_CLASS = "itemimage";
const INVENTORY_SLOT_IMAGE_CLASS = "invslotimg";
const INVENTORY_LOCK_ICON = "images/inv/ui/lock.png";

// Resource icons are grouped by the same branches the resource panel uses.
// Items (tools, clothing, containers) live in images/inv/gear instead.
const SPECIAL_RESOURCE_IMAGE_FOLDERS = Object.freeze({
    logs: "nature",
    rope: "tailoring",
});

function normalizeItemImageName(itemName) {
    return String(itemName ?? "")
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[\s_-]+/g, "");
}

function getResourceImageFolder(itemName) {
    const normalizedName = normalizeItemImageName(itemName);
    if (!normalizedName) return null;

    if (Object.prototype.hasOwnProperty.call(
        SPECIAL_RESOURCE_IMAGE_FOLDERS,
        normalizedName
    )) {
        return SPECIAL_RESOURCE_IMAGE_FOLDERS[normalizedName];
    }

    if (typeof RESOURCE_DEFS === "undefined") return null;

    const resourceIds = Object.keys(RESOURCE_DEFS);
    for (let index = 0; index < resourceIds.length; index++) {
        const resourceId = Number(resourceIds[index]);
        const definition = RESOURCE_DEFS[resourceId];
        if (!definition
            || normalizeItemImageName(definition.name) !== normalizedName) {
            continue;
        }

        if (typeof MUSHROOM_RESOURCE_IDS !== "undefined"
            && MUSHROOM_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "mushrooms";
        }
        if (typeof FRUIT_RESOURCE_IDS !== "undefined"
            && FRUIT_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "fruits";
        }
        if (typeof NUT_RESOURCE_IDS !== "undefined"
            && NUT_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "nuts";
        }
        if (typeof HERB_RESOURCE_IDS !== "undefined"
            && HERB_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "herbs";
        }
        if (typeof VEGETABLE_RESOURCE_IDS !== "undefined"
            && VEGETABLE_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "vegetables";
        }
        if (typeof CROP_RESOURCE_IDS !== "undefined"
            && CROP_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "crops";
        }
        if (definition.category === RESOURCE_CATEGORIES.Food) {
            return "berries";
        }
        if (resourceId === RESOURCE_IDS.SHAFTS
            || resourceId === RESOURCE_IDS.HANDLES
            || resourceId === RESOURCE_IDS.WOODEN_PLANK
            || resourceId === RESOURCE_IDS.WOODEN_BEAMS) {
            return "carpentry";
        }
        if (resourceId === RESOURCE_IDS.FIBERS) {
            return "tailoring";
        }
        if (resourceId === RESOURCE_IDS.MORTAR) {
            return "masonry";
        }
        if (typeof SMITHING_RESOURCE_IDS !== "undefined"
            && SMITHING_RESOURCE_IDS.indexOf(resourceId) !== -1) {
            return "smithing";
        }
        if (resourceId === RESOURCE_IDS.ASH) {
            return "alchemy";
        }
        if (definition.category === RESOURCE_CATEGORIES.Raw) {
            return "nature";
        }
        if (definition.category === RESOURCE_CATEGORIES.Intermediate) {
            return "tailoring";
        }
        return null;
    }

    return null;
}

function getItemImagePath(itemName) {
    const normalizedName = normalizeItemImageName(itemName);
    // Every cooked kebob stores its ingredient in the display name, but all
    // variants share one generic item icon.
    if (normalizedName.endsWith("stickkebob")) {
        return GEAR_IMAGE_DIRECTORY + "kebobonstick.png";
    }

    const resourceFolder = getResourceImageFolder(normalizedName);

    // Herbs use one file per resource, named exactly like the normalized herb
    // name. The shared herbs/herb.png stays as a fallback for custom herbs.
    if (resourceFolder === "herbs") {
        return RESOURCE_IMAGE_DIRECTORY + "herbs/" + normalizedName + ".png";
    }

    return resourceFolder
        ? RESOURCE_IMAGE_DIRECTORY + resourceFolder + "/" + normalizedName + ".png"
        : GEAR_IMAGE_DIRECTORY + normalizedName + ".png";
}

function createItemImage(itemName, className) {
    const image = document.createElement("img");
    image.className = className || ITEM_IMAGE_CLASS;
    image.src = getItemImagePath(itemName);
    image.alt = itemName || "item";
    image.draggable = false;
    image.addEventListener("error", function () {
        image.style.display = "none";
    });
    return image;
}

function updateItemImage(container, itemName, className) {
    if (!container) return null;

    const imageClass = className || ITEM_IMAGE_CLASS;
    let image = container.querySelector("." + imageClass);
    if (!image) {
        image = createItemImage(itemName, imageClass);
        container.insertBefore(image, container.firstChild);
        return image;
    }

    image.src = getItemImagePath(itemName);
    image.alt = itemName || "item";
    image.style.display = "";
    return image;
}

function renderItemImage(container, itemName, className) {
    if (!container) return null;
    return updateItemImage(container, itemName, className || ITEM_IMAGE_CLASS);
}

function setInventorySlotImage(slotIndex, itemName) {
    const slot = document.getElementById("invslot" + slotIndex);
    if (!slot) return null;

    let image = slot.querySelector("." + INVENTORY_SLOT_IMAGE_CLASS);
    if (!itemName) {
        if (image) image.remove();
        slot.setAttribute("data-tooltip", "empty slot");
        return null;
    }

    if (!image) {
        image = createItemImage(itemName, INVENTORY_SLOT_IMAGE_CLASS);
        slot.appendChild(image);
    } else {
        image.src = getItemImagePath(itemName);
        image.alt = itemName;
        image.style.display = "";
    }

    slot.setAttribute("data-tooltip", itemName);
    return image;
}

function isInventoryItemLocked(item) {
    return !!item && item.locked === true;
}

function updateInventoryLockBadge(slot, locked) {
    if (!slot) return;

    let badge = slot.querySelector(".inventory-lock");
    if (!locked) {
        if (badge) badge.remove();
        return;
    }

    if (!badge) {
        badge = document.createElement("img");
        badge.className = "inventory-lock";
        badge.src = INVENTORY_LOCK_ICON;
        badge.alt = "Locked";
        badge.draggable = false;
        slot.appendChild(badge);
    }
}

function getInventoryItemName(item) {
    if (!item) return null;
    if (typeof item.name === "string") return item.name;

    if (item.itemId != null && typeof ITEM_DEFS !== "undefined") {
        const definition = ITEM_DEFS[item.itemId];
        if (definition) return definition.name;
    }

    return null;
}

function getItemDefinitionFor(item) {
    if (!item || typeof ITEM_DEFS === "undefined" || item.itemId == null) return null;
    return ITEM_DEFS[item.itemId] || null;
}

function getItemDescription(item) {
    const definition = getItemDefinitionFor(item);
    return definition && typeof definition.description === "string" ? definition.description : "";
}

function getItemRarityId(item) {
    if (!item) return null;

    const instanceRarity = typeof item.rarity === "string"
        ? item.rarity
        : (typeof item.rarityId === "string" ? item.rarityId : null);
    if (instanceRarity && getRarityDefinition(instanceRarity)) return instanceRarity;

    const definition = getItemDefinitionFor(item);
    return definition ? definition.rarity : null;
}

function getItemNameHtml(item, itemName) {
    const name = itemName || getInventoryItemName(item) || "";
    const rarity = getRarityDefinition(getItemRarityId(item));
    if (!rarity) return name;

    return '<span class="itemname rarity-' + rarity.id + '">' + name + "</span>";
}

function getItemRarityLine(item) {
    const rarity = getRarityDefinition(getItemRarityId(item));
    if (!rarity) return "";

    return '<span class="itemrarity rarity-' + rarity.id + '">Rarity: ' + rarity.label + "</span>";
}

// Food is consumed rather than equipped, so its tooltip describes the hunger
// value and every exact potential gain instead of using the equipment heading.
function getFoodItemBonusHtml(item) {
    const lines = [];
    const hunger = getItemFoodHungerRestore(item);
    if (hunger > 0) {
        lines.push("Restores " + roundItemNumber(hunger) + " hunger");
    }

    if (typeof getItemPotentialBonusDescriptions === "function") {
        Array.prototype.push.apply(lines, getItemPotentialBonusDescriptions(item));
    }

    if (!lines.length) return "";

    return "On consumption:<br>" + lines.map(function (line) {
        return '<span class="itembonus">' + line + "</span>";
    }).join("<br>");
}

// Unified equip-bonus block. Any item with stats is described automatically,
// so new items only need `stats` in ITEM_DEFS.
function getItemBonusHtml(item) {
    const definition = getItemDefinitionFor(item);
    if (definition && definition.food) {
        return getFoodItemBonusHtml(item);
    }

    if (typeof getItemBonusDescriptions !== "function") return "";

    const bonuses = getItemBonusDescriptions(item);
    if (!bonuses.length) return "";

    const lines = bonuses.map(function (bonus) {
        return '<span class="itembonus">' + bonus + "</span>";
    });

    // The heading is plain tooltip text; only the bonus lines themselves keep
    // the highlighted .itembonus styling.
    return "When equipped:<br>" + lines.join("<br>");
}

function getItemEquipSlots(item) {
    const definition = getItemDefinitionFor(item);
    if (!definition) return [];
    if (Array.isArray(definition.equipSlots) && definition.equipSlots.length) {
        return definition.equipSlots;
    }
    if (Array.isArray(definition.slot)) return definition.slot;
    return definition.slot ? [definition.slot] : [];
}

// Flat bonuses granted by equipped item stats. Used by core stat lookups so a
// Gold tool can grant its extra Luck.
function getEquippedStatBonus(statName, targetPlayer) {
    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 0;

    let total = 0;
    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item) return;
        const stats = typeof item.getStats === "function"
            ? item.getStats()
            : (item.stats && typeof item.stats === "object" ? item.stats : null);
        if (!stats) return;

        const value = Number(stats[statName]);
        if (Number.isFinite(value) && value > 0) total += value;
    });

    return roundItemNumber(total);
}

// Equipped cutlery contributes FeastModifier and a derived FeastEfficiency.
// The latter multiplicatively reduces hunger restored by any food.
function getEquippedFeastModifierTotal(targetPlayer) {    const character = targetPlayer || (typeof player !== "undefined" ? player : null);
    if (!character || !character.equipment) return 0;

    let total = 0;
    Object.keys(character.equipment).forEach(function (slotId) {
        const item = character.equipment[slotId];
        if (!item) return;
        const stats = typeof item.getStats === "function"
            ? item.getStats()
            : (item.stats && typeof item.stats === "object" ? item.stats : null);
        if (!stats) return;

        const modifier = Number(stats.feastModifier) || 0;
        if (modifier > 0) total += modifier;
    });

    return roundItemNumber(total);
}

function getEquippedFeastEfficiencyMultiplier(targetPlayer) {
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

        const modifier = Number(stats.feastModifier) || 0;
        if (modifier <= 0) return;

        const efficiency = getFeastEfficiencyFromModifier(modifier);
        multiplier *= Math.max(0, 1 - efficiency);
    });

    return Math.max(0.05, multiplier);
}

function isPounchSlotId(slotId) {
    return typeof POUNCH_SLOT_IDS !== "undefined"
        && POUNCH_SLOT_IDS.indexOf(slotId) !== -1;
}

function canEquipItemToSlot(item, slotId) {
    const slots = getItemEquipSlots(item);
    if (slots.indexOf(slotId) !== -1) return true;

    // Survival Pounches can occupy any active extra Pounch slot granted by a
    // backpack, even though their definition only names the base slot.
    if (slots.indexOf("pounch") !== -1 && isPounchSlotId(slotId)) {
        return typeof getActivePounchSlotIds === "function"
            ? getActivePounchSlotIds().indexOf(slotId) !== -1
            : slotId === "pounch";
    }

    return false;
}

function getFirstFreeEquipmentSlot(item) {
    if (!item || typeof player === "undefined" || !player || !player.equipment) {
        return null;
    }

    for (let index = 0; index < EQUIPMENT_SLOT_IDS.length; index++) {
        const slotId = EQUIPMENT_SLOT_IDS[index];
        if (!canEquipItemToSlot(item, slotId)) continue;
        if (!player.equipment[slotId]) return slotId;
    }

    return null;
}

function hasCompatibleEquipmentSlot(item) {
    if (!item) return false;
    return EQUIPMENT_SLOT_IDS.some(function (slotId) {
        return canEquipItemToSlot(item, slotId);
    });
}

// Double-clicking an inventory item equips it into the first free compatible
// slot. If every compatible slot is occupied the item becomes locked instead:
// it shows a lock badge and Scrap all skips it. Double-clicking a locked item
// removes the lock.
function equipInventoryItemFromSlot(index) {
    if (typeof player === "undefined" || !player || !Array.isArray(player.equipinventory)) {
        return false;
    }
    if (!Number.isInteger(index) || index < 0 || index >= getEffectiveInventorySlots()) {
        return false;
    }

    const item = player.equipinventory[index];
    if (!item) return false;

    // Double-clicking a locked item unlocks it instead of trying to equip it.
    if (isInventoryItemLocked(item)) {
        item.locked = false;
        renderInventorySlots();
        logMessage(getInventoryItemName(item) + " is unlocked.");
        return true;
    }

    const slotId = getFirstFreeEquipmentSlot(item);
    if (!slotId) {
        if (!hasCompatibleEquipmentSlot(item)) return false;

        item.locked = true;
        renderInventorySlots();
        logMessage(getInventoryItemName(item)
            + " is locked: every compatible equipment slot is occupied");
        return false;
    }

    const moved = performItemMove(
        { type: "inventory", index: index },
        { type: "equipment", slotId: slotId }
    );
    if (!moved) return false;

    item.locked = false;
    renderInventorySlots();
    renderEquipmentItems();
    return true;
}

function isConsumableFoodItem(item) {
    const definition = getItemDefinitionFor(item);
    return !!definition
        && definition.food
        && typeof definition.food === "object";
}

function getItemFoodHungerRestore(item) {
    const definition = getItemDefinitionFor(item);
    if (!definition || !definition.food) return 0;

    const base = Math.max(0, Number(definition.food.hungerRestore) || 0);
    if (base <= 0) return 0;

    const quality = typeof item.effectiveQuality === "number"
        ? Math.max(0, item.effectiveQuality)
        : Math.max(0, Number(item.quality) || 1);
    const feastMultiplier = typeof getEquippedFeastEfficiencyMultiplier === "function"
        ? getEquippedFeastEfficiencyMultiplier()
        : 1;

    return roundItemNumber(
        base * (1 + quality / 10) * feastMultiplier
    );
}

// Generic item food consumption. Any future dish only needs `food` data in its
// item definition; double-clicking it in the inventory will use this path.
function consumeInventoryFood(index) {
    if (typeof player === "undefined" || !player || !Array.isArray(player.equipinventory)) {
        return false;
    }
    if (!Number.isInteger(index) || index < 0 || index >= getEffectiveInventorySlots()) {
        return false;
    }

    const item = player.equipinventory[index];
    if (!item || !isConsumableFoodItem(item)) return false;

    const name = getInventoryItemName(item) || "food";
    const hungerRestore = getItemFoodHungerRestore(item);
    const hungerBefore = typeof getHungerValue === "function" ? getHungerValue() : 0;
    const hungerAfter = Math.max(0, hungerBefore - hungerRestore);

    if (typeof player !== "undefined" && player) {
        player.hunger = round2(hungerAfter);
        if (hungerAfter <= 0) player.autoEatActive = false;
    }

    const feastMultiplier = 1 + (
        typeof getFeastModifier === "function"
            ? getFeastModifier(currentTile)
            : 0
    ) / 100;
    const potentialLines = [];
    if (item.potentialBonuses && typeof item.potentialBonuses === "object") {
        Object.keys(item.potentialBonuses).forEach(function (statName) {
            const value = Number(item.potentialBonuses[statName]);
            if (!Number.isFinite(value) || value <= 0) return;

            const stat = player[statName];
            if (!stat || typeof increasePotential !== "function") return;

            const gained = increasePotential(stat, value * feastMultiplier);
            if (gained > 0) {
                const label = stat.name || String(statName).toUpperCase();
                potentialLines.push("+" + roundItemNumber(gained) + " " + label + " potential");
            }
        });
    }

    player.equipinventory[index] = null;

    logMessage(
        "You eat " + name
        + ". Hunger -" + round2(Math.max(0, hungerBefore - hungerAfter))
        + (potentialLines.length ? ". " + potentialLines.join(", ") : "")
    );

    if (typeof renderInventorySlots === "function") renderInventorySlots();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}

document.addEventListener("dblclick", function (event) {
    if (scrapModeActive) return;

    const slot = event.target && event.target.closest
        ? event.target.closest(".invslot")
        : null;
    if (!slot || slot.id.indexOf("invslot") !== 0) return;

    event.preventDefault();
    const index = Number(slot.id.slice("invslot".length));
    if (!Number.isInteger(index)) return;

    const item = player.equipinventory[index];
    if (item && isConsumableFoodItem(item)) {
        consumeInventoryFood(index);
        return;
    }

    equipInventoryItemFromSlot(index);
});

// --- inventory scrapping ---------------------------------------------------
// Scrap returns 10% of the resources the item was crafted from. The returned
// resource quality is the item's quality with its rarity multiplier applied.
const SCRAP_RESOURCE_RETURN = 0.1;
// The rarity filter cycles through the ITEM_RARITIES order. Bulk scrap removes
// items whose rarity is at or below the selected one.
const SCRAP_RARITY_ORDER = Object.freeze(
    Object.keys(ITEM_RARITIES).map(function (key) { return ITEM_RARITIES[key]; })
);
const SCRAP_RARITY_DEFAULT = ITEM_RARITIES.Junk;
let scrapModeActive = false;
let scrapRarityFilter = SCRAP_RARITY_DEFAULT;

function normalizeScrapRarityFilter(value) {
    return SCRAP_RARITY_ORDER.indexOf(value) !== -1
        ? value
        : SCRAP_RARITY_DEFAULT;
}

function cycleScrapRarityFilter() {
    const index = SCRAP_RARITY_ORDER.indexOf(scrapRarityFilter);
    const nextIndex = index === -1 ? 0 : (index + 1) % SCRAP_RARITY_ORDER.length;
    scrapRarityFilter = SCRAP_RARITY_ORDER[nextIndex];
}

function getItemRarityFilterIndex(item) {
    return SCRAP_RARITY_ORDER.indexOf(getItemRarityId(item));
}

function updateScrapToolbar() {
    const scrapButton = document.getElementById("scrapbutton");
    if (scrapButton) {
        scrapButton.innerText = scrapModeActive ? "Cancel" : "Scrap";
        scrapButton.classList.toggle("active", scrapModeActive);
        scrapButton.setAttribute("aria-pressed", scrapModeActive ? "true" : "false");
        scrapButton.setAttribute(
            "data-tooltip",
            scrapModeActive
                ? "Click an item to scrap it, or click here to cancel."
                : "Scrap an item to recover 10% of its crafting resources."
        );
    }

    const rarityButton = document.getElementById("scrapraritybutton");
    if (rarityButton) {
        rarityButton.innerText = "Rarity: " + getRarityLabel(scrapRarityFilter);
    }

    const scrapAllButton = document.getElementById("scrapallbutton");
    if (scrapAllButton) {
        scrapAllButton.innerText = "Scrap all with rarity "
            + getRarityLabel(scrapRarityFilter) + " lower";
    }
}

function ensureScrapToolbar() {
    const place = document.getElementById("inventoryPlace");
    if (!place) return null;

    let toolbar = document.getElementById("scraptoolbar");
    if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.id = "scraptoolbar";
        toolbar.className = "scraptoolbar";

        const scrapButton = document.createElement("button");
        scrapButton.type = "button";
        scrapButton.id = "scrapbutton";
        scrapButton.className = "scrapbutton";
        scrapButton.addEventListener("click", function () {
            setScrapMode(!scrapModeActive);
        });

        const rarityButton = document.createElement("button");
        rarityButton.type = "button";
        rarityButton.id = "scrapraritybutton";
        rarityButton.className = "scrapbutton scrapraritybutton";
        rarityButton.setAttribute(
            "data-tooltip",
            "Click to change the scrap rarity filter."
        );
        rarityButton.addEventListener("click", function () {
            cycleScrapRarityFilter();
            renderInventorySlots();
        });

        const scrapAllButton = document.createElement("button");
        scrapAllButton.type = "button";
        scrapAllButton.id = "scrapallbutton";
        scrapAllButton.className = "scrapbutton scrapallbutton";
        scrapAllButton.setAttribute(
            "data-tooltip",
            "Scrap every inventory item at or below the chosen rarity."
        );
        scrapAllButton.addEventListener("click", function () {
            scrapAllByRarity();
        });

        toolbar.appendChild(scrapButton);
        toolbar.appendChild(rarityButton);
        toolbar.appendChild(scrapAllButton);
        place.insertBefore(toolbar, place.firstChild);
    }

    updateScrapToolbar();
    return toolbar;
}

function setScrapMode(active, silent) {
    scrapModeActive = active === true;

    const place = document.getElementById("inventoryPlace");
    if (place) place.classList.toggle("scrap-mode", scrapModeActive);

    ensureScrapToolbar();
    renderInventorySlots();

    if (!silent) {
        logMessage(scrapModeActive
            ? "Scrap mode: click an item to scrap it"
            : "Scrap mode disabled");
    }
}

function getScrapReturnQuality(item) {
    if (!item) return RESOURCE_DEFAULT_QUALITY;

    if (typeof item.effectiveQuality === "number" && item.effectiveQuality > 0) {
        return item.effectiveQuality;
    }

    const quality = Number(item.quality);
    if (!Number.isFinite(quality) || quality <= 0) return RESOURCE_DEFAULT_QUALITY;

    return roundItemNumber(quality * getRarityMultiplier(item.rarity));
}

function scrapInventoryItem(index) {
    if (!player || !Array.isArray(player.equipinventory)) return false;
    if (!scrapModeActive) return false;
    if (!Number.isInteger(index) || index < 0 || index >= getEffectiveInventorySlots()) {
        return false;
    }

    const item = player.equipinventory[index];
    if (!item) return false;

    const recipe = typeof getCraftRecipeForItem === "function"
        ? getCraftRecipeForItem(item.itemId)
        : null;

    if (!recipe) {
        logMessage("This item cannot be scrapped");
        return false;
    }

    const quality = getScrapReturnQuality(item);
    const count = Math.max(1, Math.floor(item.count || 1));
    const recovered = [];

    player.equipinventory[index] = null;

    (recipe.resources || []).forEach(function (requirement) {
        const amount = round2(requirement.amount * SCRAP_RESOURCE_RETURN * count);
        if (!Number.isFinite(amount) || amount <= 0) return;

        addResource(requirement.resourceId, amount, quality);

        const definition = RESOURCE_DEFS[requirement.resourceId];
        recovered.push(
            (definition ? definition.name : requirement.resourceId)
                + " x" + amount + " (Q" + round2(quality) + ")"
        );
    });

    logMessage("You scrapped " + getInventoryItemName(item)
        + (recovered.length ? " and recovered " + recovered.join(", ") : ""));

    setScrapMode(false, true);
    if (typeof renderResources === "function") renderResources();
    return true;
}

function scrapAllByRarity() {
    if (!player || !Array.isArray(player.equipinventory)) return 0;

    const thresholdIndex = SCRAP_RARITY_ORDER.indexOf(scrapRarityFilter);
    if (thresholdIndex === -1) return 0;

    const targets = [];
    const slotCount = Math.min(
        player.equipinventory.length,
        getEffectiveInventorySlots()
    );

    for (let index = 0; index < slotCount; index++) {
        const item = player.equipinventory[index];
        if (!item) continue;
        // Locked items are explicitly protected from the bulk scrap action.
        if (isInventoryItemLocked(item)) continue;

        const recipe = typeof getCraftRecipeForItem === "function"
            ? getCraftRecipeForItem(item.itemId)
            : null;
        if (!recipe) continue;

        const rarityIndex = getItemRarityFilterIndex(item);
        if (rarityIndex === -1 || rarityIndex > thresholdIndex) continue;

        targets.push({ index: index, item: item, recipe: recipe });
    }

    if (!targets.length) {
        logMessage("Nothing to scrap with rarity "
            + getRarityLabel(scrapRarityFilter) + " or lower");
        return 0;
    }

    const recoveredTotals = Object.create(null);

    targets.forEach(function (target) {
        const quality = getScrapReturnQuality(target.item);
        const count = Math.max(1, Math.floor(target.item.count || 1));

        player.equipinventory[target.index] = null;

        (target.recipe.resources || []).forEach(function (requirement) {
            const amount = round2(requirement.amount * SCRAP_RESOURCE_RETURN * count);
            if (!Number.isFinite(amount) || amount <= 0) return;

            addResource(requirement.resourceId, amount, quality);
            recoveredTotals[requirement.resourceId] =
                (recoveredTotals[requirement.resourceId] || 0) + amount;
        });
    });

    const recoveredParts = Object.keys(recoveredTotals).map(function (resourceId) {
        const definition = RESOURCE_DEFS[resourceId];
        return (definition ? definition.name : resourceId)
            + " x" + round2(recoveredTotals[resourceId]);
    });

    logMessage("You scrapped " + targets.length + " items with rarity "
        + getRarityLabel(scrapRarityFilter) + " or lower"
        + (recoveredParts.length ? " and recovered " + recoveredParts.join(", ") : ""));

    if (typeof renderResources === "function") renderResources();

    if (scrapModeActive) {
        setScrapMode(false, true);
    } else {
        renderInventorySlots();
    }

    return targets.length;
}

document.addEventListener("click", function (event) {
    if (!scrapModeActive) return;

    const slot = event.target && event.target.closest
        ? event.target.closest(".invslot")
        : null;
    if (!slot || slot.id.indexOf("invslot") !== 0) return;

    const index = Number(slot.id.slice("invslot".length));
    if (!Number.isInteger(index)) return;

    scrapInventoryItem(index);
});

function syncInventorySlotElements(slotCount) {
    const place = document.getElementById("inventoryPlace");
    if (!place) return;

    const slots = Array.from(place.querySelectorAll(".invslot"));

    for (let slotIndex = slots.length; slotIndex < slotCount; slotIndex++) {
        const slot = document.createElement("div");
        slot.className = "invslot";
        slot.id = "invslot" + slotIndex;
        slot.setAttribute("data-tooltip", "empty slot");
        place.appendChild(slot);
    }

    for (let slotIndex = slots.length - 1; slotIndex >= slotCount; slotIndex--) {
        slots[slotIndex].remove();
    }
}

function renderInventorySlots() {
    if (typeof player === "undefined" || !player || !Array.isArray(player.equipinventory)) return;

    ensureScrapToolbar();

    const slotCount = Math.min(player.equipinventory.length, getEffectiveInventorySlots());
    syncInventorySlotElements(slotCount);
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
        const item = player.equipinventory[slotIndex];
        const itemName = getInventoryItemName(item);
        setInventorySlotImage(slotIndex, itemName);

        const slot = document.getElementById("invslot" + slotIndex);
        if (!slot) continue;

        const locked = !!itemName && isInventoryItemLocked(item);
        updateInventoryLockBadge(slot, locked);

        slot.draggable = !scrapModeActive && !!itemName;
        slot.classList.remove("dragging", "drop-target");
        slot.classList.toggle("has-item", !!itemName);
        slot.classList.toggle("locked", locked);

        if (!itemName) {
            slot.removeAttribute("data-rarity");
            continue;
        }

        slot.dataset.rarity = getItemRarityId(item) || "";

        const quality = typeof item.quality === "number"
            ? " | quality: " + item.quality
            : "";
        const rarityLine = getItemRarityLine(item);
        const bonusHtml = getItemBonusHtml(item);
        const propertiesHtml = getItemPropertiesHtml(item);
        const description = getItemDescription(item);
        slot.setAttribute(
            "data-tooltip",
            getItemNameHtml(item, itemName) + quality
                + (rarityLine ? "<br>" + rarityLine : "")
                + (bonusHtml ? "<br>" + bonusHtml : "")
                + (propertiesHtml ? "<br>" + propertiesHtml : "")
                + (description ? "<br>" + description : "")
                + (locked
                    ? "<br><span class=\"inventory-lock-note\">Locked: protected from Scrap all.</span>"
                    : "")
        );
    }

    if (typeof updateCharacterPowerGUI === "function") updateCharacterPowerGUI();
    if (typeof refreshActionButtons === "function") refreshActionButtons();
}

function updatePounchSlotVisibility() {
    if (typeof POUNCH_SLOT_IDS === "undefined") return;

    const active = new Set(
        typeof getActivePounchSlotIds === "function"
            ? getActivePounchSlotIds()
            : ["pounch"]
    );

    POUNCH_SLOT_IDS.forEach(function (slotId) {
        const slot = document.getElementById("equipslot-" + slotId);
        if (slot) slot.classList.toggle("pounch-slot-inactive", !active.has(slotId));
    });
}

function renderEquipmentItems() {
    if (typeof player === "undefined" || !player || !player.equipment) return;

    if (typeof ensurePantsEquipped === "function") ensurePantsEquipped(player);

    EQUIPMENT_SLOT_IDS.forEach(function (slotId) {
        const slot = document.getElementById("equipslot-" + slotId);
        if (!slot) return;

        const item = player.equipment[slotId] || null;
        const slotLabel = slot.dataset.label || slotId;
        const slotDescription = slot.dataset.description || "";
        const label = slot.querySelector(".equipslotlabel");
        let image = slot.querySelector(".equipslotimg");

        if (!item) {
            if (image) image.remove();
            slot.classList.remove("filled", "dragging", "drop-target");
            slot.removeAttribute("data-rarity");
            slot.draggable = false;
            if (label) label.innerText = slotLabel;
            slot.setAttribute(
                "data-tooltip",
                slotLabel + ": empty" + (slotDescription ? "<br><i>" + slotDescription + "</i>" : "")
            );
            return;
        }

        const itemName = getInventoryItemName(item);
        if (!image) {
            image = createItemImage(itemName, "equipslotimg");
            slot.appendChild(image);
        } else {
            image.src = getItemImagePath(itemName);
            image.alt = itemName;
            image.style.display = "";
        }

        slot.classList.add("filled");
        slot.classList.remove("dragging", "drop-target");
        slot.draggable = true;
        slot.dataset.rarity = getItemRarityId(item) || "";
        if (label) label.innerText = itemName;

        const quality = typeof item.quality === "number"
            ? " | quality: " + item.quality
            : "";
        const rarityLine = getItemRarityLine(item);
        const bonusHtml = getItemBonusHtml(item);
        const propertiesHtml = getItemPropertiesHtml(item);
        const description = getItemDescription(item);
        slot.setAttribute(
            "data-tooltip",
            getItemNameHtml(item, itemName) + quality + " | slot: " + slotLabel
                + (rarityLine ? "<br>" + rarityLine : "")
                + (bonusHtml ? "<br>" + bonusHtml : "")
                + (propertiesHtml ? "<br>" + propertiesHtml : "")
                + (description ? "<br>" + description : "")
        );
    });

    // Equipping or removing a backpack changes both the visible pounch slots
    // and the inventory capacity; a Leaf Belt changes inventory capacity too.
    updatePounchSlotVisibility();
    if (typeof renderInventorySlots === "function") renderInventorySlots();
}

let itemDragState = null;
let itemDropTarget = null;

function getItemSlotLocation(element) {
    if (!element || typeof element.closest !== "function") return null;

    const inventorySlot = element.closest(".invslot");
    if (inventorySlot && inventorySlot.id.indexOf("invslot") === 0) {
        return { type: "inventory", index: Number(inventorySlot.id.slice("invslot".length)) };
    }

    const equipmentSlot = element.closest(".equipslot");
    if (equipmentSlot && equipmentSlot.dataset.slot) {
        return { type: "equipment", slotId: equipmentSlot.dataset.slot };
    }

    return null;
}

function getItemSlotElement(location) {
    if (!location) return null;
    if (location.type === "inventory") {
        return document.getElementById("invslot" + location.index);
    }
    if (location.type === "equipment") {
        return document.getElementById("equipslot-" + location.slotId);
    }
    return null;
}

function getLocationItem(location) {
    if (!location || typeof player === "undefined" || !player) return null;
    if (location.type === "inventory") {
        return player.equipinventory[location.index] || null;
    }
    if (location.type === "equipment") {
        return player.equipment[location.slotId] || null;
    }
    return null;
}

function canDropItem(source, target) {
    if (!source || !target || typeof player === "undefined" || !player) return false;

    if (source.type === "inventory" && target.type === "inventory") {
        return source.index !== target.index;
    }

    if (source.type === "inventory" && target.type === "equipment") {
        return canEquipItemToSlot(player.equipinventory[source.index], target.slotId);
    }

    if (source.type === "equipment" && target.type === "inventory") {
        const item = player.equipment[source.slotId];
        if (!item) return false;
        const targetItem = player.equipinventory[target.index];
        return !targetItem || canEquipItemToSlot(targetItem, source.slotId);
    }

    if (source.type === "equipment" && target.type === "equipment") {
        if (source.slotId === target.slotId) return false;
        const item = player.equipment[source.slotId];
        if (!canEquipItemToSlot(item, target.slotId)) return false;
        const targetItem = player.equipment[target.slotId];
        return !targetItem || canEquipItemToSlot(targetItem, source.slotId);
    }

    return false;
}

function logItemEquipChange(action, item) {
    if (!item || typeof logMessage !== "function") return;

    const itemName = getInventoryItemName(item);
    if (!itemName) return;

    logMessage("you " + action + " " + itemName);
}

function countHiddenInventoryItems() {
    if (!player || !Array.isArray(player.equipinventory)) return 0;

    const capacity = getEffectiveInventorySlots();
    let hidden = 0;
    for (let index = capacity; index < player.equipinventory.length; index++) {
        if (player.equipinventory[index]) hidden += 1;
    }
    return hidden;
}

function compactInventoryToVisibleCapacity() {
    if (!player || !Array.isArray(player.equipinventory)) return;

    const capacity = getEffectiveInventorySlots();
    for (let index = capacity; index < player.equipinventory.length; index++) {
        const item = player.equipinventory[index];
        if (!item) continue;

        let emptyIndex = -1;
        for (let visibleIndex = 0; visibleIndex < capacity; visibleIndex++) {
            if (!player.equipinventory[visibleIndex]) {
                emptyIndex = visibleIndex;
                break;
            }
        }
        if (emptyIndex === -1) continue;

        player.equipinventory[emptyIndex] = item;
        player.equipinventory[index] = null;
    }
}

function countInactivePounchItems() {
    if (!player || !player.equipment || typeof POUNCH_SLOT_IDS === "undefined") return 0;

    const active = new Set(getActivePounchSlotIds());
    let hidden = 0;
    POUNCH_SLOT_IDS.forEach(function (slotId) {
        if (!active.has(slotId) && player.equipment[slotId]) hidden += 1;
    });
    return hidden;
}

function compactPounchesToActiveSlots() {
    if (!player || !player.equipment || typeof POUNCH_SLOT_IDS === "undefined") return;

    const activeIds = getActivePounchSlotIds();
    const active = new Set(activeIds);
    POUNCH_SLOT_IDS.forEach(function (slotId) {
        if (active.has(slotId)) return;

        const item = player.equipment[slotId];
        if (!item) return;

        const emptySlot = activeIds.find(function (id) {
            return !player.equipment[id];
        });
        if (!emptySlot) return;

        player.equipment[emptySlot] = item;
        player.equipment[slotId] = null;
    });
}

// Equipment changes can shrink the visible inventory (for example, removing a
// rare Leaf Belt) or hide extra Pounch slots (removing a backpack). Keep item
// movement transactional so items are never hidden in slots that disappeared.
function performItemMove(source, target) {
    if (!player || !Array.isArray(player.equipinventory) || !player.equipment) {
        return false;
    }

    const inventorySnapshot = player.equipinventory.slice();
    const equipmentSnapshot = Object.assign({}, player.equipment);
    const hiddenBefore = countHiddenInventoryItems();
    const inactivePounchBefore = countInactivePounchItems();
    const visibleBefore = player.equipinventory
        .slice(0, getEffectiveInventorySlots())
        .filter(Boolean);

    const moved = performItemMoveUnchecked(source, target);
    if (!moved) return false;

    compactInventoryToVisibleCapacity();
    compactPounchesToActiveSlots();

    const visibleAfter = player.equipinventory.slice(0, getEffectiveInventorySlots());
    const equippedAfter = Object.keys(player.equipment).map(function (slotId) {
        return player.equipment[slotId];
    });
    const lostVisibleItem = visibleBefore.some(function (item) {
        return visibleAfter.indexOf(item) === -1 && equippedAfter.indexOf(item) === -1;
    });
    const inactivePounchesGrew = countInactivePounchItems() > inactivePounchBefore;

    if (lostVisibleItem || countHiddenInventoryItems() > hiddenBefore || inactivePounchesGrew) {
        player.equipinventory = inventorySnapshot;
        player.equipment = equipmentSnapshot;
        logMessage(inactivePounchesGrew
            ? "Cannot move that item: backpack removal would hide equipped pounches."
            : "Cannot move that item: inventory would lose visible slots.");
        return false;
    }

    return true;
}

function performItemMoveUnchecked(source, target) {
    if (source.type === "inventory" && target.type === "inventory") {
        const inventory = player.equipinventory;
        const temporary = inventory[target.index] || null;
        inventory[target.index] = inventory[source.index];
        inventory[source.index] = temporary;
        return true;
    }

    if (source.type === "inventory" && target.type === "equipment") {
        const item = player.equipinventory[source.index] || null;
        const previous = player.equipment[target.slotId] || null;
        player.equipment[target.slotId] = item;
        player.equipinventory[source.index] = previous;
        if (item) item.locked = false;
        if (previous) previous.locked = false;
        if (previous) logItemEquipChange("unequip", previous);
        logItemEquipChange("equip", item);
        return true;
    }

    if (source.type === "equipment" && target.type === "inventory") {
        const item = player.equipment[source.slotId] || null;
        const previous = player.equipinventory[target.index] || null;
        player.equipinventory[target.index] = item;
        player.equipment[source.slotId] = previous;
        if (item) item.locked = false;
        if (previous) previous.locked = false;
        logItemEquipChange("unequip", item);
        if (previous) logItemEquipChange("equip", previous);
        return true;
    }

    if (source.type === "equipment" && target.type === "equipment") {
        const item = player.equipment[source.slotId] || null;
        const previous = player.equipment[target.slotId] || null;
        player.equipment[target.slotId] = item;
        player.equipment[source.slotId] = previous;
        return true;
    }

    return false;
}

function setItemDropTarget(element) {
    if (itemDropTarget === element) return;
    if (itemDropTarget) itemDropTarget.classList.remove("drop-target");
    itemDropTarget = element;
    if (itemDropTarget) itemDropTarget.classList.add("drop-target");
}

function clearEquipTargetHighlights() {
    document.querySelectorAll(".equipslot.equipment-drop").forEach(function (slot) {
        slot.classList.remove("equipment-drop");
    });
}

function highlightEquipTargets(item, source) {
    clearEquipTargetHighlights();
    if (!item) return;

    EQUIPMENT_SLOT_IDS.forEach(function (slotId) {
        if (source && source.type === "equipment" && source.slotId === slotId) return;
        if (!canEquipItemToSlot(item, slotId)) return;

        const slot = document.getElementById("equipslot-" + slotId);
        if (slot) slot.classList.add("equipment-drop");
    });
}

function clearItemDragState() {
    const sourceElement = getItemSlotElement(itemDragState);
    if (sourceElement) sourceElement.classList.remove("dragging");
    clearEquipTargetHighlights();
    setItemDropTarget(null);
    itemDragState = null;
}

document.addEventListener("dragstart", function (event) {
    const location = getItemSlotLocation(event.target);
    if (!location) return;

    const item = getLocationItem(location);
    if (!item) {
        event.preventDefault();
        return;
    }

    itemDragState = location;
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        try {
            event.dataTransfer.setData("text/plain", JSON.stringify(location));
        } catch (error) {
            // Some browsers restrict custom drag data; the in-memory state is enough.
        }
    }

    const slot = getItemSlotElement(location);
    if (slot) slot.classList.add("dragging");

    highlightEquipTargets(item, location);
});

document.addEventListener("dragover", function (event) {
    if (!itemDragState) return;

    const location = getItemSlotLocation(event.target);
    if (!location || !canDropItem(itemDragState, location)) {
        setItemDropTarget(null);
        return;
    }

    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    setItemDropTarget(getItemSlotElement(location));
});

document.addEventListener("dragleave", function (event) {
    if (!itemDropTarget) return;
    const slot = event.target && event.target.closest
        ? event.target.closest(".invslot, .equipslot")
        : null;
    if (!slot) return;
    if (slot.contains(event.relatedTarget)) return;
    if (itemDropTarget === slot) setItemDropTarget(null);
});

document.addEventListener("drop", function (event) {
    if (!itemDragState) return;

    const location = getItemSlotLocation(event.target);
    if (!location || !canDropItem(itemDragState, location)) return;

    event.preventDefault();
    const moved = performItemMove(itemDragState, location);
    clearItemDragState();

    if (moved) {
        renderInventorySlots();
        renderEquipmentItems();
    }
});

document.addEventListener("dragend", function () {
    clearItemDragState();
});
