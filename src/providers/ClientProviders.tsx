'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ReduxProvider } from '@/store/ReduxProvider';
import ThemeRegistry from '@/components/ThemeRegistry';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <ReduxProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ReduxProvider>
    </ThemeRegistry>
  );
}