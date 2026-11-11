// --- In-game calendar, weather, temperature and moon ----------------------
// The game starts at 07:00 on 1 May of year 0000. One real second is one
// in-game minute. The calendar is independent from the browser clock so save
// and load can restore it exactly.
const GAME_MINUTES_PER_REAL_SECOND = 1;
const GAME_MINUTES_PER_HOUR = 60;
const GAME_MINUTES_PER_DAY = 24 * GAME_MINUTES_PER_HOUR;

const GAME_START_YEAR = 0;
const GAME_START_MONTH = 5;
const GAME_START_DAY = 1;
const GAME_START_HOUR = 7;
const GAME_START_MINUTE = 0;

// Night lasts from 20:00 until 06:00. The moon is only shown at night.
const GAME_NIGHT_START_MINUTE = 20 * GAME_MINUTES_PER_HOUR;
const GAME_NIGHT_END_MINUTE = 6 * GAME_MINUTES_PER_HOUR;

// Weather is checked for a possible change every four in-game hours and every
// time the character arrives on a new tile.
const GAME_WEATHER_PERIOD_MINUTES = 4 * GAME_MINUTES_PER_HOUR;
const GAME_WEATHER_TIME_CHANGE_CHANCE = 0.7;
const GAME_WEATHER_TRAVEL_CHANGE_CHANCE = 0.5;

// Tile temperature ranges roughly from -1 to 2. It is converted to Celsius
// and then shifted by the current season and time of day.
const GAME_TILE_TEMPERATURE_SCALE = 15;
const GAME_BASE_TEMPERATURE = 8;
const GAME_SNOW_TEMPERATURE = 1;

const GAME_MONTH_NAMES = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]);
const GAME_MONTH_LENGTHS = Object.freeze([
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
]);

const GAME_SEASON_DEFINITIONS = Object.freeze([
    Object.freeze({
        id: "winter", name: "Winter", months: Object.freeze([12, 1, 2]),
        temperatureOffset: -16, precipitationMultiplier: 0.7,
    }),
    Object.freeze({
        id: "spring", name: "Spring", months: Object.freeze([3, 4, 5]),
        temperatureOffset: 0, precipitationMultiplier: 1.2,
    }),
    Object.freeze({
        id: "summer", name: "Summer", months: Object.freeze([6, 7, 8]),
        temperatureOffset: 10, precipitationMultiplier: 1.0,
    }),
    Object.freeze({
        id: "autumn", name: "Autumn", months: Object.freeze([9, 10, 11]),
        temperatureOffset: 0, precipitationMultiplier: 1.25,
    }),
]);

// Eight moon phases; the phase is chosen from the absolute day number, so it
// changes exactly once per in-game day.
const GAME_MOON_PHASES = Object.freeze([
    Object.freeze({ id: "new", name: "New Moon", emoji: "🌑" }),
    Object.freeze({ id: "waxing-crescent", name: "Waxing Crescent", emoji: "🌒" }),
    Object.freeze({ id: "first-quarter", name: "First Quarter", emoji: "🌓" }),
    Object.freeze({ id: "waxing-gibbous", name: "Waxing Gibbous", emoji: "🌔" }),
    Object.freeze({ id: "full", name: "Full Moon", emoji: "🌕" }),
    Object.freeze({ id: "waning-gibbous", name: "Waning Gibbous", emoji: "🌖" }),
    Object.freeze({ id: "last-quarter", name: "Last Quarter", emoji: "🌗" }),
    Object.freeze({ id: "waning-crescent", name: "Waning Crescent", emoji: "🌘" }),
]);

// Dark is a night debuff. Every night grants five base stacks; darker moon
// phases add more, while a full moon adds none.
const DARK_NIGHT_BASE_STACKS = 5;
const DARK_STACK_FORAGE_PENALTY = 0.05;
const DARK_STACK_TRAVEL_SPEED_PENALTY = 0.05;
const DARK_STACK_SLEEP_BONUS = 0.05;
const DARK_STACK_MANA_REGEN_BONUS = 0.05;
const DARK_MOON_EXTRA_STACKS = Object.freeze({
    "new": 4,
    "waxing-crescent": 3,
    "first-quarter": 2,
    "waxing-gibbous": 1,
    "full": 0,
    "waning-gibbous": 1,
    "last-quarter": 2,
    "waning-crescent": 3,
});

