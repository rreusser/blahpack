import fs from 'fs'; import path from 'path';
import * as acorn from '../../../node_modules/acorn/dist/acorn.mjs';
import * as walk from '../../../node_modules/acorn-walk/dist/walk.mjs';
const ROOT=path.resolve(import.meta.dirname,'../../../lib');
const ORD0=['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth','Seventeenth','Eighteenth','Nineteenth','Twentieth'];
const U=['','First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth'];const T={20:'Twenty',30:'Thirty',40:'Forty'};const ORD=[...ORD0];for(let n=21;n<50;n++){const t=Math.floor(n/10)*10,u=n%10;ORD.push(u?T[t]+'-'+U[u].toLowerCase():(T[t].replace(/y$/,'ieth')));}
const stats={}; const inc=(k,n=1)=>stats[k]=(stats[k]||0)+n; const ex={}; const addEx=(k,v)=>{(ex[k]=ex[k]||[]); if(ex[k].length<6) ex[k].push(v)};
const msgShapes={};
for (const pkg of ['blas','lapack']) for (const r of fs.readdirSync(path.join(ROOT,pkg))) {
  const dir=path.join(ROOT,pkg,r,'lib');
  for (const f of ['strided.js', r+'.js', 'base.js']) {
    const p=path.join(dir,f); if(!fs.existsSync(p)) {inc('missing:'+(f==='base.js'?'base':f==='strided.js'?'strided':'routine'));continue;}
    const kind=f==='base.js'?'base':f==='strided.js'?'strided':'routine';
    let ast; try{ast=acorn.parse(fs.readFileSync(p,'utf8'),{ecmaVersion:'latest',sourceType:'module'})}catch(e){inc('parsefail:'+kind);continue;}
    const fn=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===r) || ast.body.find(n=>n.type==='FunctionDeclaration');
    if(!fn){inc('nofn:'+kind);continue;}
    const params=fn.params.map(p=>p.name);
    inc('files:'+kind);
    let throws=0;
    walk.full(fn,n=>{
      if(n.type==='ThrowStatement'){ throws++;
        const ctor=n.argument.callee?.name||n.argument.type;
        inc(kind+':throw:'+ctor);
        // message
        const a=n.argument.arguments?.[0];
        let msg=null;
        if(a?.type==='Literal') {msg=a.value; inc(kind+':msg:raw-literal'); addEx(kind+':msg:raw-literal',r);}
        else if(a?.type==='CallExpression'&&a.callee.name==='format'&&a.arguments[0]?.type==='Literal') msg=a.arguments[0].value;
        else if(a?.type==='TemplateLiteral'){inc(kind+':msg:template');addEx(kind+':msg:template',r);}
        else if(a?.type==='BinaryExpression'){inc(kind+':msg:concat');addEx(kind+':msg:concat',r);}
        if(msg){
          const shape=msg.replace(/`[^`]*`/g,'`X`').replace(/\b(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|Thirteenth|Fourteenth|Fifteenth|Sixteenth|Seventeenth|Eighteenth|Nineteenth|Twentieth|Twenty-\w+|Thirtieth|Thirty-\w+)\b/g,'NTH').replace(/max\([^)]*\)/g,'max(..)').replace(/%[sd]/g,'%x');
          msgShapes[shape]=(msgShapes[shape]||0)+1;
          // ordinal correctness: find the checked identifier in the throw's format args
          const m=msg.match(/^invalid argument\. (\w+(?:-\w+)?) argument/);
          const valArg=a.arguments?.[1];
          if(m&&valArg?.type==='Identifier'){
            const idx=params.indexOf(valArg.name);
            if(idx>=0){ if(ORD[idx]===m[1]) inc(kind+':ordinal:ok'); else {inc(kind+':ordinal:WRONG'); (ex.W=ex.W||[]).push(`${r}/${f}: ${m[1]} for ${valArg.name}@${idx+1}`);addEx(kind+':ordinal:WRONG', `${r}/${f}: says ${m[1]} for ${valArg.name} (pos ${idx+1})`);} }
          }
          if(!/^invalid argument\./.test(msg)) addEx(kind+':msg:nonstd', `${r}: ${msg.slice(0,80)}`);
        }
      }
    });
    if(kind!=='base') {
      // which params get validated at all: identifiers appearing in an if-test whose consequent throws
      const checked=new Set();
      walk.full(fn,n=>{ if(n.type==='IfStatement'){ let t=false; walk.full(n.consequent,m=>{if(m.type==='ThrowStatement')t=true}); if(t) walk.full(n.test,m=>{if(m.type==='Identifier')checked.add(m.name)}) }});
      for(const p of params){
        let cls= /^stride/.test(p)?'stride': /^offset/.test(p)?'offset': /^LD[A-Z]/.test(p)?'LD': /^[MNK]$|^N[A-Z]+$|^K[LU]$|^ILO$|^IHI$/.test(p)?'dim': /^(uplo|trans\w*|side|diag|order|job\w*|norm|compq|compz|vect|direct|storev|range|fact|equed|howmny|sort|balanc|sense|way|pivot|type|dist|sym|init|id|cmach|joba|jobp|jobr|jobt|transr|signs|order)$/i.test(p)?'string':'other';
        inc(`${kind}:param:${cls}:${checked.has(p)?'validated':'unvalidated'}`);
        if(cls==='stride'&&!checked.has(p)&&/^stride[A-Z]+$/.test(p)) addEx(kind+':vecstride-unvalidated',r+':'+p);
        if(cls==='dim'&&!checked.has(p)) addEx(kind+':dim-unvalidated',r+':'+p);
        if(cls==='string'&&!checked.has(p)) addEx(kind+':string-unvalidated',r+':'+p);
      }
      if(throws===0){inc(kind+':zero-throws'); addEx(kind+':zero-throws',r);}
    } else {
      if(throws>0){inc('base:has-throws'); addEx('base:has-throws',r);}
      const src=fs.readFileSync(p,'utf8');
      // BLIS indexing heuristics
      if(params.some(p=>/^LD[A-Z]/.test(p))){inc('base:LD-param'); addEx('base:LD-param',r);}
      // array params with stride but no offset or vice versa
      const arrs=params.filter(p=>/^[A-Z][A-Z0-9]*$/.test(p) && !/^(M|N|K|KL|KU|NRHS|ILO|IHI|LD\w)$/.test(p));
      for(const A of arrs){ const hasOff=params.includes('offset'+A); const hasS=params.includes('stride'+A)||params.includes('stride'+A+'1');
        if(params.includes('offset'+A)||hasS){ if(!hasOff||!hasS){inc('base:array-incomplete-stride/offset'); addEx('base:array-incomplete',r+':'+A);} }
      }
      // Fortran-style 1-based index arithmetic leftovers
      if(/\(\s*\w+\s*-\s*1\s*\)\s*\*\s*stride/.test(src)){inc('base:minus-one-times-stride'); addEx('base:minus-one-times-stride',r);}
      if(/\[\s*\w+\s*\+\s*\w+\s*\*\s*LD[A-Z]/.test(src)){inc('base:i+j*LD-indexing');addEx('base:i+j*LD',r);}
      // does base touch an array index expression that does NOT mention offsetX or a derived index var? skip.
    }
  }
}
console.log(JSON.stringify(stats,null,1));
console.log('--- message shapes (top 40)');
Object.entries(msgShapes).sort((a,b)=>b[1]-a[1]).slice(0,40).forEach(([k,v])=>console.log(v,k));
console.log('distinct shapes:',Object.keys(msgShapes).length);
console.log((ex.W||[]).length);console.log((ex.W||[]).join('\n'))
