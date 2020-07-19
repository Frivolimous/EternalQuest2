import * as _ from 'lodash';

import { IAction } from './ActionData';
import { IItem } from './ItemData';
import { ISkill } from './SkillData';
import { BaseStatDisplay, BaseStat } from './StatData';

export const StringData = {
  GAME_TITLE: 'Eternal Quest',

  ZONE_NAME: [
    'Forest',
    'Desert',
    'Realm',
  ],

  MONSTER_SET_NAME: [
    'Goblin',
    'Beast',
    'Demon',
  ],
};

export const Descriptions = {
  makeItemDescription: (item: IItem): string => {
    let str = '';
    str += 'Level ' + item.level + '\n';
    item.tags.forEach(tag => str += tag + ' ');
    str += '\n\n';
    item.baseStats && item.baseStats.forEach(stat => str += stat.tag + ' ' + stat.stat + ': ' + stat.value + '\n');
    item.compoundStats && item.compoundStats.forEach(stat => str += stat.stat + ': ' + stat.value + '\n');
    if (item.action) {
      str += Descriptions.makeActionDescription(item.action) + '\n';
    }

    return str;
  },
  makeSkillDescription: (skill: ISkill): string => {
    let str = '';
    str += 'Level ' + skill.level + '\n';
    str += '\n\n';
    skill.baseStats && skill.baseStats.forEach(stat => str += stat.tag + ' ' + stat.stat + ': ' + stat.value + '\n');
    skill.compoundStats && skill.compoundStats.forEach(stat => str += stat.stat + ': ' + stat.value + '\n');
    if (skill.action) {
      str += Descriptions.makeActionDescription(skill.action) + '\n';
    }

    return str;
  },
  makeActionDescription: (action: IAction): string => {
    let str = '';
    str += action.slug + '\n';
    if (action.tags && action.tags.length > 0) {
      action.tags.forEach(tag => str += tag + ' ');
      str += '\n\n';
      str += 'Cost: ';
      _.forIn(action.costs, (val, key) => {
        str += key + ': ' + val + ', ';
      });
    }
    if (action.stats && _.size(action.stats) > 0) {
      str += '\n\n';
      _.forIn(action.stats, (stat, key) => {
        let percent = BaseStatDisplay[key as BaseStat] === 'percent';
        str += key + ': ' + _.round(stat * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
      });
    }
    str += '\n\n';
    if (action.effects && action.effects.length > 0) {
      let effect = action.effects[0];
      str += effect.name + '\n';
    }

    return str;
  },
};
