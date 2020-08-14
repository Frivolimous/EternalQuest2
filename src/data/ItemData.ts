import { StatTag, StatMap, StatMapLevel, AttackStatsLevel, LevelValue } from './StatData';
import { IAction, ActionSlug, IActionRaw } from './ActionData';
import { EffectSlug, IEffectRaw, IEffect } from './EffectData';
import { TalentSlug } from './SkillData';

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

export type ItemSlug = 'Greatsword' | 'Battle Axe' | 'Staff' | 'Short Swords' | 'Gloves' | 'Daggers' | 'Sword & Shield' | 'Axe & Shield' | 'Mace & Shield' | 'Shortbow' |
  'Bandana' | 'Cone' | 'Cap' | 'Helmet' | 'Armet' |
  'Magic Bolt' | 'Fireball' | 'Lightning' | 'Searing Light' | 'Poison Bolt' | 'Confusion' | 'Cripple' | 'Vulnerability' | 'Healing' | 'Empower' | 'Haste' | 'Enchant Weapon' |
  'Healing Potion' | 'Mana Potion' | 'Amplification Potion' | 'Recovery Potion' | 'Celerity Potion' | 'Turtle Soup' | 'Purity Potion' |
  'Alchemist Fire' | 'Toxic Gas' | 'Holy Water' | 'Throwing Dagger' | 'Throwing Axe' | 'Darts' |
  'Statue' | 'Skull' | 'Feather' | 'Beads' | 'Hoof' | 'Diamond' | 'Sapphire' | 'Ruby' | 'Emerald' | 'Amethyst' | 'Scroll' | 'Trophy';

