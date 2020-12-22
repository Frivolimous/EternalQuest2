import * as PIXI from 'pixi.js';
import { StatModel } from '../../../engine/stats/StatModel';
import { Fonts } from '../../../data/Fonts';
import { IHeroSave } from '../../../data/SaveData';
import { StringManager } from '../../../services/StringManager';

export class CharacterPanel extends PIXI.Graphics {
  public nameT: PIXI.Text;
  public levelT = new PIXI.Text('', {fontFamily: Fonts.UI, fontSize: 20});

  constructor(private bounds: PIXI.Rectangle, color: number = 0x555555, lineColor: number = 0x333333) {
    super();

    this.nameT = new PIXI.Text('', {fontFamily: Fonts.UI, fontSize: 30, wordWrap: true, wordWrapWidth: bounds.width - 10});

    this.beginFill(color).lineStyle(3, lineColor).drawRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, 5);
    this.addChild(this.nameT, this.levelT);
  }

  public setSource = (hero: IHeroSave) => {
    this.nameT.text = hero.name + ' ' + StringManager.titleFromSave(hero);
    this.levelT.text = 'Level: ' + hero.level;
    this.nameT.position.set((this.bounds.width - this.nameT.width) / 2, 20);
    this.levelT.position.set((this.bounds.width - this.levelT.width) / 2, this.nameT. y + this.nameT. height + 5);
  }
}
