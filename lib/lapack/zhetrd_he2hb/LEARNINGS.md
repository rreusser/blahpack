# zhetrd_he2hb: Translation Learnings

## Translation pitfalls

- **`deps.py` undercounts external calls.** The script reported only 4
  dependencies (`zcopy`, `zgemm`, `zhemm`, `zher2k`) but the Fortran source
  also calls `ZGELQF`, `ZGEQRF`, `ZLARFT`, and `ZLASET`. The fact that the
  `EXTERNAL` declaration appeared on a continuation line might have thrown
  off the regex. Always grep the source for `CALL ` and cross-check against
  `bin/deps.py` output before scaffolding — the Fortran deps file also has
  to be filled in manually.
- **Quick-return ZCOPY strides.** The Fortran for the band-copy step uses
  `ZCOPY(LK, A(J,J), LDA, AB(KD+1,J), LDAB-1)` — that is, A is traversed
  with row-stride LDA (effectively reading down columns, but advancing the
  base offset to the next column on each call), while AB is traversed with
  stride `LDAB-1`, which in stride/offset form is `strideAB2 - strideAB1`.
  This anti-diagonal stride is what places `A(J+k,J+k)` into `AB(KD+1+k, J+k)`
  for the upper variant. Getting either stride wrong silently corrupts the
  band copy.
- **The "lower" trapezoidal `ZLASET` on the reflector block.** After
  `ZGELQF` (upper) or `ZGEQRF` (lower), part of the panel contains the
  reflector vectors V. Before forming T and applying the rank-2k update,
  Fortran overwrites the lower trapezoid (upper variant) or upper trapezoid
  (lower variant) with the identity (1 on the diagonal, 0 below/above).
  This is what makes V usable as a "full" matrix in subsequent BLAS calls.
  Skipping this step (or running it on the wrong region) yields a silently
  wrong reduction with no visible error.
- **`ILAENV2STAGE` is replaced by simple constants.** The Fortran computes
  `LWMIN = N*KD + N*max(KD,FACTOPTNB) + 2*KD*KD` via `IPARAM2STAGE`. In
  JS we ignore the `WORK` parameter entirely and allocate `T`, `W`, `S1`,
  and `S2` directly. Callers can pass `null` for `WORK`.
- **The `LWORK = -1` workspace query and `INFO < 0` argument validation are
  intentionally dropped** — the wrapper validates positively (throws
  `TypeError`/`RangeError`) and `base.js` never returns negative info.
- **Outer loop index aligns with `KD` step.** Fortran: `DO I = 1, N-KD, KD`
  is 1-based with stride `KD`. In 0-based JS this is `for (i = 0; i < N-kd;
  i += kd)`. The terminator is `< N-kd`, NOT `<= N-kd-1`, because the
  Fortran `N-KD` upper bound is inclusive in 1-based indexing, which is
  exclusive in 0-based.

## Dependency interface surprises

- **`zlaset`'s third uplo value is "anything that isn't 'upper'/'lower'".**
  There is no explicit `'full'` branch — the routine falls through to the
  `else` clause when `uplo` doesn't match either. We pass `'full'` for
  readability; any other string would work too. This is undocumented in
  the JSDoc.
- **`zher2k` takes a Complex128 alpha but a plain `number` beta.** This
  matches the Fortran (RONE is `DOUBLE PRECISION`), but is easy to miss
  when copying the call from neighboring routines that use Complex128 for
  both.
- **`zgeqrf` and `zgelqf` accept `null` for WORK.** They allocate internal
  workspace if `WORK` is missing/undersized. This avoids us having to
  replicate the `LWORK_QUERY = N*KD + N*max(KD,FACTOPTNB) + 2*KD*KD`
  partitioning that `IPARAM2STAGE` defines.
- **`zlarft` takes complex-element strides** (not Float64). It internally
  multiplies by 2 to view as Float64. Pass `T, 1, ldT, 0` directly.

## Complex number handling

- All complex scalars (`ZERO`, `ONE`, `NEG_ONE`, `NEG_HALF`) are hoisted to
  module scope. No per-call allocation of these constants.
- The Hermitian rank-2k update `ZHER2K(UPLO, 'Conjugate', ...)` is the
  Hermitian variant (real-valued beta `RONE = 1`). We pass `1.0` (not a
  Complex128) for the beta argument.
- The `'Conjugate'` Fortran string for `ZGEMM`/`ZHER2K` maps to the
  canonical `'conjugate-transpose'` long-form. The `'No transpose'` string
  maps to `'no-transpose'`.

## Test/fixture pitfalls

- **EQUIVALENCE stride matches declared dimension.** Each Fortran test case
  declares the test matrix with `(NMAX, NMAX)` where `NMAX = N` for that
  case (e.g. `A8(8,8)` for the N=8 test). This avoids the silent
  "padding leaks into the next column" bug described in the SKILL doc.
- **N=12 multi-panel test needs looser tolerance.** Because the blocked
  reduction accumulates many FLOPs per matrix entry, JS-vs-Fortran rounding
  differences can reach ~1e-9 (relative) on the lower variant. We use
  1e-9/1e-8 relative tolerances for the N=12 cases; 1e-12 still works for
  N=8.

## Missing automation

- `bin/deps.py` should detect external calls in subroutines, not only the
  ones it currently catches. Translations after this one will continue to
  hit the same issue and silently end up with too-small deps files.
- `bin/lint-fix.sh` aggressively reflows multi-line block comments by
  inserting blank lines between sentences, then `stdlib/capitalized-comments`
  capitalizes each new "sentence". The result destroys multi-line prose.
  Workaround: write all explanatory comments as single trailing line
  comments rather than multi-line blocks.
