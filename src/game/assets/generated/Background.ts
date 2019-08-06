export class Background  extends PIXI.Graphics {
  constructor(rect: PIXI.Rectangle, floorHeight = 200) {
    super();

    this.beginFill(0x883311);
    this.drawRect(rect.left, rect.bottom - floorHeight, rect.width, floorHeight);
    this.beginFill(0x99aaff);
    this.drawRect(rect.left, rect.top, rect.width, rect.height - floorHeight);
  }
}
