import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Tables } from '../character';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'edit-adjectives',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="label">Adjectives</div>
    @if (adjectives.length == 5) {
      <div>Max 5</div>
    } @else {
      <div><button (click)="addAdjective()">Add</button></div>
    }
    @for (adj of adjectives; track adj; let i = $index) {
      <input class="adjectives" id="adj{{i}}" [(ngModel)] = "adjectives[i].value">
    }
  `
})
class EditAdjectivesComponent {
  adjectives: {'key': string, 'value': string}[] = [];

  constructor() {
  }

  addAdjective() {
    if(this.adjectives.length < 5) {
      this.adjectives.push({key: this.adjectives.length + '', value: ''});
    }
  }
}

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [ReactiveFormsModule, EditAdjectivesComponent],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {

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
}

