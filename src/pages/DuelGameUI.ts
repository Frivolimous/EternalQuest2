import * as PIXI from 'pixi.js';
import _ from 'lodash';

import { BaseUI, IBaseUI } from './_BaseUI';
import { Button } from '../components/ui/Button';
import { GameView } from '../components/game/GameView';
import { GameController } from '../engine/GameController';
import { SimpleModal } from '../components/ui/modals/SimpleModal';
import { VitalsPanel } from '../components/ui/panels/VitalsPanel';
import { ZonePanel } from '../components/ui/panels/ZonePanel';
import { StatsPanel } from '../components/ui/panels/StatsPanel';
import { CurrencyPanel } from '../components/ui/panels/CurrencyPanel';
import { IResizeEvent, IItemUpdate } from '../services/GameEvents';
import { InventoryPanel } from '../components/ui/panels/InventoryPanel';
import { SkillPanel } from '../components/ui/panels/SkillPanel';
import { SaveManager } from '../services/SaveManager';
import { OptionModal } from '../components/ui/modals/OptionModal';
import { JMTicker } from '../JMGE/events/JMTicker';
import { IItem } from '../data/ItemData';
import { StoreManager, IPurchaseResult } from '../services/StoreManager';
import { CurrencySlug } from '../data/SaveData';
import { MiniShop } from '../components/ui/panels/MiniShop';
import { TimerOptionModal } from '../components/ui/modals/TimerOptionModal';
import { ActionPanel } from '../components/ui/panels/ActionPanel';
import { StringManager } from '../services/StringManager';

export class DuelGameUI extends BaseUI {
  public display: GameView;
  public controller: GameController;

  private vitals: VitalsPanel;
  private inventory: InventoryPanel;
  private currencyPanel: CurrencyPanel;

  constructor(config?: IBaseUI) {
    super({bgColor: 0x777777});

    this.display = new GameView();
    this.addChild(this.display);

    this.vitals = new VitalsPanel();
    this.inventory = new InventoryPanel();
    this.currencyPanel = new CurrencyPanel();

    this.addChild(this.vitals, this.inventory);
    // this.addChild(this.currencyPanel);
  }

  public navIn = () => {
    this.stitchComponents();
  }

  public navOut = () => {
    this.saveGame();
  }

  public stitchComponents() {
    this.controller = new GameController();

    this.controller.onVitalsUpdate.addListener(this.vitals.update);
    this.controller.onPlayerAdded.addListener(this.vitals.addSource);
    this.controller.onPlayerAdded.addListener(this.inventory.addSource);
    this.controller.onSpriteLevel.addListener(this.display.spriteLevelUp);
    this.controller.onSpriteLevel.addListener(this.vitals.addSource);
    this.controller.onEnemyDead.addListener(this.saveGame);

    this.controller.onSpriteAdded.addListener(this.display.spriteAdded);
    this.controller.onSpriteRemoved.addListener(this.display.spriteRemoved);
    this.controller.onFightStart.addListener(this.display.fightStarted);
    this.controller.onAction.addListener(this.display.animateAction);
    this.display.onActionComplete.addListener(this.controller.finishAction);
    this.controller.onBuffEffect.addListener(this.display.animateBuff);

    this.display.onSpriteSelected.addListener(this.controller.selectTarget);
    this.controller.onLevelComplete.addListener(this.levelComplete);

    this.display.onQueueEmpty.addListener(this.controller.proceed); // ESSENTIAL FOR ANIMATION TIMING - - replace this when headless
    this.controller.onNavTown.addListener(this.finishNavTown); // ESSENTIAL FOR LEAVING THE GAME - - alternate method needed for headless
    this.controller.onPlayerDead.addListener(this.playerDead); // Shows the end screen with essential controls
    JMTicker.add(this.updateCurrency); // make this a listener instead?

    this.controller.onPlayerAdded.addListener(model => model.stats.onUpdate.addListener(this.updateStats));
  }

  public updateStats = () => {
    this.inventory.updateSlots();
  }

  public destroy() {
    this.controller.destroy();
    this.display.destroy();
    this.vitals.destroy();
    this.inventory.destroy();
    this.currencyPanel.destroy();

    JMTicker.remove(this.updateCurrency);

    super.destroy();
  }

  public positionElements = (e: IResizeEvent) => {
    this.vitals.position.set(e.innerBounds.x, e.innerBounds.y);
    this.inventory.position.set(e.innerBounds.x, e.innerBounds.bottom - this.inventory.getHeight());
    this.currencyPanel.position.set((e.innerBounds.width - this.currencyPanel.getWidth()) / 2, 0);

    this.display.positionElements(e);
  }

  private navTown = () => {
    this.controller.addTownBuff();
  }

  private finishNavTown = () => {
    this.navBack();
  }

  private nextLevel = () => {
    this.navForward(new DuelGameUI());
  }

  private playerDead = () => {
    this.saveGame();
    // this.display.clearQueue();
    this.addDialogueWindow(new SimpleModal(StringManager.data.MENU_TEXT.DEAD_MODAL, () => {
      this.controller.restartLevel();
    }));
  }

  private saveGame = () => {
    // let playerSave = this.controller.getPlayerSave();
    // SaveManager.savePlayer(playerSave, undefined, true);
  }

  private levelComplete = () => {
    this.addDialogueWindow(new TimerOptionModal(StringManager.data.MENU_TEXT.LEVEL_COMPLETE, [{label: StringManager.data.BUTTON.TO_TOWN, onClick: this.finishNavTown}, {label: StringManager.data.BUTTON.CONTINUE, onClick: this.nextLevel, timer: 15}]));
  }

  private updateCurrency = () => {
    this.currencyPanel.update(SaveManager.getExtrinsic());
  }
}
