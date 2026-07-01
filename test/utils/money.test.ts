import { toMinorUnits, fromMinorUnits } from '../../src/utils/money';

describe('money utils', () => {
  it('converts major units to minor units', () => {
    expect(toMinorUnits(200.69)).toBe(20069);
    expect(toMinorUnits(10)).toBe(1000);
    expect(toMinorUnits(0.01)).toBe(1);
  });

  it('converts minor units to major units', () => {
    expect(fromMinorUnits(20069)).toBe(200.69);
    expect(fromMinorUnits(1000)).toBe(10);
    expect(fromMinorUnits(1)).toBe(0.01);
  });

  it('rounds floating point imprecision', () => {
    expect(toMinorUnits(0.1 + 0.2)).toBe(30);
  });
});
