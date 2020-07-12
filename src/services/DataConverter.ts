import * as _ from 'lodash';

import { ItemSlug, ItemList, IItem, IItemRaw } from '../data/ItemData';
import { ActionManager } from './ActionManager';
import { Formula } from './Formula';
import { IAction, ActionSlug, ActionList, IActionRaw } from '../data/ActionData';
import { EffectList, EffectSlug, IEffect, IEffectRaw } from '../data/EffectData';
import { BuffSlug, BuffList, IBuff, IBuffRaw } from '../data/BuffData';

export const DataConverter = {
  getItem: (slug: ItemSlug, level: number): IItem => {
    let raw: IItemRaw;
    if (_.isString(slug)) {
      raw = _.find(ItemList, {slug});
    } else {
      raw = slug;
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
