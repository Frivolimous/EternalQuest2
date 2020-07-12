import * as _ from 'lodash';
import { BuffSlug, BuffList, IBuff, IBuffRaw } from './BuffData';
import { LevelValue } from './StatData';

export type EffectSlug = 'lifesteal' | 'walk' | 'rushed' | 'approach' | BuffSlug;
export type EffectType = 'special' | 'damage' | 'buff';
export type EffectTrigger = 'never' | 'all' | 'hit' | 'crit' | 'melee-hit' | 'defense' | 'avoid' | 'initial' | 'safe' | 'injured' | 'constant';

export const EffectList: IEffectRaw[] = [
  { slug: 'lifesteal', type: 'special', trigger: 'hit', userate: 1, value: {base: 0.15, inc: 0.01} },
  { slug: 'walk', type: 'special', trigger: 'all', userate: 1 },
  { slug: 'approach', type: 'special', trigger: 'all', userate: 1 },
  { slug: 'rushed', type: 'buff', trigger: 'all', userate: 1, buff: 'rushed' },
  { slug: 'burning', type: 'buff', trigger: 'hit', userate: 1, buff: { slug: 'burning', type: 'damage', clearType: 'time', count: 3, duration: 100, damage: { value: {base: 10, inc: 1}, tags: ['Fire', 'Magical']} } },
  { slug: 'crippled', type: 'buff', trigger: 'hit', userate: 1, buff: { slug: 'crippled', type: 'stat', clearType: 'time', count: {base: 5, inc: 0.2}, duration: 100, compoundStats: [{stat: 'strength', value: {base: -50, inc: -5}}] } },
];

export interface IEffectRaw {
  slug: EffectSlug;
  type: EffectType;
  trigger: EffectTrigger;
  userate: LevelValue;
  value?: LevelValue;
  buff?: BuffSlug | IBuffRaw;
}

export interface IEffect {
  name: EffectSlug;
  type: EffectType;
  trigger: EffectTrigger;
  level: number;
  userate: number;
  value?: number;
  buff?: IBuff;
}
