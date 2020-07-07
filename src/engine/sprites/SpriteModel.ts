import { StatModel } from '../stats/StatModel';
import { Vitals } from '../stats/Vitals';

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
    this.checkDeath();
  }

  public addHealth(n: number) {
    this.vitals.addCount('health', n);
    this.checkDeath();
  }

  public get mana(): number {
    return this.vitals.getVital('mana');
  }

  public set mana(n: number) {
    this.vitals.setVital('mana', n);
    this.checkDeath();
  }

  public addMana(n: number) {
    this.vitals.addCount('mana', n);
    this.checkDeath();
  }
  public get action(): number {
    return this.vitals.getVital('action');
  }

  public set action(n: number) {
    this.vitals.setVital('action', n);
    this.checkDeath();
  }

  public addAction(n: number) {
    this.vitals.addCount('action', n);
    this.checkDeath();
  }

  public incAction() {
    this.vitals.addCount('action', this.stats.getBaseStat('speed') / 10);
  }
}
