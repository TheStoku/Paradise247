'use strict';

const KingOfTheHills = [];

class KingOfTheHill {
	constructor(id, center, redSpawn, blueSpawn) {
		this.sphere = null;
		this.id = id;
		this.center = center;
		this.redSpawn = redSpawn;
		this.blueSpawn = blueSpawn;
		this.score = [0, 0];

		KingOfTheHills.push(this);
	}

	static get(id) {
		const index = KingOfTheHills.findIndex( (koth) => koth.id == id );

		return index > -1 ? KingOfTheHills[index] : null;
	}

	static start(id) {
		const instance = KingOfTheHill.get(id);

		if (instance.sphere === null) instance.sphere = new Sphere(instance.center, 5.0, KingOfTheHill.end, 0, 4, COLOUR_GREEN, true, true);
		if (instance.sphere.blip !== null) instance.sphere.blip.netFlags.distanceStreaming = false;
	}
}

function initKingOfTheHill() {
	if (server.game == GAME_GTA_III) {

	}
}
