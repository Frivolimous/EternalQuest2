import * as _ from 'lodash';
import { IItem, IItemSave, ItemList } from '../data/ItemData';
import { DataConverter } from './DataConverter';
import { ISkill, ISkillSave } from '../data/SkillData';
import { IPlayerLevelSave } from '../data/SaveData';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { RandomSeed } from './RandomSeed';

export const ItemManager = {
  loadItem: (itemSave: IItemSave): IItem => {
    if (!itemSave) return null;

    return DataConverter.getItem(itemSave.slug, itemSave.level, itemSave.enchant, itemSave.charges, itemSave.scrollOf);
  },
  saveItem: (item: IItem): IItemSave => {
    if (!item) return null;
    let save: IItemSave;
    if (item.scrollOf) {
      save = {slug: 'Scroll', level: item.level, scrollOf: item.scrollOf, charges: item.charges};
      if (item.enchantSlug) {
        save.enchant = item.enchantSlug;
      }
    } else {
      save = {slug: item.slug, level: item.level};
      if (item.enchantSlug) {
        save.enchant = item.enchantSlug;
      }
      if (item.charges || item.charges === 0) {
        save.charges = item.charges;
      }
    }

    return save;
  },

  loadSkill: (skillSave: ISkillSave): ISkill => {
    if (!skillSave) return null;

    return DataConverter.getSkill(skillSave.slug, skillSave.level);
  },
  saveSkill: (skill: ISkill): ISkillSave => {
    if (!skill) return null;
    return {slug: skill.slug, level: skill.level};
  },

  getLootFor: (player: SpriteModel, level: IPlayerLevelSave, enemy: SpriteModel): IItem => {
    if (RandomSeed.general.getRaw() < 0.25) {
      return DataConverter.getItem(_.sample(ItemList), Math.round(level.zone) / 10);
    }
  },
};
