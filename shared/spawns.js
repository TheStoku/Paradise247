"use strict";

let Team = null;
let Spawns = [];

class Spawn {
    constructor(team, name, skin, position, heading, camera, weaponSet, weaponSelect) {
        this.team = team;
        this.name = name;
        this.skin = skin;
        this.position = position;
        this.heading = heading;
        this.camera = camera;
        this.weaponSet = weaponSet;
        this.weaponSelect = weaponSelect;
        this.id = Spawns.push(this);
        //console.log(`Spawn(${this.id});`)
    }

    static get(id) {
        if (typeof Spawns[id] != "undefined") {
            return Spawns[id];
        } else {
            return Spawns[1];
        }    
    }

    static getTeam(id) {
        return this.get(id).team;
    }
}

// TODO: needs refactoring.
function initSpawns() {
    if (thisGame == GAME_GTA_III) {
        const TEAM_PROTAGONISTS = 0;
        const TEAM_PARAMEDICS = 1;
        const TEAM_COPS = 2;
        const TEAM_MAFIA = 3;
        const TEAM_DIABLOS = 4;
        const TEAM_TRIADS = 5;
        const TEAM_8BALL = 6;
        const TEAM_FIREFIGHTERS = 7;
        const TEAM_TAXI = 8;

        const camera = {
            portland_salvatore: new Vec3(1457.19, -180.33, 55.78),
            portland_paramedics: new Vec3(1129.24, -606.54, 14.640 + 10.0),
            portland_lcpd: new Vec3(1127.15, -666.49, 14.823 + 10.0),
            portland_hideout: new Vec3(867.94, -307.32, 8.357 + 10.0),
            portland_diablos: new Vec3(923.79, -250.95, 4.967 + 10.0),
            portland_triads: new Vec3(949.31, -681.52, 14.97 + 10.0),
            portland_lee: new Vec3(1050.58, -652.71, 14.82 + 10.0),
            portland_firefighter: new Vec3(1081.28, -69.20, 9.40 + 10.0),
            portland_8ball: new Vec3(1287.11, -90.92, 16.773 + 10.0),
            portland_mafia: new Vec3(1362.07, -249.30, 49.82 + 10.0),
            portland_taxi1: new Vec3(921.73, -52.13, 7.82 + 10.0),
            portland_taxi2: new Vec3(1252.85, -755.97, 15.17 + 10.0)
        }

        Team = [
            { id: TEAM_PROTAGONISTS, name: "Protagonists", color: "[#fb8b24]", RGBColour: toColour(251, 139, 36, 255), car: null, level: 0 },
            { id: TEAM_PARAMEDICS, name: "Paramedics", color: "[#1dd3b0]", RGBColour: toColour(29, 211, 176, 255), car: 106, level: 0 },
            { id: TEAM_COPS, name: "Cops", color: "[#3772ff]", RGBColour: toColour(55, 114, 255, 255), car: 107, level: 1 },
            { id: TEAM_MAFIA, name: "Mafia", color: "[#001427]", RGBColour: toColour(0, 20, 39, 255), car: 134, level: 2 },
            { id: TEAM_DIABLOS, name: "Diablos", color: "[#ffcb77]", RGBColour: toColour(255, 203, 119, 255), car: 129, level: 2 },
            { id: TEAM_TRIADS, name: "Triads", color: "[#708d81]", RGBColour: toColour(112, 141, 129, 255), car: 133, level: 3 },
            { id: TEAM_8BALL, name: "8 Ball", color: "[#6930c3]", RGBColour: toColour(105, 48, 195, 255), car: null, level: 5 },
            { id: TEAM_FIREFIGHTERS, name: "Firefighters", color: "[#d9dcd6]", RGBColour: toColour(217, 220, 214, 255), car: 97, level: 4 },
            { id: TEAM_TAXI, name: "Taxi Drivers", color: "[#ffee32]", RGBColour: toColour(255, 238, 50, 255), car: 110, level: 3 }
        ];

        const WeaponSet = {
            defaultSet: [1, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            defaultSelect: [0, 0, 0, 700, 50, 500, 500, 20, 20, 20, 20, 20]
        };        

        new Spawn(Team[TEAM_PROTAGONISTS], "Claude", 0, new Vec3(886.82, -307.98, 8.593), 1.483, camera.portland_hideout, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_PARAMEDICS], "Paramedic", 5, new Vec3(1145.94, -591.32, 14.950), 1.604, camera.portland_paramedics, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_COPS], "Cop", 1, new Vec3(1144.29, -665.54, 14.973), 1.615, camera.portland_lcpd, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_TRIADS], "Triad", 12, new Vec3(973.34, -680.97, 14.97), 1.57, camera.portland_triads, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_TRIADS], "Lee Chong", 87, new Vec3(1038.66, -653.11, 14.97), -1.52, camera.portland_lee, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_DIABLOS], "Diablo", 14, new Vec3(942.06, -265.32, 4.937), 0.119, camera.portland_diablos, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_MAFIA], "Salvatore Leone", 98, new Vec3(1465.21, -177.53, 56.32), -0.08, camera.portland_salvatore, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_MAFIA], "Mafia Member", 11, new Vec3(1340.24, -253.17, 49.64), -1.56, camera.portland_mafia, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_FIREFIGHTERS], "Firefighter", 6, new Vec3(1091.60, -85.48, 9.37), 0.0, camera.portland_firefighter, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_8BALL], "8 Ball", 97, new Vec3(1272.65, -95.41, 14.863), -1.563, camera.portland_8ball, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_TAXI], "Borgnine Driver", 8, new Vec3(931.67, -62.18, 8.30), -0.03, camera.portland_taxi1, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_TAXI], "Mean Street Taxi Driver", 8, new Vec3(1259.06, -743.21, 15.17), 2.33, camera.portland_taxi2, WeaponSet.defaultSet, WeaponSet.defaultSelect);
    } else if (thisGame == GAME_GTA_IV) {
        /*  IV coords
            1019.56, -70.09, 33.06 1.48 ped
            1008.06, -69.59, 30.48 1.53 cam
            1063.46, -173.98, 29.92 0.05 altanka
        */
        const TEAM_PROTAGONISTS = 0;
        const TEAM_PARAMEDICS = 1;
        const TEAM_COPS = 2;
        const TEAM_MAFIA = 3;
        const TEAM_DIABLOS = 4;
        const TEAM_TRIADS = 5;
        const TEAM_8BALL = 6;
        const TEAM_FIREFIGHTERS = 7;
        const TEAM_TAXI = 8;

        const camera = {
            portland_salvatore: new Vec3(1008.06, -69.59, 30.48)
        }

        Team = [
            { id: TEAM_PROTAGONISTS, name: "Protagonists", color: "[#fb8b24]", RGBColour: toColour(251, 139, 36, 255), car: null },
            { id: TEAM_PARAMEDICS, name: "Paramedics", color: "[#1dd3b0]", RGBColour: toColour(29, 211, 176, 255), car: 106 },
            { id: TEAM_COPS, name: "Cops", color: "[#3772ff]", RGBColour: toColour(55, 114, 255, 255), car: 107 },
            { id: TEAM_MAFIA, name: "Mafia", color: "[#001427]", RGBColour: toColour(0, 20, 39, 255), car: 134 },
            { id: TEAM_DIABLOS, name: "Diablos", color: "[#ffcb77]", RGBColour: toColour(255, 203, 119, 255), car: 129 },
            { id: TEAM_TRIADS, name: "Triads", color: "[#708d81]", RGBColour: toColour(112, 141, 129, 255), car: 133 },
            { id: TEAM_8BALL, name: "8 Ball", color: "[#6930c3]", RGBColour: toColour(105, 48, 195, 255), car: null },
            { id: TEAM_FIREFIGHTERS, name: "Firefighters", color: "[#d9dcd6]", RGBColour: toColour(217, 220, 214, 255), car: 97 },
            { id: TEAM_TAXI, name: "Taxi Drivers", color: "[#ffee32]", RGBColour: toColour(255, 238, 50, 255), car: 110 }
        ];

        const WeaponSet = {
            defaultSet: [0, 0, 5, 10, 15, 20, 0, 25, 30, 35, 40, 0],
            defaultSelect: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };        

        new Spawn(Team[TEAM_PROTAGONISTS], "Niko Bellic", 1862763509, new Vec3(1019.56, -70.09, 33.06), 1.48, camera.portland_salvatore, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_PROTAGONISTS], "Male Multiplayer", -2020305438, new Vec3(1019.56, -70.09, 33.06), 1.48, camera.portland_salvatore, WeaponSet.defaultSet, WeaponSet.defaultSelect);
        new Spawn(Team[TEAM_PROTAGONISTS], "Female Multiplayer", -641875910, new Vec3(1019.56, -70.09, 33.06), 1.48, camera.portland_salvatore, WeaponSet.defaultSet, WeaponSet.defaultSelect);
    }
}