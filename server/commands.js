'use strict';

const ALLOW_ALL = 0;
const ALLOW_DEAD = 1;
const ALLOW_VEHICLE = 2;
const ALLOW_NONE = 3;
const ALLOW_ON_FOOT = 4;
const ALLOW_DOJO = 5;
const ALLOW_BANK = 6;

const commandFlags = [
	{alive: null, inDojo: null, inMission: null, inVehicle: null, inBank: null}, // Allow all
	{alive: null, inDojo: false, inMission: false, inVehicle: false, inBank: null}, // Allow for dead
	{alive: true, inDojo: false, inMission: false, inVehicle: true, inBank: null}, // Cannot be dead, must be in vehicle, not in mission
	{alive: true, inDojo: null, inMission: null, inVehicle: null, inBank: null}, // Cannot be dead
	{alive: true, inDojo: false, inMission: false, inVehicle: false, inBank: null}, // Allow on foot, spawned, no dojo
	{alive: null, inDojo: true, inMission: null, inVehicle: null, inBank: null}, // Allow on foot, spawned, no dojo
	{alive: true, inDojo: false, inMission: null, inVehicle: false, inBank: true}, //
];

const commands = [
	// Player/Account commands
	{name: 'login', level: 0, cost: 0, flags: ALLOW_ALL, arguments: 'is', function: function(client, params) {
		Player.get(client).passwordLogin(params);
	}},
	{name: 'register', level: 0, cost: 0, flags: ALLOW_ALL, arguments: 'is', function: function(client, params) {
		Player.get(client).register(params);
	}},
	{name: 'stats', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		printStats(client, params);
	}},
	{name: 'top', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		printTop(client, params);
	}},
	// { name: "lang", level: 0, cost: 0, flags: ALLOW_ALL, arguments: "s", function: function(client,params) { Player.get(client).setLanguage(params);} },
	{name: 'rawstats', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		printRawStats(client, params);
	}},
	{name: 'achievements', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		printAchievements(client, params);
	}},
	{name: 'flighttime', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		printFlightTime(client, params);
	}},
	{name: 'quest', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		Quest.print(client, params);
	}},
	// { name: "spawntype", level: 0, cost: 0, flags: ALLOW_ALL, arguments: "", function: function(client,params) { Player.get(client).setSpawnType(params);} },

	// Misc commands
	{name: 'brb', level: 0, cost: 10, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		afk(client, true);
	}},
	{name: 'afk', level: 0, cost: 10, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		afk(client, true);
	}},
	{name: 'back', level: 0, cost: 10, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		afk(client, false);
	}},
	{name: 'cd', level: 0, cost: 10, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		countdown(client);
	}},
	{name: 'anim', level: 0, cost: 0, flags: ALLOW_ON_FOOT, arguments: 'i', function: function(client, params) {
		setAnim(client, Number(params), 1000);
	}},
	{name: 'use', level: 0, cost: 0, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		Player.get(client).useItem(params);
	}},
	{name: 'backpack', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		Player.get(client).backpack.getItems(client);
	}},
	{name: 'loc', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		locPlayer(client, params);
	}},

	// Help commands
	{name: 'help', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		commandHelp(client, params);
	}},
	{name: 'info', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		infoCommand(client, params);
	}},
	{name: 'command', level: 0, cost: 0, flags: ALLOW_ALL, arguments: 's', function: function(client, params) {
		commandHelp(client, params);
	}},
	{name: 'cmds', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		makeList(client, 'commands', commands);
	}},

	// Dojo commands
	{name: 'dojolist', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		makeList(client, 'dojos', dojos);
	}},
	{name: 'dojo', level: 0, cost: 0, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		enterDojo(client, params);
	}},
	{name: 'dojoexit', level: 0, cost: 0, flags: ALLOW_DOJO, arguments: '', function: function(client, params) {
		exitDojo(client);
	}},

	// Vehicle commands
	{name: 'v', level: 0, cost: 50, flags: ALLOW_ON_FOOT, arguments: 's', function: function(client, params) {
		Vehicle.spawnTempVehicle(client, params);
	}},
	// { name: "car", level: 0, cost: 0, flags: ALLOW_VEHICLE, arguments: "", function: function(client,params) { carInfo(client, params); } },
	{name: 'col1', level: 0, cost: 0, flags: ALLOW_VEHICLE, arguments: 'i', function: function(client, params) {
		client.player.vehicle.colour1 = Number(params);
	}},
	{name: 'col2', level: 0, cost: 0, flags: ALLOW_VEHICLE, arguments: 'i', function: function(client, params) {
		client.player.vehicle.colour2 = Number(params);
	}},
	{name: 'fix', level: 0, cost: 50, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		client.player.vehicle.fix();
	}},
	{name: 'flip', level: 0, cost: 50, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		triggerNetworkEvent('flipVehicle', client);
	}},
	{name: 'taxilight', level: 0, cost: 0, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		triggerNetworkEvent('setTaxiLight', null, client.index, params);
	}},


	// Teleport commands
	{name: 'driveto', level: 0, cost: 100, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		goTo(client, 'driveTo', params);
	}},
	{name: 'walkto', level: 0, cost: 100, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		goTo(client, 'walkTo', params);
	}},
	{name: 'runto', level: 0, cost: 100, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		goTo(client, 'runTo', params);
	}},
	{name: 'stop', level: 0, cost: 100, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		goTo(client, 'stop', params);
	}},
	{name: 'goto', level: 0, cost: 100, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		teleport(client, params);
	}},
	{name: 'gotolist', level: 0, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		makeList(client, 'teleports', teleports, true);
	}},
	{name: 'follow', level: 0, cost: 100, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		goFollow(client, params);
	}},
	// { name: "savepos", level: 0, cost: 0, flags: ALLOW_ALL, arguments: "", function: function(client,params) { savePosition(client,params);} },
	// { name: "gotosave", level: 0, cost: 0, flags: ALLOW_ON_FOOT, arguments: "", function: function(client,params) { gotoSavePosition(client,params);} },

	// -----------------------------------------------------------------------------------------------------------------------------------------
	// Admin commands
	{name: 'storeveh', level: 5, cost: 0, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		saveVehicleSettings(client.player.vehicle);
	}},
	{name: 'saveall', level: 5, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		saveAllData(client, params);
	}},
	{name: 'savetele', level: 5, cost: 0, flags: ALLOW_ON_FOOT, arguments: 's', function: function(client, params) {
		saveTeleportQuery(client, params);
	}},
	{name: 'savecar', level: 5, cost: 0, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		saveVehicleQuery(client);
	}},
	{name: 'acol1', level: 1, cost: 0, flags: ALLOW_VEHICLE, arguments: 'i', function: function(client, params) {
		client.player.vehicle.colour1 = Number(params);
	}},
	{name: 'acol2', level: 1, cost: 0, flags: ALLOW_VEHICLE, arguments: 'i', function: function(client, params) {
		client.player.vehicle.colour2 = Number(params);
	}},
	// { name: "afix", level: 5, cost: 0, flags: ALLOW_VEHICLE, arguments: "", function: function(client,params) { client.player.vehicle.colour1 = Number(params); } },
	{name: 'aflip', level: 1, cost: 0, flags: ALLOW_VEHICLE, arguments: '', function: function(client, params) {
		triggerNetworkEvent('flipVehicle', client);
	}},
	{name: 'aveh', level: 1, cost: 0, flags: ALLOW_ON_FOOT, arguments: 's', function: function(client, params) {
		Vehicle.spawnTempVehicle(client, params);
	}},
	{name: 'setweather', level: 1, cost: 0, flags: ALLOW_ALL, arguments: 'i', function: function(client, params) {
		weather.set(client, params);
	}},
	{name: 'settime', level: 1, cost: 0, flags: ALLOW_ALL, arguments: 'ii', function: function(client, params) {
		setTime(client, params);
	}},
	{name: 'kick', level: 2, cost: 0, flags: ALLOW_ALL, arguments: 'i', function: function(client, params) {
		kick(client, params);
	}},
	{name: 'ban', level: 4, cost: 0, flags: ALLOW_ALL, arguments: 'i', function: function(client, params) {
		ban(client, params);
	}},
	{name: 'mute', level: 1, cost: 0, flags: ALLOW_ALL, arguments: 'i', function: function(client, params) {
		mute(client, params);
	}},
	{name: 'healall', level: 1, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		healAll(client, params);
	}},
	{name: 'freezeall', level: 1, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		setPlayerControls(null, false);
	}},
	{name: 'unfreezeall', level: 1, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		setPlayerControls(null, true);
	}},
	{name: 'bringall', level: 1, cost: 0, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		bringAll(client, params);
	}},
	{name: 'bringallveh', level: 5, cost: 0, flags: ALLOW_ON_FOOT, arguments: '', function: function(client, params) {
		bringAllVehicles(client, params);
	}},
	{name: 'resetveh', level: 5, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		resetVehicles(client, params);
	}},
	// { name: "test", level: 5, cost: 0, flags: ALLOW_ON_FOOT, arguments: "", function: function(client,params) { geta(client, params); } },
	{name: 'acd', level: 5, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		countdown(client, true);
	}},
	{name: 'setpass', level: 5, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		setPassword(client, params);
	}},
	{name: 'setblip', level: 5, cost: 0, flags: ALLOW_ALL, arguments: '', function: function(client, params) {
		setBlip(client, params);
	}},
	{name: 'attachblip', level: 5, cost: 0, flags: ALLOW_ALL, arguments: 'i', function: function(client, params) {
		attachBlip(client, params);
	}},

	// Bank
	{name: 'deposit', level: 0, cost: 0, flags: ALLOW_BANK, arguments: 'i', function: function(client, params) {
		Bank.deposit(client, params);
	}},
	{name: 'withdraw', level: 0, cost: 0, flags: ALLOW_BANK, arguments: 'i', function: function(client, params) {
		Bank.withdraw(client, params);
	}},
];

