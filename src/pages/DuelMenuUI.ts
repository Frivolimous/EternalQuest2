import * as PIXI from 'pixi.js';
import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { StringManager } from '../services/StringManager';
import { DuelGameUI } from './DuelGameUI';

export class DuelMenuUI extends BaseUI {
  private title: PIXI.Text;
  private backB: Button;
  private fightB: Button;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text('Duel Arena - Menu', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.BACK, onClick: this.navMenu });
    this.fightB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.FIGHT, onClick: this.navFight });
    this.addChild(this.title, this.backB, this.fightB);
  }

  public navIn = () => {
    // this.loadCharacters();
  }

  // public loadCharacters = () => {
  //   this.loadSelection.destroyAll();

  //   SaveManager.getAllPlayers().then(saves => {
  //     this.heroes = saves;
  //     for (let i = 0; i < saves.length; i++) {
  //       let button = this.loadSelection.makeLoadButton(saves[i].name);
  //       this.leftPanel.addChild(button);
  //       button.position.set(25, 50 + i * 80);
  //     }

  //     let id = SaveManager.getCurrentPlayer().__id;
  //     let index = _.findIndex(this.heroes, {__id: id});
  //     if (index >= 0) {
  //       this.loadSelection.selectButton(index);
  //     } else {
  //       this.loadSelection.selectButton(0);
  //     }
  //   });
  // }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    // this.leftPanel.position.set(50, 150);
    // this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.backB.position.set(e.innerBounds.right - 150, e.innerBounds.bottom - 50);
    this.fightB.position.set(e.innerBounds.right / 2 - this.fightB.getWidth() / 2, e.innerBounds.bottom - 100);
  }

  private navMenu = () => {
    this.navBack();
  }

  private navFight = () => {
    this.navForward(new DuelGameUI());
  }
}
