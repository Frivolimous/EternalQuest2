import { IBuff, BuffSlug } from '../../data/BuffData';

export class BuffContainer {
  public buffs: IActiveBuff[] = [];

  public hasBuff(slug: BuffSlug) {
    let buff = this.buffs.find(data => data.source.name === slug);
    return Boolean(buff);
  }

  public getBuff(slug: BuffSlug) {
    return this.buffs.find(data => data.source.name === slug);
  }

  public addBuff(buff: IActiveBuff) {
    this.buffs.push(buff);
  }

  public removeBuff(buff: IActiveBuff) {
    let index = this.buffs.findIndex(buff2 => buff2.source.name === buff.source.name);
    this.buffs.splice(index, 1);
  }

  public removeBuffCalled(slug: BuffSlug) {
    let index = this.buffs.findIndex(buff => buff.source.name === slug);
    this.buffs.splice(index, 1);
  }

  public getActionBuffs() {
    return this.buffs.filter(buff => buff.source.clearType === 'action');
  }

  public clearBuffs() {
    this.buffs = [];
  }
}

export interface IActiveBuff {
  source: IBuff;
  remaining: number;
  timer: number;
  onAdd?: () => void;
  onTick?: () => void;
  onRemove?: () => void;
}
