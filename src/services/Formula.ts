import _ from 'lodash';
import { StatMapLevel, StatMap, LevelValue, StatTag, DamageTags, DamageTag } from '../data/StatData';
import { RandomSeed } from './RandomSeed';
import { IItem } from '../data/ItemData';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { VitalType } from '../engine/stats/Vitals';

export const Formula = {
  COMBAT_DISTANCE: 4,
  ENEMY_SPAWN_DISTANCE: 9,

  diminish(a: number, level: number): number {
    return 1 - Math.pow(1 - a, level);
  },
  addMult(a: number, b: number): number {
    return (1 - (1 - a) * (1 - b));
  },
  subMult(t: number, a: number): number {
    return (1 - (1 - t) / (1 - a));
  },

  monstersByZone(zone: number): number {
    // return 1;
    return Math.round(7 + 100 * (1 - (100 / (100 + zone))));
  },

  experienceByLevel(level: number): number {
    return level * level * 2;
  },

  experiencePerMonster(zone: number): number {
    // return 1;
    return Math.floor(Math.pow(zone, 0.57));
  },

  itemLevelByZone(zone: number, trade?: boolean): number {
    let m = zone / 10 - 0.3 + RandomSeed.general.getRaw() * 0.6;

    if (trade) {
      if (m > 15) {
        m = Math.round(15 + (m - 15) * 0.3);
      }
    } else {
      m = Math.max(Math.min(Math.round(m), 15), 1);
    }

    return m;
  },

  costToFill(item: IItem) {
    return 5 * (item.maxCharges - item.charges);
  },

  costToUpgrade(item: IItem) {
    let value = item.cost * (item.level + 1) * 3.5;
    if (item.level > 15) value *= (item.level - 15);

    return value;
  },

  costToGamble(item: IItem, level: number) {
    let value = (item.cost * (1 + level / 5) + 100) * level * 4;

    // if (item.maxCharges) {
    //   value *= 5;
    // }

    return value;
  },

  incrementRefreshes(current: number) {
    return Math.min(current + 0.3, 5);
  },

  getRespecValue(skills: number) {
    return skills * skills * 7;
  },

  statLevelMapToStatMap(map: StatMapLevel, level: number): StatMap {
    return _.map(map, sl => ({stat: sl.stat, tag: sl.tag, value: Formula.statLevelToStat(sl.value, level)}));
  },

  statLevelToStat(stat: LevelValue, level: number): number {
    if (typeof stat === 'number') {
      return stat;
    } else {
      let value = stat.base || 0;
      if (stat.inc) {
        value += stat.inc * level;
      }
      if (stat.dim) {
        value += (stat.dmult || 1) * Formula.diminish(stat.dim, level);
      }
      if (stat.max) {
        value = Math.min(value, stat.max);
      }

      return value;
    }
  },

  getDamageTag(tags: StatTag[]) {
    let m = _.intersection(tags, DamageTags);
    return m[0] as DamageTag;
  },

  genStartingAction(init: number) {
    return init + RandomSeed.general.getInt(0, 50);
  },

  genSpawnCount(levelStart: boolean) {
    if (levelStart) {
      return 4;
    } else {
      return RandomSeed.enemySpawn.getInt(3, 9);
    }
  },

  spriteByHighestVital(sprites: SpriteModel[], vital: VitalType, minVal?: number) {
    let maxVal: number = 0;
    let maxSprite: SpriteModel;

    sprites.forEach(sprite => {
      let action = sprite.vitals.getVital(vital);
      if (action > maxVal) {
        maxVal = action;
        maxSprite = sprite;
      }
    });

    if (!minVal || maxVal > minVal) {
      return maxSprite;
    } else {
      return null;
    }
  },

  weightByEnemyCount(enemyCount: number, totalCount: number, zone: number): number {
    if (enemyCount === totalCount) {
      if (zone > 0 && (zone % 20 === 0)) {
        return 7;
      } else if (zone > 0 && zone % 5 === 0) {
        return 6;
      } else {
        return 5;
      }
    } else if (enemyCount > 0 && (enemyCount % 30 === 0)) {
      return 3;
    } else if (enemyCount > 0 && (enemyCount % 10 === 0)) {
      return 2;
    } else {
      return 1;
    }
  },
};
