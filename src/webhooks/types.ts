import type { OrderStatus, PaymentStatus } from '../orders/constants.js';

export type WebhookOrderSource = string;

export interface WebhookOrder {
  uuid: string;
  status: OrderStatus;
  source: WebhookOrderSource;
}

export interface WebhookPayment {
  id: number;
  authorizationCode?: string;
  refNumber?: string;
  status: PaymentStatus;
}

export interface WebhookPayload {
  data: {
    type: "Payment";
    order: WebhookOrder;
    payment: WebhookPayment;
  };
}

/** Raw API webhook shape (snake_case fields from SiPago) */
export interface WebhookApiPayload {
  data: {
    type: string;
    order: {
      uuid: string;
      status: OrderStatus;
      source: string;
    };
    payment: {
      id: number;
      authorizationCode?: string;
      refNumber?: string;
      status: PaymentStatus;
    };
  };
}
