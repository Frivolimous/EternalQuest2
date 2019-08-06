import { Facade } from '../index';
import { GameController } from './engine/GameController';
import { GameView } from './ui/GameView';

export class GameUI extends PIXI.Container {
  public display = new GameView();
  public controller: GameController;

  constructor() {
    super();

    this.addChild(this.display);

    this.controller = new GameController(this.display);

    window.addEventListener('keydown', this.keyDown);
  }

  public dispose() {
    window.removeEventListener('keydown', this.keyDown);
    this.controller.dispose();
    this.display.dispose();
  }

  private keyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      Facade.navBack();
    }
  }
}
