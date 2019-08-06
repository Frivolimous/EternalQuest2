import * as JMBL from '../../JMGE/JMBL';
import { SpriteModel } from '../sprites/SpriteModel';

export const GameEvents = {
  ticker: {
    add: (listener: () => void) => JMBL.events.ticker.add(listener),
    remove: (listener: () => void) => JMBL.events.ticker.remove(listener),
  },
  SPRITE_ADDED: new JMBL.SelfRegister<ISpriteAdded>(),
  SPRITE_REMOVED: new JMBL.SelfRegister<SpriteModel>(),
  ANIMATE_ACTION: new JMBL.SelfRegister<IAnimateAction>(true),
  FIGHT_STATE: new JMBL.SelfRegister<IFightName>(),
};

export const SpriteEvents = {
  ADD_HEALTH: new JMBL.SelfRegister<IAddHealth>(),
};

export interface IFightName {
  start: boolean;
}

export interface IAnimateAction {
  origin: SpriteModel;
  target?: SpriteModel;
  action: string;
  data?: any;
  trigger?: () => void;
  callback: () => void;
}

export interface ISpriteAdded {
  sprite: SpriteModel;
  player?: boolean;
  newSpawn?: boolean;
}

export interface IAddHealth {
  sprite: SpriteModel;
  player?: boolean;
  amount: number;
}

export interface IBaseAction {
  slug: ActionSlug;
  type: ActionType;
  target: ActionTarget;

  damage: number;
  hitrate: number;
  critrate: number;
  critmult: number;
  userate: number;
  leech: number;
  dodgeReduce: number;
  manaCost: number;
  double: boolean;
  strikes: number;
  shots: number;

  heal: number;

  startEffects: string[];
  hitEffects: string[];
  critEffects: string[];
  blockedEffects: string[];
  endEffects: string[];
  tags: string[];
}

export enum ActionSlug {
  ATTACK,
}

export enum ActionTarget {
  SELF,
  ENEMY,
}

export enum ActionType {

}
