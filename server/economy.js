'use strict';

// TODO: Cleanup and refactor.
const earningBase = {
	kill: 100,
	death: 10,
	infoPickupAchievement: 100,
	chatAchievement: 100,
	hiddenPackage: 200,
	spree: 100,
	jack: 10,
	convoy: 200,
	quest: 250,
	race: 400,
	convoyAchievement: 100,
	raceAchievement: 100,
	questAchievement: 100,
	mileageAchievement: 100,
	onlineAchievement: 100,
	levelAchievement: 100,
	headshots: 100,
};

const xpBase = {
	race: 50,
	kill: 50,
	infoPickupAchievement: 50,
	chatAchievement: 10,
	hiddenPackage: 150,
	spree: 100,
	jack: 5,
	convoy: 100,
};

const inflation = 1.0;
const playerBonus = 5 * getClients().length; // more online players, more earnings.
const totalServerEarning = 0;

function calculateEarning(value) {
	const baseEarning = value * inflation;
	const totalEarning = baseEarning + playerBonus;
	return totalEarning;
}

const MAX_LEVEL = 60;

function earn(client, value, xp) {
	const earning = calculateEarning(value);

	const player = Player.get(client);

	updateGlobalStat('totalEarning', earning, true, true);

	// TODO: store overall earnings, calculate earning/h
	player.setMoney(earning, true);

	if (xp) {
		if (typeof xp == 'boolean') {
			earnXp(client, earning / 10);
		} else if (!isNaN(xp)) {
			earnXp(client, xp);
		}
	}

	return earning;
}

function earnXp(client, value) {
	const player = Player.get(client);

	player.setXp(value, true);

	const parsedXp = XP.parseByXP(player.db.xp);
	Locale.sendMessage(client, false, COLOUR_ORANGE, 'gainedXpMessage', value, player.db.xp, parsedXp.forNext, parsedXp.level);
	triggerNetworkEvent('smallMessage', client, player.getLocale().getString('GainedXp', value), 2000, 2);
}
