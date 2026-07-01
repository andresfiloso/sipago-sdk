import { SipagoError } from './sipago-error.js';

export class SipagoApiError extends SipagoError {
  override name = 'SipagoApiError';

  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
  }
}
