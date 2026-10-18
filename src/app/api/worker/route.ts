import { timingSafeEqual } from 'node:crypto';
import { processOutbox } from '@/lib/mailer';
import { handleError, json } from '@/lib/security';
import { withDatabase } from '@/lib/database';
export async function POST(request: Request) {
 const expected = process.env.WORKER_SECRET;
 const actual = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
 if (!expected || Buffer.byteLength(actual) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return json({ error: 'Unauthorized' }, 401);
 try {
   await withDatabase(db => {
     const now = Date.now();
     db.run('DELETE FROM subscribers WHERE created_at < ?', [now - 365 * 86400000]);
     db.run('DELETE FROM sessions WHERE expires_at < ?', [now]);
     db.run('DELETE FROM login_codes WHERE expires_at < ?', [now]);
     db.run('DELETE FROM limits WHERE expires_at < ?', [now]);
   });
   return json({ sent: await processOutbox(3) });
 }
 catch (error) { return handleError(error); }
}
