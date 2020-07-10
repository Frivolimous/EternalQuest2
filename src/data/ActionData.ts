import * as _ from 'lodash';

import { StatTag, SimpleStats, AttackStats } from './StatData';
import { EffectList, IEffect } from './EffectData';

export type ActionSlug = 'strike' | 'walk' | 'approach' | 'idle' | 'magicMissile' | 'lifetap';
export type ActionType = 'attack' | 'walk' | 'self';

export const ActionList: {[key in ActionSlug]: IAction} = {
  idle: {
    slug: 'idle',
    type: 'self',
    distance: [1, 2, 3],
    costs: { action: 50},
    tags: [],
    stats: {},
  },
  strike: {
    slug: 'strike',
    type: 'attack',
    tags: ['Physical'],
    distance: [1],
    stats: {
      baseDamage: 5,
      hit: 10,
    },
    costs: {
      action: 100,
    },
  },
  magicMissile: {
    slug: 'magicMissile',
    type: 'attack',
    tags: ['Magical', 'Projectile'],
    distance: [1, 2],
    stats: {
      baseDamage: 20,
      hit: 30,
    },
    costs: {
      action: 100,
      mana: 10,
    },
  },
  lifetap: {
    slug: 'lifetap',
    type: 'attack',
    tags: ['Spirit', 'Dark'],
    distance: [1, 2],
    stats: {
      baseDamage: 20,
    },
    effects: [_.cloneDeep(EffectList.lifesteal)],
    costs: {
      action: 100,
      mana: 10,
    },
  },
  walk: {
    slug: 'walk',
    type: 'walk',
    tags: [],
    distance: [],
    between: true,
    effects: [_.cloneDeep(EffectList.walk)],
    stats: {},
    costs: {
      action: 100,
    },
  },
  approach: {
    slug: 'approach',
    type: 'walk',
    tags: [],
    distance: [2, 3],
    effects: [_.cloneDeep(EffectList.approach), _.cloneDeep(EffectList.rushed)],
    stats: {},
    costs: {
      action: 25,
    },
  },
};

export interface IAction {
  slug: ActionSlug;
  type: ActionType;
  tags: StatTag[];
  source?: {
    tags: StatTag[];
  };
  stats: Partial<AttackStats>;
  effects?: IEffect[];
  distance: number[];
  between?: boolean;
  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };
}
