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

  public loadPages(skills: ISkill[], pages: ISkillPageMap[], callback: (skill: ISkill) => ISkill) {
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

// const DSkillWindow: JMBUI.GraphicOptions = { width: 400, height: 400, fill: 0xff9933, bgColor: 0xffffff, alpha: 0.9 };

// export class SkillWindow extends JMBUI.BasicElement {
//   icons: Array<SkillIcon>;

//   constructor(private blocks: Array<SkillBlock>, private callback: (data: SkillIcon) => any, private skillpoints: number, options: JMBUI.GraphicOptions = {}, private iconOptions: JMBUI.GraphicOptions = {}) {
//     super(JMBL.utils.default(options, DSkillWindow));
//     this.iconOptions.downFunction = ((callback: Function) => function () { callback(this) })(this.iconCallback);

//     this.update();
//   }

//   update = () => {
//     let innerHor: number = this.graphics.width * 0.08;
//     let innerVer: number = this.graphics.height * 0.08;
//     let innerX: number = this.graphics.width * 0.1;
//     let innerY: number = this.graphics.height * 0.1;

//     this.icons = [];
//     this.graphics.lineStyle(2, 0xf1f1f1); //options.borderColor

//     for (var i = 0; i < this.blocks.length; i += 1) {
//       this.icons[i] = new SkillIcon(this.blocks[i], this.iconOptions);
//       this.icons[i].x = (this.icons[i].data.position % 10) * innerHor + innerX - this.icons[i].getWidth() / 2;
//       this.icons[i].y = Math.floor(this.icons[i].data.position * .1) * innerVer + innerY - this.icons[i].getHeight() / 2;
//       if (this.skillpoints >= 1) {
//         if (this.canLevel(this.icons[i])) {
//           this.icons[i].selected = true;
//         }
//       }
//       this.addChild(this.icons[i]);

//       if (this.icons[i].data.prerequisite) {
//         let prereq: SkillIcon = JMBL.utils.find(this.icons, (icon: SkillIcon) => (icon.data.index === this.icons[i].data.prerequisite));
//         if (this.icons[i].data.level === 0 && prereq.data.level === 0) {
//           this.icons[i].setDisplayState(JMBUI.DisplayState.BLACKENED);
//         }

//         let x1 = (this.icons[i].data.position % 10) * innerHor + innerX;
//         let y1 = Math.floor(this.icons[i].data.position * 0.1) * innerVer + innerY;
//         let x2 = (prereq.data.position % 10) * innerHor + innerX;
//         let y2 = Math.floor(prereq.data.position * 0.1) * innerVer + innerY;
//         this.graphics.moveTo(x1, y1);
//         this.graphics.lineTo(x2, y2);
//       }
//     }
//   }

//   canLevel = (icon: SkillIcon): boolean => {
//     return (this.skillpoints > 0 &&
//       icon.data.level < icon.data.maxLevel &&
//       (!icon.data.prerequisite || JMBL.utils.find(this.icons, (e: SkillIcon) => (e.data.index === icon.data.prerequisite)).data.level > 0));
//   }

//   iconCallback = (icon: SkillIcon) => {
//     if (this.canLevel(icon)) {
//       this.callback(icon);
//       this.refresh();
//     } else {
//       icon.errorFlash();
//     }
//   }

//   refresh = () => {
//     while (this.icons.length > 0) {
//       this.icons.shift().destroy();
//     }
//     this.update();
//   }
// }
