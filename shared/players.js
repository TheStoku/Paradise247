'use strict';

const MAX_PLAYERS = 50; // isServer ? server.maxClients : 1;
const MAX_LOGIN_FAILS = 5;
const Players = Array.apply(null, Array(MAX_PLAYERS)).map(function() {});

class Player {
	constructor(client) {
		this.client = client;
		this.db = {};
		this.db.locale = 0;
		this.backpack = new BackPack();
		this.trackCreator = new TrackCreator(client);
		this.session = {
			failedLogin: 0,
			time: 0,
			blip: null,
			kills: 0,
			spree: 0,
			deaths: 0,
			isMuted: false,
			vehicle: null,
			suicides: 0,
			headshots: 0,
			races: 0,
			wonRaces: 0,
			lastMessage: '',
			lastVehicle: null,
			questRepeats: 0,
			storedPosition: new Vec3(0.0, 0.0, 0.0),
			storedHeading: 0.0,
			storedDimension: 0,
		};

		// Store spawned vehicle instance by player.
		this.vehicle = null;

		client.setData('isLoggedIn', -1);
		client.setData('isSpawned', false);
		client.setData('team', 0);
		client.setData('dojo', null, true);

		// Init values for v-scoreboard.
		client.setData('kills', 0, true);
		client.setData('deaths', 0, true);
		client.setData('money', 0, true);
		client.setData('sessionKills', 0, true);
		client.setData('sessionDeaths', 0, true);

		client.setData('spawnType', 0);

		// This step is necessary for GTA3/VC
		spawnPlayer(client, Spawn.get(0).position, Spawn.get(0).heading, Spawn.get(0).skin);
		gta.fadeCamera(client, true);

		// The player isn't fully spawned yet, so change dimension to spawnscreen.
		client.player.dimension = client.index + 1000;

		// Setup database store interval
		this.saveInterval = setInterval(function() {
			savePlayerData(client);
		}, STORE_DATABASE_TIME);

		this.onlineTimer = setInterval(() => {
			this.updateOnlineTime();
		}, 1000 * 60);

		log(`new Player(ID: ${client.index}, Name: ${client.name})`, Log.DEBUG);
	}

	destructor() {
		log(`~Player(ID: ${this.client.index}, Name: ${this.client.name})`, Log.DEBUG);

		// Destroy vehicle spawned by player (if exists).
		if (this.vehicle) {
			destroyElement(this.vehicle);
		}

		if (this.session.blip) {
			destroyElement(this.session.blip);
		}

		// Then delete player store interval and his object.
		clearInterval(this.saveInterval);
		delete this;
	}

	static get(client) {
		if (!client) return null;

		// If we pass player element, then we need to find a client one, as we are basing on client index.
		if (client.type == ELEMENT_PLAYER) {
			client = getClientFromPlayerElement(client);
		}

		return Players[client.index];
	}

	getLocale() {
		if (typeof this.db == 'undefined') {
			log(`Player.getLocale(ID: ${this.client.index}, Name: ${this.client.name}) - undefined.`, Log.ERROR);

			return locale[0];
		} else return locale[this.db.locale];
	}

	setLanguage(param) {
		if (param != 'undefined') {
			const language = localeFiles.findIndex( (locale) => locale == param.toString() );

			if (language != -1) {
				this.db.locale = language;

				Locale.sendMessage(this.client, false, COLOUR_WHITE, 'account.settings.setLanguage', param);
			} else {
				Locale.sendMessage(this.client, false, COLOUR_WHITE, 'account.settings.setLanguageError', param);
			}
		}
	}

	checkAccount() {
		if (isNameRegisteredQuery(this.client.name)) {
			// Autologin by IP matching.
			if (checkIPQuery(this.client)) this.completeLogin();
			else {
				this.client.setData('isLoggedIn', 0, true);
				Locale.sendMessage(this.client, false, COLOUR_RED, 'account.pleaseLogin', this.client.name);
			}
		} else Locale.sendMessage(this.client, false, COLOUR_RED, 'account.notRegistered', this.client.name);
	}

