import { Injectable, inject } from '@angular/core';

import { CharacterService } from './character.service';

@Injectable({
  providedIn: 'root'
})
export class CompatibilityService {
  chars = inject(CharacterService);

  update(o: any) {
    if ('VER' in o && this.chars.version != o['VER']) {
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
  
  noV(o: any) {
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

  vA1(o: any) {
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
