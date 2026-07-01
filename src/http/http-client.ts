import { SipagoApiError } from '../errors/api-error.js';
import type { FetchFn } from '../config.js';

export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export class HttpClient {
  constructor(
    private readonly fetchFn: FetchFn,
    private readonly defaultTimeoutMs: number,
  ) {}

  async request<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, timeoutMs = this.defaultTimeoutMs } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const responseText = await response.text();
      let parsedBody: unknown;

      if (responseText) {
        try {
          parsedBody = JSON.parse(responseText);
        } catch {
          parsedBody = responseText;
        }
      }

      if (!response.ok) {
        throw new SipagoApiError(
          `Request failed with status ${response.status}`,
          response.status,
          parsedBody,
        );
      }

      return parsedBody as T;
    } catch (error) {
      if (error instanceof SipagoApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new SipagoApiError('Request timed out', 408);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
