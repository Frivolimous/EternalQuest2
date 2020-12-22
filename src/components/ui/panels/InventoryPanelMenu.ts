import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { IItem } from '../../../data/ItemData';
import { StatModel } from '../../../engine/stats/StatModel';
import { Formula } from '../../../services/Formula';

export class InventoryPanelMenu extends BasePanel {
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  private equip: InventoryDisplay;
  private belt: InventoryDisplay;
  private inventory: InventoryDisplay;

  private sprite: StatModel;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 300, 500), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.equip = new InventoryDisplay({ width: 50, height: 50, across: 5, down: 1, padding: 5, hasButtons: true, headers: [{label: 'Weapon', length: 1}, {label: 'Helmet', length: 1}, {label: 'Magic', length: 3}] });
    this.belt = new InventoryDisplay({ width: 50, height: 50, across: 5, down: 1, padding: 5, hasButtons: true, headers: [{label: 'Belt', length: 5}] });
    this.inventory = new InventoryDisplay({ width: 50, height: 50, across: 5, down: 4, padding: 5 });
    this.equip.overflow = this.inventory;
    this.belt.overflow = this.inventory;
    this.inventory.overflow = this.inventory;
    this.addChild(this.equip, this.belt, this.inventory);

    this.equip.addRequirement(0, {tags: ['Equipment', 'Weapon']});
    this.equip.addRequirement(1, {tags: ['Equipment', 'Helmet']});
    this.equip.addRequirement(2, {tags: ['Equipment', 'Spell']});
    this.equip.addRequirement(3, {tags: ['Equipment', 'Spell']});
    this.equip.addRequirement(4, {tags: ['Equipment', 'Spell']});

    this.belt.addRequirement('all', {tags: ['Belt'], relic: true});
    this.belt.slot0Index = 5;

    this.equip.position.set(10, 30);
    this.belt.position.set(10, 140);
    this.inventory.position.set(10, 230);

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

  public addSource = (sprite: SpriteModel | StatModel) => {
    if (sprite instanceof SpriteModel) {
      sprite = sprite.stats;
    }
    this.sprite = sprite;
    // create items in the inventory
    this.equip.clear();
    this.belt.clear();
    this.inventory.clear();
    sprite.inventory.forEach((item, i) => {
      if (item) {
        this.inventory.addItemAt(new InventoryItem(item), i, true);
      }
    });

    sprite.equipment.forEach((item, i) => {
      if (item) {
        if (i < 5) {
          this.equip.addItemAt(new InventoryItem(item), i, true);
        } else {
          this.belt.addItemAt(new InventoryItem(item), i - 5, true);
        }
      }
    });

    this.equip.onItemAdded = sprite.equipItem;
    this.equip.onItemRemoved = sprite.unequipItem;
    this.belt.onItemAdded = sprite.equipItem;
    this.belt.onItemRemoved = sprite.unequipItem;
    this.inventory.onItemAdded = sprite.addItem;
    this.inventory.onItemRemoved = sprite.removeItem;
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

  public sellItem = (item: IItem, slot: number, callback: () => void) => {
    if (this.onItemSell) this.onItemSell(item, slot, callback);
  }

  public addItem = (item: IItem) => {
    this.inventory.addItem(new InventoryItem(item));
  }

  public addInventoryItem = (item: InventoryItem) => {
    this.inventory.addItem(item);
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
