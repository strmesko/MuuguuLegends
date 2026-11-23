function switchTab(evt, tabName, contentClass, tabClass) {
    var i;
    var tabcontent = document.getElementsByClassName(contentClass);
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    var tablinks = document.getElementsByClassName(tabClass);
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    var target = document.getElementById(tabName);
    target.style.display = target.classList.contains("flexplace") ? "flex" : "block";
    evt.currentTarget.className += " active";

    // A hidden tab bar has no measurable width. Recalculate once the newly
    // opened section is visible so its arrows appear when needed.
    if (typeof scheduleTabScrollRefresh === "function") {
        scheduleTabScrollRefresh();
    }
}

function actionTab(evt, tabName) {
    switchTab(evt, tabName, "actionplace", "actiontab");
}

function leftActionTab(evt, tabName) {
    switchTab(evt, tabName, "lefttabs", "lefttabs");
}

function craftSubTab(evt, tabName) {
    switchTab(evt, tabName, "craftsubplace", "craftsubplace");
}

function researchSubTab(evt, tabName) {
    switchTab(evt, tabName, "researchsubplace", "researchsub");
}
document.addEventListener('click', function (event) {
    const link = event.target.closest('ul.tree a');
    if (!link) return;

    const parent = link.parentElement;
    if (parent.classList.contains('open')) {
        parent.classList.remove('open');
        parent.querySelectorAll(':scope .open').forEach(function (item) {
            item.classList.remove('open');
        });
    } else {
        parent.classList.add('open');
    }
    event.preventDefault();
});

// Compact < and > buttons for tab bars that can overflow. Resources and
// Stats & Skills use their own left selector and are deliberately excluded.
const TAB_SCROLL_GROUP_SPECS = [
    {
        id: "main",
        getContainer: function () {
            return document.querySelector(".actionselect");
        },
        selector: ".actiontab",
        main: true,
    },
    {
        id: "craft",
        getContainer: function () {
            return document.getElementById("craftplace");
        },
        selector: ".craftsub",
        main: false,
    },
    {
        id: "research",
        getContainer: function () {
            return document.getElementById("researchplace");
        },
        selector: ".researchsub",
        main: false,
    },
    {
        id: "build",
        getContainer: function () {
            return document.getElementById("buildplace");
        },
        selector: ".buildsub",
        main: false,
    },
];

let tabScrollRefreshScheduled = false;
let tabScrollInitialized = false;

function getDirectTabButtons(container, selector) {
    if (!container) return [];
    return Array.from(container.children).filter(function (child) {
        return child.matches && child.matches(selector);
    });
}

function updateTabScrollArrows(state) {
    if (!state || !state.track || !state.left || !state.right) return;

    const track = state.track;
    const measurable = track.clientWidth > 0;
    const maxScroll = measurable
        ? Math.max(0, track.scrollWidth - track.clientWidth)
        : 0;
    const overflow = measurable && maxScroll > 2;

    state.left.classList.toggle("is-hidden", !overflow);
    state.right.classList.toggle("is-hidden", !overflow);
    state.wrapper.classList.toggle("is-overflowing", overflow);

    if (!overflow) {
        state.left.disabled = true;
        state.right.disabled = true;
        return;
    }

    state.left.disabled = track.scrollLeft <= 1;
    state.right.disabled = track.scrollLeft >= maxScroll - 1;
}

function scrollTabTrack(track, direction) {
    if (!track) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    if (maxScroll <= 0) return;

    const step = Math.max(40, Math.floor(track.clientWidth * 0.7));
    const target = Math.max(
        0,
        Math.min(maxScroll, track.scrollLeft + direction * step)
    );

    if (typeof track.scrollTo === "function") {
        track.scrollTo({ left: target, behavior: "auto" });
    } else {
        track.scrollLeft = target;
    }
}

function createTabScrollArrow(direction) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tabscrollarrow "
        + (direction < 0 ? "tabscrollleft" : "tabscrollright");
    button.innerText = direction < 0 ? "<" : ">";
    button.title = direction < 0 ? "Scroll tabs left" : "Scroll tabs right";
    button.setAttribute(
        "aria-label",
        direction < 0 ? "Scroll tabs left" : "Scroll tabs right"
    );
    return button;
}

