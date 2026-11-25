---
id: 0096
title: dggsvd3 accepts and allocates a WORK too small for its dggsvp3 call, and returns a wrong decomposition
status: resolved
area: wrappers
opened: 2026-11-25
resolved: 2026-11-25
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

## Evidence 2026-11-25 (2): the class, corpus-wide

`test/harness/replay.js` now has a `min-work` variant. It replays every recorded `ndarray.js` call with each workspace cut to the minimum `ndarray.js` itself demands, which it reads from the RangeError for an empty workspace, and requires the same results.

Over all 912 modules (main `0a9cd465b`) it flags 17 modules. At the declared minimum, these return NaN or wrong results:
- dggsvd3, zggsvd3 and dggsvp3 (the cause: dggsvp3 assumed dgeqp3 allocates its own workspace);
- dorbdb2, dorbdb3, zunbdb2, zunbdb3 and zunbdb4;
- dorm22 and zunm22;
- dormlq;
- dlaqr2 and zlaqr3;
- dtrsen and ztrsen.

dgelss and zgelss choose their path by workspace size, so their findings may be legitimate. zgeev timed out.

How the class was permitted:
- `bin/workspace-guard.mjs` checks only that the wrapper allocates at least what `ndarray.js` demands;
- `harness:assertWorkspaceSufficient` runs only where a test calls it;
- nothing checked the declared minimum against what `base.js` touches.

## Resolution

Fixed on branch `slop/gracious-dijkstra-q3yg0i` (ticket 0096 PR).

- **The check:** a new `min-work` variant of the wrapper replay (`test/harness/replay.js`, in CI through `check:modules`) replays every recorded `ndarray.js` call with each workspace cut to the minimum `ndarray.js` itself demands. It requires the same results. CONVENTIONS W3 names it as an enforcer.
  - An output that the reference itself makes depend on LWORK is marked `workDependent` in the spec, by an override with its reason: dgelss's and zgelss's A (singular vectors, determined only up to sign) and B's residual rows. Such outputs are not compared.
- **What it and direct tests at sizes past the blocking threshold found:** 32 modules whose declared minimum was below what `base.js` uses. All are fixed, each with a regression test that fails, or hangs, on the old code:
  - **dggsvp3, zggsvp3, dggsvd3, zggsvd3:** this ticket's bug, and its twin and callee.
  - **dgelss, zgelss.**
  - **dorbdb2, dorbdb3, zunbdb2, zunbdb3, zunbdb4.**
  - **dorm22, zunm22, dormlq.**
  - **dtrsen, ztrsen.**
  - **dlaqr2, dlaqr3, zlaqr2, zlaqr3; dlaqr0, dlaqr4, zlaqr0, zlaqr4.**
  - **dgeev, zgeev, dgees, zgees, dgeevx, zgeevx; dhseqr, zhseqr.**

  `test/harness/LEARNINGS.md` lists the bug classes.
- **Left open:** the structural cause behind most of these is that blocked JS routines always block, so the minimums are larger than the reference's. That is ticket 0100, as is the replay's limit to the sizes the tests reach.

