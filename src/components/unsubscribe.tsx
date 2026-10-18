'use client';
import { useState } from 'react';
import { brand } from '@/config';
export function Unsubscribe({ token }: { token: string }) {
 const [done, setDone] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
 return <><h1>{done ? 'You’re off the list.' : 'Leave the waitlist?'}</h1><p>{done ? `Your signup has been removed. Thanks for taking an interest in ${brand.name}.` : `We’ll remove your signup and any queued welcome email. You can join again whenever you like.`}</p>{!done && <button className="button" disabled={busy} onClick={async () => { setBusy(true); try { const r = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, { method: 'POST' }); if (!r.ok) throw new Error(); setDone(true); } catch { setError('We couldn’t process that link. Please contact us for help.'); } finally { setBusy(false); } }}>{busy ? 'Removing…' : 'Yes, leave the waitlist'}</button>}{error && <p role="alert">{error} <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a></p>}<p><a href="/">Back to {brand.name}</a></p></>;
}
