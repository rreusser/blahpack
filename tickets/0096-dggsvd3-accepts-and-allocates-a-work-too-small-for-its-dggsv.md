---
id: 0096
title: dggsvd3 accepts and allocates a WORK too small for its dggsvp3 call, and returns a wrong decomposition
status: open
area: wrappers
opened: 2026-11-25
---

## Problem

The JS dggsvd3 accepts a WORK of `max( 1, 2*N )` elements, and allocates that much when `WORK` is `null`. That is too small for the routines it calls. With such a WORK it returns `info = 0` and a wrong generalized SVD. So the standard interface called with `WORK = null`, the documented convenience, silently gives wrong results.

The reference checks only `LWORK >= 1` itself. It passes `LWORK - N` to DGGSVP3, which passes it to DGEQP3, and DGEQP3 rejects an LWORK below `3*N+1` (`dgeqp3.f:213`) through XERBLA. So the reference never computes with too little workspace. In the JS, the callee's workspace check is lost: base routines take a caller-sized WORK and do not validate it.

## Evidence

- For M = N = P = 3, any WORK under 11 elements returns `info = 0` with L = 1 and alpha = [0, 0, 0], where the correct answer is L = 3. The ticket 0094 caller-fix agent found this while writing the dggsvd3 example; the example now passes an explicit 256-element WORK.
- `lib/lapack/base/dggsvd3/lib/dggsvd3.js:124` allocates `max( 1, 2*N )` when WORK is null.
- `lib/lapack/base/dggsvd3/lib/ndarray.js:95` accepts that as the minimum.
- The same agent saw no size dependence in zggsvd3.
- How it was permitted: `bin/workspace-guard.mjs` checks that a wrapper allocates at least the minimum `ndarray.js` demands. Here both use the same too-small minimum, and nothing derives the minimum from the reference's callee chain.

## Reproduce

Save as `repro.mjs` in the repository root and run `node repro.mjs`. It prints `L 1`, with alpha all zero, at lwork 6, and `L 3` at lwork 11 and 256:

```js
import f from './lib/lapack/base/dggsvd3/lib/ndarray.js';
const A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 10 ] );
const B = new Float64Array( [ 2, 0, 1, 1, 3, 0, 0, 1, 4 ] );
for ( const lw of [ 6, 11, 256 ] ) {
	const K = new Int32Array( 1 ), L = new Int32Array( 1 ), al = new Float64Array( 3 ), be = new Float64Array( 3 );
	const info = f( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 3, K, L, A.slice(), 1, 3, 0, B.slice(), 1, 3, 0, al, 1, 0, be, 1, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( lw ), 1, 0, new Int32Array( 3 ), 1, 0 );
	console.log( 'lwork', lw, 'info', info, 'K', K[ 0 ], 'L', L[ 0 ], 'alpha', Array.from( al ).map( ( x ) => x.toFixed( 4 ) ) );
}
```
