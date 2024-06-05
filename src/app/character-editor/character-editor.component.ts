import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

// TODO: validation
// TODO: image url/upload/crop
// TODO: alternate views (play, print)
// TODO: load/save
// TODO: load from template

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
  adjectives = [{key: '0', value: ''}];
  invAbilities: any = {};
  invCats: any = {};
  invCatNames: Array<string> = [];
  genAbilities: any = {
    Lifestyle: 0,
    Health: 0,
    Morale: 0,
    HealthThreshold: 3,
    MoraleThreshold: 3,
    Armor: 0,
    Grit: 0,
  };
  allegiances = [new Allegiance(), new Allegiance()];
  gear = initGear(5);
  spheres: Array<string> = [];
  formGroup = new FormGroup({
    configS2S: new FormControl(''),
    configCharacterCount: new FormControl('4'),
    configAutoInvB: new FormControl('on'),
    configInvestigativeBuild: new FormControl('11'),
    configGeneralBuild: new FormControl('30'),
    configStaminaBuild: new FormControl('18'),
    configMinStamina: new FormControl('3'),
    configFreeAllies: new FormControl('2'),
    configFreeEnemies: new FormControl('1'),
    advancement: new FormControl('0'),
    name: new FormControl(''),
    tnk: new FormControl(''),
    profession: new FormControl(''),
    drive1: new FormControl(''),
    drive2: new FormControl(''),
    drive3: new FormControl(''),
    spotFrailty: new FormControl(''),
    sorceryAffects: new FormControl('health'),
    wealth: new FormControl('0'),
  });
  
  constructor() {
    for (const i in this.invAbilityDefs) {
      let a = this.invAbilityDefs[i];
      if (!(a.category in this.invCats)) {
        this.invCats[a.category] = [];
        this.invAbilities[a.category] = {};
        this.invCatNames.push(a.category);
      }
      this.invCats[a.category].push(a);
      this.invAbilities[a.category][a.name] = 0;
    }
    const gen = this.genAbilityDefs;
    for (let i = 0; i < gen.length; i++) {
      this.genAbilities[gen[i].name] = 0;
    }
  }
  
  aiToFrom(t: number, f?: number): Array<number> {
    if (t == undefined) {
      t = 0;
    }
    if (f == undefined) {
      if (t == 0) {
        return [];
      }
      f = 1;
    }
    const diff = t - f;
    let inc = 1;
    let len: number;
    if (diff < 0) {
      inc = -1;
      len = 1 - diff;
      [t, f] = [f, t];
    } else {
      len = 1 + diff;
    }
    const result = Array(len);
    let j = f;
    for (let i = 0 ; i < len; i++) {
      result[i] = j;
      j += inc;
    }
    return result;
  }
  
  /*get invCats() {
    return [...this.gameData.abilities.investigative.keys()];
  }*/
  
  calcArmor(): number {
    let result = 0;
    const re = /\(Armor (\d+)\)/g;
    for (let i = 0; i < this.gear.length; i++) {
      const matches = this.gear[i].value.matchAll(re);
      for (const match of matches) {
        result += parseInt(match[1], 10);
      }
    }
    return this.genAbilities.Armor = result;
  }

  calcGrit(): number {
    return this.genAbilities.Grit = (this.iconic >= 5) ? 1 : 0;
  }
  
  get iconic(): number {
    let result = 0;
    for (let i = 0; i < this.gear.length; i++) {
      if (this.gear[i].iconic) {
        result++;
      }
    }
    return result;
  }

  addAdjective() {
    if(this.adjectives.length < 5) {
      this.adjectives.push({key: this.adjectives.length + '', value: ''});
    }
  }

  delAdjective(i: number) {
    this.adjectives.splice(i, 1);
  }

  addAllegiance() {
    if(this.allegiances.length < 12) {
      this.allegiances.push(new Allegiance());
    }
  }

  delAllegiance(i: number) {
    this.allegiances.splice(i, 1);
  }

  addGear() {
    this.gear.push({key: this.gear.length + '', value: '', iconic: false});
  }

  delGear(i: number) {
    this.gear.splice(i, 1);
  }
  
  setInvAbility(cat: string, name: string, i: number): void {
    const a = this.invAbilities[cat];
    if (a[name] == i) {
      a[name]--;
    } else {
      a[name] = i;
    }
  }

  setGenAbility(name: string, i: number): void {
    if (this.genAbilities[name] == i) {
      this.genAbilities[name]--;
    } else {
      this.genAbilities[name] = i;
    }
    if (name == 'health' || name == 'morale') {
      this.genAbilities[name + 'Threshold'] = (i > 9) ? 4 : 3;
    }
  }
  
  genAbilityDefs = [
    new GeneralAbility("Athletics", "Dodge"),
    new GeneralAbility("Bind Wounds", "Plenty of Leeches"),
    new GeneralAbility("Burglary", "Fast Hands"),
    new GeneralAbility("Preparedness", "Flashback"),
    new GeneralAbility("Stealth", "Where’d She Go?"),
    new GeneralAbility("Sorcery", "Blast", true),
    new GeneralAbility("Sway", "Play to the Crowd", true),
    new GeneralAbility("Warfare", "Cleave", true),
  ];

  invAbilityDefs = [
    new InvestigativeAbility("Charm", "social"),
    new InvestigativeAbility("Command", "social"),
    new InvestigativeAbility("Intimidation", "social"),
    new InvestigativeAbility("Liar’s Tell", "social"),
    new InvestigativeAbility("Nobility", "social"),
    new InvestigativeAbility("Servility", "social"),
    new InvestigativeAbility("Taunt", "social"),
    new InvestigativeAbility("Trustworthy", "social"),
    new InvestigativeAbility("Felonious Intent", "sentinel"),
    new InvestigativeAbility("Laws & Traditions", "sentinel"),
    new InvestigativeAbility("Spirit Sight", "sentinel"),
    new InvestigativeAbility("Vigilance", "sentinel"),
    new InvestigativeAbility("Corruption", "sorcerer"),
    new InvestigativeAbility("Forgotten Lore", "sorcerer"),
    new InvestigativeAbility("Leechcraft", "sorcerer"),
    new InvestigativeAbility("Prophecy", "sorcerer"),
    new InvestigativeAbility("City’s Secrets", "thief"),
    new InvestigativeAbility("Ridiculous Luck", "thief"),
    new InvestigativeAbility("Scurrilous Rumors", "thief"),
    new InvestigativeAbility("Skulduggery", "thief"),
    new InvestigativeAbility("Know Monstrosities", "warrior"),
    new InvestigativeAbility("Spot Frailty", "warrior", true),
    new InvestigativeAbility("Tactics of Death", "warrior"),
    new InvestigativeAbility("Wilderness Mastery", "warrior"),
  ];

  tup = {
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
    lifestyle: [
      "Squalid",
      "Struggling",
      "Comfortable",
      "Wealthy",
      "Opulent",
    ]
  };
}

