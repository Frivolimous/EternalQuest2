import { IAction, ActionSlug } from '../../data/ActionData';
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
      let i = this.list.findIndex(data => data.slug === 'strike');
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
      this.list.splice(this.list.indexOf(action), 1);
    }
  }

  public getListAtDistance = (distance?: 'b' | number) => {
    if (!distance && distance !== 0) {
      return this.list;
    } else {
      return this.list.filter(action => action.distance.includes(distance));
    }
  }

  public getStrikeActions = () => {
    return this.list.filter(action => (action.slug === 'strike' || action.slug === 'approach' || action.slug === 'leap'));
  }

  public getAction = (slug: ActionSlug) => {
    return this.list.find(action => action.slug === slug);
  }

  private sortActions() {
    this.list = this.list.sort((a, b) => {
      return this.getActionWeight(a) - this.getActionWeight(b);
    });
  }

  private getActionWeight(action: IAction) {
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
  }
}
