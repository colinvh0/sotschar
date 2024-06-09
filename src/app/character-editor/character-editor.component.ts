import { AfterRenderPhase, Component, Input, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

// TODO: style dialogs
// TODO: style config
// TODO: implement configS2S
// TODO: print minimum heights
// TODO: hide 0-rank Abilities in play/print?
// TODO: factions list editor

// TODO KC: handle favors/grudges
// TODO KC: adjectives just a text field?
// TODO KC: editable during play?

/* THE BIG RESTRUCT

version string
storage volatile
buildConfig int[7], boolean (7 * b64 + 1b)
advancement: 6b * 5
  points
  general
  stamina
  investigative
  enemy
abilities:
  general:
    general 8b * 8 (16 * b64)
    stamina (5b + 6b) * 2 (4 * b64)
  investigative:
    investigative 6b * 24
    allies 8b[]
    enemies 8b[]
traits:
  row1 (name, drives, ...): string[]
  trueName: boolean 1b
  spotFrailty: string -> 1b
  allegiances: string[]
  lifestyle: int 3b
  thresholds(): int
  armor(): int
  grit(): int
  gear: (int, boolean)[]
  sorceryAffects: string -> 1b
  spheres: string
pools: 
  drives 3b
  favors 3b[]
  grudges 3b[]
  wealth 6b

*/

// TODO: load/save
// TODO: load from template
// TODO: mobile input[number] has strong validation, desktop does not
// TODO: image url/upload/crop
// TODO: fix text knockouts in h4s
// TODO: multiplayer

/* M$ PowerHELL
// approx 5 - 6.5 chars per "word"

type '.\src\app\character-editor\character-editor.component.html', '.\src\app\character-editor\character-editor.component.ts', '.\src\styles.less' | Measure-Object -line -word -char
echo 'html, ts, styles.less'
foreach ($file in 'src\app\character-editor\character-editor.component.html', 'src\app\character-editor\character-editor.component.ts', 'src\styles.less', 'src\reset.less', 'src\font.less', 'src\svg.less' ) {
  type $file | Measure-Object -line -word -char
  echo $file
}
*/

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [CookieService],
  templateUrl: './character-editor.component.html',
  styleUrl: './character-editor.component.less'
})
export class CharacterEditorComponent {
  /// properties ///

  cookies = inject(CookieService);

  get defCharCount() { return 4; }
  get defInvBuild() { return 10; }

  #mode = 'off';
  #showConfig = true;
  #showAdvConfig = false;
  #showManage = false;
  #selectedSaveSlot: SaveSlot | null = null;
  canSave = false;
  saveSlotClean = false;
  saveSlotKey = '';
  
  version = 'α1';
  importData = '';
  importErr = '';
  adjectives = [''];
  drives = [new Drive(), new Drive(), new Drive()];
  invAbilities: Record<string, Record<string, Ability>> = {};
  genAbilities: Record<string, Ability> = {
    Health: new Ability(),
    Morale: new Ability(),
  };
  lifestyle = 0;
  allegiances = [new Allegiance(), new Allegiance()];
  gear = Gear.new(5);
  spheres: Array<string> = [];
  formGroup = new FormGroup({
    configS2S: new FormControl(false),
    configCharacterCount: new FormControl(this.defCharCount + ''),
    configInvestigativeBuild: new FormControl(this.defInvBuild + ''),
    configGeneralBuild: new FormControl('30'),
    configStaminaBuild: new FormControl('18'),
    configMinStamina: new FormControl('3'),
    configFreeAllies: new FormControl('2'),
    configFreeEnemies: new FormControl('1'),
    advancement: new FormControl('0'),
    advGenB: new FormControl('0'),
    advStamB: new FormControl('0'),
    advInvB: new FormControl('0'),
    advEnemy: new FormControl('0'),
    name: new FormControl(''),
    tnk: new FormControl(''),
    profession: new FormControl(''),
    portraitUrl: new FormControl(''),
    spotFrailty: new FormControl('Health'),
    sorceryAffects: new FormControl('Health'),
    wealth: new FormControl('0'),
  });
  ctl = this.formGroup.controls;
  
