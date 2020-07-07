export const CompoundMap: { [key in CompoundStat]: { stat: BaseStat, tag: StatTag, percent: number }[] } = {
  strength: [
    { stat: 'power', tag: 'Melee', percent: 1 },
    { stat: 'power', tag: 'Light Melee', percent: 0.5 },
    { stat: 'power', tag: 'Heavy', percent: 0.5 },
  ],
  dexterity: [
    { stat: 'power', tag: 'Ranged', percent: 1 },
    { stat: 'power', tag: 'Light Melee', percent: 0.5 },
    { stat: 'power', tag: 'Finesse', percent: 0.5 },
  ],
  intellect: [
    { stat: 'power', tag: 'Gadget', percent: 1 },
    { stat: 'power', tag: 'Cryptic', percent: 0.5 },
    { stat: 'rate', tag: 'Gadget', percent: 0.001 },
    { stat: 'rate', tag: 'Cryptic', percent: 0.0005 },
  ],
  magic: [
    { stat: 'power', tag: 'Spell', percent: 1 },
    { stat: 'power', tag: 'Mystic', percent: 0.5 },
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

export const CompoundStatDisplay: { [key in CompoundStat]: StatDisplayType} = {
  strength: 'numeric',
  dexterity: 'numeric',
  intellect: 'numeric',
  magic: 'numeric',
  accuracy: 'percent',
  parry: 'percent',
  block: 'percent',
  dodge: 'percent',
  turn: 'percent',
  tenacity: 'percent',
  fortification: 'percent',
};

export const BaseStatDisplay: { [key in BaseStat]: StatDisplayType } = {
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
};

export type StatProgression = 'linear' | 'diminish';

export const CompoundStatProgression: { [key in CompoundStat]: StatProgression} = {
  strength: 'linear',
  dexterity: 'linear',
  intellect: 'linear',
  magic: 'linear',
  accuracy: 'diminish',
  parry: 'diminish',
  block: 'diminish',
  dodge: 'diminish',
  turn: 'diminish',
  tenacity: 'diminish',
  fortification: 'diminish',
};

export const BaseStatProgression: { [key in BaseStat]: StatProgression } = {
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
  hit: 'diminish',
  penetration: 'diminish',
  rate: 'diminish',
  resist: 'diminish',
  avoid: 'diminish',
  devaluation: 'diminish',
};

export const dCompoundStats: CompoundStats = {
  strength: 0,
  dexterity: 0,
  intellect: 0,
  magic: 0,
  accuracy: 0,
  parry: 0,
  block: 0,
  dodge: 0,
  turn: 0,
  tenacity: 0,
  fortification: 0,
};

export const dBaseStats: BaseStats = {
  health: { base: 100, mult: 0, tags: {} },
  mana: { base: 50, mult: 0, tags: {} },
  speed: { base: 100, mult: 0, tags: {} },
  hregen: { base: 0, mult: 0, tags: {} },
  mregen: { base: 0.03, mult: 0, tags: {} },
  initiative: { base: 0, mult: 0, tags: {} },
  baseDamage: { base: 0, mult: 0, tags: { Unarmed: { base: 10, mult: 0 }} },
  power: { base: 100, mult: 0, tags: {} },
  critRate: { base: 0, mult: 0, neg: 0, tags: { Weapon: { base: 0.15, mult: 0, neg: 0 } } },
  critMult: { base: 1.5, mult: 0, tags: {} },
  hit: { base: 1, mult: 0, neg: 0, tags: {} },
  penetration: { base: 0, mult: 0, neg: 0, tags: {} },
  rate: { base: 0, mult: 0, neg: 0, tags: {} },
  resist: { base: 0, mult: 0, neg: 0, tags: {} },
  avoid: { base: 0, mult: 0, neg: 0, tags: {} },
  devaluation: { base: 0, mult: 0, neg: 0, tags: {} },
};

export type CompoundStats = { [key in CompoundStat]: number };
export type BaseStats = {
  [key in BaseStat]: {
    base: number;
    neg?: number;
    mult: number;
    tags: { [key: string]: { base: number, mult: number, neg?: number } };
  }
};
export type SimpleStats = { [key in BaseStat]: number};

export type BaseStat = 'health' | 'mana' | 'speed' | 'hregen' | 'mregen' | 'initiative' |
  'baseDamage' | 'power' | 'critRate' | 'critMult' | 'hit' | 'penetration' | 'rate' |
  'resist' | 'avoid' | 'devaluation';

export type CompoundStat = 'strength' | 'dexterity' | 'intellect' | 'magic' | 'accuracy' |
  'parry' | 'block' | 'dodge' | 'turn' | 'tenacity' | 'fortification';

export type StatTag = 'Base' | 'Neg' | 'Mult' |
  'Physical' | 'Magical' | 'Chemical' | 'Critical' | 'Spirit' | 'All' |
  'Holy' | 'Dark' | 'Melee' | 'Ranged' | 'Force' | 'Buff' | 'Curse' |
  'Fire' | 'Electric' | 'Ice' | 'Toxic' | 'Gadget' | 'Cryptic' | 'Light Melee' | 'Heavy' | 'Finesse' |
  'Spell' | 'Mystic' | 'Weapon' |
  'Projectile' | 'Grenade' | 'Control';
