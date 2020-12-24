export type AnyStat = BaseStat | CompoundStat;

export type BaseStat = AttackStat | VitalStat | DefenseStat | SpecialStat;

export type AttackStat = 'baseDamage' | 'power' | 'critRate' | 'critMult' | 'hit' | 'penetration' | 'rate';
export type VitalStat = 'health' | 'mana' | 'hregen' | 'mregen' | 'speed' | 'initiative' | 'efficiency' | 'manacost';
export type DefenseStat = 'resist' | 'avoid' | 'devaluation';
export type SpecialStat = 'iloot' | 'magicSlots' | 'beltSlots';

export type CompoundStat = 'strength' | 'dexterity' | 'cunning' | 'magic' | 'accuracy' |
  'parry' | 'block' | 'dodge' | 'turn' | 'tenacity' | 'fortification';

export function isCompoundStat(stat: BaseStat | CompoundStat): stat is CompoundStat {
  return (stat === 'strength' || stat === 'dexterity' || stat === 'cunning' || stat === 'magic' || stat === 'accuracy' || stat === 'parry' || stat === 'block' || stat === 'dodge' || stat === 'turn' || stat === 'tenacity' || stat === 'fortification');
}

export type StatTag = SpecTag | ItemTag | ActionTag | EffectTag;
export type SpecTag = 'Base' | 'Neg' | 'Mult' | 'Map' | 'Far' | 'Near';
export type ItemTag = 'Equipment' | 'Belt' | 'Helmet' | 'Weapon' | 'Spell' | 'Thrown' | 'Incanted' | 'Premium' | 'Double' | 'Charm' | 'Relic' | 'Trade' | 'Scroll';
export type ActionTag = 'Light Melee' | 'Heavy' | 'Finesse' | 'Unarmed' | 'Melee' | 'Ranged' | 'Grenade' | 'Potion' | 'Cryptic' | 'Mystic' | 'Agile';
export type EffectTag = 'Healing' | 'Force' | 'Buff' | 'Curse' | 'Fire' | 'Electric' | 'Ice' | 'Toxic' | 'Gadget' | 'Projectile' | 'Control' | 'Critical' | 'OverTime' | DamageTag;
export type DamageTag = 'Physical' | 'Magical' | 'Chemical' | 'Holy' | 'Dark' | 'Spirit' | 'None';
export const DamageTags = ['Physical', 'Magical', 'Chemical', 'Holy', 'Dark', 'None'];

export function getPowerType(tag: StatTag): 'action' | 'effect' | 'item' {
  if (tag === 'Equipment' || tag === 'Belt' || tag === 'Weapon' || tag === 'Helmet' || tag === 'Spell') {
    return 'item';
  }
  if (tag === 'Light Melee' || tag === 'Heavy' || tag === 'Finesse' || tag === 'Unarmed' || tag === 'Melee' || tag === 'Ranged' || tag === 'Grenade' || tag === 'Potion' || tag === 'Cryptic' || tag === 'Mystic' || tag === 'Agile') {
    return 'action';
  }
  return 'effect';
}

export type StatMap = { stat: AnyStat, tag?: StatTag, value: number }[];

export type StatMapLevel = { stat: AnyStat, tag?: StatTag, value: LevelValue }[];

export type LevelValue = number | { base?: number, inc?: number, dim?: number, dmult?: number, max?: number };
export type CompoundMap = { [key in AnyStat]?: ICompoundMap[] };
export interface ICompoundMap { sourceTag?: StatTag; stat: BaseStat; tag?: StatTag; percent: number; }

export const dCompoundMap: CompoundMap = {
  strength: [
    { stat: 'power', tag: 'Melee', percent: 1 },
    { stat: 'power', tag: 'Light Melee', percent: 0.5 },
    { stat: 'power', tag: 'Heavy', percent: 0.5 },
  ],
  dexterity: [
    { stat: 'power', tag: 'Ranged', percent: 1 },
    { stat: 'power', tag: 'Light Melee', percent: 0.5 },
    { stat: 'power', tag: 'Finesse', percent: 0.5 },
    { stat: 'power', tag: 'Thrown', percent: 0.5 },
    { stat: 'speed', percent: 0.05 },
  ],
  cunning: [
    { stat: 'power', tag: 'Gadget', percent: 1 },
    { stat: 'power', tag: 'Cryptic', percent: 0.5 },
    { stat: 'rate', tag: 'Gadget', percent: 0.001 },
    { stat: 'rate', tag: 'Cryptic', percent: 0.0005 },
    { stat: 'initiative', percent: 0.1 },
  ],
  magic: [
    { stat: 'power', tag: 'Spell', percent: 1 },
    { stat: 'power', tag: 'Mystic', percent: 0.5 },
    { stat: 'power', tag: 'Incanted', percent: -0.5 },
  ],
  accuracy: [
    { stat: 'hit', tag: 'Melee', percent: 1 },
    { stat: 'hit', tag: 'Projectile', percent: 1 },
    { stat: 'hit', tag: 'Grenade', percent: 0.5 },
  ],
  parry: [
    { stat: 'avoid', tag: 'Melee', percent: 1 },
  ],
  block: [
    { stat: 'avoid', tag: 'Melee', percent: 1 },
    { stat: 'avoid', tag: 'Projectile', percent: 0.5 },
  ],
  dodge: [
    { stat: 'avoid', tag: 'Projectile', percent: 1 },
    { stat: 'avoid', tag: 'Grenade', percent: 0.5 },
    { stat: 'avoid', tag: 'Melee', percent: 0.5 },
  ],
  turn: [
    { stat: 'avoid', tag: 'Spell', percent: 1 },
  ],
  tenacity: [
    { stat: 'devaluation', tag: 'Control', percent: 1 },
    { stat: 'resist', tag: 'Control', percent: 1 },
  ],
  fortification: [
    { stat: 'resist', tag: 'Physical', percent: 0.25 },
    { stat: 'resist', tag: 'Critical', percent: 1 },
    { stat: 'devaluation', tag: 'Critical', percent: 1 },
  ],
};

