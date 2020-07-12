import * as _ from 'lodash';
import { IItem, IItemSave } from '../data/ItemData';
import { DataConverter } from './DataConverter';

export const ItemManager = {
  loadItem: (itemSave: IItemSave): IItem => {
    if (!itemSave) return null;

    return DataConverter.getItem(itemSave.slug, itemSave.level);
  },
  saveItem: (item: IItem): IItemSave => {
    if (!item) return null;
    return {slug: item.slug, level: item.level};
  },
};
