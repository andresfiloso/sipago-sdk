import { ENVIRONMENT_URLS } from './types/environments.js';
import type { SipagoEnvironment } from './types/environments.js';

export type FetchFn = typeof fetch;

export interface SipagoConfig {
  clientId: string;
  clientSecret: string;
  environment: SipagoEnvironment;
  /** Override auth server base URL */
  authBaseUrl?: string;
  /** Override checkout API base URL */
  checkoutBaseUrl?: string;
  /** Custom fetch implementation (defaults to global fetch) */
  fetch?: FetchFn;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
}

export interface ResolvedSipagoConfig {
  clientId: string;
  clientSecret: string;
  environment: SipagoEnvironment;
  authBaseUrl: string;
  checkoutBaseUrl: string;
  fetch: FetchFn;
  timeoutMs: number;
}

export function resolveConfig(config: SipagoConfig): ResolvedSipagoConfig {
  const urls = ENVIRONMENT_URLS[config.environment];

  return {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    environment: config.environment,
    authBaseUrl: config.authBaseUrl ?? urls.auth,
    checkoutBaseUrl: config.checkoutBaseUrl ?? urls.checkout,
    fetch: config.fetch ?? globalThis.fetch,
    timeoutMs: config.timeoutMs ?? 30_000,
  };
}
