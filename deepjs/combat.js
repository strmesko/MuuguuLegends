// Combat system: mobs, combatants, the turn timer and the combat panel.
// The main loop calls updateCombat(diff) while activeCombat is set.

var activeCombat = null;

const COMBAT_STAT_KEYS = Object.freeze([
    "str", "agi", "vit", "per", "int", "ins", "sou", "luck", "speed",
]);
const COMBAT_SKILL_KEYS = Object.freeze([
    "tactics", "anatomy", "dodging", "bullseye",
]);
const COMBAT_ATTACK_SPEED_BASE_MS = 5000;
const COMBAT_ATTACK_SPEED_FACTOR = 0.03;
const COMBAT_AUTO_CLOSE_DELAY_MS = 2500;
const MOB_LEVEL_TILES = 5;
const MOB_LEVEL_STAT_MULTIPLIER = 1.05;
const ASS_POISON_DURATION_SECONDS = 30;
const ASS_POISON_DAMAGE_PER_STACK_PER_SECOND = 0.05;
const ASS_POISON_MAX_STACKS = 50;

var assPoisonStacks = 0;
var assPoisonRemaining = 0;

const MOBS = Object.freeze({
    catterpuwa: Object.freeze({
        id: "catterpuwa",
        name: "Catterpuwa",
        description: "A fluffy  hand sized catterpilar looks angry but delicious.",
        image: "images/combat/mobs/catterpuwa.png",
        stats: Object.freeze({
            str: 1,
            agi: 2,
            vit: 1,
            per: 1,
            int: 1,
            ins: 1,
            sou: 1,
            luck: 1,
            speed: 100,
        }),
        hp: 12,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS,
    }),
    angrybird: Object.freeze({
        id: "angrybird",
        name: "Angry bird",
        description: "A tiny furious bird. Mostly feathers, anger and bad decisions.",
        image: "images/combat/mobs/angrybird.png",
        stats: Object.freeze({
            str: 1,
            agi: 10,
            vit: 1,
            per: 1,
            int: 1,
            ins: 1,
            sou: 1,
            luck: 1,
            speed: 100,
        }),
        skills: Object.freeze({ dodging: 6 }),
        hp: 1,
        mana: 0,
        sp: 1,
        attack: 0,
        armor: 0.1,
        attackSpeedMs: 500,
    }),
    bombchick: Object.freeze({
        id: "bombchick",
        name: "Bomb chick",
        description: "A chick with an elevated nitroglycerin content.",
        image: "images/combat/mobs/bombchick.png",
        stats: Object.freeze({
            str: 1,
            agi: 2,
            vit: 1,
            per: 1,
            int: 1,
            ins: 1,
            sou: 1,
            luck: 1,
            speed: 100,
        }),
        hp: 6,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS,
    }),
    assspider: Object.freeze({
        id: "assspider",
        name: "Ass spider",
        description: "A spider with an ass on its rear abdomen.",
        image: "images/combat/mobs/assspider.png",
        stats: Object.freeze({
            str: 1,
            agi: 2,
            vit: 1,
            per: 1,
            int: 1,
            ins: 1,
            sou: 1,
            luck: 1,
            speed: 100,
        }),
        hp: 12,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 0.5,
        attackSpeedMs: 6000,
    }),
    jellopa: Object.freeze({
        id: "jellopa",
        name: "Jellopa",
        description: "A translucent blue slime. It looks like a very wet bad idea.",
        image: "images/combat/mobs/jellopa.png",
        stats: Object.freeze({
            str: 1,
            agi: 2,
            vit: 1,
            per: 1,
            int: 1,
            ins: 1,
            sou: 1,
            luck: 1,
            speed: 100,
        }),
        hp: 12,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS,
        healOnAttack: 0.1,
    }),
});

function getMobLevelForTile(x, y) {
    const start = typeof getStartCoordinates === "function"
        ? getStartCoordinates()
        : { x: 0, y: 0 };
    const dx = (Number(x) || 0) - start.x;
    const dy = (Number(y) || 0) - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return 1 + Math.max(0, Math.floor(distance / MOB_LEVEL_TILES));
}

