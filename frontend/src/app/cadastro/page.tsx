import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro",
};

import SiteHeader from '../../components/layout/SiteHeader';

export default function CadastroPage() { return <main className="page-shell"><SiteHeader /></main>; }
