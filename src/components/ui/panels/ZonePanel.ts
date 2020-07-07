import { BasePanel } from './_BasePanel';
import { Button } from '../Button';
import { IPlayerLevelSave } from '../../../data/SaveData';

export class ZonePanel extends BasePanel {
  constructor(bounds: PIXI.Rectangle, navTown: () => void) {
    super(bounds);

    let townB = new Button({ width: 200, height: 30, label: 'To Town', onClick: navTown });
    this.addChild(townB);
    townB.position.set(50, 70);
  }

  public updateZoneProgress(playerLevel: IPlayerLevelSave) {

  }
}
