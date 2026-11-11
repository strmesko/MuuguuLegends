class PerlinNoise {
    constructor(seed = 0) {
        this.seed = seed;
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        this.perm = new Array(512);
        this.p = new Array(256);
        this.seedRandom(seed);
    }

    seedRandom(seed) {
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }

        let s = seed || 0;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807 + 0) % 2147483647;
            const j = (s + i) % 256;
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    perlin3D(x, y, z, frequency) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.perm[AA], x, y, z),
                    this.grad(this.perm[BA], x - 1, y, z)
                ),
                this.lerp(u,
                    this.grad(this.perm[AB], x, y - 1, z),
                    this.grad(this.perm[BB], x - 1, y - 1, z)
                )
            ),
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.perm[AA + 1], x, y, z - 1),
                    this.grad(this.perm[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(u,
                    this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                    this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const g = this.grad3[hash % 12];
        return g[0] * x + g[1] * y + g[2] * z;
    }

    fbm(x, y, octaves = 6, lacunarity = 2.0, gain = 0.5, frequency = 1.0) {
        let value = 0;
        let amplitude = 1.0;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.perlin3D(
                x * frequency,
                y * frequency,
                this.seed * 0.001 + i * 100
            );
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }

        return value / maxValue;
    }
}

class ResourceGenerator {
    constructor(map) {
        this.map = map;
    }

    isEligible(x, y, elevation, temperature, humidity, resourceConfig) {
        const { targetBiomes, heightRange, tempRange, humidRange, excludedBiomes, minElevation, minHumidity, avoidAdjacentBiomes } = resourceConfig;

        let isTargetBiome = !targetBiomes;
        if (targetBiomes) {
            for (const biomeId of targetBiomes) {
                if (this.map.tileTypes[biomeId]) {
                    const biome = this.map.tileTypes[biomeId];
                    if (elevation >= biome.heightmin && elevation < biome.heightmax &&
                        temperature >= biome.tempmin && temperature < biome.tempmax &&
                        humidity >= biome.humidmin && humidity < biome.humidmax) {
                        isTargetBiome = true;
                        break;
                    }
                }
            }
        }

        if (!isTargetBiome) return false;

        if (excludedBiomes) {
            const baseType = this.map.getBaseTileType(elevation, temperature, humidity);
            if (excludedBiomes.includes(baseType)) return false;
        }

        if (minElevation !== undefined && elevation < minElevation) return false;
        if (minHumidity !== undefined && humidity < minHumidity) return false;

        if (avoidAdjacentBiomes) {
            const neighbors = [
                [-1, -1], [0, -1], [1, -1],
                [-1, 0], [1, 0],
                [-1, 1], [0, 1], [1, 1]
            ];
            for (const [dx, dy] of neighbors) {
                const nx = x + dx;
                const ny = y + dy;
                const neighborType = this.map.getBaseTileType(
                    this.map.getElevationAt(nx, ny),
                    this.map.getTemperatureAt(nx, ny),
                    this.map.getHumidityAt(nx, ny)
                );
                if (avoidAdjacentBiomes.includes(neighborType)) return false;
            }
        }

        if (heightRange) {
            if (elevation < heightRange[0] || elevation >= heightRange[1]) return false;
        }
        if (tempRange) {
            if (temperature < tempRange[0] || temperature >= tempRange[1]) return false;
        }
        if (humidRange) {
            if (humidity < humidRange[0] || humidity >= humidRange[1]) return false;
        }

        return true;
    }

    generateResourceInChunk(cx, cy, resourceConfig) {
        const size = this.map.chunkSize;
        const offsetX = cx * size;
        const offsetY = cy * size;
        const { resourceId, spawnChance, spreadChance, iterations, lifeRules } = resourceConfig;

        const grid = [];
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                const wx = offsetX + x;
                const wy = offsetY + y;

                const elev = this.map.getElevationAt(wx, wy);
                const temp = this.map.getTemperatureAt(wx, wy);
                const humid = this.map.getHumidityAt(wx, wy);

                let baseType = 4;
                for (const type of this.map.tileTypes) {
                    if (elev >= type.heightmin && elev < type.heightmax &&
                        temp >= type.tempmin && temp < type.tempmax &&
                        humid >= type.humidmin && humid < type.humidmax) {
                        baseType = type.id;
                        break;
                    }
                }

                const eligible = this.isEligible(wx, wy, elev, temp, humid, resourceConfig) &&
                    (!resourceConfig.requireBaseType || resourceConfig.targetBiomes.includes(baseType));

                grid[y][x] = {
                    type: baseType,
                    hasResource: false,
                    eligible: eligible,
                    elevation: elev,
                    temperature: temp,
                    humidity: humid
                };
            }
        }

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x].eligible) {
                    const wx = offsetX + x;
                    const wy = offsetY + y;

                    const hash = (wx * 374761393 + wy * 668265263 + this.map.seed * 1274126177 + resourceId * 99991) & 0x7fffffff;
                    const random = (hash % 10000) / 10000;
                    const chance = resourceConfig.humidityScaled
                        ? Math.min(1, spawnChance * this.map.getHumiditySpawnMultiplier(grid[y][x].humidity))
                        : spawnChance;

                    if (random < chance) {
                        grid[y][x].hasResource = true;
                        grid[y][x].type = resourceId;
                    }
                }
            }
        }

        const spreadRadius = resourceConfig.spreadRadius || 1;
        const spreadOffsets = [];
        for (let dy = -spreadRadius; dy <= spreadRadius; dy++) {
            for (let dx = -spreadRadius; dx <= spreadRadius; dx++) {
                if (dx === 0 && dy === 0) continue;
                spreadOffsets.push([dx, dy]);
            }
        }

        for (let iter = 0; iter < iterations; iter++) {
            const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (grid[y][x].hasResource) continue;
                    if (!grid[y][x].eligible) continue;

                    let resourceNeighbors = 0;
                    for (const [dx, dy] of spreadOffsets) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                            if (grid[ny][nx].hasResource) {
                                resourceNeighbors++;
                            }
                        }
                    }

                    if (resourceNeighbors > 0) {
                        const wx = offsetX + x;
                        const wy = offsetY + y;
                        const hash = (wx * 7919 + wy * 104729 + this.map.seed * 99991 + iter * 1337 + resourceId * 7777) & 0x7fffffff;
                        const random = (hash % 10000) / 10000;

                        if (random < spreadChance) {
                            newGrid[y][x].hasResource = true;
                            newGrid[y][x].type = resourceId;
                        }
                    }
                }
            }

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    grid[y][x] = newGrid[y][x];
                }
            }
        }

        if (lifeRules) {
            const lifeGrid = grid.map(row => row.map(cell => ({ ...cell })));
            const { surviveMin, surviveMax, birth } = lifeRules;

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    let resourceNeighbors = 0;
                    const neighbors = [
                        [-1, -1], [0, -1], [1, -1],
                        [-1, 0], [1, 0],
                        [-1, 1], [0, 1], [1, 1]
                    ];

                    for (const [dx, dy] of neighbors) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                            if (grid[ny][nx].hasResource) {
                                resourceNeighbors++;
                            }
                        }
                    }

                    if (grid[y][x].hasResource) {
                        if (resourceNeighbors < surviveMin || resourceNeighbors > surviveMax) {
                            lifeGrid[y][x].hasResource = false;
                            let baseType = 4;
                            for (const type of this.map.tileTypes) {
                                if (lifeGrid[y][x].elevation >= type.heightmin &&
                                    lifeGrid[y][x].elevation < type.heightmax &&
                                    lifeGrid[y][x].temperature >= type.tempmin &&
                                    lifeGrid[y][x].temperature < type.tempmax &&
                                    lifeGrid[y][x].humidity >= type.humidmin &&
                                    lifeGrid[y][x].humidity < type.humidmax) {
                                    baseType = type.id;
                                    break;
                                }
                            }
                            lifeGrid[y][x].type = baseType;
                        }
                    } else {
                        if (resourceNeighbors === birth && grid[y][x].eligible) {
                            lifeGrid[y][x].hasResource = true;
                            lifeGrid[y][x].type = resourceId;
                        }
                    }
                }
            }

            grid.length = 0;
            for (let y = 0; y < size; y++) {
                grid[y] = [];
                for (let x = 0; x < size; x++) {
                    grid[y][x] = lifeGrid[y][x];
                }
            }
        }

        const chunk = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                row.push({
                    elevation: grid[y][x].elevation,
                    temperature: grid[y][x].temperature,
                    humidity: grid[y][x].humidity,
                    type: grid[y][x].type,
                    hasResource: grid[y][x].hasResource
                });
            }
            chunk.push(row);
        }

        return chunk;
    }
}

