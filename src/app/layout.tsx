import './globals.css';
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import type { Metadata } from 'next';
import { Inter, Poppins, Montserrat } from 'next/font/google';
import { ClientProviders } from '@/providers/ClientProviders';

export const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });
export const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'Gema App',
  description: 'Gestión de movilidad',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.className} ${poppins.className} ${montserrat.className}`}
    >
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
