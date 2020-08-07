import { IItem } from '../data/ItemData';
import { SaveManager } from './SaveManager';

export const StoreManager = {
  sellItem: (item: IItem, onComplete: (result: IPurchaseResult) => void) => {
    SaveManager.getExtrinsic().currency.gold += item.cost;
    onComplete({success: true});
  },

  goldPurchaseAttempt: (value: number, onComplete: (result: IPurchaseResult) => void) => {
    let currentGold = SaveManager.getExtrinsic().currency.gold;
    if (currentGold >= value) {
      if (value > 100) {
        onComplete({success: false, confirmation: () => {
          SaveManager.getExtrinsic().currency.gold = currentGold - value;
          onComplete({success: true});
        }});
      } else {
        SaveManager.getExtrinsic().currency.gold = currentGold - value;
        onComplete({success: true});
      }
    } else {
      onComplete({success: false});
    }
  },

};

export interface IPurchaseResult {
  success: boolean;
  confirmation?: () => void;
  message?: string;
}
