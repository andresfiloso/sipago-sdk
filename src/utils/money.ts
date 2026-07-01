const MINOR_UNIT_FACTOR = 100;

/**
 * Converts a major-unit amount (e.g. 200.69 pesos) to minor units (20069).
 */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * MINOR_UNIT_FACTOR);
}

/**
 * Converts minor units (e.g. 20069) to a major-unit amount (200.69).
 */
export function fromMinorUnits(amount: number): number {
  return amount / MINOR_UNIT_FACTOR;
}