// actionPenalty is the fraction removed from action effectiveness and from
// inter-tile travel speed while this weather is active. A completed Campfire
// or a completed Houses-category structure on the current tile removes the
// penalty, except for actions tagged "harvest".
const GAME_WEATHER_TYPES = Object.freeze([
    Object.freeze({ id: "clear", name: "Clear", dayEmoji: "☀️", nightEmoji: "🌌", actionPenalty: 0 }),
    Object.freeze({ id: "partly-cloudy", name: "Partly cloudy", dayEmoji: "🌤️", nightEmoji: "☁️", actionPenalty: 0 }),
    Object.freeze({ id: "cloudy", name: "Cloudy", dayEmoji: "☁️", nightEmoji: "☁️", actionPenalty: 0 }),
    Object.freeze({ id: "fog", name: "Fog", dayEmoji: "🌫️", nightEmoji: "🌫️", actionPenalty: 0 }),
    Object.freeze({ id: "rain", name: "Rain", dayEmoji: "🌧️", nightEmoji: "🌧️", actionPenalty: 0.05 }),
    Object.freeze({ id: "heavy-rain", name: "Heavy rain", dayEmoji: "🌧️", nightEmoji: "🌧️", actionPenalty: 0.10 }),
    Object.freeze({ id: "thunder", name: "Thunder", dayEmoji: "🌩️", nightEmoji: "🌩️", actionPenalty: 0.10 }),
    Object.freeze({ id: "thunderstorm", name: "Thunderstorm", dayEmoji: "⛈️", nightEmoji: "⛈️", actionPenalty: 0.20 }),
    Object.freeze({ id: "gale", name: "Gale", dayEmoji: "🌬️", nightEmoji: "🌬️", actionPenalty: 0.20 }),
    Object.freeze({ id: "snow", name: "Snow", dayEmoji: "❄️", nightEmoji: "❄️", actionPenalty: 0.05 }),
    Object.freeze({ id: "blizzard", name: "Blizzard", dayEmoji: "🌨️", nightEmoji: "🌨️", actionPenalty: 0.20 }),
    Object.freeze({ id: "sandstorm", name: "Sandstorm", dayEmoji: "🌪️", nightEmoji: "🌪️", actionPenalty: 0.20 }),
    // Legacy id kept so old saves restore cleanly. It is normalized to
    // Thunderstorm and no longer chosen by the weather generator.
    Object.freeze({ id: "storm", name: "Storm", dayEmoji: "⛈️", nightEmoji: "⛈️", actionPenalty: 0.20 }),
]);

const GAME_DESERT_TILE_TYPE_ID = 10;

const GAME_WEATHER_BY_ID = Object.freeze(
    GAME_WEATHER_TYPES.reduce(function (result, weather) {
        result[weather.id] = weather;
        return result;
    }, {})
);

function isGameLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getGameMonthLength(year, month) {
    if (month === 2 && isGameLeapYear(year)) return 29;
    return GAME_MONTH_LENGTHS[month - 1] || 30;
}

function getGameDaysInYear(year) {
    return isGameLeapYear(year) ? 366 : 365;
}

// Converts a calendar date into the absolute number of minutes since
// 1 January of year 0000, 00:00.
function gameDateTimeToMinutes(year, month, day, minuteOfDay) {
    let days = 0;
    for (let currentYear = 0; currentYear < year; currentYear++) {
        days += getGameDaysInYear(currentYear);
    }
    for (let currentMonth = 1; currentMonth < month; currentMonth++) {
        days += getGameMonthLength(year, currentMonth);
    }
    days += Math.max(1, day) - 1;
    return days * GAME_MINUTES_PER_DAY + Math.max(0, minuteOfDay);
}

