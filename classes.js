/**
 * Helpful example functions:
 * Basic save function: (replace this with game.layers.[whatever layer])
 *
 * let upgradeArray = [];
 * for (let i = 0; i < this.upgrades; i++) {
 *     upgradeArray.push(this.upgrades[i].value);
 * }
 * return {
 *     value: this.value,
 *     highestValue: this.highestValue,
 *     resets: this.resets,
 *     upgrades: this.upgrades,
 * }
 *
 * Basic reset function: (replace this with game.layers.[whatever layer])
 *
 * this.setValue(0);
 * this.resets++;
 * for (let i = 0; i < this.upgrades.length; i++) {
 * 	this.upgrades[i].value = 0;
 * 	this.upgrades[i].updateText();
 * }
 *
 * @format
 */

class Layer {
	/**
	 * Defines a layer :3
	 * this.upgrades - Array of upgrade classes. The array must be in order of ids, starting at 0. Initialize this AFTER declaring the layer.
	 * @param {String} name - The name of the layer
	 * @param {String} currency - The name of the currency (e.x: $, points)
	 * @param {Boolean} ltr - Where to put the currency (true for left, false for right)
	 * @param {Number} value - Base value
	 * @param {Function} gainfunc - Function that returns the amount gained
	 * @param {Function} resetfunc - Function that resets the layer
	 * @param {Function} savefunc - Function that compiles the save.
	 * @param {Function} loadfunc - Function that loads the save data.
	 * @param {Object} others - Object containing any extra currencies, for example from minigames.
	 * @param {Element} displayElement - Element to display the currency.
	 */
	constructor(name, currency, ltr, value, gainfunc, resetfunc, savefunc, loadfunc, others, displayElement) {
		this.name = name;
		this.currency = currency;
		this.ltr = ltr;
		this.value = value;
		this.gainfunc = gainfunc;
		this.resetfunc = resetfunc;
		this.savefunc = savefunc;
		this.loadfunc = loadfunc;
		this.upgrades = null;
		this.upgradeContainer = null;
		this.resets = 0;
		this.highestValue = value;
		this.others = others;
		this.displayElement = displayElement;
	}
	/**
	 * Runs the gain calculation.
	 * @returns The amount gained.
	 */
	gaincalc() {
		return this.gainfunc();
	}
	/**
	 * Runs the reset function.
	 * @returns Whatever output is returned during the reset.
	 */
	reset() {
		return this.reset();
	}
	/**
	 * Runs the save function.
	 * @returns The object of any values to be saved.
	 */
	save() {
		return this.savefunc();
	}
	/**
	 * Runs the load function.
	 * @param args - Args for loading.
	 * @returns Whatever gets returned when loaded (if ever).
	 */
	load(args) {
		return this.loadfunc(args);
	}
	/**
	 * Adds/subtracts from the value.
	 * @param {Number} num The number to add.
	 */
	add(num) {
		this.value += num;
		this.highestValue = Math.max(this.value, this.highestValue);
	}
	/**
	 * Sets the value.
	 * @param {Number} num The number to set.
	 */
	setValue(num) {
		this.value = num;
		this.highestValue = Math.max(this.value, this.highestValue);
	}
	/**
	 * Creates all the HTML elements for the upgrades.
	 * @returns A div container with all the unlocked upgrades.
	 */
	getUpgrades() {
		this.upgradeContainer = document.createElement("div");
		this.upgradeContainer.id = this.name + "upgradeContainer";
		let queue = [this.upgrades[0]];
		for (let i = 0; i < queue.length; i++) {
			this.upgradeContainer.appendChild(queue[i].render());
			for (let j = 0; j < queue[i].unlocks.length; j++) {
				if (queue[i].value >= queue[i].unlocks[j].at) {
					queue.push(this.upgrades[queue[i].unlocks[j].id]);
				}
			}
		}
		return this.upgradeContainer;
	}
	/**
	 * Returns a string to display the currency amount.
	 * @returns The string.
	 */
	currencyDisplay() {
		return this.ltr ? this.currency + Math.round(this.value) : Math.round(this.value) + this.currency;
	}
	/**
	 * Updates the currency display.
	 */
	updateText() {
		this.displayElement.textContent = "You have: " + this.currencyDisplay();
	}
}
class Upgrade {
	/**
	 * Defines an upgrade :3
	 * @param {Number} id - The id of the upgrade. (no overlapping, start at 0)
	 * @param {String} description - The description of the upgrade.
	 * @param {Layer} currency - The currency of the upgrade.
	 * @param {Function} cost - A function that returns the cost of the upgrade.
	 * @param {Number} cap - The cap of the upgrade.
	 * @param {Array} unlocks - An array of upgrade ids to signify what to unlock after purchasing this upgrade. All unlocks must be in the form {id: , at:}, where id is the upgrade id and at is the upgrades purchased.
	 * @param {Boolean} buyable - When true, sets cap to 1.79e308 and removes the display
	 * @param {Function} effect - Function that executes when bought.
	 * @param {Function} requirement - Function for any extra upgrade requirements. Make sure it returns true/false.
	 */
	constructor(id, title, description, currency, cost, cap, unlocks, buyable, effect, requirement) {
		this.id = id;
		this.value = 0;
		this.title = title;
		this.cap = cap;
		this.buyable = buyable;
		if (this.buyable) this.cap = Number.MAX_VALUE;
		this.description = description;
		this.currency = currency;
		this.cost = cost;
		this.unlocks = unlocks;
		this.element = null;
		this.effect = effect;
		this.requirement = requirement;
	}
	/**
	 * Renders the upgrade.
	 * @returns An HTML element of the upgrade, with an id and class.
	 */
	render() {
		this.element = document.createElement("button");
		this.element.id = this.currency.name + "upgrade" + this.id;
		this.element.classList.add(this.currency.name + "upgrade");
		this.updateText();
		this.element.addEventListener("click", () => {
				if ((this.value < this.cap) && (this.currency.value >= this.cost()) && this.requirement()) {
					this.value++;
					this.currency.add(-this.cost());
					this.updateText();
					this.currency.updateText();
					this.effect();
					for (let i = 0; i < this.unlocks.length; i++) {
						if (document.getElementById(this.currency.name + "upgrade" + this.unlocks[i].id) === null && this.value >= this.unlocks[i].at) {
							this.currency.upgradeContainer.appendChild(this.currency.upgrades[this.unlocks[i].id].render());
						}
					}
				}
		});
		return this.element;
	}
	/**
	 * Calculates the cost.
	 * @returns The cost.
	 */
	costcalc() {
		return this.cost();
	}
	/**
	 * Updates the upgrade text.
	 */
	updateText() {
		this.element.textContent = (this.buyable ? "" : `(${this.value}/${this.cap})\n`) + `${this.title}\n${this.description}\n Cost: ` + (this.currency.ltr ? this.currency.currency + this.cost() : this.cost() + this.currency.currency);
	}
}
