import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

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
  selector: 'edit-stamina',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-stamina.html'
})
class EditStaminaComponent {
	health = new FormControl('');
	morale = new FormControl('');
}

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [ReactiveFormsModule, EditAdjectivesComponent, EditStaminaComponent],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
	name = new FormControl('');
	tnk = new FormControl('');
	profession = new FormControl('');
	drive1 = new FormControl('');
	drive2 = new FormControl('');
	drive3 = new FormControl('');
	wealth = new FormControl('');
	lifestyle = new FormControl('');
}

