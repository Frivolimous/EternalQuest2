export const Formula = {
  diminish(a: number, _level: number): number {
    return 1 - Math.pow(1 - a, _level);
  },
  addMult(a: number, b: number): number {
    return (1 - (1 - a) * (1 - b));
  },
  subMult(t: number, a: number): number {
    return (1 - (1 - t) / (1 - a));
  },

  monstersByZone(zone: number): number {
    return zone + 8;
  },
};
