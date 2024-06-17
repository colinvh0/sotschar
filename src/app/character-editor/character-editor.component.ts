import { OnInit, AfterRenderPhase, Component, HostListener, Inject, Input, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { CharacterService } from '../character.service';
import { TablesService } from '../tables.service';
import { UtilityService } from '../utility.service';

/* DOC

Branches that should be uncreachable have
  console.trace with a message ending with an !
  followed by a vague attempt at continuing as normal.

*/

// TODO: style config/manage
// TODO: implement configS2S, also find rules
// TODO: hide 0-rank Abilities in play/print?
// TODO: factions list editor

// TODO KC: handle favors/grudges
// TODO KC: adjectives just a text field?
// TODO KC: editable during play?
// TODO KC: allegiance pseudoclass real rule?
// TODO KC: s2s real rule?

// TODO: load from template
// TODO: mobile input[number] has strong validation, desktop does not
// TODO: image url/upload/crop
// TODO: fix text knockouts in h4s
// TODO: multiplayer

/* M$ PowerHELL
// approx 5 - 6.5 chars per "word"
// NOT UPDATED

type 'src\app\character-editor\character-editor.component.html', 'src\app\character-editor\character-editor.component.ts', 'src\app\character.service.ts', 'src\app\utility.service.ts', 'src\styles.less' | Measure-Object -line -word -char
echo 'html, ts, styles.less'
foreach ($file in 'src\app\character-editor\character-editor.component.html', 'src\app\character-editor\character-editor.component.ts', 'src\app\character.service.ts', 'src\app\tables.service.ts', 'src\app\utility.service.ts', 'src\styles.less', 'src\reset.less', 'src\font.less' ) {
  type $file | Measure-Object -line -word -char
  echo $file
}
*/

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
  #browser: boolean;
  util = inject(UtilityService);
  tbl = inject(TablesService);
  chars = inject(CharacterService);
  Object = Object; // TODO don't
  char = this.chars.autoload();
  view = newViewControl(inject(CookieService));

  importData = '';
  importErr = '';
  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.#browser = isPlatformBrowser(platformId);
  }

  /*init() {
    if (!this.#init) {
      this.char = this.chars.autoload();
      this.#init = true;
    }
  }*/
  
  get mode() {
    return this.view.mode;
  }
  
  import(): void {
    this.importErr = '';
    try {
      this.chars.import(this.importData);
    } catch (e: any) {
      this.importErr = e;
      throw e;
    }
  }
  
  get spaceLeft(): number {
    let c = unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
    return this.util.fmtPct(1 - (c / (5 * 1024 * 1024)));
  }
  
  showModal(cb: () => void, ecls: string, verb: string, q: string) {
    try {
      const elem = document.querySelector('dialog#sotschar-modal') as HTMLDialogElement;
      const c = elem.querySelector('button.confirm') as HTMLButtonElement;
      c.onclick = cb;
      c.innerText = verb;
      elem.classList.add(ecls);
      (elem.querySelector('.query') as HTMLElement).innerText = q;
      elem.showModal();
    } catch (e: any) {
      this.hideModal();
      throw e;
    }
  }
  
  hideModal() {
    (document.querySelector('dialog#sotschar-modal') as HTMLDialogElement).close();
  }
  
  newChar() {
    this.char = this.chars.new();
  }
  
  duplicateSlot() {
    this.chars.copy();
  }
  
  loadFromSlot() {
    this.char = this.chars.load();
  }
  
  maybeDeleteSlot() {
    this.showModal(() => { this.deleteSlot(); }, 'warn', "Delete", "Delete saved character?");
  }
  
  deleteSlot() {
    if (this.chars.selected !== null) {
      const k = this.chars.selected.key;
      if (this.char.slotKey == k) {
        // TODO show error
      } else {
        localStorage.removeItem(k);
        this.chars.selected = null;
      }
    } else {
      console.trace('chars.selected is null!');
    }
    this.hideModal();
  }
  
  maybeCloseDialog(e: MouseEvent):void {
    const ot = (e as any)['originalTarget'];
    if (e.target !== null && ot !== null) {
      const d = e.target as any;
      if (d === ot && 'close' in d) {
        d['close']();
      }
    }
  }

  curGenRank(name: string, i: number, fives = false): string {
    if ((i > 4 && this.char.ability.general[name].ranks == i) || (fives && i % 5 == 0)) {
      return i + '';
    } else {
      return '';
    }
  }
  
  curGenPool(name: string, i: number, fives = false): string {
    if (this.char.ability.general[name].pool == i || this.char.ability.general[name].ranks == i || (fives && i % 5 == 0)) {
      return this.util.fmt(i) + '';
    } else {
      return '';
    }
  }
  
  staminaPlayColor(i: number): string {
    if (i < 0 && i >= -5) {
      return 'yellow';
    }
    if (i < -5 && i >= -10) {
      return 'orange';
    }
    if (i < -10) {
      return 'red';
    }
    return '';
  }

  staminaPrintColor(i: number): string {
    if (i < 0) {
      return 'orange';
    }
    if (i > 0) {
      return 'green';
    }
    return '';
  }

  addAdjective() {
    if(this.char.trait.Adjectives.length < 5) {
      this.char.trait.Adjectives.push('');
    }
  }

  delAdjective(i: number) {
    this.char.trait.Adjectives.splice(i, 1);
  }
  

  addAllegiance() {
    if(this.char.ability.allegiances.length < 12) {
      this.char.addAllegiance();
    }
  }

  delAllegiance(i: number) {
    this.char.ability.allegiances.splice(i, 1);
    this.char.save();
  }

  addGear() {
    if (this.char.trait.Gear.length < 10) {
      this.char.addGear();
    }
  }

  delGear(i: number) {
    this.char.trait.Gear.splice(i, 1);
    this.char.save();
  }
}

function newViewControl(c: CookieService) {
  const ViewState: any = {
    mode: 'off',
    showConfig: true,
    showAdvConfig: false,
    showManage: false,
    suggestAdjectives: false,
    printColor: true,
    printBackground: true,
  };
  const vr = c.get('_v');
  if (vr) {
    const v = JSON.parse(vr);
    if (v) {
      if ('mode' in v && v['mode']) {
        ViewState.mode = v['mode'];
      }
      if ('showConfig' in v) {
        ViewState.showConfig = v['showConfig'];
      }
      if ('showAdvConfig' in v) {
        ViewState.showAdvConfig = v['showAdvConfig'];
      }
      if ('showManage' in v) {
        ViewState.showManage = v['showManage'];
      }
      if ('suggestAdjectives' in v) {
        ViewState.suggestAdjectives = v['suggestAdjectives'];
      }
      if ('printColor' in v) {
        ViewState.printColor = v['printColor'];
      }
      if ('printBackground' in v) {
        ViewState.printBackground = v['printBackground'];
      }
    }
  }
  if (ViewState.mode == 'off') {
    ViewState.mode = 'edit';
  }
  return new Proxy<typeof ViewState>(ViewState, {
    get(target, prop, receiver) {
      return target[prop];
    },
    set(obj, prop, value) {
      try {
        obj[prop] = value;
        c.set('_v', JSON.stringify(ViewState));
        return true;
      } catch (e: any) {
        throw e;
      }
    },
  });
}
