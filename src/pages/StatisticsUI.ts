import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { IPlayerSave } from '../data/SaveData';
import { SaveManager } from '../services/SaveManager';
import { SelectList } from '../components/ui/SelectButton';
import { StatsPanel } from '../components/ui/panels/StatsPanel';
import { StatModel } from '../engine/stats/StatModel';
import { InventoryPanelMenu } from '../components/ui/panels/InventoryPanelMenu';
import { SkillPanel } from '../components/ui/panels/SkillPanel';
import { InventoryPanelStash } from '../components/ui/panels/InventoryPanelStash';
import { ActionPanel } from '../components/ui/panels/ActionPanel';

export class StatisticsUI extends BaseUI {
  public selectLeft: SelectList;
  public selectRight: SelectList;

  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel = new PIXI.Graphics();
  private backB: Button;

  private save: IPlayerSave;
  private model: StatModel;

  private statsPanel: StatsPanel;
  private stashPanel: InventoryPanelStash;
  private actionPanel: ActionPanel;

  private inventoryPanel: InventoryPanelMenu;
  private skillPanel: SkillPanel;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text('Statistics', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: 'Menu', onClick: this.navMenu });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB);

    this.selectLeft = new SelectList({ width: 90, height: 30}, this.switchLeft);
    this.selectRight = new SelectList({ width: 90, height: 30}, this.switchRight);

    let button: Button;
    button = this.selectLeft.makeButton('Stats');
    this.addChild(button);
    button = this.selectLeft.makeButton('Actions');
    this.addChild(button);
    button = this.selectLeft.makeButton('Stash');
    this.addChild(button);
    button = this.selectRight.makeButton('Inventory');
    this.addChild(button);
    button = this.selectRight.makeButton('Skills');
    this.addChild(button);
    button = this.selectRight.makeButton('Cosmetics');
    this.addChild(button);

    this.statsPanel = new StatsPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.leftPanel.addChild(this.statsPanel);
    this.stashPanel = new InventoryPanelStash(new PIXI.Rectangle(0, 0, 300, 500));
    this.leftPanel.addChild(this.stashPanel);
    this.actionPanel = new ActionPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.leftPanel.addChild(this.actionPanel);

    this.inventoryPanel = new InventoryPanelMenu(new PIXI.Rectangle(0, 0, 300, 500));
    this.rightPanel.addChild(this.inventoryPanel);
    this.skillPanel = new SkillPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.rightPanel.addChild(this.skillPanel);

    this.selectLeft.selectButton(0);
    this.selectRight.selectButton(0);

    this.getPlayer();
  }

  public destroy() {
    super.destroy();
    this.statsPanel.destroy();
    this.stashPanel.destroy();
    this.inventoryPanel.destroy();
    this.skillPanel.destroy();
  }

  public getPlayer() {
    this.save = SaveManager.getCurrentPlayer();
    this.model = StatModel.fromSave(this.save);
    this.statsPanel.changeSource(this.model);
    this.actionPanel.changeSource(this.model);
    this.inventoryPanel.addPlayer(this.model);
    this.stashPanel.addPlayer(this.save);
    this.skillPanel.addPlayer(this.model);
  }

  public switchLeft = (i: number) => {
    this.statsPanel.visible = i === 0;
    this.actionPanel.visible = i === 1;
    this.stashPanel.visible = i === 2;
  }

  public switchRight = (i: number) => {
    this.inventoryPanel.visible = i === 0;
    this.skillPanel.visible = i === 1;
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    this.leftPanel.position.set(50, 150);
    this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.backB.position.set(e.innerBounds.right - 150, e.innerBounds.bottom - 50);
    this.selectLeft.buttons.forEach((button, i) => button.position.set(this.leftPanel.x + 100 * i, this.leftPanel.y - 35));
    this.selectRight.buttons.forEach((button, i) => button.position.set(this.rightPanel.x + 100 * i, this.rightPanel.y - 35));
  }

  public navOut = () => {
    SaveManager.savePlayer(this.model.getSave(), this.save.__id, true);
  }

  private navMenu = () => {
    this.navBack();
  }
}
