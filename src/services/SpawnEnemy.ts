import * as _ from 'lodash';

import { DataConverter } from './DataConverter';
import { IEnemy, EnemySlug } from '../data/EnemyData';

export const SpawnEnemy = {
  makeBasicEnemy: (zone: number, type: number, level: number, boss?: boolean): IEnemy => {
    if (boss) {
      return DataConverter.getEnemy(EnemySlug.G_BOSS, level);
    } else {
      return DataConverter.getEnemy(EnemySlug.G_WARRIOR, level);
    }
  },
};
