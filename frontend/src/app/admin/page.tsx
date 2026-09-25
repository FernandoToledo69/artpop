import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Administrativo",
};

import SiteHeader from '../../components/layout/SiteHeader';
import AdminDashboard from '../../components/admin/AdminDashboard';

export default function AdminPage() { return <AdminDashboard />; }
