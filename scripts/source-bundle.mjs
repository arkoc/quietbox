import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
// Explicit allowlist: never include runtime state, secrets, database files, or Git.
const roots = ['app','lib','db','drizzle','build','scripts','vendor','components','hooks'];
const files = ['package.json','package-lock.json','components.json','eslint.config.mjs','tsconfig.json','vite.config.ts','next.config.ts','postcss.config.mjs','drizzle.config.ts','cloudflare-env.d.ts','.gitignore','.npmrc','.env.example','.openai/hosting.json','README.md','REVIEW.md','LICENSE','public/favicon.svg'];
function walk(path) { for(const item of readdirSync(path).sort()){ const p=path+'/'+item; if(statSync(p).isDirectory())walk(p);else files.push(p); } }
for(const root of roots)walk(root);
try{walk('tests');}catch{}
files.sort();
const entries=files.map(path=>{const content=readFileSync(path,'utf8');return {path,content,sha256:createHash('sha256').update(content).digest('hex')};});
mkdirSync('public',{recursive:true});
writeFileSync('public/source.json',JSON.stringify({version:JSON.parse(readFileSync('package.json','utf8')).version,files:entries.filter(f=>f.path !== 'package-lock.json' && !f.path.startsWith('vendor/'))}));
execFileSync('tar',['-czf','public/quietbox-source.tar.gz',...files],{env:{...process.env,COPYFILE_DISABLE:'1'}});
console.log(`Published ${files.length} source files; runtime secrets and data excluded.`);
