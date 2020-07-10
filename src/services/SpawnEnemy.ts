import { BaseStats, dBaseStats, CompoundStats, dCompoundStats } from '../data/StatData';

import * as _ from 'lodash';
import { IItemSave } from '../data/ItemData';

export const SpawnEnemy = {
  makeBasicEnemy: (zone: number, type: number, level: number): IEnemyStats => {
    return {
      name: 'Goblin',
      level: 2,
      baseStats: _.cloneDeep(dBaseStats),
      compoundStats: _.cloneDeep(dCompoundStats),
    };
  },
};

export interface IEnemyStats {
  name: string;
  level: number;
  baseStats: BaseStats;
  compoundStats: CompoundStats;
  equipment?: IItemSave;
  extras?: any;
}
