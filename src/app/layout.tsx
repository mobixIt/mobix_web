import './globals.css';
import ThemeRegistry from '../components/ThemeRegistry';
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from 'next';

import { Inter, Poppins, Montserrat } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });
export const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'Gema App',
  description: 'Gestión de movilidad',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} ${poppins.className} ${montserrat.className}`}>
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}