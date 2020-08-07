import * as _ from 'lodash';

import { StatTag, AttackStats, AttackStatsLevel, LevelValue } from './StatData';
import { EffectList, IEffect, EffectSlug, IEffectRaw } from './EffectData';

export type ActionSlug = 'strike' | 'walk' | 'approach' | 'idle' | 'gotown' | 'leap' | 'withdraw' | 'throw' |
'Magic Bolt' | 'Fireball' | 'Lightning' | 'Searing Light' | 'Poison Bolt' | 'Confusion' | 'Cripple' | 'Vulnerability' | 'Healing' | 'Empower' | 'Haste' | 'Enchant Weapon' |
'Restore' | 'Grenade' | 'Amplify' |
'Confused' | 'Afraid';
export type ActionType = 'attack' | 'walk' | 'self' | 'instant' | 'heal' | 'curse' | 'buff';

export const ActionList: IActionRaw[] = [
  { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: 2 }, costs: { action: 100 } },

  { slug: 'idle', type: 'walk', distance: ['b', 1, 2, 3], costs: { action: 50}, tags: [] },
  { slug: 'walk', type: 'walk', tags: [], distance: ['b'], effects: ['walk'], costs: { action: 0 } },
  { slug: 'leap', type: 'walk', tags: [], distance: [2, 3], effects: ['approach', 'leapbuff'], costs: { action: 0 } },
  { slug: 'withdraw', type: 'walk', tags: [], distance: [1, 2], effects: ['backwards', 'aim' ], costs: { action: {base: 50, inc: -3} } },
  { slug: 'approach', type: 'walk', tags: [], distance: [2, 3], effects: ['approach', 'rushed'], costs: { action: 0 } },
  { slug: 'gotown', type: 'self', tags: [], distance: ['b'], costs: {} },
  { slug: 'Confused', type: 'self', tags: [], distance: ['b', 1, 2, 3], costs: {action: 80}, userate: {base: 0.25, dim: 0.04}},
  { slug: 'Afraid', type: 'walk', tags: [], distance: [1, 2, 3], effects: ['backwards'], costs: {action: 80}, userate: {base: 0.25, dim: 0.04}},
];

export interface IActionRaw {
  slug: ActionSlug;
  type: ActionType;
  tags: StatTag[];
  userate?: LevelValue;
  stats?: Partial<AttackStatsLevel>;
  effects?: (EffectSlug | IEffectRaw)[];
  distance: (number | 'b')[];
  heals?: {
    mana?: LevelValue;
    action?: LevelValue;
    health?: LevelValue;
  };
  costs: {
    mana?: LevelValue;
    action?: LevelValue;
    health?: LevelValue;
  };
}

export interface IAction {
  slug: ActionSlug;
  level: number;
  type: ActionType;
  tags: StatTag[];
  userate?: number;
  source?: {
    tags: StatTag[];
    charges?: number;
  };
  stats?: Partial<AttackStats>;
  effects?: IEffect[];
  distance: (number | 'b')[];
  heals?: {
    mana?: number;
    action?: number;
    health?: number;
  };
  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };
}
