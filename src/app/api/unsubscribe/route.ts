import { z } from 'zod';
import { withDatabase } from '@/lib/database';
import { hash, handleError, json } from '@/lib/security';
export async function POST(request: Request) {
 try {
   const token = new URL(request.url).searchParams.get('token');
   if (!z.string().regex(/^[\w-]{43}$/).safeParse(token).success) return json({ error: 'Invalid link.' }, 400);
   await withDatabase(db => { db.run('DELETE FROM subscribers WHERE unsubscribe_hash=?', [hash(token!)]); });
   return json({ ok: true });
 } catch (error) { return handleError(error); }
}