  constructor() {
    this.initView();
    this.initFields();
    afterNextRender(() => {
      this.loadFromLocal();
      this.initSubscribe();
    }, {phase: AfterRenderPhase.Read});
    /*@HostListener('window:storage', ['$event'])
      onMessage(event) {
        if (event.storageArea === localStorage) {
          
        }
      }
    }*/
  }
  
  /// state management ///

  loadFromLocal(): void {
    let c;
    try {
      c = localStorage.getItem('char'); // TODO: LZString.decompress(...)
    } catch (e) {
      console.trace(e); // TODO: only in dev
    }
    if (c) {
      this.json = c;
    }
    this.canSave = true;
  }

  saveToLocal(): void {
    if (this.canSave) {
      localStorage.setItem('char', this.json); // TODO: LZString.compress(this.json)
    }
  }
    
  initFields(): void {
    for (const i in this.invAbilityDefs) {
      let a = this.invAbilityDefs[i];
      if (!(a.category in this.invAbilities)) {
        this.invAbilities[a.category] = {};
      }
      this.invAbilities[a.category][a.name] = new Ability();
    }
    const gen = this.genAbilityDefs;
    for (let i = 0; i < gen.length; i++) {
      this.genAbilities[gen[i].name] = new Ability();
    }
  }
  
  get rawValue(): any {
    return {
      V: this.version,
      g: this.formGroup.getRawValue(),
      ai: this.invAbilities,
      ag: this.genAbilities,
      x: {
        adj: this.adjectives,
        d: this.drives,
        all: this.allegiances,
        ls: this.lifestyle,
        g: this.gear,
        s: this.spheres,
      },
    };
  }
  
  get json(): string {
    const j = JSON.stringify(this.rawValue);
    //console.log('json.length', j.length);
    return j;
  }
  
  set json(j: string) {
    this.rawValue = JSON.parse(j);
  }
  
  set rawValue(o: any) {
    this.charCompat(o);
    this.formGroup.setValue(o.g);
    for (let def of this.invAbilityDefs) {
      this.invAbilities[def.category][def.name].set(o.ai[def.category][def.name]);
    }
    for (let name in this.genAbilities) {
      this.genAbilities[name].set(o.ag[name]);
    }
    this.adjectives = o.x.adj;
    if (this.drives.length > o.x.d.length) {
      this.drives.splice(o.x.d.length);
    }
    o.x.d.forEach((d: Drive, i: number) => {
      if (i > this.drives.length - 1) {
        this.drives[i] = new Drive();
      }
      this.drives[i].set(d);
    });
    if (this.allegiances.length > o.x.all.length) {
      this.allegiances.splice(o.x.all.length);
    }
    o.x.all.forEach((a: Allegiance, i: number) => {
      if (i > this.allegiances.length - 1) {
        this.allegiances[i] = new Allegiance();
      }
      this.allegiances[i].set(a);
    });
    this.lifestyle = o.x.ls;
    if (this.gear.length > o.x.g.length) {
      this.gear.splice(o.x.g.length);
    }
    o.x.g.forEach((g: Gear, i: number) => {
      if (i > this.gear.length - 1) {
        this.gear[i] = new Gear();
      }
      this.gear[i].set(g);
    });
    this.spheres = o.x.s;
  }

  charCompat(c: any) {
    if (this.version != c['V']) {
      // using chained ifs (instead of if-elses) here allows the compat functions to make partial upgrades
      if (!('V' in c)) {
        this.compatNoVer(c);
      }
      if (c['V'] == 'α1') {
        // next compatibility changes go here
      }
    }
  }
  
  compatNoVer(c: any) {
    delete c['g']['configAutoInvB'];
    const ib = parseInt(c['g']['configInvestigativeBuild'], 10);
    const pc = parseInt(c['g']['configCharacterCount'], 10);
    c['g']['configInvestigativeBuild'] = ib + '';
    for (const n of ['advGenB', 'advStamB', 'advInvB', 'advEnemy']) {
      if (!(n in c['g'])) {
        c['g'][n] = '0';
      }
    }
    c['g']['advGenB'] = 0;
    c['V'] = 'α1';
  }
  
