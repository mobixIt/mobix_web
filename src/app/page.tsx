'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');
    const now = Math.floor(Date.now() / 1000);

    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);
}