	register(password) {
		// Check if player is already logged in.
		if (this.client.getData('isLoggedIn') == 1) {
			Locale.sendMessage(this.client, false, COLOUR_LIME, 'account.alreadyLoggedIn');

			return;
		}

		// Check if name is registered or not.
		if (isNameRegisteredQuery(this.client.name)) {
			Locale.sendMessage(this.client, false, COLOUR_RED, 'account.pleaseLogin', this.client.name);

			log(`User ${this.client.name} is trying to register to an existing account.`, Log.WARNING);
		} else if (registerAccountQuery(this.client.name, password, this.client.ip)) {
			Locale.sendMessage(this.client, false, COLOUR_GREEN, 'account.registerSuccess', this.client.name);

			log(`User ${this.client.name} has been registered successfully.`, Log.INFORMATION);

			// Login automatically after registering new account.
			this.completeLogin();
		}
	}

	passwordLogin(password) {
		// Check if player is already logged in.
		if (this.client.getData('isLoggedIn') == 1) {
			Locale.sendMessage(this.client, false, COLOUR_LIME, 'account.alreadyLoggedIn');

			return;
		}

		if (checkPasswordQuery(this.client.name, password)) {
			this.completeLogin();
		} else {
			if (this.session.failedLogin < MAX_LOGIN_FAILS - 1) {
				this.session.failedLogin++;
				loginWindow(this.client, 0);
				Locale.sendMessage(this.client, false, COLOUR_RED, 'account.incorrectPassword');
				log(`User ${this.client.name} has used an incorrect password.`, Log.WARNING);
			} else {
				kick(null, `${this.client.name} Password`);
				log(`User ${this.client.name} has used an incorrect password for ${MAX_LOGIN_FAILS} times. Kicking player.`, Log.WARNING);
			}
		}
	}

	completeLogin() {
		// Load user data
		if (loadPlayerDataQuery(this.client)) {
			this.db.ip = this.client.ip;
			this.db.joins++;
			serverData.totalJoins++;

			// Set administrator
			if (this.db.level == 10) this.client.administrator = true;

			// Setup hidden packages
			if (typeof this.db.packages[thisGame] != 'undefined') {
				this.db.packages[thisGame].forEach((element, index) => {
					if (element == 1) {
						// if (typeof Package.get(index) == "undefined") log("Undef: " + index.toString());
						Package.get(index).pickup.setExistsFor(this.client, false);
					}
				});
			} else {
				console.log('Error while loading packages at line 247. Setting fresh packages array.');

				this.db.packages[thisGame] = [null,
					Array(100).fill(0),
					Array(100).fill(0),
					Array(100).fill(0),
					Array(100).fill(0),
					Array(200).fill(0)];
			}

			this.client.setData('isLoggedIn', 1, true);
			this.updateClientData();

			let countryName = null;
			let continentName = null;

			try {
				countryName = module.geoip.getCountryName('GeoLite2-Country.mmdb', this.client.ip);
				continentName = module.geoip.getContinentName('GeoLite2-Country.mmdb', this.client.ip);
			} catch (error) {
				console.error(error);

				countryName = 'Localhost';
				continentName = 'Space';
			}

			printMessage(this.client, 'join', countryName, continentName);

			const lastSeen = new Date(this.db.last_seen * 1000);
			const lastLogin = lastSeen.toLocaleDateString('pl-PL') + ' ' + lastSeen.toLocaleTimeString('pl-PL');

			Locale.sendMessage(this.client, false, COLOUR_WHITE, 'account.loginSuccess', lastLogin);

			triggerNetworkEvent('setInitialData', this.client, this.db.team, this.db.weaponSelect, this.db.spawns);
			// triggerNetworkEvent('toggleDashboard', this.client);

			// Print active quest.
			Quest.print(this.client, null);

			// Add timeout, to let dashboard be fully loaded.
			setTimeout(() => {
				toggleDashboard(this.client);
			}, 4500);
		}
	}

