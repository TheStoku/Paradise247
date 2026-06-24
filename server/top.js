'use strict';

/*
    Top stats system, it is a cancer, and it's a bit bugged. Needs refactoring.
*/

const TOP_DEFINES = ['kills', 'deaths', 'suicides', 'topSpree', 'sentMessages', 'joins', 'jackedVehicles', 'xp', 'dodoFlightTime', 'mileage', 'onlineTime', 'convoys', 'hiddenPackages', "races"];
const TOP_COMMAND_DEFINES = ['kills', 'deaths', 'suicides', 'spree', 'messages', 'joins', 'jacks', 'xp', 'dodo', 'mileage', 'online', 'convoys', "packages", "races"];
const TOP_UNITS = [null, null, null, null, null, null, null, null, 's', 'km', 'min'];

const topDB = {
	'kills': [],
	'deaths': [],
	'suicides': [],
	'topSpree': [],
	'sentMessages': [],
	'joins': [],
	'jackedVehicles': [],
	'xp': [],
	'dodoFlightTime': [],
	'mileage': [],
	'onlineTime': [],
	'convoys': [],
	'hiddenPackages': [],
	'races': [],
};

function loadTopScores() {
	TOP_DEFINES.forEach((element) => {
		topDB[element] = []; // Empty arrays.
		loadTopScoresQuery(element);
		// console.log(element);
	});
}


function printTop(client, key) {
	if (key == '') {
		Locale.sendMessage(client, false, COLOUR_RED, 'printTopCategories', TOP_COMMAND_DEFINES.toString());
	} else {
		const i = TOP_COMMAND_DEFINES.findIndex((element) => element == key.toLowerCase());

		i != -1 ? generateTop(client, i) : Locale.sendMessage(client, false, COLOUR_RED, 'topDoesntExist');
	}
}

function generateTop(client, index) {
	const key = TOP_DEFINES[index];
	const unit = TOP_UNITS[index] != null ? TOP_UNITS[index] : '';

	const combinedStats = new Map();

	if (topDB[key]) {
		topDB[key].forEach(player => {
			combinedStats.set(player.id, { ...player });
		});
	}

	Players.forEach((element) => {
		if (typeof element != 'undefined' && element != null && element.db && element.db.id) {
			combinedStats.set(element.db.id, {
				id: element.db.id,
				name: element.name,
				[key]: element.db[key] || 0
			});
		}
	});

	const topArray = Array.from(combinedStats.values());

	topArray.sort((a, b) => b[key] - a[key]);

	const limit = 10;
	const top = topArray.slice(0, limit);

	Locale.sendMessage(client, false, COLOUR_ORANGE, 'topMessage1', TOP_COMMAND_DEFINES[index]);

	top.forEach((element, idx) => {
		const message = `${idx + 1}. ${element.name}: ${element[key]}${unit}`;
		Locale.sendMessage(client, false, COLOUR_YELLOW, 'topMessage2', message);
	});
}