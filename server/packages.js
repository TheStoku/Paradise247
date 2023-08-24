'use strict';

/*
    Hidden Packages system
*/

const Packages = [];

class Package {
	constructor(id, position) {
		this.id = id;
		this.pickup = gta.createPickup(1321, position, PICKUP_ONCE);
		this.pickup.setData('isHiddenPackage', true, false);

		Packages.push(this);
	}

	collect(client) {
		const packages = Player.get(client).db.packages[thisGame];

		packages[this.id] = 1;

		const collectedCount = Package.count(client);
		Player.get(client).db.hiddenPackages = collectedCount;
		// Player.get(client).setMoney(earningBase.hiddenPackage, true);
		Locale.sendMessage(client, false, COLOUR_ORANGE, 'collectedPackage', this.id.toString(), collectedCount);
		decho(3, client.name + ' has colledted a hidden package!');

		earn(client, earningBase.hiddenPackage, xpBase.hiddenPackage);

		client.setData('hiddenPackages', collectedCount);
		Achievement.check('hiddenPackages', collectedCount, client);

		Quest.check(client, 'hiddenPackages');

		updateGlobalStat('collectedPackages', 1, true, true);
	}

	static get(id) {
		const index = Packages.findIndex( (hiddenPackage) => hiddenPackage.id == id );

		return index > -1 ? Packages[index] : null;
	}

	static getInstance(pickup) {
		const hiddenPackage = Packages.findIndex( (hiddenPackage) => hiddenPackage.pickup.id == pickup.id );

		if (hiddenPackage > -1) {
			return Packages[hiddenPackage];
		} else return null;
	}

	static count(client) {
		const packages = Player.get(client).db.packages[thisGame];
		let count = 0;

		packages.forEach((element) => {
			if (element == 1) count++;
		});

		return count;
	}
}

function initHiddenPackages() {
	hiddenPackages[thisGame].forEach((element, index) => {
		new Package(index, element);
	});
}

addNetworkHandler('OnPickupCollected_C', function(client, pickupId) {
	const pickup = getElementFromId(pickupId);

	if (pickup.getData('isHiddenPackage') == true) Package.getInstance(pickup).collect(client);
});

/*
// Same as in infopickup.js.
addEventHandler("OnPickupCollected", (event, pickup, ped) => {
	if (ped.type == ELEMENT_PLAYER) {
        console.log(pickup.toString());
		let client = getClientFromPlayerElement(ped);

		if (pickup.getData("isHiddenPackage") == true) Package.getInstance(pickup).collect(client);
        //else if (pickup.getData("isInfoPickup") == true) InfoPickup.get(pickup).enter(client);
	}
});*/
