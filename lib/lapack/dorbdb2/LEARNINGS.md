# dorbdb2: Translation Learnings

## Translation pitfalls

- **The Fortran-documented `LWORK >= M-Q` constraint is wrong.** The
  actual minimum (computed inside the routine) is
  `max(ILARF+LLARF-1, IORBDB5+LORBDB5-1)` where `LLARF = max(P-1, M-P, Q-1)`
  and `LORBDB5 = Q-1`. For my Test 1 (M=10, P=3, Q=5) the reported
  M-Q=5 wasn't enough — the routine needed 8. I had to switch every
  Fortran test case to `lwork = NMAX*NMAX` to dodge the bug. The JS
  signature documents the actual requirement
  (`max(P-1, M-P, Q-1)` after dropping the `ILARF=2` shift) and lets
  callers pass any sufficient buffer.
- **Variant 2 reduces ROWS, not columns** (unlike dorbdb1 which
  reduces columns). The outer loop runs over `I = 1, P` (rows of
  X11), not `I = 1, Q`. The inner branch tests `I < P`, not
  `I < Q-1`, so PHI/TAUP1 have length `P-1`, not `Q-1`.
- **Two distinct loops:** rows 1..P (the bidiagonalization) and
  rows P+1..Q (reducing the bottom-right of X21 to the identity).
  When P=Q, the second loop never runs (test `p_eq_q` covers this).
  When P=0, the first loop never runs (test `p0_only_second_loop`
  covers this).
- **`drot` is applied to PAIRS of rows from DIFFERENT matrices:**
  `DROT(Q-I+1, X11(I,I), LDX11, X21(I-1,I), LDX21, C, S)`. Note that
  X21 is indexed at `(I-1,I)`, one row "above" the X11 row. In JS
  this becomes `oX21ii - strideX211` — easy to typo as `+ strideX211`.
- **The `c, s` rotation values come from the previous iteration's
  PHI**, not from a fresh atan2. They're computed at the bottom of
  iteration i (when `i < P-1`) and consumed at the top of iteration
  i+1. For the first iteration, the if-guard skips the drot.
- **The dnrm2 expression for `s`** combines a column-of-X11 norm
  (rows i+1..P-1) with a column-of-X21 norm (rows i..M-P-1). The
  starting row indices differ — X11 starts at `i+1`, X21 starts at
  `i`. Easy to misalign.

## Test-design pitfalls

- The dorbdb1 LEARNINGS warning about FP-order divergence in
  Gram-Schmidt orthonormalization applies here too: I print `X11in`
  and `X21in` from Fortran into the fixture and load them in JS
  rather than recomputing. Reusing dorbdb1's `init_orthonormal_columns`,
  `save_inputs`, `pack_matrix`, and `zero_outputs` test_utils helpers
  worked verbatim.
- Make sure to test `P=1` (no inner `i<P-1` branch), `P=Q` (second
  loop runs zero times), `P=0` (first loop runs zero times), and
  `Q=0` (full quick-return).

## Dependency interface surprises

- `dscal` is needed (in addition to dorbdb1's deps) because dorbdb2
  has an explicit `CALL DSCAL( P-I, NEGONE, X11(I+1,I), 1 )` to
  negate part of an X11 column. Don't inline it as a manual loop —
  just require `lib/blas/base/dscal/lib/base.js`.
- The `Q1` reflector is computed via `dlarfgp` *along a row* of
  X11 (stride `strideX112`), not along a column. dlarfgp's
  `(alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau)` API
  handles arbitrary strides cleanly — pass `strideX112` for `strideX`.

## Coverage notes

- 100% line + 100% branch on base.js. The six fixture cases plus
  the validation tests cover every branch:
  - `m10_p3_q5`, `m12_p4_q6`: full path including i<P-1 branch and
    second loop
  - `p1_no_taup1`: P=1, inner i<P-1 branch never taken
  - `p_eq_q`: P=Q, second loop runs zero times
  - `p0_only_second_loop`: P=0, only the second loop runs
  - `q0_quick_return`: both loops never execute
- 100% on the layout wrapper (`dorbdb2.js`) by exercising row-major
  + column-major LD validation as well as all four dimension
  constraint branches.

## Process improvements

- The scaffold-emitted `dorbdb2.js` had the same brittle LD-validator
  bugs flagged in dorbdb1's LEARNINGS: it referenced an undefined
  `N` and assumed square matrices. Audit by hand against the Fortran
  spec; for the dorbdb-family rectangular X11 (`P`-by-`Q`) the
  column-major bound is `LDX11 >= max(1,P)` and row-major is
  `LDX11 >= max(1,Q)`.
- `python bin/deps.py dorbdb2` reports the JS-resolvable deps but
  misses la_constants/la_xisnan plus the BLAS routines that live
  in BLAS-3.12.0. The test deps file needs all of these manually
  added (copied from dorbdb1's deps file as a starting point).
- Reusing dorbdb1's test infrastructure (`init_orthonormal_columns`,
  `pack_matrix`, `save_inputs`, `zero_outputs`) verbatim made the
  Fortran test ~50 lines shorter than starting from scratch. These
  helpers are good candidates for promotion into `test_utils.f90`
  if dorbdb3/dorbdb4 are translated next.