function getMobLevelMultiplier(level) {
    const normalized = Math.max(1, Math.floor(Number(level) || 1));
    return Math.pow(MOB_LEVEL_STAT_MULTIPLIER, normalized - 1);
}

function getRandomMobId() {
    const ids = Object.keys(MOBS);
    if (!ids.length) return "catterpuwa";
    return ids[Math.floor(Math.random() * ids.length)];
}

const MOB_LOOT = Object.freeze({
    catterpuwa: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.BUG_MEAT, amount: 1 }),
    ]),
    angrybird: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.CHICKEN_MEAT, amount: 1 }),
    ]),
    bombchick: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.CHICKEN_MEAT, amount: 1 }),
    ]),
    assspider: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.BUG_MEAT, amount: 1 }),
    ]),
    jellopa: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.JELLY, amount: 1 }),
    ]),
});

function getMobLootQuality(combatant) {
    const level = Math.max(1, Math.floor(Number(combatant && combatant.level) || 1));
    return Math.pow(level, 1.1);
}

function dropMobLoot(combatant) {
    if (!combatant || typeof addResource !== "function") return;

    const drops = MOB_LOOT[combatant.id] || [];
    if (!drops.length) return;

    const quality = getMobLootQuality(combatant);
    drops.forEach(function (drop) {
        addResource(drop.resourceId, drop.amount, quality);
        const definition = typeof RESOURCE_DEFS !== "undefined"
            ? RESOURCE_DEFS[drop.resourceId]
            : null;
        const name = definition ? definition.name : "resource";
        logCombat("You gather " + name + " x" + drop.amount
            + " (Q" + formatCombatStat(quality) + ").");
    });
}

function formatCombatDuration(seconds) {
    const total = Math.max(0, Math.ceil(Number(seconds) || 0));
    return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
}

function getAssPoisonDamagePerSecond() {
    return assPoisonStacks * ASS_POISON_DAMAGE_PER_STACK_PER_SECOND;
}

function applyAssPoison(damage) {
    const stacks = Math.max(1, Math.floor(Number(damage) || 1));
    assPoisonStacks = Math.min(
        ASS_POISON_MAX_STACKS,
        assPoisonStacks + stacks
    );
    assPoisonRemaining = ASS_POISON_DURATION_SECONDS;
    logCombat("AssPoison: +" + stacks + " stack"
        + (stacks === 1 ? "" : "s") + " (" + assPoisonStacks + " total).");
}

function updateAssPoison(diff) {
    if (assPoisonStacks <= 0 || assPoisonRemaining <= 0) return;

    const seconds = Math.max(0, Number(diff) || 0);
    if (seconds <= 0) return;

    const activeSeconds = Math.min(seconds, assPoisonRemaining);
    const damage = roundCombatDamage(
        getAssPoisonDamagePerSecond() * activeSeconds
    );

    if (damage > 0 && typeof player !== "undefined" && player) {
        player.hp = Math.max(0, roundCombatDamage(Number(player.hp) - damage));
        if (activeCombat && activeCombat.player) {
            activeCombat.player.hp = player.hp;
        }
    }

    assPoisonRemaining = Math.max(0, assPoisonRemaining - seconds);
    if (assPoisonRemaining <= 0) {
        assPoisonStacks = 0;
        if (typeof logMessage === "function") {
            logMessage("AssPoison has worn off.");
        }
    }
}

function getAssPoisonStatus() {
    if (assPoisonStacks <= 0 || assPoisonRemaining <= 0) return null;

    return {
        id: "ass-poison",
        name: "AssPoison",
        kind: "debuff",
        color: "#a569bd",
        icon: "fa-flask",
        stacks: assPoisonStacks,
        tooltip: [
            "<b>AssPoison</b>",
            "Stacks: " + assPoisonStacks,
            "Damage: " + formatCombatStat(getAssPoisonDamagePerSecond()) + "/s",
            "Remaining: " + formatCombatDuration(assPoisonRemaining),
        ].join("<br>"),
    };
}

function getAssPoisonSnapshot() {
    return {
        stacks: assPoisonStacks,
        remaining: assPoisonRemaining,
    };
}