function commandHelp(client, param) {
	const findCommand = param.toString().toLowerCase();
	const i = commands.findIndex( (commands) => commands.name == findCommand );

	if (typeof commands[i] != 'undefined') {
		const command = commands[i];
		const flags = JSON.stringify(commandFlags[command.flags]);
		const locale = Player.get(client).getLocale();
		const description = locale.getString(`command.description.${findCommand}`);
		let syntax = locale.getString(`command.syntax.${findCommand}`);

		if (syntax) syntax = ` [${syntax}]`;

		Locale.sendMessage(client, false, COLOUR_WHITE, 'command.helpMessage1', description, command.name, syntax);
		Locale.sendMessage(client, false, COLOUR_WHITE, 'command.helpMessage2', flags);
		if (command.cost > 0) Locale.sendMessage(client, false, COLOUR_WHITE, 'command.cost', command.cost);
	} else messageClient(`${COL_ORANGE}Command '${findCommand}' not found.`, client);
}

function makeList(client, name, array, bNumbered) {
	const list = [];
	let line = 0;
	// let list = "";
	let changeColour = false;

	// if (name != "achievements")
	messageClient(`🔍${COL_ORANGE}Available ${name}:`, client);

	for (let i = 0; i < array.length; i++) {
		if (array[i].level && Player.get(client).db.adminLevel < array[i].level) {
			continue;
		} else {
			// Add colouring for better visibility
			let colour;
			changeColour = !changeColour;
			changeColour ? colour = COL_DEFAULT : colour = COL_DEFAULT2;

			// Add separator and linebreak
			if (i % 10 == 0) line++;

			// If array is undefined, make it empty.
			if (typeof(list[line]) == 'undefined') list[line] = '';

			// Add separator
			if (i < array.length && i > 0 && list[line].length > 0) list[line] += `, ${colour}`;

			// Add colouring
			if (i < array.length && i > 0) list[line] += `${colour}`;

			// If list should be numbered, add the number.
			if (bNumbered) list[line] += `[${i}]`;

			list[line] += array[i].name;
		}
	}

	list.forEach((element, index) => {
		messageClient(`👉${COL_DEFAULT}${list[index]}`, client);
	});
}

