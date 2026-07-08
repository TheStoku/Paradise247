'use strict';

const ActiveTransportSpheres = new Map();
const ActiveTransportJobs = new Map();

const DELIVERY_REWARD_BASE = 20;
const DISTANCE_BONUS_PER_METER = 0.10; 
const DELIVERY_XP = 25;
const BONUS_REWARD = 200;

const VEHICLE_CAPACITIES = {
    103: { type: "LIGHT", maxCargo: 20, name: "Pony" },
    198: { type: "LIGHT", maxCargo: 10, name: "Moonbeam" },
    112: { type: "LIGHT", maxCargo: 10, name: "Bobcat" },
    130: { type: "LIGHT", maxCargo: 20, name: "Rumpo" },

    98: { type: "HEAVY", maxCargo: 50, name: "Trashmaster" },
    104: { type: "HEAVY", maxCargo: 40, name: "Mule" },
    132: { type: "HEAVY", maxCargo: 40, name: "BellyUp" },
    133: { type: "HEAVY", maxCargo: 40, name: "MrWongs" },
    146: { type: "HEAVY", maxCargo: 40, name: "Yankee" }
};

const LOADING_TIME_MS = 2000;

const TRANSPORT_WAREHOUSES = [
    { id: 1, name: "Docks warehouse", pos: new Vec3(1457.01, -810.26, 11.73) },
    { id: 2, name: "Test", pos: new Vec3(1130.0, -840.0, 15.0) }
];

