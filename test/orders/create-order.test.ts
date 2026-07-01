import { SipagoClient } from '../../src/client';
import { SipagoValidationError } from '../../src/errors/sipago-error';
import { toMinorUnits } from '../../src/utils/money';

function mockTokenFetch(): typeof fetch {
  return jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/oauth/token')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            token_type: 'Bearer',
            expires_in: 3600,
            access_token: 'test-token',
          }),
          { status: 200 },
        ),
      );
    }
    return Promise.resolve(new Response('{}', { status: 404 }));
  }) as typeof fetch;
}

function createOrderResponse() {
  return {
    data: {
      id: '/api/v2/orders/order-uuid-123',
      type: 'Order',
      attributes: {
        uuid: 'order-uuid-123',
        price: { currency: '032', amount: 1000 },
        shipping: null,
        items: [
          {
            name: 'Product',
            quantity: 1,
            unitPrice: { currency: '032', amount: 1000 },
            itemId: 31,
          },
        ],
        status: 'PENDING',
        taxes: [],
        links: {
          checkout: 'https://checkout.example.com/orders/order-uuid-123',
        },
      },
    },
  };
}

describe('OrdersClient.create', () => {
  const baseConfig = {
    clientId: 'test-id',
    clientSecret: 'test-secret',
    environment: 'development' as const,
  };

  it('creates an order with correct payload and headers', async () => {
    let capturedBody: unknown;
    let capturedHeaders: HeadersInit | undefined;

    const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/oauth/token')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ token_type: 'Bearer', expires_in: 3600, access_token: 'test-token' }),
            { status: 200 },
          ),
        );
      }

      if (url.includes('/api/v2/orders') && init?.method === 'POST') {
        capturedBody = JSON.parse(init.body as string);
        capturedHeaders = init.headers;
        return Promise.resolve(new Response(JSON.stringify(createOrderResponse()), { status: 200 }));
      }

      return Promise.resolve(new Response('{}', { status: 404 }));
    }) as typeof fetch;

    const client = new SipagoClient({ ...baseConfig, fetch: fetchMock });

    const order = await client.orders.create({
      currency: '032',
      items: [
        {
          id: 31,
          name: 'Product',
          quantity: 1,
          unitPrice: { currency: '032', amount: toMinorUnits(10) },
        },
      ],
      redirectUrls: {
        success: 'https://shop.com/success',
        failed: 'https://shop.com/failed',
      },
      webhookUrl: 'https://shop.com/webhook',
      expireLimitMinutes: 10,
    });

    expect(capturedBody).toEqual({
      data: {
        attributes: {
          currency: '032',
          items: [
            {
              id: 31,
              name: 'Product',
              quantity: 1,
              unitPrice: { currency: '032', amount: 1000 },
            },
          ],
          redirect_urls: {
            success: 'https://shop.com/success',
            failed: 'https://shop.com/failed',
          },
          webhookUrl: 'https://shop.com/webhook',
          expireLimitMinutes: 10,
        },
      },
    });

    expect(capturedHeaders).toMatchObject({
      Authorization: 'Bearer test-token',
      'Content-Type': 'application/vnd.api+json',
    });

    expect(order.uuid).toBe('order-uuid-123');
    expect(order.checkoutUrl).toBe('https://checkout.example.com/orders/order-uuid-123');
    expect(order.status).toBe('PENDING');
  });

  it('validates HTTPS redirect URLs', async () => {
    const client = new SipagoClient({ ...baseConfig, fetch: mockTokenFetch() });

    await expect(
      client.orders.create({
        currency: '032',
        items: [{ name: 'Product', quantity: 1, unitPrice: { currency: '032', amount: 1000 } }],
        redirectUrls: { success: 'http://insecure.com' },
      }),
    ).rejects.toThrow(SipagoValidationError);
  });

  it('validates non-empty items', async () => {
    const client = new SipagoClient({ ...baseConfig, fetch: mockTokenFetch() });

    await expect(
      client.orders.create({
        currency: '032',
        items: [],
      }),
    ).rejects.toThrow(SipagoValidationError);
  });

  it('maps API errors to SipagoApiError', async () => {
    const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/oauth/token')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ token_type: 'Bearer', expires_in: 3600, access_token: 'test-token' }),
            { status: 200 },
          ),
        );
      }

      if (url.includes('/api/v2/orders')) {
        return Promise.resolve(
          new Response(JSON.stringify({ errors: [{ detail: 'Invalid request' }] }), { status: 422 }),
        );
      }

      return Promise.resolve(new Response('{}', { status: 404 }));
    }) as typeof fetch;

    const client = new SipagoClient({ ...baseConfig, fetch: fetchMock });

    await expect(
      client.orders.create({
        currency: '032',
        items: [{ name: 'Product', quantity: 1, unitPrice: { currency: '032', amount: 1000 } }],
      }),
    ).rejects.toMatchObject({ name: 'SipagoApiError', status: 422 });
  });
});
