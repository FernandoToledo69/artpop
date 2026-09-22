import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Administrativo",
};

import SiteHeader from '../../components/layout/SiteHeader';

export default function AdminPage() { return <main className="page-shell"><SiteHeader /></main>; }
