---
id: 0078
title: Some base.js routines re-apply the BLAS negative-stride offset and read out of bounds
status: open
area: strides
opened: 2026-11-23
---

## Problem

In the stdlib ndarray convention, `offsetX` already addresses the first logical element, whatever the stride's sign. A `base.js` that also applies the BLAS start-index rule for a negative stride (`ix = offsetX - (N-1)*strideX`) starts past the end of the vector. Out-of-range typed-array reads return `undefined`, so the result is NaN. Every caller that passes a negative stride inherits the wrong result. Nothing compares a routine's negative-stride results with its positive-stride results on the same logical vector:
- the wrapper replay compares the wrapper with `ndarray.js`, which share `base.js`;
- the property harness's negative-stride layouts cover only routines with harness validation.

## Evidence

- `lib/lapack/base/dlassq/lib/base.js:68` (and `zlassq/lib/base.js:79`): `if ( strideX < 0 ) { ix = offsetX - (( N - 1 ) * strideX); }`.
- `dlassq` on [3,4] with stride 1 gives scale 1, sumsq 25. The same logical vector stored as [4,3] with stride -1 and offset 1 gives sumsq NaN.
- This propagates to every Frobenius norm built on *lassq: `dlangt('frobenius', 2, …, [3,4], -1, …)` returns NaN; expected sqrt(27). Reported by a wave-2 agent for ticket 0069.
- Related: ticket 0044 (negative strides in the scaled triangular solvers).

## Reproduce

```bash
grep -rn "if ( strideX < 0 )" lib/lapack/base/dlassq/lib/base.js lib/lapack/base/zlassq/lib/base.js
```

## Direction

Add a replay variant at the `ndarray.js` level. For each recorded call and each float vector with a positive stride, rebuild the vector reversed with a negative stride (offset at its first logical element, unused slots NaN), and require the results to match the positive-stride call. That needs the vector's true length, which the length audit already measures.
