"use strict";

const FOLLOW_EXPIRATION_TIME = 15000; // 15s

let teleports = [];

let follow = {
    "client" : null,
    "position" : null,
    "heading" : null
};

function goTo(client, type, params) {
    if (type == "stop") {
        triggerNetworkEvent("goTo", client, type);
        return true;
    }
    if (params.length == 0) makeList(client, "teleports", teleports, true);
    else {
        let target = getClientFromParams(params);

        if (target) {
            Locale.sendMessage(null, false, COLOUR_WHITE, type, `${COL_ORANGE}${client.name}`, target.player.name);
            triggerNetworkEvent("goTo", client, type, target.player.position);
            return true;
        }

        let i = null;

        if (!isNaN(params)) {
            i = params;
        } else {
            i = teleports.findIndex( teleports => teleports.name == params.toString() );
        }
        
        if (i >= 0) {
            Locale.sendMessage(null, false, COLOUR_WHITE, type, `${COL_ORANGE}${client.name}`, teleports[i].name);

            let position = new Vec3(teleports[i].x, teleports[i].y, teleports[i].z)
            let heading = teleports[i].heading;

            triggerNetworkEvent("goTo", client, type, position);
            return true;
        }
    }
}

function teleport(client, params) {
    if (params.length == 0) makeList(client, "teleports", teleports, true);
    else {
        let target = getClientFromParams(params);

        if (target) {
            if (target == client) {
                Locale.sendMessage(client, false, COLOUR_WHITE, "teleportToPlayerError");
            } else {
                Player.get(client).teleport(target.player.position, target.player.heading);
                Locale.sendMessage(null, false, COLOUR_WHITE, "teleportToPlayerMessage", `${COL_ORANGE}${client.name}`, target.name);
                return;
            }
        }

        let i = null;

        if (!isNaN(params)) {
            i = params;
        } else {
            i = teleports.findIndex( teleports => teleports.name == params.toString() );
        }
        
        if (i >= 0) {
            Locale.sendMessage(null, false, COLOUR_WHITE, "teleportMessage", `${COL_ORANGE}${client.name}`, teleports[i].name);

            let position = new Vec3(teleports[i].x, teleports[i].y, teleports[i].z)
            let heading = teleports[i].heading;

            Player.get(client).teleport(position, heading);

            setFollow(client, position, heading);

            setTimeout(function() {
                setFollow(null, null, null);
            }, FOLLOW_EXPIRATION_TIME);

            return true;
        }
    }
}

function setFollow(client,position,heading) {
    follow.client = client;
    follow.position = position;
    follow.heading = heading;
}

function goFollow(client) {
    if (!follow.position) {
        Locale.sendMessage(client, false, COLOUR_ORANGE, "teleportExpired");
        return false;
    } else {
        if (client == follow.client) {
            Locale.sendMessage(client, false, COLOUR_ORANGE, "teleportError");
            return false;
        }

        Locale.sendMessage(client, false, COLOUR_ORANGE, "teleportFollow", follow.client.name);

        client.player.position = follow.position;
        client.player.heading = follow.heading;
    }
}