// List all commands (for readme.md pruposes).
addCommandHandler('listCommands', (command, params, client) => {
	for (let i = 0; i < commands.length; i++) {
		const desc = Locale.getString(`command.description.${commands[i].name}`);
		console.log(`- ${commands[i].name} - ${desc}\n`);
	}
});

function afk(client, toggle) {
	const afk = client.getData("isAfk");

	if (toggle && !afk) {
		setPlayerControls(client, false);
		client.player.dimension = client.index + 1000;
		client.setData("isAfk", true, true);
		Locale.sendMessage(null, false, COLOUR_YELLOW, "afkOn", client.name);
		Locale.sendMessage(client, false, COLOUR_YELLOW, "afkMessage");
		
	} else if (!toggle && afk) {
		setPlayerControls(client, true);
		client.player.dimension = 0;
		client.setData("isAfk", false, true);
		Locale.sendMessage(null, false, COLOUR_YELLOW, "afkOff", client.name);
	}
}
/*
function carInfo(client, param) {
	const vehicle = client.player.vehicle;
	message(`[${vehicle.id}] Car info: ${vehicle.name}`);
}
*/
function locPlayer(client, params) {
	let player = client.player;
	let distance = 0;

	if (params) {
		player = getClientFromParams(params[0]).player;

		if (player) {
			distance = player.position.distance(client.player.position);
		}
	}

	message(`${player.name} is in ${getZoneFromPosition(player.position)}.`, COLOUR_WHITE);
	if (distance > 0) {
		message(`Distance between ${client.name} and ${player.name} is ${distance.toFixed(2)}m.`, COLOUR_WHITE);
	}
}
/*
function geta(client, params) {
	params = params.split(' ');

	const targets = filterRadius(client, params[0], params[1]);

	targets.forEach((element) => {
		message(element.id + ' distance: ' + client.player.position.distance(element.position));
	});

	// Locale.sendMessage(null, false, COLOUR_YELLOW, "AdminHealedAllPlayers", client.name);
}
*/
function getAll(type) {
	switch (type) {
	case 'clients':
		return getClients();
		break;
	case 'players':
		return getPlayers();
		break;
	case 'vehicles':
		return getVehicles();
		break;
	case 'pickups':
		return getPickups();
		break;
	case 'blips':
		return getBlips();
		break;
	case 'buildings':
		return getBuildings();
		break;
	case 'elements':
		return getElements();
		break;
	case 'markers':
		return getMarkers();
		break;
	case 'objects':
		return getObjects();
		break;
	case 'peds':
		return getPeds();
		break;
	case 'physicals':
		return getPhysicals();
		break;
	case 'resources':
		return getResources();
		break;
	case 'trains':
		return getTrains();
		break;
	default:
		return -1;
	}
}

