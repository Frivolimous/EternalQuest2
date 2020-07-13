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
import { ItemManager } from '../services/ItemManager';
import { IItem } from '../data/ItemData';
import { Formula } from '../services/Formula';
import { IEnemy } from '../data/EnemyData';

export class GameController {
  public onPlayerAdded = new JMEventListener<SpriteModel>();
  public onPlayerDead = new JMEventListener<null>();
  public onSpriteAdded = new JMEventListener<SpriteModel>();
  public onSpriteRemoved = new JMEventListener<SpriteModel>();
  public onPlayerLevel = new JMEventListener<SpriteModel>();
  public onReset = new JMEventListener<null>();
  public onEnemyDead = new JMEventListener<SpriteModel>();
  public onZoneProgress = new JMEventListener<IPlayerLevelSave>();
  public onVitalsUpdate = new JMEventListener<Vitals>();
  public onFightStart = new JMEventListener<null>();
  public onAction = new JMEventListener<IAnimateAction>();
  public onBuffEffect = new JMEventListener<IBuffResult>();
  public onNavTown = new JMEventListener<null>();
  public onLoot = new JMEventListener<IItem>();
  public onLevelComplete = new JMEventListener<null>();

  private levelData: IPlayerLevelSave;

  private spriteModels: SpriteModel[] = [];
  private player: SpriteModel;

  private fighting = false;
  private processing = false;
  private spawnCount = 4;

  private levelComplete = false;

  constructor() {
    GameEvents.ticker.add(this.onTick);

    this.levelData = SaveManager.getCurrentPlayerLevel();
    if (!this.levelData) {
      new Error('No level data - - you should not be here!!!');
    }

    this.startLevel();
  }

  public startLevel() {
    this.player = new SpriteModel(StatModel.fromSave(SaveManager.getCurrentPlayer()));
    console.log('Player: ', this.player.stats.name);
    this.player.tile = 0;
    this.player.player = true;
    this.player.onLevelUp.addListener(this.onPlayerLevel.publish);
    this.spriteModels.push(this.player);
    this.player.setVitalsCallback(vitals => this.onVitalsUpdate.publish(vitals));
    this.onPlayerAdded.publish(this.player);
    this.onSpriteAdded.publish(this.player);
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
    if (this.processing || this.levelComplete) {
      return;
    }

    for (let i = this.spriteModels.length - 1; i >= 0; i--) {
      let sprite = this.spriteModels[i];
      sprite.regenTick();
      sprite.checkDeath();
      if (sprite.dead) {
        if (!sprite.player) {
          this.enemyDead(sprite);
        } else {
          this.playerDead(sprite);
          return;
        }
      }
    }

    if (this.fighting) {
      this.tickFighting();
    } else {
      this.tickBetween();
    }
  }

  public enemyDead = (sprite: SpriteModel) => {
    console.log('enemy dead');
    this.removeSprite(sprite);
    this.onEnemyDead.publishSync(sprite);
    this.levelData.enemyCount++;
    this.onZoneProgress.publish(this.levelData);
    this.player.earnXp();

    let item = ItemManager.getLootFor(this.player, this.levelData, sprite);
    if (item) {
      this.onLoot.publish(item);
    }

    if (!_.some(this.spriteModels, {player: false})) {
      this.endFight();
    }
  }

  public endFight = () => {
    this.spawnCount = RandomSeed.enemySpawn.getInt(1, 9);
    this.fighting = false;
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
    let totalMonsters = Formula.monstersByZone(this.levelData.zone);
    if (this.levelData.enemyCount > totalMonsters) {
      this.levelData.zone++;
      this.levelData.enemyCount = 0;
      this.onLevelComplete.publish();
      this.levelComplete = true;
      return;
    }

    let spawn = SpawnEnemy.makeBasicEnemy(this.levelData.zoneType, this.levelData.monsterType, this.levelData.zone, this.levelData.enemyCount === totalMonsters);

    let enemy = new SpriteModel(StatModel.fromEnemy(spawn));
    enemy.tile = 9;
    console.log('Enemy: ' + enemy.stats.name);
    this.spriteModels.push(enemy);
    this.onSpriteAdded.publish(enemy);
  }

  public addTownBuff = () => {
    if (this.player.buffs.hasBuff('town')) {
      this.player.buffs.expendBuff('town');
    } else {
      let buff = DataConverter.getBuff('town', 0);
      let buffAction = buff.action;

      let onAdd = () => {
        this.player.stats.addAction(buffAction);
      };
      let onRemove = () => {
        this.player.stats.removeAction(buffAction);
      };
      this.player.buffs.addBuff({
        source: buff,
        remaining: 1,
        timer: Infinity,
        onAdd,
        onRemove,
      });
    }
  }

  public getPlayerSave = () => {
    let save = this.player.stats.getSave();

    return save;
  }
}
