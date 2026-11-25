---
id: 0026
title: zgees returns NaN in the Schur form for matrices whose norm is below about 1e-140
status: open
area: base
opened: 2026-11-20
---

## Problem

`zgees` returns `info = 0` with NaN entries in the strict upper triangle of the Schur form `A` (and in `VS` when vectors are computed) whenever the input's max-abs norm is below `smlnum` (`sqrt(safmin)/eps`, about 6.7e-139). That is the `scalea` path, which scales `A` up to `smlnum` before the QR iteration. Real `dgees` handles the same inputs correctly. A silent NaN with `info = 0` is the worst failure mode: nothing tells the caller the result is garbage.

## Evidence

- Found 2026-11-20 while building layout tests for the stride-provenance rule (Step 4), in the canonical layout. It's not a layout or stride bug.
- Input norm 1, 1e-100 and 1e150: finite. Input norm 1e-140 and 1e-150: NaN, with `sort` either `'none'` or `'sort'`, and with or without vectors.
- `zlascl` itself scales correctly between these magnitudes (checked directly for `'general'`, `'upper'` and `'lower'`), so the NaN is produced earlier, in the balance/Hessenberg/`zhseqr` stage on the `smlnum`-sized matrix.
- Next step: bisect `zgebal` → `zgehrd` → `zhseqr` on the scaled matrix against the reference Fortran (`test/run_fortran.sh`), then record the root cause in `test/harness/LEARNINGS.md`.

## Reproduce

```bash
node --input-type=module -e "
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgees from './lib/lapack/base/zgees/lib/ndarray.js';
const N = 5; let s = 12345; const r = () => ( s = ( s * 1103515245 + 12345 ) % 2147483648 ) / 2147483648 - 0.5;
const A = new Complex128Array( Float64Array.from( { length: 2*N*N }, () => r() * 1e-150 ) );
const info = zgees( 'no-vectors', 'none', () => false, N, A, 1, N, 0, new Int32Array( 1 ), new Complex128Array( N ), 1, 0, new Complex128Array( N*N ), 1, N, 0, new Complex128Array( 10*N ), 1, 0, new Float64Array( N ), 1, 0, new Uint8Array( N ), 1, 0 );
console.log( 'info', info, 'finite', new Float64Array( A.buffer ).every( Number.isFinite ) );
"
```

## Evidence 2026-11-25: inaccurate, not only NaN, and already at N = 3

Found while bringing zgees to its coverage floor (ticket 0069):
- A general, non-triangular matrix of norm about 1e-150 with `compute-vectors` returns no NaN at N = 3, but ||Z^H Z - I|| is 1.7e-12 (`'none'`) and 1.2e-12 (`'sort'`).
- At norm 1e-140 it is 4.1e-11, against about 7e-16 at norms 1, 1e-130 or 1e150.
- An already triangular tiny input stays accurate (about 2e-16) through the scaling and the ztrsen reordering. So the loss is in the QR iteration on the scaled matrix (about 6.7e-139), not in zlascl or ztrsen.
- This is probably the same root cause as the NaN at N >= 5.

zgees's tests use only triangular tiny inputs, so the tiny-norm accuracy has no test yet.

Save as `repro.mjs` in the repository root, then run `node repro.mjs 3 1e-150 none`:

```js
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgees from './lib/lapack/base/zgees/lib/ndarray.js';
const N=+process.argv[2], sc=+process.argv[3], sort=process.argv[4];
let s = 12345; const r = () => ( s = ( s * 1103515245 + 12345 ) % 2147483648 ) / 2147483648 - 0.5;
const d = Float64Array.from( { length: 2*N*N }, () => r() * sc );
const A = new Complex128Array( d );
const VS=new Complex128Array( N*N ), W=new Complex128Array( N );
const info = zgees( 'compute-vectors', sort, (w) => w.re<0, N, A, 1, N, 0, new Int32Array( 1 ), W, 1, 0, VS, 1, N, 0, new Complex128Array( 10*N ), 1, 0, new Float64Array( N ), 1, 0, new Uint8Array( N ), 1, 0 );
const Z=new Float64Array(VS.buffer);
let err=0;
for (let i=0;i<N;i++) for (let j=0;j<N;j++){let sr=0,si=0;for(let k=0;k<N;k++){const ar=Z[2*(k+i*N)],ai=-Z[2*(k+i*N)+1],br=Z[2*(k+j*N)],bi=Z[2*(k+j*N)+1];sr+=ar*br-ai*bi;si+=ar*bi+ai*br;} err=Math.max(err,Math.abs(sr-(i==j))+Math.abs(si));}
console.log('info',info,'unitarity err',err, Array.from(Z.slice(0,2*N)));
```

