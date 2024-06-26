import _ from 'lodash';
import * as PIXI from 'pixi.js';

import { SpriteView } from './sprites/SimpleView';
import { Background } from './Background';
import { CONFIG } from '../../Config';
import { GameEvents, IResizeEvent } from '../../services/GameEvents';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { SpriteModel } from '../../engine/sprites/SpriteModel';
import { JMTween } from '../../JMGE/JMTween';
import { JMTicker } from '../../JMGE/events/JMTicker';
import { Colors } from '../../data/Colors';
import { IBuffResult, IActionResult } from '../../engine/ActionController';
import { AnyStat, StatTag, ICompoundMap } from '../../data/StatData';
import { TextureCache } from '../../services/TextureCache';

const GameSettings = {
  auto: true,
};

export class GameView extends PIXI.Container {
  public onQueueEmpty = new JMEventListener<void>(false, false);
  public onSpriteSelected = new JMEventListener<{sprite: SpriteModel, type: 'select' | 'unselect'}>(false, true);
  public onActionComplete = new JMEventListener<IActionResult>();

  private background: Background;
  private spriteViews: SpriteView[] = [];
  private playerView: SpriteView;

  private actionQueue: IActionResult[] = [];
  private noActions = true;

  private scrolling = false;

  constructor() {
    super();

    this.background = new Background(TextureCache.getTextureBackgrounds(0), TextureCache.getTextureParalax(0), new PIXI.Rectangle(0, 0, CONFIG.INIT.SCREEN_WIDTH, CONFIG.INIT.SCREEN_HEIGHT));

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

  public selectSprite = (sprite: SpriteView) => {
    if (sprite.selected) {
      sprite.selected = false;
      this.onSpriteSelected.publish({sprite: sprite.model, type: 'unselect'});
    } else {
      this.spriteViews.forEach(view => view.selected = false);
      sprite.selected = true;
      this.onSpriteSelected.publish({sprite: sprite.model, type: 'select'});
    }
  }

  public spriteAdded = (sprite: SpriteModel) => {
    let color = sprite.player ? 0x33aaff : 0xff0000;
    let view = new SpriteView(sprite, color, sprite.player ? false : true);
    let numEnemies = this.spriteViews.filter(v => !v.model.player).length;

    view.display.interactive = true;
    view.display.cursor = 'pointer';
    view.display.addListener('pointerdown', () => this.selectSprite(view));
    view.offset.set(0 - 20 * numEnemies, 20 * numEnemies);

    this.spriteViews.push(view);
    this.addChild(view);
    view.position.set(CONFIG.GAME.X_AT_0 + sprite.tile * CONFIG.GAME.X_TILE + view.offset.x, CONFIG.GAME.FLOOR_HEIGHT + view.offset.y);
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

  public animateAction = (e: IActionResult) => {
    this.actionQueue.push(e);

    this.noActions = false;
  }

  public animateBuff = (e: IBuffResult) => {
    this.resolveBuff(e);
  }

  public fightStarted = () => {
    this.playerView.proclaim('FIGHT!', 0x00ff00);
    new JMTween({}, 0).wait(1000).start().onWaitComplete(() => {
      if (this.actionQueue.length === 0) {
        this.noActions = false;
      }
    });
  }

  public spriteLevelUp = (sprite: SpriteModel) => {
    let view = this.getSpriteByModel(sprite);
    if (view) view.proclaim('Level Up!', 0x00ff00);
  }

  public clearQueue = () => {
    this.actionQueue = [];
    this.noActions = true;
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
      } else if (GameSettings.auto) {
        this.tryNextAction();
      }
    }
    if (this.scrolling) {
      this.background.scrollX(CONFIG.GAME.WALK_SPEED);
    }
  }

  private tryNextAction() {
    if (this.actionQueue.length === 0) return;

    let action = this.actionQueue.shift();
    this.resolveAction(action);
  }

  private resolveAction(action: IActionResult) {
    let origin = this.getSpriteByModel(action.origin);
    origin.proclaim(action.name);

    if (action.type === 'walk') {
      if (origin === this.playerView) {
        this.scrolling = true;
      }
      origin.tempWalk(() => this.onActionComplete.publishSync(action), () => {
        if (origin === this.playerView) {
          this.scrolling = false;
        }
      });
      return;
    } else if (action.type === 'attack' || action.type === 'curse') {
      if (action.source.tags.includes('Projectile')) {
        let projectile = new PIXI.Graphics();
        projectile.beginFill(0x00ffff).lineStyle(1).drawEllipse(-5, -2.5, 10, 5);
        this.addChild(projectile);
        projectile.position.set(origin.x, origin.y - origin.height / 2);
        let target = this.getSpriteByModel(action.target);
        origin.animating = true;
        new JMTween(projectile.position, 500).to({x: target.x, y: target.y - target.height / 2}).start().onComplete(() => {
          this.finishAction(action);
          projectile.destroy();
          JMTicker.addOnce(() => origin.animating = false);
        });
      } else {
        origin.animateAttack(() => this.finishAction(action));
      }
    } else if (action.type === 'instant' || action.type === 'self' || action.type === 'heal' || action.type === 'buff') {
      this.finishAction(action);
    }
  }

  private finishAction = (action: IActionResult) => {
    this.onActionComplete.publishSync(action);
    if (action.removeBuff) {

    }
    if (action.addBuff) {
    }
    if (action.defended) {
      action.defended.forEach(data => {
        let view = this.getSpriteByModel(data.sprite);
        view.proclaim(data.type, Colors.DefendColor);
      });
    }
    if (action.vitalChange) {
      action.vitalChange.forEach((data, i) => {
        if (data.vital === 'health') {
          let view = this.getSpriteByModel(data.sprite);
          let color = data.value >= 0 ? Colors.DamageColor[data.tag] : Colors.HealColor;
          view.proclaim(String(Math.abs(Math.round(data.value))) + (data.critical ? '!!!' : ''), color, i * 30);
        }
      });
    }
    if (action.positionChange) {
    }
    if (action.chain) {
      new JMTween({percent: 0}, 0).to({percent: 1}).wait(200).start().onWaitComplete(() => this.finishAction(action.chain));
    }
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
        view.proclaim(String(Math.abs(Math.round(data.value))), color);
      });
    }
    if (buff.positionChange) {
    }
    if (buff.statChange) {
    }
  }

  private getSpriteByModel(model: SpriteModel) {
    return this.spriteViews.find(view => view.model === model);
  }

  private onDown = (e: KeyboardEvent) => {
    if (e.key === ' ') {
      this.tryNextAction();
    } else if (e.key === 'p') {
      GameSettings.auto = !GameSettings.auto;
    } else if (e.key === 'q') {
      (window as any).addStat = (stat: AnyStat, tag: StatTag, value: number | ICompoundMap) => this.playerView.model.stats.addStat(stat, tag, value);
      (window as any).subStat = (stat: AnyStat, tag: StatTag, value: number | ICompoundMap) => this.playerView.model.stats.subStat(stat, tag, value);
      (window as any).getStat = (stat: AnyStat, tags: StatTag[], withValue: number) => this.playerView.model.stats.getStat(stat, tags, withValue);
      // this.playerView.model.stats.addCompountStat('strength', 50);
    } else if (!isNaN(Number(e.key))) {
      let speed = Number(e.key);
      JMTicker.speedFactor = speed;
      JMTween.speedFactor = speed;
    } else if (e.key === 'l') {
      this.playerView.model.earnXp(this.playerView.model.vitals.getTotal('experience'));
    } else if (e.key === 'b') {
      this.scrolling = !this.scrolling;
    }
  }
}
