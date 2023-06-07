"use strict";

let dojos = null;

function enterDojo(client,params) {
	if (params.length == 0) {
		makeList(client, "dojos", dojos);
	} else {
		let i = dojos.findIndex( dojos => dojos.name == params.toString() );

		if (i != -1) {
			let dojo = dojos[i];
			let random = getRandomInt(dojo.spawn.length-1);
			let player = Player.get(client);

			// Store player data.
			if (client.getData("dojo") == null) {
				triggerNetworkEvent("setPlayerHealth", client, 100);
				triggerNetworkEvent("setPlayerArmour", client, 0);
				player.session.storedPosition = client.player.position;
				player.session.storedHeading = client.player.heading;
				player.session.storedDimension = client.player.dimension;

				// Print dojo information.
				printMessage(client, "dojo", params.toString());
			}
			
			// Setup and move player to dojo.
			triggerNetworkEvent("clearPlayerWeapons", client);
			client.setData("dojo", i, true);
			// Setting heading doesnt work on server-side.
			//client.player.position = dojo.spawn[random].position;
			//client.player.heading = dojo.spawn[random].heading;
			let position = dojo.spawn[random].position;
			let heading = dojo.spawn[random].heading;
			Player.get(client).teleport(position, heading, false);
			client.player.dimension = dojo.dimension;
			client.player.skin = Spawn.get(client.getData("team")).skin;
			//client.player.health = 100;

			client.player.giveWeapon(dojo.weapon, 9999, true);

			return true;
		} else {
			return false;
		}
	}
}

function exitDojo(client) {
	client.player.position = Player.get(client).session.storedPosition;
	client.player.heading = Player.get(client).session.storedHeading;
	client.player.dimension = Player.get(client).session.storedDimension;
	client.setData("dojo", null, true);

	triggerNetworkEvent("giveSpawnWeapons", client);
}

function initDojos() {
    if (server.game == GAME_GTA_III) {
		let DOJO_DIMENSION = 100;

		const SPAWN_DOJO_RAILWAYS = [
			{ position: new Vec3(1303.22, -36.98, 14.65), heading: -1.24 },
			{ position: new Vec3(1333.39, -29.90, 14.95), heading: 2.49 },
			{ position: new Vec3(1333.30, -99.79, 14.66), heading: 1.64 },
			{ position: new Vec3(1316.33, -121.61, 14.9), heading: -0.00 },
			{ position: new Vec3(1320.14, -106.33, 15.01), heading: -0.00 }
		];

		const SPAWN_DOJO_SSV_STORAGE = [
			{ position: new Vec3(-1179.08, 95.00, 68.71), heading: 0.88 },
			{ position: new Vec3(-1167.37, 120.17, 68.77), heading: 1.85 },
			{ position: new Vec3(-1236.73, 117.36, 68.62), heading: -0.86 },
			{ position: new Vec3(-1242.51, 87.80, 68.68), heading: -1.56 }
		];

		dojos = [
			{ name: "ak", weapon: 5, dimension: DOJO_DIMENSION++, spawn: SPAWN_DOJO_RAILWAYS },
			{ name: "m16", weapon: 6, dimension: DOJO_DIMENSION++, spawn: SPAWN_DOJO_RAILWAYS },
			{ name: "sniper", weapon: 7, dimension: DOJO_DIMENSION++, spawn: SPAWN_DOJO_RAILWAYS },
			{ name: "shotgun", weapon: 4, dimension: DOJO_DIMENSION++, spawn: SPAWN_DOJO_SSV_STORAGE }
		];
    }
}