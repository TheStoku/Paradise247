"use strict";

// Game specific table names
const getServerDataDBFromGame = [ null, "iii_data", "vc_data", "sa_data", "ug_data", "iv_data" ];
const getTeleportsDBFromGame = [ null, "iii_teleports", "vc_teleports", "sa_teleports", "ug_teleports", "iv_teleports" ];
const getVehiclesDBFromGame = [ null, "iii_vehicles", "vc_vehicles", "sa_vehicles", "ug_vehicles", "iv_vehicles" ];

const STORE_DATABASE_TIME = 1000 * 60 * 5; // every 5min
let db = null;

bindEventHandler("OnResourceStart", thisResource, function (event, resource) {

    // Check for CVAR settings in server.xml.
    let cvarCheck = [ "DATABASE_IP", "DATABASE_NAME", "DATABASE_USERNAME", "DATABASE_PASSWORD", "DATABASE_PORT" ];

    for (let i of cvarCheck) {
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
	db = module.mysql.connect(server.getCVar("DATABASE_IP"), server.getCVar("DATABASE_USERNAME"), server.getCVar("DATABASE_PASSWORD"), server.getCVar("DATABASE_NAME"), Number(server.getCVar("DATABASE_PORT")));
}

function closeDatabaseConnection() {
    if (db) db.close();
}

// Build MySQL query from given data (keys/values).
function buildQueryKeys(data) {
    let builtQuery = "";
    let n = 1;
    
    for (let i in data) {
        builtQuery += "\`" + i + "\`";
        
        if (n < Object.keys(data).length) builtQuery += ", ";
        
        n++;
    }

    return builtQuery;
}

function buildQuery(data) {
    let builtQuery = "";
    let n = 1;
    
    for (let i in data) {
        builtQuery += `'${data[i]}'`
        
        if (n < Object.values(data).length) builtQuery += ", ";
        
        n++;
    }
    
    return builtQuery;
}

function buildUpdateQuery(data) {
    let builtQuery = "";
    let n = 1;
    
    for (let i in data) {
        builtQuery += `${i}='${data[i]}'`
        
        if (n < Object.values(data).length) builtQuery += ", ";
        
        n++;
    }
    
    return builtQuery;
}

function isNameRegisteredQuery(name) {
    establishDatabaseConnection();

	let result = db.query(`SELECT * FROM gaming_accounts WHERE name ="${db.escapeString(name)}" LIMIT 1`);
	let rows = result.numRows;

	result.free();

    closeDatabaseConnection();

	return (rows > 0) ? true : false;
}

function checkPasswordQuery(name, password) {
    establishDatabaseConnection();

	let result = db.query(`SELECT password FROM gaming_accounts WHERE name ="${db.escapeString(name)}" LIMIT 1`);
	let rows = result.numRows;
	let isMatching = false;

	if (result.numRows > 0) {
		let row = result.fetchRow();
		
		isMatching = row[0].toLowerCase() == module.hashing.sha256(password.toString()).toLowerCase() ? true : false;
	}
	else isMatching = false;

	result.free();

    closeDatabaseConnection();

	return isMatching;
}

function checkIPQuery(client) {
    establishDatabaseConnection();

	let result = db.query(`SELECT ip FROM gaming_accounts WHERE name ="${db.escapeString(client.name)}" LIMIT 1`);
	let rows = result.numRows;
	let isMatching = false;

	if (result.numRows > 0) {
		let row = result.fetchRow();
		
		isMatching = row[0] == client.ip ? true : false;
	}
	else isMatching = false;

	result.free();

    closeDatabaseConnection();

	return isMatching;
}

function loadPlayerDataQuery(client) {
    establishDatabaseConnection();

    let result = db.query(`SELECT * FROM gaming_accounts WHERE name ="${db.escapeString(client.name)}" LIMIT 1`);

    if (result) {
        let data = result.fetchAssoc();
        let player = Player.get(client);
        
        Object.assign(player.db, data);

        // Parse JSON string from database to object.
        player.db.packages = JSON.parse(player.db.packages);
        //if (player.db.storedPosition.length > 0) player.db.storedPosition = JSON.parse(player.db.storedPosition);

        // Parse items
        let items = player.db.items.split(",");

        items.forEach(element => {
            if (element != "" && element.length > 1) {
                console.log(element);
                //console.log(element);
                player.backpack.addItem(client, element, Item.getDesc(element));
            }
        });

        result.free();
    }

    closeDatabaseConnection();

    return true;
}

function savePlayerData(client) {
    console.log("Store");
    establishDatabaseConnection();

    let player = Player.get(client);

    if (!player || client.getData("isLoggedIn") < 1) return 0;

    // Update last seen.
    player.db.last_seen = Date.now() / 1000;

    // Stringify JSON.
    player.db.packages = JSON.stringify(player.db.packages);

    // Pack stored position.
    /*let storedPos = player.db.storedPosition;
    if (storedPos) {
        player.db.storedPosition = `[${storedPos[0]}, ${storedPos[1]}, ${storedPos[2]}]`;
    }*/

    // Store items as string
    player.db.items = player.backpack.getItemsForStore();

    //console.log(`Trying to save ${id}/${Players[id].db.id}.`);

    let q = "UPDATE `gaming_accounts` SET " + buildUpdateQuery(player.db) + " WHERE id='" + player.db.id + "'";
    let query = db.query(q);

    //console.log(`saved player data`);

    closeDatabaseConnection();

    // Unpack from string. Hotfix for ingame save timer.
    player.db.packages = JSON.parse(player.db.packages);
    /*if (storedPos) {
        player.db.storedPosition = new Vec3(JSON.parse(player.db.storedPosition));
    }*/
}

function registerAccountQuery(name, password, ip) {
    establishDatabaseConnection();

    let accountData = {
        "name": db.escapeString(name),
        "password": module.hashing.sha256(db.escapeString(password.toString())).toLowerCase(),
        "ip": ip,
        "registered": Date.now(),
        "last_seen": Date.now(),
        "packages": JSON.stringify([null,
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]),
        "items": ""
    }

    let q = "INSERT INTO `gaming_accounts` (" + buildQueryKeys(accountData) + ") VALUES (" + buildQuery(accountData) + ");";
	db.query(q);
	
    closeDatabaseConnection();

	return true;
}

function loadVehicleDataQuery() {
    establishDatabaseConnection();

    let result = db.query(`SELECT * FROM ${getVehiclesDBFromGame[server.game]}`);
    
    log(`Found ${result.numRows} vehicles in database.`, Log.ALL);

    if (result) {
        for (let i = 0; i < result.numRows; i++) {
            let data = result.fetchAssoc();

            new Vehicle(data, i);
        }

        result.free();
    }

    closeDatabaseConnection();
}

function saveVehicleQuery(client) {
    establishDatabaseConnection();

    let vehicle = client.player.vehicle;

    messageClient(`>>> Saving vehicle: ${vehicle.modelIndex}...`, client, COLOUR_GREEN);
    console.log(`${vehicle.modelIndex.toString()}, ${vehicle.position.toString()}, ${vehicle.colour1}, ${vehicle.colour2}`);

    if (vehicle) {
        let vehicleData = {
            "model" : Number(vehicle.modelIndex),
            "x" : Number(vehicle.position.x.toFixed(2)),
            "y" : Number(vehicle.position.y.toFixed(2)),
            "z" : Number(vehicle.position.z.toFixed(2)),
            "heading" : Number(vehicle.heading.toFixed(2)),
            "colour1" : Number(vehicle.colour1),
            "colour2" : Number(vehicle.colour2),
            "cost" : 100000,
        }

        let q = "INSERT INTO `" + getVehiclesDBFromGame[server.game] + "` (" + buildQueryKeys(vehicleData) + ") VALUES (" + buildQuery(vehicleData) + ");"
        console.log(q);
        let query = db.query(q);

        messageClient(`Save query sent successfully.`, client, COLOUR_GREEN);
    }

    closeDatabaseConnection();
}

function saveVehicleSettings(vehicle) {
    console.log("Store vehicle settings.");

    establishDatabaseConnection();

    let veh = Vehicle.get(vehicle);

    let store = {
        "mileage" : parseFloat(veh.instance.getData("mileage"))
        //"fuel" : vehicle.getData("fuel")
    }

    let q = "UPDATE `" + getVehiclesDBFromGame[server.game] + "` SET " + buildUpdateQuery(store) + " WHERE id='" + veh.db.id + "'";
    console.log(q);
    let query = db.query(q);

    closeDatabaseConnection();
}

function saveAllVehicles() {
    //console.log("Store all vehicles.");

    establishDatabaseConnection();

    for(let i = 0; i < Vehicles.length; i++) {
        let veh = Vehicles[i];
        

        if (typeof veh.instance.getData("addToStore") != "undefined") {
            let store = {
                "mileage" : parseFloat(veh.instance.getData("mileage"))
                //"fuel" : vehicle.getData("fuel")
            }

            let q = "UPDATE `" + getVehiclesDBFromGame[server.game] + "` SET " + buildUpdateQuery(store) + " WHERE id='" + veh.db.id + "'";
            console.log(q);
            let query = db.query(q);

            veh.instance.removeData("addToStore");
        }
    }

    closeDatabaseConnection();
}

function saveAllData(client, params) {
    getClients().forEach(element => {
        savePlayerData(element);
    });

    saveAllVehicles();

    console.log("Stored all data");
}

function loadTeleportsDataQuery() {
    establishDatabaseConnection();

    let result = db.query(`SELECT * FROM ${getTeleportsDBFromGame[server.game]}`);

    log(`Found ${result.numRows} teleports in database.`, Log.ALL);

    if (result) {
        for (let i = 0; i < result.numRows; i++) {
            let data = result.fetchAssoc();

            teleports.push(data);
        }

        result.free();
    }

    closeDatabaseConnection();
}

function saveTeleportQuery(client,name) {
    if (!name) return 0;

    establishDatabaseConnection();

    let player = client.player;
    let creatorName = db.escapeString(client.name)
    name = db.escapeString(name);

    let teleportData = {
        "name" : name,
        "billable" : 0,
        "x" : Number(player.position.x.toFixed(2)),
        "y" : Number(player.position.y.toFixed(2)),
        "z" : Number(player.position.z.toFixed(2)),
        "heading" : Number(player.heading.toFixed(2)),
        "creator" : creatorName
    };

    messageClient(`>>> Saving teleport: ${name}...`, client, COLOUR_GREEN);

    let query = db.query("INSERT INTO `" + getTeleportsDBFromGame[server.game] + "` (" + buildQueryKeys(teleportData) + ") VALUES (" + buildQuery(teleportData) + ");");
    
    closeDatabaseConnection();
    
    messageClient(`Save query sent successfully.`, client, COLOUR_GREEN);

    teleports.push(teleportData);
}

let serverData = [];

function loadServerDataQuery() {
    establishDatabaseConnection();

    let result = db.query(`SELECT * FROM ${getServerDataDBFromGame[server.game]} ORDER BY id DESC LIMIT 1`);

    if (result) {
        for (let i = 0; i < result.numRows; i++) {
            let data = result.fetchAssoc();
            Object.assign(serverData, data);
        }

        result.free();
    }

    closeDatabaseConnection();

    // TODO: loop
    updateGlobalStat("totalEarning", null, true);
    updateGlobalStat("completedQuests", null, true);
    updateGlobalStat("collectedPackages", null, true);
    updateGlobalStat("completedAchievements", null, true);
}

function saveServerData() {
    //console.log("Store global data.");

    establishDatabaseConnection();

    let dateNow = new Date(Date.now()).toDateString();
    let dateDatabase = new Date(serverData.timestamp*1000).toDateString();
    let q = "";

    if (dateNow == dateDatabase) {
        console.log("Store global data. UPDATE");
        q = "UPDATE `" + getServerDataDBFromGame[server.game] + "` SET " + buildUpdateQuery(serverData) + " WHERE id='" + serverData.id + "'";
    } else {
        console.log("Store global data. INSERT");
        serverData.timestamp = Date.now() / 1000;
        serverData.id++;
        q = "INSERT INTO `" + getServerDataDBFromGame[server.game] + "` (" + buildQueryKeys(serverData) + ") VALUES (" + buildQuery(serverData) + ");";
    }
    let query = db.query(q);

    closeDatabaseConnection();
}

function loadTopScoresQuery(key) {
    establishDatabaseConnection();

    key = db.escapeString(key);
    
    let result = db.query("SELECT `id`, `name`, `" + key + "` FROM `gaming_accounts` WHERE " + key + " > 0 ORDER BY " + key + " DESC LIMIT 5");

    if (result) {
        for (let i = 0; i < result.numRows; i++) {
            let data = result.fetchAssoc();

            topDB[key].push(data);
        }

        result.free();
    }

    closeDatabaseConnection();

    return true;
}