  import(): void {
    try {
      this.json = this.importData;
      this.importErr = '';
    } catch (e: any) {
      console.log(e);
      this.importErr = e;
    }
  }
  
  get spaceLeft(): number {
    let c = unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
    return this.fmtPct(1 - (c / (5 * 1024 * 1024)));
  }
  
  set selectedSaveSlot(s: SaveSlot | null) {
    this.#selectedSaveSlot = s;
  }

  get selectedSaveSlot(): SaveSlot | null {
    const ss = this.saveSlots;
    if (ss.length == 0) {
      return this.#selectedSaveSlot = null;
    }
    if (ss.length == 1) {
      return ss[0];
    }
    if (this.#selectedSaveSlot === null) {
      return null;
    }
    if (!(this.#selectedSaveSlot.key in this.saveSlotKeys)) {
      return this.#selectedSaveSlot = null;
    }
    return this.#selectedSaveSlot;
  }
  
  get saveSlotKeys(): Record<string, boolean> {
    const re = /char(\d+)/;
    let a: Record<string, boolean> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null) {
        if (k.match(re)) {
          a[k] = true;
        }
      }
    }
    return a;
  }

  get saveSlots(): SaveSlot[] {
    let a: SaveSlot[] = [];
    for (const k in this.saveSlotKeys) {
      a.push(new SaveSlot(this, k));
    }
    return a.sort((a, b) => { return b.ts - a.ts; });
  }

  get nextSlotKey(): string {
    let i = 0;
    while (localStorage.getItem('char' + ++i) !== null) {
      if (i > localStorage.length) { // if we're here, the pigeonhole principle broke or I made the while loop wrong
        console.trace('wtf no');
        break;
      }
    }
    return 'char' + i;
  }
  
  saveNew(): void {
    const s = {
      c: this.rawValue,
      ts: this.timestamp,
    };
    localStorage.setItem(this.nextSlotKey, JSON.stringify(s));
  }
  
  maybeSaveToSlot(): void {
    this.showModal('confirm-save');
  }
  
  saveToSlot(): void {
    const s = {
      c: this.rawValue,
      ts: this.timestamp,
    };
    localStorage.setItem(this.selectedSaveSlot!.key, JSON.stringify(s));
    this.hideModal('confirm-save');
  }
  
  maybeLoadFromSlot(): void {
    if (this.saveSlotClean) { // TODO: implement checking for cleanliness
      this.loadFromSlot();
    } else {
      this.showModal('confirm-load');
    }
  }
  
  loadFromSlot(): void {
    // TODO
    // TODO: don't forget to set this.saveSlotKey
    this.hideModal('confirm-load');
  }
  
  maybeDeleteSlot(): void {
     this.showModal('confirm-delete');
  }
  
  deleteSlot(): void {
    const k = this.selectedSaveSlot!.key;
    if (k !== null) {
      localStorage.removeItem(k);
      this.selectedSaveSlot = null;
    } else {
      console.trace('localStorage.' + k + ' is null');
    }
    this.hideModal('confirm-delete');
  }
  
  getModal = (id: string) => { return document.querySelector('dialog#' + id) as HTMLDialogElement; };

  showModal(id: string): void {
    this.getModal(id).showModal();
  }

  hideModal(id: string): void {
    this.getModal(id).close();
  }

  initSubscribe(): void {
    const self = this;
    for (const name in this.formGroup.controls) {
      this.formGroup.get(name)!.valueChanges.subscribe((formValue) => {
        self.saveToLocal();
      });
    }
  }
  
  initView(): void {
    const vr = this.cookies.get('_v');
    if (vr) {
      const v = JSON.parse(vr);
      if (v) {
        if ('m' in v && v['m']) {
          this.#mode = v['m'];
        }
        if ('sc' in v) {
          this.#showConfig = v['sc'];
        }
        if ('sca' in v) {
          this.#showAdvConfig = v['sca'];
        }
        if ('sm' in v) {
          this.#showManage = v['sm'];
        }
      }
    }
    if (this.mode == 'off') {
      this.mode = 'edit';
    }
  }
  
  /// view state ///
  
  get mode() {
    return this.#mode;
  }
  
  set mode(m: string) {
    this.#mode = m;
    this.saveView();
  }
  
  get showConfig() {
    return this.#showConfig;
  }
  
  set showConfig(sc: boolean) {
    this.#showConfig = sc;
    this.saveView();
  }
  
  get showAdvConfig() {
    return this.#showAdvConfig;
  }
  
  set showAdvConfig(sc: boolean) {
    this.#showAdvConfig = sc;
    this.saveView();
  }
  
  get showManage() {
    return this.#showManage;
  }
  
  set showManage(sc: boolean) {
    this.#showManage = sc;
    this.saveView();
  }
  
  saveView(): void {
    this.cookies.set('_v', JSON.stringify({
      m: this.mode,
      sc: this.showConfig,
      sca: this.showAdvConfig,
      sm: this.showManage,
    }));
  }
  
  /// utilities ///
  
  int(s: string | null, d = 0): number {
    if (s) {
      return parseInt(s, 10);
    } else {
      return d;
    }
  }
  
  fmt(i: number): string {
    if (i >= 0) {
      return i + '';
    }
    return '−' + -i;
  }
  
  fmtPct(q: number): number {
    const a = ((q * 100) + '').split('.');
    const ip = a[0];
    const i = parseInt(ip, 10);
    if (ip.length <= 2 && 1 in a) {
      const fp = a[1];
      if (fp.length > 1) {
        let d0 = parseInt(fp[0], 10);
        const d1 = parseInt(fp[1], 10);
        if (d1 >= 5) {
          d0++;
        }
        if (d0 >= 10) {
          return i + 1;
        }
        return i + (d0 / 10);
      }
    }
    return i;
  }
  
  get timestamp(): number {
    return Math.floor((new Date()).getTime() / 1000);
  }
  
  clamp(v: number, lo: number, hi: number): number {
    if (v < lo) {
      return lo;
    }
    if (v > hi) {
      return hi;
    }
    return v;
  }

  cipboardWrite(s: string): void {
    navigator.clipboard.writeText(s);
  }
  
  aii(len: number): Array<number> {
    const result = Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = i;
    }
    return result;
  }
  
  aiToFrom(t: number, f?: number): Array<number> {
    if (t == undefined) {
      t = 0;
    }
    if (f == undefined) {
      if (t == 0) {
        return [];
      }
      f = 1;
    }
    const diff = t - f;
    let inc = 1;
    let len: number;
    if (diff < 0) {
      inc = -1;
      len = 1 - diff;
      [t, f] = [f, t];
    } else {
      len = 1 + diff;
    }
    const result = Array(len);
    let j = f;
    for (let i = 0 ; i < len; i++) {
      result[i] = j;
      j += inc;
    }
    return result;
  }
  
  /// user input values ///
  
  get charCount(): number {
    const v = this.formGroup.controls.configCharacterCount.value;
    return (v !== null) ? parseInt(v, 10) : this.defCharCount;
  }
  
  get invBuild(): number {
    const v = this.formGroup.controls.configInvestigativeBuild.value;
    const b = (v !== null) ? parseInt(v, 10) : this.defInvBuild;
    return b + 5 - this.clamp(this.charCount, 1, 5);
  }

  get genBuild(): number {
    if (this.formGroup.controls.configGeneralBuild.value === null) {
      return 0;
    } else {
      return parseInt(this.formGroup.controls.configGeneralBuild.value, 10);
    }
  }
  
  get aFree(): number {
    if (this.formGroup.controls.configFreeAllies.value === null) {
      return 0;
    } else {
      return parseInt(this.formGroup.controls.configFreeAllies.value, 10);
    }
  }

  get eFree(): number {
    if (this.formGroup.controls.configFreeEnemies.value === null) {
      return 0;
    } else {
      return parseInt(this.formGroup.controls.configFreeEnemies.value, 10);
    }
  }

  get staminaBuild(): number {
    if (this.formGroup.controls.configStaminaBuild.value === null) {
      return 0;
    } else {
      return parseInt(this.formGroup.controls.configStaminaBuild.value, 10);
    }
  }

  /// character data ///

  get unspentAdvancement(): number {
    if (this.formGroup.controls.advancement.value === null) {
      return 0;
    } else {
      let u = this.int(this.formGroup.controls.advancement.value);
      u -= this.int(this.formGroup.controls.advGenB.value);
      u -= this.int(this.formGroup.controls.advStamB.value);
      u -= this.int(this.formGroup.controls.advInvB.value) * 3;
      u -= this.int(this.formGroup.controls.advEnemy.value) * 3;
      return u;
    }
  }
  
  get drivesEntered(): number {
    let r = 0;
    for (let d of this.drives) {
      if (d.value) {
        r++;
      }
    }
    return r;
  }
  
  get invCatNames(): string[] {
    return Object.keys(this.invAbilities);
  }

  invNames(category: string): string[] {
    return Object.keys(this.invAbilities[category]);
  }
  
  get invUnspent(): number {
    let r = this.invBuild + this.int(this.formGroup.controls.advInvB.value);
    for (let ad of this.invAbilityDefs) {
      r -= this.invAbilities[ad.category][ad.name].ranks;
    }
    let fa = this.aFree;
    let fe = this.eFree - this.int(this.formGroup.controls.advEnemy.value);
    for (const a of this.allegiances) {
      fa -= a.ally.ranks;
      fe -= a.enemy.ranks;
    }
    if (fa < 0) {
      r += fa;
    }
    if (fe < 0) {
      r += fe;
    }
    return r;
  }

  get genUnspent(): number {
    let r = this.genBuild + this.int(this.formGroup.controls.advGenB.value);
    for (const ad of this.genAbilityDefs) {
      r -= this.genAbilities[ad.name].ranks;
    }
    return r;
  }

  get genTooHigh(): boolean {
    let h1 = 0;
    let h2 = 0;
    for (const ad of this.genAbilityDefs) {
      const rank = this.genAbilities[ad.name].ranks;
      if (rank > h1) {
        h2 = h1;
        h1 = rank;
      } else if (rank > h2) {
        h2 = rank;
      }
    }
    return h1 > 2 && h2 * 2 < h1;
  }
  
  get sorcWithoutCorr(): boolean {
    return this.genAbilities['Sorcery'].ranks > 0 && this.invAbilities['Sorcerer']['Corruption'].ranks == 0;
  }
  
  get freeAllies(): number {
    let r = 0;
    for (const a of this.allegiances) {
      r += a.ally.ranks;
    }
    if (r < this.aFree) {
      return this.aFree - r;
    }
    return 0;
  }

  get freeEnemies(): number {
    let r = 0;
    for (const a of this.allegiances) {
      r += a.enemy.ranks;
    }
    if (r < this.eFree - this.int(this.formGroup.controls.advEnemy.value)) {
      return this.eFree - r;
    }
    return 0;
  }

  get blankFactions(): number {
    let r = 0;
    for (const a of this.allegiances) {
      if (a.name == '' && (a.ally.ranks || a.favor || a.enemy.ranks || a.grudge )) {
        r++;
      }
    }
    return r;
  }

  get staminaUnspent(): number {
    let r = this.staminaBuild + this.int(this.formGroup.controls.advStamB.value);
    r -= this.genAbilities['Health'].ranks;
    r -= this.genAbilities['Morale'].ranks;
    return r;
  }
  
  get spheresUnspent(): number {
    let r = this.invAbilities['Sorcerer']['Corruption'].ranks;
    for (let s of this.spheres) {
      if (s) {
        r--;
      }
    }
    return r;
  }
  
  get dupSpheres(): string[] {
    let a: Record<string, boolean> = {};
    let d: Record<string, boolean> = {};
    for (let s of this.spheres) {
      if (s != '') {
        if (s in a) {
          d[s] = true;
        } else {
          a[s] = true;
        }
      }
    }
    return Object.keys(d);
  }

  get armor(): number {
    let result = 0;
    const re = /\(Armor (\d+)\)/g;
    for (let i = 0; i < this.gear.length; i++) {
      const matches = this.gear[i].value.matchAll(re);
      for (const match of matches) {
        const a = parseInt(match[1], 10);
        if (a > result) {
          result = a;
        }
      }
    }
    return result;
  }

  get grit(): number {
    return (this.iconic >= 5) ? 1 : 0;
  }
  
  get iconic(): number {
    let result = 0;
    for (let g of this.gear) {
      if (g.iconic && g.value != '') {
        result++;
      }
    }
    return result;
  }
  
  get nonIconicGear(): string {
    const acc = [];
    for (let i = 0; i < this.gear.length; i++) {
      if (!this.gear[i].iconic && this.gear[i].value.length) {
        acc.push(this.gear[i].value);
      }
    }
    return acc.join(', ');
  }
  
  curGenRank(name: string, i: number): string {
    if (i > 4 && this.genAbilities[name].ranks == i) {
      return i + '';
    } else {
      return '';
    }
  }
  
  curGenPool(name: string, i: number): string {
    if (this.genAbilities[name].pool == i || this.genAbilities[name].ranks == i) {
      return this.fmt(i) + '';
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
    if(this.adjectives.length < 5) {
      this.adjectives.push('');
      this.saveToLocal();
    }
  }

  delAdjective(i: number) {
    this.adjectives.splice(i, 1);
    this.saveToLocal();
  }
  
  setAdjective(i: number, v: string) {
    this.adjectives[i] = v;
    this.saveToLocal();
  }

  setDrive(d: Drive, v: string) {
    d.value = v;
    this.saveToLocal();
  }

  setInvAbility(cat: string, name: string, i: number): void {
    const a = this.invAbilities[cat][name];
    if (a.ranks == i) {
      a.ranks--;
    } else {
      a.ranks = i;
    }
    if (cat == 'Sorcerer' && name == 'Corruption') {
      if (this.spheres.length > a.ranks) {
        this.spheres.splice(a.ranks);
      }
      for (let i = this.spheres.length; i < a.ranks; i++) {
        this.spheres[i] = '';
      }
    }
    console.log(this.spheres);
    this.saveToLocal();
  }

  adjustInvPool(cat: string, name: string, increment = true): void {
    const a = this.invAbilities[cat][name];
    if (increment) {
      a.pool++;
    } else {
      a.pool--;
    }
    this.saveToLocal();
  }

  setGenAbility(name: string, i: number): void {
    const a = this.genAbilities[name];
    if (a.ranks == i) {
      a.ranks--;
    } else {
      a.ranks = i;
    }
    this.saveToLocal();
  }
  
  adjustGenPool(name: string, increment = true): void {
    const a = this.genAbilities[name];
    if (increment) {
      a.pool++;
    } else {
      a.pool--;
    }
    this.saveToLocal();
  }

  addAllegiance() {
    if(this.allegiances.length < 12) {
      this.allegiances.push(new Allegiance());
      this.saveToLocal();
    }
  }

  delAllegiance(i: number) {
    this.allegiances.splice(i, 1);
    this.saveToLocal();
  }

  setAllegiance(i: number, v: string) {
    this.allegiances[i].name = v;
    this.saveToLocal();
  }

  setAlly(i: number, v: number): void {
    const a = this.allegiances[i];
    if (a.ally.ranks == v) {
      a.ally.ranks--;
    } else {
      a.ally.ranks = v;
    }
    this.saveToLocal();
  }
  
  setEnemy(i: number, v: number): void {
    const a = this.allegiances[i];
    if (a.enemy.ranks == v) {
      a.enemy.ranks--;
    } else {
      a.enemy.ranks = v;
    }
    this.saveToLocal();
  }
  
  adjustAllyPool(i: number, increment = true): void {
    const a = this.allegiances[i];
    if (increment) {
      a.ally.pool++;
    } else {
      a.ally.pool--;
    }
    this.saveToLocal();
  }
  
  addGear() {
    if (this.gear.length < 10) {
      this.gear.push(new Gear());
      this.saveToLocal();
    }
  }

  delGear(i: number) {
    this.gear.splice(i, 1);
    this.saveToLocal();
  }
  
  setGear(i: number, v: string) {
    this.gear[i].value = v;
    this.saveToLocal();
  }

  setGearIconic(i: number, ico: boolean) {
    this.gear[i].iconic = ico;
    this.saveToLocal();
  }

  setSphere(i: number, v: string) {
    this.spheres[i] = v;
    this.saveToLocal();
  }

  // TODO: look for this algo and refactor to a call to this
  invDef(cat: string, name: string): InvestigativeAbility|undefined {
    for (let a of this.invAbilityDefs) {
      if (a.category == cat && a.name == name) {
        return a;
      }
    }
    return;
  }
  
  /// static config ///
  
  genAbilityDefs = [
    new GeneralAbility("Athletics", "Dodge"),
    new GeneralAbility("Bind Wounds", "Plenty of Leeches"),
    new GeneralAbility("Burglary", "Fast Hands"),
    new GeneralAbility("Preparedness", "Flashback"),
    new GeneralAbility("Stealth", "Where’d She Go?"),
    new GeneralAbility("Sorcery", "Blast", true),
    new GeneralAbility("Sway", "Play to the Crowd", true),
    new GeneralAbility("Warfare", "Cleave", true),
  ];

  invAbilityDefs = [
    new InvestigativeAbility("Charm", "Social"),
    new InvestigativeAbility("Command", "Social"),
    new InvestigativeAbility("Intimidation", "Social"),
    new InvestigativeAbility("Liar’s Tell", "Social"),
    new InvestigativeAbility("Nobility", "Social"),
    new InvestigativeAbility("Servility", "Social"),
    new InvestigativeAbility("Taunt", "Social"),
    new InvestigativeAbility("Trustworthy", "Social"),
    new InvestigativeAbility("Felonious Intent", "Sentinel"),
    new InvestigativeAbility("Laws & Traditions", "Sentinel"),
    new InvestigativeAbility("Spirit Sight", "Sentinel"),
    new InvestigativeAbility("Vigilance", "Sentinel"),
    new InvestigativeAbility("Corruption", "Sorcerer"),
    new InvestigativeAbility("Forgotten Lore", "Sorcerer"),
    new InvestigativeAbility("Leechcraft", "Sorcerer"),
    new InvestigativeAbility("Prophecy", "Sorcerer"),
    new InvestigativeAbility("City’s Secrets", "Thief"),
    new InvestigativeAbility("Ridiculous Luck", "Thief"),
    new InvestigativeAbility("Scurrilous Rumors", "Thief"),
    new InvestigativeAbility("Skulduggery", "Thief"),
    new InvestigativeAbility("Know Monstrosities", "Warrior"),
    new InvestigativeAbility("Spot Frailty", "Warrior", true),
    new InvestigativeAbility("Tactics of Death", "Warrior"),
    new InvestigativeAbility("Wilderness Mastery", "Warrior"),
  ];

  tup = {
    animals: [
      "Aquatic Mammals",
      "Bats",
      "Bears",
      "Bugs",
      "Burrowing Mammals",
      "Cats",
      "Cattle",
      "Crustaceans",
      "Dogs",
      "Fish",
      "Fowl",
      "Frogs and Toads",
      "Great Cats",
      "Herd Beasts",
      "Horses",
      "Lizards",
      "Primates",
      "Raptors",
      "Rodents",
      "Seabirds",
      "Snakes",
      "Songbirds",
      "Spiders",
      "Swine",
      "Wolves and Foxes",
    ],
    factions: [
      "Ancient Nobility",
      "Architects and Canal-Watchers",
      "Church of Denari",
      "City Watch",
      "Commoners",
      "Mercanti",
      "Mercenaries",
      "Monstrosities",
      "Outlanders",
      "Sorcerous Cabals",
      "The Triskadane",
      "Thieves' Guilds",
    ],
    spheres: [
      ["Aging", true, true],
      ["Air", true, false],
      ["Animal", true, true],
      ["Blades", true, false],
      ["Blood", true, false],
      ["Chaos", true, true],
      ["Curses", true, true],
      ["Death", true, false],
      ["Decay/Entropy", true, false],
      ["Demonology", true, true],
      ["Disease", true, true],
      ["Earth", true, false],
      ["Fear", false, true],
      ["Fire", true, false],
      ["Flesh", true, false],
      ["Ghosts and Spirits", false, true],
      ["Ice", true, false],
      ["Illusion", false, true],
      ["Lightning", true, false],
      ["Love", false, true],
      ["Luck", true, true],
      ["Memory", false, true],
      ["Music", false, true],
      ["Necromancy", true, false],
      ["Physical Transmutation", true, false],
      ["Plants", true, false],
      ["Possession", true, true],
      ["Secrets", false, true],
      ["Shadow", true, false],
      ["Statuary", true, false],
      ["Swamp", true, false],
      ["Transmutation", true, false],
      ["Transportation", true, true],
      ["Water", true, false],
    ],
    lifestyle: [
      "Squalid",
      "Struggling",
      "Comfortable",
      "Wealthy",
      "Opulent",
    ]
  };
}

