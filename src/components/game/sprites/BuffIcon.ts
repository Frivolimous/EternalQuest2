import * as PIXI from 'pixi.js';
import { TooltipReader } from '../../../JMGE/TooltipReader';
import { IActiveBuff } from '../../../engine/sprites/BuffManager';

let width: number = 10;
let height: number = 10;
let color: number = 0xaaffaa;

export class BuffIcon extends PIXI.Container {
  private background = new PIXI.Graphics();
  constructor(public settings: IActiveBuff) {
    super();
    this.background.beginFill(color).lineStyle(1).drawRoundedRect(0, 0, width, height, 2);
    this.addChild(this.background);
    TooltipReader.addTooltip(this.background, () => {
      let description = '';
      description += this.settings.remaining + ' left\n';
      return {title: this.settings.source.name, description };
    });
  }

  public update() {

  }

  public getWidth() {
    return width;
  }

  public getHeight() {
    return height;
  }
}
