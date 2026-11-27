# dgeqrf: Translation Learnings

## Translation pitfalls

- [x] The Fortran DGEQRF uses ILAENV to determine block size; we hardcode NB=32.
- [x] The T matrix is allocated internally as NB*NB. In Fortran, T is stored in WORK with LDT=LDWORK=N, but we use a separate array with LDT=NB.
- [x] The dlarfb workspace needs N*K elements for the N-by-K WORK matrix. The JS implementation allocates WORK internally if not large enough.
- [x] For matrices with near-zero trailing elements (rank-deficient inputs), floating-point rounding differences between the blocked and unblocked paths can cause fixture mismatches. Use well-conditioned (e.g., diagonally dominant) matrices for testing.
- [x] The LDA must match between Fortran fixture and JS test to get bit-exact results, since different padding affects BLAS operation order.

## Dependency interface surprises

- [x] dlarft T matrix uses (strideT1=1, strideT2=nb, offsetT=0) -- a separate nb*nb array, not part of WORK.
- [x] dlarfb WORK uses (strideWORK1=1, strideWORK2=ldwork, offsetWORK=0) where ldwork=N.

## Automation opportunities

- [x] The real dgeqrf is a direct simplification of zgeqrf: remove factor-of-2 for complex interleaving in offset calculations.

## Coverage gaps

- [x] 3x3, 4x3 (unblocked), N=0, and 65x65 (blocked path with NB=32) all tested. The blocked path exercises dlarft and dlarfb.

## Complex number handling

- [x] N/A. Real-valued only.