function filterRadius(client, type, radius) {
	const output = [];
	radius = radius ? Number(radius) : -1;

	getAll(type).forEach((element) => {
		const target = type == 'clients' ? element.player : element;

		if (radius == -1 || client.player.position.distance(target.position) <= radius) {
			output.push(element);
		}
	});

	return output;
}

function countdown(client, params) {
	// let players = filterRadius(client, "clients", 20.0);
	const frozen = params;
	let time = 5;
	let message = '';

	if (frozen) setPlayerControls(client, false);

	const interval = setInterval(() => {
		if (time > 0) {
			message = time;
			time--;
		} else {
			if (frozen) setPlayerControls(client, true);
			message = '~g~GO!';
			clearInterval(interval);
		}

		triggerNetworkEvent('bigMessage', null, message.toString(), 1000, 4);

		return time;
	}, 1000);
}
/*
function set(client, params) {
	params = params.split(' ');

	const type = params[0];
	const action = params[1];
	const index = params[2];
	const value = params[2];
	const radius = params[3];

	const target = index == 'all' ? filterRadius(client, type, radius) : Number(index);

	// set <car/ped> <hp/pos> <all/id> [value] [range]

	switch (action) {
	case 'hp':
		triggerNetworkEvent('setPlayerHealth', element, 100);
		break;
	case 'controls':
		break;
	case 'bring':
		break;
	}
}
*/
function healAll(client, params) {
	params = params.split(' ');
	let target = getClients();

	if (params[0] != '' && !isNaN(params[0])) {
		target = filterRadius(client, 'clients', Number(params[0]));
		Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminHealedAllPlayersInRadius', client.name);
	} else {
		Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminHealedAllPlayers', client.name);
	}

	target.forEach((element) => {
		triggerNetworkEvent('setPlayerHealth', element, 100);
	});
}

