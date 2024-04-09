import * as PIXI from 'pixi.js';
import _ from 'lodash';

import { BaseUI } from './_BaseUI';
import { Fonts } from '../data/Fonts';
import { IResizeEvent } from '../services/GameEvents';
import { Button } from '../components/ui/Button';
import { CharacterPanel } from '../components/ui/panels/CharacterPanel';
import { SaveManager } from '../services/SaveManager';
import { IHeroSave, dHeroSave, dProgressSave } from '../data/SaveData';
import { RandomSeed } from '../services/RandomSeed';
import { InputText } from '../components/ui/InputText';
import { SelectList } from '../components/ui/SelectButton';
import { TalentList, SkillSlug } from '../data/SkillData';
import { EquipmentSets } from '../data/ItemData';
import { StringManager } from '../services/StringManager';

export class NewCharacterUI extends BaseUI {
  private title: PIXI.Text;
  private leftPanel = new PIXI.Graphics();
  private rightPanel: CharacterPanel;
  private backB: Button;
  private confirmB: Button;
  private input: InputText;
  private talentList: SelectList;
  private currentTalent: SkillSlug;

  private save: IHeroSave;

  constructor() {
    super({bgColor: 0x777777});
    this.title = new PIXI.Text(StringManager.data.BUTTON.NEW_CHAR, { fontSize: 30, fontFamily: Fonts.UI, fill: 0x3333ff });
    this.backB = new Button({ width: 100, height: 30, color: 0xff9999 , label: StringManager.data.BUTTON.CANCEL, onClick: this.navMenu });
    this.confirmB = new Button({ width: 100, height: 30, label: StringManager.data.BUTTON.CONFIRM, onClick: this.navConfirm });
    this.leftPanel.beginFill(0x555555).lineStyle(2, 0x333333).drawRoundedRect(0, 0, 300, 500, 5);
    this.rightPanel = new CharacterPanel(new PIXI.Rectangle(0, 0, 300, 500));
    let name = new PIXI.Text(StringManager.data.MENU_TEXT.NAME + ': ', {fontSize: 20, fill: 0xffffff, fontFamily: Fonts.UI});
    this.input = new InputText({width: 200});
    name.position.set(10, 10);
    this.input.position.set(80, 10);
    this.confirmB.position.set(100, 450);
    this.leftPanel.addChild(name, this.input, this.confirmB);
    this.addChild(this.title, this.leftPanel, this.rightPanel, this.backB);

    this.talentList = new SelectList({width: 100, height: 30}, this.selectTalent);
    TalentList.forEach((slug, i) => {
      let button = this.talentList.makeButton(StringManager.data.SKILL[slug]);
      this.leftPanel.addChild(button);
      button.position.set(40 + 110 * Math.floor(i / 5), 100 + (i % 5) * 40);
    });
    this.talentList.selectButton(0);

    this.setupCharacter();
  }

  public selectTalent = (i: number) => {
    this.currentTalent = TalentList[i];
  }

  public destroy() {
    super.destroy();
    this.input.destroy();
  }

  public setupCharacter = () => {
    let slug = RandomSeed.randomSlug();
    this.save = _.cloneDeep(dHeroSave);
    this.save.__id = slug;
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
    this.save.talent = this.currentTalent;
    let equip = _.cloneDeep(EquipmentSets[this.currentTalent]);
    this.save.equipment = equip.splice(0, 10);
    this.save.inventory = equip;
    SaveManager.getExtrinsic().lastCharacter = this.save.__id;
    SaveManager.savePlayer(this.save, this.save.__id, true, _.cloneDeep(dProgressSave)).then(() => this.navBack());
  }

  private navMenu = () => {
    this.navBack();
  }
}