function restoreAssPoison(savedStacks, savedRemaining) {
    const stacks = Number(savedStacks);
    const remaining = Number(savedRemaining);
    assPoisonStacks = Number.isFinite(stacks) && stacks > 0
        ? Math.min(ASS_POISON_MAX_STACKS, Math.floor(stacks))
        : 0;
    assPoisonRemaining = Number.isFinite(remaining) && remaining > 0
        ? Math.min(ASS_POISON_DURATION_SECONDS, remaining)
        : 0;
}

function isCombatActive() {
    return !!activeCombat;
}

function getCombatantStat(combatant, key) {
    const value = combatant && combatant.stats
        ? Number(combatant.stats[key])
        : 0;
    return Number.isFinite(value) ? value : 0;
}

function getCombatantSkill(combatant, key) {
    const value = combatant && combatant.skills
        ? Number(combatant.skills[key])
        : 0;
    return Number.isFinite(value) ? value : 0;
}

function getCombatantGearAttack(combatant) {
    if (!combatant) return 0;
    if (combatant.kind === "player" && typeof getEquippedStatBonus === "function") {
        return Math.max(0, Number(getEquippedStatBonus("attack")) || 0);
    }
    return Math.max(0, Number(combatant.attack) || 0);
}

function getCombatantGearDefence(combatant) {
    if (!combatant) return 0;
    if (combatant.kind === "player" && typeof getEquippedStatBonus === "function") {
        return Math.max(0, Number(getEquippedStatBonus("defence")) || 0);
    }
    return Math.max(0, Number(combatant.armor) || 0);
}

function getCombatAttack(combatant) {
    const strength = getCombatantStat(combatant, "str");
    const vitality = getCombatantStat(combatant, "vit");
    const tactics = getCombatantSkill(combatant, "tactics");
    const anatomy = getCombatantSkill(combatant, "anatomy");

    return ((strength + vitality / 5) + getCombatantGearAttack(combatant))
        * (1 + tactics / 5 + anatomy / 2);
}

function getCombatDefence(combatant) {
    const vitality = getCombatantStat(combatant, "vit");
    const tactics = getCombatantSkill(combatant, "tactics");
    return getCombatantGearDefence(combatant)
        * (vitality * (1 + tactics / 100));
}

function getCombatFlee(combatant) {
    return 10
        + getCombatantStat(combatant, "agi")
        + getCombatantStat(combatant, "speed") / 2
        + getCombatantSkill(combatant, "tactics")
        + getCombatantSkill(combatant, "dodging");
}

function getCombatHitChance(attacker, defender) {
    const chance = 100
        + (getCombatantStat(attacker, "agi") * 2
            + getCombatantStat(attacker, "ins")
            + getCombatantSkill(attacker, "tactics"))
        - getCombatFlee(defender);
    return Math.max(5, Math.min(100, chance));
}

function getCombatCritChance(attacker) {
    const numerator = getCombatantStat(attacker, "luck")
        + getCombatantSkill(attacker, "tactics") / 5
        + getCombatantSkill(attacker, "bullseye");
    const denominator = 100 + numerator;
    return denominator > 0
        ? Math.max(0, Math.min(0.95, numerator / denominator))
        : 0;
}

function getCombatCritMultiplier(attacker) {
    return 1.5
        + (getCombatantSkill(attacker, "bullseye")
            + getCombatantStat(attacker, "ins")) / 100;
}

function getCombatAttackIntervalMs(combatant) {
    if (combatant && combatant.kind !== "player") {
        const configured = Number(combatant.attackSpeedMs);
        return Number.isFinite(configured) && configured > 0
            ? configured
            : COMBAT_ATTACK_SPEED_BASE_MS;
    }

    const agility = Math.max(1, getCombatantStat(combatant, "agi"));
    const speed = Math.max(1, getCombatantStat(combatant, "speed"));
    const tempo = Math.max(0.01, agility * speed * COMBAT_ATTACK_SPEED_FACTOR);

    // The supplied formula is read as (base + tempo) / tempo: the base
    // interval shrinks as agility * speed grows.
    return Math.max(100, (COMBAT_ATTACK_SPEED_BASE_MS + tempo) / tempo);
}

