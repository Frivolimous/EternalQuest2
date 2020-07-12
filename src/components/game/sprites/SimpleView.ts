import * as PIXI from 'pixi.js';

import { CONFIG } from '../../../Config';
import { FlyingText } from '../../../JMGE/effects/FlyingText';
import { JMTween } from '../../../JMGE/JMTween';
import { SimpleGauge } from '../../ui/SimpleGauge';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { Vitals } from '../../../engine/stats/Vitals';
import { BuffView } from './BuffView';

export class SpriteView extends PIXI.Container {
  public facing = 1;
  public display = new PIXI.Graphics();

  private animating: boolean;
  private actionGauge: SimpleGauge;
  private manaGauge: SimpleGauge;
  private healthGauge: SimpleGauge;
  private yOffset: number = 0;
  private moving: boolean;
  private buffView: BuffView = new BuffView();

  constructor(public model: SpriteModel, color = 0x4488ff, private showGauges: boolean = true) {
    super();
    this.addChild(this.display);
    this.display.beginFill(color);
    this.display.lineStyle(1);
    this.display.drawEllipse(-20, -75, 20, 75);
    this.addChild(this.buffView);
    if (showGauges) {
      this.healthGauge = new SimpleGauge({color: 0xcc2222, bgColor: 0x550000, width: 40, height: 3});
      this.manaGauge = new SimpleGauge({color: 0x2222cc, bgColor: 0x000055, width: 40, height: 3});
      this.actionGauge = new SimpleGauge({width: 40, height: 3, bgColor: 0x555500, color: 0xcccc22});
      this.addChild(this.actionGauge, this.manaGauge, this.healthGauge);
      this.actionGauge.setTotal(100);
      this.actionGauge.position.set(-40, -160);
      this.manaGauge.position.set(-40, -166);
      this.healthGauge.position.set(-40, -172);

      this.healthGauge.setTotal(model.stats.getBaseStat('health'));
      this.manaGauge.setTotal(model.stats.getBaseStat('mana'));
      model.setVitalsCallback(this.vitalsUpdate);
      this.buffView.position.set(-40, -200);
    } else {
      this.buffView.position.set(-40, -170);
    }
  }

  public proclaim(s: string, fill: number = 0xffffff) {
    new FlyingText(s, {fill}, -10, -100, this);
  }

  public tempWalk = (trigger: () => void) => {
    this.animating = true;
    trigger();
    new JMTween(this as SpriteView, 100).to({y: this.y - 5}).onComplete(() => {
      new JMTween(this as SpriteView, 100).to({y: this.baseY()}).start().onComplete(() => this.animating = false);
    }).start();
  }

  public animateAttack = (trigger: () => void) => {
    let oX = this.x;
    this.animating = true;
    new JMTween(this as SpriteView, 300).to({x: this.x + 20 * this.facing}).onComplete(() => {
      trigger();
      new JMTween(this as SpriteView, 300).to({x: oX}).onComplete(() => this.animating = false).start();
    }).start();
  }

  public vitalsUpdate = (vitals: Vitals) => {
    if (this.showGauges) {
      this.actionGauge.setCount(vitals.getVital('action'));
      this.manaGauge.setCount(vitals.getVital('mana'));
      this.healthGauge.setCount(vitals.getVital('health'));
    }
  }

  public update = () => {
    this.moving = false;
    if (!this.animating) {
      let destX = this.baseX();
      if (this.x < destX) {
        this.moving = true;
        this.x += CONFIG.GAME.WALK_SPEED;
        if (this.x > destX) {
          this.x = destX;
        }
      } else if (this.x > destX) {
        this.moving = true;
        this.x -= CONFIG.GAME.WALK_SPEED;
        if (this.x < destX) {
          this.x = destX;
        }
      }
      // this.y = CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;
    }

    this.buffView.updateBuffs(this.model.buffs);
  }

  public isBusy = () => this.moving || this.animating;

  private baseX = () => CONFIG.GAME.X_AT_0 + this.model.tile * CONFIG.GAME.X_TILE;
  private baseY = () => CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;
}
