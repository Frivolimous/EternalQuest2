import _ from 'lodash';
import * as PIXI from 'pixi.js';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { StringManager } from '../services/StringManager';
import { DuelGameUI } from './DuelGameUI';
import { CharacterPanel } from '../components/ui/panels/CharacterPanel';
import { StatisticsUI } from './StatisticsUI';
import { SaveManager } from '../services/SaveManager';

export class DuelMenuUI extends BaseUI {
  private title: PIXI.Text;
  private backB: Button;
  private fightB: Button;
  private leftPanel: CharacterPanel;
  private rightPanel: CharacterPanel;
  private leftStatsB: Button;
  private rightStatsB: Button;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text('Duel Arena - Menu', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.BACK, onClick: this.navMenu });
    this.fightB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.FIGHT, onClick: this.navFight });
    this.leftStatsB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.STATISTICS, onClick: this.navStatsLeft });
    this.rightStatsB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.STATISTICS, onClick: this.navStatsRight });
    this.leftPanel = new CharacterPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.rightPanel = new CharacterPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.addChild(this.title, this.backB, this.fightB, this.leftPanel, this.rightPanel, this.leftStatsB, this.rightStatsB);
  }

  public navIn = () => {
    this.loadCharacters();
  }

  public loadCharacters = () => {
    let player = SaveManager.getDuelPlayer();
    let opponent = SaveManager.getDuelOpponent();

    this.leftPanel.setSource(player);
    this.rightPanel.setSource(opponent);
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    // this.leftPanel.position.set(50, 150);
    // this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.backB.position.set(e.innerBounds.right - 150, e.innerBounds.bottom - 50);
    this.fightB.position.set(e.innerBounds.right / 2 - this.fightB.getWidth() / 2, e.innerBounds.bottom - 100);
    this.leftPanel.position.set(50, 150);
    this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.leftStatsB.position.set(this.leftPanel.x + (this.leftPanel.getWidth() - this.leftStatsB.getWidth()) / 2, this.leftPanel.y + this.leftPanel.getHeight() - 50);
    this.rightStatsB.position.set(this.rightPanel.x + (this.rightPanel.getWidth() - this.rightStatsB.getWidth()) / 2, this.rightPanel.y + this.rightPanel.getHeight() - 50);
  }

  private navMenu = () => {
    SaveManager.clearDuelPlayer();
    SaveManager.clearDuelOpponent();
    this.navBack();
  }

  private navFight = () => {
    this.navForward(new DuelGameUI());
  }

  private navStatsLeft = () => {
    let statUI = new StatisticsUI();
    statUI.setSource(SaveManager.getDuelPlayer());
    this.navForward(statUI);
  }

  private navStatsRight = () => {
    let statUI = new StatisticsUI();
    statUI.setSource(SaveManager.getDuelOpponent());
    this.navForward(statUI);
  }
}
