import * as _ from 'lodash';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { IAnimateAction } from './GameEvents';
import { StatTag, BaseStats, BaseStat, SimpleStats } from '../data/StatData';
import { RandomSeed } from './RandomSeed';
import { StatModel } from '../engine/stats/StatModel';

export const ActionManager = {
  chooseTarget: (attacker: SpriteModel, sprites: SpriteModel[], action?: any) => {
    return _.find(sprites, sprite => sprite !== attacker);
  },
  chooseAction: (attacker: SpriteModel, target: SpriteModel): IAction => {
    if (target === null) {
      return {
        name: 'Walk',
        type: 'walk',
        tags: [],
        source: {
          tags: [],
        },
        stats: {},
        costs: {
          action: 100,
        },
      };
    }

    let action: IAction = {
      name: 'Weapon!',
      type: 'attack',
      tags: ['Physical'],
      source: {
        tags: ['Weapon', 'Melee'],
      },
      stats: {
        baseDamage: 5,
        hit: 10,
      },
      costs: {
        action: 100,
      },
    };

    return action;
  },
  processAction: (attacker: SpriteModel, target: SpriteModel, action: IAction): IActionResult => {
    return makeAttackResult(attacker, target, action);
  },

  finishAction: (attacker: SpriteModel, target: SpriteModel, others: SpriteModel[], result: IActionResult) => {
    if (result.type === 'walk') {
      others.forEach(other => (other !== attacker) ? other.tile-- : null);
    } else if (result.type === 'attack') {
      target.addHealth(-result.value);
      if (result.costs.health) {
        attacker.addHealth(-result.costs.health);
      }
      if (result.costs.mana) {
        attacker.addMana(-result.costs.mana);
      }
      if (result.costs.action) {
        attacker.addAction(-result.costs.action);
      }
    }
  },
};

function makeAttackResult(attacker: SpriteModel, target: SpriteModel, action: IAction): IActionResult {
  if (action.type === 'walk') {
    return {
      name: 'walk',
      type: 'walk',
      value: 0,
      success: true,
      tags: [],
      effects: ['walk'],
      costs: {},
    };
  }
  let tags = _.concat(action.tags, action.source.tags);

  let hit = attacker.stats.getBaseStat('hit', tags, action.stats.hit);
  let avoid = target.stats.getBaseStat('avoid', tags);

  if (RandomSeed.general.getRaw() > (hit - avoid)) {
    return {
      name: action.name + ' - Miss!',
      type: action.type,
      value: 0,
      success: false,
      costs: action.costs,
      tags,
      effects: [],
    };
  }

  let damage = getAttackDamage(attacker.stats, target.stats, tags, action.stats);

  return {
    name: action.name,
    type: action.type,
    value: damage,
    success: true,
    costs: action.costs,
    tags,
    effects: [],
  };
}

function getAttackDamage(attacker: StatModel, target: StatModel, tags: StatTag[], action: Partial<SimpleStats>) {
  let crit = attacker.getBaseStat('critRate', tags, action.critRate);
  let critD = target.getBaseStat('devaluation', ['Critical']);

  let critical = false;
  let criticalMult = 0;
  if (RandomSeed.general.getRaw() <= crit - critD) {
    let critMult = attacker.getBaseStat('critMult', tags, action.critMult);
    let critPen = attacker.getBaseStat('penetration', ['Critical']);
    let critR = target.getBaseStat('resist', ['Critical']);

    critical = true;
    criticalMult = critMult * (1 + critPen - critR);
  }

  let baseDamage = attacker.getBaseStat('baseDamage', tags, action.baseDamage);
  let power = attacker.getBaseStat('power', tags, action.power) / 100;
  let pen = attacker.getBaseStat('penetration', tags, action.penetration);
  let resist = target.getBaseStat('resist', tags, action.resist);

  return baseDamage * power * (1 + pen - resist) * (critical ? criticalMult : 1);
}

export interface IAction {
  name: string;
  type: 'attack' | 'walk';
  tags: StatTag[];
  source: {
    tags: StatTag[];
  };
  stats: Partial<SimpleStats>;
  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };
}

export interface IActionResult {
  name: string;
  type: 'attack' | 'walk';
  value: number;
  success: boolean;
  tags: StatTag[];
  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };
  effects: string[];

  chain?: IActionResult;
}