/// classes ///

class SaveSlot {
  ed: CharacterEditorComponent;
  key: string;
  ts: number;
  c: any;
  
  constructor(ed: CharacterEditorComponent, key: string) {
  this.ed = ed;
    this.key = key;
    const str = localStorage.getItem(key) as string;
    const save = JSON.parse(str);
    this.ts = save['ts'];
    this.c = save['c'];
  }

  get dateLocal(): string {
    return new Date(this.ts * 1000).toLocaleString();
  }

  get dateUtc(): string {
    return new Date(this.ts * 1000).toUTCString();
  }
  
  get isSlected(): boolean {
    return this.ed.selectedSaveSlot !== null && this.ed.selectedSaveSlot.key == this.key;
  }
}

class GeneralAbility {
  name: string;
  talent: string;
  combat: boolean;
  constructor(name: string, talent: string, combat = false) {
    this.name = name;
    this.talent = talent;
    this.combat = combat;
  }
}

class InvestigativeAbility {
  name: string;
  category: string;
  healthMorale: boolean;
  constructor(name: string, category: string, healthMorale = false) {
    this.name = name;
    this.category = category;
    this.healthMorale = healthMorale;
  }
}

class Drive {
  value = '';
  pool = 1;
  /*i: number;
  constructor(i: number) {
    this.i = i;
  }*/

