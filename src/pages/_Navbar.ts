import * as PIXI from 'pixi.js';
import { GameEvents, IResizeEvent } from '../services/GameEvents';
import { IBaseUI, BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { Colors } from '../data/Colors';
import { MenuUI } from './MenuUI';
import { Facade } from '../index';
import { CreditsUI } from './CreditsUI';
import { GameUI } from './GameUI';
import { BlankUI } from './BlankUI';
import { LoadCharacterUI } from './LoadCharacterUI';
import { HomeUI } from './HomeUI';
import { NewCharacterUI } from './NewCharacterUI';
import { StatisticsUI } from './StatisticsUI';
import { StoreUI } from './StoreUI';
import { DuelMenuUI } from './DuelMenuUI';

export class Navbar extends PIXI.Container {
  private background = new PIXI.Graphics();
  private contents: PIXI.Container[] = [];

  constructor() {
    super();
    GameEvents.WINDOW_RESIZE.addListener(this.onResize);
    this.addChild(this.background);
    this.addContent('Intro', BlankUI, true);
    this.addContent('Main Menu', MenuUI);
    this.addContent('Home', HomeUI);
    this.addContent('► New Character', NewCharacterUI);
    this.addContent('► Load Character', LoadCharacterUI);
    this.addContent('► Statistics', StatisticsUI);
    this.addContent2('► Stash', () => { let page = new StatisticsUI(); page.selectLeft.selectButton(2); page.selectRight.selectButton(0); Facade.setCurrentPage(page, null, true); });
    this.addContent('Game', GameUI);
    this.addContent('► Duel Arena', DuelMenuUI, false);
    this.addContent('► Epic Mode', BlankUI, true);
    this.addContent('► Special Event', BlankUI, true);
    this.addContent('Main Store', StoreUI);
    this.addContent('► Gold Store', StoreUI);
    this.addContent2('► Black Market', () => { let page = new StoreUI(); page.selectLeft.selectButton(1); page.selectRight.selectButton(0); Facade.setCurrentPage(page, null, true); });
    this.addContent('► Premium Store', BlankUI, true);
    this.addContent('Library', BlankUI, true);
    this.addContent('Achievements', BlankUI, true);
    this.addContent('Ascension', BlankUI, true);
    this.addContent('Credits', CreditsUI);
    this.addContent('Forge', BlankUI, true);
    this.addContent('Notifications', BlankUI, true);
  }

  private addContent(title: string, PageConstructor: typeof BaseUI, nowhere: boolean = null) {
    let content = new PIXI.Text(title, {fontFamily: Fonts.UI, fill: nowhere ? 0xff7777 : nowhere === false ? 0xaaaa77 : 0xffffff, fontSize: 20});
    this.addChild(content);
    this.contents.push(content);
    content.interactive = true;
    content.buttonMode = true;

    content.addListener('pointerdown', () => {
      let page = new PageConstructor();
      Facade.setCurrentPage(page, null, true);
    });

    if (nowhere === null) {
      content.addListener('pointerover', () => content.tint = 0x00ffff);
      content.addListener('pointerout', () => content.tint = 0xffffff);
    }
  }

  private addContent2(title: string, onDown: () => void, nowhere = false) {
    let content = new PIXI.Text(title, {fontFamily: Fonts.UI, fill: nowhere ? 0xff7777 : 0xffffff, fontSize: 20});
    this.addChild(content);
    this.contents.push(content);
    content.interactive = true;
    content.buttonMode = true;

    content.addListener('pointerdown', onDown);
    content.addListener('pointerover', () => content.tint = 0x00ffff);
    content.addListener('pointerout', () => content.tint = 0xffffff);
  }

  private onResize = (e: IResizeEvent) => {
    let bounds = new PIXI.Rectangle(0, 0, e.innerBounds.x - e.outerBounds.x, e.outerBounds.height);
    this.background.clear().beginFill(0x333333).drawShape(bounds);
    this.position.set(e.outerBounds.x, e.outerBounds.y);

    let top = 20;
    let left = 20;
    let inc = 30;

    for (let i = 0; i < this.contents.length; i++) {
      this.contents[i].position.set(left, top + i * inc);
    }
  }
}
