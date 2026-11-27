# zhprfs: Translation Learnings

## Translation pitfalls

- Packed storage indexing: Fortran uses 1-based column-major packed indexing (KK increments by K for upper, by N-K+1 for lower). JS uses 0-based with the same pattern: `kk += k + 1` (upper) or `kk += N - k` (lower).
- Fortran B/X arrays have LDB leading dimension which may be larger than N. The JS base.js works with generic strides so this maps cleanly to strideB1/strideB2.
- IPIV is 0-based in JS (converted from Fortran 1-based by zhptrf/zhptrs internally).

## Dependency interface surprises

- zhpmv takes Complex128 scalars (alpha, beta) rather than separate re/im parts. Must pass CONE/NEGCONE as Complex128 objects.
- zhptrs takes the B matrix as a 2D layout with strideB1, strideB2, unlike some BLAS calls that only take a 1D stride.
- Workspace arrays (WORK, RWORK) are accepted in the signature for Fortran compatibility but allocated internally in base.js.

## Automation opportunities

- deps.py missed zhptrf (needed for Fortran test compilation) and its transitive deps dlapy2, disnan, dlaisnan. The deps file had to be manually extended.
- The extractColMajor helper in tests (removing LDB padding) could be a shared test utility.

## Coverage gaps

- The safe1/safe2 branch (lines 244-245, 266-267) for very small RWORK values is not exercised because our test matrices are well-conditioned. These paths fire only for near-zero row sums.
- The iterative refinement loop body (lines 251-255) is not entered because our initial solves are already accurate to machine precision.

## Complex number handling

- CABS1(z) = |re(z)| + |im(z)| is used throughout for element-wise absolute values, matching the Fortran statement function.
- Diagonal elements of Hermitian matrices are real; only Math.abs(APv[p]) is used (no imaginary part).
- Complex multiplication by real scalars (RWK[i]) is done component-wise: Wv[2*i] *= RWK[i], Wv[2*i+1] *= RWK[i].
- No complex division is needed in this routine (division only by real quantities).
