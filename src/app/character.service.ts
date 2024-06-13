import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { CompatibilityService } from './compatibility.service';
import { SaveSlotService } from './saveslot.service';
import { TablesService } from './tables.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  slot = inject(SaveSlotService);
  
  store = new CharacterStorage();

  autoload(): Character {
    const c = CharacterStorage.new();
    if (c) {
      return c;
    } else {
      return new Character();
    }
  }
  
  load(key: string): Character {
    return CharacterStorage.new(key);
  }
  
  copy(key: string) {
    CharacterStorage.copy(key);
  }
  
  import(j: string): Character {
    return CharacterStorage.import(j);
  }
  
  new(): Character {
    return new Character();
  }
  
  readonly version = Character.VER;
}

class CharacterStorage {
  static registry: Record<string, Character> = {};

  static load(key: string) {
    return this.new(key);
  }
  
  static copy(key: string) {
    const s = localStorage.getItem(key);
    if (s === null) {
      console.trace('key not in localStorage!', key);
    } else {
      localStorage.setItem(SaveSlotService.prototype.nextKey, s);
    }
  }
  
  static new(slotKey: string | null = null) {
    if (slotKey === null) {
      slotKey = CookieService.prototype.get('_c');
      if (!slotKey) {
        const c = Character.newProxy();
        this.registry[c.slotKey] = c;
        c.canSave = true;
        return c;
      }
    }
    const mc = this.registry[slotKey];
    if (mc) {
      return mc;
    } else {
      const c = Character.newProxy(slotKey);
      this.registry[slotKey] = c;
      c.canSave = true;
      return c;
    }
  }
  
  static import(o: any) {
    const c = Character.newProxy();
    CompatibilityService.prototype.update(o);
    c.set(o);
    this.registry[c.slotKey] = c;
    c.canSave = true;
    return c;
  }
}

class Character {
  util = inject(UtilityService);
  tbl = inject(TablesService);
  compat = inject(CompatibilityService);
  static tbl = new TablesService();

  static readonly VER = 'α2';

  static newProxy(slotKey: string | null = null) {
    const c = new Character(slotKey);
    return c.proxy(c);
  }

  static newAbilities() {
    const inv: Record<string, Record<string, Ability>> = {};
    const gen: Record<string, Ability> = {};
    for (const category in this.tbl.invDef) {
      inv[category] = {};
      for (const ability in this.tbl.invDef[category]) {
        inv[category][ability] = new Ability();
      }
    }
    for (const ability in this.tbl.genDef) {
      gen[ability] = new Ability();;
    }
    return {
      investigative: inv,
      general: gen,
      allegiances: [new Allegiance(), new Allegiance()],
    };
  }

  /// instance properties ///

  VER = Character.VER;
  #cookie = inject(CookieService);
  #slot = inject(SaveSlotService);
  #slotKey: string;
  ts0 = 0;
  ts = 0;
  #canSave = false;
  config = {
    s2s: false,
    characterCount: '4',
    investigativeBuild: '10',
    generalBuild: '30',
    staminaBuild: '18',
    minStamina: '3', // TODO: implement
    freeAllies: '2',
    freeEnemies: '1',
  };
  advancement = {
    points: '0',
    genB: '0',
    stamB: '0',
    invB: '0',
    enemy: '0',
  };
  trait = {
    Name: '',
    TNK: false,
    Profession: '',
    Adjectives: [''] as string[],
    Drives: [new Drive(), new Drive(), new Drive()],
    Wealth: '0',
    Lifestyle: 0,
    Gear: new GearList(),
    Spheres: [] as string[],
    portraitUrl: '',
    hmSpotFrailty: true,
    hmSorceryAffects: true,
  };
  ability = Character.newAbilities();

