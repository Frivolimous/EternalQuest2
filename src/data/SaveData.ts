import { IItemSave } from './ItemData';
import { ISkillSave, SkillTreeSlug, TalentSlug } from './SkillData';

export interface IExtrinsicModel {
  achievements?: boolean[];
  flags?: boolean[];
  scores?: number[];

  currency: {
    gold: number;
    tokens: number;
  };

  firstVersion?: number;
  logins?: number;

  lastCharacter?: string;

  artifacts?: number[];
  cosmetics?: number[];

  playerStash?: {[key: string]: IItemSave[]};
  sharedStash?: IItemSave[][];
  overflowStash?: IItemSave[];

  skillTrees?: number[];
}

export const dExtrinsicModel: IExtrinsicModel = {
  lastCharacter: undefined,
  currency: {
    gold: 0,
    tokens: 0,
  },
};

export interface IPlayerSave {
  name?: string;
  title?: string;
  level?: number;
  cosmetics?: number[];
  talent?: TalentSlug;
  equipment?: IItemSave[];
  artifacts?: number[];
  skills?: ISkillSave[];
  skillTrees?: SkillTreeSlug[];
  skillPoints?: number;
  inventory?: IItemSave[];
  experience?: number;
  __id?: string;
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
  level: 1,
  experience: 0,
  cosmetics: [],
  talent: 'Ordinary',
  equipment: [{ slug: 'Greatsword', level: 0, enchant: ['Master'] }, { slug: 'Cap', level: 0 }],
  artifacts: [],
  skills: [],
  skillTrees: ['Warrior', 'Mage', 'Ranger'],
  skillPoints: 0,
  inventory: [],
};

export const dPlayerLevelSave: IPlayerLevelSave = {
  ascendedZone: 0,
  zone: 1,
  zoneType: 0,
  monsterType: 0,
  enemyCount: 0,
  highestChallenge: [],
  flags: [],
  gambleShop: [],
  premiumShop: [],
};
