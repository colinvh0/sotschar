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
  adjectives: {'key': string, 'value': string}[] = [];
  allegiances: {'key': string, 'value': string}[] = [];
  gear: {'key': string, 'value': string}[] = [];
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
  }

  addAllegiance() {
    if(this.allegiances.length < 12) {
      this.allegiances.push({key: this.allegiances.length + '', value: ''});
    }
  }

  addGear() {
    this.gear.push({key: this.gear.length + '', value: ''});
  }
}

