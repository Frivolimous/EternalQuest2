import * as _ from 'lodash';

import { GameEvents, IAnimateAction } from '../services/GameEvents';
import { SpriteModel } from './sprites/SpriteModel';
import { SaveManager } from '../services/SaveManager';
import { StatModel } from './stats/StatModel';
import { RandomSeed } from '../services/RandomSeed';
import { JMEventListener } from '../JMGE/events/JMEventListener';
import { SpawnEnemy } from '../services/SpawnEnemy';
import { IPlayerLevelSave } from '../data/SaveData';
import { Vitals } from './stats/Vitals';
import { ActionManager, IBuffResult } from '../services/ActionManager';
import { BuffList } from '../data/BuffData';
import { ActionList } from '../data/ActionData';
import { DataConverter } from '../services/DataConverter';

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
  public onBuffEffect = new JMEventListener<IBuffResult>();
  public onNavTown = new JMEventListener<null>();

  private levelData: IPlayerLevelSave;

  private spriteModels: SpriteModel[] = [];

  private fighting = false;
  private processing = false;
  private spawnCount = 4;

  constructor() {
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
      let action = sprite.vitals.getVital('action');
      if (action > maxVal) {
        maxVal = action;
        maxSprite = sprite;
      }
    });
    if (maxVal >= 100) {
      this.processing = true;

      let result = ActionManager.chooseAction(maxSprite, this.spriteModels, true, this.onBuffEffect.publish);
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
        let result = ActionManager.chooseAction(sprite, this.spriteModels, false, this.onBuffEffect.publish);

        if (result) {
          if (result.source.slug === 'gotown') {
            this.onNavTown.publish();
          } else {
            this.onAction.publish({
              result,
              trigger: () => {
                ActionManager.finishAction(result, this.spriteModels);
              },
            });
          }
        }
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
      sprite.vitals.setVital('action', init + RandomSeed.general.getRaw() * 100);
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

  public addTownBuff = () => {
    let player = _.find(this.spriteModels, sprite => sprite.player);

    if (player.buffs.hasBuff('town')) {
      player.buffs.expendBuff('town');
    } else {
      let buff = DataConverter.getBuff('town', 0);
      let buffAction = buff.action;

      let onAdd = () => {
        player.stats.addAction(buffAction);
      };
      let onRemove = () => {
        player.stats.removeAction(buffAction);
      };
      player.buffs.addBuff({
        source: buff,
        remaining: 1,
        timer: Infinity,
        onAdd,
        onRemove,
      });
    }
  }
}