  constructor(slotKey: string | null = null) {
    if (slotKey === null) {
      this.#slotKey = this.#slot.nextKey;
      this.ts0 = this.timestamp;
      this.#canSave = true;
    } else {
      this.#slotKey = slotKey;
      if (this.#badSlotKey) {
        const k = this.#slotKey;
        this.#slotKey = this.#slot.nextKey;
        const j = localStorage.getItem(k);
        if (j) {
          localStorage.setItem(this.#slotKey, j);
        }
        localStorage.removeItem(k);
      }
      this.load();
    }
    this.#cookie.set('_c', this.#slotKey);
  }
  
  get #badSlotKey() {
    return false;
    // TODO enable
    return this.#slotKey == 'char';
  }

  set(o: any) {
    Object.assign(this.config, o.config);
    Object.assign(this.advancement, o.advancement);
    Object.assign(this.trait, o.trait);
    Object.assign(this.ability, o.ability);
    this.trait.Name = o.trait.Name;
    //this.formGroup.setValue(o.g);
    /*for (let def of this.invAbilityDefs) {
      this.invAbilities[def.category][def.name].set(o.ai[def.category][def.name]);
    }*/
    /*for (let name in this.genAbilities) {
      this.genAbilities[name].set(o.ag[name]);
    }*/
    /*this.adjectives = o.x.adj;
    if (this.drives.length > o.x.d.length) {
      this.drives.splice(o.x.d.length);
    }*/
    /*o.x.d.forEach((d: Drive, i: number) => {
      if (i > this.drives.length - 1) {
        this.drives[i] = new Drive();
      }
      this.drives[i].set(d);
    });*/
    /*if (this.allegiances.length > o.x.all.length) {
      this.allegiances.splice(o.x.all.length);
    }
    o.x.all.forEach((a: Allegiance, i: number) => {
      if (i > this.allegiances.length - 1) {
        this.allegiances[i] = new Allegiance();
      }
      this.allegiances[i].set(a);
    });*/
    /*this.lifestyle = o.x.ls;*/
    this.trait.Gear.set(o.trait.Gear);
    /*this.spheres = o.x.s;*/
  }

  export() {
    return JSON.stringify(this);
  }
  
