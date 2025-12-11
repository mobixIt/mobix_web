import {
  LOCAL_MULTI_TENANT_DOMAIN,
  STAGING_DOMAIN,
  PRODUCTION_DOMAIN,
  LOCALHOST_WITH_PORT,
} from '@/config/domains';

export function getBaseDomain() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;

  switch (env) {
    case 'development': {
      const useNgrok = process.env.NEXT_PUBLIC_USE_NGROK === 'true';

      if (useNgrok) {
        return LOCAL_MULTI_TENANT_DOMAIN;
      }

      return LOCALHOST_WITH_PORT;
    }

    case 'test':
      return LOCALHOST_WITH_PORT;

    case 'staging':
      return STAGING_DOMAIN;

    case 'production':
      return PRODUCTION_DOMAIN;

    default:
      return LOCALHOST_WITH_PORT;
  }
}
