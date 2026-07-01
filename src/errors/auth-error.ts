import { SipagoError } from './sipago-error.js';

export class SipagoAuthError extends SipagoError {
  override name = 'SipagoAuthError';

  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
  }
}
