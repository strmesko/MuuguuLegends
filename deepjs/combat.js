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
const SPIRIT_SPEAK_COOLDOWN_MS = 3000;
const MOB_LEVEL_STAT_MULTIPLIER = 1.05;
const ASS_POISON_DURATION_SECONDS = 30;
const ASS_POISON_DAMAGE_PER_STACK_PER_SECOND = 0.05;
const ASS_POISON_MAX_STACKS = 50;
// Player-applied poison and weaken, granted by combat equipment.
const MOB_POISON_DURATION_SECONDS = 10;
const MOB_POISON_STACKS_PER_HIT = 2;
const MOB_POISON_DAMAGE_PER_STACK_PER_SECOND = 0.25;
const MOB_POISON_MAX_STACKS = 40;
const MOB_WEAKEN_MAX_STACKS = 5;
const MOB_WEAKEN_PER_STACK = 0.05;

var assPoisonStacks = 0;
var assPoisonRemaining = 0;

// Prefixes used by forced drama fights. Each one boosts a single combat
// attribute and is shown in front of the mob name, e.g. "Fat Fierce Catterpuwa".
const MOB_PREFIXES = Object.freeze({
    fat: Object.freeze({ id: "fat", name: "Fat", hp: 2.5 }),
    fierce: Object.freeze({ id: "fierce", name: "Fierce", attackSpeed: 0.5 }),
    brute: Object.freeze({ id: "brute", name: "Brute", attack: 1.75 }),
    armored: Object.freeze({ id: "armored", name: "Armored", armor: 2.5 }),
    precise: Object.freeze({ id: "precise", name: "Precise", hitBonus: 25 }),
    cruel: Object.freeze({ id: "cruel", name: "Cruel", critBonus: 25 }),
    elusive: Object.freeze({ id: "elusive", name: "Elusive", fleeMultiplier: 2 }),
    mighty: Object.freeze({ id: "mighty", name: "Mighty", stat: "str", statMultiplier: 2 }),
    nimble: Object.freeze({ id: "nimble", name: "Nimble", stat: "agi", statMultiplier: 2 }),
    hardy: Object.freeze({ id: "hardy", name: "Hardy", stat: "vit", statMultiplier: 2 }),
    keen: Object.freeze({ id: "keen", name: "Keen", stat: "ins", statMultiplier: 2 }),
    lucky: Object.freeze({ id: "lucky", name: "Lucky", stat: "luck", statMultiplier: 2 }),
    swift: Object.freeze({ id: "swift", name: "Swift", stat: "speed", statMultiplier: 2 }),
});

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
    hungryghost: Object.freeze({
        id: "hungryghost",
        name: "Hungry ghost",
        description: "A restless spirit with an endless appetite.",
        image: "images/combat/mobs/hungryghost.png",
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
        hp: 2.4,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS,
        fleeMultiplier: 5,
        hungerOnAttack: 1,
    }),
    trunk: Object.freeze({
        id: "trunk",
        name: "Trunk",
        description: "A rotten tree stump with arms and legs, still very much alive.",
        image: "images/combat/mobs/trunk.png",
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
        hp: 48,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 1,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS,
    }),
    meatstump: Object.freeze({
        id: "meatstump",
        name: "MeatStump",
        description: "A huge cube of raw meat balanced on two legs. A hungry maw splits its front.",
        image: "images/combat/mobs/meatstump.png",
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
        hp: 96,
        mana: 0,
        sp: 4,
        attack: 0.2,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS,
    }),
    cowass: Object.freeze({
        id: "cowass",
        name: "CowAss",
        description: "A cow's rear end balanced on two hind legs. No head, no torso, only beef and bad intentions.",
        image: "images/combat/mobs/cowass.png",
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
        hp: 72,
        mana: 0,
        sp: 4,
        attack: 0.3,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS / 2,
    }),
    boar: Object.freeze({
        id: "boar",
        name: "Boar",
        description: "A blocky boar with a perfectly cubic snout and absurdly tiny legs. It charges with surprising force.",
        image: "images/combat/mobs/boar.png",
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
        hp: 72,
        mana: 0,
        sp: 4,
        attack: 0.6,
        armor: 0.5,
        attackSpeedMs: COMBAT_ATTACK_SPEED_BASE_MS / 3,
        hitMultiplier: 0.5,
    }),
});

