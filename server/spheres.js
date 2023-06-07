"use strict";

let Spheres = [];

class Sphere {
    constructor(position, radius, callback) {
        //this.instance = gta.createSphere(position, radius); // Spheres are producing crashes on GTAC. Hotfixed it with pickup.
        this.instance = gta.createPickup(1384, position, PICKUP_ON_STREET);
        this.instance.setData("isSphere", true, true);
        this.instance.setData("radius", radius, true);
        // End of hotfix.
        this.id = Spheres.push(this);
        this.callback = callback;

        // Create radar blip
        if (arguments[3] != null) {
            this.blip = gta.createBlipAttachedTo(this.instance, arguments[3], arguments[4] = 2, arguments[5] = 0, arguments[6] = true, arguments[7] = false); // optional: , [ int size = 2, int colour = 0, bool blip = true, bool marker = false ]
        }

        //log(`Sphere() - sID: ${this.instance.id}, ID: ${this.id}; Len: ${Spheres.length}`, Log.DEBUG);

        return this;
    }

    destructor() {
        let index = Sphere.getIndex(this);

        Spheres.splice(index, 1);
        
        if (typeof this.blip != "undefined") destroyElement(this.blip);
        destroyElement(this.instance);
        log(Spheres.toString(), Log.DEBUG);

        delete this;
    }

    static getInstance(sphereId) {
        let instance = Spheres.findIndex(sphere => sphere.instance == sphereId);

        if (instance) return instance;
        else return false;
    }

    static get(sphereId) {
        let sphere = Spheres.findIndex(sphere => sphere.instance.id == sphereId);

        if (sphere > -1) {
            return Spheres[sphere];
        }
        else return -1;
    }

    static getIndex(sphere) {
        let index = Spheres.indexOf(sphere);

        if (index > -1) {
            return index;
        }
        else return -1;
    }

    static enter(event, pedId, sphereId) {
        let sphere = Sphere.get(sphereId);

        log(`Sphere::enter() - Player: ${pedId.name}, Sphere: ${sphereId}`, Log.DEBUG);
        sphere.callback(event, pedId, sphere, true);
    }

    static exit(event, pedId, sphereId) {
        let sphere = Sphere.get(sphereId);

        log(`Sphere::exit() - Player: ${pedId.name}, Sphere: ${sphereId}`, Log.DEBUG);
        sphere.callback(event, pedId, sphere, false);
    }
}

addEventHandler("OnPedEnteredSphereEx", (event, pedId, sphereId) => {
    log(`OnPedEnteredSphereEx(): ${pedId.index}, ${sphereId.id}`, Log.DEBUG);

	if (pedId.type == ELEMENT_PLAYER) {
		Sphere.enter(event, pedId, sphereId.id);
	}
});

addEventHandler("OnPedExitedSphereEx", (event, pedId, sphereId) => {
    log(`OnPedExitedSphereEx(): ${pedId.index}, ${sphereId.id}`, Log.DEBUG);

	if (pedId.type == ELEMENT_PLAYER) {
		Sphere.exit(event, pedId, sphereId.id);
	}
});


function initSpheres() {

}