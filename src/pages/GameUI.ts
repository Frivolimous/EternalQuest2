import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

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

export class GameUI extends BaseUI {
  public display: GameView;
  public controller: GameController;

  private vitals: VitalsPanel;
  private zone: ZonePanel;
  private stats: StatsPanel;
  private inventory: InventoryPanel;
  private actionPanel: ActionPanel;
  private currencyPanel: CurrencyPanel;
  private skills: SkillPanel;
  // private log: BasePanel;
  private swapPanelButton: Button;

  private minishop: MiniShop;

  constructor(config?: IBaseUI) {
    super({bgColor: 0x777777});

    this.display = new GameView();
    this.addChild(this.display);

    this.vitals = new VitalsPanel();
    this.zone = new ZonePanel(this.navTown);
    this.stats = new StatsPanel();
    this.inventory = new InventoryPanel();
    this.actionPanel = new ActionPanel();
    this.currencyPanel = new CurrencyPanel();
    // this.log = new BasePanel(new PIXI.Rectangle(525, 150, 275, 650), 0xf1cccc);
    this.skills = new SkillPanel();

    this.swapPanelButton = new Button({ width: 80, height: 20, label: StringManager.data.BUTTON.NEXT_TAB, onClick: this.swapPanel, rounding: 2, labelStyle: {fontSize: 18} });

    this.addChild(this.vitals, this.zone, this.swapPanelButton, this.inventory, this.skills, this.currencyPanel);
  }

  public navIn = () => {
    this.stitchComponents();
  }

  public navOut = () => {
    this.saveGame();
  }

  public stitchComponents() {
    this.controller = new GameController();

    this.controller.onZoneProgress.addListener(this.zone.updateZoneProgress);
    this.controller.onVitalsUpdate.addListener(this.vitals.update);
    this.controller.onPlayerAdded.addListener(this.vitals.addSource);
    this.controller.onPlayerAdded.addListener(this.skills.addSource);
    this.controller.onPlayerAdded.addListener(this.stats.changeSource);
    this.controller.onPlayerAdded.addListener(this.actionPanel.changeSource);
    this.controller.onPlayerAdded.addListener(this.inventory.addSource);
    this.controller.onSpriteLevel.addListener(this.display.spriteLevelUp);
    this.controller.onSpriteLevel.addListener(this.skills.update);
    this.controller.onSpriteLevel.addListener(this.vitals.addSource);
    this.controller.onEnemyDead.addListener(this.stats.removeTemp);
    this.controller.onEnemyDead.addListener(this.actionPanel.removeTemp);
    this.controller.onEnemyDead.addListener(this.saveGame);
    this.controller.onItemUpdate.addListener(this.updateItem); // ESSENTIAL FOR COLLECTING LOOT and removing items - - need to offload logic to StatModel

    this.controller.onSpriteAdded.addListener(this.display.spriteAdded);
    this.controller.onSpriteRemoved.addListener(this.display.spriteRemoved);
    this.controller.onFightStart.addListener(this.display.fightStarted);
    this.controller.onAction.addListener(this.display.animateAction);
    this.display.onActionComplete.addListener(this.controller.finishAction);
    this.controller.onBuffEffect.addListener(this.display.animateBuff);

    this.display.onSpriteSelected.addListener(data => data.type === 'select' ? this.stats.addTemp(data.sprite) : this.stats.removeTemp(data.sprite));
    this.display.onSpriteSelected.addListener(data => data.type === 'select' ? this.actionPanel.addTemp(data.sprite) : this.actionPanel.removeTemp(data.sprite));
    this.display.onSpriteSelected.addListener(this.controller.selectTarget);
    this.controller.onLevelComplete.addListener(this.levelComplete);

    this.display.onQueueEmpty.addListener(this.controller.proceed); // ESSENTIAL FOR ANIMATION TIMING - - replace this when headless
    this.controller.onNavTown.addListener(this.finishNavTown); // ESSENTIAL FOR LEAVING THE GAME - - alternate method needed for headless
    this.controller.onPlayerDead.addListener(this.playerDead); // Shows the end screen with essential controls
    JMTicker.add(this.updateCurrency); // make this a listener instead?
    this.inventory.onItemSell = this.sellItem; // very deep callback, goes through like 5 layers
    this.inventory.onItemSelect = this.controller.selectItem; // select item to override priority

    this.controller.onPlayerAdded.addListener(model => model.stats.onUpdate.addListener(this.updateStats));
  }

  public updateStats = () => {
    this.inventory.updateSlots();
  }

  public destroy() {
    this.controller.destroy();
    this.display.destroy();
    this.vitals.destroy();
    this.zone.destroy();
    this.stats.destroy();
    this.actionPanel.destroy();
    this.inventory.destroy();
    this.currencyPanel.destroy();
    this.skills.destroy();

    JMTicker.remove(this.updateCurrency);

    super.destroy();
  }

