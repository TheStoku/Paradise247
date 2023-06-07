"use strict";

// Colours for chat messages.
const COL_DEFAULT = "[#FFFFFF]";
const COL_DEFAULT2 = "[#ffd200]";
const COL_GREEN = "[#60ff00]";
const COL_ORANGE = "[#ff7700]";
const CO_RED = "[#ff3900]";
//const COLOUR_GREEN = "[#ffc100]";

// Log levels.
const TAG = "\x1b[33m[Paradise] \x1b[0m";
const Log = { ALL : 5, DEBUG : 4, VERBOSE : 3, INFORMATION : 2, WARNING : 1, ERROR : 0 };
const LOG_LEVEL = Log.DEBUG;
const LOG_LEVEL_DEFAULT = Log.DEBUG;

let disconnectReasons = [
	"Lost Connection",
	"Disconnected",
	"Unsupported Client",
	"Wrong Game",
	"Incorrect Password",
	"Unsupported Executable",
	"Disconnected",
	"Banned",
	"Failed",
	"Invalid Name",
	"Crashed",
	"Modified Game"
];

function log(message, level = LOG_LEVEL_DEFAULT, tag = true) {
    if (level <= LOG_LEVEL) console.log(`${TAG}${message}`);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

function isCorrectJson(json) {
    try {
        JSON.parse(json);
        return true;
    }
    catch (e) {
        return false;
    }
}

function executionTime(func) {
    let start = platform.ticks;
    func();
    return platform.ticks - start;
}

//Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, match, replacement){
	return str.replace(new RegExp(escapeRegExp(match), 'g'), ()=>replacement);
}