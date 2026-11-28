# zungtsqr_row: Translation Learnings

## Translation pitfalls

- The Fortran `KB_LAST = ((N-1)/NBLOCAL)*NBLOCAL + 1` is integer
  truncation. In JS this MUST be `(((N-1)/nblocal)|0)*nblocal + 1`
  (bitwise `|0` for integer divide). Without `|0` you silently get a
  fractional KB_LAST and the loop misbehaves on some shapes.
- The bottom-up sweep's `JB_T` accounting in Fortran is 1-based and
  decremented BEFORE use inside the IB loop. The 0-based offset into
  T's column dimension is `(jb_t + kb - 2) * strideT2` (subtracting two
  for the two 1-to-0 conversions of `jb_t` and `kb`).
- The "dummy-B" branch (`MB1 - KB - KNB + 1 == 0`) is reachable for very
  small shapes only — e.g. M=2, N=2, MB=3, NB=2 (since MB > N is required).
  Test case `m2_n2_mb3_nb2_dummyB` triggers it. Without an explicit small
  case the branch is uncovered.
- The `MB > N` precondition (Fortran spec) is non-obvious — it's
  required for the row-block accounting to make sense. The wrapper
  validators don't enforce it (left to the caller), but the test suite
  must respect it (e.g. dummy-B test uses MB=3 not MB=N+0=2).

## Dependency interface surprises

- `zlarfb_gett` accepts `'identity'` / `'not-identity'` (canonical long
  forms), not the Fortran `'I'` / `'N'`. Already documented in its
  ndarray validator.
- `zlarfb_gett` treats WORK as a 2D `K`-by-(K or N-K) buffer with its
  own (strideWORK1, strideWORK2). When passing a 1D WORK from
  `zungtsqr_row`, set `strideWORK1 = strideWORK` and
  `strideWORK2 = nblocal * strideWORK` to match the Fortran
  column-major view with leading dimension `KNB`.
- `zlaset` takes `Complex128` alpha/beta scalars (not Float64Array(2));
  hoist them as module-level constants `ZERO`/`ONE` to avoid per-call
  allocation.

## Complex number handling

- All complex arithmetic in this routine is delegated to dependencies
  (`zlaset`, `zlarfb_gett`); the routine itself never inlines a complex
  multiply or divide. The two `Complex128` constants (`ZERO`, `ONE`)
  are the only complex-typed values touched directly.
- `Complex128Array` strides into `A` and `T` are passed straight through
  to the dependencies; no per-element `reinterpret` is required at this
  level.

## Test-pattern reuse

- Used the same fixture pattern as `zlatsqr`: build A in JS via the same
  fill function as the Fortran test, run JS `zlatsqr` to produce V/T,
  then call `zungtsqr_row` and compare. This double-tests both
  routines but `zlatsqr` has its own dedicated fixture suite, so the
  added confidence outweighs the redundancy.
- Verified mathematical orthonormality (`Q^H * Q = I_n`) in addition to
  exact element matching against the Fortran fixture. Orthonormality is
  the contract of the routine and is invariant under non-unique sign
  choices in the Householder vectors.
- Row-major test calls `zungtsqr_row` directly with row-major V and T
  layouts after manually transposing both arrays from a column-major
  `zlatsqr` result.

## Fortran test deps quirk

- The Fortran test calls both `ZLATSQR` and `ZUNGTSQR_ROW`, so its
  `deps_zungtsqr_row.txt` must list `zlatsqr` and the full transitive
  set (`zgeqrt`, `ztpqrt`, `zlarfb`, `zlarfg`, `zladiv`, `dladiv`,
  `dlamch`, `dlapy3`, `ieeeck`, `ilaenv`, `iparmq`, `zlacgv`, `zcopy`,
  `zgemm`, `ztrmm`, `zlaset`, `zlarfb_gett`, `zgeqrt2`, `zgeqrt3`,
  `ztpqrt2`, `ztprfb`). `bin/init_routine.py`'s deps file is
  insufficient — the Fortran test depends on more than the JS deps tree.
