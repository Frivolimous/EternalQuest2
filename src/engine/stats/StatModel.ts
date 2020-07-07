import * as _ from 'lodash';
import { BaseStats, CompoundStat, BaseStat, StatTag, CompoundStats, dBaseStats, dCompoundStats, CompoundMap, BaseStatProgression, BaseStatDisplay, SimpleStats, CompoundStatProgression, CompoundStatDisplay } from '../../data/StatData';
import { Formula } from '../../services/Formula';
import { IPlayerSave } from '../../data/SaveData';
import { IEnemyStats } from '../../services/SpawnEnemy';
import { JMEventListener } from '../../JMGE/events/JMEventListener';

export class StatModel {
  public static fromSave(save: IPlayerSave): StatModel {
    let m = new StatModel(save.name, save.title, save.level, save.cosmetics, save.equipment, save.inventory, save.artifacts, save.skills, save.talent, save.experience);

    return m;
  }

  public static fromEnemy(enemy: IEnemyStats): StatModel {
    let m = new StatModel(enemy.name, null, enemy.level, null, enemy.equipment, null, null, null, null, null);

    return m;
  }

  public onUpdate = new JMEventListener<void>(false, true);

  private baseStats: BaseStats;
  private compoundStats: CompoundStats;

  private actions: any;
  private triggers: any;
  private unarmed: any;
  private unarmored: any;

  constructor(
    public name?: string,
    public title?: string,
    public level?: number,
    public cosmetics?: any,

    public equipment?: any,
    public inventory?: any,
    public artifacts?: any,
    public skills?: any,
    public talent?: any,
    public experience?: number,
  ) {
    this.baseStats = _.cloneDeep(dBaseStats);
    this.compoundStats = _.cloneDeep(dCompoundStats);
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
      equipment: this.equipment,
      artifacts: this.artifacts,
      skills: this.skills,
      inventory: this.inventory,
      experience: this.experience,
    };
  }

  public getText(sort: 'compound' | 'basic'): string {
    let m: string = '';
    switch (sort) {
      case 'compound':
        for (let key of Object.keys(this.compoundStats)) {
          let percent = CompoundStatDisplay[key as CompoundStat] === 'percent';
          m += key + ': ' + _.round(this.compoundStats[key as CompoundStat] * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
        }
        break;
      case 'basic':
        for (let key of Object.keys(this.baseStats)) {
          let stat = this.baseStats[key as BaseStat];
          let percent = BaseStatDisplay[key as BaseStat] === 'percent';
          m += key + ': ' + _.round(this.getBaseStat(key as BaseStat) * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
          for (let key2 of Object.keys(stat.tags)) {
            let st = this.baseStats[key as BaseStat].tags[key2 as StatTag];
            let stv = BaseStatProgression[key as BaseStat] === 'linear' ? (st.base * (1 + st.mult)) : (Formula.addMult(st.base, st.base * st.mult) - st.neg);
            m += '- ' + key2 + ': ' + _.round(stv * (percent ? 100 : 1), 1) + (percent ? '%' : '') + '\n';
          }
        }
        break;
    }

    return m;
  }
}