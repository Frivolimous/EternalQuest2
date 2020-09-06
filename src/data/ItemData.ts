import { StatTag, StatMap, StatMapLevel, AttackStatsLevel, LevelValue } from './StatData';
import { IAction, ActionSlug, IActionRaw } from './ActionData';
import { EffectSlug, IEffectRaw, IEffect } from './EffectData';
import { SkillSlug } from './SkillData';

export interface IItemRaw {
  slug: ItemSlug;
  tags: StatTag[];
  cost: number;
  charges?: number;

  stats?: StatMapLevel;
  action?: ActionSlug | IActionRaw;
  triggers?: (EffectSlug | IEffectRaw)[];
}

export interface IItem {
  name: string;
  slug: ItemSlug;
  enchantSlug?: EnchantSlug[];
  level: number;
  tags: StatTag[];
  cost: number;
  charges?: number;
  maxCharges?: number;

  stats?: StatMap;
  action?: IAction;
  triggers?: IEffect[];

  scrollOf?: ItemSlug;
}

export interface IItemSave {
  slug: ItemSlug;
  level: number;
  enchant?: EnchantSlug[];
  scrollOf?: ItemSlug;
  charges?: number;
  priorities?: any;
}

export const enum ItemSlug {
  GREATSWORD,
  BATTLE_AXE,
  STAFF,
  SHORT_SWORDS,
  GLOVES,
  DAGGERS,
  SWORD_SHIELD,
  AXE_SHIELD,
  MACE_SHIELD,
  SHORTBOW,
  BANDANA,
  CONE,
  CAP,
  HELMET,
  ARMET,
  MAGIC_BOLT,
  FIREBALL,
  LIGHTNING,
  SEARING_LIGHT,
  POISON_BOLT,
  CONFUSION,
  CRIPPLE,
  VULNERABILITY,
  HEALING,
  EMPOWER,
  HASTE,
  ENCHANT_WEAPON,
  HEALING_POTION,
  MANA_POTION,
  AMPLIFICATION_POTION,
  RECOVERY_POTION,
  CELERITY_POTION,
  TURTLE_SOUP,
  PURITY_POTION,
  ALCHEMIST_FIRE,
  TOXIC_GAS,
  HOLY_WATER,
  THROWING_DAGGER,
  THROWING_AXE,
  DARTS,
  STATUE,
  SKULL,
  FEATHER,
  BEADS,
  HOOF,
  DIAMOND,
  SAPPHIRE,
  RUBY,
  EMERALD,
  AMETHYST,
  SCROLL,
  TROPHY,

  BERSERK,
  DARK_BURST,
}

