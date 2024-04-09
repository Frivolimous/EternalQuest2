import _ from 'lodash';
import { IExtrinsicModel, dExtrinsicModel, IHeroSave, dHeroSave, IProgressSave } from '../data/SaveData';
import { IItemSave, EnchantSlug, ItemSlug } from '../data/ItemData';
import { SkillTreeSlug, SkillSlug } from '../data/SkillData';
import { DuelCharacters } from '../data/EnemyData';

const CURRENT_VERSION = 13;
const SAVE_LOC: 'virtual' | 'local' | 'online' = 'local';
export const virtualSave: {version: number, extrinsic: IExtrinsicModel, Heroes: {[key: string]: IHeroSave}, Progresses: {[key: string]: IProgressSave}} = {
  version: 8,
  extrinsic: {
    achievements: [],
    lastCharacter: undefined,
    heroStash: {
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
  Heroes: {
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
  Progresses: {
    aewfinwgo: {
      ascendedZone: 0,
      zone: 0,
      highestDuel: 0,
      monsterType: 0,
      zoneType: 2,
      enemyCount: 0,
      highestChallenge: [1],
      flags: [],
    },
    ewfngibna: {
      ascendedZone: 0,
      zone: 10,
      highestDuel: 0,
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
    return new Promise<null>((resolve) => {
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
              resolve(null);
            });
          });
        } else {
          console.log('reset ext');
          SaveManager.confirmReset();
          SaveManager.saveVersion(CURRENT_VERSION);
          SaveManager.saveExtrinsic(this.getExtrinsic());
          resolve(null);
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

  public static getCurrentPlayer(): IHeroSave {
    return SaveManager.player || dHeroSave;
  }

  public static getDuelPlayer(): IHeroSave {
    let player = SaveManager.duelPlayer;
    if (!player) {
      player = _.cloneDeep(SaveManager.getCurrentPlayer());
      SaveManager.duelPlayer = player;
    }
    return player;
  }

  public static getDuelOpponent(): IHeroSave {
    let player = SaveManager.duelOpponent;
    if (!player) {
      let level = SaveManager.progress.highestDuel;
      player = _.cloneDeep(DuelCharacters[level % DuelCharacters.length]);
      SaveManager.duelOpponent = player;
    }
    return player;
  }

  public static clearDuelPlayer() {
    SaveManager.duelPlayer = null;
  }

  public static clearDuelOpponent() {
    SaveManager.duelOpponent = null;
  }

  public static getCurrentProgress(): IProgressSave {
    return SaveManager.progress;
  }

  public static async saveCurrent(): Promise<null> {
    return new Promise(resolve => {
      let processes = 2;
      SaveManager.saveExtrinsic().then(() => {
        processes--;
        if (processes === 0) {
          resolve(null);
        }
      });
      SaveManager.savePlayer().then(() => {
        processes--;
        if (processes === 0) {
          resolve(null);
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

  public static async savePlayer(save?: IHeroSave, slug?: string, makeCurrent?: boolean, progress?: IProgressSave): Promise<IHeroSave> {
    return new Promise((resolve) => {
      if (!save && !SaveManager.player) {
        resolve(null);
        return;
      }
      save = save || SaveManager.player;
      progress = progress || SaveManager.progress;
      slug = slug || this.player.__id;
      save.__id = slug;

      switch (SAVE_LOC) {
        case 'virtual':
          virtualSave.Heroes[slug] = save;
          virtualSave.Progresses[slug] = progress;
          break;
        case 'local':
          if (typeof Storage !== undefined) {
            let players: {[key: string]: IHeroSave} = JSON.parse(window.localStorage.getItem('Heroes')) || {};
            let Progresses: {[key: string]: IProgressSave} = JSON.parse(window.localStorage.getItem('Progresses')) || {};
            players[slug] = save;
            Progresses[slug] = progress;
            window.localStorage.setItem('Heroes', JSON.stringify(players));
            window.localStorage.setItem('Progresses', JSON.stringify(Progresses));
          } else {
            console.log('NO STORAGE!');
          }
          break;
        case 'online': break;
      }

      if (makeCurrent) {
        SaveManager.player = save;
        SaveManager.progress = progress;
      }

      resolve(save);
    });
  }

  public static getNumPlayers = () => {
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual':
          resolve(_.size(virtualSave.Heroes));
          break;
        case 'local':
          let players: {[key: string]: IHeroSave} = JSON.parse(window.localStorage.getItem('Heroes')) || {};
          resolve(_.size(players));
          break;
        case 'online':
      }
    });
  }

  public static getAllPlayers = (): Promise<IHeroSave[]> => {
    return new Promise((resolve) => {
      switch (SAVE_LOC) {
        case 'virtual':
          resolve(_.values(_.mapValues(virtualSave.Heroes, (value, key) => (value.__id = key, value))));
          break;
        case 'local':
          let players: {[key: string]: IHeroSave} = JSON.parse(window.localStorage.getItem('Heroes')) || {};
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
          delete virtualSave.Heroes[slug];
          delete virtualSave.Progresses[slug];
          resolve(null);
          break;
        case 'local':
          let players: {[key: string]: IHeroSave} = JSON.parse(window.localStorage.getItem('Heroes')) || {};
          let Progresses: {[key: string]: IProgressSave} = JSON.parse(window.localStorage.getItem('Progresses')) || {};
          delete players[slug];
          delete Progresses[slug];
          window.localStorage.setItem('Heroes', JSON.stringify(players));
          window.localStorage.setItem('Progresses', JSON.stringify(Progresses));
          resolve(null);
          break;
        case 'online':
      }
    });
  }

  public static async loadPlayer(slug: string, makeCurrent: boolean = true): Promise <IHeroSave> {
    if (slug) {
      let player: IHeroSave;
      let progress: IProgressSave;
      return new Promise((resolve) => {
        switch (SAVE_LOC) {
          case 'virtual':
            player = virtualSave.Heroes[slug];
            progress = virtualSave.Progresses[slug];
            player.__id = slug;
            break;
          case 'local':
            if (typeof Storage !== undefined) {
              let players: {[key: string]: IHeroSave} = JSON.parse(window.localStorage.getItem('Heroes')) || {};
              let Progresses: {[key: string]: IProgressSave} = JSON.parse(window.localStorage.getItem('Progresses')) || {};
              player = players[slug];
              progress = Progresses[slug];
              player.__id = slug;
            } else {
              console.log('NO STORAGE!');
            }
            break;
          case 'online': break;
        }

        if (makeCurrent) {
          SaveManager.player = player;
          SaveManager.progress = progress;
        }

        resolve(player);
      });
    } else {
      console.log('NO CHARACTER INDEX!');
      return new Promise((resolve) => resolve(null));
    }
  }

  private static player: IHeroSave;
  private static progress: IProgressSave;
  private static extrinsic: IExtrinsicModel;

  private static duelPlayer: IHeroSave;
  private static duelOpponent: IHeroSave;

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

(window as any).checkSaves = () => console.log(SaveManager.getExtrinsic(), SaveManager.getCurrentPlayer(), SaveManager.getCurrentProgress());
