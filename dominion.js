const fs = require('fs');

const dominion = JSON.parse(
		fs.readFileSync('./dominion_nl.json', 'utf8'));

const defaultProbabilities = {
  "menagerie": {
    "includeWays": 0.5
  },
  "event": 0.5,
  "landmark": 0.5
};

const kingdom = [];

// kingdom determination
for (let i = 0; i < 10; i++) {
	let box, pile;
	do {
		box = dominion.boxes[Math.floor(Math.random() * dominion.boxes.length)];

    let pileOptions = [...box.cards];
    if (box.combinedPiles) {
      pileOptions = pileOptions.concat(box.combinedPiles);
    }

    pile = pileOptions[Math.floor(Math.random() * pileOptions.length)];
	} while (kingdom.some(p => p.pile.name === pile.name && p.box.name === box.name));
	
	kingdom.push({box, pile});
}

for (const entry of kingdom) {
	console.log(`${dominion.boxNames[entry.box.name]}: ${entry.pile.name} ${!!entry.pile.cards ? '(' + entry.pile.cards.map(c => c.name).join(', ') + ')' : ''}`);
}
console.log();

// Prosperity: platina / colony decision
if (kingdom.some(p => p.box.name === "prosperity")) {
  const probability = kingdom
    .filter(p => p.box.name === "prosperity")
    .length / 10;
	console.log(`Platina / kolonie: ${Math.random() < probability ? 'ja' : 'nee'}`);
}

// see https://wiki.dominionstrategy.com/index.php/Landscape
const cardShapedThings = [];

function maybeAddRandomEvent() {
  if (cardShapedThings.length >= 2) {
    return;
  }

  const events = dominion.boxes
    .filter(box => !!box.events)
    .filter(box => kingdom.some(p => p.box.name === box.name))
    .map(box => box.events)
    .reduce((eventsA, eventsB) => eventsA.concat(eventsB));

  if (events.length > 0 && Math.random() < defaultProbabilities.event) {
    const event = events[Math.floor(Math.random() * events.length)];
    console.log(`Gebeurtenis: ${event.name}`);
    cardShapedThings.push(event);
  }
}

function maybeAddRandomLandmark() {
  if (cardShapedThings.length >= 2) {
    return;
  }

  const landmarks = dominion.boxes
    .filter(box => !!box.landmarks)
    .filter(box => kingdom.some(p => p.box.name === box.name))
    .map(box => box.landmarks)
    .reduce((landmarksA, landmarksB) => landmarksA.concat(landmarksB));

  if (landmarks.length > 0 && Math.random() < defaultProbabilities.landmark) {
      const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      console.log(`Bezienswaardigheid: ${landmark.name}`);
      cardShapedThings.push(landmark);
  }
}

// Allies: ally decision
const alliesBox = dominion.boxes.find(b => b.name === 'allies');
if (alliesBox && kingdom.some(p => p.box.name === "allies")) {
  const ally = alliesBox.allies[Math.floor(Math.random() * alliesBox.allies.length)];
  console.log(`Bondgenoot: ${ally.name}`);
  cardShapedThings.push(ally);
}

// Menagerie: ways decision
const menagerieBox = dominion.boxes.find(b => b.name === 'menagerie');
if (menagerieBox && kingdom.some(p => p.box.name === "menagerie")) {
  if (Math.random() < defaultProbabilities.menagerie.includeWays) {
    const way = menagerieBox.ways[Math.floor(Math.random() * menagerieBox.ways.length)];
    console.log(`Spoor: ${way.name}`);
    cardShapedThings.push(way);
  }
}

// Empires and Menagerie: Events and landmarks
for (let i = 0; i < 2; i++) {
  if (Math.random() < 0.5) {
    maybeAddRandomEvent();
  } else {
    maybeAddRandomLandmark();
  }
}