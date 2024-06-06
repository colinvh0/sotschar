import { AfterRenderPhase, Component, Input, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

// TODO: validation
// TODO: image url/upload/crop
// TODO: load/save
// TODO: keep current character in localstorage
// TODO: load from template
// TODO: factions list editor
// TODO: advancement (explicitly buy Build points)
// TODO: fix text knockouts in h4s
// TODO: play/print: adjectives, allegiances
// TODO KC: handle favors/grudges
// TODO KC: square General checkboxes??
// TODO KC: adjectives just a text field?

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [CookieService],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
  cookies = inject(CookieService);

  #mode = 'off';
  canSave = false;
  adjectives = [''];
  drives = [new Drive(), new Drive(), new Drive()];
  invAbilities: Record<string, Record<string, Ability>> = {};
  genAbilities: Record<string, Ability> = {
    Health: new Ability(),
    Morale: new Ability(),
  };
  extAbilities: Record<string, number> = {
    Lifestyle: 0,
    HealthThreshold: 3,
    MoraleThreshold: 3,
    Armor: 0,
    Grit: 0,
  };
  allegiances = [new Allegiance(), new Allegiance()];
  gear = initGear(5);
  spheres: Array<string> = [];
  formGroup = new FormGroup({
    configS2S: new FormControl(false),
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
    portraitUrl: new FormControl(''),
    spotFrailty: new FormControl('Health'),
    sorceryAffects: new FormControl('Health'),
    wealth: new FormControl('0'),
  });
  
  constructor() {
    this.initMode();
    this.initFields();
    afterNextRender(() => {
      this.loadFromLocal();
      this.initSubscribe();
    }, {phase: AfterRenderPhase.Read});
  }
  
  loadFromLocal(): void {
    let c;
    try {
      c = localStorage.getItem('char');
    } catch (e) {
      console.trace(e);
    }
    if (c) {
      this.json = c;
    }
    this.canSave = true;
  }
  
  initFields(): void {
    for (const i in this.invAbilityDefs) {
      let a = this.invAbilityDefs[i];
      if (!(a.category in this.invAbilities)) {
        this.invAbilities[a.category] = {};
      }
      this.invAbilities[a.category][a.name] = new Ability();
    }
    const gen = this.genAbilityDefs;
    for (let i = 0; i < gen.length; i++) {
      this.genAbilities[gen[i].name] = new Ability();
    }
  }

  set json(json: string) {
    const o = JSON.parse(json);
    this.formGroup.setValue(o.g);
    this.extAbilities = o.e;
    for (let def of this.invAbilityDefs) {
      this.invAbilities[def.category][def.name].set(o.ai[def.category][def.name]);
    }
    for (let name in this.genAbilities) {
      this.genAbilities[name].set(o.ag[name]);
    }
    o.x.d.forEach((d: Drive, i: number) => {
      this.drives[i].set(d);
    });
    o.x.all.forEach((a: Allegiance, i: number) => {
      this.allegiances[i].set(a);
    });
    o.x.g.forEach((g: Gear, i: number) => {
      this.gear[i].set(g);
    });
    this.spheres = o.x.s;
  }

  get json(): string {
    return JSON.stringify({
      g: this.formGroup.getRawValue(),
      e: this.extAbilities,
      ai: this.invAbilities,
      ag: this.genAbilities,
      x: {
        adj: this.adjectives,
        d: this.drives,
        all: this.allegiances,
        g: this.gear,
        s: this.spheres,
      },
    });
  }

  initSubscribe(): void {
    const self = this;
    for (const name in this.formGroup.controls) {
      this.formGroup.get(name)!.valueChanges.subscribe((formValue) => {
        self.saveToLocal();
      });
    }
  }
  
  saveToLocal(): void {
    if (this.canSave) {
      localStorage.setItem('char', this.json);
    }
  }
  
  initMode(): void {
    const m = this.cookies.get('_m');
    if (m) {
      this.#mode = m;
    }
  }
  
  get mode() {
    return this.#mode;
  }
  
  set mode(m: string) {
    this.#mode = m;
    this.cookies.set('_m', m);
  }
  
  get invCatNames(): string[] {
    return Object.keys(this.invAbilities);
  }

  invNames(category: string): string[] {
    return Object.keys(this.invAbilities[category]);
  }

  fmt(i: number): string {
    if (i >= 0) {
      return i + '';
    }
    return '−' + -i;
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
        const a = parseInt(match[1], 10);
        if (a > result) {
          result = a;
        }
      }
    }
    if (this.extAbilities['Armor'] != result) {
      this.extAbilities['Armor'] = result;
      this.saveToLocal();
    }
    return result;
  }

  calcGrit(): number {
    const result = (this.iconic >= 5) ? 1 : 0;
    if (this.extAbilities['Grit'] != result) {
      this.extAbilities['Grit'] = result;
      this.saveToLocal();
    }
    return result;
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
  
  get nonIconicGear(): string {
    const acc = [];
    for (let i = 0; i < this.gear.length; i++) {
      if (!this.gear[i].iconic && this.gear[i].value.length) {
        acc.push(this.gear[i].value);
      }
    }
    return acc.join(', ');
  }
  
  staminaPlayColor(i: number): string {
    if (i < 0 && i >= -5) {
      return 'yellow';
    }
    if (i < -5 && i >= -10) {
      return 'orange';
    }
    if (i < -10) {
      return 'red';
    }
    return '';
  }

  staminaPrintColor(i: number): string {
    if (i < 0) {
      return 'orange';
    }
    if (i > 0) {
      return 'green';
    }
    return '';
  }

  addAdjective() {
    if(this.adjectives.length < 5) {
      this.adjectives.push('');
      this.saveToLocal();
    }
  }

  delAdjective(i: number) {
    this.adjectives.splice(i, 1);
    this.saveToLocal();
  }

  addAllegiance() {
    if(this.allegiances.length < 12) {
      this.allegiances.push(new Allegiance());
      this.saveToLocal();
    }
  }

  delAllegiance(i: number) {
    this.allegiances.splice(i, 1);
    this.saveToLocal();
  }

  addGear() {
    this.gear.push(new Gear());
    this.saveToLocal();
  }

  delGear(i: number) {
    this.gear.splice(i, 1);
    this.saveToLocal();
  }
  
  setInvAbility(cat: string, name: string, i: number): void {
    const a = this.invAbilities[cat][name];
    if (a.ranks == i) {
      a.ranks--;
    } else {
      a.ranks = i;
    }
    this.saveToLocal();
  }

  adjustInvPool(cat: string, name: string, increment = true): void {
    const a = this.invAbilities[cat][name];
    if (increment) {
      a.pool++;
    } else {
      a.pool--;
    }
    this.saveToLocal();
  }

  setGenAbility(name: string, i: number): void {
    const a = this.genAbilities[name];
    if (a.ranks == i) {
      a.ranks--;
    } else {
      a.ranks = i;
    }
    if (name == 'Health' || name == 'Morale') {
      this.extAbilities[name + 'Threshold'] = (i > 9) ? 4 : 3;
    }
    this.saveToLocal();
  }
  
  adjustGenPool(name: string, increment = true): void {
    const a = this.genAbilities[name];
    if (increment) {
      a.pool++;
    } else {
      a.pool--;
    }
    this.saveToLocal();
  }

  setAlly(i: number, v: number): void {
    const a = this.allegiances[i];
    if (a.ally.ranks == v) {
      a.ally.ranks--;
    } else {
      a.ally.ranks = v;
    }
    this.saveToLocal();
  }
  
  setEnemy(i: number, v: number): void {
    const a = this.allegiances[i];
    if (a.enemy.ranks == v) {
      a.enemy.ranks--;
    } else {
      a.enemy.ranks = v;
    }
    this.saveToLocal();
  }
  
  adjustAllyPool(i: number, increment = true): void {
    const a = this.allegiances[i];
    if (increment) {
      a.ally.pool++;
    } else {
      a.ally.pool--;
    }
    this.saveToLocal();
  }
  
  invDef(cat: string, name: string): InvestigativeAbility|undefined {
    for (let a of this.invAbilityDefs) {
      if (a.category == cat && a.name == name) {
        return a;
      }
    }
    return;
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
    new InvestigativeAbility("Charm", "Social"),
    new InvestigativeAbility("Command", "Social"),
    new InvestigativeAbility("Intimidation", "Social"),
    new InvestigativeAbility("Liar’s Tell", "Social"),
    new InvestigativeAbility("Nobility", "Social"),
    new InvestigativeAbility("Servility", "Social"),
    new InvestigativeAbility("Taunt", "Social"),
    new InvestigativeAbility("Trustworthy", "Social"),
    new InvestigativeAbility("Felonious Intent", "Sentinel"),
    new InvestigativeAbility("Laws & Traditions", "Sentinel"),
    new InvestigativeAbility("Spirit Sight", "Sentinel"),
    new InvestigativeAbility("Vigilance", "Sentinel"),
    new InvestigativeAbility("Corruption", "Sorcerer"),
    new InvestigativeAbility("Forgotten Lore", "Sorcerer"),
    new InvestigativeAbility("Leechcraft", "Sorcerer"),
    new InvestigativeAbility("Prophecy", "Sorcerer"),
    new InvestigativeAbility("City’s Secrets", "Thief"),
    new InvestigativeAbility("Ridiculous Luck", "Thief"),
    new InvestigativeAbility("Scurrilous Rumors", "Thief"),
    new InvestigativeAbility("Skulduggery", "Thief"),
    new InvestigativeAbility("Know Monstrosities", "Warrior"),
    new InvestigativeAbility("Spot Frailty", "Warrior", true),
    new InvestigativeAbility("Tactics of Death", "Warrior"),
    new InvestigativeAbility("Wilderness Mastery", "Warrior"),
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

function initGear(len = 0): Gear[] {
  var result: Gear[]; 
  result = [];
  for (let i = 0; i < len; i++) {
    result.push(new Gear());
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

class Drive {
  value = '';
  pool = 1;
  /*i: number;
  constructor(i: number) {
    this.i = i;
  }*/

  set(o: Drive): void {
    this.value = o['value'] as string;
    this.pool = o['pool'] as number;
  }
}

class Gear {
  value = '';
  iconic = false;
  /*i: number;
  constructor(i: number) {
    this.i = i;
  }*/

  set(o: Gear): void {
    this.value = o['value'] as string;
    this.iconic = o['iconic'] as boolean;
  }
}

class Ability {
  #ranks: number;
  pool: number;
  
  constructor(init = 0) {
    this.#ranks = this.pool = init;
  }

	set ranks(v: number) {
		this.setRanks(v);
	}
	
	get ranks() {
		return this.#ranks;
	}
	
	setRanks(v: number, adjustPool: boolean = true):number {
		const old = this.#ranks;
		const diff = v - old;
		this.#ranks = v;
		if (adjustPool) {
			this.pool += diff;
      if (this.pool < 0) {
        this.pool = 0;
      }
		}
		return v;
	}

  set(o: Ability): void {
    this.#ranks = o['ranks'];
    this.pool = o['pool'];
  }
  
  toJSON(key: string) {
    return {ranks: this.#ranks, pool: this.pool};
  }
}

class Allegiance {
	name: string;
	ally = new Ability();
	favor = 0;
	enemy = new Ability();
	grudge = 0;

	constructor(name = '') {
    this.name = name;
  }

  set(o: Allegiance): void {
    this.ally.set(o['ally']);
    this.favor = o['favor'];
    this.enemy.set(o['enemy']);
    this.grudge = o['grudge'];
  }
}