function gameMinutesToDateTime(totalMinutes) {
    let remaining = Math.max(0, Math.floor(Number(totalMinutes) || 0));
    let year = 0;

    while (remaining >= getGameDaysInYear(year) * GAME_MINUTES_PER_DAY) {
        remaining -= getGameDaysInYear(year) * GAME_MINUTES_PER_DAY;
        year++;
    }

    let month = 1;
    while (month < 12) {
        const monthMinutes = getGameMonthLength(year, month) * GAME_MINUTES_PER_DAY;
        if (remaining < monthMinutes) break;
        remaining -= monthMinutes;
        month++;
    }

    const day = Math.floor(remaining / GAME_MINUTES_PER_DAY) + 1;
    const minuteOfDay = remaining % GAME_MINUTES_PER_DAY;

    return {
        year: year,
        month: month,
        day: day,
        minuteOfDay: minuteOfDay,
        hour: Math.floor(minuteOfDay / GAME_MINUTES_PER_HOUR),
        minute: minuteOfDay % GAME_MINUTES_PER_HOUR,
    };
}

const GAME_START_TOTAL_MINUTES = gameDateTimeToMinutes(
    GAME_START_YEAR,
    GAME_START_MONTH,
    GAME_START_DAY,
    GAME_START_HOUR * GAME_MINUTES_PER_HOUR + GAME_START_MINUTE
);

var gameTime = {
    totalMinutes: GAME_START_TOTAL_MINUTES,
    weatherId: "clear",
    weatherInitialized: false,
    weatherChangedAt: GAME_START_TOTAL_MINUTES,
    weatherCheckSegment: Math.floor(GAME_START_TOTAL_MINUTES / GAME_WEATHER_PERIOD_MINUTES),
};

function clampGameNumber(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function getGameSeason(month) {
    return GAME_SEASON_DEFINITIONS.find(function (season) {
        return season.months.indexOf(month) !== -1;
    }) || GAME_SEASON_DEFINITIONS[1];
}

function getGameTileTemperature() {
    const value = typeof currentTile !== "undefined" && currentTile
        ? Number(currentTile.temperature)
        : NaN;
    return Number.isFinite(value) ? value : 0;
}

function getGameTileHumidity() {
    const value = typeof currentTile !== "undefined" && currentTile
        ? Number(currentTile.humidity)
        : NaN;
    return Number.isFinite(value) ? value : 0;
}

// Temperature depends on the tile, the season and the time of day. The
// warmest hour is around 15:00 and the coldest around 03:00.
function getGameTemperature(dateTime) {
    const season = getGameSeason(dateTime.month);
    const hour = dateTime.hour + dateTime.minute / GAME_MINUTES_PER_HOUR;
    const diurnalOffset = Math.cos(((hour - 15) / 24) * Math.PI * 2) * 5;

    return Math.round(
        GAME_BASE_TEMPERATURE
        + getGameTileTemperature() * GAME_TILE_TEMPERATURE_SCALE
        + season.temperatureOffset
        + diurnalOffset
    );
}

function getGameWeatherCheckSegment(totalMinutes) {
    return Math.floor(totalMinutes / GAME_WEATHER_PERIOD_MINUTES);
}

function isGameDesertTile(tile) {
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!target) return false;

    if (Number(target.type) === GAME_DESERT_TILE_TYPE_ID) return true;

    const name = String(target.typeName || target.biomeName || "").toLowerCase();
    if (name === "desert") return true;

    const mapView = typeof window !== "undefined" ? window.mapView : null;
    const world = mapView && mapView.world;
    if (world && Array.isArray(world.tileTypes) && target.type != null) {
        const type = world.tileTypes[Number(target.type)];
        if (type && String(type.name || "").toLowerCase() === "desert") return true;
    }

    return false;
}

