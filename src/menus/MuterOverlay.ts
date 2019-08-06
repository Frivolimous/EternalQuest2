export class MuterOverlay extends PIXI.Graphics {
  constructor() {
    super();
    this.beginFill(0x666666);
    this.lineStyle(2);
    this.drawRect(0, 0, 100, 50);
  }

  getWidth() {
    return 100;
  }

  getHeight() {
    return 50;
  }
}