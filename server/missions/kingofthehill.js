"use strict";

KingOfTheHills = [];

class KingOfTheHill {
    constructor(id, center, redSpawn, blueSpawn) {
        this.sphere = null;
        this.id = id;
        this.center = center;
        this.redSpawn = redSpawn;
        this.blueSpawn = blueSpawn;
        this.score = [ 0, 0 ];

        KingOfTheHills.push(this);
    }

    static get(id) {
        let index = KingOfTheHills.findIndex( koth => koth.id == id );

        if (index > -1) {
            return KingOfTheHills[index];
        }
        else return null;
    }

    static start(id) {
        let instance = KingOfTheHill.get(id);

        if (instance.sphere === null) instance.sphere = new Sphere(instance.center, 5.0, KingOfTheHill.end, 0, 4, COLOUR_GREEN, true, true);
        if (instance.sphere.blip !== null) instance.sphere.blip.netFlags.distanceStreaming = false;
    }
}

function initKingOfTheHill() {
    if (server.game == GAME_GTA_III) {
        new Convoy(1, new Vec3(153.66, -977.30, 26.17), "Staunton Bank");
        new Convoy(2, new Vec3(1040.15, -697.44, 14.97), "Portland Bank");
    }
}