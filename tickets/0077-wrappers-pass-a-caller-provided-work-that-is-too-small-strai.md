---
id: 0077
title: Wrappers pass a caller-provided WORK that is too small straight to base.js, which returns NaN instead of throwing
status: open
area: wrappers
opened: 2026-11-23
---

## Problem

When the caller supplies `WORK` (non-null) to a `<routine>.js` wrapper, some wrappers pass it straight to `base.js` without the size check `ndarray.js` performs. An undersized buffer then makes typed-array reads past its end return `undefined`, and the results are NaN with no error. Sibling wrappers (`zunmlq`, `zunmrq`) throw a RangeError for the same input. CONVENTIONS D5c covers the `null` branch only; nothing requires the wrapper to validate a caller's buffer, and nothing checks that it does.

## Evidence

- `dormql`, `dormrq`, `dormtr` and `zunmtr` wrappers (`lib/lapack/base/<r>/lib/<r>.js`) pass a non-null `WORK` to `base.js` unchecked; reported by the wave-1 agent for ticket 0072.
- `zunmlq.js` and `zunmrq.js` check the length and throw RangeError.

- `zpbsvx`'s `ndarray.js` checks the length of WORK but not of RWORK, which needs N: `RWORK = new Float64Array( 1 )` with N = 3 raises no error. Reported by a wave-3 agent.

- `dgelss.js` and `zgelss.js` pass a caller's WORK to `base.js` with no length check, while `ndarray.js` requires `computeWorkSize( M, N, nrhs )`. `zgelss( 'column-major', 5, 4, 40, A, 5, B, 5, S, 1, -1, [0], new Complex128Array( 100 ), null )` runs through the wrapper and throws through `ndarray.js`. Reported by a wave-3 agent.

## Reproduce

```bash
grep -n "WORK" lib/lapack/base/dormql/lib/dormql.js | head
```

## Direction

The wrapper replay could add a variant passing a caller workspace one element shorter than the wrapper's own `null` allocation, and require a RangeError (or, if the routine adapts its blocking to the size it gets, a correct result).

## Evidence 2026-11-25

`zlahef_rook`'s own tests passed `W` at half its required size (`N*nb`), and nothing threw. The result was NaN, and the test asserted only `kb`. A size check in `ndarray.js` would have rejected the test call.
