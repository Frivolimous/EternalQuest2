import * as _ from 'lodash';
import { IItem, IItemSave, ItemList } from '../data/ItemData';
import { ActionManager } from './ActionManager';

export const ItemManager = {
  loadItem: (itemSave: IItemSave): IItem => {
    if (!itemSave) return null;

    let item = _.cloneDeep(ItemList[itemSave.index]);
    if (item.action) {
      item.action.source = item;
    }
    return item;
  },
  saveItem: (item: IItem): IItemSave => {
    if (!item) return null;

    return item.save;
  },
};
