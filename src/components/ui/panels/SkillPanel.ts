import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BasePanel } from './_BasePanel';
import { Button } from '../Button';
import { IPlayerLevelSave } from '../../../data/SaveData';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { Fonts } from '../../../data/Fonts';
import { SkillPage } from '../../skill/SkillPage';
import { SkillPageMap, SkillTreeSlug } from '../../../data/SkillData';
import { DataConverter } from '../../../services/DataConverter';
import { SkillTree } from '../../skill/SkillTree';
import { StatModel } from '../../../engine/stats/StatModel';

export class SkillPanel extends BasePanel {
  private tree: SkillTree;
  private skillpoints: PIXI.Text;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(525, 150, 275, 650), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.tree = new SkillTree();
    this.addChild(this.tree);

    this.skillpoints = new PIXI.Text('Skillpoints: ', {fontSize: 12, fontFamily: Fonts.UI});
    this.addChild(this.skillpoints);

    this.tree.position.set((this.getWidth() - this.tree.getWidth()) / 2, 50);
    this.skillpoints.position.set(100, 303);
  }

  public addPlayer = (sprite: SpriteModel | StatModel) => {
    if (sprite instanceof SpriteModel) {
      sprite = sprite.stats;
    }
    this.tree.loadPages(sprite.skills, _.filter(SkillPageMap, page => _.some((sprite as StatModel).skillTrees, slug => slug === page.slug)), skill => {
      skill = (sprite as StatModel).tryLevelSkill(skill);
      this.skillpoints.text = 'Skillpoints: ' + (sprite as StatModel).skillpoints;
      return skill;
    });
    this.skillpoints.text = 'Skillpoints: ' + (sprite as StatModel).skillpoints;
  }

  public update = (sprite: SpriteModel | StatModel) => {
    if (sprite instanceof SpriteModel) {
      sprite = sprite.stats;
    }
    console.log('panel update');
    this.skillpoints.text = 'Skillpoints: ' + sprite.skillpoints;
  }
}
