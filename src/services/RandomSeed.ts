class SingleSeed {
  private numberSeed: number;
  private current: number = 0;

  constructor(seed: string) {
    let num = 0;
    for (let i = 0; i < seed.length; i++) {
      num += seed.charCodeAt(i);
      num = 1 / num;
      while (num < 0.1) {
        num *= 10;
      }
      this.numberSeed = num;
    }
  }

  public resetSeed() {
    this.current = 0;
  }

  public getRaw(): number {
    this.current += this.numberSeed;
    this.current = this.current - Math.floor(this.current);
    return this.current;
  }

  public getInt(min: number, max: number): number {
    return Math.floor(min + (this.getRaw() * (max - min + 1)));
  }

  public get100() {
    let a: number[] = [];
    for (let i = 0; i < 100; i++) {
      a.push(this.getRaw());
    }
    return a;
  }
}

export const RandomSeed = {
  general: new SingleSeed('general'),
  enemySpawn: new SingleSeed('enemy'),
};

// (window as any).RandomSeed = RandomSeed; // for testing
