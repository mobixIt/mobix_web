export function getBaseDomain() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;

  switch (env) {
    case 'development': {
      const useNgrok = process.env.NEXT_PUBLIC_USE_NGROK === 'true';

      if (useNgrok) {
        return 'local.mobix.fyi';
      }

      return 'localhost:4567';
    }

    case 'test':
      return 'localhost:4567';

    case 'staging':
      return 'mobix.fyi';

    case 'production':
      return 'mobix.lat';

    default:
      return 'localhost:4567';
  }
}