	setSpawnType(type) {
		if (type.length == 0) Locale.sendMessage(this.client, false, COLOUR_WHITE, 'SpawnTypeHelp', this.db.spawnType);
		else {
			type = Number(type[0]);

			if (type <= 4) {
				this.db.spawnType = type;
				this.client.setData('spawnType', type, true);
				Locale.sendMessage(this.client, false, COLOUR_WHITE, 'SetSpawnType', type);
			}
		}
	}

	updateClientData() {
		// General
		this.client.setData('adminLevel', this.db.adminLevel, true);
		this.client.setData('warnings', this.db.warnings, true);
		this.client.setData('joins', this.db.joins, true);
		this.client.setData('kills', this.db.kills, true);
		this.client.setData('deaths', this.db.deaths, true);
		this.client.setData('suicides', this.db.suicides, true);
		this.client.setData('money', this.db.cash, true);
		this.client.setData('bank', this.db.bank, true);
		this.client.setData('dojo', null, true);
		this.client.setData('onlineTime', this.db.onlineTime, true);
		this.client.setData('sessionTime', this.session.time, true);
		this.client.setData('xp', this.db.xp, true);

		// Achievements
		this.client.setData('infoPickups', this.db.infoPickups, true);
		this.client.setData('topSpree', this.db.topSpree, true);
		this.client.setData('jackedVehicles', this.db.jackedVehicles, true);
		this.client.setData('sentMessages', this.db.sentMessages, true);
		this.client.setData('hiddenPackages', Package.count(this.client), true);
		this.client.setData('convoys', this.db.convoys, true);
		this.client.setData('quests', this.db.quests, true);
		this.client.setData('mileage', this.db.mileage, true);
		this.client.setData('races', this.db.races, true);
		this.client.setData('wonRaces', this.db.wonRaces, true);
		this.client.setData('level', XP.parseByXP(this.db.xp).level, true);
		this.client.setData('headshots', this.db.headshots, true);

		// Stored spawnscreen data
		this.client.setData('team', this.db.team, true);
		this.client.setData('weaponSelect', this.db.weaponSelect, true);
		this.client.setData('spawnType', this.db.spawnType, true);
	}

	useItem(item) {
		if (this.backpack.hasItem(item)) {
			this.backpack.removeItem(item);
			Item.use(this.client, item);
			Locale.sendMessage(this.client, false, COLOUR_WHITE, 'inventory.useItem', this.backpack.items.length, this.backpack.size);
		} else {
			this.backpack.getItems(this.client);
		}
	}

	increaseKills() {
		serverData.totalKills++;
		this.db.kills++;
		this.session.kills++;
		this.session.spree++;

		// Check for kills achievement
		Achievement.check('kills', this.db.kills, this.client);

		Quest.check(this.client, 'kill');

		// Killing Spree bonus
		if (this.session.spree % 5 == 0) {
			const reward = earningBase.spree * this.session.spree;

			Locale.sendMessage(null, false, COLOUR_WHITE, 'KillingSpree', this.client.name, this.session.spree);
			Locale.sendMessage(this.client, false, COLOUR_GREEN, 'KillingSpreeBonus', reward);

			if (this.db.topSpree < this.session.spree) {
				this.db.topSpree = this.session.spree;

				this.client.setData('topSpree', this.db.spree);
				Achievement.check('topSpree', this.session.spree, this.client);
			}

			// this.setMoney(reward, true);
			earn(this.client, reward, xpBase.spree);
		}
		this.client.setData('kills', this.db.kills);
		this.client.setData('sessionKills', this.session.kills);
	}

	increaseDeaths() {
		serverData.totalDeaths++;
		this.db.deaths++;
		this.session.deaths++;
		this.session.spree = 0;
		this.client.setData('deaths', this.db.deaths);
		this.client.setData('sessionDeaths', this.session.deaths);

		// Check for deaths achievement
		Achievement.check('deaths', this.db.deaths, this.client);

		this.setMoney(earningBase.death, false);
	}

