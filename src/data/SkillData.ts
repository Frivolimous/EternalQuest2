import { StatMapLevel, CompoundMapLevel, StatMap, CompoundMap } from './StatData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';

export type SkillSlug = 'Fitness' | 'Toughness' | 'Super Strength' | 'Leap Attack' | 'Combat Training' |
                        'Spell Turning' |'Vessel' |'Magical Aptitude' |'Focus' |'Attunement' |
                        'Doubleshot' |'Precision' |'Spot' |'Battle Awareness' |'Withdraw';
export type SkillTreeSlug = 'Warrior' | 'Mage' | 'Ranger';

export interface ISkillRaw {
  slug: SkillSlug;

  baseStats?: StatMapLevel;
  compoundStats?: CompoundMapLevel;
  action?: ActionSlug | IActionRaw;
  triggers?: any;
}

export interface ISkill {
  name: string;
  slug: SkillSlug;
  level: number;

  baseStats?: StatMap;
  compoundStats?: CompoundMap;
  action?: IAction;
  triggers?: any;
}

export interface ISkillSave {
  slug: SkillSlug;
  level: number;
}

export const SkillList: ISkillRaw[] = [
  {slug: 'Fitness', compoundStats: [{stat: 'strength', value: {base: 50, inc: 10}}], baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}]},
  {slug: 'Toughness', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Super Strength', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Leap Attack', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Combat Training', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},

  {slug: 'Spell Turning', compoundStats: [{stat: 'strength', value: {base: 50, inc: 10}}], baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}]},
  {slug: 'Vessel', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Magical Aptitude', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Focus', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Attunement', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},

  {slug: 'Doubleshot', compoundStats: [{stat: 'strength', value: {base: 50, inc: 10}}], baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}]},
  {slug: 'Precision', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Spot', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Battle Awareness', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
  {slug: 'Withdraw', baseStats: [{stat: 'health', tag: 'Base', value: {base: 100, inc: 20}}, {stat: 'hregen', tag: 'Base', value: {base: 0.02, inc: 0.005}}]},
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

  ['Precision', 'Spot'],
  ['Battle Awareness', 'Spot'],
  ['Withdraw', 'Battle Awareness'],
];

export const SkillPageMap: ISkillPageMap[] = [
  {
    slug: 'Warrior',
    skills: [
      {slug: 'Fitness', position: 2},
      {slug: 'Toughness', position: 14 },
      {slug: 'Super Strength', position: 10 },
      {slug: 'Leap Attack', position: 20 },
      {slug: 'Combat Training', position: 12 },
    ],
  },
  {
    slug: 'Mage',
    skills: [
      {slug: 'Magical Aptitude', position: 2},
      {slug: 'Vessel', position: 11 },
      {slug: 'Focus', position: 13 },
      {slug: 'Attunement', position: 21 },
      {slug: 'Spell Turning', position: 23 },
    ],
  },
  {
    slug: 'Ranger',
    skills: [
      {slug: 'Doubleshot', position: 4},
      {slug: 'Spot', position: 1},
      {slug: 'Precision', position: 10 },
      {slug: 'Battle Awareness', position: 12 },
      {slug: 'Withdraw', position: 22 },
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
