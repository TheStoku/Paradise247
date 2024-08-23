'use strict';

// Register/login window
class LoginWindow {
	constructor(type) {
		this.type = type;
		this.title = '';

		// Player is unregistered, show register window, otherwise login one.
		if (this.type == -1) {
			this.title = Locale.getString('client.gui.registerWingowTitle');
			this.buttonCaption = Locale.getString('client.gui.registerButton');
			this.action = this.register;
		} else if (this.type == 0) {
			this.title = Locale.getString('client.gui.loginWindowTitle');
			this.buttonCaption = Locale.getString('client.gui.loginButton');
			this.action = this.login;
		}

		// Count window size
		this.margin = new Vec2(10, 10);

		this.w = gta.width/4;
		this.h = 80;


		this.window = mexui.window(gta.width/2 - this.w/2, gta.height/2 - this.h/2, this.w, this.h, this.title, defaultWindowStyle);
		this.window.moveable = false;
		this.window.titleBarIconShown = false;
		this.window.setShown(true);

		this.label = this.window.text(this.margin.x, this.margin.y, this.w/4, 25, Locale.getString('client.gui.passwordText'), defaultTextStyle);
		this.input = this.window.password(this.w/4 + 10, this.margin.y, (this.w - this.w/4) - 25, 25, '', textInputStyle);
		this.button = this.window.button(0, this.h - 30, this.w, 25, this.buttonCaption, defaultAcceptButtonStyle, this.action.bind(this));

		// Hotfix?
		if (Locale.getString('client.gui.registerWingowTitle') != "undefined" || Locale.getString('client.gui.loginWindowTitle') != "undefined") {
			setChatWindowEnabled(false);
			setHudState(false);
			gui.showCursor(true, false);
		}
	}

	login() {
		const password = this.input.getText();

		if (!this.checkPassword(password)) return;

		triggerNetworkEvent('gui.loginButtonEvent', password.toString());

		this.close();
		dashboard.toggle();
	}

	register() {
		const password = this.input.getText();
		if (!this.checkPassword(password)) return;

		triggerNetworkEvent('gui.registerButtonEvent', password.toString());
		this.close();
		dashboard.toggle();
	}

	checkPassword(password) {
		// Check if password is defined and it's length is okay.
		if (typeof password == 'undefined' || password.length < 4) {
			gui.showCursor(true, false);
			const title = Locale.getString('client.gui.error');
			const message = Locale.getString('client.gui.passwordTooShort');
			const closeButton = Locale.getString('client.gui.closeButton');

			new Popup(title, message, closeButton, this.window);
			return false;
		} else return true;
	}

	close() {
		this.window.remove();
		delete this;
	}
}