  public positionElements = (e: IResizeEvent) => {
    this.vitals.position.set(e.innerBounds.x, e.innerBounds.y);
    this.zone.position.set(e.outerBounds.right - this.zone.getWidth(), e.innerBounds.y);
    this.stats.position.set(e.outerBounds.right - this.stats.getWidth(), e.innerBounds.y + this.zone.getHeight());
    this.actionPanel.position.set(e.outerBounds.right - this.stats.getWidth(), e.innerBounds.y + this.zone.getHeight());
    this.skills.position.set(e.outerBounds.right - this.skills.getWidth(), e.innerBounds.y + this.zone.getHeight());
    this.inventory.position.set(e.innerBounds.x, e.innerBounds.bottom - this.inventory.getHeight());
    this.swapPanelButton.position.set(e.outerBounds.right - this.zone.getWidth() / 2 - this.swapPanelButton.getWidth() / 2, this.stats.y - this.swapPanelButton.getHeight() - 10);
    this.currencyPanel.position.set(this.vitals.x + this.vitals.getWidth() + (this.zone.x - this.vitals.x - this.vitals.getWidth() - this.currencyPanel.getWidth()) / 2, 0);
    this.minishop && this.minishop.position.set(e.outerBounds.left + e.outerBounds.width / 2, e.outerBounds.top + e.outerBounds.height / 2);

    this.display.positionElements(e);
  }

  private navTown = () => {
    this.controller.addTownBuff();
  }

  private finishNavTown = () => {
    this.navBack();
  }

  private nextLevel = () => {
    if (this.minishop && SaveManager.getExtrinsic().options.autoFill) {
      this.tryAutoFill();
    }
    this.navForward(new GameUI());
  }

  private playerDead = () => {
    this.saveGame();
    // this.display.clearQueue();
    this.addDialogueWindow(new SimpleModal(StringManager.data.MENU_TEXT.DEAD_MODAL, () => {
      this.controller.restartLevel();
    }));
  }

  private swapPanel = () => {
    if (_.includes(this.children, this.stats)) {
      this.removeChild(this.stats);
      this.addChild(this.actionPanel);
    } else if (_.includes(this.children, this.actionPanel)) {
      this.removeChild(this.actionPanel);
      this.addChild(this.skills);
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
    this.addDialogueWindow(new TimerOptionModal(StringManager.data.MENU_TEXT.LEVEL_COMPLETE, [{label: StringManager.data.BUTTON.TO_TOWN, onClick: this.finishNavTown}, {label: StringManager.data.BUTTON.CONTINUE, onClick: this.nextLevel, timer: 15}]));
    this.addMinishop();
  }

  private sellItem = (item: IItem, slot: number, callback: () => void) => {
    // if (item.cost > 80) {
    //   this.addDialogueWindow(new OptionModal('Sell ' + item.name + ' for ' + item.cost + ' Gold?', { colorBack: 0x333333, colorFront: 0x666666}, 300, 300, [
    //     {label: 'Yes', onClick: () => {
    //       SaveManager.getExtrinsic().currency.gold += item.cost;
    //       callback();
    //     }},
    //     {label: 'No', color: 0xf16666, onClick: () => {}},
    //   ]));
    // } else {
      SaveManager.getExtrinsic().currency.gold += item.cost;
      callback();
    // }
  }

  private updateItem = (data: IItemUpdate) => {
    if (data.type === 'update') {
      this.inventory.updateItem(data.item);
    } else if (data.type === 'loot') {
      this.inventory.addItem(data.item);
    } else if (data.type === 'remove') {
      this.inventory.removeItem(data.item);
    } else if (data.type === 'clearSelect') {
      this.inventory.clearItemSelect(data.item);
    }
  }

  private updateCurrency = () => {
    this.currencyPanel.update(SaveManager.getExtrinsic());
    this.minishop && this.minishop.setFillAmount(this.inventory.getFillableCost());
  }

  private addMinishop = () => {
    this.minishop = new MiniShop();
    this.minishop.fillAllItems = this.fillAllItems;
    this.minishop.onSetAutoFill = b => SaveManager.getExtrinsic().options.autoFill = b;
    this.minishop.setFillAmount(this.inventory.getFillableCost());
    this.addChild(this.minishop);
    this.minishop.position.set(this.previousResize.outerBounds.left + (this.previousResize.outerBounds.width - this.minishop.getWidth()) / 2, this.previousResize.outerBounds.top + (this.previousResize.outerBounds.height - this.minishop.getHeight()) / 2);
    this.minishop.setAutoFill(SaveManager.getExtrinsic().options.autoFill);
  }

  private fillAllItems = (noDialogue?: boolean) => {
    let value = this.inventory.getFillableCost();

    this.canAfford(value, () => {
      this.inventory.fillAllItems();
    }, 'gold', noDialogue);
  }

  private tryAutoFill = () => {
    this.fillAllItems(true);
  }

  private canAfford = (value: number, onSuccess: () => void, currency: CurrencySlug = 'gold', noDialogue?: boolean) => {
    StoreManager.purchaseAttempt(value, currency, (result: IPurchaseResult) => {
      if (result.success) {
        onSuccess();
      } else if (result.confirmation) {
        if (!noDialogue) {
          this.addDialogueWindow(new OptionModal(result.message || StringManager.data.MENU_TEXT.COMPLETE_PUCHASE, [{ label: StringManager.data.BUTTON.YES, onClick: result.confirmation, color: 0x66ff66}, { label: StringManager.data.BUTTON.NO, color: 0xff6666 }]));
        } else {
          result.confirmation();
        }
      } else {
        if (!noDialogue) {
          this.addDialogueWindow(new SimpleModal(result.message || StringManager.data.MENU_TEXT.NOT_ENOUGH + StringManager.data.CURRENCY[currency]));
        }
      }
    });
  }
}