export const ItemList: IItemRaw[] = [
  { slug: 'Greatsword', cost: 80, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 35, inc: 2.3 } }, costs: { action: 110 } } },
  { slug: 'Battle Axe', cost: 60, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 20, inc: 1.55 } }, costs: { action: 110 }, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 35, inc: 20 }, tags: ['Physical', 'Critical'] }}] } },
  { slug: 'Staff', cost: 50, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy', 'Mystic'], stats: [{ stat: 'magic', value: { base: 10, inc: 4 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.2 } }, costs: { action: 110 } } },
  { slug: 'Short Swords', cost: 60, tags: ['Equipment', 'Double', 'Weapon', 'Melee'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.2 } }, costs: { action: 100 } } },
  { slug: 'Gloves', cost: 30, tags: ['Equipment', 'Weapon', 'Melee', 'Unarmed'] },
  { slug: 'Daggers', cost: 45, tags: ['Equipment', 'Weapon', 'Double', 'Light Melee', 'Finesse'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 14, inc: 1.06 }, hit: { base: 0.05, inc: 0.005 } }, costs: { action: 90 } } },
  { slug: 'Sword & Shield', cost: 70, tags: ['Equipment', 'Weapon', 'Melee'], stats: [{ stat: 'block', value: { base: 0.05, inc: 0.005 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 26, inc: 1.7 } }, costs: { action: 100 } } },
  { slug: 'Axe & Shield', cost: 55, tags: ['Equipment', 'Weapon', 'Melee'], stats: [{ stat: 'block', value: { base: 0.05, inc: 0.005 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 23, inc: 1.5 } }, costs: { action: 100 }, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 27, inc: 15 }, tags: ['Physical', 'Critical'] }}] } },
  { slug: 'Mace & Shield', cost: 50, tags: ['Equipment', 'Weapon', 'Melee', 'Mystic'], stats: [{ stat: 'block', value: { base: 0.06, inc: 0.006 } }, { stat: 'magic', value: { base: 5, inc: 2.5 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 14, inc: 1.1 } }, costs: { action: 100 } } },
  { slug: 'Shortbow', cost: 80, tags: ['Equipment', 'Weapon', 'Ranged'], action: { slug: 'strike', type: 'attack', tags: ['Physical', 'Projectile'], distance: [2, 3], stats: { baseDamage: { base: 53, inc: 1.5 } }, costs: { action: 100 } } },

  { slug: 'Bandana', cost: 30, tags: ['Equipment', 'Helmet', 'Agile'], stats: [{ stat: 'health', value: { base: 60, inc: 25 } }] },
  { slug: 'Cone', cost: 60, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 75, inc: 37 } }, { stat: 'fortification', value: 0.1 }, { stat: 'mana', value: { base: 10, inc: 3 } }] },
  { slug: 'Cap', cost: 50, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 80, inc: 40 } }, { stat: 'fortification', value: 0.1 }] },
  { slug: 'Helmet', cost: 80, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 100, inc: 52 } }, { stat: 'fortification', value: 0.2 }, { stat: 'speed', value: -1 }, { stat: 'dodge', value: -0.1 }] },
  { slug: 'Armet', cost: 100, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', value: { base: 120, inc: 62 } }, { stat: 'fortification', value: 0.3 }, { stat: 'speed', value: -2 }, { stat: 'dodge', value: -0.2 }] },

  { slug: 'Magic Bolt', cost: 60, tags: ['Equipment', 'Spell'], action: { slug: 'Magic Bolt', type: 'attack', tags: ['Magical', 'Projectile', 'Force'], distance: [1, 2, 3], stats: { baseDamage: { base: 36, inc: 4.2 }, hit: 0.05 }, costs: { action: 75, mana: { base: 15, inc: 0.8 } } } },
  { slug: 'Fireball', cost: 80, tags: ['Equipment', 'Spell'], action: { slug: 'Fireball', type: 'attack', tags: ['Magical', 'Projectile', 'Fire'], distance: [1, 2, 3], stats: { baseDamage: { base: 41, inc: 5.55 } }, effects: ['burning'], costs: { action: 100, mana: { base: 20, inc: 1.8 } } } },
  { slug: 'Lightning', cost: 100, tags: ['Equipment', 'Spell'], action: { slug: 'Lightning', type: 'attack', tags: ['Magical', 'Electric'], distance: [1, 2], stats: { baseDamage: { base: 49, inc: 7.95 } }, effects: ['stunned'], costs: { action: 100, mana: { base: 25, inc: 2.7 } } } },
  { slug: 'Searing Light', cost: 140, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Searing Light', type: 'attack', tags: ['Spirit', 'Holy'], distance: [1, 2], stats: { baseDamage: { base: 75, inc: 12.7 } }, costs: { action: 100, mana: { base: 40, inc: 4.25 } } } },

  { slug: 'Poison Bolt', cost: 75, tags: ['Equipment', 'Spell'], action: { slug: 'Poison Bolt', type: 'curse', tags: ['Magical', 'Curse', 'Toxic', 'Projectile'], distance: [1, 2, 3], effects: ['poisoned'], costs: { action: 100, mana: { base: 15, inc: 0.8 } } } },

  { slug: 'Confusion', cost: 85, tags: ['Equipment', 'Spell'], action: { slug: 'Confusion', type: 'curse', tags: ['Magical', 'Curse', 'Control'], distance: [1, 2], effects: ['confused'], costs: { action: 100, mana: { base: 13, inc: 1.5 } } } },
  { slug: 'Cripple', cost: 75, tags: ['Equipment', 'Spell'], action: { slug: 'Cripple', type: 'curse', tags: ['Magical', 'Curse'], distance: [1, 2], effects: ['weakened'], costs: { action: 100, mana: { base: 23, inc: 0.75 } } } },
  { slug: 'Vulnerability', cost: 90, tags: ['Equipment', 'Spell'], action: { slug: 'Vulnerability', type: 'curse', tags: ['Magical', 'Curse'], distance: [1, 2], effects: ['vulnerable'], costs: { action: 100, mana: { base: 25, inc: 1.05 } } } },

  { slug: 'Healing', cost: 95, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Healing', type: 'heal', tags: ['Holy', 'Spirit', 'Healing'], heals: {health: {base: 78, inc: 6.65}}, distance: ['b', 1, 2, 3], costs: { action: 100, mana: { base: 25, inc: 1.6 } } } },

  { slug: 'Empower', cost: 110, tags: ['Equipment', 'Spell'], action: { slug: 'Empower', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['empowered'], costs: { action: 100, mana: { base: 13, inc: 0.8 } } } },
  { slug: 'Haste', cost: 70, tags: ['Equipment', 'Spell'], action: { slug: 'Haste', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['hastened'], costs: { action: 100, mana: { base: 16, inc: 1.3 } } } },
  { slug: 'Enchant Weapon', cost: 70, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Enchant Weapon', type: 'buff', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['enchanted'], costs: { action: 100, mana: { base: 13, inc: 0.8 } } } },

  { slug: 'Healing Potion', cost: 30, tags: ['Belt', 'Potion'], action: { slug: 'Healing', type: 'heal', tags: ['Chemical', 'Healing'], heals: { health: {base: 130, inc: 10.6}}, distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: 'Mana Potion', cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Restore', type: 'heal', tags: ['Chemical', 'Healing'], heals: { mana: {base: 60, inc: 3.15}}, distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: 'Recovery Potion', cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Healing', type: 'heal', tags: ['Chemical', 'Healing'], heals: { health: {base: 95, inc: 7}, mana: {base: 34, inc: 1.35}}, distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: 'Amplification Potion', cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['amplified'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: 'Turtle Soup', cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['turtle'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: 'Celerity Potion', cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['celerity'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },
  { slug: 'Purity Potion', cost: 40, tags: ['Belt', 'Potion'], action: { slug: 'Amplify', type: 'buff', tags: ['Chemical', 'Buff'], effects: ['purity'], distance: ['b', 1, 2, 3], costs: { action: 100 } }, charges: 6 },

  { slug: 'Alchemist Fire', cost: 20, tags: ['Belt', 'Grenade'], action: { slug: 'Grenade', type: 'attack', tags: ['Chemical', 'Fire'], distance: ['b', 1, 2, 3], stats: {baseDamage: {base: 75, inc: 4.45}}, costs: { action: 100 } }, charges: 6 },
  { slug: 'Toxic Gas', cost: 20, tags: ['Belt', 'Grenade'], action: { slug: 'Grenade', type: 'curse', tags: ['Chemical', 'Curse', 'Toxic'], distance: ['b', 1, 2, 3], effects: ['gassed'], costs: { action: 100 } }, charges: 6 },
  { slug: 'Holy Water', cost: 20, tags: ['Belt', 'Grenade'], action: { slug: 'Grenade', type: 'attack', tags: ['Holy', 'Spirit'], distance: ['b', 1, 2, 3], stats: {baseDamage: {base: 68, inc: 4.15}}, effects: ['blinded'], costs: { action: 100 } }, charges: 6 },

  { slug: 'Throwing Axe', cost: 20, tags: ['Belt', 'Heavy', 'Thrown'], action: { slug: 'throw', type: 'attack', tags: ['Physical', 'Projectile'], distance: [1, 2], stats: {baseDamage: {base: 39, inc: 2.8}}, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 35, inc: 20 }, tags: ['Physical', 'Critical'] }}], costs: { action: 110 } }, charges: 6 },
  { slug: 'Throwing Dagger', cost: 20, tags: ['Belt', 'Finesse', 'Thrown'], action: { slug: 'throw', type: 'attack', tags: ['Physical', 'Projectile'], distance: [1, 2], stats: {baseDamage: {base: 34, inc: 2.2}, hit: {base: 0.1, inc: 0.01}}, costs: { action: 100 } }, charges: 6 },
  { slug: 'Darts', cost: 30, tags: ['Belt', 'Thrown'], action: { slug: 'throw', type: 'attack', tags: ['Physical', 'Projectile'], distance: [1, 2, 3], stats: {baseDamage: {base: 35, inc: 1.5}, hit: {base: 0.1, inc: 0.01}}, costs: { action: 90 } }, charges: 20 },

  { slug: 'Statue', cost: 100, tags: ['Belt', 'Charm']},
  { slug: 'Skull', cost: 100, tags: ['Belt', 'Charm']},
  { slug: 'Feather', cost: 100, tags: ['Belt', 'Charm']},
  { slug: 'Beads', cost: 100, tags: ['Belt', 'Charm']},
  { slug: 'Hoof', cost: 100, tags: ['Belt', 'Charm']},

  { slug: 'Diamond', cost: 200, tags: ['Trade']},
  { slug: 'Sapphire', cost: 180, tags: ['Trade']},
  { slug: 'Ruby', cost: 160, tags: ['Trade']},
  { slug: 'Emerald', cost: 140, tags: ['Trade']},
  { slug: 'Amethyst', cost: 120, tags: ['Trade']},

  { slug: 'Scroll', cost: 0, tags: ['Belt', 'Scroll'], charges: 1},

  { slug: 'Trophy', cost: 3500, tags: ['Belt', 'Charm', 'Relic'], stats: [{stat: 'power', value: {base: 2, inc: 2}}, {stat: 'health', value: {base: 4, inc: 4}}]},
];

export const ItemScrollSlugs: ItemSlug[] = ['Magic Bolt', 'Fireball', 'Lightning', 'Searing Light', 'Poison Bolt', 'Confusion', 'Cripple', 'Vulnerability', 'Healing', 'Empower', 'Haste', 'Enchant Weapon'];

export type EnchantSlug = 'Master' | 'Focal' | 'Mystic' | 'Guided' | 'Keen' | 'Grenadier' |
  'Defender' | 'Flaming' | 'Brilliant' | 'Venomous' | 'Explosive' | 'Cursing' | 'Vampiric' | 'Dazzling' | 'Reflective' |
  'Superior' | 'Wizard' | 'Troll' | 'Channeling' | 'Light' | 'Warded' | 'Alchemist' | 'Virtuous' |
  'Protective' | 'Seeking' | 'Cloaking' | 'Utility' | 'Spikey' | 'Berserker' | 'Fearsome' |
  'Homing' | 'Plentiful' | 'Unlimited' | 'Ready';
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

    stats?: Partial<AttackStatsLevel>;
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
  {slug: 'Master', costMult: 3, action: {stats: {baseDamage: {base: 2, inc: 1}}}},
  {slug: 'Focal', costMult: 3.5, stats: [{stat: 'manacost', value: {base: -0.01, inc: -0.005}}]},
  {slug: 'Mystic', costMult: 2, stats: [{stat: 'magic', value: {base: 2, inc: 2}}], action: {tags: ['Mystic']}},
  {slug: 'Guided', costMult: 3.5, action: {stats: {hit: {base: 0.01, inc: 0.01}}}},
  {slug: 'Keen', costMult: 3, action: {stats: {critRate: {base: 0.02, inc: 0.0054}}}},
  {slug: 'Grenadier', costMult: 3, stats: [{stat: 'power', tag: 'Grenade', value: {base: 2, inc: 2}}], action: {tags: ['Cryptic']}},
  {slug: 'Defender', costMult: 3.1, stats: [{stat: 'block', value: {base: 0.01, inc: 0.01}}]},
  {slug: 'Flaming', costMult: 3.4, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'hit', target: 'target', damage: {value: { base: 5, inc: 2 }, tags: ['Magical', 'Fire'] }}]}},
  {slug: 'Brilliant', costMult: 3.5, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'hit', target: 'target', damage: {value: { base: 5, inc: 2 }, tags: ['Spirit', 'Holy'] }}]}},
  {slug: 'Venomous', costMult: 3.4, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'hit', target: 'target', damage: {value: { base: 5, inc: 2 }, tags: ['Chemical', 'Toxic'] }}]}},
  {slug: 'Explosive', costMult: 2.7, action: {effects: [{ slug: 'proc', type: 'damage', trigger: 'crit', target: 'target', damage: {value: { base: 27, inc: 8 }, tags: ['Magical', 'Force', 'Critical'] }}]}},
  {slug: 'Cursing', costMult: 2.9, action: {effects: ['cursed']}},
  {slug: 'Vampiric', costMult: 3.5, action: {effects: ['lifesteal']}},
  {slug: 'Dazzling', costMult: 3.4, action: {effects: ['dazzled']}},
  {slug: 'Reflective', costMult: 3.2, stats: [{stat: 'turn', value: {base: 0.05, inc: 0.005}}]},

  {slug: 'Superior', costMult: 3, stats: [{stat: 'health', value: {base: 20, inc: 4}}]},
  {slug: 'Wizard', costMult: 3.5, stats: [{stat: 'mana', value: {base: 8, inc: 2}}]},
  {slug: 'Troll', costMult: 4, stats: [{stat: 'hregen', value: {base: 0.0025, inc: 0.0005}}]},
  {slug: 'Channeling', costMult: 4, stats: [{stat: 'mregen', value: {base: 0.004, inc: 0.0006}}]},
  {slug: 'Light', costMult: 3, stats: [{stat: 'speed', value: {base: 0.5, inc: 0.1}}]},
  {slug: 'Warded', costMult: 3, stats: [{stat: 'resist', tag: 'Magical', value: {base: 0.1, inc: 0.01}}]},
  {slug: 'Alchemist', costMult: 3, stats: [{stat: 'resist', tag: 'Chemical', value: {base: 0.1, inc: 0.01}}]},
  {slug: 'Virtuous', costMult: 3, stats: [{stat: 'resist', tag: 'Spirit', value: {base: 0.1, inc: 0.01}}]},
  {slug: 'Protective', costMult: 3.6, stats: [{stat: 'resist', tag: 'Magical', value: {base: 0.03, inc: 0.003}}, {stat: 'resist', tag: 'Chemical', value: {base: 0.03, inc: 0.003}}, {stat: 'resist', tag: 'Spirit', value: {base: 0.03, inc: 0.003}}]},
  {slug: 'Seeking', costMult: 4, stats: [{stat: 'iloot', value: {base: 0.05, inc: 0.005}}]},
  {slug: 'Cloaking', costMult: 3, stats: [{stat: 'dodge', value: {base: 0.05, inc: 0.005}}]},
  {slug: 'Utility', costMult: 2.6, stats: [{stat: 'intellect', value: {base: 2, inc: 2}}]},
  {slug: 'Spikey', costMult: 2.7, triggers: ['spikey']},
  {slug: 'Berserker', costMult: 2.5, triggers: ['berserk']},
  {slug: 'Fearsome', costMult: 3.4, triggers: ['afraid']},

  {slug: 'Homing', costMult: 3, action: {stats: {penetration: 0.1}}},
  {slug: 'Plentiful', costMult: 2, chargeMult: 2},
  {slug: 'Unlimited', costMult: 20, chargeMult: Infinity},
  {slug: 'Ready', costMult: 3, action: {costs: {action: -10}}},
  // {slug: 'Shadow', costMult: 6},
];

