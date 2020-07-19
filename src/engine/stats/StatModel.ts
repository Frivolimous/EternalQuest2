import * as _ from 'lodash';
import { BaseStats, CompoundStat, BaseStat, StatTag, CompoundStats, dBaseStats, dCompoundStats, CompoundMap, BaseStatProgression, BaseStatDisplay, SimpleStats, CompoundStatProgression, CompoundStatDisplay, StatMap } from '../../data/StatData';
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

export class StatModel {
  public static fromSave(save: IPlayerSave): StatModel {
    let m = new StatModel(save.name, save.title, save.level, save.cosmetics, _.map(save.equipment, ItemManager.loadItem), _.map(save.inventory, ItemManager.loadItem), save.artifacts, _.map(save.skills, ItemManager.loadSkill), save.talent, save.experience);
    m.skillpoints = save.skillPoints || 0;
    m.skillTrees = save.skillTrees;
    return m;
  }

  public static fromEnemy(enemy: IEnemy): StatModel {
    let m = new StatModel(enemy.name, null, enemy.level, enemy.cosmetics, enemy.equipment);
    m.addStatMap(enemy.baseStats, enemy.compoundStats);

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

  private baseStats: BaseStats;
  private compoundStats: CompoundStats;

  private actions: ActionContainer;
  private triggers: any;
  private unarmored: any;

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
    this.baseStats = _.cloneDeep(dBaseStats);
    this.compoundStats = _.cloneDeep(dCompoundStats);
    this.actions = new ActionContainer();
    if (this.equipment) {
      this.equipment.forEach(item => this.equipItem(item, -1));
    }

    if (this.skills) {
      this.skills.forEach(skill => this.addSkill(skill));
    }
  }

  public addCompountStat(stat: CompoundStat, value: number) {
    for (let val of CompoundMap[stat]) {
      this.subBaseStat(val.stat, val.tag, this.compoundStats[stat] * val.percent);
    }

    if (CompoundStatProgression[stat] === 'linear') {
      this.compoundStats[stat] += value;
    } else if (CompoundStatProgression[stat] === 'diminish') {
      this.compoundStats[stat] = Formula.addMult(this.compoundStats[stat], value);
    }

    for (let val of CompoundMap[stat]) {
      this.addBaseStat(val.stat, val.tag, this.compoundStats[stat] * val.percent);
    }
  }

  public subCompountStat(stat: CompoundStat, value: number) {
    for (let val of CompoundMap[stat]) {
      this.subBaseStat(val.stat, val.tag, this.compoundStats[stat] * val.percent);
    }

    if (CompoundStatProgression[stat] === 'linear') {
      this.compoundStats[stat] -= value;
    } else if (CompoundStatProgression[stat] === 'diminish') {
      this.compoundStats[stat] = Formula.subMult(this.compoundStats[stat], value);
    }

    for (let val of CompoundMap[stat]) {
      this.addBaseStat(val.stat, val.tag, this.compoundStats[stat] * val.percent);
    }
  }

  public getCompoundStat(stat: CompoundStat) {
    return this.compoundStats[stat];
  }

  public addBaseStat(stat: BaseStat, tag: StatTag, value: number) {
    let bs = this.baseStats[stat];
    if (BaseStatProgression[stat] === 'linear') {
      if (tag === 'Base') {
        bs.base += value;
      } else {
        if (!bs.tags[tag]) {
          bs.tags[tag] = {base: 0, mult: 0};
        }
        bs.tags[tag].base += value;
      }
    } else {
      if (tag === 'Base') {
        bs.base = Formula.addMult(bs.base, value);
      } else {
        if (!bs.tags[tag]) {
          bs.tags[tag] = {base: 0, mult: 0, neg: 0};
        }
        if (value < 0) {
          bs.tags[tag].neg = Formula.addMult(bs.tags[tag].neg, -value);
        } else {
          bs.tags[tag].base = Formula.addMult(bs.tags[tag].base, value);
        }
      }
    }

    this.onUpdate.publish();
  }

