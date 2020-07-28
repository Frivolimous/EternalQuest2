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
import { IBuffResult, ActionController, IActionResult } from './ActionController';
import { DataConverter } from '../services/DataConverter';
import { ItemManager } from '../services/ItemManager';
import { IItem } from '../data/ItemData';
import { Formula } from '../services/Formula';
import { EffectTrigger } from '../data/EffectData';

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
  public onAction = new JMEventListener<IActionResult>();
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

  private actionC = new ActionController(this.onBuffEffect.publish);

  constructor() {
    GameEvents.ticker.add(this.onTick);

    this.levelData = SaveManager.getCurrentPlayerLevel();
    if (!this.levelData) {
      new Error('No level data - - you should not be here!!!');
    }

    this.importPlayer();
    this.startLevel();
  }

  public importPlayer() {
    this.player = new SpriteModel(StatModel.fromSave(SaveManager.getCurrentPlayer()));
    console.log('Player: ', this.player.stats.name);
    this.player.player = true;
    this.player.setVitalsCallback(vitals => this.onVitalsUpdate.publish(vitals));
    this.spriteModels.push(this.player);
    this.onPlayerAdded.publish(this.player);
    this.onSpriteAdded.publish(this.player);
    this.onZoneProgress.publish(this.levelData);
    this.player.onLevelUp.addListener(this.onPlayerLevel.publish);
  }

  public startLevel() {
    this.player.tile = 0;
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

    // this.player.resetVitals();
    this.importPlayer();
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
      this.regenTick(sprite, this.fighting ? 10 : 50);
      sprite.checkDeath();
      if (sprite.dead) {
        this.processTriggersFor('death', sprite);
        if (sprite.dead) {
          if (!sprite.player) {
            this.enemyDead(sprite);
          } else {
            this.playerDead(sprite);
            return;
          }
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

    this.onEnemyDead.publishSync(sprite);
  }

  public endFight = () => {
    this.spawnCount = RandomSeed.enemySpawn.getInt(1, 9);
    this.fighting = false;
    this.processTriggersFor('fightEnd', this.player);
  }

  public playerDead = (sprite: SpriteModel) => {
    console.log('player dead');
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

      let result = this.actionC.chooseAction(maxSprite, this.spriteModels, true);
      this.onAction.publish(result);
    }
  }

  public finishAction = (result: IActionResult) => {
    this.actionC.finishAction(result, this.spriteModels);
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
        let result = this.actionC.chooseAction(sprite, this.spriteModels, false);

        if (result) {
          if (result.source.slug === 'gotown') {
            this.onNavTown.publish();
          } else {
            this.onAction.publish(result);
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
      let init = sprite.stats.getStat('initiative');
      sprite.vitals.setVital('action', init + RandomSeed.general.getRaw() * 100);
      sprite.tile = sprite.player ? 0 : 2;
      this.processTriggersFor('fightStart', sprite);
    });

    this.processing = true;
    this.onFightStart.publish();
  }

  public processTriggersFor = (event: EffectTrigger, origin: SpriteModel, target?: SpriteModel) => {
    let result = this.actionC.processTriggers(origin, target, this.spriteModels, event);
    if (result) {
      this.onAction.publish(result);
    }
  }

  public regenTick = (sprite: SpriteModel, value: number = 10) => {
    this.actionC.tickBuffs(sprite, value);

    sprite.vitals.regen.count += value;

    if (sprite.vitals.regen.count > sprite.vitals.regen.total) {
      sprite.vitals.regen.count -= sprite.vitals.regen.total;
      let hreg = sprite.stats.getStat('hregen') * sprite.stats.getStat('health');
      let mreg = sprite.stats.getStat('mregen') * sprite.stats.getStat('mana');
      sprite.vitals.addCount('health', hreg);
      sprite.vitals.addCount('mana', mreg);
      this.processTriggersFor('constant', sprite);
      if (this.fighting) {
        this.processTriggersFor('constantBattle', sprite);
      } else {
        this.processTriggersFor('constantSafe', sprite);
      }
    }
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
      this.actionC.expendBuff(this.player, 'town');
    } else {
      let buff = DataConverter.getBuff('town', 0);
      let buffAction = buff.action;

      this.player.stats.addAction(buffAction);
      let onRemove = () => {
        this.player.stats.removeAction(buffAction);
      };
      this.player.buffs.addBuff({
        source: buff,
        remaining: 1,
        timer: Infinity,
        onRemove,
      });
    }
  }

  public getPlayerSave = () => {
    let save = this.player.stats.getSave();

    return save;
  }
}
