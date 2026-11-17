import fs from 'fs'; import path from 'path';
const db=new Set(); for(const line of fs.readFileSync((process.env.STDLIB_DIR||'/Users/rreusser/gh/stdlib-js/stdlib')+'/lib/node_modules/@stdlib/error/tools/database/data/data.csv','utf8').split('\n')){ const m=line.match(/^"[^"]*","(.*)","\w*"$/); if(m) db.add(m[1].replace(/""/g,'"')); }
const scan=(root,pkgs)=>{ let tot=0,hit=0; const miss={}; const hitM={};
 for(const pkg of pkgs){ const d=path.join(root,pkg); for(const r of fs.readdirSync(d)){ const lib=path.join(d,r,'lib'); if(!fs.existsSync(lib)) continue;
  for(const f of fs.readdirSync(lib)){ if(!f.endsWith('.js')||/native/.test(f)) continue; const src=fs.readFileSync(path.join(lib,f),'utf8');
   for(const m of src.matchAll(/throw new \w+\(\s*format\(\s*'((?:[^'\\]|\\.)*)'/g)){ tot++; const s=m[1].replace(/\\'/g,"'"); if(db.has(s)){hit++;hitM[s]=(hitM[s]||0)+1;} else miss[s]=(miss[s]||0)+1; } } } }
 return {tot,hit,miss,hitM}; };
const st=scan((process.env.STDLIB_DIR||'/Users/rreusser/gh/stdlib-js/stdlib')+'/lib/node_modules/@stdlib',['blas/base','lapack/base']);
const bp=scan(new URL('../../../lib',import.meta.url).pathname,['blas/base','lapack/base']);
console.log('stdlib blas/lapack throws: ',st.tot,'in DB:',st.hit);
console.log('blahpack throws:',bp.tot,'in DB:',bp.hit, 'distinct missing:',Object.keys(bp.miss).length);
console.log('stdlib misses:'); Object.entries(st.miss).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(([k,v])=>console.log(' ',v,k));
console.log('blahpack top misses:'); Object.entries(bp.miss).sort((a,b)=>b[1]-a[1]).slice(0,12).forEach(([k,v])=>console.log(' ',v,k));
