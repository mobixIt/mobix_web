import { SessionProvider } from '@/providers/SessionProvider';

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}