function ensureTabScrollGroup(spec) {
    const container = spec && spec.getContainer ? spec.getContainer() : null;
    if (!container) return null;

    let wrapper = null;
    for (let index = 0; index < container.children.length; index++) {
        const child = container.children[index];
        if (child.classList && child.classList.contains("tabscrollwrap")) {
            wrapper = child;
            break;
        }
    }

    let track = wrapper
        ? wrapper.querySelector(".tabscrolltrack")
        : null;

    if (!wrapper) {
        const directButtons = getDirectTabButtons(container, spec.selector);
        if (!directButtons.length) return null;

        wrapper = document.createElement("div");
        wrapper.className = "tabscrollwrap "
            + (spec.main ? "tabscrollwrap-main" : "tabscrollwrap-sub");
        wrapper.dataset.tabScrollGroup = spec.id;

        const left = createTabScrollArrow(-1);
        const right = createTabScrollArrow(1);
        track = document.createElement("div");
        track.className = "tabscrolltrack";

        left.addEventListener("click", function () {
            scrollTabTrack(track, -1);
        });
        right.addEventListener("click", function () {
            scrollTabTrack(track, 1);
        });
        track.addEventListener("scroll", function () {
            updateTabScrollArrows({
                wrapper: wrapper,
                track: track,
                left: left,
                right: right,
            });
        });

        wrapper.appendChild(left);
        wrapper.appendChild(track);
        wrapper.appendChild(right);
        container.insertBefore(wrapper, directButtons[0]);

        directButtons.forEach(function (button) {
            track.appendChild(button);
        });
    } else {
        // Build and craft panels append new buttons after the wrapper.
        // Adopt only direct buttons, so the track's own buttons are ignored.
        getDirectTabButtons(container, spec.selector).forEach(function (button) {
            track.appendChild(button);
        });
    }

    if (!track) return null;

    if (typeof ResizeObserver !== "undefined") {
        let resizeObserver = track._tabScrollResizeObserver;
        if (!resizeObserver) {
            resizeObserver = new ResizeObserver(function () {
                scheduleTabScrollRefresh();
            });
            track._tabScrollResizeObserver = resizeObserver;
            resizeObserver.observe(track);
        }
        // Track width can stay the same while font/layout changes only the
        // widths of the buttons inside it. Observe them too, otherwise stale
        // arrows can remain visible after the first layout settles.
        track.querySelectorAll("button").forEach(function (button) {
            resizeObserver.observe(button);
        });
    }

    const state = {
        wrapper: wrapper,
        track: track,
        left: wrapper.querySelector(".tabscrollleft"),
        right: wrapper.querySelector(".tabscrollright"),
    };
    updateTabScrollArrows(state);
    return state;
}

function refreshTabScrollBars() {
    TAB_SCROLL_GROUP_SPECS.forEach(function (spec) {
        ensureTabScrollGroup(spec);
    });
}

function scheduleTabScrollRefresh() {
    if (tabScrollRefreshScheduled) return;
    tabScrollRefreshScheduled = true;

    const run = function () {
        tabScrollRefreshScheduled = false;
        refreshTabScrollBars();
    };

    // Always use a timer. requestAnimationFrame is paused in background and
    // unfocused tabs, which would leave the scheduled flag stuck forever.
    setTimeout(run, 16);
}

function initTabScrollBars() {
    if (tabScrollInitialized) return;
    tabScrollInitialized = true;

    TAB_SCROLL_GROUP_SPECS.forEach(function (spec) {
        const container = spec.getContainer();
        if (!container) return;

        ensureTabScrollGroup(spec);

        if (typeof MutationObserver !== "undefined") {
            const observer = new MutationObserver(function () {
                scheduleTabScrollRefresh();
            });
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["hidden"],
            });
        }
    });

    window.addEventListener("resize", scheduleTabScrollRefresh);
    window.addEventListener("load", scheduleTabScrollRefresh);

    if (document.fonts
        && document.fonts.ready
        && typeof document.fonts.ready.then === "function") {
        document.fonts.ready.then(scheduleTabScrollRefresh);
    }

    refreshTabScrollBars();
    setTimeout(refreshTabScrollBars, 0);
    setTimeout(refreshTabScrollBars, 250);
    setTimeout(refreshTabScrollBars, 1000);
}

window.refreshTabScrollBars = refreshTabScrollBars;
window.scheduleTabScrollRefresh = scheduleTabScrollRefresh;
initTabScrollBars();