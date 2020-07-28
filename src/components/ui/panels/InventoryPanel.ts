import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { IItem } from '../../../data/ItemData';

export class InventoryPanel extends BasePanel {
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  private equip: InventoryDisplay;
  private belt: InventoryDisplay;
  private inventory: InventoryDisplay;

  constructor() {
    super(new PIXI.Rectangle(0, 650, 800, 270), 0x999999);

    this.equip = new InventoryDisplay({ width: 60, height: 60, across: 5, down: 1, padding: 5, hasButtons: true, headers: [{label: 'Weapon', length: 1}, {label: 'Helmet', length: 1}, {label: 'Magic', length: 3}] });
    this.belt = new InventoryDisplay({ width: 60, height: 60, across: 5, down: 1, padding: 5, hasButtons: true, headers: [{label: 'Belt', length: 5}] });
    this.inventory = new InventoryDisplay({ width: 60, height: 60, across: 10, down: 2, padding: 5 });
    this.equip.overflow = this.inventory;
    this.belt.overflow = this.inventory;
    this.inventory.overflow = this.inventory;
    this.addChild(this.equip, this.belt, this.inventory);

    this.equip.addRequirement(0, {tags: ['Equipment', 'Weapon']});
    this.equip.addRequirement(1, {tags: ['Equipment', 'Helmet']});
    this.equip.addRequirement(2, {tags: ['Equipment', 'Spell']});
    this.equip.addRequirement(3, {tags: ['Equipment', 'Spell']});
    this.equip.addRequirement(4, {tags: ['Equipment', 'Spell']});

    this.belt.addRequirement('all', {tags: ['Belt']});

    this.equip.position.set(50, 30);
    this.belt.position.set(400, 30);
    this.inventory.position.set(50, 130);
  }

  public addPlayer = (player: SpriteModel) => {
    // create items in the inventory
    this.equip.clear();
    this.belt.clear();
    this.inventory.clear();
    player.stats.inventory.forEach((item, i) => {
      if (item) {
        this.inventory.addItemAt(new InventoryItem(item), i, true);
      }
    });

    player.stats.equipment.forEach((item, i) => {
      if (item) {
        if (i < 5) {
          this.equip.addItemAt(new InventoryItem(item), i, true);
        } else {
          this.belt.addItemAt(new InventoryItem(item), i - 5, true);
        }
      }
    });

    this.equip.onItemAdded = player.stats.equipItem;
    this.equip.onItemRemoved = player.stats.unequipItem;
    this.belt.onItemAdded = player.stats.equipItem;
    this.belt.onItemRemoved = player.stats.unequipItem;
    this.belt.slot0Index = 5;
    this.inventory.onItemAdded = player.stats.addItem;
    this.inventory.onItemRemoved = player.stats.removeItem;

    this.equip.onItemSell = this.sellItem;
    this.belt.onItemSell = this.sellItem;
    this.inventory.onItemSell = this.sellItem;
  }

  public sellItem = (item: IItem, slot: number, callback: () => void) => {
    if (this.onItemSell) this.onItemSell(item, slot, callback);
  }

  public addItem = (item: IItem) => {
    this.inventory.addItem(new InventoryItem(item));
  }
}
