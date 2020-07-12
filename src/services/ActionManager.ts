import * as _ from 'lodash';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { StatTag, AttackStats, DamageTag, StatMap, CompoundMap } from '../data/StatData';
import { RandomSeed } from './RandomSeed';
import { StatModel } from '../engine/stats/StatModel';
import { IAction, ActionType, ActionList, ActionSlug, IActionRaw } from '../data/ActionData';
import { IEffect, EffectList } from '../data/EffectData';
import { VitalType } from '../engine/stats/Vitals';
import { IBuff, BuffSlug, BuffList, BuffType } from '../data/BuffData';
import { IActiveBuff } from '../engine/sprites/BuffManager';
import { Formula } from './Formula';
import { DataConverter } from './DataConverter';

export const ActionManager = {
  chooseAction: (origin: SpriteModel, sprites: SpriteModel[], fighting: boolean, onBuffUpdate: (result: IBuffResult) => void): IActionResult => {
    if (fighting) {
      let target = ActionManager.chooseTarget(origin, sprites, null);
      let distance = Math.abs(origin.tile - target.tile);
      let actions = origin.stats.getActionList(distance);
      if (origin.buffs.hasBuff('rushed')) {
        actions = _.filter(actions, data => (data.slug === 'strike' || data.slug === 'idle'));
      }
      let action = actions[0];

      return processAction(action, origin, target, sprites, onBuffUpdate);
    } else {
      let actions = origin.stats.getActionList('b');
      actions = _.filter(actions, data => {
        if (data.costs) {
          if (data.costs.health > 0 && data.costs.health > origin.vitals.getVital('health')) {
            return false;
          }
          if (data.costs.mana > 0 && data.costs.mana > origin.vitals.getVital('mana')) {
            return false;
          }

          return true;
        }
      });

      let action = actions[0];

      return processAction(action, origin, null, sprites, onBuffUpdate);
    }
  },

  chooseTarget: (origin: SpriteModel, sprites: SpriteModel[], action?: any) => {
    return _.find(sprites, sprite => sprite !== origin);
  },

  finishAction: (result: IActionResult, others: SpriteModel[]) => {
    if (result.costs.health) {
      result.origin.vitals.addCount('health', -result.costs.health);
    }
    if (result.costs.mana) {
      result.origin.vitals.addCount('mana', -result.costs.mana);
    }
    if (result.costs.action) {
      result.origin.vitals.addCount('action', -result.costs.action);
    }

    if (result.removeBuff) {
      result.removeBuff.forEach(data => {
        data.sprite.buffs.expendBuff(data.buff);
      });
    }
    if (result.addBuff) {
      result.addBuff.forEach(data => {
        data.sprite.buffs.addBuff(data.buff);
      });
    }
    if (result.defended) {

    }
    if (result.vitalChange) {
      result.vitalChange.forEach(data => {
        data.sprite.vitals.addCount(data.vital, -data.value);
      });
    }
    if (result.positionChange) {
      result.positionChange.forEach(data => {
        data.sprite.tile += data.value;
      });
    }
    if (result.chain) {

    }
  },
};

