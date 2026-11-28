# ztrevc: Translation Learnings

## Translation pitfalls

- Fortran uses NMAX=4 for array declarations even for 3x3 tests. When printing complex arrays via EQUIVALENCE, the interleaved data includes padding rows. Must pack before printing (copy NxM used portion to a tight array) or the fixtures will have padding that doesn't match tight JS layouts.
- The Fortran `WORK(N) = CMONE` for left eigenvectors sets position N (1-based), which is N-1 in 0-based JS. This value gets overwritten by the subsequent loop for KI < N-1, so it only matters for the ki = N-1 case.
- `isOperationSide` from stdlib only recognizes `'left'` and `'right'`, not `'both'`. The ndarray.js and ztrevc.js validators needed explicit `side !== 'both'` checks.

## Dependency interface surprises

- zlatrs takes `scale` as a `Float64Array` with output at `scale[0]`, not a returned scalar. The caller must allocate a Float64Array(1) and read the result.
- zlatrs uses CNORM (column norms) as upper bounds for overflow protection. When called on a sub-matrix T(ki+1:N, ki+1:N), passing the full-matrix RWORK is safe because the full-column norms are overestimates of sub-column norms.
- dzasum takes Complex128Array with stride in complex elements (internally multiplies by 2). When computing column norms, pass `strideT1` (row stride) not `strideT2` (column stride).

## Complex number handling

- CABS1(z) = |Re(z)| + |Im(z)| is used extensively for normalization bounds. Defined as a local `cabs1At(v, idx)` helper on Float64 views.
- Conjugation in the left eigenvector RHS: `-DCONJG(T(ki,k))` translates to negating real part and keeping imaginary part (negate + conjugate = negate real, keep imag).
- `CMONE` (complex 1.0) and scale factors passed to zgemv as `new Complex128(scale[0], 0.0)`.
