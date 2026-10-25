import { readdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?walk(`${dir}/${e.name}`):`${dir}/${e.name}`))).flat();}
const files=(await walk('dist')).filter(f=>!f.endsWith('/sw.js'));const hash=createHash('sha256');for(const file of files)hash.update(await readFile(file));const version=hash.digest('hex').slice(0,12);
await writeFile('dist/sw.js',`const PREFIX='pocket-island-'+self.location.pathname+'-';const CACHE=PREFIX+'${version}';
const ROOT=new URL('./',self.location.href);const ASSETS=${JSON.stringify(files.map(f=>'./'+f.slice(5)))};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==ROOT.origin)return;e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request,{ignoreVary:true});if(hit)return hit;try{return await fetch(e.request);}catch(err){if(e.request.mode==='navigate')return await c.match(new URL('index.html',ROOT));throw err;}}));});`);
