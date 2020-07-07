import * as PIXI from 'pixi.js';
import * as _ from 'lodash';
import { JMTween } from '../JMTween';

export class FlyingText extends PIXI.Text {
  constructor(s: string, style: PIXI.TextStyleOptions, x: number, y: number, parent?: PIXI.Container) {
    super(s, _.defaults(style, { fontSize: 15, fontWeight: 'bold', dropShadow: true, fill: 0xffffff, dropShadowDistance: 2 }));
    this.anchor.set(0.5, 0.5);

    this.position.set(x, y);

    if (parent) parent.addChild(this);

    new JMTween<FlyingText>(this).wait(20).to({ alpha: 0}).over(1000).start();
    new JMTween<FlyingText>(this).to({ y: this.y - 20 }).over(1200).onComplete(() => {
      this.destroy();
    }).start();
  }
}
