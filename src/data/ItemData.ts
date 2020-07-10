import { StatTag, BaseStats, CompoundStats, CompoundMap, StatMap } from './StatData';
import { IAction, ActionList } from './ActionData';

export interface IItem {
  name: string;
  tags: StatTag[];
  baseStats: StatMap;
  compoundStats: CompoundMap;
  save: IItemSave;
  action?: IAction;
  triggers?: any;
}

export interface IItemSave {
  index: number;
  level: number;
  enchant?: number | number[];
  charges?: number;
  priorities?: any;
}

export const ItemList: IItem[] = [
  { name: 'Sword', tags: ['Equipment', 'Weapon'], baseStats: [], compoundStats: [], save: { index: 0, level: 0 }, action: ActionList.strike },
  { name: 'Hat', tags: ['Equipment', 'Helmet'], baseStats: [{ stat: 'health', tag: 'Base', value: 100 }], compoundStats: [{ stat: 'block', value: 0.1 }], save: { index: 1, level: 0 } },
  { name: 'Quick Charm', tags: ['Belt'], baseStats: [], compoundStats: [{ stat: 'dexterity', value: 50 }], save: { index: 2, level: 0 } },
  { name: 'Magic Missile', tags: ['Equipment', 'Spell'], baseStats: [], compoundStats: [], save: { index: 3, level: 0 }, action: ActionList.magicMissile },
  { name: 'Life Tap', tags: ['Equipment', 'Spell'], baseStats: [], compoundStats: [], save: { index: 4, level: 0 }, action: ActionList.lifetap },
];