export const ItemList: IItemRaw[] = [
  { slug: ItemSlug.GREATSWORD, cost: 80, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 35, inc: 2.3 } }, costs: { action: 110 } } },
  { slug: ItemSlug.BATTLE_AXE, cost: 60, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 20, inc: 1.55 } }, costs: { action: 110 }, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 35, inc: 20 }, tags: ['Physical', 'Critical'] }}] } },
  { slug: ItemSlug.STAFF, cost: 50, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy', 'Mystic'], stats: [{ stat: 'magic', value: { base: 10, inc: 4 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.2 } }, costs: { action: 110 } } },
  { slug: ItemSlug.SHORT_SWORDS, cost: 60, tags: ['Equipment', 'Double', 'Weapon', 'Melee'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.2 } }, costs: { action: 100 } } },
  { slug: ItemSlug.GLOVES, cost: 30, tags: ['Equipment', 'Weapon', 'Melee', 'Unarmed'] },
  { slug: ItemSlug.DAGGERS, cost: 45, tags: ['Equipment', 'Weapon', 'Double', 'Light Melee', 'Finesse'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 14, inc: 1.06 }, hit: { base: 0.05, inc: 0.005 } }, costs: { action: 90 } } },
  { slug: ItemSlug.SWORD_SHIELD, cost: 70, tags: ['Equipment', 'Weapon', 'Melee'], stats: [{ stat: 'block', value: { base: 0.05, inc: 0.005 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 26, inc: 1.7 } }, costs: { action: 100 } } },
  { slug: ItemSlug.AXE_SHIELD, cost: 55, tags: ['Equipment', 'Weapon', 'Melee'], stats: [{ stat: 'block', value: { base: 0.05, inc: 0.005 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 23, inc: 1.5 } }, costs: { action: 100 }, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 27, inc: 15 }, tags: ['Physical', 'Critical'] }}] } },
  { slug: ItemSlug.MACE_SHIELD, cost: 50, tags: ['Equipment', 'Weapon', 'Melee', 'Mystic'], stats: [{ stat: 'block', value: { base: 0.06, inc: 0.006 } }, { stat: 'magic', value: { base: 5, inc: 2.5 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 14, inc: 1.1 } }, costs: { action: 100 } } },
  { slug: ItemSlug.SHORTBOW, cost: 80, tags: ['Equipment', 'Weapon', 'Ranged'], action: { slug: 'strike', type: 'attack', tags: ['Physical', 'Projectile'], distance: [2, 3], stats: { baseDamage: { base: 53, inc: 1.5 } }, costs: { action: 100 } } },
  { slug: ItemSlug.BANDANA, cost: 30, tags: ['Equipment', 'Helmet', 'Agile'], stats: [{ stat: 'health', value: { base: 60, inc: 25 } }] },
  { slug: ItemSlug.CONE, cost: 60, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 75, inc: 37 } }, { stat: 'fortification', value: 0.1 }, { stat: 'mana', value: { base: 10, inc: 3 } }] },
  { slug: ItemSlug.CAP, cost: 50, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 80, inc: 40 } }, { stat: 'fortification', value: 0.1 }] },
  { slug: ItemSlug.HELMET, cost: 80, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 100, inc: 52 } }, { stat: 'fortification', value: 0.2 }, { stat: 'speed', value: -1 }, { stat: 'dodge', value: -0.1 }] },
  { slug: ItemSlug.ARMET, cost: 100, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 120, inc: 62 } }, { stat: 'fortification', value: 0.3 }, { stat: 'speed', value: -2 }, { stat: 'dodge', value: -0.2 }] },
  { slug: ItemSlug.MAGIC_BOLT, cost: 60, tags: ['Equipment', 'Spell'], action: { slug: 'Magic Bolt', type: 'attack', tags: ['Magical', 'Projectile', 'Force'], distance: [1, 2, 3], stats: { baseDamage: { base: 36, inc: 4.2 }, hit: 0.05 }, costs: { action: 75, mana: { base: 15, inc: 0.8 } } } },
  { slug: ItemSlug.FIREBALL, cost: 80, tags: ['Equipment', 'Spell'], action: { slug: 'Fireball', type: 'attack', tags: ['Magical', 'Projectile', 'Fire'], distance: [1, 2, 3], stats: { baseDamage: { base: 41, inc: 5.55 } }, effects: ['burning'], costs: { action: 100, mana: { base: 20, inc: 1.8 } } } },
  { slug: ItemSlug.LIGHTNING, cost: 100, tags: ['Equipment', 'Spell'], action: { slug: 'Lightning', type: 'attack', tags: ['Magical', 'Electric'], distance: [1, 2], stats: { baseDamage: { base: 49, inc: 7.95 } }, effects: ['stunned'], costs: { action: 100, mana: { base: 25, inc: 2.7 } } } },
  { slug: ItemSlug.SEARING_LIGHT, cost: 140, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Searing Light', type: 'attack', tags: ['Spirit', 'Holy'], distance: [1, 2], stats: { baseDamage: { base: 75, inc: 12.7 } }, costs: { action: 100, mana: { base: 40, inc: 4.25 } } } },
  { slug: ItemSlug.DARK_BURST, cost: 50, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Dark Burst', type: 'attack', tags: ['Spirit', 'Dark'], distance: [1, 2], stats: { baseDamage: { base: 45, inc: 6.35 } }, costs: { action: 100, mana: { base: 29, inc: 1.3 } } } },
  { slug: ItemSlug.POISON_BOLT, cost: 75, tags: ['Equipment', 'Spell'], action: { slug: 'Poison Bolt', type: 'curse', tags: ['Magical', 'Curse', 'Toxic', 'Projectile'], distance: [1, 2, 3], effects: ['poisoned'], costs: { action: 100, mana: { base: 15, inc: 0.8 } } } },
  { slug: ItemSlug.CONFUSION, cost: 85, tags: ['Equipment', 'Spell'], action: { slug: 'Confusion', type: 'curse', tags: ['Magical', 'Curse', 'Control'], distance: [1, 2], effects: ['confused'], costs: { action: 100, mana: { base: 13, inc: 1.5 } } } },
  { slug: ItemSlug.CRIPPLE, cost: 75, tags: ['Equipment', 'Spell'], action: { slug: 'Cripple', type: 'curse', tags: ['Magical', 'Curse'], distance: [1, 2], effects: ['weakened'], costs: { action: 100, mana: { base: 23, inc: 0.75 } } } },
  { slug: ItemSlug.VULNERABILITY, cost: 90, tags: ['Equipment', 'Spell'], action: { slug: 'Vulnerability', type: 'curse', tags: ['Magical', 'Curse'], distance: [1, 2], effects: ['vulnerable'], costs: { action: 100, mana: { base: 25, inc: 1.05 } } } },
  { slug: ItemSlug.HEALING, cost: 95, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Healing', type: 'heal', tags: ['Holy', 'Spirit', 'Healing'], heals: {health: {base: 78, inc: 6.65}}, distance: ['b', 1, 2, 3], costs: { action: 100, mana: { base: 25, inc: 1.6 } } } },
  { slug: ItemSlug.EMPOWER, cost: 110, tags: ['Equipment', 'Spell'], action: { slug: 'Empower', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['empowered'], costs: { action: 100, mana: { base: 13, inc: 0.8 } } } },
  { slug: ItemSlug.HASTE, cost: 70, tags: ['Equipment', 'Spell'], action: { slug: 'Haste', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['hastened'], costs: { action: 100, mana: { base: 16, inc: 1.3 } } } },
  { slug: ItemSlug.ENCHANT_WEAPON, cost: 70, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Enchant Weapon', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['enchanted'], costs: { action: 100, mana: { base: 13, inc: 0.8 } } } },
  { slug: ItemSlug.BERSERK, cost: 50, tags: ['Equipment', 'Spell'], action: { slug: 'Berserk', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['strengthen'], costs: { action: 100, mana: { base: 14, inc: 1.05 } } } },
  { slug: ItemSlug.HEALING_POTION, cost: 30, tags: ['Belt', 'Potion'], action: { slug: 'Healing', type: 'heal', tags: ['Chemical', 'Healing'], heals: { health: {base: 130, inc: 10.6}}, distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.MANA_POTION, cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Restore', type: 'heal', tags: ['Chemical', 'Healing'], heals: { mana: {base: 60, inc: 3.15}}, distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.RECOVERY_POTION, cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Healing', type: 'heal', tags: ['Chemical', 'Healing'], heals: { health: {base: 95, inc: 7}, mana: {base: 34, inc: 1.35}}, distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.AMPLIFICATION_POTION, cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['amplified'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.TURTLE_SOUP, cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['turtle'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.CELERITY_POTION, cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['celerity'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.PURITY_POTION, cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['purity'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.ALCHEMIST_FIRE, cost: 20, tags: ['Belt', 'Grenade'], action: { slug: 'Grenade', type: 'attack', tags: ['Chemical', 'Fire'], distance: [1, 2, 3], stats: {baseDamage: {base: 75, inc: 4.45}}, costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.TOXIC_GAS, cost: 20, tags: ['Belt', 'Grenade'], action: { slug: 'Grenade', type: 'curse', tags: ['Chemical', 'Curse', 'Toxic'], distance: [1, 2, 3], effects: ['gassed'], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.HOLY_WATER, cost: 20, tags: ['Belt', 'Grenade'], action: { slug: 'Grenade', type: 'attack', tags: ['Holy', 'Spirit'], distance: [1, 2, 3], stats: {baseDamage: {base: 68, inc: 4.15}}, effects: ['blinded'], costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.THROWING_AXE, cost: 20, tags: ['Belt', 'Heavy', 'Thrown'], action: { slug: 'throw', type: 'attack', tags: ['Physical', 'Projectile'], distance: [1, 2], stats: {baseDamage: {base: 39, inc: 2.8}}, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 35, inc: 20 }, tags: ['Physical', 'Critical'] }}], costs: { action: 110 } }, charges: 6 },
  { slug: ItemSlug.THROWING_DAGGER, cost: 20, tags: ['Belt', 'Finesse', 'Thrown'], action: { slug: 'throw', type: 'attack', tags: ['Physical', 'Projectile'], distance: [1, 2], stats: {baseDamage: {base: 34, inc: 2.2}, hit: {base: 0.1, inc: 0.01}}, costs: { action: 100 } }, charges: 6 },
  { slug: ItemSlug.DARTS, cost: 30, tags: ['Belt', 'Thrown'], action: { slug: 'throw', type: 'attack', tags: ['Physical', 'Projectile'], distance: [1, 2, 3], stats: {baseDamage: {base: 35, inc: 1.5}, hit: {base: 0.1, inc: 0.01}}, costs: { action: 90 } }, charges: 20 },
  { slug: ItemSlug.STATUE, cost: 100, tags: ['Belt', 'Charm']},
  { slug: ItemSlug.SKULL, cost: 100, tags: ['Belt', 'Charm']},
  { slug: ItemSlug.FEATHER, cost: 100, tags: ['Belt', 'Charm']},
  { slug: ItemSlug.BEADS, cost: 100, tags: ['Belt', 'Charm']},
  { slug: ItemSlug.HOOF, cost: 100, tags: ['Belt', 'Charm']},
  { slug: ItemSlug.DIAMOND, cost: 200, tags: ['Trade']},
  { slug: ItemSlug.SAPPHIRE, cost: 180, tags: ['Trade']},
  { slug: ItemSlug.RUBY, cost: 160, tags: ['Trade']},
  { slug: ItemSlug.EMERALD, cost: 140, tags: ['Trade']},
  { slug: ItemSlug.AMETHYST, cost: 120, tags: ['Trade']},
  { slug: ItemSlug.SCROLL, cost: 0, tags: ['Belt', 'Scroll'], charges: 1},
  { slug: ItemSlug.TROPHY, cost: 3500, tags: ['Belt', 'Charm', 'Relic'], stats: [{stat: 'power', value: {base: 2, inc: 2}}, {stat: 'health', value: {base: 4, inc: 4}}]},
];

export const enum EnchantSlug {
  MASTER,
  FOCAL,
  MYSTIC,
  GUIDED,
  KEEN,
  GRENADIER,
  DEFENDER,
  FLAMING,
  BRILLIANT,
  VENOMOUS,
  EXPLOSIVE,
  CURSING,
  VAMPIRIC,
  DAZZLING,
  REFLECTIVE,
  SUPERIOR,
  WIZARD,
  TROLL,
  CHANNELING,
  LIGHT,
  WARDED,
  ALCHEMIST,
  VIRTUOUS,
  PROTECTIVE,
  SEEKING,
  CLOAKING,
  UTILITY,
  SPIKEY,
  BERSERKER,
  FEARSOME,
  HOMING,
  PLENTIFUL,
  UNLIMITED,
  READY,
}
  // 'Shadow-W1' | 'Shadow-W2' | 'Shadow-W3' | 'Shadow-W4' | 'Shadow-W5' | 'Shadow-H1' | 'Shadow-H2' | 'Shadow-H3' | 'Shadow-H4' | 'Shadow-H5';

export interface IEnchantRaw {
  slug: EnchantSlug;
  costMult: number;
  tags?: StatTag[];
  removeTags?: StatTag[];
  stats?: StatMapLevel;
  triggers?: (EffectSlug | IEffectRaw)[];

  action?: {
    tags?: StatTag[];
    removeTags?: StatTag[];

    stats?: AttackStatsLevel;
    effects?: (EffectSlug | IEffectRaw)[];
    costs?: {
      mana?: LevelValue;
      action?: LevelValue;
      health?: LevelValue;
    };
  };

  chargeMult?: LevelValue;
}

export const EnchantList: IEnchantRaw[] = [
  {slug: EnchantSlug.MASTER, costMult: 3, action: {stats: {baseDamage: {base: 2, inc: 1}}}},
  {slug: EnchantSlug.FOCAL, costMult: 3.5, stats: [{stat: 'manacost', value: {base: -0.01, inc: -0.005}}]},
  {slug: EnchantSlug.MYSTIC, costMult: 2, stats: [{stat: 'magic', value: {base: 2, inc: 2}}], action: {tags: ['Mystic']}},
  {slug: EnchantSlug.GUIDED, costMult: 3.5, action: {stats: {hit: {base: 0.01, inc: 0.01}}}},
  {slug: EnchantSlug.KEEN, costMult: 3, action: {stats: {critRate: {base: 0.02, inc: 0.0054}}}},
  {slug: EnchantSlug.GRENADIER, costMult: 3, stats: [{stat: 'power', tag: 'Grenade', value: {base: 2, inc: 2}}], action: {tags: ['Cryptic']}},
  {slug: EnchantSlug.DEFENDER, costMult: 3.1, stats: [{stat: 'block', value: {base: 0.01, inc: 0.01}}]},
  {slug: EnchantSlug.FLAMING, costMult: 3.4, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'hit', target: 'target', damage: {value: { base: 5, inc: 2 }, tags: ['Magical', 'Fire'] }}]}},
  {slug: EnchantSlug.BRILLIANT, costMult: 3.5, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'hit', target: 'target', damage: {value: { base: 5, inc: 2 }, tags: ['Spirit', 'Holy'] }}]}},
  {slug: EnchantSlug.VENOMOUS, costMult: 3.4, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'hit', target: 'target', damage: {value: { base: 5, inc: 2 }, tags: ['Chemical', 'Toxic'] }}]}},
  {slug: EnchantSlug.EXPLOSIVE, costMult: 2.7, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 27, inc: 8 }, tags: ['Magical', 'Force', 'Critical'] }}]}},
  {slug: EnchantSlug.CURSING, costMult: 2.9, action: {effects: ['cursed']}},
  {slug: EnchantSlug.VAMPIRIC, costMult: 3.5, action: {effects: ['lifesteal']}},
  {slug: EnchantSlug.DAZZLING, costMult: 3.4, action: {effects: ['dazzled']}},
  {slug: EnchantSlug.REFLECTIVE, costMult: 3.2, stats: [{stat: 'turn', value: {base: 0.05, inc: 0.005}}]},
  {slug: EnchantSlug.SUPERIOR, costMult: 3, stats: [{stat: 'health', value: {base: 20, inc: 4}}]},
  {slug: EnchantSlug.WIZARD, costMult: 3.5, stats: [{stat: 'mana', value: {base: 8, inc: 2}}]},
  {slug: EnchantSlug.TROLL, costMult: 4, stats: [{stat: 'hregen', value: {base: 0.0025, inc: 0.0005}}]},
  {slug: EnchantSlug.CHANNELING, costMult: 4, stats: [{stat: 'mregen', value: {base: 0.004, inc: 0.0006}}]},
  {slug: EnchantSlug.LIGHT, costMult: 3, stats: [{stat: 'speed', value: {base: 0.5, inc: 0.1}}]},
  {slug: EnchantSlug.WARDED, costMult: 3, stats: [{stat: 'resist', tag: 'Magical', value: {base: 0.1, inc: 0.01}}]},
  {slug: EnchantSlug.ALCHEMIST, costMult: 3, stats: [{stat: 'resist', tag: 'Chemical', value: {base: 0.1, inc: 0.01}}]},
  {slug: EnchantSlug.VIRTUOUS, costMult: 3, stats: [{stat: 'resist', tag: 'Spirit', value: {base: 0.1, inc: 0.01}}]},
  {slug: EnchantSlug.PROTECTIVE, costMult: 3.6, stats: [{stat: 'resist', tag: 'Magical', value: {base: 0.03, inc: 0.003}}, {stat: 'resist', tag: 'Chemical', value: {base: 0.03, inc: 0.003}}, {stat: 'resist', tag: 'Spirit', value: {base: 0.03, inc: 0.003}}]},
  {slug: EnchantSlug.SEEKING, costMult: 4, stats: [{stat: 'iloot', value: {base: 0.05, inc: 0.005}}]},
  {slug: EnchantSlug.CLOAKING, costMult: 3, stats: [{stat: 'dodge', value: {base: 0.05, inc: 0.005}}]},
  {slug: EnchantSlug.UTILITY, costMult: 2.6, stats: [{stat: 'intellect', value: {base: 2, inc: 2}}]},
  {slug: EnchantSlug.SPIKEY, costMult: 2.7, triggers: ['spikey']},
  {slug: EnchantSlug.BERSERKER, costMult: 2.5, triggers: ['berserk']},
  {slug: EnchantSlug.FEARSOME, costMult: 3.4, triggers: ['afraid']},
  {slug: EnchantSlug.HOMING, costMult: 3, action: {stats: {penetration: 0.1}}},
  {slug: EnchantSlug.PLENTIFUL, costMult: 2, chargeMult: 2},
  {slug: EnchantSlug.UNLIMITED, costMult: 20, chargeMult: Infinity},
  {slug: EnchantSlug.READY, costMult: 3, action: {costs: {action: -10}}},
  // {slug: 'Shadow', costMult: 6},
];

