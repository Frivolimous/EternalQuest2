import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { IItem, ItemSlug, IItemSave } from '../../../data/ItemData';
import { ItemManager } from '../../../services/ItemManager';
import { Button } from '../Button';
import { Fonts } from '../../../data/Fonts';
import { Formula } from '../../../services/Formula';
import { JMTicker } from '../../../JMGE/events/JMTicker';

// ADD: Fill Stacks (Single), Fill Stacks (All)

export class InventoryPanelBlack extends BasePanel {
  public canAfford: (value: number, onSuccess: () => void) => void;
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  public addToInventory: (item: InventoryItem) => void;
  public refreshGamble: () => void;
  public removeGamble: (item: IItem, slot: number) => void;
  private inventory: InventoryDisplay;

  private upgradeStack: InventoryDisplay;
  private upgradeButton: Button;
  private upgradeAmount: PIXI.Text;
  private refreshButton: Button;
  private refreshAmount: PIXI.Text;

  private itemLevel: number;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 300, 500), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.inventory = new InventoryDisplay({ width: 50, height: 50, across: 3, down: 1, padding: 5 });
    this.upgradeStack = new InventoryDisplay({ width: 50, height: 50, across: 1, down: 1, padding: 5});
    this.upgradeButton = new Button({label: 'Upgrade', onClick: this.upgradeItem, width: 80, height: 30});
    this.upgradeAmount = new PIXI.Text('0g', {fontFamily: Fonts.UI, fontSize: 16});
    this.refreshButton = new Button({label: 'Refresh', onClick: () => this.refreshGamble(), width: 50, height: 20});
    this.refreshAmount = new PIXI.Text('Free: 0', {fontFamily: Fonts.UI, fontSize: 16});
    this.addChild(this.inventory, this.upgradeStack, this.upgradeButton, this.upgradeAmount, this.refreshButton, this.refreshAmount);

    this.inventory.position.set(60, 50);
    this.refreshButton.position.set(60, 130);
    this.refreshAmount.position.set(150, 130);
    this.upgradeStack.position.set(30, 300);
    this.upgradeButton.position.set(90, 300);
    this.upgradeAmount.position.set(90, 340);

    this.inventory.customAllowedAdd = this.addItem;
    this.inventory.customAllowedRemove = this.removeItem;
    this.inventory.onItemRemoved = (item, slot) => this.removeGamble && this.removeGamble(item, slot);

    this.upgradeStack.onItemAdded = this.addUpgrade;
    this.upgradeStack.onItemRemoved = () => this.addUpgrade();

    this.upgradeStack.customAllowedAdd = this.onlyUpgradable;
    this.upgradeStack.onItemSell = this.sellItem;
  }

  public destroy() {
    this.inventory.destroy();
    this.upgradeStack.destroy();
    super.destroy();
  }

  public addUpgrade = (item?: IItem) => {
    if (item) {
      this.upgradeAmount.text = String(Formula.costToUpgrade(item)) + 'g';
    } else {
      this.upgradeAmount.text = '0g';
    }
  }

  public setRefreshText = (refreshes: number) => {
    if (refreshes >= 1) {
      this.refreshAmount.text = 'Free: ' + Math.floor(refreshes);
    } else {
      this.refreshAmount.text = '1 token';
    }
  }

  public onlyUpgradable(item: InventoryItem) {
    return (item.source.level < 15);
  }

  public upgradeItem = () => {
    let item = this.upgradeStack.getItemAt(0);
    if (!item) {
      return;
    }

    this.canAfford(Formula.costToUpgrade(item.source), () => {
      let save = ItemManager.saveItem(item.source);
      save.level++;
      item.updateSource(ItemManager.loadItem(save));
      if (!this.onlyUpgradable(item) && this.addToInventory) {
        this.upgradeStack.removeItem(item);
        this.addToInventory(item);
        this.addUpgrade();
      } else {
        this.addUpgrade(item.source);
      }
    });
  }

  public addSlugArray = (slugs: ItemSlug[], level: number) => {
    this.itemLevel = level;

    this.inventory.clear();
    slugs.forEach((slug, i) => {
      if (slug) {
        let item = ItemManager.loadItem({slug, level: -1});
        item.cost = Formula.costToGamble(item, level);
        this.inventory.addItemAt(new InventoryItem(item), i);
      }
    });
  }

  public returnItem = () => {
    let item = this.upgradeStack.getItemAt(0);
    if (item && this.addToInventory) {
      this.upgradeStack.removeItem(item);
      this.addToInventory(item);
      this.addUpgrade();
    }
  }

  public sellItem = (item: IItem, slot: number, callback: () => void) => {
    if (this.onItemSell) this.onItemSell(item, slot, callback);
  }

  private addItem = (item: InventoryItem, slot: number, onReturn: boolean): boolean => {
    if (onReturn) {
      return false;
    }

    this.sellItem(item.source, slot, () => {
      item.currentInventory.removeItem(item);
      item.destroy();
    });

    return false;
  }

  private removeItem = (item: InventoryItem, slot: number): boolean => {
    let m = false;
    let canM = true;

    this.canAfford(item.source.cost, () => {
      item.updateSource(ItemManager.finishGamble(item.source, this.itemLevel));
      if (canM) {
        m = true;
      } else {
        this.inventory.removeItem(item);
        this.addToInventory(item);
      }
    });

    canM = false;

    return m;
  }
}