let makeBuff = (buff: IBuff, action: IAction, result: IActionResult, target: SpriteModel, others: SpriteModel[], onBuffUpdate: (result: IBuffResult) => void): IActiveBuff => {
  let onAdd: () => void;
  let onTick: () => void;
  let onRemove: () => void;

  if (buff.damage) {
    let tags = buff.damage.tags;
    let power = result.origin.stats.getBaseStat('power', tags) / 100;
    let resist = target.stats.getBaseStat('resist', tags);
    let damage = buff.damage.value * power * (1 - resist);
    onTick = () => {
      target.vitals.addCount('health', -damage);
      onBuffUpdate({name: buff.name, type: buff.type, origin: target, vitalChange: [{ sprite: target, vital: 'health', tag: getDamageTag(tags), value: damage }]});
    };
  }
  if (buff.baseStats || buff.compoundStats) {
    onAdd = () => {
      target.stats.addStatMap(buff.baseStats, buff.compoundStats);
      onBuffUpdate({name: buff.name, type: buff.type, origin: target, baseStatChange: [{ sprite: target, stats: buff.baseStats }], compoundStatChange: [{sprite: target, stats: buff.compoundStats}]});
    };

    onRemove = () => {
      target.stats.removeStatMap(buff.baseStats, buff.compoundStats);
      onBuffUpdate({name: buff.name, type: buff.type, origin: target, baseStatChange: [{ sprite: target, stats: buff.baseStats }], compoundStatChange: [{sprite: target, stats: buff.compoundStats}]});
    };
  }

  if (buff.action) {
    let buffAction = buff.action;
    onAdd = () => {
      target.stats.addAction(buffAction);
    };
    onRemove = () => {
      target.stats.removeAction(buffAction);
    };
  }

  return {
    source: buff,
    remaining: buff.count,
    timer: 0,
    onAdd,
    onTick,
    onRemove,
  };
};

let applyEffect = (effect: IEffect, action: IAction, result: IActionResult, target: SpriteModel, others: SpriteModel[], onBuffUpdate: (result: IBuffResult) => void) => {
  let mainDamage = _.sumBy(_.filter(result.vitalChange, { source: action }), 'value') || 0;
  if (effect.type === 'buff') {
    let buff = effect.buff;
    if (!result.addBuff) {
      result.addBuff = [];
    }

    result.addBuff.push({sprite: target, buff: makeBuff(buff, action, result, target, others, onBuffUpdate), source: effect});
  } else if (effect.type === 'special') {
    switch (effect.name) {
      case 'lifesteal': {
        if (mainDamage <= 0) break;
        let stealPercent = effect.value;
        let stealAmount = mainDamage * stealPercent;
        if (!result.vitalChange) {
          result.vitalChange = [];
        }
        result.vitalChange.push({ sprite: result.origin, vital: 'health', value: -stealAmount, tag: 'Physical', source: effect });
        break;
      }
      case 'walk': case 'approach': {
        let positionChange = _.map(_.filter(others, { player: false }), sprite => ({ sprite, value: -1, source: null }));
        result.positionChange = result.positionChange ? _.concat(result.positionChange, positionChange) : positionChange;
        break;
      }
    }
  }
};

let processAction = (action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[], onBuffUpdate: (result: IBuffResult) => void): IActionResult => {
  let result: IActionResult;

  if (action.type === 'walk' || action.type === 'self') {
     result = makeSelfResult(action, origin, origin, others, onBuffUpdate);
  } else if (action.type === 'attack') {
    result = makeAttackResult(action, origin, target, others, onBuffUpdate);
  }

  let actionBuffs = origin.buffs.getActionBuffs();
  if (actionBuffs.length > 0) {
    result.removeBuff = _.map(actionBuffs, data => ({sprite: origin, buff: data.source.name, source: action}));
  }

  return result;
};

function makeSelfResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[], onBuffUpdate: (result: IBuffResult) => void): IActionResult {
  let tags: StatTag[];
  if (action.source) {
    tags = _.concat(action.tags, action.source.tags);
  } else {
    tags = action.tags;
  }

  let result: IActionResult = {
    name: action.slug,
    type: action.type,
    source: action,
    origin,
    costs: {},
  };

  let effects = action.effects;
  effects && effects.forEach(effect => applyEffect(effect, action, result, origin, others, onBuffUpdate));

  return result;
}

function makeAttackResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[], onBuffUpdate: (result: IBuffResult) => void): IActionResult {
  let tags: StatTag[];
  if (action.source) {
    tags = _.concat(action.tags, action.source.tags);
  } else {
    tags = action.tags;
  }

  let hit = origin.stats.getBaseStat('hit', tags, action.stats.hit);
  let avoid = target.stats.getBaseStat('avoid', tags);
  let effects: IEffect[];
  let result: IActionResult;

  if (RandomSeed.general.getRaw() > (hit - avoid)) {
    effects = _.filter(action.effects, effect => (effect.trigger === 'avoid' || effect.trigger === 'all'));
    result = {
      name: action.slug + ' - Miss!',
      type: action.type,
      source: action,
      costs: action.costs,
      origin,
      defended: [{ sprite: target, source: action, type: 'Dodge' }],
    };
  } else {
    let damage = getAttackDamage(origin.stats, target.stats, tags, action.stats);
    effects = _.filter(action.effects, effect => (effect.trigger === 'hit' || effect.trigger === 'all'));

    result = {
      name: action.slug,
      type: action.type,
      costs: action.costs,
      source: action,
      origin,
      vitalChange: [{ sprite: target, vital: 'health', value: damage, source: action, tag: getDamageTag(tags), critical: _.includes(tags, 'Critical') }],
    };
  }

  effects.forEach(effect => applyEffect(effect, action, result, target, others, onBuffUpdate));

  return result;
}

function getDamageTag(tags: StatTag[]): DamageTag {
  return _.filter(tags, tag => {
    return (tag === 'Physical' || tag === 'Magical' || tag === 'Chemical' || tag === 'Holy' || tag === 'Dark');
  })[0] as DamageTag;
}

function getAttackDamage(origin: StatModel, target: StatModel, tags: StatTag[], actionStats: Partial<AttackStats>): number {
  let crit = origin.getBaseStat('critRate', tags, actionStats.critRate);
  let critD = target.getBaseStat('devaluation', ['Critical']);

  let baseDamage = origin.getBaseStat('baseDamage', tags, actionStats.baseDamage);
  let power = origin.getBaseStat('power', tags, actionStats.power) / 100;
  let pen = origin.getBaseStat('penetration', tags, actionStats.penetration);
  let resist = target.getBaseStat('resist', tags);

  let critical = false;
  let criticalMult = 0;
  if (RandomSeed.general.getRaw() <= crit - critD) {
    let critMult = origin.getBaseStat('critMult', tags, actionStats.critMult);
    let critPen = origin.getBaseStat('penetration', ['Critical']);
    let critR = target.getBaseStat('resist', ['Critical']);

    critical = true;
    criticalMult = critMult * (1 + critPen - critR);
    tags.push('Critical');
  }

  return baseDamage * power * (1 + pen - resist) * (critical ? criticalMult : 1);
}

export interface IActionResult {
  name: string;
  type: ActionType;

  source: IAction;

  origin: SpriteModel;

  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };

  defended?: { sprite: SpriteModel, type: string, source: IEffect | IAction }[];
  vitalChange?: { sprite: SpriteModel, vital: VitalType, tag: DamageTag, value: number, source: IEffect | IAction, critical?: boolean }[];
  addBuff?: { sprite: SpriteModel, buff: IActiveBuff, source: IEffect }[];
  removeBuff?: { sprite: SpriteModel, buff: BuffSlug, source: IEffect | IAction }[];
  positionChange?: { sprite: SpriteModel, value: number, source: IEffect }[];
  chain?: IActionResult;
}

export interface IBuffResult {
  name: string;
  type: BuffType;

  origin: SpriteModel;
  vitalChange?: { sprite: SpriteModel, vital: VitalType, tag: DamageTag, value: number }[];
  addBuff?: { sprite: SpriteModel, buff: IActiveBuff }[];
  removeBuff?: { sprite: SpriteModel, buff: BuffSlug }[];
  positionChange?: { sprite: SpriteModel, value: number }[];
  baseStatChange?: { sprite: SpriteModel, stats: StatMap }[];
  compoundStatChange?: { sprite: SpriteModel, stats: CompoundMap }[];
}
