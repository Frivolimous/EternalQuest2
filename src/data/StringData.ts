import * as _ from 'lodash';

import { IAction } from './ActionData';
import { IItem } from './ItemData';
import { ISkill } from './SkillData';
import { StatDisplay, BaseStat } from './StatData';
import { IEffect } from './EffectData';
import { IBuff } from './BuffData';
import { Formula } from '../services/Formula';
import { StatModel } from '../engine/stats/StatModel';

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
    if (item.stats) {
      item.stats.forEach(stat => str += (stat.tag ? stat.tag : '') + ' ' + stat.stat + ': ' + (StatDisplay[stat.stat] === 'percent' ? (Math.round(stat.value * 100) + '%') : Math.round(stat.value)) + '\n');
    }
    if (item.action) {
      str += Descriptions.makeActionDescription(item.action) + '\n';
    }
    if (item.triggers) {
      item.triggers.forEach(trigger => {
        str += Descriptions.makeEffectDescription(trigger) + '\n';
      });
    }

    return str;
  },
  makeSkillDescription: (skill: ISkill): string => {
    let str = '';
    str += 'Level ' + skill.level + '\n';
    str += '\n\n';
    if (skill.stats) {
      skill.stats.forEach(stat => str += (stat.tag ? stat.tag : '') + ' ' + stat.stat + ': ' + (StatDisplay[stat.stat] === 'percent' ? (Math.round(stat.value * 100) + '%') : Math.round(stat.value)) + '\n');
    }
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
  makeProcessedActionDescription: (action: IAction, origin: StatModel): string => {
    let str = '';
    if (action.userate) {
      str += Math.round(action.userate * 100) + '% ';
    }
    str += action.slug;

    let tags = action.tags.concat(action.source ? action.source.tags : []);

    if (tags && tags.length > 0) {
      str += '\n';
      tags.forEach(tag => str += tag + ' ');
      str += '\n\n';
      str += 'Cost: ';
      if (action.costs.action) {
        str += 'action: ' + action.costs.action * (1 - origin.getStat('efficiency', tags)) + ', ';
      }
      if (action.costs.mana) {
        str += 'mana: ' + action.costs.action * (1 - origin.getStat('manacost', tags)) + ', ';
      }
      if (action.costs.health) {
        str += 'health: ' + action.costs.action * (1 - origin.getStat('manacost', tags)) + ', ';
      }
    }
    if (action.stats) {
      str += '\n\n';
      let damage = origin.getStat('baseDamage', tags, action.stats.baseDamage) * origin.getPower(tags);
      let critRate = origin.getStat('critRate', tags, action.stats.critRate);
      let critMult = origin.getStat('critMult', tags, action.stats.critMult);
      let hit = origin.getStat('hit', tags, action.stats.hit);
      let penetration = origin.getStat('penetration', tags, action.stats.penetration);
      if (hit) {
        str += 'hit: ' + Math.round(hit) + '\n';
      }
      if (damage) {
        str += 'damage: ' + Math.round(damage) + '\n';
      }
      if (critRate) {
        str += 'crit: ' + Math.round(critRate * 100) + '% x' + critMult + '\n';
      }
      if (penetration) {
        str += 'penetration: ' + Math.round(penetration * 100) + '%\n';
      }
    }

    let effects = (action.effects || []).concat(origin.getTriggersFor(['action', 'hit', 'crit', 'miss'], tags));

    if (effects && effects.length > 0) {
      str += '\n\n';
      effects.forEach(effect => str += '\n' + Descriptions.makeEffectDescription(effect));
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
        str += Math.round(effect.damage.value) + ' ' + Formula.getDamageTag(effect.damage.tags).substr(0, 1).toUpperCase();
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
      str += '\n';
      if (buff.stats) {
        buff.stats.forEach(stat => str += (stat.tag ? stat.tag : '') + ' ' + stat.stat + ': ' + (StatDisplay[stat.stat] === 'percent' ? (Math.round(stat.value * 100) + '%') : Math.round(stat.value)) + '\n');
      }
    } else if (buff.type === 'trigger') {
      buff.triggers.forEach(trigger => {
        str += '\n' + Descriptions.makeEffectDescription(trigger);
      });
    }

    return str;
  },
};
