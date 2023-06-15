'use strict';
// Source: https://gist.github.com/diazvictor/3fea12958d61f7cba14ca561989fbdb0

/* jshint esversion: 8 */

// This example is a port of: https://gist.github.com/diazvictor/6fe3372bce79587a3c21123a19881cb1

// I create the Inventory class
class Inventory {
	// What to do when the class is initialized
	constructor() {
		this.items = [];
	}

	/**
	 * I look at what I carry in my inventory
	 * @return {Boolean} true or false if there are items
	 */
	getItems(client) {
		if (this.items[0]) {
			Locale.sendMessage(client, false, COLOUR_ORANGE, 'inventory.status', this.items.length, this.size);
			// Locale.sendMessage(super.client, false, COLOUR_ORANGE, "inventory.youCarry");

			this.items.forEach((inventory, index) => {
				// Locale.sendMessage(super.client, false, COLOUR_ORANGE, "inventory.status", this.items.length, this.size);
				messageClient(`${index+1}. ${inventory.name} - ${inventory.desc}.`, client, COLOUR_WHITE);
			});
			return true;
		} else {
			Locale.sendMessage(client, false, COLOUR_RED, 'inventory.noItems');
			return false;
		}
	}

	/**
	 * Stoku edit: added for database store. Items are stored in database by name.
	 * I look at what I carry in my inventory
	 * @return {Boolean} true or false if there are items
	 */
	getItemsForStore() {
		if (this.items[0]) {
			let items = '';

			this.items.forEach((inventory, index) => {
				items += inventory.name + ',';
			});

			return items;
		} else {
			return '';
		}
	}

	/**
	 * I check if an item exists
	 * @param {String} item name
	 * @return {Boolean} true or false if the item exists
	 */
	hasItem(name) {
		for (const i in this.items) {
			if (name == this.items[i].name) {
				return true;
			}
		}
		return false;
	}

	/**
	 * I add an item to the inventory
	 * @param {String} item name
	 * @param {String} item description
	 * @return {Number} the number of items in the inventory
	 */
	addItem(name, desc) {
		this.items.push({
			'name': name,
			'desc': desc,
		});
		return this.items.length;
	}

	/**
	 * I remove an item from inventory
	 * @param {String} item name
	 * @return {Boolean} true or false if the item has been removed successfully
	 */
	removeItem(name) {
		this.items.find((inventory, index) => {	// Stoku: Replaced foreach loop and .pop() to .splice() to fix issues with incorrectly removed items.
			if (name == inventory.name) {
				this.items.splice(index, 1);
				return true;
			} else {
				return false;
			}
		});
		/* this.items.forEach((inventory) => {
			if (name == inventory.name) {
				this.items.pop();
				return true;
			} else {
				return false;
			}
		});*/
	}
}

// BackPack inherits methods and properties from Inventory
class BackPack extends Inventory {
	/**
	 * I add an item to the inventory but first I check if the limit has not
	 * been reached.
	 * @param {String} item name
	 * @param {String} item description
	 * @return {Number} the number of items in the inventory
	 */
	addItem(client, name, desc) {
		const playerDb = Player.get(client).db;
		this.size = Number(playerDb.backpackSize);

		if (this.items.length >= this.size) {
			Locale.sendMessage(client, false, COLOUR_RED, 'inventory.backpackIsFull', this.items.length, this.size);
			return false;
		} else if (typeof name != 'undefined') { // Stoku: added simple check, but it should be replaced
			super.addItem(name, desc);
			return true;
		}
	}
}

// ///////////////////////////////////////////////////////////////

const Items = [];
class Item {
	constructor(name, description, value) {
		this.name = name;
		this.description = description;
		this.value = value;
		Items.push(this);
	}

	static use(client, item) {
		const player = Player.get(client);

		switch (item) {
		case 'water':
			triggerNetworkEvent('setPlayerHealth', client, 50, true);
			break;
		case 'apple':
			triggerNetworkEvent('setPlayerHealth', client, 25, true);
			break;
		case 'vest':
			triggerNetworkEvent('setPlayerArmour', client, 100, true);
			break;
		case 'shoppingbag':
			player.db.backpackSize += 5;
			player.backpack.size = player.db.backpackSize;
			// TODO: Add message
			break;
		case 'kitbag':
			player.db.backpackSize += 10;
			player.backpack.size = player.db.backpackSize;
			// TODO: Add message
			break;
		case 'suitcase':
			player.db.backpackSize += 20;
			player.backpack.size = player.db.backpackSize;
			// TODO: Add message
			break;
		}

		setAnim(client, 56, 1000);
	}

	static getDesc(item) {
		const i = Items.findIndex( (element) => element.name == item );

		if (i != -1) {
			return Items[i].description;
		}
	}
}

new Item('shoppingbag', 'Adds 5 slots to your backpack size', 10000);
new Item('kitbag', 'Adds 10 slots to your backpack size', 15000);
new Item('suitcase', 'Adds 20 slots to your backpack size', 20000);
new Item('water', 'Renewes your health by 50%', 50);
new Item('apple', 'Renewes your health by 25%', 25);
new Item('vest', 'Renewes your armour by 100%', 1000);
