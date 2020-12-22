import * as PIXI from 'pixi.js';

import { BasePanel } from './_BasePanel';
import { Vitals } from '../../../engine/stats/Vitals';
import { Fonts } from '../../../data/Fonts';
import { Gauge } from '../Gauge';
import { StatModel } from '../../../engine/stats/StatModel';
import { SpriteModel } from '../../../engine/sprites/SpriteModel';
import { TooltipReader } from '../../tooltip/TooltipReader';

export class VitalsPanel extends BasePanel {

  private nameT: PIXI.Text;
  private levelT: PIXI.Text;

  private healthGauge: Gauge;
  private manaGauge: Gauge;
  private actionGauge: Gauge;
  private experienceGauge: Gauge;

  constructor() {
    super(new PIXI.Rectangle(0, 0, 300, 150), 0x999999);
    // Name --- Level
    // Health Gauge
    // Mana Gauge
    // Action Gauge

    this.nameT = new PIXI.Text('', {fill: 0, fontFamily: Fonts.UI, fontSize: 20});
    this.levelT = new PIXI.Text('', {fill: 0, fontFamily: Fonts.UI, fontSize: 20});
    this.experienceGauge = new Gauge({ width: 50, height: 10, rounding: 5, bgColor: 0x335533, color: 0x55ff55});

    let HP = new PIXI.Text('HP: ', {fill: 0, fontFamily: Fonts.UI, fontSize: 20});
    let MP = new PIXI.Text('MP: ', {fill: 0, fontFamily: Fonts.UI, fontSize: 20});
    let AP = new PIXI.Text('AP: ', {fill: 0, fontFamily: Fonts.UI, fontSize: 20});
    this.addChild(HP, MP, AP);

    this.healthGauge = new Gauge({ width: 200, height: 20, rounding: 10, bgColor: 0x553333, color: 0xff5555});
    this.manaGauge = new Gauge({ width: 200, height: 20, rounding: 10, bgColor: 0x333355, color: 0x5555ff});
    this.actionGauge = new Gauge({ width: 200, height: 20, rounding: 10, bgColor: 0x555533, color: 0xffff55});

    this.addChild(this.nameT, this.levelT, this.healthGauge, this.manaGauge, this.actionGauge, this.experienceGauge);
    this.nameT.position.set(10, 20);
    this.levelT.position.set(200, 20);
    this.experienceGauge.position.set(200, 44);

    HP.position.set(10, 55);
    MP.position.set(10, 85);
    AP.position.set(10, 115);
    this.healthGauge.position.set(50, 60);
    this.manaGauge.position.set(50, 90);
    this.actionGauge.position.set(50, 120);

    TooltipReader.addTooltip(this.healthGauge, () => ({ title: 'Health', description: String(this.healthGauge.count) + ' / ' + String(this.healthGauge.total) }));
    TooltipReader.addTooltip(this.manaGauge, () => ({ title: 'Mana', description: String(this.manaGauge.count) + ' / ' + String(this.manaGauge.total) }));
    TooltipReader.addTooltip(this.actionGauge, () => ({ title: 'Action', description: String(this.actionGauge.count) + ' / ' + String(this.actionGauge.total) }));
    TooltipReader.addTooltip(this.experienceGauge, () => ({ title: 'Experience', description: String(this.experienceGauge.count) + ' / ' + String(this.experienceGauge.total) }));
  }

  public addSource = (sprite: SpriteModel) => {
    this.nameT.text = sprite.stats.name;
    this.levelT.text = 'Lv: ' + String(sprite.stats.level);

    this.update(sprite.vitals);
  }

  public update = (vitals: Vitals) => {
    this.experienceGauge.setFraction(vitals.getVital('experience'), vitals.getTotal('experience'));
    this.healthGauge.setFraction(vitals.getVital('health'), vitals.getTotal('health'));
    this.manaGauge.setFraction(vitals.getVital('mana'), vitals.getTotal('mana'));
    this.actionGauge.setFraction(vitals.getVital('action'), vitals.getTotal('action'));
  }

}
