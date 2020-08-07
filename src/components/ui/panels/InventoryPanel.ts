import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { IItem } from '../../../data/ItemData';
import { StatModel } from '../../../engine/stats/StatModel';

export class InventoryPanel extends BasePanel {
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  public onItemSelect: (item: IItem, type: 'select' | 'unselect' | 'double') => void;

  private equip: InventoryDisplay;
  private belt: InventoryDisplay;
  private inventory: InventoryDisplay;

  private sprite: StatModel;

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

    this.belt.addRequirement('all', {tags: ['Belt'], relic: true});
    this.belt.slot0Index = 5;

    this.equip.position.set(50, 30);
    this.belt.position.set(400, 30);
    this.inventory.position.set(50, 130);

    this.equip.onItemSell = this.sellItem;
    this.belt.onItemSell = this.sellItem;
    this.inventory.onItemSell = this.sellItem;
  }

  public addPlayer = (player: SpriteModel) => {
    this.sprite = player.stats;
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
    this.equip.selectable = true;
    this.equip.onItemSelect = this.selectItem;
    this.belt.onItemAdded = player.stats.equipItem;
    this.belt.onItemRemoved = player.stats.unequipItem;
    this.belt.selectable = true;
    this.belt.onItemSelect = this.selectItem;
    this.inventory.onItemAdded = player.stats.addItem;
    this.inventory.onItemRemoved = player.stats.removeItem;
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

    view.updateCharges(item.charges);
  }

  public removeItem = (item: IItem) => {
    this.equip.removeItemByModel(item) || this.belt.removeItemByModel(item) || this.inventory.removeItemByModel(item);
  }
}
