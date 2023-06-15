'use strict';

const logoText = 'Paradise 247';

bindEventHandler('OnResourceReady', thisResource, function(event, resource) {
	if (pricedown) return;

	const fontStream = openFile('pricedown.ttf');

	if (fontStream != null) {
		var pricedown = lucasFont.createFont(fontStream, 22.0);
		fontStream.close();
	}
});

addEventHandler('OnDrawnHUD', (event) => {
	// return;
	if (!focus || !pricedown) return;
	if (spawnScreen && spawnScreen.isEnabled && dashboard && dashboard.isShown && !pricedown) return;

	const col = toColour(0, 0, 0, 50);
	pricedown.render(logoText, [0, gta.height - 70], gta.width, 0.01, 0.0, 18, col, true, true, true, false);
});
