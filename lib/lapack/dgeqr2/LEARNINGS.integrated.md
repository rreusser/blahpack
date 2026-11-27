# dgeqr2: Translation Learnings

## Translation pitfalls

- [x] The alpha save/restore pattern: A(i,i) is saved, set to 1.0 for the reflector application, then restored. Must not forget the restore.
- [x] dlarfg takes alpha as a 1-element Float64Array (with offset) so it can be modified in-place. The A array itself serves as the alpha storage.
- [x] dlarf's tau parameter is a scalar number (not an array element) in the real version. Just pass TAU[offsetTAU + i*strideTAU] directly.
- [x] For near-singular matrices (e.g., the all-integer rank-2 matrix 1..12), floating-point rounding causes the last reflector values to differ from Fortran at ~1e-15 level. Use well-conditioned test matrices to avoid this.

## Dependency interface surprises

- [x] dlarfg(N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau) -- alpha is passed as array+offset.
- [x] dlarf(side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK) -- tau is a scalar.

## Automation opportunities

- [x] The real dgeqr2 is a simplification of zgeqr2: no conjugation of tau, no interleaved complex indexing, no aii+1 imaginary part save/restore.

## Coverage gaps

- [x] 3x2, 2x2, 4x3 matrices, N=0, M=0 all tested. Well-conditioned 4x3 matrix used to avoid floating-point sensitivity.

## Complex number handling

- [x] N/A. Real-valued. The complex zgeqr2 uses conj(tau) for left application.
