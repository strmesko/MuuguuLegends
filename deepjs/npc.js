// NPC entity model.
//
// NPCs share the player's Character skills and stats, but are generated from
// per-type presets. All NPC-specific data and logic lives in this file.

const NPC_MOOD_MIN = 0;
const NPC_MOOD_MAX = 100;
const NPC_FAVOR_MIN = 0;
const NPC_FAVOR_MAX = 100;

const NPC_TYPE_IDS = Object.freeze({
    FAIRY: "fairy",
});

function createNpcGrowth(base, perLevel) {
    return Object.freeze({
        base: Math.max(0, Number(base) || 0),
        perLevel: Number(perLevel) || 0,
    });
}

// Presets describe the starting value and the gain per NPC level. Level 1
// therefore uses the base value; every next level adds the per-level growth.
const NPC_PRESETS = Object.freeze({
    [NPC_TYPE_IDS.FAIRY]: Object.freeze({
        id: NPC_TYPE_IDS.FAIRY,
        name: "Fairy",
        description: "A small winged spirit of field and forest.",
        image: "images/NPC/fairy.webp",
        stats: Object.freeze({
            str: createNpcGrowth(1, 1),
            agi: createNpcGrowth(3, 3),
            vit: createNpcGrowth(2, 1),
            per: createNpcGrowth(5, 3),
            int: createNpcGrowth(2, 2),
            ins: createNpcGrowth(6, 2),
            sou: createNpcGrowth(8, 2),
        }),
        skills: Object.freeze({
            forage: createNpcGrowth(10, 3),
            gardening: createNpcGrowth(15, 3),
            cooking: createNpcGrowth(5, 1),
            meditation: createNpcGrowth(10, 2),
        }),
        mood: Object.freeze({ base: 50, variance: 10 }),
        favor: Object.freeze({ base: 0, variance: 0 }),
    }),
});

const NPC_PRESET_IDS = Object.freeze(Object.keys(NPC_PRESETS));

let npcs = [];
let nextNpcUid = 1;

function getNpcPreset(typeId) {
    const id = String(typeId || "");
    return NPC_PRESETS[id] || null;
}

function getNpcPresetIds() {
    return NPC_PRESET_IDS.slice();
}

function getNpcLevelForTile(x, y) {
    const level = typeof getMobLevelForTile === "function"
        ? getMobLevelForTile(x, y)
        : 1;
    return Math.max(1, Math.floor(Number(level) || 1));
}

function getNpcGrowthValue(growth, level) {
    if (!growth) return 0;
    const base = Number(growth.base) || 0;
    const perLevel = Number(growth.perLevel) || 0;
    const levelsGained = Math.max(0, Math.floor(Number(level) || 1) - 1);
    return Math.max(0, round2(base + perLevel * levelsGained));
}

function rollNpcParameter(definition) {
    const base = Number(definition && definition.base) || 0;
    const variance = Math.max(
        0,
        Number(definition && definition.variance) || 0
    );
    return base + (Math.random() * 2 - 1) * variance;
}

function clampNpcMood(value) {
    return round2(Math.max(NPC_MOOD_MIN, Math.min(NPC_MOOD_MAX, Number(value) || 0)));
}

function clampNpcFavor(value) {
    return round2(Math.max(
        NPC_FAVOR_MIN,
        Math.min(NPC_FAVOR_MAX, Number(value) || 0)
    ));
}

function setNpcEntryLevel(entry, level) {
    if (!entry) return;
    entry.lvl = level;
    entry.exp = typeof getExperienceRequiredForLevel === "function"
        ? getExperienceRequiredForLevel(level)
        : entry.exp;
}

function recalculateNpcStats(npc) {
    if (!npc) return;

    const lvl = Math.max(1, Number(npc.lvl) || 1);
    const ratio = 1.01 + 0.01 * lvl;
    const str = Math.max(0, Number(npc.str && npc.str.lvl) || 0);
    const agi = Math.max(0, Number(npc.agi && npc.agi.lvl) || 0);
    const vit = Math.max(0, Number(npc.vit && npc.vit.lvl) || 0);
    const int = Math.max(0, Number(npc.int && npc.int.lvl) || 0);
    const ins = Math.max(0, Number(npc.ins && npc.ins.lvl) || 0);
    const sou = Math.max(0, Number(npc.sou && npc.sou.lvl) || 0);

    npc.maxhp = round2(Math.pow(str + vit * 3 + sou, ratio));
    npc.maxmana = round2(Math.pow(int * 2 + sou + ins * 2, ratio));
    npc.maxstamina = round2(Math.pow(str + agi + vit * 2 + sou, ratio));

    npc.hp = npc.maxhp;
    npc.mana = npc.maxmana;
    npc.stamina = npc.maxstamina;
}