function initGear(len = 0): {key: string, value: string, iconic: boolean}[] {
  var result: {key: string, value: string, iconic: boolean}[]; 
  result = [];
  for (let i = 0; i < len; i++) {
    result.push({key: i + '', value: '', iconic: false});
  }
  return result;
}

class GeneralAbility {
  name: string;
  talent: string;
  combat: boolean;
  constructor(name: string, talent: string, combat = false) {
    this.name = name;
    this.talent = talent;
    this.combat = combat;
  }
}

class InvestigativeAbility {
  name: string;
  category: string;
  healthMorale: boolean;
  constructor(name: string, category: string, healthMorale = false) {
    this.name = name;
    this.category = category;
    this.healthMorale = healthMorale;
  }
}

class Allegiance {
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
		const old = this.#allyRanks;
		if (v == old) {
			v--;
		}
		const diff = v - old;
		this.#allyRanks = v;
		if (adjustPool) {
			this.#allyPool += diff;
		}
		return v;
	}

	set allyPool(v: number) {
		if (v == this.#allyPool) {
			v--;
		}
		this.#allyPool = v;
	}

	set enemyRanks(v: number) {
		this.setEnemyRanks(v);
	}
	
	get enemyRanks() {
		return this.#enemyRanks;
	}
	
	setEnemyRanks(v: number, adjustPool: boolean = true):number {
		const old = this.#enemyRanks;
		if (v == old) {
			v--;
		}
		const diff = v - old;
		this.#enemyRanks = v;
		if (adjustPool) {
			this.#enemyPool += diff;
		}
		return v;
	}

	set enemyPool(v: number) {
		if (v == this.#enemyPool) {
			v--;
		}
		this.#enemyPool = v;
	}
}
