import nodemailer from 'nodemailer';
import { brand } from '../config';
import { createHmac, randomUUID } from 'node:crypto';
import { withDatabase, rows, limit } from './database';
import { secret, siteUrl } from './security';
import { welcomeEmail } from './email-template';

export const unsubscribeToken = (id: string) => createHmac('sha256', secret()).update('unsubscribe:' + id).digest('base64url');
export async function sendMail(to: string, message: { subject: string; html: string; text: string }, id: string, unsubscribe?: string) {
 if (!process.env.SMTP_USER || !process.env.SMTP_PASS) throw new Error('Email is not configured');
 const transport = nodemailer.createTransport({
   host: process.env.SMTP_HOST || 'smtp-pulse.com', port: Number(process.env.SMTP_PORT || 587),
   secure: false, requireTLS: true,
   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
   connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000,
 });
 try {
   const from = process.env.EMAIL_FROM || brand.contactEmail;
   const result = await transport.sendMail({
     from: { name: brand.name, address: from }, to, replyTo: brand.contactEmail,
     ...message, messageId: `<${id}@${from.split('@')[1]}>`,
     ...(unsubscribe ? { headers: { 'List-Unsubscribe': `<${unsubscribe.replace('/unsubscribe?', '/api/unsubscribe?')}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } } : {}),
   });
   if (!result.accepted?.length) throw new Error('Email was not accepted');
 } finally { transport.close(); }
}
type Job = { id: string; subscriber_id: string; email: string; attempts: number; lease_token: string };
export async function processOutbox(maximum = 3, subscriberId?: string) {
 let sent = 0;
 for (let index = 0; index < maximum; index++) {
   const lease = randomUUID();
   const now = Date.now();
   const job = await withDatabase(db => {
     const item = rows<Job>(db, `SELECT o.id,o.subscriber_id,o.attempts,s.email FROM outbox o JOIN subscribers s ON s.id=o.subscriber_id
       WHERE o.state != 'sent' AND o.attempts < 12 AND o.available_at <= ? AND (o.lease_until IS NULL OR o.lease_until < ?)
       ${subscriberId ? 'AND o.subscriber_id=?' : ''} ORDER BY o.available_at LIMIT 1`, subscriberId ? [now, now, subscriberId] : [now, now])[0];
     if (!item || !limit(db, 'smtp:welcome-hour', 40, 3600)) return null;
     db.run("UPDATE outbox SET state='sending',lease_until=?,lease_token=?,attempts=attempts+1 WHERE id=?", [now + 120000, lease, item.id]);
     return { ...item, attempts: item.attempts + 1, lease_token: lease };
   });
   if (!job) break;
   try {
     const message = welcomeEmail(siteUrl(), unsubscribeToken(job.subscriber_id));
     await sendMail(job.email, message, job.id, message.unsubscribe);
     await withDatabase(db => { db.run("UPDATE outbox SET state='sent',sent_at=?,lease_until=NULL,last_error=NULL WHERE id=? AND lease_token=?", [Date.now(), job.id, job.lease_token]); });
     sent++;
   } catch {
     await withDatabase(db => { db.run("UPDATE outbox SET state='pending',lease_until=NULL,available_at=?,last_error='Delivery attempt failed; queued for retry' WHERE id=? AND lease_token=?", [Date.now() + Math.min(6 * 3600000, 60000 * 2 ** job.attempts), job.id, job.lease_token]); });
   }
 }
 return sent;
}
