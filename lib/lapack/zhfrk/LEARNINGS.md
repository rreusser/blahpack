# zhfrk: Translation Learnings

## Translation pitfalls

- Same 16-path RFP dispatch as dsfrk, but with Hermitian (conjugate-transpose)
  instead of symmetric (transpose). Each branch calls zherk+zgemm instead of
  dsyrk+dgemm.
- Fortran test originally declared A as (10,10) but passed LDA=nrowa to ZHFRK.
  Since Fortran column-major layout uses the declared leading dimension (10), not
  the passed LDA, this caused the reference to produce incorrect results. Fixed by
  using allocatable arrays sized exactly nrowa x ka so LDA matches.
- The N-odd/upper branch uses Fortran A(N2,1) (1-based row N2), which maps to
  JS offset (N2-1)*strideA1. This is an off-by-one trap since all other branches
  use A(N1+1,1) = offset N1*strideA1 (no minus-one needed).
- alpha and beta are REAL scalars (not complex), but calpha/cbeta are created as
  Complex128(alpha, 0) and Complex128(beta, 0) for passing to zgemm.

## Dependency interface surprises

- zherk takes 2D strides (strideC1, strideC2) for its C parameter, matching the
  sub-block view into the RFP array: strideC1=sa (element stride), strideC2=sa*LDA.
- zgemm takes Complex128 alpha/beta, not real scalars. Must wrap the real alpha/beta
  in Complex128(value, 0.0) before calling.
- Both A references in zgemm calls point into the same physical A array at different
  offsets, which is safe since A is read-only.

## Automation opportunities

- The 16-path dispatch is identical in structure to dsfrk. A template/macro that
  generates both dsfrk and zhfrk from a single description table would eliminate
  duplication and transcription errors.

## Coverage gaps

- All 16 paths (2 transr x 2 uplo x 2 trans x 2 parity) covered for N=3 (odd)
  and N=4 (even) via Fortran reference fixtures.
- Two additional N=5 (larger odd) paths covered.
- Edge cases: N=0, K=0, alpha=0/beta=0, alpha=0/beta=1.

## Complex number handling

- alpha and beta are real scalars (double precision), not complex.
- The routine wraps them as Complex128(alpha, 0.0) for zgemm calls.
- The RFP array C is Complex128Array; the zero-out path uses reinterpret() to
  access the underlying Float64Array view for direct zeroing.