// More humidity makes precipitation more likely. Winter snow replaces rain,
// and any precipitation becomes snow at or below GAME_SNOW_TEMPERATURE.
// Storms, gales and blizzards need high humidity; Deserts can instead get a
// sandstorm when the air is dry.
function getGameWeatherWeights(dateTime, excludeId) {
    const humidity = clampGameNumber((getGameTileHumidity() + 1) / 3, 0, 1);
    const dryness = 1 - humidity;
    const season = getGameSeason(dateTime.month);
    const temperature = getGameTemperature(dateTime);
    const cold = season.id === "winter" || temperature <= GAME_SNOW_TEMPERATURE;
    const precipitation = (0.08 + humidity * 2.4) * season.precipitationMultiplier;
    const desert = isGameDesertTile();

    const weights = {
        clear: Math.max(0.2, 2.6 - humidity * 2.0) + (desert ? dryness * 0.6 : 0),
        "partly-cloudy": 1.4,
        cloudy: 0.9 + humidity * 1.8,
        fog: desert ? 0 : 0.05 + Math.max(0, humidity - 0.55) * 1.6,
        rain: cold ? 0 : precipitation,
        "heavy-rain": cold ? 0 : precipitation * (0.14 + humidity * 0.28),
        thunder: cold ? 0 : precipitation * (0.05 + humidity * 0.10),
        thunderstorm: cold ? 0 : precipitation * (0.10 + humidity * 0.22),
        gale: precipitation * (0.05 + humidity * 0.14) + (cold ? 0.15 : 0),
        snow: cold ? precipitation : 0,
        blizzard: cold ? precipitation * (0.16 + humidity * 0.34) : 0,
        sandstorm: desert ? 1.2 + dryness * 1.8 : 0,
        // Legacy Storm is never selected; Thunderstorm replaces it.
        storm: 0,
    };

    if (excludeId && weights[excludeId] > 0) {
        weights[excludeId] = 0;
    }

    return weights;
}

function pickGameWeather(dateTime, excludeId) {
    const weights = getGameWeatherWeights(dateTime, excludeId);
    const ids = Object.keys(weights);
    let total = 0;

    ids.forEach(function (id) {
        total += weights[id];
    });
    if (total <= 0) return GAME_WEATHER_BY_ID.clear;

    let roll = Math.random() * total;
    for (let index = 0; index < ids.length; index++) {
        const weight = weights[ids[index]];
        if (weight <= 0) continue;
        roll -= weight;
        if (roll <= 0) return GAME_WEATHER_BY_ID[ids[index]];
    }

    // Fallback for a roll that lands exactly on the end of the range.
    for (let index = ids.length - 1; index >= 0; index--) {
        if (weights[ids[index]] > 0) return GAME_WEATHER_BY_ID[ids[index]];
    }

    return GAME_WEATHER_BY_ID.clear;
}

function getGameWeather() {
    return GAME_WEATHER_BY_ID[gameTime.weatherId] || GAME_WEATHER_BY_ID.clear;
}

function getGameWeatherPenalty(weather) {
    const target = weather || getGameWeather();
    const penalty = Number(target && target.actionPenalty);
    return Number.isFinite(penalty) && penalty > 0 ? penalty : 0;
}

// Shelter is a completed Campfire or any completed building in the Houses
// category on the same tile.
function hasCompletedWeatherShelterOnTile(tile) {
    const target = tile || (typeof currentTile !== "undefined" ? currentTile : null);
    if (!target || !Array.isArray(target.buildings)) return false;

    return target.buildings.some(function (building) {
        if (!building || !building.completed) return false;

        const campfireId = typeof BUILDING_IDS !== "undefined"
            ? BUILDING_IDS.CAMPFIRE
            : "campfire";
        if (building.defId === campfireId) return true;

        if (typeof getBuildingDefinition !== "function") return false;
        const def = getBuildingDefinition(building.defId);
        return !!def && String(def.category) === "houses";
    });
}

function getGameWeatherActionMultiplier(action) {
    const penalty = getGameWeatherPenalty();
    if (penalty <= 0) return 1;

    let resolvedAction = action;
    if (typeof action === "string" && typeof getAction === "function") {
        resolvedAction = getAction(action);
    }

    const isHarvest = !!resolvedAction
        && typeof hasActionTag === "function"
        && hasActionTag(resolvedAction, "harvest");

    // Harvest work is always exposed to the weather; other actions are
    // protected while the character is on a sheltered tile.
    if (!isHarvest && hasCompletedWeatherShelterOnTile()) return 1;

    return Math.max(0, 1 - penalty);
}

function getGameWeatherTravelSpeedMultiplier() {
    const penalty = getGameWeatherPenalty();
    if (penalty <= 0) return 1;
    if (hasCompletedWeatherShelterOnTile()) return 1;
    return Math.max(0, 1 - penalty);
}

