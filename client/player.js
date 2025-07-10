'use strict';

const localDbStats = {};

// Network: Clear player weapons

addNetworkHandler('clearPlayerWeapons', () => {
	localPlayer.clearWeapons();
});

// ----------------------------------------------------------------------------------------------------

/*
*   Network: Set player health:
*       null - exact value
*       true - increment by value
*       false - decrement by value
*/

addNetworkHandler('setPlayerHealth', (health, increment) => {
	const hp = parseInt(health);

	increment == null ? localPlayer.health = hp : increment ? localPlayer.health += hp : localPlayer.health -= hp;
});

// ----------------------------------------------------------------------------------------------------

/*
*   Network: Set player armour:
*       null - exact value
*       true - increment by value
*       false - decrement by value
*/

addNetworkHandler('setPlayerArmour', (armour, increment) => {
	armour = parseInt(armour);

	increment == null ? localPlayer.armour = armour : increment ? localPlayer.armour += armour : localPlayer.armour -= armour;
});

// ----------------------------------------------------------------------------------------------------

/*
*   Network: Set player controls:
*       boolean - true/false
*/

addNetworkHandler('setPlayerControls', (controllable) => {
	if (spawnScreen.isEnabled) return;

	gta.setPlayerControl(controllable);
});

// ----------------------------------------------------------------------------------------------------

/*
*   Network: Remove player from vehicle.
*/

addNetworkHandler('removePlayerFromVehicle', () => {
	localPlayer.removeFromVehicle();
});

// ----------------------------------------------------------------------------------------------------

/*
*   Network: Set player animation
*/

addNetworkHandler('setPlayerAnimation', (pedId, animGroup, animId, lockControlsTime) => {
	const ped = getElementFromId(Number(pedId));

	if (ped == null) return;

	ped.clearAnimations();
	ped.addAnimation(Number(animGroup), Number(animId));
	ped.blendAnimation(Number(animGroup), Number(animId), 0.0);

	if (lockControlsTime) {
		gta.setPlayerControl(false);

		setTimeout(() => {
			gta.setPlayerControl(true);
		}, Number(lockControlsTime));
	}
});

addNetworkHandler('removePlayerBodyPart', (pedId, bodyPart) => {
	const ped = getElementFromId(Number(pedId));

	if (ped == null) return;

	ped.removeBodyPart(Number(bodyPart));
});

/*
*   Network: Set player heading
*/

addNetworkHandler('setPlayerHeading', (heading) => {
	localPlayer.heading = Number(heading);
});

addNetworkHandler('setInitialData', (spawnSelection, weaponSelection, spawns) => {
	spawnScreen.skinSelection = spawnSelection;
	spawnScreen.weaponSelection = weaponSelection;
	spawnScreen.spawns = spawns;

	//spawnScreen.enter();
});

addNetworkHandler('bigMessage', (text, time, style) => {
	gta.setCustomText('X', text);
	gta.bigMessage('X', Number(time), Number(style));
});

function smallMessage(text, time, style) {
	gta.setCustomText('Z', text);
	gta.smallMessage('Z', Number(time), Number(style));
}

addNetworkHandler('smallMessage', (text, time, style) => {
	smallMessage(text, time, style);
	// gta.setCustomText("Z", text);
	// gta.smallMessage("Z",  Number(time), Number(style));
});

addCommandHandler('pos', (command, params, client) => {
	const x = parseFloat(localPlayer.position.x).toFixed(2);
	const y = parseFloat(localPlayer.position.y).toFixed(2);
	const z = parseFloat(localPlayer.position.z).toFixed(2);
	const heading = parseFloat(localPlayer.heading).toFixed(2);
	const message = params.toString() ? `${params} ${x.toString()}, ${y.toString()}, ${z.toString()} ${heading}` : `${x.toString()}, ${y.toString()}, ${z.toString()} ${heading}`;

	console.log(message);
});


addNetworkHandler('giveSpawnWeapons', () => {
	spawnScreen.armSelectedWeapon();
	spawnScreen.armDefaultWeapons();
});

addNetworkHandler('goTo', (type, position) => {
	if (type && position) {
		switch (type) {
		case 'driveTo':
			const vehicle = localPlayer.vehicle;

			if (vehicle) {
				vehicle.driveTo(position);
				vehicle.setCarCruiseSpeed(30.0);
				vehicle.setDrivingStyle(DRIVINGSTYLE_AVOIDCARS);
			}
			break;
		case 'walkTo':
			localPlayer.walkTo(position);
			break;
		case 'runTo':
			position = new Vec2(position.x, position.y);
			localPlayer.runTo(position);
			break;
		}
	} else {
		if (localPlayer.vehicle && localPlayer.seat == 0) {
			localPlayer.vehicle.driveTo(localPlayer.position);
		} else {
			localPlayer.clearObjective();
		}
	}
});

// Enable headshots and shakecam on inflicted damage. Let colt and UZI apply higher damage with headshot, but don't kill instantly, so thse weapons wont be overpowered.
const HS_WEAPONS = [false, false, true, true, true, true, true, true, false, false, false, false, false];
const HS_ENABLED = true;

addEventHandler('onPedInflictDamage', (event, ped, responsibleEntity, weapon, loss, pedPiece) => {
	if (ped == localPlayer) {
		if (responsibleEntity && responsibleEntity.type == ELEMENT_PLAYER) {
			natives.SHAKE_CAM(100);
		}

		if (pedPiece == PEDPIECETYPES_HEAD && HS_WEAPONS[weapon] && responsibleEntity.type == ELEMENT_PLAYER && HS_ENABLED) {
			if (weapon <= 3) localPlayer.health -= 40;
			else {
				localPlayer.health = 0;
			}
		}
	}
});


addCommandHandler('kill', (command, params, client) => {
	if (spawnScreen.isEnabled) message('[#FF0000]Ooops! You aren\'t even spawned!');
	else {
		if (localPlayer.vehicle) localPlayer.removeFromVehicle();

		localPlayer.health = 0.0;
	}
});
