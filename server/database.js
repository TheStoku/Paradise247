'use strict';

// Game specific table names
const getServerDataDBFromGame = [null, 'iii_data', 'vc_data', 'sa_data', 'ug_data', 'iv_data'];
const getTeleportsDBFromGame = [null, 'iii_teleports', 'vc_teleports', 'sa_teleports', 'ug_teleports', 'iv_teleports'];
const getVehiclesDBFromGame = [null, 'iii_vehicles', 'vc_vehicles', 'sa_vehicles', 'ug_vehicles', 'iv_vehicles'];

const STORE_DATABASE_TIME = 1000 * 60 * 5; // every 5min
let db = null;

bindEventHandler('OnResourceStart', thisResource, function(event, resource) {
	// Check for CVAR settings in server.xml.
	const cvarCheck = ['DATABASE_IP', 'DATABASE_NAME', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_PORT'];

	for (const i of cvarCheck) {
		if (!server.getCVar(i.toString())) {
			console.log(TAG + `Missing \'${i}\' CVAR. Loading database has been terminated.`);
			return false;
		}
	}

	// Load data from database.
	log(`DB Server data loaded \x1b[35m[${executionTime(loadServerDataQuery)}ms]`);
	log(`DB Vehicles data loaded \x1b[35m[${executionTime(loadVehicleDataQuery)}ms]`);
	log(`DB Teleports data loaded \x1b[35m[${executionTime(loadTeleportsDataQuery)}ms]`);
	log(`DB Top Scores data loaded \x1b[35m[${executionTime(loadTopScores)}ms]`);

	// Setup database store interval and refresh top scores from DB
	setInterval(function() {
		saveServerData();
		loadTopScores();
		saveAllVehicles();
	}, STORE_DATABASE_TIME);
});

function establishDatabaseConnection() {
	try {
		db = module.mysql.connect(
			server.getCVar('DATABASE_IP'),
			server.getCVar('DATABASE_USERNAME'),
			server.getCVar('DATABASE_PASSWORD'),
			server.getCVar('DATABASE_NAME'),
			Number(server.getCVar('DATABASE_PORT')),
		);
	} catch (e) {
		console.log(e);
		server.shutdown();
	}
}

function closeDatabaseConnection() {
	if (db) db.close();
}

// Build MySQL query from given data (keys/values).
function buildQueryKeys(data) {
	let builtQuery = '';
	let n = 1;

	for (const i in data) {
		//if (Object.hasOwnProperty(data, i)) {
			builtQuery += '\`' + i + '\`';

			if (n < Object.keys(data).length) builtQuery += ', ';
			n++;
		//}
	}

	return builtQuery;
}

function buildQuery(data) {
	let builtQuery = '';
	let n = 1;

	for (const i in data) {
		//if (Object.hasOwnProperty(data, i)) {
			builtQuery += `'${data[i]}'`;

			if (n < Object.values(data).length) builtQuery += ', ';

			n++;
		//}
	}

	return builtQuery;
}

function buildUpdateQuery(data) {
	let builtQuery = '';
	let n = 1;

	for (const i in data) {
		//if (Object.hasOwnProperty(data, i)) {
			builtQuery += `${i}='${data[i]}'`;

			if (n < Object.values(data).length) builtQuery += ', ';

			n++;
		//}
	}

	return builtQuery;
}

function isNameRegisteredQuery(name) {
	establishDatabaseConnection();

	const result = db.query(`SELECT * FROM gaming_accounts WHERE name ="${db.escapeString(name)}" LIMIT 1`);
	const rows = result.numRows;

	result.free();

	closeDatabaseConnection();

	return (rows > 0) ? true : false;
}

function checkPasswordQuery(name, password) {
	establishDatabaseConnection();

	const result = db.query(`SELECT password FROM gaming_accounts WHERE name ="${db.escapeString(name)}" LIMIT 1`);
	let isMatching = false;

	if (result.numRows > 0) {
		const row = result.fetchRow();

		isMatching = row[0].toLowerCase() == module.hashing.sha256(password.toString()).toLowerCase() ? true : false;
	} else isMatching = false;

	result.free();

	closeDatabaseConnection();

	return isMatching;
}

function checkIPQuery(client) {
	establishDatabaseConnection();

	const result = db.query(`SELECT ip FROM gaming_accounts WHERE name ="${db.escapeString(client.name)}" LIMIT 1`);
	let isMatching = false;

	if (result.numRows > 0) {
		const row = result.fetchRow();

		isMatching = row[0] == client.ip ? true : false;
	} else isMatching = false;

	result.free();

	closeDatabaseConnection();

	return isMatching;
}

function loadPlayerDataQuery(client) {
	establishDatabaseConnection();

	const result = db.query(`SELECT * FROM gaming_accounts WHERE name ="${db.escapeString(client.name)}" LIMIT 1`);

	if (result) {
		const data = result.fetchAssoc();
		const player = Player.get(client);

		Object.assign(player.db, data);

		// Parse JSON string from database to object.
		player.db.packages = JSON.parse(player.db.packages);
		// if (player.db.storedPosition.length > 0) player.db.storedPosition = JSON.parse(player.db.storedPosition);

		// Parse items
		const items = player.db.items.split(',');

		items.forEach((element) => {
			if (element != '' && element.length > 1) {
				console.log(element);
				// console.log(element);
				player.backpack.addItem(client, element, Item.getDesc(element));
			}
		});

		result.free();
	}

	closeDatabaseConnection();

	return true;
}

function savePlayerData(client) {
	console.log('Store');
	establishDatabaseConnection();

	const player = Player.get(client);

	if (!player || client.getData('isLoggedIn') < 1) return 0;

	// Update last seen.
	player.db.last_seen = Date.now() / 1000;

	// Stringify JSON.
	player.db.packages = JSON.stringify(player.db.packages);

	// Pack stored position.
	/* let storedPos = player.db.storedPosition;
    if (storedPos) {
        player.db.storedPosition = `[${storedPos[0]}, ${storedPos[1]}, ${storedPos[2]}]`;
    }*/

	// Store items as string
	player.db.items = player.backpack.getItemsForStore();

	// console.log(`Trying to save ${id}/${Players[id].db.id}.`);

	const q = 'UPDATE `gaming_accounts` SET ' + buildUpdateQuery(player.db) + ' WHERE id=\'' + player.db.id + '\'';
	db.query(q);

	// console.log(`saved player data`);

	closeDatabaseConnection();

	// Unpack from string. Hotfix for ingame save timer.
	player.db.packages = JSON.parse(player.db.packages);
	/* if (storedPos) {
        player.db.storedPosition = new Vec3(JSON.parse(player.db.storedPosition));
    }*/
}

function registerAccountQuery(name, password, ip) {
	establishDatabaseConnection();

	const accountData = {
		'name': db.escapeString(name),
		'password': module.hashing.sha256(db.escapeString(password.toString())).toLowerCase(),
		'ip': ip,
		'registered': Date.now(),
		'last_seen': Date.now(),
		'packages': JSON.stringify([null,
			Array(100).fill(0),
			Array(100).fill(0),
			Array(100).fill(0),
			Array(100).fill(0),
			Array(200).fill(0)]),
		'items': '',
	};

	const q = 'INSERT INTO `gaming_accounts` (' + buildQueryKeys(accountData) + ') VALUES (' + buildQuery(accountData) + ');';
	db.query(q);

	closeDatabaseConnection();

	return true;
}

function loadVehicleDataQuery() {
	establishDatabaseConnection();

	const result = db.query(`SELECT * FROM ${getVehiclesDBFromGame[server.game]}`);

	log(`Found ${result.numRows} vehicles in database.`, Log.ALL);

	if (result) {
		for (let i = 0; i < result.numRows; i++) {
			const data = result.fetchAssoc();

			new Vehicle(data, i);
		}

		result.free();
	}

	closeDatabaseConnection();
}

function saveVehicleQuery(client) {
	establishDatabaseConnection();

	const vehicle = client.player.vehicle;

	messageClient(`>>> Saving vehicle: ${vehicle.modelIndex}...`, client, COLOUR_GREEN);
	console.log(`${vehicle.modelIndex.toString()}, ${vehicle.position.toString()}, ${vehicle.colour1}, ${vehicle.colour2}`);

	if (vehicle) {
		const vehicleData = {
			'model': Number(vehicle.modelIndex),
			'x': Number(vehicle.position.x.toFixed(2)),
			'y': Number(vehicle.position.y.toFixed(2)),
			'z': Number(vehicle.position.z.toFixed(2)),
			'heading': Number(vehicle.heading.toFixed(2)),
			'colour1': Number(vehicle.colour1),
			'colour2': Number(vehicle.colour2),
			'cost': 100000,
		};

		const q = 'INSERT INTO `' + getVehiclesDBFromGame[server.game] + '` (' + buildQueryKeys(vehicleData) + ') VALUES (' + buildQuery(vehicleData) + ');';
		console.log(q);
		db.query(q);

		messageClient(`Save query sent successfully.`, client, COLOUR_GREEN);
	}

	closeDatabaseConnection();
}

function saveVehicleSettings(vehicle) {
	console.log('Store vehicle settings.');

	establishDatabaseConnection();

	const veh = Vehicle.get(vehicle);

	const store = {
		'mileage': parseFloat(veh.instance.getData('mileage')),
		// "fuel" : vehicle.getData("fuel")
	};

	const q = 'UPDATE `' + getVehiclesDBFromGame[server.game] + '` SET ' + buildUpdateQuery(store) + ' WHERE id=\'' + veh.db.id + '\'';
	console.log(q);
	db.query(q);

	closeDatabaseConnection();
}

function saveAllVehicles() {
	// console.log("Store all vehicles.");

	establishDatabaseConnection();

	for (let i = 0; i < Vehicles.length; i++) {
		const veh = Vehicles[i];


		if (typeof veh.instance.getData('addToStore') != 'undefined') {
			const store = {
				'mileage': parseFloat(veh.instance.getData('mileage')),
				// "fuel" : vehicle.getData("fuel")
			};

			const q = 'UPDATE `' + getVehiclesDBFromGame[server.game] + '` SET ' + buildUpdateQuery(store) + ' WHERE id=\'' + veh.db.id + '\'';
			console.log(q);
			db.query(q);

			veh.instance.removeData('addToStore');
		}
	}

	closeDatabaseConnection();
}

function saveAllData(client, params) {
	getClients().forEach((element) => {
		savePlayerData(element);
	});

	saveAllVehicles();

	console.log('Stored all data');
}

function loadTeleportsDataQuery() {
	establishDatabaseConnection();

	const result = db.query(`SELECT * FROM ${getTeleportsDBFromGame[server.game]}`);

	log(`Found ${result.numRows} teleports in database.`, Log.ALL);

	if (result) {
		for (let i = 0; i < result.numRows; i++) {
			const data = result.fetchAssoc();

			teleports.push(data);
		}

		result.free();
	}

	closeDatabaseConnection();
}

function saveTeleportQuery(client, name) {
	if (!name) return 0;

	establishDatabaseConnection();

	const player = client.player;
	const creatorName = db.escapeString(client.name);
	name = db.escapeString(name);

	const teleportData = {
		'name': name,
		'billable': 0,
		'x': Number(player.position.x.toFixed(2)),
		'y': Number(player.position.y.toFixed(2)),
		'z': Number(player.position.z.toFixed(2)),
		'heading': Number(player.heading.toFixed(2)),
		'creator': creatorName,
	};

	messageClient(`>>> Saving teleport: ${name}...`, client, COLOUR_GREEN);

	const query = db.query('INSERT INTO `' + getTeleportsDBFromGame[server.game] + '` (' + buildQueryKeys(teleportData) + ') VALUES (' + buildQuery(teleportData) + ');');

	closeDatabaseConnection();

	messageClient(`Save query sent successfully.`, client, COLOUR_GREEN);

	teleports.push(teleportData);
}

const serverData = [];

function loadServerDataQuery() {
	establishDatabaseConnection();

	const result = db.query(`SELECT * FROM ${getServerDataDBFromGame[server.game]} ORDER BY id DESC LIMIT 1`);

	if (result) {
		for (let i = 0; i < result.numRows; i++) {
			const data = result.fetchAssoc();
			Object.assign(serverData, data);
		}

		result.free();
	}

	closeDatabaseConnection();

	// TODO: loop
	updateGlobalStat('totalEarning', null, true);
	updateGlobalStat('completedQuests', null, true);
	updateGlobalStat('collectedPackages', null, true);
	updateGlobalStat('completedAchievements', null, true);
}

function saveServerData() {
	// console.log("Store global data.");

	establishDatabaseConnection();

	const dateNow = new Date(Date.now()).toDateString();
	const dateDatabase = new Date(serverData.timestamp*1000).toDateString();
	let q = '';

	if (dateNow == dateDatabase) {
		//console.log('Store global data. UPDATE');
		q = 'UPDATE `' + getServerDataDBFromGame[server.game] + '` SET ' + buildUpdateQuery(serverData) + ' WHERE id=\'' + serverData.id + '\'';
	} else {
		console.log('Store global data. INSERT');
		serverData.timestamp = Date.now() / 1000;
		serverData.id++;
		q = 'INSERT INTO `' + getServerDataDBFromGame[server.game] + '` (' + buildQueryKeys(serverData) + ') VALUES (' + buildQuery(serverData) + ');';
	}
	db.query(q);

	closeDatabaseConnection();
}

function loadTopScoresQuery(key) {
	establishDatabaseConnection();

	key = db.escapeString(key);

	const result = db.query('SELECT `id`, `name`, `' + key + '` FROM `gaming_accounts` WHERE ' + key + ' > 0 ORDER BY ' + key + ' DESC LIMIT 5');

	if (result) {
		for (let i = 0; i < result.numRows; i++) {
			const data = result.fetchAssoc();

			topDB[key].push(data);
		}

		result.free();
	}

	closeDatabaseConnection();

	return true;
}