// A lower speed lengthens the trip by 1 / speed, so the resulting travel
// speed is exactly the requested percentage lower.
function getGameWeatherTravelTimeMultiplier() {
    return 1 / Math.max(0.01, getGameWeatherTravelSpeedMultiplier());
}

function ensureGameWeatherInitialized() {
    if (gameTime.weatherInitialized) return true;

    // Wait for the real map tile before choosing the first weather.
    if (typeof currentTile === "undefined" || !currentTile) return false;
    if (!Number.isFinite(Number(currentTile.temperature))) return false;

    const dateTime = gameMinutesToDateTime(gameTime.totalMinutes);
    gameTime.weatherId = pickGameWeather(dateTime, null).id;
    gameTime.weatherInitialized = true;
    gameTime.weatherChangedAt = gameTime.totalMinutes;
    gameTime.weatherCheckSegment = getGameWeatherCheckSegment(gameTime.totalMinutes);
    return true;
}

// Keep rain, snow and storm variants consistent with the current season,
// temperature and biome even when these change while a weather type is
// already active.
function normalizeGameWeatherForConditions() {
    if (!gameTime.weatherInitialized) return;

    const dateTime = gameMinutesToDateTime(gameTime.totalMinutes);
    const season = getGameSeason(dateTime.month);
    const temperature = getGameTemperature(dateTime);
    const cold = season.id === "winter" || temperature <= GAME_SNOW_TEMPERATURE;
    const desert = isGameDesertTile();
    const previousId = gameTime.weatherId;

    if (previousId === "storm") {
        gameTime.weatherId = cold ? "blizzard" : "thunderstorm";
    } else if (cold) {
        if (previousId === "rain" || previousId === "heavy-rain" || previousId === "thunder") {
            gameTime.weatherId = "snow";
        } else if (previousId === "thunderstorm") {
            gameTime.weatherId = "blizzard";
        }
    } else {
        if (previousId === "snow") {
            gameTime.weatherId = "rain";
        } else if (previousId === "blizzard") {
            gameTime.weatherId = "thunderstorm";
        }
    }

    if (gameTime.weatherId === "sandstorm" && !desert) {
        gameTime.weatherId = "clear";
    }

    if (gameTime.weatherId !== previousId) {
        gameTime.weatherChangedAt = gameTime.totalMinutes;
    }
}

function tryChangeGameWeather(chance) {
    if (!ensureGameWeatherInitialized()) return false;
    if (Math.random() >= chance) return false;

    const dateTime = gameMinutesToDateTime(gameTime.totalMinutes);
    const nextWeather = pickGameWeather(dateTime, gameTime.weatherId);
    if (!nextWeather || nextWeather.id === gameTime.weatherId) return false;

    gameTime.weatherId = nextWeather.id;
    gameTime.weatherChangedAt = gameTime.totalMinutes;
    return true;
}

// Called when the character arrives on a new tile.
function notifyGameTileChanged() {
    if (!ensureGameWeatherInitialized()) return false;

    normalizeGameWeatherForConditions();
    return tryChangeGameWeather(GAME_WEATHER_TRAVEL_CHANGE_CHANCE);
}

function advanceGameClock(seconds) {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value <= 0) return false;

    const previousDate = gameMinutesToDateTime(gameTime.totalMinutes);
    gameTime.totalMinutes += value * GAME_MINUTES_PER_REAL_SECOND;
    const currentDate = gameMinutesToDateTime(gameTime.totalMinutes);

    if ((previousDate.year !== currentDate.year
        || previousDate.month !== currentDate.month)
        && typeof resetHarvestedTreesForNewMonth === "function") {
        resetHarvestedTreesForNewMonth();
    }

    ensureGameWeatherInitialized();
    normalizeGameWeatherForConditions();

    const segment = getGameWeatherCheckSegment(gameTime.totalMinutes);
    if (segment !== gameTime.weatherCheckSegment) {
        gameTime.weatherCheckSegment = segment;
        tryChangeGameWeather(GAME_WEATHER_TIME_CHANGE_CHANCE);
    }

    return true;
}

