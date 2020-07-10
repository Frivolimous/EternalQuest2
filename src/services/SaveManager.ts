import * as _ from 'lodash';
import { IExtrinsicModel, dExtrinsicModel, IPlayerSave, dPlayerSave, IPlayerLevelSave } from '../data/SaveData';

const CURRENT_VERSION = 8;
const SAVE_LOC: 'virtual' | 'local' | 'online' = 'virtual';
const virtualSave: any = {
  'version': 8,
  'extrinsic': {
    lastCharacter: 0,
  },
  'Player-0': {
    name: 'Auster',
    title: 'Ordinary',
    level: 0,
    cosmetics: [],
    talent: 0,
    equipment: [{ index: 0, level: 0 }, { index: 1, level: 0 }, null, null, null, { index: 2, level: 0 }],
    artifacts: [],
    skills: [],
    inventory: [{index: 3, level: 0 }, {index: 4, level: 0 }],
  },
  'Player-L-0': {
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
          this.loadVersion().then(version => {
            if (version < CURRENT_VERSION) {
              extrinsic = versionControl(version, extrinsic);
              SaveManager.saveVersion(CURRENT_VERSION);
              SaveManager.saveExtrinsic(extrinsic);
            }
            SaveManager.extrinsic = extrinsic;
            this.loadPlayer(extrinsic.lastCharacter, true).then(() => {
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
    return this.confirmReset;
  }

  public static getExtrinsic(): IExtrinsicModel {
    if (SaveManager.extrinsic) {
      return SaveManager.extrinsic;
    }
  }

  public static getCurrentPlayer(): IPlayerSave {
    return this.player || dPlayerSave;
    // change to get current player;
    // return new IPlayerSave;
  }

  public static getCurrentPlayerLevel(): IPlayerLevelSave {
    return this.playerLevel;
  }

  public static async saveCurrent(): Promise<null> {
    return new Promise(resolve => {
      let processes = 2;
      this.saveExtrinsic().then(() => {
        processes--;
        if (processes === 0) {
          resolve();
        }
      });
      this.savePlayer().then(() => {
        processes--;
        if (processes === 0) {
          resolve();
        }
      });
    });
  }

  public static async saveExtrinsic(extrinsic?: IExtrinsicModel): Promise<IExtrinsicModel> {
    return new Promise((resolve) => {
      extrinsic = extrinsic || this.extrinsic;

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

  public static async savePlayer(player?: IPlayerSave, i?: number, makeCurrent?: boolean, playerLevel?: IPlayerLevelSave): Promise<IPlayerSave> {
    return new Promise((resolve) => {
      player = player || this.player;
      if (i === undefined) {
        i = this.playerIndex;
      }
      playerLevel = playerLevel || this.playerLevel;

      switch (SAVE_LOC) {
        case 'virtual':
          virtualSave['Player-' + i] = player;
          virtualSave['Player-L-' + i] = playerLevel;
          break;
        case 'local':
          if (typeof Storage !== undefined) {
            window.localStorage.setItem('Player-' + i, JSON.stringify(player));
            window.localStorage.setItem('Player-L-' + i, JSON.stringify(playerLevel));
          } else {
            console.log('NO STORAGE!');
          }
          break;
        case 'online': break;
      }

      if (makeCurrent) {
        this.player = player;
        this.playerLevel = playerLevel;
        this.playerIndex = i;
      }

      resolve(player);
    });
  }

  private static player: IPlayerSave;
  private static playerLevel: IPlayerLevelSave;
  private static playerIndex: number;
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

  private static async loadPlayer(i: number, makeCurrent: boolean = true): Promise <IPlayerSave> {
    if (i || i === 0) {
      let player: IPlayerSave;
      let playerLevel: IPlayerLevelSave;
      return new Promise((resolve) => {
        switch (SAVE_LOC) {
          case 'virtual':
            player = virtualSave['Player-' + i];
            playerLevel = virtualSave['Player-L-' + i];
            break;
          case 'local':
            if (typeof Storage !== undefined) {
              let playerStr = window.localStorage.getItem('Player-' + i);
              if (playerStr !== 'undefined') {
                player = JSON.parse(playerStr);
              }
              playerStr = window.localStorage.getItem('Player-L-' + i);
              if (playerStr !== 'undefined') {
                playerLevel = JSON.parse(playerStr);
              }
            } else {
              console.log('NO STORAGE!');
            }
            break;
          case 'online': break;
        }

        if (makeCurrent) {
          this.player = player;
          this.playerLevel = playerLevel;
          this.playerIndex = i;
        }

        resolve(player);
      });
    } else {
      console.log('NO CHARACTER INDEX!');
      return new Promise((resolve) => resolve());
    }
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