function applyNpcPreset(npc, preset) {
    if (!npc || !preset) return;

    Object.keys(preset.stats || {}).forEach(function (key) {
        if (!npc[key]) return;
        setNpcEntryLevel(
            npc[key],
            getNpcGrowthValue(preset.stats[key], npc.lvl)
        );
    });

    Object.keys(preset.skills || {}).forEach(function (key) {
        if (!npc[key]) return;
        setNpcEntryLevel(
            npc[key],
            getNpcGrowthValue(preset.skills[key], npc.lvl)
        );
    });

    recalculateNpcStats(npc);
}

class Npc extends Character {
    constructor(preset, level, x, y) {
        super(0, 0, 0);

        this.isNpc = true;
        this.uid = nextNpcUid++;
        this.type = preset.id;
        this.name = preset.name;
        this.description = preset.description;
        this.image = preset.image;
        this.x = Math.floor(Number(x) || 0);
        this.y = Math.floor(Number(y) || 0);
        this.lvl = Math.max(1, Math.floor(Number(level) || 1));
        this.level = this.lvl;
        this.exp = 0;
        this.maxexp = typeof getExperienceRequiredForLevel === "function"
            ? getExperienceRequiredForLevel(this.lvl)
            : BASE_EXP;
        this.mood = clampNpcMood(rollNpcParameter(preset.mood));
        this.favor = clampNpcFavor(rollNpcParameter(preset.favor));
        this.attack = 1;

        applyNpcPreset(this, preset);
    }
}

function createNpc(typeId, x, y, options) {
    const preset = getNpcPreset(typeId);
    if (!preset) return null;

    const forcedLevel = options && Number(options.level);
    const level = Number.isFinite(forcedLevel) && forcedLevel > 0
        ? Math.floor(forcedLevel)
        : getNpcLevelForTile(x, y);

    return new Npc(preset, level, x, y);
}

function spawnNpc(typeId, x, y, options) {
    const npc = createNpc(typeId, x, y, options);
    if (!npc) return null;

    npcs.push(npc);
    return npc;
}

function generateNpcHere(typeId, options) {
    if (typeof currentTile === "undefined" || !currentTile) return null;

    return spawnNpc(
        typeId || NPC_TYPE_IDS.FAIRY,
        currentTile.x,
        currentTile.y,
        options
    );
}

function getNpcByUid(uid) {
    const id = Number(uid);
    return npcs.find(function (npc) {
        return npc.uid === id;
    }) || null;
}

function getNpcsAtTile(x, y) {
    const tileX = Math.floor(Number(x) || 0);
    const tileY = Math.floor(Number(y) || 0);

    return npcs.filter(function (npc) {
        return npc.x === tileX && npc.y === tileY;
    });
}

function removeNpc(uid) {
    const id = Number(uid);
    const index = npcs.findIndex(function (npc) {
        return npc.uid === id;
    });
    if (index === -1) return false;

    npcs.splice(index, 1);
    return true;
}

function clearNpcs() {
    npcs = [];
    nextNpcUid = 1;
}

function serializeNpcs() {
    return npcs.map(function (npc) {
        return {
            uid: npc.uid,
            type: npc.type,
            level: npc.lvl,
            x: npc.x,
            y: npc.y,
            mood: npc.mood,
            favor: npc.favor,
        };
    });
}

function restoreNpcs(savedNpcs) {
    clearNpcs();

    (Array.isArray(savedNpcs) ? savedNpcs : []).forEach(function (saved) {
        if (!saved) return;

        const preset = getNpcPreset(saved.type);
        if (!preset) return;

        const level = Math.max(1, Math.floor(Number(saved.level) || 1));
        const npc = new Npc(
            preset,
            level,
            Number(saved.x) || 0,
            Number(saved.y) || 0
        );

        const savedUid = Number(saved.uid);
        if (Number.isInteger(savedUid) && savedUid > 0) {
            npc.uid = savedUid;
            nextNpcUid = Math.max(nextNpcUid, savedUid + 1);
        }

        if (saved.mood != null) npc.mood = clampNpcMood(saved.mood);
        if (saved.favor != null) npc.favor = clampNpcFavor(saved.favor);

        npcs.push(npc);
    });
}