function restoreGameTime(totalMinutes) {
    if (totalMinutes == null || totalMinutes === "") {
        gameTime.totalMinutes = GAME_START_TOTAL_MINUTES;
        return;
    }

    const value = Number(totalMinutes);
    gameTime.totalMinutes = Number.isFinite(value) && value >= 0
        ? value
        : GAME_START_TOTAL_MINUTES;
}

function restoreGameWeather(weatherId, checkSegment) {
    const weather = GAME_WEATHER_BY_ID[weatherId];
    if (weather) {
        gameTime.weatherId = weather.id;
        gameTime.weatherInitialized = true;
        gameTime.weatherChangedAt = gameTime.totalMinutes;
    } else {
        gameTime.weatherId = "clear";
        gameTime.weatherInitialized = false;
    }

    const segment = Number(checkSegment);
    gameTime.weatherCheckSegment = Number.isFinite(segment) && segment >= 0
        ? Math.floor(segment)
        : getGameWeatherCheckSegment(gameTime.totalMinutes);
}

function isGameNight(minuteOfDay) {
    return minuteOfDay >= GAME_NIGHT_START_MINUTE
        || minuteOfDay < GAME_NIGHT_END_MINUTE;
}

function getGameMoonPhase(totalMinutes) {
    const dayNumber = Math.floor(totalMinutes / GAME_MINUTES_PER_DAY);
    const index = ((dayNumber % GAME_MOON_PHASES.length) + GAME_MOON_PHASES.length)
        % GAME_MOON_PHASES.length;
    return GAME_MOON_PHASES[index];
}

// --- Dark debuff ----------------------------------------------------------
function getDarkStacksAt(totalMinutes) {
    const dateTime = gameMinutesToDateTime(totalMinutes);
    if (!isGameNight(dateTime.minuteOfDay)) return 0;

    const moon = getGameMoonPhase(totalMinutes);
    const moonBonus = DARK_MOON_EXTRA_STACKS[moon.id] || 0;
    return DARK_NIGHT_BASE_STACKS + moonBonus;
}

function getDarkStacks() {
    return getDarkStacksAt(gameTime.totalMinutes);
}

// Plain fractions per active stack. Forage and travel are penalties; sleep
// quality and mana regeneration are bonuses.
function getDarkEffectTotals() {
    const stacks = getDarkStacks();

    return {
        stacks: stacks,
        forageEffectiveness: -DARK_STACK_FORAGE_PENALTY * stacks,
        travelSpeed: -DARK_STACK_TRAVEL_SPEED_PENALTY * stacks,
        sleepQuality: DARK_STACK_SLEEP_BONUS * stacks,
        manaRegen: DARK_STACK_MANA_REGEN_BONUS * stacks,
    };
}

function getDarkForageMultiplier() {
    return Math.max(0.01, 1 + getDarkEffectTotals().forageEffectiveness);
}

// A 5% speed loss per stack lengthens travel by 1 / 0.95, not by 5% of the
// duration, so the resulting speed is exactly 5% lower per stack.
function getDarkTravelSpeedMultiplier() {
    return Math.max(0.05, 1 + getDarkEffectTotals().travelSpeed);
}

function getDarkTravelTimeMultiplier() {
    return 1 / getDarkTravelSpeedMultiplier();
}

function getDarkSleepQualityMultiplier() {
    return 1 + getDarkEffectTotals().sleepQuality;
}

function getDarkManaRegenMultiplier() {
    return 1 + getDarkEffectTotals().manaRegen;
}

function getDarkStatus() {
    const stacks = getDarkStacks();
    if (stacks <= 0) return null;

    const moon = getGameMoonPhase(gameTime.totalMinutes);
    const moonBonus = DARK_MOON_EXTRA_STACKS[moon.id] || 0;
    const totalPercent = Math.round(stacks * 5 * 100) / 100;

    const lines = [
        "<b>Dark</b>",
        "Stacks: " + stacks,
        "Night base: " + DARK_NIGHT_BASE_STACKS
            + (moonBonus > 0 ? " + " + moonBonus + " from the " + moon.name : ""),
        "-" + totalPercent + "% forage effectiveness",
        "-" + totalPercent + "% travel speed",
        "+" + totalPercent + "% sleep quality",
        "+" + totalPercent + "% mana regen",
    ];

    return {
        id: "dark",
        name: "Dark",
        kind: "debuff",
        stacks: stacks,
        color: "#6f5bd6",
        icon: "fa-moon-o",
        tooltip: lines.join("<br>"),
    };
}

