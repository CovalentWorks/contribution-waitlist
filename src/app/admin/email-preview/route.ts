import { welcomeEmail } from '@/lib/email-template';
import { handleError, requireAdmin, siteUrl } from '@/lib/security';
export async function GET() {
 try {
   await requireAdmin();
   return new Response(welcomeEmail(siteUrl(), 'preview').html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' } });
 } catch (error) { return handleError(error); }
}
