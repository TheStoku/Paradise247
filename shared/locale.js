'use strict';

const localeFiles = ['en', 'pl'];
const locale = [];

function loadLocales() {
	log(`Loading locale files.`, Log.INFORMATION);

	for (const i of localeFiles) {
		const file = loadTextFile(`shared/locale/${i}.json`);

		if (file != null) {
			new Locale(JSON.parse(file));
		}
	}
}

// Check if it's server or client side script
if (typeof httpGet !== 'undefined') {
	bindEventHandler('OnResourceStart', thisResource, function(event, resource) {
		loadLocales();
	});
} else {
	bindEventHandler("OnResourceReady", thisResource, function(event, resource) {
		loadLocales();
	});
}

class Locale {
	constructor(text) {
		this.text = text;
		this.id = locale.push(this);

		console.log(TAG + `Loaded ${this.text.general.localeName} [${this.id}/${localeFiles.length}].`);
	}

	getLocaleString(stringName) {
		try {
			stringName = stringName.split('.');

			let output = this.text;
			for (let i = 0; i < stringName.length; i++) {
				output = output[stringName[i]];
			}

			if (typeof output != 'undefined') {
				return output;
			} else return `Error: missing ${stringName} string in translation.`;
		} catch (error) {
			for (let index = 0; index <= 7; index++) {
				message('We have encountered an error. Please /reconnect', COLOUR_RED);
			}
		}
	}

	getString(stringName, ...args) {
		// console.log(stringName);
		if (!args) {
			return this.getLocaleString(stringName);
		} else {
			let string = this.getLocaleString(stringName);

			for (let i = 0; i < args.length; i++) {
				string = string.replace(`{${i+1}}`, args[i]);
			}

			return string;
		}
	}

	static getString(...args) {
		try {
			return locale[0].getString(...args);
		} catch (error) {
			for (let index = 0; index <= 7; index++) {
				message('We have encountered an error. Please /reconnect', COLOUR_RED);
			}
		}
	}

	/**
	 * Send chat message
	 * @param {Object} client or null (to all).
	 * @param {Boolean} exceptClient if client is specified and set to true, the message will be sent to all players except client.
	 * @param {Number} colour
     * @param {String} stringName from JSON language file
	 */
	static sendMessage(client, exceptClient, colour, stringName, ...args) {
		// log(stringName, Log.ALL);

		// To all clients or to all clients, excluding 'client'.
		if (client == null || exceptClient) {
			getPlayers().forEach((player) => {
				const clientId = getClientFromPlayerElement(player);

				if (exceptClient == true && client && clientId == client) return;

				const clientLocale = Player.get(clientId).getLocale();

				messageClient(clientLocale.getString(stringName, ...args), clientId, colour);
			});
		} else {
			// Private message to single client.
			const player = Player.get(client);

			if (player) {
				const clientLocale = player.getLocale();
				messageClient(clientLocale.getString(stringName, ...args), client, colour);
			}
		}
	}
}
