import * as _ from 'lodash';

import { ItemSlug, ItemList, IItem, IItemRaw, EnchantSlug, EnchantList, IEnchantRaw, ItemScrollSlugs } from '../data/ItemData';
import { Formula } from './Formula';
import { IAction, ActionSlug, ActionList, IActionRaw } from '../data/ActionData';
import { EffectList, EffectSlug, IEffect, IEffectRaw } from '../data/EffectData';
import { BuffSlug, BuffList, IBuff, IBuffRaw } from '../data/BuffData';
import { AttackStat } from '../data/StatData';
import { ISkill, ISkillRaw, SkillSlug, SkillList } from '../data/SkillData';
import { EnemySlug, IEnemyRaw, IEnemy, EnemyList } from '../data/EnemyData';
import { ItemManager } from './ItemManager';

export const DataConverter = {
  getItem: (slug: ItemSlug | IItemRaw, level: number, enchantSlug?: EnchantSlug | EnchantSlug[], charges?: number, scrollOf?: ItemSlug): IItem => {

    let raw: IItemRaw;
    if (_.isString(slug)) {
      if (slug === 'Scroll') {
        return DataConverter.getItemScroll(slug, level, enchantSlug, charges, scrollOf);
      }
      raw = _.find(ItemList, {slug});
    } else {
      if (slug.slug === 'Scroll') {
        return DataConverter.getItemScroll(slug, level, enchantSlug, charges, scrollOf);
      }
      raw = slug;
      slug = raw.slug;
    }

    let m: IItem = {
      name: slug,
      slug,
      level,
      tags: _.clone(raw.tags),
      cost: raw.cost,
      maxCharges: raw.charges,
      charges: raw.charges,
    };

    if (raw.stats) {
      m.stats = Formula.statLevelMapToStatMap(raw.stats, level);
    }
    if (raw.action) {
      m.action = DataConverter.getAction(raw.action, level);
      m.action.source = m;
    }
    if (raw.triggers) {
      m.triggers = _.map(raw.triggers, trigger => DataConverter.getEffect(trigger, level));
    }

    if (enchantSlug) {
      if (_.isArray(enchantSlug)) {
        enchantSlug.forEach(es => DataConverter.applyEnchantment(m, es));
      } else {
        DataConverter.applyEnchantment(m, enchantSlug);
      }
    }

    if (charges || charges === 0) {
      m.charges = charges;
    }
    return m;
  },

  getItemScroll: (slug: ItemSlug | IItemRaw, level: number, enchantSlug?: EnchantSlug | EnchantSlug[], charges?: number, scrollOf?: ItemSlug): IItem => {
    let raw: IItemRaw;
    if (_.isString(slug)) {
      raw = _.find(ItemList, {slug});
    } else {
      raw = slug;
      slug = raw.slug;
    }

    if (!scrollOf) {
      scrollOf = _.sample(ItemScrollSlugs);
    }

    let src = DataConverter.getItem(_.find(ItemList, {slug: scrollOf}), Math.floor(level * 1.25));

    let m: IItem = {
      name: src.slug + ' Scroll',
      slug,
      level,
      tags: _.clone(raw.tags).concat(src.tags.filter(tag => tag !== 'Equipment')),
      cost: src.cost * 0.5,
      stats: src.stats,
      action: src.action,
      triggers: src.triggers,
      maxCharges: raw.charges,
      charges: raw.charges,
    };

    if (m.action) {
      m.action.source = m;
      m.action.costs.mana *= 0.5;
    }

    if (enchantSlug) {
      if (_.isArray(enchantSlug)) {
        enchantSlug.forEach(es => DataConverter.applyEnchantment(m, es));
      } else {
        DataConverter.applyEnchantment(m, enchantSlug);
      }
    }

    if (charges || charges === 0) {
      m.charges = charges;
    }
    return m;
  },

  applyEnchantment: (item: IItem, enchantSlug: EnchantSlug | IEnchantRaw) => {
    let raw: IEnchantRaw;
    if (_.isString(enchantSlug)) {
      raw = _.find(EnchantList, {slug: enchantSlug});
    } else {
      raw = enchantSlug;
      enchantSlug = raw.slug;
    }

    if (!item.enchantSlug) {
      item.enchantSlug = [enchantSlug];
    } else {
      item.enchantSlug.push(enchantSlug);
    }

    item.name = enchantSlug + ' ' + item.name;

    item.cost *= raw.costMult;

    if (raw.tags) {
      raw.tags.forEach(tag => {
        if (item.tags.includes(tag)) {
          item.tags.push(tag);
        }
      });
    }

    if (raw.removeTags) {
      raw.removeTags.forEach(tag => {
        _.pull(item.tags, tag);
      });
    }

    if (raw.stats) {
      if (!item.stats) {
        item.stats = [];
      }
      let stats = Formula.statLevelMapToStatMap(raw.stats, item.level);
      stats.forEach(stat => {
        let existing = _.find(item.stats, stat2 => stat2.stat === stat.stat && stat2.tag === stat.tag);
        if (existing) {
          existing.value += stat.value;
        } else {
          item.stats.push(stat);
        }
      });
    }

    if (raw.triggers) {
      item.triggers = _.concat(item.triggers || [], _.map(raw.triggers, trigger => DataConverter.getEffect(trigger, item.level)));
    }

    if (raw.action) {
      if (item.action) {
        if (raw.action.tags) {
          raw.action.tags.forEach(tag => {
            if (item.action.tags.includes(tag)) {
              item.action.tags.push(tag);
            }
          });
        }

        if (raw.action.removeTags) {
          raw.action.removeTags.forEach(tag => {
            _.pull(item.action.tags, tag);
          });
        }

        if (raw.action.stats) {
          let actionStats = _.mapValues(raw.action.stats, (value) => Formula.statLevelToStat(value, item.level));

          _.forIn(actionStats, (value, key) => {
            if (item.action.stats[key as AttackStat]) {
              item.action.stats[key as AttackStat] += value;
            } else {
              item.action.stats[key as AttackStat] = value;
            }
          });
        }

        if (raw.action.effects) {
          let effects = _.map(raw.action.effects, effect => DataConverter.getEffect(effect, item.level));
          item.action.effects = _.concat(item.action.effects || [], effects);
        }

        if (raw.action.costs) {
          let costs = _.mapValues(raw.action.costs, value => Formula.statLevelToStat(value, item.level));

          _.forIn(costs, (value, key) => (item.action.costs as any)[key] += value);
        }
      } else {
        if (item.tags.includes('Unarmed')) {
          if (raw.action.stats) {
            let actionStats = _.mapValues(raw.action.stats, (value) => Formula.statLevelToStat(value, item.level));
            if (!item.stats) {
              item.stats = [];
            }
            for (let key of Object.keys(actionStats)) {
              item.stats.push({stat: key as AttackStat, tag: 'Unarmed', value: actionStats[key as AttackStat]});
            }
          }

          if (raw.action.effects) {
            let effects = _.map(raw.action.effects, effect => DataConverter.getEffect(effect, item.level));
            if (!item.triggers) {
              item.triggers = [];
            }
            item.triggers = (item.triggers || []).concat(effects.map(effect => {
              effect.triggerTags = (effect.triggerTags || []).concat('Unarmed');
              return effect;
            }));
          }
        } else {
          if (raw.action.stats) {
            let actionStats = _.mapValues(raw.action.stats, (value) => Formula.statLevelToStat(value, item.level));
            if (!item.stats) {
              item.stats = [];
            }
            for (let key of Object.keys(actionStats)) {
              item.stats.push({stat: key as AttackStat, tag: 'Weapon', value: actionStats[key as AttackStat]});
            }
          }

          if (raw.action.effects) {
            let effects = _.map(raw.action.effects, effect => DataConverter.getEffect(effect, item.level));
            if (!item.triggers) {
              item.triggers = [];
            }
            item.triggers = (item.triggers || []).concat(effects.map(effect => {
              effect.triggerTags = (effect.triggerTags || []).concat('Weapon');
              return effect;
            }));
          }
        }
      }
    }

    if (raw.chargeMult) {
      if (raw.chargeMult === Infinity) {
        item.charges = undefined;
        item.maxCharges = undefined;
      } else {
        item.maxCharges *= Formula.statLevelToStat(raw.chargeMult, item.level);
        item.charges = item.maxCharges;
      }
    }

    return item;
  },

  getEnemy: (slug: EnemySlug | IEnemyRaw, level: number): IEnemy => {
    let raw: IEnemyRaw;
    if (_.isString(slug)) {
      raw = _.find(EnemyList, {slug});
    } else {
      raw = slug;
      slug = raw.slug;
    }

    let m: IEnemy = {
      name: slug,
      slug,
      level,
      cosmetics: raw.cosmetics,
    };

    if (raw.stats) {
      m.stats = Formula.statLevelMapToStatMap(raw.stats, level);
    }
    if (raw.actions) {
      m.actions = _.map(raw.actions, action => DataConverter.getAction(action, level));
    }
    if (raw.triggers) {
      m.triggers = _.map(raw.triggers, trigger => DataConverter.getEffect(trigger, level));
    }

    if (raw.equipment) {
      m.equipment = _.map(raw.equipment, item => ItemManager.loadItem(item));
    }

    return m;
  },

  getSkill: (slug: SkillSlug | ISkillRaw, level: number): ISkill => {
    let raw: ISkillRaw;
    if (_.isString(slug)) {
      raw = _.find(SkillList, {slug});
    } else {
      raw = slug;
      slug = raw.slug;
    }

    let m: ISkill = {
      name: slug,
      slug,
      level,
    };

    if (raw.stats) {
      m.stats = Formula.statLevelMapToStatMap(raw.stats, level);
    }
    if (raw.action) {
      m.action = DataConverter.getAction(raw.action, level);
    }
    if (raw.triggers) {
      m.triggers = _.map(raw.triggers, trigger => DataConverter.getEffect(trigger, level));
    }

    return m;
  },

  getAction: (slug: ActionSlug | IActionRaw, level: number): IAction => {
    let raw: IActionRaw;
    if (_.isString(slug)) {
      raw = _.find(ActionList, {slug});
    } else {
      raw = slug;
    }

    let m: IAction = {
      slug: raw.slug,
      level,
      type: raw.type,
      tags: _.clone(raw.tags),
      distance: _.clone(raw.distance),
      costs: _.mapValues(raw.costs, value => Formula.statLevelToStat(value, level)),
    };

    if (raw.userate) {
      m.userate = Formula.statLevelToStat(raw.userate, level);
    }

    if (raw.effects) {
      m.effects = _.map(raw.effects, effect => DataConverter.getEffect(effect, level));
    }

    if (raw.stats) {
      m.stats = _.mapValues(raw.stats, (value) => Formula.statLevelToStat(value, level));
    }
    if (raw.heals) {
      m.heals = _.mapValues(raw.heals, value => Formula.statLevelToStat(value, level));
    }

    return m;
  },

  getBuff(slug: BuffSlug | IBuffRaw, level: number): IBuff {
    let raw: IBuffRaw;
    if (_.isString(slug)) {
      raw = _.find(BuffList, {slug});
    } else {
      raw = slug;
    }

    let m: IBuff = {
      name: raw.slug,
      type: raw.type,
      clearType: raw.clearType,
      count: Formula.statLevelToStat(raw.count, level),
    };

    if (raw.duration) {
      m.duration = Formula.statLevelToStat(raw.duration, level);
    }

    if (raw.stats) {
      m.stats = Formula.statLevelMapToStatMap(raw.stats, level);
    }

    if (raw.action) {
      m.action = DataConverter.getAction(raw.action, level);
    }

    if (raw.damage) {
      m.damage = { value: Formula.statLevelToStat(raw.damage.value, level), tags: _.clone(raw.damage.tags)};
    }

    if (raw.triggers) {
      m.triggers = _.map(raw.triggers, trigger => DataConverter.getEffect(trigger, level));
    }

    return m;
  },

  getEffect(slug: EffectSlug | IEffectRaw, level: number): IEffect {
    let raw: IEffectRaw;
    if (_.isString(slug)) {
      raw = _.find(EffectList, {slug});
    } else {
      raw = slug;
    }

    let m: IEffect = {
      name: raw.slug,
      type: raw.type,
      trigger: raw.trigger,
      level,
      target: raw.target,
    };

    if (raw.userate || raw.userate === 0) {
      m.userate = Formula.statLevelToStat(raw.userate, level);
    }

    if (raw.value) {
      m.value = Formula.statLevelToStat(raw.value, level);
    }

    if (raw.buff) {
      m.buff = DataConverter.getBuff(raw.buff, level);
    }

    if (raw.triggerTags) {
      m.triggerTags = _.clone(raw.triggerTags);
    }

    if (raw.damage) {
      m.damage = { value: Formula.statLevelToStat(raw.damage.value, level), tags: _.clone(raw.damage.tags)};
    }

    if (raw.buffRemoved) {
      m.buffRemoved = raw.buffRemoved;
    }

    return m;
  },
};
