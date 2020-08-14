import * as _ from 'lodash';
import { StatMapLevel, StatMap } from './StatData';
import { IItemSave, IItem } from './ItemData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';
import { EffectSlug, IEffectRaw, IEffect } from './EffectData';

export enum ZoneId {
  FOREST,
  DESERT,
  REALM,
}

export enum EnemySetId {
  GOBLIN,
  BEAST,
  DEMON,
  UNDEAD,
  DROW,
}

export enum EnemySlug {
  G_WARRIOR,
  G_BRUTE,
  G_ALCHEMIST,
  G_SHAMAN,
  G_BLOB,
  G_BOSS,
}

export const EnemyList: IEnemyRaw[] = [
  {slug: EnemySlug.G_WARRIOR, equipment: [{slug: 'Greatsword', level: 0}], stats: [{stat: 'strength', value: { base: 0, inc: 5}}, {stat: 'health', tag: 'Base', value: { base: 100, inc: 5}}]},
  {slug: EnemySlug.G_BOSS, equipment: [{slug: 'Greatsword', level: 0}], stats: [{stat: 'strength', value: { base: 0, inc: 5}}, {stat: 'health', tag: 'Base', value: { base: 500, inc: 5}}]},
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
