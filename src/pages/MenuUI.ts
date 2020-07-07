import * as PIXI from 'pixi.js';
import { BaseUI } from './_BaseUI';
import { CONFIG } from '../Config';
import { CreditsUI } from './CreditsUI';
import { MuterOverlay } from '../components/ui/MuterOverlay';
import { JMTween, JMEasing } from '../JMGE/JMTween';
import { SaveManager } from '../services/SaveManager';
import { StringData } from '../data/StringData';
import { TooltipReader } from '../JMGE/TooltipReader';
import { JMRect } from '../JMGE/others/JMRect';
import { Button } from '../components/ui/Button';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { GameUI } from './GameUI';
// import { GameManager } from '../TDDR/GameManager';
// import { facade };

export class MenuUI extends BaseUI {
  public muter: MuterOverlay;

  private title: PIXI.Text;

  private startB: Button;
  private creditsB: Button;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text(StringData.GAME_TITLE, { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.addChild(this.title);

    this.startB = new Button({ width: 100, height: 30, label: 'Start', onClick: this.startGame });
    this.startB.position.set(150, 200);
    this.creditsB = new Button({ width: 100, height: 30, label: 'Credits', onClick: this.navCredits });
    this.creditsB.position.set(150, 380);
    this.addChild(this.startB, this.creditsB);

    this.muter = new MuterOverlay();
    this.addChild(this.muter);
  }

  public navIn = () => {
    this.muter.reset();

    let extrinsic = SaveManager.getExtrinsic();
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    this.muter.x = e.outerBounds.right - this.muter.getWidth();
    this.muter.y = e.outerBounds.bottom - this.muter.getHeight();
  }

  private startGame = () => {
    this.navForward(new GameUI());
  }

  private navCredits = () => {
    this.navForward(new CreditsUI());
  }
}