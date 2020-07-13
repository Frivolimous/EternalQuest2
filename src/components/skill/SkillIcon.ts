import * as PIXI from 'pixi.js';
import * as _ from 'lodash';
import { ISkill } from '../../data/SkillData';
import { Descriptions } from '../../data/StringData';
import { TooltipReader } from '../../JMGE/TooltipReader';
import { Fonts } from '../../data/Fonts';

export interface ISkillIcon {
  width?: number;
  height?: number;
  position?: number;
}

const dSkillIcon: ISkillIcon = {
  width: 50,
  height: 50,
};

export class SkillIcon extends PIXI.Container {
  private text: PIXI.Text;
  private numbers: PIXI.Text;
  private background = new PIXI.Graphics();
  private overlay = new PIXI.Graphics();

  constructor(public source: ISkill, private settings?: ISkillIcon, private callback?: (skill: ISkill) => ISkill) {
    super();
    this.interactive = true;
    this.buttonMode = true;
    this.settings = _.defaults(settings, dSkillIcon);

    let color: number = 0xffffcc;
    this.background.beginFill(color).lineStyle(3).drawRoundedRect(0, 0, this.settings.width, this.settings.height, 2);
    this.addChild(this.background);
    this.overlay.beginFill(0xffffff).lineStyle(3).drawRoundedRect(0, 0, this.settings.width, this.settings.height, 2);
    this.addChild(this.overlay);
    this.overlay.visible = false;

    this.addListener('pointerdown', this.pointerDown);

    TooltipReader.addTooltip(this, () => ({ title: source.name, description: Descriptions.makeSkillDescription(this.source) }));

    this.text = new PIXI.Text(source.name, { fontFamily: Fonts.UI, fontSize: 25, wordWrap: true, wordWrapWidth: 100 });
    this.addChild(this.text);
    this.text.width = this.getWidth() - 10;
    this.text.scale.y = this.text.scale.x;
    this.text.position.set(5, (this.getHeight() - this.text.height) / 2);

    this.numbers = new PIXI.Text('00', { fontFamily: Fonts.UI, fontSize: 10, stroke: 0xcccccc, strokeThickness: 1});
    this.addChild(this.numbers);

    this.redraw();
  }

  public redraw() {
    if (this.source.level === 0) {
      if (!this.overlay.visible) {
        this.darken();
      }
    } else if (this.source.level >= 10) {
      this.overlay.tint = 0xffffff;
      this.overlay.visible = true;
      this.overlay.alpha = 0.3;
    } else {
      this.overlay.visible = false;
    }

    this.numbers.text = String(this.source.level);
    if (this.source.level < 10) {
      this.numbers.text = '0' + this.numbers.text;
    }
    this.numbers.position.set(this.getWidth() - this.numbers.width - 1, this.getHeight() - this.numbers.height - 1);

    TooltipReader.resetTooltip(this);
  }

  public blacken() {
    this.overlay.tint = 0;
    this.overlay.visible = true;
    this.overlay.alpha = 0.7;
  }

  public darken() {
    this.overlay.tint = 0;
    this.overlay.visible = true;
    this.overlay.alpha = 0.4;
  }

  public getPosition() {
    return this.settings.position;
  }

  public getWidth() {
    return this.settings.width;
  }

  public getHeight() {
    return this.settings.height;
  }

  private pointerDown = (e: PIXI.interaction.InteractionEvent) => {
    if (this.callback) {
      this.source = this.callback(this.source);
      this.redraw();
    }
  }
}

// export interface SkillBlock {
//   name: string,
//   index: number,
//   position: number,
//   values: SkillValue,

//   level?: number,
//   maxLevel?: number,
//   prerequisite?: number,
// }

// export interface ISkillButton extends JMBUI.GraphicOptions {
//   showLevels?: boolean,
//   levelFormat?: PIXI.TextStyleOptions,
// }

// const DSKillButton: ISkillButton = {
//   width: 40,
//   height: 40,
//   labelStyle: { fill: 0xf1f1f1, fontSize: 14 },
//   bgColor: 0x112266,
//   showLevels: false,
// }

// export class SkillIcon extends JMBUI.InteractiveElement {
//   counter: PIXI.Text;

//   constructor(public data: SkillBlock, options: ISkillButton) {
//     super(JMBL.utils.default(options, DSKillButton));
//     this.addLabel(data.name, options.labelStyle);
//     data.maxLevel = data.maxLevel || 1;
//     data.level = data.level || 0;
//     this.buttonMode = true;

//     if (data.level === 0) this.setDisplayState(JMBUI.DisplayState.DARKENED);
//     else if (data.level >= data.maxLevel) this.setDisplayState(JMBUI.DisplayState.BRIGHTENED);

//     if (options.showLevels) {
//       let s: string = (data.level <= 10 ? "0" : "") + String(data.level);
//       s += "/" + (data.maxLevel <= 10 ? "0" : "") + String(data.maxLevel);
//       this.counter = new PIXI.Text(s, options.levelFormat || { fill: this.label.style.fill, fontSize: 8 });
//       this.counter.x = this.graphics.width / 2 - this.counter.width / 2;
//       this.counter.y = this.graphics.height - 10;
//       this.addChild(this.counter);
//     }
//   }

//   errorFlash() {
//     this.colorFlash(0xff0000, 15, 35, 25);
//   }
// }

// const DSkillWindow: JMBUI.GraphicOptions = { width: 400, height: 400, fill: 0xff9933, bgColor: 0xffffff, alpha: 0.9 };
