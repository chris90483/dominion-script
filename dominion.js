
let fs;
let dominion = {};
let options = {};

let isNodeJs = typeof module !== 'undefined' && module.exports;

let main = () => {
	let result = "";

	const defaultProbabilities = {
	  "menagerie": {
		"includeWays": 0.3
	  },
	  "renaissance": {
		"firstProject": 0.8,
		"secondProject": 0.8
	  },
	  "events": 0.5,
	  "landmarks": 0.5
	};

	if (isNodeJs) {
		result += "\n";
	}
	const kingdom = [];
	let boxes = dominion.boxes;
	if (options && options.allowedBoxNames && options.allowedBoxNames.length > 0) {
		boxes = boxes.filter(b => options.allowedBoxNames.includes(b.name));
	}

	// kingdom determination
	for (let i = 0; i < 10; i++) {
		let box, pile;
		do {
			box = boxes[Math.floor(Math.random() * boxes.length)];

			let pileOptions = [...box.cards];
			if (box.combinedPiles) {
			  pileOptions = pileOptions.concat(box.combinedPiles);
			}

			pile = pileOptions[Math.floor(Math.random() * pileOptions.length)];
		} while (kingdom.some(p => p.pile.name === pile.name && p.box.name === box.name));
		
		kingdom.push({box, pile});
	}

	result += "=== Koninkrijk ===\n"
	kingdom.sort((e1, e2) => e1.box.name.localeCompare(e2.box.name));
	for (const entry of kingdom) {
		result += `${dominion.boxNames[entry.box.name]}: ${entry.pile.name} ${!!entry.pile.cards ? '(' + entry.pile.cards.map(c => c.name).join(', ') + ')' : ''}\n`;
	}

	const additionalMessages = [];

	// Prosperity: platina / colony decision
	if (kingdom.some(p => p.box.name === "prosperity")) {
	  const probability = kingdom
		.filter(p => p.box.name === "prosperity")
		.length / 10;
	  //todo: platina / kolonie ook vertaald in de dominion json zetten
		additionalMessages.push(`Platina / kolonie: ${Math.random() < probability ? 'ja' : 'nee'}`);
	}

	// Renaissance: projects
	const renaissanceBox = dominion.boxes.find(b => b.name === 'renaissance');
	if (kingdom.some(p => p.box.name === "renaissance")) {
	  if (Math.random() < defaultProbabilities.renaissance.firstProject) {
            const firstProject = renaissanceBox.projects[Math.floor(Math.random() * renaissanceBox.projects.length)];
	    additionalMessages.push(`${dominion.boxNames.renaissance}: ${firstProject.name} (${dominion.cardShapedThingTypeNames.projects.singular})`);

            if (Math.random() < defaultProbabilities.renaissance.secondProject) {
              const remainingProjects = renaissanceBox.projects.filter(p => p.name !== firstProject.name);
              const secondProject = remainingProjects[Math.floor(Math.random() * remainingProjects.length)];

	      additionalMessages.push(`${dominion.boxNames.renaissance}: ${secondProject.name} (${dominion.cardShapedThingTypeNames.projects.singular})`);
	    }
	  }
	}

	// see https://wiki.dominionstrategy.com/index.php/Landscape
	const cardShapedThings = [];

	// Allies: ally decision
	const alliesBox = dominion.boxes.find(b => b.name === 'allies');
	if (kingdom.some(p => p.pile.types && p.pile.types.includes("Liason"))) {
	  const ally = alliesBox.allies[Math.floor(Math.random() * alliesBox.allies.length)];
	  additionalMessages.push(`${dominion.boxNames.allies}: ${ally.name} (bondgenoot)`);
	  cardShapedThings.push(ally);
	}

	// Menagerie: ways decision
	const menagerieBox = dominion.boxes.find(b => b.name === 'menagerie');
	if (menagerieBox && kingdom.some(p => p.box.name === "menagerie")) {
	  if (Math.random() < defaultProbabilities.menagerie.includeWays) {
		const way = menagerieBox.ways[Math.floor(Math.random() * menagerieBox.ways.length)];
		additionalMessages.push(`${dominion.boxNames.menagerie}: ${way.name} (${dominion.cardShapedThingTypeNames.ways.singular})`);
		cardShapedThings.push(way);
	  }
	}

	function randomCardShapedThing(type) {
	  const csts = dominion.boxes
		.filter(box => !!box[type]) /* only select boxes that have the specified cst type */
		.filter(box => kingdom.some(p => p.box.name === box.name)) /* only boxes that have at least 1 card in the kingdom */
		.map(box => box[type]
		  .map(cst => {return {...cst, boxName: box.name, type}}) /* create options for the csts */
		)
		.reduce((res, nextCsts) => res.concat(nextCsts), []) /* reduce results to single list */
		.filter(cst => 
		  !cardShapedThings.some(thing => thing.name === cst.name) &&
		  !cardShapedThings.some(thing => thing.type === cst.type)); /* select only csts that are not already picked */

	  if (csts.length === 0) {
		// no valid candidate found.
		return null;
	  }
	  return csts[Math.floor(Math.random() * csts.length)];
	}

	// Empires / Menagerie: Landmarks & Events
	function decideLandmarksEvents() {
	  const types = ['events', 'landmarks']
		  .filter(t => kingdom.some(p => !!p.box[t]));
		if (types.length === 0) {
		  return;
		}
	  for (let i = 0; i < 2; i++) {
		if (cardShapedThings.length >= 2) {
		  return;
		}

		const type = types[Math.floor(Math.random() * types.length)];
		const cst = randomCardShapedThing(type);
		
		if (!!cst && Math.random() < defaultProbabilities[type]) {
		  additionalMessages.push(`${dominion.boxNames[cst.boxName]}: ${cst.name} (${dominion.cardShapedThingTypeNames[type].singular})`);
		  cardShapedThings.push(cst);
		}
	  }
	}

	decideLandmarksEvents();

	if (additionalMessages.length > 0) {
	  result += "\n=== Overige beslissingen ===\n";
	  for (const msg of additionalMessages) {
		result += `${msg}\n`;
	  }
	}
	
	return result;
}

if (isNodeJs) {
	fs = require('fs');
	dominion = JSON.parse(
		fs.readFileSync('./dominion_nl.json', 'utf8'));
	const result = main();
	for (const line of result.split("\n")) {
		console.log(line);
	}
}
