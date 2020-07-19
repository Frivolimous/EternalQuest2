import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { CharacterPanel } from '../components/character/CharacterPanel';
import { SaveManager } from '../services/SaveManager';
import { IPlayerSave, dPlayerSave, dPlayerLevelSave } from '../data/SaveData';
import { RandomSeed } from '../services/RandomSeed';
import { InputText } from '../components/ui/InputText';

export class NewCharacterUI extends BaseUI {
  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel: CharacterPanel;
  private backB: Button;
  private confirmB: Button;
  private input: InputText;

  private save: IPlayerSave;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text('New Character', { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, color: 0xff9999 , label: 'Cancel', onClick: this.navMenu });
    this.confirmB = new Button({ width: 100, height: 30, label: 'Confirm', onClick: this.navConfirm });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel = new CharacterPanel(new PIXI.Rectangle(0, 0, 300, 500));
    let name = new PIXI.Text('Name: ', {fontSize: 20, fill: 0xffffff, fontFamily: Fonts.UI});
    this.input = new InputText({width: 200});
    name.position.set(10, 10);
    this.input.position.set(80, 10);
    this.confirmB.position.set(100, 450);
    this.leftPanel.addChild(name, this.input, this.confirmB);
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB);
    this.setupCharacter();
  }

  public destroy() {
    super.destroy();
    this.input.destroy();
  }

  public setupCharacter = () => {
    let slug = RandomSeed.randomSlug();
    this.save = _.cloneDeep(dPlayerSave);
    this.save.__id = slug;
    // this.rightPanel.setPlayer(this.save);
  }

  public positionElements = (e: IResizeEvent) => {
    this.title.x = (e.innerBounds.width - this.title.width) / 2;
    this.title.y = 50;
    this.leftPanel.position.set(50, 150);
    this.rightPanel.position.set(e.innerBounds.right - 300 - 50, 150);
    this.backB.position.set(e.innerBounds.right - 150, e.innerBounds.bottom - 50);
  }

  private navConfirm = () => {
    this.save.name = this.input.text;
    SaveManager.getExtrinsic().lastCharacter = this.save.__id;
    SaveManager.savePlayer(this.save, this.save.__id, true, _.cloneDeep(dPlayerLevelSave)).then(() => this.navBack());
  }

  private navMenu = () => {
    this.navBack();
  }
}
