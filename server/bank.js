'use strict';

/*
    Bank system
*/

class Bank {
	static enter(event, ped, sphere, entered) {
		const player = getElementFromId(ped.id);

		if (entered) {
			getClientFromPlayerElement(player).setData('inBank', true);
			Locale.sendMessage(player.client, false, COLOUR_WHITE, 'bank.welcome');
			Locale.sendMessage(player.client, false, COLOUR_WHITE, 'bank.commands');
		} else {
			getClientFromPlayerElement(player).setData('inBank', false);
			Locale.sendMessage(player.client, false, COLOUR_WHITE, 'bank.bye');
		}
	}

	static deposit(client, amnount) {
		const player = Player.get(client);
		const locale = player.getLocale();

		if (typeof player != 'undefined') {
			if (player.getMoney() > 0) {
				if (amnount == 'all' || amnount > player.getMoney()) {
					// All
					player.setBankMoney(player.getMoney(), true);
					player.setMoney(0);
				} else if (amnount > 0) {
					player.setBankMoney(Number(amnount), true);
					player.setMoney(Number(amnount), false);
				} else {
					Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferError');

					return;
				}

				// Print result.
				Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferMessage', amnount.toString(), locale.getString('bank.bank'));
				Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferSuccess', player.getBankMoney().toString(), player.getMoney().toString());
			} else {
				Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferError');
			}
		}
	}

	static withdraw(client, amnount) {
		const player = Player.get(client);
		const locale = player.getLocale();

		if (typeof player != 'undefined') {
			if (player.getBankMoney() > 0) {
				if (amnount == 'all' || amnount > player.getBankMoney()) {
					// All
					player.setMoney(player.getBankMoney(), true);
					player.setBankMoney(0);
				} else if (amnount > 0) {
					player.setMoney(Number(amnount), true);
					player.setBankMoney(Number(amnount), false);
				} else {
					Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferError');

					return;
				}

				// Print result.
				Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferMessage', amnount.toString(), locale.getString('bank.wallet'));
				Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferSuccess', player.getBankMoney().toString(), player.getMoney().toString());
			} else {
				Locale.sendMessage(client, false, COLOUR_WHITE, 'bank.transferError');
			}
		}
	}
}

function initBanks() {
	if (server.game == GAME_GTA_III) {
		new Sphere(new Vec3(1028.66, -687.41, 14.91), 1.5, Bank.enter, 1); // Portland #1
		new Sphere(new Vec3(1026.06, -687.43, 14.96), 1.5, Bank.enter); // Portland #2
		new Sphere(new Vec3(166.78, -961.76, 26.26), 1.5, Bank.enter, 1); // Staunton
	}
}
