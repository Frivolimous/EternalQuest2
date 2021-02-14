import * as _ from 'lodash';

import { IHeroSave } from '../data/SaveData';
import { EnglishStringData, GibberishStringData } from '../data/StringData';
import { SkillTreeSlug, SkillPageMap, ISkill } from '../data/SkillData';
import { IItem } from '../data/ItemData';
import { StatDisplay, BaseStat, StatMap } from '../data/StatData';
import { IAction } from '../data/ActionData';
import { StatModel } from '../engine/stats/StatModel';
import { IEffect } from '../data/EffectData';
import { Formula } from './Formula';
import { IBuff } from '../data/BuffData';

type langType = 'English' | 'Gibberish';
let languages: langType[] = ['English', 'Gibberish'];
let cLanguage: langType = 'English';

let changeLanguage = (): langType => {
  let i = (languages.indexOf(cLanguage) + 1) % languages.length;
  cLanguage = languages[i];

  switch (cLanguage) {
    case 'English': StringManager = EnglishStringManager; break;
    case 'Gibberish': StringManager = GibberishStringManager; break;
  }
  return cLanguage;
};

export const EnglishStringManager = {
  data: EnglishStringData,

  changeLanguage: (): langType => {
    return changeLanguage();
  },

  getCurrentLanguage: (): langType => {
    return cLanguage;
  },

  titleFromSave: (save: IHeroSave): string => {
    let title = 'The ' + StringManager.data.SKILL[save.talent];

    let skills: [SkillTreeSlug, number][] = SkillPageMap.map(page => {
      let count = 0;
      page.skills.forEach(skill => {
        let data = save.skills.find(s => s.slug === skill.slug);
        if (data) {
          count += data.level;
        }
      });

      return [page.slug , count];
    });

    let [tree1, tree2] = skills.sort((a, b) => (a[1] - b[1])).reverse();

    if (tree1[1] > 20 && tree2[1] >= 10) {
      title += ' ' + StringManager.data.TITLES_COMB[tree1[0]][tree2[0]];
    } else {
      if (tree2[1] > 5) {
        title += ' ' + StringManager.data.TITLES_PREFIX[tree2[0]];
      }
      if (tree1[1] > 20) {
        title += ' ' + StringManager.data.SKILL_TREE[tree1[0]];
      } else if (tree1[1] >= 5) {
        title += ' ' + StringManager.data.TITLES_MINOR[tree1[0]];
      }
    }

    return title;
  },

  makeItemDescription: (item: IItem): string => {
    let str = '';
    let highlights = '';

    if (item.level < 0) {
      item.tags.forEach((tag, i, a) => {
        str += tag + ((i < a.length - 1) ? ', ' : '');
        let tagDesc = (StringManager.data.TAG_DESC as any)[tag];
        if (tagDesc) {
          highlights += '* ' + tagDesc + '\n';
        }
      });
      if (highlights.length > 0) {
        str += '\n\n<h>' + highlights;
      }
      if (str.charAt(str.length - 1) === '\n') {
        str = str.substr(0, str.length - 1);
      }
      str += '\n';
      str += '<line>';
      str += '<b>Cost:<n> ' + item.cost + 'g';
      return str;
    }

    item.tags.forEach((tag, i, a) => {
      str += tag + ((i < a.length - 1) ? ', ' : '');
      let tagDesc = (StringManager.data.TAG_DESC as any)[tag];
      if (tagDesc) {
        highlights += '* ' + tagDesc + '\n';
      }
    });

    str += '\n';

    if (item.stats) {
      str += '\n';
      str += StringManager.makeStatDescription(item.stats);
    }

    if (item.triggers) {
      str += '\n';
      item.triggers.forEach(trigger => {
        str += StringManager.makeEffectDescription(trigger) + '\n';
        let effectDesc = (StringManager.data.EFFECT_DESC as any)[trigger.name];
        if (effectDesc) {
          highlights += '* ' + effectDesc + '\n';
        }
      });
    }

    if (item.action) {
      str += '\n';
      str += StringManager.makeActionDescription(item.action) + '\n';
      if (item.action.effects) {
        item.action.effects.forEach(effect => {
          let effectDesc = (StringManager.data.EFFECT_DESC as any)[effect.name];
          if (effectDesc) {
            highlights += '* ' + effectDesc + '\n';
          }
        });
      }
    }

    if (highlights.length > 0) {
      str += '<h>' + highlights;
    }

    str += '<line>';
    str += '<b>Cost:<n> ' + item.cost + 'g';

    return str;
  },
  makeSkillDescription: (skill: ISkill): string => {
    let str = '';
    let highlights = '';

    str += StringManager.data.SKILL_DESC[skill.slug] + '\n\n';
    str += 'Level ' + skill.level + '\n';
    str += '\n';

    if (skill.stats) {
      str += '\n';
      str += StringManager.makeStatDescription(skill.stats);
    }
    if (skill.action) {
      str += '\n';
      str += StringManager.makeActionDescription(skill.action) + '\n';
      if (skill.action.effects) {
        skill.action.effects.forEach(effect => {
          let effectDesc = (StringManager.data.EFFECT_DESC as any)[effect.name];
          if (effectDesc) {
            highlights += '* ' + effectDesc + '\n';
          }
        });
      }
    }
    if (skill.triggers) {
      skill.triggers.forEach(trigger => {
        str += StringManager.makeEffectDescription(trigger) + '\n';
        let effectDesc = (StringManager.data.EFFECT_DESC as any)[trigger.name];
        if (effectDesc) {
          highlights += '* ' + effectDesc + '\n';
        }
      });
    }

    if (highlights.length > 0) {
      str += '<h>' + highlights;
    }

    return str;
  },

  makeStatDescription: (stats: StatMap): string => {
    let str = '';
    stats.forEach(stat => {
      if (stat.tag) {
        str += '<b>' + stat.tag + ' ' + stat.stat + ':<n> ';
      } else {
        str += '<b>' + stat.stat + ':<n> ';
      }
      if (StatDisplay[stat.stat] === 'percent') {
        str += String(Math.round(stat.value * 100) + '%');
      } else {
        if (stat.value < 10 && stat.value !== Math.round(stat.value)) {
          str += String(Math.round(stat.value * 10) / 10);
        } else {
          str += String(Math.round(stat.value));
        }
      }
      str += '\n';
    });
    return str;
  },

  makeActionDescription: (action: IAction): string => {
    let str = '';
    if (action.userate) {
      str += Math.round(action.userate * 100) + '% ';
    }
    str += '<t>' + action.slug + '<n>';
    if (action.tags && action.tags.length > 0) {
      str += '\n';
      action.tags.forEach(tag => str += tag + ' ');
      str += '\n<tab>';
    }

    str += '\n<b>Cost:<n><tab>\n';
    _.forIn(action.costs, (val, key) => {
      str += '<b>' + key + ':<n> ' + val + '\n';
    });
    str += '</tab>';

    if (action.stats && _.size(action.stats) > 0) {
      str += '\n';
      _.forIn(action.stats, (stat, key) => {
        let percent = StatDisplay[key as BaseStat] === 'percent';
        str += '<b>' + key + ':<n> ' + _.round(stat * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
      });
    }

    if (action.effects && action.effects.length > 0) {
      str += '\n';
      action.effects.forEach(effect => {
        let effDesc = StringManager.makeEffectDescription(effect);
        if (effDesc && effDesc.length > 0) {
          str += effDesc + '\n';
        }
      });
    }
    str += '</tab>';

    return str;
  },
  makeProcessedActionDescription: (action: IAction, origin: StatModel): string => {
    let str = '';
    if (action.userate) {
      str += Math.round(action.userate * 100) + '% ';
    }
    str += '<b>' + action.slug + '<n>';

    let tags = action.tags.concat(action.source ? action.source.tags : []);

    if (tags && tags.length > 0) {
      str += '\n';
      tags.forEach(tag => str += tag + ' ');
      str += '\n\n';
      str += '<b>Cost:<n> ';
      if (action.costs.action) {
        str += '<b>action:<n> ' + action.costs.action * (1 - origin.getStat('efficiency', tags)) + ', ';
      }
      if (action.costs.mana) {
        str += '<b>mana:<n> ' + action.costs.action * (1 - origin.getStat('manacost', tags)) + ', ';
      }
      if (action.costs.health) {
        str += '<b>health:<n> ' + action.costs.action * (1 - origin.getStat('manacost', tags)) + ', ';
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
        str += '<b>hit:<n> ' + Math.round(hit) + '\n';
      }
      if (damage) {
        str += '<b>damage:<n> ' + Math.round(damage) + '\n';
      }
      if (critRate) {
        str += '<b>crit:<n> ' + Math.round(critRate * 100) + '% x' + critMult + '\n';
      }
      if (penetration) {
        str += '<b>penetration:<n> ' + Math.round(penetration * 100) + '%\n';
      }
    }

    let effects = (action.effects || []).concat(origin.getTriggersFor(['action', 'hit', 'crit', 'miss'], tags));

    if (effects && effects.length > 0) {
      str += '\n\n';
      effects.forEach(effect => str += '\n' + StringManager.makeEffectDescription(effect));
    }

    return str;
  },
  makeEffectDescription: (effect: IEffect): string => {
    let str = '';

    if (effect.trigger === 'crit') {
      str += 'On Crit: ';
    }

    if (effect.userate && effect.userate < 1) {
      str += Math.round(effect.userate * 100) + '% ';
    }

    if (effect.type === 'buff') {
      str += StringManager.makeBuffDescription(effect.buff);
    } else {
      if (effect.type === 'damage') {
        str += '<b>' + effect.name + ':<n> ';
        str += Math.round(effect.damage.value) + ' ' + Formula.getDamageTag(effect.damage.tags).substr(0, 1).toUpperCase();
      } else if (effect.type === 'clearBuff') {
        str += 'clears ' + effect.buffRemoved;
      } else if (effect.type === 'special') {
        str += '<b>' + effect.name + ':<n> ';
        if (effect.value) {
          str += Math.round(effect.value * 100);
        }
      }
    }

    return str;
  },

  makeBuffDescription: (buff: IBuff): string => {
    let str = '';

    str += buff.count + 'x ' + '<b>' + buff.name + '<n>';
    if (buff.type === 'action') {
      str += '\n<tab>';
      str += StringManager.makeActionDescription(buff.action);
      str += '\n</tab>';
    } else if (buff.type === 'damage') {
      str += ': ';
      str += Math.round(buff.damage.value) + Formula.getDamageTag(buff.damage.tags).substr(0, 1).toUpperCase();
    } else if (buff.type === 'stat') {
      str += '\n<tab>';
      if (buff.stats) {
        str += StringManager.makeStatDescription(buff.stats);
      }
      str += '\n</tab>';
    } else if (buff.type === 'trigger') {
      str += '\n<tab>';
      buff.triggers.forEach(trigger => {
        str += StringManager.makeEffectDescription(trigger) + '\n';
      });
      str += '</tab>';
    }

    return str;
  },
};

export const GibberishStringManager = _.cloneDeep(EnglishStringManager);

function gibberize(data: any) {
  _.forIn(data, ((value, key) => {
    if (_.isString(value)) {
      data[key] = _.shuffle(value.split('')).join('');
      // console.log('gib:', data.key, value);
    } else {
      data[key] = gibberize(value);
    }
  }));
  return data;
}

gibberize(GibberishStringManager.data);

export let StringManager = EnglishStringManager;
