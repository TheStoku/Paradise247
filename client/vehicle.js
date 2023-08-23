'use strict';

addNetworkHandler('setTaxiLight', (client, enabled) => {
	const vehicle = natives.STORE_CAR_PLAYER_IS_IN(client);

	natives.SET_TAXI_LIGHTS(vehicle, enabled ? 1 : 0);
});

addNetworkHandler('respawnVehicle', (vehicleId, x, y, z, heading) => {
	const vehicle = getElementFromId(vehicleId);

	if (vehicle != null) {
		vehicle.fix();
		vehicle.position = new Vec3(x, y, z);
		vehicle.turnVelocity = new Vec3(0.0, 0.0, 0.0);
		vehicle.setRotation(new Vec3(0.0, 0.0, heading));
		vehicle.lights = false;
		vehicle.engine = false;
	}
});

addNetworkHandler('explodeVehicle', (vehicleId) => {
	const vehicle = getElementFromId(vehicleId);

	if (vehicle.syncer != localClient) vehicle.blow();
});

addNetworkHandler('flipVehicle', () => {
	if (!localPlayer.vehicle) return;

	localPlayer.vehicle.turnVelocity = new Vec3(0.0, 0.0, 0.0);
	localPlayer.vehicle.setRotation(new Vec3(0.0, 0.0, localPlayer.vehicle.heading));
});

addEventHandler('onVehicleExplode', (event, vehicle) => {
	if (vehicle.isSyncer) {
		if (localPlayer.vehicle == vehicle) {
			// message(localPlayer.vehicle.toString());
			// message(vehicle.toString());
			localPlayer.removeFromVehicle;
		}
		triggerNetworkEvent('onVehicleExplode', vehicle.id);
	}
});

function toggleDoor(vehicle, door) {
	const doorStatus = vehicle.getDoorStatus(door);

	doorStatus == AUTOMOBILEDOORSTATUS_CLOSED ? vehicle.setDoorStatus(door, AUTOMOBILEDOORSTATUS_PHYSICS) : vehicle.setDoorStatus(door, AUTOMOBILEDOORSTATUS_CLOSED);

	message('Door status changed.');
}

// TODO: needs refactoring
function callService(vehicle, type) {
	if (!vehicle) return;

	switch (type) {
	case 'fix':
		if (vehicle.health < 1000.0) type = 'fix';
		else type = 'none';
		break;
	case 'flip':
		if (vehicle.flipped) type = 'flip';
		else type = 'none';
		break;
	case 'flip&fix':
		type = 'flip&fix';
		break;
	}
	if (type != 'none') triggerNetworkEvent('callService', vehicle.id, type);
	else message(`Everything is fine, no service needed.`);
}

bindEventHandler('OnResourceReady', thisResource, function(event, resource) {
	bindKey(SDLK_l, KEYSTATE_DOWN, function(e) {
		toggleLights();
	});
});

function toggleLights() {
	if (localPlayer && localPlayer.vehicle && localPlayer.seat == 0) {
		const vehicle = localPlayer.vehicle;

		vehicle.lights = !vehicle.lights;

		triggerNetworkEvent('onSetVehicleLights', localPlayer.vehicle.id, vehicle.lights);
	}
}

addNetworkHandler('setVehicleLights', (vehicleId, status) => {
	const vehicle = getElementFromId(vehicleId);

	if (vehicle.syncer == localClient) return;

	vehicle.lights = status;
});
