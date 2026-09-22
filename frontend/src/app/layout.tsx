import '../styles/globals.css';

export const metadata = { title: 'Anunciar obra | artpop', description: 'Publique uma nova obra no marketplace artpop.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}