function formatCombatStat(value) {
    return typeof round2 === "function" ? round2(value) : value;
}

function formatCombatSeconds(ms) {
    return formatCombatStat(ms / 1000) + "s";
}

function createPlayerCombatant() {
    const stats = {};
    const skills = {};

    COMBAT_STAT_KEYS.forEach(function (key) {
        stats[key] = typeof getEffectiveLevel === "function"
            ? Math.max(0, Number(getEffectiveLevel(key)) || 0)
            : 0;
    });
    COMBAT_SKILL_KEYS.forEach(function (key) {
        skills[key] = typeof getEffectiveLevel === "function"
            ? Math.max(0, Number(getEffectiveLevel(key)) || 0)
            : 0;
    });

    return {
        kind: "player",
        name: (typeof player !== "undefined" && player && player.name) || "You",
        image: "muguu.png",
        stats: stats,
        skills: skills,
        hp: Math.max(0, Number(player.hp) || 0),
        maxHp: Math.max(0, Number(player.maxhp) || 0),
        mana: Math.max(0, Number(player.mana) || 0),
        maxMana: Math.max(0, Number(player.maxmana) || 0),
        sp: Math.max(0, Number(player.stamina) || 0),
        maxSp: Math.max(0, Number(player.maxstamina) || 0),
        attackTimerMs: 0,
    };
}

function createMobCombatant(mobId, level) {
    const def = MOBS[mobId] || MOBS.catterpuwa;
    const tileX = typeof currentTile !== "undefined" && currentTile
        ? currentTile.x
        : 0;
    const tileY = typeof currentTile !== "undefined" && currentTile
        ? currentTile.y
        : 0;
    const mobLevel = Number.isFinite(Number(level))
        ? Math.max(1, Math.floor(Number(level)))
        : getMobLevelForTile(tileX, tileY);
    const multiplier = getMobLevelMultiplier(mobLevel);
    const stats = {};
    const skills = {};

    COMBAT_STAT_KEYS.forEach(function (key) {
        stats[key] = (Number(def.stats[key]) || 0) * multiplier;
    });
    COMBAT_SKILL_KEYS.forEach(function (key) {
        skills[key] = Number(def.skills && def.skills[key]) || 0;
    });

    return {
        kind: "mob",
        id: def.id,
        name: def.name + " Lv " + mobLevel,
        baseName: def.name,
        level: mobLevel,
        levelMultiplier: multiplier,
        description: def.description,
        image: def.image,
        stats: stats,
        skills: skills,
        hp: Math.max(0, (Number(def.hp) || 0) * multiplier),
        maxHp: Math.max(0, (Number(def.hp) || 0) * multiplier),
        mana: Math.max(0, (Number(def.mana) || 0) * multiplier),
        maxMana: Math.max(0, (Number(def.mana) || 0) * multiplier),
        sp: Math.max(0, (Number(def.sp) || 0) * multiplier),
        maxSp: Math.max(0, (Number(def.sp) || 0) * multiplier),
        attack: Math.max(0, (Number(def.attack) || 0) * multiplier),
        armor: Math.max(0, (Number(def.armor) || 0) * multiplier),
        healOnAttack: Math.max(0, Number(def.healOnAttack) || 0),
        attackSpeedMs: Math.max(100, Number(def.attackSpeedMs) || COMBAT_ATTACK_SPEED_BASE_MS),
        attackTimerMs: 0,
    };
}

function addCombatSkillExp(key, amount) {
    if (typeof player === "undefined" || !player || !player[key]) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    if (typeof player[key].addexp === "function") player[key].addexp(value);
}

