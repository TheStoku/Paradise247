"use strict";

const VEHICLE_RESPAWN_TIME = 10000;
const MAP_CLEANUP_TIME = 1000 * 60 * 5;
const ABANDONNED_VEHICLE_RESPAWN_TIME = 5000 * 60 * 5;

let decho = findResourceByName("decho").getExport("decho");

const serverRule = {
	"totalEarning" : {title: "Total Earnings", units: "$"},
	"completedQuests" : {title: "Completed Quests", units: ""},
	"collectedPackages" : {title: "Collected Packages", units: ""},
	"completedAchievements" : {title: "Completed Achievements", units: ""},
}

function updateGlobalStat(key, value, printRule = false, increment = false) {
	if (typeof serverData[key] == "undefined") return;

	if (value != null) {
		increment == null ? serverData[key] = value : increment ? serverData[key] += value : serverData[key] -= value;
	}

	if (printRule) {
		server.setRule(serverRule[key].title, serverData[key].toString() + serverRule[key].units);
	}
}

bindEventHandler("OnResourceStart", thisResource, function (event, resource) {
	server.name = `🌴🌴🌴 ${gameNames[thisGame]} Paradise 247 🌴🌴🌴`;

	initSpawns();
	initSpheres();
	initBanks();
	initDojos();
	initInfoPickups();
	initAchievements();
	initHiddenPackages();
	initConvoyMission();
	initQuests();

	weather = new Weather();

	log(`* Loaded ${Team.length} teams.`, Log.INFORMATION);
    log(`* Loaded ${Spawns.length} spawns.`, Log.INFORMATION);
	if (dojos != null) log(`* Loaded ${dojos.length} dojos.`, Log.INFORMATION);
	log(`* Loaded ${Vehicles.length} vehicles.`, Log.INFORMATION);
	log(`* Loaded ${teleports.length} teleports.`, Log.INFORMATION);
	log(`* Loaded ${localeFiles.length} locales.`, Log.INFORMATION);
	log(`* Loaded ${InfoPickups.length} info pickups.`, Log.INFORMATION);
	log(`* Loaded ${Achievements.length} achievements.`, Log.INFORMATION);
	log(`* Loaded ${Packages.length} hidden packages.`, Log.INFORMATION);
	log(`* Loaded ${Convoys.length} convoys.`, Log.INFORMATION);
	log(`* Loaded ${Quests.length} quests.`, Log.INFORMATION);

	console.log(`\x1b[6m${server.name}`);
	
	decho(4, "Server has been started.");
});

function printMessage(client, type) {
	let teamId = null;

	switch(type) {
		case "command":
			if (arguments.length == 3) messageClient(`❗${CO_RED}${arguments[2]}.`, client);
			else messageClient(`❗${CO_RED}${arguments[2]} ${COL_DEFAULT2}${arguments[3]}`, client);
			break;
		case "join":
			Locale.sendMessage(client, true, COLOUR_WHITE, "PlayerConnected", client.name, arguments[2], arguments[3]);
			Locale.sendMessage(client, false, COLOUR_WHITE, "PlayerWelcomeMessage", client.name);

			break;
		case "quit":
			Locale.sendMessage(client, true, COLOUR_WHITE, "PlayerQuit", client.name);

			break;
		case "spawn":
			teamId = client.getData("team");
			Locale.sendMessage(null, false, COLOUR_WHITE, "PlayerSpawned", `${Spawn.getTeam(teamId).color}${client.name} [#FFFFFF]`, `${Spawn.getTeam(teamId).color}${Spawn.get(arguments[2]).name} / ${Spawn.getTeam(teamId).name} / ${getZoneFromPosition(Spawn.get(arguments[2]).position)}`);

			break;
		case "dojo":
			teamId = client.getData("team");
			Locale.sendMessage(client, true, COLOUR_WHITE, "PlayerEnterDojo", client.name, arguments[2], arguments[2]);
			Locale.sendMessage(client, false, COLOUR_WHITE, "PlayerEnterDojoMessage", arguments[2]);

			break;
		case "kill":
			let attacker = arguments[2];
			let ped = arguments[3];
			let weapon = arguments[4];
			let pedPiece = arguments[5];
			let distance = parseFloat(attacker.player.position.distance(client.player.position)).toFixed(2);
			
			let attackerColour = Spawn.get(attackerClient.getData("team")).team.color;
			let pedColour = Spawn.get(pedClient.getData("team")).team.color
			
			message(`🔫 ${attackerColour}${attacker.name} ${COL_DEFAULT}killed ${pedColour}${ped.name} ${COL_DEFAULT} with ${getWeaponName(weapon)} [ ${pedComponents[1][pedPiece]} | ${distance} m | ${attacker.health} HP ]`);
			break;
	}

	let string = arguments[0].name + " ";

	// Start from 4 to filter useless arguments.
	for (let i = 1; i < arguments.length; i++) {
		string += arguments[i] + " ";
	}

	console.log(TAG + string);
}

