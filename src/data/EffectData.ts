import { BuffSlug, IBuff, IBuffRaw } from './BuffData';
import { LevelValue, StatTag } from './StatData';

export type EffectSlug = 'lifesteal' | 'walk' | 'rushed' | 'approach' | 'clearCritInit' | 'clearParryInit' | 'backwards' | 'knockback' |
  'doubleshot' | 'magicStrike' | 'proc' | 'dazzled' | 'spikey' |
  'ordinary' | 'deft' | 'holy' | 'noble' | 'wild' |
  BuffSlug |
  EffectSlugExt;
export type EffectSlugExt = 'Bonus Physical';
export type EffectType = 'special' | 'damage' | 'buff' | 'clearBuff';
export type EffectTrigger = EffectTriggerAction | EffectTriggerAttacked | EffectTriggerMisc;
export type EffectTarget = 'origin' | 'target' | 'randomEnemy' | 'toughestEnemy';
export type EffectTriggerAction = 'actionStart' | 'action' | 'hit' | 'miss' | 'crit';
export type EffectTriggerAttacked = 'attacked' | 'struck' | 'avoided';
export type EffectTriggerMisc = 'never' | 'fightStart' | 'fightEnd' | 'constant' | 'constantBattle' | 'constantSafe' | 'damaged' | 'death';

