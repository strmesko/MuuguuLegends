// Fish and other underwater life. The list is intentionally data-only so the
// resource definitions, fishing rolls and icons can all be generated from it.
(function () {
    const ranges = {
        cold: { min: -1.2, max: 0.5 },
        temperate: { min: -0.3, max: 1.3 },
        warm: { min: 0.5, max: 2.2 },
        any: { min: -1.2, max: 2.2 },
    };

    const groups = [
        {
            category: "sea",
            biome: "sea",
            tempGroups: [
                {
                    temp: "cold",
                    names: [
                        "Atlantic Cod", "Haddock", "Halibut", "Atlantic Salmon",
                        "Pacific Salmon", "Herring", "Sardine", "Anchovy",
                        "Mackerel", "Pollock", "Hake", "Lingcod", "Wolffish",
                        "Ocean Perch", "Capelin", "Sand Lance", "Lanternfish",
                        "Grenadier", "Sablefish", "Arctic Cod",
                    ],
                },
                {
                    temp: "temperate",
                    names: [
                        "Sea Bass", "Sea Bream", "Grouper", "Snapper", "Mullet",
                        "Flounder", "Sole", "Turbot", "Plaice", "Ray", "Skate",
                        "Conger Eel", "Moray Eel", "Scorpionfish", "Triggerfish",
                        "Wrasse", "Damselfish", "Goatfish", "Porgy", "Sheepshead",
                        "Grunt", "Toadfish", "Jackfish", "Pompano", "Amberjack",
                        "Cobia", "Bonito", "Barracuda", "Swordfish", "Marlin",
                    ],
                },
                {
                    temp: "warm",
                    names: [
                        "Tuna", "Bluefin Tuna", "Yellowfin Tuna", "Mahi Mahi",
                        "Sailfish", "Lionfish", "Pufferfish", "Parrotfish",
                        "Surgeonfish", "Angelfish",
                    ],
                },
            ],
        },
        {
            category: "river",
            biome: "river",
            tempGroups: [
                {
                    temp: "cold",
                    names: [
                        "Rainbow Trout", "Brown Trout", "Brook Trout", "Grayling",
                        "Arctic Char", "Whitefish", "Sturgeon", "Sterlet",
                        "Huchen", "Burbot", "Smelt", "River Lamprey",
                    ],
                },
                {
                    temp: "temperate",
                    names: [
                        "Carp", "Crucian Carp", "Catfish", "Wels Catfish",
                        "Pike", "Perch", "Zander", "Roach", "Rudd", "Tench",
                        "Bream", "Chub", "Dace", "Barbel", "Ide", "Asp",
                    ],
                },
                {
                    temp: "warm",
                    names: [
                        "Gudgeon", "Minnow", "Loach", "Weatherfish",
                        "Bitterling", "Vimba", "Nase", "Squalius", "Ruffe",
                        "Bleak", "Nile Perch", "Arapaima",
                    ],
                },
            ],
        },
        {
            category: "lake",
            biome: "lake",
            tempGroups: [
                {
                    temp: "cold",
                    names: [
                        "Lake Trout", "Lake Whitefish", "Lake Herring", "Cisco",
                        "Kokanee", "Lake Sturgeon", "Arctic Grayling",
                        "Lake Char", "Lake Smelt", "Lake Goby",
                    ],
                },
                {
                    temp: "temperate",
                    names: [
                        "Largemouth Bass", "Smallmouth Bass", "Bluegill",
                        "Crappie", "Sunfish", "Walleye", "Sauger",
                        "Yellow Perch", "Northern Pike", "Muskie",
                        "Mirror Carp", "Grass Carp",
                    ],
                },
                {
                    temp: "warm",
                    names: [
                        "Bighead Carp", "Silver Carp", "Bullhead", "Lake Chub",
                        "Lake Minnow", "Spotted Bass", "Warmouth", "Tilapia",
                    ],
                },
            ],
        },
        {
            category: "shellfish",
            biome: "any",
            tempGroups: [
                {
                    temp: "any",
                    names: [
                        "Blue Crab", "King Crab", "Snow Crab", "Lobster",
                        "Spiny Lobster", "Crayfish", "Shrimp", "Prawn",
                        "Mantis Shrimp", "Krill", "Scallop", "Oyster", "Mussel",
                        "Clam", "Razor Clam", "Cockle", "Abalone", "Conch",
                        "Whelk", "Snail", "Octopus", "Squid", "Cuttlefish",
                        "Nautilus", "Jellyfish", "Sea Urchin", "Sea Cucumber",
                        "Starfish", "Brittle Star", "Sea Anemone",
                    ],
                },
            ],
        },
        {
            category: "beasts",
            biome: "sea",
            tempGroups: [
                {
                    temp: "any",
                    names: [
                        "Whale", "Blue Whale", "Sperm Whale", "Humpback Whale",
                        "Orca", "Great White Shark", "Hammerhead Shark",
                        "Whale Shark", "Tiger Shark", "Manta Ray",
                    ],
                },
            ],
        },
    ];

    const weights = {
        sea: 10,
        river: 10,
        lake: 10,
        shellfish: 6,
        beasts: 1,
    };
    const tastymeters = {
        sea: 7,
        river: 6,
        lake: 6,
        shellfish: 5,
        beasts: 4,
    };
    const itemWeights = {
        sea: 1.5,
        river: 1,
        lake: 1,
        shellfish: 0.3,
        beasts: 30,
    };

    const definitions = [];
    groups.forEach(function (group) {
        group.tempGroups.forEach(function (tempGroup) {
            const range = ranges[tempGroup.temp];
            tempGroup.names.forEach(function (name) {
                definitions.push(Object.freeze({
                    name: name,
                    category: group.category,
                    biome: group.biome,
                    tempMin: range.min,
                    tempMax: range.max,
                    fishWeight: weights[group.category],
                    weight: itemWeights[group.category],
                    tastymeter: tastymeters[group.category],
                    description: group.category === "beasts"
                        ? "A colossal creature of the deep. It should not fit in a bucket."
                        : "A fresh " + group.category + " catch from the water.",
                }));
            });
        });
    });

    Object.freeze(definitions);
    if (typeof window !== "undefined") {
        window.FISH_DEFINITIONS = definitions;
    }
})();