function getNpcDisplayName(npc) {
    if (!npc) return "NPC";
    return npc.name + " Lv " + npc.lvl;
}

function setNpcMood(npc, value) {
    if (!npc) return false;
    npc.mood = clampNpcMood(value);
    return true;
}

function adjustNpcMood(npc, delta) {
    if (!npc) return false;
    npc.mood = clampNpcMood(npc.mood + (Number(delta) || 0));
    return true;
}

function setNpcFavor(npc, value) {
    if (!npc) return false;
    npc.favor = clampNpcFavor(value);
    return true;
}

function adjustNpcFavor(npc, delta) {
    if (!npc) return false;
    npc.favor = clampNpcFavor(npc.favor + (Number(delta) || 0));
    return true;
}

// --- conversation ---------------------------------------------------------

const NPC_GREET_FAVOR_GAIN = 10;
const NPC_GREET_MOOD_GAIN = 10;
const NPC_GREET_REPEAT_MOOD_LOSS = 5;

let activeNpcDialogue = null;

function isNpcDialogueActive() {
    return !!activeNpcDialogue;
}

function getActiveNpcDialogueNpc() {
    if (!activeNpcDialogue) return null;
    return getNpcByUid(activeNpcDialogue.npcUid);
}

function createNpcDialogueFighter(side, nameId, imageId) {
    const fighter = document.createElement("div");
    fighter.className = "combat-fighter combat-" + side;

    const name = document.createElement("div");
    name.className = "combat-name";
    name.id = nameId;
    fighter.appendChild(name);

    const portrait = document.createElement("div");
    portrait.className = "combat-portrait";
    const image = document.createElement("img");
    image.id = imageId;
    image.className = "combat-sprite";
    image.alt = "";
    portrait.appendChild(image);
    fighter.appendChild(portrait);

    return fighter;
}

function ensureNpcDialogueOverlay() {
    let overlay = document.getElementById("npcdialogueoverlay");
    if (overlay) return overlay;

    const parent = document.getElementById("actionplace") || document.body;
    overlay = document.createElement("div");
    overlay.id = "npcdialogueoverlay";
    overlay.className = "combatoverlay npcdialogueoverlay";
    overlay.style.display = "flex";

    const panel = document.createElement("div");
    panel.className = "combat-panel npcdialogue-panel";

    const title = document.createElement("div");
    title.className = "combat-title";
    title.innerText = "Conversation";
    panel.appendChild(title);

    const arena = document.createElement("div");
    arena.className = "combat-arena";
    arena.appendChild(createNpcDialogueFighter(
        "player",
        "npcdialogueplayername",
        "npcdialogueplayerimage"
    ));

    const vs = document.createElement("div");
    vs.className = "combat-vs";
    vs.innerText = "TALK";
    arena.appendChild(vs);

    arena.appendChild(createNpcDialogueFighter(
        "enemy",
        "npcdialoguenpcname",
        "npcdialoguenpcimage"
    ));
    panel.appendChild(arena);

    const stats = document.createElement("div");
    stats.className = "npcdialogue-stats";

    const favor = document.createElement("div");
    favor.className = "npcdialogue-stat";
    favor.innerText = "Favor: ";
    const favorValue = document.createElement("span");
    favorValue.id = "npcdialoguefavor";
    favor.appendChild(favorValue);
    stats.appendChild(favor);

    const mood = document.createElement("div");
    mood.className = "npcdialogue-stat";
    mood.innerText = "Mood: ";
    const moodValue = document.createElement("span");
    moodValue.id = "npcdialoguemood";
    mood.appendChild(moodValue);
    stats.appendChild(mood);

    panel.appendChild(stats);

    const actions = document.createElement("div");
    actions.className = "npcdialogue-actions";

    const greetButton = document.createElement("button");
    greetButton.type = "button";
    greetButton.id = "npcdialoguegreet";
    greetButton.className = "combatclosebutton";
    greetButton.innerText = "Greet";
    greetButton.addEventListener("click", greetActiveNpc);
    actions.appendChild(greetButton);

    const goodbyeButton = document.createElement("button");
    goodbyeButton.type = "button";
    goodbyeButton.id = "npcdialoguesaygoodbye";
    goodbyeButton.className = "combatclosebutton";
    goodbyeButton.innerText = "Say goodbye";
    goodbyeButton.addEventListener("click", endNpcDialogue);
    actions.appendChild(goodbyeButton);

    panel.appendChild(actions);
    overlay.appendChild(panel);
    parent.appendChild(overlay);

    return overlay;
}

