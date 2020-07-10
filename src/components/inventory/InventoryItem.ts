import * as PIXI from 'pixi.js';
import * as _ from 'lodash';
import { ItemDragEvent, IItemDragResult, InventoryDisplay } from './InventoryDisplay';
import { Facade } from '../../index';
import { IItem } from '../../data/ItemData';
import { TooltipReader } from '../../JMGE/TooltipReader';
import { Descriptions } from '../../data/StringData';

export interface IInventoryItem {
  width: number;
  height: number;
}

const dInventoryItem: IInventoryItem = {
  width: 60,
  height: 60,
};

export class InventoryItem extends PIXI.Container {
  public currentInventory: InventoryDisplay;

  private background = new PIXI.Graphics();
  private dragging: boolean = false;

  constructor(public source: IItem, private settings?: IInventoryItem) {
    super();
    this.interactive = true;
    this.buttonMode = true;
    this.settings = _.defaults(settings, dInventoryItem);

    let color: number = _.includes(source.tags, 'Belt') ? 0xffcccc : _.includes(source.tags, 'Equipment') ? 0xccccff : 0xffffcc;
    this.background.beginFill(color).lineStyle(3).drawRoundedRect(0, 0, this.settings.width, this.settings.height, 2);
    this.addChild(this.background);

    this.addListener('pointerdown', this.pointerDown);
    this.addListener('pointerup', this.pointerUp);
    this.addListener('pointermove', this.pointerMove);

    TooltipReader.addTooltip(this, {title: source.name, description: Descriptions.makeItemDescription(source)});
  }

  public getWidth() {
    return this.settings.width;
  }

  public getHeight() {
    return this.settings.height;
  }

  private pointerDown = (e: PIXI.interaction.InteractionEvent) => {
    ItemDragEvent.publishSync({
      type: 'start',
      item: this,
      callback: (result: IItemDragResult) => {
        if (result.allow && !this.dragging) {
          this.dragging = true;
          Facade.screen.addChild(this);
          let loc = e.data.getLocalPosition(Facade.screen);
          this.position.set(loc.x - this.getWidth() / 2, loc.y - this.getHeight() / 2);
        }
      },
    });
  }

  private pointerUp = (e: PIXI.interaction.InteractionEvent) => {
    this.dragging = false;
    ItemDragEvent.publishSync({
      type: 'end',
      item: this,
      callback: (result: IItemDragResult) => { },
    });
  }

  private pointerMove = (e: PIXI.interaction.InteractionEvent) => {
    if (this.dragging) {
      let loc = e.data.getLocalPosition(Facade.screen);
      this.position.set(loc.x - this.getWidth() / 2, loc.y - this.getHeight() / 2);
    }
  }
}
