'use client';

import { usePathname } from 'next/navigation';
import SiteFooter from './SiteFooter';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';
  return <>{children}{!isAuthPage && <SiteFooter />}</>;
}