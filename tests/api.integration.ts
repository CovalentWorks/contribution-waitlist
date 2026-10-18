import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { rows, withDatabase, decrypt } from '../src/lib/database';
import { codeHash, hash } from '../src/lib/security';
import { unsubscribeToken } from '../src/lib/mailer';

async function main() {
 const directory = await mkdtemp(path.join(tmpdir(),'waitlist-test-'));
 const base = 'http://localhost:3036';
 const adminPath = '/admin-123456789012345678901234';
 const salt = randomBytes(16).toString('hex');
 const password = randomBytes(24).toString('base64url');
 Object.assign(process.env, {ADMIN_PATH:adminPath.slice(1),NODE_ENV:'production', ALLOW_LOCAL_DATABASE:'1', LOCAL_DATA_DIR:directory, SITE_URL:base, DATABASE_ENCRYPTION_KEY:randomBytes(32).toString('hex'), AUTH_SECRET:randomBytes(32).toString('hex'), WORKER_SECRET:'x'.repeat(64), ADMIN_PASSWORD_HASH:`${salt}:${scryptSync(password,salt,64).toString('hex')}`, SMTP_USER:'', SMTP_PASS:'', DATABASE_BACKEND:'local', NETLIFY:'false', NETLIFY_BLOBS_CONTEXT:''});
 const server = spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3036'],{env:process.env,stdio:'pipe'});
 let logs = ''; server.stderr.on('data',chunk=>logs+=chunk.toString());
 const post = (url:string,body:unknown,cookie='',origin=base) => fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(body)});
 const signup = {email:'person@example.com',consent:true,interest:'Family project back home',purpose:'=SUM(1,1)',company:''};
 try {
   let ready = false;
   for(let n=0;n<100;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{} await new Promise(r=>setTimeout(r,100));}
   assert(ready,'Production server should start');
   const loginPage = await fetch(base+adminPath);
   assert.equal(loginPage.status,200);
   assert.match(loginPage.headers.get('x-robots-tag')!,/noindex/);
   assert.match(loginPage.headers.get('cache-control')!,/no-store/);
   for(const resource of ['/admin','/admin/email-preview','/admin-000000000000000000000000','/admin-000000000000000000000000/email-preview']) {
     const response = await fetch(base+resource,{redirect:'manual'});
     assert.equal(response.status,404);
     assert.equal(response.headers.get('location'),null);
   }
   for(const resource of ['/','/robots.txt']) assert(!(await (await fetch(base+resource)).text()).includes(adminPath),'Public pages must not reveal the admin path');
   assert.equal((await post('/api/waitlist',signup,'','https://evil.example')).status,403);
   assert.equal((await post('/api/waitlist',{...signup,consent:false})).status,400);
   assert.equal((await post('/api/waitlist',{...signup,company:'bot'})).status,200);
   assert.equal((await withDatabase(db=>rows<{n:number}>(db,'SELECT count(*) n FROM subscribers')[0].n,false)),0);
   assert.equal((await post('/api/waitlist',signup)).status,200);
   assert.equal((await post('/api/waitlist',{...signup,email:'PERSON@example.com'})).status,200);
   const saved = await withDatabase(db=>rows<{id:string;email:string}>(db,'SELECT id,email FROM subscribers'),false);
   assert.equal(saved.length,1);
   const jobs = await withDatabase(db=>rows<{state:string;attempts:number}>(db,'SELECT state,attempts FROM outbox'),false);
   assert.deepEqual(jobs,[{state:'pending',attempts:1}],'SMTP failure must leave exactly one retryable job');
   const snapshot = await readFile(path.join(directory,'waitlist.enc'));
   assert(!snapshot.includes(Buffer.from(signup.email)));
   assert(Buffer.from(decrypt(snapshot)).subarray(0,16).equals(Buffer.from('SQLite format 3\0')));
   for(const resource of ['/api/admin/signups','/api/admin/signups?format=csv',adminPath+'/email-preview']) assert.equal((await fetch(base+resource)).status,401);
   for(const resource of ['/.env','/.data/waitlist.enc','/waitlist.sqlite']) assert.equal((await fetch(base+resource)).status,404);
   assert.equal((await post('/api/admin/auth',{step:'password',email:'stranger@example.com',password})).status,401);
   const allowed = 'leslieokoduwa@gmail.com';
   const seed = async(id:string,email=allowed,expires=Date.now()+600000) => withDatabase(db=>{db.run('INSERT INTO login_codes(id,email,code_hash,expires_at) VALUES(?,?,?,?)',[id,email,codeHash(id,'123456'),expires]);});
   const verify = (challenge:string,code='123456')=>post('/api/admin/auth',{step:'code',challenge,code});
   await seed('expired-challenge-12345',allowed,Date.now()-1);
   assert.equal((await verify('expired-challenge-12345')).status,401);
   await seed('outsider-challenge-1234','stranger@example.com');
   assert.equal((await verify('outsider-challenge-1234')).status,401);
   await seed('exhausted-challenge-123');
   for(let n=0;n<5;n++) assert.equal((await verify('exhausted-challenge-123','000000')).status,401);
   assert.equal((await verify('exhausted-challenge-123')).status,401);
   await seed('valid-challenge-1234567');
   const login=await verify('valid-challenge-1234567');assert.equal(login.status,200);
   const setCookie=login.headers.get('set-cookie')!;
   assert.match(setCookie,/HttpOnly/i); assert.match(setCookie,/Secure/i); assert.match(setCookie,/SameSite=strict/i);
   const cookie=setCookie.split(';')[0];
   assert.equal((await verify('valid-challenge-1234567')).status,401,'OTP cannot be replayed');
   const dashboard=await fetch(base+'/api/admin/signups',{headers:{Cookie:cookie}});
   const dashboardPage = await (await fetch(base+adminPath,{headers:{Cookie:cookie}})).text();
   assert(dashboardPage.includes(adminPath+'/email-preview'));
   assert.equal((await fetch(base+adminPath+'/email-preview',{headers:{Cookie:cookie}})).status,200);
   assert.equal(dashboard.status,200);assert.equal((await dashboard.json()).total,1);
   assert.match(dashboard.headers.get('cache-control')!,/no-store/);
   const csv=await (await fetch(base+'/api/admin/signups?format=csv',{headers:{Cookie:cookie}})).text();
   assert(csv.includes('"\'=SUM(1,1)"'),'CSV formula must be neutralized');
   assert.equal((await fetch(base+'/api/admin/auth',{method:'DELETE',headers:{Origin:base,Cookie:cookie}})).status,200);
   assert.equal((await fetch(base+'/api/admin/signups',{headers:{Cookie:cookie}})).status,401,'Logout revokes session');
   const leave=unsubscribeToken(saved[0].id);
   assert.equal((await fetch(base+'/unsubscribe?token='+leave)).status,200);
   assert.equal(await withDatabase(db=>rows<{n:number}>(db,'SELECT count(*) n FROM subscribers')[0].n,false),1,'GET unsubscribe must not delete');
   assert.equal((await post('/api/unsubscribe?token='+leave,{})).status,200);
   assert.equal(await withDatabase(db=>rows<{n:number}>(db,'SELECT count(*) n FROM outbox')[0].n,false),0);
   assert.equal((await fetch(base+'/api/worker',{method:'POST',headers:{Authorization:'Bearer '+'é'.repeat(64)}})).status,401);
   console.log('PASS: persistence, duplicate signup, SMTP failure retry, CSRF, honeypot, private files, allowlist, OTP expiry/attempt limit/replay, session/logout, CSV safety, unsubscribe, worker authentication.');
 } catch(error) { console.error(logs); throw error; }
 finally { server.kill('SIGTERM'); await new Promise<void>(resolve=>server.once('exit',()=>resolve())); await rm(directory,{recursive:true,force:true}); }
}
main().catch(error=>{console.error(error);process.exitCode=1});
