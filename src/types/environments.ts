export type SipagoEnvironment = 'development' | 'production';

export interface EnvironmentUrls {
  checkout: string;
  auth: string;
}

export const ENVIRONMENT_URLS: Record<SipagoEnvironment, EnvironmentUrls> = {
  development: {
    checkout: 'https://api-cabal.preprod.geopagos.com',
    auth: 'https://auth.stg.geopagos.io',
  },
  production: {
    checkout: 'https://api.sipago.coop',
    auth: 'https://auth.prd.geopagos.io',
  },
};