function getCombatStatsText(combatant) {
    const attack = getCombatAttack(combatant);
    const defence = getCombatDefence(combatant);
    const interval = getCombatAttackIntervalMs(combatant);
    const hit = getCombatHitChance(combatant, combatant.kind === "player"
        ? activeCombat.enemy
        : activeCombat.player);
    const crit = getCombatCritChance(combatant) * 100;
    const lines = [];

    if (Number.isFinite(Number(combatant.level)) && combatant.level > 0) {
        lines.push("Level: " + combatant.level);
    }

    lines.push(
        "HP: " + formatCombatStat(combatant.hp) + " / " + formatCombatStat(combatant.maxHp),
        "Mana: " + formatCombatStat(combatant.mana) + " / " + formatCombatStat(combatant.maxMana),
        "SP: " + formatCombatStat(combatant.sp) + " / " + formatCombatStat(combatant.maxSp),
        "Attack: " + formatCombatStat(attack),
        "Defence: " + formatCombatStat(defence),
        "Attack speed: " + formatCombatSeconds(interval),
        "Hit: " + formatCombatStat(hit) + "%",
        "Crit: " + formatCombatStat(crit) + "%"
    );

    return lines.join("\n");
}

function ensureCombatOverlay() {
    let overlay = document.getElementById("combatoverlay");
    if (overlay) return overlay;

    const parent = document.getElementById("actionplace") || document.body;
    overlay = document.createElement("div");
    overlay.id = "combatoverlay";
    overlay.className = "combatoverlay";

    const panel = document.createElement("div");
    panel.className = "combat-panel";

    const title = document.createElement("div");
    title.className = "combat-title";
    title.innerText = "Combat";
    panel.appendChild(title);

    const arena = document.createElement("div");
    arena.className = "combat-arena";

    const createFighter = function (side, imageId, nameId, hpId, statsId) {
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

        const hpBar = document.createElement("div");
        hpBar.className = "combat-hpbar";
        const hpFill = document.createElement("div");
        hpFill.id = hpId;
        hpFill.className = "combat-hpfill";
        hpBar.appendChild(hpFill);
        fighter.appendChild(hpBar);

        const stats = document.createElement("div");
        stats.className = "combat-stats";
        stats.id = statsId;
        fighter.appendChild(stats);

        return fighter;
    };

    arena.appendChild(createFighter("player", "combatplayerimage", "combatplayername",
        "combatplayerhp", "combatplayerstats"));

    const vs = document.createElement("div");
    vs.className = "combat-vs";
    vs.innerText = "VS";
    arena.appendChild(vs);

    arena.appendChild(createFighter("enemy", "combatenemyimage", "combatenemyname",
        "combatenemyhp", "combatenemystats"));

    panel.appendChild(arena);

    const result = document.createElement("div");
    result.id = "combatresult";
    result.className = "combatresult";
    panel.appendChild(result);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.id = "combatclosebutton";
    closeButton.className = "combatclosebutton";
    closeButton.innerText = "Close";
    closeButton.style.display = "none";
    closeButton.addEventListener("click", exitCombat);
    panel.appendChild(closeButton);

    overlay.appendChild(panel);
    parent.appendChild(overlay);
    return overlay;
}

function renderCombatOverlay() {
    if (!activeCombat) {
        const overlay = document.getElementById("combatoverlay");
        if (overlay) overlay.style.display = "none";
        return;
    }

    ensureCombatOverlay().style.display = "flex";

    if (activeCombat.player.kind === "player" && typeof player !== "undefined" && player) {
        activeCombat.player.hp = Math.max(0, Number(player.hp) || 0);
        activeCombat.player.maxHp = Math.max(0, Number(player.maxhp) || 0);
        activeCombat.player.mana = Math.max(0, Number(player.mana) || 0);
        activeCombat.player.maxMana = Math.max(0, Number(player.maxmana) || 0);
        activeCombat.player.sp = Math.max(0, Number(player.stamina) || 0);
        activeCombat.player.maxSp = Math.max(0, Number(player.maxstamina) || 0);
    }

    const playerCombatant = activeCombat.player;
    const enemyCombatant = activeCombat.enemy;

    document.getElementById("combatplayername").innerText = playerCombatant.name;
    document.getElementById("combatenemyname").innerText = enemyCombatant.name;
    document.getElementById("combatplayerimage").src = playerCombatant.image;
    document.getElementById("combatenemyimage").src = enemyCombatant.image;
    document.getElementById("combatplayerstats").textContent = getCombatStatsText(playerCombatant);
    document.getElementById("combatenemystats").textContent = getCombatStatsText(enemyCombatant);

    const playerHp = playerCombatant.maxHp > 0 ? playerCombatant.hp / playerCombatant.maxHp : 0;
    const enemyHp = enemyCombatant.maxHp > 0 ? enemyCombatant.hp / enemyCombatant.maxHp : 0;
    document.getElementById("combatplayerhp").style.width =
        Math.max(0, Math.min(100, playerHp * 100)) + "%";
    document.getElementById("combatenemyhp").style.width =
        Math.max(0, Math.min(100, enemyHp * 100)) + "%";

    const result = document.getElementById("combatresult");
    if (activeCombat.finished) {
        result.textContent = activeCombat.result
            ? "Victory!"
            : "Defeat...";
    } else {
        result.textContent = "";
    }

    const closeButton = document.getElementById("combatclosebutton");
    if (closeButton) {
        closeButton.style.display = activeCombat.finished ? "inline-block" : "none";
    }
}

