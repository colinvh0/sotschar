import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { TablesService } from './tables.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  #cookie = inject(CookieService);
  util = inject(UtilityService);
  tbl = inject(TablesService);

  registry: Record<string, Character> = {};

  #selected: SaveSlot | null = null;

  get nextKey() {
    if (typeof localStorage !== 'undefined') {
      const pre = 'chr';
      let i = 0;
      while (localStorage.getItem(pre + ++i) !== null) {
        if (i > localStorage.length) { // if we're here, the pigeonhole principle broke or I made the while loop wrong
          console.trace('wtf no!');
          break;
        }
      }
      return pre + i;
    }
    return '';
  }

  get keys() {
    const re = /chr(\d+)/;
    let a = new Array<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null) {
        if (k.match(re)) {
          a.push(k);
        }
      }
    }
    return a;
  }
  
  all() {
    const result = this.keys.map((k) => new SaveSlot(k)).sort((a, b) => { return parseInt(b.ts, 10) - parseInt(a.ts, 10); });
    return result;
  }
  
  blank() {
    return Character.blank(this);
  }

  autoload() {
    const key = this.cookie;
    if (key) {
      return this.load(key);
    }
    const c = this.new();
    this.cookie = c.slotKey;
    return c;
  }
  
  new() {
    const key = this.nextKey;
    const c = Character.new(this, key, true);
    this.registry[key] = c;
    return c.setProxies();
  }
  
  copy(){
    if (this.selected === null) {
      throw 'slot.selected is null';
    }
    const key = this.selected.key;
    const s = localStorage.getItem(key);
    if (s === null) {
      throw 'key not in localStorage: ' + key;
    }
    let c = this.registry[key];
    if (!c) {
      c = Character.new(this, key);
    }
    c.slotKey = this.nextKey;
    this.cookie = c.slotKey;
    c = c.setProxies();
    c.save();
    return c;
  }
  
  load(key: string | null = null) {
    if (key === null) {
      if (this.selected === null) {
        throw 'slot.selected is null';
      }
      key = this.selected.key;
    }
    const mc = this.registry[key];
    if (mc) {
      this.cookie = key;
      return mc;
    }
    const c = Character.new(this, key);
    if (this.badSlotKey(key)) {
      c.slotKey = this.nextKey;
      c.save();
      localStorage.removeItem(key);
    }
    this.registry[c.slotKey] = c;
    this.cookie = c.slotKey;
    return c.setProxies();
  }
  
  import(o: any) {
    const c = Character.new(this, this.nextKey);
    Compatibility.update(o);
    c.set(o);
    this.registry[c.slotKey] = c;
    this.cookie = c.slotKey;
    return c.setProxies();
  }

  set cookie(key) {
    this.#cookie.set('_c', key);
  }
  
  get cookie() {
    return this.#cookie.get('_c');
  }
  
  select(key: string) {
    this.#selected = new SaveSlot(key);
  }
  
  set selected(s: SaveSlot | null) {
    this.#selected = s;
  }

  get selected(): SaveSlot | null {
    const ss = this.keys;
    if (ss.length == 0) {
      return this.#selected = null;
    }
    if (ss.length == 1) {
      return new SaveSlot(ss[0]);
    }
    if (this.#selected === null) {
      return null;
    }
    if (ss.indexOf(this.#selected.key) == -1) {
      return this.#selected = null;
    }
    return this.#selected;
  }

  isSelected(key: string): boolean {
    return !!this.#selected && this.#selected.key == key
  }
  
  badSlotKey(key: string): boolean {
    // TODO enable
    return false;
    //return key == 'char';
  }
  
  readonly version = Character.VER;
}

class Character {
  static readonly VER = 'α2';
  
  static new(cs: CharacterService, slotKey: string, fresh = false) {
    const c = new Character(cs, slotKey, fresh);
    return c;//.setProxies();
  }
  
  static blank(cs: CharacterService) {
    return new Character(cs, '', true);
  }

  /// instance properties ///

