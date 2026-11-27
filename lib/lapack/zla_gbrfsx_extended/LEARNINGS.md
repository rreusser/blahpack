# zla_gbrfsx_extended: Translation Learnings

## Translation pitfalls

- The reference Fortran routine calls `BLAS_ZGBMV_X` and `BLAS_ZGBMV2_X`
  from the extended-precision BLAS (XBLAS). These symbols are NOT part
  of the standard LAPACK/BLAS build and would fail to link against the
  blahpack Fortran test harness. Workaround: we maintain a modified copy
  of the Fortran source at `pipeline/zla_gbrfsx_extended/base_only.f`
  that (a) strips the `BLAS_ZGBMV_X`/`BLAS_ZGBMV2_X` externals, (b)
  deletes both the `EXTRA_RESIDUAL` and `EXTRA_Y` residual branches and
  always calls `ZGBMV`, and (c) forces `Y_PREC_STATE = BASE_RESIDUAL`
  at loop entry. The JS implementation mirrors this reduction: the
  `prec_type` parameter is accepted for API compatibility but ignored,
  and the entry state is `BASE_RESIDUAL`. Run the fixture generator
  with `./test/run_fortran.sh lapack zla_gbrfsx_extended --source
  pipeline/zla_gbrfsx_extended/base_only.f`.
- The upstream Fortran has a subtle quirk: the residual `ZGBMV` call
  uses `M = KL+KU+1` (number of rows of band storage) instead of `N`.
  For a square `N`-by-`N` band matrix this means the computation only
  updates the first `KL+KU+1` entries of RES, leaving `RES[N-1]` etc.
  equal to `B` on each iteration. JS must faithfully reproduce this to
  match Fortran output byte-for-byte — do not "fix" it to `N, N`.
- The Fortran signature includes both `Y` (solution matrix, 2D) and
  `DY` (update workspace, 1D). `bin/signature.py` emits `Y` as `Y` but
  lowercases `DY` to `y`, which collides with `strideY`/`offsetY` and
  produces a function with two parameters named `offsetY`. In strict
  mode JS this is a `SyntaxError` at load time. Fix: rename the `DY`
  parameter to `DY`/`strideDY`/`offsetDY` in base.js, ndarray.js, and
  the layout wrapper (and in the tests that call them). Any future
  routine whose Fortran signature has a 2D array plus a 1D array
  sharing the same first letter needs the same manual rename.
- `bin/signature.py` drops `NRHS` from the JS signature (it's marked
  "consumed" because it's treated as a loop bound). For this routine,
  `NRHS` is a first-class argument — we need it to drive the outer
  RHS loop. Add `nrhs` manually after `ku` in base.js, ndarray.js, and
  the layout wrapper; bump the layout wrapper arity test accordingly.
- The routine's initial `Y_PREC_STATE = EXTRA_RESIDUAL` (= 1) is NOT
  equivalent to `BASE_RESIDUAL` (= 0) in the state-machine transitions
  that happen later. The `incr_prec` escalation increments
  `y_prec_state` by 1, and starting from 1 reaches `EXTRA_Y` (= 2)
  after a single escalation — which then takes the ZLA_WWADDW update
  path instead of ZAXPY. Matching the modified Fortran fixture
  generator requires starting at `BASE_RESIDUAL` in JS too.

## Fortran test pitfalls

- Declaring `err_bnds_norm(NRHS_MAX, 3)` with `NRHS_MAX=2` and then
  passing `NRHS=1` causes a **silent leading-dimension mismatch**: the
  routine treats the array as `(1, *)` with LD=1 and writes
  `err_bnds_norm(1,2)` at flat offset 1, but Fortran's slice
  `err_bnds_norm(1,:)` reads from the caller's LD=2 layout and returns
  an unrelated column. Symptom: `err_bnds_*_row1` in the fixture stays
  equal to the trust-flag initialization `[1, 0, 0]` even though the
  routine actually wrote a non-zero value. Fix: declare
  `err_bnds_norm` and `err_bnds_comp` as flat 1D workspaces and index
  them manually (`(j,k)` → `j + (k-1)*NRHS`). This is a specific
  instance of the generic "EQUIVALENCE LD mismatch" class already in
  the CLAUDE.md checklist.
- `Infinity` literals appear in fixture JSONL when a branch stores
  `HUGEVAL * HUGEVAL` (e.g., `final_dz_z` on divergent componentwise
  tracking). Bare `Infinity` is not valid JSON; the fixture reader in
  `test.ndarray.js` replaces `Infinity` with `1e309` before calling
  `JSON.parse`, and `assertClose` short-circuits when `expected` is
  non-finite.

## Dependency interface surprises

- `zla_gbamv` takes a `trans` string (not the LAPACK `TRANS_TYPE`
  integer the Fortran reference passes). Pass the same `trans` string
  used elsewhere in the routine (`'no-transpose'` /
  `'conjugate-transpose'`); for CABS1-based absolute-value GEMV,
  transpose and conjugate-transpose produce the same numerical result.
- `zla_lin_berr` writes `berr[offset]` in place (does not return a
  scalar); pass the full `BERR_OUT` array with the correct stride and
  offset (`offset = offsetBERR_OUT + j*strideBERR_OUT`).
- `zgbmv` / `zcopy` / `zaxpy` take complex scalars as `Complex128`
  objects, not plain `{re, im}` literals — use cached `CONE` / `CNONE`
  module-level constants.

## Unreachable branches

- Lines that zero `Y_TAIL` on routine entry (`y_prec_state === EXTRA_Y`
  check before the iteration loop) are dead: we force
  `y_prec_state = BASE_RESIDUAL` unconditionally. The subsequent
  `incr_prec`-triggered zero of `Y_TAIL` inside the iteration IS
  reachable (when the precision escalates during refinement), and is
  covered by the tests.
- Several `x_state`/`z_state` transition edges are exercised only by
  pathological state sequences (NOPROG→WORKING recovery via an
  improved `dxrat`, z-state UNSTABLE→WORKING→UNSTABLE flip-flops).
  Coverage reaches ~95% lines / ~86% branches with the included tests;
  the remainder is documented in `conformance.config.json` exceptions only if
  required and not applied here.