function bringAll(client, params) {
	params = params.split(' ');
	let target = getPlayers();

	if (params[0] != '' && !isNaN(params[0])) {
		target = filterRadius(client, 'players', Number(params[0]));
		Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminBringedAllPlayersInRadius', client.name);
	} else {
		Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminBringedAllPlayers', client.name);
	}

	target.forEach((element) => {
		if (element.vehicle) triggerNetworkEvent('removePlayerFromVehicle', element.client);

		element.position = client.player.position;
		element.dimension = client.player.dimension;
	});
}

function bringAllVehicles(client, params) {
	params = params.split(' ');
	let target = getVehicles();

	if (params[0] != '' && !isNaN(params[0])) {
		target = filterRadius(client, 'vehicles', Number(params[0]));
		Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminBringedAllVehiclesInRadius', client.name);
	} else {
		Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminBringedAllVehicles', client.name);
	}

	target.forEach((element) => {
		element.position = client.player.position;
	});
}

function resetVehicles(client, params) {
	Vehicles.forEach((element) => {
		element.reset();
	});

	Locale.sendMessage(null, false, COLOUR_YELLOW, 'AdminResetedAllVehicles', client.name);
}

function setPassword(client, params) {
	server.setPassword(params);

	Locale.sendMessage(null, false, COLOUR_YELLOW, params ? 'AdminChangedServerPassword' : 'AdminChangedServerPasswordOff', client.name);
}

function setPlayerControls(client, params) {
	if (!client) {
		getClients().forEach((element) => {
			triggerNetworkEvent('setPlayerControls', element.client, params);
		});

		Locale.sendMessage(null, false, COLOUR_YELLOW, params ? 'AdminUnFrozenAllPlayers' : 'AdminFrozenAllPlayers', client.name);
	} else {
		triggerNetworkEvent('setPlayerControls', client, params);
	}
}

function setBlip(client, params) {
	params = params.split(' ');
	const player = Player.get(client);

	if (player.session.blip) {
		destroyElement(player.session.blip);
	}

	if (params != '') {
		player.session.blip = gta.createBlip(Number(params[0]), client.player.position);
		player.session.blip.netFlags.distanceStreaming = false;
	}
}

function attachBlip(client, params) {
	params = params.split(' ');
	const player = Player.get(client);
	const target = getClientFromParams(params[0]);

	if (player.session.blip) {
		destroyElement(player.session.blip);
	}

	if (typeof params[1] != 'undefined' && target) player.session.blip = gta.createBlipAttachedTo(target.player, Number(params[1]));
}


function kick(client, param) {
	const params = param.split(' ');
	const target = getClientFromParams(params[0]);
	let msg = client ? 'You have been kicked from the server by ' + client.name + '.' : 'You have been kicked from the server.';

	if (params[1]) {
		msg += '\nReason: ' + params[1].toString();
	}

	if (target) {
		popup(target, 'Information', msg);
		messageClient(msg, target, COLOUR_RED);

		setTimeout(function(target) {
			target.disconnect();
		}, 5000, target);

		if (client) {
			Locale.sendMessage(null, false, COLOUR_YELLOW, 'admin.kick', client.name, target.name);
			log(`Admin ${client.name} has kicked ${target.name}.`, Log.INFORMATION);
		}
	}
}

