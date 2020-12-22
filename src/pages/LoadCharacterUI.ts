import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button, IButton } from '../components/ui/Button';
import { CharacterPanel } from '../components/ui/panels/CharacterPanel';
import { SaveManager } from '../services/SaveManager';
import { SelectList } from '../components/ui/SelectButton';
import { IHeroSave } from '../data/SaveData';
import { SimpleModal } from '../components/ui/modals/SimpleModal';
import { OptionModal } from '../components/ui/modals/OptionModal';

export class LoadCharacterUI extends BaseUI {
  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel: CharacterPanel;
  private backB: Button;

  private loadSelection: SelectList;
  private heroes: IHeroSave[];

  constructor() {
    super({bgColor: 0x777777});
    this.loadSelection = new SelectList({ width: 250, height: 60 }, this.selectCharacter, this.startDeleteCharacter);
    this.title = new PIXI.Text('Load Character', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, label: 'Back', onClick: this.navMenu });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel = new CharacterPanel(new PIXI.Rectangle(0, 0, 300, 500));
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB);
  }

  public navIn = () => {
    this.loadCharacters();
  }

  public loadCharacters = () => {
    this.loadSelection.destroyAll();

    SaveManager.getAllPlayers().then(saves => {
      this.heroes = saves;
      for (let i = 0; i < saves.length; i++) {
        let button = this.loadSelection.makeLoadButton(saves[i].name);
        this.leftPanel.addChild(button);
        button.position.set(25, 50 + i * 80);
      }

      let id = SaveManager.getCurrentPlayer().__id;
      let index = _.findIndex(this.heroes, {__id: id});
      if (index >= 0) {
        this.loadSelection.selectButton(index);
      } else {
        this.loadSelection.selectButton(0);
      }
    });
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    this.leftPanel.position.set(50, 150);
    this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.backB.position.set(e.innerBounds.right - 150, e.innerBounds.bottom - 50);
  }

  private navMenu = () => {
    this.navBack();
  }

  private selectCharacter = (i: number) => {
    this.rightPanel.setSource(this.heroes[i]);
    SaveManager.loadPlayer(this.heroes[i].__id, true);
    SaveManager.getExtrinsic().lastCharacter = this.heroes[i].__id;
  }

  private startDeleteCharacter = (i: number) => {
    if (this.heroes.length <= 1) {
      this.addDialogueWindow(new SimpleModal('You cannot delete your last character'));
    } else {
      this.addDialogueWindow(new OptionModal('Delete this character?', [
        {label: 'Confirm', color: 0x55ff55, onClick: () => {
          SaveManager.deletePlayer(this.heroes[i].__id).then(this.loadCharacters);
        }},
        {label: 'Cancel', color: 0xff5555},
      ]));
    }
  }
}
