import * as _ from 'lodash';
import { IBuff, BuffSlug } from '../../data/BuffData';

export class BuffManager {
  public buffs: IActiveBuff[] = [];

  public hasBuff(slug: BuffSlug) {
    let buff = _.find(this.buffs, data => data.source.name === slug);
    return Boolean(buff);
  }

  public getBuff(slug: BuffSlug) {
    return _.find(this.buffs, data => data.source.name === slug);
  }

  public addBuff(buff: IActiveBuff) {
    let existing = this.getBuff(buff.source.name);
    if (existing) {
      buff.timer = existing.timer;
      existing.onRemove && existing.onRemove();
      _.pull(this.buffs, existing);
    }
    buff.onAdd && buff.onAdd();
    this.buffs.push(buff);
  }

  public getActionBuffs() {
    return _.filter(this.buffs, buff => buff.source.clearType === 'action');
  }

  public expendBuff(slug: BuffSlug) {
    let buff = this.getBuff(slug);
    if (buff) {
      buff.remaining --;
      if (buff.remaining <= 0) {
        buff.onRemove && buff.onRemove();
        _.pull(this.buffs, buff);
      }
    }
  }

  public tickBuffs(n: number = 10) {
    for (let i = 0; i < this.buffs.length; i++) {
      let buff = this.buffs[i];
      if (buff.source.clearType === 'time') {
        buff.timer += n;
        if (buff.timer > buff.source.duration) {
          buff.timer -= buff.source.duration;
          buff.remaining--;
          buff.onTick && buff.onTick();
          if (buff.remaining <= 0) {
            buff.onRemove && buff.onRemove();
            this.buffs.splice(i, 1);
            i--;
          }
        }
      }
    }
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
