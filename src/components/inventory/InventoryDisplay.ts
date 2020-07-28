import * as PIXI from 'pixi.js';
import * as _ from 'lodash';
import { InventoryItem } from './InventoryItem';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { StatTag } from '../../data/StatData';
import { IItem } from '../../data/ItemData';
import { StateButton } from '../ui/StateButton';
import { Fonts } from '../../data/Fonts';

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
    for (let i = 0; i < inventoryDisplays.length; i++) {
      if (inventoryDisplays[i].allowedRemove(e.item)) {
        e.callback({allow: true});
        return;
      }
    }
    e.callback({allow: false});
    return;
  } else if (e.type === 'end') {
    let oldItem = e.item;
    for (let i = 0; i < inventoryDisplays.length; i++) {
      let newDisplay = inventoryDisplays[i];

      if (newDisplay.itemLocOverThis(oldItem)) {
        let newIndex = newDisplay.getIndexByItemLoc(oldItem);
        if (newDisplay.allowedAdd(oldItem, newIndex)) {
          let newItem = newDisplay.getItemAt(newIndex);
          if (newItem) {
            let oldDisplay = oldItem.currentInventory;
            let oldIndex = oldDisplay.getItemIndex(oldItem);
            if (oldDisplay.allowedAdd(newItem, oldIndex)) {
              newDisplay.removeItem(newItem);
              oldDisplay.removeItem(oldItem);
              newDisplay.addItemAt(oldItem, newIndex);
              oldDisplay.addItemAt(newItem, oldIndex);
              e.callback({allow: true});
              return;
            } else {
              let overflow = oldDisplay.overflow;
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
  }
});

export interface IItemDragEvent {
  type: 'start' | 'end' | 'sell';
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
}

export class InventoryDisplay extends PIXI.Container {
  public overflow: InventoryDisplay;

  public onItemAdded: (item: IItem, slot: number) => void;
  public onItemRemoved: (item: IItem, slot: number) => void;
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;

  public slot0Index: number = 0;

  private background = new PIXI.Graphics();
  private items: InventoryItem[] = [];
  private length: number;

  private requirements: IInventoryRequirements[] = [];

  private priorityButtons: StateButton[] = [];

  constructor(private settings: Partial<IInventoryDisplay> = {}) {
    super();
    this.settings = _.defaults(settings, dInventoryDisplay);

    this.length = this.settings.across * this.settings.down;
    this.addChild(this.background);
    inventoryDisplays.push(this);
    this.drawSquares();
  }

  public drawSquares() {
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

  public clear() {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i]) {
        this.removeChild(this.items[i]);
        this.items[i] = null;
      }
    }
  }

  public destroy() {
    _.pull(inventoryDisplays, this);
    super.destroy();
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
    let loc = this.getLocByIndex(i);
    this.items[i] = item;
    item.currentInventory = this;
    item.position.set(loc.x, loc.y);
    item.width = this.settings.width;
    item.height = this.settings.height;
    if (this.onItemAdded) {
      this.onItemAdded(item.source, this.slot0Index + i);
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
    let loc = this.getLocByIndex(index);
    this.addChild(item);
    item.position.set(loc.x, loc.y);
    item.width = this.settings.width;
    item.height = this.settings.height;
    this.items[index] = item;
    item.currentInventory = this;
    if (!noStats && this.onItemAdded) {
      this.onItemAdded(item.source, this.slot0Index + index);
    }
  }

  public returnItem = (item: InventoryItem) => {
    this.addChild(item);
    let index = _.indexOf(this.items, item);
    let loc = this.getLocByIndex(index);
    item.position.set(loc.x, loc.y);
  }

  public removeItem = (item: InventoryItem) => {
    if (item.currentInventory === this) {
      let index = this.getItemIndex(item);
      this.items[index] = null;
      if (this.onItemRemoved) {
        this.onItemRemoved(item.source, this.slot0Index + index);
      }
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

  public allowedRemove = (item: InventoryItem) => {
    if (_.includes(this.items, item)) {
      return true;
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

  public getIndexByItemLoc(item: InventoryItem): number {
    let loc = this.toLocal(item.position, item.parent);
    return this.getIndexByLoc(loc);
  }

  public allowedAdd = (item: InventoryItem, index?: number) => {
    let loc = this.toLocal(item.position, item.parent);
    if (!index && index !== 0) {
      index = this.getIndexByLoc(loc);
    }
    if (index >= 0 && index < this.length) {
      if (this.requirements[index]) {
        if (this.requirements[index].never) {
          return false;
        }
        if (_.intersection(this.requirements[index].tags, item.source.tags).length === this.requirements[index].tags.length) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  }

  public hasItem(item: InventoryItem) {
    return _.includes(this.items, item);
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
