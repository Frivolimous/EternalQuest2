import * as _ from 'lodash';
import { IExtrinsicModel, dExtrinsicModel, IPlayerSave, dPlayerSave, IPlayerLevelSave } from '../data/SaveData';
import { IItemSave, EnchantSlug, ItemSlug } from '../data/ItemData';
import { SkillTreeSlug, SkillSlug } from '../data/SkillData';

const CURRENT_VERSION = 12;
const SAVE_LOC: 'virtual' | 'local' | 'online' = 'local';
export const virtualSave: {version: number, extrinsic: IExtrinsicModel, Players: {[key: string]: IPlayerSave}, PlayerLevels: {[key: string]: IPlayerLevelSave}} = {
  version: 8,
  extrinsic: {
    achievements: [],
    lastCharacter: undefined,
    playerStash: {
      aewfinwgo: [{ slug: ItemSlug.GREATSWORD, level: 5, enchant: [EnchantSlug.MYSTIC] }, { slug: ItemSlug.ARMET, level: 5 }, { slug: ItemSlug.MAGIC_BOLT, level: 0}],
    },
    sharedStash: [
      [{ slug: ItemSlug.GREATSWORD, level: 10 }, { slug: ItemSlug.CAP, level: 10 }],
    ],
    currency: {
      gold: 1000000,
      tokens: 5,
      refresh: 3,
      suns: 0,
      souls: 0,
    },
    storeItems: {},
    overflowStash: [],

    options: {
      autoFill: false,
    },
  },
  Players: {
    aewfinwgo: {
      name: 'Auster',
      level: 1,
      experience: 0,
      cosmetics: [],
      talent: SkillSlug.DEFT,
      equipment: [{ slug: ItemSlug.GREATSWORD, level: 0 }, { slug: ItemSlug.ARMET, level: 0 }, {slug: ItemSlug.MAGIC_BOLT, level: 0}, null, null],
      artifacts: [],
      skills: [],
      skillTrees: [SkillTreeSlug.WARRIOR, SkillTreeSlug.MAGE, SkillTreeSlug.RANGER],
      skillPoints: 50,
      inventory: [],
    },
    ewfngibna: {
      name: 'Rustus',
      level: 1,
      experience: 0,
      cosmetics: [],
      talent: SkillSlug.POWERFUL,
      equipment: [{ slug: ItemSlug.GREATSWORD, level: 0 }, { slug: ItemSlug.ARMET, level: 0 }, null, null, null],
      artifacts: [],
      skills: [{ slug: SkillSlug.FITNESS, level: 5}],
      skillTrees: [SkillTreeSlug.WARRIOR, SkillTreeSlug.RANGER],
      skillPoints: 10,
      inventory: [{ slug: ItemSlug.GREATSWORD, level: 0 }, null, { slug: ItemSlug.ARMET, level: 10 }],
    },
  },
  PlayerLevels: {
    aewfinwgo: {
      ascendedZone: 0,
      zone: 0,
      monsterType: 0,
      zoneType: 2,
      enemyCount: 0,
      highestChallenge: [1],
      flags: [],
    },
    ewfngibna: {
      ascendedZone: 0,
      zone: 10,
      zoneType: 1,
      monsterType: 1,
      enemyCount: 0,
      highestChallenge: [1],
      flags: [],
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
    console.log('init!');
    return new Promise((resolve) => {
      SaveManager.loadExtrinsic().then(extrinsic => {
        console.log('ext!', extrinsic);
        if (extrinsic) {
          console.log('has ext');
          SaveManager.loadVersion().then(version => {
            console.log('version loaded', version);
            if (version < CURRENT_VERSION) {
              console.log('old V');
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
          console.log('reset ext');
          SaveManager.confirmReset();
          SaveManager.saveVersion(CURRENT_VERSION);
          SaveManager.saveExtrinsic(this.getExtrinsic());
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
      if (!player && !SaveManager.player) {
        resolve();
        return;
      }
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
            let players: {[key: string]: IPlayerSave} = JSON.parse(window.localStorage.getItem('Players')) || {};
            let playerLevels: {[key: string]: IPlayerLevelSave} = JSON.parse(window.localStorage.getItem('PlayerLevels')) || {};
            players[playerSlug] = player;
            playerLevels[playerSlug] = playerLevel;
            window.localStorage.setItem('Players', JSON.stringify(players));
            window.localStorage.setItem('PlayerLevels', JSON.stringify(playerLevels));
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
          let players: {[key: string]: IPlayerSave} = JSON.parse(window.localStorage.getItem('Players')) || {};
          resolve(_.size(players));
          break;
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
          let players: {[key: string]: IPlayerSave} = JSON.parse(window.localStorage.getItem('Players')) || {};
          resolve(_.values(_.mapValues(players, (value, key) => (value.__id = key, value))));
          break;
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
          let players: {[key: string]: IPlayerSave} = JSON.parse(window.localStorage.getItem('Players')) || {};
          let playerLevels: {[key: string]: IPlayerLevelSave} = JSON.parse(window.localStorage.getItem('PlayerLevels')) || {};
          delete players[slug];
          delete playerLevels[slug];
          window.localStorage.setItem('Players', JSON.stringify(players));
          window.localStorage.setItem('PlayerLevels', JSON.stringify(playerLevels));
          resolve();
          break;
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
              let players: {[key: string]: IPlayerSave} = JSON.parse(window.localStorage.getItem('Players')) || {};
              let playerLevels: {[key: string]: IPlayerLevelSave} = JSON.parse(window.localStorage.getItem('PlayerLevels')) || {};
              player = players[playerSlug];
              playerLevel = playerLevels[playerSlug];
              player.__id = playerSlug;
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
