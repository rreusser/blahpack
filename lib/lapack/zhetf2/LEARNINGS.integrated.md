# zhetf2: Translation Learnings

## Translation pitfalls
- Key difference from zsytf2: diagonal elements are REAL. Must force imaginary part to zero after every pivot swap and at initialization.
- Hermitian swap requires conjugation of off-diagonal elements between swapped rows/columns (DCONJG in Fortran). The swap-and-conjugate loop replaces the plain swap in zsytf2.
- 2x2 pivot block: D11 and D22 are REAL scalars (diagonal of Hermitian matrix), not complex. D12 is complex. The discriminant D11*D22-1 is real, simplifying the arithmetic.
- Uses DLAPY2 (hypot) instead of complex division for computing |D(k-1,k)|, and zdscal/zher instead of zscal/zsyr.
- IPIV encoding: positive = 1x1 pivot, negative (~p) = 2x2 pivot. Same as zsytf2.

## Dependency interface surprises
- zher takes uplo as a long-form string ('upper'/'lower') matching the existing convention.
- izamax returns 0-based index (already documented).

## Missing automation
- N/A; based pattern heavily on existing zsytf2.

## Coverage gaps
- Singular matrix test only covers upper triangle.

## Complex number handling
- All complex multiply for conj(WK) expansion inlined: `a*conj(b) = (aR*bR + aI*bI, aI*bR - aR*bI)`.
- Real scaling via zdscal avoids complex allocation overhead.
