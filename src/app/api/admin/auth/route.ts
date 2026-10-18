import { randomInt } from 'node:crypto';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { limit, rows, withDatabase } from '@/lib/database';
import { allowedAdmins, clientKey, codeHash, cookieName, handleError, hash, HttpError, json, passwordMatches, readJson, requireSameOrigin, token } from '@/lib/security';
import { loginEmail } from '@/lib/email-template';
import { sendMail } from '@/lib/mailer';
export const runtime = 'nodejs';
const schema = z.discriminatedUnion('step', [
 z.object({ step: z.literal('password'), email: z.email().max(254), password: z.string().min(1).max(256) }),
 z.object({ step: z.literal('code'), challenge: z.string().min(20).max(100), code: z.string().regex(/^\d{6}$/) }),
]);
export async function POST(request: Request) {
 try {
   requireSameOrigin(request);
   const parsed = schema.safeParse(await readJson(request));
   if (!parsed.success) throw new HttpError(400, 'Please check your sign-in details.');
   const data = parsed.data;
   const permitted = await withDatabase(db => limit(db, 'login:' + clientKey(request), 20, 900));
   if (!permitted) throw new HttpError(429, 'Too many sign-in attempts. Try again in 15 minutes.');
   if (data.step === 'password') {
     const email = data.email.toLowerCase().trim();
     const validPassword = passwordMatches(data.password);
     if (!validPassword || !allowedAdmins.has(email)) throw new HttpError(401, 'Those sign-in details are not valid.');
     const id = token();
     const code = randomInt(100000, 1000000).toString();
     const created = await withDatabase(db => {
       const now = Date.now();
       db.run('DELETE FROM login_codes WHERE expires_at < ?', [now]);
       db.run('DELETE FROM sessions WHERE expires_at < ?', [now]);
       if (!limit(db, 'otp:' + hash(email), 3, 1800) || !limit(db, 'smtp:otp-hour', 8, 3600)) return false;
       db.run('DELETE FROM login_codes WHERE email=?', [email]);
       db.run('INSERT INTO login_codes (id,email,code_hash,expires_at) VALUES (?,?,?,?)', [id, email, codeHash(id, code), now + 600000]);
       return true;
     });
     if (!created) throw new HttpError(429, 'A code was requested recently. Please wait before requesting another.');
     try { await sendMail(email, loginEmail(code), 'login-' + id); }
     catch { await withDatabase(db => { db.run('DELETE FROM login_codes WHERE id=?', [id]); }); throw new HttpError(503, 'We could not send your code. Please try again later.'); }
     return json({ challenge: id });
   }
   const sessionToken = token();
   const authenticated = await withDatabase(db => {
     const code = rows<{ email: string; code_hash: string; expires_at: number; attempts: number }>(db, 'SELECT * FROM login_codes WHERE id=?', [data.challenge])[0];
     if (!code || code.expires_at < Date.now() || code.attempts >= 5 || !allowedAdmins.has(code.email)) return false;
     db.run('UPDATE login_codes SET attempts=attempts+1 WHERE id=?', [data.challenge]);
     if (code.code_hash !== codeHash(data.challenge, data.code)) return false;
     db.run('DELETE FROM login_codes WHERE id=?', [data.challenge]);
     db.run('INSERT INTO sessions (token_hash,email,expires_at) VALUES (?,?,?)', [hash(sessionToken), code.email, Date.now() + 8 * 3600000]);
     return true;
   });
   if (!authenticated) throw new HttpError(401, 'That code is invalid or expired. Please try again.');
   (await cookies()).set(cookieName, sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
   return json({ ok: true });
 } catch (error) { return handleError(error); }
}
export async function DELETE(request: Request) {
 try {
   requireSameOrigin(request);
   const jar = await cookies();
   const current = jar.get(cookieName)?.value;
   if (current) await withDatabase(db => { db.run('DELETE FROM sessions WHERE token_hash=?', [hash(current)]); });
   jar.delete(cookieName);
   return json({ ok: true });
 } catch (error) { return handleError(error); }
}
