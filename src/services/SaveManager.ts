import * as _ from 'lodash';
import { IExtrinsicModel, dExtrinsicModel, IPlayerSave, dPlayerSave, IPlayerLevelSave } from '../data/SaveData';
import { IItemSave } from '../data/ItemData';

const CURRENT_VERSION = 8;
const SAVE_LOC: 'virtual' | 'local' | 'online' = 'virtual';
export const virtualSave: {version: number, extrinsic: IExtrinsicModel, Players: {[key: string]: IPlayerSave}, PlayerLevels: {[key: string]: IPlayerLevelSave}} = {
  version: 8,
  extrinsic: {
    lastCharacter: 'aewfinwgo',
    playerStash: {
      aewfinwgo: [{ slug: 'Greatsword', level: 5, enchant: 'Mystic' }, { slug: 'Armet', level: 5 }],
    },
    sharedStash: [
      [{ slug: 'Greatsword', level: 10 }, { slug: 'Cap', level: 10 }],
    ],
    currency: {
      gold: 0,
      tokens: 0,
    },
    overflowStash: [],
  },
  Players: {
    aewfinwgo: {
      name: 'Auster',
      title: 'Ordinary',
      level: 1,
      experience: 0,
      cosmetics: [],
      talent: 0,
      equipment: [{ slug: 'Greatsword', level: 0, enchant: 'Master' }, { slug: 'Armet', level: 0 }, null, null, null],
      artifacts: [],
      skills: [],
      skillTrees: ['Warrior', 'Ranger', 'Mage'],
      skillPoints: 50,
      inventory: [],
    },
    ewfngibna: {
      name: 'Rustus',
      title: 'Ordinary',
      level: 1,
      experience: 0,
      cosmetics: [],
      talent: 0,
      equipment: [{ slug: 'Greatsword', level: 0, enchant: 'Master' }, { slug: 'Armet', level: 0 }, null, null, null],
      artifacts: [],
      skills: [{ slug: 'Fitness', level: 5}],
      skillTrees: ['Warrior', 'Ranger'],
      skillPoints: 10,
      inventory: [{ slug: 'Greatsword', level: 0 }, {slug: 'Magic Bolt', level: 0 }, {slug: 'Fireball', level: 0 }, {slug: 'Magic Bolt', level: 10 }, null, { slug: 'Armet', level: 10 }],
    },
  },
  PlayerLevels: {
    aewfinwgo: {
      ascendedZone: 0,
      zone: 0,
      zoneType: 1,
      monsterType: 1,
      enemyCount: 0,
      highestChallenge: [1],
      flags: [],
      gambleShop: [],
      premiumShop: [],
    },
    ewfngibna: {
      ascendedZone: 0,
      zone: 10,
      zoneType: 1,
      monsterType: 1,
      enemyCount: 0,
      highestChallenge: [1],
      flags: [],
      gambleShop: [],
      premiumShop: [],
    },
  },
};

function versionControl(version: number, extrinsic: any): IExtrinsicModel {
  // adjust the save between versions

  if (version < CURRENT_VERSION) {
    extrinsic = _.cloneDeep(dExtrinsicModel);
  }
  return extrinsic;
}

export class SaveManager {
  public static async init(): Promise<null> {
    return new Promise((resolve) => {
      SaveManager.loadExtrinsic().then(extrinsic => {
        if (extrinsic) {
          SaveManager.loadVersion().then(version => {
            if (version < CURRENT_VERSION) {
              extrinsic = versionControl(version, extrinsic);
              SaveManager.saveVersion(CURRENT_VERSION);
              SaveManager.saveExtrinsic(extrinsic);
            }
            SaveManager.extrinsic = extrinsic;
            SaveManager.loadPlayer(extrinsic.lastCharacter, true).then(() => {
              resolve();
            });
          });
        } else {
          SaveManager.confirmReset();
          SaveManager.saveVersion(CURRENT_VERSION);
          SaveManager.saveExtrinsic(extrinsic);
          resolve();
        }
      });
    });
  }

  public static resetData(): () => void {
    // returns the confirmation function
    return SaveManager.confirmReset;
  }

  public static getExtrinsic(): IExtrinsicModel {
    if (SaveManager.extrinsic) {
      return SaveManager.extrinsic;
    }
  }

  public static getCurrentPlayer(): IPlayerSave {
    return SaveManager.player || dPlayerSave;
  }

  public static getCurrentPlayerLevel(): IPlayerLevelSave {
    return SaveManager.playerLevel;
  }

  public static getStashesForPlayer(): Promise<{personal: IItemSave[], public: IItemSave[][], overflow: IItemSave[]}> {
    return new Promise(resolve => {

    });
  }

  public static async saveCurrent(): Promise<null> {
    return new Promise(resolve => {
      let processes = 2;
      SaveManager.saveExtrinsic().then(() => {
        processes--;
        if (processes === 0) {
          resolve();
        }
      });
      SaveManager.savePlayer().then(() => {
        processes--;
        if (processes === 0) {
          resolve();
        }
      });
    });
  }

