// Bottom-of-screen tip ticker. The full list lives in tips.txt so it can be
// edited without touching code; the fallback only covers a missing file.
(function () {
    const TIP_ROTATE_MS = 45000;
    const FALLBACK_TIPS = [
        "Do not eat yellow snow.",
        "If it moves, hit it. If it does not move, hit it twice.",
        "When in doubt, make fibers.",
        "A campfire is a house with no walls and better ventilation.",
        "Luck is a stat, not a plan.",
    ];

    let tips = [];
    let lastIndex = -1;
    let rotateTimer = null;

    function pickTip() {
        if (!tips.length) return "";
        if (tips.length === 1) return tips[0];

        let index = Math.floor(Math.random() * tips.length);
        if (index === lastIndex) {
            index = (index + 1 + Math.floor(Math.random() * (tips.length - 1)))
                % tips.length;
        }
        lastIndex = index;
        return tips[index];
    }

    function showTip() {
        const element = document.getElementById("tipstickertext");
        if (!element) return;

        const tip = pickTip();
        if (!tip) return;

        element.textContent = tip;

        // Restart the marquee so every tip begins from the right edge.
        element.style.animation = "none";
        void element.offsetWidth;
        element.style.animation = "";
        element.style.animationDuration = Math.max(
            18,
            Math.min(55, tip.length * 0.24)
        ) + "s";
    }

    async function loadTips() {
        try {
            const response = await fetch("tips.txt", { cache: "no-store" });
            if (response.ok) {
                const text = await response.text();
                tips = text.split(/\r?\n/)
                    .map(function (line) { return line.trim(); })
                    .filter(Boolean);
            }
        } catch (error) {
            // A local file opened without a server is the usual failure case.
        }

        if (!tips.length) tips = FALLBACK_TIPS.slice();
        showTip();
        if (rotateTimer) clearInterval(rotateTimer);
        rotateTimer = setInterval(showTip, TIP_ROTATE_MS);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadTips);
    } else {
        loadTips();
    }
})();