export const EnchantMaps: {[key in StatTag]?: EnchantSlug[]} = {
  Weapon: [EnchantSlug.MASTER, EnchantSlug.MYSTIC, EnchantSlug.GUIDED, EnchantSlug.KEEN, EnchantSlug.GRENADIER, EnchantSlug.DEFENDER, EnchantSlug.FLAMING, EnchantSlug.BRILLIANT, EnchantSlug.VENOMOUS, EnchantSlug.EXPLOSIVE, EnchantSlug.CURSING, EnchantSlug.VAMPIRIC, EnchantSlug.DAZZLING, EnchantSlug.REFLECTIVE],
  Helmet: [EnchantSlug.SUPERIOR, EnchantSlug.WIZARD, EnchantSlug.TROLL, EnchantSlug.CHANNELING, EnchantSlug.LIGHT, EnchantSlug.WARDED, EnchantSlug.ALCHEMIST, EnchantSlug.VIRTUOUS, EnchantSlug.PROTECTIVE, EnchantSlug.SEEKING, EnchantSlug.CLOAKING, EnchantSlug.UTILITY, EnchantSlug.SPIKEY, EnchantSlug.BERSERKER, EnchantSlug.FEARSOME],
  Thrown: [EnchantSlug.MASTER, EnchantSlug.KEEN, EnchantSlug.GUIDED, EnchantSlug.FLAMING, EnchantSlug.BRILLIANT, EnchantSlug.VENOMOUS, EnchantSlug.EXPLOSIVE, EnchantSlug.CURSING, EnchantSlug.VAMPIRIC, EnchantSlug.DAZZLING, EnchantSlug.HOMING, EnchantSlug.PLENTIFUL, EnchantSlug.READY],
  Charm: [EnchantSlug.MYSTIC, EnchantSlug.GUIDED, EnchantSlug.KEEN, EnchantSlug.GRENADIER, EnchantSlug.DEFENDER, EnchantSlug.FLAMING, EnchantSlug.BRILLIANT, EnchantSlug.VENOMOUS, EnchantSlug.EXPLOSIVE, EnchantSlug.CURSING, EnchantSlug.VAMPIRIC, EnchantSlug.DAZZLING, EnchantSlug.REFLECTIVE,
    EnchantSlug.SUPERIOR, EnchantSlug.WIZARD, EnchantSlug.TROLL, EnchantSlug.CHANNELING, EnchantSlug.LIGHT, EnchantSlug.WARDED, EnchantSlug.ALCHEMIST, EnchantSlug.VIRTUOUS, EnchantSlug.PROTECTIVE, EnchantSlug.SEEKING, EnchantSlug.CLOAKING, EnchantSlug.UTILITY, EnchantSlug.SPIKEY, EnchantSlug.BERSERKER, EnchantSlug.FEARSOME],
  Spell: [],
  Potion: [],
  Grenade: [],
};

