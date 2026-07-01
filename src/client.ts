import { resolveConfig, type SipagoConfig } from './config.js';
import { AuthClient } from './auth/auth-client.js';
import { TokenManager } from './auth/token-manager.js';
import { OrdersClient } from './orders/orders-client.js';

export class SipagoClient {
  readonly orders: OrdersClient;
  private readonly tokenManager: TokenManager;

  constructor(config: SipagoConfig) {
    const resolved = resolveConfig(config);
    const authClient = new AuthClient(resolved);
    this.tokenManager = new TokenManager(authClient);
    this.orders = new OrdersClient(resolved, this.tokenManager);
  }

  /** Clears the cached access token, forcing a refresh on the next request. */
  clearTokenCache(): void {
    this.tokenManager.clearCache();
  }
}
