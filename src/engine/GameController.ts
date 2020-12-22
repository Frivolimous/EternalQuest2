import * as _ from 'lodash';

import { GameEvents, IItemUpdate } from '../services/GameEvents';
import { SpriteModel } from './sprites/SpriteModel';
import { SaveManager } from '../services/SaveManager';
import { StatModel } from './stats/StatModel';
import { RandomSeed } from '../services/RandomSeed';
import { JMEventListener } from '../JMGE/events/JMEventListener';
import { SpawnEnemy } from '../services/SpawnEnemy';
import { IProgressSave } from '../data/SaveData';
import { Vitals } from './stats/Vitals';
import { IBuffResult, ActionController, IActionResult } from './ActionController';
import { DataConverter } from '../services/DataConverter';
import { ItemManager } from '../services/ItemManager';
import { Formula } from '../services/Formula';
import { EffectTrigger } from '../data/EffectData';
import { IItem } from '../data/ItemData';
import { EnemySetId, ZoneId } from '../data/EnemyData';
import { GOD_MODE } from '../services/_Debug';

export class GameController {
  public onPlayerAdded = new JMEventListener<SpriteModel>();
  public onPlayerDead = new JMEventListener<null>();
  public onSpriteAdded = new JMEventListener<SpriteModel>();
  public onSpriteRemoved = new JMEventListener<SpriteModel>();
  public onSpriteLevel = new JMEventListener<SpriteModel>();
  public onReset = new JMEventListener<null>();
  public onEnemyDead = new JMEventListener<SpriteModel>();
  public onZoneProgress = new JMEventListener<IProgressSave>();
  public onVitalsUpdate = new JMEventListener<Vitals>();
  public onFightStart = new JMEventListener<null>();
  public onAction = new JMEventListener<IActionResult>();
  public onBuffEffect = new JMEventListener<IBuffResult>();
  public onItemUpdate = new JMEventListener<IItemUpdate>();
  public onNavTown = new JMEventListener<null>();
  public onLevelComplete = new JMEventListener<null>();

  private levelData: IProgressSave;

  private spriteModels: SpriteModel[] = [];
  private playerSprite: SpriteModel;

  private fighting = false;
  private processing = false;
  private spawnCount: number;

  private levelComplete = false;

  private actionC: ActionController;

  constructor() {
    this.actionC = new ActionController(this.onBuffEffect.publish, this.updateItem, this.unselectItem);

    GameEvents.ticker.add(this.onTick);

    this.levelData = SaveManager.getCurrentProgress();
    if (!this.levelData) {
      new Error('No level data - - you should not be here!!!');
    }

    this.importPlayer();
    this.startLevel();
  }

  public importPlayer() {
    this.playerSprite = new SpriteModel(StatModel.fromSave(SaveManager.getCurrentPlayer()));
    console.log('Player: ', this.playerSprite.stats.name);
    this.playerSprite.player = true;
    this.playerSprite.setVitalsCallback(vitals => this.onVitalsUpdate.publish(vitals));
    this.spriteModels.push(this.playerSprite);
    this.onPlayerAdded.publish(this.playerSprite);
    this.onSpriteAdded.publish(this.playerSprite);
    this.onZoneProgress.publish(this.levelData);
    this.playerSprite.onLevelUp.addListener(this.onSpriteLevel.publish);
  }

  public startLevel() {
    this.playerSprite.tile = 0;
    this.spawnCount = Formula.genSpawnCount(true);
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
    this.actionC.selectedItem = null;
    this.actionC.doubleSelected = false;

    // this.playerSprite.resetVitals();
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
    console.log('enemy dead', sprite.stats.xp);
    if (this.actionC.selectedTarget === sprite) {
      this.actionC.selectedTarget = null;
    }
    this.removeSprite(sprite);
    this.playerSprite.earnXp(sprite.stats.xp);

    let item = ItemManager.getLootFor(this.playerSprite, this.levelData, sprite);
    if (item) {
      this.onItemUpdate.publish({item, type: 'loot'});
    }

    if (!_.some(this.spriteModels, {player: false})) {
      this.endFight();
    }

    this.onEnemyDead.publish(sprite);
  }

  public endFight = () => {
    this.fighting = false;

    this.levelData.enemyCount++;
    this.onZoneProgress.publish(this.levelData);

    this.spawnCount = Formula.genSpawnCount(false);
    this.processTriggersFor('fightEnd', this.playerSprite);
  }