  save() {
    if (this.#canSave) {
      this.ts = this.timestamp;
      const j = JSON.stringify(this);
      console.log(this.#slotKey, this);
      // TODO: enable
      //localStorage.setItem(this.#slotKey, j); // TODO: LZString.compress(j)
    }
  }

  load() {
    let j;
    try {
      j = localStorage.getItem(this.#slotKey); // TODO: LZString.decompress(...)
    } catch (e) {
      console.trace(e); // TODO: only in dev
    }
    if (j) {
      const o = JSON.parse(j);
      this.compat.update(o);
      this.set(o);
    }
    this.#canSave = true;
  }

  proxy<T extends object>(o: T): T {
    const _this = this;
    return new Proxy<T>(o, {
      get: (self: {[n: string]: any}, prop: string) => prop in self ? self[prop] : undefined,
      set: (self: {[n: string]: any}, prop: string, value: any) => {
        if (prop in self) {
          self[prop] = value;
          _this.save();
          return true;
        }
        return false;
      },
    });
  }

  get slotKey() {
    return this.#slotKey;
  }
  
  get canSave() {
    return this.#canSave;
  }
  
  set canSave(v) {
    this.#canSave = v;
  }

  get timestamp() {
    return Math.floor((new Date()).getTime() / 1000);
  }

  addAllegiance() {
    this.ability.allegiances.push(new Allegiance());
    //this.saveToLocal(); // TODO: confirm unneeded
  }

  addGear() {
    this.trait.Gear.push(new Gear());
    //this.saveToLocal(); // TODO: confirm unneeded
  }

  get healthThreshold() {
    return this.ability.general['Health'].ranks > 8 ? 4 : 3;
  }
  
  get armor() {
    let result = 0;
    const re = /\(Armor (\d+)\)/g;
    for (let g of this.trait.Gear) {
      const matches = g.value.matchAll(re);
      for (const match of matches) {
        const a = parseInt(match[1], 10);
        if (a > result) {
          result = a;
        }
      }
    }
    return result;
  }

  get moraleThreshold() {
    return this.ability.general['Morale'].ranks > 8 ? 4 : 3;
  }
  
  get grit() {
    return (this.iconic >= 5) ? 1 : 0;
  }
  
  get iconic() {
    let result = 0;
    for (let g of this.trait.Gear) {
      if (g.iconic && g.value != '') {
        result++;
      }
    }
    return result;
  }
  
  get invProfession(): string {
    // this bit seems to have been a hallucination, or maybe Kevin said it on the Discord
    /*for (let a of this.allegiances) {
      if (a.name && (a.ally.ranks >= 4 || a.enemy.ranks >= 4)) {
        return a.name;
      }
    }*/
    const c = new Set<string>();
    const i = this.ability.investigative;
    for (const cat in i) {
      for (const name in i[cat]) {
        if (i[cat][name].ranks > 0) {
          c.add(cat);
        }
      }
    }
    /*this.ability.investigative.forEach((r: Record<string, Ability>, cat: string) => {
      r.forEach((a: Ability, name: string) => {
        if (a.ranks > 0) {
          c.add(cat);
        }
      });
    });*/
    if (c.size == 1) {
      return c.keys().next().value as string;
    }
    c.delete('Social');
    if (c.size == 1) {
      return c.keys().next().value as string;
    }
    return '';
  }

  get unspentAdvancement(): number {
    if (this.advancement.points === null) {
      return 0;
    } else {
      let u = this.util.int(this.advancement.points);
      u -= this.util.int(this.advancement.genB);
      u -= this.util.int(this.advancement.stamB);
      u -= this.util.int(this.advancement.invB) * 3;
      u -= this.util.int(this.advancement.enemy) * 3;
      return u;
    }
  }
  
  get drivesEntered(): number {
    let r = 0;
    for (let d of this.trait.Drives) {
      if (d.value) {
        r++;
      }
    }
    return r;
  }
  
  get invUnspent(): number {
    let r = this.util.int(this.config.investigativeBuild) + this.util.int(this.advancement.invB) + (this.invProfession ? 1 : 0);
    for (const cat in this.ability.investigative) {
      for (const name in this.ability.investigative[cat]) {
        r -= this.ability.investigative[cat][name].ranks;
      }
    }
    let fa = this.util.int(this.config.freeAllies);
    let fe = this.util.int(this.config.freeEnemies) - this.util.int(this.advancement.enemy);
    for (const a of this.ability.allegiances) {
      fa -= a.ally.ranks;
      fe -= a.enemy.ranks;
    }
    if (fa < 0) {
      r += fa;
    }
    if (fe < 0) {
      r += fe;
    }
    return r;
  }

  get genUnspent(): number {
    let r = this.util.int(this.config.generalBuild) + this.util.int(this.advancement.genB);
    for (const name in this.ability.general) {
      r -= this.ability.general[name].ranks;
    }
    return r;
  }

  get genTooHigh(): boolean {
    let h1 = 0;
    let h2 = 0;
    for (const name in this.ability.general) {
      const rank = this.ability.general[name].ranks;
      if (rank > h1) {
        h2 = h1;
        h1 = rank;
      } else if (rank > h2) {
        h2 = rank;
      }
    }
    return h1 > 2 && h2 * 2 < h1;
  }
  
  get sorcWithoutCorr(): boolean {
    return this.ability.general['Sorcery'].ranks > 0 && this.ability.investigative['Sorcerer']['Corruption'].ranks == 0;
  }
  
  get moreSphereThanCorr(): boolean {
    return this.trait.Spheres.length > this.ability.investigative['Sorcerer']['Corruption'].ranks;
  }
  
  get freeAllies(): number {
    let r = 0;
    for (const a of this.ability.allegiances) {
      r += a.ally.ranks;
    }
    const fa = this.util.int(this.config.freeAllies);
    if (r < fa) {
      return fa - r;
    }
    return 0;
  }

  get freeEnemies(): number {
    let r = 0;
    for (const a of this.ability.allegiances) {
      r += a.enemy.ranks;
    }
    const fe = this.util.int(this.config.freeEnemies);
    if (r < fe - this.util.int(this.advancement.enemy)) {
      return fe - r;
    }
    return 0;
  }

  get blankFactions(): number {
    let r = 0;
    for (const a of this.ability.allegiances) {
      if (a.name == '' && (a.ally.ranks || a.favor || a.enemy.ranks || a.grudge )) {
        r++;
      }
    }
    return r;
  }

  get staminaUnspent(): number {
    let r = this.util.int(this.config.staminaBuild) + this.util.int(this.advancement.stamB);
    r -= this.ability.general['Health'].ranks;
    r -= this.ability.general['Morale'].ranks;
    return r;
  }
  
  get spheresUnspent(): number {
    let r = this.ability.investigative['Sorcerer']['Corruption'].ranks;
    for (let s of this.trait.Spheres) {
      if (s) {
        r--;
      }
    }
    return r;
  }
  
  get dupSpheres(): string[] {
    let a: Record<string, boolean> = {};
    let d: Record<string, boolean> = {};
    for (let s of this.trait.Spheres) {
      if (s != '') {
        if (s in a) {
          d[s] = true;
        } else {
          a[s] = true;
        }
      }
    }
    return Object.keys(d);
  }

  get nonIconicGear(): string {
    const acc = [];
    for (let i = 0; i < this.trait.Gear.length; i++) {
      if (!this.trait.Gear[i].iconic && this.trait.Gear[i].value.length) {
        acc.push(this.trait.Gear[i].value);
      }
    }
    return acc.join(', ');
  }


}

class Ability {
  #ranks = 0;
  pool = 0;
  
  set ranks(r: number) {
    const prev = this.#ranks;
    const diff = r - prev;
    this.#ranks = r;
    this.pool += diff;
    if (this.pool < 0) {
      this.pool = 0;
    }
  }
  
  get ranks() {
    return this.#ranks;
  }

  clickRank(i: number) {
    if (this.ranks == i) {
      this.ranks--;
    } else {
      this.ranks = i;
    }
  }
  
  clickPool(i: number): void {
    if (this.pool > i) {
      this.pool++;
    } else {
      this.pool--;
    }
  }
  
  toJSON() {
    return [this.#ranks, this.pool];
  }

  set val(a: [number, number]) {
    [this.#ranks, this.pool] = a;
  }
}

class Drive {
  value = '';
  pool = 1;

  toJSON() {
    return [this.pool, this.value];
  }
  
  set val(a: [number, string]) {
    [this.pool, this.value] = a;
  }
}

class Allegiance {
  name = '';
  ally = new Ability();
  favor = 0;
  enemy = new Ability();
  grudge = 0;

  toJSON() {
    return [this.name, this.ally, this.favor, this.enemy, this.grudge];
  }
  
  set val(a: [string, [number, number], number, [number, number], number]) {
    [this.name, this.ally.val, this.favor, this.enemy.val, this.grudge] = a;
  }
}

class Gear {
  iconic = false;
  value = '';
  
  toJSON() {
    return [this.iconic, this.value];
  }
  
  set val(a: [boolean, string]) {
    [this.iconic, this.value] = a;
  }
}

class GearList extends Array<Gear> {
  set(a: [boolean, string][]) {
    if (this.length > a.length) {
      this.splice(a.length);
    }
    for (let i = 0; i < a.length; i++) {
      if (i > this.length - 1) {
        this[i] = new Gear();
      }
      this[i].val = a[i];
    }
  }
}
