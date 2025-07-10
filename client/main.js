'use strict';

let isHudEnabled = true;

// bindEventHandler("OnResourceReady", thisResource, function (event, resource) {
addEventHandler('OnResourceReady', (event, resource) => {
	setTimeout(() => {
		initAchievements();
	}, 3000);

	if (gta.game == GAME_GTA_III) {
		gta.setIslands(ISLAND_SHORESIDEVALE);
	}

	bindKey(SDLK_h, KEYSTATE_UP, togglePhotoMode);
});

let preInit = true;

// TODO: Cleanup, refactor, implementations.
addEventHandler('onPedSpawn', (event, ped) => {
	if (ped && ped.type == ELEMENT_PLAYER && ped.isSyncer && localClient.getData('dojo') == null) {
		const spawnType = localClient.getData('spawnType');
		const isLoggedIn = localClient.getData('isLoggedIn');

		if (gta.game <= 4) gta.fadeCamera(false, 0.0, COLOUR_BLACK);

		setTimeout(function() {
			if (spawnType != null) {
				switch (spawnType) {
				case 0:
					if (!preInit) {
						spawnScreen.enter();
					} else {
						setTimeout(() => {
							gta.setPlayerControl(false);
							if (gta.game <= 4) gta.fadeCamera(true, 3.0, 1);
							localPlayer.invincible = true;

							const camera = Spawn.get(spawnScreen.skinSelection).camera;
							gta.setCameraLookAt(new Vec3(camera.x + 200.0, camera.y + 200.0, camera.z + 200.0), localPlayer.position, false);

							if (isLoggedIn < 1 ) {
								gui.showCursor(true, false);
								setChatWindowEnabled(true);
								setHudState(false);

								if (isLoggedIn == -1) {
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
								} else if (isLoggedIn == 0) {
									new LoginWindow(isLoggedIn);
								}
							} /* else {
								// TODO: Fix this.
								/try {
									dashboard.toggle();
								} catch (error) {
									for (let index = 0; index <= 7; index++) {
										message('We have encountered an error. Please /reconnect', COLOUR_RED);
									}
								}
							}*/

							preInit = false;
						}, 3000);
					}
					// if (showWelcomeMessage) guiWelcomeInit();
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
		}, 1000);
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

function playSound(i) {
	natives.PLAY_MISSION_AUDIO(int)
	//natives.PLAY_MISSION_PASSED_TUNE(int)
	gta.playFrontEndSound(Number(i), 1.0);
	//94 cp
	//147 count
	//148 cd finish
	//156 disconnect
	//160 connect
}
addCommandHandler('snd', (command, params, client) => {
	gta.playFrontEndSound(Number(params), 1.0);
});

addCommandHandler('snd1', (command, params, client) => {
	natives.PLAY_MISSION_AUDIO(Number(params));
});

addCommandHandler('snd2', (command, params, client) => {
	natives.PLAY_MISSION_PASSED_TUNE(Number(params));
});

addCommandHandler('bm', (command, params, client) => {
	natives.displayText(new Vec2(400, 300), params);
});

addNetworkHandler('playFrontEndSound', (i, time) => {
	if (gta.game <=4) gta.playFrontEndSound(Number(i), Number(time));
	//147 count
	//148 cd finish
	//156 disconnect
	//160 connect
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