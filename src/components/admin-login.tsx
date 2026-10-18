'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CircleNotch, LockKey, EnvelopeSimple } from '@phosphor-icons/react';
import { Brand } from './brand';
import { brand } from '@/config';
export function AdminLogin() {
 const [challenge, setChallenge] = useState('');
 const [email, setEmail] = useState('');
 const [error, setError] = useState('');
 const [busy, setBusy] = useState(false);
 async function submit(event: React.FormEvent<HTMLFormElement>) {
   event.preventDefault(); setBusy(true); setError('');
   const data = new FormData(event.currentTarget);
   const payload = challenge ? { step: 'code', challenge, code: String(data.get('code')).trim() } : { step: 'password', email: String(data.get('email')).trim(), password: data.get('password') };
   try {
     const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
     const result = await response.json();
     if (!response.ok) throw new Error(result.error);
     if (result.challenge) { setEmail(String(data.get('email'))); setChallenge(result.challenge); }
     else window.location.reload();
   } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in. Please try again.'); }
   finally { setBusy(false); }
 }
 return <main className="admin-login"><Brand /><section className="login-card"><div className="login-icon">{challenge ? <EnvelopeSimple size={26} /> : <LockKey size={26} />}</div><p className="small-label">{brand.name.toUpperCase()} ADMIN</p><h1>{challenge ? 'Check your inbox.' : 'Welcome back.'}</h1><p className="login-description">{challenge ? `We sent a six-digit sign-in code to ${email}.` : 'Sign in to see the people waiting to join.'}</p><form onSubmit={submit} key={challenge || 'password'}>{challenge ? <><label className="field-label" htmlFor="code">Email verification code</label><input id="code" name="code" className="code-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" autoFocus required /></> : <><label className="field-label" htmlFor="admin-email">Your approved email address</label><input id="admin-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" maxLength={254} required /><label className="field-label" htmlFor="admin-password">Admin password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={256} required /></>}<p role="alert" className="form-error">{error}</p><button className="button" disabled={busy}>{busy ? <CircleNotch className="spinner" size={18} /> : <>{challenge ? 'Verify & sign in' : 'Send sign-in code'}<ArrowRight size={18} /></>}</button></form>{challenge ? <button className="text-button" onClick={() => { setChallenge(''); setError(''); }}><ArrowLeft size={15} />Use another email or request a new code</button> : <p className="login-note">Access is limited to approved team members.<br />You’ll also need a code sent to your email.</p>}</section><a href="/" className="back-link"><ArrowLeft size={16} />Back to the waitlist</a></main>;
}
