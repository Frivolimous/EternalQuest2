import { StatMapLevel, StatMap, AnyStat, DamageTag, DamageTags } from './StatData';
import { IItemSave, IItem, IItemRaw, ItemSlug } from './ItemData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';
import { EffectSlug, IEffectRaw, IEffect } from './EffectData';

export const enum ZoneId {
  FOREST,
  DESERT,
  REALM,
}

export const enum EnemySetId {
  GOBLIN,
  BEAST,
  DEMON,
  UNDEAD,
  DROW,
}

export const enum EnemySlug {
  G_WARRIOR,
  G_BRUTE,
  G_ALCHEMIST,
  G_SHAMAN,
  G_BLOB,
  G_BOSS,
}

export const SampleStats: {[key in AnyStat]?: StatMapLevel} = {
  health: [
    {stat: 'health', value: {base: 50, inc: 0}}, // 0
    {stat: 'health', value: {base: 90, inc: 4.62}}, // 1
    {stat: 'health', value: {base: 110, inc: 5.58}}, // 2
    {stat: 'health', value: {base: 130, inc: 8.36}}, // 3
    {stat: 'health', value: {base: 150, inc: 11.13}}, // 4
    {stat: 'health', value: {base: 170, inc: 15.4}}, // 5
    {stat: 'health', value: {base: 190, inc: 19.58}}, // 6
    {stat: 'health', value: {base: 350, inc: 32.58}}, // boss 3
    {stat: 'health', value: {base: 390, inc: 40.03}}, // boss 5
  ],
  strength: [
    {stat: 'strength', value: {base: 50, inc: 0}}, // 0
    {stat: 'strength', value: {base: 50, inc: 0.43}}, // 1
    {stat: 'strength', value: {base: 50, inc: 0.85}}, // 2
    {stat: 'strength', value: {base: 50, inc: 0.85}}, // 3
    {stat: 'strength', value: {base: 50, inc: 1.7}}, // 4
    {stat: 'strength', value: {base: 50, inc: 2.55}}, // 5
    {stat: 'strength', value: {base: 50, inc: 3.4}}, // 6
    {stat: 'strength', value: {base: 100, inc: 1.7}}, // boss 3
    {stat: 'strength', value: {base: 100, inc: 2.55}}, // boss 4
  ],
  baseDamage: [
    {stat: 'baseDamage', value: {base: 0, inc: 0}}, // 0
    {stat: 'baseDamage', value: {base: 15, inc: 1}}, // 1
    {stat: 'baseDamage', value: {base: 20, inc: 1.5}}, // 2
    {stat: 'baseDamage', value: {base: 26, inc: 1.7}}, // 3
    {stat: 'baseDamage', value: {base: 30, inc: 1.9}}, // 4
    {stat: 'baseDamage', value: {base: 35, inc: 2.3}}, // 5
    {stat: 'baseDamage', value: {base: 40, inc: 3.5}}, // 6
  ],
  dexterity: [
    {stat: 'dexterity', value: {base: 50, inc: 0}}, // 0
    {stat: 'dexterity', value: {base: 50, inc: 0.43}}, // 1
    {stat: 'dexterity', value: {base: 50, inc: 0.85}}, // 2
    {stat: 'dexterity', value: {base: 50, inc: 0.85}}, // 3
    {stat: 'dexterity', value: {base: 50, inc: 1.7}}, // 4
    {stat: 'dexterity', value: {base: 50, inc: 2.55}}, // 5
    {stat: 'dexterity', value: {base: 50, inc: 3.4}}, // 6
    {stat: 'dexterity', value: {base: 100, inc: 1.7}}, // boss 3
    {stat: 'dexterity', value: {base: 100, inc: 2.55}}, // boss 4
  ],
  magic: [
    {stat: 'magic', value: {base: 50, inc: 0}}, // 0
    {stat: 'magic', value: {base: 50, inc: 0.43}}, // 1
    {stat: 'magic', value: {base: 50, inc: 0.85}}, // 2
    {stat: 'magic', value: {base: 50, inc: 0.85}}, // 3
    {stat: 'magic', value: {base: 50, inc: 1.7}}, // 4
    {stat: 'magic', value: {base: 50, inc: 2.55}}, // 5
    {stat: 'magic', value: {base: 50, inc: 3.4}}, // 6
    {stat: 'magic', value: {base: 100, inc: 1.7}}, // boss 3
    {stat: 'magic', value: {base: 100, inc: 2.55}}, // boss 4
  ],
  intellect: [
    {stat: 'intellect', value: {base: 50, inc: 0}}, // 0
    {stat: 'intellect', value: {base: 50, inc: 0.43}}, // 1
    {stat: 'intellect', value: {base: 50, inc: 0.85}}, // 2
    {stat: 'intellect', value: {base: 50, inc: 0.85}}, // 3
    {stat: 'intellect', value: {base: 50, inc: 1.7}}, // 4
    {stat: 'intellect', value: {base: 50, inc: 2.55}}, // 5
    {stat: 'intellect', value: {base: 50, inc: 3.4}}, // 6
    {stat: 'intellect', value: {base: 100, inc: 1.7}}, // boss 3
    {stat: 'intellect', value: {base: 100, inc: 2.55}}, // boss 4
  ],
  accuracy: [
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.2}}, // 0
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.3}}, // 1
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.4}}, // 2
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.5}}, // 3
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.6}}, // 4
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.7}}, // 5
    {stat: 'accuracy', value: {base: 0, dim: 0.01, dmult: 0.8}}, // 6
  ],
  fortification: [
    {stat: 'fortification', value: 0}, // 0
    {stat: 'fortification', value: 0.05}, // 1
    {stat: 'fortification', value: 0.1}, // 2
    {stat: 'fortification', value: 0.2}, // 3
    {stat: 'fortification', value: 0.3}, // 4
    {stat: 'fortification', value: 0.4}, // 5
    {stat: 'fortification', value: 0.5}, // 6
  ],
  block: [
    {stat: 'block', value: {base: 0, dim: 0, dmult: 0}}, // 0
    {stat: 'block', value: {base: 0, dim: 0.01, dmult: 0.05}}, // 1
    {stat: 'block', value: {base: 0, dim: 0.01, dmult: 0.1}}, // 2
    {stat: 'block', value: {base: 0, dim: 0.01, dmult: 0.2}}, // 3
    {stat: 'block', value: {base: 0, dim: 0.01, dmult: 0.3}}, // 4
    {stat: 'block', value: {base: 0, dim: 0.01, dmult: 0.4}}, // 5
    {stat: 'block', value: {base: 0, dim: 0.01, dmult: 0.5}}, // 6
  ],
};

