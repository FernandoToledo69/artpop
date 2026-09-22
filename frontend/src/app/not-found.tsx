import type { Metadata } from "next";
import SiteHeader from '../components/layout/SiteHeader';

export const metadata: Metadata = {
  title: "Página não encontrada | artpop",
};

export default function NotFound() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <section style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        padding: '60px 20px', 
        minHeight: '60vh' 
      }}>
        <img 
          src="/cacto.png" 
          alt="Cacto sobre fundo amarelo" 
          style={{ 
            width: '280px', 
            height: '280px', 
            objectFit: 'cover', 
            marginBottom: '24px', 
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }} 
        />
        <h1 style={{ 
          fontSize: '24px', 
          color: '#1a1a1a', 
          marginBottom: '16px', 
          fontFamily: "'Museo', 'Museo Sans', 'DM Sans', sans-serif",
          maxWidth: '600px',
          lineHeight: '1.4'
        }}>
          Tem nada aqui não, amore. Acho que você está inventando coisas.
        </h1>
        <a href="/" className="catalog-action" style={{ marginTop: '24px', display: 'inline-block' }}>
          Voltar para a página inicial
        </a>
      </section>
    </main>
  );
}

