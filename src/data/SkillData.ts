import { StatMapLevel, StatMap } from './StatData';
import { IActionRaw, ActionSlug, IAction } from './ActionData';
import { IEffect, IEffectRaw, EffectSlug } from './EffectData';

export const enum SkillSlug {
  FITNESS,
  TOUGHNESS,
  SUPER_STRENGTH,
  LEAP_ATTACK,
  COMBAT_TRAINING,

  SPELL_TURNING,
  VESSEL,
  MAGICAL_APTITUDE,
  FOCUS,
  ATTUNEMENT,

  DOUBLESHOT,
  VITAL_STRIKE,
  EAGLE_EYE,
  BATTLE_AWARENESS,
  WITHDRAW,

  WARRIOR,
  MAGE,
  RANGER,

  ORDINARY,
  DEFT,
  UNGIFTED,
  ENLIGHTENED,
  HOLY,
  NOBLE,
  CLEVER,
  POWERFUL,
  WILD,
  STUDIOUS,
}

export const enum SkillTreeSlug {
  WARRIOR,
  MAGE,
  RANGER,

  MONK,
  SCIENTIST,
  PALADIN,
  ACOLYTE,
  ROGUE,
  BERSERKER,

}

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

export interface ISkillPageMap {
  slug: SkillTreeSlug;
  passive: SkillSlug;
  skills: {
    slug: SkillSlug;
    position: number;
  }[];
}

export const SkillList: ISkillRaw[] = [
  { talent: true, slug: SkillSlug.ORDINARY, triggers: ['ordinary']}, // still need: RESPEC, DEATH PENALTY
  { talent: true, slug: SkillSlug.DEFT, triggers: ['deft'], stats: [{stat: 'speed', value: 10}, {stat: 'power', value: -33}] },
  { talent: true, slug: SkillSlug.UNGIFTED, stats: [{stat: 'mana', value: -50}, {stat: 'magic', value: -100}, {stat: 'magicSlots', value: -1}, {stat: 'resist', tag: 'Magical', value: 0.25}, {stat: 'resist', tag: 'Spirit', value: 0.25}]},
  { talent: true, slug: SkillSlug.ENLIGHTENED, stats: [{stat: 'beltSlots', value: -1}, {stat: 'mregen', tag: 'Mult', value: 1}]},
  { talent: true, slug: SkillSlug.HOLY, stats: [{stat: 'power', tag: 'Holy', value: 10}, {stat: 'resist', tag: 'Spirit', value: 0.1}], triggers: ['holy'] }, // gamble
  { talent: true, slug: SkillSlug.NOBLE, triggers: ['noble'] },
  { talent: true, slug: SkillSlug.CLEVER, stats: [{stat: 'iloot', value: 0.1}, {stat: 'intellect', value: 25}, {stat: 'health', value: -25}, {stat: 'mana', value: -25}] },
  { talent: true, slug: SkillSlug.POWERFUL, stats: [{stat: 'power', value: 25}, {stat: 'resist', value: -0.25}] },
  { talent: true, slug: SkillSlug.WILD, triggers: ['wild']},
  { talent: true, slug: SkillSlug.STUDIOUS, stats: [{stat: 'magic', tag: 'Mult', value: 0.2}, {stat: 'intellect', tag: 'Mult', value: 0.2}, {stat: 'accuracy', value: -0.25}, {stat: 'block', value: -0.25} ] },

  { passive: true, slug: SkillSlug.WARRIOR, stats: [{ stat: 'efficiency', tag: 'Weapon', value: { base: 0, inc: 0.005}}]},
  { passive: true, slug: SkillSlug.MAGE, stats: [{ stat: 'power', tag: 'Magical', value: { base: 0, inc: 1}}]},
  { passive: true, slug: SkillSlug.RANGER, stats: [{ stat: 'power', tag: 'Far', value: { base: 0, inc: 0.5}}]},

  { slug: SkillSlug.FITNESS, stats: [{ stat: 'strength', value: { base: 0, inc: 8 } }, { stat: 'health', value: { base: 0, inc: 22 } }] },
  { slug: SkillSlug.SUPER_STRENGTH, stats: [{ stat: 'strength', value: { base: 0, inc: 11 } }, { stat: 'critMult', tag: 'Weapon', value: { base: 0, inc: 0.1 } }], triggers: ['critInit'] },
  { slug: SkillSlug.COMBAT_TRAINING, stats: [{ stat: 'dexterity', value: { base: 0, inc: 4 } }, { stat: 'accuracy', value: { base: 0, inc: 0.01 } }, { stat: 'block', value: { inc: 0.02 } }], triggers: ['blockInit'] },
  { slug: SkillSlug.TOUGHNESS, stats: [{ stat: 'health', value: { inc: 40 } }, { stat: 'hregen', value: { inc: 0.002 } }] },
  { slug: SkillSlug.LEAP_ATTACK, action: 'leap' },

  { slug: SkillSlug.MAGICAL_APTITUDE, stats: [{ stat: 'magic', value: { base: 0, inc: 8 } }, { stat: 'mana', value: { base: 0, inc: 4 } }] },
  { slug: SkillSlug.FOCUS, stats: [{ stat: 'magic', value: { base: 0, inc: 12 } }, { stat: 'critRate', tag: 'Spell', value: { base: 0, inc: 0.01 } }] },
  { slug: SkillSlug.VESSEL, stats: [{ stat: 'mana', value: { base: 0, inc: 5 } }, { stat: 'mregen', value: { base: 0, inc: 0.005 }}, { stat: 'magicSlots', value: {base: 1, inc: 0.15}}] },
  { slug: SkillSlug.ATTUNEMENT, stats: [{ stat: 'resist', tag: 'Magical', value: { base: 0.05, dim: 0.05 } }, { stat: 'resist', tag: 'Chemical', value: { base: 0.02, dim: 0.02 } }, { stat: 'resist', tag: 'Spirit', value: { base: 0.035, dim: 0.035 } }] },
  { slug: SkillSlug.SPELL_TURNING, stats: [{ stat: 'turn', value: { base: 0, inc: 0.06 } }] },

  { slug: SkillSlug.EAGLE_EYE, stats: [{ stat: 'accuracy', value: { base: 0, inc: 0.015 } }, { stat: 'critRate', tag: 'Weapon', value: { base: 0, inc: 0.01 } }, { stat: 'critMult', value: { base: 0, inc: 0.15 } }] },
  { slug: SkillSlug.DOUBLESHOT, stats: [{ stat: 'dexterity', value: { base: 0, inc: 4 } }], triggers: ['doubleshot'] },
  { slug: SkillSlug.BATTLE_AWARENESS, stats: [{ stat: 'dexterity', value: { base: 0, inc: 7 } }, { stat: 'intellect', value: { base: 0, inc: 5 } }, { stat: 'dodge', value: { base: 0, inc: 0.03 } }] },
  { slug: SkillSlug.VITAL_STRIKE, stats: [{ stat: 'critMult', value: { base: 0, inc: 0.012 } }], triggers: ['markInit'] },
  { slug: SkillSlug.WITHDRAW, stats: [{ stat: 'tenacity', value: { base: 0, inc: 0.1 } }], action: 'withdraw' },
];

