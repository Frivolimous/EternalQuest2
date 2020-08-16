import * as _ from 'lodash';

import { DataConverter } from './DataConverter';
import { IEnemy, EnemyGroupList, EnemySetId, ZoneId } from '../data/EnemyData';

export const SpawnEnemy = {
  makeBasicEnemy: (zone: ZoneId, type: EnemySetId, level: number, weight: number): IEnemy => {
    let block = EnemyGroupList[type];

    let enemy;

    if (weight === 5) {
      enemy = block.enemies.filter(e => e.base.xp === 5)[0];
    } else {
      enemy = _.sample(block.enemies.filter(e => e.base.xp === 1));
    }

    return DataConverter.getEnemy(enemy.base, level, [enemy.zones[zone], block.zones[zone]]);
  },
};
