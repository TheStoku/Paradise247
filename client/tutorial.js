const tutorials = [
	{
		message: 'Welcome to Paradise 247 tutorial!',
		camera: new Vec3(-1242.15, -382.68, 54.67),
		lookAt: new Vec3(-1088.57, -528.70, 54.59),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'You can play convoy missions with Securicar.',
		camera: new Vec3(1016.29, -670.27, 14.82),
		lookAt: new Vec3(1014.19, -684.29, 14.97),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'And manage your bank account.',
		camera: new Vec3(1016.29, -670.27, 14.82),
		lookAt: new Vec3(1027.35, -688.44, 14.96),
		time: 5000,
		jumpCut: false,
	},
	{
		message: 'Bank and convoy missions are also available on Staunton Island.',
		camera: new Vec3(186.29, -948.06, 26.02),
		lookAt: new Vec3(168.79, -961.50, 26.25),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'You can also look for hidden packages around the map.',
		camera: new Vec3(1275.67, -247.53, 40.62),
		lookAt: new Vec3(1288.05, -247.50, 42.83),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'Collect Info Pickups to complete achievements.',
		camera: new Vec3(884.85, -504.39, 14.97),
		lookAt: new Vec3(884.53, -526.11, 16.59),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'Or visit ammunations to buy weapons (WIP).',
		camera: new Vec3(1050.21, -399.82, 14.82),
		lookAt: new Vec3(1071.44, -400.07, 15.25),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'Fight on /dojo (arenas).',
		camera: new Vec3(1286.84, -90.95, 16.77),
		lookAt: new Vec3(1327.42, -64.98, 14.82),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'Use /backpack and items system.',
		camera: new Vec3(-1096.98, -586.43, 11.10),
		lookAt: new Vec3(-1091.27, -579.48, 10.94),
		time: 5000,
		jumpCut: true,
	},
	{
		message: 'Items are granted for completing quests or achievements.',
		camera: new Vec3(-1096.98, -586.43, 11.10),
		lookAt: new Vec3(-1091.27, -579.48, 10.94),
		time: 5000,
		jumpCut: true,
	},
];

let tutorialId = 0;
let tutorialTimeout = null;
let storedPos = null;
let storedChat = typeof chatWindowEnabled != undefined ? chatWindowEnabled : false;
let storedHud = true;
let storedWeather = null;
let snd = null;

function playTutorialLoop() {
	enabledStats = false;
	setChatWindowEnabled(false);
	setHUDEnabled(false);
	gta.forceWeather(WEATHER_SUNNY);

	smallMessage(tutorials[tutorialId].message, tutorials[tutorialId].time, 1);
	localPlayer.position = tutorials[tutorialId].camera;
	gta.setCameraLookAt(tutorials[tutorialId].camera, tutorials[tutorialId].lookAt, tutorials[tutorialId].jumpCut);

	if (snd) natives.REMOVE_SOUND(snd);
	snd = natives.ADD_CONTINUOUS_SOUND(tutorials[tutorialId].camera, 32);

	tutorialTimeout = setTimeout(function() {
		if (tutorialId < tutorials.length) {
			playTutorialLoop();
			tutorialId++;
		} else {
			tutorialId = 0;
			clearTimeout(tutorialTimeout);
			setChatWindowEnabled(storedChat);
			setHudState(storedHud);
			enabledStats = true;
			localPlayer.position = storedPos;
			gta.forceWeather(storedWeather);
			gta.restoreCamera(false);
			gta.setPlayerControl(true);
			localPlayer.invincible = false;
			dashboard.toggle();
		}
	}, tutorials[tutorialId].time);
}

function playTutorial() {
	// storedChat = chatWindowEnabled;
	storedHud = true;
	storedPos = localPlayer.position;
	storedWeather = gta.weather;
	gta.setPlayerControl(false);
	localPlayer.invincible = true;

	playTutorialLoop();
}

function stopTutorial() {
	unbindKey(SDLK_SPACE);
}
