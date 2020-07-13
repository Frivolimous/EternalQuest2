import * as _ from 'lodash';
import { LevelValue, StatMapLevel, CompoundMapLevel, StatMap, CompoundMap } from './StatData';
import { IItemSave, IItem } from './ItemData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';

export type EnemySlug = 'Goblin' | 'Vine' | 'Brute' | 'Goblin Boss';

export const EnemyList: IEnemyRaw[] = [
  {slug: 'Goblin', compoundStats: [{stat: 'strength', value: { base: 50, inc: 5}}], baseStats: [{stat: 'health', tag: 'Base', value: { base: 100, inc: 5}}]},
  {slug: 'Goblin Boss', compoundStats: [{stat: 'strength', value: { base: 50, inc: 5}}], baseStats: [{stat: 'health', tag: 'Base', value: { base: 500, inc: 5}}]},
];

export interface IEnemyRaw {
  slug: EnemySlug;
  cosmetics?: number[];
  baseStats?: StatMapLevel;
  compoundStats?: CompoundMapLevel;
  equipment?: IItemSave[];

  actions?: (ActionSlug | IActionRaw)[];
  triggers?: any;
}

export interface IEnemy {
  name: string;
  slug: EnemySlug;
  level: number;
  cosmetics?: number[];
  baseStats?: StatMap;
  compoundStats?: CompoundMap;
  equipment?: IItem[];

  actions?: IAction[];
  triggers?: any;
}
