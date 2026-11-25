---
id: 0083
title: zgges continues to back-permutation, unscaling and SDIM recount after zhgeqz fails, where the reference skips them
status: open
area: base
opened: 2026-11-25
---

## Problem

When ZHGEQZ fails, `zgges.f:510-518` sets INFO and does `GO TO 30`. That skips the back-permutation, the undo-scaling of A, B, ALPHA and BETA, and the SDIM recount, so SDIM stays 0. `lib/lapack/base/zgges/lib/base.js:242-253` calls `finalize()` instead. That undoes the scaling and, when sorting, recounts SDIM, which can overwrite INFO with N+2. The JS and the reference return different INFO, SDIM and scaling on this path.

## Evidence

Found while bringing zgges to its coverage floor (ticket 0069). The path is reachable only when zhgeqz fails, so it was reproduced by substituting a failing zhgeqz (test/harness/constants.js `importWithDependencies`). With N = 2 and sort on:

| Input | Reference | JS |
| --- | --- | --- |
| `selctg` always true | info = 1, sdim = 0 | info = 1, sdim = 2 |
| `selctg` selects only the second eigenvalue | info = 1, sdim = 0 | info = 4 (N+2), sdim = 1 |
| tiny A (1e-160) | A and ALPHA left scaled | both unscaled |

Because a test asserting the reference behaviour would fail, lines 242-253 have no test. Check whether dgges has the same structure.

## Reproduce

Save as `repro.mjs` in the repository root and run `node repro.mjs`:

```js
// Repro: zgges base.js:242-253 — when zhgeqz fails, the reference (zgges.f:510-518)
// does GO TO 30, skipping the undo-scaling and the SDIM recount. The JS calls
// finalize(), which undoes scaling and recounts SDIM (possibly setting INFO=N+2).
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import { importWithDependencies } from './test/harness/constants.js';

const base = ( await importWithDependencies( new URL( './lib/lapack/base/zgges/lib/base.js', import.meta.url ), {
	'../../zhgeqz/lib/base.js': function failingZhgeqz() { return 1; } // reference IERR = 1 (QZ failed at index 1)
}) ).default;

function run( selctg, scaleA ) {
	const N = 2;
	const sdim = new Int32Array( 1 );
	const A = new Complex128Array( N * N );
	const B = new Complex128Array( N * N );
	const av = reinterpret( A, 0 ); const bv = reinterpret( B, 0 );
	av[ 0 ] = 2 * scaleA; av[ 6 ] = 3 * scaleA; bv[ 0 ] = 1; bv[ 6 ] = 1;
	const ALPHA = new Complex128Array( [ 7, 0, 7, 0 ] );
	const BETA = new Complex128Array( [ 1, 0, 1, 0 ] );
	const info = base( 'no-vectors', 'no-vectors', 'sort', selctg, N, A, 1, N, 0, B, 1, N, 0, sdim, ALPHA, 1, 0, BETA, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 20 ), 1, 0, new Float64Array( 20 ), 1, 0, new Uint8Array( N ), 1, 0 );
	return { info, sdim: sdim[ 0 ], A00: av[ 0 ], ALPHA0: reinterpret( ALPHA, 0 )[ 0 ] };
}
let k = 0;
console.log( 'selctg=true:      ', run( () => true, 1 ), ' reference: info=1 sdim=0' );
console.log( 'selctg=F,T:       ', run( () => ( k++ % 2 ) === 1, 1 ), ' reference: info=1 sdim=0' );
console.log( 'tiny A (1e-160):  ', run( () => false, 1e-160 ), ' reference: A00 and ALPHA0 left scaled (A00 ~ 2*SMLNUM/anrm*1e-160, ALPHA0 = 7*SMLNUM/anrm), JS unscales' );
```

## Direction

Follow the reference: on a ZHGEQZ failure, return with INFO set and SDIM = 0, without finalize(). Then add the substitution test asserting the table above, and check dgges and the other gges/ggev drivers for the same shortcut.
