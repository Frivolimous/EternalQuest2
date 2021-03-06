import { IItemSave, ItemSlug } from './ItemData';
import { ISkillSave, SkillTreeSlug, SkillSlug } from './SkillData';
import { EnemySetId, ZoneId } from './EnemyData';

export type CurrencySlug = 'gold' | 'tokens' | 'refresh' | 'suns' | 'souls';

export interface IExtrinsicModel {
  achievements: boolean[];
  // flags: boolean[];
  // scores?: number[];

  currency: {[key in CurrencySlug]?: number};

  firstVersion?: number;
  logins?: number;

  lastCharacter: string;

  artifacts?: number[];
  cosmetics?: number[];

  heroStash: {[key: string]: IItemSave[]};
  sharedStash: IItemSave[][];
  overflowStash: IItemSave[];

  storeItems: {
    gamble?: ItemSlug[];
  };

  skillTrees?: number[];

  options: {
    autoFill: boolean;
  };
}

export interface IHeroSave {
  name?: string;
  level?: number;
  cosmetics?: number[];
  talent?: SkillSlug;
  equipment?: IItemSave[];
  artifacts?: number[];
  skills?: ISkillSave[];
  skillTrees?: SkillTreeSlug[];
  skillPoints?: number;
  inventory?: IItemSave[];
  experience?: number;
  __id?: string;
}

export interface IProgressSave {
  ascendedZone?: number;
  zone: number;
  zoneType: ZoneId;
  monsterType: EnemySetId;
  enemyCount: number;
  highestDuel: number;
  highestChallenge?: number[];
  flags?: boolean[];
}

export const dExtrinsicModel: IExtrinsicModel = {
  achievements: [],
  lastCharacter: undefined,
  currency: {
    gold: 0,
    tokens: 0,
    refresh: 0,
    suns: 0,
    souls: 0,
  },
  storeItems: {},

  heroStash: {},
  sharedStash: [],
  overflowStash: [],

  options: {
    autoFill: false,
  },
};

export const dHeroSave: IHeroSave = {
  name: 'Blank',
  level: 1,
  experience: 0,
  cosmetics: [],
  talent: SkillSlug.ORDINARY,
  equipment: [{ slug: ItemSlug.GREATSWORD, level: 0 }, { slug: ItemSlug.CAP, level: 0 }],
  artifacts: [],
  skills: [],
  skillTrees: [SkillTreeSlug.WARRIOR, SkillTreeSlug.MAGE, SkillTreeSlug.RANGER],
  skillPoints: 0,
  inventory: [],
};

export const dProgressSave: IProgressSave = {
  ascendedZone: 0,
  zone: 1,
  highestDuel: 0,
  zoneType: 0,
  monsterType: 0,
  enemyCount: 0,
  highestChallenge: [],
  flags: [],
};
