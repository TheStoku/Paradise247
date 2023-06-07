"use strict";

let Vehicles = [];

class Vehicle {
    constructor(data, id) {
        this.db = {};
        this.instance = null;
        this.id = id;
        Object.assign(this.db, data);

        this.lastUsed = null;
        
        this.init();

        this.instance.setData("index", id, true);

        let i = Vehicles.push(this);

        // Respawn unused vehicle.
        this.respawnInterval = setInterval(() => {
            this.reset();
        }, MAP_CLEANUP_TIME);

        // Setup database store interval
        // It was moved to database.js.
        /*this.saveInterval = setInterval(() => {
            saveVehicleSettings(this.instance);
        }, STORE_DATABASE_TIME);*/
    }

    init() {
        // Fresh spawn
        if (!this.instance) {
            // Create vehicle and store data
            this.instance = gta.createVehicle(this.db.model, new Vec3(this.db.x, this.db.y, this.db.z));
            gta.createBlipAttachedTo(this.instance, 0, 0, toColour(0, 0, 0), true, false);
            
            // Make this vehicle a default spawned (loaded from database).
            this.instance.setData("default", true, true);
        } else {
            this.instance.setSyncer(null, true);
            this.instance.fix();
            this.instance.position = new Vec3(this.db.x, this.db.y, this.db.z);
            this.instance.removeData("lastDriver");
            triggerNetworkEvent("respawnVehicle", null, this.instance.id, this.db.x, this.db.y, this.db.z, this.db.heading);
        }

        this.lastUsed = null;
        this.instance.heading = this.db.heading;
        this.instance.colour1 = this.db.colour1;
        this.instance.colour2 = this.db.colour2;
        this.instance.locked = this.db.isLocked ? true : false;

        // Is this a convoy mission car?
        if (this.db.convoy > 0) this.instance.setData("convoy", this.db.convoy, true);

        // Make some random colours, if it was specified in database.
        if (this.db.colour1 == -1 && this.db.colour2 == -1) { this.instance.randomiseColours(); }

        // Set mileage
        this.instance.setData("mileage", this.db.mileage, true);

        // TODO: Implement
        //this.instance.alarm = this.alarm; client only
    }

    reset() {
        if (typeof this.instance == "undefined") log(`Undefined Vehicle: ` + this.id);

        if (this.instance.getOccupants().length == 0) {
            this.init();
        }
    }

    static get(vehicle) {
        let i = vehicle.getData("index");
        
        let index = Vehicles.findIndex( vehicle => vehicle.id == i );

        if (index > -1) {
            return Vehicles[index];
        }
        else return null;
    }

    static spawnTempVehicle(client, params) {
        let player = Player.get(client);
    
        if (player.vehicle) {
            destroyElement(player.vehicle);
        }
    
        let modelId = getVehicleModelIdFromParams(params, gta.game);
        let vehicle = gta.createVehicle(modelId, client.player.position);
        player.vehicle = vehicle;
    
        vehicle.heading = client.player.heading;
        client.player.warpIntoVehicle(vehicle, 0);
    }
}

addNetworkHandler("updateMileage", function (client, mileage, inc) {
	let player = Player.get(client);
	let vehicle = client.player.vehicle;

	if (!vehicle) return;
	vehicle.setData("mileage", mileage, true);

	
	player.increaseMileage(inc);

	if (typeof vehicle.getData("default") == "undefined") return;
	Vehicle.get(vehicle).db.mileage = mileage;
});

addNetworkHandler("callService", function (client, vehicleId, type) {
	//TODO: money check
	let cost = 0;
	let vehicle = getElementFromId(vehicleId);
	
	switch(type) {
		case "fix":
			cost = 100;
			vehicle.fix();
			break;
		case "flip":
			cost = 100;
			triggerNetworkEvent("flipVehicle", client);
			break;
		case "flip&fix":
			cost = 150;
			vehicle.fix();		
			triggerNetworkEvent("flipVehicle", client);
			break;
	}
	message(`🚗[#0099FF]${client.name} [#FFFFFF]called ${type} service. Cost \$${cost}.`);
});

addNetworkHandler("onDodoFlightFinish", function (client, flightTime) {
	let player = Player.get(client);

	player.db.dodoFlightTime += Number(flightTime);
	let current = new Date(flightTime * 1000).toISOString().slice(11, 19);
	let overall = new Date(player.db.dodoFlightTime * 1000).toISOString().slice(11, 19);

	triggerNetworkEvent("smallMessage", client, player.getLocale().getString("flightTime", null, null, null, null, flightTime.toString()), 2000, 2);
});

addNetworkHandler("onSetVehicleLights", function (client, vehicleId, status) {
    //console.log(`${vehicleId}, ${status}`);
	triggerNetworkEvent("setVehicleLights", null, vehicleId, status);
});