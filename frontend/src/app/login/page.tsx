import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

import SiteHeader from '../../components/layout/SiteHeader';

export default function LoginPage() { return <main className="page-shell"><SiteHeader /></main>; }
