import * as PIXI from 'pixi.js';
import { BaseUI } from './_BaseUI';
import { CONFIG } from '../Config';
import { MuterOverlay } from '../components/ui/MuterOverlay';
import { Fonts } from '../data/Fonts';
import { Button } from '../components/ui/Button';
import { GameEvents, IResizeEvent } from '../services/GameEvents';

export class CreditsUI extends BaseUI {
  private title: PIXI.Text;
  private muter: MuterOverlay;

  constructor() {
    super({bgColor: 0x666666});

    this.title = new PIXI.Text('CreditsUI', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.addChild(this.title);

    let _button = new Button({ width: 100, height: 30, label: 'Menu', onClick: this.navMenu });
    _button.position.set(CONFIG.INIT.SCREEN_WIDTH - 150, CONFIG.INIT.SCREEN_HEIGHT - 100);
    this.addChild(_button);

    this.muter = new MuterOverlay();
    this.addChild(this.muter);

    let s = `
      Programmer: Jeremy Moshe
      Artist: ???
      Music: Binyamin Bair-Moshe
      Sound Effects: Jeremy Moshe

      Special Thanks:
      Avi Kentridge
      A. Walker
      Sofia Moshe
      Damon Kentridge
      Kurosai
      and YOU!
    `;
    let text = new PIXI.Text(s, {fontFamily: Fonts.UI});
    this.addChild(text);
    text.position.set(50, 50);

    // GameEvents.NOTIFY_CREDITS_VIEWED.publish();
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    this.muter.x = e.outerBounds.right - this.muter.getWidth();
    this.muter.y = e.outerBounds.bottom - this.muter.getHeight();
  }

  private navMenu = () => {
    this.navBack();
  }
}
