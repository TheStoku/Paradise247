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
		this.id = Quests.push(this);
		this.itemReward = itemReward;
	}

	static check(client, task, target = null, type = null) {
		const player = Player.get(client);

		if (player.db.quests == Quests.length) {
			return;
		}

		const quest = Quests[player.db.quests];

		if (quest.task == task) {
			player.session.questRepeats++;

			if (quest.repeats > player.session.questRepeats) {
				Locale.sendMessage(client, false, COLOUR_WHITE, 'quest.completion', `${player.session.questRepeats}/${quest.repeats}`);

				return;
			} else {
				if (quest.target != null && quest.target != target || quest.type != type) return;

				player.db.quests++;
				player.session.questRepeats = 0;

				client.setData('quests', player.db.quests);
				Achievement.check('quests', player.db.quests, client);

				updateGlobalStat('completedQuests', 1, true, true);

				const reward = earn(client, quest.reward * quest.repeats, true);

				if (reward && reward > 0) {
					Locale.sendMessage(client, false, COLOUR_WHITE, 'quest.rewardMessage', reward);

					if (quest.itemReward != null) {
						player.backpack.addItem(client, quest.itemReward, Item.getDesc(quest.itemReward));

						Locale.sendMessage(client, false, COLOUR_WHITE, 'inventory.newItem', quest.itemReward);
					}

					// Print next quest.
					this.print(client);
				}
			}
		}
	}

	static print(client) {
		const player = Player.get(client);
		const locale = player.getLocale();

		if (player.db.quests == Quests.length) {
			Locale.sendMessage(client, false, COLOUR_WHITE, 'quest.noMoreQuests' );

			return;
		}

		const task = Quests[player.db.quests].task;
		const repeats = Quests[player.db.quests].repeats;
		const target = Quests[player.db.quests].target;
		const type = Quests[player.db.quests].type;

		if (type == null) Locale.sendMessage(client, false, COLOUR_ORANGE, 'quest.taskMessage', locale.getString(`quest.list.${task}`, null, null, null, null, repeats));
		else {
			switch (type) {
			case 'vehicle':
				Locale.sendMessage(client, false, COLOUR_ORANGE, 'quest.taskMessage', locale.getString(`quest.list.${task}`, null, null, null, null, getVehicleNameFromModelId(target)));
				break;
			}
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
}