export const EffectList: IEffectRaw[] = [
  { slug: 'ordinary', type: 'special', trigger: 'never' }, // free respec, no death penalty
  { slug: 'noble', type: 'special', trigger: 'never' }, // max skill level 7, +1 skill point per 7 levels
  { slug: 'deft', type: 'buff', trigger: 'fightStart', target: 'origin', buff: { slug: 'deft', type: 'stat', clearType: 'time', count: 1, duration: 100, stats: [{stat: 'power', value: 83}]} },
  { slug: 'holy', type: 'special', trigger: 'actionStart' },
  { slug: 'wild', type: 'special', trigger: 'action', value: 0.25 },

  { slug: 'lifesteal', type: 'special', trigger: 'hit', target: 'origin', value: {base: 0.03, inc: 0.006} },
  { slug: 'walk', type: 'special', trigger: 'action', target: 'origin' },
  { slug: 'approach', type: 'special', trigger: 'action', target: 'origin' },
  { slug: 'backwards', type: 'special', target: 'origin', trigger: 'action' },
  { slug: 'knockback', type: 'special', target: 'target', trigger: 'action' },
  { slug: 'aim', type: 'buff', trigger: 'action', target: 'origin', buff: 'aim' },
  { slug: 'rushed', type: 'buff', trigger: 'action', target: 'origin', buff: 'rushed' },
  { slug: 'crippled', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'crippled', type: 'stat', clearType: 'time', count: {base: 5, inc: 0.2}, duration: 100, stats: [{stat: 'strength', value: {base: -50, inc: -5}}] } },
  { slug: 'cursed', type: 'buff', trigger: 'hit', userate: {base: 0.1, inc: 0.01}, target: 'target', buff: { slug: 'cursed', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'accuracy', value: {base: -0.1, inc: -0.01}}] } },
  { slug: 'dazzled', type: 'buff', trigger: 'hit', userate: {base: 0.05, inc: 0.003}, target: 'target', buff: { slug: 'stunned', type: 'stat', clearType: 'time', count: 1, duration: {base: 50, inc: 5}, stats: [{stat: 'speed', value: -100}] } },
  { slug: 'useless', type: 'buff', trigger: 'constantSafe', target: 'origin', buff: { slug: 'useless', type: 'special', clearType: 'time', count: 3, duration: 100 }},
  { slug: 'leapbuff', type: 'buff', trigger: 'action', buff: 'leapbuff', target: 'origin' },
  { slug: 'critInit', type: 'buff', trigger: 'fightStart', target: 'origin', buff: { slug: 'critInit', type: 'stat', clearType: 'trigger', count: 1, stats: [{stat: 'critRate', value: {inc: 0.05} }], triggers: [{slug: 'clearCritInit', type: 'clearBuff', trigger: 'crit', target: 'origin', buffRemoved: 'critInit'}] }},
  { slug: 'parryInit', type: 'buff', trigger: 'fightStart', target: 'origin', buff: { slug: 'parryInit', type: 'stat', clearType: 'trigger', count: 1, stats: [{stat: 'parry', value: {inc: 0.05} }], triggers: [{slug: 'clearParryInit', type: 'clearBuff', trigger: 'avoided', target: 'origin', triggerTags: ['Melee'], buffRemoved: 'parryInit'}] }},
  { slug: 'markInit', type: 'buff', trigger: 'fightStart', target: 'toughestEnemy', buff: { slug: 'markInit', type: 'stat', clearType: 'time', count: 3, duration: 100, stats: [{stat: 'dodge', value: {base: -0.05, inc: -0.02}}, {stat: 'fortification', value: {base: -0.05, inc: -0.02}}]}},
  { slug: 'doubleshot', type: 'special', trigger: 'actionStart', triggerTags: ['Ranged', 'Thrown'], userate: {base: 0.5, inc: 0.05}, value: 1},

  { slug: 'burning', type: 'buff', trigger: 'hit', userate: 0.25, target: 'target', buff: { slug: 'burning', type: 'damage', clearType: 'time', count: 5, duration: 100, damage: { value: {base: 5, inc: 3}, tags: ['Fire', 'Spell', 'Magical', 'OverTime']}, stats: [{stat: 'power', tag: 'Healing', value: -25}] } },
  { slug: 'stunned', type: 'buff', trigger: 'hit', userate: 0.05, target: 'target', buff: { slug: 'stunned', type: 'stat', clearType: 'time', count: 1, duration: {base: 30, inc: 5}, stats: [{stat: 'speed', value: -100}] } },
  { slug: 'poisoned', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'poisoned', type: 'damage', clearType: 'time', count: {base: 3, inc: 0.15}, duration: 100, damage: { value: {base: 18, inc: 2.1}, tags: ['Toxic', 'Spell', 'Magical', 'OverTime']}, stats: [{stat: 'power', tag: 'Healing', value: -25}] } },
  { slug: 'gassed', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'gassed', type: 'damage', clearType: 'time', count: 5, duration: 100, damage: { value: {base: 28, inc: 2}, tags: ['Toxic', 'Grenade', 'Chemical', 'OverTime']}, stats: [{stat: 'power', tag: 'Healing', value: -25}] } },
  { slug: 'confused', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'confused', type: 'action', clearType: 'action', count: 5, action: 'Confused'}},
  { slug: 'weakened', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'weakened', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'power', value: {base: -10, dim: -0.4}}] } },
  { slug: 'vulnerable', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'vulnerable', type: 'stat', clearType: 'time', count: 7, duration: 100, stats: [{stat: 'resist', tag: 'Magical', value: {base: -0.1, dim: -0.015}}, {stat: 'resist', tag: 'Chemical', value: {base: -0.1, dim: -0.015}}, {stat: 'resist', tag: 'Spirit', value: {base: -0.1, dim: -0.015}} ] } },
  { slug: 'blinded', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'blinded', type: 'stat', clearType: 'time', count: 3, duration: 100, stats: [{stat: 'accuracy', value: {base: -0.20, dim: -0.02}} ] } },

  { slug: 'empowered', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'empowered', type: 'stat', clearType: 'time', count: 4, duration: 100, stats: [{stat: 'magic', value: {base: 100, inc: 10}} ] } },
  { slug: 'hastened', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'hastened', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'speed', value: {base: 1, inc: 0.2}}, {stat: 'dodge', value: {base: 0.15, inc: 0.03}} ] } },
  { slug: 'strengthen', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'strengthen', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'strength', value: {base: 20, inc: 5}} ] } },
  { slug: 'enchanted', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'enchanted', type: 'trigger', clearType: 'time', count: 7, duration: 100, triggers: [{ slug: 'magicStrike', type: 'damage', trigger: 'hit', target: 'target', damage: {value: {base: 8, inc: 5}, tags: ['Magical', 'Incanted']}}] } },

  { slug: 'amplified', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'amplified', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'power', value: {base: 15, inc: 5}}, {stat: 'resist', tag: 'Magical', value: {base: 0.1, dim: 0.03}}, {stat: 'resist', tag: 'Chemical', value: {base: 0.1, dim: 0.03}}, {stat: 'resist', tag: 'Spirit', value: {base: 0.1, dim: 0.03}}] } },
  { slug: 'celerity', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'celerity', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'hit', value: {base: 0.1, inc: 0.01}}, {stat: 'critRate', tag: 'Weapon', value: {base: 0.02, inc: 0.002}}, {stat: 'speed', value: {base: 1, inc: 0.03}}] } },
  { slug: 'turtle', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'turtle', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'fortification', value: {base: 0.02, dim: 0.015}}, {stat: 'resist', tag: 'Magical', value: {base: 0.05, dim: 0.025}}, {stat: 'resist', tag: 'Chemical', value: {base: 0.05, dim: 0.025}}, {stat: 'resist', tag: 'Spirit', value: {base: 0.05, dim: 0.025}}], triggers: [{ slug: 'spikey', type: 'damage', trigger: 'struck', triggerTags: ['Melee'], target: 'target', damage: {value: {inc: 0.7}, tags: ['Physical']} }] } },
  { slug: 'purity', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'purity', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'dodge', value: {base: 0.02, dim: 0.018}}, {stat: 'turn', value: {base: 0.02, dim: 0.018}}, {stat: 'hregen', value: {base: 0.005, inc: 0.001}}, {stat: 'mregen', value: {base: 0.005, dim: 0.001}}] } },

  { slug: 'spikey', type: 'damage', trigger: 'struck', triggerTags: ['Melee'], target: 'target', damage: {value: {base: 10, inc: 3}, tags: ['Physical']} },
  { slug: 'afraid', type: 'buff', trigger: 'struck', target: 'target', userate: 0.15, triggerTags: ['Melee'], buff: { slug: 'afraid', type: 'action', clearType: 'time', count: 5, duration: 100, action: 'Afraid'}},
  { slug: 'berserk', type: 'buff', trigger: 'struck', target: 'origin', userate: {base: 0.15, inc: 0.01}, buff: { slug: 'berserk', type: 'stat', clearType: 'time', count: 4, duration: 100, stats: [{stat: 'strength', value: {base: 25, inc: 5}}, {stat: 'tenacity', value: 0.1}]}},
];

export interface IEffectRaw {
  slug: EffectSlug;
  type: EffectType;
  trigger: EffectTrigger;
  triggerTags?: StatTag[];
  target?: EffectTarget;
  userate?: LevelValue;
  value?: LevelValue;
  damage?: { value: LevelValue, tags: StatTag[] };
  buff?: BuffSlug | IBuffRaw;
  buffRemoved?: BuffSlug;
}

export interface IEffect {
  name: EffectSlug;
  type: EffectType;
  trigger: EffectTrigger;
  triggerTags?: StatTag[];
  target?: EffectTarget;
  level: number;
  userate?: number;
  value?: number;
  damage?: { value: number, tags: StatTag[] };
  buff?: IBuff;
  buffRemoved?: BuffSlug;
}
