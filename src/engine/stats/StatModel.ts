import * as _ from 'lodash';

import { StatTag, dCompoundMap, StatMap, StatBlock, dStatBlock, AnyStat, StatProgression, StatDisplay, isCompoundStat, getPowerType, CompoundMap, ICompoundMap, dStatPlayer } from '../../data/StatData';
import { Formula } from '../../services/Formula';
import { IPlayerSave } from '../../data/SaveData';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { ActionContainer } from './ActionContainer';
import { IItem } from '../../data/ItemData';
import { ItemManager } from '../../services/ItemManager';
import { IAction } from '../../data/ActionData';
import { ISkill, SkillPrerequisiteMap, SkillTreeSlug, SkillPageMap, SkillList, SkillSlug } from '../../data/SkillData';
import { DataConverter } from '../../services/DataConverter';
import { IEnemy, dStatEnemy } from '../../data/EnemyData';
import { IEffect, EffectTrigger } from '../../data/EffectData';

export class StatModel {
  public static fromSave(save: IPlayerSave): StatModel {
    let m = new StatModel(save.name, save.level, save.cosmetics, save.equipment.map(ItemManager.loadItem), save.inventory.map(ItemManager.loadItem), save.artifacts, save.skills.map(ItemManager.loadSkill), ItemManager.loadSkill({slug: save.talent, level: 0}), save.experience);
    m.addStatMap(dStatPlayer);

    m.skillpoints = save.skillPoints || 0;
    m.skillTrees = save.skillTrees;
    return m;
  }

  public static fromEnemy(enemy: IEnemy): StatModel {
    let m = new StatModel(enemy.name, enemy.level, enemy.cosmetics, enemy.equipment);
    m.addStatMap(enemy.stats);
    m.xp = enemy.xp;

    if (enemy.actions) {
      enemy.actions.forEach(action => {
        m.addAction(action);
      });
    }

    return m;
  }

  public skillpoints = 0;
  public skillTrees: SkillTreeSlug[];
  public onUpdate = new JMEventListener<StatModel>(false, true);
  public xp: number; // enemy xp value

  private stats: StatBlock;

  private actions: ActionContainer;
  private triggers: IEffect[] = [];
  private unarmored: any;
  private compoundMap: CompoundMap;

  constructor(
    public name?: string,
    public level?: number,
    public cosmetics?: any,

    public equipment?: IItem[],
    public inventory?: IItem[],
    public artifacts?: any,
    public skills?: ISkill[],
    public talent?: ISkill,
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

    if (this.talent) {
      this.addSkill(talent, true);
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
      this.onUpdate.publish(this);
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
      this.onUpdate.publish(this);
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

  public getPower(tags?: StatTag[], misc?: number, distance?: number) {
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

    if (distance) {
      if (distance === 1) {
        if (power.tags.Near) {
          miscPower += power.tags.Near.base;
          miscMult += power.tags.Near.mult;
        }
      } else {
        if (power.tags.Far) {
          miscPower += power.tags.Far.base;
          miscMult += power.tags.Far.mult;
        }
      }
    }

    itemPower *= itemMult;
    actionPower *= actionMult;
    effectPower *= effectMult;
    miscPower *= miscMult;

    return itemPower * actionPower * effectPower * miscPower / 100000000;
  }

  public addMap() {

  }

  public getSave(): IPlayerSave {
    return {
      name: this.name,
      level: this.level,
      cosmetics: this.cosmetics,
      talent: this.talent.slug,
      equipment: this.equipment.map(ItemManager.saveItem),
      artifacts: this.artifacts,
      skills: this.skills.map(ItemManager.saveSkill),
      skillTrees: this.skillTrees,
      skillPoints: this.skillpoints,
      inventory: this.inventory.map(ItemManager.saveItem),
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

  public getStrikeActions() {
    return this.actions.getStrikeActions();
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
    this.onUpdate.publish(this);
  }

  public removeAction = (action: IAction) => {
    this.actions.removeAction(action);
    this.onUpdate.publish(this);
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

  public addSkill = (skill: ISkill, unsaved?: boolean) => {
    if (!skill) return;

    if (!unsaved) {
      let index = _.findIndex(this.skills, {slug: skill.slug});
      if (index > -1) {
        if (this.skills[index] !== skill) {
          this.skills[index] = skill;
        }
      } else {
        this.skills.push(skill);
      }
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
    let maxLevel = (this.talent.slug === SkillSlug.NOBLE ? 7 : 10);
    if (skill.level >= maxLevel) return skill;

    let prereq = SkillPrerequisiteMap.find(data => data[0] === skill.slug);

    if (prereq && !this.skills.some(data => data.slug === prereq[1])) {
      return skill;
    }

    this.skillpoints--;
    let newSkill = DataConverter.getSkill(skill.slug, skill.level + 1);
    let existing = this.skills.find(data => data.slug === skill.slug);

    if (existing) {
      this.subSkill(existing);
    }
    this.addSkill(newSkill);

    let tree = SkillPageMap.find(data => data.skills.map(data2 => data2.slug).includes(skill.slug));
    let passiveSlug = tree.passive;

    let passive = this.skills.find(data => data.slug === passiveSlug);
    if (passive) {
      let newPassive = DataConverter.getSkill(passiveSlug, passive.level + 1);
      this.subSkill(passive);
      this.addSkill(newPassive);
    } else {
      this.addSkill(DataConverter.getSkill(passiveSlug, 1));
    }

    return newSkill;
  }

  public respecSkills = () => {
    while (this.skills.length > 0) {
      let skill = this.skills[0];
      this.subSkill(skill);
      let raw = SkillList.find(data => data.slug === skill.slug);
      if (!raw.passive && !raw.talent) {
        this.skillpoints += skill.level;
      }
    }
  }

  public getTotalSkillLevel = () => {
    let levels = 0;
    this.skills.forEach(skill => {
      let raw = SkillList.find(data => data.slug === skill.slug);
      if (!raw.passive && !raw.talent) {
        levels += skill.level;
      }
    });

    return levels;
  }

  public addTrigger = (trigger: IEffect) => {
    this.triggers.push(trigger);
  }

  public removeTrigger = (trigger: IEffect) => {
    _.pull(this.triggers, trigger);
  }

  public getTriggersFor = (event: EffectTrigger | EffectTrigger[], tags?: StatTag[]) => {
    let m: IEffect[];
    if (Array.isArray(event)) {
      m = this.triggers.filter(effect => event.includes(effect.trigger));
    } else {
      m = this.triggers.filter(effect => effect.trigger === event);
    }

    m = m.filter(effect => {
      if (!effect.triggerTags || effect.triggerTags.length === 0) {
        return true;
      }
      if (tags && tags.length > 0) {
        for (let i = 0; i < tags.length; i++) {
          if (effect.triggerTags.includes(tags[i])) {
            return true;
          }
        }
      }
      return false;
    });

    return m;
  }
}
