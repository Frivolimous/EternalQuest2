import * as PIXI from 'pixi.js';
import { Fonts } from '../../data/Fonts';

export interface ITooltipPopup {
  backgroundColor: number;
}

export class TooltipPopup extends PIXI.Container {
  private titleField: PIXI.Text;
  private descriptionField: PIXI.Text;
  private background: PIXI.Graphics;

  constructor(title: string, description: string, config: ITooltipPopup) {
    super();

    // this.interactive = true;

    this.titleField = new PIXI.Text(title, { fontSize: 13, fontFamily: Fonts.UI });
    this.descriptionField = new PIXI.Text(description, { fontSize: 13, fontFamily: Fonts.UI, wordWrap: true, wordWrapWidth: 300 });
    this.titleField.position.set(5, 5);
    this.descriptionField.position.set(5, this.titleField.height + 15);

    this.background = new PIXI.Graphics();
    this.background.beginFill(0xf1f1f1);
    this.background.lineStyle(3);
    this.background.drawRect(0, 0, 300, this.titleField.height + 10);
    this.background.drawRect(0, this.titleField.height + 10, 300, this.descriptionField.height + 10);
    this.addChild<any>(this.background, this.titleField, this.descriptionField);
  }

  public reposition(target: PIXI.Rectangle, borders: PIXI.Rectangle) {
    let rect = new PIXI.Rectangle(0, 0, this.background.width, this.background.height);
    if (target.y + target.height + rect.height > borders.bottom) {
      this.y = target.y - rect.height;
    } else {
      this.y = target.y + target.height;
    }
    if (target.x + rect.width > borders.right) {
      this.x = target.x + target.width - rect.width;
    } else {
      this.x = target.x;
    }
  }
}
