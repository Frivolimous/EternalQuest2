import * as PIXI from 'pixi.js';
import { StatModel } from '../../engine/stats/StatModel';
import { Fonts } from '../../data/Fonts';
import { IPlayerSave } from '../../data/SaveData';

export class CharacterPanel extends PIXI.Graphics {
  public nameT = new PIXI.Text('', {fontFamily: Fonts.UI, fontSize: 30});
  public levelT = new PIXI.Text('', {fontFamily: Fonts.UI, fontSize: 20});

  private currentPlayer: StatModel;

  constructor(private bounds: PIXI.Rectangle, color: number = 0x555555, lineColor: number = 0x333333) {
    super();

    this.beginFill(color).lineStyle(3, lineColor).drawRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, 5);
    this.addChild(this.nameT, this.levelT);
  }

  public setPlayer = (player: IPlayerSave) => {
    this.nameT.text = player.name + ' The ' + (player.title || '');
    this.levelT.text = 'Level: ' + player.level;
    this.nameT.position.set((this.bounds.width - this.nameT.width) / 2, 20);
    this.levelT.position.set((this.bounds.width - this.levelT.width) / 2, this.nameT. y + this.nameT. height + 5);
  }
}
