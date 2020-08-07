import * as _ from 'lodash';

import { IAction } from '../../data/ActionData';
import { DataConverter } from '../../services/DataConverter';

export class ActionContainer {
  private list: IAction[];

  private unarmed: IAction;

  constructor() {
    this.unarmed = DataConverter.getAction('strike', 0);
    this.unarmed.tags.push('Unarmed', 'Weapon', 'Melee');

    this.list = [this.unarmed, DataConverter.getAction('approach', 0), DataConverter.getAction('walk', 0), DataConverter.getAction('idle', 0)];
  }

  public addAction = (action: IAction) => {
    if (!action) return;

    if (action.slug === 'strike') {
      let i = _.findIndex(this.list, {slug: 'strike'});
      this.list[i] = action;
    } else {
      this.list.unshift(action);
    }
    this.sortActions();
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

  public getListAtDistance = (distance?: 'b' | number) => {
    if (!distance && distance !== 0) {
      return this.list;
    } else {
      return _.filter(this.list, action => _.includes(action.distance, distance));
    }
  }

  public getStrikeActions = () => {
    return this.list.filter(action => (action.slug === 'strike' || action.slug === 'approach' || action.slug === 'leap'));
  }

  private sortActions() {
    this.list = _.sortBy(this.list, action => {
      let val = 0;
      if (action.slug === 'idle') {
        return 10;
      } else if (action.slug === 'gotown') {
        return 0;
      } else if (action.slug === 'withdraw' || action.slug === 'Confused' || action.slug === 'Afraid') {
        return 1;
      } else if (action.type === 'walk') {
        return 9;
      } else if (action.slug === 'strike') {
        return 8;
      } else if (action.type === 'attack') {
        return 7;
      } else {
        return 6;
      }
    });
  }
}
