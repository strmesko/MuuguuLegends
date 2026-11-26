# AGENTS.md

## Repository facts

- Static browser game: plain HTML/CSS/JS. No bundler, package manager, lint, typecheck, or test suite.
- This **is** a Git repository. Check `git status` before editing and do not stage unrelated local changes.
- `index.html` is the entrypoint. All scripts share global scope; load order matters.
- `server.js` is empty. Do not use it as the dev server.
- `README.md` is a joke, not documentation.
- `opencode.exe` and `opencode-desktop-win-x64.exe` are large unrelated binaries. Ignore them.
- `node_modules/`, `retardship-backup/`, `.exe`/`.dll` files and `SESSION_CONTEXT_*.md` are ignored/local tooling or history. Do not treat them as game source.
- `retardship-backup/` is a backup. Do not edit it unless explicitly asked.
- `SESSION_CONTEXT_*.md` files are historical session notes. Verify against code before trusting them.
- `Kanojo/Fairy/fairy.js` is tracked and loaded by `index.html`; it provides Fairy dialogue data used by `deepjs/npc.js`.

## Project map

```text
.
├─ index.html                 HTML shell, stylesheet links and script load order
├─ main.js                    startup calls and main tab event bindings
├─ tabselector.js             tab switching and scroll-arrow helpers for tab bars
├─ strazics.css               single stylesheet for the whole game
├─ tips.txt                   tip-ticker text lines
├─ AGENTS.md
├─ README.md                  joke, not documentation
├─ LICENSE
├─ server.js                  empty, do not use
├─ deepjs/
│  ├─ fishdefs.js             data-only fish/fishing definitions
│  ├─ classes.js              resources, skills, stats, Character, trees, gemstones
│  ├─ itemdefs.js             item definitions, metal variants, ItemInstance/properties
│  ├─ variables.js            technology definitions and shared globals
│  ├─ limbo.js                death, Limbo and Ascension upgrades
│  ├─ gametime.js             clock, calendar, months, weather, time skips
│  ├─ items.js                inventory, equipment, food use, icon routing
│  ├─ drama.js                DramaMeter, random events, event rolls
│  ├─ elements.js             runtime-generated UI: tabs, panels, buttons, visibility
│  ├─ engine.js               production loops, skills, harvests, mining, GUI updates
│  ├─ actions.js              ACTIONS list, timed/instant actions, action gating
│  ├─ behavior.js             unified automatic action priority and saved-action buffer
│  ├─ combat.js               mobs, combat state, combat formulas and panel
│  ├─ npc.js                  NPC presets/instances, mood/favor, dialogue UI
│  ├─ worldgen.js             Perlin noise, tile/world generation
│  ├─ mapview.js              canvas map, camera, fog and tile rendering
│  ├─ buttonactions.js        static button wiring
│  ├─ build.js                buildings, quality, improvement, farm/tree buildings
│  ├─ save.js                 saves, restore lists, migrations
│  ├─ craft.js                recipes, cooking, Jewelry, gem bonuses, craft UI
│  ├─ cheat.js                debug-gated cheat menu
│  ├─ tips.js                 bottom tip ticker
│  └─ wiki.js                 generated in-game mini-wiki
├─ Kanojo/
│  └─ Fairy/
│     └─ fairy.js             Fairy dialogue data loaded by index.html
├─ muguu.png                  favicon
└─ images/
   ├─ Buildings/
   ├─ combat/
   ├─ inv/
   ├─ NPC/
   ├─ science/               includes Habits/Quartermister 32x32 icon
   └─ tiles/
```

`images/` uses `inv/` for 14x14 inventory icons, `science/` for 32x32 research icons, and separate folders for buildings, combat mobs, NPCs and map tiles.

## Run and verify

Serve over HTTP, not `file://`:

```powershell
node "C:\Users\StrMesko\AppData\Local\Temp\opencode\nocache-server.js" "C:\AI_shit\opencode-windows-x64\retardship1-main" 8124
```

Open `http://127.0.0.1:8124/index.html`. If the helper is unavailable, any static server on port 8124 works. Use a cache-busting query such as `?v=<timestamp>` when reloading.

There is no test suite. The only automated check is syntax:

```powershell
Get-ChildItem -Path deepjs\*.js,main.js,tabselector.js,Kanojo\Fairy\fairy.js | ForEach-Object { node --check $_.FullName }
```

UI, rendering, saves, and gameplay must be verified in a browser. Map changes should be checked in actual Firefox 160.0 x86 as well as Chrome.

Known benign console message:

```text
Failed to load resource: the server responded with a status of 404 ()
```

## Save safety

- Saves use `localStorage`: `data`, `data_slot_1`, `data_slot_2`, `data_slot_3`; version constants are in `deepjs/save.js` (`SAVE_VERSION = 3`).
- Never clear or overwrite localStorage saves during testing. Mutate state in memory, then reload.
- Save migrations live in `deepjs/save.js`. Adding a skill, technology, equipment slot, NPC field, building field, or new persisted field usually requires updating its restore/collect lists.
- Crafted item properties, gem bonuses, NPC mood/favor and farm/tree ripeness are persisted through the normal save paths; verify old-save restore when changing them.

## Script load order

`index.html` loads scripts in this exact dependency order:

