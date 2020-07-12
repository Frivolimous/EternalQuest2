import { IAction } from './ActionData';
import { IItem } from './ItemData';

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
  makeActionDescription: (action: IAction): string => {
    let str = '';
    str += action.slug;

    return str;
  },
};