function getMobYearLevelBonus() {
    if (typeof gameTime === "undefined"
        || typeof gameMinutesToDateTime !== "function") {
        return 0;
    }
    const dateTime = gameMinutesToDateTime(gameTime.totalMinutes);
    const startYear = typeof GAME_START_YEAR !== "undefined"
        ? Number(GAME_START_YEAR) || 0
        : 0;
    return Math.max(0, Math.floor((Number(dateTime.year) || 0) - startYear));
}

function getMobLevelForTile(x, y) {
    const start = typeof getStartCoordinates === "function"
        ? getStartCoordinates()
        : { x: 0, y: 0 };
    const dx = (Number(x) || 0) - start.x;
    const dy = (Number(y) || 0) - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return 1
        + Math.max(0, Math.floor(distance))
        + getMobYearLevelBonus();
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
        Object.freeze({ resourceId: RESOURCE_IDS.EGG, amount: 1, chance: 0.3 }),
    ]),
    bombchick: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.CHICKEN_MEAT, amount: 1 }),
        Object.freeze({ resourceId: RESOURCE_IDS.EGG, amount: 1, chance: 0.3 }),
    ]),
    assspider: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.BUG_MEAT, amount: 1 }),
    ]),
    jellopa: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.JELLY, amount: 1 }),
    ]),
    hungryghost: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.SPIRIT_ASPIC, amount: 1 }),
    ]),
    trunk: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.STICKS, amount: 5 }),
        Object.freeze({ resourceId: RESOURCE_IDS.WOODEN_LOGS, amount: 1 }),
    ]),
    meatstump: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.MYSTERY_MEAT, amount: 3 }),
    ]),
    cowass: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.BEEF, amount: 4 }),
    ]),
    boar: Object.freeze([
        Object.freeze({ resourceId: RESOURCE_IDS.BOAR_MEAT, amount: 7 }),
    ]),
});

function getMobLootQuality(combatant) {
    const level = Math.max(1, Math.floor(Number(combatant && combatant.level) || 1));
    return Math.pow(level, 1.1);
}

const MOB_SPIRIT_DROP_REQUIREMENTS = Object.freeze([
    Object.freeze({ resourceId: RESOURCE_IDS.MOB_SPIRIT_DROPS, requiredLevel: 1 }),
    Object.freeze({ resourceId: RESOURCE_IDS.MOB_SPIRIT_PART, requiredLevel: 16 }),
    Object.freeze({ resourceId: RESOURCE_IDS.MOB_SPIRIT_TEARS, requiredLevel: 30 }),
    Object.freeze({ resourceId: RESOURCE_IDS.MINOR_MOB_SPIRIT, requiredLevel: 45 }),
    Object.freeze({ resourceId: RESOURCE_IDS.MEDIUM_MOB_SPIRIT, requiredLevel: 60 }),
    Object.freeze({ resourceId: RESOURCE_IDS.BIG_MOB_SPIRIT, requiredLevel: 75 }),
    Object.freeze({ resourceId: RESOURCE_IDS.GRAND_MOB_SPIRIT, requiredLevel: 90 }),
]);

function getMobSpiritDropChance(level, requiredLevel) {
    const current = Math.max(1, Math.floor(Number(level) || 1));
    const required = Math.max(1, Math.floor(Number(requiredLevel) || 1));
    if (current < required) return 0;
    return Math.min(1, (1 + (current - required)) / 100);
}

function dropMobSpiritResources(combatant) {
    if (!combatant || typeof addResource !== "function") return;

    const level = Math.max(1, Math.floor(Number(combatant.level) || 1));
    const quality = getMobLootQuality(combatant);

    MOB_SPIRIT_DROP_REQUIREMENTS.forEach(function (entry) {
        if (level < entry.requiredLevel) return;
        const chance = getMobSpiritDropChance(level, entry.requiredLevel);
        if (chance <= 0 || Math.random() >= chance) return;

        addResource(entry.resourceId, 1, quality);
        const definition = typeof RESOURCE_DEFS !== "undefined"
            ? RESOURCE_DEFS[entry.resourceId]
            : null;
        const name = definition ? definition.name : "mob spirit";
        logCombat("You gather " + name + " x1 (Q"
            + formatCombatStat(quality) + ").");
    });
}

