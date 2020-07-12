import { StatModel } from '../stats/StatModel';
import { Vitals } from '../stats/Vitals';
import { IItem } from '../../data/ItemData';
import { BuffManager } from './BuffManager';

export class SpriteModel {
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
}
