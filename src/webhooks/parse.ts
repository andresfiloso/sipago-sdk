import { SipagoValidationError } from '../errors/sipago-error.js';
import type { WebhookApiPayload, WebhookPayload } from './types.js';
import { OrderStatus, PaymentStatus } from '../orders/constants.js';
import type { OrderStatus as OrderStatusType, PaymentStatus as PaymentStatusType } from '../orders/constants.js';

const ORDER_STATUSES = new Set<string>(Object.values(OrderStatus));
const PAYMENT_STATUSES = new Set<string>(Object.values(PaymentStatus));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isOrderStatus(value: unknown): value is OrderStatusType {
  return typeof value === 'string' && ORDER_STATUSES.has(value);
}

export function isPaymentStatus(value: unknown): value is PaymentStatusType {
  return typeof value === 'string' && PAYMENT_STATUSES.has(value);
}

export function isWebhookPayload(value: unknown): value is WebhookPayload {
  if (!isRecord(value) || !isRecord(value.data)) {
    return false;
  }

  const { data } = value;

  if (data.type !== 'Payment') {
    return false;
  }

  if (!isRecord(data.order) || !isRecord(data.payment)) {
    return false;
  }

  return (
    typeof data.order.uuid === 'string' &&
    isOrderStatus(data.order.status) &&
    typeof data.order.source === 'string' &&
    typeof data.payment.id === 'number' &&
    isPaymentStatus(data.payment.status)
  );
}

export function parseWebhookPayload(body: unknown): WebhookPayload {
  if (!isRecord(body) || !isRecord(body.data)) {
    throw new SipagoValidationError('Invalid webhook payload: missing data object');
  }

  const raw = body as unknown as WebhookApiPayload;

  if (raw.data.type !== 'Payment') {
    throw new SipagoValidationError(`Unexpected webhook type: ${String(raw.data.type)}`);
  }

  const payload: WebhookPayload = {
    data: {
      type: 'Payment',
      order: {
        uuid: raw.data.order.uuid,
        status: raw.data.order.status,
        source: raw.data.order.source,
      },
      payment: {
        id: raw.data.payment.id,
        authorizationCode: raw.data.payment.authorizationCode,
        refNumber: raw.data.payment.refNumber,
        status: raw.data.payment.status,
      },
    },
  };

  if (!isWebhookPayload(payload)) {
    throw new SipagoValidationError('Invalid webhook payload structure');
  }

  return payload;
}