addEventHandler("OnPlayerJoined", (event,client) => {
	// Create new instance for player.
	Players[client.index] = new Player(client);

	// Check if account is registered.
	Player.get(client).checkAccount();
});

addEventHandler("onPlayerQuit", (event,client,disconnectType) => {
	// Save player data
	savePlayerData(client);

	printMessage(client, "quit");

	let player = Player.get(client);

	if (typeof player != "undefined") {
		player.destructor();
	}
	
	Players[client.index] = null;
});

addNetworkHandler("onPlayerSpawn", function (client, spawn, weapon) {
	Player.get(client).db.team = spawn;
	Player.get(client).db.weaponSelect = weapon;
	Player.get(client).db.spawns++;

	client.setData("isSpawned", true);
	client.setData("team", spawn);
	client.setData("v.colour", Spawn.getTeam(client.getData("team")).RGBColour, true);
	client.player.dimension = 0;
	printMessage(client, "spawn", spawn);

	triggerEvent("OnPedSpawn", null, client.player);
});

addEventHandler("OnPedWasted", function(event, ped, attacker, weapon, pedPiece) {
	console.log("[OnPedWasted] Ped index: " + ped.index.toString());
	
	if(ped.isType(ELEMENT_PLAYER)) {
		let cameraTimeout = 5000;

		if (ped) var pedClient = getClientFromPlayerElement(ped);
		if (attacker) {
			if (attacker.type == ELEMENT_VEHICLE) {
				attacker = attacker.getOccupant(0)				
			}
			var attackerClient = getClientFromPlayerElement(attacker);
		}

		if (attacker && attackerClient) console.log("[OnPedWasted] Attacker index: " + attackerClient.index.toString());

		let dojoId = pedClient.getData("dojo");
		let dojo = dojos[dojoId];

		if (dojo != null) {
			let random = getRandomInt(dojo.spawn.length-1);
			spawnPlayer(pedClient, dojo.spawn[random].position, dojo.spawn[random].heading);
			enterDojo(pedClient, dojo.name);
		} else {
			pedClient.setData("isSpawned", false);

			setTimeout(function () {
				spawnPlayer(pedClient, ped.position);
				pedClient.player.dimension = pedClient.index + 1000;
			}, cameraTimeout);
		}

		//🔫 💣 🚗 🏊
		switch(weapon) {
			case WEAPON_UNARMED:
			case WEAPON_BASEBALLBAT:
			case WEAPON_COLT45:
			case WEAPON_UZI:
			case WEAPON_SHOTGUN:
			case WEAPON_AK47:
			case WEAPON_M16:
			case WEAPON_SNIPERRIFLE:
			case WEAPON_ROCKETLAUNCHER:
			case WEAPON_FLAMETHROWER:
			case WEAPON_MOLOTOV:
			case WEAPON_GRENADE:
			case WEAPON_DETONATOR:
			case WEAPON_DRIVEBY:
				if (attacker) {
					if (!Player.get(attackerClient)) return;
					Player.get(attackerClient).increaseKills();
					earn(attackerClient, earningBase.kill, xpBase.kill);

					Player.get(pedClient).increaseDeaths();
					Player.get(pedClient).setMoney(earningBase.death, false);
					

					// Increment attacker's health by 10 after kill as a bonus
					if (attacker.health < 90) triggerNetworkEvent("setPlayerHealth", attackerClient, 10, true);
					else triggerNetworkEvent("setPlayerHealth", attackerClient, 100);

					// Play some cool death animations.
					let animId = null;
					let bodyId = null;

					switch (pedPiece) {
						case PEDPIECETYPES_TORSO:
							animId = 18;
							break;
						case PEDPIECETYPES_ASS:
							break;
						case PEDPIECETYPES_ARM_LEFT:
							animId = 21;
							bodyId = 3;
							break;
						case PEDPIECETYPES_ARM_RIGHT:
							animId = 20;
							bodyId = 4;
							break;
						case PEDPIECETYPES_LEG_LEFT:
							animId = 21;
							bodyId = 7;
							break;
						case PEDPIECETYPES_LEG_RIGHT:
							animId = 22;
							bodyId = 8;
							break;
						case PEDPIECETYPES_HEAD:
							Player.get(attackerClient).increaseHeadshots();
							animId = 17;
							bodyId = 2;
							break;
					}

					if (animId) {
						setAnim(pedClient, animId);	
					}

					if (bodyId) {
						removeBodyPart(pedClient, bodyId);
					}

					let distance = parseFloat(attacker.position.distance(ped.position)).toPrecision(3); //Math.floor(/1000);
					
					let attackerColour = Spawn.getTeam(attackerClient.getData("team")).color;
					let pedColour = Spawn.getTeam(pedClient.getData("team")).color
			
					message(`🔫${attackerColour}${attacker.name} ${COL_DEFAULT}killed ${pedColour}${ped.name} ${COL_DEFAULT} with ${getWeaponName(weapon)} ${COL_ORANGE}[ ${pedComponents[1][pedPiece]} | ${distance} m | ${attacker.health} HP ]`);
					//message(`🔫 ${Spawn[attackerClient.getData("team")].team.color}${attacker.name} [#FFFFFF]killed ${Spawn[pedClient.getData("team")].team.color}${ped.name} [#FFFFFF] with ${getWeaponName(weapon)} [ ${pedComponents[1][pedPiece]} | ${distance} m | ${attacker.health} HP ]`);
				}
				break;
			case WEAPON_COLLISION:
				if (!attackerClient) return;
				let attackerColour = Spawn.getTeam(attackerClient.getData("team")).color;
				let pedColour = Spawn.getTeam(pedClient.getData("team")).color

				message(`🔫${attackerColour}${attacker.name} ${COL_DEFAULT}killed ${pedColour}${ped.name} ${COL_DEFAULT} by collision ${COL_ORANGE}[ ${attacker.health} HP ]`);
				break;
			case WEAPON_EXPLOSION:
				if (attacker && attacker.name == ped.name) {
					message(`💣${Spawn.getTeam(pedClient.getData("team")).color}${ped.name} [#FFFFFF]was working with explosives. Died.`);
				} /*else {
					message(`🔫${attackerColour}${attacker.name} ${COL_DEFAULT}killed ${pedColour}${ped.name} ${COL_DEFAULT} by explosion ${COL_ORANGE}[ ${attacker.health} HP ]`);
				}*/
				break;
			case WEAPON_DROWN:
				message(`🏊${Spawn.getTeam(pedClient.getData("team")).color}${ped.name} [#FFFFFF]has drowned his troubles.`);
				break;
			case WEAPON_FALL:
				break;
			case 255:
				Player.get(pedClient).increaseSuicides();

				message(`🔪${COL_DEFAULT}"Suicide is the answer." ${Spawn.getTeam(pedClient.getData("team")).color}~${ped.name}`);
				break;
			default:
		}
	}
});

