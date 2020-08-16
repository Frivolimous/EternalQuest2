import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BasePanel } from './_BasePanel';
import { Button } from '../Button';
import { Fonts } from '../../../data/Fonts';
import { ToggleButton } from '../ToggleButton';

export class MiniShop extends BasePanel {
  public fillAllItems: () => void;
  public onSetAutoFill: (b: boolean) => void;

  private fillAllButton: Button;
  private fillAllAmount: PIXI.Text;
  private fillAllAuto: ToggleButton;

  constructor(bounds: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 300, 200), color: number = 0xf1f1f1) {
    super(bounds, color);

    this.fillAllButton = new Button({label: 'Fill Inventory', onClick: this.fillAll, width: 100, height: 20});
    this.fillAllAmount = new PIXI.Text('0g', {fontFamily: Fonts.UI, fontSize: 16});
    this.fillAllAuto = new ToggleButton({onToggle: b => this.onSetAutoFill(b)});

    let autoT = new PIXI.Text('Auto', {fontFamily: Fonts.UI, fontSize: 16});
    this.addChild(this.fillAllButton, this.fillAllAmount, this.fillAllAuto, autoT);

    this.fillAllButton.position.set(30, 50);
    this.fillAllAmount.position.set(140, 50);
    this.fillAllAuto.position.set(200, 50);
    autoT.position.set(200, 30);
  }

  public setAutoFill = (b: boolean) => {
    this.fillAllAuto.selected = b;
  }

  public destroy() {
    super.destroy();
  }

  public setFillAmount = (n: number) => {
    this.fillAllAmount.text = String(n) + 'g';
  }

  public fillAll = () => {
    this.fillAllItems && this.fillAllItems();
  }
}
