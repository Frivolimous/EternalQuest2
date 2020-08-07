import * as _ from 'lodash';
import { SpriteModel } from './sprites/SpriteModel';
import { StatTag, AttackStats, DamageTag, StatMap, DamageTags, ActionTag } from '../data/StatData';
import { RandomSeed } from '../services/RandomSeed';
import { StatModel } from './stats/StatModel';
import { IAction, ActionType } from '../data/ActionData';
import { IEffect, EffectTrigger } from '../data/EffectData';
import { VitalType } from './stats/Vitals';
import { IBuff, BuffSlug, BuffType } from '../data/BuffData';
import { IActiveBuff } from './sprites/BuffContainer';
import { Formula } from '../services/Formula';
import { IItem } from '../data/ItemData';

export class ActionController {
  public selectedItem: IItem;
  public doubleSelected: boolean;

  constructor(private onBuffUpdate: (result: IBuffResult) => void, private onChargesUpdate: (item: IItem) => void, private onItemUnselect: (item: IItem) => void) {}

  public chooseAction = (origin: SpriteModel, sprites: SpriteModel[], fighting: boolean): IActionResult => {
    let target: SpriteModel;
    let actions: IAction[];

    if (fighting) {
      target = this.chooseTarget(origin, sprites, null);
      let distance = Math.abs(origin.tile - target.tile);
      actions = origin.stats.getActionList(distance);
    } else {
      actions = origin.stats.getActionList('b');
    }

    if (origin.player && this.selectedItem) {
      if (this.selectedItem.action && this.canUse(this.selectedItem.action, origin, target, sprites, fighting)) {
        let item = this.selectedItem;
        if (!this.doubleSelected) {
          this.selectedItem = null;
          this.onItemUnselect(item);
        }
        return this.processAction(item.action, origin, target, sprites);
      } else if ((!this.selectedItem.action && _.includes(this.selectedItem.tags, 'Unarmed')) || this.selectedItem.action.slug === 'strike') {
        let strikes = origin.stats.getStrikeActions();
        let strike = strikes.find(data => (this.canUse(data, origin, target, sprites, fighting) && this.wantUse(data, origin, target, sprites, fighting)));
        if (strike) {
          return this.processAction(strike, origin, target, sprites);
        }
      }
    }

    let action = _.find(actions, data => (this.canUse(data, origin, target, sprites, fighting) && this.wantUse(data, origin, target, sprites, fighting)));
    return this.processAction(action, origin, target, sprites);
  }

  public canUse(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[], fighting: boolean): boolean {
    if (fighting) {
      let distance = Math.abs(origin.tile - target.tile);
      if (!_.includes(action.distance, distance)) {
        return false;
      }
    } else {
      if (!_.includes(action.distance, 'b')) {
        return false;
      }
    }
    if (origin.buffs.hasBuff('rushed')) {
      if (action.slug !== 'strike' && action.slug !== 'idle') {
        return false;
      }
    }
    if (origin.buffs.hasBuff('aim')) {
      if (action.type === 'walk' && action.slug !== 'idle') {
        return false;
      }
    }
    if (origin.buffs.hasBuff('berserk')) {
      if (action.slug !== 'strike' && action.slug !== 'approach' && action.slug !== 'leap' && action.slug !== 'idle') {
        return false;
      }
    }

    if (action.costs) {
      if (action.costs.health > 0 && action.costs.health > origin.vitals.getVital('health')) {
        return false;
      }
      if (action.costs.mana > 0 && action.costs.mana > origin.vitals.getVital('mana')) {
        return false;
      }
    }

    if (action.source && (action.source.charges === 0)) {
      return false;
    }

    return true;
  }

