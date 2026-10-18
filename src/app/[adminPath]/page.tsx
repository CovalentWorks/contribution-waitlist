import { notFound } from 'next/navigation';
import { isAdminPath } from '@/lib/admin-route';
import type { Metadata } from 'next';
import { adminSession } from '@/lib/security';
import { AdminLogin } from '@/components/admin-login';
import { AdminDashboard } from '@/components/admin-dashboard';
import { brand } from '@/config';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: `${brand.name} | Admin`, robots: { index: false, follow: false } };
export default async function AdminPage({ params }: { params: Promise<{ adminPath: string }> }) {
 const { adminPath } = await params;
 if (!isAdminPath(adminPath)) notFound();
 const session = await adminSession();
 return session ? <AdminDashboard email={session.email} adminPath={adminPath} /> : <AdminLogin />;
}
