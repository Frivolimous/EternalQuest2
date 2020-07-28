import * as _ from 'lodash';
import { StatTag, dCompoundMap, StatMap, StatBlock, dStatBlock, AnyStat, StatProgression, StatDisplay, isCompoundStat, getPowerType, CompoundMap, ICompoundMap } from '../../data/StatData';
import { Formula } from '../../services/Formula';
import { IPlayerSave } from '../../data/SaveData';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { ActionContainer } from './ActionContainer';
import { IItem } from '../../data/ItemData';
import { ItemManager } from '../../services/ItemManager';
import { IAction } from '../../data/ActionData';
import { ISkill, SkillPrerequisiteMap, SkillTreeSlug } from '../../data/SkillData';
import { DataConverter } from '../../services/DataConverter';
import { IEnemy } from '../../data/EnemyData';
import { IEffect, EffectTrigger } from '../../data/EffectData';

export class StatModel {
  public static fromSave(save: IPlayerSave): StatModel {
    let m = new StatModel(save.name, save.title, save.level, save.cosmetics, _.map(save.equipment, ItemManager.loadItem), _.map(save.inventory, ItemManager.loadItem), save.artifacts, _.map(save.skills, ItemManager.loadSkill), save.talent, save.experience);
    m.skillpoints = save.skillPoints || 0;
    m.skillTrees = save.skillTrees;
    return m;
  }

  public static fromEnemy(enemy: IEnemy): StatModel {
    let m = new StatModel(enemy.name, null, enemy.level, enemy.cosmetics, enemy.equipment);
    m.addStatMap(enemy.stats);

    if (enemy.actions) {
      enemy.actions.forEach(action => {
        m.addAction(action);
      });
    }

    return m;
  }

  public skillpoints = 0;
  public skillTrees: SkillTreeSlug[];
  public onUpdate = new JMEventListener<void>(false, true);

  private stats: StatBlock;

  private actions: ActionContainer;
  private triggers: IEffect[] = [];
  private unarmored: any;
  private compoundMap: CompoundMap;

  constructor(
    public name?: string,
    public title?: string,
    public level?: number,
    public cosmetics?: any,

    public equipment?: IItem[],
    public inventory?: IItem[],
    public artifacts?: any,
    public skills?: ISkill[],
    public talent?: any,
    public experience?: number,
  ) {
    this.stats = _.cloneDeep(dStatBlock);
    this.actions = new ActionContainer();
    this.compoundMap = _.cloneDeep(dCompoundMap);
    if (this.equipment) {
      this.equipment.forEach(item => this.equipItem(item, -1));
    }

    if (this.skills) {
      this.skills.forEach(skill => this.addSkill(skill));
    }
  }

  public addStat(stat: AnyStat, tag?: StatTag, value?: number | ICompoundMap, publish: boolean = true) {
    if (tag === 'Map') {
      value = value as ICompoundMap;

      if (!this.compoundMap[stat]) {
        this.compoundMap[stat] = [];
      }

      let amt = this.getStat(stat, value.sourceTag ? [value.sourceTag] : null);
      let existing = _.find(this.compoundMap[stat], {sourceTag: value.sourceTag, stat: value.stat, tag: value.tag});

      if (existing) {
        this.subStat(value.stat, value.tag, amt * existing.percent, false);

        existing.percent += value.percent;
      } else {
        existing = _.clone(value);
        this.compoundMap[stat].push(existing);
      }

      this.addStat(value.stat, value.tag, amt * existing.percent);
    } else {
      let chunk = this.stats[stat];
      value = value as number;

      if (this.compoundMap[stat]) {
        for (let val of this.compoundMap[stat]) {
          let amt = this.getStat(stat, val.sourceTag ? [val.sourceTag] : null);
          this.subStat(val.stat, val.tag, amt * val.percent, false);
        }
      }

      if (tag === 'Mult') {
        chunk.mult += value;
      } else {
        if (StatProgression[stat] === 'linear') {
          if (!tag || tag === 'Base') {
            chunk.base += value;
          } else {
            if (!chunk.tags[tag]) {
              chunk.tags[tag] = {base: 0, mult: 0};
            }
            chunk.tags[tag].base += value;
          }
        } else {
          if (!tag || tag === 'Base') {
            chunk.base = Formula.addMult(chunk.base, value);
          } else {
            if (!chunk.tags[tag]) {
              chunk.tags[tag] = {base: 0, mult: 0, neg: 0};
            }
            if (value < 0) {
              chunk.tags[tag].neg = Formula.addMult(chunk.tags[tag].neg, -value);
            } else {
              chunk.tags[tag].base = Formula.addMult(chunk.tags[tag].base, value);
            }
          }
        }
      }

      if (this.compoundMap[stat]) {
        for (let val of this.compoundMap[stat]) {
          let amt = this.getStat(stat, val.sourceTag ? [val.sourceTag] : null);
          this.addStat(val.stat, val.tag, amt * val.percent, false);
        }
      }
    }

    if (publish) {
      this.onUpdate.publish();
    }
  }

