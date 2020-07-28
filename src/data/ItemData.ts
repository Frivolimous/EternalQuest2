import { StatTag, StatMap, StatMapLevel, AttackStatsLevel, LevelValue } from './StatData';
import { IAction, ActionSlug, IActionRaw } from './ActionData';
import { EffectSlug, IEffectRaw, IEffect } from './EffectData';

export interface IItemRaw {
  slug: ItemSlug;
  tags: StatTag[];
  cost: number;

  stats?: StatMapLevel;
  action?: ActionSlug | IActionRaw;
  triggers?: (EffectSlug | IEffectRaw)[];
}

export interface IItem {
  name: string;
  slug: ItemSlug;
  enchantSlug?: EnchantSlug;
  level: number;
  tags: StatTag[];
  cost: number;

  stats?: StatMap;
  action?: IAction;
  triggers?: IEffect[];
}

export interface IItemSave {
  slug: ItemSlug;
  level: number;
  enchant?: EnchantSlug | EnchantSlug[];
  charges?: number;
  priorities?: any;
}

export type ItemSlug = 'Greatsword' | 'Battle Axe' | 'Staff' | 'Short Swords' | 'Gloves' | 'Daggers' | 'Sword & Shield' | 'Axe & Shield' | 'Mace & Shield' | 'Shortbow' |
  'Bandana' | 'Cone' | 'Cap' | 'Helmet' | 'Armet' |
  'Magic Bolt' | 'Fireball' | 'Lightning' | 'Searing Light' | 'Poison Bolt' | 'Confusion' | 'Cripple' | 'Vulnerability' | 'Healing' | 'Empower' | 'Haste' | 'Enchant Weapon';

