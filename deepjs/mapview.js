function ensureGameplayTileState(tile, x, y) {
    if (!tile) return null;

    tile.x = x;
    tile.y = y;
    if (typeof tile.revealed !== "number") tile.revealed = 0;
    if (typeof tile.investigated !== "number") tile.investigated = 0;
    if (typeof tile.hiddenstuff !== "number") tile.hiddenstuff = 0;
    if (!tile.land) tile.land = { trees: 0, grass: 0, rocks: 0, water: 0 };
    if (!tile.resourceMultipliers) tile.resourceMultipliers = {};
    if (!tile.space) tile.space = { EmptySpace: 1000, RoomSpace: 0 };
    if (typeof tile.space.RoomSpace !== "number") tile.space.RoomSpace = 0;
    if (!tile.harvestedTrees || typeof tile.harvestedTrees !== "object") {
        tile.harvestedTrees = {};
    }
    if (!Array.isArray(tile.buildings)) tile.buildings = [];
    if (typeof attachBuildingsToTile === "function") attachBuildingsToTile(tile);
    return tile;
}

class MapView {
    constructor(container, seed = null) {
        this.container = container;
        // New games reuse the seed that was already used for stat bindings.
        const worldSeed = seed ?? (typeof getOrCreateMapSeed === "function"
            ? getOrCreateMapSeed()
            : undefined);
        this.world = new WorldGen(worldSeed);
        this.tileSize = 28;
        this.minTileSize = 8;
        this.maxTileSize = 64;
        this.cameraX = 0;
        this.cameraY = 0;
        this.width = 0;
        this.height = 0;
        this.dragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.cameraStartX = 0;
        this.cameraStartY = 0;
        this.hover = null;
        this.focalTile = { x: 0, y: 0 };
        // Per-tile exploration/search state restored from a save. Tiles keep
        // their live values while the session is running; this cache is only
        // applied once per tile after loading.
        this.savedTileStates = {};
        this.tileStateGeneration = 0;
        this.tileTypeById = new Map(this.world.tileTypes.map((type) => [type.id, type]));

        this.container.innerHTML = '';

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'map-canvas';
        this.container.appendChild(this.canvas);
        // Keeping the map on a CPU-backed, opaque 2D canvas avoids Firefox
        // 32-bit GPU-canvas bugs where the surface stays black.
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: true,
        });

        // Firefox can lose a 2D canvas surface after a GPU reset or a tab
        // restore. Rebuild the backing store instead of leaving a black map.
        this.canvas.addEventListener('contextlost', (event) => {
            event.preventDefault();
            this.ctx = null;
        });
        this.canvas.addEventListener('contextrestored', () => {
            this.ctx = this.canvas.getContext('2d', {
                alpha: false,
                willReadFrequently: true,
            });
            this.resize();
        });

        this.coordinates = document.createElement('div');
        this.coordinates.className = 'map-coordinates';
        this.coordinates.textContent = 'X: 0, Y: 0';
        this.container.appendChild(this.coordinates);

        // Camping buildings are represented on the map by the Tent image.
        this.campingOverlayImage = new Image();
        this.campingOverlayImage.src = 'images/Buildings/Tent.png';
        this.campingOverlayImage.addEventListener('load', () => this.draw());

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.style.display = 'none';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '20';
        document.body.appendChild(this.tooltip);

        this.bindEvents();
        this.resize();
        this.jumpToStart();

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => this.resize());
            this.resizeObserver.observe(this.container);
        }
        // Keep the window listener as well: some Firefox builds do not emit a
        // usable ResizeObserver entry when a hidden tab becomes visible.
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('pageshow', () => this.resize());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.resize();
        });

        requestAnimationFrame(() => this.draw());
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', (event) => this.startDrag(event));
        this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.canvas.addEventListener('mouseleave', () => {
            if (!this.dragging) this.clearHover();
        });
        this.canvas.addEventListener('wheel', (event) => this.onWheel(event), { passive: false });
        this.canvas.addEventListener('dblclick', (event) => this.onDoubleClick(event));
        window.addEventListener('mouseup', () => this.stopDrag());
        window.addEventListener('blur', () => this.stopDrag());
    }

    getTileStateKey(x, y) {
        return x + ',' + y;
    }

    setTileStates(states) {
        this.savedTileStates = states && typeof states === 'object'
            ? states
            : {};
        // Invalidate the "already restored" marker on any tile object that
        // survived a reload in the same page.
        this.tileStateGeneration += 1;
    }

    applySavedTileState(tile, x, y) {
        if (!tile) return null;

        if (tile.__tileStateGeneration === this.tileStateGeneration) {
            return tile;
        }
        tile.__tileStateGeneration = this.tileStateGeneration;

        const state = this.savedTileStates[this.getTileStateKey(x, y)];
        if (!state || typeof state !== 'object') return tile;

        const revealed = Number(state.revealed);
        const investigated = Number(state.investigated);
        const hiddenstuff = Number(state.hiddenstuff);

        if (Number.isFinite(revealed)) tile.revealed = Math.max(0, revealed);
        if (Number.isFinite(investigated)) tile.investigated = Math.max(0, investigated);
        if (Number.isFinite(hiddenstuff)) tile.hiddenstuff = Math.max(0, hiddenstuff);
        return tile;
    }

    getGameplayTile(x, y) {
        const tile = ensureGameplayTileState(this.world.getTileData(x, y), x, y);
        return this.applySavedTileState(tile, x, y);
    }

    getTilePassability(x, y) {
        const tile = this.world.getTileData(x, y);
        const type = tile ? this.tileTypeById.get(tile.type) : null;
        const passability = Number(type && type.passability);
        return Number.isFinite(passability) && passability > 0 ? passability : 1;
    }

    collectTileStates() {
        const states = {};
        const size = this.world.chunkSize;

        this.world.chunks.forEach((chunk, key) => {
            const coordinates = String(key).split(',');
            const chunkX = Number(coordinates[0]);
            const chunkY = Number(coordinates[1]);
            if (!Number.isFinite(chunkX) || !Number.isFinite(chunkY)) return;

            chunk.forEach((row, localY) => {
                row.forEach((tile, localX) => {
                    if (!tile) return;

                    const revealed = Math.max(0, Number(tile.revealed) || 0);
                    const investigated = Math.max(0, Number(tile.investigated) || 0);
                    const hiddenstuff = Math.max(0, Number(tile.hiddenstuff) || 0);
                    if (revealed <= 0 && investigated <= 0 && hiddenstuff <= 0) return;

                    states[this.getTileStateKey(
                        chunkX * size + localX,
                        chunkY * size + localY
                    )] = {
                        revealed: revealed,
                        investigated: investigated,
                        hiddenstuff: hiddenstuff,
                    };
                });
            });
        });

        // The current tile normally belongs to a generated chunk, but keep a
        // fallback for the initial plain tile before the map has been built.
        if (typeof currentTile !== 'undefined' && currentTile) {
            const revealed = Math.max(0, Number(currentTile.revealed) || 0);
            const investigated = Math.max(0, Number(currentTile.investigated) || 0);
            const hiddenstuff = Math.max(0, Number(currentTile.hiddenstuff) || 0);
            if (revealed > 0 || investigated > 0 || hiddenstuff > 0) {
                states[this.getTileStateKey(currentTile.x, currentTile.y)] = {
                    revealed: revealed,
                    investigated: investigated,
                    hiddenstuff: hiddenstuff,
                };
            }
        }

        return states;
    }

    getBuildingsOnTile(x, y) {
        if (typeof buildings !== 'undefined' && Array.isArray(buildings)) {
            return buildings.filter((building) => {
                return building && building.x === x && building.y === y;
            });
        }

        const tile = this.world.getTileData(x, y);
        return tile && Array.isArray(tile.buildings) ? tile.buildings : [];
    }

    hasOnlyCampingBuildings(x, y) {
        const tileBuildings = this.getBuildingsOnTile(x, y);
        if (!tileBuildings.length) return false;

        const campingCategoryId = typeof BUILDING_CATEGORY !== 'undefined'
            ? BUILDING_CATEGORY.id
            : 'camping';

        return tileBuildings.every((building) => {
            const def = typeof getBuildingDefinition === 'function'
                ? getBuildingDefinition(building.defId)
                : null;
            return !!def && def.category === campingCategoryId;
        });
    }

    // Draws the camping overlay on every visible tile whose buildings are all
    // in the camping category. Called after the river pass, so the overlay is
    // always drawn on top of a river that crosses the tile.
    drawCampingOverlays(startX, startY, endX, endY) {
        const image = this.campingOverlayImage;
        if (!image || !image.complete || image.naturalWidth <= 0) return;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (!this.hasOnlyCampingBuildings(x, y)) continue;

                const sx = x * this.tileSize - this.cameraX;
                const sy = y * this.tileSize - this.cameraY;
                this.ctx.drawImage(image, sx, sy, this.tileSize, this.tileSize);
            }
        }
    }

    focusTile(x, y) {
        this.focalTile = { x, y };
        this.renderCoordinates(x, y, false);
        this.centerOn(x, y);
    }

    isForestRiverTile(x, y) {
        const tile = this.world.getTileData(x, y);
        return !!tile
            && (tile.type === 5 || tile.type === 6)
            && Array.isArray(tile.riverLinks)
            && tile.riverLinks.length > 0;
    }

    findNearestForestRiver(maxRadius = 256) {
        if (this.isForestRiverTile(0, 0)) return { x: 0, y: 0 };

        let best = null;
        let bestDistance = Infinity;
        for (let radius = 1; radius <= maxRadius; radius++) {
            if (best && radius * radius > bestDistance) break;

            const testTile = (x, y) => {
                if (!this.isForestRiverTile(x, y)) return;
                const distance = x * x + y * y;
                if (distance < bestDistance) {
                    bestDistance = distance;
                    best = { x, y };
                }
            };

            for (let dx = -radius; dx <= radius; dx++) {
                testTile(dx, -radius);
                testTile(dx, radius);
            }
            for (let dy = -radius + 1; dy < radius; dy++) {
                testTile(-radius, dy);
                testTile(radius, dy);
            }
        }

        return best;
    }

    jumpToStart(updateCurrentTile = true) {
        const startTile = this.findNearestForestRiver() || { x: 0, y: 0 };
        this.focalTile = startTile;
        this.renderCoordinates(startTile.x, startTile.y, false);

        if (updateCurrentTile && typeof currentTile !== 'undefined' && currentTile) {
            currentTile = this.getGameplayTile(startTile.x, startTile.y);
            if (typeof updateMenuStatus === 'function') updateMenuStatus();
        }

        this.centerOn(startTile.x, startTile.y);
    }

    getSeed() {
        return this.world.seed;
    }

    setSeed(seed) {
        this.world.setSeed(seed);
        this.hover = null;
        this.hideTooltip();
        this.jumpToStart(false);
    }

    startDrag(event) {
        if (event.button !== 0) return;
        this.dragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.cameraStartX = this.cameraX;
        this.cameraStartY = this.cameraY;
        this.hideTooltip();
        this.canvas.classList.add('dragging');
    }

    onMouseMove(event) {
        if (this.dragging) {
            this.cameraX = this.cameraStartX - (event.clientX - this.dragStartX);
            this.cameraY = this.cameraStartY - (event.clientY - this.dragStartY);
            this.draw();
            return;
        }
        this.updateHover(event);
    }

    stopDrag() {
        if (!this.dragging) return;
        this.dragging = false;
        this.canvas.classList.remove('dragging');
    }

    onWheel(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const worldX = (this.cameraX + mouseX) / this.tileSize;
        const worldY = (this.cameraY + mouseY) / this.tileSize;
        const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
        const nextSize = Math.max(this.minTileSize, Math.min(this.maxTileSize, this.tileSize * factor));

        this.tileSize = nextSize;
        this.cameraX = worldX * nextSize - mouseX;
        this.cameraY = worldY * nextSize - mouseY;
        this.draw();
        this.updateHover(event);
    }

    clearHover() {
        this.hover = null;
        this.renderCoordinates(this.focalTile.x, this.focalTile.y, false);
        this.hideTooltip();
        this.draw();
    }

    // Re-renders the coordinate box without changing the focused or hovered
    // tile. Called after buildings on the tile change.
    refreshCoordinates() {
        const tile = this.hover || this.focalTile;
        this.renderCoordinates(tile.x, tile.y, this.hover != null);
    }

    formatBuildingQuality(value) {
        const quality = Number(value);
        const safeQuality = Number.isFinite(quality) && quality > 0 ? quality : 1;
        return Math.round(safeQuality * 100) / 100;
    }

    // Buildings on the tile, e.g. "Tent Q1, Leaf Bedroll Q3.67 (42%)".
    // Unfinished buildings are marked with their construction progress.
    getTileBuildingList(tileX, tileY) {
        let list = [];

        if (typeof buildings !== 'undefined' && Array.isArray(buildings)) {
            list = buildings.filter((building) => building
                && building.x === tileX
                && building.y === tileY);
        } else {
            const tile = this.world.getTileData(tileX, tileY);
            list = (tile && Array.isArray(tile.buildings) ? tile.buildings : [])
                .filter((building) => building);
        }

        if (!list.length) return 'none';

        return list.map((building) => {
            const def = typeof getBuildingDefinition === 'function'
                ? getBuildingDefinition(building.defId)
                : null;
            const name = def ? def.name : String(building.defId || 'Building');
            const label = `${name} Q${this.formatBuildingQuality(building.quality)}`;

            if (building.completed) return label;

            const totalWork = def ? Number(def.workPoints) : 0;
            const workPoints = Number(building.workPoints);
            if (!Number.isFinite(totalWork) || totalWork <= 0 || !Number.isFinite(workPoints)) {
                return `${label} (unfinished)`;
            }

            const progress = Math.max(0, Math.min(1, (totalWork - workPoints) / totalWork));
            return `${label} (${Math.round(progress * 100)}%)`;
        }).join(', ');
    }

    renderCoordinates(tileX, tileY, detailed) {
        const tile = this.world.getTileData(tileX, tileY);
        const type = this.tileTypeById.get(tile.type);
        const name = type ? type.name : 'Unknown';
        const char = type ? type.char : '';
        const passability = Number(type && type.passability);
        const safePassability = Number.isFinite(passability) && passability > 0
            ? passability
            : 1;

        let line = `X: ${tileX}, Y: ${tileY} | ${char} ${name}`;

        if (detailed) {
            const river = tile.river ? ' | 💧 River' : '';
            line += ` | H: ${tile.elevation.toFixed(3)} | T: ${tile.temperature.toFixed(3)} | W: ${tile.humidity.toFixed(3)}${river}`;
            line += `<br>Passability: ${Math.round(safePassability * 100)}% (travel x${Math.round(100 / safePassability) / 100})`;
            line += `<br>Space: ${this.formatTileSpace(tile.space, tile.harvestedTrees)}`;
        }

        line += `<br>Buildings: ${this.getTileBuildingList(tileX, tileY)}`;
        this.coordinates.innerHTML = line;
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    formatTileSpace(space, harvestedTrees) {
        const entries = Object.entries(space || {}).filter(([, amount]) => Number(amount) > 0);
        if (entries.length === 0) return 'none';
        return entries.map(([name, amount]) => {
            const harvested = Number(harvestedTrees && harvestedTrees[name]) || 0;
            return harvested > 0
                ? `${name} ${amount} (${harvested} Harvested)`
                : `${name} ${amount}`;
        }).join(', ');
    }

    getTileAtClientPoint(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        return {
            x: Math.floor((this.cameraX + mouseX) / this.tileSize),
            y: Math.floor((this.cameraY + mouseY) / this.tileSize),
        };
    }

    onDoubleClick(event) {
        event.preventDefault();
        const tile = this.getTileAtClientPoint(event);
        if (typeof handleMapTileDoubleClick === "function") {
            handleMapTileDoubleClick(tile.x, tile.y, event);
        }
    }

    updateHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const tileX = Math.floor((this.cameraX + mouseX) / this.tileSize);
        const tileY = Math.floor((this.cameraY + mouseY) / this.tileSize);
        const tile = this.world.getTileData(tileX, tileY);
        const type = this.tileTypeById.get(tile.type);
        const passability = Number(type && type.passability);
        const safePassability = Number.isFinite(passability) && passability > 0
            ? passability
            : 1;

        this.hover = { x: tileX, y: tileY };
        this.renderCoordinates(tileX, tileY, true);

        const name = type ? type.name : 'Unknown';
        const char = type ? type.char : '';
        this.tooltip.innerHTML =
            `X: ${tileX}, Y: ${tileY}<br>${char} ${name}<br>H: ${tile.elevation.toFixed(3)} | T: ${tile.temperature.toFixed(3)} | W: ${tile.humidity.toFixed(3)}${tile.river ? '<br>💧 River' : ''}`
            + `<br>Passability: ${Math.round(safePassability * 100)}% (travel x${Math.round(100 / safePassability) / 100})`;
        this.tooltip.style.display = 'block';

        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;
        let left = event.clientX + 14;
        let top = event.clientY + 18;
        if (left + tooltipWidth > window.innerWidth - 4) left = event.clientX - tooltipWidth - 14;
        if (top + tooltipHeight > window.innerHeight - 4) top = event.clientY - tooltipHeight - 14;
        this.tooltip.style.left = Math.max(4, left) + 'px';
        this.tooltip.style.top = Math.max(4, top) + 'px';

        this.draw();
    }

    resize() {
        const previousWidth = this.width || 0;
        const previousHeight = this.height || 0;
        const centerTileX = previousWidth > 0 ? (this.cameraX + previousWidth / 2) / this.tileSize : null;
        const centerTileY = previousHeight > 0 ? (this.cameraY + previousHeight / 2) / this.tileSize : null;

        const rect = this.container.getBoundingClientRect();
        const nextWidth = Math.max(1, Math.floor(rect.width));
        const nextHeight = Math.max(1, Math.floor(rect.height));
        if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) return;

        this.width = nextWidth;
        this.height = nextHeight;

        // Integer backing-store scaling avoids fractional-device-pixel
        // canvas bugs in Firefox while keeping high-DPI output crisp enough.
        const dpr = Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1)));
        const backingWidth = Math.max(1, Math.floor(this.width * dpr));
        const backingHeight = Math.max(1, Math.floor(this.height * dpr));

        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        // Only touching width/height when they actually change avoids a needless
        // canvas clear (and context reset) on every ResizeObserver callback.
        if (this.canvas.width !== backingWidth) this.canvas.width = backingWidth;
        if (this.canvas.height !== backingHeight) this.canvas.height = backingHeight;

        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: true,
        });
        if (!this.ctx) return;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (centerTileX !== null && centerTileY !== null) {
            this.cameraX = centerTileX * this.tileSize - this.width / 2;
            this.cameraY = centerTileY * this.tileSize - this.height / 2;
        }

        this.draw();

        // A delayed repaint covers Firefox clearing the surface after the
        // synchronous resize or after a hidden map tab becomes visible.
        requestAnimationFrame(() => this.draw());
    }

    centerOn(tileX, tileY) {
        this.cameraX = (tileX + 0.5) * this.tileSize - this.width / 2;
        this.cameraY = (tileY + 0.5) * this.tileSize - this.height / 2;
        this.draw();
    }

    refresh() {
        this.draw();
    }

    draw() {
        if (!this.ctx || this.width <= 1 || this.height <= 1) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const startX = Math.floor(this.cameraX / this.tileSize);
        const startY = Math.floor(this.cameraY / this.tileSize);
        const endX = Math.ceil((this.cameraX + this.width) / this.tileSize);
        const endY = Math.ceil((this.cameraY + this.height) / this.tileSize);
        const riverSegments = [];

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const tile = this.world.getTileData(x, y);
                if (!tile) continue;

                const screenX = x * this.tileSize - this.cameraX;
                const screenY = y * this.tileSize - this.cameraY;
                const type = this.tileTypeById.get(tile.type);
                const color = type && type.color ? type.color : '#4a8a4a';
                const char = type ? type.char : '';
                const riverLinks = Array.isArray(tile.riverLinks) ? tile.riverLinks : [];

                if (riverLinks.length > 0) {
                    const centerX = screenX + this.tileSize / 2;
                    const centerY = screenY + this.tileSize / 2;
                    for (const [dx, dy] of riverLinks) {
                        riverSegments.push(
                            centerX, centerY,
                            centerX + dx * this.tileSize / 2,
                            centerY + dy * this.tileSize / 2
                        );
                    }
                }

                this.ctx.fillStyle = color;
                this.ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                if (this.tileSize > 20) {
                    this.ctx.font = `${this.tileSize - 8}px Arial`;
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillText(char, screenX + 3, screenY + this.tileSize - 5);
                }
            }
        }

        if (riverSegments.length > 0) {
            const riverWidth = Math.max(2.5, Math.min(11, this.tileSize * 0.16));
            this.ctx.beginPath();
            for (let i = 0; i < riverSegments.length; i += 4) {
                this.ctx.moveTo(riverSegments[i], riverSegments[i + 1]);
                this.ctx.lineTo(riverSegments[i + 2], riverSegments[i + 3]);
            }
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.strokeStyle = 'rgba(6, 24, 46, 0.8)';
            this.ctx.lineWidth = riverWidth + 2;
            this.ctx.stroke();

            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = riverWidth;
            this.ctx.stroke();

            this.ctx.strokeStyle = 'rgba(224, 248, 255, 0.85)';
            this.ctx.lineWidth = Math.max(1, riverWidth * 0.35);
            this.ctx.stroke();

            this.ctx.lineCap = 'butt';
            this.ctx.lineJoin = 'miter';
        }

        this.drawCampingOverlays(startX, startY, endX, endY);

        if (this.hover) {
            const sx = this.hover.x * this.tileSize - this.cameraX;
            const sy = this.hover.y * this.tileSize - this.cameraY;
            this.ctx.strokeStyle = '#4cc9f0';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(sx, sy, this.tileSize, this.tileSize);
        }

        if (typeof currentTile !== 'undefined' && currentTile) {
            const sx = currentTile.x * this.tileSize - this.cameraX;
            const sy = currentTile.y * this.tileSize - this.cameraY;
            const lineWidth = Math.max(3, Math.min(5, this.tileSize * 0.16));
            const inset = lineWidth / 2;
            this.ctx.strokeStyle = '#ff7a00';
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeRect(
                sx + inset,
                sy + inset,
                this.tileSize - lineWidth,
                this.tileSize - lineWidth
            );

            const visible = sx + this.tileSize > 0 &&
                sx < this.width &&
                sy + this.tileSize > 0 &&
                sy < this.height;

            if (!visible) {
                const tileCenterX = sx + this.tileSize / 2;
                const tileCenterY = sy + this.tileSize / 2;
                const angle = Math.atan2(tileCenterY - this.height / 2, tileCenterX - this.width / 2);

                this.ctx.save();
                this.ctx.translate(
                    this.width / 2 + Math.cos(angle) * 26,
                    this.height / 2 + Math.sin(angle) * 26
                );
                this.ctx.rotate(angle);
                this.ctx.beginPath();
                this.ctx.moveTo(9, 0);
                this.ctx.lineTo(-6, -7);
                this.ctx.lineTo(-3, 0);
                this.ctx.lineTo(-6, 7);
                this.ctx.closePath();
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.fillStyle = '#ff7a00';
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }
}

function initMapView() {
    const mapContent = document.getElementById('mapcontent');
    if (!mapContent || window.mapView) return;
    window.mapView = new MapView(mapContent);
    if (typeof ensureStartCoordinates === "function") {
        ensureStartCoordinates();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMapView);
} else {
    initMapView();
}