  public subStat(stat: AnyStat, tag?: StatTag, value?: number | ICompoundMap, publish: boolean = true) {
    if (tag === 'Map') {
      value = value as ICompoundMap;

      if (!this.compoundMap[stat]) {
        this.compoundMap[stat] = [];
      }

      let amt = this.getStat(stat, value.sourceTag ? [value.sourceTag] : null);
      let existing = _.find(this.compoundMap[stat], {sourceTag: value.sourceTag, stat: value.stat, tag: value.tag});

      if (existing) {
        this.subStat(value.stat, value.tag, amt * existing.percent, false);

        existing.percent -= value.percent;
      } else {
        existing = _.clone(value);
        existing.percent = -existing.percent;
        this.compoundMap[stat].push(existing);
      }

      this.addStat(value.stat, value.tag, amt * existing.percent);
    } else {
      let chunk = this.stats[stat];
      value = value as number;

      if (this.compoundMap[stat]) {
        for (let val of this.compoundMap[stat]) {
          let amt = this.getStat(stat, val.sourceTag ? [val.sourceTag] : null);
          this.subStat(val.stat, val.tag, amt * val.percent, false);
        }
      }

      if (tag === 'Mult') {
        chunk.mult -= value;
      } else {
        if (StatProgression[stat] === 'linear') {
          if (!tag || tag === 'Base') {
            chunk.base -= value;
          } else {
            if (!chunk.tags[tag]) {
              chunk.tags[tag] = {base: 0, mult: 0};
            }
            chunk.tags[tag].base -= value;
          }
        } else {
          if (!tag || tag === 'Base') {
            chunk.base = Formula.subMult(chunk.base, value);
          } else {
            if (!chunk.tags[tag]) {
              chunk.tags[tag] = {base: 0, mult: 0, neg: 0};
            }
            if (value < 0) {
              chunk.tags[tag].neg = Formula.subMult(chunk.tags[tag].neg, -value);
            } else {
              chunk.tags[tag].base = Formula.subMult(chunk.tags[tag].base, value);
            }
          }
        }
      }

      if (this.compoundMap[stat]) {
        for (let val of this.compoundMap[stat]) {
          let amt = this.getStat(stat, val.sourceTag ? [val.sourceTag] : null);
          this.addStat(val.stat, val.tag, amt * val.percent, false);
        }
      }
    }

    if (publish) {
      this.onUpdate.publish();
    }
  }

  public getStat(stat: AnyStat, tags?: StatTag[], withValue?: number) {
    let bs = this.stats[stat];
    let m = bs.base;
    let mult = bs.mult;

    if (StatProgression[stat] === 'linear') {
      if (tags) {
        tags.forEach(tag => {
          if (bs.tags[tag]) {
            m += bs.tags[tag].base;
            mult += bs.tags[tag].mult;
          }
        });
      }
      if (withValue) {
        m += withValue;
      }
      m *= 1 + mult;
    } else if (StatProgression[stat] === 'diminish') {
      let neg = bs.neg;

      if (tags) {
        tags.forEach(tag => {
          if (bs.tags[tag]) {
            m = Formula.addMult(m, bs.tags[tag].base);
            mult += bs.tags[tag].mult;
            neg += bs.tags[tag].neg;
          }
        });
      }
      if (withValue) {
        m = Formula.addMult(m, withValue);
      }
      m = Formula.addMult(m, m * mult) - neg;
    }

    return m;
  }

  public getPower(tags?: StatTag[], misc?: number) {
    let power = this.stats.power;

    let itemPower = 100;
    let actionPower = 100;
    let effectPower = 100;
    let miscPower = power.base;

    let itemMult = 1;
    let actionMult = 1;
    let effectMult = 1;
    let miscMult = 1 + power.mult;

    if (tags) {
      tags.forEach(tag => {
        if (power.tags[tag]) {
          let type = getPowerType(tag);
          if (type === 'item') {
            itemPower += power.tags[tag].base;
            itemMult += power.tags[tag].mult;
          } else if (type === 'action') {
            actionPower += power.tags[tag].base;
            actionMult += power.tags[tag].mult;
          } else if (type === 'effect') {
            effectPower += power.tags[tag].base;
            effectMult += power.tags[tag].mult;
          }
        }
      });
    }

    if (misc) {
      miscPower += misc;
    }

    itemPower *= itemMult;
    actionPower *= actionMult;
    effectPower *= effectMult;
    miscPower *= miscMult;

    console.log('power!', itemPower, actionPower, effectPower, miscPower);
    return itemPower * actionPower * effectPower * miscPower / 100000000;
  }

  public addMap() {

  }

