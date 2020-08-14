import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { IItem, ItemSlug } from '../../../data/ItemData';
import { ItemManager } from '../../../services/ItemManager';
import { Button } from '../Button';
import { Fonts } from '../../../data/Fonts';
import { Formula } from '../../../services/Formula';
import { JMTicker } from '../../../JMGE/events/JMTicker';

// ADD: Fill Stacks (Single), Fill Stacks (All)

export class InventoryPanelStore extends BasePanel {
  public canAfford: (value: number, onSuccess: () => void) => void;
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  public addToInventory: (item: InventoryItem) => void;
  public fillAllItems: () => void;

  private inventory: InventoryDisplay;

  private fillStack: InventoryDisplay;
  private fillButton: Button;
  private fillAmount: PIXI.Text;
  private fillAllButton: Button;
  private fillAllAmount: PIXI.Text;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 300, 500), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.inventory = new InventoryDisplay({ width: 50, height: 50, across: 5, down: 4, padding: 5 });
    this.fillStack = new InventoryDisplay({ width: 50, height: 50, across: 1, down: 1, padding: 5});
    this.fillButton = new Button({label: 'Fill', onClick: this.fillFillable, width: 50, height: 20});
    this.fillAmount = new PIXI.Text('0g', {fontFamily: Fonts.UI, fontSize: 16});
    this.fillAllButton = new Button({label: 'Fill Inventory', onClick: this.fillAll, width: 100, height: 20});
    this.fillAllAmount = new PIXI.Text('0g', {fontFamily: Fonts.UI, fontSize: 16});
    this.addChild(this.inventory, this.fillStack, this.fillButton, this.fillAmount, this.fillAllButton, this.fillAllAmount);

    this.inventory.customAllowedAdd = this.addItem;
    this.inventory.customAllowedRemove = this.removeItem;

    this.fillStack.onItemAdded = this.addFill;
    this.fillStack.onItemRemoved = () => this.addFill();

    this.inventory.position.set(10, 50);
    this.fillStack.position.set(30, 300);
    this.fillButton.position.set(90, 300);
    this.fillAmount.position.set(90, 340);
    this.fillAllButton.position.set(30, 400);
    this.fillAllAmount.position.set(140, 400);

    this.fillStack.customAllowedAdd = this.onlyFillable;

    this.fillStack.onItemSell = this.sellItem;
  }

  public destroy() {
    this.inventory.destroy();
    this.fillStack.destroy();
    super.destroy();
  }

  public addFill = (item?: IItem) => {
    if (item) {
      this.fillAmount.text = String(Formula.costToFill(item)) + 'g';
    } else {
      this.fillAmount.text = '0g';
    }
  }

  public onlyFillable(item: InventoryItem) {
    return (item.source.maxCharges && item.source.charges < item.source.maxCharges);
  }

  public fillFillable = () => {
    let item = this.fillStack.getItemAt(0);
    if (!item) {
      return;
    }

    this.canAfford(Formula.costToFill(item.source), () => {
      item.source.charges = item.source.maxCharges;
      item.updateCharges(item.source.maxCharges);
      this.addFill();

      if (this.addToInventory) {
        this.fillStack.removeItem(item);
        this.addToInventory(item);
      }

      this.addFill();
    });
  }

  public setFillAmount = (n: number) => {
    this.fillAllAmount.text = String(n) + 'g';
  }

  public fillAll = () => {
    this.fillAllItems && this.fillAllItems();
  }

  public addSlugArray = (saves: ItemSlug[], level: number) => {
    this.inventory.clear();
    saves.forEach((slug, i) => {
      if (slug) {
        let item = ItemManager.loadItem({slug, level});
        item.cost *= 4;
        this.inventory.addItemAt(new InventoryItem(item), i);
      }
    });
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
