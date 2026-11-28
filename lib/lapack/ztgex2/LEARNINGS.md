# ztgex2: Translation Learnings

## Translation pitfalls

- Fortran J1 is 1-based; JS j1 is 0-based. The column rotation count `J1+1` in Fortran (1-based) becomes `j1+2` in JS (0-based). The row rotation count `N-J1+1` becomes `N-j1`.
- The strong stability test requires saving SZ and SQ values before overwriting the scratch `s` array with the second zlartg call. Preallocate separate Float64Array(2) buffers for szArr, sqArr, negConjSZ, negSQ, and conjSQ.
- The Fortran test needs `pack_and_print` when MAXN > N, since column-major layout means raw memory does not contain the NxN submatrix contiguously.

## Dependency interface surprises

- `zlacpy` ndarray wrapper validates `uplo` strictly -- passing `'full'` fails; use `'all'` (or require base.js directly). From another base routine, it's cleaner to require base.js directly to skip validation overhead.
- `zrot` expects `s` as `Float64Array(2)` with `[re, im]`, NOT a Complex128Array. The Fortran `DCONJG(SZ)` becomes a manual sign flip on the imag part of the Float64Array.
- `zlartg` takes Complex128Array inputs for f, g, s, r with complex-element offsets, and Float64Array for c.
- `zlassq` returns an object `{ scl, sumsq }` rather than modifying arguments in place.
- `dlamch` single-char keys like `'P'` and `'S'` work but violate the no-single-char convention; use `'precision'` and `'safe-minimum'`.

## Complex number handling

- Complex multiplication is inlined throughout (safe per convention).
- `|z|` is computed as `Math.sqrt(re*re + im*im)` for small local 2x2 values where overflow is not a concern. For the Frobenius norms, `zlassq` handles the scaling.
- All matrices use complex-element strides (stride1=1, stride2=N for column-major). The `*2` conversion to Float64 indices is done explicitly when indexing into reinterpreted views.
