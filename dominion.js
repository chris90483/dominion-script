const fs = require('fs');

const dominion = JSON.parse(
		fs.readFileSync('./dominion_nl.json', 'utf8'));
const boxNames = Object.keys(dominion.boxes);
const kingdom = {};

function sortKingdomByProp(prop) {
	kingdom.sort((a, b) => {
		const la = typeof a[prop] === 'string' ? a[prop].toLowerCase() : a[prop];
		const lb = typeof b[prop] === 'string' ? b[prop].toLowerCase() : b[prop];

		if (la < lb) return -1;
		return la > lb ? 1 : 0;
	});
}


for (let i = 0; i < 10; i++) {
	let box, name;
	do {
		boxName = boxNames[Math.floor(Math.random() * boxNames.length)];
		box = dominion.boxes[boxName];
		card = box.cards[Math.ceil(Math.random() * box.length)];
		
		
		// split the choice for the double expansion
		if (box === "Alchemisten/Overvloed") {
			const choice = Math.random() > 0.6;
			box = choice ? "Alchemisten" : "Overvloed";
		}
	} while (kingdom.some(c => c.name === name && c.box === box));
	
	kingdom.push({box, name});
}

sortKingdomByProp("box");
sortKingdomByProp("name");

for (const card of kingdom) {
	console.log(`${card.box}: ${card.name}`);
}

if (kingdom.some(c => c.box === "Welvaart")) {
	console.log(`platina / kolonie: ${Math.random() > 0.5 ? 'ja' : 'nee'}`);
}