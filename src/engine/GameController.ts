import * as _ from 'lodash';

import { GameEvents } from '../services/GameEvents';
import { GameView } from '../components/game/GameView';
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
  public onReset = new JMEventListener<null>();
  public onEnemyDead = new JMEventListener<SpriteModel>();
  public onZoneProgress = new JMEventListener<IPlayerLevelSave>();
  public onVitalsUpdate = new JMEventListener<Vitals>();

  private model: GameModel;
  private levelData: IPlayerLevelSave;

  private spriteModels: SpriteModel[] = [];

  private fighting = false;
  private processing = false;
  private spawnCount = 4;

  constructor(private gameV: GameView) {
    this.model = new GameModel();

    gameV.onQueueEmpty.addListener(this.proceed);
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
    player.stats.addBaseStat('speed', 'Base', 15);
    this.gameV.spriteAdded({ sprite: player, player: true });
    player.setVitalsCallback(vitals => this.onVitalsUpdate.publish(vitals));
    this.onPlayerAdded.publish(player);
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
      this.gameV.spriteRemoved(sprite);
    }
  }

  public onTick = () => {
    if (this.processing) {
      return;
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
    this.spawnCount = RandomSeed.enemySpawn.getInt(1, 9);
    this.fighting = false;
    this.onEnemyDead.publishSync(sprite);
  }

  public playerDead = (sprite: SpriteModel) => {
    console.log('player dead');
    sprite.resetVitals();
    sprite.dead = false;
    this.processing = true;
    this.onPlayerDead.publish();
  }

  public tickFighting = () => {
    _.each(this.spriteModels, sprite => {
      if (sprite.dead) {
        if (!sprite.player) {
          this.enemyDead(sprite);
        } else {
          this.playerDead(sprite);
        }
      }
    });
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

      let target = ActionManager.chooseTarget(maxSprite, this.spriteModels);
      let action = ActionManager.chooseAction(maxSprite, target);
      let result = ActionManager.processAction(maxSprite, target, action);
      this.gameV.animateAction({
        origin: maxSprite,
        target,
        result,
        trigger: () => {
          ActionManager.finishAction(maxSprite, target, this.spriteModels, result);
        },
        onComplete: () => {
          target.checkDeath();
          console.log('Action Complete');
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
        let action = ActionManager.chooseAction(sprite, null);
        let result = ActionManager.processAction(sprite, null, action);
        this.gameV.animateAction({
          origin: sprite,
          result,
          trigger: () => {
            ActionManager.finishAction(sprite, null, this.spriteModels, result);
          },
          onComplete: () => {},
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
      sprite.action = Math.random() * 100;
      sprite.tile = sprite.player ? 0 : 2;
    });

    this.processing = true;
    this.gameV.fightStarted();
  }

  public spawnEnemy = () => {
    let spawn = SpawnEnemy.makeBasicEnemy(this.levelData.zoneType, this.levelData.monsterType, this.levelData.zone);
    let enemy = new SpriteModel(StatModel.fromEnemy(spawn));
    enemy.tile = 9;
    console.log('Enemy: ' + enemy.stats.name);
    this.spriteModels.push(enemy);
    this.gameV.spriteAdded({ sprite: enemy, newSpawn: true });
  }
}
