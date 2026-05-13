/** @format */

document.addEventListener("DOMContentLoaded", () => {
	const paintdrytime = 50;
	const potmelttime = 50;
	const inflationinterval = 125;
	let paintinterval = null;
	let potinterval = null;
	let saveinterval = null;
	let savecount = 0;
	let importcount = 0;
	let exportcount = 0;
	game = {
		//initialize everything first then upgrades (as upgrades have to refer to game during initialization)
		layers: {
			paintchips: new Layer(
				"PaintChips",
				" paint chips",
				false,
				0,
				() => {
					return 2 * game.layers.paintchips.others.paintstack;
				},
				() => {
					this.resets++;
				},
				() => {
					return {
						value: game.layers.paintchips.value,
						highestValue: game.layers.paintchips.highestValue,
						resets: game.layers.paintchips.resets,
						painton: game.layers.paintchips.others.painton,
						painttime: game.layers.paintchips.others.painttime,
						paint: game.layers.paintchips.others.paint,
						painteat: game.layers.paintchips.others.painteat,
						purity: game.layers.paintchips.others.purity,
						paintstack: game.layers.paintchips.others.paintstack,
					};
				},
				(data) => {
					game.layers.paintchips.value = data.value;
					game.layers.paintchips.highestValue = data.highestValue;
					game.layers.paintchips.resets = data.resets;
					game.layers.paintchips.others.painton = data.painton;
					game.layers.paintchips.others.painttime = data.painttime;
					game.layers.paintchips.others.paint = data.paint;
					game.layers.paintchips.others.painteat = data.painteat;
					game.layers.paintchips.others.paintstack = data.paintstack === undefined ? 0 : data.paintstack
					game.layers.paintchips.others.purity = data.purity === undefined ? 1 : data.purity;
					game.layers.paintchips.updateText();
					if (game.layers.paintchips.others.painton) paintinterval = setInterval(painttick, paintdrytime);
					document.getElementById("paint").textContent = game.layers.paintchips.others.paint + "/20L";
					if (game.layers.paintchips.highestValue >= 1) document.getElementById("eat").style.display = "block";
					eatdialouge();
					if (game.layers.paintchips.others.paintstack >= 2) document.getElementById("stack").textContent = "x" + game.layers.paintchips.others.paintstack;
				},
				{
					painton: false,
					painttime: 0,
					painteat: 0,
					paint: 6,
					purity: 1,
					paintstack: 0,
				},
				document.getElementById("paintchips"),
			),
			money: new Layer(
				"Money",
				"¥",
				true,
				0,
				() => {
					return 500 * game.layers.paintchips.others.purity;
				},
				() => {
					game.layers.money.setValue(0);
					game.layers.money.resets++;
					for (let i = 0; i < game.layers.money.upgrades.length; i++) {
						game.layers.money.upgrades[i].value = 0;
						game.layers.money.upgrades[i].updateText();
					}
				},
				() => {
					let upgradeArray = [];
					for (let i = 0; i < game.layers.money.upgrades.length; i++) {
						upgradeArray.push(game.layers.money.upgrades[i].value);
					}
					return {
						value: game.layers.money.value,
						highestValue: game.layers.money.highestValue,
						resets: game.layers.money.resets,
						inflation: game.layers.money.others.inflation,
						fuel: game.layers.money.others.fuel,
						poton: game.layers.money.others.poton,
						pottime: game.layers.money.others.pottime,
						upgrades: upgradeArray,
					};
				},
				(data) => {
					game.layers.money.value = data.value;
					game.layers.money.highestValue = data.highestValue;
					game.layers.money.resets = data.resets;
					game.layers.money.others.inflation = data.inflation;
					game.layers.money.others.fuel = data.fuel === undefined ? 0 : data.fuel;
					game.layers.money.others.poton = data.poton === undefined ? false : data.poton;
					game.layers.money.others.pottime = data.pottime === undefined ? 0 : data.pottime;
					game.layers.money.updateText();
					if (game.layers.money.highestValue > 0) {
						for (let i = 0; i < game.layers.money.upgrades.length; i++) {
							game.layers.money.upgrades[i].value = data.upgrades[i] !== null && data.upgrades[i] !== undefined ? data.upgrades[i] : 0;
						}
						showMoneyUpgrades();
						for (let i = 0; i < game.layers.money.upgrades.length; i++) {
							if (game.layers.money.upgrades[i].element !== null) game.layers.money.upgrades[i].updateText();
						}
						if (game.layers.money.upgrades[0].value >= 1) setupInflation();
						if (game.layers.money.upgrades[1].value === 1) {
							showPot();
							document.getElementById("fuel").textContent = game.layers.money.others.fuel + "/80";
							document.getElementById("purity").textContent = Math.round(game.layers.paintchips.others.purity * 10000) / 100 + "% pure";
						}
					}
					if (game.layers.money.others.poton) potinterval = setInterval(pottick, potmelttime);
				},
				{
					inflation: 1,
					fuel: 0,
					poton: false,
					pottime: 0,
				},
				document.getElementById("money"),
			),
		},
		settings: {
			version: 0.1,
			timeStamp: Date.now(),
		},
	};
	game.layers.money.upgrades = [
		new Upgrade(
			0,
			"Paint",
			"Buy 1L worth of paint.",
			game.layers.money,
			() => {
				return Math.round(900 * game.layers.money.others.inflation);
			},
			Number.MAX_VALUE,
			[{ id: 1, at: 10 }],
			true,
			() => {
				game.layers.paintchips.others.purity = (game.layers.paintchips.others.paint * game.layers.paintchips.others.purity + 1) / (game.layers.paintchips.others.paint + 1);
				game.layers.paintchips.others.paint++;
				document.getElementById("paint").textContent = game.layers.paintchips.others.paint + "/20L";
				document.getElementById("purity").textContent = Math.round(game.layers.paintchips.others.purity * 10000) / 100 + "% pure";
				if (game.layers.money.upgrades[0].value === 1) {
					setupInflation();
				}
			},
			() => {
				return game.layers.paintchips.others.paint < 20;
			},
		),
		new Upgrade(
			1,
			"A Simple Pot",
			"Unlocks the Pot, which allows you to melt paint chips.",
			game.layers.money,
			() => {
				return 15000;
			},
			1,
			[{ id: 2, at: 1 }],
			false,
			() => {
				if (game.layers.money.upgrades[1].value === 1) {
					showPot();
				}
			},
			() => {
				return true;
			},
		),
		new Upgrade(
			2,
			"Fuel",
			"Buy 19 fuel.",
			game.layers.money,
			() => {
				return 1000;
			},
			Number.MAX_VALUE,
			[{ id: 3, at: 10 }],
			true,
			() => {
				game.layers.money.others.fuel += 19;
				document.getElementById("fuel").textContent = game.layers.money.others.fuel + "/80";
			},
			() => {
				return game.layers.money.others.fuel + 19 <= 80;
			},
		),
		new Upgrade(
			3,
			"The Great Wall",
			"Unlocks the ability to apply multiple layers of paint at once.",
			game.layers.money,
			() => {
				return 20000;
			},
			1,
			[],
			false,
			() => {},
			() => {
				return true;
			},
		),
	];
	function save() {
			let data = {
				paintchips: null,
				money: null,
				settings: null,
			};
			data.settings = structuredClone(game.settings);
			for (layer in game.layers) {
				data[layer] = game.layers[layer].save();
			}
			localStorage.setItem("save", btoa(JSON.stringify(data)));
			return btoa(JSON.stringify(data));
	}
	function load(data) {
		try {
			data = JSON.parse(atob(data));
			if (data.settings === undefined) console.log("oh");
			game.settings.version = data.settings.version;
			game.settings.timeStamp = data.settings.timeStamp;
			game.layers.paintchips.load(data.paintchips);
			game.layers.money.load(data.money);
		} catch (e) {
			clearInterval(saveinterval);
			alert("Error: " + e + "\n Your save will be wiped to fix this...");
			localStorage.removeItem("save");
			location.reload();
		}
	}
	if (localStorage.getItem("save") !== null) load(localStorage.getItem("save"));
	saveinterval = setInterval(save, 1000);
	function painttick() {
		game.layers.paintchips.others.painttime++;
		document.getElementById("progress").textContent = game.layers.paintchips.others.painttime + "/30";
		document.getElementById("paintchip").style.opacity = game.layers.paintchips.others.painttime / 30;
		if (game.layers.paintchips.others.painttime >= 30) {
			document.getElementById("progress").textContent = "Ready to harvest!";
			clearInterval(paintinterval);
		}
	}
	function pottick() {
		game.layers.money.others.pottime++;
		document.getElementById("potprogress").textContent = "Progress: " + game.layers.money.others.pottime + "/20";
		game.layers.money.others.fuel--;
		document.getElementById("pot").style.backgroundColor = game.layers.money.others.fuel <= 0 ? "buttonface" : "orange";
		document.getElementById("fuel").textContent = Math.max(game.layers.money.others.fuel, 0) + "/80";
		if (game.layers.money.others.pottime >= 20) {
			if (game.layers.money.others.fuel !== 0) {
				game.layers.paintchips.others.purity = (game.layers.paintchips.others.paint * game.layers.paintchips.others.purity + 1.6) / (game.layers.paintchips.others.paint + 2);
				game.layers.paintchips.others.paint += 2;
				document.getElementById("paint").textContent = game.layers.paintchips.others.paint + "/20L";
				document.getElementById("purity").textContent = Math.round(game.layers.paintchips.others.purity * 10000) / 100 + "% pure";
			}
			game.layers.money.others.poton = false;
			game.layers.money.others.pottime = 0;
			game.layers.money.others.fuel = Math.max(game.layers.money.others.fuel, 0);
			document.getElementById("potprogress").textContent = "Progress: 0/20";
			document.getElementById("pot").style.backgroundColor = "buttonface";
			clearInterval(potinterval);
		}
	}
	function eatdialouge() {
		switch (game.layers.paintchips.others.painteat) {
			case 1:
				document.getElementById("dialouge").textContent = "why would you do that";
				break;
			case 2:
				document.getElementById("dialouge").textContent = "you realize you have to wait 5 more minutes now";
				break;
			case 4:
			case 5:
				document.getElementById("dialouge").textContent = "you should stop";
				break;
			case 6:
			case 7:
				document.getElementById("dialouge").textContent = "there's no new feature it is just this";
				break;
			case 8:
			case 9:
				document.getElementById("dialouge").textContent = "like this is the entire game";
				break;
			case 10:
				document.getElementById("dialouge").textContent = "instead of eating paint chips maybe sell them";
				document.getElementById("sell").style.display = "block";
				document.getElementById("money").style.display = "inline";
				break;
			case 11:
				clearInterval(saveinterval);
				game.layers.paintchips.others.painteat = 10;
				localStorage.setItem("save", "67");
				alert("you died of lead poisoning! your save broke!");
				location.reload();
				break;
		}
	}
	function showMoneyUpgrades() {
		if (game.layers.money.highestValue > 0 && !document.getElementById("Moneyupgrade0")) document.getElementById("body").appendChild(game.layers.money.getUpgrades());
	}
	function setupInflation() {
		document.getElementById("inflation").style.display = "inline";
		setInterval(() => {
			game.layers.money.others.inflation = Math.max(game.layers.money.others.inflation + (Math.random() - 0.55) * 0.33, 1);
			document.getElementById("inflation").textContent = `Inflation is increasing paint prices by ${Math.round(game.layers.money.others.inflation * 100)}%`;
			game.layers.money.upgrades[0].updateText();
		}, inflationinterval);
	}
	function showPot() {
		document.getElementById("body2").style.opacity = 1;
		document.getElementById("purity").style.display = "block";
	}
	document.getElementById("apply").addEventListener("click", () => {
		if ((!game.layers.paintchips.others.painton || game.layers.money.upgrades[3].value === 1) && game.layers.paintchips.others.paint > 0) {
			game.layers.paintchips.others.paint--;
			document.getElementById("paint").textContent = game.layers.paintchips.others.paint + "/20L";
			if (!game.layers.paintchips.others.painton) {
				game.layers.paintchips.others.paintstack = 1;
				paintinterval = setInterval(painttick, paintdrytime);
			} else {
				game.layers.paintchips.others.paintstack++;
				document.getElementById("stack").textContent = "x" + game.layers.paintchips.others.paintstack;
				let oldtime = game.layers.paintchips.others.painttime * 1
				game.layers.paintchips.others.painttime = 0;
				if (oldtime >= 30) {
					document.getElementById("paintchip").style.opacity = 0;
					paintinterval = setInterval(painttick, paintdrytime);
				}
				document.getElementById("progress").textContent = game.layers.paintchips.others.painttime + "/30";
			}
			game.layers.paintchips.others.painton = true;
		}
	});
	document.getElementById("paintchip").addEventListener("click", () => {
		if (game.layers.paintchips.others.painttime >= 30) {
			game.layers.paintchips.add(game.layers.paintchips.gaincalc());
			game.layers.paintchips.others.painton = false;
			game.layers.paintchips.others.painttime = 0;
			document.getElementById("paintchip").style.opacity = 0;
			game.layers.paintchips.updateText();
			document.getElementById("progress").textContent = "0/30";
			game.layers.paintchips.others.paintstack = 0;
			document.getElementById("stack").textContent = "";
			if (game.layers.paintchips.highestValue >= 1) document.getElementById("eat").style.display = "block";
		}
	});
	document.getElementById("eat").addEventListener("click", () => {
		if (game.layers.paintchips.value >= 1) {
			game.layers.paintchips.add(-1);
			game.layers.paintchips.others.painteat++;
			game.layers.paintchips.updateText();
			eatdialouge();
		}
	});
	document.getElementById("sell").addEventListener("click", () => {
		if (game.layers.paintchips.value >= 1) {
			game.layers.paintchips.add(-1);
			game.layers.money.add(game.layers.money.gaincalc());
			game.layers.paintchips.updateText();
			game.layers.money.updateText();
			showMoneyUpgrades();
		}
	});
	document.getElementById("pot").addEventListener("click", () => {
		if (!game.layers.money.others.poton && game.layers.paintchips.value >= 1 && game.layers.paintchips.others.paint + 2 <= 20) {
			game.layers.paintchips.add(-1);
			game.layers.paintchips.updateText();
			game.layers.money.others.poton = true;
			potinterval = setInterval(pottick, potmelttime);
		}
	});
	document.getElementById("save").addEventListener("click", () => {
		savecount++;
		if (savecount >= 100) {
			savecount = 0;
			save();
		}
		document.getElementById("save").textContent = `manual save (${savecount}/100)`;
	});
	document.getElementById("import").addEventListener("click", () => {
		importcount++;
		if (importcount >= 100) {
			importcount = 0;
			let data = window.prompt("Enter save file here: ");
			load(data);
		}
		document.getElementById("import").textContent = `import save (${importcount}/100)`;
	});
	document.getElementById("export").addEventListener("click", () => {
		exportcount++;
		if (exportcount >= 100) {
			exportcount = 0;
			window.navigator.clipboard.writeText(save());
			alert("save file exported!");
		}
		document.getElementById("export").textContent = `export to clipboard (${exportcount}/100)`;
	});
});
