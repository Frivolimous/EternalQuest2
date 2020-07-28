import * as _ from 'lodash';
import { SpriteModel } from './sprites/SpriteModel';
import { StatTag, AttackStats, DamageTag, StatMap, DamageTags } from '../data/StatData';
import { RandomSeed } from '../services/RandomSeed';
import { StatModel } from './stats/StatModel';
import { IAction, ActionType } from '../data/ActionData';
import { IEffect, EffectTrigger } from '../data/EffectData';
import { VitalType } from './stats/Vitals';
import { IBuff, BuffSlug, BuffType } from '../data/BuffData';
import { IActiveBuff } from './sprites/BuffContainer';
import { Formula } from '../services/Formula';

export class ActionController {
  constructor(private onBuffUpdate: (result: IBuffResult) => void) {}

  public chooseAction = (origin: SpriteModel, sprites: SpriteModel[], fighting: boolean): IActionResult => {
    let target: SpriteModel;
    let actions: IAction[];

    if (fighting) {
      target = this.chooseTarget(origin, sprites, null);
      let distance = Math.abs(origin.tile - target.tile);
      actions = origin.stats.getActionList(distance);
      if (origin.buffs.hasBuff('rushed')) {
        actions = _.filter(actions, data => (data.slug === 'strike' || data.slug === 'idle'));
      } else if (origin.buffs.hasBuff('aim')) {
        actions = _.filter(actions, data => (data.type !== 'walk' || data.slug === 'idle'));
      }
    } else {
      target = null;
      actions = origin.stats.getActionList('b');
    }

    actions = _.filter(actions, data => {
      if (data.costs) {
        if (data.costs.health > 0 && data.costs.health > origin.vitals.getVital('health')) {
          return false;
        }
        if (data.costs.mana > 0 && data.costs.mana > origin.vitals.getVital('mana')) {
          return false;
        }

        return true;
      }
    });
    let action: IAction;
    while (true) {
      action = actions.shift();
      if (action.slug === 'withdraw') {
        let actions2 = origin.stats.getActionList(Math.abs(origin.tile - target.tile) + 1);
        console.log('withdraw?', actions2);
        if (_.some(actions2, data => data.type !== 'walk')) {
          break;
        }
      } else if (action.userate || action.userate === 0) {
        if (RandomSeed.general.getRaw() > action.userate) {
          action = actions.shift();
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return this.processAction(action, origin, target, sprites);
  }

  public chooseTarget = (origin: SpriteModel, sprites: SpriteModel[], action?: any) => {
    return _.sample(_.filter(sprites, sprite => sprite.player !== origin.player));
  }

  public finishAction = (result: IActionResult, others: SpriteModel[]) => {
    if (result.removeBuff) {
      result.removeBuff.forEach(data => {
        this.expendBuff(data.sprite, data.buff);
      });
    }
    if (result.addBuff) {
      result.addBuff.forEach(data => {
        let buff = data.buff;
        let existing = data.sprite.buffs.getBuff(buff.source.name);
        if (existing) {
          buff.timer = existing.timer;
          existing.onRemove && existing.onRemove();
          data.sprite.buffs.removeBuff(buff);
          console.log('remove!');
        }
        data.sprite.buffs.addBuff(buff);
        buff.onAdd && buff.onAdd();
      });
    }
    if (result.defended) {

    }
    if (result.vitalChange) {
      result.vitalChange.forEach(data => {
        data.sprite.vitals.addCount(data.vital, -data.value);
        if (data.vital === 'health' && data.value > 0) {
          this.processTriggers(data.sprite, null, others, 'damaged');
        }
      });
    }
    if (result.positionChange) {
      result.positionChange.forEach(data => {
        data.sprite.tile += data.value;
      });
    }
    if (result.chain) {

    }
  }

  public processTriggers = (origin: SpriteModel, target: SpriteModel, sprites: SpriteModel[], event: EffectTrigger, result?: IActionResult): IActionResult => {
    let triggers = origin.stats.getTriggersFor(event);
    if (!triggers || triggers.length === 0) return null;

    if (result) {
      triggers.forEach(effect => this.applyEffect(effect, null, result, origin, target, sprites));
    } else {
      result = {
        name: '',
        type: 'instant',
        costs: {},
        source: null,
        origin,
        target,
        vitalChange: [],
      };
      triggers.forEach(effect => this.applyEffect(effect, null, result, origin, target, sprites));

      // this.finishAction(result, sprites);
    }

    return result;
  }

  public tickBuffs(origin: SpriteModel, n: number = 10) {
    for (let i = 0; i < origin.buffs.buffs.length; i++) {
      let buff = origin.buffs.buffs[i];
      if (buff.source.clearType === 'time') {
        buff.timer += n;
        if (buff.timer > buff.source.duration) {
          buff.timer -= buff.source.duration;
          buff.remaining--;
          buff.onTick && buff.onTick();
          if (buff.remaining <= 0) {
            buff.onRemove && buff.onRemove();
            origin.buffs.buffs.splice(i, 1);
            i--;
          }
        }
      }
    }
  }

  public expendBuff(origin: SpriteModel, slug: BuffSlug) {
    let buff = origin.buffs.getBuff(slug);
    if (buff) {
      buff.remaining --;
      if (buff.remaining <= 0) {
        buff.onRemove && buff.onRemove();
        origin.buffs.removeBuff(buff);
      }
    }
  }

  private makeBuff = (buff: IBuff, action: IAction, result: IActionResult, sprite: SpriteModel, others: SpriteModel[]): IActiveBuff => {
    let onAdd: () => void;
    let onTick: () => void;
    let onRemove: () => void;

    if (buff.damage) {
      let tags = buff.damage.tags;
      let power = result.origin.stats.getPower(tags);
      let resist = sprite.stats.getStat('resist', tags);
      let damage = buff.damage.value * power * (1 - resist);
      onTick = () => {
        sprite.vitals.addCount('health', -damage);
        this.processTriggers(sprite, null, others, 'damaged');
        this.onBuffUpdate({ name: buff.name, type: buff.type, origin: sprite, vitalChange: [{ sprite, vital: 'health', tag: Formula.getDamageTag(tags), value: damage }] });
      };
    }
    if (buff.stats || buff.action || buff.triggers) {
      onAdd = () => {
        if (buff.stats) {
          sprite.stats.addStatMap(buff.stats);
          this.onBuffUpdate({ name: buff.name, type: buff.type, origin: sprite, statChange: [{ sprite, stats: buff.stats }] });
        }
        if (buff.action) {
          sprite.stats.addAction(buff.action);
        }
        if (buff.triggers) {
          buff.triggers.forEach(sprite.stats.addTrigger);
        }
      };
      onRemove = () => {
        if (buff.stats) {
          sprite.stats.removeStatMap(buff.stats);
          this.onBuffUpdate({ name: buff.name, type: buff.type, origin: sprite, statChange: [{ sprite, stats: buff.stats }] });
        }
        if (buff.action) {
          sprite.stats.removeAction(buff.action);
        }
        if (buff.triggers) {
          buff.triggers.forEach(sprite.stats.removeTrigger);
        }
      };
    }

    return {
      source: buff,
      remaining: buff.count,
      timer: 0,
      onAdd,
      onTick,
      onRemove,
    };
  }

  private applyEffect = (effect: IEffect, action: IAction, result: IActionResult, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]) => {
    if ((effect.userate || effect.userate === 0) && effect.userate < 1 && RandomSeed.general.getRaw() < effect.userate) {
      return;
    }

    let sprite: SpriteModel;

    if (effect.target === 'origin') {
      sprite = origin;
    } else if (effect.target === 'target') {
      sprite = target;
    } else if (effect.target === 'randomEnemy') {
      sprite = _.sample(_.filter(others, data => data.player !== origin.player));
    } else if (effect.target === 'toughestEnemy') {
      sprite = _.sortBy(_.filter(others, data => data.player !== origin.player), data => data.stats.getStat('health')).pop();
    }

    if (effect.type === 'buff') {
      let buff = effect.buff;
      if (!result.addBuff) {
        result.addBuff = [];
      }

      result.addBuff.push({ sprite, buff: this.makeBuff(buff, action, result, sprite, others), source: effect });
    } else if (effect.type === 'damage') {
      let power = origin.stats.getPower(effect.damageTags);
      result.vitalChange.push({source: effect, value: effect.value * power, sprite, vital: 'health', tag: Formula.getDamageTag(effect.damageTags)});
      // fill in
    } else if (effect.type === 'special') {
      let mainDamage = _.sumBy(_.filter(result.vitalChange, { source: action }), 'value') || 0;
      switch (effect.name) {
        case 'lifesteal': {
          if (mainDamage <= 0) break;
          let stealPercent = effect.value;
          let stealAmount = mainDamage * stealPercent;
          if (!result.vitalChange) {
            result.vitalChange = [];
          }

          result.vitalChange.push({ sprite, vital: 'health', value: -stealAmount, tag: 'Physical', source: effect });
          break;
        }
        case 'walk': case 'approach': {
          let positionChange = _.map(_.filter(others, { player: false }), data => ({ sprite: data, value: -1, source: null }));
          result.positionChange = result.positionChange ? _.concat(result.positionChange, positionChange) : positionChange;
          break;
        }
        case 'backwards': {
          let positionChange = _.map(_.filter(others, { player: false }), data => ({ sprite: data, value: 1, source: null}));
          result.positionChange = result.positionChange ? _.concat(result.positionChange, positionChange) : positionChange;
          break;
        }
      }
    } else if (effect.type === 'clearBuff') {
      if (!result.removeBuff) {
        result.removeBuff = [];
      }

      result.removeBuff.push({sprite, source: effect, buff: effect.buffRemoved});
    }
  }

  private processAction = (action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult => {
    let result: IActionResult;

    if (action.type === 'walk' || action.type === 'self') {
      result = this.makeSelfResult(action, origin, origin, others);
    } else if (action.type === 'attack') {
      result = this.makeAttackResult(action, origin, target, others);
    } else if (action.type === 'heal') {
      result = this.makeHealResult(action, origin, target, others);
    }

    let actionBuffs = origin.buffs.getActionBuffs();
    if (actionBuffs.length > 0) {
      result.removeBuff = _.map(actionBuffs, data => ({ sprite: origin, buff: data.source.name, source: action }));
    }

    return result;
  }

  private makeSelfResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult {
    let tags: StatTag[];
    if (action.source) {
      tags = _.concat(action.tags, action.source.tags);
    } else {
      tags = action.tags;
    }

    let result: IActionResult = {
      name: action.slug,
      type: action.type,
      source: action,
      origin,
      target,
      costs: {},
      vitalChange: [],
    };

    let effects = action.effects;
    effects && effects.forEach(effect => this.applyEffect(effect, action, result, origin, null, others));

    if (action.costs.health) {
      result.vitalChange.push({ sprite: origin, vital: 'health', value: action.costs.health * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.mana) {
      result.vitalChange.push({ sprite: origin, vital: 'mana', value: action.costs.mana * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.action) {
      result.vitalChange.push({ sprite: origin, vital: 'action', value: action.costs.action * (1 - origin.stats.getStat('efficiency', tags)), tag: 'None', source: null});
    }

    return result;
  }

  private makeHealResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult {
    let tags: StatTag[];
    if (action.source) {
      tags = _.concat(action.tags, action.source.tags);
    } else {
      tags = action.tags;
    }

    let preEffects = _.concat(origin.stats.getTriggersFor('actionStart', tags), _.filter(action.effects, {trigger: 'actionStart'}));
    preEffects.forEach(effect => {
      if (effect.userate >= 1 || RandomSeed.general.getRaw() < effect.userate) {
        switch (effect.name) {
        }
      }
    });

    let result: IActionResult;

    let heal = action.stats.baseDamage * origin.stats.getPower(tags);

    result = {
      name: action.slug,
      type: action.type,
      costs: action.costs,
      source: action,
      origin,
      target,
      vitalChange: [{ sprite: origin, vital: 'health', value: -heal, source: action, tag: Formula.getDamageTag(tags), critical: _.includes(tags, 'Critical') }],
    };

    action.effects && action.effects.forEach(effect => this.applyEffect(effect, action, result, origin, target, others));

    if (action.costs.health) {
      result.vitalChange.push({ sprite: origin, vital: 'health', value: action.costs.health * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.mana) {
      result.vitalChange.push({ sprite: origin, vital: 'mana', value: action.costs.mana * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.action) {
      result.vitalChange.push({ sprite: origin, vital: 'action', value: action.costs.action * (1 - origin.stats.getStat('efficiency', tags)), tag: 'None', source: null});
    }

    return result;
  }

  private makeAttackResult(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult {
    let tags: StatTag[];
    if (action.source) {
      tags = _.concat(action.tags, action.source.tags);
    } else {
      tags = action.tags;
    }

    let count = action.double ? 2 : 1;
    let preEffects = _.concat(origin.stats.getTriggersFor('actionStart', tags), _.filter(action.effects, {trigger: 'actionStart'}));
    preEffects.forEach(effect => {
      if (effect.userate >= 1 || RandomSeed.general.getRaw() < effect.userate) {
        switch (effect.name) {
          case 'doubleshot':
            count += effect.value;
        }
      }
    });

    let mResult: IActionResult;

    while (count > 0) {
      let hit = origin.stats.getStat('hit', tags, action.stats.hit);
      let avoid = target.stats.getStat('avoid', tags);
      let effects: IEffect[];
      let result: IActionResult;

      if (RandomSeed.general.getRaw() > (hit - avoid)) {
        effects = _.filter(action.effects, effect => (effect.trigger === 'miss' || effect.trigger === 'action'));
        effects = _.concat(effects, origin.stats.getTriggersFor('miss', tags));
        result = {
          name: action.slug + ' - Miss!',
          type: action.type,
          source: action,
          costs: action.costs,
          origin,
          target,
          defended: [{ sprite: target, source: action, type: 'Dodge' }],
          vitalChange: [],
        };

        this.processTriggers(target, origin, others, 'avoided', result);
      } else {
        let damage = this.getAttackDamage(origin.stats, target.stats, tags, action.stats);
        effects = _.filter(action.effects, effect => (effect.trigger === 'hit' || effect.trigger === 'action'));
        effects = _.concat(effects, origin.stats.getTriggersFor('hit', tags));
        if (_.includes(tags, 'Critical')) {
          effects = _.concat(effects, origin.stats.getTriggersFor('crit', tags));
        }
        result = {
          name: action.slug,
          type: action.type,
          costs: action.costs,
          source: action,
          origin,
          target,
          vitalChange: [{ sprite: target, vital: 'health', value: damage, source: action, tag: Formula.getDamageTag(tags), critical: _.includes(tags, 'Critical') }],
        };

        this.processTriggers(target, origin, others, 'struck', result);
      }

      this.processTriggers(target, origin, others, 'attacked', result);

      effects.forEach(effect => this.applyEffect(effect, action, result, origin, target, others));

      if (mResult) {
        let addTo = mResult;
        while (addTo.chain) {
          addTo = addTo.chain;
        }
        addTo.chain = result;
      } else {
        mResult = result;
      }
      count--;
    }

    if (action.costs.health) {
      mResult.vitalChange.push({ sprite: origin, vital: 'health', value: action.costs.health * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.mana) {
      mResult.vitalChange.push({ sprite: origin, vital: 'mana', value: action.costs.mana * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.action) {
      mResult.vitalChange.push({ sprite: origin, vital: 'action', value: action.costs.action * (1 - origin.stats.getStat('efficiency', tags)), tag: 'None', source: null});
    }

    return mResult;
  }

  private getAttackDamage(origin: StatModel, target: StatModel, tags: StatTag[], actionStats: Partial<AttackStats>): number {
    if (!actionStats) return 0;

    let crit = origin.getStat('critRate', tags, actionStats.critRate);
    let critD = target.getStat('devaluation', ['Critical']);

    let baseDamage = origin.getStat('baseDamage', tags, actionStats.baseDamage);
    let power = origin.getPower(tags, actionStats.power);
    let pen = origin.getStat('penetration', tags, actionStats.penetration);
    let resist = target.getStat('resist', tags);

    let critical = false;
    let criticalMult = 0;
    if (RandomSeed.general.getRaw() <= crit - critD) {
      let critMult = origin.getStat('critMult', tags, actionStats.critMult);
      let critPen = origin.getStat('penetration', ['Critical']);
      let critR = target.getStat('resist', ['Critical']);

      critical = true;
      criticalMult = critMult * (1 + critPen - critR);
      tags.push('Critical');
    }

    console.log('damage!', crit, baseDamage, power, pen, resist, criticalMult);

    return baseDamage * power * (1 + pen - resist) * (critical ? criticalMult : 1);
  }
}

export interface IActionResult {
  name: string;
  type: ActionType;
  source: IAction;

  origin: SpriteModel;
  target: SpriteModel;
  costs: { mana?: number, action?: number, health?: number };
  defended?: { sprite: SpriteModel, type: string, source: IEffect | IAction }[];
  vitalChange?: { sprite: SpriteModel, vital: VitalType, tag: DamageTag, value: number, source: IEffect | IAction, critical?: boolean }[];
  addBuff?: { sprite: SpriteModel, buff: IActiveBuff, source: IEffect }[];
  removeBuff?: { sprite: SpriteModel, buff: BuffSlug, source: IEffect | IAction }[];
  positionChange?: { sprite: SpriteModel, value: number, source: IEffect }[];
  chain?: IActionResult;
}

export interface IBuffResult {
  name: string;
  type: BuffType;

  origin: SpriteModel;
  vitalChange?: { sprite: SpriteModel, vital: VitalType, tag: DamageTag, value: number }[];
  addBuff?: { sprite: SpriteModel, buff: IActiveBuff }[];
  removeBuff?: { sprite: SpriteModel, buff: BuffSlug }[];
  positionChange?: { sprite: SpriteModel, value: number }[];
  statChange?: { sprite: SpriteModel, stats: StatMap }[];
}
