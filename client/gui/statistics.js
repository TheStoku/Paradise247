"use strict";

let lastKeyPress = sdl.ticks;
let tick = sdl.ticks;
let iFPS = 0;
let fps = 0;
let enabledStats = true;

addEventHandler("OnDrawnHUD", (event) => {
    //return;
    if (!enabledStats) return;
    if (typeof localPlayer == "undefined" || typeof localClient == "undefined") return;
    if (!focus) return;
    if (spawnScreen && spawnScreen.isEnabled && dashboard && dashboard.isShown) return;
    if (localClient.getData("isLoggedIn") == -1) return;
    // Count FPS
    if (sdl.ticks - tick < 1000) fps++;
	else { iFPS = fps; tick = sdl.ticks; fps = 0; }

    let col = toColour(0, 0, 0, 50);//);
    drawing.drawRectangle(null, [0, gta.height - 30], [gta.width, 30], col, col, col, col);
    
    let kills = localClient.getData("kills");
    let deaths = localClient.getData("deaths");
    let bankMoney = localClient.getData("bank");
    let sessionTime = Number(localClient.getData("sessionTime"));

    localPlayer.money = Number(localClient.getData("money"));
    
    // v-scoreboard variable.
    let ping = localClient.getData("v.ping");
    let date = new Date();
    let formattedDate = date.toLocaleDateString('pl-PL') + " | " + date.toLocaleTimeString('pl-PL').slice(0, 5);

    myFont3.render(`🎯Bank: $${bankMoney} | Kills: ${kills} | Deaths: ${deaths} | Ratio: ${killDeathRatio(kills, deaths).toFixed(2)} | Session Time: ${toHoursAndMinutes(sessionTime)}`, [0, gta.height - 27], gta.width, 0.01, 0.0, 16, COLOUR_ORANGE, true, true, false, false);
    myFont3.render(formattedDate, [0, gta.height - 27], gta.width, 0.99, 0.0, 16, COLOUR_SILVER, true, true, false, false);
    myFont3.render(`Ping: ${ping} | FPS: ${iFPS}`, [0, 5], gta.width, 0.99, 0.0, 14, COLOUR_ORANGE, true, true, false, true);
});