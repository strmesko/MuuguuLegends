# AGENTS.md

## Repository facts

- Static browser game: plain HTML/CSS/JS. No bundler, package manager, lint, typecheck, or test suite.
- `index.html` is the entrypoint. All scripts share global scope; load order matters.
- Do not assume `git`: this directory is not a git repository.
- `server.js` is empty. Do not use it as the dev server.
- `README.md` is a joke, not documentation.
- `opencode.exe` and `opencode-desktop-win-x64.exe` are large unrelated binaries. Ignore them.
- `retardship-backup/` is a backup. Do not edit it unless explicitly asked.
- `SESSION_CONTEXT_*.md` files are historical session notes. Verify against code before trusting them.

## Run and verify

Serve over HTTP, not `file://`:

```powershell
node "C:\Users\StrMesko\AppData\Local\Temp\opencode\nocache-server.js" "C:\AI_shit\opencode-windows-x64\retardship1-main" 8124
```

Open `http://127.0.0.1:8124/index.html`. If the helper is unavailable, any static server on port 8124 works. Use a cache-busting query such as `?v=<timestamp>` when reloading.

There is no test suite. The only automated check is syntax:

```powershell
Get-ChildItem -Path deepjs\*.js,main.js,tabselector.js | ForEach-Object { node --check $_.FullName }
```

UI, rendering, saves, and gameplay must be verified in a browser. Map changes should be checked in actual Firefox 160.0 x86 as well as Chrome.

Known benign console message:

```text
Failed to load resource: the server responded with a status of 404 ()
```

## Save safety

- Saves use `localStorage`: `data`, `data_slot_1`, `data_slot_2`, `data_slot_3`; version constants are in `deepjs/save.js`.
- Never clear or overwrite localStorage saves during testing. Mutate state in memory, then reload.
- Save migrations live in `deepjs/save.js`. Adding a skill, technology, equipment slot, or new persisted field usually requires updating its restore/collect lists.

## Architecture

- `index.html` loads scripts in dependency order: `classes.js`, `itemdefs.js`, `variables.js`, `gametime.js`, `items.js`, `elements.js`, `tabselector.js`, `engine.js`, `actions.js`, `main.js`, `worldgen.js`, `mapview.js`, `buttonactions.js`, `build.js`, `save.js`, `craft.js`, `cheat.js`.
- New JS files must be added to `index.html` at the correct point; there are no imports.
- Most UI is generated at runtime from JS. Static HTML is only a shell; search `deepjs/` for element IDs and labels instead of assuming markup exists.
- `deepjs/classes.js`: resources, skills, stats, equipment groups, potential, effective levels.
- `deepjs/itemdefs.js`: item definitions, runtime metal variants, pots, stat display.
- `deepjs/craft.js`: recipes, food quality, bonus ingredients, craft UI.
- `deepjs/items.js`: inventory, equipment, food consumption, icon routing.
- `deepjs/engine.js`: production loops, auto-eat, smelting, burn actions, learned skill bars.
- `deepjs/build.js`: building definitions, quality, improvement, house powers, build UI.
- `deepjs/variables.js`: technology definitions. Research tree UI is in `elements.js`, clicks in `buttonactions.js`, status in `actions.js`, persistence in `save.js`.
- `deepjs/mapview.js`: canvas map. The CPU-backed context (`alpha: false`, `willReadFrequently: true`, integer DPR) is intentional for 32-bit Firefox; do not simplify it without testing actual Firefox.
- `strazics.css`: single stylesheet, no preprocessor. UI classes are frequently generated in JS.

## Conventions and gotchas

- User-facing replies are in Russian.
- Building improvement fallback: 10% of construction WorkPoints plus 1 of each required resource; material-less buildings improve through WorkPoints only.
- Icon conventions: inventory icons are 14×14 under `images/inv/...`; science/research icons are 32×32 under `images/science/...`.
- Some IDs and definitions are generated at runtime (metal variants, pots, research nodes). Search by function or constant name, not only literal IDs.
- Verify UI states in the browser: idle, disabled, active/researching, completed, missing resources, and old-save restore.
