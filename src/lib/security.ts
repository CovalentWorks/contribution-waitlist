import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { rows, withDatabase } from './database';

export const allowedAdmins = new Set([
 'chinazorfredrick@gmail.com', 'ugochigere02@gmail.com', 'leslieokoduwa@gmail.com',
]);
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('base64url');
export const cookieName = 'padi_admin';
export function secret() {
 const value = process.env.AUTH_SECRET;
 if (!value || value.length < 32) throw new Error('Authentication not configured');
 return value;
}
export function codeHash(id: string, code: string) { return createHmac('sha256', secret()).update(id + ':' + code).digest('hex'); }
export function passwordMatches(password: string) {
 const stored = process.env.ADMIN_PASSWORD_HASH;
 if (!stored) throw new Error('Admin password is not configured');
 const [salt, expected] = stored.split(':');
 const actual = scryptSync(password, salt, 64);
 const expectedBuffer = Buffer.from(expected || '', 'hex');
 return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}
export function siteUrl() {
 const value = process.env.SITE_URL || (process.env.NODE_ENV !== 'production' ? 'http://localhost:3035' : '');
 if (!value) throw new Error('SITE_URL is not configured');
 return value.replace(/\/$/, '');
}
export function requireSameOrigin(request: Request) {
 const origin = request.headers.get('origin');
 if (origin !== new URL(siteUrl()).origin) throw new HttpError(403, 'This request could not be verified. Refresh the page and try again.');
}
export function clientKey(request: Request) {
 const ip = process.env.NETLIFY === 'true' || process.env.DATABASE_BACKEND === 'netlify'
   ? request.headers.get('x-nf-client-connection-ip') || 'unknown'
   : 'local';
 return createHmac('sha256', secret()).update(ip).digest('hex');
}
export async function adminSession() {
 const raw = (await cookies()).get(cookieName)?.value;
 if (!raw || raw.length > 100) return null;
 const session = await withDatabase(db => rows<{ email: string }>(db,
   'SELECT email FROM sessions WHERE token_hash=? AND expires_at>?', [hash(raw), Date.now()])[0], false);
 return session && allowedAdmins.has(session.email) ? session : null;
}
export async function requireAdmin() {
 const session = await adminSession();
 if (!session) throw new HttpError(401, 'Please sign in again.');
 return session;
}
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function readJson(request: Request) {
 if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415, 'Please submit JSON.');
 if (Number(request.headers.get('content-length')) > 4096) throw new HttpError(413, 'Request is too large.');
 const reader = request.body?.getReader();
 if (!reader) throw new HttpError(400, 'Request is empty.');
 let size = 0;
 const chunks: Uint8Array[] = [];
 while (true) {
   const { done, value } = await reader.read();
   if (done) break;
   size += value.length;
   if (size > 4096) { await reader.cancel(); throw new HttpError(413, 'Request is too large.'); }
   chunks.push(value);
 }
 try { return JSON.parse(Buffer.concat(chunks).toString()); }
 catch { throw new HttpError(400, 'Please check the form and try again.'); }
}
export function json(data: unknown, status = 200) {
 return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export function handleError(error: unknown) {
 if (error instanceof HttpError) return json({ error: error.message }, error.status);
 // Never log submitted addresses, credentials, SMTP errors, or database contents.
 console.error('Request failed', { type: error instanceof Error ? error.name : 'UnknownError' });
 return json({ error: 'Something went wrong. Please try again in a moment.' }, 503);
}
