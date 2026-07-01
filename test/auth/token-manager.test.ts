import { TokenManager } from '../../src/auth/token-manager';
import { AuthClient } from '../../src/auth/auth-client';
import type { ResolvedSipagoConfig } from '../../src/config';
import type { TokenResponse } from '../../src/auth/types';

function createMockConfig(fetchFn: typeof fetch): ResolvedSipagoConfig {
  return {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    environment: 'development',
    authBaseUrl: 'https://auth.stg.geopagos.io',
    checkoutBaseUrl: 'https://api-cabal.preprod.geopagos.com',
    fetch: fetchFn,
    timeoutMs: 5000,
  };
}

function mockTokenResponse(overrides: Partial<TokenResponse> = {}): TokenResponse {
  return {
    token_type: 'Bearer',
    expires_in: 3600,
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    ...overrides,
  };
}

function createFetchMock(handler: (url: string, init?: RequestInit) => Response | Promise<Response>): typeof fetch {
  return jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    return Promise.resolve(handler(url, init));
  }) as typeof fetch;
}

describe('TokenManager', () => {
  it('caches the access token and reuses it', async () => {
    const fetchMock = createFetchMock((url) => {
      expect(url).toBe('https://auth.stg.geopagos.io/oauth/token');
      return new Response(JSON.stringify(mockTokenResponse()), { status: 200 });
    });

    const config = createMockConfig(fetchMock);
    const authClient = new AuthClient(config);
    const tokenManager = new TokenManager(authClient);

    const token1 = await tokenManager.getAccessToken();
    const token2 = await tokenManager.getAccessToken();

    expect(token1).toBe('test-access-token');
    expect(token2).toBe('test-access-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('parses expires_in as string', async () => {
    const fetchMock = createFetchMock(() =>
      new Response(JSON.stringify(mockTokenResponse({ expires_in: '3600' })), { status: 200 }),
    );

    const config = createMockConfig(fetchMock);
    const tokenManager = new TokenManager(new AuthClient(config));

    const token = await tokenManager.getAccessToken();
    expect(token).toBe('test-access-token');
  });

  it('refreshes token when cache is cleared', async () => {
    let callCount = 0;
    const fetchMock = createFetchMock(() => {
      callCount += 1;
      return new Response(
        JSON.stringify(mockTokenResponse({ access_token: `token-${callCount}` })),
        { status: 200 },
      );
    });

    const config = createMockConfig(fetchMock);
    const tokenManager = new TokenManager(new AuthClient(config));

    const token1 = await tokenManager.getAccessToken();
    tokenManager.clearCache();
    const token2 = await tokenManager.getAccessToken();

    expect(token1).toBe('token-1');
    expect(token2).toBe('token-2');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent refresh requests', async () => {
    let callCount = 0;
    const fetchMock = createFetchMock(() => {
      callCount += 1;
      return new Response(JSON.stringify(mockTokenResponse()), { status: 200 });
    });

    const config = createMockConfig(fetchMock);
    const tokenManager = new TokenManager(new AuthClient(config));
    tokenManager.clearCache();

    const [token1, token2] = await Promise.all([
      tokenManager.getAccessToken(),
      tokenManager.getAccessToken(),
    ]);

    expect(token1).toBe('test-access-token');
    expect(token2).toBe('test-access-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws SipagoAuthError on auth failure', async () => {
    const fetchMock = createFetchMock(() =>
      new Response(JSON.stringify({ error: 'invalid_client' }), { status: 401 }),
    );

    const config = createMockConfig(fetchMock);
    const tokenManager = new TokenManager(new AuthClient(config));

    await expect(tokenManager.getAccessToken()).rejects.toMatchObject({
      name: 'SipagoAuthError',
      status: 401,
    });
  });
});
