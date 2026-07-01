export type GrantType = 'client_credentials';

export interface TokenRequest {
  grant_type: GrantType;
  client_id: string;
  client_secret: string;
  scope: string;
}

export interface TokenResponse {
  token_type: string;
  expires_in: string | number;
  access_token: string;
  refresh_token?: string;
}

export interface CachedToken {
  accessToken: string;
  expiresAt: number;
}
