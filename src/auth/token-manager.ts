import { SipagoAuthError } from '../errors/auth-error.js';
import { SipagoApiError } from '../errors/api-error.js';
import { AuthClient } from './auth-client.js';
import type { CachedToken } from './types.js';

const EXPIRY_BUFFER_MS = 60_000;

function parseExpiresIn(expiresIn: string | number): number {
  const seconds = typeof expiresIn === 'string' ? parseInt(expiresIn, 10) : expiresIn;
  return seconds * 1000;
}

export class TokenManager {
  private cachedToken: CachedToken | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(private readonly authClient: AuthClient) {}

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - EXPIRY_BUFFER_MS) {
      return this.cachedToken.accessToken;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  clearCache(): void {
    this.cachedToken = null;
    this.refreshPromise = null;
  }

  private async refreshToken(): Promise<string> {
    try {
      const response = await this.authClient.requestToken();

      this.cachedToken = {
        accessToken: response.access_token,
        expiresAt: Date.now() + parseExpiresIn(response.expires_in),
      };

      return this.cachedToken.accessToken;
    } catch (error) {
      this.cachedToken = null;

      if (error instanceof SipagoApiError) {
        throw new SipagoAuthError(error.message, error.status, error.body);
      }

      throw error;
    }
  }
}
