import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CharacterEditorComponent } from './character-editor/character-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  imports: [RouterOutlet, CharacterEditorComponent],
})
export class AppComponent {
}
