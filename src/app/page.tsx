'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');
    const nowMs = Date.now();

    if (expiresAtStr) {
      const expiresAtMs = parseInt(expiresAtStr, 10);
      if (!Number.isNaN(expiresAtMs) && nowMs < expiresAtMs) {
        router.push('/dashboard');
        return;
      }
    }

    router.push('/login');
  }, [router]);

  return null;
}
