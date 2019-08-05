enum StatCategory {
  STAT,
  ATTACK,
  UNARMED,
  UNARMORED,
  ACTION,
  EFFECT,
}

interface ISpriteModel {
  name: string;
  level: number;
}

interface IPlayerSprite extends ISpriteModel {
  title: string;
  mainClass: number;
}

interface IEnemySprite extends ISpriteModel {

}

class GameSprite {
  stats: StatModel;
  private _Health: number;
  private _Mana: number;
  equipment: ItemModel[] = [];
  actionList = new ActionList;
  buffList:BuffList;
  effectsToApply: EffectModel[];
  tFunction: Function;
  tTarget: GameSprite;
  tAction: ActionBase;
  tValue: string;

  view: SpriteView;
  skillBlock: SkillBlock;
  updateUI: boolean;
  exists: boolean;

  strike = 0;
  shots = 0;
  doneTurn = true;
  dead = false;

  attackTarget: GameSprite;
}

class PlayerSprite extends GameSprite {
  unarmed: ItemModel;
  unarmored: any[] = [];
  belt: ItemModel[] = [];
  inventory: ItemModel[] = [];
  artifacts: ArtifactModel[] = [];
  craftB = 0;
  smiteB = 0;
  private _Xp: number;
  maxXp: number;
  flags: boolean[] = [];
  challenge = [0, 0];
  saveSlot: number;
  stash = [];
  lastSold = [];

  cosmetics = [-1,-1,-1,-1,-1,-1,-1,-1];

  deathsSinceAscension = 0;
  respecsSinceAscension = 0;
  
  constructor() {
    super();
    this.updateUI = true;
  }
}

class EnemySprite extends GameSprite {

}

class StatModel{}
class ItemModel{}
class ArtifactModel{};
class ActionList{};
class BuffList{};
class EffectModel{};
class ActionBase{};
class SpriteView{};
class SkillBlock{}
