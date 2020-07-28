import * as PIXI from 'pixi.js';
import * as _ from 'lodash';
import { ScreenCover } from '../JMGE/effects/ScreenCover';
import { BaseModal } from '../components/ui/modals/_BaseModal';
import { GameEvents, IResizeEvent } from '../services/GameEvents';
import { MenuUI } from './MenuUI';
import { Facade } from '../index';

export interface IBaseUI {
  bgColor: number;
}

export class BaseUI extends PIXI.Container {
  protected previousUI: BaseUI;
  protected previousResize: IResizeEvent;

  protected dialogueWindow: BaseModal;

  private saveCallback?: (finishNav: () => void) => void;

  private background: PIXI.Graphics;

  constructor(private config?: IBaseUI) {
    super();
    this.background = new PIXI.Graphics();
    this.addChild(this.background);
    GameEvents.WINDOW_RESIZE.addListener(this.onResize);
    // this.positionElements(resize);
  }

  public navIn = () => { };

  public navOut = () => { };

  public positionElements = (e: IResizeEvent) => { };

  public onResize = (e: IResizeEvent) => {
    this.previousResize = e;
    if (this.parent) {
      this.redrawBase(e);
      this.positionElements(e);

      if (this.dialogueWindow && this.dialogueWindow.parent) {
        this.dialogueWindow.updatePosition(e.outerBounds);
        this.dialogueWindow.position.set(e.outerBounds.width / 2, e.outerBounds.height / 2);
      }
    }
  }

  public destroy() {
    GameEvents.WINDOW_RESIZE.removeListener(this.onResize);
    super.destroy();
  }

  public navBack = (fadeTiming?: IFadeTiming) => {
    // if (this.previousUI) {
    //   this.finishNav(this.previousUI, fadeTiming, true);
    // } else {
      this.finishNav(new MenuUI(), fadeTiming, true);
    // }
    // if (this.saveCallback) {
    //   this.saveCallback(() => {
    //     this.finishNav(this.previousUI, fadeTiming, true);
    //   });
    // } else {
    //   this.finishNav(this.previousUI, fadeTiming, true);
    // }
  }

  public navForward = (nextUI: BaseUI, previousUI?: BaseUI, fadeTiming?: IFadeTiming) => {
    nextUI.previousUI = previousUI || this;
    this.finishNav(nextUI, fadeTiming);
  }

  protected finishNav = (nextUI: BaseUI, fadeTiming?: IFadeTiming, andDestroy?: boolean) => {
    Facade.setCurrentPage(nextUI, fadeTiming);
    // fadeTiming = _.defaults(fadeTiming || {}, dFadeTiming);

    // let screen = new ScreenCover(this.previousResize.outerBounds, fadeTiming.color).onFadeComplete(() => {
    //   this.navOut();
    //   this.parent.addChild(nextUI);
    //   this.parent.removeChild(this);
    //   nextUI.navIn();
    //   if (this.previousResize) {
    //     nextUI.onResize(this.previousResize);
    //   }
    //   let screen2 = new ScreenCover(this.previousResize.outerBounds, fadeTiming.color).fadeOut(fadeTiming.fadeOut);
    //   nextUI.addChild(screen2);

    //   if (andDestroy) {
    //     this.destroy();
    //   }
    // }).fadeIn(fadeTiming.fadeIn, fadeTiming.delay, fadeTiming.delayBlank);
    // this.addChild(screen);
  }

  protected addDialogueWindow(window: BaseModal, delay: number = 0) {
    this.dialogueWindow = window;

    this.dialogueWindow.position.set(this.previousResize.outerBounds.width / 2, this.previousResize.innerBounds.height / 2);
    this.dialogueWindow.updatePosition(this.previousResize.outerBounds);

    this.addChild(this.dialogueWindow);
    this.dialogueWindow.startAnimation(delay);
  }

  private redrawBase = (e: IResizeEvent) => {
    // this.background.clear().beginFill(this.config.bgColor).drawShape(e.outerBounds);
    this.background.clear().beginFill(this.config.bgColor).drawShape(e.innerBounds);
  }
}

export interface IFadeTiming {
  color?: number;
  delay?: number;
  fadeIn?: number;
  delayBlank?: number;
  fadeOut?: number;
}

export const dFadeTiming: IFadeTiming = {
  color: 0,
  delay: 0,
  fadeIn: 300,
  delayBlank: 100,
  fadeOut: 300,
};
