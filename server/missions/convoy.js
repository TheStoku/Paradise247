'use strict';

/*
    Convoys system
*/

const Convoys = [];
const ActiveConvoySpheres = new Map();

class Convoy {
	constructor(id, destination, name) {
		this.destination = destination;
		this.name = name;
		this.id = id;
		
		Convoys.push(this);
	}

	static get(id) {
		return Convoys.find((convoy) => convoy.id === id) || null;
	}

	static start(client, id, vehicle) {
		const instance = Convoy.get(id);
		if (!instance || !vehicle) return;

		if (ActiveConvoySpheres.has(vehicle.id)) {
			const oldSphere = ActiveConvoySpheres.get(vehicle.id);
			if (oldSphere) oldSphere.destructor();
		}

		const sphere = new Sphere(instance.destination, 5.0, Convoy.end, 0, 4, COLOUR_GREEN, true, true);
		
		if (sphere.blip !== null) {
			sphere.blip.netFlags.distanceStreaming = false;
		}

		ActiveConvoySpheres.set(vehicle.id, sphere);

		Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.convoy.start');
		log(`Convoy.start(): Sphere ID: ${sphere.id} assigned to vehicle ID: ${vehicle.id}`, Log.DEBUG);
	}

	static corrupt(vehicle) {
		if (!vehicle) return;
		
		if (ActiveConvoySpheres.has(vehicle.id)) {
			const sphere = ActiveConvoySpheres.get(vehicle.id);
			if (sphere) sphere.destructor();
			ActiveConvoySpheres.delete(vehicle.id);
		}
	}

	static end(event, ped, sphere, entered) {
		const player = Player.get(ped);
		// Zabezpieczenie przed błędem jeśli w marker weszło np. NPC lub zbugowany gracz
		if (!player || !ped.vehicle) return;

		const client = player.client;
		const vehicle = ped.vehicle;
		const id = Number(vehicle.getData('convoy'));
		const instance = Convoy.get(id);

		if (instance) {
			Convoy.corrupt(vehicle);
			
			vehicle.setData('convoy', 0, true);

			const reward = earn(client, earningBase.convoy, xpBase.convoy);

			Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.convoy.end', reward.toString());
			decho(3, client.name + ' has completed a convoy!');
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
	if (ped.type === ELEMENT_PLAYER && vehicle) {
		if (vehicle.getData('default') === true) {
			const convoyId = vehicle.getData('convoy');
			
			if (convoyId) {
				const client = getClientFromPlayerElement(ped);
				if (client) Convoy.start(client, Number(convoyId), vehicle);
			}
		}
	}
});

addEventHandler('OnPedExitedVehicleEx', (event, ped, vehicle, seat) => {
	if (ped.type === ELEMENT_PLAYER && vehicle) {
		if (vehicle.getData('default') === true) {
			if (vehicle.getData('convoy')) {
				Convoy.corrupt(vehicle); 
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
	if (server.game === GAME_GTA_III) {
		new Convoy(1, new Vec3(153.66, -977.30, 26.17), 'Staunton Bank');
		new Convoy(2, new Vec3(1040.15, -697.44, 14.97), 'Portland Bank');
	}
}
