import * as PIXI from 'pixi.js';

export class Background  extends PIXI.Graphics {
  constructor(rect: PIXI.Rectangle, floorHeight = 300) {
    super();

    this.redraw(rect, floorHeight);
  }

  public redraw(rect: PIXI.Rectangle, floorHeight = 300) {
    this.clear();
    this.beginFill(0x883311).drawRect(rect.left, rect.bottom - floorHeight, rect.width, floorHeight);
    this.beginFill(0x99aaff).drawRect(rect.left, rect.top, rect.width, rect.height - floorHeight);
  }
}