  public subBaseStat(stat: BaseStat, tag: StatTag, value: number) {
    let bs = this.baseStats[stat];
    if (BaseStatProgression[stat] === 'linear') {
      if (tag === 'Base') {
        bs.base -= value;
      } else {
        if (!bs.tags[tag]) {
          bs.tags[tag] = {base: 0, mult: 0};
        }
        bs.tags[tag].base -= value;
      }
    } else {
      if (tag === 'Base') {
        bs.base = Formula.subMult(bs.base, value);
      } else {
        if (!bs.tags[tag]) {
          bs.tags[tag] = {base: 0, mult: 0, neg: 0};
        }
        if (value < 0) {
          bs.tags[tag].neg = Formula.subMult(bs.tags[tag].neg, -value);
        } else {
          bs.tags[tag].base = Formula.subMult(bs.tags[tag].base, value);
        }
      }
    }
    this.onUpdate.publish();
  }

  public getBaseStat(stat: BaseStat, tags?: StatTag[], withValue?: number) {
    let bs = this.baseStats[stat];
    let m = bs.base;
    let mult = bs.mult;

    if (tags) {
      if (BaseStatProgression[stat] === 'linear') {
        tags.forEach(tag => {
          if (bs.tags[tag]) {
            m += bs.tags[tag].base;
            mult += bs.tags[tag].mult;
          }
        });
        if (withValue) {
          m += withValue;
        }
        m *= 1 + mult;
      } else if (BaseStatProgression[stat] === 'diminish') {
        let neg = bs.neg;

        tags.forEach(tag => {
          if (bs.tags[tag]) {
            m = Formula.addMult(m, bs.tags[tag].base);
            mult += bs.tags[tag].mult;
            neg += bs.tags[tag].neg;
          }
        });
        if (withValue) {
          m = Formula.addMult(m, withValue);
        }
        m = Formula.addMult(m, m * mult) - neg;
      }
    }

    return m;
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
    let m: string = '';
    switch (sort) {
      case 'compound':
        _.forIn(this.compoundStats, (stat, key) => {
          let percent = CompoundStatDisplay[key as CompoundStat] === 'percent';
          m += key + ': ' + _.round(stat * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
        });
        break;
      case 'basic':
        _.forIn(this.baseStats, (stat, key) => {
          let percent = BaseStatDisplay[key as BaseStat] === 'percent';
          m += key + ': ' + _.round(this.getBaseStat(key as BaseStat) * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
          _.forIn(stat.tags, (st, key2) => {
            let stv = BaseStatProgression[key as BaseStat] === 'linear' ? (st.base * (1 + st.mult)) : (Formula.addMult(st.base, st.base * st.mult) - st.neg);
            if (stv !== 0) {
              m += '- ' + key2 + ': ' + _.round(stv * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
            }
          });
        });
        break;
    }

    return m;
  }

  public getActionList(distance?: 'b' | number) {
    return this.actions.getListAtDistance(distance);
  }

  public addStatMap(baseStats?: StatMap, compoundStats?: CompoundMap) {
    if (baseStats) {
      baseStats.forEach(stat => {
        this.addBaseStat(stat.stat, stat.tag, stat.value);
      });
    }
    if (compoundStats) {
      compoundStats.forEach(stat => {
        this.addCompountStat(stat.stat, stat.value);
      });
    }
  }

  public removeStatMap(baseStats?: StatMap, compoundStats?: CompoundMap) {
    if (baseStats) {
      baseStats.forEach(stat => {
        this.subBaseStat(stat.stat, stat.tag, stat.value);
      });
    }
    if (compoundStats) {
      compoundStats.forEach(stat => {
        this.subCompountStat(stat.stat, stat.value);
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

    this.addStatMap(item.baseStats, item.compoundStats);
  }

  public unequipItem = (item: IItem, slot: number) => {
    if (!item) return;

    if (slot > -1) {
      this.equipment[slot] = null;
    }

    if (item.action) {
      this.removeAction(item.action);
    }

    this.removeStatMap(item.baseStats, item.compoundStats);
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

    this.addStatMap(skill.baseStats, skill.compoundStats);
  }

  public subSkill = (skill: ISkill) => {
    if (!skill) return;

    _.pull(this.skills, skill);

    if (skill.action) {
      this.removeAction(skill.action);
    }

    this.removeStatMap(skill.baseStats, skill.compoundStats);
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
}
