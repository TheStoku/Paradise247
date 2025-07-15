'use strict';

// Simple anticheat.
// TODO: Add locales.

function suspectedTrainerUsage(reason) {
    message('Suspected trainer usage. Leaving session...');
    triggerNetworkEvent('gui.disconnect', `Suspected trainer usage - ${reason}`);
}

function healthCheck() {
    if (localPlayer.health > 251) {
        suspectedTrainerUsage(`health hack`);
    }
}

function armourCheck() {
    if (localPlayer.armour > 251) {
        suspectedTrainerUsage(`armour hack`);
    }
}

function weaponCheck() {
    // Grenade and Molotov aren't used on the server at all cause of desync. M16 and RL are also unavailable on the "open map", so check for dojoid.
    const dojoId = localClient.getData('dojo');

    if (dojoId == null && gta.game == GAME_GTA_III) {
        if (localPlayer.weapon == WEAPON_M16 ||
            localPlayer.weapon == WEAPON_ROCKETLAUNCHER ||
            localPlayer.weapon == WEAPON_MOLOTOV ||
            localPlayer.weapon == WEAPON_GRENADE) {
                suspectedTrainerUsage(`weapon hack`);
        }
    }
}

addEventHandler('OnEntityProcess', function(event, entity) {
	if (localPlayer != null && isConnected) {
		if (entity == localPlayer) {
			healthCheck();
            armourCheck();
            weaponCheck();
		}
	}
});