import * as JMBL from '../../JMGE/JMBL';
import { SpriteModel } from '../sprites/SpriteModel';

export const GameEvents = {
  ticker: {
    add: (listener: () => void) => JMBL.events.ticker.add(listener),
    remove: (listener: () => void) => JMBL.events.ticker.remove(listener),
  },
  SPRITE_ADDED: new JMBL.SelfRegister<ESpriteAdded>(),
  SPRITE_REMOVED: new JMBL.SelfRegister<SpriteModel>(),
  ANIMATE_ACTION: new JMBL.SelfRegister<EAnimateAction>(true),
  FIGHT_STATE: new JMBL.SelfRegister<EFightState>(),
}

export const SpriteEvents = {
  ADD_HEALTH: new JMBL.SelfRegister<EAddHealth>(),
}

export interface EFightState {
  start: boolean;
}

export interface EAnimateAction {
  origin: SpriteModel;
  target?: SpriteModel;
  action: string;
  data?: any;
  trigger?: () => void;
  callback: () => void;
}

export interface ESpriteAdded {
  sprite: SpriteModel;
  player?: boolean;
  newSpawn?: boolean;
}

export interface EAddHealth {
  sprite: SpriteModel;
  player?: boolean;
  amount: number;
}

export interface IBaseAction {
  slug: ActionSlug,
  type: ActionType,
  target: ActionTarget,

  damage: number,
  hitrate: number,
  critrate: number,
  critmult: number,
  userate: number,
  leech: number,
  dodgeReduce: number,
  manaCost: number,
  double: boolean,
  strikes: number,
  shots: number,
  
  heal: number,

  startEffects: string[],
  hitEffects: string[],
  critEffects: string[],
  blockedEffects: string[],
  endEffects: string[],
  tags: string[],
}

export enum ActionSlug {
  ATTACK
}

export enum ActionTarget {
  SELF,
  ENEMY
}

export enum ActionType {

}