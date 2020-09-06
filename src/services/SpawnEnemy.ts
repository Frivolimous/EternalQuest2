import * as _ from 'lodash';

import { DataConverter } from './DataConverter';
import { IEnemy, EnemyGroupList, EnemySetId, ZoneId, EnemySlug } from '../data/EnemyData';

export const SpawnEnemy = {
  makeEnemies: (zone: ZoneId, type: EnemySetId, level: number, weight: number): IEnemy[] => {
    let block = EnemyGroupList[type];

    let enemies: IEnemy[] = [];

    if (weight >= 5) {
      let enemy = block.enemies.filter(e => e.base.xp === 5)[0];
      weight -= enemy.base.xp;
      enemies.push(DataConverter.getEnemy(enemy.base, level, [enemy.zones[zone], block.zones[zone]]));
    }

    if (weight > 0) {
      let candidates = block.enemies;

      while (weight > 0) {
        candidates = candidates.filter(e => e.base.xp <= weight);

        let enemy = _.sample(candidates);
        weight -= enemy.base.xp;
        enemies.push(DataConverter.getEnemy(enemy.base, level, [enemy.zones[zone], block.zones[zone]]));
      }

      // enemy = _.sample(block.enemies.filter(e => e.base.xp === 1));
      // let blob = block.enemies.find(e => e.base.slug === EnemySlug.G_BLOB);
      // let warrior = block.enemies.find(e => e.base.slug === EnemySlug.G_WARRIOR);
      // let wizard = block.enemies.find(e => e.base.slug === EnemySlug.G_SHAMAN);

      // return [DataConverter.getEnemy(warrior.base, level, [warrior.zones[zone], block.zones[zone]]), DataConverter.getEnemy(wizard.base, level, [wizard.zones[zone], block.zones[zone]])];
    }
    return enemies;
  },
};
