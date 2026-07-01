import {
  parseWebhookPayload,
  isWebhookPayload,
  isOrderStatus,
  isPaymentStatus,
} from '../../src/webhooks/parse';
import { SipagoValidationError } from '../../src/errors/sipago-error';

const successPayload = {
  data: {
    type: 'Payment',
    order: {
      uuid: 'ea138a99-c9df-44a5-b2bf-09e5db6f8d0c',
      status: 'SUCCESS',
      source: 'app_payment_link',
    },
    payment: {
      id: 1823,
      authorizationCode: '901159',
      refNumber: '62b4a8ff60fee',
      status: 'APPROVED',
    },
  },
};

const deniedPayload = {
  data: {
    type: 'Payment',
    order: {
      uuid: 'bd499ea5-79f8-4f18-b18d-dfbef7987f52',
      status: 'PENDING',
      source: 'api_checkout',
    },
    payment: {
      id: 7364888,
      refNumber: '65df288a484b5',
      status: 'DENIED',
    },
  },
};

describe('webhooks/parse', () => {
  it('parses success webhook payload', () => {
    const payload = parseWebhookPayload(successPayload);

    expect(payload.data.type).toBe('Payment');
    expect(payload.data.order.status).toBe('SUCCESS');
    expect(payload.data.payment.status).toBe('APPROVED');
    expect(payload.data.payment.authorizationCode).toBe('901159');
  });

  it('parses denied webhook payload', () => {
    const payload = parseWebhookPayload(deniedPayload);

    expect(payload.data.order.status).toBe('PENDING');
    expect(payload.data.payment.status).toBe('DENIED');
  });

  it('isWebhookPayload returns true for valid payloads', () => {
    expect(isWebhookPayload(successPayload)).toBe(true);
    expect(isWebhookPayload(deniedPayload)).toBe(true);
  });

  it('isWebhookPayload returns false for invalid payloads', () => {
    expect(isWebhookPayload(null)).toBe(false);
    expect(isWebhookPayload({})).toBe(false);
    expect(isWebhookPayload({ data: { type: 'Order' } })).toBe(false);
  });

  it('throws SipagoValidationError for invalid payload', () => {
    expect(() => parseWebhookPayload({ foo: 'bar' })).toThrow(SipagoValidationError);
    expect(() => parseWebhookPayload({ data: { type: 'Order' } })).toThrow(SipagoValidationError);
  });

  it('validates order and payment status helpers', () => {
    expect(isOrderStatus('SUCCESS')).toBe(true);
    expect(isOrderStatus('INVALID')).toBe(false);
    expect(isPaymentStatus('APPROVED')).toBe(true);
    expect(isPaymentStatus('INVALID')).toBe(false);
  });
});
