import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import initSqlJs from 'sql.js/dist/sql-wasm-inline.js';
import type { Database, SqlValue } from 'sql.js';
import { getStore } from '@netlify/blobs';

const sql = initSqlJs();
const BLOB_KEY = 'waitlist.enc';
const MAX_BYTES = 25 * 1024 * 1024;
const schema = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS subscribers (
 id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 interest TEXT NOT NULL DEFAULT 'Something else', purpose TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL,
 consent_version TEXT NOT NULL, unsubscribe_hash TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS outbox (
 id TEXT PRIMARY KEY, subscriber_id TEXT NOT NULL UNIQUE REFERENCES subscribers(id) ON DELETE CASCADE,
 state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0,
 available_at INTEGER NOT NULL, lease_until INTEGER, lease_token TEXT,
 sent_at INTEGER, last_error TEXT
);
CREATE TABLE IF NOT EXISTS login_codes (
 id TEXT PRIMARY KEY, email TEXT NOT NULL, code_hash TEXT NOT NULL,
 expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS limits (
 key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS outbox_due ON outbox(state, available_at);
CREATE INDEX IF NOT EXISTS signup_date ON subscribers(created_at);
PRAGMA user_version = 1;
`;

function encryptionKey() {
 const key = process.env.DATABASE_ENCRYPTION_KEY;
 if (!key || !/^[a-f0-9]{64}$/i.test(key)) throw new Error('Database encryption is not configured');
 return Buffer.from(key, 'hex');
}
export function encrypt(data: Uint8Array): Buffer {
 const iv = randomBytes(12);
 const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
 const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
 return Buffer.concat([Buffer.from('PADI01'), iv, cipher.getAuthTag(), ciphertext]);
}
export function decrypt(data: Uint8Array): Uint8Array {
 const input = Buffer.from(data);
 if (input.subarray(0, 6).toString() !== 'PADI01') throw new Error('Invalid database format');
 const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), input.subarray(6, 18));
 decipher.setAuthTag(input.subarray(18, 34));
 return Buffer.concat([decipher.update(input.subarray(34)), decipher.final()]);
}

export type Snapshot = { data: Uint8Array; etag: string } | null;
export interface SnapshotStore {
 read(): Promise<Snapshot>;
 write(data: Uint8Array, etag?: string): Promise<boolean>;
}
function cloudStore(): SnapshotStore {
 const store = getStore({ name: 'private-waitlist', consistency: 'strong',
   // Guard conditional writes against non-412 HTTP failures in the SDK.
   fetch: async (input, init) => {
     const response = await fetch(input, { ...init, signal: AbortSignal.timeout(15000) });
     if (!response.ok && ![404, 412, 304].includes(response.status)) throw new Error('Private storage unavailable');
     return response;
   },
 });
 return {
   async read() {
     const entry = await store.getWithMetadata(BLOB_KEY, { type: 'arrayBuffer', consistency: 'strong' });
     if (!entry) return null;
     if (!entry.etag) throw new Error('Storage version missing');
     return { data: new Uint8Array(entry.data), etag: entry.etag };
   },
   async write(data, etag) {
     const result = await store.set(BLOB_KEY, new Blob([Buffer.from(data)]), etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
     if (result.modified && !result.etag) throw new Error('Storage did not acknowledge write');
     return result.modified;
   },
 };
}

/** One SQLite transaction per encrypted snapshot; a conflicting write retries from fresh data.
 * Callbacks must be synchronous and free of external side effects (email runs after commit).
 */
export async function transact<T>(store: SnapshotStore, operation: (db: Database) => T, write = true): Promise<T> {
 const SQL = await sql;
 for (let attempt = 0; attempt < 12; attempt++) {
   const snapshot = await store.read();
   const db = new SQL.Database(snapshot ? decrypt(snapshot.data) : undefined);
   try {
     db.run(schema);
     db.run('BEGIN IMMEDIATE');
     const result = operation(db);
     db.run('COMMIT');
     if (!write) return result;
     const bytes = db.export();
     if (bytes.length > MAX_BYTES) throw new Error('Database size limit reached');
     if (await store.write(encrypt(bytes), snapshot?.etag)) return result;
   } finally { db.close(); }
   await new Promise(resolve => setTimeout(resolve, 25 + Math.random() * 80 * (attempt + 1)));
 }
 throw new Error('Database is busy; retry shortly');
}

let localQueue = Promise.resolve();
export async function withDatabase<T>(operation: (db: Database) => T, write = true): Promise<T> {
 if (process.env.NETLIFY === 'true' || process.env.NETLIFY_BLOBS_CONTEXT || process.env.DATABASE_BACKEND === 'netlify') {
   return transact(cloudStore(), operation, write);
 }
 if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_LOCAL_DATABASE) throw new Error('Durable database not configured');
 // Local development only. Hosted deployments always use private durable Blobs.
 const directory = path.resolve(/* turbopackIgnore: true */ process.env.LOCAL_DATA_DIR || '.data');
 const filename = path.join(directory, BLOB_KEY);
 const local: SnapshotStore = {
   async read() {
     try { return { data: await readFile(filename), etag: 'local' }; }
     catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
   },
   async write(data) {
     await mkdir(directory, { recursive: true, mode: 0o700 });
     const temp = filename + '.' + randomUUID();
     await writeFile(temp, data, { mode: 0o600 });
     await rename(temp, filename);
     return true;
   },
 };
 const task = localQueue.then(() => transact(local, operation, write));
 localQueue = task.then(() => undefined, () => undefined);
 return task;
}

export function rows<T>(db: Database, query: string, params: SqlValue[] = []): T[] {
 const statement = db.prepare(query);
 try {
   statement.bind(params);
   const result: T[] = [];
   while (statement.step()) result.push(statement.getAsObject() as T);
   return result;
 } finally { statement.free(); }
}
export function limit(db: Database, key: string, maximum: number, seconds: number, now = Date.now()): boolean {
 db.run('DELETE FROM limits WHERE expires_at < ?', [now]);
 const item = rows<{ count: number }>(db, 'SELECT count FROM limits WHERE key = ?', [key])[0];
 if (item && item.count >= maximum) return false;
 db.run('INSERT INTO limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1', [key, now + seconds * 1000]);
 return true;
}
