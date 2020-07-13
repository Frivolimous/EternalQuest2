import { StatModel } from '../stats/StatModel';
import { Vitals } from '../stats/Vitals';
import { BuffManager } from './BuffManager';
import { Formula } from '../../services/Formula';
import { JMEventListener } from '../../JMGE/events/JMEventListener';

export class SpriteModel {
  public onLevelUp = new JMEventListener<SpriteModel>();
  public buffs: BuffManager;
  public vitals: Vitals;

  public tile = 0;
  public player = false;
  public exists = true;
  public dead = false;
  public focusTarget: SpriteModel;

  constructor(public stats?: StatModel) {
    if (!stats) {
      this.stats = new StatModel();
    }

    this.vitals = new Vitals();
    this.buffs = new BuffManager();

    this.vitals.fillVital('health', this.stats.getBaseStat('health'));
    this.vitals.fillVital('mana', this.stats.getBaseStat('mana'));
    this.vitals.setVital('experience', this.stats.experience, Formula.experienceByLevel(this.stats.level));

    this.stats.onUpdate.addListener(() => {
      this.vitals.setTotal('health', this.stats.getBaseStat('health'));
      this.vitals.setTotal('mana', this.stats.getBaseStat('mana'));
    });

    this.resetVitals();
  }

  public setVitalsCallback(callback: (vitals: Vitals) => void) {
    this.vitals.setUpdateCallback(callback);
  }

  public resetVitals() {
    this.vitals.fillVital('health');
    this.vitals.fillVital('mana');
    this.vitals.setVital('action', 0);
  }

  public checkDeath() {
    if (this.vitals.getVital('health') <= 0) {
      this.dead = true;
    }
  }

  public incAction() {
    this.vitals.addCount('action', this.stats.getBaseStat('speed') / 10);
  }

  public regenTick(value: number = 10) {
    this.vitals.regen.count += value;
    if (this.vitals.regen.count > this.vitals.regen.total) {
      this.vitals.regen.count -= this.vitals.regen.total;
      let hreg = this.stats.getBaseStat('hregen') * this.stats.getBaseStat('health');
      let mreg = this.stats.getBaseStat('mregen') * this.stats.getBaseStat('mana');
      this.vitals.addCount('health', hreg);
      this.vitals.addCount('mana', mreg);
    }

    this.buffs.tickBuffs(value);
  }

  public earnXp(n: number = 1) {
    if (this.stats.level >= 50) {
      return;
    }
    this.vitals.addCount('experience', n);
    let cXp = this.vitals.getVital('experience');
    let tXp = this.vitals.getTotal('experience');

    if (cXp >= tXp) {
      this.stats.level += 1;
      this.stats.skillpoints += 1;
      cXp -= tXp;
      tXp = Formula.experienceByLevel(this.stats.level);
      this.onLevelUp.publish(this);
    }
    this.stats.experience = cXp;
    this.vitals.setVital('experience', cXp, tXp);
  }
}
