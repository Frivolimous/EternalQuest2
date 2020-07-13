import { StatTag, CompoundMap, StatMap, StatMapLevel, CompoundMapLevel, AttackStatsLevel, LevelValue } from './StatData';
import { IAction, ActionSlug, IActionRaw } from './ActionData';
import { EffectSlug, IEffectRaw } from './EffectData';

export interface IItemRaw {
  slug: ItemSlug;
  tags: StatTag[];

  baseStats?: StatMapLevel;
  compoundStats?: CompoundMapLevel;
  action?: ActionSlug | IActionRaw;
  triggers?: any;
}

export interface IItem {
  name: string;
  slug: ItemSlug;
  enchantSlug?: EnchantSlug;
  level: number;
  tags: StatTag[];

  baseStats?: StatMap;
  compoundStats?: CompoundMap;
  action?: IAction;
  triggers?: any;
}

export interface IItemSave {
  slug: ItemSlug;
  level: number;
  enchant?: EnchantSlug | EnchantSlug[];
  charges?: number;
  priorities?: any;
}

export type ItemSlug = 'Sword' | 'Hat' | 'Quick Charm' | 'Magic Missile' | 'Life Tap';

export const ItemList: IItemRaw[] = [
  { slug: 'Sword', tags: ['Equipment', 'Weapon'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: {base: 5, inc: 2} }, costs: { action: 100 } } },
  { slug: 'Hat', tags: ['Equipment', 'Helmet'], baseStats: [{ stat: 'health', tag: 'Base', value: { base: 50, inc: 10} }], compoundStats: [{ stat: 'block', value: { base: 0.1, inc: 0.01 } }]},
  { slug: 'Quick Charm', tags: ['Belt'], compoundStats: [{ stat: 'dexterity', value: {base: 10, inc: 1} }]},
  { slug: 'Magic Missile', tags: ['Equipment', 'Spell'], action: 'magicMissile' },
  { slug: 'Life Tap', tags: ['Equipment', 'Spell'], action: 'lifetap' },
];

export type EnchantSlug = 'Master' | 'Mystic';

export interface IEnchantRaw {
  slug: EnchantSlug;
  tags?: StatTag[];
  baseStats?: StatMapLevel;
  compoundStats?: CompoundMapLevel;
  triggers?: any;

  action?: {
    tags?: StatTag[];

    stats?: Partial<AttackStatsLevel>;
    effects?: (EffectSlug | IEffectRaw)[];
    costs?: {
      mana?: LevelValue;
      action?: LevelValue;
      health?: LevelValue;
    };
  };
}

export const EnchantList: IEnchantRaw[] = [
  {slug: 'Master', action: {stats: { baseDamage: {base: 2, inc: 1}}}},
  {slug: 'Mystic', action: {tags: ['Mystic']}},
];
