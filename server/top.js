"use strict";

/*
    Top stats system, it is a cancer, and it's a bit bugged. Needs refactoring.
*/

const TOP_DEFINES = [ "kills", "deaths", "suicides", "topSpree", "sentMessages", "joins", "jackedVehicles", "xp", "dodoFlightTime", "mileage", "onlineTime" ];
const TOP_COMMAND_DEFINES = [ "kills", "deaths", "suicides", "spree", "messages", "joins", "jacks", "xp", "dodo", "mileage", "online" ];
const TOP_UNITS = [ null, null, null, null, null, null, null, null, "s", "km", "min" ];

let topDB = {
	"kills" : [],
	"deaths" : [],
	"suicides" : [],
	"topSpree" : [],
	"sentMessages" : [],
	"joins" : [],
	"jackedVehicles" : [],
	"xp" : [],
	"dodoFlightTime" : [],
	"mileage": [],
	"onlineTime": []
};

function loadTopScores() {
	TOP_DEFINES.forEach((element) => {
		topDB[element] = [];	// Empty arrays.
		loadTopScoresQuery(element);
		//console.log(element);
	});
}


function printTop(client, key) {
	if (key == "") {
		Locale.sendMessage(client, false, COLOUR_RED, "printTopCategories", TOP_COMMAND_DEFINES.toString());
	} else {
		let i = TOP_COMMAND_DEFINES.findIndex((element) => element == key.toLowerCase());

		if (i != -1) {
			generateTop(client, i);
		} else {
			Locale.sendMessage(client, false, COLOUR_RED, "topDoesntExist");
		}
	}
}

function generateTop(client, index) {
	let key = TOP_DEFINES[index];
    let top = [];
	let unit = TOP_UNITS[index] != null ? TOP_UNITS[index] : "";
    
    for(let i = 0; i < topDB[key].length; i++) {
        let buffer = topDB[key][i];
        
		// Create top of current game stats
		Players.find((element) => {
			if (typeof element != "undefined" && element != null) {
				if (element.db.id === topDB[key][i].id) {
					console.log(`[TOP] matched: ${topDB[key][i].id} / ${element.db.id}`);

					topDB[key][i][key] = element.db[key];

					buffer = topDB[key][i];
				}
			}
		});
        
        top.push(buffer);
    }
    
	Locale.sendMessage(client, false, COLOUR_ORANGE, "topMessage1", TOP_COMMAND_DEFINES[index]);

    top.forEach((element, index) => {
		let message = `${index+1}. ${element.name}: ${element[key]}${unit}`;

		Locale.sendMessage(client, false, COLOUR_YELLOW, "topMessage2", message);
    });
}