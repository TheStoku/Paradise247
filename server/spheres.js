'use strict';

const Spheres = [];

class Sphere {
	constructor(position, radius, callback, ...args) {
		// this.instance = gta.createSphere(position, radius); // Spheres are producing crashes on GTAC. Hotfixed it with pickup.
		this.instance = gta.createPickup(1384, position, PICKUP_ON_STREET);
		this.instance.setData('isSphere', true, true);
		this.instance.setData('radius', radius, true);
		// End of hotfix.
		this.id = Spheres.push(this);
		this.callback = callback;

		// Create radar blip
		if (args[0] != null) {
			this.blip = gta.createBlipAttachedTo(
				this.instance, args[0],
				args[1] = 2, // Size
				args[2] = 0, // Colour
				args[3] = true, // Blip
				args[4] = false); // Marker
		}

		// log(`Sphere() - sID: ${this.instance.id}, ID: ${this.id}; Len: ${Spheres.length}`, Log.DEBUG);

		return this;
	}

	destructor() {
		const index = Sphere.getIndex(this);

		Spheres.splice(index, 1);

		if (typeof this.blip != 'undefined') destroyElement(this.blip);
		destroyElement(this.instance);
		log(Spheres.toString(), Log.DEBUG);

		delete this;
	}

	static getInstance(sphereId) {
		const instance = Spheres.findIndex((sphere) => sphere.instance == sphereId);

		return instance ? instance : false;
	}

	static get(sphereId) {
		const index = Spheres.findIndex((sphere) => sphere.instance.id == sphereId);

		return index > -1 ? Spheres[index] : -1;
	}

	static getIndex(sphere) {
		const index = Spheres.indexOf(sphere);

		return index > -1 ? index : -1;
	}

	static enter(event, pedId, sphereId) {
		const sphere = Sphere.get(sphereId);

		log(`Sphere::enter() - Player: ${pedId.name}, Sphere: ${sphereId}`, Log.DEBUG);
		sphere.callback(event, pedId, sphere, true);
	}

	static exit(event, pedId, sphereId) {
		const sphere = Sphere.get(sphereId);

		log(`Sphere::exit() - Player: ${pedId.name}, Sphere: ${sphereId}`, Log.DEBUG);
		sphere.callback(event, pedId, sphere, false);
	}
}

addEventHandler('OnPedEnteredSphereEx', (event, pedId, sphereId) => {
	log(`OnPedEnteredSphereEx(): ${pedId.index}, ${sphereId.id}`, Log.DEBUG);

	if (pedId.type == ELEMENT_PLAYER) {
		Sphere.enter(event, pedId, sphereId.id);
	}
});

addEventHandler('OnPedExitedSphereEx', (event, pedId, sphereId) => {
	log(`OnPedExitedSphereEx(): ${pedId.index}, ${sphereId.id}`, Log.DEBUG);

	if (pedId.type == ELEMENT_PLAYER) {
		Sphere.exit(event, pedId, sphereId.id);
	}
});


function initSpheres() {

}