  public getSave(): IPlayerSave {
    return {
      name: this.name,
      title: this.title,
      level: this.level,
      cosmetics: this.cosmetics,
      talent: this.talent,
      equipment: _.map(this.equipment, ItemManager.saveItem),
      artifacts: this.artifacts,
      skills: _.map(this.skills, ItemManager.saveSkill),
      skillTrees: this.skillTrees,
      skillPoints: this.skillpoints,
      inventory: _.map(this.inventory, ItemManager.saveItem),
      experience: this.experience,
    };
  }

  public getText(sort: 'compound' | 'basic'): string {
    let wantCompound = sort === 'compound';
    let m: string = '';

    _.forIn(this.stats, (stat, key) => {
      if (isCompoundStat(key as AnyStat) !== wantCompound) return;
      let percent = StatDisplay[key as AnyStat] === 'percent';
      m += key + ': ' + _.round(this.getStat(key as AnyStat) * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
      _.forIn(stat.tags, (st, key2) => {
        let stv = StatProgression[key as AnyStat] === 'linear' ? (st.base * (1 + st.mult)) : (Formula.addMult(st.base, st.base * st.mult) - st.neg);
        if (stv !== 0) {
          m += '- ' + key2 + ': ' + _.round(stv * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
        }
      });
    });

    return m;
  }

  public getActionList(distance?: 'b' | number) {
    return this.actions.getListAtDistance(distance);
  }

  public addStatMap(stats: StatMap) {
    if (stats) {
      stats.forEach(stat => {
        this.addStat(stat.stat, stat.tag, stat.value);
      });
    }
  }

  public removeStatMap(stats: StatMap) {
    if (stats) {
      stats.forEach(stat => {
        this.subStat(stat.stat, stat.tag, stat.value);
      });
    }
  }

  public addAction = (action: IAction) => {
    this.actions.addAction(action);
    this.onUpdate.publish();
  }

  public removeAction = (action: IAction) => {
    this.actions.removeAction(action);
    this.onUpdate.publish();
  }

  public equipItem = (item: IItem, slot: number) => {
    if (!item) return;

    if (slot > -1) {
      this.equipment[slot] = item;
    }

    if (item.action) {
      this.addAction(item.action);
    }
    if (item.triggers) {
      item.triggers.forEach(this.addTrigger);
    }

    this.addStatMap(item.stats);
  }

  public unequipItem = (item: IItem, slot: number) => {
    if (!item) return;

    if (slot > -1) {
      this.equipment[slot] = null;
    }

    if (item.action) {
      this.removeAction(item.action);
    }
    if (item.triggers) {
      item.triggers.forEach(this.removeTrigger);
    }

    this.removeStatMap(item.stats);
  }

  public addItem = (item: IItem, slot: number) => {
    this.inventory[slot] = item;
  }

  public removeItem = (item: IItem, slot: number) => {
    this.inventory[slot] = null;
  }

  public addSkill = (skill: ISkill) => {
    if (!skill) return;

    let index = _.findIndex(this.skills, {slug: skill.slug});
    if (index > -1) {
      if (this.skills[index] !== skill) {
        this.skills[index] = skill;
      }
    } else {
      this.skills.push(skill);
    }

    if (skill.action) {
      this.addAction(skill.action);
    }
    if (skill.triggers) {
      skill.triggers.forEach(this.addTrigger);
    }

    this.addStatMap(skill.stats);
  }

  public subSkill = (skill: ISkill) => {
    if (!skill) return;

    _.pull(this.skills, skill);

    if (skill.action) {
      this.removeAction(skill.action);
    }
    if (skill.triggers) {
      skill.triggers.forEach(this.removeTrigger);
    }

    this.removeStatMap(skill.stats);
  }

  public tryLevelSkill = (skill: ISkill): ISkill => {
    if (this.skillpoints <= 0) return skill;
    if (skill.level >= 10) return skill;

    let prereq = _.find(SkillPrerequisiteMap, pre => pre[0] === skill.slug);
    if (prereq && !_.some(this.skills, {slug: prereq[1]})) {
      return skill;
    }

    this.skillpoints--;
    let newSkill = DataConverter.getSkill(skill.slug, skill.level + 1);

    let existing = _.find(this.skills, {slug: skill.slug});

    if (existing) {
      this.subSkill(existing);
    }
    this.addSkill(newSkill);

    return newSkill;
  }

  public addTrigger = (trigger: IEffect) => {
    this.triggers.push(trigger);
  }

  public removeTrigger = (trigger: IEffect) => {
    _.pull(this.triggers, trigger);
  }

  public getTriggersFor = (event: EffectTrigger, tags?: StatTag[]) => {
    let m = _.filter(this.triggers, {trigger: event});
    if (tags && tags.length > 0) {
      m = _.filter(m, effect => !effect.triggerTags || effect.triggerTags.length === 0 || _.some(effect.triggerTags, tag => _.includes(tags, tag)));
    }

    return m;
  }
}