	increaseSuicides() {
		serverData.totalSuicides++;
		this.db.suicides++;
		this.session.suicides++;
		this.session.spree = 0;
		this.client.setData('suicides', this.db.suicides);

		// Check for suicides achievement
		Achievement.check('suicides', this.db.suicides, this.client);

		// this.setMoney(earningBase.death, false);
	}

	increaseHeadshots() {
		this.db.headshots++;
		this.session.headshots++;
		this.client.setData('headshots', this.db.headshots);

		// Check for suicides achievement
		Achievement.check('headshots', this.db.headshots, this.client);
	}

	increaseMileage(inc) {
		const newMileage = ((Number(inc)/1000) + Number(this.db.mileage)).toFixed(2);

		if (Math.floor(this.db.mileage) != Math.floor(newMileage)) {
			// Check for mileage achievement
			Achievement.check('mileage', Math.floor(newMileage), this.client);
		}

		// Update player mileage
		this.db.mileage = newMileage;
		this.client.setData('mileage', newMileage);
	}

	increaseRaces(position) {
		this.db.races++;
		this.session.races++;
		this.client.setData('races', this.db.races);

		if (position > 1) {
			earn(this.client, earningBase.race / position, xpBase.race / position);
		}

		Achievement.check('races', this.db.races, this.client);
	}

	increaseWonRaces() {
		this.db.wonRaces++;
		this.session.wonRaces++;
		this.client.setData('wonRaces', this.db.wonRaces);

		earn(this.client, earningBase.race, xpBase.race);
		Achievement.check('wonRaces', this.db.wonRaces, this.client);
	}

	updateOnlineTime() {
		this.db.onlineTime++;
		this.session.time++;
		this.client.setData('onlineTime', this.db.onlineTime);
		this.client.setData('sessionTime', this.session.time);

		Achievement.check('onlineTime', this.db.onlineTime, this.client);
	}

	setXp(amnout, increment) {
		if (amnout != null) {
			const oldLevel = XP.parseByXP(this.db.xp).level;
			updateGlobalStat('totalXp', amnout, false, true);
			increment == null ? this.db.xp = amnout : increment ? this.db.xp += amnout : this.db.xp -= amnout;
			this.client.setData('xp', this.db.xp, true);

			const newLevel = XP.parseByXP(this.db.xp).level;

			if (oldLevel != newLevel) {
				Locale.sendMessage(this.client, false, COLOUR_WHITE, 'levelUp', newLevel);
				decho(4, this.client.name + ' has leveled up to ' + newLevel + '!');
				Achievement.check('level', newLevel, this.client);
			}
		}
	}

	getMoney() {
		return this.db.cash;
	}

	setMoney(amnout, increment) {
		if (amnout != null) {
			increment == null ? this.db.cash = amnout : increment ? this.db.cash += amnout : amnout > this.db.cash ? this.db.cash = 0 : this.db.cash -= amnout;
			this.client.setData('money', this.db.cash);
		}
	}

	getBankMoney() {
		return this.db.bank;
	}

	setBankMoney(amnout, increment) {
		if (amnout != null) {
			increment == null ? this.db.bank = amnout : increment ? this.db.bank += amnout : this.db.bank -= amnout;
			this.client.setData('bank', this.db.bank);
		}
	}

	teleport(position, heading = 0.0, gently = true) {
		if (gently) {
			gta.fadeCamera(this.client, false, 1.0, 0);

			setTimeout(function(client) {
				client.player.position = position;
				triggerNetworkEvent('setPlayerHeading', client, heading);
				gta.fadeCamera(client, true, 1.0, 0);
			}, 900, this.client);
		} else {
			this.client.player.position = position;
			triggerNetworkEvent('setPlayerHeading', this.client, heading);
		}
	}
}
