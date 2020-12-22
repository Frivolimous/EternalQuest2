import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { IHeroSave, CurrencySlug } from '../data/SaveData';
import { SaveManager } from '../services/SaveManager';
import { SelectList } from '../components/ui/SelectButton';
import { StatModel } from '../engine/stats/StatModel';
import { InventoryPanelMenu } from '../components/ui/panels/InventoryPanelMenu';
import { InventoryPanelStore } from '../components/ui/panels/InventoryPanelStore';
import { OptionModal } from '../components/ui/modals/OptionModal';
import { IItem, BasicStore } from '../data/ItemData';
import { CurrencyPanel } from '../components/ui/panels/CurrencyPanel';
import { JMTicker } from '../JMGE/events/JMTicker';
import { StoreManager, IPurchaseResult } from '../services/StoreManager';
import { SimpleModal } from '../components/ui/modals/SimpleModal';
import { Formula } from '../services/Formula';
import { InventoryPanelBlack } from '../components/ui/panels/InventoryPanelBlack';
import { InventoryPanelStash } from '../components/ui/panels/InventoryPanelStash';
import { ItemManager } from '../services/ItemManager';

export class StoreUI extends BaseUI {
  public selectLeft: SelectList;
  public selectRight: SelectList;

  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel = new PIXI.Graphics();
  private backB: Button;

  private save: IHeroSave;
  private model: StatModel;

  private storePanel: InventoryPanelStore;
  private blackPanel: InventoryPanelBlack;
  // private actionPanel: ActionPanel;

  private inventoryPanel: InventoryPanelMenu;
  private stashPanel: InventoryPanelStash;
  // private skillPanel: SkillPanel;
  private currencyPanel: CurrencyPanel;

