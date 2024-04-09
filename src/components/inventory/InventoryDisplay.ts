import * as PIXI from 'pixi.js';
import _ from 'lodash';
import { InventoryItem } from './InventoryItem';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { StatTag } from '../../data/StatData';
import { IItem } from '../../data/ItemData';
import { StateButton, actionStateList, neverStateList } from '../ui/StateButton';
import { Fonts } from '../../data/Fonts';
import { ItemManager } from '../../services/ItemManager';

export const ItemDragEvent = new JMEventListener<IItemDragEvent>();
const inventoryDisplays: InventoryDisplay[] = [];

ItemDragEvent.addListener((e: IItemDragEvent) => {
  if (e.type === 'sell') {
    for (let i = 0; i < inventoryDisplays.length; i++) {
      if (inventoryDisplays[i].allowedSell(e.item)) {
        inventoryDisplays[i].sellItem(e.item, () => e.callback({allow: true}));
        return;
      }
    }
  } else if (e.type === 'start') {
    e.callback({allow: true});
    return;
  } else if (e.type === 'end') {
    let oldItem = e.item;
    for (let i = 0; i < inventoryDisplays.length; i++) {
      if (inventoryDisplays[i].hasItem(e.item) && !inventoryDisplays[i].allowedRemove(e.item)) {
        if (inventoryDisplays[i].hasItem(e.item)) {
          inventoryDisplays[i].returnItem(e.item);
        }
        e.callback({allow: false});
        return;
      }
    }
    for (let i = 0; i < inventoryDisplays.length; i++) {
      let newDisplay = inventoryDisplays[i];
      if (!newDisplay.visible || !newDisplay.parent.visible) {
        continue;
      }

      if (newDisplay.itemLocOverThis(oldItem)) {
        let newIndex = newDisplay.getIndexByItemLoc(oldItem);
        if (newDisplay.allowedAdd(oldItem, newIndex, false)) {
          let newItem = newDisplay.getItemAt(newIndex);
          if (newItem) {
            let oldDisplay = oldItem.currentInventory;
            let oldIndex = oldDisplay.getItemIndex(oldItem);
            if (oldDisplay.allowedAdd(newItem, oldIndex, true)) {
              newDisplay.removeItem(newItem);
              oldDisplay.removeItem(oldItem);
              newDisplay.addItemAt(oldItem, newIndex);
              oldDisplay.addItemAt(newItem, oldIndex);
              e.callback({allow: true});
              return;
            } else if (newDisplay.roomToAdd()) {
              newDisplay.removeItem(newItem);
              oldDisplay.removeItem(oldItem);
              newDisplay.addItemAt(oldItem, newIndex);
              newDisplay.addItem(newItem);
            } else {
              let overflow = newDisplay.overflow;
              if (overflow && overflow.roomToAdd()) {
                newDisplay.removeItem(newItem);
                oldDisplay.removeItem(oldItem);
                newDisplay.addItemAt(oldItem, newIndex);
                overflow.addItem(newItem);
                e.callback({allow: true});
                return;
              } else {
                oldDisplay.returnItem(oldItem);
                e.callback({allow: false});
                return;
              }
            }
          } else {
            oldItem.currentInventory.removeItem(oldItem);
            newDisplay.addItemAt(oldItem);
            e.callback({allow: true});
            return;
          }
        }
        oldItem.currentInventory.returnItem(oldItem);
        e.callback({allow: false});
        return;
      }
    }
    oldItem.currentInventory.returnItem(oldItem);
    e.callback({allow: false});
  } else {
    let display = e.item.currentInventory;
    if (display.selectable && (e.item.source.action || e.item.source.tags.indexOf('Unarmed') >= 0)) {
      e.callback({allow: true});
      display.onItemSelect && display.onItemSelect(e.item.source, e.type);
    }
  }
});

export interface IItemDragEvent {
  type: 'start' | 'end' | 'sell' | 'select' | 'double' | 'unselect';
  item: InventoryItem;
  callback: (result: IItemDragResult) => void;
}

export interface IItemDragResult {
  allow: boolean;
}

export interface IInventoryDisplay {
  width: number;
  height: number;
  across: number;
  down: number;
  padding: number;
  headers?: { label: string, length: number }[];
  hasButtons?: boolean;
}
// {width: 700, height: 130}
const dInventoryDisplay: IInventoryDisplay = {
  width: 60,
  height: 60,
  across: 10,
  down: 2,
  padding: 5,
};

interface IInventoryRequirements {
  tags?: StatTag[];
  never?: boolean;
  relic?: boolean;
}

export class InventoryDisplay extends PIXI.Container {
  public overflow: InventoryDisplay;

  public onItemAdded: (item: IItem, slot: number) => void;
  public onItemRemoved: (item: IItem, slot: number) => void;
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  public onItemSelect: (item: IItem, type: 'select' | 'unselect' | 'double') => void;

  public customAllowedAdd: (item: InventoryItem, slot: number, onReturn: boolean) => boolean;
  public customAllowedRemove: (item: InventoryItem, slot?: number) => boolean;

