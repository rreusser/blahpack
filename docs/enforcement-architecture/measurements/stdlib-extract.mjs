import fs from 'fs'; import path from 'path';
import * as acorn from '../../../node_modules/acorn/dist/acorn.mjs';
import * as walk from '../../../node_modules/acorn-walk/dist/walk.mjs';
const ROOT=process.argv[2]; const pkgs=process.argv[3].split(','); const mode=process.argv[4]||'stdlib';
const out=[];
function analyze(p, name){
  if(!fs.existsSync(p)) return null;
  let src=fs.readFileSync(p,'utf8');
  let ast; try{ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:mode==='stdlib'?'script':'module',allowReturnOutsideFunction:true})}catch(e){return {err:true}}
  const fns=[]; walk.full(ast,n=>{if(n.type==='FunctionDeclaration')fns.push(n)});
  const fn=fns.find(f=>f.id.name===name)||fns[fns.length-1]; if(!fn) return null;
  const params=fn.params.map(q=>q.name);
  const checks=[]; let quick=false;
  walk.full(fn,n=>{ if(n.type==='IfStatement'){ let th=false,ret=false; walk.full(n.consequent,m=>{if(m.type==='ThrowStatement')th=true; if(m.type==='ReturnStatement')ret=true;});
     const tids=[]; walk.full(n.test,m=>{if(m.type==='Identifier')tids.push(m.name)});
     if(th){ let kind='other'; const t=src.slice(n.test.start,n.test.end);
       if(/^!is\w+\(/.test(t)||/=== null/.test(t)) kind='enum'; else if(/<\s*0$/.test(t)) kind='nonneg'; else if(/=== 0$/.test(t)) kind='nonzero'; else if(/LD\w*\s*</.test(t)) kind='ld';
       const p=tids.find(x=>params.includes(x)); checks.push(kind+':'+(p||'?')); }
     else if(ret && /=== 0|alpha|beta/.test(src.slice(n.test.start,n.test.end))) quick=true; }});
  // validators used
  const vals=[...new Set((src.match(/(?:is[A-Z]\w+|resolveStr|\w+ResolveStr)\s*\(/g)||[]).map(s=>s.replace(/\s*\($/,'')))];
  return {params, checks, quick, vals};
}
for(const pkg of pkgs){ const dir=path.join(ROOT,pkg); for(const r of fs.readdirSync(dir).sort()){
  const lib=path.join(dir,r,'lib'); if(!fs.existsSync(path.join(lib,'ndarray.js'))) continue;
  out.push({pkg,r, strided:analyze(path.join(lib,r+'.js'),r), ndarray:analyze(path.join(lib,'ndarray.js'),r), base:analyze(path.join(lib,'base.js'),r)});
}}
fs.writeFileSync(process.argv[5], JSON.stringify(out));
console.log(out.length,'modules');
