import { StatMapLevel, StatMap, EffectTag } from './StatData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';
import { IEffect, IEffectRaw, EffectSlug } from './EffectData';

export type SkillSlug = 'Fitness' | 'Toughness' | 'Super Strength' | 'Leap Attack' | 'Combat Training' |
  'Spell Turning' | 'Vessel' | 'Magical Aptitude' | 'Focus' | 'Attunement' |
  'Doubleshot' | 'Vital Strike' | 'Eagle Eye' | 'Battle Awareness' | 'Withdraw' |
  'Warrior' | 'Mage' | 'Ranger' |
  TalentSlug;

export type SkillTreeSlug = 'Warrior' | 'Mage' | 'Ranger';

export type TalentSlug = 'Ordinary' | 'Deft' | 'Ungifted' | 'Enlightened' | 'Holy' | 'Noble' | 'Clever' | 'Powerful' | 'Wild' | 'Studious';

export interface ISkillRaw {
  slug: SkillSlug;

  stats?: StatMapLevel;
  action?: ActionSlug | IActionRaw;
  triggers?: (EffectSlug | IEffectRaw)[];
  passive?: boolean;
  talent?: boolean;
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
  { talent: true, slug: 'Ordinary', triggers: ['ordinary']}, // still need: RESPEC, DEATH PENALTY
  { talent: true, slug: 'Deft', triggers: ['deft'], stats: [{stat: 'speed', value: 10}, {stat: 'power', value: -33}] },
  { talent: true, slug: 'Ungifted', stats: [{stat: 'mana', value: -50}, {stat: 'magic', value: -100}, {stat: 'magicSlots', value: -1}, {stat: 'resist', tag: 'Magical', value: 0.25}, {stat: 'resist', tag: 'Spirit', value: 0.25}]},
  { talent: true, slug: 'Enlightened', stats: [{stat: 'beltSlots', value: -1}, {stat: 'mregen', tag: 'Mult', value: 1}]},
  { talent: true, slug: 'Holy', stats: [{stat: 'power', tag: 'Holy', value: 10}, {stat: 'resist', tag: 'Spirit', value: 0.1}], triggers: ['holy'] }, // gamble
  { talent: true, slug: 'Noble', triggers: ['noble'] },
  { talent: true, slug: 'Clever', stats: [{stat: 'iloot', value: 0.1}, {stat: 'intellect', value: 25}, {stat: 'health', value: -25}, {stat: 'mana', value: -25}] },
  { talent: true, slug: 'Powerful', stats: [{stat: 'power', value: 25}, {stat: 'resist', value: -0.25}] },
  { talent: true, slug: 'Wild', triggers: ['wild']},
  { talent: true, slug: 'Studious', stats: [{stat: 'magic', tag: 'Mult', value: 0.2}, {stat: 'intellect', tag: 'Mult', value: 0.2}, {stat: 'accuracy', value: -0.25}, {stat: 'block', value: -0.25} ] },

  { passive: true, slug: 'Warrior', stats: [{ stat: 'efficiency', tag: 'Weapon', value: { base: 0, inc: 0.005}}]},
  { passive: true, slug: 'Mage', stats: [{ stat: 'power', tag: 'Magical', value: { base: 0, inc: 1}}]},
  { passive: true, slug: 'Ranger', stats: [{ stat: 'power', tag: 'Far', value: { base: 0, inc: 0.5}}]},

  { slug: 'Fitness', stats: [{ stat: 'strength', value: { base: 0, inc: 8 } }, { stat: 'health', value: { base: 0, inc: 22 } }] },
  { slug: 'Super Strength', stats: [{ stat: 'strength', value: { base: 0, inc: 11 } }, { stat: 'critMult', tag: 'Weapon', value: { base: 0, inc: 0.1 } }], triggers: ['critInit'] },
  { slug: 'Combat Training', stats: [{ stat: 'dexterity', value: { base: 0, inc: 4 } }, { stat: 'accuracy', value: { base: 0, inc: 0.01 } }, { stat: 'block', value: { inc: 0.02 } }], triggers: ['blockInit'] },
  { slug: 'Toughness', stats: [{ stat: 'health', value: { inc: 40 } }, { stat: 'hregen', value: { inc: 0.002 } }] },
  { slug: 'Leap Attack', action: 'leap' },

  { slug: 'Magical Aptitude', stats: [{ stat: 'magic', value: { base: 0, inc: 8 } }, { stat: 'mana', value: { base: 0, inc: 4 } }] },
  { slug: 'Focus', stats: [{ stat: 'magic', value: { base: 0, inc: 12 } }, { stat: 'critRate', tag: 'Spell', value: { base: 0, inc: 0.01 } }] },
  { slug: 'Vessel', stats: [{ stat: 'mana', value: { base: 0, inc: 5 } }, { stat: 'mregen', value: { base: 0, inc: 0.005 }}, { stat: 'magicSlots', value: {base: 1, inc: 0.15}}] },
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

export const TalentList: TalentSlug[] = ['Ordinary',  'Deft',  'Ungifted',  'Enlightened',  'Holy',  'Noble',  'Clever',  'Powerful',  'Wild',  'Studious'];

export const SkillPageMap: ISkillPageMap[] = [
  {
    slug: 'Warrior',
    passive: 'Warrior',
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
    passive: 'Mage',
    skills: [
      { slug: 'Magical Aptitude', position: 2 },
      { slug: 'Vessel', position: 13 },
      { slug: 'Focus', position: 11 },
      { slug: 'Attunement', position: 23 },
      { slug: 'Spell Turning', position: 21 },
    ],
  },
  {
    slug: 'Ranger',
    passive: 'Ranger',
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
  passive: SkillSlug;
  skills: {
    slug: SkillSlug;
    position: number;
  }[];
}