const TRANSPORT_DELIVERIES = [
    { name: "Dry Cleaning", pos: new Vec3(1059.84, -678.89, 14.82) },
    { name: "Coffeeshop Bar", pos: new Vec3(1059.71, -737.41, 14.82) },
    { name: "Chineese Market", pos: new Vec3(1042.24, -742.99, 14.82) },
    { name: "Gourmet Deli", pos: new Vec3(1058.78, -788.50, 14.82) },
    { name: "Sumos Wok", pos: new Vec3(897.11, -788.27, 14.82) },
    { name: "Roast Peking Duck", pos: new Vec3(903.32, -802.52, 14.82) },
    { name: "H&W Seafood", pos: new Vec3(855.57, -701.47, 14.82) },
    { name: "Mr. Wong's Laundrette", pos: new Vec3(838.90, -663.59, 14.82) },
    { name: "Margot Bistrot Cafe", pos: new Vec3(870.22, -616.53, 14.82) },
    { name: "Liberty Bagel Deli", pos: new Vec3(953.23, -615.98, 14.82) },
    { name: "Video Shop", pos: new Vec3(941.34, -485.83, 14.82) },
    { name: "Capital Wholesale", pos: new Vec3(1058.10, -458.78, 14.73) },
    { name: "Rush Construction", pos: new Vec3(1041.62, -426.28, 14.73) },
    { name: "Ammu-Nation", pos: new Vec3(1058.51, -400.59, 14.73) },
    { name: "Classic Nails", pos: new Vec3(1058.34, -377.97, 14.73) },
    { name: "Steps Clothing", pos: new Vec3(1058.39, -348.60, 14.73) },
    { name: "Apartment", pos: new Vec3(1131.16, -186.74, 14.13) },
    { name: "Apartment", pos: new Vec3(1131.62, -175.79, 13.08) },
    { name: "Apartment", pos: new Vec3(1131.99, -165.77, 12.08) },
    { name: "Apartment", pos: new Vec3(1131.66, -156.89, 11.19) },
    { name: "Apartment", pos: new Vec3(1131.89, -146.12, 10.11) },
    { name: "Apartment", pos: new Vec3(1122.12, -148.46, 10.20) },
    { name: "Apartment", pos: new Vec3(1122.55, -158.19, 11.17) },
    { name: "Apartment", pos: new Vec3(1123.24, -169.73, 12.33) },
    { name: "Apartment", pos: new Vec3(1123.01, -181.26, 13.48) },
    { name: "Apartment", pos: new Vec3(1212.91, -218.95, 25.31) },
    { name: "Apartment", pos: new Vec3(1229.86, -218.76, 26.95) },
    { name: "Apartment", pos: new Vec3(1255.55, -218.45, 29.44) },
    { name: "Apartment", pos: new Vec3(1282.98, -218.07, 34.83) },
    { name: "Apartment", pos: new Vec3(1310.23, -218.65, 40.38) },
    { name: "Apartment", pos: new Vec3(1299.20, -199.19, 37.99) },
    { name: "Apartment", pos: new Vec3(1283.67, -198.89, 34.96) },
    { name: "Apartment", pos: new Vec3(1266.53, -199.35, 31.60) },
    { name: "Apartment", pos: new Vec3(1248.60, -199.43, 28.75) },
    { name: "Apartment", pos: new Vec3(1227.26, -199.41, 26.69) },
    { name: "Apartment", pos: new Vec3(1190.29, -230.48, 24.71) },
    { name: "Apartment", pos: new Vec3(1189.68, -244.57, 24.88) },
    { name: "Apartment", pos: new Vec3(1190.34, -254.41, 24.86) },
    { name: "Apartment", pos: new Vec3(1191.20, -266.25, 24.76) },
    { name: "Apartment", pos: new Vec3(1218.77, -358.07, 26.02) },
    { name: "Apartment", pos: new Vec3(1241.52, -358.59, 28.34) },
    { name: "Apartment", pos: new Vec3(1262.94, -358.29, 31.17) },
    { name: "Apartment", pos: new Vec3(1286.86, -358.34, 35.89) },
    { name: "Apartment", pos: new Vec3(1309.13, -358.52, 40.28) },
    { name: "Apartment", pos: new Vec3(1332.18, -358.70, 44.82) },
    { name: "Apartment", pos: new Vec3(1350.56, -358.87, 48.79) },
    { name: "Apartment", pos: new Vec3(1379.31, -296.89, 49.73) },
    { name: "Apartment", pos: new Vec3(1380.08, -308.32, 49.73) },
    { name: "Apartment", pos: new Vec3(1380.11, -324.09, 49.73) },
    { name: "Apartment", pos: new Vec3(1380.23, -343.20, 49.79) },
    { name: "Apartment", pos: new Vec3(1380.38, -362.42, 49.86) },
    { name: "Apartment", pos: new Vec3(1380.34, -378.37, 49.81) },
    { name: "Apartment", pos: new Vec3(1380.31, -393.83, 49.82) },
    { name: "Apartment", pos: new Vec3(1380.29, -405.80, 49.82) },
    { name: "Apartment", pos: new Vec3(1380.27, -420.30, 49.82) },
    { name: "Apartment", pos: new Vec3(1378.13, -436.40, 49.83) },
    { name: "Marco's Bisto", pos: new Vec3(1350.29, -460.23, 49.98) },
    { name: "Apartment", pos: new Vec3(1251.54, -507.63, 29.41) },
    { name: "Apartment", pos: new Vec3(1241.31, -507.55, 28.38) },
    { name: "Apartment", pos: new Vec3(1231.14, -507.50, 27.36) },
    { name: "Apartment", pos: new Vec3(1220.59, -507.44, 26.31) },
    { name: "Apartment", pos: new Vec3(1211.91, -507.39, 25.40) },
    { name: "Apartment", pos: new Vec3(1169.21, -490.74, 23.06) },
    { name: "Apartment", pos: new Vec3(1154.56, -490.54, 21.60) },
    { name: "Apartment", pos: new Vec3(1141.07, -490.36, 20.26) },
    { name: "Pizza", pos: new Vec3(1128.86, -463.52, 19.73) }
];

class TransportMission {
    static startLoading(client, vehicle) {
        const clientId = client.id;
        const model = vehicle.modelIndex;
        const config = VEHICLE_CAPACITIES[model];

        if (!config) return;

        const currentPos = client.player.position;
        const warehouse = TRANSPORT_WAREHOUSES.reduce((prev, curr) => {
            return curr.pos.distance(currentPos) < prev.pos.distance(currentPos) ? curr : prev;
        });

        Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.loadingStarted', config.name, config.type, config.maxCargo);

        const existingJob = ActiveTransportJobs.get(clientId);
        const totalCompleted = existingJob ? existingJob.totalCompleted : 0;

        const jobState = {
            vehicle: vehicle,
            warehouseName: warehouse.name,
            warehousePos: warehouse.pos,
            cargo: 0,
            maxCargo: config.maxCargo,
            totalCompleted: totalCompleted,
            loadingInterval: null,
            deliverySpheres: [], 
            stopCheckInterval: null,
            stopTicks: 0,
            currentDestination: null,
            currentStopSphere: null
        };

        ActiveTransportJobs.set(clientId, jobState);

        jobState.loadingInterval = setInterval(() => {
            const locale = Player.get(client).getLocale();

            if (!client.player || !client.player.vehicle || client.player.vehicle !== vehicle) {
                TransportMission.cancelJob(client, locale.getString('mission.transport.reasonExitedDuringLoading'));
                return;
            }

            const v = vehicle.velocity;
            const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

            if (speed > 0.1) {
                if (jobState.cargo > 0) {
                    clearInterval(jobState.loadingInterval);
                    jobState.loadingInterval = null;
                    Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.loadingDeparted', jobState.cargo);
                    TransportMission.startDeliveries(client);
                } else {
                    TransportMission.cancelJob(client, locale.getString('mission.transport.reasonMovedEarly'));
                }
                return;
            }

            jobState.cargo++;
            Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.loadingItem', jobState.cargo, jobState.maxCargo);

            if (jobState.cargo >= jobState.maxCargo) {
                clearInterval(jobState.loadingInterval);
                jobState.loadingInterval = null;
                Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.loadingFull');
                TransportMission.startDeliveries(client);
            }
        }, LOADING_TIME_MS);
    }

