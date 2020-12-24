import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { IHeroSave } from '../data/SaveData';
import { SaveManager } from '../services/SaveManager';
import { SelectList } from '../components/ui/SelectButton';
import { StatsPanel } from '../components/ui/panels/StatsPanel';
import { StatModel } from '../engine/stats/StatModel';
import { InventoryPanelMenu } from '../components/ui/panels/InventoryPanelMenu';
import { SkillPanel } from '../components/ui/panels/SkillPanel';
import { InventoryPanelStash } from '../components/ui/panels/InventoryPanelStash';
import { ActionPanel } from '../components/ui/panels/ActionPanel';
import { OptionModal } from '../components/ui/modals/OptionModal';
import { IItem } from '../data/ItemData';
import { CurrencyPanel } from '../components/ui/panels/CurrencyPanel';
import { JMTicker } from '../JMGE/events/JMTicker';
import { StoreManager, IPurchaseResult } from '../services/StoreManager';
import { BaseModal } from '../components/ui/modals/_BaseModal';
import { SimpleModal } from '../components/ui/modals/SimpleModal';
import { StringManager } from '../services/StringManager';

export class StatisticsUI extends BaseUI {
  public selectLeft: SelectList;
  public selectRight: SelectList;

  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel = new PIXI.Graphics();
  private backB: Button;

  private source: IHeroSave;
  private model: StatModel;

  private statsPanel: StatsPanel;
  private stashPanel: InventoryPanelStash;
  private actionPanel: ActionPanel;

  private inventoryPanel: InventoryPanelMenu;
  private skillPanel: SkillPanel;
  private currencyPanel: CurrencyPanel;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text(StringManager.data.BUTTON.STATISTICS, { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.BACK, onClick: this.navMenu });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.currencyPanel = new CurrencyPanel();
    JMTicker.add(this.updateCurrency); // make this a listener instead?
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB, this.currencyPanel);

    this.selectLeft = new SelectList({ width: 90, height: 30}, this.switchLeft);
    this.selectRight = new SelectList({ width: 90, height: 30}, this.switchRight);

    let button: Button;
    button = this.selectLeft.makeButton(StringManager.data.BUTTON.STATS_TAB);
    this.addChild(button);
    button = this.selectLeft.makeButton(StringManager.data.BUTTON.ACTION_TAB);
    this.addChild(button);
    button = this.selectLeft.makeButton(StringManager.data.BUTTON.STASH);
    this.addChild(button);
    button = this.selectRight.makeButton(StringManager.data.BUTTON.INVENTORY_TAB);
    this.addChild(button);
    button = this.selectRight.makeButton(StringManager.data.BUTTON.SKILL_TAB);
    this.addChild(button);
    button = this.selectRight.makeButton(StringManager.data.BUTTON.COSMETIC_TAB);
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
    this.skillPanel.addRespec(this.attemptRespec);
    this.rightPanel.addChild(this.skillPanel);

    this.selectLeft.selectButton(0);
    this.selectRight.selectButton(0);

    this.stashPanel.onItemSell = this.sellItem; // very deep callback, goes through like 5 layers
    this.inventoryPanel.onItemSell = this.sellItem; // very deep callback, goes through like 5 layers
  }

  public navIn = () => {
    this.getSource();
  }

  public destroy() {
    super.destroy();
    this.statsPanel.destroy();
    this.stashPanel.destroy();
    this.inventoryPanel.destroy();
    this.skillPanel.destroy();
    this.currencyPanel.destroy();
    this.model.onUpdate.removeListener(this.updateStats);
  }

  public getSource() {
    this.source = SaveManager.getCurrentPlayer();
    this.model = StatModel.fromSave(this.source);
    this.statsPanel.changeSource(this.model);
    this.actionPanel.changeSource(this.model);
    this.inventoryPanel.addSource(this.model);
    this.stashPanel.addSource(this.source);
    this.skillPanel.addSource(this.model);

    this.model.onUpdate.addListener(this.updateStats);
  }

  public updateStats = (model: StatModel) => {
    this.inventoryPanel.updateSlots();
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
    this.currencyPanel.position.set(e.innerBounds.right - this.currencyPanel.getWidth(), 0);
  }

  public navOut = () => {
    SaveManager.savePlayer(this.model.getSave(), this.source.__id, true);
  }

  private navMenu = () => {
    this.navBack();
  }

  private sellItem = (item: IItem, slot: number, callback: () => void) => {
    // if (item.cost > 80) {
    //   this.addDialogueWindow(new OptionModal('Sell ' + item.name + ' for ' + item.cost + ' Gold?', { colorBack: 0x333333, colorFront: 0x666666}, 300, 300, [
    //     {label: 'Yes', onClick: () => {
    //       SaveManager.getExtrinsic().currency.gold += item.cost;
    //       callback();
    //     }},
    //     {label: 'No', color: 0xf16666, onClick: () => {}},
    //   ]));
    // } else {
      SaveManager.getExtrinsic().currency.gold += item.cost;
      callback();
    // }
  }

  private updateCurrency = () => {
    this.currencyPanel.update(SaveManager.getExtrinsic());
  }

  private attemptRespec = (value: number, onSuccess: () => void) => {
    StoreManager.purchaseAttempt(value, 'gold', (result: IPurchaseResult) => {
      if (result.success) {
        onSuccess();
      } else if (result.confirmation) {
        this.addDialogueWindow(new OptionModal(result.message || StringManager.data.MENU_TEXT.COMPLETE_PUCHASE, [{ label: StringManager.data.BUTTON.YES, onClick: result.confirmation, color: 0x66ff66}, { label: StringManager.data.BUTTON.NO, color: 0xff6666 }]));
      } else {
        this.addDialogueWindow(new SimpleModal(result.message || StringManager.data.MENU_TEXT.NOT_ENOUGH + StringManager.data.CURRENCY.gold));
      }
    });
  }
}
