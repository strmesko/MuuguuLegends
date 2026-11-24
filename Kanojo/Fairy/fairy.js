// Fairy dialogue data. Kanojo files keep character-specific lines and colors.
const KANOJO_FAIRY = Object.freeze({
    id: "fairy",
    typeId: "fairy",
    colors: Object.freeze({
        background: "#c8ff9e",
        border: "#1f8f2f",
        borderWidth: "1px",
    }),
    actionLines: Object.freeze({
        focus: [
            "Why are you staring at nothing? Is it a game? Can I play?",
            "Your eyes went all funny. Are you looking at a bug?",
        ],
        caloriesbooster: [
            "That smells like berries! Or maybe not. Weird.",
            "Is that food? It smells like a happy tummy.",
        ],
        vitaminsrush: [
            "Green stuff! Is it tasty? Can I lick it?",
            "Ooh, healthy! That means it tastes weird, right?",
        ],
        manadigestion: [
            "Magic tickles my nose. Achoo!",
            "Your magic feels like fizzy rain. Do it again!",
        ],
        entercombat: [
            "Fighting is scary! Let's play tag instead!",
            "You look angry. Angry games are not fun games.",
        ],
        talktonpc: [
            "Hi! Wanna play hide-and-seek? You count to ten!",
            "You talk funny. Do you know any games?",
        ],
        gift: [
            "A present! Is it shiny? Is it food? Is it a shiny food?",
            "For me? Really? I will keep it forever. Or until lunch.",
        ],
        explore: [
            "New places! Maybe there are butterflies over there!",
            "Exploring! I hope we find a very big stick.",
        ],
        search: [
            "Looking for treasure? I found a rock once. It was a good rock.",
            "If you find a shiny thing, can I have it? Please?",
        ],
        forage: [
            "Berries! Berries! I know all the best berry bushes!",
            "Plants are the best. They do not ask silly questions.",
        ],
        fish: [
            "Fish are slippery. Do they like games too?",
            "The water is wet. Very wet. I checked.",
        ],
        treesharvest: [
            "Fruit! The tree gave us fruit! Trees are nice.",
            "The tree is sharing. We should say thank you.",
        ],
        harvestcrops: [
            "Veggies! Can we make a little garden hat?",
            "The carrots are hiding in the dirt. Sneaky carrots!",
        ],
        improvecrops: [
            "Dig dig dig! The dirt is happy now, right?",
            "More food! More plants! More everything!",
        ],
        improvetrees: [
            "The tree wants a hug. Or more sun. Trees are simple.",
            "Grow, tree, grow! I will cheer for you.",
        ],
        cuttree: [
            "The tree fell down. Is it sleeping? Wake up, tree!",
            "Timber! That means the tree is tired, right?",
        ],
        dig: [
            "Dirt! I love dirt! It squishes between my toes.",
            "Digging is the best. You never know what is hiding.",
        ],
        mining: [
            "Shiny rocks! Are they candy? No? Aww.",
            "The rock went clink. Do it again! Clink clink!",
        ],
        grindflour: [
            "Flour everywhere! It looks like snow! Snow game!",
            "The seeds turned into dust. Magic dust? Probably magic.",
        ],
        pressoil: [
            "Squishy seeds! This is a fun squishy thing.",
            "Oil is slippery. Can we slide on it?",
        ],
        makesugarfromsugarcane: [
            "Sweet! Sweet! My favorite kind of plant!",
            "Sugar cane is like a candy stick. A big candy stick.",
        ],
        makesugarfrombeetroot: [
            "The red root makes sweet dust. Magic? Probably magic.",
            "Beets are red. Sugar is white. This is confusing.",
        ],
        makefibers: [
            "Plant hair! Weird. But soft.",
            "Fibers are like tiny ropes. Tiny rope games!",
        ],
        makelinencloth: [
            "Cloth! Can I wear it like a cape?",
            "It is soft. I want a blanket made of this.",
        ],
        makeshafts: [
            "Sticks! Good for swords. Or for poking mud.",
            "A shaft is a stick with a job. Important stick.",
        ],
        makehandles: [
            "A handle? For a giant spoon?",
            "Handles are for holding. I can hold things!",
        ],
        makeplanks: [
            "Flat wood! Let's build a tiny fort!",
            "Planks are like wooden bread. Do not eat them.",
        ],
        makewoodenbeams: [
            "Big wood. Heavy. I can lift it. Maybe.",
            "Beams are strong. Stronger than me? Probably.",
        ],
        makemortar: [
            "Grey mud. Not tasty. Definitely not tasty.",
            "Mortar sticks things together. Like friendship!",
        ],
        smeltcopper: [
            "Fire is warm. The shiny water is weird. Don't touch it!",
            "Copper is orange. Like a sun that fell in a pot.",
        ],
        smelttin: [
            "Another shiny puddle! Why is it so hot?",
            "Tin is quiet. It does not say anything. Rude.",
        ],
        smeltiron: [
            "Iron! Strong stuff. Can it be a toy?",
            "The fire is eating the rock. Bad fire!",
        ],
        smeltgold: [
            "Shiny yellow! Like a sun coin! Can I keep it?",
            "Gold is pretty. Pretty things should be in nests.",
        ],
        research: [
            "Books? Boring. Can we research bugs instead?",
            "Thinking hurts my head. Let's think about flowers.",
        ],
        rest: [
            "Nap time! I like naps. Especially in the grass.",
            "Resting is good. The grass is soft and tickly.",
        ],
        sleep: [
            "Sleep tight! Dream of mushroom houses!",
            "Night night! The moon is a big night lamp.",
        ],
        daydream: [
            "I'm thinking about clouds. They look like bunnies.",
            "Daydreaming is my favorite kind of thinking.",
        ],
        movetoxy: [
            "Walking! Walking! Are we there yet? Are we there yet?",
            "My feet are doing the walking thing. Good feet.",
        ],
        north: [
            "That way! I think. The moss knows.",
            "North is cold. Bring a leaf blanket.",
        ],
        south: [
            "South! Or is it the warm way? I forget.",
            "South is where the sun naps. Probably.",
        ],
        east: [
            "East! Where the sun wakes up. Probably.",
            "The sun comes from there. It is a morning sun.",
        ],
        west: [
            "West! Where the sun goes to sleep. Nighty night, sun!",
            "West is the sleepy direction. I like sleep.",
        ],
        playwith: [
            "Yay! Games! You hide, I seek! No peeking!",
            "Tag! You are it! Wait, no, I am it! Run!",
        ],
        build: [
            "Building? Is it a fort? Can it have a slide?",
            "A new house! Can I put leaves on it?",
        ],
        burn: [
            "Fire is warm! But why does it eat the sticks?",
            "Do the leaves turn into tiny smoke fairies?",
        ],
    }),
    moodLines: Object.freeze({
        "Extremely bored": [
            "Everything is boring. Even the butterflies. Almost.",
            "I have been bored for a hundred years. Maybe two hundred.",
        ],
        Bored: [
            "I'm bored. Wanna race? Wanna play tag? Wanna do anything?",
            "Bored bored bored. The grass is boring today.",
        ],
        Unhappy: [
            "You're no fun today. The forest is sad too.",
            "Hmph. I wanted to play. Now I don't.",
        ],
        Sad: [
            "I don't want to play. Maybe later. Maybe never.",
            "My leaf hat fell in a puddle. Everything is wet and sad.",
        ],
        Neutral: [
            "Hi. Wanna play? Or just sit? Sitting is okay.",
            "I found a nice stick. It is a good stick.",
        ],
        Curious: [
            "What's that? What's that? Tell me tell me!",
            "Why do bugs have so many legs? Where do they put them?",
        ],
        Happy: [
            "Today is a good day! I found a perfect leaf!",
            "I am happy! The sun is warm and the berries are sweet.",
        ],
        Excited: [
            "Best day ever! Let's play hide-and-seek! You hide first!",
            "I found a snail! It has a house on its back! A tiny house!",
        ],
        "Extremely curious": [
            "So many questions! Why is the sky blue? Why do bugs tickle?",
            "What is inside a cloud? Is it fluff? Is it water? Is it a secret?",
        ],
    }),
    favorLines: Object.freeze({
        hostile: [
            "You again. Hmph. I'm not playing with you.",
            "Go away, grumpy person. The forest does not like you today.",
        ],
        wary: [
            "You're okay. I guess. Wanna play? Maybe.",
            "I don't know you very well. But you have a nice stick.",
        ],
        friendly: [
            "You're my friend! Let's play tag!",
            "Friend! Friend! Come see my leaf collection!",
        ],
        devoted: [
            "Best friend! We can be forest pirates forever!",
            "You are my favorite person. After the trees. And the snails.",
        ],
    }),
    defaultLines: Object.freeze([
        "What are you doing? Is it a game? Can I help?",
        "The forest is nice today. Do you like moss? I love moss.",
    ]),
});

