import * as _ from 'lodash';
import { BuffSlug, IBuff, IBuffRaw } from './BuffData';
import { LevelValue, StatTag } from './StatData';

export type EffectSlug = 'lifesteal' | 'walk' | 'rushed' | 'approach' | 'clearCritInit' | 'clearBlockInit' | 'backwards'
  | 'doubleshot' | 'magicStrike'
  | BuffSlug
  | EffectSlugExt;
export type EffectSlugExt = 'Bonus Physical';
export type EffectType = 'special' | 'damage' | 'buff' | 'clearBuff';
export type EffectTrigger = EffectTriggerAction | EffectTriggerAttacked | EffectTriggerMisc;
export type EffectTarget = 'origin' | 'target' | 'randomEnemy' | 'toughestEnemy';
export type EffectTriggerAction = 'actionStart' | 'action' | 'hit' | 'miss' | 'crit';
export type EffectTriggerAttacked = 'attacked' | 'struck' | 'avoided';
export type EffectTriggerMisc = 'never' | 'fightStart' | 'fightEnd' | 'constant' | 'constantBattle' | 'constantSafe' | 'damaged' | 'death'; // | 'healed';

export const EffectList: IEffectRaw[] = [
  { slug: 'lifesteal', type: 'special', trigger: 'hit', target: 'origin', value: {base: 0.15, inc: 0.01} },
  { slug: 'walk', type: 'special', trigger: 'action' },
  { slug: 'approach', type: 'special', trigger: 'action' },
  { slug: 'backwards', type: 'special', trigger: 'action' },
  { slug: 'aim', type: 'buff', trigger: 'action', target: 'origin', buff: 'aim' },
  { slug: 'rushed', type: 'buff', trigger: 'action', target: 'origin', buff: 'rushed' },
  { slug: 'crippled', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'crippled', type: 'stat', clearType: 'time', count: {base: 5, inc: 0.2}, duration: 100, stats: [{stat: 'strength', value: {base: -50, inc: -5}}] } },
  { slug: 'useless', type: 'buff', trigger: 'constantSafe', target: 'origin', buff: { slug: 'useless', type: 'special', clearType: 'time', count: 3, duration: 100 }},
  { slug: 'leapbuff', type: 'buff', trigger: 'action', buff: 'leapbuff', target: 'origin' },
  { slug: 'critInit', type: 'buff', trigger: 'fightStart', target: 'origin', buff: { slug: 'critInit', type: 'stat', clearType: 'trigger', count: 1, stats: [{stat: 'critRate', value: {inc: 0.05} }], triggers: [{slug: 'clearCritInit', type: 'clearBuff', trigger: 'crit', target: 'origin', buffRemoved: 'critInit'}] }},
  { slug: 'blockInit', type: 'buff', trigger: 'fightStart', target: 'origin', buff: { slug: 'blockInit', type: 'stat', clearType: 'trigger', count: 1, stats: [{stat: 'block', value: {inc: 0.05} }], triggers: [{slug: 'clearBlockInit', type: 'clearBuff', trigger: 'avoided', target: 'origin', triggerTags: ['Melee', 'Projectile'], buffRemoved: 'blockInit'}] }},
  { slug: 'markInit', type: 'buff', trigger: 'fightStart', target: 'toughestEnemy', buff: { slug: 'markInit', type: 'stat', clearType: 'time', count: 3, duration: 100, stats: [{stat: 'dodge', value: {base: -0.05, inc: -0.02}}, {stat: 'fortification', value: {base: -0.05, inc: -0.02}}]}},
  { slug: 'doubleshot', type: 'special', trigger: 'actionStart', triggerTags: ['Ranged', 'Thrown'], userate: {base: 0.5, inc: 0.05}, value: 1},

  { slug: 'burning', type: 'buff', trigger: 'hit', userate: 0.25, target: 'target', buff: { slug: 'burning', type: 'damage', clearType: 'time', count: 5, duration: 100, damage: { value: {base: 5, inc: 3}, tags: ['Fire', 'Spell', 'Magical']}, stats: [{stat: 'power', tag: 'Healing', value: -25}] } },
  { slug: 'stunned', type: 'buff', trigger: 'hit', userate: 0.05, target: 'target', buff: { slug: 'stunned', type: 'stat', clearType: 'time', count: 1, duration: {base: 30, inc: 5}, stats: [{stat: 'speed', value: -100}] } },
  { slug: 'poisoned', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'poisoned', type: 'damage', clearType: 'time', count: {base: 3, inc: 0.15}, duration: 100, damage: { value: {base: 18, inc: 2.1}, tags: ['Toxic', 'Spell', 'Magical']}, stats: [{stat: 'power', tag: 'Healing', value: -25}] } },
  { slug: 'confused', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'confused', type: 'action', clearType: 'action', count: 5, action: 'Confused'}},
  { slug: 'weakened', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'weakened', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'power', value: {base: -10, dim: -0.4}}] } },
  { slug: 'vulnerable', type: 'buff', trigger: 'hit', target: 'target', buff: { slug: 'vulnerable', type: 'stat', clearType: 'time', count: 7, duration: 100, stats: [{stat: 'resist', tag: 'Magical', value: {base: -0.1, dim: -0.015}}, {stat: 'resist', tag: 'Chemical', value: {base: -0.1, dim: -0.015}}, {stat: 'resist', tag: 'Spirit', value: {base: -0.1, dim: -0.015}} ] } },

  { slug: 'empowered', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'empowered', type: 'stat', clearType: 'time', count: 4, duration: 100, stats: [{stat: 'magic', value: {base: 100, inc: 10}} ] } },
  { slug: 'hastened', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'hastened', type: 'stat', clearType: 'time', count: 5, duration: 100, stats: [{stat: 'speed', value: {base: 1, inc: 0.2}}, {stat: 'dodge', value: {base: 0.15, inc: 0.03}} ] } },
  { slug: 'enchanted', type: 'buff', trigger: 'hit', target: 'origin', buff: { slug: 'enchanted', type: 'trigger', clearType: 'time', count: 7, duration: 100, triggers: [{ slug: 'magicStrike', type: 'damage', trigger: 'hit', target: 'target', value: {base: 8, inc: 5}, damageTags: ['Magical', 'Incanted']}] } },
];

export interface IEffectRaw {
  slug: EffectSlug;
  type: EffectType;
  trigger: EffectTrigger;
  triggerTags?: StatTag[];
  target?: EffectTarget;
  userate?: LevelValue;
  value?: LevelValue;
  damageTags?: StatTag[];
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
  damageTags?: StatTag[];
  buff?: IBuff;
  buffRemoved?: BuffSlug;
}