class MinHeap {
    constructor() {
        this.items = [];
        this.counter = 0;
    }

    get size() {
        return this.items.length;
    }

    push(item) {
        item.order = this.counter++;
        this.items.push(item);
        this.bubbleUp(this.items.length - 1);
    }

    pop() {
        const top = this.items[0];
        const last = this.items.pop();
        if (this.items.length > 0) {
            this.items[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    isHigherPriority(a, b) {
        return a.priority < b.priority ||
            (a.priority === b.priority && a.order < b.order);
    }

    bubbleUp(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (!this.isHigherPriority(this.items[index], this.items[parent])) break;
            [this.items[index], this.items[parent]] = [this.items[parent], this.items[index]];
            index = parent;
        }
    }

    sinkDown(index) {
        const length = this.items.length;
        while (true) {
            let smallest = index;
            const left = index * 2 + 1;
            const right = left + 1;

            if (left < length && this.isHigherPriority(this.items[left], this.items[smallest])) {
                smallest = left;
            }
            if (right < length && this.isHigherPriority(this.items[right], this.items[smallest])) {
                smallest = right;
            }
            if (smallest === index) break;

            [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
            index = smallest;
        }
    }
}

// Terrain passability is a speed multiplier: 1 means open ground, lower values
// are slower. Travel time is divided by this value, so 0.5 means twice as long.
// Values reflect walking through the terrain or swimming across water.
// Monthly vegetation growth. Every unit in a stage independently attempts to
// advance one step when the calendar month changes.
const MONTHLY_VEGETATION_BASE_CHANCES = Object.freeze({
    fertileToGrass: 0.2,
    grassToBushes: 0.1,
    bushesToTrees: 0.4,
});

// Tile-type multipliers. Forest is faster, Dark Forest is fully saturated in
// one month, and Desert is five times slower than the default.
const TILE_VEGETATION_GROWTH_MULTIPLIERS = Object.freeze({
    4: 1.0,   // Plains
    5: 1.5,   // Forest
    6: 10.0,  // Dark Forest / DenseForest: all stages reach 100%
    7: 0.8,   // Hills
    8: 0.5,   // Mountains
    9: 0.3,   // Snowy Mountains
    10: 0.2,  // Desert: five times lower than default
    11: 0.8,  // Savanna
    12: 1.2,  // Taiga
    13: 0.6,  // Tundra
    14: 1.3,  // Swamp
    15: 2.0,  // Jungle
    19: 1.5,  // Oasis
    89: 1.5,  // Autumn Forest
    90: 1.5,  // Elven Forest
    91: 1.2,  // Meadows
});

function getTileVegetationGrowthMultiplier(typeId) {
    const id = Number(typeId);
    return Number.isFinite(id) && TILE_VEGETATION_GROWTH_MULTIPLIERS[id] !== undefined
        ? TILE_VEGETATION_GROWTH_MULTIPLIERS[id]
        : 1;
}

function randomNormalSample() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Efficient binomial count. Small/edge cases are rolled exactly; large counts
// use a normal approximation so a long-running world does not stall on the
// monthly update.
function rollMonthlyGrowthCount(amount, chance) {
    const n = Math.max(0, Number(amount) || 0);
    const p = Math.max(0, Math.min(1, Number(chance) || 0));
    if (n <= 0 || p <= 0) return 0;
    if (p >= 1) return n;

    const whole = Math.floor(n);
    let successes = 0;
    if (whole <= 80 || whole * p < 12 || whole * (1 - p) < 12) {
        for (let index = 0; index < whole; index++) {
            if (Math.random() < p) successes += 1;
        }
    } else {
        const mean = whole * p;
        const deviation = Math.sqrt(whole * p * (1 - p));
        successes = Math.round(mean + deviation * randomNormalSample());
        successes = Math.max(0, Math.min(whole, successes));
    }

    const fraction = n - whole;
    if (fraction > 0 && Math.random() < p * fraction) {
        successes += fraction;
    }
    return successes;
}

const TILE_PASSABILITY_BY_ID = Object.freeze({
    0: 0.12,  // Deep Ocean: long open-water swim
    1: 0.26,  // Ocean
    2: 0.5,  // Shallows: wading and swimming
    3: 1.4,  // Beach: loose sand and occasional water
    4: 1.9,  // Plains: mostly open ground
    5: 1.00,  // Forest: trees and undergrowth
    6: 0.80,  // Dark Forest: dense trees
    7: 0.9,  // Hills: rocky slopes
    8: 0.70,  // Mountains
    9: 0.60,  // Snowy Mountains
    10: 1.35, // Desert: loose sand
    11: 1.60, // Savanna: grass and scattered bushes
    12: 1.00, // Taiga
    13: 1.1, // Tundra
    14: 0.60, // Swamp
    15: 0.7, // Jungle
    16: 0.40, // Mountain Peaks
    17: 0.60, // Iceberg: ice and cold water
    18: 1.1, // Winter Beach
    19: 1.5, // Oasis
    20: 1.0, // Lake: mixed water and shore
    99: 1.1, // Clay: sticky ground
    98: 0.70, // Iron
    96: 0.70, // Copper
    95: 0.80, // Gold
    94: 1.00, // Marble
    93: 0.70, // Obsidian
    92: 0.30, // Corals: jagged shallows
    97: 0.50, // Tar: heavy, sticky ground
    91: 1.00, // Meadows: easiest walking
    90: 1.10, // Elven Forest
    89: 1.00, // Autumn Forest
    88: 0.70, // Tin
    87: 0.24, // Volcano: lava, magma and obsidian
    86: 0.80, // Mana Pool
});

class WorldGen {
    constructor(seed = Math.floor(Math.random() * 1000000), options = {}) {
        this.chunkSize = options.chunkSize ?? 16;
        this.spaceCapacity = options.spaceCapacity ?? 1000;
        this.seed = seed;
        this.noise = new PerlinNoise(this.seed);
        this.frequency = options.frequency ?? 0.06;

        this.volcanoChance = 0.0333;
        this.manaPoolChance = 0.001667;
        this.oasisSpawnChance = 0.0025;
        this.oasisMinDistance = 5;

        this.chunks = new Map();
        this.resourceGenerator = new ResourceGenerator(this);

        this.riverLinks = new Map();
        this.tracedRiverSources = new Set();
        this.riverSourceCache = new Map();
        this.lakeRiverSourceCache = new Map();
        this.lakeGridCache = new Map();
        this.elevationCache = new Map();
        this.temperatureCache = new Map();
        this.humidityCache = new Map();
        this.volcanoCache = new Map();
        this.manaPoolCache = new Map();
        this.emptyRiverLinks = [];
        this.riverDirs = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];
        this.riverSourceSpacing = 3;
        this.riverSourceChance = 1;
        this.riverScanMargin = 64;
        this.riverUphillPenalty = 500;
        this.riverSearchLimit = 6000;
        this.riverBranchChance = 0.04;
        this.maxBranchesPerRiver = 2;
        this.maxRiversAround = 2;
        this.lakeRiverSourceSpacing = 2;
        this.lakeRiverSourceChance = 1;
        this.lakeRiverMouthMinDistance = 7;

        this.tileTypes = [
            { id: 0, name: 'Deep Ocean', color: '#0a1a3a', char: '🌊', heightmin: -1.0, heightmax: -0.6, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { SaltWater: 100 }  },
            { id: 1, name: 'Ocean', color: '#1a3a6a', char: '🌊', heightmin: -0.6, heightmax: -0.3, tempmin: 0.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { SaltWater: 100 }  },
            { id: 2, name: 'Shallows', color: '#2a5a8a', char: '🌊', heightmin: -0.3, heightmax: -0.1, tempmin: 0.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0 , spaceRates: { SaltWater: 100 }  },
            { id: 3, name: 'Beach', color: '#c9b07a', char: '🏖️', heightmin: -0.1, heightmax: 0.0, tempmin: 0.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { SaltWater: 40, Sand: 10, Tree:5, Bushes: 5, Grass: 5, Rock: 5, EmptySpace: 30 }  },
            { id: 4, name: 'Plains', color: '#4a8a4a', char: '🌿', heightmin: 0.0, heightmax: 0.15, tempmin: 0.0, tempmax: 0.7, humidmin: -2.0, humidmax: 0.3, spaceRates: { Tree: 5, Grass: 40, FertileLand: 25, Bushes: 10, Water: 5, Rock: 5, EmptySpace: 10 }  },
            { id: 5, name: 'Forest', color: '#2a7a2a', char: '🌲', heightmin: 0.15, heightmax: 0.25, tempmin: 0.0, tempmax: 0.7, humidmin: -2.0, humidmax: 0.3, spaceRates: { Tree: 40, FertileLand: 10, Bushes: 20, Water: 5, Rock: 15, EmptySpace: 10 } },
            { id: 6, name: 'Dark Forest', color: '#1a5a1a', char: '🌳', heightmin: 0.25, heightmax: 0.35, tempmin: 0.0, tempmax: 0.7, humidmin: -2.0, humidmax: 0.3, spaceRates: { Tree: 70, FertileLand: 5, Bushes: 5, Water: 5, Rock: 5, EmptySpace: 10 }  },
            { id: 7, name: 'Hills', color: '#6b9a4a', char: '⛰️', heightmin: 0.35, heightmax: 0.45, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Rock: 50, FertileLand: 5, Grass:5, Bushes: 10, Tree: 15, Water: 5, EmptySpace: 10 }  },
            { id: 8, name: 'Mountains', color: '#7a5a3a', char: '🏔️', heightmin: 0.45, heightmax: 0.6, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Rock: 65, Moss: 5, FertileLand: 5, Bushes: 5, Tree: 5, Water: 5, EmptySpace: 10 }  },
            { id: 9, name: 'Snowy Mountains', color: '#b5d8ff', char: '❄️', heightmin: 0.6, heightmax: 0.75, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Tree: 70, Snow: 20, EmptySpace: 10 }  },
            { id: 10, name: 'Desert', color: '#c9c87a', char: '🏜️', heightmin: 0.0, heightmax: 0.45, tempmin: 0.6, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Sand: 70, Bushes: 5, Rock: 5, EmptySpace: 20 }  },
            { id: 11, name: 'Savanna', color: '#a58a4a', char: '🌾', heightmin: 0.0, heightmax: 0.15, tempmin: 0.0, tempmax: 0.7, humidmin: -2.0, humidmax: 0.3, spaceRates: { Grass: 50, FertileLand: 10, Bushes: 10, Tree: 5, Water: 5, Rock: 10, EmptySpace: 10 }  },
            { id: 12, name: 'Taiga', color: '#2a6a4a', char: '🌲', heightmin: 0.15, heightmax: 0.45, tempmin: -0.9, tempmax: 0.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Tree: 40, FertileLand: 10, Snow: 10, Bushes: 5, Moss: 5, Water: 5, Rock: 15, EmptySpace: 10 }  },
            { id: 13, name: 'Tundra', color: '#8a9aa5', char: '🌿', heightmin: 0.0, heightmax: 0.45, tempmin: -2.0, tempmax: 0.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Grass: 30, Snow: 30, Moss: 10, Water: 5, Rock: 15, EmptySpace: 10 }  },
            { id: 14, name: 'Swamp', color: '#4a7a4a', char: '🪷', heightmin: 0.0, heightmax: 0.15, tempmin: 0.0, tempmax: 0.7, humidmin: 0.3, humidmax: 2.0, spaceRates: { Tree: 20, FertileLand: 20, Swamp: 40, Bushes: 5, Rock: 5, EmptySpace: 10 } },
            { id: 15, name: 'Jungle', color: '#2a9a2a', char: '🌴', heightmin: 0.15, heightmax: 0.45, tempmin: 0.0, tempmax: 2.0, humidmin: 0.3, humidmax: 2.0, spaceRates: { Tree: 40, FertileLand: 5, Swamp: 20, Bushes: 10, Water: 5, Rock: 10, EmptySpace: 10 }  },
            { id: 16, name: 'Mountain Peaks', color: '#9598ff', char: '🏔️', heightmin: 0.75, heightmax: 2.0, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Rock: 80, Snow: 20 } },
            { id: 17, name: 'Iceberg', color: '#b5d8ff', char: '🏔️', heightmin: -0.6, heightmax: -0.1, tempmin: -2.0, tempmax: 0.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Ice: 90, SaltWater: 10 }  },
            { id: 18, name: 'Winter Beach', color: '#9598ff', char: '🏖️', heightmin: -0.1, heightmax: 0.0, tempmin: -2.0, tempmax: 0.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { SaltWater: 30, Sand: 10, Snow: 30, Tree:5, Bushes: 5, Grass: 5, Rock: 5, EmptySpace: 10 }  },
            { id: 19, name: 'Oasis', color: '#2a9d8f', char: '🌴', heightmin: 0.0, heightmax: 0.45, tempmin: 0.6, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Sand: 40, Water: 10, FertileLand: 10, Tree: 10, Bushes: 5, Rock: 5, EmptySpace: 20 }   },
            { id: 20, name: 'Lake', color: '#1f7a8c', char: '💧', heightmin: 0.1, heightmax: 2.0, tempmin: -2.0, tempmax: 2.0, humidmin: -0.3, humidmax: 2.0, spaceRates: { Water: 40, FertileLand: 10, Tree: 10, Bushes: 5, Rock: 15, EmptySpace: 20 } },
            { id: 99, name: 'Clay', color: '#b87333', char: '🧱', heightmin: -0.1, heightmax: 0.0, tempmin: 0.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Clay: 40, Water: 10, FertileLand: 5, Tree: 5, Bushes: 5, Rock: 15, EmptySpace: 20 }  },
            { id: 98, name: 'Iron', color: '#a8a8a8', char: '⛏️', heightmin: 0.35, heightmax: 0.45, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Iron: 40, Tree: 10, FertileLand: 10, Swamp: 20, Bushes: 5, Rock: 5, EmptySpace: 10 } },
            { id: 96, name: 'Copper', color: '#c8752f', char: '🔶', heightmin: 0.35, heightmax: 0.6, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Copper: 40, Tree: 20, FertileLand: 10, Bushes: 10, Water: 5, Rock: 5, EmptySpace: 10 } },
            { id: 95, name: 'Gold', color: '#ffd700', char: '🪙', heightmin: 0.45, heightmax: 0.75, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Gold: 40, Rock: 55, EmptySpace: 5 }   },
            { id: 94, name: 'Marble', color: '#e8e8e8', char: '⬜', heightmin: 0.35, heightmax: 0.6, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Marble: 40, Rock: 25, Moss: 5, FertileLand: 5, Bushes: 5, Tree: 5, Water: 5, EmptySpace: 10 } },
            { id: 93, name: 'Obsidian', color: '#2b2b3a', char: '⬛', heightmin: 0.35, heightmax: 0.6, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Obsidian: 40, Rock: 25, Moss: 5, FertileLand: 5, Bushes: 5, Tree: 5, Water: 5, EmptySpace: 10 } },
            { id: 92, name: 'Corals', color: '#2a9aaa', char: '🪸', heightmin: -0.3, heightmax: -0.1, tempmin: 0.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { SaltWater: 50, Coral: 35,Rock: 5, EmptySpace: 10} },
            { id: 97, name: 'Tar', color: '#1a0a0a', char: '🖤', heightmin: 0.0, heightmax: 0.15, tempmin: 0.0, tempmax: 2.0, humidmin: 0.3, humidmax: 2.0, spaceRates: { Tar: 40, Tree: 10, FertileLand: 10, Swamp: 20, Bushes: 5, Rock: 5, EmptySpace: 10 } },
            { id: 91, name: 'Meadows', color: '#5a8a4a', char: '🌾', heightmin: 0.0, heightmax: 0.15, tempmin: 0.0, tempmax: 0.5, humidmin: -2.0, humidmax: 0.5, spaceRates: { Tree: 5, Grass: 45, FertileLand: 25, Bushes: 5, Water: 5, Rock: 5, EmptySpace: 10 } },
            { id: 90, name: 'Elven Forest', color: '#3ecf8e', char: '🧝', heightmin: 0.15, heightmax: 0.25, tempmin: 0.0, tempmax: 0.5, humidmin: -2.0, humidmax: 0.5, spaceRates: { Tree: 40, FertileLand: 10, Bushes: 20, Water: 5, Rock: 5, ManaPool: 10, EmptySpace: 10 } },
            { id: 89, name: 'Autumn Forest', color: '#e67e22', char: '🍁', heightmin: 0.15, heightmax: 0.45, tempmin: -0.9, tempmax: 0.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Tree: 40, FertileLand: 10, Bushes: 20, Water: 5, Rock: 15, EmptySpace: 10 }  },
            { id: 88, name: 'Tin', color: '#9fb8c8', char: '🔩', heightmin: -0.1, heightmax: 0.45, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Tin: 40, Rock: 10, FertileLand: 5, Grass:5, Bushes: 10, Tree: 15, Water: 5, EmptySpace: 10 } },
            { id: 87, name: 'Volcano', color: '#8b1a0f', char: '🌋', heightmin: 0.45, heightmax: 2.0, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { Lava: 20, Magma: 30, Obsidian: 40, EmptySpace: 10}  },
            { id: 86, name: 'Mana Pool', color: '#8b5cf6', char: '🔮', heightmin: 0.1, heightmax: 0.9, tempmin: -2.0, tempmax: 2.0, humidmin: -2.0, humidmax: 2.0, spaceRates: { ManaPool: 90, EmptySpace: 10 } }
        ];

        this.tileTypes.forEach((type) => {
            if (!type.spaceRates) type.spaceRates = { EmptySpace: 100 };
            const passability = TILE_PASSABILITY_BY_ID[type.id];
            type.passability = Number.isFinite(passability) && passability > 0
                ? passability
                : 1;
        });

        this.resourceConfigs = {
            clay: {
                resourceId: 99,
                targetBiomes: [3, 18],
                spawnChance: 0.04,
                spreadChance: 0.30,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            marble: {
                resourceId: 94,
                targetBiomes: [7, 8],
                heightRange: [0.35, 0.6],
                spawnChance: 0.007,
                spreadChance: 0.24,
                spreadRadius: 2,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            obsidian: {
                resourceId: 93,
                targetBiomes: [7, 8],
                heightRange: [0.35, 0.6],
                spawnChance: 0.006,
                spreadChance: 0.22,
                spreadRadius: 2,
                marbleAvoidRadius: 4,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            coral: {
                resourceId: 92,
                targetBiomes: [2],
                heightRange: [-0.3, -0.1],
                spawnChance: 0.008,
                spreadChance: 0.25,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            meadow: {
                resourceId: 91,
                targetBiomes: [4],
                heightRange: [0.0, 0.15],
                spawnChance: 0.03,
                spreadChance: 0.30,
                spreadRadius: 10,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            elvenForest: {
                resourceId: 90,
                targetBiomes: [5],
                heightRange: [0.15, 0.25],
                spawnChance: 0.008,
                spreadChance: 0.25,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            autumnForest: {
                resourceId: 89,
                targetBiomes: [12],
                requireBaseType: true,
                heightRange: [0.15, 0.45],
                spawnChance: 0.008,
                spreadChance: 0.25,
                spreadRadius: 4,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            tin: {
                resourceId: 88,
                targetBiomes: [3, 5, 6, 12, 15],
                requireBaseType: true,
                heightRange: [-0.1, 0.45],
                spawnChance: 0.004,
                spreadChance: 0.18,
                spreadRadius: 1,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            iron: {
                resourceId: 98,
                targetBiomes: [7, 14],
                requireBaseType: true,
                heightRange: [0.0, 0.45],
                spawnChance: 0.035,
                spreadChance: 0.25,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            copper: {
                resourceId: 96,
                targetBiomes: [5, 6, 7, 8, 13],
                requireBaseType: true,
                heightRange: [0.0, 0.6],
                spawnChance: 0.006,
                spreadChance: 0.23,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            gold: {
                resourceId: 95,
                targetBiomes: [8, 9],
                heightRange: [0.45, 0.75],
                spawnChance: 0.006,
                spreadChance: 0.22,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            tar: {
                resourceId: 97,
                targetBiomes: [14],
                spawnChance: 0.08,
                spreadChance: 0.35,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 }
            },
            lake: {
                resourceId: 20,
                spawnChance: 0.006,
                spreadChance: 0.18,
                iterations: 2,
                lifeRules: { surviveMin: 2, surviveMax: 4, birth: 3 },
                excludedBiomes: [9, 14, 16],
                minElevation: 0.1,
                minHumidity: -0.3,
                avoidAdjacentBiomes: [2, 14],
                humidityScaled: true
            }
        };
    }

    getElevation(x, y) {
        const base = this.noise.fbm(
            x * this.frequency,
            y * this.frequency,
            6, 2.0, 0.5,
            1.0
        );

        const detail = this.noise.perlin3D(
            x * this.frequency * 5,
            y * this.frequency * 5,
            this.seed * 0.01 + 500,
            1.0
        ) * 0.15;

        const continent = this.noise.fbm(
            x * this.frequency * 0.3,
            y * this.frequency * 0.3,
            3, 2.5, 0.4,
            1.0
        ) * 0.9;

        return Math.max(-1, Math.min(2, base + detail + continent));
    }

    getTemperature(x, y) {
        const base = this.noise.fbm(
            x * this.frequency,
            y * this.frequency,
            6, 2.0, 0.5,
            0.5
        );

        const detail = this.noise.perlin3D(
            x * this.frequency * 4,
            y * this.frequency * 4,
            this.seed * 0.05 + 500,
            0.5
        ) * 0.25;

        const continent = this.noise.fbm(
            x * this.frequency * 0.3,
            y * this.frequency * 0.3,
            3, 2.5, 0.4,
            0.5
        ) * 1.5;

        return Math.max(-1, Math.min(2, base + detail + continent));
    }

    getHumidity(x, y) {
        const base = this.noise.fbm(
            x * this.frequency,
            y * this.frequency,
            6, 2.0, 0.5,
            0.7
        );

        const detail = this.noise.perlin3D(
            x * this.frequency * 4,
            y * this.frequency * 4,
            this.seed * 0.03 + 500,
            0.7
        ) * 0.15;

        const continent = this.noise.fbm(
            x * this.frequency * 0.3,
            y * this.frequency * 0.3,
            3, 2.5, 0.4,
            0.7
        ) * 0.5;

        return Math.max(-1, Math.min(2, base + detail + continent));
    }

    getElevationAt(x, y) {
        const key = `${x},${y}`;
        const cached = this.elevationCache.get(key);
        if (cached !== undefined) return cached;

        const value = this.getElevation(x, y);
        if (this.elevationCache.size > 200000) this.elevationCache.clear();
        this.elevationCache.set(key, value);
        return value;
    }

    getTemperatureAt(x, y) {
        const key = `${x},${y}`;
        const cached = this.temperatureCache.get(key);
        if (cached !== undefined) return cached;

        const value = this.getTemperature(x, y);
        if (this.temperatureCache.size > 100000) this.temperatureCache.clear();
        this.temperatureCache.set(key, value);
        return value;
    }

    getHumidityAt(x, y) {
        const key = `${x},${y}`;
        const cached = this.humidityCache.get(key);
        if (cached !== undefined) return cached;

        const value = this.getHumidity(x, y);
        if (this.humidityCache.size > 100000) this.humidityCache.clear();
        this.humidityCache.set(key, value);
        return value;
    }

    getHumiditySpawnMultiplier(humidity) {
        if (humidity <= 0) return 1;
        if (humidity <= 1) return 1 + humidity * 4;
        return humidity * 5;
    }

    getBaseTileType(elevation, temperature, humidity) {
        for (const type of this.tileTypes) {
            if (elevation >= type.heightmin && elevation < type.heightmax &&
                temperature >= type.tempmin && temperature < type.tempmax &&
                humidity >= type.humidmin && humidity < type.humidmax) {
                return type.id;
            }
        }
        return 4;
    }

    getVolcanoCandidate(wx, wy, baseType) {
        if (baseType !== 8 && baseType !== 9 && baseType !== 16) return -1;

        const hash = (wx * 73856093 + wy * 19349663 + this.seed * 83492791 + 0x51ed270b) & 0x7fffffff;
        const random = (hash % 10000) / 10000;
        if (random >= this.volcanoChance) return -1;
        return hash;
    }

    isVolcanoTile(wx, wy, baseType) {
        const priority = this.getVolcanoCandidate(wx, wy, baseType);
        if (priority < 0) return false;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = wx + dx;
                const ny = wy + dy;
                const neighborBaseType = this.getBaseTileType(
                    this.getElevationAt(nx, ny),
                    this.getTemperatureAt(nx, ny),
                    this.getHumidityAt(nx, ny)
                );
                const neighborPriority = this.getVolcanoCandidate(nx, ny, neighborBaseType);
                if (neighborPriority < 0) continue;
                if (neighborPriority > priority) return false;
                if (neighborPriority === priority && (ny > wy || (ny === wy && nx > wx))) return false;
            }
        }

        return true;
    }

    isVolcanoAt(wx, wy) {
        const key = `${wx},${wy}`;
        const cached = this.volcanoCache.get(key);
        if (cached !== undefined) return cached;

        const baseType = this.getBaseTileType(
            this.getElevationAt(wx, wy),
            this.getTemperatureAt(wx, wy),
            this.getHumidityAt(wx, wy)
        );
        const value = this.isVolcanoTile(wx, wy, baseType);
        if (this.volcanoCache.size > 100000) this.volcanoCache.clear();
        this.volcanoCache.set(key, value);
        return value;
    }

    isManaPoolTile(wx, wy, elevation) {
        if (elevation <= 0.1 || elevation >= 0.9) return false;

        const hash = (wx * 73856093 + wy * 19349663 + this.seed * 83492791 + 0x2545f491) & 0x7fffffff;
        const random = (hash % 10000) / 10000;
        return random < this.manaPoolChance;
    }

    isManaPoolAt(wx, wy) {
        const key = `${wx},${wy}`;
        const cached = this.manaPoolCache.get(key);
        if (cached !== undefined) return cached;

        const value = this.isManaPoolTile(wx, wy, this.getElevationAt(wx, wy));
        if (this.manaPoolCache.size > 100000) this.manaPoolCache.clear();
        this.manaPoolCache.set(key, value);
        return value;
    }

    getOasisCandidate(wx, wy, elevation, temperature, humidity) {
        if (this.getBaseTileType(elevation, temperature, humidity) !== 10) return -1;

        const hash = (wx * 73856093 + wy * 19349663 + this.seed * 83492791 + 0x5bd1e995) & 0x7fffffff;
        const random = (hash % 1000000) / 1000000;
        if (random >= this.oasisSpawnChance) return -1;
        return hash;
    }

    isOasisTile(wx, wy, elevation, temperature, humidity) {
        const priority = this.getOasisCandidate(wx, wy, elevation, temperature, humidity);
        if (priority < 0) return false;

        const range = this.oasisMinDistance - 1;
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = wx + dx;
                const ny = wy + dy;
                const neighborPriority = this.getOasisCandidate(
                    nx, ny,
                    this.getElevationAt(nx, ny),
                    this.getTemperatureAt(nx, ny),
                    this.getHumidityAt(nx, ny)
                );
                if (neighborPriority < 0) continue;
                if (neighborPriority > priority) return false;
                if (neighborPriority === priority && (ny > wy || (ny === wy && nx > wx))) return false;
            }
        }
        return true;
    }

    getLakeGrid(cx, cy) {
        const key = `${cx},${cy}`;
        let grid = this.lakeGridCache.get(key);
        if (!grid) {
            grid = this.resourceGenerator.generateResourceInChunk(cx, cy, this.resourceConfigs.lake);
            this.lakeGridCache.set(key, grid);
        }
        return grid;
    }

    isLakeTile(x, y, elevation, temperature, humidity, baseType) {
        if (elevation === undefined) elevation = this.getElevationAt(x, y);
        if (elevation < 0.1) return false;
        if (temperature === undefined) temperature = this.getTemperatureAt(x, y);
        if (humidity === undefined) humidity = this.getHumidityAt(x, y);
        if (humidity < -0.3) return false;
        if (baseType === undefined) baseType = this.getBaseTileType(elevation, temperature, humidity);
        if (baseType === 9 || baseType === 14 || baseType === 16) return false;

        const cx = Math.floor(x / this.chunkSize);
        const cy = Math.floor(y / this.chunkSize);
        const lx = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const ly = ((y % this.chunkSize) + this.chunkSize) % this.chunkSize;
        return this.getLakeGrid(cx, cy)[ly][lx].type === 20;
    }

    isRiverSource(wx, wy) {
        const key = `${wx},${wy}`;
        if (this.riverSourceCache.has(key)) return this.riverSourceCache.get(key);

        let result = false;
        const hash = (wx * 374761393 + wy * 668265263 + this.seed * 1274126177) & 0x7fffffff;
        const random = (hash % 10000) / 10000;

        const elevation = this.getElevationAt(wx, wy);
        if (random < this.riverSourceChance &&
            !this.isVolcanoAt(wx, wy) &&
            !this.isManaPoolAt(wx, wy) &&
            (elevation >= 0.45 || this.isLakeTile(wx, wy, elevation))) {
            result = true;
        }

        this.riverSourceCache.set(key, result);
        return result;
    }

    isLakeRiverSource(wx, wy) {
        const key = `${wx},${wy}`;
        if (this.lakeRiverSourceCache.has(key)) return this.lakeRiverSourceCache.get(key);

        let result = false;
        if (this.lakeRiverSourceChance > 0 && !this.isVolcanoAt(wx, wy) && !this.isManaPoolAt(wx, wy) && this.isLakeTile(wx, wy)) {
            if (this.lakeRiverSourceChance >= 1) {
                result = true;
            } else {
                const hash = (wx * 374761393 + wy * 668265263 + this.seed * 2246822519 + 1013904223) & 0x7fffffff;
                result = (hash % 10000) / 10000 < this.lakeRiverSourceChance;
            }
        }

        this.lakeRiverSourceCache.set(key, result);
        return result;
    }

    markRiverLink(x1, y1, x2, y2) {
        const k1 = `${x1},${y1}`;
        const k2 = `${x2},${y2}`;
        if (!this.riverLinks.has(k1)) this.riverLinks.set(k1, new Set());
        if (!this.riverLinks.has(k2)) this.riverLinks.set(k2, new Set());
        this.riverLinks.get(k1).add(`${x2 - x1},${y2 - y1}`);
        this.riverLinks.get(k2).add(`${x1 - x2},${y1 - y2}`);
    }

    getRiverLinks(wx, wy) {
        const links = this.riverLinks.get(`${wx},${wy}`);
        if (!links) return this.emptyRiverLinks;
        return Array.from(links, (link) => link.split(',').map(Number));
    }

    countRiversAround(x, y, currentKey) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const key = `${x + dx},${y + dy}`;
                if (key === currentKey || this.riverLinks.has(key)) count++;
            }
        }
        return count;
    }

    isRiverMouth(x, y, elevation, allowLake = true) {
        if (elevation < -0.6) return false;

        const temperature = this.getTemperatureAt(x, y);
        if (elevation < -0.1) {
            if (temperature < 0) return true;
            return elevation >= -0.3;
        }

        const humidity = this.getHumidityAt(x, y);
        const baseType = this.getBaseTileType(elevation, temperature, humidity);
        if (baseType === 14) return true;
        return allowLake && this.isLakeTile(x, y, elevation, temperature, humidity, baseType);
    }

    findRiverPath(sx, sy, blockedStartKeys = null, blockedKeys = null) {
        const startKey = `${sx},${sy}`;
        if (this.isVolcanoAt(sx, sy) || this.isManaPoolAt(sx, sy)) return null;
        const startIsLake = this.isLakeTile(sx, sy);
        const lakeMouthDistanceSq = this.lakeRiverMouthMinDistance ** 2;
        const open = new MinHeap();
        const gScore = new Map([[startKey, 0]]);
        const cameFrom = new Map();
        const closed = new Set();

        open.push({ x: sx, y: sy, key: startKey, g: 0, priority: 0, dirIndex: -1, streak: 0 });
        let expanded = 0;

        while (open.size > 0 && expanded < this.riverSearchLimit) {
            const node = open.pop();
            if (closed.has(node.key)) continue;
            closed.add(node.key);
            expanded++;

            const elevation = this.getElevationAt(node.x, node.y);
            const allowLakeMouth = !startIsLake ||
                (node.x - sx) ** 2 + (node.y - sy) ** 2 > lakeMouthDistanceSq;
            const nodeIsLake = !allowLakeMouth && this.isLakeTile(node.x, node.y, elevation);

            if (elevation < -0.1) {
                if (node.key !== startKey && this.isRiverMouth(node.x, node.y, elevation, allowLakeMouth)) {
                    return this.reconstructRiverPath(cameFrom, node.key);
                }
                continue;
            }

            if (node.key !== startKey && this.isRiverMouth(node.x, node.y, elevation, allowLakeMouth)) {
                return this.reconstructRiverPath(cameFrom, node.key);
            }

            if (node.key !== startKey && this.riverLinks.has(node.key) &&
                (allowLakeMouth || !this.isLakeTile(node.x, node.y))) {
                return this.reconstructRiverPath(cameFrom, node.key);
            }

            for (let dirIndex = 0; dirIndex < this.riverDirs.length; dirIndex++) {
                const [dx, dy] = this.riverDirs[dirIndex];
                const nx = node.x + dx;
                const ny = node.y + dy;
                const key = `${nx},${ny}`;
                if (closed.has(key)) continue;
                if (this.isVolcanoAt(nx, ny) || this.isManaPoolAt(nx, ny)) continue;
                if (nodeIsLake && this.isLakeTile(nx, ny)) continue;

                const streak = dirIndex === node.dirIndex ? node.streak + 1 : 1;
                if (streak > 2) continue;

                if (blockedStartKeys && node.key === startKey && blockedStartKeys.has(key)) continue;
                if (blockedKeys && blockedKeys.has(key)) continue;

                if (!this.riverLinks.has(key) &&
                    this.countRiversAround(nx, ny, node.key) > this.maxRiversAround) continue;

                if (dx !== 0 && dy !== 0) {
                    const sideA = `${node.x + dx},${node.y}`;
                    const sideB = `${node.x},${node.y + dy}`;
                    if (this.riverLinks.has(sideA) && this.riverLinks.has(sideB)) continue;
                }

                const neighborElevation = this.getElevationAt(nx, ny);
                const distance = (dx !== 0 && dy !== 0) ? Math.SQRT2 : 1;
                const rise = Math.max(0, neighborElevation - elevation);
                const stepCost = distance + rise * this.riverUphillPenalty;
                const tentativeG = node.g + stepCost;

                if (tentativeG < (gScore.get(key) ?? Infinity)) {
                    gScore.set(key, tentativeG);
                    cameFrom.set(key, node.key);
                    open.push({
                        x: nx,
                        y: ny,
                        key,
                        g: tentativeG,
                        priority: tentativeG,
                        dirIndex,
                        streak
                    });
                }
            }
        }

        return null;
    }

    reconstructRiverPath(cameFrom, endKey) {
        const path = [endKey];
        let key = endKey;
        while (cameFrom.has(key)) {
            key = cameFrom.get(key);
            path.push(key);
        }
        path.reverse();
        return path;
    }

    markRiverPath(path) {
        let previous = null;
        for (const key of path) {
            const comma = key.indexOf(',');
            const x = Number(key.slice(0, comma));
            const y = Number(key.slice(comma + 1));

            if (previous) {
                this.markRiverLink(previous.x, previous.y, x, y);
            }
            previous = { x, y };
        }
    }

    shouldBranchRiver(x, y) {
        const hash = (x * 374761393 + y * 668265263 + this.seed * 2246822519 + 1013904223) & 0x7fffffff;
        const random = (hash % 10000) / 10000;
        return random < this.riverBranchChance;
    }

    traceRiverBranch(sx, sy, blockedStartKeys, blockedKeys) {
        const path = this.findRiverPath(sx, sy, blockedStartKeys, blockedKeys);
        if (!path || path.length < 3) return false;
        this.markRiverPath(path);
        return true;
    }

    createRiverBranches(path) {
        if (this.maxBranchesPerRiver <= 0 || this.riverBranchChance <= 0) return;

        const parentKeys = new Set(path);
        let branches = 0;
        for (let i = 2; i < path.length - 2 && branches < this.maxBranchesPerRiver; i++) {
            const startKey = path[i];
            const links = this.riverLinks.get(startKey);
            if (!links || links.size !== 2) continue;

            const comma = startKey.indexOf(',');
            const x = Number(startKey.slice(0, comma));
            const y = Number(startKey.slice(comma + 1));
            if (!this.shouldBranchRiver(x, y)) continue;

            const blockedStartKeys = new Set();
            for (const link of links) {
                const [dx, dy] = link.split(',').map(Number);
                blockedStartKeys.add(`${x + dx},${y + dy}`);
            }

            const blockedKeys = new Set(parentKeys);
            blockedKeys.delete(startKey);

            if (this.traceRiverBranch(x, y, blockedStartKeys, blockedKeys)) {
                branches++;
            }
        }
    }

    traceRiverFrom(sx, sy) {
        const sourceKey = `${sx},${sy}`;
        if (this.tracedRiverSources.has(sourceKey)) return;
        this.tracedRiverSources.add(sourceKey);

        if (this.riverLinks.has(sourceKey)) return;

        const path = this.findRiverPath(sx, sy);
        if (!path || path.length < 2) return;

        this.markRiverPath(path);
        this.createRiverBranches(path);
    }

    ensureRiversForChunk(cx, cy) {
        const size = this.chunkSize;
        const margin = this.riverScanMargin;
        const spacing = this.riverSourceSpacing;

        const startI = Math.floor((cx * size - margin) / spacing);
        const endI = Math.floor(((cx + 1) * size + margin) / spacing);
        const startJ = Math.floor((cy * size - margin) / spacing);
        const endJ = Math.floor(((cy + 1) * size + margin) / spacing);

        for (let j = startJ; j <= endJ; j++) {
            for (let i = startI; i <= endI; i++) {
                const sx = i * spacing;
                const sy = j * spacing;
                if (this.isRiverSource(sx, sy)) {
                    this.traceRiverFrom(sx, sy);
                }
            }
        }

        const lakeSpacing = this.lakeRiverSourceSpacing;
        if (lakeSpacing > 0 && lakeSpacing < spacing) {
            const lakeStartI = Math.floor((cx * size - margin) / lakeSpacing);
            const lakeEndI = Math.floor(((cx + 1) * size + margin) / lakeSpacing);
            const lakeStartJ = Math.floor((cy * size - margin) / lakeSpacing);
            const lakeEndJ = Math.floor(((cy + 1) * size + margin) / lakeSpacing);

            for (let j = lakeStartJ; j <= lakeEndJ; j++) {
                for (let i = lakeStartI; i <= lakeEndI; i++) {
                    const sx = i * lakeSpacing;
                    const sy = j * lakeSpacing;
                    if (this.isLakeRiverSource(sx, sy)) {
                        this.traceRiverFrom(sx, sy);
                    }
                }
            }
        }
    }

    resetRivers() {
        this.riverLinks.clear();
        this.tracedRiverSources.clear();
        this.riverSourceCache.clear();
        this.lakeRiverSourceCache.clear();
        this.elevationCache.clear();
        this.temperatureCache.clear();
        this.humidityCache.clear();
        this.volcanoCache.clear();
        this.manaPoolCache.clear();
        this.lakeGridCache.clear();
    }

    getChunkKey(cx, cy) {
        return `${cx},${cy}`;
    }

    getSpaceRates(typeId) {
        const type = this.tileTypes.find((tileType) => tileType.id === typeId);
        const rates = type && type.spaceRates;
        if (!rates || typeof rates !== "object") return { EmptySpace: 100 };

        const entries = Object.entries(rates).filter(([, rate]) => Number(rate) > 0);
        if (entries.length === 0) return { EmptySpace: 100 };

        const normalizedRates = {};
        entries.forEach(([element, rate]) => {
            const name = normalizeSpaceElementName(element);
            normalizedRates[name] = (normalizedRates[name] || 0) + Number(rate);
        });
        return normalizedRates;
    }

    createTileSpace(typeId, hasRiver = false, temperature = null, humidity = null) {
        const rates = this.getSpaceRates(typeId);
        const entries = Object.entries(rates).map(([element, rate]) => [element, Number(rate)]);
        const total = entries.reduce((sum, [, rate]) => sum + rate, 0);
        let space;

        if (entries.length === 1) {
            space = { [entries[0][0]]: this.spaceCapacity };
        } else {
            space = {};
            for (let i = 0; i < this.spaceCapacity; i++) {
                let roll = Math.random() * total;
                let element = entries[entries.length - 1][0];

                for (const [name, rate] of entries) {
                    roll -= rate;
                    if (roll < 0) {
                        element = name;
                        break;
                    }
                }

                space[element] = (space[element] || 0) + 1;
            }
        }

        if (hasRiver) {
            const converted = Math.floor((space.EmptySpace || 0) / 2);
            if (converted > 0) {
                space.EmptySpace -= converted;
                space.River = (space.River || 0) + converted;
            }
        }

        this.replaceTreeSpecies(space, temperature, humidity);

        return space;
    }

    // Replaces part of the generic Tree space with climate-appropriate fruit or
    // nut trees. The total space is unchanged: one Tree becomes one species.
    replaceTreeSpecies(space, temperature, humidity) {
        if (!space) return;

        const treeCount = Number(space.Tree) || 0;
        if (treeCount <= 0) return;
        if (typeof getEligibleTreeSpecies !== "function") return;

        const eligible = getEligibleTreeSpecies(temperature, humidity);
        if (eligible.length === 0) return;

        const chance = typeof TREE_SPECIES_REPLACEMENT_CHANCE === "number"
            ? TREE_SPECIES_REPLACEMENT_CHANCE
            : 0.4;

        for (let index = 0; index < treeCount; index++) {
            if (Math.random() >= chance) continue;

            const species = eligible[Math.floor(Math.random() * eligible.length)];
            if (!species) continue;

            space.Tree -= 1;
            space[species.name] = (space[species.name] || 0) + 1;
        }

        if (space.Tree <= 0) delete space.Tree;
    }

    // Advances one vegetation stage on a single tile. Stage counts are captured
    // before any changes, so freshly grown Grass/Bushes cannot immediately
    // advance again during the same monthly tick. Completely unscouted tiles
    // (0% revealed) are skipped entirely.
    growVegetationOnTile(tile) {
        if (!tile || !tile.space) return;
        if (!(Number(tile.revealed) > 0)) return;

        const multiplier = getTileVegetationGrowthMultiplier(tile.type);
        const fertileToGrassChance = Math.min(
            1,
            MONTHLY_VEGETATION_BASE_CHANCES.fertileToGrass * multiplier
        );
        const grassToBushesChance = Math.min(
            1,
            MONTHLY_VEGETATION_BASE_CHANCES.grassToBushes * multiplier
        );
        const bushesToTreesChance = Math.min(
            1,
            MONTHLY_VEGETATION_BASE_CHANCES.bushesToTrees * multiplier
        );

        const fertile = Math.max(0, Number(tile.space.FertileLand) || 0);
        const grass = Math.max(0, Number(tile.space.Grass) || 0);
        const bushes = Math.max(0, Number(tile.space.Bushes) || 0);
        const trees = Math.max(0, Number(tile.space.Tree) || 0);

        const fertileToGrass = rollMonthlyGrowthCount(fertile, fertileToGrassChance);
        const grassToBushes = rollMonthlyGrowthCount(grass, grassToBushesChance);
        const bushesToTrees = rollMonthlyGrowthCount(bushes, bushesToTreesChance);

        if (fertileToGrass <= 0 && grassToBushes <= 0 && bushesToTrees <= 0) {
            return;
        }

        const setSpace = function (name, value) {
            const rounded = round2(Math.max(0, value));
            if (rounded > 0) {
                tile.space[name] = rounded;
            } else {
                delete tile.space[name];
            }
        };

        setSpace("FertileLand", fertile - fertileToGrass);
        setSpace("Grass", grass + fertileToGrass - grassToBushes);
        setSpace("Bushes", bushes + grassToBushes - bushesToTrees);
        setSpace("Tree", trees + bushesToTrees);
    }

    // Every generated tile shares the same monthly harvest reset, not only the
    // tile the player is standing on. Vegetation growth happens in this same
    // monthly tick. Tiles that have never been scouted are left untouched.
    resetHarvestedTrees() {
        const world = this;
        this.chunks.forEach(function (chunk) {
            chunk.forEach(function (row) {
                row.forEach(function (tile) {
                    if (!tile) return;
                    if (!(Number(tile.revealed) > 0)) return;
                    tile.harvestedTrees = {};
                    world.growVegetationOnTile(tile);
                });
            });
        });
    }

    generateChunk(cx, cy) {
        this.ensureRiversForChunk(cx, cy);

        const size = this.chunkSize;
        const offsetX = cx * size;
        const offsetY = cy * size;

        const grid = [];
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                const wx = offsetX + x;
                const wy = offsetY + y;
                const elev = this.getElevationAt(wx, wy);
                const temp = this.getTemperature(wx, wy);
                const humid = this.getHumidity(wx, wy);

                let baseType = 4;
                for (const type of this.tileTypes) {
                    if (elev >= type.heightmin && elev < type.heightmax &&
                        temp >= type.tempmin && temp < type.tempmax &&
                        humid >= type.humidmin && humid < type.humidmax) {
                        baseType = type.id;
                        break;
                    }
                }

                if (this.isVolcanoTile(wx, wy, baseType)) baseType = 87;

                grid[y][x] = {
                    elevation: elev,
                    temperature: temp,
                    humidity: humid,
                    type: baseType,
                    hasResource: false
                };
            }
        }

        for (const [key, config] of Object.entries(this.resourceConfigs)) {
            const resourceGrid = key === 'lake'
                ? this.getLakeGrid(cx, cy)
                : this.resourceGenerator.generateResourceInChunk(cx, cy, config);

            let isNearMarble = null;
            if (key === 'obsidian' && config.marbleAvoidRadius) {
                const avoidRadius = config.marbleAvoidRadius;
                const marbleGrids = new Map();
                const getMarbleGrid = (mcx, mcy) => {
                    const mk = `${mcx},${mcy}`;
                    if (!marbleGrids.has(mk)) {
                        marbleGrids.set(mk, this.resourceGenerator.generateResourceInChunk(mcx, mcy, this.resourceConfigs.marble));
                    }
                    return marbleGrids.get(mk);
                };
                isNearMarble = (wx, wy) => {
                    for (let dy = -avoidRadius; dy <= avoidRadius; dy++) {
                        for (let dx = -avoidRadius; dx <= avoidRadius; dx++) {
                            if (dx * dx + dy * dy > avoidRadius * avoidRadius) continue;
                            const mx = wx + dx;
                            const my = wy + dy;
                            const mcx = Math.floor(mx / size);
                            const mcy = Math.floor(my / size);
                            const mlx = ((mx % size) + size) % size;
                            const mly = ((my % size) + size) % size;
                            if (getMarbleGrid(mcx, mcy)[mly][mlx].hasResource) return true;
                        }
                    }
                    return false;
                };
            }

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (!resourceGrid[y][x].hasResource) continue;
                    if (isNearMarble && isNearMarble(offsetX + x, offsetY + y)) continue;
                    if (key === 'tin' && grid[y][x].type === 12) continue;
                    grid[y][x].type = resourceGrid[y][x].type;
                    grid[y][x].hasResource = true;
                }
            }
        }

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = grid[y][x];
                if (this.isManaPoolTile(offsetX + x, offsetY + y, cell.elevation)) {
                    cell.type = 86;
                }
            }
        }

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = grid[y][x];
                if (cell.type !== 10 || cell.hasResource) continue;
                if (this.isOasisTile(offsetX + x, offsetY + y, cell.elevation, cell.temperature, cell.humidity)) {
                    cell.type = 19;
                }
            }
        }

        const chunkData = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                const riverLinks = this.getRiverLinks(offsetX + x, offsetY + y);
                row.push({
                    elevation: grid[y][x].elevation,
                    temperature: grid[y][x].temperature,
                    humidity: grid[y][x].humidity,
                    type: grid[y][x].type,
                    hasResource: grid[y][x].hasResource,
                    river: riverLinks.length > 0,
                    riverLinks: riverLinks,
                    space: this.createTileSpace(grid[y][x].type, riverLinks.length > 0, grid[y][x].temperature, grid[y][x].humidity)
                });
            }
            chunkData.push(row);
        }

        return chunkData;
    }

    getChunk(cx, cy) {
        const key = this.getChunkKey(cx, cy);
        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generateChunk(cx, cy));
        }
        return this.chunks.get(key);
    }

    getTileData(wx, wy) {
        const cx = Math.floor(wx / this.chunkSize);
        const cy = Math.floor(wy / this.chunkSize);
        const lx = ((wx % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const ly = ((wy % this.chunkSize) + this.chunkSize) % this.chunkSize;

        return this.getChunk(cx, cy)[ly][lx];
    }

    setSeed(seed) {
        this.seed = seed;
        this.noise = new PerlinNoise(seed);
        this.resetRivers();
        this.chunks.clear();
    }

    clearCache() {
        this.chunks.clear();
        this.riverSourceCache.clear();
        this.lakeRiverSourceCache.clear();
        this.lakeGridCache.clear();
    }

    regenerateResources() {
        this.clearCache();
    }

    setFrequency(frequency) {
        this.frequency = frequency;
        this.resetRivers();
        this.chunks.clear();
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.WorldGen = WorldGen;
}
