// Internal mini-wiki. Every page is generated from the live game objects, so
// it never duplicates content tables. Locked craft recipes, buildings and
// technologies stay hidden until the same unlocks that reveal them in game.
(function () {
    const SECTIONS = [
        { id: "basics", title: "Basics" },
        { id: "character", title: "Character" },
        { id: "actions", title: "Actions" },
        { id: "crafting", title: "Crafting" },
        { id: "building", title: "Building" },
        { id: "world", title: "World" },
        { id: "items", title: "Items & Resources" },
        { id: "research", title: "Research" },
        { id: "formulas", title: "Formulas" },
    ];
    const STAT_KEYS = [
        "str", "agi", "vit", "per", "int", "ins", "sou", "luck", "speed",
    ];
    const STARTER_SKILLS = [
        "exploration", "forage", "rest", "survival", "cooking",
    ];

    const pages = [];
    const pageMap = new Map();
    let overlay = null;
    let sidebar = null;
    let content = null;
    let searchInput = null;
    let activePageId = null;

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            }[character];
        });
    }

    function richText(value) {
        return escapeHtml(value).replace(/&lt;br\s*\/?&gt;/gi, "<br>");
    }

    function formatValue(value) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return escapeHtml(value);
        }
        if (typeof formatGameNumber === "function") {
            return formatGameNumber(value);
        }
        if (typeof round2 === "function") {
            return round2(value);
        }
        return String(value);
    }

    function safe(callback, fallback) {
        try {
            return callback();
        } catch (error) {
            return fallback;
        }
    }

    function isSpoilerMode() {
        return typeof showSpoilers !== "undefined" && showSpoilers === true;
    }

    function isCraftVisible(recipe) {
        if (!recipe) return false;
        if (isSpoilerMode()) return true;
        return typeof isCraftRecipeUnlocked === "function"
            ? safe(function () { return isCraftRecipeUnlocked(recipe); }, false)
            : true;
    }

    function isBuildingVisible(def) {
        if (!def) return false;
        if (isSpoilerMode()) return true;
        return typeof isBuildingUnlocked === "function"
            ? safe(function () { return isBuildingUnlocked(def); }, false)
            : true;
    }

    function isTechnologyVisible(technology) {
        if (!technology) return false;
        if (isSpoilerMode()) return true;
        if (typeof player === "undefined" || !player || player.hasDayDreamed !== true) {
            return false;
        }
        return Number(technology.level) > 0
            || safe(function () { return technology.meetsRequirements(); }, false);
    }

    function isSkillVisible(skillKey) {
        if (isSpoilerMode()) return true;
        if (typeof player === "undefined" || !player || !player[skillKey]) {
            return false;
        }
        if (STARTER_SKILLS.indexOf(skillKey) !== -1) return true;
        const skill = player[skillKey];
        const baseExp = typeof BASE_EXP !== "undefined" ? BASE_EXP : 100;
        return Number(skill.lvl) > 1 || Number(skill.exp) !== baseExp;
    }

    function isWikiActionVisible(action) {
        if (!action || action.hasButton === false) return false;
        if (isSpoilerMode()) return true;
        if (typeof isContentUnlocked === "function"
            && !safe(function () { return isContentUnlocked("action", action.id); }, true)) {
            return false;
        }
        if (typeof window !== "undefined"
            && typeof window.isActionVisible === "function") {
            return safe(function () { return window.isActionVisible(action); }, false);
        }
        return true;
    }

    function pageLink(pageId, label) {
        return '<button type="button" class="wikilink" data-wiki-page="'
            + escapeHtml(pageId) + '">' + escapeHtml(label) + "</button>";
    }

    function formulaLink(pageId, label) {
        return '<div class="wikiformulalink">Formula: '
            + pageLink(pageId, label) + "</div>";
    }

    function table(headers, rows) {
        return '<table class="wikitables"><thead><tr>'
            + headers.map(function (header) {
                return "<th>" + escapeHtml(header) + "</th>";
            }).join("")
            + "</tr></thead><tbody>"
            + rows.map(function (row) {
                return "<tr>" + row.map(function (cell) {
                    return "<td>" + cell + "</td>";
                }).join("") + "</tr>";
            }).join("")
            + "</tbody></table>";
    }

    function bullets(items) {
        if (!items || !items.length) return "";
        return "<ul>" + items.map(function (item) {
            return "<li>" + item + "</li>";
        }).join("") + "</ul>";
    }

    function details(summary, body) {
        return "<details class=\"wikidetails\"><summary>"
            + richText(summary) + "</summary>" + body + "</details>";
    }

    function resourceName(resourceId) {
        const definition = typeof RESOURCE_DEFS !== "undefined"
            ? RESOURCE_DEFS[resourceId]
            : null;
        return definition ? definition.name : String(resourceId);
    }

    function resourceNames(resourceIds, limit) {
        const ids = Array.isArray(resourceIds) ? resourceIds : [];
        const max = Math.max(1, Number(limit) || 8);
        const shown = ids.slice(0, max).map(resourceName);
        const extra = ids.length > max ? " and " + (ids.length - max) + " more" : "";
        return escapeHtml(shown.join(", ") + extra);
    }

    function getWorld() {
        return typeof window !== "undefined"
            && window.mapView
            && window.mapView.world
            ? window.mapView.world
            : null;
    }

    function getWorldPrototype() {
        const world = getWorld();
        if (world) return Object.getPrototypeOf(world);
        return typeof WorldGen !== "undefined" ? WorldGen.prototype : null;
    }

    function currentTileLabel() {
        return typeof currentTile !== "undefined" && currentTile
            ? "X " + currentTile.x + ", Y " + currentTile.y
            : "unknown";
    }

    function currentDateTimeLabel() {
        if (typeof gameTime === "undefined" || !gameTime
            || typeof gameMinutesToDateTime !== "function") {
            return "unknown";
        }
        const dateTime = safe(function () {
            return gameMinutesToDateTime(gameTime.totalMinutes);
        }, null);
        if (!dateTime) return "unknown";
        const monthName = typeof GAME_MONTH_NAMES !== "undefined"
            && GAME_MONTH_NAMES[dateTime.month - 1]
            ? GAME_MONTH_NAMES[dateTime.month - 1]
            : "Month " + dateTime.month;
        return "Year " + dateTime.year + ", " + monthName + " " + dateTime.day
            + ", " + String(dateTime.hour).padStart(2, "0")
            + ":" + String(dateTime.minute).padStart(2, "0");
    }

    function getPlayerSkillLabel(skillKey) {
        if (typeof SKILL_DISPLAY_NAMES !== "undefined"
            && SKILL_DISPLAY_NAMES[skillKey]) {
            return SKILL_DISPLAY_NAMES[skillKey];
        }
        if (typeof player !== "undefined" && player && player[skillKey]) {
            return player[skillKey].name || skillKey;
        }
        return skillKey;
    }

    function addPage(page) {
        if (!page || !page.id || pageMap.has(page.id)) return null;
        pageMap.set(page.id, page);
        pages.push(page);
        return page;
    }

    function addSimplePage(id, section, title, render) {
        return addPage({
            id: id,
            section: section,
            title: title,
            render: render,
        });
    }

    function addFormulaEntry(label, fn, sampleFn) {
        if (typeof fn !== "function") return "";
        let sample = "";
        if (typeof sampleFn === "function") {
            const value = safe(sampleFn, null);
            if (value != null && value !== "") {
                sample = '<div class="wikisample">Current: <b>'
                    + escapeHtml(value) + "</b></div>";
            }
        }
        return '<section class="wikiformula"><h3>' + escapeHtml(label)
            + ' <code>' + escapeHtml(fn.name || "formula") + "</code></h3>"
            + sample
            + "<details class=\"wikidetails\"><summary>Show game source</summary>"
            + '<pre class="wikicode">' + escapeHtml(fn.toString()) + "</pre>"
            + "</details></section>";
    }

    function addFormulaPage(id, title, introduction, entries) {
        addSimplePage(id, "formulas", title, function () {
            const body = entries.map(function (entry) {
                return addFormulaEntry(entry[0], entry[1], entry[2]);
            }).join("");
            return "<h1>" + escapeHtml(title) + "</h1><p>"
                + richText(introduction) + "</p>" + body;
        });
    }

    // --- Basics -------------------------------------------------------------

    addSimplePage("basics-overview", "basics", "Wiki overview", function () {
        const seed = typeof getOrCreateMapSeed === "function"
            ? safe(getOrCreateMapSeed, "")
            : "";
        return "<h1>Muuguu Legends Wiki</h1>"
            + "<p>This wiki is generated directly from the running game. "
            + "Resource lists, recipes, buildings, technologies and formulas "
            + "come from the same objects the game uses.</p>"
            + "<p>Locked craft recipes, buildings and technologies are hidden. "
            + "They appear here when they unlock in game. The debug spoiler "
            + "toggle reveals every page.</p>"
            + table(["Field", "Value"], [
                ["Character", escapeHtml(typeof player !== "undefined" && player ? player.name : "unknown")],
                ["Level", escapeHtml(typeof player !== "undefined" && player ? player.lvl : "?")],
                ["Current tile", escapeHtml(currentTileLabel())],
                ["Date", escapeHtml(currentDateTimeLabel())],
                ["Map seed", escapeHtml(seed)],
            ])
            + "<h2>Browse</h2>"
            + bullets([
                pageLink("character-overview", "Character and vitals"),
                pageLink("craft-overview", "Crafting"),
                pageLink("build-overview", "Buildings"),
                pageLink("world-overview", "World generation and biomes"),
                pageLink("items-overview", "Items and resources"),
                pageLink("research-overview", "Research"),
                pageLink("formulas", "Formulas and source references"),
            ]);
    });

    addSimplePage("basics-controls", "basics", "Controls and interface", function () {
        return "<h1>Controls and interface</h1>"
            + bullets([
                "The top tabs switch between Character, Actions, Map, Research, Habits, Craft, Build and Options.",
                "Actions are started from the Actions tab. Timed actions occupy action points and can be resumed after combat or conversation.",
                "The Map tab shows explored tiles. Click a revealed tile to inspect it or travel there.",
                "Options contains save slots, debug messages, number format and the Wiki button.",
                "Press <b>~</b> while debug messages are enabled to open the cheat menu.",
                "Press <b>Escape</b> to close the Wiki or the cheat menu.",
            ])
            + "<p>Most interface panels are rebuilt from JavaScript state, so a page may change immediately after a technology, recipe or building unlocks.</p>";
    });

    addSimplePage("basics-time", "basics", "Time, months and seasons", function () {
        const dateTime = typeof gameTime !== "undefined" && gameTime
            ? safe(function () { return gameMinutesToDateTime(gameTime.totalMinutes); }, null)
            : null;
        const season = dateTime && typeof getGameSeason === "function"
            ? safe(function () { return getGameSeason(dateTime.month); }, null)
            : null;
        return "<h1>Time, months and seasons</h1>"
            + table(["Field", "Value"], [
                ["Current date", escapeHtml(currentDateTimeLabel())],
                ["Total game minutes", escapeHtml(gameTime ? gameTime.totalMinutes : "?")],
                ["Month", escapeHtml(dateTime ? dateTime.month : "?")],
                ["Season", escapeHtml(season ? season.name || season.id : "?")],
                ["Night starts", "20:00"],
                ["Night ends", "06:00"],
            ])
            + "<p>One real second advances one game minute by default. Months drive farm and tree ripening, monthly vegetation growth, weather periods and mob level bonuses from the current year.</p>"
            + formulaLink("formula-monthly-growth", "monthly vegetation growth")
            + formulaLink("formula-mob-level", "mob level by year and distance");
    });

    addSimplePage("basics-hunger", "basics", "Hunger, stamina and rest", function () {
        const hunger = typeof player !== "undefined" && player ? player.hunger : 0;
        const maxHunger = typeof player !== "undefined" && player ? player.maxHunger : 0;
        const status = typeof getHungerStatus === "function"
            ? safe(getHungerStatus, null)
            : null;
        return "<h1>Hunger, stamina and rest</h1>"
            + table(["Field", "Value"], [
                ["Hunger", formatValue(hunger) + " / " + formatValue(maxHunger)],
                ["Hunger status", escapeHtml(typeof status === "string" ? status : (status && status.name) || "unknown")],
                ["Stamina", formatValue(player ? player.stamina : 0) + " / " + formatValue(player ? player.maxstamina : 0)],
                ["Well fed", player && player.hunger <= 0 ? "Yes" : "No"],
            ])
            + "<p>Stamina powers timed actions. Rest restores stamina; sleep restores stamina, HP and mana while time passes. Hunger rises with action use and falls when eating. Auto-eat and auto-cook are unlocked through DietBasics research.</p>"
            + formulaLink("formula-hunger", "hunger gain and regeneration");
    });

    addSimplePage("basics-save", "basics", "Saving and loading", function () {
        return "<h1>Saving and loading</h1>"
            + "<p>The game stores one automatic save under <code>data</code> and three manual slots under <code>data_slot_1</code>, <code>data_slot_2</code> and <code>data_slot_3</code> in browser localStorage.</p>"
            + "<p>Manual slots are managed in Options. Loading an older save runs the migration code in <code>deepjs/save.js</code>: missing skills, items, buildings and NPC fields are filled with safe defaults.</p>"
            + "<p>Do not clear localStorage while testing if you want to keep a run.</p>";
    });

    addSimplePage("basics-actions", "basics", "Action points and timed actions", function () {
        return "<h1>Action points and timed actions</h1>"
            + "<p>Each timed action occupies one action point. Starting an action reduces free action points; stopping or completing it returns the point. Instant actions do not occupy a point.</p>"
            + "<p>Combat and NPC conversations pause active timed actions and block new ones until they end. Lazy basics can automatically restart previous actions after combat.</p>"
            + "<p>Some actions have stamina costs per second. If stamina runs out, the action cannot continue efficiently.</p>";
    });

    // --- Character ----------------------------------------------------------

    addSimplePage("character-overview", "character", "Character overview", function () {
        return "<h1>Character overview</h1>"
            + table(["Field", "Value"], [
                ["Name", escapeHtml(player ? player.name : "unknown")],
                ["Level", escapeHtml(player ? player.lvl : "?")],
                ["Experience", formatValue(player ? player.exp : 0) + " / " + formatValue(player ? player.maxexp : 0)],
                ["HP", formatValue(player ? player.hp : 0) + " / " + formatValue(player ? player.maxhp : 0)],
                ["Mana", formatValue(player ? player.mana : 0) + " / " + formatValue(player ? player.maxmana : 0)],
                ["Stamina", formatValue(player ? player.stamina : 0) + " / " + formatValue(player ? player.maxstamina : 0)],
                ["Hunger", formatValue(player ? player.hunger : 0) + " / " + formatValue(player ? player.maxHunger : 0)],
            ])
            + "<h2>Character pages</h2>"
            + bullets([
                pageLink("character-stats", "Stats"),
                pageLink("character-skills", "Skills"),
                pageLink("character-vitals", "HP, mana and stamina"),
                pageLink("character-potential", "Potential and experience"),
                pageLink("character-equipment", "Equipment and inventory"),
                pageLink("character-combat", "Combat"),
            ])
            + formulaLink("formula-character-vitals", "character vitals");
    });

    addSimplePage("character-vitals", "character", "HP, mana and stamina", function () {
        return "<h1>HP, mana and stamina</h1>"
            + table(["Resource", "Current", "Maximum"], [
                ["HP", formatValue(player ? player.hp : 0), formatValue(player ? player.maxhp : 0)],
                ["Mana", formatValue(player ? player.mana : 0), formatValue(player ? player.maxmana : 0)],
                ["Stamina", formatValue(player ? player.stamina : 0), formatValue(player ? player.maxstamina : 0)],
            ])
            + "<p>The maximum values are recalculated from effective stats, character level and global equipment or building multipliers.</p>"
            + formulaLink("formula-character-vitals", "calculateStats source");
    });

    addSimplePage("character-stats", "character", "Stats", function () {
        const rows = STAT_KEYS.map(function (key) {
            const stat = player && player[key];
            if (!stat) return null;
            const name = stat.name || key;
            const effective = typeof getEffectiveLevel === "function"
                ? safe(function () { return getEffectiveLevel(key); }, stat.lvl)
                : stat.lvl;
            return [
                pageLink("stat-" + key, name),
                formatValue(stat.lvl),
                formatValue(effective),
                formatValue(stat.potential) + "%",
                formatValue(stat.exp) + " / " + formatValue(
                    typeof getExperienceRequiredForLevel === "function"
                        ? getExperienceRequiredForLevel(stat.lvl)
                        : 0
                ),
            ];
        }).filter(Boolean);
        return "<h1>Stats</h1>"
            + "<p>Stats grow through use. Effective level includes equipment and building bonuses; the base level is what experience raises.</p>"
            + table(["Stat", "Base", "Effective", "Potential", "EXP"], rows)
            + formulaLink("formula-skill-exp", "experience requirement");
    });

    STAT_KEYS.forEach(function (key) {
        const stat = player && player[key];
        if (!stat) return;
        addPage({
            id: "stat-" + key,
            section: "character",
            title: stat.name || key,
            render: function () {
                const effective = typeof getEffectiveLevel === "function"
                    ? safe(function () { return getEffectiveLevel(key); }, stat.lvl)
                    : stat.lvl;
                return "<h1>" + escapeHtml(stat.name || key) + "</h1>"
                    + "<p>" + richText(stat.description) + "</p>"
                    + table(["Field", "Value"], [
                        ["Base level", formatValue(stat.lvl)],
                        ["Effective level", formatValue(effective)],
                        ["Potential", formatValue(stat.potential) + "%"],
                        ["Experience", formatValue(stat.exp) + " / " + formatValue(
                            typeof getExperienceRequiredForLevel === "function"
                                ? getExperienceRequiredForLevel(stat.lvl)
                                : 0
                        )],
                    ])
                    + formulaLink("formula-skill-exp", "experience requirement");
            },
        });
    });

    addSimplePage("character-skills", "character", "Skills", function () {
        const skillKeys = typeof LEARNABLE_SKILL_KEYS !== "undefined"
            ? LEARNABLE_SKILL_KEYS
            : [];
        const visibleKeys = skillKeys.filter(isSkillVisible);
        const rows = visibleKeys.map(function (key) {
            const skill = player && player[key];
            if (!skill) return null;
            const effective = typeof getEffectiveLevel === "function"
                ? safe(function () { return getEffectiveLevel(key); }, skill.lvl)
                : skill.lvl;
            return [
                pageLink("skill-" + key, getPlayerSkillLabel(key)),
                formatValue(skill.lvl),
                formatValue(effective),
                formatValue(skill.potential) + "%",
                formatValue(skill.exp) + " / " + formatValue(
                    typeof getExperienceRequiredForLevel === "function"
                        ? getExperienceRequiredForLevel(skill.lvl)
                        : 0
                ),
            ];
        }).filter(Boolean);
        return "<h1>Skills</h1>"
            + "<p>Skills are character abilities raised by performing related actions and crafting. A skill page appears once the skill gains experience; the debug spoiler toggle reveals all of them.</p>"
            + (rows.length ? table(["Skill", "Base", "Effective", "Potential", "EXP"], rows) : "")
            + formulaLink("formula-skill-exp", "skill experience and level curve");
    });

    (typeof LEARNABLE_SKILL_KEYS !== "undefined" ? LEARNABLE_SKILL_KEYS : []).forEach(function (key) {
        const skill = player && player[key];
        if (!skill) return;
        addPage({
            id: "skill-" + key,
            section: "character",
            title: getPlayerSkillLabel(key),
            hidden: function () { return !isSkillVisible(key); },
            render: function () {
                const effective = typeof getEffectiveLevel === "function"
                    ? safe(function () { return getEffectiveLevel(key); }, skill.lvl)
                    : skill.lvl;
                const required = typeof getExperienceRequiredForLevel === "function"
                    ? safe(function () { return getExperienceRequiredForLevel(skill.lvl); }, 0)
                    : 0;
                return "<h1>" + escapeHtml(getPlayerSkillLabel(key)) + "</h1>"
                    + "<p>" + richText(skill.description) + "</p>"
                    + table(["Field", "Value"], [
                        ["Base level", formatValue(skill.lvl)],
                        ["Effective level", formatValue(effective)],
                        ["Potential", formatValue(skill.potential) + "%"],
                        ["Experience", formatValue(skill.exp) + " / " + formatValue(required)],
                    ])
                    + formulaLink("formula-skill-exp", "experience requirement")
                    + "<p>Related actions, recipes and equipment can be found through the search box or the Crafting and Actions sections.</p>";
            },
        });
    });

    addSimplePage("character-potential", "character", "Potential and experience", function () {
        return "<h1>Potential and experience</h1>"
            + "<p>Each stat and skill has a potential percentage. Potential controls how much experience a level-up can absorb; food, rare items and some technologies can raise it. The maximum is normally 100%, but effects can push it above that.</p>"
            + "<p>Experience needed for the next level grows geometrically. The current character and skill requirements are shown in their pages.</p>"
            + formulaLink("formula-skill-exp", "level requirement and potential handling");
    });

    addSimplePage("character-equipment", "character", "Equipment and inventory", function () {
        const slotGroups = typeof EQUIPMENT_SLOT_GROUPS !== "undefined"
            ? EQUIPMENT_SLOT_GROUPS
            : [];
        const rows = [];
        slotGroups.forEach(function (group) {
            (group.slots || []).forEach(function (slot) {
                const item = player && player.equipment ? player.equipment[slot.id] : null;
                rows.push([
                    escapeHtml(group.name),
                    escapeHtml(slot.label || slot.id),
                    item ? escapeHtml(item.name) : "-",
                ]);
            });
        });
        const inventoryCount = player && Array.isArray(player.equipinventory)
            ? player.equipinventory.filter(Boolean).length
            : 0;
        const inventorySlots = typeof getEffectiveInventorySlots === "function"
            ? safe(getEffectiveInventorySlots, 0)
            : 0;
        return "<h1>Equipment and inventory</h1>"
            + table(["Group", "Slot", "Equipped"], rows)
            + "<p>Inventory: " + formatValue(inventoryCount) + " / "
            + formatValue(inventorySlots) + " slots. Equipment slots accept compatible items; ring, earring and ankle slots have multiple copies.</p>"
            + "<p>Item values scale with quality and rarity. See the Items section for rarity, properties and tool powers.</p>"
            + bullets([
                pageLink("items-overview", "Items overview"),
                pageLink("items-rarity", "Rarity and properties"),
            ]);
    });

    addSimplePage("character-combat", "character", "Combat", function () {
        return "<h1>Combat</h1>"
            + "<p>Combat is turn-free: both sides accumulate attack timers and strike when ready. Attack, defence, hit chance, critical chance and flee come from stats, skills and equipment.</p>"
            + "<p>Mob level depends on distance from the start tile and the current game year. Higher levels multiply mob stats. Combat pauses timed actions; after victory or defeat, previous actions may resume.</p>"
            + "<p>Spirit speak spends mana to heal. Weapon skills gain experience when their weapon type is used, and rare mobs can drop resources, spirit resources and loot.</p>"
            + formulaLink("formula-combat", "combat attack, defence and hit chance")
            + formulaLink("formula-mob-level", "mob level by distance and year");
    });

    // --- Actions ------------------------------------------------------------

    addSimplePage("actions-overview", "actions", "Actions", function () {
        const actions = typeof ACTIONS !== "undefined" ? ACTIONS : [];
        const visible = actions.filter(isWikiActionVisible);
        return "<h1>Actions</h1>"
            + "<p>Actions are generated from the live action list. Only actions currently available are shown here; context-dependent actions appear when their tile, skill or item requirements are met.</p>"
            + (visible.length
                ? bullets(visible.map(function (action) {
                    return pageLink("action-" + action.id, action.label || action.id)
                        + " — " + richText(
                            typeof getActionDescription === "function"
                                ? safe(function () { return getActionDescription(action); }, "")
                                : action.description || ""
                        );
                }))
                : "<p>No actions are currently available.</p>");
    });

    (typeof ACTIONS !== "undefined" ? ACTIONS : []).forEach(function (action) {
        addPage({
            id: "action-" + action.id,
            section: "actions",
            title: action.label || action.id,
            hidden: function () { return !isWikiActionVisible(action); },
            render: function () {
                const description = typeof getActionDescription === "function"
                    ? safe(function () { return getActionDescription(action); }, "")
                    : action.description || "";
                const tags = Array.isArray(action.tags) ? action.tags.join(", ") : "";
                let stamina = action.staminaPerSecond;
                if (typeof stamina === "function") {
                    stamina = safe(stamina, "");
                }
                return "<h1>" + escapeHtml(action.label || action.id) + "</h1>"
                    + "<p>" + richText(description) + "</p>"
                    + table(["Field", "Value"], [
                        ["ID", escapeHtml(action.id)],
                        ["Kind", escapeHtml(action.kind || "")],
                        ["Tags", escapeHtml(tags)],
                        ["Stamina per second", escapeHtml(stamina == null ? "" : stamina)],
                        ["Visible", isWikiActionVisible(action) ? "Yes" : "No"],
                    ])
                    + (action.unavailableMessage
                        ? "<p><b>Unavailable:</b> " + richText(action.unavailableMessage) + "</p>"
                        : "");
            },
        });
    });

    // --- Crafting -----------------------------------------------------------

    addSimplePage("craft-overview", "crafting", "Crafting overview", function () {
        const categories = typeof CRAFT_CATEGORIES !== "undefined"
            ? CRAFT_CATEGORIES
            : [];
        return "<h1>Crafting overview</h1>"
            + "<p>Recipes use resources, optional ingredient choices, crafted item ingredients and stations. Result quality starts as the weighted ingredient quality and is softcapped by the recipe skill.</p>"
            + "<p>Rarity is rolled from quality and skill, modified by Luck and equipment. Random item properties scale with quality and rarity. Food instead converts its rarity slots into potential bonuses.</p>"
            + "<p>The Common, Tools and Cultery categories accept optional raw gemstones. Jewelry recipes use carved gemstones and their own cut system.</p>"
            + bullets(categories.map(function (category) {
                return pageLink("craft-category-" + category.id, category.name);
            }))
            + formulaLink("formula-craft-quality", "craft quality and softcap")
            + formulaLink("formula-craft-rarity", "craft rarity roll")
            + formulaLink("formula-craft-exp", "craft skill and Luck experience")
            + formulaLink("formula-jewelry", "Jewelry quality, cuts and gem properties");
    });

    (typeof CRAFT_CATEGORIES !== "undefined" ? CRAFT_CATEGORIES : []).forEach(function (category) {
        const categoryRecipes = typeof CRAFT_RECIPES !== "undefined"
            ? CRAFT_RECIPES.filter(function (recipe) {
                return recipe.category === category.id;
            })
            : [];
        addPage({
            id: "craft-category-" + category.id,
            section: "crafting",
            title: "Craft: " + category.name,
            hidden: function () {
                return !isSpoilerMode()
                    && !categoryRecipes.some(isCraftVisible);
            },
            render: function () {
                const visibleRecipes = categoryRecipes.filter(isCraftVisible);
                return "<h1>Craft: " + escapeHtml(category.name) + "</h1>"
                    + "<p>Only recipes unlocked in game are listed.</p>"
                    + (visibleRecipes.length
                        ? bullets(visibleRecipes.map(function (recipe) {
                            return pageLink("craft-recipe-" + recipe.id,
                                getCraftResultName(recipe))
                                + " — " + escapeHtml(
                                    typeof getCraftSkillName === "function"
                                        ? getCraftSkillName(recipe)
                                        : recipe.skill || ""
                                );
                        }))
                        : "<p>No recipes from this category are unlocked yet.</p>");
            },
        });
    });

    function recipeStationLines(recipe) {
        const lines = [];
        if (recipe.requiresCampfire) lines.push("Campfire required");
        if (recipe.requiresWater) lines.push("Water required");
        if (recipe.requiresEquippedSlot) {
            lines.push("Equipped slot required: " + recipe.requiresEquippedSlot);
        }
        if (recipe.requiresCookingPower) lines.push("Cooking power required");
        if (recipe.requiredToolPower) {
            lines.push("Tool power required: " + recipe.requiredToolPower.type
                + " " + recipe.requiredToolPower.power);
        }
        return lines;
    }

    function recipeRequirementRows(recipe) {
        const rows = [];
        (recipe.resources || []).forEach(function (requirement) {
            rows.push([resourceName(requirement.resourceId), formatValue(requirement.amount)]);
        });
        if (Array.isArray(recipe.choiceResourceIds) && recipe.choiceResourceIds.length) {
            rows.push([
                "One of: " + resourceNames(recipe.choiceResourceIds, 10),
                formatValue(recipe.choiceAmount || 1),
            ]);
        }
        (recipe.choiceSlots || []).forEach(function (slot) {
            rows.push([
                (slot.label || slot.id) + ": " + resourceNames(slot.resourceIds, 10),
                formatValue(slot.amount || 1),
            ]);
        });
        if (recipe.itemChoice) {
            const ids = Array.isArray(recipe.itemChoice.itemIds)
                ? recipe.itemChoice.itemIds
                : (recipe.itemChoice.itemId != null ? [recipe.itemChoice.itemId] : []);
            const names = ids.map(function (itemId) {
                return typeof ITEM_DEFS !== "undefined" && ITEM_DEFS[itemId]
                    ? ITEM_DEFS[itemId].name
                    : String(itemId);
            });
            rows.push([recipe.itemChoice.label || "Item ingredient", escapeHtml(names.join(", "))]);
        }
        return rows;
    }

    (typeof CRAFT_RECIPES !== "undefined" ? CRAFT_RECIPES : []).forEach(function (recipe) {
        addPage({
            id: "craft-recipe-" + recipe.id,
            section: "crafting",
            title: typeof getCraftResultName === "function"
                ? getCraftResultName(recipe)
                : recipe.id,
            hidden: function () { return !isCraftVisible(recipe); },
            render: function () {
                const resultName = typeof getCraftResultName === "function"
                    ? getCraftResultName(recipe)
                    : recipe.id;
                const resultDefinition = typeof ITEM_DEFS !== "undefined"
                    ? ITEM_DEFS[recipe.itemId]
                    : null;
                const stationLines = recipeStationLines(recipe);
                const bonusLines = [];
                if (recipe.gemBonus === true) {
                    const multiplier = Number(recipe.bonusChoiceSlotsSkillLevelMultiplier) || 1;
                    bonusLines.push("Optional raw gemstones. Slots scale with Jewelry"
                        + (multiplier > 1 ? " and require " + multiplier + "x the level" : "")
                        + ". Current slots: " + formatValue(
                            typeof getCraftBonusSlotCount === "function"
                                ? safe(function () { return getCraftBonusSlotCount(recipe); }, 0)
                                : 0
                        ));
                } else if (recipe.bonusChoiceSlotsFromCooking === true) {
                    bonusLines.push("Optional Cooking bonus ingredients. Current slots: "
                        + formatValue(
                            typeof getCraftBonusSlotCount === "function"
                                ? safe(function () { return getCraftBonusSlotCount(recipe); }, 0)
                                : 0
                        ));
                } else if (recipe.bonusChoiceSlots) {
                    bonusLines.push("Optional bonus ingredients: "
                        + formatValue(recipe.bonusChoiceSlots));
                }
                return "<h1>" + escapeHtml(resultName) + "</h1>"
                    + table(["Field", "Value"], [
                        ["Recipe ID", escapeHtml(recipe.id)],
                        ["Category", escapeHtml(recipe.category)],
                        ["Group", escapeHtml(recipe.group || "")],
                        ["Skill", escapeHtml(typeof getCraftSkillName === "function"
                            ? getCraftSkillName(recipe)
                            : recipe.skill || "")],
                        ["Station", escapeHtml(stationLines.join("; ") || "None")],
                    ])
                    + "<h2>Requirements</h2>"
                    + table(["Resource", "Amount"], recipeRequirementRows(recipe))
                    + (bonusLines.length ? "<h2>Bonus ingredients</h2>"
                        + bullets(bonusLines) : "")
                    + "<h2>Result</h2>"
                    + (resultDefinition
                        ? "<p><b>" + escapeHtml(resultDefinition.name) + "</b> ("
                            + escapeHtml(resultDefinition.kind || "item") + "). "
                            + richText(resultDefinition.description || "") + "</p>"
                        : "<p>The result item definition is unavailable.</p>")
                    + (recipe.category === "jewerly"
                        ? "<p>Jewelry cuts and inherited gemstone properties use the Jewelry rules.</p>"
                        : "")
                    + formulaLink("formula-craft-quality", "quality and softcap")
                    + formulaLink("formula-craft-rarity", "rarity roll")
                    + formulaLink("formula-craft-exp", "craft experience")
                    + (recipe.category === "jewerly"
                        ? formulaLink("formula-jewelry", "Jewelry formulas")
                        : "");
            },
        });
    });

    // --- Buildings ----------------------------------------------------------

    addSimplePage("build-overview", "building", "Building overview", function () {
        const categories = typeof BUILDING_CATEGORIES !== "undefined"
            ? BUILDING_CATEGORIES
            : [];
        return "<h1>Building overview</h1>"
            + "<p>Buildings consume resources, work points and sometimes tile space. Construction trains the listed skill; quality depends on the builder and the construction work.</p>"
            + "<p>Completed buildings can be improved through the Improve construction system. Farm fields, planted trees and other harvest buildings use monthly ripening and separate harvest actions.</p>"
            + bullets(categories.map(function (category) {
                return pageLink("build-category-" + category.id, category.name);
            }))
            + formulaLink("formula-building", "building work and quality");
    });

    (typeof BUILDING_CATEGORIES !== "undefined" ? BUILDING_CATEGORIES : []).forEach(function (category) {
        const categoryDefs = typeof BUILDING_DEFS !== "undefined"
            ? Object.keys(BUILDING_DEFS).map(function (id) {
                return BUILDING_DEFS[id];
            }).filter(function (def) {
                return def && def.category === category.id;
            })
            : [];
        addPage({
            id: "build-category-" + category.id,
            section: "building",
            title: "Build: " + category.name,
            hidden: function () {
                return !isSpoilerMode()
                    && !categoryDefs.some(isBuildingVisible);
            },
            render: function () {
                const visibleDefs = categoryDefs.filter(isBuildingVisible);
                return "<h1>Build: " + escapeHtml(category.name) + "</h1>"
                    + (visibleDefs.length
                        ? bullets(visibleDefs.map(function (def) {
                            return pageLink("build-" + def.id, def.name);
                        }))
                        : "<p>No buildings from this category are unlocked yet.</p>");
            },
        });
    });

    (typeof BUILDING_DEFS !== "undefined" ? Object.keys(BUILDING_DEFS).map(function (id) {
        return BUILDING_DEFS[id];
    }) : []).forEach(function (def) {
        if (!def) return;
        addPage({
            id: "build-" + def.id,
            section: "building",
            title: def.name,
            hidden: function () { return !isBuildingVisible(def); },
            render: function () {
                const resources = (def.resources || []).map(function (requirement) {
                    return [resourceName(requirement.resourceId), formatValue(requirement.amount)];
                });
                const space = [];
                (def.spaceElementRequirements || []).forEach(function (requirement) {
                    space.push(requirement.element + " x" + formatValue(requirement.amount));
                });
                return "<h1>" + escapeHtml(def.name) + "</h1>"
                    + "<p>" + richText(def.description || "") + "</p>"
                    + table(["Field", "Value"], [
                        ["Category", escapeHtml(def.category || "")],
                        ["WorkPoints", formatValue(def.workPoints || 0)],
                        ["Skill", escapeHtml(def.skill || "")],
                        ["Empty space", formatValue(def.emptySpace || 0)],
                        ["Room space", formatValue(def.roomSpace || def.roomSpaceReward || 0)],
                        ["Space elements", escapeHtml(space.join(", ") || "None")],
                    ])
                    + "<h2>Resources</h2>"
                    + (resources.length
                        ? table(["Resource", "Amount"], resources)
                        : "<p>No material resources required.</p>")
                    + (def.effectText
                        ? "<h2>Effect</h2><p>" + richText(def.effectText) + "</p>"
                        : "")
                    + formulaLink("formula-building", "building work and quality");
            },
        });
    });

    // --- Items and resources ------------------------------------------------

    addSimplePage("items-overview", "items", "Items and resources", function () {
        const inventoryCount = player && Array.isArray(player.equipinventory)
            ? player.equipinventory.filter(Boolean).length
            : 0;
        const inventorySlots = typeof getEffectiveInventorySlots === "function"
            ? safe(getEffectiveInventorySlots, 0)
            : 0;
        return "<h1>Items and resources</h1>"
            + "<p>Resources are stackable materials and food. Items are individual objects with quality, rarity and optional properties or tool powers.</p>"
            + table(["Field", "Value"], [
                ["Inventory", formatValue(inventoryCount) + " / " + formatValue(inventorySlots)],
                ["Item kinds", escapeHtml(
                    typeof ITEM_KINDS !== "undefined"
                        ? Object.keys(ITEM_KINDS).map(function (key) { return ITEM_KINDS[key]; }).join(", ")
                        : ""
                )],
            ])
            + bullets([
                pageLink("items-rarity", "Rarity, quality and properties"),
                pageLink("items-gemstones", "Gemstones"),
                pageLink("items-jewelry", "Jewelry and cuts"),
            ]);
    });

    const resourceCategoryValues = typeof RESOURCE_CATEGORIES !== "undefined"
        ? Object.keys(RESOURCE_CATEGORIES).map(function (key) {
            return { key: key, value: RESOURCE_CATEGORIES[key] };
        })
        : [];
    resourceCategoryValues.forEach(function (category) {
        const categoryResources = typeof RESOURCE_DEFS !== "undefined"
            ? Object.keys(RESOURCE_DEFS).map(Number).filter(function (resourceId) {
                const definition = RESOURCE_DEFS[resourceId];
                return definition && definition.category === category.value;
            }).sort(function (leftId, rightId) {
                return String(RESOURCE_DEFS[leftId].name).localeCompare(
                    String(RESOURCE_DEFS[rightId].name)
                );
            })
            : [];
        addPage({
            id: "resources-" + category.value,
            section: "items",
            title: "Resources: " + category.key,
            render: function () {
                return "<h1>Resources: " + escapeHtml(category.key) + "</h1>"
                    + "<p>All resources in this category. Weight is per unit; fish use 1 unit = 1 kg, gemstones are tiny.</p>"
                    + (categoryResources.length
                        ? categoryResources.map(function (resourceId) {
                            const definition = RESOURCE_DEFS[resourceId];
                            const tags = Array.isArray(definition.tags)
                                ? definition.tags.join(", ")
                                : "";
                            const potential = definition.potentialBonuses
                                ? Object.keys(definition.potentialBonuses).join(", ")
                                : "";
                            return details(
                                definition.name,
                                table(["Field", "Value"], [
                                    ["ID", escapeHtml(resourceId)],
                                    ["Weight", formatValue(definition.weight) + " " + escapeHtml(definition.unitType || "")],
                                    ["Tags", escapeHtml(tags || "None")],
                                    ["Potential", escapeHtml(potential || "None")],
                                    ["Description", richText(definition.description || "")],
                                ])
                                + (definition.gemProperties
                                    ? "<p>Dormant gemstone bonuses: "
                                        + formatValue(definition.gemProperties.length)
                                        + " properties.</p>"
                                    : "")
                            );
                        }).join("")
                        : "<p>No resources in this category.</p>");
            },
        });
    });

    addSimplePage("items-rarity", "items", "Rarity and properties", function () {
        const rarityRows = typeof ITEM_RARITY_DEFS !== "undefined"
            ? Object.keys(ITEM_RARITY_DEFS).map(function (rarityId) {
                const definition = ITEM_RARITY_DEFS[rarityId];
                return [
                    escapeHtml(definition.label || rarityId),
                    formatValue(definition.multiplier || 1),
                    formatValue(definition.properties || 0),
                ];
            })
            : [];
        return "<h1>Rarity, quality and properties</h1>"
            + "<p>Item power scales from quality, rarity, a per-instance variance roll and optional affixes. Identical values are shown as percentages or flat bonuses.</p>"
            + table(["Rarity", "Multiplier", "Properties"], rarityRows)
            + formulaLink("formula-item-power", "item power multiplier");
    });

    addSimplePage("items-gemstones", "items", "Gemstones", function () {
        const definitions = typeof GEMSTONE_DEFINITIONS !== "undefined"
            ? GEMSTONE_DEFINITIONS
            : [];
        return "<h1>Gemstones</h1>"
            + "<p>Every gemstone has a rarity, a base quality and dormant item bonuses rolled from the map seed. Carving and jewelry copy or scale those bonuses into real items.</p>"
            + table(["Gemstone", "Rarity", "Quality", "Color", "Bonus lines"], definitions.map(function (entry) {
                const definition = typeof getGemstoneResourceIdByName === "function"
                    ? RESOURCE_DEFS[safe(function () { return getGemstoneResourceIdByName(entry.name); }, null)]
                    : null;
                return [
                    escapeHtml(entry.name),
                    escapeHtml(entry.rarity),
                    formatValue(entry.quality),
                    escapeHtml(entry.color),
                    formatValue(definition && definition.gemProperties
                        ? definition.gemProperties.length
                        : 0),
                ];
            }))
            + formulaLink("formula-jewelry", "Jewelry gem scaling and cuts");
    });

    addSimplePage("items-jewelry", "items", "Jewelry and cuts", function () {
        const cuts = typeof JEWERLY_CUTS !== "undefined" ? JEWERLY_CUTS : [];
        return "<h1>Jewelry and cuts</h1>"
            + "<p>Jewelry carves raw gemstones into items and builds rings from metal chains, oil and a carved gemstone. Optional raw gems add more properties.</p>"
            + table(["Cut", "Modifier", "Unlock", "Base chance"], cuts.map(function (cut) {
                return [
                    escapeHtml(cut.label),
                    formatValue(cut.modifier),
                    formatValue(cut.unlockLevel),
                    formatValue(cut.baseChance) + "%",
                ];
            }))
            + (typeof getJewerlyCutChanceSummary === "function"
                ? "<p>Current cut chances: <b>"
                    + escapeHtml(safe(function () {
                        return getJewerlyCutChanceSummary(
                            typeof getJewerlyLevel === "function"
                                ? getJewerlyLevel()
                                : getEffectiveLevel("jewerly")
                        );
                    }, "unknown")) + "</b></p>"
                : "")
            + formulaLink("formula-jewelry", "Jewelry quality, cut and property formulas");
    });

    // --- World --------------------------------------------------------------

    addSimplePage("world-overview", "world", "World generation", function () {
        const world = getWorld();
        return "<h1>World generation</h1>"
            + "<p>The world is generated from a seeded 3D noise field. Elevation, temperature and humidity choose the base tile type. Resources and vegetation spread through chunk generation with seeded hashes.</p>"
            + table(["Field", "Value"], [
                ["Seed", escapeHtml(world ? world.seed : (typeof getOrCreateMapSeed === "function" ? safe(getOrCreateMapSeed, "?") : "?"))],
                ["Chunk size", formatValue(world ? world.chunkSize : "?")],
                ["Current tile", escapeHtml(currentTileLabel())],
            ])
            + bullets([
                pageLink("world-tiles", "Tiles and passability"),
                pageLink("world-exploration", "Exploration and travel"),
                pageLink("world-weather", "Weather, temperature and humidity"),
                pageLink("world-flora", "Trees and vegetation"),
                pageLink("world-fishing", "Fishing"),
                pageLink("world-mobs", "Mobs"),
                pageLink("world-npcs", "NPCs"),
                pageLink("world-monthly", "Monthly growth"),
            ])
            + formulaLink("formula-worldgen", "world generation functions")
            + formulaLink("formula-mob-level", "mob level by distance and year");
    });

    addSimplePage("world-tiles", "world", "Tiles and passability", function () {
        const world = getWorld();
        const types = world && Array.isArray(world.tileTypes) ? world.tileTypes : [];
        const rows = types.map(function (type) {
            return [
                escapeHtml(type.id),
                escapeHtml(type.name),
                formatValue(type.passability == null ? 1 : type.passability),
                escapeHtml(type.spaceRates ? Object.keys(type.spaceRates).map(function (key) {
                    return key + " " + type.spaceRates[key];
                }).join(", ") : ""),
            ];
        });
        return "<h1>Tiles and passability</h1>"
            + "<p>Each tile has a type, elevation, temperature, humidity, space rates and a passability multiplier. Travel time depends on the destination and the path.</p>"
            + (rows.length
                ? table(["ID", "Tile", "Passability", "Space"], rows)
                : "<p>The world is not generated yet.</p>")
            + formulaLink("formula-worldgen", "base tile selection")
            + formulaLink("formula-travel", "travel duration");
    });

    addSimplePage("world-exploration", "world", "Exploration and travel", function () {
        return "<h1>Exploration and travel</h1>"
            + "<p>Exploration reveals the current tile and its neighbours. Revealed tiles persist in the save. Travel moves along a path, consumes time and is affected by weather, darkness, passability and Traveling skill.</p>"
            + table(["Field", "Value"], [
                ["Current tile", escapeHtml(currentTileLabel())],
                ["Exploration", formatValue(currentTile ? currentTile.revealed : "?")],
                ["Travelling", typeof isTraveling === "function" && isTraveling() ? "Yes" : "No"],
            ])
            + formulaLink("formula-travel", "travel time and passability");
    });

    addSimplePage("world-weather", "world", "Weather and climate", function () {
        const weather = typeof getGameWeather === "function"
            ? safe(getGameWeather, null)
            : null;
        return "<h1>Weather and climate</h1>"
            + "<p>Weather changes every four game hours. Temperature depends on tile, season and time of day; humidity comes from the tile. Weather modifies travel, actions and cold risk.</p>"
            + table(["Field", "Value"], [
                ["Weather", escapeHtml(weather ? weather.name || weather.id : "unknown")],
                ["Tile temperature", formatValue(typeof getGameTileTemperature === "function" ? safe(getGameTileTemperature, 0) : 0)],
                ["Tile humidity", formatValue(typeof getGameTileHumidity === "function" ? safe(getGameTileHumidity, 0) : 0)],
            ])
            + formulaLink("formula-weather", "weather selection and modifiers");
    });

    addSimplePage("world-flora", "world", "Trees and vegetation", function () {
        const species = typeof TREE_SPECIES !== "undefined" ? TREE_SPECIES : [];
        const rows = species.map(function (entry) {
            const resourceId = typeof TREE_HARVEST_RESOURCES !== "undefined"
                ? TREE_HARVEST_RESOURCES[entry.name]
                : null;
            return [
                escapeHtml(entry.name),
                escapeHtml(entry.kind || ""),
                formatValue(entry.tempMin) + " to " + formatValue(entry.tempMax),
                formatValue(entry.humidityMin) + " to " + formatValue(entry.humidityMax),
                escapeHtml(resourceId != null ? resourceName(resourceId) : ""),
            ];
        });
        return "<h1>Trees and vegetation</h1>"
            + "<p>Trees are chosen by tile temperature and humidity. Harvesting a tree gives its fruit or nut resource. Planted tree buildings can be grown on the current tile and harvested again after a month.</p>"
            + table(["Tree", "Kind", "Temperature", "Humidity", "Harvest"], rows)
            + formulaLink("formula-monthly-growth", "monthly vegetation growth");
    });

    addSimplePage("world-fishing", "world", "Fishing", function () {
        const fishIds = typeof FISH_RESOURCE_IDS !== "undefined"
            ? FISH_RESOURCE_IDS
            : [];
        const waterKind = typeof getFishingWaterKind === "function"
            ? safe(function () { return getFishingWaterKind(currentTile); }, "unknown")
            : "unknown";
        const waterAmount = typeof getFishingWaterAmount === "function"
            ? safe(function () { return getFishingWaterAmount(currentTile); }, 0)
            : 0;
        return "<h1>Fishing</h1>"
            + "<p>Fishing uses the Fishing skill, a fishing tool and the tile's water. The catch pool depends on biome, temperature, water amount and fish difficulty; each fish has a size multiplier.</p>"
            + table(["Field", "Value"], [
                ["Water kind", escapeHtml(waterKind)],
                ["Water amount", formatValue(waterAmount)],
                ["Fish species", formatValue(fishIds.length)],
            ])
            + "<h2>Fish species</h2>"
            + (fishIds.length
                ? table(["Fish", "Category", "Biome", "Temperature", "Difficulty"], fishIds.map(function (resourceId) {
                    const definition = RESOURCE_DEFS[resourceId];
                    return [
                        escapeHtml(definition.name),
                        escapeHtml(definition.fishCategory || ""),
                        escapeHtml(definition.fishBiome || ""),
                        formatValue(definition.fishTempMin) + " to " + formatValue(definition.fishTempMax),
                        formatValue(definition.fishDifficulty),
                    ];
                }))
                : "<p>No fish definitions loaded.</p>")
            + formulaLink("formula-fishing", "fishing power, quality and candidates");
    });

    addSimplePage("world-mobs", "world", "Mobs", function () {
        const mobs = typeof MOBS !== "undefined" ? MOBS : {};
        const rows = Object.keys(mobs).map(function (id) {
            const mob = mobs[id];
            return [
                escapeHtml(mob.name || id),
                formatValue(mob.hp),
                formatValue(mob.attack),
                escapeHtml(mob.stats ? Object.keys(mob.stats).map(function (key) {
                    return key.toUpperCase() + " " + mob.stats[key];
                }).join(", ") : ""),
            ];
        });
        return "<h1>Mobs</h1>"
            + "<p>Mobs scale with tile distance and game year. Higher levels multiply their stats. Each mob has its own loot table, possible prefixes and combat behaviour.</p>"
            + table(["Mob", "HP", "Attack", "Stats"], rows)
            + formulaLink("formula-mob-level", "mob level and stat multiplier")
            + formulaLink("formula-combat", "combat attack, defence and hit chance");
    });

    addSimplePage("world-npcs", "world", "NPCs", function () {
        const presets = typeof NPC_PRESETS !== "undefined" ? NPC_PRESETS : {};
        const presetIds = Object.keys(presets);
        const blocks = presetIds.map(function (id) {
            const preset = presets[id];
            const stats = preset.stats || {};
            const skills = preset.skills || {};
            return "<h2>" + escapeHtml(preset.name || id) + "</h2>"
                + "<p>" + richText(preset.description || "") + "</p>"
                + "<p>Image: <code>" + escapeHtml(preset.image || "") + "</code></p>"
                + table(["Stat", "Base", "Per level"], Object.keys(stats).map(function (key) {
                    return [escapeHtml(key.toUpperCase()), formatValue(stats[key].base), formatValue(stats[key].perLevel)];
                }))
                + table(["Skill", "Base", "Per level"], Object.keys(skills).map(function (key) {
                    return [escapeHtml(getPlayerSkillLabel(key)), formatValue(skills[key].base), formatValue(skills[key].perLevel)];
                }));
        }).join("");
        return "<h1>NPCs</h1>"
            + "<p>NPCs use the player Character model: all stats, skills, equipment fields, HP, mana and stamina. They also have mood and favor, a tile position and a preset type.</p>"
            + table(["Field", "Value"], [
                ["Presets", escapeHtml(presetIds.join(", "))],
                ["Generated NPCs", formatValue(typeof npcs !== "undefined" && Array.isArray(npcs) ? npcs.length : 0)],
            ])
            + blocks
            + "<h2>Conversation</h2>"
            + "<p>Talk to NPC pauses timed actions. Greet gives favor and mood; repeated greetings in one conversation reduce mood. Say goodbye closes the conversation and resumes previous actions.</p>"
            + formulaLink("formula-npc", "NPC level and growth");
    });

    addSimplePage("world-monthly", "world", "Monthly growth", function () {
        const chances = typeof MONTHLY_VEGETATION_BASE_CHANCES !== "undefined"
            ? MONTHLY_VEGETATION_BASE_CHANCES
            : {};
        return "<h1>Monthly growth</h1>"
            + "<p>Each game month rolls vegetation growth and ripens farm fields and planted trees. The chance depends on the tile type and the monthly base chances.</p>"
            + table(["Tile type", "Base chance"], Object.keys(chances).map(function (key) {
                return [escapeHtml(key), formatValue(chances[key])];
            }))
            + formulaLink("formula-monthly-growth", "monthly growth count");
    });

    // --- Research -----------------------------------------------------------

    addSimplePage("research-overview", "research", "Research", function () {
        const technologies = typeof TECHNOLOGIES !== "undefined" ? TECHNOLOGIES : [];
        const visible = technologies.filter(isTechnologyVisible);
        return "<h1>Research</h1>"
            + "<p>Research is performed in the Research tab after DayDream has been used at least once. Each technology has levels, requirements, a research cost and rewards. Scientific plans increases the research queue.</p>"
            + (visible.length
                ? bullets(visible.map(function (technology) {
                    return pageLink("tech-" + slugify(technology.name), technology.name)
                        + " — level " + formatValue(technology.level)
                        + " / " + formatValue(technology.maxLevel);
                }))
                : "<p>No technologies are visible yet.</p>");
    }).hidden = function () {
        return !isSpoilerMode()
            && (typeof player === "undefined" || !player || player.hasDayDreamed !== true);
    };

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    (typeof TECHNOLOGIES !== "undefined" ? TECHNOLOGIES : []).forEach(function (technology) {
        addPage({
            id: "tech-" + slugify(technology.name),
            section: "research",
            title: technology.name,
            hidden: function () { return !isTechnologyVisible(technology); },
            render: function () {
                const description = typeof technology.getDescription === "function"
                    ? safe(function () { return technology.getDescription(); }, "")
                    : technology.description || "";
                const levels = typeof technology.getLevelsDescription === "function"
                    ? safe(function () { return technology.getLevelsDescription(); }, "")
                    : "";
                return "<h1>" + escapeHtml(technology.name) + "</h1>"
                    + "<p>" + richText(description) + "</p>"
                    + table(["Field", "Value"], [
                        ["Level", formatValue(technology.level) + " / " + formatValue(technology.maxLevel)],
                        ["Research points", formatValue(technology.researchPoints)],
                        ["Required", formatValue(safe(function () { return technology.getRequiredResearch(); }, 0))],
                        ["Requirements met", safe(function () { return technology.meetsRequirements(); }, false) ? "Yes" : "No"],
                    ])
                    + (levels ? "<h2>Levels</h2><p>" + richText(levels) + "</p>" : "");
            },
        });
    });

    // --- Formulas -----------------------------------------------------------

    addFormulaPage(
        "formula-character-vitals",
        "Character vitals",
        "The live calculateStats function derives maximum HP, mana, stamina and hunger. Effective stat levels include equipment and building bonuses.",
        [
            ["Maximum HP, mana and stamina", typeof calculateStats !== "undefined" ? calculateStats : null,
                function () {
                    return "HP " + formatValue(player.maxhp) + ", mana " + formatValue(player.maxmana)
                        + ", stamina " + formatValue(player.maxstamina);
                }],
            ["Effective stat or skill level", typeof getEffectiveLevel !== "undefined" ? getEffectiveLevel : null,
                function () { return "STR " + formatValue(getEffectiveLevel("str")); }],
        ]
    );

    addFormulaPage(
        "formula-skill-exp",
        "Experience and levels",
        "Experience requirement, potential and level-up handling are shared by stats and skills.",
        [
            ["Experience required for a level", typeof getExperienceRequiredForLevel !== "undefined" ? getExperienceRequiredForLevel : null,
                function () { return formatValue(getExperienceRequiredForLevel(player.lvl)); }],
            ["Add experience with potential", typeof addExperienceToEntry !== "undefined" ? addExperienceToEntry : null],
            ["Raise potential", typeof increasePotential !== "undefined" ? increasePotential : null],
        ]
    );

    addFormulaPage(
        "formula-craft-quality",
        "Craft quality",
        "Craft quality starts as weighted ingredient quality, is softcapped by skill level and then multiplied by station power if the recipe uses it.",
        [
            ["Craft quality and softcap", typeof getCraftQualityInfo !== "undefined" ? getCraftQualityInfo : null],
            ["Softcap excess", typeof applyCraftSoftcap !== "undefined" ? applyCraftSoftcap : null],
        ]
    );

    addFormulaPage(
        "formula-craft-rarity",
        "Craft rarity",
        "Rarity is rolled from raw quality and skill level. Luck and equipment modifiers increase the chance of higher tiers.",
        [
            ["Roll craft rarity", typeof rollCraftRarity !== "undefined" ? rollCraftRarity : null],
            ["Luck rarity multiplier", typeof getCraftLuckRarityMultiplier !== "undefined" ? getCraftLuckRarityMultiplier : null],
        ]
    );

    addFormulaPage(
        "formula-craft-exp",
        "Craft experience",
        "Crafting grants skill experience based on quality and rarity. Rare crafts also train Luck.",
        [
            ["Luck experience by rarity", typeof getCraftLuckExpForRarity !== "undefined" ? getCraftLuckExpForRarity : null,
                function () { return formatValue(getCraftLuckExpForRarity(ITEM_RARITIES.Rare)); }],
        ]
    );

    addFormulaPage(
        "formula-jewelry",
        "Jewelry formulas",
        "Jewelry quality, cut chances and inherited gemstone property scaling. Optional gems on common items, tools and cutlery use the same property scaling with a doubled Jewelry level requirement.",
        [
            ["Jewelry craft quality", typeof getJewerlyCraftQualityInfo !== "undefined" ? getJewerlyCraftQualityInfo : null],
            ["Jewelry property multiplier", typeof getJewerlyPropertyMultiplier !== "undefined" ? getJewerlyPropertyMultiplier : null],
            ["Cut chance at level", typeof getJewerlyCutChancePercent !== "undefined" ? getJewerlyCutChancePercent : null],
            ["Optional gemstone slots", typeof getJewerlyBonusSlotCount !== "undefined" ? getJewerlyBonusSlotCount : null,
                function () { return formatValue(getJewerlyBonusSlotCount(2)); }],
        ]
    );

    addFormulaPage(
        "formula-building",
        "Building work and quality",
        "Construction speed comes from stats and skill, and building quality scales its effects and rarity.",
        [
            ["Work per second", typeof getBuildingWorkPerSecond !== "undefined" ? getBuildingWorkPerSecond : null],
            ["Building quality value", typeof getBuildingQualityValue !== "undefined" ? getBuildingQualityValue : null],
        ]
    );

    addFormulaPage(
        "formula-mob-level",
        "Mob level",
        "Mob level is one plus floor distance from the start tile plus the current year bonus. Higher levels multiply mob stats.",
        [
            ["Mob level for a tile", typeof getMobLevelForTile !== "undefined" ? getMobLevelForTile : null,
                function () {
                    return currentTile ? getMobLevelForTile(currentTile.x, currentTile.y) : "unknown";
                }],
            ["Mob stat multiplier", typeof getMobLevelMultiplier !== "undefined" ? getMobLevelMultiplier : null,
                function () { return formatValue(getMobLevelMultiplier(10)); }],
            ["Year bonus", typeof getMobYearLevelBonus !== "undefined" ? getMobYearLevelBonus : null,
                function () { return formatValue(getMobYearLevelBonus()); }],
        ]
    );

    addFormulaPage(
        "formula-combat",
        "Combat",
        "Attack, defence, hit chance, critical chance and attack interval are derived from combatants. Equipment and weapon skills feed into them.",
        [
            ["Attack", typeof getCombatAttack !== "undefined" ? getCombatAttack : null],
            ["Defence", typeof getCombatDefence !== "undefined" ? getCombatDefence : null],
            ["Hit chance", typeof getCombatHitChance !== "undefined" ? getCombatHitChance : null],
            ["Critical chance", typeof getCombatCritChance !== "undefined" ? getCombatCritChance : null],
            ["Attack interval", typeof getCombatAttackIntervalMs !== "undefined" ? getCombatAttackIntervalMs : null],
        ]
    );

    addFormulaPage(
        "formula-npc",
        "NPC level and growth",
        "NPCs use the same Character skills and stats as the player. Their level comes from the mob-level function, and each preset adds base values plus per-level growth.",
        [
            ["NPC level for a tile", typeof getNpcLevelForTile !== "undefined" ? getNpcLevelForTile : null,
                function () {
                    return currentTile ? getNpcLevelForTile(currentTile.x, currentTile.y) : "unknown";
                }],
            ["NPC growth value", typeof getNpcGrowthValue !== "undefined" ? getNpcGrowthValue : null],
            ["Recalculate NPC stats", typeof recalculateNpcStats !== "undefined" ? recalculateNpcStats : null],
        ]
    );

    addFormulaPage(
        "formula-hunger",
        "Hunger and regeneration",
        "Hunger maximum, hunger gain, regeneration and well-fed state depend on stats, equipment and current action multipliers.",
        [
            ["Hunger maximum", typeof getHungerMax !== "undefined" ? getHungerMax : null,
                function () { return formatValue(getHungerMax()); }],
            ["Raw hunger value", typeof getRawHungerValue !== "undefined" ? getRawHungerValue : null,
                function () { return formatValue(getRawHungerValue()); }],
            ["Add hunger", typeof addHunger !== "undefined" ? addHunger : null],
        ]
    );

    addFormulaPage(
        "formula-travel",
        "Travel time",
        "Travel duration combines distance, passability, Traveling skill, weather and darkness.",
        [
            ["Travel duration", typeof getTravelDurationSeconds !== "undefined" ? getTravelDurationSeconds : null],
            ["Travel time multiplier", typeof getTravelTimeMultiplier !== "undefined" ? getTravelTimeMultiplier : null],
            ["Passability multiplier", typeof getTravelPassabilityMultiplier !== "undefined" ? getTravelPassabilityMultiplier : null],
        ]
    );

    addFormulaPage(
        "formula-fishing",
        "Fishing",
        "Fishing power, catch quality and candidates depend on skill, tool, water, biome and fish difficulty.",
        [
            ["Fishing action power", typeof getFishingActionPower !== "undefined" ? getFishingActionPower : null,
                function () { return formatValue(getFishingActionPower(currentTile)); }],
            ["Fishing quality", typeof getFishingQuality !== "undefined" ? getFishingQuality : null],
            ["Fishing candidates", typeof getFishingCandidates !== "undefined" ? getFishingCandidates : null],
        ]
    );

    addFormulaPage(
        "formula-worldgen",
        "World generation",
        "WorldGen combines seeded noise fields for elevation, temperature and humidity. The first matching tile definition becomes the base tile.",
        [
            ["Base tile type", getWorldPrototype() ? getWorldPrototype().getBaseTileType : null],
            ["Elevation", getWorldPrototype() ? getWorldPrototype().getElevation : null],
            ["Temperature", getWorldPrototype() ? getWorldPrototype().getTemperature : null],
            ["Humidity", getWorldPrototype() ? getWorldPrototype().getHumidity : null],
            ["Resource eligibility", getWorldPrototype() ? getWorldPrototype().isEligible : null],
        ]
    );

    addFormulaPage(
        "formula-monthly-growth",
        "Monthly vegetation growth",
        "Monthly growth rolls a binomial-like count from the tile amount and base chance, then spreads vegetation by tile growth multipliers.",
        [
            ["Monthly growth count", typeof rollMonthlyGrowthCount !== "undefined" ? rollMonthlyGrowthCount : null],
            ["Tile growth multiplier", typeof getTileVegetationGrowthMultiplier !== "undefined" ? getTileVegetationGrowthMultiplier : null],
        ]
    );

    addFormulaPage(
        "formula-weather",
        "Weather",
        "Weather is chosen from weighted candidates every four game hours. Temperature is derived from tile, season and time of day.",
        [
            ["Current weather", typeof getGameWeather !== "undefined" ? getGameWeather : null],
            ["Tile temperature", typeof getGameTileTemperature !== "undefined" ? getGameTileTemperature : null],
            ["Tile humidity", typeof getGameTileHumidity !== "undefined" ? getGameTileHumidity : null],
            ["Weather weights", typeof getGameWeatherWeights !== "undefined" ? getGameWeatherWeights : null],
        ]
    );

    addFormulaPage(
        "formula-item-power",
        "Item power",
        "Every item value uses sqrt(quality * rarity) times variance. Affixes and base stats share the same scaling.",
        [
            ["Item power multiplier", typeof getItemPowerMultiplier !== "undefined" ? getItemPowerMultiplier : null,
                function () { return formatValue(getItemPowerMultiplier(20, 2, 1)); }],
            ["Property variance", typeof rollItemPropertyVariance !== "undefined" ? rollItemPropertyVariance : null],
        ]
    );

    // --- Overlay ------------------------------------------------------------

    function getVisiblePages() {
        return pages.filter(function (page) {
            return !page.hidden || page.hidden() !== true;
        });
    }

    function getPageSection(page) {
        return SECTIONS.find(function (section) {
            return section.id === page.section;
        }) || { id: page.section, title: page.section };
    }

    function renderSidebar() {
        if (!sidebar) return;
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const visible = getVisiblePages();
        const activePage = activePageId ? pageMap.get(activePageId) : null;
        const activeSectionId = activePage ? activePage.section : "basics";

        sidebar.innerHTML = "";
        let any = false;

        SECTIONS.forEach(function (section) {
            const sectionPages = visible.filter(function (page) {
                if (page.section !== section.id) return false;
                if (!query) return true;
                return page.title.toLowerCase().indexOf(query) !== -1
                    || section.title.toLowerCase().indexOf(query) !== -1;
            });
            if (!sectionPages.length) return;
            any = true;

            const detailsElement = document.createElement("details");
            detailsElement.className = "wikisection";
            detailsElement.open = query !== "" || section.id === activeSectionId;

            const summary = document.createElement("summary");
            summary.innerText = section.title + " (" + sectionPages.length + ")";
            detailsElement.appendChild(summary);

            sectionPages.forEach(function (page) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "wikinav";
                button.dataset.wikiPage = page.id;
                button.innerText = page.title;
                if (page.id === activePageId) button.classList.add("active");
                button.addEventListener("click", function () {
                    showPage(page.id);
                });
                detailsElement.appendChild(button);
            });

            sidebar.appendChild(detailsElement);
        });

        if (!any) {
            const empty = document.createElement("div");
            empty.className = "wikisearchempty";
            empty.innerText = "No pages match this search.";
            sidebar.appendChild(empty);
        }
    }

    function showPage(pageId) {
        const page = pageMap.get(pageId);
        if (!page || (page.hidden && page.hidden())) return;
        activePageId = pageId;
        if (content) {
            content.innerHTML = safe(function () {
                return '<article class="wikipage">' + page.render() + "</article>";
            }, '<article class="wikipage"><h1>Wiki error</h1><p>This page could not be rendered.</p></article>');
            content.scrollTop = 0;
        }
        renderSidebar();
    }

    function firstVisiblePageId() {
        const visible = getVisiblePages();
        return visible.length ? visible[0].id : null;
    }

    function ensureOverlay() {
        if (overlay && document.body.contains(overlay)) return overlay;

        overlay = document.createElement("div");
        overlay.id = "wikioverlay";
        overlay.className = "wikioverlay";
        overlay.hidden = true;
        overlay.innerHTML = ''
            + '<div class="wiki-panel">'
            + '  <div class="wiki-header">'
            + '    <div class="wiki-brand"><i class="fa fa-book"></i> Wiki</div>'
            + '    <input id="wikisearch" type="search" placeholder="Search pages..." autocomplete="off">'
            + '    <button type="button" id="wikiclose" class="wikiclose" title="Close wiki">&#10005;</button>'
            + '  </div>'
            + '  <div class="wiki-body">'
            + '    <nav id="wikisidebar" class="wiki-sidebar"></nav>'
            + '    <main id="wikicontent" class="wiki-content"></main>'
            + '  </div>'
            + '  <div class="wiki-footer">Locked content is hidden until it unlocks. Debug spoilers reveal all pages.</div>'
            + '</div>';

        document.body.appendChild(overlay);
        sidebar = overlay.querySelector("#wikisidebar");
        content = overlay.querySelector("#wikicontent");
        searchInput = overlay.querySelector("#wikisearch");

        overlay.querySelector("#wikiclose").addEventListener("click", closeWiki);
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeWiki();
        });
        searchInput.addEventListener("input", renderSidebar);
        content.addEventListener("click", function (event) {
            const link = event.target.closest("[data-wiki-page]");
            if (!link) return;
            event.preventDefault();
            showPage(link.dataset.wikiPage);
        });

        return overlay;
    }

    function openWiki(pageId) {
        ensureOverlay();
        overlay.hidden = false;
        document.body.classList.add("wikiopen");

        renderSidebar();
        const requested = pageId && pageMap.get(pageId)
            && (!pageMap.get(pageId).hidden || !pageMap.get(pageId).hidden())
            ? pageId
            : null;
        const current = activePageId && pageMap.get(activePageId)
            && (!pageMap.get(activePageId).hidden || !pageMap.get(activePageId).hidden())
            ? activePageId
            : null;
        const target = requested || current || firstVisiblePageId();
        if (target) {
            showPage(target);
        } else if (content) {
            content.innerHTML = '<article class="wikipage"><h1>Wiki</h1><p>Nothing is unlocked yet.</p></article>';
        }

        if (searchInput) {
            searchInput.value = "";
            renderSidebar();
            searchInput.focus();
        }
    }

    function closeWiki() {
        if (!overlay) return;
        overlay.hidden = true;
        document.body.classList.remove("wikiopen");
        if (searchInput) searchInput.value = "";
    }

    function ensureWikiButton() {
        const options = document.getElementById("optionsplace");
        if (!options || document.getElementById("wikibutton")) return;
        const button = document.createElement("button");
        button.type = "button";
        button.id = "wikibutton";
        button.className = "optionsbutton";
        button.innerHTML = '<i class="fa fa-book"></i> Wiki';
        button.setAttribute(
            "data-tooltip",
            "Open the in-game wiki. Locked content stays hidden until it unlocks."
        );
        button.addEventListener("click", function () {
            openWiki();
        });
        options.appendChild(button);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && overlay && !overlay.hidden) {
            event.preventDefault();
            closeWiki();
        }
    });

    window.openWiki = openWiki;
    window.closeWiki = closeWiki;

    function initialize() {
        ensureWikiButton();
        // The button is appended once; options are static after character creation.
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
