import * as _ from 'lodash';
import * as PIXI from 'pixi.js';

import { SpriteView } from './sprites/SimpleView';
import { Background } from './Background';
import { CONFIG } from '../../Config';
import { GameEvents, IAnimateAction, ISpriteAdded } from '../../services/GameEvents';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { SpriteModel } from '../../engine/sprites/SpriteModel';
import { JMTween } from '../../JMGE/JMTween';
import { CompoundStat } from '../../data/StatData';

export class GameView extends PIXI.Container {
  public onQueueEmpty = new JMEventListener<void>(false, false);
  public onSpriteClicked = new JMEventListener<SpriteModel>(false, true);

  private background: Background;
  private spriteViews: SpriteView[] = [];
  private playerView: SpriteView;

  private actionQueue: IAnimateAction[] = [];
  private auto = false;

  constructor() {
    super();

    this.background = new Background(new PIXI.Rectangle(0, 0, CONFIG.INIT.SCREEN_WIDTH, CONFIG.INIT.SCREEN_HEIGHT));

    this.addChild(this.background);

    GameEvents.ticker.add(this.onTick);
    window.addEventListener('keydown', this.onDown);
  }

  public destroy() {
    GameEvents.ticker.remove(this.onTick);
    super.destroy();
    window.removeEventListener('keydown', this.onDown);
  }

  public spriteAdded = (e: ISpriteAdded) => {
    let color = e.player ? 0x33aaff : 0xff0000;
    let view = new SpriteView(e.sprite, color, e.player ? false : true);

    view.interactive = true;
    view.buttonMode = true;
    view.addListener('pointerdown', () => this.onSpriteClicked.publishSync(e.sprite));

    this.spriteViews.push(view);
    this.addChild(view);
    view.position.set(CONFIG.GAME.X_AT_0 + e.sprite.tile * CONFIG.GAME.X_TILE, CONFIG.GAME.FLOOR_HEIGHT);
    if (e.player) {
      this.playerView = view;
    } else {
      view.facing = -1;
      this.playerView.proclaim('SPAWN!', 0xffff00);
    }
  }

  public spriteRemoved = (sprite: SpriteModel) => {
    let view = this.getSpriteByModel(sprite);
    if (view) {
      _.pull(this.spriteViews, view);
      view.destroy();
    }
  }

  public animateAction = (e: IAnimateAction) => {
    this.actionQueue.push(e);

    // let view = _.find(this.spriteViews, view2 => view2.isModel(e.origin));
    // switch (e.action) {
    //   case 'walk': view.tempWalk(e.trigger, e.callback); break;
    //   case 'basic-attack': view.tempAnimate(e.trigger, e.callback); break;
    // }
  }

  public fightStarted = () => {
    this.playerView.proclaim('FIGHT!', 0x00ff00);
    new JMTween({}, 0).wait(1000).start().onWaitComplete(() => {
      this.onQueueEmpty.publishSync();
    });
  }

  private onTick = () => {
    let busy = false;
    this.spriteViews.forEach(sprite => {
      sprite.update();
      if (sprite.isBusy()) {
        busy = true;
      }
    });
    if (this.auto && !busy) {
      this.tryNextAction();
    }
  }

  private tryNextAction() {
    if (this.actionQueue.length > 0) {
      let e = this.actionQueue.shift();
      let view = this.getSpriteByModel(e.origin);
      view.tempAnimate(e, () => {
        e.onComplete();
        if (this.actionQueue.length === 0) {
          this.onQueueEmpty.publishSync();
        }
      });
    }
  }

  private getSpriteByModel(model: SpriteModel) {
    return _.find(this.spriteViews, view => view.model === model);
  }

  private onDown = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      this.tryNextAction();
    } else if (e.key === 'p') {
      this.auto = !this.auto;
    } else if (e.key === 'q') {
      (window as any).addCompoundStat = (stat: CompoundStat, value: number) => this.playerView.model.stats.addCompountStat(stat, value);
      // this.playerView.model.stats.addCompountStat('strength', 50);
    }
  }
}
