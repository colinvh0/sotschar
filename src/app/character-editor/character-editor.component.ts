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
  adjectives = [initList(1)];
  allegiances = [initList(2)];
  gear = [initList(5)];
  formGroup = new FormGroup({
    name: new FormControl(''),
    tnk: new FormControl(''),
    profession: new FormControl(''),
    drive1: new FormControl(''),
    drive2: new FormControl(''),
    drive3: new FormControl(''),
    wealth: new FormControl(''),
    lifestyle: new FormControl(''),
    health: new FormControl(''),
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
    this.adjectives.splice(i, 1);
  }

  addGear() {
    this.gear.push({key: this.gear.length + '', value: ''});
  }
}

function initList(len = 0): {'key': string, 'value': string}[] {
  var result: {'key': string, 'value': string}[]; 
  result = [];
  for (let i = 0; i < len; i++) {
    result.push({key: i + '', value: ''});
  }
  return result;
}
