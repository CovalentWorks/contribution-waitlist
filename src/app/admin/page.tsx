import type { Metadata } from 'next';
import { adminSession } from '@/lib/security';
import { AdminLogin } from '@/components/admin-login';
import { AdminDashboard } from '@/components/admin-dashboard';
import { brand } from '@/config';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: `${brand.name} | Admin`, robots: { index: false, follow: false } };
export default async function AdminPage() {
 const session = await adminSession();
 return session ? <AdminDashboard email={session.email} /> : <AdminLogin />;
}
