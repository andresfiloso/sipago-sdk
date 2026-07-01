import { SipagoAuthError } from '../errors/auth-error.js';
import { SipagoApiError } from '../errors/api-error.js';
import { HttpClient } from '../http/http-client.js';
import type { ResolvedSipagoConfig } from '../config.js';
import type { TokenResponse } from './types.js';

export class AuthClient {
  private readonly http: HttpClient;

  constructor(private readonly config: ResolvedSipagoConfig) {
    this.http = new HttpClient(config.fetch, config.timeoutMs);
  }

  async requestToken(): Promise<TokenResponse> {
    const url = `${this.config.authBaseUrl}/oauth/token`;

    try {
      return await this.http.request<TokenResponse>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: '*',
        },
      });
    } catch (error) {
      if (error instanceof SipagoApiError) {
        throw new SipagoAuthError(error.message, error.status, error.body);
      }

      throw error;
    }
  }
}
