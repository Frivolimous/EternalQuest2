import * as PIXI from 'pixi.js';
import { Fonts } from '../../data/Fonts';

export interface ITooltipPopup {
  backgroundColor: number;
}

type metaTags = 'b' | 'n';

const colorNormal = 0;
const colorBold = 0x330000;

export class TooltipPopup extends PIXI.Container {
  private background: PIXI.Graphics;

  constructor(title: string, description: string, config: ITooltipPopup) {
    super();

    let padding = 5;
    let width = 300;

    // this.interactive = true;

    let titleField = new PIXI.Text(title, { fontSize: 13, fontFamily: Fonts.UI, fill: colorBold, fontWeight: 'bold' });
    titleField.position.set(padding, padding);

    let descHeight = this.makeDescription(description, padding, width, titleField.height);
    this.addChild(titleField);

    this.drawFrame(width, titleField.height, descHeight, padding);
  }

  public makeDescription(text: string, padding: number, width: number, titleHeight: number) {
    let lines = text.split('\n').map(str => str.split(/[<>]/));
    console.log(lines);

    let y = titleHeight + padding * 3;
    let bold = false;
    let last: PIXI.Text;
    let boldFont = { fontSize: 13, fontFamily: Fonts.UI, fill: colorBold, fontWeight: 'bold'};
    let normalFont = { fontSize: 13, fontFamily: Fonts.UI, fill: colorNormal};

    lines.forEach(line => {
      last = null;
      line.forEach(part => {
        if (part === '@b') {
          bold = true;
        } else if (part === '@n') {
          bold = false;
        } else {
          let field = new PIXI.Text(part, bold ? boldFont : normalFont);
          this.addChild(field);

          field.position.set(last ? last.x + last.width : padding, y);
          last = field;
        }
      });
      if (last) {
        y = last.y + last.height;
      }
    });

    return y;
    // let descriptionField = new PIXI.Text(text, { fontSize: 13, fontFamily: Fonts.UI, wordWrap: true, wordWrapWidth: width });
    // descriptionField.position.set(padding, titleHeight + padding * 3);
    // this.addChild(descriptionField);

    // return descriptionField.height;
  }

  public drawFrame(width: number, titleHeight: number, descHeight: number, padding: number) {
    this.background = new PIXI.Graphics();
    this.background.beginFill(0xf1f1f1);
    this.background.lineStyle(3);
    this.background.drawRect(0, 0, width, titleHeight + padding * 2);
    this.background.drawRect(0, titleHeight + padding * 2, width, descHeight + padding * 2);
    this.addChildAt(this.background, 0);
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