export interface IEnemyStat {
  dexterity?: number;
  accuracy?: number;
  block?: number;
  strength?: number;
  baseDamage?: number;
  health?: number;
  fortification?: number;

  magic?: number;
  intellect?: number;
}

export const dStatEnemy: StatMapLevel = [
  {stat: 'mregen', value: 0.03},
  {stat: 'power', value: 100},
  {stat: 'speed', value: 100},
  {stat: 'critRate', tag: 'Weapon', value: 0.15},
  {stat: 'critMult', value: 1.5},
  {stat: 'hit', value: 1},
  {stat: 'resist', value: {base: 0, dim: 0.001}},
  {stat: 'mana', value: {base: 100, inc: 0.5, max: 300}},
];

export const EnemyGroupList: { [key in EnemySetId]: { enemies: { base: IEnemyRaw, zones: { [key2 in ZoneId]: Partial<IEnemyRaw> } }[], zones: { [key2 in ZoneId]: Partial<IEnemyRaw> } } } = {
  [EnemySetId.GOBLIN]: {
    zones: {
      [ZoneId.FOREST]: { stats: [{stat: 'critRate', tag: 'Weapon', value: 0.05}]},
      [ZoneId.DESERT]: { stats: [{stat: 'health', value: {inc: 3}}]},
      [ZoneId.REALM]: { stats: [{stat: 'strength', value: {inc: 2}}]},
    },
    enemies: [
      {
        base: {xp: 1, slug: EnemySlug.G_WARRIOR, baseStats: {dexterity: 2, accuracy: 4, block: 5, strength: 3, baseDamage: 3, health: 3, fortification: 3}},
        zones: {
          [ZoneId.FOREST]: { stats: [{stat: 'strength', value: {inc: 1}}]},
          [ZoneId.DESERT]: { stats: [{stat: 'health', value: {inc: 3}}]},
          [ZoneId.REALM]: { stats: [{stat: 'block', value: {dim: 0.001, dmult: 0.3}}]},
        },
      },
      {
        base: {xp: 2, slug: EnemySlug.G_BRUTE, baseStats: {dexterity: 2, accuracy: 3, block: 3, strength: 6, baseDamage: 6, health: 6, fortification: 2}},
        zones: {
          [ZoneId.FOREST]: { equipment: [ItemSlug.ENCHANT_WEAPON]},
          [ZoneId.DESERT]: { equipment: [ItemSlug.HASTE]},
          [ZoneId.REALM]: { equipment: [ItemSlug.BERSERK]},
        },
      },
      {
        base: {xp: 1, slug: EnemySlug.G_SHAMAN, baseStats: {dexterity: 2, accuracy: 2, block: 2, strength: 1, baseDamage: 1, health: 2, fortification: 2, magic: 4}},
        zones: {
          [ZoneId.FOREST]: { damageTags: ['Magical'], equipment: [ItemSlug.MAGIC_BOLT, ItemSlug.CONFUSION]},
          [ZoneId.DESERT]: { damageTags: ['Magical'], equipment: [ItemSlug.FIREBALL, ItemSlug.VULNERABILITY]},
          [ZoneId.REALM]: { damageTags: ['Dark', 'Spirit'], equipment: [ItemSlug.DARK_BURST, ItemSlug.CRIPPLE]},
        },
      },
      {
        base: {xp: 1, slug: EnemySlug.G_ALCHEMIST, damageTags: ['Chemical'], baseStats: {dexterity: 3, accuracy: 2, block: 4, strength: 2, baseDamage: 2, health: 2, fortification: 2, intellect: 2}},
        zones: {
          [ZoneId.FOREST]: {equipment: [ItemSlug.ALCHEMIST_FIRE], actions: ['withdraw']},
          [ZoneId.DESERT]: {equipment: [ItemSlug.ALCHEMIST_FIRE], stats: [{stat: 'intellect', value: {inc: 1}}]},
          [ZoneId.REALM]: {equipment: [ItemSlug.TOXIC_GAS], stats: [{stat: 'health', value: {inc: 3}}]},
        },
      },
      {
        base: {xp: 0.5, slug: EnemySlug.G_BLOB, damageTags: ['Chemical'], baseStats: {dexterity: 1, accuracy: 3, block: 0, strength: 2, baseDamage: 2, health: 1, fortification: 1}, stats: [{stat: 'resist', tag: 'Chemical', value: 0.4}, {stat: 'dodge', value: 0.1}]},
        zones: {
          [ZoneId.FOREST]: {},
          [ZoneId.DESERT]: {},
          [ZoneId.REALM]: {},
        },
      },
      {
        base: {xp: 5, slug: EnemySlug.G_BOSS, baseStats: {dexterity: 4, accuracy: 4, block: 5, strength: 8, baseDamage: 6, health: 8, fortification: 4}, actions: ['leap', 'bash']},
        zones: {
          [ZoneId.FOREST]: {},
          [ZoneId.DESERT]: {},
          [ZoneId.REALM]: {},
        },
      },
    ],
  },
  [EnemySetId.BEAST]: {
    zones: {
      [ZoneId.FOREST]: {},
      [ZoneId.DESERT]: {},
      [ZoneId.REALM]: {},
    },
    enemies: [],
  },
  [EnemySetId.DEMON]: {
    zones: {
      [ZoneId.FOREST]: {},
      [ZoneId.DESERT]: {},
      [ZoneId.REALM]: {},
    },
    enemies: [],
  },
  [EnemySetId.UNDEAD]: {
    zones: {
      [ZoneId.FOREST]: {},
      [ZoneId.DESERT]: {},
      [ZoneId.REALM]: {},
    },
    enemies: [],
  },
  [EnemySetId.DROW]: {
    zones: {
      [ZoneId.FOREST]: {},
      [ZoneId.DESERT]: {},
      [ZoneId.REALM]: {},
    },
    enemies: [],
  },
};

export const EnemyWeapon: IItemRaw = { slug: 0, cost: 0, tags: ['Equipment', 'Weapon', 'Melee'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 0 } }, costs: { action: 100 } } };

export interface IEnemyRaw {
  slug: EnemySlug;
  xp: number;
  cosmetics?: number[];
  baseStats: IEnemyStat;
  stats?: StatMapLevel;
  equipment?: ItemSlug[];
  damageTags?: DamageTag[];

  actions?: (ActionSlug | IActionRaw)[];
  triggers?: (EffectSlug | IEffectRaw)[];
}

export interface IEnemy {
  name: string;
  xp: number;
  slug: EnemySlug;
  level: number;
  cosmetics?: number[];
  stats?: StatMap;
  equipment?: IItem[];

  actions?: IAction[];
  triggers?: IEffect[];
}
