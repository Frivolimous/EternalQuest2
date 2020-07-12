import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BuffIcon } from './BuffIcon';
import { BuffManager, IActiveBuff } from '../../../engine/sprites/BuffManager';

let across = 8;
let space = 12;

export class BuffView extends PIXI.Container {
  private buffs: BuffIcon[] = [];

  constructor() {
    super();
  }

  public updateBuffs = (buffList: BuffManager) => {
    let modelBuffs = buffList.buffs;
    let viewBuffs = this.buffs;

    let toAdd = _.filter(modelBuffs, model => !_.some(viewBuffs, view => view.settings.source.name === model.source.name));
    let toRemove = _.filter(viewBuffs, view => !_.some(modelBuffs, model => model.source.name === view.settings.source.name));
    let toUpdate = _.filter(viewBuffs, view => _.some(modelBuffs, model => model.source.name === view.settings.source.name));

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
