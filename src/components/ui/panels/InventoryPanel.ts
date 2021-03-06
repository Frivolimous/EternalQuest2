import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { IItem } from '../../../data/ItemData';
import { StatModel } from '../../../engine/stats/StatModel';
import { Formula } from '../../../services/Formula';
import { Button } from '../Button';

export class InventoryPanel extends BasePanel {
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  public onItemSelect: (item: IItem, type: 'select' | 'unselect' | 'double') => void;
  public offsetY: number = 0;
  public maxOffset: number = 140;

  private equip: InventoryDisplay;
  private belt: InventoryDisplay;
  private inventory: InventoryDisplay;

  private sprite: StatModel;
  private tab: Button;

  constructor() {
    super(new PIXI.Rectangle(0, 650, 800, 270), 0x999999);

    this.equip = new InventoryDisplay({ width: 60, height: 60, across: 5, down: 1, padding: 5, hasButtons: true, headers: [{label: 'Weapon', length: 1}, {label: 'Helmet', length: 1}, {label: 'Magic', length: 3}] });
    this.belt = new InventoryDisplay({ width: 60, height: 60, across: 5, down: 1, padding: 5, hasButtons: true, headers: [{label: 'Belt', length: 5}] });
    this.inventory = new InventoryDisplay({ width: 60, height: 60, across: 10, down: 2, padding: 5 });
    this.equip.overflow = this.inventory;
    this.belt.overflow = this.inventory;
    this.inventory.overflow = this.inventory;
    this.tab = new Button({label: 'pull', onClick: this.pullTab, width: 50, height: 30});
    this.addChild(this.equip, this.belt, this.inventory, this.tab);

    this.equip.addRequirement(0, {tags: ['Equipment', 'Weapon']});
    this.equip.addRequirement(1, {tags: ['Equipment', 'Helmet']});
    this.equip.addRequirement(2, {tags: ['Equipment', 'Spell']});
    this.equip.addRequirement(3, {tags: ['Equipment', 'Spell']});
    this.equip.addRequirement(4, {tags: ['Equipment', 'Spell']});

    this.belt.addRequirement('all', {tags: ['Belt'], relic: true});
    this.belt.slot0Index = 5;

    this.equip.position.set(50, 30);
    this.belt.position.set(400, 30);
    this.inventory.position.set(50, 130);
    this.tab.position.set((this.getWidth() - this.tab.getWidth()) / 2, -this.tab.getHeight());

    this.equip.onItemSell = this.sellItem;
    this.belt.onItemSell = this.sellItem;
    this.inventory.onItemSell = this.sellItem;
  }

  public destroy() {
    this.equip.destroy();
    this.belt.destroy();
    this.inventory.destroy();

    super.destroy();
  }

  public pullTab = () => {
    if (this.offsetY === 0) {
      this.offsetY = this.maxOffset;
      this.y += this.maxOffset;
    } else {
      this.offsetY = 0;
      this.y -= this.maxOffset;
    }
  }

  public addSource = (source: SpriteModel) => {
    this.sprite = source.stats;
    // create items in the inventory
    this.equip.clear();
    this.belt.clear();
    this.inventory.clear();
    source.stats.inventory.forEach((item, i) => {
      if (item) {
        this.inventory.addItemAt(new InventoryItem(item), i, true);
      }
    });

    source.stats.equipment.forEach((item, i) => {
      if (item) {
        if (i < 5) {
          this.equip.addItemAt(new InventoryItem(item), i, true);
        } else {
          this.belt.addItemAt(new InventoryItem(item), i - 5, true);
        }
      }
    });

    this.equip.onItemAdded = source.stats.equipItem;
    this.equip.onItemRemoved = source.stats.unequipItem;
    this.equip.selectable = true;
    this.equip.onItemSelect = this.selectItem;
    this.belt.onItemAdded = source.stats.equipItem;
    this.belt.onItemRemoved = source.stats.unequipItem;
    this.belt.selectable = true;
    this.belt.onItemSelect = this.selectItem;
    this.inventory.onItemAdded = source.stats.addItem;
    this.inventory.onItemRemoved = source.stats.removeItem;
    this.updateSlots();
  }

  public updateSlots = () => {
    let magicSlots = this.sprite.getStat('magicSlots');
    let beltSlots = this.sprite.getStat('beltSlots');

    this.equip.enableAllSlots();
    this.belt.enableAllSlots();
    for (let i = 1; i <= 3; i++) {
      if (magicSlots < i) {
        this.equip.disableSlot(i + 1);
      }
    }

    for (let i = 1; i <= 5; i++) {
      if (beltSlots < i) {
        this.belt.disableSlot(i - 1);
      }
    }
  }

  public clearItemSelect = (item: IItem) => {
    let view = this.equip.getItemByModel(item) || this.belt.getItemByModel(item) || this.inventory.getItemByModel(item);
    if (view) {
      view.setSelect(false);
    }
  }

  public selectItem = (item: IItem, type: 'select' | 'unselect' | 'double') => {
    this.equip.unselectAll(item);
    this.belt.unselectAll(item);
    this.onItemSelect && this.onItemSelect(item, type);
  }

  public sellItem = (item: IItem, slot: number, callback: () => void) => {
    if (this.onItemSell) this.onItemSell(item, slot, callback);
  }

  public addItem = (item: IItem) => {
    this.inventory.addItem(new InventoryItem(item));
  }

  public updateItem = (item: IItem) => {
    let view = this.equip.getItemByModel(item) || this.belt.getItemByModel(item) || this.inventory.getItemByModel(item);

    if (view) {
      view.updateCharges(item.charges);
    }
  }

  public removeItem = (item: IItem) => {
    this.equip.removeItemByModel(item) || this.belt.removeItemByModel(item) || this.inventory.removeItemByModel(item);
  }

  public getFillableItems = () => {
    return this.equip.getFillableItems().concat(this.belt.getFillableItems(), this.inventory.getFillableItems()) || [];
  }

  public getFillableCost = () => {
    return this.getFillableItems().reduce((n, item) => Formula.costToFill(item.source), 0);
  }

  public fillAllItems = () => {
    let items = this.getFillableItems();
    items.forEach(item => {
      item.source.charges = item.source.maxCharges;
      item.updateCharges(item.source.charges);
    });
  }
}
