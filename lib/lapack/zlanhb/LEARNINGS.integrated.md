# zlanhb: Translation Learnings

## Translation pitfalls

- The one-norm and inf-norm are identical for Hermitian matrices. The Fortran
  source handles both under a single branch (`NORM='I' or '1' or 'O'`). The JS
  translation maps both `'one-norm'` and `'inf-norm'` to the same code path.
- The upper-case one-norm/inf-norm branch for `uplo='upper'` does NOT
  zero-initialize WORK. Instead it sets `WORK(J) = SUM + |DBLE(AB(K+1,J))|` on
  each column iteration, which implicitly initializes each element exactly
  once before it is read. Easy to misread as a bug if you expect pre-zeroing.
- Diagonal elements are real (Hermitian property). The Fortran uses `DBLE(AB(L,J))`
  to extract the real part. In JS, we access `ABv[oAB + ...]` directly (the
  Float64 view's even-indexed element), ignoring the imaginary part.
- Off-diagonal elements use full complex modulus via `cmplx.absAt()`, while
  diagonal elements use `Math.abs()` on the real part only.

## Dependency interface surprises

- zlassq returns `{ scl, sumsq }` and takes (N, x, stride, offset, scale, sumsq)
  where N is the number of complex elements, stride is in complex elements, and
  offset is in complex elements. This matches the Complex128Array convention.
- Compiling the Fortran test requires `la_constants` and `la_xisnan` in the deps
  file because `zlassq.f90` uses the `LA_XISNAN` Fortran module. The auto-generated
  deps file from `init_routine.py` missed these transitive module dependencies.

## Automation opportunities

- The deps generator could detect `.f90` module `USE` statements and automatically
  include the module source files (la_constants, la_xisnan).

## Coverage gaps

- NaN propagation is not explicitly tested. The `value < temp || temp !== temp`
  pattern (NaN check) exists in max/one-norm/inf-norm branches.

## Complex number handling

- The reinterpret pattern converts Complex128Array to Float64Array view for
  direct indexed access. Strides and offsets are doubled (complex->float64).
- Diagonal access uses only the real part (even index in Float64 view).
- Off-diagonal access uses `cmplx.absAt()` for complex modulus.
- Frobenius norm uses `zlassq` (complex sum-of-squares) for off-diagonal
  elements, then manually accumulates real diagonal values into the same
  scaled sum-of-squares representation.
