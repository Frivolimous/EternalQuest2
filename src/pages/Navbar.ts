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

export class Navbar extends PIXI.Container {
  background = new PIXI.Graphics();
  contents: PIXI.Container[] = [];

  constructor() {
    super();
    GameEvents.WINDOW_RESIZE.addListener(this.onResize);
    this.addChild(this.background);
    this.addContent('Intro', BlankUI, true);
    this.addContent('Main Menu', MenuUI);
    this.addContent('Home', BlankUI, true);
    this.addContent('► New Character', BlankUI, true);
    this.addContent('► Load Character', BlankUI, true);
    this.addContent('► Statistics', BlankUI, true);
    this.addContent('► Stash', BlankUI, true);
    this.addContent('Game', GameUI);
    this.addContent('► Duel Arena', BlankUI, true);
    this.addContent('► Epic Mode', BlankUI, true);
    this.addContent('► Special Event', BlankUI, true);
    this.addContent('Main Store', BlankUI, true);
    this.addContent('► Gold Store', BlankUI, true);
    this.addContent('► Premium Store', BlankUI, true);
    this.addContent('► Black Market', BlankUI, true);
    this.addContent('Library', BlankUI, true);
    this.addContent('Achievements', BlankUI, true);
    this.addContent('Ascension', BlankUI, true);
    this.addContent('Credits', CreditsUI);
    this.addContent('Forge', BlankUI, true);
    this.addContent('Notifications', BlankUI, true);
  }

  private addContent(title: string, PageConstructor: typeof BaseUI, nowhere = false) {
    let content = new PIXI.Text(title, {fontFamily: Fonts.UI, fill: nowhere ? 0xff7777 : 0xffffff, fontSize: 20});
    this.addChild(content);
    this.contents.push(content);
    content.interactive = true;
    content.buttonMode = true;

    content.addListener("pointerdown", () => {
      let page = new PageConstructor();
      Facade.setCurrentPage(page);
    });
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

    // console.log('nav bounds', bounds, this.position);
  }
}
