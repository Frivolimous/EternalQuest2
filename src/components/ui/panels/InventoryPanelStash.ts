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
import { Fonts } from '../../../data/Fonts';

export class InventoryPanelStash extends BasePanel {
  public onItemSell: (item: IItem, slot: number, callback: () => void) => void;
  private inventory: InventoryDisplay;

  private save: IPlayerSave;
  private list: SelectList;
  private current: number | 'p' | 'o';
  private title: PIXI.Text;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 300, 500), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.title = new PIXI.Text('Personal', {fontFamily: Fonts.UI, fontSize: 16});

    this.inventory = new InventoryDisplay({ width: 50, height: 50, across: 5, down: 6, padding: 5 });
    this.inventory.overflow = this.inventory;
    this.addChild(this.inventory);
    this.inventory.onItemAdded = this.addItem;
    this.inventory.onItemRemoved = this.removeItem;

    this.list = new SelectList({width: 50, height: 30}, this.switchPage);

    this.addChild(this.title,
      this.list.makeButton('Personal', {width: 100}),
      this.list.makeButton('1'),
      this.list.makeButton('2'),
      this.list.makeButton('3'),
      this.list.makeButton('4'),
      this.list.makeButton('5'),
      this.list.makeButton('6'),
      this.list.makeButton('7'),
      this.list.makeButton('8'),
      this.list.makeButton('9'),
      this.list.makeButton('10'),
      this.list.makeButton('Overflow', {width: 100}),
    );

    this.title.position.set(30, 7);
    this.inventory.position.set(10, 40);
    this.list.buttons[0].position.set(10, 380);
    this.list.buttons[11].position.set(180, 380);

    this.list.buttons[1].position.set(10, 420);
    this.list.buttons[2].position.set(65, 420);
    this.list.buttons[3].position.set(120, 420);
    this.list.buttons[4].position.set(175, 420);
    this.list.buttons[5].position.set(230, 420);
    this.list.buttons[6].position.set(10, 460);
    this.list.buttons[7].position.set(65, 460);
    this.list.buttons[8].position.set(120, 460);
    this.list.buttons[9].position.set(175, 460);
    this.list.buttons[10].position.set(230, 460);

    this.list.selectButton(0);

    this.inventory.onItemSell = this.sellItem;
  }

  public destroy() {
    this.inventory.destroy();
    super.destroy();
  }

  public addPlayer = (sprite: IPlayerSave) => {
    this.save = sprite;
    this.switchPage(this.list.selected);
  }

  public addItem = (item: IItem, slot: number) => {
    let save = ItemManager.saveItem(item);
    if (this.current === 'p') {
      SaveManager.getExtrinsic().playerStash[this.save.__id][slot] = save;
    } else if (this.current === 'o') {
      SaveManager.getExtrinsic().overflowStash[slot] = save;
    } else {
      SaveManager.getExtrinsic().sharedStash[this.current][slot] = save;
    }
  }

  public removeItem = (item: IItem, slot: number) => {
    if (this.current === 'p') {
      SaveManager.getExtrinsic().playerStash[this.save.__id][slot] = null;
    } else if (this.current === 'o') {
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
      this.current = 'p';
      if (this.save) {
        array = extrinsic.playerStash[this.save.__id];
      }
      this.title.text = 'Personal';
    } else if (index === 11) {
      this.current = 'o';
      array = extrinsic.overflowStash;
      this.inventory.addRequirement('all', {never: true});
      this.title.text = 'Overflow';
    } else {
      this.current = index - 1;
      array = extrinsic.sharedStash[this.current];
      if (!array) {
        extrinsic.sharedStash[this.current] = array = [];
      }
      this.title.text = 'Shared Stash ' + String(index);
    }

    this.addSaveArray(array);
  }

  public addSaveArray = (saves: IItemSave[]) => {
    let items = _.map(saves, save => ItemManager.loadItem(save));

    this.inventory.clear();
    let n = Math.min(30, items.length);
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
