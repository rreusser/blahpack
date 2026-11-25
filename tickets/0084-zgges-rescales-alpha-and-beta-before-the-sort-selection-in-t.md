---
id: 0084
title: zgges rescales ALPHA and BETA before the sort selection in the opposite direction from zgges.f
status: open
area: base
opened: 2026-11-25
---

## Problem

Before the sort selection, `zgges.f:528-531` calls `ZLASCL('G',0,0,ANRM,ANRMTO,...)` on ALPHA (and BNRM/BNRMTO on BETA), which applies the scaling a second time. `lib/lapack/base/zgges/lib/base.js:259,262` scale from ANRMTO to ANRM, which undoes it. That matches `dgges.f:541`, so the JS may have fixed a reference quirk on purpose, but no DIFFERENCES.md entry or comment says so. The visible effects:
- `selctg` sees different values when A or B was scaled;
- when ztgsen fails, the final ALPHA is S_ii*anrm/anrmto in the JS and S_ii*anrmto/anrm in the reference.

## Evidence

Found while bringing zgges to its coverage floor (ticket 0069). With A = diag(3e-160, 1e-160), B = I and `selctg = |lambda| < 2e-160`:
- JS: selctg receives [3e-160, 1e-160], and the call returns info = 0, sdim = 1.
- Reference, worked out by reading the code (gfortran was not available): selctg receives about [1.5e-117, 5e-118], the eigenvalues times (ANRMTO/ANRM)^2. Nothing is reordered, and the final recount gives INFO = N+2.

## Reproduce

Save as `repro.mjs` in the repository root and run `node repro.mjs`:

```js
// Repro: zgges base.js:259/262 rescale ALPHA/BETA before selection with
// zlascl(anrmto -> anrm) / zlascl(bnrmto -> bnrm), i.e. they UNDO the scaling.
// Reference zgges.f:528-531 calls ZLASCL('G',0,0,ANRM,ANRMTO,...) and
// ZLASCL('G',0,0,BNRM,BNRMTO,...), i.e. it scales by ANRMTO/ANRM AGAIN
// (dgges.f:541 uses ANRMTO,ANRM like the JS). So SELCTG sees different values.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgges from '/home/user/blahpack/lib/lapack/base/zgges/lib/ndarray.js';

const N = 2;
const A = new Complex128Array( N * N ); const B = new Complex128Array( N * N );
const av = reinterpret( A, 0 ); const bv = reinterpret( B, 0 );
av[ 0 ] = 3e-160; av[ 6 ] = 1e-160; bv[ 0 ] = 1; bv[ 6 ] = 1;  // anrm = 3e-160 < SMLNUM ~ 6.7e-139 => ilascl
const seen = [];
const sel = ( ar, ai, br, bi ) => { seen.push( ar / br ); return Math.abs( ar / br ) < 2e-160; };
const sdim = new Int32Array( 1 );
const info = zgges( 'compute-vectors', 'compute-vectors', 'sort', sel, N, A, 1, N, 0, B, 1, N, 0, sdim, new Complex128Array( N ), 1, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( 20 ), 1, 0, new Float64Array( 20 ), 1, 0, new Uint8Array( N ), 1, 0 );
const smlnum = Math.sqrt( 2.2250738585072014e-308 ) / 2.220446049250313e-16;
const f = smlnum / 3e-160;
console.log( 'JS:  info', info, 'sdim', sdim[ 0 ], ' selctg first-pass args (alpha/beta):', seen.slice( 0, N ) );
console.log( 'Ref (by reading zgges.f): first-pass args = eigenvalue * (ANRMTO/ANRM)^2 =', [ 3e-160 * f * f, 1e-160 * f * f ], '=> nothing selected, no reorder; final recount selects index 1 after unselected index 0 => INFO = N+2 = 4, SDIM = 1' );
```

## Direction

Decide the intended behaviour. Either:
- follow the reference exactly (X rules), or
- keep dgges's direction and record the deviation in the module's DIFFERENCES.md with the reason.

Compile zgges.f to confirm the reference result for the input above.
