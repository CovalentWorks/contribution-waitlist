import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { decrypt, encrypt, limit, rows, transact, type Snapshot, type SnapshotStore } from '../src/lib/database';
process.env.DATABASE_ENCRYPTION_KEY = randomBytes(32).toString('hex');
class MemoryStore implements SnapshotStore {
 snapshot: Snapshot = null;
 version = 0;
 conflicts = 0;
 async read() { return this.snapshot; }
 async write(data: Uint8Array, etag?: string) {
   if (etag !== this.snapshot?.etag) { this.conflicts++; return false; }
   this.snapshot = { data, etag: String(++this.version) }; return true;
 }
}
const insert = (db: import('sql.js').Database, id: string, email = `${id}@example.com`) => db.run('INSERT INTO subscribers(id,email,created_at,consent_version,unsubscribe_hash) VALUES(?,?,1,?,?)', [id,email,'test',id]);
test('encrypted data is authenticated, randomized, and never contains plaintext emails', () => {
 const plaintext = Buffer.from('private-person@example.com');
 const encrypted = encrypt(plaintext);
 assert.deepEqual(Buffer.from(decrypt(encrypted)), plaintext);
 assert(!encrypted.includes(plaintext));
 assert.notDeepEqual(encrypted, encrypt(plaintext));
 encrypted[40] ^= 1;
 assert.throws(() => decrypt(encrypted));
});
test('concurrent snapshot writes retry without losing signups', async () => {
 const store = new MemoryStore();
 await Promise.all(Array.from({length:12},(_,i) => transact(store, db => insert(db,String(i)))));
 const result = await transact(store, db => rows<{n:number}>(db,'SELECT count(*) n FROM subscribers')[0].n, false);
 assert.equal(result,12); assert(store.conflicts>0);
});
test('transactions roll back, uniqueness ignores case, and removal cascades to queued email', async () => {
 const store = new MemoryStore();
 await transact(store, db => { insert(db,'first','Person@example.com'); db.run('INSERT INTO outbox(id,subscriber_id,available_at) VALUES(?,?,0)',['email','first']); });
 await assert.rejects(transact(store, db => insert(db,'second','person@example.com')));
 await assert.rejects(transact(store, db => { insert(db,'third'); throw new Error('abort'); }));
 assert.equal(await transact(store, db=>rows<{n:number}>(db,'SELECT count(*) n FROM subscribers')[0].n,false),1);
 await transact(store,db=>db.run('DELETE FROM subscribers WHERE id=?',['first']));
 assert.equal(await transact(store,db=>rows<{n:number}>(db,'SELECT count(*) n FROM outbox')[0].n,false),0);
});
test('rate limits are shared across writes and reset only after expiry', async () => {
 const store = new MemoryStore();
 const results = await Promise.all(Array.from({length:5},()=>transact(store,db=>limit(db,'attempt',3,60,1000))));
 assert.equal(results.filter(Boolean).length,3);
 assert.equal(await transact(store,db=>limit(db,'attempt',3,60,62000)),true);
});
test('a corrupted snapshot fails closed instead of creating an empty database', async () => {
 const store = new MemoryStore();
 await transact(store,db=>insert(db,'first'));
 store.snapshot!.data[40]^=1;
 await assert.rejects(transact(store,db=>insert(db,'second')));
 assert.equal(store.version,1);
});
