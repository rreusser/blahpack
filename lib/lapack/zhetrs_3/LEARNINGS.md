# zhetrs_3: Translation Learnings

## Translation pitfalls

- Same overall structure as `dsytrs_3`, but the diagonal-solve loop now
  uses complex division. The Hermitian property guarantees that diagonal
  entries `A(k,k)` are real, but the off-diagonal `e(k)` is fully
  complex, and conjugation matters: in the upper case `AKM1 = A(k-1,k-1)
  / e(k)` while `AK = A(k,k) / conj(e(k))`; the lower case is mirrored.
  Mixing these up silently produces a numerically valid but wrong result.
- The `1x1` diagonal solve uses `zdscal` with a real reciprocal of the
  real part of `A(i,i)`. Reading the imaginary part would propagate any
  floating-point round-off accumulated during factorization (it should
  be exactly zero in exact arithmetic).
- When iterating `2x2` pivot blocks with `i--; i--;` (upper) or
  `i++; i++;` (lower), the guard `i > 0` / `i < N - 1` is structural —
  it cannot fail on a valid factorization but is required by the
  Fortran-mirrored control flow.

## Dependency interface surprises

- `ztrsm` consumes complex-element strides directly. Internally it
  multiplies them by 2 for Float64 indexing.
- `zdscal` takes a real scalar (not Complex128). Do NOT confuse with
  `zscal`.

## Complex number handling

- The `e` parameter is a `Complex128Array`; direct numeric indexing on
  a Complex128Array yields a `Complex128` object, not numbers. We must
  call `reinterpret(e, 0)` to obtain a Float64 view before reading
  `[ pe ]`/`[ pe + 1 ]`. Same pattern for `A` and `B`.
- Stride convention: API takes complex-element strides; internally
  multiply by 2 for Float64 view. The offset of `e` is multiplied by 2
  separately because `e` is a vector with its own stride.
- Inlined `cDiv` (Smith's algorithm) at file scope rather than calling
  `cmplx.div` for every operation — this is cheaper and matches the
  established pattern in `zhetrs/lib/base.js`.

## Test data approach

- The Fortran test prints `A_factored` as `2*NMAX*n` doubles, so the
  matrix has leading dimension NMAX (=6), not n. The JS test must use
  `strideA2 = NMAX` to match, even when n < NMAX.
