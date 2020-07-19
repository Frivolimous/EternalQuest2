import * as PIXI from 'pixi.js';
import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { CharacterPanel } from '../components/character/CharacterPanel';
import { SaveManager } from '../services/SaveManager';
import { LoadCharacterUI } from './LoadCharacterUI';
import { NewCharacterUI } from './NewCharacterUI';
import { StatisticsUI } from './StatisticsUI';

export class HomeUI extends BaseUI {
  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel: CharacterPanel;
  private backB: Button;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text('Home', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: 'Menu', onClick: this.navMenu });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel = new CharacterPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB);

    let newB = new Button({ width: 250, height: 30, label: 'New Character', onClick: () => this.navForward(new NewCharacterUI()) });
    let loadB = new Button({ width: 250, height: 30, label: 'Load Character', onClick: () => this.navForward(new LoadCharacterUI()) });
    let statsB = new Button({ width: 250, height: 30, label: 'Statistics', onClick: () => this.navForward(new StatisticsUI()) });
    let stashB = new Button({ width: 250, height: 30, label: 'Stash', onClick: () => {
      let page = new StatisticsUI();
      page.selectLeft.selectButton(2);
      page.selectRight.selectButton(0);
      this.navForward(page);
    }});

    this.leftPanel.addChild(newB, loadB, statsB, stashB);
    newB.position.set(25, 50);
    loadB.position.set(25, 150);
    statsB.position.set(25, 250);
    stashB.position.set(25, 350);

    this.rightPanel.setPlayer(SaveManager.getCurrentPlayer());
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    this.leftPanel.position.set(50, 150);
    this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.backB.position.set(e.innerBounds.right - 150, e.innerBounds.bottom - 50);
  }

  private navMenu = () => {
    this.navBack();
  }
}
