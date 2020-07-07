export interface IExtrinsicModel {
  achievements?: boolean[];
  flags?: boolean[];
  scores?: number[];

  firstVersion?: number;
  logins?: number;

  lastCharacter?: number;

  artifacts?: number[];
  cosmetics?: number[];
  stash?: IItemSave[][][];
  skillTrees?: number[];
}

export const dExtrinsicModel: IExtrinsicModel = {
  lastCharacter: undefined,
};

export interface IPlayerSave {
  name?: string;
  title?: string;
  level?: number;
  cosmetics?: number[];
  talent?: number;
  equipment?: IItemSave[];
  artifacts?: number[];
  skills?: [number, number][];
  skillPoints?: number;
  inventory?: IItemSave[];
  experience?: number;
}

export interface IPlayerLevelSave {
  ascendedZone?: number;
  zone?: number;
  zoneType?: number;
  monsterType?: number;
  enemyCount?: number;
  highestChallenge?: number[];
  flags?: boolean[];
  gambleShop?: IItemSave[];
  premiumShop?: IItemSave[];
}

export const dPlayerSave: IPlayerSave = {
  name: 'Blank',
  title: 'Ordinary',
  level: 0,
  cosmetics: [],
  talent: 0,
  equipment: [],
  artifacts: [],
  skills: [],
  inventory: [],
};

export interface IItemSave {
  index?: number;
  enchant?: number | number[];
  level?: number;
  charges?: number;
  priorities?: any;
}
