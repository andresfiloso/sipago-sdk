# sipago-sdk

TypeScript SDK for the [SiPago Checkout API](https://docs.sipago.coop/docs/). Zero runtime dependencies. Works with Node.js 18+.

## Features

- OAuth 2.0 client credentials flow with automatic token caching
- Create payment intents and get checkout URLs
- Query order status by UUID
- Shipping, redirect URLs, webhooks, and custom expiration
- Webhook payload types and parsing helpers
- Full TypeScript types
- Dual CJS + ESM builds

## Installation

```bash
npm install sipago-sdk
# or
pnpm add sipago-sdk
```

**Requirements:** Node.js 18 or later (uses native `fetch`).

## Quick start

```typescript
import { SipagoClient, toMinorUnits, Currency, OrderStatus, PaymentStatus } from 'sipago-sdk';

const client = new SipagoClient({
  clientId: process.env.SIPAGO_CLIENT_ID!,
  clientSecret: process.env.SIPAGO_CLIENT_SECRET!,
  environment: 'development', // or 'production'
});

const order = await client.orders.create({
  currency: Currency.ARS,
  items: [
    {
      id: 31,
      name: 'Product name',
      quantity: 1,
      unitPrice: { currency: Currency.ARS, amount: toMinorUnits(10.0) },
    },
  ],
  redirectUrls: {
    success: 'https://yourshop.com/payment/success',
    failed: 'https://yourshop.com/payment/failed',
  },
  webhookUrl: 'https://yourshop.com/webhooks/sipago',
  expireLimitMinutes: 10,
});

// Redirect the buyer to the checkout page
console.log(order.checkoutUrl);
```

### Check order status

```typescript
const order = await client.orders.get('order-uuid-here');

if (order.status === OrderStatus.SUCCESS && order.payment?.status === PaymentStatus.APPROVED) {
  console.log('Payment approved', order.payment.authorizationCode);
}
```

## Amount format

SiPago amounts are **integers in minor units** (last two digits are cents). For example, `200.69` pesos is sent as `20069`.

```typescript
import { toMinorUnits, fromMinorUnits } from 'sipago-sdk';

toMinorUnits(200.69);  // 20069
fromMinorUnits(20069); // 200.69
```

## Constants

```typescript
import { Currency, OrderStatus, PaymentStatus } from 'sipago-sdk';

Currency.ARS;              // '032' (Argentine Peso, ISO 4217)
OrderStatus.SUCCESS;       // 'SUCCESS'
PaymentStatus.APPROVED;    // 'APPROVED'
```

## Environments

| Environment   | Checkout API                              | Auth Server                    |
|---------------|-------------------------------------------|--------------------------------|
| `development` | `https://api-cabal.preprod.geopagos.com`  | `https://auth.stg.geopagos.io` |
| `production`  | `https://api.sipago.coop`                 | `https://auth.prd.geopagos.io` |

Override base URLs if needed:

```typescript
const client = new SipagoClient({
  clientId: '...',
  clientSecret: '...',
  environment: 'development',
  authBaseUrl: 'https://custom-auth.example.com',
  checkoutBaseUrl: 'https://custom-checkout.example.com',
});
```

Development credentials are available in the [SiPago documentation](https://docs.sipago.coop/docs/API%20Cobros/credencialDev).

## Webhooks

SiPago sends POST requests to your `webhookUrl` when a payment completes. Use the SDK to parse and validate payloads:

```typescript
import { parseWebhookPayload, isWebhookPayload, OrderStatus } from 'sipago-sdk';

// In your HTTP handler
const body = await request.json();

if (isWebhookPayload(body)) {
  const payload = parseWebhookPayload(body);

  if (payload.data.order.status === OrderStatus.SUCCESS) {
    // Fulfill the order
  }
}
```

**Order statuses:** `OrderStatus.PENDING`, `OrderStatus.EXPIRED`, `OrderStatus.FAILED_CHECKOUT`, `OrderStatus.FAILED`, `OrderStatus.SUCCESS`

**Payment statuses:** `PaymentStatus.APPROVED`, `PaymentStatus.DENIED`

SiPago retries webhook delivery up to 4 times over ~2 minutes. Design your handler to be idempotent.

> Webhook signature verification is not documented by SiPago and is not included in this SDK.

## Advanced order options

### Shipping

```typescript
await client.orders.create({
  currency: Currency.ARS,
  items: [/* ... */],
  shipping: {
    name: 'Standard shipping',
    price: { currency: Currency.ARS, amount: toMinorUnits(6.01) },
  },
});
```

### Custom expiration

```typescript
await client.orders.create({
  currency: Currency.ARS,
  items: [/* ... */],
  expireLimitMinutes: 14400, // 10 days
});
```

> If a payment expires, SiPago will **not** call your webhook.

## Error handling

```typescript
import {
  SipagoApiError,
  SipagoAuthError,
  SipagoValidationError,
} from 'sipago-sdk';

try {
  await client.orders.create({ /* ... */ });
} catch (error) {
  if (error instanceof SipagoValidationError) {
    // Invalid input (e.g. non-HTTPS redirect URL)
  } else if (error instanceof SipagoAuthError) {
    // Invalid credentials
  } else if (error instanceof SipagoApiError) {
    console.error(error.status, error.body);
  }
}
```

## Configuration reference

| Option            | Type                              | Required | Description                          |
|-------------------|-----------------------------------|----------|--------------------------------------|
| `clientId`        | `string`                          | Yes      | Application public key               |
| `clientSecret`    | `string`                          | Yes      | Application secret key               |
| `environment`     | `'development' \| 'production'`   | Yes      | API environment                      |
| `authBaseUrl`     | `string`                          | No       | Override auth server URL             |
| `checkoutBaseUrl` | `string`                          | No       | Override checkout API URL            |
| `fetch`           | `typeof fetch`                    | No       | Custom fetch (testing, proxies)      |
| `timeoutMs`       | `number`                          | No       | Request timeout (default: 30000)     |

## Testing with a custom fetch

Inject a mock `fetch` for unit tests without external HTTP calls:

```typescript
const client = new SipagoClient({
  clientId: 'test',
  clientSecret: 'test',
  environment: 'development',
  fetch: async (url, init) => {
    // return a mocked Response
  },
});
```

## License

MIT