  VER = Character.VER;
  #cs: CharacterService;
  #slotKey: string;
  ts0 = 0;
  ts = 0;
  #proxied = false;
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
    Adjectives: ['', ''] as string[],
    Drives: [new Drive(), new Drive(), new Drive()],
    Wealth: '0',
    Lifestyle: 0,
    Gear: new GearList(),
    Spheres: [] as string[],
    portraitUrl: '',
    hmSpotFrailty: true,
    hmSorceryAffects: true,
  };
  ability: any;

  private constructor(cs: CharacterService, slotKey: string, fresh: boolean) {
    this.#cs = cs;
    this.#slotKey = slotKey;
    this.ability = this.newAbilities();
    if (fresh) {
      this.ts0 = this.#cs.util.timestamp;
    } else {
      this.load();
    }
  }
  
  setProxies() {
    this.config = this.proxy(this.config);
    this.advancement = this.proxy(this.advancement);
    this.trait.Adjectives = this.proxy(this.trait.Adjectives);
    this.trait.Drives = this.proxy(this.trait.Drives);
    this.trait.Gear = this.proxy(this.trait.Gear);
    this.trait.Spheres = this.proxy(this.trait.Spheres);
    this.trait = this.proxy(this.trait);
    this.ability = this.proxy(this.ability);
    for (const cat in this.ability.investigative) {
      const category = this.ability.investigative[cat];
      for (const name in category) {
        category[name] = this.proxy(category[name]);
      }
    }
    for (const name in this.ability.general) {
      this.ability.general[name] = this.proxy(this.ability.general[name]);
    }
    for (const i in this.ability.allegiances) {
      this.ability.allegiances[i].ally = this.proxy(this.ability.allegiances[i].ally);
      this.ability.allegiances[i].enemy = this.proxy(this.ability.allegiances[i].enemy);
      this.ability.allegiances[i] = this.proxy(this.ability.allegiances[i]);
    }
    this.#proxied = true;
    return this.proxy(this);
  }
  
  newAbilities() {
    const inv: Record<string, Record<string, Ability>> = {};
    const gen: Record<string, Ability> = {
      Health: new Ability(),
      Morale: new Ability(),
    };
    for (const category in this.#cs.tbl.invDef) {
      inv[category] = {};
      for (const ability in this.#cs.tbl.invDef[category]) {
        inv[category][ability] = new Ability();
      }
    }
    for (const ability in this.#cs.tbl.genDef) {
      gen[ability] = new Ability();;
    }
    return {
      investigative: inv,
      general: gen,
      allegiances: new AllegianceList(),
    };
  }

  set(o: any) {
    const gear = o.trait.Gear;
    delete o.trait.Gear; // paired with = at end
    Object.assign(this.config, o.config);
    Object.assign(this.advancement, o.advancement);
    Object.assign(this.trait, o.trait);
    this.trait.Gear.val = gear;
    for (const cat in this.ability.investigative) {
      for (const name in this.ability.investigative[cat]) {
        this.ability.investigative[cat][name].val = o.ability.investigative[cat][name];
      }
    }
    for (const name in this.ability.general) {
      this.ability.general[name].val = o.ability.general[name];
    }
    this.ability.allegiances.val = o.ability.allegiances;
    o.trait.Gear = gear; // paired with delete at beginning
  }

  export() {
    return JSON.stringify(this);
  }
  
  save() {
    this.ts = this.timestamp;
    const j = JSON.stringify(this);
    localStorage.setItem(this.slotKey, j); // TODO: LZString.compress(j)
    return true;
  }

  load() {
    let j;
    try {
      j = localStorage.getItem(this.slotKey); // TODO: LZString.decompress(...)
    } catch (e) {
      console.trace(e); // TODO: only in dev
    }
    if (j) {
      const o = JSON.parse(j);
      Compatibility.update(o);
      this.set(o);
    }
  }

  proxy<T extends object>(o: T): T {
    const re = /^\d+$/;
    return new Proxy<T>(o, {
      get: (self: {[n: string]: any}, prop: string) => prop in self ? self[prop] : undefined,
      set: (self: {[n: string]: any}, prop: string, value: any, receiver: any) => {
        if (prop in self || prop.match(re)) {
          self[prop] = value;
          if (receiver === this.ability.investigative.Sorcerer.Corruption || receiver === this.trait.Spheres) {
            this.updateSpheresLength();
          }
          this.save();
          return true;
        }
        return false;
      },
    });
  }
  
  get slotKey() {
    return this.#slotKey;
  }
  
  set slotKey(v) {
    this.#slotKey = v;
  }

  get proxied() {
    return this.#proxied;
  }

  get timestamp() {
    return Math.floor((new Date()).getTime() / 1000);
  }

  addAllegiance() {
    let a = new Allegiance();
    if (this.proxied) {
      a.ally = this.proxy(a.ally);
      a.enemy = this.proxy(a.enemy);
      a = this.proxy(a);
    }
    this.ability.allegiances.push(a);
    this.save();
  }

  addGear() {
    let g = new Gear();
    if (this.proxied) {
      g = this.proxy(g);
    }
    this.trait.Gear.push(g);
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
  
  updateSpheresLength() {
  const s = this.trait.Spheres;
    const r = this.ability.investigative.Sorcerer.Corruption.ranks;
    for (let i = s.length - 1; i >= 0; i--) {
      if (s.length > r && s[i] == '') {
        s.splice(i, 1);
      }
    }
    while (s.length < r) {
      s.push('');
    }
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
      let u = this.#cs.util.int(this.advancement.points);
      u -= this.#cs.util.int(this.advancement.genB);
      u -= this.#cs.util.int(this.advancement.stamB);
      u -= this.#cs.util.int(this.advancement.invB) * 3;
      u -= this.#cs.util.int(this.advancement.enemy) * 3;
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
    let r = this.#cs.util.int(this.config.investigativeBuild) + this.#cs.util.int(this.advancement.invB) + (this.invProfession ? 1 : 0);
    for (const cat in this.ability.investigative) {
      for (const name in this.ability.investigative[cat]) {
        r -= this.ability.investigative[cat][name].ranks;
      }
    }
    let fa = this.#cs.util.int(this.config.freeAllies);
    let fe = this.#cs.util.int(this.config.freeEnemies) - this.#cs.util.int(this.advancement.enemy);
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
    let r = this.#cs.util.int(this.config.generalBuild) + this.#cs.util.int(this.advancement.genB);
    for (const name in this.#cs.tbl.genDef) {
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
    const fa = this.#cs.util.int(this.config.freeAllies);
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
    const fe = this.#cs.util.int(this.config.freeEnemies);
    if (r < fe - this.#cs.util.int(this.advancement.enemy)) {
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
    let r = this.#cs.util.int(this.config.staminaBuild) + this.#cs.util.int(this.advancement.stamB);
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
    return [this.ranks, this.pool];
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


class AllegianceList extends Array<Allegiance> {
  set val(a: [string, [number, number], number, [number, number], number][]) {
    if (this.length > a.length) {
      this.splice(a.length);
    }
    for (let i = 0; i < a.length; i++) {
      if (i > this.length - 1) {
        this[i] = new Allegiance();
      }
      this[i].val = a[i];
    }
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
  set val(a: [boolean, string][]) {
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

class SaveSlot {
  key: string;
  name: string;
  #ts: number;
  #ts0: number;
  
  constructor(key: string) {
    this.key = key;
    const j = localStorage.getItem(this.key) as string;
    const s = JSON.parse(j);
    Compatibility.update(s)
    this.name = s['trait']['Name'];
    this.#ts = s['ts'];
    this.#ts0 = s['ts0'];
  }
  
  raw() {
    return localStorage.getItem(this.key) as string;
  }
  
  get ts() {
    if (this.#ts > 0) {
      return this.dateLocal(this.#ts);
    } else {
      console.log('localStorage slot has invalid ts', this.key);
      return 'invalid date';
    }
  }

  get ts0() {
    if (this.#ts0 > 0) {
      return this.dateLocal(this.#ts0);
    } else {
      return this.ts;
    }
  }

  dateLocal(t: number): string {
    return new Date(t * 1000).toLocaleString();
  }

  dateUtc(t: number): string {
    return new Date(t * 1000).toUTCString();
  }
}

class Compatibility {
  static update(o: any) {
    if ('VER' in o && Character.VER != o['VER']) {
      // using chained ifs (instead of if-elses) here allows the compat functions to make partial upgrades
      if (!(('c' in o && 'V' in o['c']) || 'VER' in o)) {
        this.noV(o);
      }
      if ('V' in o && o['V'] == 'α1') {
        this.vA1(o);
      }
      if (o['VER'] == 'α2') {
        // next compatibility changes go here
      }
    }
  }
  
  static noV(o: any) {
    const g = o['c']['g'];
    delete g['configAutoInvB'];
    const ib = parseInt(g['configInvestigativeBuild'], 10);
    const pc = parseInt(g['configCharacterCount'], 10);
    g['configInvestigativeBuild'] = ib + '';
    for (const n of ['advGenB', 'advStamB', 'advInvB', 'advEnemy']) {
      if (!(n in g)) {
        g[n] = '0';
      }
    }
    g['advGenB'] = 0;
    o['c']['V'] = 'α1';
  }

  static vA1(o: any) {
    o['c']['ts'] = o['c']['ts0'] = o['ts'];
    o = o['c'];
    o['config'] = {
      s2s: o['g']['configS2S'],
      characterCount: o['g']['configCharacterCount'],
      investigativeBuild: o['g']['configInvestigativeBuild'],
      generalBuild: o['g']['configGeneralBuild'],
      staminaBuild: o['g']['configStaminaBuild'],
      minStamina: o['g']['configMinStamina'],
      freeAllies: o['g']['configFreeAllies'],
      freeEnemies: o['g']['configFreeEnemies'],
    };
    o['advancement'] = {
      points: o['g']['advancement'],
      genB: o['g']['advGenB'],
      stamB: o['g']['advStamB'],
      invB: o['g']['advInvB'],
      enemy: o['g']['advEnemy'],
    };
    o['traits'] = {
      Name: o['g']['name'],
      TNK: o['g']['tnk'],
      Profession: o['g']['profession'],
      Adjectives: o['x']['adj'],
      Drives: [],
      Wealth: o['g']['wealth'],
      Lifestyle: o['x']['ls'],
      Gear:[],
      Spheres: o['x']['s'],
      portraitUrl: o['g']['portraitUrl'],
      hmSpotFrailty: o['g']['spotFrailty'] == 'Health',
      hmSorceryAffects: o['g']['sorceryAffects'] == 'Health',
    };
    for (let i = 0; i < 3; i++) {
      o['traits']['Drives'][i] = [o['x']['d'][i].pool, o['x']['d'][i].value];
    }
    o['x']['d'][0]['value']
    for (let i = 0; i < o['x']['g'].length; i++) {
      o['traits']['Gear'][i] = [o['x']['g'][i].iconic, o['x']['g'][i].value];
    }
    // TODO: abilities incl allegiances

    delete o['V'];
    delete o['g'];
    delete o['ai'];
    delete o['ag'];
    delete o['x'];
    o['VER'] = 'α2';
  }
}
