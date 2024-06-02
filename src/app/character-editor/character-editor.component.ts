import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Tables } from '../character';

@Component({
  selector: 'edit-adjectives',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="label">Adjectives</div>
    <div class="input"></div>
    <div><button>Add</button></div>
  `
})
class EditAdjectivesComponent {
}

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [ReactiveFormsModule, EditAdjectivesComponent],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
  name: FormControl;
  tnk: FormControl;
  profession: FormControl;
  drive1: FormControl;
  drive2: FormControl;
  drive3: FormControl;
  wealth: FormControl;
  lifestyle: FormControl;
  health: FormControl;
  morale: FormControl;

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