  public static async saveExtrinsic(extrinsic?: IExtrinsicModel): Promise<IExtrinsicModel> {
    return new Promise((resolve) => {
      extrinsic = extrinsic || SaveManager.extrinsic;

      switch (SAVE_LOC) {
        case 'virtual': virtualSave.extrinsic = extrinsic; break;
        case 'local':
          if (typeof Storage !== undefined) {
            window.localStorage.setItem('Extrinsic', JSON.stringify(extrinsic));
          } else {
            console.log('NO STORAGE!');
          }
          break;
        case 'online': break;
      }

      resolve(extrinsic);
    });
  }

  public static async savePlayer(player?: IPlayerSave, playerSlug?: string, makeCurrent?: boolean, playerLevel?: IPlayerLevelSave): Promise<IPlayerSave> {
    return new Promise((resolve) => {
      player = player || SaveManager.player;
      playerLevel = playerLevel || SaveManager.playerLevel;
      playerSlug = playerSlug || this.player.__id;
      player.__id = playerSlug;

      switch (SAVE_LOC) {
        case 'virtual':
          virtualSave.Players[playerSlug] = player;
          virtualSave.PlayerLevels[playerSlug] = playerLevel;
          break;
        case 'local':
          if (typeof Storage !== undefined) {
            // window.localStorage.setItem('Player-' + i, JSON.stringify(player));
            // window.localStorage.setItem('Player-L-' + i, JSON.stringify(playerLevel));
          } else {
            console.log('NO STORAGE!');
          }
          break;
        case 'online': break;
      }

      if (makeCurrent) {
        SaveManager.player = player;
        SaveManager.playerLevel = playerLevel;
      }

      resolve(player);
    });
  }

  public static getNumPlayers = () => {
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual':
          resolve(_.size(virtualSave.Players));
          break;
        case 'local':
        case 'online':
      }
    });
  }

  public static getAllPlayers = (): Promise<IPlayerSave[]> => {
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual':
          resolve(_.values(_.mapValues(virtualSave.Players, (value, key) => (value.__id = key, value))));
          break;
        case 'local':
        case 'online':
      }
    });
  }

  public static null = () => {
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual':
        case 'local':
        case 'online':
      }
    });
  }

  public static async deletePlayer(slug: string) {
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual':
          delete virtualSave.Players[slug];
          delete virtualSave.PlayerLevels[slug];
          resolve();
          break;
        case 'local':
        case 'online':
      }
    });
  }

  public static async loadPlayer(playerSlug: string, makeCurrent: boolean = true): Promise <IPlayerSave> {
    if (playerSlug) {
      let player: IPlayerSave;
      let playerLevel: IPlayerLevelSave;
      return new Promise((resolve) => {
        switch (SAVE_LOC) {
          case 'virtual':
            player = virtualSave.Players[playerSlug];
            playerLevel = virtualSave.PlayerLevels[playerSlug];
            player.__id = playerSlug;
            break;
          case 'local':
            if (typeof Storage !== undefined) {
              // let playerStr = window.localStorage.getItem('Player-' + i);
              // if (playerStr !== 'undefined') {
              //   player = JSON.parse(playerStr);
              // }
              // playerStr = window.localStorage.getItem('Player-L-' + i);
              // if (playerStr !== 'undefined') {
              //   playerLevel = JSON.parse(playerStr);
              // }
            } else {
              console.log('NO STORAGE!');
            }
            break;
          case 'online': break;
        }

        if (makeCurrent) {
          SaveManager.player = player;
          SaveManager.playerLevel = playerLevel;
        }

        resolve(player);
      });
    } else {
      console.log('NO CHARACTER INDEX!');
      return new Promise((resolve) => resolve());
    }
  }

  private static player: IPlayerSave;
  private static playerLevel: IPlayerLevelSave;
  private static extrinsic: IExtrinsicModel;

  private static confirmReset = () => {
    SaveManager.extrinsic = _.cloneDeep(dExtrinsicModel);
    SaveManager.player = undefined;
  }

  private static async loadExtrinsic(): Promise<IExtrinsicModel> {
    let extrinsic: IExtrinsicModel;
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual': extrinsic = virtualSave.extrinsic; break;
        case 'local':
          if (typeof Storage !== undefined) {
            let extrinsicStr = window.localStorage.getItem('Extrinsic');
            if (extrinsicStr !== 'undefined') {
              extrinsic = JSON.parse(extrinsicStr);
            }
          } else {
            console.log('NO STORAGE!');
          }
          break;
        case 'online': break;
      }
      resolve(extrinsic);
    });
  }

  // == Version Controls == //

  private static loadVersion(): Promise<number> {
    return new Promise((resolve) => {
      let version;
      switch (SAVE_LOC) {
        case 'virtual': version = virtualSave.version; break;
        case 'local':
          if (typeof Storage !== undefined) {
            version = Number(window.localStorage.getItem('eq-Version'));
          } else {
            console.log('NO STORAGE!');
            resolve(0);
          }
          break;
        case 'online': break;
      }

      resolve(version);
    });
  }

  private static saveVersion(version: number) {
    switch (SAVE_LOC) {
      case 'virtual': virtualSave.version = version; break;
      case 'local':
        if (typeof Storage !== undefined) {
          window.localStorage.setItem('eq-Version', String(version));
        } else {
          console.log('NO STORAGE!');
        }
        break;
      case 'online': break;
    }
  }
}

(window as any).checkSaves = () => console.log(SaveManager.getExtrinsic(), SaveManager.getCurrentPlayer(), SaveManager.getCurrentPlayerLevel());
