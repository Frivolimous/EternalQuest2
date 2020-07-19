import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { Button } from '../Button';
import { IPlayerLevelSave } from '../../../data/SaveData';
import { Fonts } from '../../../data/Fonts';
import { StatModel } from '../../../engine/stats/StatModel';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { SelectList } from '../SelectButton';
import { IAction } from '../../../data/ActionData';
import { Descriptions } from '../../../data/StringData';

export class ActionPanel extends BasePanel {
  private source: StatModel;
  private temp: StatModel;
  private nameText: PIXI.Text;
  private statText: PIXI.Text;

  private actions: IAction[];

  private list: SelectList;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(525, 150, 275, 650), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.nameText = new PIXI.Text('', { fontFamily: Fonts.UI, fontSize: 20 });
    this.statText = new PIXI.Text('', { fontFamily: Fonts.UI, fontSize: 15 });

    this.addChild(this.statText, this.nameText);

    this.nameText.position.set(10, 10);
    this.statText.position.set(120, 40);

    this.list = new SelectList({width: 100, height: 30}, this.selectAction);
  }

  public changeSource = (sprite: SpriteModel | StatModel) => {
    if (sprite instanceof SpriteModel) {
      sprite = sprite.stats;
    }
    if (this.temp) {
      this.removeTemp(this.temp);
    }
    if (this.source) {
      this.source.onUpdate.removeListener(this.update);
    }
    this.source = sprite;
    this.source.onUpdate.addListener(this.update);
    this.update();
  }

  public addTemp = (sprite: SpriteModel | StatModel) => {
    if (sprite instanceof SpriteModel) {
      sprite = sprite.stats;
    }
    if (sprite === this.source) {
      if (this.temp) {
        this.removeTemp(this.temp);
      }
    } else {
      if (this.source) {
        this.source.onUpdate.removeListener(this.update);
      }
      if (this.temp) {
        this.temp.onUpdate.addListener(this.update);
      }
      this.temp = sprite;
      this.temp.onUpdate.addListener(this.update);
      this.update();
    }
  }

  public removeTemp = (sprite: SpriteModel | StatModel) => {
    if (sprite instanceof SpriteModel) {
      sprite = sprite.stats;
    }
    if (this.temp && this.temp === sprite) {
      this.temp = null;
      this.source.onUpdate.addListener(this.update);
      this.update();
    }
  }

  public selectAction = (i: number) => {
    this.statText.text = Descriptions.makeActionDescription(this.actions[i]);
  }

  public update = () => {
    let source = this.temp || this.source;

    this.nameText.text = source.name;
    let actions = source.getActionList();
    this.actions = actions;

    this.list.destroyAll();

    actions.forEach((action, i) => {
      let button = this.list.makeButton(action.slug);
      this.addChild(button);
      button.position.set(10, 40 + i * 35);
    });

    this.list.selectButton(0);
  }
}