export const SkillPrerequisiteMap: [SkillSlug, SkillSlug][] = [
  [SkillSlug.TOUGHNESS, SkillSlug.FITNESS],
  [SkillSlug.SUPER_STRENGTH, SkillSlug.FITNESS],
  [SkillSlug.COMBAT_TRAINING, SkillSlug.FITNESS],
  [SkillSlug.LEAP_ATTACK, SkillSlug.SUPER_STRENGTH],

  [SkillSlug.VESSEL, SkillSlug.MAGICAL_APTITUDE],
  [SkillSlug.FOCUS, SkillSlug.MAGICAL_APTITUDE],
  [SkillSlug.ATTUNEMENT, SkillSlug.VESSEL],
  [SkillSlug.SPELL_TURNING, SkillSlug.FOCUS],

  [SkillSlug.VITAL_STRIKE, SkillSlug.EAGLE_EYE],
  [SkillSlug.BATTLE_AWARENESS, SkillSlug.EAGLE_EYE],
  [SkillSlug.WITHDRAW, SkillSlug.BATTLE_AWARENESS],
];

export const TalentList: SkillSlug[] = [SkillSlug.ORDINARY, SkillSlug.DEFT, SkillSlug.UNGIFTED, SkillSlug.ENLIGHTENED, SkillSlug.HOLY, SkillSlug.NOBLE, SkillSlug.CLEVER, SkillSlug.POWERFUL, SkillSlug.WILD, SkillSlug.STUDIOUS];

export const SkillPageMap: ISkillPageMap[] = [
  {
    slug: SkillTreeSlug.WARRIOR,
    passive: SkillSlug.WARRIOR,
    skills: [
      { slug: SkillSlug.FITNESS, position: 2 },
      { slug: SkillSlug.TOUGHNESS, position: 14 },
      { slug: SkillSlug.SUPER_STRENGTH, position: 10 },
      { slug: SkillSlug.LEAP_ATTACK, position: 20 },
      { slug: SkillSlug.COMBAT_TRAINING, position: 12 },
    ],
  },
  {
    slug: SkillTreeSlug.MAGE,
    passive: SkillSlug.MAGE,
    skills: [
      { slug: SkillSlug.MAGICAL_APTITUDE, position: 2 },
      { slug: SkillSlug.VESSEL, position: 13 },
      { slug: SkillSlug.FOCUS, position: 11 },
      { slug: SkillSlug.ATTUNEMENT, position: 23 },
      { slug: SkillSlug.SPELL_TURNING, position: 21 },
    ],
  },
  {
    slug: SkillTreeSlug.RANGER,
    passive: SkillSlug.RANGER,
    skills: [
      { slug: SkillSlug.DOUBLESHOT, position: 4 },
      { slug: SkillSlug.EAGLE_EYE, position: 1 },
      { slug: SkillSlug.VITAL_STRIKE, position: 10 },
      { slug: SkillSlug.BATTLE_AWARENESS, position: 12 },
      { slug: SkillSlug.WITHDRAW, position: 22 },
    ],
  },
];
