import { GameModel } from '../GameModel';
import * as JMBL from '../../JMGE/JMBL';
import * as _ from 'lodash';
import { SpriteModel } from '../sprites/SpriteModel';
import { GameEvents, SpriteEvents } from './GameEvents';
import { GameView } from '../ui/GameView';

export class GameController {
  private model: GameModel;

  // player: SpriteModel;
  // enemy: SpriteModel;

  private spriteModels: SpriteModel[] = [];

  private fighting = false;

  constructor(private gameV: GameView) {
    this.model = new GameModel();
    JMBL.events.ticker.add(this.onTick);

    let player = new SpriteModel();
    player.tile = 0;
    player.player = true;
    this.spriteModels.push(player);
    player.accel = 0.015;
    this.gameV.spriteAdded({ sprite: player, player: true });
  }

  public dispose() {
    JMBL.events.ticker.remove(this.onTick);
  }

  public getTarget = (origin: SpriteModel, tryForce: SpriteModel) => {
    if (tryForce && tryForce.exists) {
      return tryForce;
    } else {
      return _.find(this.spriteModels, sprite => sprite !== origin);
    }
  }

  public removeSprite = (sprite: SpriteModel) => {
    if (sprite.exists && _.find(this.spriteModels, sprite)) {
      sprite.exists = false;
      _.pull(this.spriteModels, sprite);
      this.fighting = false;
      this.gameV.spriteRemoved(sprite);
    }
  }

  public onTick = () => {
    if (this.fighting) {
      this.onFightingTick();
    } else {
      this.onBetweenTick();
    }
  }

  public onFightingTick = () => {
    _.each(this.spriteModels, sprite => {
      if (sprite.dead) {
        if (!sprite.player) {
          this.removeSprite(sprite);
        } else {
          sprite.addHealth(sprite.maxHealth);
          sprite.dead = false;
        }
      }
    });
    if (this.spriteModels.length <= 1) {
      return;
    }
    let maxVal: number = 0;
    let maxSprite: SpriteModel;
    if (_.every(this.spriteModels, { busy: false })) {
      this.spriteModels.forEach(sprite => {
        sprite.action += sprite.accel;
        if (sprite.action > maxVal) {
          maxVal = sprite.action;
          maxSprite = sprite;
        }
      });
      if (maxVal >= 1) {
        let target = this.getTarget(maxSprite, maxSprite.focusTarget);
        maxSprite.busy = true;
        this.gameV.animateAction({
          origin: maxSprite,
          target,
          action: 'basic-attack',
          trigger: () => {
            target.addHealth(-25);
          },
          callback: () => {
            maxSprite.action -= 1;
            maxSprite.busy = false;
          },
        });
      }
    }
  }

  public onBetweenTick = () => {
    if (_.some(this.spriteModels, { player: false })) {
      if (_.every(this.spriteModels, { busy: false })) {
        let maxPlayer = 0;
        let minEnemy = Infinity;
        _.each(this.spriteModels, sprite => {
          if (sprite.player) {
            maxPlayer = Math.max(maxPlayer, sprite.tile);
          } else {
            minEnemy = Math.min(minEnemy, sprite.tile);
          }
        });

        if (minEnemy - maxPlayer < 4) {
          this.startFight();
          return;
        }
      }
    } else {
      this.spawnEnemy();
    }
    _.each(this.spriteModels, sprite => {
      if (!sprite.busy) {
        sprite.busy = true;

        this.gameV.animateAction({
          origin: sprite,
          action: 'walk',
          data: sprite.player ? 'right' : 'left',
          trigger: () => {

          },
          callback: sprite.player ? () => {
            // this.player.tile ++;
            this.spriteModels.forEach(sprite2 => (sprite2 !== sprite) ? sprite2.tile-- : null);
            sprite.busy = false;
          } : () => {
            sprite.tile--;
            sprite.busy = false;
          },
        });
      }
    });
  }

  public startFight = () => {
    this.fighting = true;
    this.spriteModels.forEach(sprite => {
      sprite.action = Math.random();
      sprite.tile = sprite.player ? 0 : 2;
    });

    this.gameV.fightStarted();
  }

  public spawnEnemy = () => {
    let enemy = new SpriteModel();
    enemy.tile = 9;
    this.spriteModels.push(enemy);
    this.gameV.spriteAdded({ sprite: enemy, newSpawn: true });
  }
}
