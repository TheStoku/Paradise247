'use strict';

let pricedown = null;
let isSpawnScreenReady = false;
const myFont = lucasFont.createDefaultFont(14.0, 'Roboto', 'Light');

class SpawnScreen {
	constructor() {
		this.isEnabledNextTime = true;
		this.isEnabled = false;
		this.skinSelection = 0;
		this.weaponSelection = 0;
		this.spawns = 0;
		this.weapons = [];
		this.numberOfSpawns = Spawn.length + 1;
		this.numberOfWeapons = this.weapons.length + 1;
	}
	static get isEnabled() {
		return this.isEnabled;
	}
	static set isEnabled(value) {
		this.isEnabled = value;
	}

	static get skinSelection() {
		return this.skinSelection;
	}
	static set skinSelection(value) {
		this.skinSelection = value;
	}

	static get weaponSelection() {
		return this.weaponSelection;
	}
	static set weaponSelection(value) {
		this.weaponSelection = value;
	}

	right() {
		this.skinSelection < this.numberOfSpawns ? this.skinSelection++ : this.skinSelection = 0; this.weaponSelection = 0; this.update(true);
	}
	left() {
		this.skinSelection > 0 ? this.skinSelection-- : this.skinSelection = this.numberOfSpawns; this.weaponSelection = 0; this.update(true);
	}

	up() {
		this.weaponSelection < this.numberOfWeapons ? this.weaponSelection++ : this.weaponSelection = 0; this.update(false);
	}
	down() {
		this.weaponSelection > 0 ? this.weaponSelection-- : this.weaponSelection = this.numberOfWeapons; this.update(false);
	}

	update(fade) {
		if (typeof Spawn.get(this.skinSelection) != 'undefined') {
			if (fade) gta.fadeCamera(true, 1.0, 1);

			setHudState(true);

			this.numberOfWeapons = this.weapons.length - 1; // Update number of weapons
			localPlayer.position = Spawn.get(this.skinSelection).position;
			localPlayer.heading = Spawn.get(this.skinSelection).heading;
			localPlayer.invincible = true;

			gta.setCameraLookAt(Spawn.get(this.skinSelection).camera, localPlayer.position, false);

			const skin = Spawn.get(this.skinSelection).skin;

			setSkin(skin);

			if (gta.game <= 4) {
				gta.playFrontEndSound(82, 1.0);
			} else {
				localPlayer.changeBodyPart(0, 0, 0);
				localPlayer.changeBodyPart(1, 0, 0);
				localPlayer.changeBodyPart(2, 0, 0);
			}

			this.armSelectedWeapon();
		}
	}

	getSpawnScreenWeapons(weaponSelect) {
		const weapons = [];

		for (const i in weaponSelect) {
			if (weaponSelect[i] > 0) {
				weapons.push(Number(i));
			}
		}

		return weapons;
	}

	armSelectedWeapon() {
		this.weapons = [...this.getSpawnScreenWeapons(Spawn.get(this.skinSelection).weaponSelect)];
		const selectedWeaponId = Number(this.weapons[this.weaponSelection]);

		localPlayer.clearWeapons();
		localPlayer.giveWeapon(selectedWeaponId, Number(Spawn.get(this.skinSelection).weaponSelect[selectedWeaponId]), true);
	}

	armDefaultWeapons() {
		// Arm with default weapons set
		const defaultWeapons = [...Spawn.get(this.skinSelection).weaponSet];

		for (const i in defaultWeapons) {
			if (defaultWeapons[i] > 0) {
				localPlayer.giveWeapon(Number(i), Spawn.get(this.skinSelection).weaponSet[i], true);
			}
		}

		localPlayer.giveWeapon(0, 1, true);
	}

	spawn() {
		if (localClient.getData('isLoggedIn') < 1) {
			message(Locale.getString('SpawnForbidden'), COLOUR_RED);
			return;
		}

		const spawn = Spawn.get(this.skinSelection);
		const teamLevel = spawn.team.level;
		const xp = Number(localClient.getData('xp'));

		if (teamLevel > XP.parseByXP(xp).level) {
			message(Locale.getString('lockedTeam'), COLOUR_RED);
			return;
		}

		this.isEnabled = false;
		gta.setPlayerControl(true);
		gta.restoreCamera(false);

		setSkin(spawn.skin);

		localPlayer.heading = spawn.heading;
		localPlayer.health = 100.0;

		triggerNetworkEvent('onPlayerSpawn', this.skinSelection, this.weaponSelection);
		triggerNetworkEvent('onPlayerSkinChange', this.skinSelection);

		this.armDefaultWeapons();
		antiSpawnkillProtection();

		if (this.spawns < 1) playTutorial();

		this.spawns++;

		return;
	}

