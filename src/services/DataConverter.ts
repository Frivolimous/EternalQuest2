import * as _ from 'lodash';

import { ItemSlug, ItemList, IItem, IItemRaw, EnchantSlug, EnchantList, IEnchantRaw } from '../data/ItemData';
import { ActionManager } from './ActionManager';
import { Formula } from './Formula';
import { IAction, ActionSlug, ActionList, IActionRaw } from '../data/ActionData';
import { EffectList, EffectSlug, IEffect, IEffectRaw } from '../data/EffectData';
import { BuffSlug, BuffList, IBuff, IBuffRaw } from '../data/BuffData';
import { AttackStats, AttackStat } from '../data/StatData';
import { ISkillPage } from '../components/skill/SkillPage';
import { ISkill, ISkillRaw, SkillSlug, SkillList } from '../data/SkillData';
import { EnemySlug, IEnemyRaw, IEnemy, EnemyList } from '../data/EnemyData';
import { ItemManager } from './ItemManager';

export const DataConverter = {
  getItem: (slug: ItemSlug | IItemRaw, level: number, enchantSlug?: EnchantSlug | EnchantSlug[]): IItem => {
    let raw: IItemRaw;
    if (_.isString(slug)) {
      raw = _.find(ItemList, {slug});
    } else {
      raw = slug;
      slug = raw.slug;
    }

    let m: IItem = {
      name: slug,
      slug,
      level,
      tags: _.clone(raw.tags),
    };

    if (raw.baseStats) {
      m.baseStats = Formula.statLevelMapToStatMap(raw.baseStats, level);
    }
    if (raw.compoundStats) {
      m.compoundStats = Formula.compoundLevelMapToStatMap(raw.compoundStats, level);
    }
    if (raw.action) {
      m.action = DataConverter.getAction(raw.action, level);
      m.action.source = m;
    }

    if (enchantSlug) {
      if (_.isArray(enchantSlug)) {
        enchantSlug.forEach(es => DataConverter.applyEnchantment(m, es));
      } else {
        DataConverter.applyEnchantment(m, enchantSlug);
      }
    }

    return m;
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
      triggers: raw.triggers,
    };

    if (raw.baseStats) {
      m.baseStats = Formula.statLevelMapToStatMap(raw.baseStats, level);
    }
    if (raw.compoundStats) {
      m.compoundStats = Formula.compoundLevelMapToStatMap(raw.compoundStats, level);
    }
    if (raw.actions) {
      m.actions = _.map(raw.actions, action => DataConverter.getAction(action, level));
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

    if (raw.baseStats) {
      m.baseStats = Formula.statLevelMapToStatMap(raw.baseStats, level);
    }
    if (raw.compoundStats) {
      m.compoundStats = Formula.compoundLevelMapToStatMap(raw.compoundStats, level);
    }
    if (raw.action) {
      m.action = DataConverter.getAction(raw.action, level);
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

    item.name = enchantSlug + ' ' + item.name;
    item.enchantSlug = enchantSlug;
    if (raw.tags) {
      item.tags = _.concat(item.tags, raw.tags);
    }

    if (raw.baseStats) {
      let baseStats = Formula.statLevelMapToStatMap(raw.baseStats, item.level);
      baseStats.forEach(stat => {
        let existing = _.find(item.baseStats, stat2 => stat2.stat === stat.stat && stat2.tag === stat.tag);
        if (existing) {
          existing.value += stat.value;
        } else {
          item.baseStats.push(stat);
        }
      });
    }
    if (raw.compoundStats) {
      let compoundStats = Formula.compoundLevelMapToStatMap(raw.compoundStats, item.level);
      compoundStats.forEach(stat => {
        let existing = _.find(item.compoundStats, stat2 => stat2.stat === stat.stat);
        if (existing) {
          existing.value += stat.value;
        } else {
          item.compoundStats.push(stat);
        }
      });
    }
    if (raw.triggers) {

    }

    if (raw.action) {
      if (raw.action.tags) {
        item.action.tags = _.concat(item.action.tags, raw.action.tags);
      }

      if (raw.action.stats) {
        let actionStats = _.mapValues(raw.action.stats, (value) => Formula.statLevelToStat(value, item.level));

        _.forIn(actionStats, (value, key) => {
          item.action.stats[key as AttackStat] += value;
        });
      }

      if (raw.action.effects) {
        let effects = _.map(raw.action.effects, effect => DataConverter.getEffect(effect, item.level));
        item.action.effects = _.concat(item.action.effects, effects);
      }

      if (raw.action.costs) {
        let costs = _.mapValues(raw.action.costs, value => Formula.statLevelToStat(value, item.level));

        _.forIn(costs, (value, key) => (item.action.costs as any)[key] += value);
      }
    }

    return item;
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

    if (raw.effects) {
      m.effects = _.map(raw.effects, effect => DataConverter.getEffect(effect, level));
    }

    if (raw.stats) {
      m.stats = _.mapValues(raw.stats, (value) => Formula.statLevelToStat(value, level));
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

    if (raw.baseStats) {
      m.baseStats = Formula.statLevelMapToStatMap(raw.baseStats, level);
    }
    if (raw.compoundStats) {
      m.compoundStats = Formula.compoundLevelMapToStatMap(raw.compoundStats, level);
    }

    if (raw.action) {
      m.action = DataConverter.getAction(raw.action, level);
    }

    if (raw.damage) {
      m.damage = { value: Formula.statLevelToStat(raw.damage.value, level), tags: _.clone(raw.damage.tags)};
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
      userate: Formula.statLevelToStat(raw.userate, level),
    };

    if (raw.value) {
      m.value = Formula.statLevelToStat(raw.value, level);
    }

    if (raw.buff) {
      m.buff = DataConverter.getBuff(raw.buff, level);
    }

    return m;
  },
};