export const EnchantMaps: Partial<{[key in StatTag]: EnchantSlug[]}> = {
  Weapon: ['Master', 'Mystic', 'Guided', 'Keen', 'Grenadier', 'Defender', 'Flaming', 'Brilliant', 'Venomous', 'Explosive', 'Cursing', 'Vampiric', 'Dazzling', 'Reflective'],
  Helmet: ['Superior', 'Wizard', 'Troll', 'Channeling', 'Light', 'Warded', 'Alchemist', 'Virtuous', 'Protective', 'Seeking', 'Cloaking', 'Utility', 'Spikey', 'Berserker', 'Fearsome'],
  Thrown: ['Master', 'Keen', 'Guided', 'Flaming', 'Brilliant', 'Venomous', 'Explosive', 'Cursing', 'Vampiric', 'Dazzling', 'Homing', 'Plentiful', 'Ready'],
  Charm: ['Mystic', 'Guided', 'Keen', 'Grenadier', 'Defender', 'Flaming', 'Brilliant', 'Venomous', 'Explosive', 'Cursing', 'Vampiric', 'Dazzling', 'Reflective',
          'Superior', 'Wizard', 'Troll', 'Channeling', 'Light', 'Warded', 'Alchemist', 'Virtuous', 'Protective', 'Seeking', 'Cloaking', 'Utility', 'Spikey', 'Berserker', 'Fearsome'],
  Spell: [],
  Potion: [],
  Grenade: [],
};

