# zgetc2: Translation Learnings

## Translation pitfalls

- Near-direct translation from dgetc2 since the routine structure is identical. The main change is Complex128Array/reinterpret pattern and complex division.
- IPIV/JPIV are 0-based in JS vs 1-based in Fortran. Fixture comparison requires `tc.ipiv[i] - 1`.
- The Fortran `ABS()` on COMPLEX*16 computes the modulus `sqrt(re^2+im^2)`, translated to `cmplx.absAt()` for overflow safety.

## Dependency interface surprises

- `zgeru` and `zswap` both use complex-element strides (they multiply by 2 internally). No surprises - matches the dgetc2 pattern with `dger` and `dswap`.
- `cmplx.divAt` operates in-place on Float64Array views at specified indices, using Smith's formula for stability.

## Automation opportunities

- N/A. The scaffold, deps, and test generation pipeline worked well for this routine.

## Coverage gaps

- Lines 149-152 (inner-loop near-singularity branch where `|A(i,i)| < smin`) are hard to trigger because complete pivoting always selects the largest element as the pivot, making the diagonal element at least as large as `smin`. This would require a matrix where all remaining submatrix elements are simultaneously below `smin`, which is extremely unlikely with reasonable test inputs.

## Complex number handling

- Used `cmplx.absAt()` for complex modulus in pivot search (overflow-safe version of `sqrt(re^2+im^2)`).
- Used `cmplx.divAt()` for complex division `A(j,i) = A(j,i) / A(i,i)` -- must NOT inline due to numerical stability.
- `zgeru` called with `MINUS_ONE = new Complex128(-1, 0)` as the complex alpha scalar, matching Fortran's `-DCMPLX(ONE)`.
- When replacing near-singular diagonal elements, set both `Av[ii] = smin` and `Av[ii+1] = 0.0`, matching Fortran's `DCMPLX(SMIN, ZERO)`.