function dropMobLoot(combatant) {
    if (!combatant || typeof addResource !== "function") return;

    const drops = MOB_LOOT[combatant.id] || [];
    if (!drops.length) return;

    const quality = getMobLootQuality(combatant);
    const amountMultiplier = 1 + getCombatGearStat("lootAmount") / 100;
    // Loot chance grants one extra full drop roll.
    const rolls = 1 + (rollCombatGearChance("lootChance") ? 1 : 0);

    for (let roll = 0; roll < rolls; roll++) {
        drops.forEach(function (drop) {
            const chance = Number(drop.chance);
            if (Number.isFinite(chance) && chance > 0
                && Math.random() >= Math.min(1, chance)) {
                return;
            }

            const amount = Math.max(
                1,
                roundCombatDamage(drop.amount * amountMultiplier)
            );
            addResource(drop.resourceId, amount, quality);

            const definition = typeof RESOURCE_DEFS !== "undefined"
                ? RESOURCE_DEFS[drop.resourceId]
                : null;
            const name = definition ? definition.name : "resource";
            logCombat("You gather " + name + " x" + formatCombatStat(amount)
                + " (Q" + formatCombatStat(quality) + ").");
        });
    }
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

// Combat-only equipment stats, flat or in percentage points (10 = +10%).
function getCombatGearStat(key) {
    if (typeof getEquippedStatBonus !== "function") return 0;
    return Math.max(0, Number(getEquippedStatBonus(key)) || 0);
}

function rollCombatGearChance(key) {
    const chance = getCombatGearStat(key);
    return chance > 0 && Math.random() * 100 < chance;
}

// Weapon skills trained by the items held in arm1/arm2. Every level adds 1%
// damage and 1 hit while such an item is equipped. Dual-wielding the same
// weapon type doubles experience gain only, not the bonus itself.
const WEAPON_SKILL_KEYS = Object.freeze([
    "axechopping", "swordsswingin", "knifesstabbing",
    "spearsspooning", "brawlbaps", "hammerscrushworks",
]);

function getEquippedWeaponSkillKeys() {
    const equipment = typeof player !== "undefined" && player
        ? player.equipment
        : null;

    return ["arm1", "arm2"].map(function (slot) {
        const item = equipment ? equipment[slot] : null;
        const skill = item && typeof getItemWeaponSkill === "function"
            ? getItemWeaponSkill(item)
            : null;
        return WEAPON_SKILL_KEYS.indexOf(skill) !== -1 ? skill : null;
    });
}

function getPlayerWeaponSkillInfo() {
    const equipped = getEquippedWeaponSkillKeys();
    const held = equipped.filter(Boolean);
    const keys = held.length
        ? held.filter(function (key, index) {
            return held.indexOf(key) === index;
        })
        : ["brawlbaps"];

    let level = 0;
    keys.forEach(function (key) {
        level += getPlayerCombatSkillLevel(key);
    });

    return {
        equipped: equipped,
        held: held,
        keys: keys,
        level: level,
        sameSkill: held.length === 2 && held[0] === held[1],
    };
}

function getPlayerCombatSkillLevel(key) {
    if (typeof getEffectiveLevel !== "function") return 0;
    return Math.max(0, Number(getEffectiveLevel(key)) || 0);
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

    const base = ((strength + vitality / 5) + getCombatantGearAttack(combatant))
        * (1 + tactics / 5 + anatomy / 2);

    if (combatant && combatant.kind === "player") {
        const percent = getCombatGearStat("attackPercent");
        return base
            * (1 + getPlayerWeaponSkillInfo().level / 100)
            * (1 + percent / 100);
    }

    // Weaken stacks from the player's defensive gear reduce mob damage.
    const weaken = Math.max(0, Number(combatant && combatant.weakenStacks) || 0);
    if (weaken > 0) {
        return base * Math.max(0.5, 1 - weaken * MOB_WEAKEN_PER_STACK);
    }

    return base;
}

function getCombatDefence(combatant) {
    const vitality = getCombatantStat(combatant, "vit");
    const tactics = getCombatantSkill(combatant, "tactics");
    let defence = getCombatantGearDefence(combatant)
        * (vitality * (1 + tactics / 100));

    if (combatant && combatant.kind === "player") {
        defence *= 1 + getCombatGearStat("defencePercent") / 100;
    }

    return defence;
}

function getCombatFlee(combatant) {
    const base = 10
        + getCombatantStat(combatant, "agi")
        + getCombatantStat(combatant, "speed") / 2
        + getCombatantSkill(combatant, "tactics")
        + getCombatantSkill(combatant, "dodging");
    const multiplier = Number(combatant && combatant.fleeMultiplier);
    let total = base * (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1);

    // Dodge dancing adds a flat 2 flee per level.
    if (combatant && combatant.kind === "player") {
        total += 2 * getPlayerCombatSkillLevel("dodgedancing");
        total += getCombatGearStat("flee");
    }

    return total;
}

// Raw hit stat before the defender's flee is subtracted.
function getCombatBaseHit(combatant) {
    const base = 100
        + (Number(combatant && combatant.hitBonus) || 0)
        + (getCombatantStat(combatant, "agi") * 2
            + getCombatantStat(combatant, "ins")
            + getCombatantSkill(combatant, "tactics"));
    const multiplier = Number(combatant && combatant.hitMultiplier);
    return base * (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1);
}

function getCombatHitChance(attacker, defender) {
    let chance = getCombatBaseHit(attacker) - getCombatFlee(defender);

    // Weapon skills add 1 hit per level.
    if (attacker && attacker.kind === "player") {
        chance += getPlayerWeaponSkillInfo().level;
        chance += getCombatGearStat("hit");
    }

    return Math.max(5, Math.min(100, chance));
}

function getCombatCritChance(attacker) {
    const numerator = getCombatantStat(attacker, "luck")
        + (Number(attacker && attacker.critBonus) || 0)
        + getCombatantSkill(attacker, "tactics") / 5
        + getCombatantSkill(attacker, "bullseye");
    const denominator = 100 + numerator;
    let chance = denominator > 0
        ? Math.max(0, Math.min(0.95, numerator / denominator))
        : 0;

    // Critomancy: (CritChance + Critomancy) / MAX(1, Critomancy), where every
    // Critomancy level is 0.01 of the chance.
    if (attacker && attacker.kind === "player") {
        const critomancy = getPlayerCombatSkillLevel("critomancy") / 100;
        if (critomancy > 0) {
            chance = (chance + critomancy) / Math.max(1, critomancy);
        }
        chance += getCombatGearStat("critChance") / 100;
    }

    return Math.max(0, Math.min(0.95, chance));
}

function getCombatCritMultiplier(attacker) {
    let bonus = getCombatantSkill(attacker, "bullseye")
        + getCombatantStat(attacker, "ins");

    // Critomancy adds 1% critical damage per level.
    if (attacker && attacker.kind === "player") {
        bonus += getPlayerCombatSkillLevel("critomancy");
        bonus += getCombatGearStat("critDamage");
    }

    return 1.5 + bonus / 100;
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

function createMobCombatant(mobId, level, prefixes) {
    const def = MOBS[mobId] || MOBS.catterpuwa;
    const tileX = typeof currentTile !== "undefined" && currentTile
        ? currentTile.x
        : 0;
    const tileY = typeof currentTile !== "undefined" && currentTile
        ? currentTile.y
        : 0;
    const mobLevel = Number.isFinite(Number(level))
        ? Math.max(1, Math.floor(Number(level)))
        : Math.max(
            1,
            getMobLevelForTile(tileX, tileY)
                + Math.floor(getCombatGearStat("mobLevelBonus"))
        );
    const multiplier = getMobLevelMultiplier(mobLevel);
    const stats = {};
    const skills = {};

    COMBAT_STAT_KEYS.forEach(function (key) {
        stats[key] = (Number(def.stats[key]) || 0) * multiplier;
    });
    COMBAT_SKILL_KEYS.forEach(function (key) {
        skills[key] = Number(def.skills && def.skills[key]) || 0;
    });

    const prefixIds = normalizeMobPrefixes(prefixes);
    const prefixDefs = prefixIds.map(function (id) {
        return MOB_PREFIXES[id];
    });

    let hp = Math.max(0, (Number(def.hp) || 0) * multiplier);
    let attack = Math.max(0, (Number(def.attack) || 0) * multiplier);
    let armor = Math.max(0, (Number(def.armor) || 0) * multiplier);
    let attackSpeedMs = Math.max(100,
        Number(def.attackSpeedMs) || COMBAT_ATTACK_SPEED_BASE_MS);
    let fleeMultiplier = Math.max(0, Number(def.fleeMultiplier) || 1);
    let hitBonus = 0;
    let critBonus = 0;

    prefixDefs.forEach(function (prefix) {
        if (!prefix) return;
        if (Number(prefix.hp) > 0) hp *= Number(prefix.hp);
        if (Number(prefix.attack) > 0) attack *= Number(prefix.attack);
        if (Number(prefix.armor) > 0) armor *= Number(prefix.armor);
        if (Number(prefix.attackSpeed) > 0) {
            attackSpeedMs = Math.max(100, attackSpeedMs * Number(prefix.attackSpeed));
        }
        if (prefix.stat && Number(prefix.statMultiplier) > 0) {
            const key = prefix.stat;
            stats[key] = (Number(stats[key]) || 0) * Number(prefix.statMultiplier);
        }
        hitBonus += Number(prefix.hitBonus) || 0;
        critBonus += Number(prefix.critBonus) || 0;
        if (Number(prefix.fleeMultiplier) > 0) {
            fleeMultiplier *= Number(prefix.fleeMultiplier);
        }
    });

    const namePrefix = prefixDefs.map(function (prefix) {
        return prefix.name;
    }).join(" ");

    return {
        kind: "mob",
        id: def.id,
        name: (namePrefix ? namePrefix + " " : "") + def.name + " Lv " + mobLevel,
        baseName: def.name,
        prefixes: prefixIds,
        level: mobLevel,
        levelMultiplier: multiplier,
        description: def.description,
        image: def.image,
        stats: stats,
        skills: skills,
        hp: hp,
        maxHp: hp,
        mana: Math.max(0, (Number(def.mana) || 0) * multiplier),
        maxMana: Math.max(0, (Number(def.mana) || 0) * multiplier),
        sp: Math.max(0, (Number(def.sp) || 0) * multiplier),
        maxSp: Math.max(0, (Number(def.sp) || 0) * multiplier),
        attack: attack,
        armor: armor,
        hitBonus: hitBonus,
        critBonus: critBonus,
        hitMultiplier: Math.max(0, Number(def.hitMultiplier) || 1),
        healOnAttack: Math.max(0, Number(def.healOnAttack) || 0),
        fleeMultiplier: fleeMultiplier,
        hungerOnAttack: Math.max(0, Number(def.hungerOnAttack) || 0),
        attackSpeedMs: attackSpeedMs,
        attackTimerMs: 0,
    };
}

function normalizeMobPrefixes(prefixes) {
    if (!prefixes) return [];

    const list = Array.isArray(prefixes) ? prefixes : [prefixes];
    const seen = {};

    return list.map(function (entry) {
        if (entry && typeof entry === "object" && entry.id) return entry.id;
        return entry;
    }).map(function (entry) {
        return String(entry || "").toLowerCase();
    }).filter(function (key) {
        if (!MOB_PREFIXES[key] || seen[key]) return false;
        seen[key] = true;
        return true;
    });
}

function addCombatSkillExp(key, amount) {
    if (typeof player === "undefined" || !player || !player[key]) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    if (typeof player[key].addexp === "function") player[key].addexp(value);
}

// Weapon experience follows the damage dealt. Holding two items of the same
// weapon skill doubles the gain.
function grantWeaponSkillExp(damage) {
    const amount = Math.max(0, Number(damage) || 0);
    if (amount <= 0) return;

    const info = getPlayerWeaponSkillInfo();
    const multiplier = info.sameSkill ? 2 : 1;
    info.keys.forEach(function (key) {
        addCombatSkillExp(key, amount * multiplier);
    });
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

    // Reserved space for active combat skills. Buttons are added here as
    // skills are implemented, so the layout never jumps around.
    const skillsBar = document.createElement("div");
    skillsBar.id = "combatskills";
    skillsBar.className = "combat-skills";
    panel.appendChild(skillsBar);

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

    renderCombatSkillButtons();
}

// --- active combat skills ---------------------------------------------------

function getSpiritSpeakPower() {
    const soul = typeof getEffectiveLevel === "function"
        ? Math.max(0, Number(getEffectiveLevel("sou")) || 0)
        : 0;
    const skill = typeof getEffectiveLevel === "function"
        ? Math.max(0, Number(getEffectiveLevel("spiritspeak")) || 0)
        : 0;
    return Math.sqrt(soul + skill);
}

function getSpiritSpeakHeal() {
    return roundCombatDamage(getSpiritSpeakPower());
}

function getSpiritSpeakManaCost() {
    return roundCombatDamage(getSpiritSpeakPower() * 3);
}

function renderCombatSkillButtons() {
    const container = document.getElementById("combatskills");
    if (!container) return;

    let button = document.getElementById("combatskillspiritspeak");
    if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.id = "combatskillspiritspeak";
        button.className = "combatskillbutton";
        button.addEventListener("click", function (event) {
            event.preventDefault();
            castSpiritSpeak();
        });
        container.appendChild(button);
    }

    if (!activeCombat) {
        button.disabled = true;
        return;
    }

    const cooldownMs = Math.max(0, Number(activeCombat.spiritSpeakCooldownMs) || 0);
    const cost = getSpiritSpeakManaCost();
    const hp = Math.max(0, Number(player && player.hp) || 0);
    const maxHp = Math.max(0, Number(player && player.maxhp) || 0);

    button.disabled = activeCombat.finished
        || cooldownMs > 0
        || hp <= 0
        || hp >= maxHp;
    button.innerText = cooldownMs > 0
        ? "Spirit Speak (" + Math.ceil(cooldownMs / 1000) + "s)"
        : "Spirit Speak (" + formatCombatStat(cost) + " mana)";
    button.setAttribute("data-tooltip",
        "Heals " + formatCombatStat(getSpiritSpeakHeal()) + " HP"
        + "<br>Mana cost: " + formatCombatStat(cost)
        + "<br>Cooldown: " + Math.round(SPIRIT_SPEAK_COOLDOWN_MS / 1000) + "s");
}

function castSpiritSpeak() {
    if (!activeCombat || activeCombat.finished) return false;
    if (typeof player === "undefined" || !player) return false;

    const cooldownMs = Math.max(0, Number(activeCombat.spiritSpeakCooldownMs) || 0);
    if (cooldownMs > 0) return false;

    const cost = getSpiritSpeakManaCost();
    const maxHp = Math.max(0, Number(player.maxhp) || 0);
    const before = Math.max(0, Number(player.hp) || 0);
    if (before <= 0 || before >= maxHp) return false;

    player.hp = Math.min(maxHp, roundCombatDamage(before + getSpiritSpeakHeal()));
    const healed = roundCombatDamage(player.hp - before);
    const spend = typeof spendPlayerMana === "function"
        ? spendPlayerMana(cost)
        : {
            after: roundCombatDamage(
                Math.max(0, (Number(player.mana) || 0) - cost)
            ),
        };
    player.mana = spend.after;

    if (activeCombat.player) {
        activeCombat.player.hp = player.hp;
        activeCombat.player.mana = player.mana;
    }

    activeCombat.spiritSpeakCooldownMs = SPIRIT_SPEAK_COOLDOWN_MS;

    logCombat("You speak with spirits and heal "
        + formatCombatStat(healed) + " hp");

    if (typeof updateGUI === "function") updateGUI();
    renderCombatOverlay();
    return true;
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
        dropMobSpiritResources(activeCombat.enemy);

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
    if (!victory && typeof checkPlayerDeath === "function") {
        checkPlayerDeath("You were defeated by "
            + activeCombat.enemy.name + ".");
    }

    const combatSnapshot = activeCombat;
    if (combatSnapshot.autoCloseTimer) clearTimeout(combatSnapshot.autoCloseTimer);

    const instantVictoryClose = victory
        && typeof FAUNA_BULLY_TECHNOLOGY !== "undefined"
        && FAUNA_BULLY_TECHNOLOGY.level >= 5;
    if (instantVictoryClose) {
        exitCombat();
        return;
    }

    combatSnapshot.autoCloseTimer = setTimeout(function () {
        if (activeCombat === combatSnapshot) exitCombat();
    }, COMBAT_AUTO_CLOSE_DELAY_MS);
}

function applyMobAttackEffects(attacker) {
    if (!attacker || attacker.kind !== "mob") return;

    const fraction = Number(attacker.healOnAttack);
    if (Number.isFinite(fraction) && fraction > 0 && attacker.hp < attacker.maxHp) {
        const heal = Math.max(0.01, roundCombatDamage(attacker.maxHp * fraction));
        attacker.hp = Math.min(
            attacker.maxHp,
            roundCombatDamage(attacker.hp + heal)
        );
        logCombat(attacker.name + " regenerates "
            + formatCombatStat(heal) + " HP.");
    }

    const hungerFactor = Number(attacker.hungerOnAttack);
    if (Number.isFinite(hungerFactor) && hungerFactor > 0
        && typeof addHunger === "function") {
        const hunger = getCombatAttack(attacker) * hungerFactor;
        if (hunger > 0) {
            addHunger(hunger);
            logCombat(attacker.name + " drains your fullness ("
                + formatCombatStat(hunger) + " hunger).");
        }
    }
}

// Equipment effects that trigger when the player lands a hit.
function applyPlayerOnHitEffects(target) {
    if (!target || target.kind !== "mob") return;

    if (rollCombatGearChance("poisonOnHit")) {
        target.poisonStacks = Math.min(
            MOB_POISON_MAX_STACKS,
            (Number(target.poisonStacks) || 0) + MOB_POISON_STACKS_PER_HIT
        );
        target.poisonRemaining = MOB_POISON_DURATION_SECONDS;
        logCombat(target.name + " is poisoned ("
            + target.poisonStacks + " stacks).");
    }
}

// Equipment effects that trigger when a mob lands a hit on the player.
function applyPlayerDefenceEffects(attacker) {
    if (!attacker || attacker.kind !== "mob") return;

    if (rollCombatGearChance("weakenOnDefend")) {
        attacker.weakenStacks = Math.min(
            MOB_WEAKEN_MAX_STACKS,
            (Number(attacker.weakenStacks) || 0) + 1
        );
        logCombat(attacker.name + " is weakened ("
            + attacker.weakenStacks + " stacks).");
    }
}

function updateMobPoison(enemy, seconds) {
    if (!enemy) return;

    const stacks = Number(enemy.poisonStacks) || 0;
    const remaining = Number(enemy.poisonRemaining) || 0;
    if (stacks <= 0 || remaining <= 0) return;

    const elapsed = Math.max(0, Number(seconds) || 0);
    const activeSeconds = Math.min(elapsed, remaining);
    const damage = roundCombatDamage(
        stacks * MOB_POISON_DAMAGE_PER_STACK_PER_SECOND * activeSeconds
    );

    if (damage > 0) {
        enemy.hp = Math.max(0, roundCombatDamage(enemy.hp - damage));
    }

    enemy.poisonRemaining = Math.max(0, remaining - elapsed);
    if (enemy.poisonRemaining <= 0) enemy.poisonStacks = 0;
}

function performCombatAttack(attacker, defender, options) {
    if (!activeCombat || activeCombat.finished) return;

    const settings = options || {};

    applyMobAttackEffects(attacker);

    const hitChance = getCombatHitChance(attacker, defender);
    if (Math.random() * 100 >= hitChance) {
        logCombat(attacker.name + " misses " + defender.name + ".");
        if (attacker.kind === "mob" && defender.kind === "player") {
            addCombatSkillExp("dodging", 1);
            // Dodge dancing trains from the attacker's raw hit stat.
            addCombatSkillExp("dodgedancing", getCombatBaseHit(attacker));
            if (typeof player !== "undefined" && player && player.agi) {
                player.agi.addexp(hitChance);
            }
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
        if (player.vit) player.vit.addexp(damage);
    }

    if (attacker.kind === "player") {
        addCombatSkillExp("tactics", 1);
        addCombatSkillExp("anatomy", 1);
        if (crit) addCombatSkillExp("bullseye", 2);
        grantWeaponSkillExp(damage);
        if (typeof player !== "undefined" && player && player.str) {
            player.str.addexp(damage);
        }
    }

    if (attacker.kind === "mob" && attacker.id === "assspider") {
        applyAssPoison(damage);
    }

    logCombat(attacker.name + " hits " + defender.name + " for "
        + formatCombatStat(damage) + " damage."
        + (crit ? " Critical!" : ""));

    if (attacker.kind === "player") {
        applyPlayerOnHitEffects(defender);
    } else if (attacker.kind === "mob" && defender.kind === "player") {
        applyPlayerDefenceEffects(attacker);
    }

    // Equipment can grant a free follow-up hit. It never chains further.
    if (attacker.kind === "player"
        && settings.extra !== true
        && defender.hp > 0
        && rollCombatGearChance("doubleAttackChance")) {
        logCombat("Double attack!");
        performCombatAttack(attacker, defender, { extra: true });
        if (!activeCombat || activeCombat.finished) return;
    }

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

    if (activeCombat.spiritSpeakCooldownMs > 0) {
        activeCombat.spiritSpeakCooldownMs = Math.max(
            0,
            activeCombat.spiritSpeakCooldownMs - Math.max(0, Number(diff) || 0) * 1000
        );
    }

    if (typeof tryAutoSpiritSpeak === "function") {
        tryAutoSpiritSpeak();
    }

    if (activeCombat.player.hp <= 0) {
        finishCombat(false);
        return;
    }
    if (activeCombat.enemy.hp <= 0) {
        finishCombat(true);
        return;
    }

    // Equipment poison keeps ticking on the enemy while combat runs.
    updateMobPoison(activeCombat.enemy, Math.max(0, Number(diff) || 0));
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

function getBullyMobLevel() {
    const tile = typeof currentTile !== "undefined" && currentTile
        ? currentTile
        : { x: 0, y: 0 };
    const baseLevel = typeof getMobLevelForTile === "function"
        ? getMobLevelForTile(tile.x, tile.y)
        : 1;
    const gearBonus = typeof getCombatGearStat === "function"
        ? Math.floor(getCombatGearStat("mobLevelBonus"))
        : 0;
    return Math.max(1, baseLevel + gearBonus);
}

function isRestingOrSleepingForCombat() {
    if (typeof actionStates === "undefined") return false;
    return actionStates.rest === Activity.Active
        || actionStates.sleep === Activity.Active;
}

function tryStartBullyCombat() {
    if (typeof FAUNA_BULLY_TECHNOLOGY === "undefined"
        || FAUNA_BULLY_TECHNOLOGY.level < 1) {
        return false;
    }
    if (typeof isHabitEnabled === "function"
        && !isHabitEnabled("bullyLocalFauna")) {
        return false;
    }
    if (typeof offlineSimulationActive !== "undefined" && offlineSimulationActive) {
        return false;
    }
    if (activeCombat || typeof player === "undefined" || !player) return false;
    if (Number(player.hp) <= 0) return false;
    if (Number(player.hp) + 0.01 < Number(player.maxhp)) return false;
    if (typeof isTraveling === "function" && isTraveling()) return false;
    if (isRestingOrSleepingForCombat()) return false;

    // Level 2: never pick a fight above the character's level.
    if (FAUNA_BULLY_TECHNOLOGY.level >= 2
        && getBullyMobLevel() > Math.max(1, Number(player.lvl) || 1)) {
        return false;
    }

    return enterCombat();
}

function tryAutoSpiritSpeak() {
    if (typeof FAUNA_BULLY_TECHNOLOGY === "undefined"
        || FAUNA_BULLY_TECHNOLOGY.level < 3) {
        return false;
    }
    if (typeof isHabitEnabled === "function"
        && !isHabitEnabled("bullyLocalFauna")) {
        return false;
    }
    if (!activeCombat || activeCombat.finished) return false;

    const hp = Math.max(0, Number(player && player.hp) || 0);
    const maxHp = Math.max(0, Number(player && player.maxhp) || 0);
    if (hp <= 0 || maxHp <= 0) return false;

    let shouldCast = false;
    if (FAUNA_BULLY_TECHNOLOGY.level >= 4) {
        shouldCast = hp + getSpiritSpeakHeal() < maxHp;
    } else {
        shouldCast = hp < maxHp / 2;
    }
    if (!shouldCast) return false;

    const mana = Math.max(0, Number(player && player.mana) || 0);
    if (mana < getSpiritSpeakManaCost()) return false;
    return castSpiritSpeak();
}

function enterCombat(mobId, options) {
    if (activeCombat) return false;
    if (typeof player === "undefined" || !player || Number(player.hp) <= 0) {
        if (typeof logMessage === "function") logMessage("You are in no shape to fight.");
        return false;
    }
    if (typeof isTraveling === "function" && isTraveling()) {
        if (typeof logMessage === "function") logMessage("You cannot fight while travelling.");
        return false;
    }

    if (typeof captureCombatResumeActions === "function") {
        captureCombatResumeActions();
    }
    if (typeof stopActiveTimedActions === "function") stopActiveTimedActions();
    if (typeof closeMapTravelDialog === "function") closeMapTravelDialog();

    const resolvedMobId = mobId && MOBS[mobId] ? mobId : getRandomMobId();
    const settings = options && typeof options === "object" ? options : {};

    activeCombat = {
        player: createPlayerCombatant(),
        enemy: createMobCombatant(
            resolvedMobId,
            settings.level,
            settings.prefixes
        ),
        forced: settings.forced === true,
        finished: false,
        result: false,
        autoCloseTimer: null,
        spiritSpeakCooldownMs: 0,
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

    if (typeof resumeCombatPreviousActions === "function"
        && !(typeof playerDeathInProgress !== "undefined" && playerDeathInProgress)) {
        resumeCombatPreviousActions();
    }

    if (typeof refreshActionButtons === "function") refreshActionButtons();
    if (typeof updateGUI === "function") updateGUI();
}
