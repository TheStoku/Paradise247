'use strict';

let tick = sdl.ticks;
let iFPS = 0;
let fps = 0;
let enabledStats = true;
const myFont3 = lucasFont.createDefaultFont(14.0, 'Arial', 'Bold');

addEventHandler('OnDrawnHUD', (event) => {
	// return;
	if (!enabledStats) return;
	if (isPhotoModeEnabled) return;
	if (typeof localPlayer == 'undefined' || typeof localClient == 'undefined') return;
	if (!focus) return;
	if (spawnScreen && spawnScreen.isEnabled && dashboard && dashboard.isShown) return;
	if (localClient.getData('isLoggedIn') == -1) return;
	// Count FPS
	if (sdl.ticks - tick < 1000) fps++;
	else {
		iFPS = fps; tick = sdl.ticks; fps = 0;
	}

	const col = toColour(0, 0, 0, 50);// );
	drawing.drawRectangle(null, [0, gta.height - 30], [gta.width, 30], col, col, col, col);

	const kills = localClient.getData('kills');
	const deaths = localClient.getData('deaths');
	const bankMoney = localClient.getData('bank');
	const sessionTime = Number(localClient.getData('sessionTime'));

	localPlayer.money = Number(localClient.getData('money'));

	// v-scoreboard variable.
	const ping = localClient.getData('v.ping');
	const date = new Date();
	const formattedDate = date.toLocaleDateString('pl-PL') + ' | ' + date.toLocaleTimeString('pl-PL').slice(0, 5);

	if (myFont3) {
		myFont3.render(
			`🎯Bank: $${bankMoney} | Kills: ${kills} | Deaths: ${deaths} | Ratio: ${killDeathRatio(kills, deaths).toFixed(2)} | Session Time: ${toHoursAndMinutes(sessionTime)}`,
			[0, gta.height - 27],
			gta.width,
			0.01,
			0.0,
			16,
			COLOUR_ORANGE,
			true,
			true,
			false,
			false);

		myFont3.render(formattedDate,
			[0, gta.height - 27],
			gta.width,
			0.99,
			0.0,
			16,
			COLOUR_SILVER,
			true,
			true,
			false,
			false);

		myFont3.render(
			`Ping: ${ping} | FPS: ${iFPS}`,
			[0, 5],
			gta.width,
			0.99,
			0.0,
			14,
			COLOUR_ORANGE,
			true,
			true,
			false,
			true);
	}
});
