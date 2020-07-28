import * as PIXI from 'pixi.js';

import { CONFIG } from '../../../Config';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';

export interface IProjectileView {
  start: {x: number, y: number};
}

export class ProjectileView extends PIXI.Container {
  public facing = 1;
  public display = new PIXI.Graphics();

  private animating: boolean;
  private yOffset: number = 0;
  private moving: boolean;

  constructor(public model: SpriteModel, color = 0x4488ff, private showGauges: boolean = true) {
    super();
    this.addChild(this.display);
    this.display.beginFill(color);
    this.display.lineStyle(1);
    this.display.drawEllipse(-20, -75, 20, 75);
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
