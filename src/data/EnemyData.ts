import * as _ from 'lodash';
import { StatMapLevel, StatMap } from './StatData';
import { IItemSave, IItem } from './ItemData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';
import { EffectSlug, IEffectRaw, IEffect } from './EffectData';

export type EnemySlug = 'Goblin' | 'Vine' | 'Brute' | 'Goblin Boss';

export const EnemyList: IEnemyRaw[] = [
  {slug: 'Goblin', stats: [{stat: 'strength', value: { base: 50, inc: 5}}, {stat: 'health', tag: 'Base', value: { base: 100, inc: 5}}]},
  {slug: 'Goblin Boss', stats: [{stat: 'strength', value: { base: 50, inc: 5}}, {stat: 'health', tag: 'Base', value: { base: 500, inc: 5}}]},
];

export interface IEnemyRaw {
  slug: EnemySlug;
  cosmetics?: number[];
  stats?: StatMapLevel;
  equipment?: IItemSave[];

  actions?: (ActionSlug | IActionRaw)[];
  triggers?: (EffectSlug | IEffectRaw)[];
}

export interface IEnemy {
  name: string;
  slug: EnemySlug;
  level: number;
  cosmetics?: number[];
  stats?: StatMap;
  equipment?: IItem[];

  actions?: IAction[];
  triggers?: IEffect[];
}
