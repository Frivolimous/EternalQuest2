import * as PIXI from 'pixi.js';
import { BaseModal } from './_BaseModal';
import { Button } from '../Button';
import { JMTween, JMEasing } from '../../../JMGE/JMTween';
import { Fonts } from '../../../data/Fonts';

export interface IOptionModal {
  colorBack: number;
  colorFront: number;
}

export class OptionModal extends BaseModal {
  private scoreText: PIXI.Text;
  private buttons: Button[];

  constructor(message: string, private config: IOptionModal, width: number, height: number, options: {label: string, color?: number, onClick?: () => void}[]) {
    super();

    this.pivot.set(width / 2, height / 2);

    let shadow = new PIXI.Graphics();
    shadow.beginFill(0, 0.4).drawRoundedRect(5, 5, width + 10, height + 10, 10);
    this.addChild(shadow);
    let background = new PIXI.Graphics();
    background.lineStyle(3, this.config.colorFront).beginFill(this.config.colorBack).drawRoundedRect(0, 0, width, height, 10);
    this.addChild(background);

    this.scoreText = new PIXI.Text(message, { fontSize: 33, fontFamily: Fonts.UI, fill: this.config.colorFront, wordWrap: true, wordWrapWidth: width - 100 });
    this.addChild(this.scoreText);

    this.scoreText.position.set(50, 50);

    options.forEach((option, i) => {
      let button = new Button({
        label: option.label,
        width: width / 4,
        height: 60,
        onClick: () => this.closeModal(option.onClick),
        color: option.color || this.config.colorFront,
        labelStyle: {fill: this.config.colorBack},
      });

      this.addChild(button);

      button.y = height - button.height - 20;
      button.x = (7 + 4 * i - 2 * options.length) * width * 3 / 40;
    });
  }

  public closeModal = (onComplete?: () => void) => {
    this.animating = true;
    this.tween = new JMTween(this.scale, 300).to({x: 0, y: 0}).easing(JMEasing.Back.In).start().onComplete(() => {
      this.tween = null;
      this.animating = false;
      this.destroy();
      onComplete && onComplete();
    });
  }
}
