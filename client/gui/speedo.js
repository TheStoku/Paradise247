'use strict';

const speedoFont = lucasFont.createDefaultFont(16.0, 'Tahoma', 'Bold');

const speedo = {
	metric: true,
	speed: -1,
	altitude: -1,
	mileage: -1,
	tick: -1,
};

addEventHandler('OnEntityProcess', function(event, entity) {
	// return;
	if (typeof localPlayer == 'undefined') return;

	if (localPlayer != null && isConnected) {
		if (entity == localPlayer) {
			if (entity.vehicle != null) {
				const vehicle = entity.vehicle;
				const velocity = vehicle.velocity;

				// Count speed
				const speed = (getSpeedFromVelocity(velocity) * 100);
				speedo.speed = speedo.metric ? speed * 1.6 : speed;

				// TODO: Count alt
				/* if (vehicle.model == MODELVEHICLE_CAR_DODO) {
                    speedo.altitude = vehicle.position.z - gta.findGroundZCoordinate([vehicle.position.x, vehicle.position.y]) - 2;//vehicle.heightAboveRoad - 2;//vehicle.position.z - gta.findGroundZCoordinate([vehicle.position.x, vehicle.position.y]);
                } else {
                    speedo.altitude = -1;
                }*/

				// Load vehicle mileage
				if (speedo.mileage == -1) {
					const mileage = vehicle.getData('mileage');

					if (typeof mileage != 'undefined') {
						speedo.mileage = Number(mileage) * 1000;
					}
				}

				// Count mileage
				if (gta.tickCount - speedo.tick >= 250 && localPlayer.seat == 0) {
					const inc = Math.round((getSpeedFromVelocity(velocity) * 100)/4);
					speedo.mileage += inc;
					speedo.tick = gta.tickCount;

					// Store mileage to vehicle data
					const formattedMileage = (speedo.mileage/1000).toFixed(2);
					// const formattedInc = (inc/1000).toFixed(2);

					triggerNetworkEvent('updateMileage', formattedMileage, inc);
				}
			} else {
				speedo.speed = -1;
				speedo.mileage = -1;
				speedo.altitude = -1;
			}
		}
	}
});

addEventHandler('OnDrawnHUD', (event) => {
	if (typeof localPlayer == 'undefined') return;

	const vehicle = localPlayer.vehicle;
	if (!vehicle) return;
	if (!focus) return;
	if (!isConnected) return;
	if (spawnScreen && spawnScreen.isEnabled && dashboard && dashboard.isShown) return;
	if (localClient.getData('isLoggedIn') == -1) return;

	// TODO: Draw alt
	/* if (speedo.altitude != -1) {
        speedoFont.render(`${Math.round(speedo.altitude)}`, [0, gta.height - 120], gta.width, 0.99, 0.0, 18, COLOUR_ORANGE, true, true, false, true);
    }*/

	if (speedo.speed != -1) {
		const units = speedo.metric ? 'KM/h' : 'MPh';
		// const col = toColour(0, 0, 0, 50);// );

		speedoFont.render(`${Math.round(speedo.speed)} ${units}`, [0, gta.height - 90], gta.width, 0.99, 0.0, 18, COLOUR_ORANGE, true, true, false, true);
	}

	if (speedo.mileage != -1) {
		speedoFont.render(`${vehicle.getData('mileage')} km`, [0, gta.height - 60], gta.width, 0.99, 0.0, 12, COLOUR_ORANGE, true, true, false, true);
	}
});

addCommandHandler('units', (command, params, client) => {
	speedo.metric = !speedo.metric;
	message('Metric units: ' + speedo.metric.toString());
});
