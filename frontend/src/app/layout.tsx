import type { Metadata } from 'next';
import '../styles/globals.css';
import AppChrome from '../components/layout/AppChrome';

export const metadata: Metadata = {
  title: {
    template: '%s | artpop',
    default: 'artpop | Marketplace de Artesanato',
  },
  description: 'Marketplace da economia criativa de Pernambuco.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><AppChrome>{children}</AppChrome></body></html>;
}