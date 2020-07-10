import * as _ from 'lodash';

import { GameEvents, IAnimateAction } from '../services/GameEvents';
import { SpriteModel } from './sprites/SpriteModel';
import { GameModel } from './GameModel';
import { SaveManager } from '../services/SaveManager';
import { StatModel } from './stats/StatModel';
import { RandomSeed } from '../services/RandomSeed';
import { JMEventListener } from '../JMGE/events/JMEventListener';
import { SpawnEnemy } from '../services/SpawnEnemy';
import { IPlayerLevelSave } from '../data/SaveData';
import { Vitals } from './stats/Vitals';
import { ActionManager } from '../services/ActionManager';

export class GameController {
  public onPlayerAdded = new JMEventListener<SpriteModel>();
  public onPlayerDead = new JMEventListener<null>();
  public onSpriteAdded = new JMEventListener<SpriteModel>();
  public onSpriteRemoved = new JMEventListener<SpriteModel>();
  public onReset = new JMEventListener<null>();
  public onEnemyDead = new JMEventListener<SpriteModel>();
  public onZoneProgress = new JMEventListener<IPlayerLevelSave>();
  public onVitalsUpdate = new JMEventListener<Vitals>();
  public onFightStart = new JMEventListener<null>();
  public onAction = new JMEventListener<IAnimateAction>();

  private model: GameModel;
  private levelData: IPlayerLevelSave;

  private spriteModels: SpriteModel[] = [];

  private fighting = false;
  private processing = false;
  private spawnCount = 4;

  constructor() {
    this.model = new GameModel();

    GameEvents.ticker.add(this.onTick);

    this.levelData = SaveManager.getCurrentPlayerLevel();
    if (!this.levelData) {
      new Error('No level data - - you should not be here!!!');
    }

    this.startLevel();
  }

  public startLevel() {
    let player = new SpriteModel(StatModel.fromSave(SaveManager.getCurrentPlayer()));
    console.log('Player: ', player.stats.name);
    player.tile = 0;
    player.player = true;
    this.spriteModels.push(player);
    player.setVitalsCallback(vitals => this.onVitalsUpdate.publish(vitals));
    this.onPlayerAdded.publish(player);
    this.onSpriteAdded.publish(player);
    this.onZoneProgress.publish(this.levelData);
  }

  public destroy() {
    GameEvents.ticker.remove(this.onTick);
  }

  public restartLevel = () => {
    this.levelData.enemyCount = 0;
    while (this.spriteModels.length > 0) {
      this.removeSprite(this.spriteModels[0]);
    }
    this.fighting = false;
    this.processing = false;
    this.spawnCount = 4;

    this.startLevel();
  }

  public removeSprite = (sprite: SpriteModel) => {
    if (_.find(this.spriteModels, sprite)) {
      sprite.exists = false;
      _.pull(this.spriteModels, sprite);
      this.onSpriteRemoved.publish(sprite);
    }
  }

  public onTick = () => {
    if (this.processing) {
      return;
    }

    _.each(this.spriteModels, sprite => {
      sprite.regenTick();
      sprite.checkDeath();
      if (sprite.dead) {
        if (!sprite.player) {
          this.enemyDead(sprite);
        } else {
          this.playerDead(sprite);
        }
      }
    });

    if (this.fighting) {
      this.tickFighting();
    } else {
      this.tickBetween();
    }
  }

  public enemyDead = (sprite: SpriteModel) => {
    console.log('enemy dead');
    this.removeSprite(sprite);
    this.spawnCount = RandomSeed.enemySpawn.getInt(1, 9);
    this.fighting = false;
    this.onEnemyDead.publishSync(sprite);
    this.levelData.enemyCount++;
    this.onZoneProgress.publish(this.levelData);
  }

  public playerDead = (sprite: SpriteModel) => {
    console.log('player dead');
    sprite.resetVitals();
    sprite.dead = false;
    this.processing = true;
    this.onPlayerDead.publish();
  }

  public tickFighting = () => {
    if (this.spriteModels.length <= 1) {
      return;
    }
    let maxVal: number = 0;
    let maxSprite: SpriteModel;
    this.spriteModels.forEach(sprite => {
      sprite.incAction();
      let action = sprite.action;
      if (action > maxVal) {
        maxVal = action;
        maxSprite = sprite;
      }
    });
    if (maxVal >= 100) {
      this.processing = true;

      let result = ActionManager.chooseAction(maxSprite, this.spriteModels, true);
      this.onAction.publish({
        result,
        trigger: () => {
          ActionManager.finishAction(result, this.spriteModels);
        },
      });
    }
  }

  public tickBetween = () => {
    if (_.some(this.spriteModels, { player: false })) {
      // there is an enemy
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
    } else {
      if (this.spawnCount > 0) {
        this.spawnCount--;
      } else {
        this.spawnEnemy();
      }
    }
    _.each(this.spriteModels, sprite => {
      this.processing = true;
      if (sprite.player) {
        let result = ActionManager.chooseAction(sprite, this.spriteModels, false);
        this.onAction.publish({
          result,
          trigger: () => {
            ActionManager.finishAction(result, this.spriteModels);
          },
        });
      }
    });
  }

  public proceed = () => {
    this.processing = false;
  }

  public startFight = () => {
    this.fighting = true;
    this.spriteModels.forEach(sprite => {
      let init = sprite.stats.getBaseStat('initiative');
      sprite.action = init + RandomSeed.general.getRaw() * 100;
      sprite.tile = sprite.player ? 0 : 2;
    });

    this.processing = true;
    this.onFightStart.publish();
  }

  public spawnEnemy = () => {
    let spawn = SpawnEnemy.makeBasicEnemy(this.levelData.zoneType, this.levelData.monsterType, this.levelData.zone);
    let enemy = new SpriteModel(StatModel.fromEnemy(spawn));
    enemy.tile = 9;
    console.log('Enemy: ' + enemy.stats.name);
    this.spriteModels.push(enemy);
    this.onSpriteAdded.publish(enemy);
  }
}
