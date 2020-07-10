export type EffectSlug = 'lifesteal' | 'walk' | 'rushed' | 'approach';
export type EffectType = 'special' | 'damage' | 'buff';
export type EffectTrigger = 'never' | 'all' | 'hit' | 'crit' | 'melee-hit' | 'defense' | 'avoid' | 'initial' | 'safe' | 'injured' | 'constant';

export const EffectList: {[key in EffectSlug]: IEffect} = {
  lifesteal: {
    name: 'lifesteal',
    type: 'special',
    trigger: 'hit',
    level: 0,
    userate: 1,
    values: 0.15,
  },
  walk: {
    name: 'walk',
    type: 'special',
    trigger: 'all',
    level: 0,
    userate: 1,
  },
  approach: {
    name: 'approach',
    type: 'special',
    trigger: 'all',
    level: 0,
    userate: 1,
  },
  rushed: {
    name: 'rushed',
    type: 'buff',
    trigger: 'all',
    level: 0,
    userate: 1,
    values: 0,
  },
};

export interface IEffect {
  name: EffectSlug;
  type: EffectType;
  trigger: EffectTrigger;
  level: number;
  userate: number;
  values?: any;
}
