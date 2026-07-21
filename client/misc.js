function playSound(i) {
	natives.PLAY_MISSION_AUDIO(int)
	//natives.PLAY_MISSION_PASSED_TUNE(int)
	gta.playFrontEndSound(Number(i), 1.0);
	//94 cp
	//147 count
	//148 cd finish
	//156 disconnect
	//160 connect
}
addCommandHandler('snd', (command, params, client) => {
	gta.playFrontEndSound(Number(params), 1.0);
});

addCommandHandler('snd1', (command, params, client) => {
	natives.PLAY_MISSION_AUDIO(Number(params));
});

addCommandHandler('snd2', (command, params, client) => {
	natives.PLAY_MISSION_PASSED_TUNE(Number(params));
});

addNetworkHandler('playFrontEndSound', (i, time) => {
	if (gta.game <=4) gta.playFrontEndSound(Number(i), Number(time));
	//147 count
	//148 cd finish
	//156 disconnect
	//160 connect
});