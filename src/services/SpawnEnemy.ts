import { IItemSave } from '../data/SaveData';
import { BaseStats, dBaseStats } from '../data/StatData';

import * as _ from 'lodash';

export const SpawnEnemy = {
  makeBasicEnemy: (zone: number, type: number, level: number): IEnemyStats => {
    return {
      name: 'Goblin',
      level: 2,
      stats: _.cloneDeep(dBaseStats),
    };
  },
};

export interface IEnemyStats {
  name: string;
  level: number;
  stats: BaseStats;
  equipment?: IItemSave;
  extras?: any;
}