function kanojoPickLine(lines, randomFn) {
    if (!Array.isArray(lines) || !lines.length) return "";
    const random = typeof randomFn === "function" ? randomFn : Math.random;
    const index = Math.min(
        lines.length - 1,
        Math.max(0, Math.floor(random() * lines.length))
    );
    return lines[index];
}

function kanojoGetMoodKey(npc) {
    if (typeof getNpcMoodDescription === "function") {
        return getNpcMoodDescription(npc) || "Neutral";
    }
    return npc && npc.moodDescription ? npc.moodDescription : "Neutral";
}

function kanojoGetFavorTier(npc) {
    const favor = Number(npc && npc.favor) || 0;
    if (favor < 0) return "hostile";
    if (favor <= 50) return "wary";
    if (favor <= 200) return "friendly";
    return "devoted";
}

function kanojoGetActionKey(actionId) {
    if (!actionId) return null;
    const id = String(actionId);
    if (KANOJO_FAIRY.actionLines[id]) return id;
    if (id.indexOf("playwith-") === 0) return "playwith";
    if (id.indexOf("build") === 0) return "build";
    if (id.indexOf("burn") === 0) return "burn";
    return null;
}

function getKanojoFairyLine(actionId, npc, randomFn) {
    const random = typeof randomFn === "function" ? randomFn : Math.random;
    const actionKey = kanojoGetActionKey(actionId);
    const roll = random();

    if (actionKey && roll < 0.7) {
        return kanojoPickLine(KANOJO_FAIRY.actionLines[actionKey], random);
    }

    const moodKey = kanojoGetMoodKey(npc);
    if (KANOJO_FAIRY.moodLines[moodKey] && roll < 0.9) {
        return kanojoPickLine(KANOJO_FAIRY.moodLines[moodKey], random);
    }

    const favorTier = kanojoGetFavorTier(npc);
    if (KANOJO_FAIRY.favorLines[favorTier]) {
        return kanojoPickLine(KANOJO_FAIRY.favorLines[favorTier], random);
    }

    return kanojoPickLine(KANOJO_FAIRY.defaultLines, random);
}

function getKanojoNpcLine(npc, actionId, randomFn) {
    if (!npc || npc.type !== "fairy") return "";
    return getKanojoFairyLine(actionId, npc, randomFn);
}

function getKanojoNpcStyle(npc) {
    if (!npc || npc.type !== "fairy") return null;
    return KANOJO_FAIRY.colors;
}

window.KANOJO_FAIRY = KANOJO_FAIRY;
window.getKanojoNpcLine = getKanojoNpcLine;
window.getKanojoNpcStyle = getKanojoNpcStyle;
