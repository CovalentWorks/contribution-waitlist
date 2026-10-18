'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowClockwise, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle, CircleNotch, EnvelopeSimple, SignOut, Trash, UsersThree } from '@phosphor-icons/react';
import { Brand } from './brand';
type Signup = { id: string; email: string; interest: string; purpose: string; created_at: number; email_status: string; attempts: number; last_error: string | null };
type Result = { total: number; filtered: number; sent: number; recent: number; pending: number; signups: Signup[]; page: number; pages: number };
export function AdminDashboard({ email, adminPath }: { email: string; adminPath: string }) {
 const [result, setResult] = useState<Result | null>(null);
 const [search, setSearch] = useState('');
 const [query, setQuery] = useState('');
 const [page, setPage] = useState(1);
 const [error, setError] = useState('');
 const [notice, setNotice] = useState('');
 const [busy, setBusy] = useState(false);
 const [removing, setRemoving] = useState<Signup | null>(null);
 const [revision, setRevision] = useState(0);
 const dialog = useRef<HTMLDialogElement>(null);
 useEffect(() => { if (removing) dialog.current?.showModal(); }, [removing]);
 useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
 useEffect(() => {
   const controller = new AbortController();
   fetch(`/api/admin/signups?q=${encodeURIComponent(query)}&page=${page}`, { signal: controller.signal }).then(async response => {
     if (response.status === 401) { window.location.reload(); return; }
     const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data); setError('');
   }).catch(e => { if (e.name !== 'AbortError') setError(e.message || 'Could not load signups.'); });
   return () => controller.abort();
 }, [query, page, revision]);
 const refresh = useCallback(() => setRevision(r => r + 1), []);
 async function action(url: string, method: string, body?: object) {
   setBusy(true); setError(''); setNotice('');
   try {
     const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
     const data = await response.json(); if (!response.ok) throw new Error(data.error);
     if (url.endsWith('/auth')) window.location.reload();
     else { if ('sent' in data) setNotice(`${data.sent} welcome email${data.sent === 1 ? '' : 's'} sent. Remaining emails follow the retry schedule and sending limit.`); setRemoving(null); refresh(); }
   } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
   finally { setBusy(false); }
 }
 return <div className="admin-shell"><header className="admin-header"><Brand /><div><span className="admin-label">Waitlist admin</span><a href="/" target="_blank" rel="noreferrer">View site <ArrowUpRight size={14} /></a></div><button className="text-button" onClick={() => action('/api/admin/auth', 'DELETE')} disabled={busy}><SignOut size={17} />Sign out</button></header><main className="admin-main"><div className="admin-title"><div><p className="small-label">WAITLIST</p><h1>Signups</h1><p>Signed in as {email}</p></div><a className="button" href={`/api/admin/signups?format=csv&q=${encodeURIComponent(query)}`}><ArrowDown size={17} />Export CSV</a></div><div className="admin-stats"><article><UsersThree size={23} /><span>Total signups</span><strong>{result?.total ?? '…'}</strong></article><article><ArrowUpRight size={23} /><span>Joined in 7 days</span><strong>{result?.recent ?? '…'}</strong></article><article><CheckCircle size={23} /><span>Welcome emails sent</span><strong>{result?.sent ?? '…'}</strong></article><article><EnvelopeSimple size={23} /><span>Emails queued</span><strong>{result?.pending ?? '…'}</strong></article></div><section className="signup-table-section"><div className="table-toolbar"><label className="sr-only" htmlFor="search">Search signups by email</label><input id="search" type="search" placeholder="Search by email…" value={search} maxLength={254} onChange={e => setSearch(e.target.value)} /><div><button className="text-button" onClick={refresh}><ArrowClockwise size={16} />Refresh</button><button className="text-button" disabled={busy} onClick={() => action('/api/admin/retry', 'POST')}>{busy ? <CircleNotch className="spinner" size={16} /> : <EnvelopeSimple size={16} />}Retry queued emails</button></div></div>{error && <p role="alert" className="admin-message error">{error}</p>}{notice && <p role="status" className="admin-message">{notice}</p>}<div className="table-scroll"><table><thead><tr><th>Email address</th><th>Group / contribution</th><th>Joined</th><th>Welcome email</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{result?.signups.map(signup => <tr key={signup.id}><td><strong>{signup.email}</strong></td><td><span>{signup.interest}</span>{signup.purpose && <p className="signup-purpose">{signup.purpose}</p>}</td><td>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(signup.created_at)}<small>{new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: 'Africa/Lagos' }).format(signup.created_at)} WAT</small></td><td><span className={`status-badge ${signup.email_status === 'sent' ? 'sent' : 'pending'}`}>{signup.email_status === 'sent' ? 'Sent' : signup.attempts >= 12 ? 'Needs retry' : 'Queued'}</span>{signup.last_error && <small>{signup.attempts} attempts</small>}</td><td><button className="icon-button" aria-label={`Remove ${signup.email}`} onClick={() => setRemoving(signup)}><Trash size={17} /></button></td></tr>)}</tbody></table>{!result && !error && <div className="table-empty"><CircleNotch className="spinner" size={24} /><p>Loading your waitlist…</p></div>}{result?.signups.length === 0 && <div className="table-empty"><UsersThree size={34} weight="duotone" /><h2>{query ? 'No matching emails.' : 'No signups yet.'}</h2><p>{query ? 'Try a different search.' : 'Share the waitlist link. New signups will appear here.'}</p>{!query && <a className="text-button" href="/" target="_blank" rel="noreferrer">Open waitlist <ArrowUpRight size={15} /></a>}</div>}</div><div className="table-pagination"><span>{result?.filtered ?? 0} signups{query && ' matching your search'}</span><div><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ArrowLeft size={17} /></button><span>Page {page} of {result?.pages || 1}</span><button aria-label="Next page" disabled={!result || page >= result.pages} onClick={() => setPage(p => p + 1)}><ArrowRight size={17} /></button></div></div></section><div className="admin-bottom"><p>Welcome emails are sent through SendPulse. Queued emails are retried automatically.</p><a href={`/${adminPath}/email-preview`} target="_blank" rel="noreferrer">Preview welcome email <ArrowUpRight size={14} /></a></div></main>{removing && <dialog ref={dialog} className="confirm-dialog" onCancel={() => setRemoving(null)} aria-labelledby="remove-title" aria-describedby="remove-description"><h2 id="remove-title">Remove this signup?</h2><p id="remove-description">{removing.email} and their queued welcome email will be permanently removed.</p><div><button className="button secondary" autoFocus onClick={() => setRemoving(null)} disabled={busy}>Keep signup</button><button className="button danger" onClick={() => action('/api/admin/signups', 'DELETE', { id: removing.id })} disabled={busy}>Remove signup</button></div></dialog>}</div>;
}
