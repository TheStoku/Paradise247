'use strict';

let dodoFlightStart = -1;

addEventHandler('OnEntityProcess', function(event, entity) {
	if (entity.type == ELEMENT_PLAYER) {
		// Add ped bleeding on low HP.
		if (thisGame < 4) {
			if (entity.health <= 25) {
				entity.bleeding = true;
			} else {
				entity.bleeding = false;
			}
		}
	}

	if (localPlayer != null && isConnected) {
		if (entity == localPlayer) {
			// Dodo flight time.
			if (entity.vehicle && gta.game == 1 && entity.vehicle.model == MODELVEHICLE_CAR_DODO && localPlayer.seat == 0) {
				const vehHandle = natives.STORE_CAR_PLAYER_IS_IN(natives.GET_PLAYER_ID());

				if (natives.IS_CAR_IN_AIR(vehHandle) && !natives.IS_CAR_IN_WATER(vehHandle) && dodoFlightStart == -1) {
					dodoFlightStart = gta.tickCount;
				} else if ((!natives.IS_CAR_IN_AIR(vehHandle) || natives.IS_CAR_IN_WATER(vehHandle)) && dodoFlightStart != -1) {
					finishFlight();
				}
			} else if (dodoFlightStart != -1) {
				finishFlight();
			}

			// Check if player is in dojo.
			const dojoId = localClient.getData('dojo');

			if (dojoId != null) {
				let boundraries = null;
				let dojoCenter = null;
				const testPos = new Vec2(localPlayer.position.x, localPlayer.position.y);

				if (dojoId <= 2) { // Railways
					boundraries = [testPos, new Vec2(1285.87, -40.24), new Vec2(1310.47, -30.99), new Vec2(1318.27, -23.06), new Vec2(1344.06, -23.80), new Vec2(1343.60, -136.19), new Vec2(1337.27, -142.26), new Vec2(1284.56, -142.23)];
					dojoCenter = new Vec3(1317.10, -78.56, 16.35);
				} else if (dojoId == 3) { // SSV Storage
					boundraries = [testPos, new Vec2(-1151.94, 125.25), new Vec2(-1151.86, 108.84), new Vec2(-1166.64, 98.83), new Vec2(-1176.82, 83.51), new Vec2(-1180.51, 65.01), new Vec2(-1180.46, 23.06), new Vec2(-1187.87, 23.06), new Vec2(-1187.87, 84.11), new Vec2(-1218.27, 83.88), new Vec2(-1232.04, 70.11), new Vec2(-1248.46, 53.36), new Vec2(-1248.46, 23.74), new Vec2(-1254.26, 23.73), new Vec2(-1255.11, 85.88), new Vec2(-1255.75, 161.44), new Vec2(-1242.54, 161.48), new Vec2(-1242.54, 125.98)];
					dojoCenter = new Vec3(-1215.05, 101.64, 68.63);
				} else if (dojoId === 4) { // Stadium
					boundraries = [testPos, new Vec2(-92.19, -230.32), new Vec2(-139.38, 2.30), new Vec2(-43.61, 72.18), new Vec2(55.13, 57.37), new Vec2(94.03, -59.94), new Vec2(84.24, -211.99)];
					dojoCenter = new Vec3(-16.04, -80.21, 19.11);
				}

				const polyTest = inPoly.apply(null, boundraries);

				// message(polyTest.toString());

				if (!polyTest) {
					const heading = getHeadingFromPosToPos(dojoCenter, localPlayer.position);
					const pos = getPosBehindPos(localPlayer.position, heading, 1.0);
					localPlayer.position = pos;
				}
			}
		}
	}
});

function finishFlight() {
	const flightTime = Math.round((gta.tickCount - dodoFlightStart)/1000);

	if (flightTime > 0) {
		triggerNetworkEvent('onDodoFlightFinish', flightTime);
	}

	dodoFlightStart = -1;
}

addEventHandler('OnPickupCollected', (event, pickup, ped) => {
	triggerNetworkEvent('OnPickupCollected_C', pickup.id);
});
