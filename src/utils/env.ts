export function getBaseDomain() {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;

  switch (env) {
    case 'development':
    case 'test':
      return 'local.mobix.fyi';

    case 'staging':
      return 'mobix.fyi';

    case 'production':
      return 'mobix.lat';

    default:
      return 'local.mobix.fyi';
  }
}