// Sync skin for other players.
// TODO: check that - setting skin crashes on IV.
addNetworkHandler("onPlayerSkinChange", function (client, selection) {
	if (thisGame <= 4) {
		client.player.skin = Spawn.get(selection).skin;
	} else if (thisGame == 4) {
		spawnPlayer(client, Spawn.get(selection).position, Spawn.get(selection).heading, Spawn.get(selection).skin);
	}
});

addNetworkHandler("gui.loginButtonEvent", function (client, password) {
	Player.get(client).passwordLogin(password);
});

addNetworkHandler("gui.registerButtonEvent", function (client, password) {
	Player.get(client).register(password);
});

addNetworkHandler("gui.disconnect", function (client) {
	client.disconnect();
});

addEventHandler("onPlayerChat", (event,client,text) => {
	event.preventDefault();

	let spawn = Spawn.getTeam(client.getData("team"));
	let time = new Date();

	// Sent messages Achievement, count for messages longer or equal to 4 chars
	let player = Player.get(client);

	if (player) {
		if (player.session.isMuted) {
			Locale.sendMessage(client, false, COLOUR_RED, "YouAreMuted");

			return;
		}

		if (player.session.lastMessage != text) {
			player.db.sentMessages++;
	
			client.setData("sentMessages", player.db.sentMessages);
			Achievement.check("sentMessages", player.db.sentMessages, client);
		}

		player.session.lastMessage = text;
	}

	message(`${COL_DEFAULT}[${time.getHours()}:${time.getMinutes()}] ${spawn.color}${client.name}: ${COL_DEFAULT}${text}`);
});

