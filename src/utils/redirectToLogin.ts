import { resolveBaseHost } from '@/utils/tenantHost';

export function getBaseHost(hostname: string): { host: string; usePort: boolean } {
  return resolveBaseHost(hostname.toLowerCase().trim().split(':')[0]);
}

export function redirectToBaseLogin() {
  if (typeof window === 'undefined') return;

  const { protocol, hostname, port } = window.location;
  const { host, usePort } = getBaseHost(hostname);

  const finalHost = usePort && port ? `${host}:${port}` : host;

  window.location.href = `${protocol}//${finalHost}/login`;
}
