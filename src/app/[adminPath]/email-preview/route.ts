import { isAdminPath } from '@/lib/admin-route';
import { welcomeEmail } from '@/lib/email-template';
import { handleError, requireAdmin, siteUrl } from '@/lib/security';
export async function GET(_request: Request, { params }: { params: Promise<{ adminPath: string }> }) {
 if (!isAdminPath((await params).adminPath)) return new Response(null, { status: 404 });
 try {
   await requireAdmin();
   return new Response(welcomeEmail(siteUrl(), 'preview').html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } });
 } catch (error) { return handleError(error); }
}