  public slot0Index: number = 0;
  public selectable: boolean;

  private background = new PIXI.Graphics();
  private foreground = new PIXI.Graphics();
  private length: number;

  private items: InventoryItem[] = [];
  private requirements: IInventoryRequirements[] = [];
  private disabled: boolean[] = [];

  private priorityButtons: StateButton[] = [];

  constructor(private settings: Partial<IInventoryDisplay> = {}) {
    super();
    this.settings = _.defaults(settings, dInventoryDisplay);

    this.length = this.settings.across * this.settings.down;
    this.addChild(this.background, this.foreground);
    inventoryDisplays.push(this);
    this.drawSquares();
  }

  public destroy() {
    _.pull(inventoryDisplays, this);
    super.destroy();
  }

  public disableSlot(i: number) {
    this.disabled[i] = true;
    this.drawForeground();
  }

  public enableSlot(i: number) {
    this.disabled[i] = false;
    this.drawForeground();
  }

  public enableAllSlots() {
    this.disabled = [];
    this.drawForeground();
  }

  public clear() {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i]) {
        this.removeChild(this.items[i]);
        this.items[i] = null;
      }
    }
  }

  public addRequirement(index: number | 'all', req: IInventoryRequirements) {
    if (index === 'all') {
      for (let i = 0; i < this.length; i++) {
        this.requirements[i] = req;
      }
    } else {
      this.requirements[index] = req;
    }
  }

  public clearRequirements() {
    this.requirements = [];
  }

  public addItem = (item: InventoryItem) => {
    if (!item) {
      return;
    }
    this.addChild(item);
    let i: number;
    for (i = 0; i < this.length; i++) {
      if (!this.items[i]) {
        break;
      }
    }

    if (i >= this.length && this.items.length >= this.length) {
      if (this.overflow) {
        if (this.overflow === this) {
          ItemManager.addOverflow(item.source);
        } else {
          this.overflow.addItem(item);
        }
      }
    } else {
      this.finishAdd(item, i);
    }
  }

  public roomToAdd() {
    for (let i = 0; i < this.length; i++) {
      if (!this.items[i]) {
        return true;
      }
    }
    return false;
  }

  public addItemAt = (item: InventoryItem, index?: number, noStats?: boolean) => {
    if (!item) {
      return;
    }
    if (!index && index !== 0) {
      let loc2: {x: number, y: number} = this.toLocal(item.position, item.parent);
      index = this.getIndexByLoc(loc2);
    }
    this.finishAdd(item, index, noStats);
  }

  public finishAdd(item: InventoryItem, slot: number, noStats?: boolean) {
    let loc = this.getLocByIndex(slot);
    this.addChild(item);
    item.position.set(loc.x, loc.y);
    item.width = this.settings.width;
    item.height = this.settings.height;
    this.items[slot] = item;
    item.currentInventory = this;
    if (!noStats && this.onItemAdded) {
      this.onItemAdded(item.source, this.slot0Index + slot);
    }

    if (this.priorityButtons[slot]) {
      if (item.source.action) {
        this.priorityButtons[slot].setStateList(actionStateList);
      } else {
        this.priorityButtons[slot].setStateList(neverStateList);
      }
    }
  }

  public returnItem = (item: InventoryItem) => {
    if (item && item.parent) {
      this.finishAdd(item, this.items.indexOf(item), true);
    }
  }

  public removeItem = (item: InventoryItem) => {
    if (item.currentInventory === this) {
      let index = this.getItemIndex(item);
      this.items[index] = null;
      if (this.onItemRemoved) {
        this.onItemRemoved(item.source, this.slot0Index + index);
      }

      if (this.priorityButtons[index]) {
        this.priorityButtons[index].setStateList([]);
      }
    }
  }

  public removeItemByModel = (model: IItem, andDestroy: boolean = true): boolean => {
    let item = this.getItemByModel(model);
    if (item) {
      item.destroy();
      this.removeItem(item);
      return true;
    } else {
      return false;
    }
  }

  public sellItem = (item: InventoryItem, callback: () => void) => {
    if (this.onItemSell) {
      let index = this.getItemIndex(item);
      this.onItemSell(item.source, index, callback);
      this.removeItem(item);
    }
  }

  public getWidth() {
    return this.settings.width * this.settings.across + this.settings.padding * (this.settings.across - 1);
  }

  public getHeight() {
    return this.settings.height * this.settings.down + this.settings.padding * (this.settings.down - 1);
  }

  public allowedAdd = (item: InventoryItem, index: number, onReturn: boolean) => {
    if (!index && index !== 0) {
      let loc = this.toLocal(item.position, item.parent);
      index = this.getIndexByLoc(loc);
    }
    if (index < 0 || index >= this.length) {
      return false;
    }

    if (this.disabled[index]) {
      return false;
    }

    if (this.requirements[index]) {
      if (this.requirements[index].never) {
        return false;
      }
      if (this.requirements[index].relic) {
        if (item.source.tags.indexOf('Relic') >= 0) {
          if (this.items.filter(item2 => (item2 && item2.source.tags.indexOf('Relic') >= 0)).length > 0) {
            return false;
          }
        }
      }
      if (this.requirements[index].tags.some(rtag => !item.source.tags.includes(rtag))) {
        return false;
      }
    }

    return !this.customAllowedAdd || this.customAllowedAdd(item, index, onReturn);
  }

  public allowedRemove = (item: InventoryItem) => {
    if (this.items.includes(item)) {
      return !this.customAllowedRemove || this.customAllowedRemove(item);
    } else {
      return false;
    }
  }

  public allowedSell = (item: InventoryItem) => {
    return this.allowedRemove(item);
  }

  public itemLocOverThis = (item: InventoryItem) => {
    let loc = this.toLocal(item.position, item.parent);
    loc.x += item.getWidth() / 2;
    loc.y += item.getHeight() / 2;
    return (loc.x > 0 && loc.y > 0 && loc.x < this.getWidth() && loc.y < this.getHeight());
  }

  public getItemAt(i: number) {
    return this.items[i];
  }

  public getItemIndex(item: InventoryItem) {
    return this.items.indexOf(item);
  }

  public getItemByModel(item: IItem) {
    return this.items.find(item2 => (item2 && item2.source === item));
  }

  public getIndexByItemLoc(item: InventoryItem): number {
    let loc = this.toLocal(item.position, item.parent);
    return this.getIndexByLoc(loc);
  }

  public hasItem(item?: InventoryItem) {
    if (item) {
      return this.items.includes(item);
    } else {
      return this.items.length > 0 && this.items.find(val => Boolean(val));
    }
  }

  public getFillableItems() {
    return this.items.filter(item => (item && item.source.maxCharges && item.source.charges < item.source.maxCharges));
  }

  public unselectAll = (except?: IItem) => {
    this.items.forEach(item => {
      if (item && (!except || item.source !== except)) {
        item.setSelect(false);
      }
    });
  }

  private drawSquares() {
    this.background.clear().beginFill(0x777777).lineStyle(1).drawRoundedRect(-this.settings.padding,
                                                                             -this.settings.padding - (this.settings.headers ? 20 : 0),
                                                                             this.settings.width * this.settings.across + this.settings.padding * (this.settings.across + 1),
                                                                             this.settings.height * this.settings.down + this.settings.padding * (this.settings.down + 1) + (this.settings.headers ? 20 : 0) + (this.settings.hasButtons ? 20 : 0),
                                                                             2);

    if (this.settings.headers) {
      this.background.beginFill(0xcccccc).lineStyle(1);
      let x = 0;
      this.settings.headers.forEach((header) => {
        this.background.drawRect(x * (this.settings.width + this.settings.padding), (-this.settings.padding - 17), this.settings.width * header.length + this.settings.padding * (header.length - 1), 18);
        let label = new PIXI.Text(header.label, {fontSize: 12, fontFamily: Fonts.UI});
        this.addChild(label);
        label.position.set(x * (this.settings.width + this.settings.padding) + (this.settings.width * header.length + this.settings.padding * (header.length - 1) - label.width) / 2, -20);
        x += header.length;
      });
    }

    this.background.beginFill(0xaaaaaa).lineStyle(1);
    for (let y = 0; y < this.settings.down; y++) {
      for (let x = 0; x < this.settings.across; x++) {
        this.background.drawRoundedRect(x * (this.settings.width + this.settings.padding), y * (this.settings.height + this.settings.padding), this.settings.width, this.settings.height, 3);
      }
    }

    if (this.settings.hasButtons) {
      for (let i = 0; i < this.settings.across; i++) {
        let button = new StateButton([], {width: this.settings.width, onToggle: () => {}});
        this.priorityButtons.push(button);
        button.position.set(i * (this.settings.width + this.settings.padding),  this.settings.height);
        this.addChild(button);
      }
    }
  }

  private drawForeground() {
    this.foreground.clear();
    this.foreground.lineStyle(3, 0xffcc00);
    for (let i = 0; i < this.disabled.length; i++) {
      if (this.disabled[i]) {
        let x = (i % this.settings.across) * (this.settings.width + this.settings.padding);
        let y = Math.floor(i / this.settings.across) * (this.settings.height + this.settings.padding);
        this.foreground
          .moveTo(x + 3, y + 3)
          .lineTo(x + this.settings.width - 3, y + this.settings.height - 3)
          .moveTo(x + this.settings.width - 3, y + 3)
          .lineTo(x + 3, y + this.settings.height - 3);
      }
    }
  }

  private getIndexByLoc(loc: {x: number, y: number}): number {
    return this.settings.across * Math.round(loc.y / (this.settings.height + this.settings.padding)) + Math.round(loc.x / (this.settings.width + this.settings.padding));
  }

  private getLocByIndex(index: number): {x: number, y: number} {
    return {
      x: (index % this.settings.across) * (this.settings.width + this.settings.padding),
      y: Math.floor(index / this.settings.across) * (this.settings.height + this.settings.padding),
    };
  }
}