  public playerDead = (sprite: SpriteModel) => {
    console.log('player dead');
    this.processing = true;
    this.onPlayerDead.publish();
  }

  public tickFighting = () => {
    if (this.spriteModels.length <= 1) return;

    this.spriteModels.forEach(sprite => sprite.incAction());
    let activeSprite = Formula.spriteByHighestVital(this.spriteModels, 'action', 100);

    if (activeSprite) {
      this.processing = true;

      let result = this.actionC.chooseAction(activeSprite, this.spriteModels, true);
      this.onAction.publishSync(result);
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
      this.spriteModels.forEach(sprite => {
        if (sprite.player) {
          maxPlayer = Math.max(maxPlayer, sprite.tile);
        } else {
          minEnemy = Math.min(minEnemy, sprite.tile);
        }
      });

      if (minEnemy - maxPlayer < Formula.COMBAT_DISTANCE) {
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

  public selectItem = (item: IItem, type: 'unselect' | 'select' | 'double') => {
    if (type === 'select' || type === 'double') {
      this.actionC.selectedItem = item;
      this.actionC.doubleSelected = type === 'double';
    } else {
      this.actionC.selectedTarget = null;
    }
  }

  public selectTarget = (data: {sprite: SpriteModel, type: 'unselect' | 'select'}) => {
    if (data.type === 'select') {
      this.actionC.selectedTarget = data.sprite;
    } else {
      this.actionC.selectedTarget = null;
    }
  }

  public unselectItem = (item: IItem) => {
    this.onItemUpdate.publish({item, type: 'clearSelect'});
  }

  public startFight = () => {
    this.fighting = true;
    this.spriteModels.forEach(sprite => {
      let init = sprite.stats.getStat('initiative');
      sprite.vitals.setVital('action', Formula.genStartingAction(init));
      sprite.tile = sprite.player ? 0 : (2 + sprite.stats.distanceOffset);
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
      if (GOD_MODE && sprite.player) sprite.vitals.setVital('health', sprite.vitals.getTotal('health'));
      this.processTriggersFor('constant', sprite);
      if (this.fighting) {
        this.processTriggersFor('constantBattle', sprite);
      } else {
        this.processTriggersFor('constantSafe', sprite);
      }
    }
  }

  public finishLevel = () => {
    this.levelData.zone++;
    this.levelData.enemyCount = 0;
    this.levelData.monsterType = EnemySetId.GOBLIN;
    this.levelData.zoneType = Math.floor(Math.random() * 3);
    this.onLevelComplete.publish();
    this.levelComplete = true;
    SaveManager.getExtrinsic().currency.refresh = Formula.incrementRefreshes(SaveManager.getExtrinsic().currency.refresh);
  }

  public spawnEnemy = () => {
    let totalMonsters = Formula.monstersByZone(this.levelData.zone);
    if (this.levelData.enemyCount > totalMonsters) {
      this.finishLevel();
      return;
    }

    let weight = Formula.weightByEnemyCount(this.levelData.enemyCount, totalMonsters, this.levelData.zone);
    let spawns = SpawnEnemy.makeEnemies(this.levelData.zoneType, this.levelData.monsterType, this.levelData.zone, weight);

    spawns.forEach(spawn => {
      let enemy = new SpriteModel(StatModel.fromEnemy(spawn));
      enemy.tile = Formula.ENEMY_SPAWN_DISTANCE + enemy.stats.distanceOffset;
      console.log('Enemy: ' + enemy.stats.name);
      this.spriteModels.push(enemy);
      this.onSpriteAdded.publish(enemy);
    });
  }

  public addTownBuff = () => {
    if (this.playerSprite.buffs.hasBuff('town')) {
      this.actionC.expendBuff(this.playerSprite, 'town');
    } else {
      let buff = DataConverter.getBuff('town', 0);
      let buffAction = buff.action;

      this.playerSprite.stats.addAction(buffAction);
      let onRemove = () => {
        this.playerSprite.stats.removeAction(buffAction);
      };
      this.playerSprite.buffs.addBuff({
        source: buff,
        remaining: 1,
        timer: Infinity,
        onRemove,
      });
    }
  }

  public getPlayerSave = () => {
    let save = this.playerSprite.stats.getSave();

    return save;
  }

  private updateItem = (item: IItem) => {
    if (item.charges === 0 && !item.enchantSlug && item.tags.includes('Premium') && item.tags.includes('Scroll')) {
      this.onItemUpdate.publish({item, type: 'remove'});
    } else {
      this.onItemUpdate.publish({item, type: 'update'});
    }
  }
}
