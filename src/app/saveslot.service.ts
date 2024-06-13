import { Injectable, inject } from '@angular/core';

import { CompatibilityService } from './compatibility.service';

@Injectable({
  providedIn: 'root'
})
export class SaveSlotService {
  #selected: SaveSlot | null = null;

  all() {
    return SaveSlot.all();
  }
  
  get keys() {
    return SaveSlot.keys;
  }
  
  get nextKey() {
    return SaveSlot.nextKey;
  }
  
  select(key: string) {
    this.#selected = new SaveSlot(key);
  }
  
  set selected(s: SaveSlot | null) {
    this.#selected = s;
  }

  get selected(): SaveSlot | null {
    const ss = SaveSlot.keys;
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

  constructor() { }
}

class SaveSlot {
  static get nextKey() {
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

  static get keys() {
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
  
  static all() {
    return SaveSlot.keys.map((k) => new SaveSlot(k)).sort((a, b) => { return parseInt(b.ts, 10) - parseInt(a.ts, 10); });
  }
  
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
