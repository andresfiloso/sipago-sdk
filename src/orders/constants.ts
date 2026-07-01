export const OrderStatus = {
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
  FAILED_CHECKOUT: 'FAILED_CHECKOUT',
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
