import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { Button } from '../Button';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { ItemManager } from '../../../services/ItemManager';

export class InventoryPanel extends BasePanel {
  private equip: InventoryDisplay;
  private belt: InventoryDisplay;
  private inventory: InventoryDisplay;
  constructor() {
    super(new PIXI.Rectangle(0, 650, 800, 250), 0x999999);
    this.equip = new InventoryDisplay({ width: 60, height: 60, across: 5, down: 1, padding: 5 });
    this.belt = new InventoryDisplay({ width: 60, height: 60, across: 5, down: 1, padding: 5 });
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

    this.equip.position.set(50, 10);
    this.belt.position.set(400, 10);
    this.inventory.position.set(50, 110);
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
  }
}
