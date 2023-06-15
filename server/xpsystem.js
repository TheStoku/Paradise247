'use strict';
// Source: https://dustinpfister.github.io/2020/04/27/js-javascript-example-exp-system/

const XP = (function() {
	const DEFAULTS = {
		level: 1,
		xp: 0,
		cap: 60,
		deltaNext: 100,
	};
	// set level with given xp
	const set = function(xp, deltaNext) {
		return (1 + Math.sqrt(1 + 8 * xp / deltaNext)) / 2;
	};
	// get exp to the given level with given current_level and xp
	const getXPtoLevel = function(level, deltaNext) {
		return ((Math.pow(level, 2) - level) * deltaNext) / 2;
	};
	const parseByXP = function(xp, cap, deltaNext) {
		xp = xp === undefined ? DEFAULTS.xp : xp;
		cap = cap === undefined ? DEFAULTS.cap : cap;
		deltaNext = deltaNext === undefined ? DEFAULTS.deltaNext : deltaNext;
		let l = set(xp, deltaNext);
		l = l > cap ? cap : l;
		const level = Math.floor(l);
		let forNext = getXPtoLevel(level + 1, deltaNext);
		forNext = l === cap ? Infinity : forNext;
		const toNext = l === cap ? Infinity : forNext - xp;
		const forLast = getXPtoLevel(level, deltaNext);
		return {
			level: level,
			levelFrac: l,
			xp: xp,
			per: (xp - forLast) / (forNext - forLast),
			forNext: forNext,
			toNext: toNext,
			forLast: forLast,
		};
	};
	return {
		parseByLevel: function(l, cap, deltaNext) {
			l = l === undefined ? DEFAULTS.level : l;
			deltaNext = deltaNext === undefined ? DEFAULTS.deltaNext : deltaNext;
			const xp = getXPtoLevel(l, deltaNext);
			console.log(xp);
			return parseByXP(xp, cap, deltaNext);
		},
		parseByXP: parseByXP,
	};
}());
