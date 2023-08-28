'use strict';

/*
    Achievement system
*/

const Achievements = [];

class Achievement {
	constructor(name, value, reward, itemReward = null) {
		this.name = name;
		this.value = value;
		this.reward = reward;
		this.itemReward = itemReward;

		Achievements.push(this);
	}

	static check(name, value, client) {
		const i = Achievements.findIndex( (achievement) => achievement.name == name && achievement.value == value );

		if (i != -1) {
			const achievement = Achievements[i];
			const player = Player.get(client);

			if (player) {
				const completion = this.getGroupCompletion(name, value);

				Locale.sendMessage(client, false, COLOUR_WHITE, 'achievement.unlockedMessage', player.getLocale().getString(`achievement.${name}`), completion[0], completion[1]);
				decho(3, client.name + ' has unlocked a ' + locale[0].getString(`achievement.${name}`) + ' achievement!');

				const reward = achievement.reward * value;
				if (reward > 0 ) {
					Locale.sendMessage(client, false, COLOUR_WHITE, 'achievement.rewardMessage', reward);

					updateGlobalStat('completedAchievements', 1, true, true);

					if (achievement.itemReward != null) {
						player.backpack.addItem(client, achievement.itemReward, Item.getDesc(achievement.itemReward));

						Locale.sendMessage(client, false, COLOUR_WHITE, 'inventory.newItem', achievement.itemReward);
					}

					earn(client, reward, false);
				}
			}
		}
	}

	// Return all achievement names (filtered)
	static getFilteredList() {
		const list = [];

		Achievements.forEach((element) => {
			if (!list.find((elemente) => elemente == element.name)) {
				list.push(element.name);
			}
		});

		return list;
	}

	static getGroup(name) {
		const achievementGroup = Achievements.filter( (achievement) => achievement.name == name );

		return achievementGroup;
	}

	static getGroupCompletion(name, value) {
		const achievementGroup = this.getGroup(name);
		let achievementCompleted = achievementGroup.reverse().findIndex( (achievement) => achievement.value <= value );
		achievementCompleted < 0 ? achievementCompleted = 0 : achievementCompleted = achievementGroup.length - achievementCompleted;

		const completion = [achievementCompleted, achievementGroup.length];

		return completion;
	}

	static getGroupNextLevelValueString(name, value) {
		const achievementGroup = this.getGroup(name);
		const groupCompletion = this.getGroupCompletion(name, value);
		let completion;

		if (typeof value == 'undefined') value = 0;

		if (groupCompletion[0] >= groupCompletion[1]) completion = '100%';
		else completion = `${value}/${achievementGroup[groupCompletion[0]].value}`;

		return completion;
	}
}
function initAchievements() {
	// Init Achievements
	new Achievement('infoPickups', 1, earningBase.infoPickupAchievement, 'shoppingbag');
	new Achievement('infoPickups', 10, earningBase.infoPickupAchievement);
	new Achievement('infoPickups', 25, earningBase.infoPickupAchievement);
	new Achievement('infoPickups', 50, earningBase.infoPickupAchievement);
	new Achievement('infoPickups', 500, earningBase.infoPickupAchievement);

	new Achievement('sentMessages', 1, earningBase.chatAchievement, 'water');
	new Achievement('sentMessages', 500, earningBase.chatAchievement);
	new Achievement('sentMessages', 1000, earningBase.chatAchievement);
	new Achievement('sentMessages', 5000, earningBase.chatAchievement);
	new Achievement('sentMessages', 10000, earningBase.chatAchievement);

	new Achievement('topSpree', 5, earningBase.spree);
	new Achievement('topSpree', 10, earningBase.spree, 'vest');
	new Achievement('topSpree', 20, earningBase.spree);
	new Achievement('topSpree', 35, earningBase.spree);
	new Achievement('topSpree', 50, earningBase.spree);

	new Achievement('kills', 1, earningBase.kill);
	new Achievement('kills', 10, earningBase.kill);
	new Achievement('kills', 100, earningBase.kill, 'vest');
	new Achievement('kills', 1000, earningBase.kill);
	new Achievement('kills', 5000, earningBase.kill);

	new Achievement('deaths', 1, 0);
	new Achievement('deaths', 10, 0, 'apple');
	new Achievement('deaths', 100, 0);
	new Achievement('deaths', 1000, 0);
	new Achievement('deaths', 5000, 0);

	new Achievement('suicides', 1, 0);
	new Achievement('suicides', 10, 0);
	new Achievement('suicides', 100, 0);
	new Achievement('suicides', 1000, 0);
	new Achievement('suicides', 5000, 0);

	new Achievement('jackedVehicles', 1, earningBase.jack);
	new Achievement('jackedVehicles', 10, earningBase.jack, 'water');
	new Achievement('jackedVehicles', 100, earningBase.jack);
	new Achievement('jackedVehicles', 1000, earningBase.jack);
	new Achievement('jackedVehicles', 5000, earningBase.jack);

	new Achievement('hiddenPackages', 10, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 20, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 30, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 40, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 50, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 60, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 70, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 80, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 90, earningBase.hiddenPackage, 'shoppingbag');
	new Achievement('hiddenPackages', 100, earningBase.hiddenPackage, 'suitcase');

	new Achievement('convoys', 1, earningBase.convoyAchievement);
	new Achievement('convoys', 10, earningBase.convoyAchievement, 'vest');
	new Achievement('convoys', 25, earningBase.convoyAchievement);
	new Achievement('convoys', 50, earningBase.convoyAchievement);
	new Achievement('convoys', 500, earningBase.convoyAchievement, 'vest');

	new Achievement('quests', 1, earningBase.questAchievement);
	new Achievement('quests', 10, earningBase.questAchievement, 'apple');
	new Achievement('quests', 25, earningBase.questAchievement);
	new Achievement('quests', 50, earningBase.questAchievement);
	new Achievement('quests', 500, earningBase.questAchievement);

	new Achievement('mileage', 1, earningBase.mileageAchievement);
	new Achievement('mileage', 100, earningBase.mileageAchievement, 'apple');
	new Achievement('mileage', 250, earningBase.mileageAchievement);
	new Achievement('mileage', 500, earningBase.mileageAchievement);
	new Achievement('mileage', 1000, earningBase.mileageAchievement, 'vest');

	new Achievement('onlineTime', 30, earningBase.onlineAchievement, 'water');
	new Achievement('onlineTime', 60, earningBase.onlineAchievement, 'apple');
	new Achievement('onlineTime', 120, earningBase.onlineAchievement);
	new Achievement('onlineTime', 240, earningBase.onlineAchievement);
	new Achievement('onlineTime', 1200, earningBase.onlineAchievement, 'vest');

	new Achievement('level', 2, earningBase.levelAchievement, 'water');
	new Achievement('level', 5, earningBase.onlineAchievement, 'apple');
	new Achievement('level', 10, earningBase.onlineAchievement, 'apple');
	new Achievement('level', 30, earningBase.onlineAchievement, 'vest');
	new Achievement('level', 60, earningBase.onlineAchievement, 'vest');

	new Achievement('headshots', 10, earningBase.headshots);
	new Achievement('headshots', 50, earningBase.headshots);
	new Achievement('headshots', 100, earningBase.headshots);
	new Achievement('headshots', 200, earningBase.headshots, 'water');
	new Achievement('headshots', 500, earningBase.headshots, 'vest');
}
