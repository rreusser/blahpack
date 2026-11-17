import os,re,sys,collections
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'../../..'))
src={}
for d in ['data/BLAS-3.12.0','data/lapack-3.12.0/SRC']:
  for f in os.listdir(os.path.join(R,d)):
    if f.endswith(('.f','.f90')): src.setdefault(f.rsplit('.',1)[0].lower(),os.path.join(R,d,f))
stats=collections.Counter(); kinds=collections.Counter(); ex=collections.defaultdict(list)
for pkg in ['blas','lapack']:
  for r in sorted(os.listdir(f'{R}/lib/{pkg}/base')):
    p=src.get(r)
    if not p: stats['no-fortran']+=1; continue
    txt=open(p,errors='replace').read()
    lines=[l for l in txt.split('\n') if l and l[0] not in 'cC*!']
    body='\n'.join(lines)
    body=re.sub(r'\n     [^ ]\s*',' ',body)  # join continuation lines
    # BLAS uses INFO = k + XERBLA; LAPACK uses INFO = -k
    checks=re.findall(r'IF\s*\((.*?)\)\s*THEN\s*\n\s*INFO\s*=\s*(-?\s*\d+)',body,re.I)
    if not checks: stats['no-arg-checks']+=1; ex['none'].append(r); continue
    stats['has-arg-checks']+=1; stats['total-checks']+=len(checks)
    for c,k in checks:
      c=' '.join(c.split()).upper()
      if re.fullmatch(r'\w+\s*\.LT\.\s*0',c): kinds['dim<0']+=1
      elif re.fullmatch(r'LD\w+\s*\.LT\.\s*MAX\(\s*1\s*,\s*\w+\s*\)',c): kinds['ld<max(1,X)']+=1
      elif re.fullmatch(r'\w+\s*\.EQ\.\s*0',c): kinds['stride==0']+=1
      elif re.match(r'\.NOT\.\s*\(?\s*LSAME',c) or re.match(r'\(?\.NOT\.\s*LSAME',c) or 'LSAME' in c: kinds['enum']+=1
      else: kinds['other']+=1; ex['other'].append(f'{r}: {c[:90]}')
print(dict(stats)); print(dict(kinds))
import random; random.seed(1)
for x in random.sample(ex['other'],25): print('  ',x)
print('no checks e.g.', ex['none'][:15])
