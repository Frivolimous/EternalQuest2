import * as PIXI from 'pixi.js';
import { TooltipReader } from '../../../JMGE/TooltipReader';
import { IActiveBuff } from '../../../engine/sprites/BuffManager';
import { Fonts } from '../../../data/Fonts';

let width: number = 15;
let height: number = 15;
let color: number = 0xaaffaa;

export class BuffIcon extends PIXI.Container {
  private background = new PIXI.Graphics();
  private timer = new PIXI.Graphics();
  private remaining: PIXI.Text;
  constructor(public settings: IActiveBuff) {
    super();
    this.background.beginFill(color).lineStyle(1).drawCircle(width / 2, width / 2, width / 2);
    this.addChild(this.background);
    this.addChild(this.timer);
    this.remaining = new PIXI.Text(String(settings.remaining), {fontSize: 5, fontFamily: Fonts.UI});
    this.addChild(this.remaining);
    this.update();

    TooltipReader.addTooltip(this, () => {
      let description = '';
      description += this.settings.remaining + ' left\n';
      return {title: this.settings.source.name, description };
    });
  }

  public update() {
    this.remaining.text = String(Math.ceil(this.settings.remaining));
    this.remaining.position.set((this.getWidth() - this.remaining.width) / 2, (this.getHeight() - this.remaining.height) / 2);
    if (this.settings.source.clearType === 'time') {
      this.timer.clear().beginFill(0xffff00).lineStyle(1).
      moveTo(width / 2, width / 2)
      .arc(width / 2, width / 2, width / 2, - Math.PI / 2,  Math.PI * 2 - Math.PI / 2 - Math.PI * 2 * this.settings.timer / this.settings.source.duration)
      .lineTo(width / 2, width / 2);
    }
  }

  public getWidth() {
    return width;
  }

  public getHeight() {
    return height;
  }
}
