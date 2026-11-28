# zlag2c: Translation Learnings

## Translation pitfalls

- The scaffolder (`init_routine.py`) cannot distinguish two arrays with
  different Fortran names when the signature has two 2D arrays. It emitted
  duplicate `A`/`strideA1`/`offsetA` parameters for both the input (A) and
  output (SA). base.js, ndarray.js, and zlag2c.js had to be rewritten by
  hand to use distinct `A`/`SA` + `LDA`/`LDSA` identifiers.
- The Fortran loop uses `GO TO 30` on overflow detection, which translates
  cleanly to an early `return 1;` in JS (no other cleanup needed — SA on
  exit with INFO=1 is unspecified per the spec).
- `slamch('O')` is the single precision overflow threshold
  `(1 - 2^-24) * 2^128 = 3.4028234663852886e38`. No `slamch` module exists
  yet, so it is hardcoded as `RMAX` at the top of base.js.

## Complex number handling

- Input `A` is `Complex128Array`; output `SA` is also `Complex128Array` but
  its entries are quantized to IEEE 754 single precision using `Math.fround`
  applied separately to the real and imaginary parts (this simulates the
  `CMPLX(A(i,j))` Fortran narrowing).
- Both arrays are `reinterpret`ed to `Float64Array` views inside base.js,
  and strides/offsets are doubled for interleaved `re, im` storage — the
  standard pattern from `docs/complex-numbers.md`.
- Overflow check is per-component (`re < -RMAX || re > RMAX || im < -RMAX
  || im > RMAX`) — matches the Fortran `DBLE(A)` / `DIMAG(A)` checks.

## Fortran test pitfalls

- `SA` in the Fortran reference is `COMPLEX` (single precision, 8 bytes per
  element), so EQUIVALENCE with `double precision :: SA_r(...)` would be a
  stride mismatch. Instead, I EQUIVALENCE the packed `SApk` array with
  `real :: SApk_r(...)`, then explicitly copy each element to a
  `double precision :: SApk_d(...)` temporary (via `dble(...)`) before
  calling `print_array`, which expects `double precision`. Without that
  copy, the fixture contains garbage bit patterns.
- `A(NMAX,NMAX)` with M/N < NMAX requires packing before printing. The
  test packs SA(1:M,1:N) into contiguous `SApk(1:M*N)` before EQUIVALENCE
  conversion, as recommended in the skill.

## Benchmark fix

- The scaffolded `benchmark.js` / `benchmark.ndarray.js` used
  `N = pow(10, i)` up to `i=3` and allocated `N*N` elements. For N=1000 that
  is 1e6 complex doubles = 16 MB (fine), but the pattern is dangerous if
  max is ever raised. Rewrote to use an explicit sizes list `[4,16,64,256]`
  which caps the largest allocation at 256*256 = 65536 complex doubles
  (~1 MB).