export const LootMap: Partial<{[key in StatTag]: ItemSlug[]}> = {
  Weapon: ['Greatsword', 'Battle Axe', 'Staff', 'Short Swords', 'Gloves', 'Daggers', 'Sword & Shield', 'Axe & Shield', 'Mace & Shield', 'Shortbow'],
  Helmet: ['Bandana', 'Cone', 'Cap', 'Helmet', 'Armet'],
  Spell: ['Magic Bolt', 'Fireball', 'Lightning', 'Searing Light', 'Poison Bolt', 'Confusion', 'Cripple', 'Vulnerability', 'Healing', 'Empower', 'Haste', 'Enchant Weapon'],
  Thrown: ['Throwing Dagger', 'Throwing Axe', 'Darts'],
  Scroll: ['Scroll'],
  Charm: ['Statue', 'Skull', 'Feather', 'Beads', 'Hoof'],
  Trade: ['Diamond', 'Sapphire', 'Ruby', 'Emerald', 'Amethyst'],
  Potion: ['Healing Potion', 'Healing Potion', 'Healing Potion', 'Mana Potion', 'Mana Potion', 'Recovery Potion', 'Amplification Potion', 'Turtle Soup', 'Celerity Potion', 'Alchemist Fire', 'Alchemist Fire', 'Toxic Gas', 'Toxic Gas', 'Holy Water', 'Holy Water'],
};