	enter() {
		if (this.isEnabledNextTime) {
			this.isEnabled = true;
			gta.setPlayerControl(false);
			this.update(true);
		} else {
			this.update(true);
			this.spawn();
		}
	}

	toggle(showMessage) {
		this.isEnabledNextTime = !this.isEnabledNextTime;

		if (showMessage) {
			const msg = this.isEnabledNextTime ? Locale.getString('SpawnscreenEnabled') : Locale.getString('SpawnscreenDisabled');
			message(msg);
		}
	}
}

function setSkin(skinId) {
	if (gta.game <= 4) {
		localPlayer.skin = skinId;
	} else {
		if (natives.isModelInCdimage(skinId)) {
			natives.requestModel(skinId);
			natives.loadAllObjectsNow();

			if (natives.hasModelLoaded(skinId)) {
				natives.changePlayerModel(natives.getPlayerId(), skinId);
			}
		}
	}
}

addEventHandler('onKeyDown', (event, virtualKey, physicalKey, keyModifiers) => {
	if (spawnScreen.isEnabled && dashboard && dashboard.mainWindow && !dashboard.mainWindow.isShown()) {
		// Rotate skins
		if (virtualKey == SDLK_RIGHT) {
			spawnScreen.right();
		} else if (virtualKey == SDLK_LEFT) {
			spawnScreen.left();
		}
		// Rotate weapons
		else if (virtualKey == SDLK_UP) {
			spawnScreen.up();
		} else if (virtualKey == SDLK_DOWN) {
			spawnScreen.down();
		}
		// Spawn
		else if (virtualKey == SDLK_RETURN) {
			spawnScreen.spawn();
		} else return;
	}
});

const spawnScreen = new SpawnScreen();

bindEventHandler('OnResourceReady', thisResource, function(event, resource) {
	console.log('Initing Spawnscreen.js');

	const fontStream = openFile('files/pricedown.ttf');

	if (fontStream != null) {
		pricedown = lucasFont.createFont(fontStream, 28.0);
		fontStream.close();
	}

	initSpawns();

	bindKey(SDLK_F4, KEYSTATE_DOWN, function(e) {
		spawnScreen.toggle(true);
	});

	isSpawnScreenReady = true;

	console.log('Inited Spawnscreen.js', COLOUR_LIME);
});

addEventHandler('OnDrawnHUD', (event) => {
	// return;
	if (!focus) return;
	if (spawnScreen && spawnScreen.isEnabled && dashboard && !dashboard.isShown && isConnected) {
		const spawn = Spawn.get(spawnScreen.skinSelection);
		// let teamColor = spawn.team.color; // GTAC font doesn't render colourcodes.
		const teamName = spawn.team.name;
		const teamLevel = spawn.team.level;
		const xp = Number(localClient.getData('xp'));
		const gangCarName = getVehicleNameFromModelId(spawn.team.car);
		const selectedWeaponName = weaponNames[gta.game][Number(spawnScreen.weapons[spawnScreen.weaponSelection])];

		// TODO: Maybe switch to mexui?
		if (pricedown) {
			pricedown.render(
				`Team: ${teamName}\nGang Car: ${gangCarName}\nPrimary weapon: ${selectedWeaponName}`,
				[0, gta.height / 3.5], // Vec2 position
				gta.width, // width
				0.05, // align
				0.0, // justify
				pricedown.size, // size
				COLOUR_WHITE, // colour
				true, // word wrap
				true, // colour codes
				false, // ignore colour codes
				true); // shadow
			if (teamLevel > XP.parseByXP(xp).level) {
				pricedown.render(`UNLOCK AT LEVEL ${teamLevel}`,
					[0, gta.height/2],
					gta.width,
					0.5,
					0.0,
					pricedown.size,
					COLOUR_RED,
					true,
					true,
					false,
					true);
			}
		}
		myFont.render(
			'Use Left/Right arrows to select class.\nUse Up/Down arrows to select primary weapon.\nPress \'Enter\' for spawn.',
			[0, gta.height / 3.5],
			gta.width,
			0.9,
			0.0,
			myFont.size,
			COLOUR_WHITE,
			true,
			true,
			false,
			true);
	}
});