function logCombat(message) {
    if (typeof logMessage !== "function") return;
    logMessage(message);
}

function finishCombat(victory) {
    if (!activeCombat || activeCombat.finished) return;

    activeCombat.finished = true;
    activeCombat.result = !!victory;

    if (victory) {
        logCombat(activeCombat.enemy.name + " is defeated. You win!");
        addCombatSkillExp("tactics", 5);
        addCombatSkillExp("anatomy", 5);
        addCombatSkillExp("dodging", 2);
        addCombatSkillExp("bullseye", 2);

        dropMobLoot(activeCombat.enemy);

        if (activeCombat.enemy.id === "bombchick") {
            const explosionDamage = roundCombatDamage(activeCombat.enemy.maxHp / 2);
            activeCombat.player.hp = Math.max(
                0,
                roundCombatDamage(activeCombat.player.hp - explosionDamage)
            );
            if (typeof player !== "undefined" && player) {
                player.hp = activeCombat.player.hp;
            }
            logCombat("Bomb chick explodes! You take "
                + formatCombatStat(explosionDamage) + " damage.");
        }
    } else {
        logCombat("You were defeated by " + activeCombat.enemy.name + ".");
    }

    renderCombatOverlay();
    if (typeof refreshActionButtons === "function") refreshActionButtons();

    const combatSnapshot = activeCombat;
    if (combatSnapshot.autoCloseTimer) clearTimeout(combatSnapshot.autoCloseTimer);
    combatSnapshot.autoCloseTimer = setTimeout(function () {
        if (activeCombat === combatSnapshot) exitCombat();
    }, COMBAT_AUTO_CLOSE_DELAY_MS);
}

function applyMobAttackHeal(attacker) {
    if (!attacker || attacker.kind !== "mob") return;
    const fraction = Number(attacker.healOnAttack);
    if (!Number.isFinite(fraction) || fraction <= 0) return;
    if (attacker.hp >= attacker.maxHp) return;

    const heal = Math.max(0.01, roundCombatDamage(attacker.maxHp * fraction));
    attacker.hp = Math.min(
        attacker.maxHp,
        roundCombatDamage(attacker.hp + heal)
    );
    logCombat(attacker.name + " regenerates "
        + formatCombatStat(heal) + " HP.");
}

function performCombatAttack(attacker, defender) {
    if (!activeCombat || activeCombat.finished) return;

    applyMobAttackHeal(attacker);

    const hitChance = getCombatHitChance(attacker, defender);
    if (Math.random() * 100 >= hitChance) {
        logCombat(attacker.name + " misses " + defender.name + ".");
        if (attacker.kind === "mob" && defender.kind === "player") {
            addCombatSkillExp("dodging", 1);
        }
        return;
    }

    const crit = Math.random() < getCombatCritChance(attacker);
    const attack = getCombatAttack(attacker);
    const defence = getCombatDefence(defender);
    const multiplier = crit ? getCombatCritMultiplier(attacker) : 1;
    const damage = Math.max(1, roundCombatDamage(attack * multiplier - defence));

    defender.hp = Math.max(0, roundCombatDamage(defender.hp - damage));

    if (defender.kind === "player" && typeof player !== "undefined" && player) {
        player.hp = defender.hp;
    }

    if (attacker.kind === "player") {
        addCombatSkillExp("tactics", 1);
        addCombatSkillExp("anatomy", 1);
        if (crit) addCombatSkillExp("bullseye", 2);
    }

    if (attacker.kind === "mob" && attacker.id === "assspider") {
        applyAssPoison(damage);
    }

    logCombat(attacker.name + " hits " + defender.name + " for "
        + formatCombatStat(damage) + " damage."
        + (crit ? " Critical!" : ""));

    if (defender.hp <= 0) {
        finishCombat(defender.kind === "mob");
    }
}

