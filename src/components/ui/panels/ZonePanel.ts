import { BasePanel } from './_BasePanel';
import * as PIXI from 'pixi.js';

import { Button } from '../Button';
import { IPlayerLevelSave } from '../../../data/SaveData';
import { StringData } from '../../../data/StringData';
import { Fonts } from '../../../data/Fonts';
import { Gauge } from '../Gauge';
import { Formula } from '../../../services/Formula';
import { TooltipReader } from '../../../JMGE/TooltipReader';

export class ZonePanel extends BasePanel {
  private zoneText: PIXI.Text;
  private zoneGauge: Gauge;

  constructor(navTown: () => void) {
    super(new PIXI.Rectangle(500, 0, 300, 150), 0x999999);

    this.zoneText = new PIXI.Text('', {fill: 0, fontFamily: Fonts.UI, fontSize: 20});
    this.zoneGauge = new Gauge({ width: 200, height: 20, rounding: 10, bgColor: 0x553355, color: 0xff55ff});
    let townB = new Button({ width: 200, height: 30, label: 'To Town', onClick: navTown });
    this.addChild(townB);
    this.addChild(this.zoneText, this.zoneGauge);
    this.zoneText.position.set(10, 20);
    this.zoneGauge.position.set(60, 45);
    townB.position.set(50, 75);

    TooltipReader.addTooltip(this.zoneGauge, () => ({ title: 'Enemies Killed', description: String(this.zoneGauge.count) + ' / ' + String(this.zoneGauge.total) }));
  }

  public updateZoneProgress = (playerLevel: IPlayerLevelSave) => {
    this.zoneText.text = StringData.MONSTER_SET_NAME[playerLevel.monsterType as number] + ' ' + StringData.ZONE_NAME[playerLevel.zoneType] + ' ' + String(playerLevel.zone);
    this.zoneText.x = (this.getWidth() - this.zoneText.width) / 2;
    this.zoneGauge.setFraction(playerLevel.enemyCount, Formula.monstersByZone(playerLevel.zoneType));
  }
}
