import { SipagoClient } from '../../src/client';

describe('OrdersClient.get', () => {
  const baseConfig = {
    clientId: 'test-id',
    clientSecret: 'test-secret',
    environment: 'development' as const,
  };

  it('fetches and normalizes order response', async () => {
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

      if (url.includes('/api/v2/orders/order-uuid-456')) {
        expect(init?.method).toBe('GET');
        expect(init?.headers).toMatchObject({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/vnd.api+json',
        });

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                id: '/api/v2/orders/order-uuid-456',
                type: 'Order',
                attributes: {
                  uuid: 'order-uuid-456',
                  source: 'api_checkout',
                  appId: 'SiPago',
                  paymentLimits: 1,
                  orderNumber: '00000001-0000000012',
                  price: { currency: '032', amount: 4200 },
                  shipping: null,
                  items: [
                    {
                      name: 'Chair',
                      quantity: 1,
                      unitPrice: { currency: '032', amount: 4200 },
                      itemId: null,
                    },
                  ],
                  status: 'SUCCESS',
                  taxes: [],
                  links: {
                    checkout: 'https://checkout.example.com/orders/order-uuid-456',
                    redirect_url: { success: null, failed: null },
                  },
                  hasPendingPayment: false,
                  payment: {
                    id: 123,
                    authorization_code: '012345',
                    reference_number: '62d6c4784212b',
                    status: 'APPROVED',
                  },
                  payments: [
                    {
                      id: 123,
                      authorization_code: '012345',
                      reference_number: '62d6c4784212b',
                      status: 'APPROVED',
                    },
                  ],
                },
              },
            }),
            { status: 200 },
          ),
        );
      }

      return Promise.resolve(new Response('{}', { status: 404 }));
    }) as typeof fetch;

    const client = new SipagoClient({ ...baseConfig, fetch: fetchMock });
    const order = await client.orders.get('order-uuid-456');

    expect(order.uuid).toBe('order-uuid-456');
    expect(order.status).toBe('SUCCESS');
    expect(order.payment).toEqual({
      id: 123,
      authorizationCode: '012345',
      referenceNumber: '62d6c4784212b',
      status: 'APPROVED',
    });
    expect(order.payments?.[0]).toEqual({
      id: 123,
      authorizationCode: '012345',
      referenceNumber: '62d6c4784212b',
      status: 'APPROVED',
    });
    expect(order.checkoutUrl).toBe('https://checkout.example.com/orders/order-uuid-456');
  });
});
