"use strict";

/*
    Info-pickup system
*/

let InfoPickups = [];

class InfoPickup {
    constructor(position, message) {
        this.message = message;
        this.pickup = gta.createPickup(1361, position, PICKUP_ON_STREET);
        this.pickup.setData("isInfoPickup", true, false);

        console.log(`infopickupid: ${this.pickup}`);

        InfoPickups.push(this);
    }

    static get(pickup) {
        let infoPickup = InfoPickups.findIndex( infoPickup => infoPickup.pickup.id == pickup.id );

        if (infoPickup > -1) {
            return InfoPickups[infoPickup];
        }
        else return null;
    }

    enter(client) {
        Locale.sendMessage(client, false, COLOUR_WHITE, this.message, client.name);

        // Achievement
        Player.get(client).db.infoPickups++;
        
        let collectedPickups = Player.get(client).db.infoPickups;

        client.setData("infoPickups", collectedPickups);
        Achievement.check("infoPickups", collectedPickups, client);

        Quest.check(client, "infoPickups");

        serverData.collectedInfoPickups++;
    }
}

function initInfoPickups() {
    //console.log(TAG + `Loading InfoPickups.`);

    if (server.game == GAME_GTA_III) {
        // Portland
        new InfoPickup(new Vec3(1064.25, -393.34, 14.97), "infoPickup.ammunation");
        new InfoPickup(new Vec3(884.73, -524.08, 16.59), "infoPickup.ctf");
        new InfoPickup(new Vec3(1573.93, -678.24, 11.83), "infoPickup.importExport"); 
        new InfoPickup(new Vec3(1155.17, -96.37, 7.65), "infoPickup.gasStation");
        new InfoPickup(new Vec3(1215.96, -120.85, 14.97), "infoPickup.carDealer");
        new InfoPickup(new Vec3(1021.32, -687.38, 14.97), "infoPickup.bank");

        // Staunton
        new InfoPickup(new Vec3(350.13, -709.58, 26.17), "infoPickup.ammunation");
        new InfoPickup(new Vec3(171.31, -961.43, 26.25), "infoPickup.bank");
    }
}

addNetworkHandler("OnPickupCollected_C", function (client, pickupId) {
    let pickup = getElementFromId(pickupId);

	if (pickup.getData("isInfoPickup") == true) InfoPickup.get(pickup).enter(client);
});

/*
// OnPickupCollected server-side event seems to be bugged on player ID > 0.
addEventHandler("OnPickupCollected", (event, pickup, ped) => {
    console.log(pickup.toString());
	//if (ped.type == ELEMENT_PLAYER) {
		let client = getClientFromPlayerElement(ped);

		// Check if collected pickup is info-pickup.
		if (pickup.getData("isInfoPickup") == true) InfoPickup.get(pickup).enter(client);
	//}
});*/