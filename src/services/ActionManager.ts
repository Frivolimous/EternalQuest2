import * as _ from 'lodash';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { StatTag, SimpleStats, AttackStats, DamageTag } from '../data/StatData';
import { RandomSeed } from './RandomSeed';
import { StatModel } from '../engine/stats/StatModel';
import { IAction, ActionList, ActionType } from '../data/ActionData';
import { IEffect } from '../data/EffectData';
import { VitalType } from '../engine/stats/Vitals';

export const ActionManager = {
  chooseAction: (origin: SpriteModel, sprites: SpriteModel[], fighting: boolean): IActionResult => {
    if (fighting) {
      let target = ActionManager.chooseTarget(origin, sprites, null);
      let distance = Math.abs(origin.tile - target.tile);
      let actions = origin.stats.getActionList(distance);
      let action = actions[0];

      return processAction(action, origin, target, sprites);
    } else {
      let actions = origin.stats.getActionList('between');
      let action = actions[0];
      return processAction(action, origin, null, sprites);
    }
  },

  chooseTarget: (origin: SpriteModel, sprites: SpriteModel[], action?: any) => {
    return _.find(sprites, sprite => sprite !== origin);
  },

  finishAction: (result: IActionResult, others: SpriteModel[]) => {
    if (result.costs.health) {
      result.origin.addHealth(-result.costs.health);
    }
    if (result.costs.mana) {
      result.origin.addMana(-result.costs.mana);
    }
    if (result.costs.action) {
      result.origin.addAction(-result.costs.action);
    }

    if (result.removeBuff) {

    }
    if (result.addBuff) {

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

let applyEffect = (effect: IEffect, action: IAction, result: IActionResult, others: SpriteModel[]) => {
  let mainDamage = _.sumBy(_.filter(result.vitalChange, { source: action }), 'value') || 0;
  if (effect.type === 'special') {
    switch (effect.name) {
      case 'lifesteal': {
        if (mainDamage <= 0) break;
        let stealPercent = effect.values;
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

let processAction = (action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult => {
  if (action.type === 'walk') {
    return makeBasicResult(action, origin, target, others);
  } else if (action.type === 'attack') {
    return makeAttackResult(action, origin, target, others);
  }
};

function makeBasicResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult {
  let tags: StatTag[];
  if (action.source) {
    tags = _.concat(action.tags, action.source.tags);
  } else {
    tags = action.tags;
  }

  let result = {
    name: action.slug,
    type: action.type,
    origin,
    costs: {},
  };

  let effects = action.effects;
  effects.forEach(effect => applyEffect(effect, action, result, others));
  return result;

  //   return {
  //     name: action.slug,
  //     type: action.type,
  //     origin,
  //     positionChange,
  //     costs: {},
  //   };

}

function makeAttackResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult {
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
      origin,
      vitalChange: [{ sprite: target, vital: 'health', value: damage, source: action, tag: getDamageTag(tags) }],
    };
  }

  effects.forEach(effect => applyEffect(effect, action, result, others));

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

  let critical = false;
  let criticalMult = 0;
  if (RandomSeed.general.getRaw() <= crit - critD) {
    let critMult = origin.getBaseStat('critMult', tags, actionStats.critMult);
    let critPen = origin.getBaseStat('penetration', ['Critical']);
    let critR = target.getBaseStat('resist', ['Critical']);

    critical = true;
    criticalMult = critMult * (1 + critPen - critR);
  }

  let baseDamage = origin.getBaseStat('baseDamage', tags, actionStats.baseDamage);
  let power = origin.getBaseStat('power', tags, actionStats.power) / 100;
  let pen = origin.getBaseStat('penetration', tags, actionStats.penetration);
  let resist = target.getBaseStat('resist', tags);

  return baseDamage * power * (1 + pen - resist) * (critical ? criticalMult : 1);
}

export interface IActionResult {
  name: string;
  type: ActionType;

  origin: SpriteModel;

  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };

  defended?: { sprite: SpriteModel, type: string, source: IEffect | IAction }[];
  vitalChange?: { sprite: SpriteModel, vital: VitalType, tag: DamageTag, value: number, source: IEffect | IAction }[];
  addBuff?: { sprite: SpriteModel, buff: string, source: IEffect }[];
  removeBuff?: { sprite: SpriteModel, buff: string, source: IEffect }[];
  positionChange?: { sprite: SpriteModel, value: number, source: IEffect }[];
  chain?: IActionResult;
}