function ban(client, param) {
	const params = param.split(' ');
	const target = getClientFromParams(params[0]);
	let time = 0;
	let durationMsg = 'Permanent.';
	let msg = client ? 'You have been banned from the server by ' + client.name + '. ' : 'You have been banned from the server. ';

	if (params[1]) {
		msg += '\nReason: ' + params[1].toString() + ' ';
	}

	if (!isNaN(params[2])) {
		time = parseInt(params[2]) * 1000 * 60;
		durationMsg = time == 0 ? 'Permanent' : 'Temporary: ' + time /60000 + ' mins.';

		msg += durationMsg;
	}

	if (target) {
		popup(target, 'Information', msg);
		messageClient(msg, target, COLOUR_RED);

		server.banIP(target.ip, time);

		setTimeout(function(target) {
			target.disconnect();
		}, 5000, target);

		Locale.sendMessage(null, false, COLOUR_YELLOW, 'admin.ban', client.name, target.name);
		log(`Admin ${client.name} has banned ${target.name}. Reason: ${params[1]}`, Log.INFORMATION);
	}
}

function mute(client, param) {
	const params = param.split(' ');
	const target = getClientFromParams(params[0]);
	let time = 0;
	let durationMsg = 'Permanent.';
	let msg = client ? 'You have been muted by ' + client.name + '.' : 'You have been muted.';

	if (params[1]) {
		msg += '\nReason: ' + params[1].toString();
	}

	if (!isNaN(params[2])) {
		time = parseInt(params[2]) * 1000 * 60;
		durationMsg = time == 0 ? 'Permanent' : 'Temporary: ' + time /60000 + ' mins.';

		msg += durationMsg;
	}

	if (target) {
		Player.get(target).session.isMuted = true;
		popup(target, 'Information', msg);
		messageClient(msg, target, COLOUR_RED);

		setTimeout(function(target) {
			Player.get(target).session.isMuted = false;
			Locale.sendMessage(target, false, COLOUR_WHITE, 'YouAreUnmuted');
		}, time, target);

		Locale.sendMessage(null, false, COLOUR_YELLOW, 'admin.mute', client.name, target.name);
		log(`Admin ${client.name} has muted ${target.name}. Reason: ${params[1]}`, Log.INFORMATION);
	}
}

function setTime(client, params) {
	params = params.split(' ');
	gta.time.hour = Number(params[0]);
	gta.time.minute = Number(params[1]);

	Locale.sendMessage(null, false, COLOUR_YELLOW, 'admin.setTime', client.name, `${params[0]}:${params[1]}`);
}
/*
function savePosition(client, params) {
	const player = Player.get(client);

	player.db.storedPosition = client.player.position;
	Locale.sendMessage(client, false, COLOUR_YELLOW, 'account.settings.savepos');
}

function gotoSavePosition(client, params) {
	const player = Player.get(client);

	player.teleport(player.db.storedPosition, 0.0);
	Locale.sendMessage(client, false, COLOUR_YELLOW, 'account.settings.gotopos');
}
*/
function printStats(client, params) {
	if (params) client = getClientFromParams(params);

	const playerDb = Player.get(client).db;

	const joins = playerDb.joins;
	const kills = playerDb.kills;
	const deaths = playerDb.deaths;
	const headshots = playerDb.headshots;
	const money = playerDb.cash;
	const bank = playerDb.bank;
	const mileage = playerDb.mileage;
	const online = playerDb.onlineTime;
	const convoys = playerDb.convoys;
	const dodo = playerDb.dodoFlightTime;
	const xp = playerDb.xp;
	const exp = XP.parseByXP(xp);

	/*
		level: level,
		levelFrac: l,
		xp: xp,
		per: (xp - forLast) / (forNext - forLast),
		forNext: forNext,
		toNext: toNext,
		forLast: forLast
	*/

	messageClient(`🎯${COL_ORANGE}${client.name} statistics - ${COL_DEFAULT}Kills: ${kills} | Deaths: ${deaths} | Ratio: ${killDeathRatio(kills, deaths).toFixed(2)} | Headshots: ${headshots} | Joins: ${joins}`, client);
	messageClient(`💳${COL_ORANGE}Money: ${COL_DEFAULT}\$${money} | 🏦${COL_ORANGE}Bank: ${COL_DEFAULT}\$${bank}`, client);
	// messageClient(`🏦${COL_ORANGE}Online time: ${COL_DEFAULT}\$${bank}`, client);
	messageClient(`${COL_ORANGE}Mileage: ${COL_DEFAULT}${mileage}km | ${COL_ORANGE}Flight Time: ${COL_DEFAULT}${dodo}`, client);
	messageClient(`${COL_ORANGE}Online Time: ${COL_DEFAULT}${online}min | ${COL_ORANGE}Convoys: ${COL_DEFAULT}${convoys}`, client);
	messageClient(`${COL_ORANGE}XP: ${COL_DEFAULT}${xp}/${exp.forNext} | ${COL_ORANGE}Level: ${COL_DEFAULT}${exp.level}/60`, client);
}

