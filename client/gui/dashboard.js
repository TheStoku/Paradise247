'use strict';

let dashboard = null;

class Dashboard {
	constructor() {
		this.isShown = false;
		// TODO: move this feed into database, it shouldn't be hardcoded here.
		// this.feed = "04.05: Mileage, online time, dodo flight time and more!\n19.04: Added convoy mission.\n22.02: Added GUI dashboard!\n21.02: Implemented locale for client side scripts.";
		this.feed = '10.07.25 Major fixes.\n29.08.23 Added race mode and hotfixes.\n01.06.23 Server open for public test!';

		this.w = 500;
		this.h = 400;
		this.margin = 50;

		this.mainWindow = mexui.window(0, 0, gta.width, gta.height, '', dashboardBackgroundStyle);
		this.mainWindow.preventMove = true;
		this.mainWindow.titleBarShown = false;
		this.mainWindow.moveable = false;
		this.mainWindow.setShown(this.isShown);

		this.welcomeText = this.mainWindow.text(0, 0, gta.width, 50, Locale.getString('client.gui.welcomeMessage', 'Paradise247'), dashboardLogoStyle);

		this.newsFeed = this.mainWindow.text(this.margin, 100, gta.width, 100, Locale.getString('client.gui.newsFeed', this.feed), newsTextStyle);

		// TODO: Add clock/date?
		// this.clock = this.mainWindow.time(gta.width - 200, 100, 150, 40, null, newsTextStyle, null);

		this.dashboardWindow = mexui.window(this.margin, 250, gta.width/2, gta.height/2, Locale.getString('client.gui.dashboardWindowTitle'), dashboardWindowStyle);
		this.dashboardWindow.moveable = false;
		this.dashboardWindow.titleBarIconShown = false;
		this.dashboardWindow.setShown(this.isShown);
		this.dashboardText = this.dashboardWindow.text(5, -20, gta.width/2 - 10, gta.height/2, '', dashTextStyle);

		this.questWindow = mexui.window(this.margin * 2 + gta.width/2, 250, gta.width/2, 50, Locale.getString('client.gui.questWindowTitle'), dashboardWindowStyle);
		this.questWindow.moveable = false;
		this.questWindow.titleBarIconShown = false;
		this.questWindow.setShown(this.isShown);
		this.questText = this.questWindow.text(5, -20, gta.width/2 - 10, gta.height/2, '', dashTextStyle);

		this.toggleButton = this.mainWindow.button(gta.width/2 - 150, gta.height - 100, 300, 30, Locale.getString('client.gui.letsRoll'), joinButtonStyle, this.toggle.bind(this));
	}

	generateDashString() {
		let message = '';
		const joins = localClient.getData('joins');
		const money = localClient.getData('money');
		const bank = localClient.getData('bank');
		const kills = localClient.getData('kills');
		const deaths = localClient.getData('deaths');
		const suicides = localClient.getData('suicides');
		const kdRatio = killDeathRatio(kills, deaths).toFixed(2);

		// "line1" : "Name: {1} | Game ID: {2} | Joins: {3}",
		message = newLineConcat(message, Locale.getString('client.gui.dashboardText.line1', localPlayer.name, localClient.index, joins));

		// "line2" : "Money: {1} | Bank money: {2}",
		message = newLineConcat(message, Locale.getString('client.gui.dashboardText.line2', money, bank));

		// "line3" : "Kills: {1} | Deaths: {2} | K/D Ratio: {3} | Suicides: {4}"
		message = newLineConcat(message, Locale.getString('client.gui.dashboardText.line3', kills, deaths, kdRatio, suicides) + '\n');

		// "progressMessage1" : "Your achievements progress:",
		message = newLineConcat(message, Locale.getString('achievement.progressMessage1'));

		// "progressMessage2" : "{1} achievement: {2}/{3} [{4}]",
		message = newLineConcat(message, this.generateAchivementsString());

		return message;
	}

	generateAchivementsString() {
		let output = '';

		Achievement.getFilteredList().forEach((element) => {
			const groupCompletion = Achievement.getGroupCompletion(element, localClient.getData(element));
			const nextLevel = Achievement.getGroupNextLevelValueString(element, localClient.getData(element));

			output = newLineConcat(output, '* ' + Locale.getString('achievement.progressMessage2', Locale.getString(`achievement.${element}`), groupCompletion[0], groupCompletion[1], nextLevel));
		});

		return output;
	}

	refresh() {
		if (typeof this.dashboardText == 'undefined') return;

		this.dashboardText.text = this.generateDashString();

		// Update window height
		this.dashboardWindow.size.x = mexui.native.getTextWidth(this.dashboardText.text, dashTextStyle['main']) + 20;
		this.dashboardWindow.size.y = mexui.native.getTextHeight(this.dashboardText.text, dashTextStyle['main']) + 30 + 15;
	}

	toggle() {
		// Uncomment that TODO: experimental check
		if (localClient.getData('isLoggedIn') < 1 ) return;

		this.isShown = !this.isShown;
		this.refresh();

		gui.showCursor(this.isShown, !this.isShown);
		setChatWindowEnabled(!this.isShown);
		setHudState(!this.isShown);
		

		this.mainWindow.setShown(this.isShown);
		this.dashboardWindow.setShown(this.isShown);

		if (this.mainWindow.isShown() == false && spawnScreen.isEnabled) spawnScreen.enter();
	}
}

function newLineConcat(string1, string2) {
	return string1.concat(string2 + '\n');
}

bindEventHandler('OnResourceReady', thisResource, function(event, resource) {
	dashboard = new Dashboard();

	bindKey(SDLK_F1, KEYSTATE_DOWN, function(e) {
		dashboard.toggle();
	});
});