function padGameNumber(value, length) {
    let text = String(value);
    while (text.length < length) text = "0" + text;
    return text;
}

function formatGameClockDate(dateTime) {
    return dateTime.day + " " + GAME_MONTH_NAMES[dateTime.month - 1]
        + " " + padGameNumber(dateTime.year, 4);
}

function formatGameClockTime(dateTime) {
    return padGameNumber(dateTime.hour, 2) + ":" + padGameNumber(dateTime.minute, 2);
}

function formatGameTemperature(temperature) {
    return temperature + "°C";
}

function getGameClockElement() {
    let element = document.getElementById("gameclock");
    if (element) return element;

    const menu = document.getElementById("mainmenu");
    if (!menu) return null;

    element = document.createElement("div");
    element.id = "gameclock";
    element.className = "gameclock";

    const statusText = document.getElementById("mainmenutext");
    if (statusText && statusText.parentNode === menu) {
        menu.insertBefore(element, statusText.nextSibling);
    } else {
        menu.appendChild(element);
    }

    return element;
}

function renderGameClock() {
    const element = getGameClockElement();
    if (!element) return;

    ensureGameWeatherInitialized();
    normalizeGameWeatherForConditions();

    const dateTime = gameMinutesToDateTime(gameTime.totalMinutes);
    const night = isGameNight(dateTime.minuteOfDay);
    const weather = getGameWeather();
    const season = getGameSeason(dateTime.month);
    const temperature = getGameTemperature(dateTime);
    const moon = night ? getGameMoonPhase(gameTime.totalMinutes) : null;

    const dateText = formatGameClockDate(dateTime);
    const timeText = formatGameClockTime(dateTime);
    const weatherEmoji = night ? weather.nightEmoji : weather.dayEmoji;

    // Two lines inside the same element: date/time first, environment second.
    const environmentText = weatherEmoji
        + (moon ? " " + moon.emoji : "")
        + " " + formatGameTemperature(temperature);

    let dateLine = element.querySelector(".gameclock-date");
    let environmentLine = element.querySelector(".gameclock-environment");
    if (!dateLine || !environmentLine) {
        element.innerText = "";

        dateLine = document.createElement("div");
        dateLine.className = "gameclock-line gameclock-date";

        environmentLine = document.createElement("div");
        environmentLine.className = "gameclock-line gameclock-environment";

        element.appendChild(dateLine);
        element.appendChild(environmentLine);
    }

    dateLine.innerText = dateText + ", " + timeText;
    environmentLine.innerText = environmentText;

    const tooltip = [
        "<b>" + dateText + ", " + timeText + "</b>",
        "Season: " + season.name,
        "Weather: " + weather.name,
        "Temperature: " + formatGameTemperature(temperature),
        night
            ? "Moon: " + moon.name
            : "Moon is not visible during the day.",
        "Weather may change every 4 in-game hours or after moving to another tile.",
        "Higher tile humidity makes rain or snow more likely.",
        "Every real second is one in-game minute.",
    ];

    const weatherPenalty = getGameWeatherPenalty(weather);
    if (weatherPenalty > 0) {
        const sheltered = hasCompletedWeatherShelterOnTile();
        tooltip.push(
            "-" + round2(weatherPenalty * PERCENT)
            + "% action effectiveness and travel speed"
            + (sheltered ? " (sheltered from the weather)" : "")
        );
        if (sheltered) {
            tooltip.push("Harvest actions are not protected by shelter.");
        }
    }
    element.setAttribute("data-tooltip", tooltip.join("<br>"));

    element.dataset.gameDate = dateText;
    element.dataset.gameTime = timeText;
    element.dataset.weather = weather.id;
    element.dataset.season = season.id;
    element.dataset.temperature = String(temperature);
    element.dataset.moon = moon ? moon.id : "";
    element.dataset.isNight = night ? "true" : "false";
}
