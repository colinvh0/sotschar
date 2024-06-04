import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Tables } from '../character';

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
  ab = {
    inv: {
      social: { charm: 0 }
    },
    gen: {}
  };
  adjectives = [{key: '0', value: ''}];
  allegiances = [{key: '0', value: ''}, {key: '1', value: ''}];
  gear = initGear(5);
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
    lifestyle: new FormControl('0'),
    health: new FormControl(''),
    armor: new FormControl('0'),
    morale: new FormControl('')
  });

  submit() {}

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
  
  setAbility(event: any, i: number): void {
    const f = event.target.parentElement.children[0];
    let v = parseInt(f.value, 10);
    console.log(v, i);
    if (!v) {
      v = 0;
    }
    console.log(v);
    if (f.value == i) {
      f.value--;
    } else {
      f.value = i;
    }
    console.log(f.value);
  }
}

function initGear(len = 0): {key: string, value: string, iconic: boolean}[] {
  var result: {key: string, value: string, iconic: boolean}[]; 
  result = [];
  for (let i = 0; i < len; i++) {
    result.push({key: i + '', value: '', iconic: false});
  }
  return result;
}
