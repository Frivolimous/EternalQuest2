import * as _ from 'lodash';

import { StatTag, AttackStats, AttackStatsLevel, LevelValue } from './StatData';
import { EffectList, IEffect, EffectSlug, IEffectRaw } from './EffectData';

export type ActionSlug = 'strike' | 'walk' | 'approach' | 'idle' | 'magicMissile' | 'lifetap' | 'gotown';
export type ActionType = 'attack' | 'walk' | 'self';

export const ActionList: IActionRaw[] = [
  { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: {base: 5, inc: 2}, hit: {base: 10, inc: 1} }, costs: { action: 100 } },
  { slug: 'magicMissile', type: 'attack', tags: ['Magical', 'Projectile'], distance: [1, 2], stats: { baseDamage: {base: 20, inc: 5}, hit: 30 }, costs: { action: 100, mana: {base: 10, inc: 1} }, effects: ['burning'] },
  { slug: 'lifetap', type: 'attack', tags: ['Spirit', 'Dark'], distance: [1, 2], stats: { baseDamage: {base: 20, inc: 5} }, effects: ['lifesteal', 'crippled'], costs: { action: 100, mana: {base: 15, inc: 3} } },

  { slug: 'idle', type: 'self', distance: ['b', 1, 2, 3], costs: { action: 50}, tags: [] },
  { slug: 'walk', type: 'walk', tags: [], distance: ['b'], effects: ['walk'], costs: { action: 100 } },
  { slug: 'approach', type: 'walk', tags: [], distance: [2, 3], effects: ['approach', 'rushed'], costs: { action: 0 } },
  { slug: 'gotown', type: 'self', tags: [], distance: ['b'], costs: {} },
];

export interface IActionRaw {
  slug: ActionSlug;
  type: ActionType;
  tags: StatTag[];
  stats?: Partial<AttackStatsLevel>;
  effects?: (EffectSlug | IEffectRaw)[];
  distance: (number | 'b')[];
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
  source?: {
    tags: StatTag[];
  };
  stats?: Partial<AttackStats>;
  effects?: IEffect[];
  distance: (number | 'b')[];
  costs: {
    mana?: number;
    action?: number;
    health?: number;
  };
}
