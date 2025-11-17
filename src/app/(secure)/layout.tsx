import * as React from 'react';
import { SessionProvider } from '@/providers/SessionProvider';
import { SecureContent } from '@/components/layout/secure/SecureContent';

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SecureContent>{children}</SecureContent>
    </SessionProvider>
  );
}