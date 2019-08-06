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
  temp: string;
}

class GameSprite {
  public stats: StatModel;
  
  public equipment: ItemModel[] = [];
  public actionList = new ActionList();
  public buffList: BuffList;
  public effectsToApply: EffectModel[];
  public tFunction: (e: any) => void;
  public tTarget: GameSprite;
  public tAction: ActionBase;
  public tValue: string;

  public view: SpriteView;
  public skillBlock: SkillBlock;
  public updateUI: boolean;
  public exists: boolean;

  public strike = 0;
  public shots = 0;
  public doneTurn = true;
  public dead = false;

  public attackTarget: GameSprite;

  private _Health: number;
  private _Mana: number;
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
