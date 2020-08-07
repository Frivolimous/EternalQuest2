import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BasePanel } from './_BasePanel';
import { InventoryDisplay } from '../../inventory/InventoryDisplay';
import { InventoryItem } from '../../inventory/InventoryItem';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { IItem, IItemSave } from '../../../data/ItemData';
import { StatModel } from '../../../engine/stats/StatModel';
import { DataConverter } from '../../../services/DataConverter';
import { ItemManager } from '../../../services/ItemManager';
import { IPlayerSave } from '../../../data/SaveData';
import { SaveManager } from '../../../services/SaveManager';
import { Button } from '../Button';
import { SelectList } from '../SelectButton';

export class InventoryPanelStash extends BasePanel {
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  private inventory: InventoryDisplay;

  private save: IPlayerSave;
  private list: SelectList;
  private current: number | 'personal' | 'overflow';

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 300, 500), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.inventory = new InventoryDisplay({ width: 50, height: 50, across: 5, down: 6, padding: 5 });
    this.inventory.overflow = this.inventory;
    this.addChild(this.inventory);
    this.inventory.position.set(10, 10);
    this.inventory.onItemAdded = this.addItem;
    this.inventory.onItemRemoved = this.removeItem;

    this.list = new SelectList({width: 50, height: 30}, this.switchPage);

    this.addChild(this.list.makeButton('Personal', {width: 100}));
    this.addChild(this.list.makeButton('1'));
    this.addChild(this.list.makeButton('2'));
    this.addChild(this.list.makeButton('3'));
    this.addChild(this.list.makeButton('4'));
    this.addChild(this.list.makeButton('5'));
    this.addChild(this.list.makeButton('Overflow', {width: 100}));

    this.list.buttons[0].position.set(10, 350);
    this.list.buttons[1].position.set(10, 390);
    this.list.buttons[2].position.set(65, 390);
    this.list.buttons[3].position.set(120, 390);
    this.list.buttons[4].position.set(175, 390);
    this.list.buttons[5].position.set(230, 390);
    this.list.buttons[6].position.set(180, 350);

    this.list.selectButton(0);

    this.inventory.onItemSell = this.sellItem;
  }

  public addPlayer = (sprite: IPlayerSave) => {
    this.save = sprite;
    this.switchPage(this.list.selected);
  }

  public addItem = (item: IItem, slot: number) => {
    let save = ItemManager.saveItem(item);
    if (this.current === 'personal') {
      SaveManager.getExtrinsic().playerStash[this.save.__id][slot] = save;
    } else if (this.current === 'overflow') {
      SaveManager.getExtrinsic().overflowStash[slot] = save;
    } else {
      SaveManager.getExtrinsic().sharedStash[this.current][slot] = save;
    }
  }

  public removeItem = (item: IItem, slot: number) => {
    if (this.current === 'personal') {
      SaveManager.getExtrinsic().playerStash[this.save.__id][slot] = null;
    } else if (this.current === 'overflow') {
      SaveManager.getExtrinsic().overflowStash[slot] = null;
    } else {
      SaveManager.getExtrinsic().sharedStash[this.current][slot] = null;
    }
  }

  public switchPage = (index: number) => {
    let extrinsic = SaveManager.getExtrinsic();
    let array: IItemSave[];
    this.inventory.clearRequirements();

    if (index === 0) {
      this.current = 'personal';
      if (this.save) {
        array = extrinsic.playerStash[this.save.__id];
      }
    } else if (index === 6) {
      this.current = 'overflow';
      array = extrinsic.overflowStash;
      this.inventory.addRequirement('all', {never: true});
    } else {
      this.current = index - 1;
      array = extrinsic.sharedStash[this.current];
      if (!array) {
        extrinsic.sharedStash[this.current] = array = [];
      }
    }

    this.addSaveArray(array);
  }

  public addSaveArray = (saves: IItemSave[]) => {
    let items = _.map(saves, save => ItemManager.loadItem(save));

    this.inventory.clear();
    let n = Math.min(60, items.length);
    for (let i = 0; i < n; i++) {
      if (items[i]) {
        this.inventory.addItemAt(new InventoryItem(items[i]), i);
      }
    }
  }

  public sellItem = (item: IItem, slot: number, callback: () => void) => {
    if (this.onItemSell) this.onItemSell(item, slot, callback);
  }
}
