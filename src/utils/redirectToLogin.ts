export function getBaseHost(hostname: string): { host: string; usePort: boolean } {
  // LOCAL multi-tenant: <tenant>.local.mobix.fyi → www.local.mobix.fyi
  if (hostname.endsWith('.local.mobix.fyi')) {
    return { host: 'www.local.mobix.fyi', usePort: false };
  }

  // LOCALHOST (dev simple)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return { host: hostname, usePort: true };
  }

  if (hostname.endsWith('.localhost')) {
    return { host: 'localhost', usePort: true };
  }

  // STAGING multi-tenant
  if (hostname.endsWith('.mobix.fyi')) {
    return { host: 'www.mobix.fyi', usePort: false };
  }

  // PROD multi-tenant
  if (hostname.endsWith('.mobix.lat')) {
    return { host: 'www.mobix.lat', usePort: false };
  }

  return { host: hostname, usePort: false };
}

export function redirectToBaseLogin() {
  if (typeof window === 'undefined') return;

  const { protocol, hostname, port } = window.location;
  const { host, usePort } = getBaseHost(hostname);

  const finalHost = usePort && port ? `${host}:${port}` : host;

  window.location.href = `${protocol}//${finalHost}/login`;
}
