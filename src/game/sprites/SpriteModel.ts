export class SpriteModel {
  public exists: boolean = true;
  public busy: boolean = false;
  public dead: boolean = false;
  public player: boolean = false;

  public action: number = 0;
  public accel: number = 0.01;

  public maxHealth = 100;
  public health = 100;

  public focusTarget: SpriteModel;

  public tile: number;

  public addHealth(n: number) {
    this.health += n;
    this.health = Math.min(this.health, this.maxHealth);

    if (this.health <= 0) {
      this.dead = true;
    }
  }
}
