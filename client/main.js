'use strict';

addEvent('onLoginProcess', 0);

let isHudEnabled = true;
let preInit = true;
let isResourceReady = false;

bindEventHandler("OnResourceReady", thisResource, function (event, resource) {
	triggerEvent('onLoginProcess');

	initAchievements();

	if (gta.game == GAME_GTA_III) {
		gta.setIslands(ISLAND_SHORESIDEVALE);
	}

	bindKey(SDLK_h, KEYSTATE_UP, togglePhotoMode);
});

function processPlayerSpawn () {
	const spawnType = localClient.getData('spawnType');

	if (gta.game <= 4) gta.fadeCamera(false, 0.0, COLOUR_BLACK);

	if (spawnType != null) {
		switch (spawnType) {
			case 0:
				spawnScreen.enter();
				break;
			case 1:
				// TODO: implement last position spawn type.
				break;
			case 2:
				// TODO: implement stored position spawn type.
				break;
			case 3:
				// TODO: implement Hospital respawn.
				const id = 0;

				/* if (gta.game == GAME_GTA_III) {
						if (player.island == ISLAND_PORTLAND) id = 3;
						else if (player.island == ISLAND_STAUNTONISLAND) id = 4;
						else id = 5;
					} else if (gta.game == GAME_GTA_VC) {
						// TODO: implement
					}*/

				const hospital = gameLocations[gta.game][id];
				localPlayer.position = hospital[1];
				break;
		}
	}
}

addEventHandler('onLoginProcess', (event) => {
	setTimeout(() => {
		const loginState = localClient.getData('isLoggedIn');
		const camera = Spawn.get(spawnScreen.skinSelection).camera;

		gta.setPlayerControl(false);
		if (gta.game < GAME_GTA_IV) gta.fadeCamera(true, 3.0, 1);
		localPlayer.invincible = true;
		gta.setCameraLookAt(new Vec3(camera.x + 200.0, camera.y + 200.0, camera.z + 200.0), localPlayer.position, false);
		
		/*
		if (loginState < 1 ) {
			gui.showCursor(true, false);
			setChatWindowEnabled(true);
			setHudState(false);
		*/

		if (loginState === LOGIN_NOT_REGISTERED) {
			const title = Locale.getString('client.gui.information');
			const popupMessage = Locale.getString('client.gui.notRegistered', localClient.name);
			const rulesMessage = Locale.getString('client.gui.rulesMessage');

			new Popup(title, popupMessage, null, null, function() {
				new Prompt(title, rulesMessage, null, null, null, function() {
					new LoginWindow(isLoggedIn);
				}, function() {
					triggerNetworkEvent('gui.disconnect', 'Rules not accepted');
				});
			});
		} else if (loginState === LOGIN_REGISTERED) {
			new LoginWindow(isLoggedIn);
		} else if (loginState === LOGIN_OK) {
			//dashboard.toggle();
			processPlayerSpawn();
		}

		preInit = false;
	}, 1000);
});

// TODO: Cleanup, refactor, implementations.
addEventHandler('onPedSpawn', (event, ped) => {
	if (preInit) {
		if (gta.game < GAME_GTA_IV) gta.fadeCamera(false, 0.0, COLOUR_BLACK);
	}
	else {
		if (ped && ped.type == ELEMENT_PLAYER && ped.isSyncer && localClient.getData('dojo') == null) {
			processPlayerSpawn();
		}
	}
});

// onPedWasted(Event event, Ped wastedPed, Ped attackerPed, int weapon, int pedPiece)
addEventHandler('onPedWasted', function(event, ped, attackerPed, weapon, pedPiece) {
	console.log('onPedWasted!');
	if (isConnected && ped.type == ELEMENT_PLAYER && ped.isSyncer && localClient.getData('dojo') == null) {
		// TODO: add check for instant respawn
		gta.fadeCamera(false, 5.0, COLOUR_WHITE);
	}
});

let chatWindowState = chatWindowEnabled;
let hudState = isHudEnabled;
let isPhotoModeEnabled = false;

function togglePhotoMode() {
	if (!isPhotoModeEnabled) {
		chatWindowState = chatWindowEnabled;
		hudState = isHudEnabled;
		setChatWindowEnabled(false);
		setHudState(false);
		isPhotoModeEnabled = true;
	} else {
		setChatWindowEnabled(chatWindowState);
		setHudState(hudState);
		isPhotoModeEnabled = false;
	}
}

// There is no function for getting hud state, so here's an override.
// Don't use official "setHudEnabled" func from now.

function setHudState(state) {
	isHudEnabled = state;
	setHUDEnabled(state);
}