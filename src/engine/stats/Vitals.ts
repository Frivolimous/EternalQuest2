export interface IVital {
  total: number;
  count: number;
  canOverflow?: boolean;
}

export type VitalType = 'health' | 'mana' | 'action' | 'experience';

export class Vitals {
  public regen: IVital = {count: 0, total: 100, canOverflow: true };

  private health: IVital = {count: 100, total: 100};
  private mana: IVital = {count: 100, total: 100};
  private action: IVital = {count: 0, total: 100, canOverflow: true};
  private experience: IVital = {count: 0, total: 10, canOverflow: true};

  private updateCallback: (vitals: Vitals) => void;

  constructor() {

  }

  public setUpdateCallback(updateCallback: (vitals: Vitals) => void) {
    this.updateCallback = updateCallback;
  }

  public setVital(vital: VitalType, count: number, total?: number) {
    this[vital].count = count;
    if (total) {
      this[vital].total = total;
    }

    this.updateCallback && this.updateCallback(this);
  }

  public setTotal(vital: VitalType, total: number) {
    this[vital].total = total;

    if (!this[vital].canOverflow) {
      this[vital].count = Math.min(this[vital].count, this[vital].total);
    }

    this.updateCallback && this.updateCallback(this);
  }

  public getVital(vital: VitalType) {
    return this[vital].count;
  }

  public getTotal(vital: VitalType) {
    return this[vital].total;
  }

  public addCount(vital: VitalType, count: number) {
    let v = this[vital];
    v.count += count;

    if (!v.canOverflow) {
      v.count = Math.min(v.count, v.total);
    }

    this.updateCallback && this.updateCallback(this);
  }

  public fillVital(vital: VitalType, total?: number) {
    let v = this[vital];
    if (total) {
      v.total = total;
    }
    v.count = v.total;

    this.updateCallback && this.updateCallback(this);
  }
}