export const ItemList: IItemRaw[] = [
  { slug: 'Greatsword', cost: 80, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 35, inc: 2.3 } }, costs: { action: 100 } } },
  { slug: 'Battle Axe', cost: 60, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 20, inc: 1.55 } }, costs: { action: 100 }, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', value: { base: 35, inc: 20 }, damageTags: ['Physical', 'Critical'] }] } },
  { slug: 'Staff', cost: 50, tags: ['Equipment', 'Weapon', 'Melee', 'Heavy', 'Mystic'], stats: [{ stat: 'magic', value: { base: 10, inc: 4 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.2 } }, costs: { action: 100 } } },
  { slug: 'Short Swords', cost: 60, tags: ['Equipment', 'Weapon', 'Melee'], action: { slug: 'strike', type: 'attack', double: true, tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.2 } }, costs: { action: 100 } } },
  { slug: 'Gloves', cost: 30, tags: ['Equipment', 'Weapon', 'Melee', 'Unarmed'] },
  { slug: 'Daggers', cost: 45, tags: ['Equipment', 'Weapon', 'Light Melee', 'Finesse'], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 15, inc: 1.07 }, hit: { base: 0.05, inc: 0.005 } }, costs: { action: 100 } } },
  { slug: 'Sword & Shield', cost: 70, tags: ['Equipment', 'Weapon', 'Melee'], stats: [{ stat: 'block', value: { base: 0.05, inc: 0.005 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 26, inc: 1.7 } }, costs: { action: 100 } } },
  { slug: 'Axe & Shield', cost: 55, tags: ['Equipment', 'Weapon', 'Melee'], stats: [{ stat: 'block', value: { base: 0.05, inc: 0.005 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 23, inc: 1.5 } }, costs: { action: 100 }, effects: [{ slug: 'Bonus Physical', type: 'damage', trigger: 'crit', target: 'target', value: { base: 27, inc: 15 }, damageTags: ['Physical', 'Critical'] }] } },
  { slug: 'Mace & Shield', cost: 50, tags: ['Equipment', 'Weapon', 'Melee', 'Mystic'], stats: [{ stat: 'block', value: { base: 0.06, inc: 0.006 } }, { stat: 'magic', value: { base: 5, inc: 2.5 } }], action: { slug: 'strike', type: 'attack', tags: ['Physical'], distance: [1], stats: { baseDamage: { base: 14, inc: 1.1 } }, costs: { action: 100 } } },
  { slug: 'Shortbow', cost: 80, tags: ['Equipment', 'Weapon', 'Ranged'], action: { slug: 'strike', type: 'attack', tags: ['Physical', 'Projectile'], distance: [2, 3], stats: { baseDamage: { base: 53, inc: 1.5 } }, costs: { action: 100 } } },

  { slug: 'Bandana', cost: 30, tags: ['Equipment', 'Helmet', 'Agile'], stats: [{ stat: 'health', tag: 'Base', value: { base: 60, inc: 25 } }] },
  { slug: 'Cone', cost: 60, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', tag: 'Base', value: { base: 75, inc: 37 } }, { stat: 'fortification', value: 0.1 }, { stat: 'mana', value: { base: 10, inc: 3 } }] },
  { slug: 'Cap', cost: 50, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', tag: 'Base', value: { base: 80, inc: 40 } }, { stat: 'fortification', value: 0.1 }] },
  { slug: 'Helmet', cost: 80, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', tag: 'Base', value: { base: 100, inc: 52 } }, { stat: 'fortification', value: 0.2 }, { stat: 'speed', value: -1 }, { stat: 'dodge', value: -0.1 }] },
  { slug: 'Armet', cost: 100, tags: ['Equipment', 'Helmet'], stats: [{ stat: 'health', tag: 'Base', value: { base: 120, inc: 62 } }, { stat: 'fortification', value: 0.3 }, { stat: 'speed', value: -2 }, { stat: 'dodge', value: -0.2 }] },

  { slug: 'Magic Bolt', cost: 60, tags: ['Equipment', 'Spell'], action: { slug: 'Magic Bolt', type: 'attack', tags: ['Magical', 'Projectile', 'Force'], distance: [1, 2, 3], stats: { baseDamage: { base: 36, inc: 4.2 }, hit: 0.05 }, costs: { action: 75, mana: { base: 15, inc: 0.8 } } } },
  { slug: 'Fireball', cost: 80, tags: ['Equipment', 'Spell'], action: { slug: 'Fireball', type: 'attack', tags: ['Magical', 'Projectile', 'Fire'], distance: [1, 2, 3], stats: { baseDamage: { base: 41, inc: 5.55 } }, effects: ['burning'], costs: { action: 100, mana: { base: 20, inc: 1.8 } } } },
  { slug: 'Lightning', cost: 100, tags: ['Equipment', 'Spell'], action: { slug: 'Lightning', type: 'attack', tags: ['Magical', 'Electric'], distance: [1, 2], stats: { baseDamage: { base: 49, inc: 7.95 } }, effects: ['stunned'], costs: { action: 100, mana: { base: 25, inc: 2.7 } } } },
  { slug: 'Searing Light', cost: 140, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Searing Light', type: 'attack', tags: ['Spirit', 'Holy'], distance: [1, 2], stats: { baseDamage: { base: 75, inc: 12.7 } }, costs: { action: 100, mana: { base: 40, inc: 4.25 } } } },

  { slug: 'Poison Bolt', cost: 75, tags: ['Equipment', 'Spell'], action: { slug: 'Poison Bolt', type: 'attack', tags: ['Magical', 'Curse', 'Toxic'], distance: [1, 2, 3], effects: ['poisoned'], costs: { action: 100, mana: { base: 15, inc: 0.8 } } } },

  { slug: 'Confusion', cost: 85, tags: ['Equipment', 'Spell'], action: { slug: 'Confusion', type: 'attack', tags: ['Magical', 'Curse', 'Control'], distance: [1, 2], effects: ['confused'], costs: { action: 100, mana: { base: 13, inc: 1.5 } } } },
  { slug: 'Cripple', cost: 75, tags: ['Equipment', 'Spell'], action: { slug: 'Cripple', type: 'attack', tags: ['Magical', 'Curse'], distance: [1, 2], effects: ['weakened'], costs: { action: 100, mana: { base: 23, inc: 0.75 } } } },
  { slug: 'Vulnerability', cost: 90, tags: ['Equipment', 'Spell'], action: { slug: 'Vulnerability', type: 'attack', tags: ['Magical', 'Curse'], distance: [1, 2], effects: ['vulnerable'], costs: { action: 100, mana: { base: 25, inc: 1.05 } } } },

  { slug: 'Healing', cost: 95, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Healing', type: 'heal', tags: ['Magical', 'Buff', 'Holy', 'Spirit'], stats: { baseDamage: {base: 78, inc: 6.65}}, distance: ['b', 1, 2, 3], costs: { action: 100, mana: { base: 25, inc: 1.6 } } } },

  { slug: 'Empower', cost: 110, tags: ['Equipment', 'Spell'], action: { slug: 'Empower', type: 'self', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['empowered'], costs: { action: 100, mana: { base: 13, inc: 0.8 } } } },
  { slug: 'Haste', cost: 70, tags: ['Equipment', 'Spell'], action: { slug: 'Haste', type: 'self', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['hastened'], costs: { action: 100, mana: { base: 16, inc: 1.3 } } } },
  { slug: 'Enchant Weapon', cost: 70, tags: ['Equipment', 'Spell', 'Incanted'], action: { slug: 'Enchant Weapon', type: 'self', tags: ['Magical', 'Buff'], distance: ['b', 1, 2, 3], effects: ['enchanted'], costs: { action: 100, mana: { base: 13, inc: 0.8 } } } },

  // 				case 31: return new ItemModel(_index,"Healing Potion",_level,USEABLE,POTION,HEALING,30,ActionData.makeAction(ActionData.HEALING_POT,_level),null,(_charges>=0)?_charges:(Math.ceil(Math.random()*6)));
  // 				case 32: return new ItemModel(_index,"Mana Potion",_level,USEABLE,POTION,MANA,40,ActionData.makeAction(ActionData.MANA_POT,_level),null,(_charges>=0)?_charges:(Math.ceil(Math.random()*6)));
  // 				case 33: return new ItemModel(_index,"Amplification Potion",_level,USEABLE,POTION,BUFF,40,ActionData.makeAction(ActionData.BUFF_POT,_level),null,(_charges>=0)?_charges:(Math.ceil(Math.random()*6)));
  // 				case 34: return new ItemModel(_index,"Alchemist Fire",_level,USEABLE,GRENADE,DAMAGING,20,ActionData.makeAction(ActionData.ALCH_POT,_level),null,(_charges>=0)?_charges:(Math.ceil(Math.random()*6)));
  // 				case 35: return new ItemModel(_index,"Toxic Gas",_level,USEABLE,GRENADE,CURSE,20,ActionData.makeAction(ActionData.POISON_POT,_level),null,(_charges>=0)?_charges:(Math.ceil(Math.random()*6)));
  // 				case 36: return new ItemModel(_index,"Holy Water",_level,USEABLE,GRENADE,DAMAGING,20,ActionData.makeAction(ActionData.HOLY_POT,_level),null,(_charges>=0)?_charges:(Math.ceil(Math.random()*6)));

  // 				case 37: return new ItemModel(_index,"Throwing Dagger",_level,USEABLE,PROJECTILE,DAMAGING,20,ActionData.makeAction(ActionData.THROW_D,_level),null,(_charges>=0)?_charges:Math.ceil(5+Math.random()*5));
  // 				case 38: return new ItemModel(_index,"Throwing Axe",_level,USEABLE,PROJECTILE,DAMAGING,20,ActionData.makeAction(ActionData.THROW_A,_level),null,(_charges>=0)?_charges:Math.ceil(5+Math.random()*5));
  // 				case 39: return new ItemModel(_index,"Darts",_level,USEABLE,PROJECTILE,DAMAGING,30,ActionData.makeAction(ActionData.SHOOT,_level),null,(_charges>=0)?_charges:Math.ceil(5+Math.random()*20));

  // 				case 40: return new ItemModel(_index,"Statue",_level,USEABLE,CHARM,BUFF,100);
  // 				case 41: return new ItemModel(_index,"Skull",_level,USEABLE,CHARM,BUFF,100);
  // 				case 42: return new ItemModel(_index,"Feather",_level,USEABLE,CHARM,BUFF,100);
  // 				case 43: return new ItemModel(_index,"Beads",_level,USEABLE,CHARM,BUFF,100);
  // 				case 44: return new ItemModel(_index,"Hoof",_level,USEABLE,CHARM,BUFF,100);

  // 				case 45: return new ItemModel(_index,"Diamond",_level,TRADE,TRADE,"",200*(1+0.1*_level));
  // 				case 46: return new ItemModel(_index,"Sapphire",_level,TRADE,TRADE,"",180*(1+0.1*_level));
  // 				case 47: return new ItemModel(_index,"Ruby",_level,TRADE,TRADE,"",160*(1+0.1*_level));
  // 				case 48: return new ItemModel(_index,"Emerald",_level,TRADE,TRADE,"",140*(1+0.1*_level));
  // 				case 49: return new ItemModel(_index,"Amethyst",_level,TRADE,TRADE,"",120*(1+0.1*_level));

  // { slug: 'Quick Charm', tags: ['Belt'], compoundStats: [{ stat: 'dexterity', value: {base: 10, inc: 1} }]},
  // { slug: 'Magic Missile', tags: ['Equipment', 'Spell'], action: 'magicMissile' },
  // { slug: 'Life Tap', tags: ['Equipment', 'Spell'], action: 'lifetap' },

];

export type EnchantSlug = 'Master' | 'Mystic';

export interface IEnchantRaw {
  slug: EnchantSlug;
  tags?: StatTag[];
  stats?: StatMapLevel;
  triggers?: (EffectSlug | IEffectRaw)[];

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
  { slug: 'Master', action: { stats: { baseDamage: { base: 2, inc: 1 } } } },
  { slug: 'Mystic', action: { tags: ['Mystic'] } },
];