    static startDeliveries(client) {
        const clientId = client.id;
        const job = ActiveTransportJobs.get(clientId);
        if (!job || job.cargo <= 0) return;

        job.deliverySpheres = [];

        for (let i = 0; i < job.cargo; i++) {
            const randomIndex = Math.floor(Math.random() * TRANSPORT_DELIVERIES.length);
            const point = TRANSPORT_DELIVERIES[randomIndex];

            const sphere = new Sphere(point.pos, 5.0, (event, ped, sp, entered) => {
                TransportMission.onDeliverySphereTrigger(client, event, ped, sp, entered, point);
            }, 0, 6, BLIPCOLOUR_GREEN, true, true);

            sphere.instance.netFlags.defaultExistance = false;
            sphere.blip.netFlags.defaultExistance = false;

            sphere.blip.streamOutDistance = 500000;
            sphere.blip.streamInDistance = 500000;

            sphere.instance.setExistsFor(client, false);
            sphere.blip.setExistsFor(client, false);

            job.deliverySpheres.push(sphere);
        }

        Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.deliveriesMarked', job.cargo);
    }

    static onDeliverySphereTrigger(client, event, ped, sphere, entered, pointData) {
        const player = Player.get(ped);
        if (!player || player.client !== client) return;

        const job = ActiveTransportJobs.get(client.id);
        if (!job) return;

        const locale = player.getLocale();

        if (entered) {
            Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.atDestination', pointData.name);
            job.stopTicks = 0;
            job.currentStopSphere = sphere;
            job.currentDestination = pointData;

            if (job.stopCheckInterval) clearInterval(job.stopCheckInterval);

            job.stopCheckInterval = setInterval(() => {
                if (!client.player || !client.player.vehicle || client.player.vehicle !== job.vehicle) {
                    TransportMission.cancelJob(client, locale.getString('mission.transport.reasonLostVehicle'));
                    return;
                }

                const v = job.vehicle.velocity;
                const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

                if (speed < 0.05) {
                    job.stopTicks++;
                    if (job.stopTicks >= 4) { 
                        TransportMission.completeDelivery(client);
                    }
                } else {
                    if (job.stopTicks > 0) {
                        job.stopTicks = 0;
                        Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.vehicleMoved');
                    }
                }
            }, 500);

        } else {
            if (job.currentStopSphere === sphere) {
                if (job.stopCheckInterval) {
                    clearInterval(job.stopCheckInterval);
                    job.stopCheckInterval = null;
                }
                job.currentStopSphere = null;
                job.currentDestination = null;
                Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.leftDeliveryEarly');
            }
        }
    }

    static completeDelivery(client) {
        const clientId = client.id;
        const player = Player.get(client);
        const job = ActiveTransportJobs.get(clientId);
        if (!job || !job.currentDestination || !job.currentStopSphere) return;

        if (job.stopCheckInterval) {
            clearInterval(job.stopCheckInterval);
            job.stopCheckInterval = null;
        }

        const distance = job.warehousePos.distance(job.currentDestination.pos);
        const distanceBonus = Math.round(distance * DISTANCE_BONUS_PER_METER);
        const totalPayout = DELIVERY_REWARD_BASE + distanceBonus;

        job.cargo--;
        job.totalCompleted++;

        const sphereIndex = job.deliverySpheres.indexOf(job.currentStopSphere);
        if (sphereIndex > -1) {
            job.deliverySpheres.splice(sphereIndex, 1);
        }
        
        job.currentStopSphere.destructor();
        job.currentStopSphere = null;
        job.currentDestination = null;

        earn(client, totalPayout, DELIVERY_XP);
        Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.deliverySuccess', distance.toFixed(1), distanceBonus, totalPayout, job.cargo);

        if (job.totalCompleted % 5 === 0) {
            const locale = Player.get(client).getLocale();
            earn(client, BONUS_REWARD, 0);
            
            Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.streakBonus', job.totalCompleted, BONUS_REWARD);
            triggerNetworkEvent('bigMessage', client, locale.getString('mission.transport.streakBonusBig', BONUS_REWARD), 4000, 5);
        }

        if (job.cargo <= 0) {
            Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.allDelivered');
            TransportMission.cleanSessionTimers(client);
        }

        player.increaseTransports();
    }

