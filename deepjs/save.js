    const SAVE_VERSION = 3;
    const SAVE_STORAGE_KEY = "data";
    const SAVE_SLOT_COUNT = 3;
    const SAVE_SLOT_KEY_PREFIX = "data_slot_";
    const RESTORABLE_PLAYER_SKILLS = [
        "forage",
        "exploration",
        "rest",
        "focus",
        "wizardy",
        "alchemy",
        "masonry",
        "pottery",
        "regeneration",
        "autism",
        "science",
        "traveling",
        "dreammastery",
        "survival",
        "ropemaking",
        "tailoring",
        "carpentry",
        "architecture",
        "gardening",
        "digging",
        "mining",
        "smithing",
        "cooking",
        "milling",
        "lumberjack",
    ];
    const RESTORABLE_PLAYER_STATS = [
        "str",
        "agi",
        "vit",
        "per",
        "int",
        "ins",
        "sou",
        "luck",
        "speed",
    ];

    function restoreSkill(savedSkill) {
        const skill = new Skill(savedSkill.name, savedSkill.description);
        skill.clone(savedSkill);
        return skill;
    }

    function createDefaultSkill(skillName) {
        const template = player && player[skillName];
        return template
            ? new Skill(template.name, template.description)
            : new Skill(skillName, "");
    }

    function restoreStat(savedStat) {
        const stat = new Stat(savedStat.name, savedStat.description);
        stat.clone(savedStat);
        return stat;
    }

    function getTechnologies() {
        return TECHNOLOGIES;
    }

    function getTechnologyByName(name) {
        return getTechnologies().find(function (technology) {
            return technology.name === name;
        }) || null;
    }

    function collectTechnologyData() {
        return getTechnologies().map(function (technology) {
            return {
                name: technology.name,
                level: technology.level,
                researchPoints: technology.researchPoints,
                status: technology.status,
            };
        });
    }

    function collectSaveData() {
        return {
            version: SAVE_VERSION,
            player: player,
            name: player.name,
            maxInventory: maxInventory,
            scrapRarityFilter: scrapRarityFilter,
            lastUpdate: lastUpdate,
            gameMinutes: typeof gameTime !== "undefined" ? gameTime.totalMinutes : null,
            gameWeatherId: typeof gameTime !== "undefined" ? gameTime.weatherId : null,
            gameWeatherCheckSegment: typeof gameTime !== "undefined" ? gameTime.weatherCheckSegment : null,
            currentTile: {
                x: currentTile.x,
                y: currentTile.y,
                revealed: currentTile.revealed,
                investigated: currentTile.investigated,
                hiddenstuff: currentTile.hiddenstuff,
                land: Object.assign({}, currentTile.land),
                resourceMultipliers: Object.assign({}, currentTile.resourceMultipliers),
                space: Object.assign({}, currentTile.space),
                harvestedTrees: Object.assign({}, currentTile.harvestedTrees || {}),
            },
            // Exploration and search progress for every generated tile.
            tileStates: window.mapView
                && typeof window.mapView.collectTileStates === "function"
                ? window.mapView.collectTileStates()
                : {},
            logLength: logLength,
            maxActions: maxActions,
            actionsCount: actionsCount,
            showDebugMessages: showDebugMessages,
            actionStates: Object.assign({}, actionStates),
            actionVisibility: Object.assign({}, actionVisibility),
            previousTimedActionIds: previousTimedActionIds.slice(),
            activeTravel: activeTravel ? Object.assign({}, activeTravel) : null,
            dayDreamUnlocked: dayDreamUnlocked,
            researchUnlocked: researchUnlocked,
            activeResearchTechnology: activeResearchTechnology ? activeResearchTechnology.name : null,
            ResearchLeft: ResearchLeft,
            researchQueue: researchQueue.map(function (technology) { return technology.name; }),
            technologies: collectTechnologyData(),
            searchOpened: searchOpened,
            focusPoints: focusPoints,
            minPotentialBonusPercent: minPotentialBonusPercent,
            habitToggles: Object.assign({}, habitToggles),
            dietAutoEatThresholdPercent: dietAutoEatThresholdPercent,
            dietPriorityStat: dietPriorityStat,
            harvestTreePriorityStat: harvestTreePriorityStat,
            landTotals: landTotals,
            resources: resources,
            foodStatBindings: Object.assign({}, foodStatBindings),
            buildings: typeof serializeBuildings === "function" ? serializeBuildings() : [],
            hearthfireFuelElapsed: round2(hearthfireFuelElapsed),
            DramaMeter: typeof DramaMeter !== "undefined" ? DramaMeter : 0,
            dramaEventTimer: typeof dramaEventTimer !== "undefined" ? dramaEventTimer : 0,
            catchedColdRemaining: typeof catchedColdRemaining !== "undefined" ? catchedColdRemaining : 0,
            earthShakingRemaining: typeof earthShakingRemaining !== "undefined" ? earthShakingRemaining : 0,
            dramaDebuffs: typeof getDramaDebuffsSnapshot === "function"
                ? getDramaDebuffsSnapshot()
                : {},
            mapSeed: window.mapView ? window.mapView.getSeed() : null,
        };
    }

    function getSaveSlotKey(slot) {
        return SAVE_SLOT_KEY_PREFIX + slot;
    }

    function isValidSaveSlot(slot) {
        return Number.isInteger(slot) && slot >= 1 && slot <= SAVE_SLOT_COUNT;
    }

    function readSaveSlotRaw(slot) {
        const rawSave = localStorage.getItem(getSaveSlotKey(slot));
        if (rawSave) return rawSave;
        if (slot === 1) return localStorage.getItem(SAVE_STORAGE_KEY);
        return null;
    }

    function getSaveSlotInfo(slot) {
        const rawSave = readSaveSlotRaw(slot);
        if (!rawSave) return null;

        try {
            const saveData = JSON.parse(rawSave);
            const savedAt = saveData.savedAt ?? saveData.lastUpdate ?? null;
            return {
                name: saveData.name ?? (saveData.player ? saveData.player.name : null) ?? "You",
                savedAt: savedAt,
            };
        } catch (error) {
            return null;
        }
    }

    function updateSaveSlotLabels() {
        for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot++) {
            const label = document.getElementById('saveslotlabel' + slot);
            if (!label) continue;

            const info = getSaveSlotInfo(slot);
            if (!info) {
                label.innerText = 'Slot ' + slot + ': empty';
                continue;
            }

            const timestamp = info.savedAt ? new Date(info.savedAt).toLocaleString() : 'unknown time';
            label.innerText = 'Slot ' + slot + ': ' + info.name + ' - ' + timestamp;
        }
    }

    function getSavedPlayerLevel(slot) {
        const rawSave = readSaveSlotRaw(slot);
        if (!rawSave) return null;

        try {
            const saveData = JSON.parse(rawSave);
            const savedPlayer = saveData && saveData.player ? saveData.player : saveData;
            const savedLevel = Number(savedPlayer && savedPlayer.lvl);
            return Number.isFinite(savedLevel) ? savedLevel : null;
        } catch (error) {
            return null;
        }
    }

    function shouldConfirmOverwrite(slot) {
        const savedLevel = getSavedPlayerLevel(slot);
        if (savedLevel === null) return false;

        const currentLevel = Number(player && player.lvl);
        if (!Number.isFinite(currentLevel)) return false;

        return savedLevel > currentLevel;
    }

    function saveGame(slot) {
        const targetSlot = isValidSaveSlot(slot) ? slot : 1;

        // Refuse to silently overwrite a more advanced save.
        if (readSaveSlotRaw(targetSlot) && shouldConfirmOverwrite(targetSlot)) {
            const confirmed = window.confirm(
                "Characters level in save file is higher than from current game. Are you sure to overwrite it?"
            );
            if (!confirmed) {
                logMessage("Save to slot " + targetSlot + " cancelled.");
                return false;
            }
        }

        const saveData = collectSaveData();
        saveData.slot = targetSlot;
        saveData.savedAt = Date.now();
        localStorage.setItem(getSaveSlotKey(targetSlot), JSON.stringify(saveData));
        logMessage('Game saved to slot ' + targetSlot);
        updateSaveSlotLabels();
        return true;
    }

    function readSavedGame(slot) {
        const targetSlot = isValidSaveSlot(slot) ? slot : 1;
        const rawSave = readSaveSlotRaw(targetSlot);
        if (!rawSave) return null;

        return normalizeSaveData(JSON.parse(rawSave));
    }

    function normalizeActionStates(saveData) {
        const legacyStates = {
            explore: saveData.exploreState ?? saveData.exploreactive,
            search: saveData.searchState ?? saveData.searchactive,
            forage: saveData.forageState ?? saveData.forageactive,
            rest: saveData.restState ?? saveData.restactive,
        };
        const normalized = Object.assign({}, legacyStates, saveData.actionStates || {});

        Object.keys(normalized).forEach(function (actionId) {
            if (normalized[actionId] == null) delete normalized[actionId];
        });
        return normalized;
    }

    function normalizeSaveData(saveData) {
        return {
            player: saveData.player ?? saveData.you,
            name: saveData.name ?? (saveData.player ? saveData.player.name : null) ?? "You",
            currentTile: saveData.currentTile ?? saveData.herezone,
            maxInventory: saveData.maxInventory ?? saveData.maxinventory,
            scrapRarityFilter: saveData.scrapRarityFilter,
            lastUpdate: saveData.lastUpdate ?? saveData.lastupdate,
            gameMinutes: saveData.gameMinutes
                ?? (saveData.gameTime ? saveData.gameTime.totalMinutes : null),
            gameWeatherId: saveData.gameWeatherId
                ?? (saveData.gameWeather ? saveData.gameWeather.id : null),
            gameWeatherCheckSegment: saveData.gameWeatherCheckSegment
                ?? (saveData.gameWeather ? saveData.gameWeather.checkSegment : null),
            logLength: saveData.logLength ?? saveData.loglengh,
            maxActions: saveData.maxActions ?? saveData.maxactions,
            actionsCount: saveData.actionsCount ?? saveData.actionscount,
            showDebugMessages: saveData.showDebugMessages ?? true,
            actionStates: normalizeActionStates(saveData),
            actionVisibility: saveData.actionVisibility ?? {},
            previousTimedActionIds: normalizePreviousTimedActionIds(saveData.previousTimedActionIds, saveData.previousTimedActionId),
            activeTravel: saveData.activeTravel ?? null,
            dayDreamUnlocked: saveData.dayDreamUnlocked ?? false,
            researchUnlocked: saveData.researchUnlocked ?? false,
            activeResearchTechnology: saveData.activeResearchTechnology ?? null,
            ResearchLeft: saveData.ResearchLeft ?? null,
            researchQueue: saveData.researchQueue ?? [],
            technologies: saveData.technologies ?? [],
            searchOpened: saveData.searchOpened ?? saveData.searchopened,
            focusPoints: saveData.focusPoints ?? 0,
            minPotentialBonusPercent: saveData.minPotentialBonusPercent ?? null,
            habitToggles: saveData.habitToggles ?? {},
            dietAutoEatThresholdPercent: saveData.dietAutoEatThresholdPercent
                ?? DIET_AUTO_EAT_DEFAULT_PERCENT,
            dietPriorityStat: saveData.dietPriorityStat ?? "",
            harvestTreePriorityStat: saveData.harvestTreePriorityStat ?? "",
            resources: saveData.resources ?? saveData.stocks,
            foodStatBindings: saveData.foodStatBindings ?? null,
            buildings: Array.isArray(saveData.buildings) ? saveData.buildings : [],
            hearthfireFuelElapsed: saveData.hearthfireFuelElapsed ?? 0,
            mapSeed: saveData.mapSeed ?? null,
            landTotals: saveData.landTotals ?? {
                trees: saveData.trees ?? 0,
                grass: saveData.grass ?? 0,
                rocks: saveData.rocks ?? 0,
                water: saveData.water ?? 0,
            },
        };
    }

    function restorePlayer(savedPlayer) {
        const restoredPlayer = Object.assign({}, savedPlayer);
        RESTORABLE_PLAYER_SKILLS.forEach(function (skillName) {
            // Focus replaced the old Meditation skill. Old saves keep their
            // progress by copying the legacy skill into the new key.
            const legacySkill = skillName === "focus" && savedPlayer
                ? savedPlayer.meditation
                : null;
            const savedSkill = savedPlayer
                ? (savedPlayer[skillName] || legacySkill)
                : null;
            const isLegacyMeditation = !!legacySkill
                && !(savedPlayer && savedPlayer[skillName]);
            restoredPlayer[skillName] = savedSkill
                ? restoreSkill(savedSkill)
                // A skill missing from the save was added later (for example
                // Traveling in old saves): start it at its defaults instead of
                // inheriting progress from the current session.
                : createDefaultSkill(skillName);

            if (isLegacyMeditation) {
                // Keep the old progress but use the new Focus name/description
                // so property multipliers and the skills tab address it as Focus.
                const template = createDefaultSkill(skillName);
                restoredPlayer[skillName].name = template.name;
                restoredPlayer[skillName].description = template.description;
            }
        });
        delete restoredPlayer.meditation;
        RESTORABLE_PLAYER_STATS.forEach(function (statName) {
            restoredPlayer[statName] = restoreStat(savedPlayer[statName]);
        });
        restoredPlayer.equipment = restoreEquipment(
            savedPlayer && savedPlayer.equipment
        );
        restoredPlayer.equipinventory = restoreInventory(
            savedPlayer && savedPlayer.equipinventory
        );
        migrateLegacyEquipmentSlot(
            savedPlayer && savedPlayer.equipment,
            "hands",
            restoredPlayer
        );
        ensurePantsEquipped(restoredPlayer);
        // Old saves do not have sleepyness yet.
        restoredPlayer.sleepyness = clampSleepyness(savedPlayer && savedPlayer.sleepyness);
        // Old saves do not have hunger yet either; it is always hidden.
        const savedHunger = Number(savedPlayer && savedPlayer.hunger);
        restoredPlayer.hunger = Number.isFinite(savedHunger)
            ? Math.max(-100, savedHunger)
            : 0;
        restoredPlayer.autoEatActive = savedPlayer
            && savedPlayer.autoEatActive === true;
        return restoredPlayer;
    }

    function migrateLegacyEquipmentSlot(savedEquipment, legacySlotId, restoredPlayer) {
        const legacyItem = restoreItemInstance(savedEquipment && savedEquipment[legacySlotId]);
        if (!legacyItem) return;

        const targetSlotId = getItemEquipSlots(legacyItem).find(function (slotId) {
            return Object.prototype.hasOwnProperty.call(restoredPlayer.equipment, slotId)
                && !restoredPlayer.equipment[slotId];
        });

        if (targetSlotId) {
            restoredPlayer.equipment[targetSlotId] = legacyItem;
            return;
        }

        const visibleSlots = typeof getEffectiveInventorySlots === "function"
            ? getEffectiveInventorySlots(restoredPlayer)
            : INVENTORY_SLOTS;
        let emptyInventoryIndex = -1;
        for (let index = 0; index < visibleSlots; index++) {
            if (!restoredPlayer.equipinventory[index]) {
                emptyInventoryIndex = index;
                break;
            }
        }
        if (emptyInventoryIndex !== -1) {
            restoredPlayer.equipinventory[emptyInventoryIndex] = legacyItem;
        }
    }

    function restoreEquipment(savedEquipment) {
        const equipment = createEmptyEquipment();
        const source = savedEquipment && typeof savedEquipment === "object" ? savedEquipment : {};

        Object.keys(equipment).forEach(function (slotId) {
            const item = restoreItemInstance(source[slotId]);
            if (item) equipment[slotId] = item;
        });

        return equipment;
    }

    function restoreInventory(savedInventory) {
        const inventory = new Array(MAX_INVENTORY_STORAGE).fill(null);
        if (!Array.isArray(savedInventory)) return inventory;

        const slotCount = Math.min(savedInventory.length, MAX_INVENTORY_STORAGE);
        for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
            const item = restoreItemInstance(savedInventory[slotIndex]);
            if (item) inventory[slotIndex] = item;
        }

        return inventory;
    }

    function restoreTechnologies(savedTechnologies) {
        getTechnologies().forEach(function (technology) {
            const savedTechnology = (savedTechnologies || []).find(function (entry) {
                return entry && entry.name === technology.name;
            });
            if (!savedTechnology) return;

            technology.level = savedTechnology.level ?? 0;
            technology.researchPoints = savedTechnology.researchPoints ?? technology.getRequiredResearch();
            technology.status = savedTechnology.status ?? TechnologyStatus.NotResearched;

            // Older saves were written when a technology had a lower max
            // level. If it was marked complete below the current maximum (for
            // example DietBasics at level 2), make the remaining levels
            // researchable again.
            if (technology.status === TechnologyStatus.Completed
                && technology.level < technology.maxLevel) {
                technology.status = TechnologyStatus.NotResearched;
                technology.researchPoints = technology.getRequiredResearch();
            }
        });
    }

    function applySavedState(saved) {
        player = restorePlayer(saved.player);
        player.name = saved.name || "You";
        if (typeof setFoodStatBindings === "function") {
            setFoodStatBindings(saved.foodStatBindings, saved.mapSeed);
        }
        maxInventory = INVENTORY_SLOTS;
        scrapRarityFilter = normalizeScrapRarityFilter(saved.scrapRarityFilter);
        lastUpdate = saved.lastUpdate;
        if (typeof restoreGameTime === "function") restoreGameTime(saved.gameMinutes);
        if (typeof restoreGameWeather === "function") {
            restoreGameWeather(saved.gameWeatherId, saved.gameWeatherCheckSegment);
        }
        logLength = saved.logLength;
        maxActions = saved.maxActions;
        actionsCount = saved.actionsCount;
        showDebugMessages = saved.showDebugMessages;
        dayDreamUnlocked = saved.dayDreamUnlocked === true;
        researchUnlocked = saved.researchUnlocked === true;
        previousTimedActionIds = normalizePreviousTimedActionIds(
            saved.previousTimedActionIds,
            saved.previousTimedActionId
        ).map(function (actionId) {
            return actionId === "meditate" ? "focus" : actionId;
        });
        activeTravel = restoreTravel(saved.activeTravel);
        hearthfireStacks = 0;
        hearthfireFuelElapsed = Math.max(0, Number(saved.hearthfireFuelElapsed) || 0);
        hearthfireActiveCampfireUid = null;
        if (typeof restoreDramaState === "function") {
            restoreDramaState(
                saved.DramaMeter,
                saved.dramaEventTimer,
                saved.catchedColdRemaining,
                saved.earthShakingRemaining,
                saved.dramaDebuffs
            );
        }
        restoreTechnologies(saved.technologies);
        minPotentialBonusPercent = saved.minPotentialBonusPercent
            ?? (NOT_SO_WORTHLESS_TECHNOLOGY.level * MIN_POTENTIAL_BONUS_PER_LEVEL);
        activeResearchTechnology = getTechnologyByName(saved.activeResearchTechnology);
        ResearchLeft = saved.ResearchLeft ?? (activeResearchTechnology ? activeResearchTechnology.getRequiredResearch() : 0);
        researchQueue.length = 0;
        (saved.researchQueue || []).forEach(function (technologyName) {
            const technology = getTechnologyByName(technologyName);
            if (technology) researchQueue.push(technology);
        });
        // Building actions are dynamic, so they must exist before saved action
        // states are applied.
        if (typeof restoreBuildings === "function") {
            restoreBuildings(saved.buildings);
        }
        resetActionStates();
        Object.keys(saved.actionStates || {}).forEach(function (savedActionId) {
            const actionId = savedActionId === "meditate" ? "focus" : savedActionId;
            if (Object.prototype.hasOwnProperty.call(actionStates, actionId) && saved.actionStates[savedActionId] != null) {
                actionStates[actionId] = saved.actionStates[savedActionId];
            }
        });
        searchOpened = saved.searchOpened;
        focusPoints = saved.focusPoints ?? 0;
        updateFocusPointsDisplay();
        Object.keys(habitToggles).forEach(function (habitId) {
            if (saved.habitToggles && Object.prototype.hasOwnProperty.call(saved.habitToggles, habitId)) {
                habitToggles[habitId] = saved.habitToggles[habitId] === true;
            }
        });
        dietAutoEatThresholdPercent = clampDietAutoEatThreshold(saved.dietAutoEatThresholdPercent);
        dietPriorityStat = CORE_STAT_NAMES.includes(saved.dietPriorityStat)
            ? saved.dietPriorityStat
            : "";
        harvestTreePriorityStat = CORE_STAT_NAMES.includes(saved.harvestTreePriorityStat)
            ? saved.harvestTreePriorityStat
            : "";
        updateHabitToggles();
        updateHabitVisibility();
        landTotals = saved.landTotals;
        if (window.mapView && saved.mapSeed != null) {
            window.mapView.setSeed(saved.mapSeed);
        }
        if (window.mapView && typeof window.mapView.setTileStates === "function") {
            window.mapView.setTileStates(saved.tileStates || {});
        }
        restoreCurrentTile(saved.currentTile);
        if (typeof attachBuildingsToCurrentTile === "function") {
            attachBuildingsToCurrentTile();
        }
    }

    function restoreCurrentTile(savedTile) {
        const tileState = savedTile || {};
        const tileX = tileState.x ?? 0;
        const tileY = tileState.y ?? 0;

        if (window.mapView && typeof window.mapView.getGameplayTile === "function") {
            currentTile = window.mapView.getGameplayTile(tileX, tileY);
        } else {
            currentTile = { x: tileX, y: tileY, land: {}, resourceMultipliers: {} };
        }

        currentTile.revealed = tileState.revealed ?? 0;
        currentTile.investigated = tileState.investigated ?? 0;
        currentTile.hiddenstuff = tileState.hiddenstuff ?? 0;
        currentTile.land = Object.assign({ trees: 0, grass: 0, rocks: 0, water: 0 }, tileState.land || {});
        currentTile.resourceMultipliers = Object.assign({}, tileState.resourceMultipliers || {});
        currentTile.space = Object.assign(
            { EmptySpace: 1000, RoomSpace: 0 },
            tileState.space || {}
        );
        currentTile.harvestedTrees = Object.assign(
            {},
            tileState.harvestedTrees || {}
        );
    }

    function restoreTravel(savedTravel) {
        if (!savedTravel || typeof savedTravel !== "object") return null;

        const dx = Number(savedTravel.dx);
        const dy = Number(savedTravel.dy);
        const remaining = Number(savedTravel.remaining);
        const duration = Number(savedTravel.duration);
        if (!Number.isFinite(remaining)) return null;

        const path = Array.isArray(savedTravel.path)
            ? savedTravel.path
                .map(function (step) {
                    return {
                        x: Math.trunc(Number(step && step.x)),
                        y: Math.trunc(Number(step && step.y)),
                    };
                })
                .filter(function (step) {
                    return Number.isFinite(step.x) && Number.isFinite(step.y);
                })
            : null;
        const targetX = Number(savedTravel.targetX);
        const targetY = Number(savedTravel.targetY);

        if (!path && (!Number.isFinite(dx) || !Number.isFinite(dy))) {
            return null;
        }

        return {
            dx: Number.isFinite(dx) ? dx : 0,
            dy: Number.isFinite(dy) ? dy : 0,
            path: path && path.length ? path : null,
            targetX: Number.isFinite(targetX) ? targetX : undefined,
            targetY: Number.isFinite(targetY) ? targetY : undefined,
            message: savedTravel.message || "travel",
            remaining: Math.max(0, remaining),
            duration: Number.isFinite(duration) ? Math.max(0, duration) : Math.max(0, remaining),
        };
    }

    function restoreResources(savedResources) {
        Object.keys(RESOURCE_DEFS).forEach(function (resourceId) {
            const savedResource = savedResources ? savedResources[resourceId] : null;
            const stack = new ResourceStack(Number(resourceId));
            if (savedResource) {
                stack.amount = savedResource.amount ?? 0;
                const savedQuality = Number(savedResource.quality);
                stack.quality = Number.isFinite(savedQuality) && savedQuality > 0
                    ? savedQuality
                    : RESOURCE_DEFAULT_QUALITY;
            }
            resources[resourceId] = stack;
        });
    }

    function clearInterfaceForLoad(savedVisibility) {
        clearActionButtons();
        document.getElementById("skillstab").innerHTML = 'whoaskills';

        Object.keys(savedVisibility || {}).forEach(function (actionId) {
            if (Object.prototype.hasOwnProperty.call(actionVisibility, actionId)) {
                actionVisibility[actionId] = savedVisibility[actionId] === true;
            }
        });
    }

    function restoreSkillBars() {
        CORE_STAT_NAMES.forEach(createSkillBar);
        ensureSkillsDivider();

        const learnedSkills = [
            ['exploration', player.exploration.lvl > 1 || player.exploration.exp != BASE_EXP],
            ['forage', player.forage.lvl > 1 || player.forage.exp != BASE_EXP],
            ['rest', player.rest.lvl > 1 || player.rest.exp != BASE_EXP],
            ['focus', player.focus.lvl > 1 || player.focus.exp != BASE_EXP],
            ['wizardy', player.wizardy.lvl > 1 || player.wizardy.exp != BASE_EXP],
            ['alchemy', player.alchemy.lvl > 1 || player.alchemy.exp != BASE_EXP],
            ['masonry', player.masonry.lvl > 1 || player.masonry.exp != BASE_EXP],
            ['pottery', player.pottery.lvl > 1 || player.pottery.exp != BASE_EXP],
            ['regeneration', player.regeneration.lvl > 1 || player.regeneration.exp != BASE_EXP],
            ['autism', player.autism.lvl > 1 || player.autism.exp != BASE_EXP],
            ['science', player.science.lvl > 1 || player.science.exp != BASE_EXP],
            ['traveling', player.traveling.lvl > 1 || player.traveling.exp != BASE_EXP],
            ['dreammastery', player.dreammastery.lvl > 1 || player.dreammastery.exp != BASE_EXP],
            ['survival', player.survival.lvl > 1 || player.survival.exp != BASE_EXP],
            ['ropemaking', player.ropemaking.lvl > 1 || player.ropemaking.exp != BASE_EXP],
            ['tailoring', player.tailoring.lvl > 1 || player.tailoring.exp != BASE_EXP],
            ['carpentry', player.carpentry.lvl > 1 || player.carpentry.exp != BASE_EXP],
            ['architecture', player.architecture.lvl > 1 || player.architecture.exp != BASE_EXP],
            ['gardening', player.gardening.lvl > 1 || player.gardening.exp != BASE_EXP],
            ['digging', player.digging.lvl > 1 || player.digging.exp != BASE_EXP],
            ['mining', player.mining.lvl > 1 || player.mining.exp != BASE_EXP],
            ['smithing', player.smithing.lvl > 1 || player.smithing.exp != BASE_EXP],
            ['cooking', player.cooking.lvl > 1 || player.cooking.exp != BASE_EXP],
            ['milling', player.milling.lvl > 1 || player.milling.exp != BASE_EXP],
            ['lumberjack', player.lumberjack.lvl > 1 || player.lumberjack.exp != BASE_EXP],
        ];

        learnedSkills.forEach(function ([skillName, shouldCreate]) {
            if (shouldCreate) createSkillBar(skillName);
        });
    }

    function restoreMap() {
        if (window.mapView) {
            if (typeof window.mapView.focusTile === "function") {
                window.mapView.focusTile(currentTile.x, currentTile.y);
            } else {
                window.mapView.refresh();
            }
        }
        logMessage('Map seed: ' + (window.mapView ? window.mapView.getSeed() : 'none'));
    }

    function loadGame(slot) {
        const targetSlot = isValidSaveSlot(slot) ? slot : 1;
        const saved = readSavedGame(targetSlot);
        if (!saved) {
            logMessage('Slot ' + targetSlot + ' is empty');
            return;
        }

        setLogSuppressed(true);
        // The first tick after loading may replay offline progress; hide the
        // Autism level-up spam it can produce.
        suppressAutismLevelLogs = true;
        try {
            applySavedState(saved);
            restoreResources(saved.resources);
            calculateStats();
            clearInterfaceForLoad(saved.actionVisibility);
            refreshActionButtons(true);
            restoreSkillBars();
            // clearInterfaceForLoad empties the skills tab, which also removes
            // the Tool powers section. Rebuild it before refreshing the values.
            if (typeof createToolPowerSection === "function") {
                createToolPowerSection();
            }
            if (typeof createHousePowerSection === "function") {
                createHousePowerSection();
            }
            if (typeof updateCharacterPowerGUI === "function") {
                updateCharacterPowerGUI();
            }
            updateTechnologyButtons();
            updateCharacterHeader();
            updateDebugFilterButton();
            restoreMap();
            if (typeof renderInventorySlots === "function") renderInventorySlots();
            if (typeof renderEquipmentItems === "function") renderEquipmentItems();
            if (typeof renderBuildPanels === "function") renderBuildPanels();
            if (typeof renderGameClock === "function") renderGameClock();
        } finally {
            setLogSuppressed(false);
        }
        logMessage('Game loaded from slot ' + targetSlot);
    }

    updateSaveSlotLabels();
