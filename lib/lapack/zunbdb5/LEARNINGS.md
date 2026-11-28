# zunbdb5: Translation Learnings

## Translation pitfalls

- The scaffolded signature included redundant `incx1, incx2` slots
  alongside `strideX1, strideX2` (a recurring `bin/signature.py` gap
  that has now bitten both `dorbdb5` and `zunbdb6`). The Fortran's
  `INCX*` should consume into `stride*` only; the extra slot must be
  removed by hand from `base.js`, `ndarray.js`, and `zunbdb5.js`. The
  scaffolded `test.zunbdb5.js` then has the wrong arity (16 instead
  of 14) and must be rewritten.
- `DLAMCH('Precision')` → `Number.EPSILON` (= `@stdlib/constants/float64/eps`),
  same as the dorbdb5 case. Do NOT confuse with `DLAMCH('E')` (= EPSILON/2).
- Real-to-complex port is otherwise mechanical, matching the recipe
  in SKILL.md:
  - `Float64Array` → `Complex128Array`
  - `dnrm2`/`dscal`/`dlassq` → `dznrm2`/`zscal`/`zlassq`
  - `1.0/norm` real scalar → `new Complex128(1.0/norm, 0.0)` for `zscal`
  - Setting `X[i] = 1.0` for the basis-search unit vectors uses the
    reinterpreted Float64 view (`X1v[ ix ] = 1.0; X1v[ ix+1 ] = 0.0`)
    so we avoid allocating a `Complex128(1, 0)` per iteration.
  - The `zero()` helper also operates on the Float64 view with doubled
    strides/offsets — exactly the pattern used in zunbdb6.

## Dependency interface surprises

- `zscal` takes its scale factor as a `Complex128` (not a Float64Array
  pair), unlike `zdscal` which takes a real scalar. The Fortran
  passes `ONE / NORM` (a complex literal divided by a real), so JS
  must wrap `1.0/norm` in a `Complex128` even though imag is zero.
- `dznrm2(N, x, strideX, offsetX)` returns the Euclidean norm of a
  complex vector — same signature shape as `dnrm2` but the input is
  `Complex128Array`. No surprises.
- `zunbdb6` is invoked as the projection kernel (Gram-Schmidt with
  reorthogonalization). Its `info` return is intentionally discarded
  (Fortran's `CHILDINFO`), mirroring the real-precision case.
- `zlassq` returns `{scl, sumsq}` chained across calls (same as
  `dlassq`).

## Complex number handling

- `1.0` and `0.0` complex literals: building `new Complex128(...)` in
  hot loops would allocate; the basis-search inner loop instead writes
  directly into the reinterpreted Float64 view (`X1v[ix] = 1.0;
  X1v[ix+1] = 0.0`), matching the convention in zunbdb6's `zero()`.
- `CONE` / `CZERO` / `CNEGONE` constants from zunbdb6 are NOT needed
  here because zunbdb5 does not call `zgemv` directly — it delegates
  the actual projection arithmetic to zunbdb6.

## Coverage gaps

- 100% line and branch coverage on `base.js`, `ndarray.js`, `main.js`.
  All three return paths are exercised: the unit-projection branch
  (basic tests), the X1 basis-search branch (`zero_x_finds_e3_in_x1`),
  and the X2 basis-search branch (`zero_x_finds_e_first_in_x2`).
- The `tiny_x_falls_through_to_basis_search` case (X norm < N*eps with
  X != 0) covers the edge where `norm > N*EPS` is false but X1 isn't
  literally zero on entry.
- `complex_q_one_col` is a single-column genuinely complex Q test
  that exercises the conjugate-transpose path through `zunbdb6` —
  important because all the other fixture cases happen to have real
  Q, where `Q^H == Q^T`.

## Test-design notes

- Reused the `buildQ`/`assertArrayClose` helpers verbatim from
  zunbdb6's `test.ndarray.js`. These are now a clear candidate for a
  shared `test/_helpers.js` in the orbdb/unbdb family (3+ routines
  use them).
- The Fortran test mostly mirrors `test_dorbdb5.f90` with `complex*16`
  arrays + `EQUIVALENCE` for printing — same pattern as `test_zunbdb6.f90`.
  Added one extra case (`complex_q_one_col`) to exercise the truly
  complex projection path.
- The `nonzero offsets are honored` JS test is hand-built (no Fortran
  fixture) because the Fortran reference doesn't accept arbitrary
  base offsets — only stride.

## Process improvements

- `bin/init_routine.py` produces a `deps_<routine>.txt` file that
  misses `dznrm2`, `zscal`, and `zgemv` (transitively via zunbdb6).
  Had to add them manually plus the `la_constants`/`la_xisnan`/`disnan`/
  `dlaisnan` Fortran-only deps required by `zlassq`. Same recurring
  gap noted across many translations — `deps.py` doesn't follow
  transitive BLAS dependencies through wrapper routines.
- Benchmark scaffold would have allocated `N*N` complex elements (256
  GB at N=10^4); pre-empted by switching to the `M=len, N=min(len, 16)`
  pattern from dorbdb5/zunbdb6.
- `bin/init_routine.py` scaffolded `test/test.zunbdb5.js` expecting
  arity 16 (with `incx1, incx2`); had to be rewritten to arity 14
  after removing the redundant slots. Worth fixing at the
  `bin/signature.py` source so the count is right from the start.
