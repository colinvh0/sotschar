import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  genAbilities: any = {
    lifestyle: 0,
    health: 0,
    morale: 0,
    healthThreshold: 3,
    moraleThreshold: 3,
    armor: 0,
    grit: 0,
  };
  allegiances = [{key: '0', value: ''}, {key: '1', value: ''}];
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
    wealth: new FormControl('0'),
    sorceryAffects: new FormControl('health'),
  });
  
  constructor() {
    const inv = this.gameData.abilities.investigative;
    type invK = keyof typeof inv;
    let k: invK;
    for (k in inv) {
      let category = inv[k];
      this.invAbilities[k] = {};
      for (let i = 0; i < category.length; i++) {
        this.invAbilities[k][category[i]] = 0;
      }
    }
    const gen = this.gameData.abilities.general;
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
    return this.genAbilities.armor = result;
  }

  calcGrit(): number {
    return this.genAbilities.grit = (this.iconic >= 5) ? 1 : 0;
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
      this.allegiances.push({key: this.allegiances.length + '', value: ''});
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

  gameData = {
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
        new GeneralAbility("Athletics", "Dodge"),
        new GeneralAbility("Bind Wounds", "Plenty of Leeches"),
        new GeneralAbility("Burglary", "Fast Hands"),
        new GeneralAbility("Preparedness", "Flashback"),
        new GeneralAbility("Stealth", "Where’d She Go?"),
        new GeneralAbility("Sorcery", "Blast", true),
        new GeneralAbility("Sway", "Play to the Crowd", true),
        new GeneralAbility("Warfare", "Cleave", true),
      ],
      investigative: {
        social: [
          "Charm",
          "Command",
          "Intimidation",
          "Liar’s Tell",
          "Nobility",
          "Servility",
          "Taunt",
          "Trustworthy",
        ],
        sentinel: [
          "Felonious Intent",
          "Laws & Traditions",
          "Spirit Sight",
          "Vigilance",
        ],
        sorcerer: [
          "Corruption",
          "Forgotten Lore",
          "Leechcraft",
          "Prophecy",
        ],
        thief: [
          "City’s Secrets",
          "Ridiculous Luck",
          "Scurrilous Rumors",
          "Skulduggery",
        ],
        warrior: [
          "Know Monstrosities",
          "Spot Frailty",
          "Tactics of Death",
          "Wilderness Mastery",
        ],
      }
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

/*@Component({
  selector: 'inv-attr-edit-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <h5 class="head">{{ category }}</h5>
    @for (name of gameData.abilities.investigative[category.toLowerCase()]; track name;) {
      <div class="ability">
        <div class="ability-name">{{ name }}</div>
        <div *ngIf="category.toLowerCase() == 'warrior' && name == 'Spot Frailty'">
          <div class="label-tiny" *ngIf="invAbilities.warrior['spot frailty'] >= 1">
            <div><label><input type="radio" formControlName="spotFrailty" value="health"> Health</label></div>
            <div><label><input type="radio" formControlName="spotFrailty" value="morale"> Morale</label></div>
          </div>
        </div>
        <div class="ability-value">
          <div *ngFor="let i of aiToFrom(5)">
            <div
              class="circle"
              [ngClass]="'circle' + ((invAbilities[category.toLowerCase()][name.toLowerCase()] >= i) ? ' filled' : '')"
              (click)="setInvAbility(category.toLowerCase(), name.toLowerCase(), i)"
            ></div>
          </div>
        </div>
      </div>
    }
  `
})
class InvAttrEditSectionComponent {
  @Input()
  category: string = '';
}*/