addEventHandler("OnPedEnteredVehicleEx", (event, ped, vehicle, seat) => {
	let player = Player.get(ped);

	if (ped.type == ELEMENT_PLAYER) {
		let client = getClientFromPlayerElement(ped);

		let index = vehicle.getData("index", true);
		
		if (vehicle.getData("default") == true) {
			if (!Vehicles[index].db.owner) {
				Locale.sendMessage(client, false, COLOUR_WHITE, "EnteredVehicle", vehicle.id, getVehicleNameFromModelId(vehicle.modelIndex), vehicle.modelIndex, Vehicles[index].db.cost);
			}
			else {
				Locale.sendMessage(client, false, COLOUR_WHITE, "EnteredOwnedVehicle", vehicle.id, getVehicleNameFromModelId(vehicle.modelIndex), vehicle.modelIndex, Vehicles[index].db.owner);
			}

			// Jacked vehicles stat
			if (vehicle.getData("lastDriver") != ped && seat == 0) {
				player.session.lastVehicle = vehicle;
				player.db.jackedVehicles++;
				serverData.totalJacks++;

				client.setData("jackedVehicles", player.db.jackedVehicles);
				Achievement.check("jackedVehicles", player.db.jackedVehicles, client);

				Quest.check(client, "jack");
				Quest.check(client, "findVehicle", vehicle.modelIndex, "vehicle");
			}
		}
	}
});

addEventHandler("OnPedExitedVehicleEx", (event, ped, vehicle, seat) => {
	if (ped.type == ELEMENT_PLAYER && vehicle) {
		let client = getClientFromPlayerElement(ped);

		let index = vehicle.getData("index", true);
		
		if (vehicle.getData("default") == true) {
			Vehicles[index].lastUsed = Date.now();

			if (seat == 0) {
				vehicle.setData("lastDriver", ped, true);
				vehicle.setData("addToStore", true, true);
			}
		}
	}
});

addNetworkHandler("onVehicleExplode", function (client, vehicleId) {
	let vehicle = getElementFromId(vehicleId);
	let index = vehicle.getData("index", true);

	// Sync explosion for other players
	triggerNetworkEvent("explodeVehicle", null, vehicleId);

	// Check if vehicle is default one or spawned by command.
	if (vehicle.getData("default"))
	{
		console.log(`Vehicle ${vehicle.id} exploded. Resetting in ${VEHICLE_RESPAWN_TIME} seconds.`);

		setTimeout(function () {
			Vehicles[index].init();
		}, VEHICLE_RESPAWN_TIME);
	} else {
		//delete vehicle completely if it was spawned by command.
		console.log(`Vehicle ${vehicle.id} exploded. Deleting in ${VEHICLE_RESPAWN_TIME} seconds.`);

		setTimeout(function () {
			destroyElement(vehicle);
		}, VEHICLE_RESPAWN_TIME);
	}
});

// GUI Popup implementation.
function popup(client, title, message, buttonText = null, parentWindow = null, callback = null) {
	triggerNetworkEvent("popup", client, title, message, buttonText, parentWindow, callback);
}