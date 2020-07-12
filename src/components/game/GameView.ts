import * as _ from 'lodash';
import * as PIXI from 'pixi.js';

import { SpriteView } from './sprites/SimpleView';
import { Background } from './Background';
import { CONFIG } from '../../Config';
import { GameEvents, IAnimateAction, IResizeEvent } from '../../services/GameEvents';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { SpriteModel } from '../../engine/sprites/SpriteModel';
import { JMTween } from '../../JMGE/JMTween';
import { CompoundStat } from '../../data/StatData';
import { JMTicker } from '../../JMGE/events/JMTicker';
import { Colors } from '../../data/Colors';
import { IBuffResult } from '../../services/ActionManager';

export class GameView extends PIXI.Container {
  public onQueueEmpty = new JMEventListener<void>(false, false);
  public onSpriteClicked = new JMEventListener<SpriteModel>(false, true);

  private background: Background;
  private spriteViews: SpriteView[] = [];
  private playerView: SpriteView;

  private actionQueue: IAnimateAction[] = [];
  private noActions = true;
  private auto = false;

  constructor() {
    super();

    this.background = new Background(new PIXI.Rectangle(0, 0, CONFIG.INIT.SCREEN_WIDTH, CONFIG.INIT.SCREEN_HEIGHT));

    this.addChild(this.background);

    GameEvents.ticker.add(this.onTick);
    window.addEventListener('keydown', this.onDown);
  }

  public positionElements = (e: IResizeEvent) => {
    this.background.redraw(e.outerBounds);
  }

  public destroy() {
    GameEvents.ticker.remove(this.onTick);
    super.destroy();
    window.removeEventListener('keydown', this.onDown);
  }

  public spriteAdded = (sprite: SpriteModel) => {
    let color = sprite.player ? 0x33aaff : 0xff0000;
    let view = new SpriteView(sprite, color, sprite.player ? false : true);

    view.display.interactive = true;
    view.display.buttonMode = true;
    view.display.addListener('pointerdown', () => this.onSpriteClicked.publishSync(sprite));

    this.spriteViews.push(view);
    this.addChild(view);
    view.position.set(CONFIG.GAME.X_AT_0 + sprite.tile * CONFIG.GAME.X_TILE, CONFIG.GAME.FLOOR_HEIGHT);
    if (sprite.player) {
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
    this.noActions = false;
  }

  public animateBuff = (e: IBuffResult) => {
    this.resolveBuff(e);
  }

  public fightStarted = () => {
    this.playerView.proclaim('FIGHT!', 0x00ff00);
    new JMTween({}, 0).wait(1000).start().onWaitComplete(() => {
      this.onQueueEmpty.publish();
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
    if (!busy && !this.noActions) {
      if (this.actionQueue.length === 0) {
        this.noActions = true;
        this.onQueueEmpty.publishSync();
      } else if (this.auto) {
        this.tryNextAction();
      }
    }
  }

  private tryNextAction() {
    if (this.actionQueue.length === 0) return;

    let action = this.actionQueue.shift();
    this.resolveAction(action);
  }

  private resolveAction(action: IAnimateAction) {
    let origin = this.getSpriteByModel(action.result.origin);
    origin.proclaim(action.result.name);

    if (action.result.type === 'walk') {
      origin.tempWalk(action.trigger);
      return;
    }

    origin.animateAttack(() => {
      action.trigger();
      if (action.result.type === 'attack') {
        if (action.result.removeBuff) {

        }
        if (action.result.addBuff) {
        }
        if (action.result.defended) {
          action.result.defended.forEach(data => {
            let view = this.getSpriteByModel(data.sprite);
            view.proclaim(data.type, Colors.DefendColor);
          });
        }
        if (action.result.vitalChange) {
          action.result.vitalChange.forEach(data => {
            let view = this.getSpriteByModel(data.sprite);
            let color = data.value >= 0 ? Colors.DamageColor[data.tag] : Colors.HealColor;
            view.proclaim(String(Math.abs(data.value)) + (data.critical ? '!!!' : ''), color);
          });
        }
        if (action.result.positionChange) {
        }
        if (action.result.chain) {
        }
      }
    });
  }

  private resolveBuff(buff: IBuffResult) {
    if (buff.removeBuff) {
    }
    if (buff.addBuff) {
    }
    if (buff.vitalChange) {
      buff.vitalChange.forEach(data => {
        let view = this.getSpriteByModel(data.sprite);
        let color = data.value >= 0 ? Colors.DamageColor[data.tag] : Colors.HealColor;
        view.proclaim(String(Math.abs(data.value)), color);
      });
    }
    if (buff.positionChange) {
    }
    if (buff.baseStatChange) {
    }
    if (buff.compoundStatChange) {
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
    } else if (!isNaN(Number(e.key))) {
      let speed = Number(e.key);
      JMTicker.speedFactor = speed;
      JMTween.speedFactor = speed;
    }
  }
}
