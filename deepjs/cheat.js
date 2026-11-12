// Debug-gated cheat menu.
//
// The menu is available only while debug messages are enabled (the bug button
// in Options). Press `~` (physical Backquote key, layout independent) to toggle
// it. Everything here mutates the live game state, so it deliberately lives in
// its own file and is not referenced by normal gameplay code.
(function () {
    let cheatMenuElement = null;
    let statusTimer = null;

    function isDebugEnabled() {
        return typeof showDebugMessages !== "undefined"
            && showDebugMessages === true;
    }

    function isTypingTarget(target) {
        if (!target || !(target instanceof Element)) return false;
        const tagName = target.tagName;
        return tagName === "INPUT"
            || tagName === "TEXTAREA"
            || tagName === "SELECT"
            || target.isContentEditable;
    }

    function isCheatMenuOpen() {
        return !!cheatMenuElement && !cheatMenuElement.hidden;
    }

    function setCheatStatus(text) {
        if (!cheatMenuElement) return;

        const status = cheatMenuElement.querySelector("#cheatmenu-status");
        if (!status) return;

        status.textContent = text || "";
        if (statusTimer) clearTimeout(statusTimer);
        if (text) {
            statusTimer = setTimeout(function () {
                status.textContent = "";
                statusTimer = null;
            }, 2600);
        }
    }

    function getCheatNumber(inputId, fallback) {
        if (!cheatMenuElement) return fallback;
        const input = cheatMenuElement.querySelector("#" + inputId);
        const value = Number(input ? input.value : fallback);
        return Number.isFinite(value) ? value : fallback;
    }

    function refreshGameUI() {
        if (typeof updateGUI === "function") {
            updateGUI();
            return;
        }
        if (typeof calculateStats === "function") calculateStats();
    }

    function populateResourceOptions(select) {
        if (!select || typeof RESOURCE_DEFS === "undefined") return;

        const ids = Object.keys(RESOURCE_DEFS)
            .map(Number)
            .sort(function (leftId, rightId) {
                const left = RESOURCE_DEFS[leftId];
                const right = RESOURCE_DEFS[rightId];
                const leftCategory = String(left ? left.category : "");
                const rightCategory = String(right ? right.category : "");
                if (leftCategory !== rightCategory) {
                    return leftCategory.localeCompare(rightCategory);
                }
                return String(left ? left.name : "").localeCompare(
                    String(right ? right.name : "")
                );
            });

        select.innerHTML = "";
        ids.forEach(function (resourceId) {
            const definition = RESOURCE_DEFS[resourceId];
            if (!definition) return;

            const option = document.createElement("option");
            option.value = String(resourceId);
            option.textContent = "[" + definition.category + "] " + definition.name;
            select.appendChild(option);
        });
    }

    function populateItemOptions(select) {
        if (!select || typeof ITEM_DEFS === "undefined") return;

        const ids = Object.keys(ITEM_DEFS).map(Number).sort(function (leftId, rightId) {
            const left = ITEM_DEFS[leftId];
            const right = ITEM_DEFS[rightId];
            return String(left ? left.name : "").localeCompare(
                String(right ? right.name : "")
            );
        });

        select.innerHTML = "";
        ids.forEach(function (itemId) {
            const definition = ITEM_DEFS[itemId];
            if (!definition) return;

            const option = document.createElement("option");
            option.value = String(itemId);
            option.textContent = definition.name
                + (definition.kind ? " (" + definition.kind + ")" : "");
            select.appendChild(option);
        });
    }

    function populateRarityOptions(select) {
        if (!select || typeof ITEM_RARITY_DEFS === "undefined") return;

        select.innerHTML = "";
        Object.keys(ITEM_RARITY_DEFS).forEach(function (rarityId) {
            const definition = ITEM_RARITY_DEFS[rarityId];
            const option = document.createElement("option");
            option.value = rarityId;
            option.textContent = definition ? definition.label : rarityId;
            select.appendChild(option);
        });
        select.value = typeof ITEM_RARITIES !== "undefined"
            ? ITEM_RARITIES.Common
            : "common";
    }

    function eachCharacterEntry(callback) {
        if (!player) return;

        if (typeof CORE_STAT_NAMES !== "undefined") {
            CORE_STAT_NAMES.forEach(function (key) {
                if (player[key]) callback(player[key], key, "stat");
            });
        }
        if (typeof LEARNABLE_SKILL_KEYS !== "undefined") {
            LEARNABLE_SKILL_KEYS.forEach(function (key) {
                if (player[key]) callback(player[key], key, "skill");
            });
        }
    }

    const CHEAT_ACTIONS = Object.freeze({
        "add-resource": function () {
            const select = cheatMenuElement.querySelector("#cheat-resource");
            const resourceId = Number(select && select.value);
            const amount = getCheatNumber("cheat-resource-amount", 100);
            const quality = getCheatNumber("cheat-resource-quality", 50);

            if (!RESOURCE_DEFS[resourceId] || amount <= 0) {
                setCheatStatus("Enter a valid resource and amount.");
                return;
            }

            addResource(resourceId, amount, quality);
            setCheatStatus(
                "Added " + amount + " " + RESOURCE_DEFS[resourceId].name + "."
            );
            refreshGameUI();
        },

        "all-resources": function () {
            const amount = getCheatNumber("cheat-resource-amount", 100);
            const quality = getCheatNumber("cheat-resource-quality", 50);
            let count = 0;

            Object.keys(RESOURCE_DEFS).forEach(function (resourceIdText) {
                const resourceId = Number(resourceIdText);
                if (!Number.isFinite(resourceId)) return;
                addResource(resourceId, Math.max(1, amount), quality);
                count += 1;
            });

            setCheatStatus("Added " + Math.max(1, amount) + " to " + count + " resources.");
            refreshGameUI();
        },

        "refill": function () {
            calculateStats();
            player.hp = player.maxhp;
            player.mana = player.maxmana;
            player.stamina = player.maxstamina;
            setCheatStatus("HP, Mana and SP restored.");
            refreshGameUI();
        },

        "clear-hunger": function () {
            player.hunger = 0;
            player.autoEatActive = false;
            setCheatStatus("Hunger cleared.");
            refreshGameUI();
        },

        "max-potential": function () {
            eachCharacterEntry(function (entry) {
                entry.potential = MAX_POTENTIAL;
            });
            setCheatStatus("All potentials set to maximum.");
            refreshGameUI();
        },

        "stat-plus": function () {
            eachCharacterEntry(function (entry, key, kind) {
                if (kind !== "stat") return;
                entry.lvl = (Number(entry.lvl) || 1) + 1;
                entry.exp = getExperienceRequiredForLevel(entry.lvl);
            });
            setCheatStatus("All stats increased by 1 level.");
            refreshGameUI();
        },

        "skill-plus": function () {
            eachCharacterEntry(function (entry, key, kind) {
                if (kind !== "skill") return;
                entry.lvl = (Number(entry.lvl) || 1) + 1;
                entry.exp = getExperienceRequiredForLevel(entry.lvl);
            });
            setCheatStatus("All skills increased by 1 level.");
            refreshGameUI();
        },

        "player-exp": function () {
            addPlayerExp(1000);
            setCheatStatus("Added 1000 character EXP.");
            refreshGameUI();
        },

        "add-item": function () {
            const select = cheatMenuElement.querySelector("#cheat-item");
            const raritySelect = cheatMenuElement.querySelector("#cheat-item-rarity");
            const itemId = Number(select && select.value);
            const rarity = raritySelect ? raritySelect.value : ITEM_RARITIES.Common;
            const quality = getCheatNumber("cheat-item-quality", 10);

            if (!ITEM_DEFS[itemId]) {
                setCheatStatus("Choose a valid item.");
                return;
            }
            if (!hasFreeInventorySlot()) {
                setCheatStatus("Inventory is full.");
                return;
            }

            const item = createItemInstance(itemId, {
                rarity: rarity,
                quality: Math.max(0, quality),
            });
            if (!addCraftedItem(item)) {
                setCheatStatus("Inventory is full.");
                return;
            }

            if (typeof renderInventorySlots === "function") renderInventorySlots();
            setCheatStatus("Added " + ITEM_DEFS[itemId].name + ".");
        },

        "reveal-tile": function () {
            if (typeof currentTile === "undefined" || !currentTile) {
                setCheatStatus("No current tile.");
                return;
            }
            currentTile.revealed = EXPLORATION_COMPLETE;
            setCheatStatus("Current tile fully revealed.");
            refreshGameUI();
        },

        "advance-hour": function () {
            advanceGameClock(60 * 60);
            setCheatStatus("Advanced the game clock by 1 hour.");
            refreshGameUI();
        },

        "advance-day": function () {
            advanceGameClock(24 * 60 * 60);
            setCheatStatus("Advanced the game clock by 1 day.");
            refreshGameUI();
        },
    });

    function buildCheatMenu() {
        if (cheatMenuElement) return cheatMenuElement;

        const menu = document.createElement("div");
        menu.id = "cheatmenu";
        menu.className = "cheatmenu";
        menu.tabIndex = -1;
        menu.hidden = true;
        menu.innerHTML = ''
            + '<div class="cheatmenu-header">'
            + '  <span><i class="fa fa-terminal"></i> Cheat menu'
            + '    <small>press ~ to close</small></span>'
            + '  <button type="button" class="cheatmenu-close" data-cheat-close="1"'
            + '    title="Close cheat menu">&#10005;</button>'
            + '</div>'
            + '<div class="cheatmenu-body">'
            + '  <section class="cheatmenu-section">'
            + '    <h3>Resources</h3>'
            + '    <div class="cheatrow">'
            + '      <select id="cheat-resource" title="Resource"></select>'
            + '      <input id="cheat-resource-amount" type="number" value="100"'
            + '        min="0" step="1" title="Amount">'
            + '      <input id="cheat-resource-quality" type="number" value="50"'
            + '        min="1" step="1" title="Quality">'
            + '      <button type="button" data-cheat="add-resource">Add</button>'
            + '    </div>'
            + '    <div class="cheatrow">'
            + '      <button type="button" data-cheat="all-resources">Add to all resources</button>'
            + '      <span class="cheatmenu-note">Uses the amount and quality above.</span>'
            + '    </div>'
            + '  </section>'
            + '  <section class="cheatmenu-section">'
            + '    <h3>Character</h3>'
            + '    <div class="cheatrow">'
            + '      <button type="button" data-cheat="refill">Refill HP / Mana / SP</button>'
            + '      <button type="button" data-cheat="clear-hunger">Clear hunger</button>'
            + '      <button type="button" data-cheat="max-potential">Max potential</button>'
            + '    </div>'
            + '    <div class="cheatrow">'
            + '      <button type="button" data-cheat="stat-plus">+1 all stats</button>'
            + '      <button type="button" data-cheat="skill-plus">+1 all skills</button>'
            + '      <button type="button" data-cheat="player-exp">+1000 EXP</button>'
            + '    </div>'
            + '  </section>'
            + '  <section class="cheatmenu-section">'
            + '    <h3>Items</h3>'
            + '    <div class="cheatrow">'
            + '      <select id="cheat-item" title="Item"></select>'
            + '      <select id="cheat-item-rarity" title="Rarity"></select>'
            + '      <input id="cheat-item-quality" type="number" value="10"'
            + '        min="0" step="1" title="Quality">'
            + '      <button type="button" data-cheat="add-item">Add</button>'
            + '    </div>'
            + '  </section>'
            + '  <section class="cheatmenu-section">'
            + '    <h3>World</h3>'
            + '    <div class="cheatrow">'
            + '      <button type="button" data-cheat="reveal-tile">Reveal tile</button>'
            + '      <button type="button" data-cheat="advance-hour">+1 hour</button>'
            + '      <button type="button" data-cheat="advance-day">+1 day</button>'
            + '    </div>'
            + '  </section>'
            + '  <div id="cheatmenu-status" class="cheatmenu-status"></div>'
            + '</div>';

        document.body.appendChild(menu);

        populateResourceOptions(menu.querySelector("#cheat-resource"));
        populateItemOptions(menu.querySelector("#cheat-item"));
        populateRarityOptions(menu.querySelector("#cheat-item-rarity"));

        menu.addEventListener("click", function (event) {
            const closeButton = event.target.closest("[data-cheat-close]");
            if (closeButton) {
                closeCheatMenu();
                return;
            }

            const actionButton = event.target.closest("[data-cheat]");
            if (!actionButton) return;

            const action = CHEAT_ACTIONS[actionButton.dataset.cheat];
            if (typeof action === "function") action();
        });

        cheatMenuElement = menu;
        return menu;
    }

    function openCheatMenu() {
        if (!isDebugEnabled()) return;
        const menu = buildCheatMenu();
        menu.hidden = false;
        menu.focus();
    }

    function closeCheatMenu() {
        if (!cheatMenuElement) return;
        cheatMenuElement.hidden = true;
        if (statusTimer) {
            clearTimeout(statusTimer);
            statusTimer = null;
        }
    }

    function toggleCheatMenu() {
        if (!isDebugEnabled()) {
            closeCheatMenu();
            return;
        }

        if (isCheatMenuOpen()) {
            closeCheatMenu();
        } else {
            openCheatMenu();
        }
    }

    // Exposed for the debug toggle so an open cheat menu cannot stay visible
    // after debug messages are turned off.
    window.closeCheatMenu = closeCheatMenu;
    window.toggleCheatMenu = toggleCheatMenu;
    window.isCheatMenuOpen = isCheatMenuOpen;

    document.addEventListener("keydown", function (event) {
        const isBackquoteKey = event.code === "Backquote"
            || event.key === "~"
            || event.key === "`"
            || event.key === "ё"
            || event.key === "Ё";

        if (isBackquoteKey && !event.repeat && !isTypingTarget(event.target)) {
            if (!isDebugEnabled()) {
                closeCheatMenu();
                return;
            }
            event.preventDefault();
            toggleCheatMenu();
            return;
        }

        if (event.key === "Escape" && isCheatMenuOpen()) {
            event.preventDefault();
            closeCheatMenu();
        }
    });
})();
