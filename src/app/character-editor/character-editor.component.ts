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
  formGroup = new FormGroup({
    name: new FormControl(''),
    tnk: new FormControl(''),
    profession: new FormControl(''),
    adjectives: {'key': string, 'value': string}[] = [],
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
}