  public wantUse(action: IAction, origin: SpriteModel, target: SpriteModel, others: SpriteModel[], fighting: boolean): boolean {
    if (action.slug === 'withdraw') {
      let actions2 = origin.stats.getActionList(Math.abs(origin.tile - target.tile) + 1);
      if (!_.some(actions2, data => data.type !== 'walk')) {
        return false;
      }
    }

    if (action.userate || action.userate === 0) {
      if (RandomSeed.general.getRaw() > action.userate) {
        return false;
      }
    }

    if (action.type === 'heal') {
      if (action.heals.health) {
        let current = origin.vitals.getVital('health');
        let total = origin.vitals.getTotal('health');
        if ((action.heals.health > total - current) && (current / total > 0.5)) {
          return false;
        }
      }
      if (action.heals.mana) {
        let current = origin.vitals.getVital('mana');
        let total = origin.vitals.getTotal('mana');
        if ((action.heals.mana > total - current) && (current / total > 0.5)) {
          return false;
        }
      }
    } else if (action.type === 'buff') {
      let buffType = action.effects[0].buff.name;
      if (origin.buffs.hasBuff(buffType)) {
        return false;
      }
    } else if (action.type === 'curse') {
      let buffType = action.effects[0].buff.name;
      if (target.buffs.hasBuff(buffType)) {
        return false;
      }
    }

    return true;
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
          // console.log('remove!');
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
    if (result.chargesChange) {
      if (result.source && result.source.source) {
        result.source.source.charges += result.chargesChange;
        this.onChargesUpdate(result.source.source as IItem);
      }
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
    if ((effect.userate || effect.userate === 0) && effect.userate < 1 && RandomSeed.general.getRaw() > effect.userate) {
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
      let power = origin.stats.getPower(effect.damage.tags);
      result.vitalChange.push({source: effect, value: effect.damage.value * power, sprite, vital: 'health', tag: Formula.getDamageTag(effect.damage.tags)});
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
        case 'wild': {
          let random = 1 - effect.value + RandomSeed.general.getRaw() * effect.value * 2;
          result.vitalChange.forEach(data => {
            if (data.vital === 'health') {
              data.value *= random;
            }
          });
          console.log('wild!', random);
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

    let tags: StatTag[];
    if (action.source) {
      tags = _.concat(action.tags, action.source.tags);
    } else {
      tags = action.tags;
    }

    let func = this.getResultFunction(action);

    result = func(action, tags, origin, target, others);

    let actionBuffs = origin.buffs.getActionBuffs();
    if (actionBuffs.length > 0) {
      result.removeBuff = _.map(actionBuffs, data => ({ sprite: origin, buff: data.source.name, source: action }));
    }

    if (action.costs.health) {
      result.vitalChange.push({ sprite: origin, vital: 'health', value: action.costs.health * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.mana) {
      result.vitalChange.push({ sprite: origin, vital: 'mana', value: action.costs.mana * (1 - origin.stats.getStat('manacost', tags)), tag: 'None', source: null});
    }
    if (action.costs.action) {
      result.vitalChange.push({ sprite: origin, vital: 'action', value: action.costs.action * (1 - origin.stats.getStat('efficiency', tags)), tag: 'None', source: null});
    }

    if (action.source && action.source.charges > 0) {
      result.chargesChange = -1;
    }

    return result;
  }

  // === RESULT FUNCTIONS === \\

  private getResultFunction(action: IAction) {
    if (action.type === 'walk' || action.type === 'self' || action.type === 'buff') {
      return this.makeSelfResult;
    } else if (action.type === 'attack') {
      return this.makeAttackResult;
    } else if (action.type === 'curse') {
      return this.makeCurseResult;
    } else if (action.type === 'heal') {
      return this.makeHealResult;
    }
  }

  private makeSelfResult = (action: IAction, tags: StatTag[], origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult => {
    let result: IActionResult = {
      name: action.slug,
      type: action.type,
      source: action,
      origin,
      target,
      vitalChange: [],
    };

    let effects = action.effects;
    effects && effects.forEach(effect => this.applyEffect(effect, action, result, origin, null, others));
    origin.stats.getTriggersFor('action', tags).forEach(effect => this.applyEffect(effect, action, result, origin, target, others));

    return result;
  }

  private makeHealResult = (action: IAction, tags: StatTag[], origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult => {
    let preEffects = _.concat(origin.stats.getTriggersFor('actionStart', tags), _.filter(action.effects, {trigger: 'actionStart'}));
    preEffects.forEach(effect => {
      if (!effect.userate || effect.userate >= 1 || RandomSeed.general.getRaw() < effect.userate) {
        switch (effect.name) {
        }
      }
    });

    let result: IActionResult;
    let power = origin.stats.getPower(tags);
    let damageTag = Formula.getDamageTag(tags);
    let critical = _.includes(tags, 'Critical');

    result = {
      name: action.slug,
      type: action.type,
      source: action,
      origin,
      target,
      vitalChange: [],
    };

    for (let key of Object.keys(action.heals)) {
      result.vitalChange.push({ sprite: origin, vital: key as 'health' | 'mana' | 'action', value: -action.heals[key as 'health' | 'mana' | 'action'] * power, source: action, tag: damageTag, critical });
    }

    action.effects && action.effects.forEach(effect => this.applyEffect(effect, action, result, origin, target, others));
    origin.stats.getTriggersFor('action', tags).forEach(effect => this.applyEffect(effect, action, result, origin, target, others));
    return result;
  }

  private makeCurseResult = (action: IAction, tags: StatTag[], origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult => {
    let result: IActionResult = {
      name: action.slug,
      type: action.type,
      source: action,
      origin,
      target,
      vitalChange: [],
    };

    let effects = action.effects;
    effects && effects.forEach(effect => this.applyEffect(effect, action, result, origin, target, others));
    origin.stats.getTriggersFor('action', tags).forEach(effect => this.applyEffect(effect, action, result, origin, target, others));

    return result;
  }

  private makeAttackResult = (action: IAction, tags: StatTag[], origin: SpriteModel, target: SpriteModel, others: SpriteModel[]): IActionResult => {
    let count = (_.includes(action.tags, 'Double') || _.includes(action.tags, 'Unarmed')) ? 2 : 1;
    let preEffects = _.concat(origin.stats.getTriggersFor('actionStart', tags), _.filter(action.effects, {trigger: 'actionStart'}));
    preEffects.forEach(effect => {
      if (!effect.userate || effect.userate >= 1 || RandomSeed.general.getRaw() < effect.userate) {
        switch (effect.name) {
          case 'doubleshot':
            count += effect.value;
            break;
          case 'holy':
            let dmgTag = Formula.getDamageTag(tags);
            tags[tags.indexOf(dmgTag)] = 'Holy';
            if (!tags.includes('Spirit')) {
              tags.push('Spirit');
            }
            break;
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
        effects = _.concat(effects, origin.stats.getTriggersFor(['miss', 'action'], tags));
        result = {
          name: action.slug + ' - Miss!',
          type: action.type,
          source: action,
          origin,
          target,
          defended: [{ sprite: target, source: action, type: 'Dodge' }],
          vitalChange: [],
        };

        this.processTriggers(target, origin, others, 'avoided', result);
      } else {
        let damage = this.getAttackDamage(origin, target, tags, action.stats);
        effects = _.filter(action.effects, effect => (effect.trigger === 'hit' || effect.trigger === 'action'));
        effects = _.concat(effects, origin.stats.getTriggersFor(['hit', 'action'], tags));
        if (_.includes(tags, 'Critical')) {
          console.log('is crit!');
          effects = _.concat(effects, origin.stats.getTriggersFor('crit', tags), _.filter(action.effects, effect => effect.trigger === 'crit'));
        }
        result = {
          name: action.slug,
          type: action.type,
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

    return mResult;
  }

  private getAttackDamage(origin: SpriteModel, target: SpriteModel, tags: StatTag[], actionStats: Partial<AttackStats>): number {
    if (!actionStats) return 0;

    let crit = origin.stats.getStat('critRate', tags, actionStats.critRate);
    let critD = target.stats.getStat('devaluation', ['Critical']);

    let baseDamage = origin.stats.getStat('baseDamage', tags, actionStats.baseDamage);
    let power = origin.stats.getPower(tags, actionStats.power, Math.abs(target.tile - origin.tile));
    let pen = origin.stats.getStat('penetration', tags, actionStats.penetration);
    let resist = target.stats.getStat('resist', tags);

    let critical = false;
    let criticalMult = 0;
    if (RandomSeed.general.getRaw() <= crit - critD) {
      let critMult = origin.stats.getStat('critMult', tags, actionStats.critMult);
      let critPen = origin.stats.getStat('penetration', ['Critical']);
      let critR = target.stats.getStat('resist', ['Critical']);

      critical = true;
      criticalMult = critMult * (1 + critPen - critR);
      tags.push('Critical');
    }

    // console.log('damage!', crit, baseDamage, power, pen, resist, criticalMult);

    return baseDamage * power * (1 + pen - resist) * (critical ? criticalMult : 1);
  }
}

export interface IActionResult {
  name: string;
  type: ActionType;
  source: IAction;

  origin: SpriteModel;
  target: SpriteModel;
  defended?: { sprite: SpriteModel, type: string, source: IEffect | IAction }[];
  vitalChange?: { sprite: SpriteModel, vital: VitalType, tag: DamageTag, value: number, source: IEffect | IAction, critical?: boolean }[];
  chargesChange?: number;
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
