'use client';
import { useState } from 'react';
import { ArrowUpRight, CheckCircle, CircleNotch, Copy, EnvelopeSimple, Plus } from '@phosphor-icons/react';
import { brand, interests } from '@/config';
export function WaitlistForm() {
 const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
 const [error, setError] = useState('');
 const [copied, setCopied] = useState(false);
 async function submit(event: React.FormEvent<HTMLFormElement>) {
   event.preventDefault(); setStatus('sending'); setError('');
   const data = new FormData(event.currentTarget);
   try {
     const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: String(data.get('email')).trim(), interest: data.get('interest'), purpose: data.get('purpose'), consent: data.get('consent') === 'on', company: data.get('company') }), signal: AbortSignal.timeout(45000) });
     const result = await response.json();
     if (!response.ok) throw new Error(result.error || 'Please try again.');
     setStatus('success');
   } catch (error) { setError(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The connection took too long. Please try again; your email will only be saved once.'); setStatus('error'); }
 }
 if (status === 'success') return <div className="signup-success" role="status" aria-live="polite"><CheckCircle size={38} weight="fill" /><h2>You’re on the list.</h2><p>We’ve saved your email. We’ll be in touch when you can try {brand.name}.</p><button className="button button-small" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin); setCopied(true); } catch { setError('Copy the address from your browser to share it.'); } }}><Copy size={17} />{copied ? 'Link copied' : 'Share with your group'}</button>{error && <p>{error}</p>}</div>;
 return <form className="waitlist-form" onSubmit={submit} id="waitlist">
   <label className="field-label" htmlFor="waitlist-email">We’ll email you when you can try it.</label>
   <div className="email-input-row"><div className="email-field"><EnvelopeSimple size={20} aria-hidden="true" /><input id="waitlist-email" name="email" type="email" placeholder="Your email address" autoComplete="email" maxLength={254} required aria-describedby="signup-error" disabled={status === 'sending'} /></div><button className="button" disabled={status === 'sending'}>{status === 'sending' ? <><CircleNotch className="spinner" size={18} />Joining…</> : <>Join the waitlist <ArrowUpRight size={20} /></>}</button></div>
   <div className="honeypot" aria-hidden="true"><input id="company" name="company" aria-label="Leave this field empty" tabIndex={-1} autoComplete="off" /></div>
   <details className="optional-fields"><summary>What are you collecting for? <span>(optional)</span><Plus size={16} aria-hidden="true" /></summary><div className="optional-content"><label className="field-label" htmlFor="interest">What kind of group?</label><select name="interest" id="interest" defaultValue="Something else">{interests.map(item => <option key={item}>{item}</option>)}</select><label className="field-label" htmlFor="purpose">What does your group contribute for?</label><textarea name="purpose" id="purpose" rows={3} maxLength={500} placeholder="For example, estate security dues or a family wedding" /><p className="form-hint">Please leave out bank details and other private information.</p></div></details>
   <label className="consent"><input type="checkbox" name="consent" required /><span>Send me an invite and updates about the launch. Unsubscribe at any time. <a href="/privacy">Privacy</a></span></label>
   <p id="signup-error" className="form-error" role="alert">{error}</p>
 </form>;
}
