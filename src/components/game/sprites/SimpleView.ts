import * as PIXI from 'pixi.js';

import { CONFIG } from '../../../Config';
import { FlyingText } from '../../../JMGE/effects/FlyingText';
import { JMTween } from '../../../JMGE/JMTween';
import { SimpleGauge } from '../../ui/SimpleGauge';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { Vitals } from '../../../engine/stats/Vitals';
import { IAnimateAction } from '../../../services/GameEvents';

export class SpriteView extends PIXI.Graphics {
  public facing = 1;

  private actionGauge: SimpleGauge;
  private healthGauge: SimpleGauge;
  private yOffset: number = 0;
  private animating: boolean;
  private moving: boolean;

  constructor(public model: SpriteModel, color = 0x4488ff, private showGauges: boolean = true) {
    super();
    this.beginFill(color);
    this.lineStyle(1);
    this.drawEllipse(-15, -50, 15, 50);
    if (showGauges) {
      this.actionGauge = new SimpleGauge({width: 30, height: 3, bgColor: 0x555500, color: 0xcccc22});
      this.actionGauge.x = -30;
      this.actionGauge.y = -110;
      this.actionGauge.setTotal(100);
      this.addChild(this.actionGauge);
      this.healthGauge = new SimpleGauge({color: 0xcc2222, bgColor: 0x550000, width: 30, height: 3});
      this.healthGauge.x = -30;
      this.healthGauge.y = -116;
      this.healthGauge.setTotal(model.stats.getBaseStat('health'));
      this.addChild(this.healthGauge);
      model.setVitalsCallback(this.vitalsUpdate);
    }
  }

  public proclaim(s: string, fill: number = 0xffffff) {
    new FlyingText(s, {fill}, 0, -50, this);
  }

  public tempWalk = (data: IAnimateAction, onComplete: () => void) => {
    // let oY = this.y;
    this.proclaim(data.result.name);
    data.trigger();
    new JMTween(this as SpriteView, 100).to({y: this.y - 5}).onComplete(() => {
      new JMTween(this as SpriteView, 100).to({y: this.baseY()}).start().onComplete(() => onComplete());
    }).start();
  }

  public tempAnimate = (data: IAnimateAction, onComplete: () => void) => {
    if (data.result.type === 'walk') {
      this.tempWalk(data, onComplete);
      return;
    }
    this.proclaim('Anim');
    this.animating = true;
    let oX = this.x;
    new JMTween(this as SpriteView, 300).to({x: this.x + 20 * this.facing}).onComplete(() => {
      data.trigger();
      this.proclaim(data.result.name);
      new JMTween(this as SpriteView, 300).to({x: oX}).onComplete(() => {
        this.animating = false;
        onComplete();
      }).start();
    }).start();
  }

  public vitalsUpdate = (vitals: Vitals) => {
    if (this.showGauges) {
      this.actionGauge.setCount(this.model.action);
      this.healthGauge.setCount(this.model.health);
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
  }

  public isBusy = () => this.moving || this.animating;

  private baseX = () => CONFIG.GAME.X_AT_0 + this.model.tile * CONFIG.GAME.X_TILE;
  private baseY = () => CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;
}
