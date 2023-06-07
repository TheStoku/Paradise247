"use strict";

let focus = true;

bindEventHandler("OnResourceReady", thisResource, function (event, resource) {
    // Temporary disabled due to GTAC crash caused by createBuilding.
    /*bindKey(SDLK_F2, KEYSTATE_DOWN, function(e) {
        spawnRamp();
    });*/
});

addEventHandler("OnLostFocus", (event) => {
    focus = false;
});

addEventHandler("OnFocus", (event) => {
    focus = true;
});

function timeNow() {
    var d = new Date(),
    h = (d.getHours()<10?'0':'') + d.getHours(),
    m = (d.getMinutes()<10?'0':'') + d.getMinutes();
    
    return h + ':' + m;
}

let ramp = null;

function spawnRamp() {
    if (ramp == null) {
        ramp = gta.createBuilding(1378); //1033
    }

    let position = localPlayer.position;
    if(localPlayer.vehicle) position = localPlayer.vehicle.position;
    ramp.heading = localPlayer.heading - degToRad(90.0);
    ramp.position = getPosInFrontOfPos(position, localPlayer.heading, 5.0);
}

function antiSpawnkillProtection() {
    localPlayer.invincible = true;

    setTimeout(() => {
        localPlayer.invincible = false;
    }, 3000);
}

addNetworkHandler("popup", (title, message, buttonText, parentWindow, callback) => {
    new Popup(title, message, buttonText, parentWindow, callback);
});

//Source: https://bobbyhadz.com/blog/javascript-convert-minutes-to-hours-and-minutes
function toHoursAndMinutes(totalMinutes) {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
  
    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}
  
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}