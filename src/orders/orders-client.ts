import { SipagoValidationError } from '../errors/sipago-error.js';
import { HttpClient } from '../http/http-client.js';
import type { ResolvedSipagoConfig } from '../config.js';
import type { TokenManager } from '../auth/token-manager.js';
import type {
  CreateOrderInput,
  CreateOrderApiAttributes,
  Order,
  OrderApiResponse,
  OrderPayment,
} from './types.js';
import type { JsonApiEnvelope } from '../types/common.js';

const HTTPS_URL_PATTERN = /^https:\/\//i;
const MAX_WEBHOOK_URL_LENGTH = 255;

function assertHttpsUrl(url: string, field: string): void {
  if (!HTTPS_URL_PATTERN.test(url)) {
    throw new SipagoValidationError(`${field} must use HTTPS protocol`);
  }
}

function assertIntegerAmount(amount: number, field: string): void {
  if (!Number.isInteger(amount)) {
    throw new SipagoValidationError(`${field} must be an integer (minor units)`);
  }
}

function validateCreateOrderInput(input: CreateOrderInput): void {
  if (!input.items.length) {
    throw new SipagoValidationError('items must contain at least one item');
  }

  if (input.redirectUrls?.success) {
    assertHttpsUrl(input.redirectUrls.success, 'redirectUrls.success');
  }

  if (input.redirectUrls?.failed) {
    assertHttpsUrl(input.redirectUrls.failed, 'redirectUrls.failed');
  }

  if (input.webhookUrl) {
    assertHttpsUrl(input.webhookUrl, 'webhookUrl');

    if (input.webhookUrl.length > MAX_WEBHOOK_URL_LENGTH) {
      throw new SipagoValidationError('webhookUrl must be at most 255 characters');
    }
  }

  if (input.shipping?.price) {
    assertIntegerAmount(input.shipping.price.amount, 'shipping.price.amount');
  }

  for (const item of input.items) {
    assertIntegerAmount(item.unitPrice.amount, `item "${item.name}" unitPrice.amount`);
  }
}

function toApiAttributes(input: CreateOrderInput): CreateOrderApiAttributes {
  const attributes: CreateOrderApiAttributes = {
    currency: input.currency,
    items: input.items.map((item) => ({
      ...(item.id !== undefined ? { id: item.id } : {}),
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  };

  if (input.redirectUrls) {
    attributes.redirect_urls = input.redirectUrls;
  }

  if (input.shipping) {
    attributes.shipping = input.shipping;
  }

  if (input.webhookUrl) {
    attributes.webhookUrl = input.webhookUrl;
  }

  if (input.expireLimitMinutes !== undefined) {
    attributes.expireLimitMinutes = input.expireLimitMinutes;
  }

  return attributes;
}

function normalizePayment(payment: {
  id: number;
  authorization_code?: string;
  reference_number?: string;
  status: OrderPayment['status'];
}): OrderPayment {
  return {
    id: payment.id,
    authorizationCode: payment.authorization_code,
    referenceNumber: payment.reference_number,
    status: payment.status,
  };
}

function normalizeOrder(response: OrderApiResponse): Order {
  const { data } = response;
  const attrs = data.attributes;

  const linksFromAttrs = attrs.links;
  const linksFromData = data.links?.[0];

  const checkout =
    linksFromAttrs?.checkout ??
    linksFromData?.checkout ??
    '';

  const redirectUrl =
    linksFromAttrs?.redirectUrl ??
    linksFromData?.redirect_url;

  return {
    id: data.id,
    uuid: attrs.uuid,
    type: data.type,
    source: attrs.source,
    appId: attrs.appId,
    paymentLimits: attrs.paymentLimits,
    orderNumber: attrs.orderNumber,
    price: attrs.price,
    shipping: attrs.shipping,
    items: attrs.items.map((item) => ({
      id: item.itemId ?? item.id ?? null,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    status: attrs.status,
    taxes: attrs.taxes,
    links: {
      checkout,
      redirectUrl,
    },
    checkoutUrl: checkout,
    hasPendingPayment: attrs.hasPendingPayment,
    payment: attrs.payment ? normalizePayment(attrs.payment) : undefined,
    payments: attrs.payments?.map(normalizePayment),
  };
}

export class OrdersClient {
  private readonly http: HttpClient;

  constructor(
    private readonly config: ResolvedSipagoConfig,
    private readonly tokenManager: TokenManager,
  ) {
    this.http = new HttpClient(config.fetch, config.timeoutMs);
  }

  async create(input: CreateOrderInput): Promise<Order> {
    validateCreateOrderInput(input);

    const token = await this.tokenManager.getAccessToken();
    const url = `${this.config.checkoutBaseUrl}/api/v2/orders`;

    const body: JsonApiEnvelope<CreateOrderApiAttributes> = {
      data: {
        attributes: toApiAttributes(input),
      },
    };

    const response = await this.http.request<OrderApiResponse>(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json',
      },
      body,
    });

    return normalizeOrder(response);
  }

  async get(uuid: string): Promise<Order> {
    const token = await this.tokenManager.getAccessToken();
    const url = `${this.config.checkoutBaseUrl}/api/v2/orders/${uuid}`;

    const response = await this.http.request<OrderApiResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json',
      },
    });

    return normalizeOrder(response);
  }
}
