'use strict';

/*
    Quests system
*/

const Quests = [];

class Quest {
	constructor(task, repeats, reward, target = null, type = null, itemReward = null) {
		this.task = task;
		this.repeats = repeats;
		this.reward = reward;
		this.target = target;
		this.type = type;
		this.itemReward = itemReward;
		
		this.id = Quests.length;
		Quests.push(this);
	}

	static check(client, task, target = null, type = null) {
		const player = Player.get(client);
		if (!player) return;

		if (player.db.quests >= Quests.length) {
			return;
		}

		const quest = Quests[player.db.quests];
		if (!quest) return;

		if (quest.task === task) {
			if (quest.target !== null && quest.target !== target) return;
			if (quest.type !== null && quest.type !== type) return;

			player.session.questRepeats++;

			if (player.session.questRepeats < quest.repeats) {
				Locale.sendMessage(client, false, COLOUR_WHITE, 'quest.completion', `${player.session.questRepeats}/${quest.repeats}`);
				return;
			} 

			player.db.quests++;
			player.session.questRepeats = 0;

			client.setData('quests', player.db.quests);
			Achievement.check('quests', player.db.quests, client);

			updateGlobalStat('completedQuests', 1, true, true);

			const rewardAmount = quest.reward * quest.repeats;
			const reward = earn(client, rewardAmount, true);

			if (reward && reward > 0) {
				Locale.sendMessage(client, false, COLOUR_WHITE, 'quest.rewardMessage', rewardAmount);
				decho(3, client.name + ' has completed a quest!');

				if (quest.itemReward !== null) {
					player.backpack.addItem(client, quest.itemReward, Item.getDesc(quest.itemReward));
					Locale.sendMessage(client, false, COLOUR_WHITE, 'inventory.newItem', quest.itemReward);
				}

				// Print next quest.
				this.print(client);
			}
		}
	}

	static print(client) {
		const player = Player.get(client);
		if (!player) return;

		if (player.db.quests >= Quests.length) {
			Locale.sendMessage(client, false, COLOUR_WHITE, 'quest.noMoreQuests');
			return;
		}

		const quest = Quests[player.db.quests];
		const locale = player.getLocale();

		if (quest.type === 'vehicle') {
			Locale.sendMessage(client, false, COLOUR_ORANGE, 'quest.taskMessage', locale.getString(`quest.list.${quest.task}`, getVehicleNameFromModelId(quest.target)));
		} else {
			Locale.sendMessage(client, false, COLOUR_ORANGE, 'quest.taskMessage', locale.getString(`quest.list.${quest.task}`, quest.repeats, quest.target));
		}
	}
}

function initQuests() {
	new Quest('hiddenPackages', 1, earningBase.quest);
	new Quest('jack', 1, earningBase.quest);
	new Quest('infoPickups', 1, earningBase.quest);
	new Quest('findVehicle', 1, earningBase.quest, 115, 'vehicle');
	new Quest('convoy', 1, earningBase.quest);
	new Quest('jack', 3, earningBase.quest);
	new Quest('convoy', 2, earningBase.quest);
	new Quest('infoPickups', 3, earningBase.quest);
	new Quest('findVehicle', 1, earningBase.quest, 133, 'vehicle');
	new Quest('findVehicle', 1, earningBase.quest, 148, 'vehicle');
	new Quest('kill', 5, earningBase.quest);
	new Quest('convoy', 5, earningBase.quest);
	new Quest('dojo', 1, earningBase.quest, 'shotgun');
	new Quest('chat', 2, earningBase.quest);
	new Quest('bankEnter', 1, earningBase.quest);
	new Quest('bankDeposit', 1, earningBase.quest, 100);
	new Quest('bankWithdraw', 1, earningBase.quest, 10);
	new Quest('bankExit', 1, earningBase.quest);
}