import * as _ from 'lodash';
import { IItem, IItemSave, ItemList, EnchantSlug, EnchantList, IItemRaw, EnchantMaps, LootMap, ItemSlug, CharmEnchantMaps } from '../data/ItemData';
import { DataConverter } from './DataConverter';
import { ISkill, ISkillSave } from '../data/SkillData';
import { IPlayerLevelSave } from '../data/SaveData';
import { SpriteModel } from '../engine/sprites/SpriteModel';
import { RandomSeed } from './RandomSeed';
import { Formula } from './Formula';
import { SaveManager } from './SaveManager';

export const ItemManager = {
  loadItem: (itemSave: IItemSave): IItem => {
    if (!itemSave) return null;

    return DataConverter.getItem(itemSave.slug, itemSave.level, itemSave.enchant, itemSave.charges, itemSave.scrollOf);
  },
  saveItem: (item: IItem): IItemSave => {
    if (!item) return null;
    let save: IItemSave;
    if (item.scrollOf) {
      save = {slug: ItemSlug.SCROLL, level: item.level, scrollOf: item.scrollOf, charges: item.charges};
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

  makeGambleArray: (): ItemSlug[] => {
    let m: ItemSlug[] = [];

    for (let i = 0; i < 3; i++) {
      let slug: ItemSlug;

      switch (RandomSeed.general.getInt(0, 6)) {
        case 0: case 1: slug = _.sample(LootMap.Weapon); break;
        case 2: case 3: slug = _.sample(LootMap.Helmet); break;
        case 4: slug = _.sample(LootMap.Thrown); break;
        case 5: slug = _.sample(LootMap.Charm); break;
        case 6: slug = ItemSlug.SCROLL; break;
      }

      m.push(slug);
    }

    return m;
  },

  finishGamble(item: IItem, level: number): IItem {
    let slug = item.slug;
    let save: IItemSave = {slug, level};

    if (slug === ItemSlug.SCROLL) {
      save.scrollOf = _.sample(LootMap.Spell);
    } else if (item.tags.includes('Charm')) {
      save.enchant = [_.sample(CharmEnchantMaps[slug])];
    } else if (item.tags.includes('Thrown')) {
      save.enchant = [_.sample(EnchantMaps.Thrown)];
    } else if (item.tags.includes('Weapon')) {
      save.enchant = [_.sample(EnchantMaps.Weapon)];
    } else if (item.tags.includes('Helmet')) {
      save.enchant = [_.sample(EnchantMaps.Helmet)];
    }

    return ItemManager.loadItem(save);
  },

  getLootFor: (player: SpriteModel, level: IPlayerLevelSave, enemy: SpriteModel, boss?: boolean): IItem => {
    let iloot = player.stats.getStat('iloot');

    let ploot = boss ? Math.min(level.zone / 3, 0.1) : Math.min(0.00019 * (1 + level.zone / 1500), 0.1);

    if (RandomSeed.general.getRaw() < ploot) {
      // return spawnPremium(level 0);
    }

    if (RandomSeed.general.getRaw() < iloot) {
      let itemLevel = Formula.itemLevelByZone(level.zone);
      let enchantSlug: EnchantSlug;
      let slug: ItemSlug;
      let charges: number;
      let scrollOf: ItemSlug;
      let rand = RandomSeed.general.getInt(0, 14);
      switch (rand) {
        case 0: case 1: case 2:
          slug = _.sample(LootMap.Weapon);
          if (slug === ItemSlug.GLOVES || RandomSeed.general.getRaw() < iloot) {
            enchantSlug = _.sample(EnchantMaps.Weapon);
          }
          break;
        case 3: case 4:
          slug = _.sample(LootMap.Helmet);
          if (slug === ItemSlug.BANDANA || RandomSeed.general.getRaw() < iloot) {
            enchantSlug = _.sample(EnchantMaps.Helmet);
          }
          break;
        case 5:
          slug = _.sample(LootMap.Spell);
          break;
        case 6:
          slug = _.sample(LootMap.Thrown);
          // random charges
          if (RandomSeed.general.getRaw() < iloot) {
            enchantSlug = _.sample(EnchantMaps.Thrown);
            // max charges
          }
          break;
        case 7:
          slug = ItemSlug.SCROLL;
          scrollOf = _.sample(LootMap.Spell);
          break;
        case 8:
          slug = _.sample(LootMap.Charm);
          enchantSlug = _.sample(CharmEnchantMaps[slug]);
          break;
        case 9: case 10: case 11:
          slug = _.sample(LootMap.Trade);
          itemLevel = Formula.itemLevelByZone(level.zone, true);
          if (itemLevel > 15) {
            itemLevel = Math.floor(15 + (itemLevel - 15) * 0.3);
          }
          break;
        case 12: case 13: case 14:
          slug = _.sample(LootMap.Potion);
          break;
      }

      let item = DataConverter.getItem(slug, itemLevel, enchantSlug, charges, scrollOf);
      if (item.maxCharges > 1) {
        item.charges = Math.floor(item.maxCharges / 2 + item.maxCharges / 2 * RandomSeed.general.getRaw());
      }
      return item;
    }
  },

  addOverflow: (item: IItem) => {
    let overflow = SaveManager.getExtrinsic().overflowStash;
    overflow.push(ItemManager.saveItem(item));
  },
};
