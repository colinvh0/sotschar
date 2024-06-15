import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { CharacterService } from './character.service';
import { CompatibilityService } from './compatibility.service';

@Injectable({
  providedIn: 'root'
})
export class SaveSlotService {
  #cookie = inject(CookieService);
  chars = inject(CharacterService);
  compat = inject(CompatibilityService);
  #selected: SaveSlot | null = null;

  get nextKey() {
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
    return this.keys.map((k) => new SaveSlot(k)).sort((a, b) => { return parseInt(b.ts, 10) - parseInt(a.ts, 10); });
  }
  
  blank() {
    return this.chars.new('');
  }

  autoload() {
    const key = this.cookie;
    if (key) {
      return this.load(key);
    }
    return this.new();
  }
  
  new() {
    const key = this.nextKey;
    const c = this.chars.new(key);
    this.chars.registry[key] = c;
    c.canSave = true;
    return c;
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
    let c = this.chars.registry[key];
    if (!c) {
      c = this.chars.new(key);
    }
    c.slotKey = this.nextKey;
    this.cookie = c.slotKey;
    c.canSave = true;
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
    const mc = this.chars.registry[key];
    if (mc) {
      this.cookie = key;
      return mc;
    }
    const c = this.chars.new(key);
    if (this.badSlotKey(key)) {
      c.slotKey = this.nextKey;
      c.save();
      localStorage.removeItem(key);
    }
    this.chars.registry[c.slotKey] = c;
    this.cookie = c.slotKey;
    c.canSave = true;
    return c;
  }
  
  import(o: any) {
    const c = this.chars.new(this.nextKey);
    this.compat.update(o);
    c.set(o);
    this.chars.registry[c.slotKey] = c;
    this.cookie = c.slotKey;
    c.canSave = true;
    return c;
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
}

class SaveSlot {
  compat = inject(CompatibilityService);
  
  key: string;
  name: string;
  #ts: number;
  #ts0: number;
  
  constructor(key: string) {
    this.key = key;
    const j = localStorage.getItem(this.key) as string;
    const s = JSON.parse(j);
    this.compat.update(s)
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
