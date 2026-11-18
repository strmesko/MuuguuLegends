// Death, Limbo and rebirth. This file owns the permanent ascension multiplier
// and the full-screen Limbo screen shown after the character dies.

const ASCENSION_STORAGE_KEY = "muuguu_ascension";

var ascensionSkillPercent = 0;
var ascensionStatPercent = 0;
var playerDeathInProgress = false;

function loadAscensionProgress() {
    try {
        const raw = localStorage.getItem(ASCENSION_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        ascensionSkillPercent = Math.max(0, Number(saved.skillPercent) || 0);
        ascensionStatPercent = Math.max(0, Number(saved.statPercent) || 0);
    } catch (error) {
        ascensionSkillPercent = 0;
        ascensionStatPercent = 0;
    }
}

function saveAscensionProgress() {
    try {
        localStorage.setItem(ASCENSION_STORAGE_KEY, JSON.stringify({
            skillPercent: ascensionSkillPercent,
            statPercent: ascensionStatPercent,
        }));
    } catch (error) {
        // A blocked storage must not prevent the run from ending.
    }
}

function getAscensionMultiplier(type) {
    const percent = type === "stat"
        ? ascensionStatPercent
        : ascensionSkillPercent;
    return 1 + Math.max(0, Number(percent) || 0) / PERCENT;
}

function getAscensionTotals() {
    let skillLevels = 0;
    let statLevels = 0;

    if (player) {
        LEARNABLE_SKILL_KEYS.forEach(function (key) {
            const skill = player[key];
            if (skill && Number.isFinite(Number(skill.lvl))) {
                skillLevels += Math.max(0, Number(skill.lvl));
            }
        });
        CORE_STAT_NAMES.forEach(function (key) {
            const stat = player[key];
            if (stat && Number.isFinite(Number(stat.lvl))) {
                statLevels += Math.max(0, Number(stat.lvl));
            }
        });
    }

    return { skillLevels: skillLevels, statLevels: statLevels };
}

function recordAscensionFromCurrentRun() {
    const totals = getAscensionTotals();
    ascensionSkillPercent += totals.skillLevels;
    ascensionStatPercent += totals.statLevels;
    saveAscensionProgress();
    return totals;
}

function updateAscensionMultiplierDisplay() {
    const element = document.getElementById("ascensionmultiplier");
    if (!element) return;
    const format = typeof round2 === "function"
        ? round2
        : function (value) { return Math.round(Number(value) * 100) / 100; };
    element.innerText = "ascensionMultiplier: skills ×"
        + format(getAscensionMultiplier("skill"))
        + ", stats ×" + format(getAscensionMultiplier("stat"))
        + " (+" + format(ascensionSkillPercent)
        + "% / +" + format(ascensionStatPercent) + "%)";
    element.setAttribute(
        "data-tooltip",
        "Permanent rebirth bonus. Each skill or stat level at death adds 1% "
        + "to that category's experience growth."
    );
}

function showLimbo(cause) {
    if (document.getElementById("limbo")) return;

    const limbo = document.createElement("div");
    limbo.id = "limbo";
    limbo.className = "limbo";

    const title = document.createElement("div");
    title.className = "limbo-title";
    title.innerText = "LIMBO";
    limbo.appendChild(title);

    const causeText = document.createElement("div");
    causeText.id = "limbocause";
    causeText.className = "limbo-cause";
    causeText.innerText = cause || "Your body gave out.";
    limbo.appendChild(causeText);

    // Deliberately empty space for future Limbo content.
    const emptySpace = document.createElement("div");
    emptySpace.className = "limbo-empty";
    limbo.appendChild(emptySpace);

    const rebornButton = document.createElement("button");
    rebornButton.type = "button";
    rebornButton.id = "limboreborn";
    rebornButton.className = "limboreborn";
    rebornButton.innerText = "reborn";
    rebornButton.addEventListener("click", function () {
        rebornButton.disabled = true;
        window.location.reload();
    });
    limbo.appendChild(rebornButton);

    document.body.appendChild(limbo);
}

function checkPlayerDeath(cause) {
    if (playerDeathInProgress || !player || player.hp > 0) return false;

    playerDeathInProgress = true;
    const totals = recordAscensionFromCurrentRun();
    if (typeof logMessage === "function") {
        logMessage("You died. Your knowledge ascends: +"
            + totals.skillLevels + "% skill growth and +"
            + totals.statLevels + "% stat growth.");
    }
    updateAscensionMultiplierDisplay();
    showLimbo(cause);
    return true;
}

loadAscensionProgress();
