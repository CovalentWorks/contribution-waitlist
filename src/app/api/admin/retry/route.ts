import { handleError, json, requireAdmin, requireSameOrigin } from '@/lib/security';
import { processOutbox } from '@/lib/mailer';
import { withDatabase } from '@/lib/database';
export async function POST(request: Request) {
 try {
   requireSameOrigin(request); await requireAdmin();
   await withDatabase(db => { db.run("UPDATE outbox SET attempts=0,available_at=? WHERE state='pending' AND attempts>=12", [Date.now()]); });
   const sent = await processOutbox(3);
   return json({ sent });
 } catch (error) { return handleError(error); }
}
