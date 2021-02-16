import * as _ from 'lodash';

class SingleSeed {
  private numberSeed: number;
  private current: number = 0;

  constructor(private seed: string) {
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
    if (this.seed === '1') return 1;
    if (this.seed === '0') return 0;

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
  always1: new SingleSeed('1'),
  always0: new SingleSeed('0'),
  randomSlug: () => {
    let str = '';
    for (let i = 0; i < 20; i++) {
      str += _.sample(alphabet);
    }

    return str;
  },
};

let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
