import type { CurrencyCode, Price } from '../types/common.js';
import type { OrderStatus, PaymentStatus } from './constants.js';

export interface RedirectUrls {
  success?: string;
  failed?: string;
}

export interface OrderItemInput {
  id?: number | string;
  name: string;
  unitPrice: Price;
  quantity: number;
}

export interface ShippingInput {
  name?: string;
  price: Price;
}

export interface CreateOrderInput {
  currency: CurrencyCode;
  items: OrderItemInput[];
  redirectUrls?: RedirectUrls;
  shipping?: ShippingInput;
  webhookUrl?: string;
  expireLimitMinutes?: number;
}

export interface OrderItem {
  id?: number | string | null;
  name: string;
  quantity: number;
  unitPrice: Price;
}

export interface OrderPayment {
  id: number;
  authorizationCode?: string;
  referenceNumber?: string;
  status: PaymentStatus;
}

export interface OrderLinks {
  checkout: string;
  redirectUrl?: RedirectUrls;
}

export interface Order {
  id: string;
  uuid: string;
  type: string;
  source?: string;
  appId?: string;
  paymentLimits?: number;
  orderNumber?: string;
  price: Price;
  shipping: ShippingInput | null;
  items: OrderItem[];
  status: OrderStatus;
  taxes: unknown[];
  links: OrderLinks;
  checkoutUrl: string;
  hasPendingPayment?: boolean;
  payment?: OrderPayment;
  payments?: OrderPayment[];
}

/** Internal API request shape (JSON:API) */
export interface CreateOrderApiAttributes {
  currency: CurrencyCode;
  items: Array<{
    id?: number | string;
    name: string;
    unitPrice: Price;
    quantity: number;
  }>;
  redirect_urls?: RedirectUrls;
  shipping?: ShippingInput;
  webhookUrl?: string;
  expireLimitMinutes?: number;
}

/** Internal API response attributes */
export interface OrderApiAttributes {
  uuid: string;
  source?: string;
  appId?: string;
  paymentLimits?: number;
  orderNumber?: string;
  price: Price;
  shipping: ShippingInput | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: Price;
    itemId?: number | string | null;
    id?: number | string | null;
  }>;
  status: OrderStatus;
  taxes: unknown[];
  links?: OrderLinks;
  hasPendingPayment?: boolean;
  payment?: {
    id: number;
    authorization_code?: string;
    reference_number?: string;
    status: PaymentStatus;
  };
  payments?: Array<{
    id: number;
    authorization_code?: string;
    reference_number?: string;
    status: PaymentStatus;
  }>;
}

export interface OrderApiResponse {
  data: {
    id: string;
    type: string;
    attributes: OrderApiAttributes;
    links?: Array<{
      checkout?: string;
      redirect_url?: RedirectUrls;
    }>;
  };
}
