'use strict';

// Prompt has: window, title, text, accept and decline button
class Prompt {
	constructor(title, message, acceptText, declineText, parentWindow, acceptCallback, declineCallback) {
		this.margin = new Vec2(10, 10);
		this.w = mexui.native.getTextWidth(message, defaultTextStyle['main']) + (this.margin.x * 2);
		this.h = mexui.native.getTextHeight(message, defaultTextStyle['main']) + (this.margin.y) + 30; // Titlebar height is 30px

		if (typeof parentWindow != 'undefined' && parentWindow != null) {
			this.parentWindow = parentWindow;
			this.parentWindow.setShown(false);
		}

		if (typeof acceptCallback != 'undefined' && acceptCallback != null) {
			this.acceptCallback = acceptCallback;
		}

		if (typeof declineCallback != 'undefined' && declineCallback != null) {
			this.declineCallback = declineCallback;
		}

		if (typeof acceptText == 'undefined' || acceptText == null) {
			acceptText = Locale.getString('client.gui.accept');
		}

		if (typeof declineText == 'undefined' || declineText == null) {
			declineText = Locale.getString('client.gui.decline');
		}

		this.window = mexui.window(gta.width/2 - this.w/2, gta.height/2 - this.h/2, this.w, this.h, title, defaultWindowStyle);
		this.window.moveable = true;
		this.window.titleBarIconShown = false;
		this.window.setShown(true);

		this.message = this.window.text(0, 15, this.w, 0, message, defaultTextStyle);
		this.acceptButton = this.window.button(0, this.h - 30, this.w/2, 25, acceptText, defaultAcceptButtonStyle, this.accept.bind(this));
		this.declineButton = this.window.button(this.w/2, this.h - 30, this.w/2, 25, declineText, defaultDeclineButtonStyle, this.decline.bind(this));

		gui.showCursor(true, true);
	}

	accept() {
		gui.showCursor(false, true);

		if (typeof this.parentWindow != 'undefined' && this.parentWindow != null) {
			this.parentWindow.setShown(true);
		}

		if (typeof this.acceptCallback != 'undefined' && this.acceptCallback != null) {
			this.acceptCallback();
		}

		this.window.remove();
		delete this;
	}

	decline() {
		gui.showCursor(false, true);

		if (typeof this.parentWindow != 'undefined' && this.parentWindow != null) {
			this.parentWindow.setShown(true);
		}

		if (typeof this.declineCallback != 'undefined' && this.declineCallback != null) {
			this.declineCallback();
		}

		this.window.remove();
		delete this;
	}
}
