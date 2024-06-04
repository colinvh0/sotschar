/*// TODO: move Tables
// TODO: dynamic field count
// TODO:   tie to Corruption
// TODO: suggested values
// TODO: iterated fields
// TODO: image url/upload/crop
// TODO: dot input
// TODO: page layout
// TODO: load/save

export class Character {
	name: Name;
	profession: string;
	adjectives: string[];
	drives: Drive[];
	portrait: Portrait;
	investigative: InvestigativeAbilities;
	general: GeneralAbilities;
	allegiances: Allegiances;
	wealth: Wealth;
	stamina: Stamina;
	gear: Gear[];
	
	constructor() {
		this.name = new Name();
		this.profession = "";
		this.adjectives = [];
		this.drives = [];
		this.portrait = new Portrait();
		this.investigative = new InvestigativeAbilities();
		this.general = new GeneralAbilities();
		this.allegiances = new Allegiances();
		this.wealth = new Wealth();
		this.stamina = new Stamina();
		this.gear = [];
	}
	
	get gritBonus(): number {
		let cdg = 0;
		for (let i in this.gear) {
			if (this.gear[i].characterDefining) {
				cdg++;
				if (cdg >= 5) {
					return 1;
				}
			}
		}
		return 0;
	}
}

const Config = {
	investigativeBuildPoints: [14, 13, 12, 11, 10],
	generalBuildPoints: 30,
	staminaBuildPoints: 18,
	staminaMin: 3,
	freeAlly: 2,
	freeEnemy: 1
}

export const Tables = {
  animals: [
    "Aquatic Mammals",
    "Bats",
    "Bears",
    "Bugs",
    "Burrowing Mammals",
    "Cats",
    "Cattle",
    "Crustaceans",
    "Dogs",
    "Fish",
    "Fowl",
    "Frogs and Toads",
    "Great Cats",
    "Herd Beasts",
    "Horses",
    "Lizards",
    "Primates",
    "Raptors",
    "Rodents",
    "Seabirds",
    "Snakes",
    "Songbirds",
    "Spiders",
    "Swine",
    "Wolves and Foxes",
  ],
  factions: [
    "Ancient Nobility",
    "Architects and Canal-Watchers",
    "Church of Denari",
    "City Watch",
    "Commoners",
    "Mercanti",
    "Mercenaries",
    "Monstrosities",
    "Outlanders",
    "Sorcerous Cabals",
    "The Triskadane",
    "Thieves' Guilds",
  ],
  abilities: {
    general: [
      ["Athletics", "Dodge"],
      ["Bind Wounds", "Plenty of Leeches"],
      ["Burglary", "Fast Hands"],
      ["Preparedness", "Flashback"],
      ["Stealth", "Where’d She Go?"],
      ["Sorcery", "Blast", true],
      ["Sway", "Play to the Crowd"],
      ["Warfare", "Cleave"]
    ],
    investigative: [
      ["Charm", "social"],
      ["Command", "social"],
      ["Intimidation", "social"],
      ["Liar’s Tell", "social"],
      ["Nobility", "social"],
      ["Servility", "social"],
      ["Taunt", "social"],
      ["Trustworthy", "social"],
      ["Felonious Intent", "Sentinel"],
      ["Laws & Traditions", "Sentinel"],
      ["Spirit Sight", "Sentinel"],
      ["Vigilance", "Sentinel"],
      ["Corruption", "Sorcerer"],
      ["Forgotten Lore", "Sorcerer"],
      ["Leechcraft", "Sorcerer"],
      ["Prophecy", "Sorcerer"],
      ["City’s Secrets", "Thief"],
      ["Ridiculous Luck", "Thief"],
      ["Scurrilous Rumors", "Thief"],
      ["Skulduggery", "Thief"],
      ["Know Monstrosities", "Warrior"],
      ["Spot Frailty", "Warrior", true],
      ["Tactics of Death", "Warrior"],
      ["Wilderness Mastery", "Warrior"]
    ]
  },
  spheres: [
    ["Aging", true, true],
    ["Air", true, false],
    ["Animal", true, true],
    ["Blades", true, false],
    ["Blood", true, false],
    ["Chaos", true, true],
    ["Curses", true, true],
    ["Death", true, false],
    ["Decay/Entropy", true, false],
    ["Demonology", true, true],
    ["Disease", true, true],
    ["Earth", true, false],
    ["Fear", false, true],
    ["Fire", true, false],
    ["Flesh", true, false],
    ["Ghosts and Spirits", false, true],
    ["Ice", true, false],
    ["Illusion", false, true],
    ["Lightning", true, false],
    ["Love", false, true],
    ["Luck", true, true],
    ["Memory", false, true],
    ["Music", false, true],
    ["Necromancy", true, false],
    ["Physical Transmutation", true, false],
    ["Plants", true, false],
    ["Possession", true, true],
    ["Secrets", false, true],
    ["Shadow", true, false],
    ["Statuary", true, false],
    ["Swamp", true, false],
    ["Transmutation", true, false],
    ["Transportation", true, true],
    ["Water", true, false],
  ],
  wealth: [
    ["Squalid", -2],
    ["Struggling", -1],
    ["Comfortable", 0],
    ["Wealthy", 1],
    ["Opulent", 2],
  ]
};

class Name {
	text = '';
	trueKnown = false;
}

class Drive {
	text = '';
	pool = 1;
}

class Portrait {
	//
}

class AbilitiesCollection {
	n: Map<string, Ability>;
	a: Ability[];

	constructor() {
		this.n = new Map<string, Ability>();
    this.a = [];
	}
	
	add(ability: Ability):void {
		this.a.push(ability);
		this.n.set(ability.name, ability);
	}
}

class InvestigativeAbilities extends AbilitiesCollection {
	constructor() {
    super();
    for (var i in Tables.abilities.investigative) {
      const a = Tables.abilities.investigative[i];
      //this.add(new InvestigativeAbility(a[0], a[1], a[2]));
    }
	}
}

class GeneralAbilities extends AbilitiesCollection {
	constructor() {
    super();
    for (var i in Tables.abilities.general) {
      const a = Tables.abilities.general[i];
      //this.add(new GeneralAbility(a[0], a[1], a[2]));
    }
	}
}

class Ability {
	name: string;
	group: string;
	hm: boolean | null | undefined;
  maxRanks = 0;
	#ranks = 0;
	#pool = 0;

	constructor(name: string, group: string, hm = false) {
		this.name = name;
		this.group = group;
		this.hm = hm ? undefined : null;
	}
		
	health(): void {
		if (this.hm !== null) {
			this.hm = true;
		}
	}
	
	morale(): void {
		if (this.hm !== null) {
			this.hm = false;
		}
	}
	
	allowHM():void {
		if (this.hm === null) {
			this.hm = undefined;
		}
	}
	
	forbidHM():void {
		this.hm = null;
	}
	
	set ranks(v: number) {
		this.setRanks(v);
	}
	
	get ranks() {
		return this.#ranks;
	}
	
	setRanks(v: number, adjustPool: boolean = true):number {
		const old = this.ranks;
		if (v > this.maxRanks) {
			v = this.maxRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#ranks = v;
		if (adjustPool) {
			this.pool += diff;
		}
		return v;
	}

	set pool(v: number) {
		this.setPool(v);
	}
	
	setPool(v: number):number {
		const old = this.pool;
		if (v > this.ranks) {
			v = this.ranks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#pool = v;
		return v;
	}
}

class GeneralAbility extends Ability {
  talent: string;
	constructor(name: string, talent: string, hm = false) {
    super(name, 'General', hm);
    this.maxRanks = 15;
    this.talent = talent;
	}
	
}

class InvestigativeAbility extends Ability {
	constructor(name: string, group: string, hm = false) {
    super(name, group, hm);
    this.maxRanks = 5;
  }
}

class Allegiances {
	a: Allegiance[];

	constructor(a = []) {
		this.a = a;
	}
	
	add(name = ''):void {
		this.a.push(new Allegiance(name));
	}
}

class Allegiance {
	maxRanks = 5;
	name: string;
	#allyRanks = 0;
	#allyPool = 0;
	favor = 0;
	#enemyRanks = 0;
	#enemyPool = 0;
	grudge = 0;

	constructor(name = '') {
        this.name = name;
    }

	set allyRanks(v: number) {
		this.setAllyRanks(v);
	}
	
	get allyRanks() {
		return this.#allyRanks;
	}
	
	setAllyRanks(v: number, adjustPool: boolean = true):number {
		const old = this.allyRanks;
		if (v > this.maxRanks) {
			v = this.maxRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#allyRanks = v;
		if (adjustPool) {
			this.allyPool += diff;
		}
		return v;
	}

	set allyPool(v: number) {
		this.setAllyPool(v);
	}
	
	setAllyPool(v: number):number {
		const old = this.allyPool;
		if (v > this.allyRanks) {
			v = this.allyRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#allyPool = v;
		return v;
	}

	set enemyRanks(v: number) {
		this.setEnemyRanks(v);
	}
	
	get enemyRanks() {
		return this.#enemyRanks;
	}
	
	setEnemyRanks(v: number, adjustPool: boolean = true):number {
		const old = this.enemyRanks;
		if (v > this.maxRanks) {
			v = this.maxRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#enemyRanks = v;
		if (adjustPool) {
			this.enemyPool += diff;
		}
		return v;
	}

	set enemyPool(v: number) {
		this.setEnemyPool(v);
	}
	
	setEnemyPool(v: number):number {
		const old = this.enemyPool;
		if (v > this.enemyRanks) {
			v = this.enemyRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#enemyPool = v;
		return v;
	}
}

class Wealth {
	rank = 0;
	lifestyle = 0;
}

class Stamina {
	#healthRanks = 0;
	#healthPool = 0;
	healthThreshold = 0;
	armor = 0;
	#moraleRanks = 0;
	#moralePool = 0;
	moraleThreshold = 0;
	grit = 0;

	set healthRanks(v: number) {
		this.setHealthRanks(v);
	}
	
	get healthRanks() {
		return this.#healthRanks;
	}
	
	setHealthRanks(v: number, adjustPool = true):number {
		const old = this.healthRanks;
    const max = Config.staminaBuildPoints - Config.staminaMin;
		if (v > max) {
			v = max;
		} else if (v < Config.staminaMin) {
			v = Config.staminaMin;
		}
		const diff = v - old;
		this.#healthRanks = v;
		if (adjustPool) {
			this.healthPool += diff;
		}
		return v;
	}

	set healthPool(v: number) {
		this.setHealthPool(v);
	}
	
	setHealthPool(v: number):number {
		const old = this.healthPool;
		if (v > this.healthRanks) {
			v = this.healthRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#healthPool = v;
		return v;
	}

	set moraleRanks(v: number) {
		this.setMoraleRanks(v);
	}
	
	get moraleRanks() {
		return this.#moraleRanks;
	}
	
	setMoraleRanks(v: number, adjustPool = true):number {
		const old = this.moraleRanks;
    const max = Config.staminaBuildPoints - Config.staminaMin;
		if (v > max) {
			v = max;
		} else if (v < Config.staminaMin) {
			v = Config.staminaMin;
		}
		const diff = v - old;
		this.#moraleRanks = v;
		if (adjustPool) {
			this.moralePool += diff;
		}
		return v;
	}

	set moralePool(v: number) {
		this.setMoralePool(v);
	}
	
	setMoralePool(v: number):number {
		const old = this.moralePool;
		if (v > this.moraleRanks) {
			v = this.moraleRanks;
		} else if (v < 0) {
			v = 0;
		}
		const diff = v - old;
		this.#moralePool = v;
		return v;
	}
}

class Gear {
	name = '';
	characterDefining = false;
}
*/

