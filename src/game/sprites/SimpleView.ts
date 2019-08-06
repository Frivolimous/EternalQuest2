import { FlyingText } from '../../JMGE/effects/FlyingText';
import * as JMBL from '../../JMGE/JMBL';
import * as JMBUI from '../../JMGE/JMBUI';
import { SpriteModel } from './SpriteModel';
import { CONFIG } from '../../Config';

export class SpriteView extends PIXI.Graphics {
  public facing = 1;

  private actionGauge: JMBUI.Gauge;
  private healthGauge: JMBUI.Gauge;
  private yOffset: number = 0;
  private animating: boolean;

  constructor(private model: SpriteModel, color = 0x4488ff) {
    super();
    this.beginFill(color);
    this.lineStyle(1);
    this.drawEllipse(-15, -50, 15, 50);
    this.actionGauge = new JMBUI.Gauge(0xcccc22, { width: 30, height: 3 });
    this.actionGauge.x = -30;
    this.actionGauge.y = -110;
    this.actionGauge.setMax(1);
    this.addChild(this.actionGauge);
    this.healthGauge = new JMBUI.Gauge(0xcc2222, { width: 30, height: 3 });
    this.healthGauge.x = -30;
    this.healthGauge.y = -116;
    this.healthGauge.setMax(model.maxHealth);
    this.addChild(this.healthGauge);
  }

  public baseX = () => CONFIG.GAME.X_AT_0 + this.model.tile * CONFIG.GAME.X_TILE;
  public baseY = () => CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;

  public proclaim(s: string, fill: number = 0xffffff) {
    new FlyingText(s, { fill }, 0, -50, this);
  }

  public tempWalk = (onTrigger: () => void, onComplete: () => void) => {
    // let oY = this.y;
    JMBL.tween.to(this, 20, { y: this.y - 5 }, {
      onComplete: () => {
        onTrigger();
        JMBL.tween.to(this, 20, { y: this.baseY() }, {
          onComplete,
        });
      },
    });
  }

  public tempAnimate = (onTrigger: () => void, onComplete: () => void) => {
    this.proclaim('ATTACK!');
    this.animating = true;
    let oX = this.x;
    JMBL.tween.to(this, 10, { x: this.x + 20 * this.facing }, {
      onComplete: () => {
        onTrigger();
        this.proclaim('STRIKE!');
        JMBL.tween.to(this, 10, { x: oX }, {
          onComplete: () => {
            this.animating = false;
            onComplete();
          },
        });
      },
    });
    // JMBL.tween.wait(this, 100, { onComplete });
  }

  public update = () => {
    this.actionGauge.setValue(this.model.action);
    this.healthGauge.setValue(this.model.health);

    if (!this.animating) {
      let destX = this.baseX();
      if (this.x < destX) {
        this.x += CONFIG.GAME.WALK_SPEED;
        if (this.x > destX) {
          this.x = destX;
        }
      } else if (this.x > destX) {
        this.x -= CONFIG.GAME.WALK_SPEED;
        if (this.x < destX) {
          this.x = destX;
        }
      }
      // this.y = CONFIG.GAME.FLOOR_HEIGHT + CONFIG.GAME.Y_TILE * this.yOffset;
    }
  }

  public isModel(model: SpriteModel) {
    return this.model === model;
  }
}