```text
deepjs/fishdefs.js
deepjs/classes.js
deepjs/itemdefs.js
deepjs/variables.js
deepjs/limbo.js
deepjs/gametime.js
deepjs/items.js
deepjs/drama.js
deepjs/elements.js
tabselector.js
deepjs/engine.js
deepjs/actions.js
deepjs/behavior.js
deepjs/combat.js
Kanojo/Fairy/fairy.js
deepjs/npc.js
main.js
deepjs/worldgen.js
deepjs/mapview.js
deepjs/buttonactions.js
deepjs/build.js
deepjs/save.js
deepjs/craft.js
deepjs/cheat.js
deepjs/tips.js
deepjs/wiki.js
```

New JS files must be added to `index.html` at the correct point; there are no imports. Most UI is generated at runtime from JS. Static HTML is only a shell; search `deepjs/` for element IDs and labels instead of assuming markup exists.

## Architecture

- `deepjs/classes.js`: resources, skills, stats, `Character`, `ResourceStack`, tree species, crop IDs, gemstone definitions, potential and effective levels.
- `deepjs/itemdefs.js`: item definitions, runtime metal variants, pots, equipment slots, stat/property display, `ItemInstance`, item power and rarity scaling.
- `deepjs/variables.js`: technology definitions and shared globals such as `showSpoilers` and `formatGameNumber`.
- `deepjs/fishdefs.js`: data-only fish list used to generate fish resources, fishing rolls and icons.
- `deepjs/limbo.js`: permanent Ascension state, Limbo screen and rebirth upgrades.
- `deepjs/gametime.js`: game clock, calendar, month/season changes, weather and time-skip simulation.
- `deepjs/items.js`: inventory, equipment, food consumption, icon routing and item actions.
- `deepjs/drama.js`: DramaMeter, random event list and event rolls. `updateDrama(diff)` is called from the main loop and time-skip simulation.
- `deepjs/elements.js`: runtime UI generation, main tabs, options/craft/build panels, tab visibility and `setTabElementHidden`.
- `tabselector.js`: global tab switching (`actionTab`, `craftSubTab`, `researchSubTab`) plus scrollable tab-bar helpers. Main, Craft, Research and Build bars get `<`/`>` arrows only when they overflow. Resources and Stats & Skills are deliberately excluded.
- `deepjs/engine.js`: production loops, auto-eat, smelting, burn actions, learned skill bars, harvesting, farm/tree crop improvement, mining gemstone drops.
- `deepjs/actions.js`: `ACTIONS` list, instant/timed/toggle actions, action points, stamina and combat/dialogue gating.
- `deepjs/behavior.js`: unified automatic action priority (`Sleep` → `Rest` → `Harvest trees` → `Quartermaster` → `Research` → `Saved actions` → `Daydream`), saved-action slot cap and manual-cancel handling.
- `deepjs/combat.js`: mob definitions, combat state, attack timers, formulas and the combat panel. `updateCombat(diff)` is called from the production loop.
- `deepjs/npc.js`: NPC model and presets (Fairy), player-like stats/skills, tile coordinates, mood/favor, conversation overlay and `Talk to NPC` dialogue behavior. Fairy-specific lines come from `Kanojo/Fairy/fairy.js`.
- `deepjs/worldgen.js`: Perlin noise and world/tile generation.
- `deepjs/mapview.js`: canvas map. The CPU-backed context (`alpha: false`, `willReadFrequently: true`, integer DPR) is intentional for 32-bit Firefox; do not simplify it without testing actual Firefox.
- `deepjs/buttonactions.js`: static button wiring not handled by generated UI.
- `deepjs/build.js`: building definitions, quality, improvement, house powers, farm crop and planted tree buildings, build UI.
- `deepjs/save.js`: save/restore, storage keys, migrations, restore/collect lists.
- `deepjs/craft.js`: recipes, food quality, bonus ingredients, Jewelry/gem cutting, Ring and gem bonuses, craft UI.
- `deepjs/cheat.js`: debug-gated cheat menu (open with `~` while debug messages are enabled).
- `deepjs/tips.js`: bottom tip ticker, reads `tips.txt`.
- `deepjs/wiki.js`: generated in-game mini-wiki reachable from Options → Wiki; pages are built from live globals and respect game unlocks.
- `strazics.css`: single stylesheet, no preprocessor. UI classes are frequently generated in JS.

## Conventions and gotchas

- User-facing replies are in Russian.
- Automatic action selection is centralized in `deepjs/behavior.js`; add new automatic starts there instead of calling `startTimedAction` from unrelated systems.
- Saved action IDs (`previousTimedActionIds`) are capped to `maxActions`; manually cancelled non-habit actions are removed from that buffer.
- Building improvement fallback: 10% of construction WorkPoints plus 1 of each required resource; material-less buildings improve through WorkPoints only.
- Icon conventions: inventory icons are 14x14 under `images/inv/...`; science/research icons are 32x32 under `images/science/...`.
- Some IDs and definitions are generated at runtime (metal variants, pots, research nodes, gemstones, tree buildings). Search by function or constant name, not only literal IDs.
- Save keys are versioned and old saves must keep loading; add restore fallbacks when adding persisted state.
- Verify UI states in the browser: idle, disabled, active/researching, completed, missing resources, overflowed tab bars and old-save restore.
- Do not edit `retardship-backup/` or historical `SESSION_CONTEXT_*.md` files unless explicitly asked.
