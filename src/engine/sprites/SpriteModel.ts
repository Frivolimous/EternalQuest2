import { StatModel } from '../stats/StatModel';
import { Vitals } from '../stats/Vitals';
import { IItem } from '../../data/ItemData';

export class SpriteModel {
  public buffs: any;

  public tile = 0;
  public player = false;
  public exists = true;
  public dead = false;
  public focusTarget: SpriteModel;

  public vitals: Vitals;

  constructor(public stats?: StatModel) {
    if (!stats) {
      this.stats = new StatModel();
    }

    this.vitals = new Vitals();
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

  public get health(): number {
    return this.vitals.getVital('health');
  }

  public set health(n: number) {
    this.vitals.setVital('health', n);
    // this.checkDeath();
  }

  public addHealth(n: number) {
    this.vitals.addCount('health', n);
    // this.checkDeath();
  }

  public get mana(): number {
    return this.vitals.getVital('mana');
  }

  public set mana(n: number) {
    this.vitals.setVital('mana', n);
  }

  public addMana(n: number) {
    this.vitals.addCount('mana', n);
  }
  public get action(): number {
    return this.vitals.getVital('action');
  }

  public set action(n: number) {
    this.vitals.setVital('action', n);
  }

  public addAction(n: number) {
    this.vitals.addCount('action', n);
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
  }
}