function renderNpcDialogue() {
    const npc = getActiveNpcDialogueNpc();
    if (!npc) {
        endNpcDialogue();
        return;
    }

    const overlay = ensureNpcDialogueOverlay();
    overlay.style.display = "flex";

    const playerName = document.getElementById("npcdialogueplayername");
    const playerImage = document.getElementById("npcdialogueplayerimage");
    const npcName = document.getElementById("npcdialoguenpcname");
    const npcImage = document.getElementById("npcdialoguenpcimage");
    const favor = document.getElementById("npcdialoguefavor");
    const mood = document.getElementById("npcdialoguemood");

    if (playerName) {
        playerName.innerText = (typeof player !== "undefined" && player && player.name)
            ? player.name
            : "You";
    }
    if (playerImage) playerImage.src = "muguu.png";
    if (npcName) npcName.innerText = getNpcDisplayName(npc);
    if (npcImage) npcImage.src = npc.image;
    if (favor) favor.innerText = round2(npc.favor) + " / " + NPC_FAVOR_MAX;
    if (mood) mood.innerText = round2(npc.mood) + " / " + NPC_MOOD_MAX;
}

function captureNpcDialogueResumeActions() {
    if (typeof captureCombatResumeActions === "function") {
        captureCombatResumeActions();
    }
}

function resumeNpcDialogueActions() {
    if (typeof resumeCombatPreviousActions === "function") {
        resumeCombatPreviousActions();
    }
}

function startNpcDialogue(npc) {
    if (activeNpcDialogue) return false;
    if (typeof isCombatActive === "function" && isCombatActive()) return false;
    if (typeof isTraveling === "function" && isTraveling()) {
        if (typeof logMessage === "function") {
            logMessage("You cannot talk while travelling.");
        }
        return false;
    }
    if (typeof currentTile === "undefined" || !currentTile) return false;

    let target = npc || null;
    if (target && !(target instanceof Npc)) {
        target = getNpcByUid(target);
    }
    if (!target) {
        target = getNpcsAtTile(currentTile.x, currentTile.y)[0] || null;
    }
    if (!target || target.x !== currentTile.x || target.y !== currentTile.y) {
        return false;
    }

    captureNpcDialogueResumeActions();
    if (typeof stopActiveTimedActions === "function") {
        stopActiveTimedActions();
    }
    if (typeof closeMapTravelDialog === "function") closeMapTravelDialog();

    activeNpcDialogue = {
        npcUid: target.uid,
        greeted: false,
    };

    renderNpcDialogue();
    if (typeof logMessage === "function") {
        logMessage("You start talking to " + getNpcDisplayName(target) + ".");
    }
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    return true;
}

function endNpcDialogue() {
    if (!activeNpcDialogue) return false;

    const npc = getActiveNpcDialogueNpc();
    activeNpcDialogue = null;

    const overlay = document.getElementById("npcdialogueoverlay");
    if (overlay) overlay.remove();

    if (npc && typeof logMessage === "function") {
        logMessage("You say goodbye to " + npc.name + ".");
    }

    resumeNpcDialogueActions();
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}

function greetActiveNpc() {
    if (!activeNpcDialogue) return false;

    const npc = getActiveNpcDialogueNpc();
    if (!npc) {
        endNpcDialogue();
        return false;
    }

    const firstGreeting = activeNpcDialogue.greeted !== true;
    if (firstGreeting) {
        adjustNpcFavor(npc, NPC_GREET_FAVOR_GAIN);
        adjustNpcMood(npc, NPC_GREET_MOOD_GAIN);
        activeNpcDialogue.greeted = true;
        if (typeof logMessage === "function") {
            logMessage("You greet " + npc.name + ". Favor +"
                + NPC_GREET_FAVOR_GAIN + ", mood +" + NPC_GREET_MOOD_GAIN + ".");
        }
    } else {
        adjustNpcMood(npc, -NPC_GREET_REPEAT_MOOD_LOSS);
        if (typeof logMessage === "function") {
            logMessage(npc.name + " is tired of repeated greetings. Mood -"
                + NPC_GREET_REPEAT_MOOD_LOSS + ".");
        }
    }

    if (typeof player !== "undefined" && player && player.social
        && typeof player.social.addexp === "function") {
        player.social.addexp(firstGreeting ? 5 : 1);
    }

    renderNpcDialogue();
    if (typeof updateGUI === "function") updateGUI();
    return true;
}
