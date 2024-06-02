import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

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

