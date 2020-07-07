import { JMTicker } from '../JMGE/events/JMTicker';
import { JMRect } from '../JMGE/others/JMRect';
import { JMEventListener } from '../JMGE/events/JMEventListener';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { IActionResult } from './ActionManager';

export const GameEvents = {
  ticker: JMTicker,
  WINDOW_RESIZE: new JMEventListener<IResizeEvent>(),
  ACTION_LOG: new JMEventListener<IActionLog>(),
  APP_LOG: new JMEventListener<IAppLog>(),

  SPRITE_ADDED: new JMEventListener<ISpriteAdded>(),
  SPRITE_REMOVED: new JMEventListener<SpriteModel>(),
  ANIMATE_ACTION: new JMEventListener<IAnimateAction>(true),
  FIGHT_STATE: new JMEventListener<IFightState>(),
};

export interface IResizeEvent {
  outerBounds: JMRect;
  innerBounds: JMRect;
}

export interface IActionLog {
  action: string;
  data: any;
  text: string;
}

export interface IAppLog {
  type: AppEvent;
  data?: any;
  text: string;
}

export type AppEvent = 'INITIALIZE' | 'SAVE' | 'NAVIGATE';

// export const GameEvents = {
//   ticker: {
//     add: (listener: () => void) => JMBL.events.ticker.add(listener),
//     remove: (listener: () => void) => JMBL.events.ticker.remove(listener),
//   },

// }

// export const SpriteEvents = {
//   ADD_HEALTH: new JMBL.SelfRegister<EAddHealth>(),
// }

export interface IFightState {
  start: boolean;
}

export interface IAnimateAction {
  origin: SpriteModel;
  target?: SpriteModel;
  result: IActionResult;
  trigger: () => void;
  onComplete: () => void;
}

export interface ISpriteAdded {
  sprite: SpriteModel;
  player?: boolean;
  newSpawn?: boolean;
}

// export interface EAddHealth {
//   sprite: SpriteModel;
//   player?: boolean;
//   amount: number;
// }

// export interface IBaseAction {
//   slug: ActionSlug,
//   type: ActionType,
//   target: ActionTarget,

//   damage: number,
//   hitrate: number,
//   critrate: number,
//   critmult: number,
//   userate: number,
//   leech: number,
//   dodgeReduce: number,
//   manaCost: number,
//   double: boolean,
//   strikes: number,
//   shots: number,

//   heal: number,

//   startEffects: string[],
//   hitEffects: string[],
//   critEffects: string[],
//   blockedEffects: string[],
//   endEffects: string[],
//   tags: string[],
// }

// export enum ActionSlug {
//   ATTACK
// }

// export enum ActionTarget {
//   SELF,
//   ENEMY
// }

// export enum ActionType {

// }
