import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { RouterOutlet } from '@angular/router';

import { CharacterEditorComponent } from './character-editor/character-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  imports: [CommonModule, RouterOutlet, CharacterEditorComponent],
})
export class AppComponent {
  browser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.browser = isPlatformBrowser(platformId);
  }
}
