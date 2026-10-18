import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { interests } from '@/config';
import { withDatabase, limit } from '@/lib/database';
import { clientKey, handleError, hash, HttpError, json, readJson, requireSameOrigin } from '@/lib/security';
import { processOutbox, unsubscribeToken } from '@/lib/mailer';
export const runtime = 'nodejs';
const schema = z.object({ email: z.email().max(254).transform(e => e.trim().toLowerCase()), interest: z.enum(interests).default('Something else'), purpose: z.string().trim().max(500).default(''), consent: z.literal(true), company: z.string().max(200).optional() });
export async function POST(request: Request) {
 try {
   requireSameOrigin(request);
   const parsed = schema.safeParse(await readJson(request));
   if (!parsed.success) throw new HttpError(400, 'Enter a valid email address and agree to receive waitlist updates.');
   if (parsed.data.company) return json({ ok: true });
   const { email, interest, purpose } = parsed.data;
   const id = randomUUID();
   const now = Date.now();
   const result = await withDatabase(db => {
     if (!limit(db, 'signup:' + clientKey(request), 12, 3600)) return 'limited';
     db.run('INSERT OR IGNORE INTO subscribers (id,email,interest,purpose,created_at,consent_version,unsubscribe_hash) VALUES (?,?,?,?,?,?,?)', [id, email, interest, purpose, now, '2026-10-18', hash(unsubscribeToken(id))]);
     if (!db.getRowsModified()) return 'existing';
     db.run('INSERT INTO outbox (id,subscriber_id,available_at) VALUES (?,?,?)', [randomUUID(), id, now]);
     return 'created';
   });
   if (result === 'limited') throw new HttpError(429, 'Too many attempts. Please try again later.');
   // A welcome delivery failure never rolls back a successfully saved signup.
   if (result === 'created') { try { await processOutbox(1, id); } catch { console.error('Welcome email remains queued'); } }
   // Same response for duplicates: do not disclose whether an address is on the list.
   return json({ ok: true });
 } catch (error) { return handleError(error); }
}
