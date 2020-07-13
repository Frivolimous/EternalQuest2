import * as _ from 'lodash';

import { DataConverter } from './DataConverter';
import { IEnemy } from '../data/EnemyData';

export const SpawnEnemy = {
  makeBasicEnemy: (zone: number, type: number, level: number, boss?: boolean): IEnemy => {
    if (boss) {
      return DataConverter.getEnemy('Goblin Boss', level);
    } else {
      return DataConverter.getEnemy('Goblin', level);
    }
  },
};
