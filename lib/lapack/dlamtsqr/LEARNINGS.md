# dlamtsqr: Translation Learnings

## Translation pitfalls

- The four (SIDE, TRANS) combinations have asymmetric block-iteration
  directions that mirror the "appliers" pattern documented in the SKILL:
  `(left, transpose)` and `(right, no-transpose)` iterate forward through
  reflector blocks; `(left, no-transpose)` and `(right, transpose)` iterate
  backward. The Fortran loop end terms differ by ±(MB-K), and the trailing
  partial block is handled before vs. after the loop depending on direction.
  Mapped the Fortran 1-based loops to 0-based by replacing `II = M - KK + 1`
  with `ii = M - kk` and adjusting the loop end from `MB+1` to `mb` (inclusive).
- The fall-through condition is `MB <= K || MB >= max(M, N, K)` — when the
  TSQR partition is degenerate, defer to a single `dgemqrt` call.
- The `T` storage shape from `dlatsqr` is `nb`-by-`(numblk * K)`, with
  blocks for successive row partitions stacked horizontally. The CTR
  variable steps `K` columns per block (`offsetT + ctr*K*strideT2`).
- Quick return condition is `M==0 || N==0 || K==0` (matches Fortran's
  `MIN(M,N,K).EQ.0`).
- Standard string mappings: `SIDE = 'L'/'R'` → `'left'`/`'right'`,
  `TRANS = 'N'/'T'` → `'no-transpose'`/`'transpose'` per the canonical table.
- Removed `LWORK` from the JS API — workspace queries are not part of the
  stdlib convention. Added a documented expectation that callers size WORK
  to `N*nb` (left) or `mb*nb` (right) doubles.

## Dependency interface surprises

- `dgemqrt` and `dtpmqrt` already have the right "WORK as logically 2-D"
  semantics — pass the user's `WORK, strideWORK, offsetWORK` through unmodified
  and the kernels handle the 2-D logical layout internally.
- For `dtpmqrt` calls in this routine, `l = 0` always (purely-rectangular
  reflector block) since dlatsqr's row blocks are rectangular.
- The Fortran `XERBLA` validation includes a check `K < NB` which means
  the `K=0` quick-return case can only be exercised with `NB <= K = 0` —
  i.e., never via the Fortran reference test. We exercise it from the JS
  side directly (the JS validator allows nb >= 1 with K = 0 and short-circuits
  via the `K === 0` quick-return before the inner code runs).

## Test/Fortran fixture gotchas

- `deps.py` did not include the transitive dependencies needed to compile
  the Fortran test. Had to add `dgeqrt`, `dgeqrt2`, `dgeqrt3`, `disnan`,
  `dlaisnan`, `dlamch`, `dlapy2`, `dlarfg`, `dlatsqr`, `dtpqrt`, `dtpqrt2`
  to `deps_dlamtsqr.txt` (they are pulled in transitively via `dlatsqr`,
  which is invoked in the test program to set up V/T factors).
- The Fortran test uses a `pack_matrix` helper to flatten N-by-M
  submatrices out of the NMAX-by-NMAX storage before printing — this
  avoids the leading-dimension/EQUIVALENCE stride mismatch documented
  in the SKILL.
- JS tests rebuild C with the same `sin`/`cos` formulas as the Fortran,
  using 1-based `(i+1, j+1)` indices to match. Verified bit-for-bit
  parity to ~1e-12.
