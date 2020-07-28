import { StatMapLevel, StatMap, EffectTag } from './StatData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';
import { IEffect, IEffectRaw, EffectSlug } from './EffectData';

export type SkillSlug = 'Fitness' | 'Toughness' | 'Super Strength' | 'Leap Attack' | 'Combat Training' |
  'Spell Turning' | 'Vessel' | 'Magical Aptitude' | 'Focus' | 'Attunement' |
  'Doubleshot' | 'Vital Strike' | 'Eagle Eye' | 'Battle Awareness' | 'Withdraw';

export type SkillTreeSlug = 'Warrior' | 'Mage' | 'Ranger';

export interface ISkillRaw {
  slug: SkillSlug;

  stats?: StatMapLevel;
  action?: ActionSlug | IActionRaw;
  triggers?: (EffectSlug | IEffectRaw)[];
}

export interface ISkill {
  name: string;
  slug: SkillSlug;
  level: number;

  stats?: StatMap;
  action?: IAction;
  triggers?: IEffect[];
}

export interface ISkillSave {
  slug: SkillSlug;
  level: number;
}

export const SkillList: ISkillRaw[] = [
  { slug: 'Fitness', stats: [{ stat: 'strength', value: { base: 0, inc: 8 } }, { stat: 'health', value: { base: 0, inc: 22 } }] },
  { slug: 'Super Strength', stats: [{ stat: 'strength', value: { base: 0, inc: 11 } }, { stat: 'critMult', tag: 'Weapon', value: { base: 0, inc: 0.1 } }], triggers: ['critInit'] },
  { slug: 'Combat Training', stats: [{ stat: 'dexterity', value: { base: 0, inc: 4 } }, { stat: 'accuracy', value: { base: 0, inc: 0.01 } }, { stat: 'block', value: { inc: 0.02 } }], triggers: ['blockInit'] },
  { slug: 'Toughness', stats: [{ stat: 'health', value: { inc: 40 } }, { stat: 'hregen', value: { inc: 0.002 } }] },
  { slug: 'Leap Attack', action: 'leap' },

  { slug: 'Magical Aptitude', stats: [{ stat: 'magic', value: { base: 0, inc: 8 } }, { stat: 'mana', value: { base: 0, inc: 4 } }] },
  { slug: 'Focus', stats: [{ stat: 'magic', value: { base: 0, inc: 12 } }, { stat: 'critRate', tag: 'Spell', value: { base: 0, inc: 0.01 } }] },
  { slug: 'Vessel', stats: [{ stat: 'mana', value: { base: 0, inc: 5 } }, { stat: 'mregen', value: { base: 0, inc: 0.005 } }] },
  { slug: 'Attunement', stats: [{ stat: 'resist', tag: 'Magical', value: { base: 0.05, dim: 0.05 } }, { stat: 'resist', tag: 'Chemical', value: { base: 0.02, dim: 0.02 } }, { stat: 'resist', tag: 'Spirit', value: { base: 0.035, dim: 0.035 } }] },
  { slug: 'Spell Turning', stats: [{ stat: 'turn', value: { base: 0, inc: 0.06 } }] },

  { slug: 'Eagle Eye', stats: [{ stat: 'accuracy', value: { base: 0, inc: 0.015 } }, { stat: 'critRate', tag: 'Weapon', value: { base: 0, inc: 0.01 } }, { stat: 'critMult', value: { base: 0, inc: 0.15 } }] },
  { slug: 'Doubleshot', stats: [{ stat: 'dexterity', value: { base: 0, inc: 4 } }], triggers: ['doubleshot'] },
  { slug: 'Battle Awareness', stats: [{ stat: 'dexterity', value: { base: 0, inc: 7 } }, { stat: 'intellect', value: { base: 0, inc: 5 } }, { stat: 'dodge', value: { base: 0, inc: 0.03 } }] },
  { slug: 'Vital Strike', stats: [{ stat: 'critMult', value: { base: 0, inc: 0.012 } }], triggers: ['markInit'] },
  { slug: 'Withdraw', stats: [{ stat: 'tenacity', value: { base: 0, inc: 0.1 } }], action: 'withdraw' },
];

export const SkillPrerequisiteMap: [SkillSlug, SkillSlug][] = [
  ['Toughness', 'Fitness'],
  ['Super Strength', 'Fitness'],
  ['Combat Training', 'Fitness'],
  ['Leap Attack', 'Super Strength'],

  ['Vessel', 'Magical Aptitude'],
  ['Focus', 'Magical Aptitude'],
  ['Attunement', 'Vessel'],
  ['Spell Turning', 'Focus'],

  ['Vital Strike', 'Eagle Eye'],
  ['Battle Awareness', 'Eagle Eye'],
  ['Withdraw', 'Battle Awareness'],
];

export const SkillPageMap: ISkillPageMap[] = [
  {
    slug: 'Warrior',
    skills: [
      { slug: 'Fitness', position: 2 },
      { slug: 'Toughness', position: 14 },
      { slug: 'Super Strength', position: 10 },
      { slug: 'Leap Attack', position: 20 },
      { slug: 'Combat Training', position: 12 },
    ],
  },
  {
    slug: 'Mage',
    skills: [
      { slug: 'Magical Aptitude', position: 2 },
      { slug: 'Vessel', position: 11 },
      { slug: 'Focus', position: 13 },
      { slug: 'Attunement', position: 21 },
      { slug: 'Spell Turning', position: 23 },
    ],
  },
  {
    slug: 'Ranger',
    skills: [
      { slug: 'Doubleshot', position: 4 },
      { slug: 'Eagle Eye', position: 1 },
      { slug: 'Vital Strike', position: 10 },
      { slug: 'Battle Awareness', position: 12 },
      { slug: 'Withdraw', position: 22 },
    ],
  },
];

export interface ISkillPageMap {
  slug: SkillTreeSlug;

  skills: {
    slug: SkillSlug;
    position: number;
  }[];
}
