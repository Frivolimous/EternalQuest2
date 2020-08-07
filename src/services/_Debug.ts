import * as PIXI from 'pixi.js';
import { GameEvents } from './GameEvents';
import { virtualSave } from './SaveManager';
import { ItemList, ItemScrollSlugs, EnchantMaps } from '../data/ItemData';

export const DEBUG_MODE = true;

export class Debug {
  public static initialize(app: PIXI.Application) {
    if (DEBUG_MODE) {
      GameEvents.ACTION_LOG.addListener(e => {
        console.log('ACTION:', e.text);
      });
      GameEvents.APP_LOG.addListener(e => {
        console.log('APP:', e.type, ' : ', e.text);
      });
    }

    virtualSave.Players.aewfinwgo.inventory.push({slug: 'Statue', level: 5, enchant: ['Vampiric']});
    virtualSave.Players.aewfinwgo.inventory.push({slug: 'Statue', level: 5, enchant: ['Vampiric']});
    virtualSave.Players.aewfinwgo.inventory.push({slug: 'Statue', level: 5, enchant: ['Vampiric']});
    virtualSave.Players.aewfinwgo.inventory.push({slug: 'Greatsword', level: 5, enchant: ['Vampiric']});
    virtualSave.Players.aewfinwgo.inventory.push({slug: 'Magic Bolt', level: 5});
    // for (let i = 0; i < 5; i++) {
    //   virtualSave.Players.aewfinwgo.inventory.push({slug: 'Trophy', level: i});
    // }
    // EnchantMaps.Charm.forEach(slug => {
      // virtualSave.Players.aewfinwgo.inventory.push({slug: 'Statue', level: 5, enchant: [slug]});
    // });
    // virtualSave.Players.aewfinwgo.inventory.push({slug: 'Gloves', level: 5});
    // ItemList.forEach((item, i) => {
    //   virtualSave.extrinsic.overflowStash.push({slug: item.slug, level: 0});
    //   if (i > 15) {
    //     virtualSave.Players.aewfinwgo.inventory.push({slug: item.slug, level: 5});
    //   }
    // });
  }
}