function printRawStats(client, params) {
	if (params) client = getClientFromPlayerElement(getElementFromName(params));

	const player = Player.get(client);

	if (player) {
		// const rawStats = JSON.stringify(player.db);

		console.log(JSON.stringify(player.db));

		// TODO: Format it a bit
		// popup(client, "Raw statistics", JSON.stringify(player.db));
		// messageClient(JSON.stringify(player.db), client);
	}
}

function printAchievements(client, params) {
	Locale.sendMessage(client, false, COLOUR_WHITE, 'achievement.progressMessage1');

	Achievement.getFilteredList().forEach((element) => {
		const player = Player.get(client);
		const locale = player.getLocale();
		const groupCompletion = Achievement.getGroupCompletion(element, player.db[element]);

		Locale.sendMessage(client, false, COLOUR_WHITE, 'achievement.progressMessage2', locale.getString(`achievement.${element}`), groupCompletion[0], groupCompletion[1]);
	});
}

function printFlightTime(client, params) {
	const player = Player.get(client);
	const overall = new Date(player.db.dodoFlightTime * 1000).toISOString().slice(11, 19);

	Locale.sendMessage(client, false, COLOUR_WHITE, 'statFlightTime', overall);
}

function checkCommandFlags(client, command) {
	let errorMessage = false;

	const i = commands.findIndex( (commands) => commands.name == command.toLowerCase() );

	if (typeof commands[i] != 'undefined') {
		// if (typeof params == "undefined") params = "";
		const flags = commandFlags[commands[i].flags];
		const player = client.player;
		const dojoId = client.getData('dojo');
		const inBank = client.getData('inBank');
		const locale = Player.get(client).getLocale();

		// Alive flag
		if 		(flags.alive != null && flags.alive && !client.getData('isSpawned')) errorMessage = locale.getString('command.flag.aliveTrue');
		else if (flags.alive != null && !flags.alive && client.getData('isSpawned')) errorMessage = locale.getString('command.flag.aliveFalse');
		// Dojo flag
		else if (flags.inDojo != null && flags.inDojo && !dojoId == null) errorMessage = locale.getString('command.flag.dojoTrue');
		else if (flags.inDojo != null && !flags.inDojo && dojoId != null) errorMessage = locale.getString('command.flag.dojoFalse');
		// Bank flag
		else if (flags.inBank != null && flags.inBank && !inBank) errorMessage = locale.getString('command.flag.bankTrue');
		else if (flags.inBank != null && !flags.inBank && inBank) errorMessage = locale.getString('command.flag.bankFalse');
		// TODO: Implement missions
		// else if (flags.inMission) errorMessage = "must be in mission";
		// else if (!flags.inMission) errorMessage = "canno't be in mission";
		// inVehicle flag
		else if (flags.inVehicle != null && flags.inVehicle && !player.vehicle) errorMessage = locale.getString('command.flag.vehicleTrue');
		else if (flags.inVehicle != null && !flags.inVehicle && player.vehicle) errorMessage = locale.getString('command.flag.vehicleFalse');
	}

	if (errorMessage) {
		// Locale.sendMessage(client, false, COLOUR_WHITE, 'command.flag.errorMessage', errorMessage);

		return errorMessage;
	} else {
		return false;
	}
}
/*
function checkCommandCash(client, command) {
	const errorMessage = false;

	const i = commands.findIndex( (commands) => commands.name == command.toLowerCase() );

	/* if (typeof commands[i] != 'undefined') {
		const player = client.player;
		const locale = Player.get(client).getLocale();
	}*/
