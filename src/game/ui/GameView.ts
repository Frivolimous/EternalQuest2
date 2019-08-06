import * as _ from 'lodash';

import { SpriteView } from '../sprites/SimpleView';
import { Background } from '../assets/generated/Background';
import { SpriteModel } from '../sprites/SpriteModel';
import { CONFIG } from '../../Config';
import { GameEvents, ISpriteAdded, IAnimateAction } from '../engine/GameEvents';

export class GameView extends PIXI.Container {
  private background: Background;
  private spriteViews: SpriteView[] = [];
  private playerView: SpriteView;

  constructor() {
    super();

    this.background = new Background(new PIXI.Rectangle(0, 0, CONFIG.INIT.STAGE_WIDTH, CONFIG.INIT.STAGE_HEIGHT));

    this.addChild(this.background);

    // GameEvents.SPRITE_ADDED.addListener(this.spriteAdded);
    // GameEvents.SPRITE_REMOVED.addListener(this.spriteRemoved);
    // GameEvents.ANIMATE_ACTION.addListener(this.animateAction);
    // GameEvents.FIGHT_STATE.addListener(this.fightStarted);
    GameEvents.ticker.add(this.onTick);
  }

  public dispose() {
    // GameEvents.SPRITE_ADDED.removeListener(this.spriteAdded);
    // GameEvents.SPRITE_REMOVED.removeListener(this.spriteRemoved);
    // GameEvents.ANIMATE_ACTION.removeListener(this.animateAction);
    // GameEvents.FIGHT_STATE.removeListener(this.fightStarted);
    GameEvents.ticker.remove(this.onTick);
    this.destroy();
  }

  public onTick = () => {
    this.spriteViews.forEach(sprite => sprite.update());
  }

  public spriteAdded = (e: ISpriteAdded) => {
    let color = e.player ? 0x33aaff : 0xff0000;
    let view = new SpriteView(e.sprite, color);
    this.spriteViews.push(view);
    this.addChild(view);
    view.position.set(CONFIG.GAME.X_AT_0 + e.sprite.tile * CONFIG.GAME.X_TILE, CONFIG.GAME.FLOOR_HEIGHT);
    if (e.player) {
      this.playerView = view;
    } else {
      view.facing = -1;
      this.playerView.proclaim('SPAWN!', 0xff0000);
    }
  }

  public animateAction = (e: IAnimateAction) => {
    let view = _.find(this.spriteViews, spriteView => spriteView.isModel(e.origin));
    switch (e.action) {
      case 'walk': view.tempWalk(e.trigger, e.callback); break;
      case 'basic-attack': view.tempAnimate(e.trigger, e.callback); break;
    }
  }

  public spriteRemoved = (sprite: SpriteModel) => {
    let view = _.find(this.spriteViews, spriteView => spriteView.isModel(sprite));
    if (view) {
      _.pull(this.spriteViews, view);
      view.destroy();
    }
  }

  public fightStarted = () => {
    this.playerView.proclaim('FIGHT!', 0x00ff00);
  }
}
