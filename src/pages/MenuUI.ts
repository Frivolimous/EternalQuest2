import * as PIXI from 'pixi.js';
import { BaseUI } from './_BaseUI';
import { CONFIG } from '../Config';
import { CreditsUI } from './CreditsUI';
import { MuterOverlay } from '../components/ui/MuterOverlay';
import { JMTween, JMEasing } from '../JMGE/JMTween';
import { SaveManager } from '../services/SaveManager';
import { StringData } from '../data/StringData';
import { TooltipReader } from '../components/tooltip/TooltipReader';
import { JMRect } from '../JMGE/others/JMRect';
import { Button } from '../components/ui/Button';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { GameUI } from './GameUI';
import { BuffIcon } from '../components/game/sprites/BuffIcon';
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

    // let width = 50;
    // let iconb = new PIXI.Graphics();
    // let icon = new PIXI.Graphics();
    // this.addChild(iconb, icon);
    // iconb.beginFill(0x00ff00).lineStyle(2).drawCircle(width / 2, width / 2, width / 2);
    // iconb.position.set(200, 200);
    // icon.position.set(200, 200);

    // window.addEventListener('keydown', e => {
    //   if (e.key === 'e') {
    //     new JMTween({percent: 0}, 5000).to({percent: 1}).start().onUpdate(obj => {
    //       icon.clear().beginFill(0xff0000).lineStyle(2)
    //         .moveTo(width / 2, width / 2)
    //         // .lineTo(0, width / 2)
    //         .arc(width / 2, width / 2, width / 2, - Math.PI / 2, - Math.PI / 2 + Math.PI * 2 - Math.PI * 2 * obj.percent)
    //         .lineTo(width / 2, width / 2);
    //     });
    //   }
    // });
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
