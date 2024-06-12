import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  load(s: SaveSlot): Character {
    return Character.load(s);
  }
  
  import(j: string): Character {
    return Character.import(j);
  }
}

class Character {
  static registry: Record<string, Character> = {};

  static get slots(): any {
    const re = /char(\d+)/;
    let a: SaveSlot[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null) {
        if (k.match(re)) {
          a.push(new SaveSlot(k));
        }
      }
    }
    return a.sort((a, b) => { return parseInt(b.ts, 10) - parseInt(a.ts, 10); });
  }
  
  static newProxy(slotKey: string | null = null): Character {
    const c = new Character(slotKey);
    return new Proxy<Character>(c, {
      get: (self: {[n: string]: any}, prop: string) => prop in self ? self[prop] : undefined,
      set(self: {[n: string]: any}, prop: string, value: any) {
        try {
          if (prop in self) {
            self[prop] = value;
            c.save();
            return true;
          }
          return false;
        } catch (e: any) {
          throw e;
        }
      },
    });
  }

  static load(s: SaveSlot): Character {
    const mc = Character.registry[s.key];
    if (mc) {
      return mc;
    } else {
      const c = Character.newProxy(s.key);
      Character.registry[s.key] = c;
      c.#canSave = true;
      return c;
    }
  }
  
  static import(o: any): Character {
    const c = Character.newProxy();
    c.charCompat(o);
    c.rawValue = o;
    Character.registry[c.#slotKey] = c;
    c.#canSave = true;
    return c;
  }

  /// instance properties ///

  VER = 'α2';
  #slotKey: string;
  ts0 = 0;
  ts = 0;
  #canSave = false;
  config = {
    s2s: false,
  };
  advancement = {
  };
  trait = {
    Name: '',
    Gear: new Array<[boolean, string]>(),
  };
  ability = {
    investigative: {
    },
    general: {
    },
    allegiance: {
    }
  };
  pool ={
  };
  

  constructor(slotKey: string | null) {
    if (slotKey === null) {
      this.#slotKey = this.nextSlotKey;
      this.ts0 = this.timestamp;
      this.#canSave = true;
    } else {
      this.#slotKey = slotKey;
      if (this.badSlotKey) {
        const k = this.#slotKey;
        this.#slotKey = this.nextSlotKey;
        const j = localStorage.getItem(k);
        if (j) {
          localStorage.setItem(this.#slotKey, j);
        }
        localStorage.removeItem(k);
      }
      this.load();
    }
  }
  
  private get badSlotKey() {
    return this.#slotKey == 'char';
  }

  /*private get json(): string {
    const j = JSON.stringify(this);
    //console.log('json.length', j.length);
    return j;
  }
  
  private set json(j: string) {
    this.rawValue = JSON.parse(j);
  }*/

  private set rawValue(o: any) {
    this.config.s2s = o.config.s2s;
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
    /*this.lifestyle = o.x.ls;
    if (this.gear.length > o.x.g.length) {
      this.gear.splice(o.x.g.length);
    }*/
    /*o.x.g.forEach((g: Gear, i: number) => {
      if (i > this.gear.length - 1) {
        this.gear[i] = new Gear();
      }
      this.gear[i].set(g);
    });*/
    /*this.spheres = o.x.s;*/
  }

  save(): void {
    if (this.#canSave) {
      this.ts = this.timestamp;
      const o = this.rawValue;
      const j = JSON.stringify(o);
      console.log(this.#slotKey, o);
      // TODO: enable
      //localStorage.setItem(this.#slotKey, j); // TODO: LZString.compress(j)
    }
  }

  load(): void {
    let j;
    try {
      j = localStorage.getItem(this.#slotKey); // TODO: LZString.decompress(...)
    } catch (e) {
      console.trace(e); // TODO: only in dev
    }
    if (j) {
      const o = JSON.parse(j);
      this.charCompat(o);
      this.rawValue = o;
    }
    this.#canSave = true;
  }

  charCompat(o: any) {
    if ('VER' in o && this.VER != o['VER']) {
      // using chained ifs (instead of if-elses) here allows the compat functions to make partial upgrades
      if (!(('c' in o && 'V' in o['c']) || 'VER' in o)) {
        this.compatNoVer(o);
      }
      if ('V' in o && o['V'] == 'α1') {
        this.compatAlpha1(o);
      }
      if (o['VER'] == 'α2') {
        // next compatibility changes go here
      }
    }
  }
  
  compatNoVer(o: any) {
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

  compatAlpha1(o: any) {
    o['c']['ts'] = o['c']['ts0'] = o['ts'];
    o = o['c'];
    o['traits'] = {
      Name: o['g']['name'],
    };
    o['config'] = {
      s2s: o['g']['configS2S'],
    };
    delete o['V'];
    delete o['ai'];
    delete o['ag'];
    delete o['x'];
    o['VER'] = 'α2';
  }
  
  get nextSlotKey(): string {
    const pre = 'chr';
    let i = 0;
    while (localStorage.getItem(pre + ++i) !== null) {
      if (i > localStorage.length) { // if we're here, the pigeonhole principle broke or I made the while loop wrong
        console.trace('wtf no');
        break;
      }
    }
    return pre + i;
  }

  get timestamp(): number {
    return Math.floor((new Date()).getTime() / 1000);
  }
  
  get armor(): number {
    let result = 0;
    const re = /\(Armor (\d+)\)/g;
    for (let g of this.trait.Gear) {
      const matches = g[1].matchAll(re);
      for (const match of matches) {
        const a = parseInt(match[1], 10);
        if (a > result) {
          result = a;
        }
      }
    }
    return result;
  }

  get grit(): number {
    return (this.iconic >= 5) ? 1 : 0;
  }
  
  get iconic(): number {
    let result = 0;
    for (let g of this.trait.Gear) {
      if (g[0] && g[1] != '') {
        result++;
      }
    }
    return result;
  }
  

}

class SaveSlot {
  key: string;
  name: string;
  #ts: number;
  #ts0: number;
  
  constructor(key: string) {
    this.key = key;
    const j = localStorage.getItem(key) as string;
    const s = JSON.parse(j);
    this.name = s['c']['trait']['Name'];
    this.#ts = s['ts'];
    this.#ts0 = s['ts0'];
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
