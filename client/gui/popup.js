"use strict";

// Popup has: window, title, text, button
class Popup {
    constructor(title, message, buttonText, parentWindow, callback) {
        this.margin = new Vec2(10, 10);
        this.w = mexui.native.getTextWidth(message, defaultTextStyle['main']) + (this.margin.x * 2);
        this.h = mexui.native.getTextHeight(message, defaultTextStyle['main']) + (this.margin.y) + 30; // Titlebar height is 30px

        console.log(this.w.toString());
        console.log(this.h.toString());

        if (typeof parentWindow != "undefined" && parentWindow != null) {
            this.parentWindow = parentWindow;
            this.parentWindow.setShown(false);
        }

        if (typeof callback != "undefined" && callback != null) {
            this.callback = callback;
        }

        if (typeof buttonText == "undefined" || buttonText == null) {
            buttonText = Locale.getString("client.gui.okButton");
        }

        this.window = mexui.window(gta.width/2 - this.w/2, gta.height/2 - this.h/2, this.w, this.h, title, defaultWindowStyle);
        this.window.moveable = true;
        this.window.titleBarIconShown = false;
        this.window.setShown(true);

        this.message = this.window.text(0, 15, this.w, 0, message, defaultTextStyle);
        this.button = this.window.button(0, this.h - 30, this.w, 25, buttonText, defaultAcceptButtonStyle, this.close.bind(this));

        gui.showCursor(true, true);
    }

    close() {
        gui.showCursor(false, true);

        if (typeof this.parentWindow != "undefined" && this.parentWindow != null) {
            this.parentWindow.setShown(true);
        }

        if (typeof this.callback != "undefined" && this.callback != null) {
            this.callback();
        }

        this.window.remove();
        delete this;
    }
}

let popupWindowStyle = {
    main: {
        //backgroundColour: toColour(0, 0, 0, 100),
        //backgroundColour: toColour(0, 0, 0, 0),
        backgroundColour: toColour(0, 0, 255, 20),
        //textColour: toColour(255, 255, 255, 255),
        /*hover: {
            backgroundColour: toColour(0, 0, 0, 150),
            //textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0
        },
        
        focus : {
            backgroundColour: toColour(0, 0, 0, 150),
            transitionTime: 500,
            transitionDelay: 0
        }*/
        focus: {
            borderColour: toColour(0, 0, 0, 0)
        }
    },
    title:
    {
        //backgroundColour:	toColour(0, 0, 0, 50),
        backgroundColour:	toColour(218, 128, 0, 150),
        textColour:			toColour(255, 255, 255, 200),
        textAlign: 0.5
    }
}

let popupTextStyle = {
    main: {
        textColour: toColour(255, 255, 255, 200),
        textAlign: 0.5,
        textSize: 14.0,
        lineWeight: 1,
        textFont: 'Roboto'
        //textAlign: center,
        /*hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
    }
}

let popupButtonStyle = {
    main: {
        textColour: toColour(255, 255, 255, 255),
        backgroundColour: toColour(255, 255, 255, 50),
        textAlign: 0.5,
        textSize: 14.0,
        textFont: 'Roboto',
        /*hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 200, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
    }
}