export type StatDisplayType = 'numeric' | 'percent' | 'x100';

export const StatDisplay: { [key in AnyStat]: StatDisplayType } = {
  strength: 'numeric',
  dexterity: 'numeric',
  cunning: 'numeric',
  magic: 'numeric',
  accuracy: 'percent',
  parry: 'percent',
  block: 'percent',
  dodge: 'percent',
  turn: 'percent',
  tenacity: 'percent',
  fortification: 'percent',

  health: 'numeric',
  mana: 'numeric',
  speed: 'numeric',
  hregen: 'percent',
  mregen: 'percent',
  initiative: 'numeric',
  baseDamage: 'numeric',
  power: 'numeric',
  critMult: 'numeric',
  critRate: 'percent',
  hit: 'percent',
  penetration: 'percent',
  rate: 'percent',
  resist: 'percent',
  avoid: 'percent',
  devaluation: 'percent',
  efficiency: 'percent',
  manacost: 'percent',

  iloot: 'percent',
  magicSlots: 'numeric',
  beltSlots: 'numeric',
};

export type StatProgression = 'linear' | 'diminish' | 'dim2';

export const StatProgression: { [key in AnyStat]: StatProgression } = {
  strength: 'linear',
  dexterity: 'linear',
  cunning: 'linear',
  magic: 'linear',
  accuracy: 'diminish',
  parry: 'diminish',
  block: 'diminish',
  dodge: 'diminish',
  turn: 'diminish',
  tenacity: 'diminish',
  fortification: 'diminish',

  health: 'linear',
  mana: 'linear',
  speed: 'linear',
  hregen: 'linear',
  mregen: 'linear',
  initiative: 'linear',
  baseDamage: 'linear',
  power: 'linear',
  critMult: 'linear',
  critRate: 'diminish',
  hit: 'dim2',
  penetration: 'diminish',
  rate: 'diminish',
  resist: 'diminish',
  avoid: 'diminish',
  devaluation: 'diminish',
  efficiency: 'diminish',
  manacost: 'diminish',

  iloot: 'diminish',
  magicSlots: 'linear',
  beltSlots: 'linear',
};

export const dStatBlock: StatBlock = {
  strength: { base: 0, mult: 0 },
  dexterity: { base: 0, mult: 0 },
  cunning: { base: 0, mult: 0 },
  magic: { base: 0, mult: 0 },
  accuracy: { base: 0, mult: 0, neg: 0 },
  parry: { base: 0, mult: 0, neg: 0 },
  block: { base: 0, mult: 0, neg: 0 },
  dodge: { base: 0, mult: 0, neg: 0 },
  turn: { base: 0, mult: 0, neg: 0 },
  tenacity: { base: 0, mult: 0, neg: 0 },
  fortification: { base: 0, mult: 0, neg: 0 },

  health: { base: 0, mult: 0, tags: {} },
  mana: { base: 0, mult: 0, tags: {} },
  speed: { base: 0, mult: 0, tags: {} },
  hregen: { base: 0, mult: 0, tags: {} },
  mregen: { base: 0, mult: 0, tags: {} },
  initiative: { base: 0, mult: 0, tags: {} },
  baseDamage: { base: 0, mult: 0, tags: {} },
  power: { base: 0, mult: 0, tags: {} },
  critRate: { base: 0, mult: 0, neg: 0, tags: {} },
  critMult: { base: 0, mult: 0, tags: {} },
  hit: { base: 0, mult: 0, neg: 0, tags: {} },
  penetration: { base: 0, mult: 0, neg: 0, tags: {} },
  rate: { base: 0, mult: 0, neg: 0, tags: {} },
  resist: { base: 0, mult: 0, neg: 0, tags: {} },
  avoid: { base: 0, mult: 0, neg: 0, tags: {} },
  devaluation: { base: 0, mult: 0, neg: 0, tags: {} },
  efficiency: { base: 0, mult: 0, neg: 0, tags: {} },
  manacost: { base: 0, mult: 0, neg: 0, tags: {} },

  iloot: { base: 0, mult: 0, neg: 0, tags: {}},
  magicSlots: { base: 0, mult: 0, tags: {}},
  beltSlots: { base: 0, mult: 0, tags: {}},
};

export const dStatPlayer: StatMap = [
  {stat: 'health', value: 100},
  {stat: 'speed', value: 100},
  {stat: 'mana', value: 50},
  {stat: 'mregen', value: 0.03},
  {stat: 'power', value: 100},
  {stat: 'critRate', tag: 'Weapon', value: 0.15},
  {stat: 'critMult', value: 1.5},
  {stat: 'hit', value: 0},
  {stat: 'iloot', value: 0.15},
  {stat: 'magicSlots', value: 1},
  {stat: 'beltSlots', value: 5},
];

export type StatBlock = {
  [key in AnyStat]: {
    base: number;
    neg?: number;
    mult: number;
    tags?: TagGroup;
  }
};

type TagGroup = { [key in StatTag]?: { base: number, mult: number, neg?: number } };

export type SimpleStats = { [key in BaseStat]: number };
export type AttackStats = { [key in AttackStat]?: number };
export type AttackStatsLevel = { [key in AttackStat]?: LevelValue };
