import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet } from '@angular/router';

import { CharacterEditorComponent } from './character-editor/character-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  imports: [RouterOutlet, CharacterEditorComponent],
})
export class AppComponent implements OnInit {
  loaded = false;

  ngOnInit(): void {
    this.loaded = true;
  }
}