    static cancelJob(client, reason) {
        Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.jobCancelled', reason);
        TransportMission.stopJob(client);
    }

    static cleanSessionTimers(client) {
        const job = ActiveTransportJobs.get(client.id);
        if (job) {
            if (job.loadingInterval) clearInterval(job.loadingInterval);
            if (job.stopCheckInterval) clearInterval(job.stopCheckInterval);
            
            if (job.deliverySpheres) {
                job.deliverySpheres.forEach(sphere => {
                    if (sphere) sphere.destructor();
                });
                job.deliverySpheres = [];
            }

            job.loadingInterval = null;
            job.stopCheckInterval = null;
            job.currentStopSphere = null;
        }
    }

    static stopJob(client) {
        TransportMission.cleanSessionTimers(client);
        
        const job = ActiveTransportJobs.get(client.id);
        if (job) {
            if (job.vehicle && job.vehicle.exists) {
                job.vehicle.fix();
                job.vehicle.velocity = new Vec3(0, 0, 0);
                job.vehicle.turnVelocity = new Vec3(0, 0, 0);
            }
            ActiveTransportJobs.delete(client.id);
        }
    }
}

function initTransportMinigame() {
    //TODO: Enable, when GTAC is fixed.
    return;
    TRANSPORT_WAREHOUSES.forEach((warehouse, index) => {
        const sphere = new Sphere(warehouse.pos, 6.0, onPlayerEnterWarehouse, 0, 4, 0, true, false);
        sphere.blip.streamOutDistance = 500000;
        sphere.blip.streamInDistance = 500000;
    });
}

function onPlayerEnterWarehouse(event, ped, sphere, entered) {
    if (!entered || ped.type !== ELEMENT_PLAYER) return;

    const client = getClientFromPlayerElement(ped);
    if (!client || !ped.vehicle || ped.seat !== 0) return;

    const model = ped.vehicle.modelIndex;
    if (!VEHICLE_CAPACITIES[model]) return;

    const clientId = client.id;
    
    if (ActiveTransportJobs.has(clientId)) {
        const job = ActiveTransportJobs.get(clientId);
        if (job.cargo > 0) {
            Locale.sendMessage(client, false, COLOUR_WHITE, 'mission.transport.unfinishedCargo');
            return;
        }
        TransportMission.cleanSessionTimers(client);
    }

    TransportMission.startLoading(client, ped.vehicle);
}

addEventHandler('OnPlayerQuit', (client, reason) => {
    TransportMission.stopJob(client);
});

addCommandHandler('tpos', (command, params, client) => {
    if (client.player) {
        console.log(`{ name: "${params}", pos: new Vec3(${client.player.position.x.toFixed(2)}, ${client.player.position.y.toFixed(2)}, ${client.player.position.z.toFixed(2)}) },`);
    }
});

addEventHandler('OnPedExitedVehicleEx', (event, ped, vehicle, seat) => {
    if (ped.type !== ELEMENT_PLAYER || !vehicle) return;

    const client = getClientFromPlayerElement(ped);
    if (!client) return;

    const job = ActiveTransportJobs.get(client.id);

    if (job && vehicle === job.vehicle) {
        const locale = Player.get(client).getLocale();
        TransportMission.cancelJob(client, locale.getString('mission.transport.reasonLeftVehicle'));
    }
});

addNetworkHandler('onVehicleExplode', function(client, vehicleId) {
    const job = ActiveTransportJobs.get(client.id);
    if (!job) return; 

    const vehicle = getElementFromId(vehicleId);

    if (vehicle && vehicle === job.vehicle) {
        const locale = Player.get(client).getLocale();
        TransportMission.cancelJob(client, locale.getString('mission.transport.reasonVehicleDestroyed'));
    }
});