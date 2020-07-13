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

export class SkillPanel extends BasePanel {
  private tree: SkillTree;
  private skillpoints: PIXI.Text;
  constructor() {
    super(new PIXI.Rectangle(525, 150, 275, 650), 0xccccf1);

    this.tree = new SkillTree();
    this.addChild(this.tree);

    this.skillpoints = new PIXI.Text('Skillpoints: ', {fontSize: 12, fontFamily: Fonts.UI});
    this.addChild(this.skillpoints);

    this.tree.position.set((this.getWidth() - this.tree.getWidth()) / 2, 50);
    this.skillpoints.position.set(100, 303);
  }

  public addPlayer = (sprite: SpriteModel) => {
    this.tree.loadPages(sprite.stats.skills, _.filter(SkillPageMap, page => _.some(sprite.stats.skillTrees, slug => slug === page.slug)), skill => {
      skill = sprite.stats.tryLevelSkill(skill);
      this.skillpoints.text = 'Skillpoints: ' + sprite.stats.skillpoints;
      return skill;
    });
    this.skillpoints.text = 'Skillpoints: ' + sprite.stats.skillpoints;
  }

  public update = (sprite: SpriteModel) => {
    console.log('panel update');
    this.skillpoints.text = 'Skillpoints: ' + sprite.stats.skillpoints;
  }
}
