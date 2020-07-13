import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BaseUI, IBaseUI } from './_BaseUI';
import { BasePanel } from '../components/ui/panels/_BasePanel';
import { Button } from '../components/ui/Button';
import { GameView } from '../components/game/GameView';
import { GameController } from '../engine/GameController';
import { SimpleModal } from '../components/ui/modals/SimpleModal';
import { VitalsPanel } from '../components/ui/panels/VitalsPanel';
import { ZonePanel } from '../components/ui/panels/ZonePanel';
import { StatsPanel } from '../components/ui/panels/StatsPanel';
import { IResizeEvent } from '../services/GameEvents';
import { InventoryPanel } from '../components/ui/panels/InventoryPanel';
import { SkillPanel } from '../components/ui/panels/SkillPanel';
import { SaveManager } from '../services/SaveManager';
import { OptionModal } from '../components/ui/modals/OptionModal';

export class GameUI extends BaseUI {
  public display: GameView;
  public controller: GameController;

  private vitals: VitalsPanel;
  private zone: ZonePanel;
  private stats: StatsPanel;
  private inventory: InventoryPanel;
  // private log: BasePanel;
  private skills: SkillPanel;
  private swapPanelButton: Button;

  constructor(config?: IBaseUI) {
    super({bgColor: 0x777777});

    this.display = new GameView();
    this.addChild(this.display);

    this.vitals = new VitalsPanel();
    this.zone = new ZonePanel(this.navTown);
    this.stats = new StatsPanel();
    this.inventory = new InventoryPanel();
    // this.log = new BasePanel(new PIXI.Rectangle(525, 150, 275, 650), 0xf1cccc);
    this.skills = new SkillPanel();

    this.swapPanelButton = new Button({ width: 80, height: 20, label: 'Next Tab', onClick: this.swapPanel, rounding: 2, labelStyle: {fontSize: 18} });

    this.addChild(this.vitals, this.zone, this.swapPanelButton, this.inventory);

    // this.addChild(this.stats);
    this.addChild(this.skills);

    this.stitchComponents();
  }

  public stitchComponents() {
    this.controller = new GameController();

    this.controller.onZoneProgress.addListener(this.zone.updateZoneProgress);
    this.controller.onVitalsUpdate.addListener(this.vitals.update);
    this.controller.onPlayerAdded.addListener(this.vitals.addPlayer);
    this.controller.onPlayerAdded.addListener(this.skills.addPlayer);
    this.controller.onPlayerAdded.addListener(this.stats.changeSource);
    this.controller.onPlayerAdded.addListener(this.inventory.addPlayer);
    this.controller.onPlayerLevel.addListener(this.display.playerLevel);
    this.controller.onPlayerLevel.addListener(this.skills.update);
    this.controller.onPlayerLevel.addListener(this.vitals.addPlayer);
    this.controller.onEnemyDead.addListener(this.stats.removeTemp);
    this.controller.onEnemyDead.addListener(this.saveGame);

    this.controller.onSpriteAdded.addListener(this.display.spriteAdded);
    this.controller.onSpriteRemoved.addListener(this.display.spriteRemoved);
    this.controller.onFightStart.addListener(this.display.fightStarted);
    this.controller.onAction.addListener(this.display.animateAction);
    this.controller.onBuffEffect.addListener(this.display.animateBuff);

    this.display.onSpriteClicked.addListener(this.stats.addTemp);
    this.controller.onLevelComplete.addListener(this.levelComplete);
    this.controller.onLoot.addListener(this.inventory.addItem); // ESSENTIAL FOR COLLECTING LOOT - - need to offload logic to StatModel
    this.display.onQueueEmpty.addListener(this.controller.proceed); // ESSENTIAL FOR ANIMATION TIMING - - replace this when headless
    this.controller.onNavTown.addListener(this.finishNavTown); // ESSENTIAL FOR LEAVING THE GAME - - alternate method needed for headless
    this.controller.onPlayerDead.addListener(this.playerDead); // Shows the end screen with essential controls
  }

  public destroy() {
    this.controller.destroy();
    this.display.destroy();
    super.destroy();
  }

  public positionElements = (e: IResizeEvent) => {
    this.vitals.position.set(e.innerBounds.x, e.innerBounds.y);
    this.zone.position.set(e.outerBounds.right - this.zone.getWidth(), e.innerBounds.y);
    this.stats.position.set(e.outerBounds.right - this.stats.getWidth(), e.innerBounds.y + this.zone.getHeight());
    // this.log.position.set(e.outerBounds.right - this.log.getWidth(), e.innerBounds.y + this.zone.getHeight());
    this.skills.position.set(e.outerBounds.right - this.skills.getWidth(), e.innerBounds.y + this.zone.getHeight());
    this.inventory.position.set(e.innerBounds.x, e.innerBounds.bottom - this.inventory.getHeight());
    this.swapPanelButton.position.set(e.outerBounds.right - this.zone.getWidth() / 2 - this.swapPanelButton.getWidth() / 2, this.stats.y - this.swapPanelButton.getHeight() - 10);
    this.display.positionElements(e);
  }

  private navTown = () => {
    this.controller.addTownBuff();
  }

  private finishNavTown = () => {
    this.saveGame();
    this.navBack();
  }

  private nextLevel = () => {
    this.navForward(new GameUI());
  }

  private playerDead = () => {
    this.addDialogueWindow(new SimpleModal('You have died!', { colorBack: 0x333333, colorFront: 0x666666, closeText: 'Close' }, 300, 300, () => {
      this.controller.restartLevel();
    }));
  }

  private swapPanel = () => {
    if (_.includes(this.children, this.stats)) {
      this.removeChild(this.stats);
      this.addChild(this.skills);
    // } else if (_.includes(this.children, this.log)) {
    //   this.removeChild(this.log);
    //   this.addChild(this.skills);
    } else if (_.includes(this.children, this.skills)) {
      this.removeChild(this.skills);
      this.addChild(this.stats);
    }
  }

  private saveGame = () => {
    let playerSave = this.controller.getPlayerSave();
    SaveManager.savePlayer(playerSave, undefined, true);
  }

  private levelComplete = () => {
    this.addDialogueWindow(new OptionModal('You finished the level!', { colorBack: 0x333333, colorFront: 0x666666}, 300, 300, [{label: 'To Town', onClick: this.finishNavTown}, {label: 'Continue', onClick: this.nextLevel}]));
  }
}
