import * as PIXI from 'pixi.js';
import * as _ from 'lodash';
import { ItemDragEvent, IItemDragResult, InventoryDisplay } from './InventoryDisplay';
import { Facade } from '../../index';
import { IItem } from '../../data/ItemData';
import { TooltipReader } from '../../JMGE/TooltipReader';
import { Descriptions } from '../../data/StringData';
import { Fonts } from '../../data/Fonts';

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
  public selected: boolean | 'double';

  private clicking: boolean;
  private over: PIXI.Graphics;
  private background = new PIXI.Graphics();
  private dragging: boolean = false;
  private text: PIXI.Text;
  private charges: PIXI.Text;

  private tmpOrigin: {x: number, y: number};

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

    this.text = new PIXI.Text(source.name, {fontFamily: Fonts.UI, fontSize: 25, wordWrap: true, wordWrapWidth: 100});
    this.addChild(this.text);
    this.text.width = this.getWidth() - 10;
    this.text.scale.y = this.text.scale.x;
    this.text.position.set(5, (this.getHeight() - this.text.height) / 2);

    if (source.charges || source.charges === 0) {
      this.charges = new PIXI.Text((source.charges < 10 ? '0' : '') + String(source.charges), { fontFamily: Fonts.UI, fontSize: 10, stroke: 0xcccccc, strokeThickness: 1});
      this.addChild(this.charges);
      this.charges.position.set(this.getWidth() - this.charges.width - 1, this.getHeight() - this.charges.height - 1);
    }

    TooltipReader.addTooltip(this, {title: source.name, description: Descriptions.makeItemDescription(source)});
  }

  public updateCharges(n: number) {
    this.charges.text = (n < 10 ? '0' : '') + n;
    this.charges.position.set(this.getWidth() - this.charges.width - 1, this.getHeight() - this.charges.height - 1);
  }

  public setSelect = (b: boolean | 'double') => {
    this.selected = b;
    if (!b) {
      if (this.over) {
        this.over.destroy();
        this.over = null;
      }
    } else {
      if (!this.over) {
        this.over = new PIXI.Graphics();
        this.addChild(this.over);
      }
      if (b === 'double') {
        this.over.clear().lineStyle(6, 0xffff00).drawCircle(this.settings.width / 2, this.settings.height / 2, this.settings.width * 0.4);
        this.over.lineStyle(6, 0xffaa00).drawCircle(this.settings.width / 2, this.settings.height / 2, this.settings.width * 0.3);
      } else {
        this.over.clear().lineStyle(6, 0xffff00).drawCircle(this.settings.width / 2, this.settings.height / 2, this.settings.width * 0.4);
      }
    }
  }

  public getWidth() {
    return this.settings.width;
  }

  public getHeight() {
    return this.settings.height;
  }

  private pointerDown = (e: PIXI.interaction.InteractionEvent) => {
    if (e.data.originalEvent.ctrlKey) {
      ItemDragEvent.publishSync({
        type: 'sell',
        item: this,
        callback: () => this.destroy(),
      });
    } else {
      this.clicking = true;
      this.tmpOrigin = e.data.getLocalPosition(Facade.screen);
      window.setTimeout(() => {
        if (this.clicking) {
          this.clicking = false;
          this.startDrag(e);
        }
      }, 400);
    }
  }

  private pointerUp = (e: PIXI.interaction.InteractionEvent) => {
    if (this.dragging) {
      this.endDrag();
    } else {
      if (this.clicking) {
        this.clicking = false;
        let type: 'select' | 'double' | 'unselect';
        if (this.selected === 'double') {
          type = 'unselect';
        } else if (this.selected) {
          type = 'double';
        } else {
          type = 'select';
        }

        ItemDragEvent.publishSync({
          type,
          item: this,
          callback: () => {
            this.setSelect(type === 'double' ? 'double' : type === 'select' ? true : false);
          },
        });
      }
    }
  }

  private pointerMove = (e: PIXI.interaction.InteractionEvent) => {
    if (this.dragging) {
      let loc = e.data.getLocalPosition(Facade.screen);
      this.position.set(loc.x - this.getWidth() / 2, loc.y - this.getHeight() / 2);
    } else {
      if (this.clicking && this.tmpOrigin) {
        let loc = e.data.getLocalPosition(Facade.screen);
        if (Math.abs(loc.x - this.tmpOrigin.x) > 2 || Math.abs(loc.y - this.tmpOrigin.y) > 2) {
          this.clicking = false;
          this.startDrag(e);
        }
      }
    }
  }

  private startDrag = (e: PIXI.interaction.InteractionEvent) => {
    if (this.selected) {
      ItemDragEvent.publishSync({
        type: 'unselect',
        item: this,
        callback: () => this.setSelect(false),
      });
    }
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

  private endDrag = () => {
    this.dragging = false;
    ItemDragEvent.publishSync({
      type: 'end',
      item: this,
      callback: (result: IItemDragResult) => { },
    });
  }
}
