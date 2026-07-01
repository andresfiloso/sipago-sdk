export class SipagoError extends Error {
  override name = 'SipagoError';
}

export class SipagoValidationError extends SipagoError {
  override name = 'SipagoValidationError';
}