/*
	if (errorMessage) {
		Locale.sendMessage(client, false, COLOUR_WHITE, 'command.flag.errorMessage', errorMessage);

		return false;
	} else {
		return true;
	}
}
*/

addEventHandler('OnPlayerCommand', (event, client, command, params) => {
	const i = commands.findIndex( (commands) => commands.name == command.toLowerCase() );
	let isCommandForbidden = false;

	if (typeof commands[i] != 'undefined') {
		const locale = Player.get(client).getLocale();
		isCommandForbidden = checkCommandFlags(client, command);

		// Check if arguments are correct.
		if (params.length < commands[i].arguments.length) {
			Locale.sendMessage(client, false, COLOUR_WHITE, 'command.syntaxError', command, locale.getString(`command.syntax.${command}`));

			return false;
		}

		// Check if user level allows to use this command.
		if (Player.get(client).db.adminLevel < commands[i].level) {
			Locale.sendMessage(client, false, COLOUR_WHITE, 'command.levelError');
			return false;
		}

		// Check command flags
		if (!isCommandForbidden) {
			commands[i].function(client, params);
		} /* else {
			Locale.sendMessage(client, false, COLOUR_WHITE, 'command.flag.errorMessage', isCommandForbidden);
		}*/

		// TODO: Check if player has enough money.
		/* if (Player.get(client).db.money < commands[i].cost) {
			Locale.sendMessage(client, false, COLOUR_WHITE, "command.insufficentMoney", commands[i].cost);
			return false;
		}*/
	} else {
		isCommandForbidden = checkCommandFlags(client, 'goto');

		if (!isCommandForbidden && teleport(client, command)) {
			return true;
		} else {
			isCommandForbidden = checkCommandFlags(client, 'dojo');

			if (!isCommandForbidden && enterDojo(client, command)) {
				return true;
			}
		}
	}

	if (isCommandForbidden) {
		Locale.sendMessage(client, false, COLOUR_WHITE, 'command.flag.errorMessage', isCommandForbidden);
	}
});

addCommandHandler('setadmin', (command, params, client) => {
	// let targetClient = getClientFromParams(params);
	// Change it to your nickname, register account and comment this line.
	if (client.name == '[LCK]Stoku') {
		Player.get(client).db.adminLevel = Number(params);
		popup(client, 'Information', 'Your admin has been set to ' + params.toString());
	}
});

function setAnim(client, animation, lockControlsTime) {
	triggerNetworkEvent('setPlayerAnimation', null, client.player.id, 0, Number(animation), Number(lockControlsTime));
}

function removeBodyPart(client, bodypart) {
	triggerNetworkEvent('removePlayerBodyPart', null, client.player.id, Number(bodypart));
}

addCommandHandler('pack', (command, params, client) => {
	message(typeof Player.get(client).db.packages);
	message(Player.get(client).db.packages[1][0].toString());
	Player.get(client).db.packages[1][0] = 1;
	message(Player.get(client).db.packages[1][0].toString());
	// let targetClient = getClientFromParams(params);
	// triggerNetworkEvent("setPlayerAnimation", null, client.player.id, 0, Number(params), false);
});

function helpCommand(client, params) {

}

function componentToHex(c) {
	const hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function infoCommand(client, params) {
	messageClient(`${COL_ORANGE}${server.name}`, client);
	messageClient(`${COL_ORANGE}www: ${COL_DEFAULT}paradise.gta3.pl [WIP]`, client);
}
