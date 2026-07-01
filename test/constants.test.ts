import { Currency } from '../src/types/common.js';
import { OrderStatus, PaymentStatus } from '../src/orders/constants.js';

describe('constants', () => {
  it('exports Currency.ARS as ISO 4217 numeric code', () => {
    expect(Currency.ARS).toBe('032');
  });

  it('exports all order statuses', () => {
    expect(OrderStatus.PENDING).toBe('PENDING');
    expect(OrderStatus.EXPIRED).toBe('EXPIRED');
    expect(OrderStatus.FAILED_CHECKOUT).toBe('FAILED_CHECKOUT');
    expect(OrderStatus.FAILED).toBe('FAILED');
    expect(OrderStatus.SUCCESS).toBe('SUCCESS');
  });

  it('exports all payment statuses', () => {
    expect(PaymentStatus.APPROVED).toBe('APPROVED');
    expect(PaymentStatus.DENIED).toBe('DENIED');
  });
});
