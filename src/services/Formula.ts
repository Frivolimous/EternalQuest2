import * as _ from 'lodash';
import { StatMapLevel, StatMap, LevelValue, StatTag, DamageTags, DamageTag } from '../data/StatData';
import { RandomSeed } from './RandomSeed';
import { IItem } from '../data/ItemData';

export const Formula = {
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
    return Math.round(7 + 100 * (1 - (100 / (100 + zone))));
  },

  experienceByLevel(level: number): number {
    return level * level * 2;
  },

  experiencePerMonster(zone: number): number {
    return Math.floor(Math.pow(zone, 0.77));
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
    if (_.isNumber(stat)) {
      return stat;
    } else {
      return (stat.base || 0) + (stat.inc || 0) * level + ((stat.dim && level >= 0) ? Formula.diminish(stat.dim, level) : 0);
    }
  },

  getDamageTag(tags: StatTag[]) {
    let m = _.intersection(tags, DamageTags);
    return m[0] as DamageTag;
  },
};