  private refreshTokenUsed: boolean;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text('Store', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: 'Back', onClick: this.navMenu });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.currencyPanel = new CurrencyPanel();
    JMTicker.add(this.updateCurrency); // make this a listener instead?
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB, this.currencyPanel);

    this.selectLeft = new SelectList({ width: 90, height: 30}, this.switchLeft);
    this.selectRight = new SelectList({ width: 90, height: 30}, this.switchRight);

    let button: Button;
    button = this.selectLeft.makeButton('Gold Store');
    this.addChild(button);
    button = this.selectLeft.makeButton('Black Market');
    this.addChild(button);
    // button = this.selectLeft.makeButton('Actions');
    // this.addChild(button);
    button = this.selectRight.makeButton('Inventory');
    this.addChild(button);
    button = this.selectRight.makeButton('Stash');
    this.addChild(button);
    // button = this.selectRight.makeButton('Cosmetics');
    // this.addChild(button);

    this.storePanel = new InventoryPanelStore(new PIXI.Rectangle(0, 0, 300, 500));
    this.leftPanel.addChild(this.storePanel);
    this.blackPanel = new InventoryPanelBlack(new PIXI.Rectangle(0, 0, 300, 500));
    this.leftPanel.addChild(this.blackPanel);
    // this.actionPanel = new ActionPanel(new PIXI.Rectangle(0, 0, 300, 500));
    // this.leftPanel.addChild(this.actionPanel);

    this.inventoryPanel = new InventoryPanelMenu(new PIXI.Rectangle(0, 0, 300, 500));
    this.rightPanel.addChild(this.inventoryPanel);
    this.stashPanel = new InventoryPanelStash(new PIXI.Rectangle(0, 0, 300, 500));
    this.rightPanel.addChild(this.stashPanel);
    // this.skillPanel = new SkillPanel(new PIXI.Rectangle(0, 0, 300, 500));
    // this.skillPanel.addRespec(this.attemptRespec);

    this.selectLeft.selectButton(0);
    this.selectRight.selectButton(0);

    this.inventoryPanel.onItemSell = this.sellItem; // very deep callback, goes through like 5 layers
    this.stashPanel.onItemSell = this.sellItem;
    this.storePanel.onItemSell = this.sellItem;

    this.storePanel.addToInventory = this.inventoryPanel.addInventoryItem;
    this.blackPanel.addToInventory = this.inventoryPanel.addInventoryItem;

    this.storePanel.canAfford = this.canAfford;
    this.blackPanel.canAfford = this.canAfford;

    this.storePanel.fillAllItems = this.fillAllItems;

    this.blackPanel.removeGamble = this.removeGamble;
    this.blackPanel.refreshGamble = this.refreshGamble;
  }

  public navIn = () => {
    this.storePanel.addSlugArray(BasicStore, Formula.itemLevelByZone(SaveManager.getCurrentProgress().zone));
    let blackArray = SaveManager.getExtrinsic().storeItems.gamble;
    if (blackArray) {
      this.blackPanel.addSlugArray(blackArray,  Formula.itemLevelByZone(SaveManager.getCurrentProgress().zone));
      this.setRefreshText();
    } else {
      this.finishRefreshGamble();
    }

    this.getPlayer();
  }

  public destroy() {
    super.destroy();
    this.storePanel.destroy();
    this.blackPanel.destroy();
    this.inventoryPanel.destroy();
    // this.skillPanel.destroy();
    this.currencyPanel.destroy();
    this.stashPanel.destroy();
    this.model.onUpdate.removeListener(this.updateStats);
  }

  public removeGamble = (item: IItem, slot: number) => {
    SaveManager.getExtrinsic().storeItems.gamble[slot] = null;
  }

  public refreshGamble = () => {
    if (SaveManager.getExtrinsic().currency.refresh >= 1) {
      SaveManager.getExtrinsic().currency.refresh--;
      this.finishRefreshGamble();
    } else {
      if (!this.refreshTokenUsed) {
        this.addDialogueWindow(new OptionModal('Use 1 Power Token to refresh the store slots?', [{ label: 'Yes', onClick: () => (this.refreshTokenUsed = true, this.refreshGamble()), color: 0x66ff66}, { label: 'No', color: 0xff6666 }]));
      } else {
        this.canAfford(1, this.finishRefreshGamble, 'tokens');
      }
    }
  }

  public finishRefreshGamble = () => {
    let blackArray = ItemManager.makeGambleArray();
    SaveManager.getExtrinsic().storeItems.gamble = blackArray;
    this.blackPanel.addSlugArray(blackArray,  Formula.itemLevelByZone(SaveManager.getCurrentProgress().zone));
    this.setRefreshText();
  }

  public setRefreshText() {
    let refreshes = SaveManager.getExtrinsic().currency.refresh;
    this.blackPanel.setRefreshText(refreshes);
  }

  public getPlayer() {
    this.save = SaveManager.getCurrentPlayer();
    this.model = StatModel.fromSave(this.save);
    // this.storeP.changeSource(this.model);
    // this.actionPanel.changeSource(this.model);
    this.inventoryPanel.addSource(this.model);
    this.stashPanel.addSource(this.save);
    // this.skillPanel.addSource(this.model);

    this.model.onUpdate.addListener(this.updateStats);
  }

  public updateStats = (model: StatModel) => {
    this.inventoryPanel.updateSlots();
  }

  public switchLeft = (i: number) => {
    this.storePanel.visible = i === 0;
    this.blackPanel.visible = i === 1;
    // this.stashPanel.visible = i === 2;
  }

  public switchRight = (i: number) => {
    this.inventoryPanel.visible = i === 0;
    this.stashPanel.visible = i === 1;
    // this.skillPanel.visible = i === 1;
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
    SaveManager.savePlayer(this.model.getSave(), this.save.__id, true);
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
    this.storePanel.setFillAmount(this.inventoryPanel.getFillableCost());
  }

  private fillAllItems = () => {
    let value = this.inventoryPanel.getFillableCost();

    this.canAfford(value, () => {
      this.inventoryPanel.fillAllItems();
    });
  }

  private canAfford = (value: number, onSuccess: () => void, currency: CurrencySlug = 'gold') => {
    StoreManager.purchaseAttempt(value, currency, (result: IPurchaseResult) => {
      if (result.success) {
        onSuccess();
      } else if (result.confirmation) {
        this.addDialogueWindow(new OptionModal(result.message || 'Proceed with purchase?', [{ label: 'Yes', onClick: result.confirmation, color: 0x66ff66}, { label: 'No', color: 0xff6666 }]));
      } else {
        this.addDialogueWindow(new SimpleModal(result.message || 'Not enough ' + currency));
      }
    });
  }
}
