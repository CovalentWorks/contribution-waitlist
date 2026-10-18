import { z } from 'zod';
import { withDatabase, rows } from '@/lib/database';
import { handleError, HttpError, json, readJson, requireAdmin, requireSameOrigin } from '@/lib/security';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
 try {
   await requireAdmin();
   const url = new URL(request.url);
   const query = (url.searchParams.get('q') || '').slice(0, 254);
   const page = Math.max(1, Math.min(100000, Math.floor(Number(url.searchParams.get('page'))) || 1));
   const csv = url.searchParams.get('format') === 'csv';
   const result = await withDatabase(db => {
     const total = rows<{ total: number }>(db, 'SELECT COUNT(*) AS total FROM subscribers')[0].total;
     const filtered = rows<{ total: number }>(db, 'SELECT COUNT(*) AS total FROM subscribers WHERE email LIKE ?', ['%' + query + '%'])[0].total;
     const sent = rows<{ total: number }>(db, "SELECT COUNT(*) AS total FROM outbox WHERE state='sent'")[0].total;
     const recent = rows<{ total: number }>(db, 'SELECT COUNT(*) AS total FROM subscribers WHERE created_at > ?', [Date.now() - 7 * 86400000])[0].total;
     const signups = rows<Record<string, string | number>>(db, `SELECT s.id,s.email,s.interest,s.purpose,s.created_at,o.state AS email_status,o.attempts,o.last_error FROM subscribers s JOIN outbox o ON s.id=o.subscriber_id WHERE s.email LIKE ? ORDER BY s.created_at DESC LIMIT ? OFFSET ?`, ['%' + query + '%', csv ? 100000 : 25, csv ? 0 : (page - 1) * 25]);
     return { total, filtered, sent, recent, pending: total - sent, signups, page, pages: Math.max(1, Math.ceil(filtered / 25)) };
   }, false);
   if (!csv) return json(result);
   const cell = (value: unknown) => '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, c => "'" + c).replace(/"/g, '""') + '"';
   const content = ['Email,Group,Contribution purpose,Joined,Welcome email,Attempts', ...result.signups.map(s => [s.email, s.interest, s.purpose, new Date(s.created_at).toISOString(), s.email_status, s.attempts].map(cell).join(','))].join('\r\n');
   return new Response('\uFEFF' + content, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="waitlist-signups.csv"', 'Cache-Control': 'private, no-store' } });
 } catch (error) { return handleError(error); }
}
export async function DELETE(request: Request) {
 try {
   requireSameOrigin(request); await requireAdmin();
   const body = z.object({ id: z.uuid() }).safeParse(await readJson(request));
   if (!body.success) throw new HttpError(400, 'Invalid signup.');
   await withDatabase(db => { db.run('DELETE FROM subscribers WHERE id=?', [body.data.id]); });
   return json({ ok: true });
 } catch (error) { return handleError(error); }
}
