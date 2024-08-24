'use strict';

let focus = true;

bindEventHandler('OnResourceReady', thisResource, function(event, resource) {
	
	// Stadium models
	/*let txd = openFile(`files/stadium/comstadium.txd`, false);
	if(txd != null) {
		game.loadTXD(`comstadium.txd`, txd);
		txd.close();
	}	
	
    
	let dff = openFile(`files/stadium/Clnm_stadium.dff`, false);
	if(dff != null) {
		game.loadDFF(1952, dff);
		dff.close();
	}*/
	
	
	// Temporary disabled due to GTAC crash caused by createBuilding.
	/* bindKey(SDLK_F2, KEYSTATE_DOWN, function(e) {
        spawnRamp();
    });*/
});

addEventHandler('OnLostFocus', (event) => {
	focus = false;
});

addEventHandler('OnFocus', (event) => {
	focus = true;
});

function timeNow() {
	const d = new Date();
	const h = (d.getHours()<10?'0':'') + d.getHours();
	const m = (d.getMinutes()<10?'0':'') + d.getMinutes();

	return h + ':' + m;
}

let ramp = null;

function spawnRamp() {
	if (ramp == null) {
		ramp = gta.createBuilding(1378); // 1033
	}

	let position = localPlayer.position;
	if (localPlayer.vehicle) position = localPlayer.vehicle.position;
	ramp.heading = localPlayer.heading - degToRad(90.0);
	ramp.position = getPosInFrontOfPos(position, localPlayer.heading, 5.0);
}

function antiSpawnkillProtection() {
	localPlayer.invincible = true;

	setTimeout(() => {
		localPlayer.invincible = false;
	}, 3000);
}

addNetworkHandler('popup', (title, message, buttonText, parentWindow, callback) => {
	new Popup(title, message, buttonText, parentWindow, callback);
});

addNetworkHandler('loginWindow', (isLoggedIn) => {
	new LoginWindow(isLoggedIn);
});

addNetworkHandler('toggleDashboard', () => {
	if (dashboard) {
		dashboard.toggle();
	}
});

addNetworkHandler('setWinter', (enabled) => {
	snow.enabled = enabled;
	snow.bumpiness = enabled;
	forceSnowing(enabled);

	if (enabled == true) { 
		snow.addFlakes();
	} else {
		snow.clearFlakes();
	}
});

// Source: https://bobbyhadz.com/blog/javascript-convert-minutes-to-hours-and-minutes
function toHoursAndMinutes(totalMinutes) {
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);

	return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}

function padTo2Digits(num) {
	return num.toString().padStart(2, '0');
}
/*
function loadStadiumCol() {
    let col = openFile(`files/stadium/Clnm_stadium.col`, false);
	if(col != null) {
		game.loadCOL(col, 0);
		col.close();
	}
}
*/
// Thanks, Jack!
// Disabled for crashing when changing island
/*
let onLevel2 = false;

function CheckForLevelChange()
{
  if (natives.IS_COLLISION_IN_MEMORY(2) && !onLevel2)
  {
    onLevel2 = true;
    setImmediate(loadStadiumCol); // load COL files for level 2!
  }
  else if (onLevel2)
  {
    onLevel2 = false;
  }
}

addEventHandler('OnProcess', (event,deltaTime) => {
    CheckForLevelChange();
});*/