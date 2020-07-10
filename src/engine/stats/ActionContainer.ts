import * as _ from 'lodash';

import { IAction, ActionList } from '../../data/ActionData';

export class ActionContainer {
  private list: IAction[];

  private unarmed: IAction;

  constructor() {
    this.unarmed = _.cloneDeep(ActionList.strike);
    this.unarmed.tags.push('Unarmed', 'Weapon', 'Melee');

    this.list = [this.unarmed, _.cloneDeep(ActionList.approach), _.cloneDeep(ActionList.walk), _.cloneDeep(ActionList.idle)];
  }

  public addAction = (action: IAction) => {
    if (!action) return;

    if (action.slug === 'strike') {
      let i = _.findIndex(this.list, {slug: 'strike'});
      this.list[i] = action;
    } else {
      this.list.unshift(action);
    }
  }

  public removeAction = (action: IAction) => {
    if (!action) return;

    if (action.slug === 'strike') {
      let i = this.list.indexOf(action);
      this.list[i] = this.unarmed;
    } else {
      _.pull(this.list, action);
    }
  }

  public getListAtDistance = (distance: 'between' | number) =>
    distance === 'between' ?
    _.filter(this.list, {between: true}) :
    _.filter(this.list, action => _.includes(action.distance, distance))
}
