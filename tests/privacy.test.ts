import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { sanitizeRequest, secureResponse } from '../lib/privacy.ts';
import { boundedJson, messageText, storedMessage, checkProof, makeChallenge, saveSubmission, sameOrigin, requireSecret } from '../lib/submissions.ts';

const secret = 'only-a-test-key-never-a-runtime-key-123456789';
const jsonRequest = (body: unknown) => new Request('https://example.test/api/messages', {method:'POST',headers:{'content-type':'application/json',origin:'https://example.test'},body:JSON.stringify(body)});

// Small transactional D1 adapter against the actual migration, not a mocked SQL result.
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../drizzle/0000_glossy_valkyrie.sql', import.meta.url),'utf8'));
  const db = {
    prepare(query: string) { return { bind(...args: (string | number)[]) { return {run:()=>sql.prepare(query).run(...args)}; } }; },
    async batch(statements: {run:()=>unknown}[]) {
      sql.exec('BEGIN');
      try {const results=statements.map(s=>s.run());sql.exec('COMMIT');return results;}
      catch(e){sql.exec('ROLLBACK');throw e;}
    }
  } as unknown as D1Database;
  return {sql,db};
}

test('public request loses IP, auth, cookies, browser, referrer and platform metadata', async()=>{
  const request = new Request('https://example.test/api/messages',{method:'POST',headers:{'content-type':'application/json',origin:'https://example.test','cf-connecting-ip':'192.0.2.1','x-forwarded-for':'192.0.2.2','forwarded':'for=192.0.2.3',cookie:'identity=secret','user-agent':'unique-browser',referer:'https://example.test/person','oai-authenticated-user-id':'user','oai-authenticated-user-email':'person@example.test'},body:'{"message":"hello"}'});
  Object.assign(request,{cf:{city:'example'}});
  const clean = sanitizeRequest(request);
  assert.deepEqual([...clean.headers.keys()],['content-type','origin']);
  assert.equal('cf' in clean,false);
  assert.equal(await clean.text(),'{"message":"hello"}');
  assert(sameOrigin(clean));
  assert(!sameOrigin(new Request('https://example.test/api/messages')));
});
test('only inbox routes preserve the recipient auth headers',()=>{
  const headers={'oai-authenticated-user-id':'user','oai-authenticated-user-email':'person@example.test',cookie:'secret','cf-connecting-ip':'192.0.2.1'};
  for(const path of ['/inbox','/api/inbox'])assert.deepEqual([...sanitizeRequest(new Request('https://example.test'+path,{headers})).headers.keys()],Object.keys(headers).slice(0,2).sort());
});
test('sensitive responses cannot be cached or embedded',()=>{
  const h=secureResponse(Response.json({ok:true})).headers;
  assert.match(h.get('cache-control')!,/no-store/);
  assert.equal(h.get('referrer-policy'),'no-referrer');
  assert.match(h.get('content-security-policy')!,/connect-src 'self';/);
  assert.equal(h.get('x-frame-options'),'DENY');
});
test('body is bounded without relying on Content-Length and rejects extra metadata',async()=>{
  assert.equal(messageText(await boundedJson(jsonRequest({message:' hello ',proof:'x',website:''}))),'hello');
  await assert.rejects(boundedJson(jsonRequest({message:'x'.repeat(50000)})),{status:413});
  await assert.rejects(boundedJson(jsonRequest([])),{status:400});
  assert.throws(()=>messageText({message:'hello',proof:'x',website:'',ip:'192.0.2.1'}),{status:400});
  assert.throws(()=>messageText({message:'hello',website:'bot-filled'}),{status:400});
  assert.throws(()=>messageText({message:' ',website:''}),{status:400});
  assert.throws(()=>requireSecret(''),{status:503});
  const row=storedMessage('hello',Date.UTC(2026,9,10,12,34,56));
  assert.deepEqual(Object.keys(row),['id','body','day','is_read']);assert.equal(row.day,'2026-10-10');
});
test('real proof solves; tampering, expiration and excessive work are rejected',async()=>{
  const challenge=await makeChallenge(secret);
  const solution=await solveChallenge({challenge,deriveKey});
  assert(solution);
  const encode=(c:unknown,s:unknown)=>btoa(JSON.stringify({challenge:c,solution:s}));
  const proof=encode(challenge,solution);
  const checked=await checkProof(proof,secret);
  assert.equal(checked.signature,challenge.signature);
  await assert.rejects(checkProof(proof,'a-different-key-that-is-long-enough-12345'),{status:400});
  await assert.rejects(checkProof(proof,secret,Date.now()+400000),{status:400});
  await assert.rejects(checkProof(encode({...challenge,parameters:{...challenge.parameters,cost:1e9}},solution),secret),{status:400});
  await assert.rejects(checkProof(encode(challenge,{...solution,derivedKey:'0'.repeat(64)}),secret),{status:400});
});
test('replayed proof is rejected and transaction stores only one message',async()=>{
  const {sql,db}=database();const now=Date.now(),proof={signature:'test-proof',expiresAt:Math.floor(now/1000)+300};
  await saveSubmission(db,'<script>plain text only</script>',proof,now);
  await assert.rejects(saveSubmission(db,'second',proof,now),{status:409});
  const rows=sql.prepare('SELECT * FROM messages').all();assert.equal(rows.length,1);
  assert.deepEqual(Object.keys(rows[0]),['id','body','day','is_read']);
  assert.equal(sql.prepare('SELECT count FROM limits WHERE capacity=30').get()!.count,1);
  sql.close();
});
test('shared quota fails atomically and expired messages are cleaned up',async()=>{
  const {sql,db}=database();const now=Date.now();
  sql.prepare('INSERT INTO messages VALUES (?,?,?,0)').run('old','expired','2020-01-01');
  for(let i=0;i<30;i++)await saveSubmission(db,'message '+i,{signature:'test-'+i,expiresAt:Math.floor(now/1000)+300},now);
  await assert.rejects(saveSubmission(db,'over quota',{signature:'over',expiresAt:Math.floor(now/1000)+300},now),{status:429});
  assert.equal(sql.prepare('SELECT count(*) n FROM messages').get()!.n,30);
  assert.equal(sql.prepare('SELECT count(*) n FROM used_proofs').get()!.n,30);
  sql.close();
});
