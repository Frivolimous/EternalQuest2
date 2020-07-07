import * as PIXI from 'pixi.js';

export class BasePanel extends PIXI.Container {
  private background = new PIXI.Graphics();
  constructor(private bounds: PIXI.Rectangle, private bgColor: number = 0x333333) {
    super();
    this.addChild(this.background);
    this.drawBack();
  }

  public updateBounds(bounds: PIXI.Rectangle) {
    this.bounds = bounds;
    this.drawBack();
  }

  private drawBack() {
    this.background.clear().beginFill(this.bgColor).lineStyle(2).drawRoundedRect(0, 0, this.bounds.width, this.bounds.height, 10);
    this.position.set(this.bounds.x, this.bounds.y);
  }
}
