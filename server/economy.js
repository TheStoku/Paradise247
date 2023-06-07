"use strict";

// TODO: Cleanup and refactor.
const earningBase = {
    kill : 100,
    death : 10,
    infoPickupAchievement: 100,
    chatAchievement: 100,
    hiddenPackage : 200,
    spree: 100,
	jack: 10,
    convoy: 200,
    quest: 250,
    convoyAchievement: 100,
    questAchievement: 100,
    mileageAchievement: 100,
    onlineAchievement: 100,
    levelAchievement: 100
}

const xpBase = {
    kill : 50,
    infoPickupAchievement: 50,
    chatAchievement: 10,
    hiddenPackage : 150,
    spree: 100,
	jack: 5,
    convoy: 100
}

let inflation = 1.0;
let playerBonus = 5 * getClients().length ; // more online players, more earnings.
let totalServerEarning = 0;

function calculateEarning(value) {
    let baseEarning = value * inflation;
    let totalEarning = baseEarning + playerBonus;
    return totalEarning;
}

const MAX_LEVEL = 60;

function earn(client, value, xp) {
    let earning = calculateEarning(value);
    
    let player = Player.get(client);
    
    updateGlobalStat("totalEarning", earning, true, true);

    // TODO: store overall earnings, calculate earning/h
    player.setMoney(earning, true);

    if (xp) {
        if (typeof xp == "boolean") {
            earnXp(client, earning / 10);
        } else if (!isNaN(xp)) {
            earnXp(client, xp);
        }
    }

    return earning;
}

function earnXp(client, value) {
    let player = Player.get(client);

    player.setXp(value, true);

    let parsedXp = XP.parseByXP(player.db.xp);
    Locale.sendMessage(client, false, COLOUR_ORANGE, "gainedXpMessage", value, player.db.xp, parsedXp.forNext, parsedXp.level);
    triggerNetworkEvent("smallMessage", client, player.getLocale().getString("GainedXp", null, null, null, null, value), 2000, 2);
}