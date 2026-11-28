# zherk: Translation Learnings

## Translation pitfalls

- The key difference from dsyrk is that alpha and beta are REAL scalars (not complex), even though A and C are complex. This is per the BLAS spec for Hermitian rank-k update. The Fortran signature declares `DOUBLE PRECISION ALPHA,BETA`.
- The diagonal of C must always be real after the update. In the Fortran, `DBLE(C(J,J))` extracts only the real part. In JS, we must explicitly zero the imaginary part of diagonal entries after scaling/updating.
- The no-transpose path uses `conj(A[j,l])` in the temp computation: `temp = alpha * conj(A[j,l])`. For the diagonal element, `Re(temp * A[j,l]) = alpha * (ajR^2 + ajI^2)`, which is always real. The imag part of the diagonal contribution cancels out.
- The conjugate-transpose path (`trans='C'`) computes a dot product `sum_l conj(A[l,i]) * A[l,j]`. For the diagonal (i=j), this reduces to `sum_l |A[l,j]|^2`, which is real. Off-diagonal elements are generally complex.
- When `beta=1.0`, the Fortran code still forces the diagonal imaginary part to zero (`C(J,J) = DBLE(C(J,J))`). This is a subtle normalization step that must be replicated.

## Dependency interface surprises

- N/A. zherk is self-contained (no BLAS/LAPACK dependencies beyond reinterpret).

## Automation opportunities

- The translation from dsyrk to zherk is largely mechanical: replace `Float64Array` with `Complex128Array`+`reinterpret`, multiply strides/offsets by 2 for Float64 views, add conjugate operations, and handle real-only diagonal. This pattern applies to any symmetric->Hermitian BLAS level-3 routine conversion (e.g., dsymm->zhemm).

## Coverage gaps

- 100% line coverage, 96.30% branch coverage. The uncovered branches are the zero-check guards on A elements (`if (ajR !== 0.0 || ajI !== 0.0)`) when all elements happen to be nonzero.

## Complex number handling

- alpha and beta are plain JS numbers (not Complex128), matching the Fortran spec where they are `DOUBLE PRECISION`.
- All complex arithmetic is inlined since zherk only needs multiply-add and conjugate (both safe to inline). No need for cmplx.div or cmplx.abs.
- Diagonal elements need special treatment: imaginary part must be zeroed after every beta scaling or rank-k update to maintain Hermitian structure.
