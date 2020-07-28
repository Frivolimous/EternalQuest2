import * as PIXI from 'pixi.js';
import { GameEvents } from './GameEvents';
import { virtualSave } from './SaveManager';
import { ItemList } from '../data/ItemData';

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
    ItemList.forEach((item, i) => {
      virtualSave.extrinsic.overflowStash.push({slug: item.slug, level: 0});
      if (i > 15) {
        virtualSave.Players.aewfinwgo.inventory.push({slug: item.slug, level: 5});
      }
    });
  }
}