export const LootMap: {[key in StatTag]?: ItemSlug[]} = {
  Weapon: [ItemSlug.GREATSWORD, ItemSlug.BATTLE_AXE, ItemSlug.STAFF, ItemSlug.SHORT_SWORDS, ItemSlug.GLOVES, ItemSlug.DAGGERS, ItemSlug.SWORD_SHIELD, ItemSlug.AXE_SHIELD, ItemSlug.MACE_SHIELD, ItemSlug.SHORTBOW],
  Helmet: [ItemSlug.BANDANA, ItemSlug.CONE, ItemSlug.CAP, ItemSlug.HELMET, ItemSlug.ARMET],
  Spell: [ItemSlug.MAGIC_BOLT, ItemSlug.FIREBALL, ItemSlug.LIGHTNING, ItemSlug.SEARING_LIGHT, ItemSlug.POISON_BOLT, ItemSlug.CONFUSION, ItemSlug.CRIPPLE, ItemSlug.VULNERABILITY, ItemSlug.HEALING, ItemSlug.EMPOWER, ItemSlug.HASTE, ItemSlug.ENCHANT_WEAPON],
  Thrown: [ItemSlug.THROWING_DAGGER, ItemSlug.THROWING_AXE, ItemSlug.DARTS],
  Scroll: [ItemSlug.SCROLL],
  Charm: [ItemSlug.STATUE, ItemSlug.SKULL, ItemSlug.FEATHER, ItemSlug.BEADS, ItemSlug.HOOF],
  Trade: [ItemSlug.DIAMOND, ItemSlug.SAPPHIRE, ItemSlug.RUBY, ItemSlug.EMERALD, ItemSlug.AMETHYST],
  Potion: [ItemSlug.HEALING_POTION, ItemSlug.HEALING_POTION, ItemSlug.HEALING_POTION, ItemSlug.MANA_POTION, ItemSlug.MANA_POTION, ItemSlug.AMPLIFICATION_POTION, ItemSlug.RECOVERY_POTION, ItemSlug.CELERITY_POTION, ItemSlug.TURTLE_SOUP, ItemSlug.PURITY_POTION, ItemSlug.ALCHEMIST_FIRE, ItemSlug.TOXIC_GAS, ItemSlug.HOLY_WATER, ItemSlug.SCROLL],
};

