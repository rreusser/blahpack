# dorgtsqr_row: Translation Learnings

## Translation pitfalls

- The Fortran spec requires `MB > N` strictly (not `MB >= N`). There is
  no `MB <= N` fall-through; that case is rejected with `INFO = -3`. We
  therefore do not implement a fall-back to `dorgqr` in the JS port — the
  caller is expected to have produced the V/T input via `dlatsqr` under
  the same constraint.
- The `kbLast` formula `((N-1) / nblocal) * nblocal + 1` uses Fortran
  integer division, but `N >= 1` here (we already early-returned on
  `N === 0`), so the dividend is non-negative and `((N-1) / nblocal) | 0`
  is safe (no negative-truncation gotcha).
- The `JB_T` walk is the column index into `T` for the row-block reflector
  sequences, advancing **backward** (`JB_T -= N`) as the row sweep moves
  from bottom-up. Initial value: `(num_all_row_blocks) * N + 1`
  (1-based) where `num_all_row_blocks = ((M - MB - 1) / MB2) + 2`. We
  fold this into a single 0-based offset expression at the call site
  rather than tracking `JB_T` independently of `(jbT + kb - 2) * strideT2`.
- The "dummy" branch (Fortran `DUMMY(1,1)`) fires when the current column
  block exactly fills the remaining height of the top row block
  (`mb1 - kb - knb + 1 === 0`). In JS we just pass `M=0` and any valid
  array reference (we reuse `A` itself with a benign offset since
  `dlarfb_gett` is guarded on `M < 0` / `M === 0` early-return); no
  separate dummy buffer is allocated.
- Block geometry: when `mb >= M` the bottom-up sweep is skipped entirely
  (only the "top row block" path runs), and `mb1 = M`. When `mb < M`,
  `mb1 = mb`. Test cases need to cover both branches plus the boundary
  case where `MB > M` triggers `dlatsqr`'s fall-through-to-`dgeqrt` path.

## Dependency interface surprises

- `dlarfb_gett` exposes the `ident` flag as long-form
  `'identity'` / `'not-identity'` — these are the *canonical* strings, not
  the Fortran `'I'` / `'N'`. Passing the short forms silently no-ops the
  V1 multiply branch.
- `dlarfb_gett`'s `WORK` is a 2D matrix with separate `strideWORK1`,
  `strideWORK2`, `offsetWORK`. The Fortran caller passes
  `LDWORK = KNB`, which maps to `strideWORK1 = 1, strideWORK2 = knb`
  (column-major). Allocating `WORK` of length
  `nblocal * MAX(nblocal, N - nblocal)` is sufficient.
- The exposed `strideWORK` parameter on `dorgtsqr_row` is currently
  required to be `1` — the routine treats `WORK` as a column-major
  `nblocal`-by-* matrix and computes `strideWORK2 = knb` internally.
  This matches the Fortran reference (which has no choice in WORK
  layout), but a future refactor could thread a separate `strideWORK2`
  through the API if any caller actually wants non-unit row stride.

## Test infrastructure notes

- The fixture stores both the post-`dlatsqr` `A` (`Ain`, the V matrix)
  and `T` (`Tin`) so the JS test can replay the identical input rather
  than re-running `dlatsqr` (which is itself under test). The JS test
  driver allocates exact-sized column-major buffers with leading
  dimensions matching the Fortran pack: `M` for `A`, `NB` for `T`.
- The Fortran test deps file (`deps_dorgtsqr_row.txt`) needs the full
  `dlatsqr` chain (`dgeqrt`, `dgeqrt2`, `dgeqrt3`, `disnan`, `dlaisnan`,
  `dlamch`, `dlapy2`, `dlarfb`, `dlarfg`, `dtpqrt`, `dtpqrt2`, `dtprfb`,
  plus the usual `ieeeck`/`ilaenv`/`iparmq`) because the test program
  calls `DLATSQR` to manufacture the V/T input. `bin/init_routine.py`
  only sees `dlarfb_gett` + `dlaset` (the JS deps), so this had to be
  hand-extended.

## Coverage gaps

- `base.js` reaches 100% line / 100% branch coverage on the test suite —
  the 10 fixture cases plus the offset and orthonormality tests cover
  both the bottom-up sweep, the `mb >= M` fast path, the `KK > 0` dummy
  branch, and the `KB_LAST = 1` (`NB == N`) single-column-block sweep.
