export class SpriteModel {
  exists: boolean = true;
  busy: boolean = false;
  dead: boolean = false;
  player: boolean = false;

  action: number = 0;
  accel: number = 0.01;

  maxHealth = 100;
  health = 100;

  focusTarget: SpriteModel;

  tile: number;

  addHealth(n: number) {
    this.health +=n;
    this.health = Math.min(this.health, this.maxHealth);

    if (this.health <= 0) {
      this.dead = true;
    }
  }
}