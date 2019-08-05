import { FlyingText } from "../../JMGE/effects/FlyingText";
import * as JMBL from '../../JMGE/JMBL';
import * as JMBUI from '../../JMGE/JMBUI';
import { SpriteModel } from './SpriteModel';
import { CONFIG } from "../../Config";

export class SpriteView extends PIXI.Graphics {
  actionGauge: JMBUI.Gauge;
  healthGauge: JMBUI.Gauge;
  yOffset: number = 0;
  animating: boolean;

  facing = 1;

  baseX = () => CONFIG.GAME.X_AT_0 + this.model.tile * CONFIG.GAME.X_TILE;
  baseY = () => CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;
  
  constructor(private model: SpriteModel, color = 0x4488ff) {
    super();
    this.beginFill(color);
    this.lineStyle(1);
    this.drawEllipse(-15, -50, 15, 50);
    this.actionGauge = new JMBUI.Gauge(0xcccc22, {width: 30, height: 3});
    this.actionGauge.x = -30;
    this.actionGauge.y = -110;
    this.actionGauge.setMax(1);
    this.addChild(this.actionGauge);
    this.healthGauge = new JMBUI.Gauge(0xcc2222, {width: 30, height: 3});
    this.healthGauge.x = -30;
    this.healthGauge.y = -116;
    this.healthGauge.setMax(model.maxHealth);
    this.addChild(this.healthGauge);
  }

  proclaim (s: string, fill: number = 0xffffff) {
    new FlyingText(s, {fill}, 0, -50, this);
  }

  tempWalk = (onTrigger: () => void, onComplete: () => void) => {
    // let oY = this.y;
    JMBL.tween.to(this, 20, {y: this.y -5}, {
      onComplete: () => {
        onTrigger();
        JMBL.tween.to(this, 20, {y: this.baseY()}, {
          onComplete
        });
      }
    });
  }

  tempAnimate = (onTrigger: () => void, onComplete: () => void) => {
    this.proclaim("ATTACK!");
    this.animating = true;
    let oX = this.x;
    JMBL.tween.to(this, 10, {x: this.x + 20 * this.facing}, {
      onComplete: () => {
        onTrigger();
        this.proclaim("STRIKE!");
        JMBL.tween.to(this, 10, {x: oX}, {
          onComplete: () => {
            this.animating = false;
            onComplete();
          }
        });
      }
    });
    // JMBL.tween.wait(this, 100, { onComplete });
  }

  update = () => {
    this.actionGauge.setValue(this.model.action);
    this.healthGauge.setValue(this.model.health);

    if (!this.animating) {
      let dest_X = this.baseX();
      if (this.x < dest_X) {
        this.x += CONFIG.GAME.WALK_SPEED;
        if (this.x > dest_X) {
          this.x = dest_X;
        }
      } else if (this.x > dest_X) {
        this.x -= CONFIG.GAME.WALK_SPEED;
        if (this.x < dest_X) {
          this.x = dest_X;
        }
      }
      // this.y = CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;
    }
  }
  
  isModel(model: SpriteModel) {
    return this.model === model;
  }
}