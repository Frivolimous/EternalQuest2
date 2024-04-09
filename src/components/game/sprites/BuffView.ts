import * as PIXI from 'pixi.js';
import _ from 'lodash';

import { BuffIcon } from './BuffIcon';
import { BuffContainer, IActiveBuff } from '../../../engine/sprites/BuffContainer';

let across = 8;
let space = 12;

export class BuffView extends PIXI.Container {
  private buffs: BuffIcon[] = [];

  constructor() {
    super();
  }

  public updateBuffs = (buffList: BuffContainer) => {
    let modelBuffs = buffList.buffs;
    let viewBuffs = this.buffs;

    let toAdd = modelBuffs.filter(model => !viewBuffs.some(view => view.settings === model));
    let toRemove = viewBuffs.filter(view => !modelBuffs.some(model => model === view.settings));
    let toUpdate = viewBuffs.filter(view => modelBuffs.some(model => model === view.settings));

    toAdd.forEach(this.addBuff);
    toRemove.forEach(this.removeBuff);
    toUpdate.forEach(this.updateBuff);

    this.sort();
  }

  private addBuff = (model: IActiveBuff) => {
    let view = new BuffIcon(model);
    this.buffs.push(view);
    this.addChild(view);
  }

  private removeBuff = (view: BuffIcon) => {
    view.destroy();
    _.pull(this.buffs, view);
  }

  private updateBuff = (view: BuffIcon) => {
    view.update();
  }

  private sort() {
    this.buffs.forEach((view, i) => view.position.set((i % across) * space, Math.floor(i / across) * space));
  }
}