export const CharmEnchantMaps: Partial<{[key in ItemSlug]: EnchantSlug[]}> = {
  Statue: ['Cursing', 'Vampiric', 'Dazzling', 'Spikey', 'Berserker', 'Fearsome'],
  Skull: ['Guided', 'Keen', 'Flaming', 'Brilliant', 'Venomous', 'Explosive'],
  Feather: ['Grenadier', 'Superior', 'Troll', 'Light', 'Seeking', 'Utility'],
  Beads: ['Focal', 'Mystic', 'Reflective', 'Wizard', 'Channeling'],
  Hoof: ['Defender', 'Warded', 'Alchemist', 'Virtuous', 'Protective', 'Cloaking'],
};

export const EquipmentSets: {[key in TalentSlug]: IItemSave[]} = {
  Ordinary: [{slug: 'Sword & Shield', level: 0}, {slug: 'Cap', level: 0}, {slug: 'Magic Bolt', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Mace & Shield', level: 0}, {slug: 'Alchemist Fire', level: 0}],
  Deft: [{slug: 'Daggers', level: 0}, {slug: 'Bandana', level: 0, enchant: ['Cloaking']}, {slug: 'Haste', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Sword & Shield', level: 0}, {slug: 'Darts', level: 0}],
  Ungifted: [{slug: 'Axe & Shield', level: 0}, {slug: 'Cap', level: 0}, null, null, null, {slug: 'Healing Potion', level: 0}, null, null, null, null,
    {slug: 'Battle Axe', level: 0}, {slug: 'Throwing Axe', level: 0}],
  Enlightened: [{slug: 'Staff', level: 0}, {slug: 'Cone', level: 0}, {slug: 'Fireball', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Sword & Shield', level: 0}, {slug: 'Scroll', level: 0, scrollOf: 'Empower'}],
  Holy: [{slug: 'Sword & Shield', level: 0}, {slug: 'Helmet', level: 0}, {slug: 'Healing', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Sword & Shield', level: 0}, {slug: 'Holy Water', level: 0}],
  Noble: [{slug: 'Sword & Shield', level: 1}, {slug: 'Cap', level: 1}, {slug: 'Fireball', level: 1}, null, null, {slug: 'Healing Potion', level: 1}, {slug: 'Mana Potion', level: 1}, null, null, null,
    {slug: 'Mace & Shield', level: 1}, {slug: 'Diamond', level: 5}],
  Clever: [{slug: 'Short Swords', level: 0}, {slug: 'Cap', level: 0}, {slug: 'Vulnerability', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Axe & Shield', level: 0}, {slug: 'Throwing Dagger', level: 0}],
  Powerful: [{slug: 'Greatsword', level: 0}, {slug: 'Helmet', level: 0}, {slug: 'Lightning', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Sword & Shield', level: 0}, {slug: 'Throwing Axe', level: 0}],
  Wild: [{slug: 'Daggers', level: 0}, {slug: 'Cone', level: 0}, {slug: 'Confusion', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Mace & Shield', level: 0}, {slug: 'Scroll', level: 0, scrollOf: 'Enchant Weapon'}, {slug: 'Magic Bolt', level: 0}],
  Studious: [{slug: 'Staff', level: 0}, {slug: 'Cone', level: 0}, {slug: 'Cripple', level: 0}, null, null, {slug: 'Healing Potion', level: 0}, {slug: 'Mana Potion', level: 0}, null, null, null,
    {slug: 'Mace & Shield', level: 0}, {slug: 'Toxic Gas', level: 0}],
};

export const BasicStore: ItemSlug[] = [
  'Battle Axe', 'Short Swords', 'Daggers', 'Axe & Shield', 'Mace & Shield',
  'Cap', 'Helmet', 'Shortbow', null, null,
  'Throwing Dagger', 'Throwing Axe', 'Darts', 'Alchemist Fire', 'Toxic Gas',
  'Healing Potion', 'Healing Potion', 'Healing Potion', 'Mana Potion', 'Mana Potion',
];
