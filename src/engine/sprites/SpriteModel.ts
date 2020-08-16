import { StatModel } from '../stats/StatModel';
import { Vitals } from '../stats/Vitals';
import { BuffContainer } from './BuffContainer';
import { Formula } from '../../services/Formula';
import { JMEventListener } from '../../JMGE/events/JMEventListener';
import { SkillSlug } from '../../data/SkillData';

export class SpriteModel {
  public onLevelUp = new JMEventListener<SpriteModel>();
  public buffs: BuffContainer;
  public vitals: Vitals;

  public tile = 0;
  public player = false;
  public exists = true;
  public dead = false;
  public focusTarget: SpriteModel;

  constructor(public stats: StatModel) {

    this.vitals = new Vitals();
    this.buffs = new BuffContainer();

    this.vitals.fillVital('health', this.stats.getStat('health'));
    this.vitals.fillVital('mana', this.stats.getStat('mana'));
    this.vitals.setVital('experience', this.stats.experience, Formula.experienceByLevel(this.stats.level));

    this.stats.onUpdate.addListener(() => {
      this.vitals.setTotal('health', this.stats.getStat('health'));
      this.vitals.setTotal('mana', this.stats.getStat('mana'));
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
    this.dead = false;
  }

  public checkDeath() {
    if (this.vitals.getVital('health') <= 0) {
      this.dead = true;
    }
  }

  public incAction() {
    this.vitals.addCount('action', Math.max(0, this.stats.getStat('speed') / 10));
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
      if (this.stats.talent.slug === SkillSlug.NOBLE) {
        if (this.stats.level % 12 === 0) {
          this.stats.skillpoints += 1;
        }
      }
      cXp -= tXp;
      tXp = Formula.experienceByLevel(this.stats.level);
      this.onLevelUp.publish(this);
    }
    this.stats.experience = cXp;
    this.vitals.setVital('experience', cXp, tXp);
  }
}
