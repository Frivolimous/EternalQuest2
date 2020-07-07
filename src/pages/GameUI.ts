import * as PIXI from 'pixi.js';
import { BaseUI, IBaseUI } from './_BaseUI';
import { BasePanel } from '../components/ui/panels/_BasePanel';
import { Button } from '../components/ui/Button';
import { GameView } from '../components/game/GameView';
import { GameController } from '../engine/GameController';
import { SimpleModal } from '../components/ui/modals/SimpleModal';
import { VitalsPanel } from '../components/ui/panels/VitalsPanel';
import { ZonePanel } from '../components/ui/panels/ZonePanel';
import { StatsPanel } from '../components/ui/panels/StatsPanel';

export class GameUI extends BaseUI {
  public display: GameView;
  public controller: GameController;

  constructor(config?: IBaseUI) {
    super({bgColor: 0x777777});

    this.display = new GameView();
    this.addChild(this.display);

    let vitals = new VitalsPanel();
    let nav = new ZonePanel(new PIXI.Rectangle(500, 0, 300, 150), this.navTown);
    let stats = new StatsPanel();
    // let log = new BasePanel(new PIXI.Rectangle(525, 150, 275, 500));
    // let skills = new BasePanel(new PIXI.Rectangle(525, 150, 275, 500));
    let inventory = new BasePanel(new PIXI.Rectangle(0, 650, 800, 150));

    this.addChild(vitals, nav, stats);
    // this.addChild(vitals, nav, stats, inventory);

    this.controller = new GameController(this.display);
    this.controller.onPlayerDead.addListener(this.playerDead);
    this.controller.onZoneProgress.addListener(nav.updateZoneProgress);
    this.controller.onVitalsUpdate.addListener(vitals.update);
    this.controller.onPlayerAdded.addListener(vitals.addPlayer);
    this.controller.onPlayerAdded.addListener(stats.changeSource);
    this.display.onSpriteClicked.addListener(stats.addTemp);
    this.controller.onEnemyDead.addListener(stats.removeTemp);
  }

  public destroy() {
    this.controller.destroy();
    this.display.destroy();
    super.destroy();
  }

  private navTown = () => {
    this.navBack(); // replace with 'add town buff';
  }

  private playerDead = () => {
    this.addDialogueWindow(new SimpleModal('You have died!', { colorBack: 0x333333, colorFront: 0x666666, closeText: 'Close' }, 300, 300, () => {
      this.controller.restartLevel();
    }));
  }
}
