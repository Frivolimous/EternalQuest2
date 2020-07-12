import * as _ from 'lodash';

import { StatMap, CompoundMap, StatTag, LevelValue, StatMapLevel, CompoundMapLevel } from './StatData';
import { IAction, ActionList, ActionSlug, IActionRaw } from './ActionData';

export type BuffSlug = 'rushed' | 'burning' | 'crippled' | 'town';
export type BuffType = 'stat' | 'damage' | 'action' | 'special';
export type BuffClearType = 'action' | 'time' | 'trigger';

export const BuffList: IBuffRaw[] = [
  { slug: 'town', type: 'special', clearType: 'trigger', count: 1, action: 'gotown' },
  { slug: 'rushed', type: 'stat', clearType: 'action', count: 1, compoundStats: [{stat: 'accuracy', value: -0.5 }] },
];

export interface IBuffRaw {
  slug: BuffSlug;
  type: BuffType;
  clearType: BuffClearType;
  count: LevelValue;
  duration?: LevelValue;

  baseStats?: StatMapLevel;
  compoundStats?: CompoundMapLevel;
  action?: ActionSlug | IActionRaw;
  damage?: { value: LevelValue, tags: StatTag[] };
}

export interface IBuff {
  name: BuffSlug;
  type: BuffType;
  clearType: BuffClearType;
  count: number;
  duration?: number;

  baseStats?: StatMap;
  compoundStats?: CompoundMap;
  action?: IAction;
  damage?: { value: number, tags: StatTag[] };
}
