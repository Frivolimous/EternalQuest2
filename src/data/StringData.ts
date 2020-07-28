import * as _ from 'lodash';

import { IAction } from './ActionData';
import { IItem } from './ItemData';
import { ISkill } from './SkillData';
import { StatDisplay, BaseStat } from './StatData';
import { IEffect } from './EffectData';
import { IBuff } from './BuffData';
import { Formula } from '../services/Formula';

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
    item.stats && item.stats.forEach(stat => str += (stat.tag ? stat.tag : '') + ' ' + stat.stat + ': ' + stat.value + '\n');
    if (item.action) {
      str += Descriptions.makeActionDescription(item.action) + '\n';
    }

    return str;
  },
  makeSkillDescription: (skill: ISkill): string => {
    let str = '';
    str += 'Level ' + skill.level + '\n';
    str += '\n\n';
    skill.stats && skill.stats.forEach(stat => str += (stat.tag ? stat.tag : '') + ' ' + stat.stat + ': ' + stat.value + '\n');
    if (skill.action) {
      str += Descriptions.makeActionDescription(skill.action) + '\n';
    }

    return str;
  },
  makeActionDescription: (action: IAction): string => {
    let str = '';
    if (action.userate) {
      str += Math.round(action.userate * 100) + '% ';
    }
    str += action.slug;
    if (action.tags && action.tags.length > 0) {
      str += '\n';
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
        let percent = StatDisplay[key as BaseStat] === 'percent';
        str += key + ': ' + _.round(stat * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
      });
    }
    if (action.effects && action.effects.length > 0) {
      str += '\n\n';
      action.effects.forEach(effect => str += '\n' + Descriptions.makeEffectDescription(effect));
    }

    return str;
  },

  makeEffectDescription: (effect: IEffect): string => {
    let str = '';

    if (effect.userate && effect.userate < 1) {
      str += Math.round(effect.userate * 100) + '% ';
    }

    if (effect.type === 'buff') {
      str += Descriptions.makeBuffDescription(effect.buff);
    } else {
      if (effect.type === 'damage') {
        str += effect.name + ': ';
        str += Math.round(effect.value) + ' ' + Formula.getDamageTag(effect.damageTags).substr(0, 1).toUpperCase();
      } else if (effect.type === 'clearBuff') {
        str += 'clears ' + effect.buffRemoved;
      } else if (effect.type === 'special') {
        str += effect.name + ': ';
        if (effect.value) {
          str += Math.round(effect.value * 100);
        }
      }
    }

    return str;
  },

  makeBuffDescription: (buff: IBuff): string => {
    let str = '';

    str += buff.count + 'x ' + buff.name;
    if (buff.type === 'action') {
      str += '\n';
      str += Descriptions.makeActionDescription(buff.action);
    } else if (buff.type === 'damage') {
      str += ': ';
      str += Math.round(buff.damage.value) + Formula.getDamageTag(buff.damage.tags).substr(0, 1).toUpperCase();
    } else if (buff.type === 'stat') {
      if (buff.stats && buff.stats.length > 0) {
        str += '\n';
        buff.stats && buff.stats.forEach(stat => str += (stat.tag ? stat.tag : '') + ' ' + stat.stat + ': ' + stat.value + '\n');
      }
    } else if (buff.type === 'trigger') {
      buff.triggers.forEach(trigger => {
        str += '\n' + Descriptions.makeEffectDescription(trigger);
      });
    }

    return str;
  },
};
