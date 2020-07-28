import * as _ from 'lodash';
import { IBuff, BuffSlug } from '../../data/BuffData';

export class BuffContainer {
  public buffs: IActiveBuff[] = [];

  public hasBuff(slug: BuffSlug) {
    let buff = _.find(this.buffs, data => data.source.name === slug);
    return Boolean(buff);
  }

  public getBuff(slug: BuffSlug) {
    return _.find(this.buffs, data => data.source.name === slug);
  }

  public addBuff(buff: IActiveBuff) {
    this.buffs.push(buff);
  }

  public removeBuff(buff: IActiveBuff) {
    _.pull(this.buffs, _.find(this.buffs, buff2 => buff2.source.name === buff.source.name));
  }

  public removeBuffCalled(slug: BuffSlug) {
    let index = _.findIndex(this.buffs, buff => buff.source.name === slug);
    this.buffs.splice(index, 1);
  }

  public getActionBuffs() {
    return _.filter(this.buffs, buff => buff.source.clearType === 'action');
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