export const CharmEnchantMaps: {[key in ItemSlug]?: EnchantSlug[]} = {
  [ItemSlug.STATUE]: [EnchantSlug.CURSING, EnchantSlug.VAMPIRIC, EnchantSlug.DAZZLING, EnchantSlug.SPIKEY, EnchantSlug.BERSERKER, EnchantSlug.FEARSOME],
  [ItemSlug.SKULL]: [EnchantSlug.GUIDED, EnchantSlug.KEEN, EnchantSlug.FLAMING, EnchantSlug.BRILLIANT, EnchantSlug.VENOMOUS, EnchantSlug.EXPLOSIVE],
  [ItemSlug.FEATHER]: [EnchantSlug.GRENADIER, EnchantSlug.SUPERIOR, EnchantSlug.TROLL, EnchantSlug.LIGHT, EnchantSlug.SEEKING, EnchantSlug.UTILITY],
  [ItemSlug.BEADS]: [EnchantSlug.FOCAL, EnchantSlug.MYSTIC, EnchantSlug.REFLECTIVE, EnchantSlug.WIZARD, EnchantSlug.CHANNELING],
  [ItemSlug.HOOF]: [EnchantSlug.DEFENDER, EnchantSlug.WARDED, EnchantSlug.ALCHEMIST, EnchantSlug.VIRTUOUS, EnchantSlug.PROTECTIVE, EnchantSlug.CLOAKING],
};