function roundCombatDamage(value) {
    return typeof round2 === "function" ? round2(value) : value;
}

function updateCombat(diff) {
    if (!activeCombat || activeCombat.finished) {
        if (activeCombat) renderCombatOverlay();
        return;
    }

    if (typeof player !== "undefined" && player) {
        activeCombat.player.hp = Math.max(0, Number(player.hp) || 0);
    }

    if (activeCombat.player.hp <= 0) {
        finishCombat(false);
        return;
    }
    if (activeCombat.enemy.hp <= 0) {
        finishCombat(true);
        return;
    }

    const elapsedMs = Math.max(0, Number(diff) || 0) * 1000;
    activeCombat.player.attackTimerMs += elapsedMs;
    activeCombat.enemy.attackTimerMs += elapsedMs;

    const playerInterval = getCombatAttackIntervalMs(activeCombat.player);
    const enemyInterval = getCombatAttackIntervalMs(activeCombat.enemy);

    let guard = 0;
    while (!activeCombat.finished && guard < 1000) {
        guard += 1;
        const playerReady = activeCombat.player.attackTimerMs >= playerInterval;
        const enemyReady = activeCombat.enemy.attackTimerMs >= enemyInterval;

        if (!playerReady && !enemyReady) break;

        if (playerReady && (!enemyReady
            || activeCombat.player.attackTimerMs - playerInterval
                <= activeCombat.enemy.attackTimerMs - enemyInterval)) {
            activeCombat.player.attackTimerMs -= playerInterval;
            performCombatAttack(activeCombat.player, activeCombat.enemy);
        } else {
            activeCombat.enemy.attackTimerMs -= enemyInterval;
            performCombatAttack(activeCombat.enemy, activeCombat.player);
        }
    }

    renderCombatOverlay();
}

function enterCombat(mobId) {
    if (activeCombat) return false;
    if (typeof player === "undefined" || !player || Number(player.hp) <= 0) {
        if (typeof logMessage === "function") logMessage("You are in no shape to fight.");
        return false;
    }
    if (typeof isTraveling === "function" && isTraveling()) {
        if (typeof logMessage === "function") logMessage("You cannot fight while travelling.");
        return false;
    }

    if (typeof stopActiveTimedActions === "function") stopActiveTimedActions();
    if (typeof closeMapTravelDialog === "function") closeMapTravelDialog();

    const resolvedMobId = mobId && MOBS[mobId] ? mobId : getRandomMobId();

    activeCombat = {
        player: createPlayerCombatant(),
        enemy: createMobCombatant(resolvedMobId),
        finished: false,
        result: false,
        autoCloseTimer: null,
    };

    logCombat("You enter combat with " + activeCombat.enemy.name + ".");
    ensureCombatOverlay();
    renderCombatOverlay();
    if (typeof refreshActionButtons === "function") refreshActionButtons();
    return true;
}

function exitCombat() {
    if (!activeCombat) return;
    if (activeCombat.autoCloseTimer) {
        clearTimeout(activeCombat.autoCloseTimer);
    }
    activeCombat = null;

    const overlay = document.getElementById("combatoverlay");
    if (overlay) overlay.remove();

    // There is no separate death screen yet. Keep the character playable
    // after a defeat instead of leaving the HP bar at zero.
    if (typeof player !== "undefined" && player && Number(player.hp) <= 0) {
        player.hp = 1;
        if (typeof logMessage === "function") {
            logMessage("You barely survive the fight.");
        }
    }

    if (typeof refreshActionButtons === "function") refreshActionButtons();
    if (typeof updateGUI === "function") updateGUI();
}
