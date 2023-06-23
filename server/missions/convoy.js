'use strict';

/*
    Convoys system
*/

const Convoys = [];

class Convoy {
	constructor(id, destination, name) {
		this.destination = destination;
		this.sphere = null;
		this.vehicle = null;
		this.name = name;

		this.id = id;
		Convoys.push(this);
		// log("new Convoy(): " + this.id.toString(), Log.DEBUG);
	}

	destructor() {
		if (this.sphere) this.sphere.destructor();
		this.sphere = null;
	}

	static get(id) {
		const index = Convoys.findIndex( (convoy) => convoy.id == id );

		return index > -1 ? Convoys[index] : null;
	}

	static start(client, id, vehicle) {
		const instance = Convoy.get(id);

		if (instance.sphere === null) {
			instance.sphere = new Sphere(instance.destination, 5.0, Convoy.end, 0, 4, COLOUR_GREEN, true, true);
		}

		if (instance.sphere.blip !== null) {
			instance.sphere.blip.netFlags.distanceStreaming = false;
		}

		Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.convoy.start');

		log(`Convoy.start(): Sphere ID: ${instance.sphere.id}`, Log.DEBUG);
	}

	static corrupt(id) {
		const instance = Convoy.get(id);

		instance.destructor();
	}

	static end(event, ped, sphere, entered) {
		const player = Player.get(ped);
		const client = player.client;
		const vehicle = ped.vehicle;
		const id = Number(vehicle.getData('convoy'));
		const instance = Convoy.get(id);

		if (instance && instance.id == id) {
			instance.destructor();
			vehicle.setData('convoy', 0, true);

			const reward = earn(client, earningBase.convoy, xpBase.convoy);

			Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.convoy.end', reward.toString());
			triggerNetworkEvent('bigMessage', client, player.getLocale().getString('mission.passed', reward), 5000, 5);

			player.db.convoys++;

			client.setData('convoys', player.db.convoys);
			Achievement.check('convoys', player.db.convoys, client);

			updateGlobalStat('completedConvoys', 1, false, true);

			Quest.check(client, 'convoy');
		}
	}
}

addEventHandler('OnPedEnteredVehicleEx', (event, ped, vehicle, seat) => {
	if (ped.type == ELEMENT_PLAYER) {
		if (vehicle.getData('default') == true) {
			if (vehicle.getData('convoy')) {
				const client = getClientFromPlayerElement(ped);

				Convoy.start(client, Number(vehicle.getData('convoy')), vehicle);
			}
		}
	}
});

addEventHandler('OnPedExitedVehicleEx', (event, ped, vehicle, seat) => {
	if (ped.type == ELEMENT_PLAYER && vehicle) {
		if (vehicle.getData('default') == true) {
			if (vehicle.getData('convoy')) {
				Convoy.corrupt(Number(vehicle.getData('convoy')));
			}
		}
	}
});

addNetworkHandler('onVehicleExplode', function(client, vehicleId) {
	const vehicle = getElementFromId(vehicleId);

	// Check if vehicle is default one or spawned by command.
	if (vehicle.getData('default')) {
		// Corrupt convoy completely.
		if (vehicle.getData('convoy')) {
			Convoy.corrupt(Number(vehicle.getData('convoy')));

			Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.convoy.corrupt');
		}
	}
});

function initConvoyMission() {
	if (server.game == GAME_GTA_III) {
		// For testing.
		// new Convoy(1, new Vec3(1040.15, -697.44, 14.97)); // Portland bank
		// new Convoy(2, new Vec3(153.66, -977.30, 26.17)); // Portland bank
		new Convoy(1, new Vec3(153.66, -977.30, 26.17), 'Staunton Bank');
		new Convoy(2, new Vec3(1040.15, -697.44, 14.97), 'Portland Bank');
	}
}