export const EquipmentSets: {[key in SkillSlug]?: IItemSave[]} = {
  [SkillSlug.ORDINARY]: [{slug: ItemSlug.SWORD_SHIELD, level: 0}, {slug: ItemSlug.CAP, level: 0}, {slug: ItemSlug.MAGIC_BOLT, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.MACE_SHIELD, level: 0}, {slug: ItemSlug.ALCHEMIST_FIRE, level: 0}],
  [SkillSlug.DEFT]: [{slug: ItemSlug.DAGGERS, level: 0}, {slug: ItemSlug.BANDANA, level: 0, enchant: [EnchantSlug.CLOAKING]}, {slug: ItemSlug.HASTE, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.SWORD_SHIELD, level: 0}, {slug: ItemSlug.DARTS, level: 0}],
  [SkillSlug.UNGIFTED]: [{slug: ItemSlug.AXE_SHIELD, level: 0}, {slug: ItemSlug.CAP, level: 0}, null, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, null, null, null, null,
    {slug: ItemSlug.BATTLE_AXE, level: 0}, {slug: ItemSlug.THROWING_AXE, level: 0}],
  [SkillSlug.ENLIGHTENED]: [{slug: ItemSlug.STAFF, level: 0}, {slug: ItemSlug.CONE, level: 0}, {slug: ItemSlug.FIREBALL, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.SWORD_SHIELD, level: 0}, {slug: ItemSlug.SCROLL, level: 0, scrollOf: ItemSlug.EMPOWER}],
  [SkillSlug.HOLY]: [{slug: ItemSlug.SWORD_SHIELD, level: 0}, {slug: ItemSlug.HELMET, level: 0}, {slug: ItemSlug.HEALING_POTION, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.SWORD_SHIELD, level: 0}, {slug: ItemSlug.HOLY_WATER, level: 0}],
  [SkillSlug.NOBLE]: [{slug: ItemSlug.SWORD_SHIELD, level: 1}, {slug: ItemSlug.CAP, level: 1}, {slug: ItemSlug.FIREBALL, level: 1}, null, null, {slug: ItemSlug.HEALING_POTION, level: 1}, {slug: ItemSlug.MANA_POTION, level: 1}, null, null, null,
    {slug: ItemSlug.MACE_SHIELD, level: 1}, {slug: ItemSlug.DIAMOND, level: 5}],
  [SkillSlug.CLEVER]: [{slug: ItemSlug.SHORT_SWORDS, level: 0}, {slug: ItemSlug.CAP, level: 0}, {slug: ItemSlug.VULNERABILITY, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.AXE_SHIELD, level: 0}, {slug: ItemSlug.THROWING_DAGGER, level: 0}],
  [SkillSlug.POWERFUL]: [{slug: ItemSlug.GREATSWORD, level: 0}, {slug: ItemSlug.HELMET, level: 0}, {slug: ItemSlug.LIGHTNING, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.SWORD_SHIELD, level: 0}, {slug: ItemSlug.THROWING_AXE, level: 0}],
  [SkillSlug.WILD]: [{slug: ItemSlug.DAGGERS, level: 0}, {slug: ItemSlug.CONE, level: 0}, {slug: ItemSlug.CONFUSION, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.MACE_SHIELD, level: 0}, {slug: ItemSlug.SCROLL, level: 0, scrollOf: ItemSlug.ENCHANT_WEAPON}, {slug: ItemSlug.MAGIC_BOLT, level: 0}],
  [SkillSlug.STUDIOUS]: [{slug: ItemSlug.STAFF, level: 0}, {slug: ItemSlug.CONE, level: 0}, {slug: ItemSlug.CRIPPLE, level: 0}, null, null, {slug: ItemSlug.HEALING_POTION, level: 0}, {slug: ItemSlug.MANA_POTION, level: 0}, null, null, null,
    {slug: ItemSlug.MACE_SHIELD, level: 0}, {slug: ItemSlug.TOXIC_GAS, level: 0}],
};

export const BasicStore: ItemSlug[] = [
  ItemSlug.BATTLE_AXE, ItemSlug.SHORT_SWORDS, ItemSlug.DAGGERS, ItemSlug.AXE_SHIELD, ItemSlug.MACE_SHIELD,
  ItemSlug.CAP, ItemSlug.HELMET, ItemSlug.SHORT_SWORDS, null, null,
  ItemSlug.THROWING_DAGGER, ItemSlug.THROWING_AXE, ItemSlug.DARTS, ItemSlug.ALCHEMIST_FIRE, ItemSlug.TOXIC_GAS,
  ItemSlug.HEALING_POTION, ItemSlug.HEALING_POTION, ItemSlug.HEALING_POTION, ItemSlug.MANA_POTION, ItemSlug.MANA_POTION,
];
