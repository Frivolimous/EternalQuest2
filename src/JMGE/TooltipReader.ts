import * as PIXI from 'pixi.js';
import { TooltipPopup, ITooltipPopup } from '../components/ui/TooltipPopup';

export interface ITooltip {
  title: string;
  description: string;
  config?: ITooltipPopup;
}

export class TooltipReader {

  public static addTooltip(object: PIXI.DisplayObject, tooltip: ITooltip) {
    object.interactive = true;
    (object as any).tooltip = tooltip;
  }

  private currentTarget: any;

  private currentTooltip: TooltipPopup;

  constructor(private stage: PIXI.Container, private borders: PIXI.Rectangle, private tooltipConfig: ITooltipPopup) {
    stage.addListener('mousemove', this.mouseMove);
  }

  public destroy() {

  }

  private mouseMove = (e: PIXI.interaction.InteractionEvent) => {
    let target: any = e.target;
    if (!target) return;
    if (target !== this.currentTarget && target !== this.currentTooltip) {
      if (this.currentTooltip) {
        this.currentTooltip.destroy();
      }

      if (target.tooltip) {
        let tooltip: ITooltip = target.tooltip;
        this.currentTooltip = new TooltipPopup(tooltip.title, tooltip.description, tooltip.config || this.tooltipConfig);
        this.stage.addChild(this.currentTooltip);

        let position = this.stage.toLocal(target, target.parent);
        let width = (target.getWidth ? target.getWidth() : target.width) || 0;
        let height = (target.getHeight ? target.getHeight() : target.height) || 0;

        let rect = new PIXI.Rectangle(position.x, position.y, width, height);

        this.currentTooltip.reposition(rect, this.borders);
      }
    }
  }
}
