import fs from 'fs'; import path from 'path';
import * as acorn from '../../../node_modules/acorn/dist/acorn.mjs';
import * as walk from '../../../node_modules/acorn-walk/dist/walk.mjs';
const ROOT=path.resolve(import.meta.dirname,'../../../lib');
const res={}; const inc=(k,n=1)=>res[k]=(res[k]||0)+n; const ex={}; const addEx=(k,v)=>{(ex[k]=ex[k]||[]);ex[k].push(v)};
const ids=(node)=>{const s=new Set(); walk.full(node,n=>{if(n.type==='Identifier')s.add(n.name)}); return s;};
const mods=new Set();
for (const pkg of ['blas','lapack']) for (const r of fs.readdirSync(path.join(ROOT,pkg,'base'))) {
  const p=path.join(ROOT,pkg,'base',r,'lib','base.js'); if(!fs.existsSync(p)) continue;
  const ast=acorn.parse(fs.readFileSync(p,'utf8'),{ecmaVersion:'latest',sourceType:'module',locations:true});
  const fn=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===r)||ast.body.filter(n=>n.type==='FunctionDeclaration').pop();
  if(!fn) continue;
  const params=fn.params.map(q=>q.name);
  if(params.some(q=>/^LD[A-Z0-9]+$/.test(q))){inc('LD-param-in-base'); addEx('LD-param-in-base',r+': '+params.filter(q=>/^LD/.test(q)).join(','));}
  const arrays={};
  for(const q of params){ const m=q.match(/^offset(\w+)$/); if(m&&params.includes(m[1])) arrays[m[1]]={offset:q,strides:params.filter(s=>s==='stride'+m[1]||s==='stride'+m[1]+'1'||s==='stride'+m[1]+'2')}; }
  // array param lacking offset/stride entirely (typed-array-looking uppercase param w/o offset)
  const ownOf=new Map(); for(const A in arrays){ ownOf.set(arrays[A].offset,A); arrays[A].strides.forEach(s=>ownOf.set(s,A)); }
  const deps=new Map(); params.forEach(q=>deps.set(q,new Set([q])));
  const alias=new Map(); const assigns=[]; const helpers=new Map();
  // helpers: any nested function (declaration or const x = (..)=>) inside fn or at module level
  const collectHelper=(name,f)=>{ const s=[]; walk.full(f.body,n=>{if(n.type==='ReturnStatement'&&n.argument)s.push(n.argument)}); if(f.body.type!=='BlockStatement') s.push(f.body); helpers.set(name,s); };
  walk.full(ast,n=>{ if(n!==fn&&n.type==='FunctionDeclaration') collectHelper(n.id.name,n); if(n.type==='VariableDeclarator'&&n.init&&/Function|Arrow/.test(n.init.type)) collectHelper(n.id.name,n.init); });
  walk.full(fn,n=>{
    if(n.type==='VariableDeclarator'&&n.init) assigns.push([n.id.name,n.init]);
    if(n.type==='AssignmentExpression'&&n.left.type==='Identifier') assigns.push([n.left.name,n.right]);
  });
  for(const [v,init] of assigns){ if((init.type==='CallExpression'&&init.callee.name==='reinterpret'&&init.arguments[0]?.type==='Identifier'&&arrays[init.arguments[0].name])) alias.set(v,init.arguments[0].name); if(init.type==='Identifier'&&arrays[init.name]) alias.set(v,init.name); }
  const depOf=(node,seen=new Set())=>{const out=new Set(); for(const i of ids(node)){ for(const d of (deps.get(i)||[])) out.add(d); if(helpers.has(i)&&!seen.has(i)){seen.add(i); for(const e of helpers.get(i)) depOf(e,seen).forEach(d=>out.add(d));} } return out;};
  let changed=true,it=0; while(changed&&it++<50){changed=false; for(const [v,init] of assigns){ if(!deps.has(v))deps.set(v,new Set()); const s=deps.get(v); for(const d of depOf(init)) if(!s.has(d)){s.add(d);changed=true;} }}
  const arrOf=(name)=>arrays[name]?name:alias.get(name);
  walk.full(fn,n=>{
    if(n.type==='MemberExpression'&&n.computed&&n.object.type==='Identifier'){
      const A=arrOf(n.object.name); if(!A) return; inc('accesses');
      const d=depOf(n.property);
      if(!d.has(arrays[A].offset)){inc('E1-missing-own-offset'); mods.add(r); addEx('E1-missing-own-offset',`${r} L${n.loc.start.line} ${n.object.name}`);}
      const foreign=[...d].filter(x=>ownOf.has(x)&&ownOf.get(x)!==A);
      if(foreign.length){inc('E2-foreign-stride/offset'); mods.add(r); addEx('E2-foreign-stride/offset',`${r} L${n.loc.start.line} ${n.object.name}[] uses ${foreign.join(',')}`);}
    }
    if(n.type==='CallExpression'&&n.callee.type==='Identifier'&&n.callee.name!=='reinterpret'){
      n.arguments.forEach((a,i)=>{ if(a.type!=='Identifier')return; const A=arrOf(a.name); if(!A)return; const s=n.arguments[i+1];
        if(!s) return;
        if(s.type==='Literal'&&typeof s.value==='number'){inc('E3-literal-stride-for-strided-param'); mods.add(r); addEx('E3-literal-stride',`${r} L${n.loc.start.line} ${n.callee.name}(${a.name}, ${s.value}, …)`);}
        else { const d=depOf(s); const ownS=arrays[A].strides; if(ownS.length && !ownS.some(x=>d.has(x))){inc('E4-callee-stride-not-from-own-strides'); mods.add(r); addEx('E4-callee-stride',`${r} L${n.loc.start.line} ${n.callee.name}(${a.name}, <${[...d].join(',')||'const'}>)`);} }
      });
    }
  });
}
res.modulesFlagged=mods.size;
console.log(res);
for(const k in ex){console.log('===',k,ex[k].length); ex[k].slice(0,25).forEach(x=>console.log(' ',x));}
