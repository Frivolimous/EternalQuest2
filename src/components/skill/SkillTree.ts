import * as _ from 'lodash';
import * as PIXI from 'pixi.js';
import { SkillPage } from './SkillPage';
import { DataConverter } from '../../services/DataConverter';
import { SkillPageMap, ISkill, ISkillPageMap } from '../../data/SkillData';
import { Button } from '../ui/Button';

export class SkillTree extends PIXI.Container {
  private pages: SkillPage[] = [];
  private currentPage: number;

  constructor() {
    super();

    this.loadPages([], SkillPageMap, (skill: ISkill) => {
      if (skill.level < 10) {
        return DataConverter.getSkill(skill.slug, skill.level + 1);
      } else {
        return skill;
      }
    });

    let rightArrow = this.makeArrowButton(() => {
      this.removeChild(this.pages[this.currentPage]);
      this.currentPage = (this.currentPage + 1) % this.pages.length;
      this.addChild(this.pages[this.currentPage]);
    }, false);

    let leftArrow = this.makeArrowButton(() => {
      this.removeChild(this.pages[this.currentPage]);
      this.currentPage --;
      if (this.currentPage < 0) {
        this.currentPage += this.pages.length;
      }
      this.addChild(this.pages[this.currentPage]);
    }, true);

    this.addChild(leftArrow, rightArrow);

    leftArrow.position.set(0, 240);
    rightArrow.position.set(160, 240);
  }

  public loadPages(skills: ISkill[], pages: ISkillPageMap[], callback: (skill: ISkill, passive?: boolean) => ISkill) {
    this.pages.forEach(page => page.destroy());
    this.pages = [];

    let pageSettings = { width: 200, height: 200, bgColor: 0x333333, lineColor: 0xffffff };

    this.pages = _.map(pages, page => {
      let m = new SkillPage(skills, page, pageSettings, callback);
      m.position.set(0, 30);
      return m;
    });
    this.addChild(this.pages[0]);
    this.currentPage = 0;
  }

  public setMaxLevel(n: number) {
    this.pages.forEach(page => page.setMaxLevel(n));
  }

  public getWidth() {
    return 200;
  }

  public getHeight() {
    return 200;
  }

  public makeArrowButton(callback: () => void, left?: boolean) {
    let button = new Button({ width: 40, height: 40, onClick: callback, color: 0x333399 });
    if (left) {
      button.startCustomDraw().moveTo(40, 0).lineTo(0, 20).lineTo(40, 40).lineTo(40, 0);
    } else {
      button.startCustomDraw().moveTo(0, 0).lineTo(40, 20).lineTo(0, 40).lineTo(0, 0);
    }

    return button;
  }
}
