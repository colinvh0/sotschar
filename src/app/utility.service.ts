import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  int(s: string | null, d = 0): number {
    if (s) {
      return parseInt(s, 10);
    } else {
      return d;
    }
  }

  fmt(i: number): string {
    if (i >= 0) {
      return i + '';
    }
    return '−' + -i;
  }
  
  fmtPct(q: number): number {
    const a = ((q * 100) + '').split('.');
    const ip = a[0];
    const i = parseInt(ip, 10);
    if (ip.length <= 2 && 1 in a) {
      const fp = a[1];
      if (fp.length > 1) {
        let d0 = parseInt(fp[0], 10);
        const d1 = parseInt(fp[1], 10);
        if (d1 >= 5) {
          d0++;
        }
        if (d0 >= 10) {
          return i + 1;
        }
        return i + (d0 / 10);
      }
    }
    return i;
  }
  
  get timestamp(): number {
    return Math.floor((new Date()).getTime() / 1000);
  }
  
  clamp(v: number, lo: number, hi: number): number {
    if (v < lo) {
      return lo;
    }
    if (v > hi) {
      return hi;
    }
    return v;
  }

  clipboardWrite(s: string): void {
    navigator.clipboard.writeText(s);
  }
  
  aii(len: number): Array<number> {
    const result = Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = i;
    }
    return result;
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
}
