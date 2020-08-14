import * as _ from 'lodash';

import { StatMap, StatTag, LevelValue, StatMapLevel } from './StatData';
import { IAction, ActionSlug, IActionRaw } from './ActionData';
import { IEffect, EffectSlug, IEffectRaw } from './EffectData';

export type BuffSlug = 'rushed' | 'burning' | 'crippled' | 'town' | 'useless' | 'leapbuff' | 'critInit' | 'blockInit' | 'aim' | 'markInit' |
  'poisoned' | 'stunned' | 'confused' | 'weakened' | 'vulnerable' | 'empowered' | 'hastened' | 'enchanted' |
  'amplified' | 'turtle' | 'celerity' | 'purity' | 'gassed' | 'blinded' | 'cursed' |
  'afraid' | 'berserk' |
  'deft';
export type BuffType = 'stat' | 'damage' | 'action' | 'special' | 'trigger';
export type BuffClearType = 'action' | 'time' | 'trigger';

export const BuffList: IBuffRaw[] = [
  { slug: 'town', type: 'special', clearType: 'trigger', count: 1, action: 'gotown' },
  { slug: 'rushed', type: 'stat', clearType: 'action', count: 1, stats: [{stat: 'accuracy', value: -0.25 }] },
  { slug: 'leapbuff', type: 'stat', clearType: 'action', count: 1, stats: [{stat: 'accuracy', value: {base: -0.25, inc: 0.05} }, {stat: 'power', tag: 'Weapon', value: {inc: 10}}] },
  { slug: 'aim', type: 'stat', clearType: 'action', count: 1, stats: [{stat: 'accuracy', value: {base: 0.1, inc: 0.01} }] },
];

export interface IBuffRaw {
  slug: BuffSlug;
  type: BuffType;
  clearType: BuffClearType;
  count: LevelValue;
  duration?: LevelValue;

  stats?: StatMapLevel;
  action?: ActionSlug | IActionRaw;
  damage?: { value: LevelValue, tags: StatTag[] };
  triggers?: (EffectSlug | IEffectRaw)[];
}

export interface IBuff {
  name: BuffSlug;
  type: BuffType;
  clearType: BuffClearType;
  count: number;
  duration?: number;

  stats?: StatMap;
  action?: IAction;
  damage?: { value: number, tags: StatTag[] };
  triggers?: IEffect[];
}
