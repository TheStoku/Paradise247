"use strict";

const WEATHER_TIME = 9; // Set every X min + 1.
const MAX_WEATHER = 3;
let weather = null;

class Weather {
    constructor() {
        this.weatherTime = 0;
        this.nextWeather = getRandomInt(MAX_WEATHER);
        this.previousWeather = 0;
        
        this.set();
    }

    set(admin, id, time) {
        this.weatherTime = time ? Number(time) : 1000 * 60 * (getRandomInt(WEATHER_TIME) + 1); // +1 to hotfix 0 multiplier in case of random int 0.
        // Store previous weather.
        this.previousWeather = gta.weather;

        // Set game weather to the next weather from previous method run or to id set by admin.
        id ? gta.forceWeather(Number(id)) : gta.weather = this.nextWeather;

        // Set to other weather, not the same as current one.
        let nextRandom = (MAX_WEATHER);
        while (gta.weather == nextRandom) {
            nextRandom = getRandomInt(MAX_WEATHER);
        }

        // Store the weather for next run.
        this.nextWeather = nextRandom;
        
        // Send locale messages
        this.announce(admin);

        if (this.timer) clearTimeout(this.timer);
        
        this.timer = setTimeout(() => {
            this.set();
        }, this.weatherTime);
    }

    // TODO: implementation.
    setNext(id) {
        this.nextWeather = id;
        
        message(`Next weather has been set to ${getWeatherName(this.nextWeather)}.`);
    }

    announce(admin = null) {
        if (admin != null) {
            Locale.sendMessage(null, false, COLOUR_WHITE, "weather.changeByAdmin", getWeatherName(this.previousWeather), getWeatherName(gta.weather), admin.name);
            log(`Weather::set() - From: ${getWeatherName(this.previousWeather)} to ${getWeatherName(gta.weather)}. Upcoming: ${getWeatherName(this.nextWeather)}, delay: ${this.weatherTime/60/1000}`, Log.DEBUG);
        }
        else {
            Locale.sendMessage(null, false, COLOUR_WHITE, "weather.changeByScript", getWeatherName(this.previousWeather), getWeatherName(gta.weather));
            log(`Weather::changeWeather() - From: ${getWeatherName(this.previousWeather)} to ${getWeatherName(gta.weather)}. Upcoming: ${getWeatherName(this.nextWeather)}, delay: ${this.weatherTime/60/1000}`, Log.DEBUG);
        }
        Locale.sendMessage(null, false, COLOUR_WHITE, "weather.upcoming", getWeatherName(this.nextWeather), this.weatherTime/60/1000);
    }
}