  set(o: Drive): void {
    this.value = o['value'] as string;
    this.pool = o['pool'] as number;
  }
}

class Gear {
  value = '';
  iconic = false;
  /*i: number;
  constructor(i: number) {
    this.i = i;
  }*/

  set(o: Gear): void {
    this.value = o['value'] as string;
    this.iconic = o['iconic'] as boolean;
  }
  
  static new(len = 0): Gear[] {
    var g: Gear[]; 
    g = [];
    for (let i = 0; i < len; i++) {
      g.push(new Gear());
    }
    return g;
  }
}

class Ability {
  #ranks: number;
  pool: number;
  
  constructor(init = 0) {
    this.#ranks = this.pool = init;
  }

  set ranks(v: number) {
    this.setRanks(v);
  }
  
  get ranks() {
    return this.#ranks;
  }
  
  setRanks(v: number, adjustPool: boolean = true):number {
    const old = this.#ranks;
    const diff = v - old;
    this.#ranks = v;
    if (adjustPool) {
      this.pool += diff;
      if (this.pool < 0) {
        this.pool = 0;
      }
    }
    return v;
  }

  set(o: Ability): void {
    this.#ranks = o['ranks'];
    this.pool = o['pool'];
  }
  
  toJSON(key: string) {
    return {ranks: this.#ranks, pool: this.pool};
  }
}

class Allegiance {
  name: string;
  ally = new Ability();
  favor = 0;
  enemy = new Ability();
  grudge = 0;

  constructor(name = '') {
    this.name = name;
  }

  set(o: Allegiance): void {
    this.name = o['name'];
    this.ally.set(o['ally']);
    this.favor = o['favor'];
    this.enemy.set(o['enemy']);
    this.grudge = o['grudge'];
  }
}

