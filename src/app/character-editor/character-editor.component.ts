import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Tables } from '../character';

@Component({
  selector: 'edit-name',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <label>
      <div class="label">Name</div>
      <div class="input"><input type="text" [formControl]="name"></div>
    </label>
  `
})
class EditNameComponent {
	name = new FormControl('');
}

@Component({
  selector: 'edit-tnk',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <label>
      <div class="label">True Name? <span class="input"><input type="checkbox" [formControl]="tnk"></span></div>
      <div class="note">Check if True Name is known</div>
    </label>
  `
})
class EditTrueNameKnownComponent {
	tnk = new FormControl('');
}

@Component({
  selector: 'edit-profession',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <label>
      <div class="label">Profession</div>
      <div class="input"><input type="text" [formControl]="profession"></div>
    </label>
  `
})
class EditProfessionComponent {
	profession = new FormControl('');
}

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
  selector: 'edit-drives',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="head label">What is Best in Life?</div>
    <div class="input"><input type="text" [formControl]="drive1"></div>
    <div class="input"><input type="text" [formControl]="drive2"></div>
    <div class="input"><input type="text" [formControl]="drive3"></div>
  `
})
class EditDrivesComponent {
	drive1 = new FormControl('');
	drive2 = new FormControl('');
	drive3 = new FormControl('');
}

@Component({
  selector: 'edit-portrait',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="head label">Character Portrait</div>
  `
})
class EditPortraitComponent {
}

@Component({
  selector: 'edit-social',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="corner-br-wrap">
      <table class="corner-br"><thead>
        <tr><th colspan='6'>
          <h5 class="head">Social</h5>
        </th></tr>
      </thead><tbody>
      </tbody></table>
    </div>
  `
})
class EditSocialComponent {
}

@Component({
  selector: 'edit-sentinel',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><thead>
      <tr><th colspan='6'>
        <h5 class="head">Sentinel</h5>
      </th></tr>
    </thead><tbody>
    </tbody></table>
  `
})
class EditSentinelComponent {
}

@Component({
  selector: 'edit-sorcerer',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><thead>
      <tr><th colspan='6'>
        <h5 class="head">Sorcerer</h5>
      </th></tr>
    </thead><tbody>
    </tbody></table>
  `
})
class EditSorcererComponent {
}

@Component({
  selector: 'edit-thief',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><thead>
      <tr><th colspan='6'>
        <h5 class="head">Thief</h5>
      </th></tr>
    </thead><tbody>
    </tbody></table>
  `
})
class EditThiefComponent {
}

@Component({
  selector: 'edit-warrior',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><thead>
      <tr><th colspan='6'>
        <h5 class="head">Warrior</h5>
      </th></tr>
    </thead><tbody>
    </tbody></table>
  `
})
class EditWarriorComponent {
}

@Component({
  selector: 'edit-general',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><tbody>
    </tbody></table>
  `
})
class EditGeneralComponent {
}

@Component({
  selector: 'edit-allegiances',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><tbody>
    </tbody><tfoot>
      <tr><td><button>Add</button></td></tr>
    </tfoot></table>
  `
})
class EditAllegiancesComponent {
}

@Component({
  selector: 'edit-wealth',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><tbody><tr><td>
      <div><label>
        <span class="label">Wealth</span> <span class="input"><input type="number" [formControl]="wealth"></span>
      </label></div>
      <div><label>
        <span class="label">Lifestyle</span> <span class="input"><input type="number" [formControl]="lifestyle"></span>
      </label></div>
    </td></tr></tbody></table>
  `
})
class EditWealthComponent {
	wealth = new FormControl('');
	lifestyle = new FormControl('');
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
  selector: 'edit-gear',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><tbody>
    </tbody><tfoot>
      <tr><td><button>Add</button></td></tr>
    </tfoot></table>
  `
})
class EditGearComponent {
}

@Component({
  selector: 'edit-spheres',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <table><tbody>
    </tbody></table>
  `
})
class EditSpheresComponent {
}

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [EditNameComponent, EditTrueNameKnownComponent, EditProfessionComponent, EditAdjectivesComponent, EditDrivesComponent, EditPortraitComponent, EditSocialComponent, EditSentinelComponent, EditSorcererComponent, EditThiefComponent, EditWarriorComponent, EditGeneralComponent, EditAllegiancesComponent, EditWealthComponent, EditStaminaComponent, EditGearComponent, EditSpheresComponent],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
}

