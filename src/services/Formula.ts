import * as _ from 'lodash';
import { StatMapLevel, StatMap, LevelValue, StatTag, DamageTags, DamageTag } from '../data/StatData';

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
    return zone + 8;
  },

  experienceByLevel(level: number): number {
    return level * 2;
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
  }
};
