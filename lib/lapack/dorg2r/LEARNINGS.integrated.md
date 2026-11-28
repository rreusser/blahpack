# dorg2r: Translation Learnings

## Translation pitfalls

- Straightforward real-valued translation; closely mirrors the zung2r pattern without the complex arithmetic overhead.
- The Fortran loop `DO 20 J = K+1, N` maps to 0-based `for (j = K; j < N; j++)` since K is 0-based count matching the 1-based starting index K+1.
- The reverse loop `DO 40 I = K, 1, -1` maps to `for (i = K-1; i >= 0; i--)`.
- dlarf 'Left' application uses `M-i` rows (not `M-i+1`) because we're already 0-based.

## Dependency interface surprises

- dlarf (real version) takes tau as a plain scalar number, unlike zlarf which takes `(Float64Array, offset)`. This is already documented in dependency-conventions.md.
- dscal takes `(N, alpha, x, stride, offset)` -- simple scalar scaling, no surprises.

## Automation opportunities

- The pattern of translating real LAPACK routines that mirror existing complex (z-prefix) implementations could potentially be semi-automated: strip complex arithmetic (reinterpret, Complex128, stride*2), replace z-prefix deps with d-prefix deps, remove imaginary components. This is the second real/complex pair (dorg2r/zung2r).

## Coverage gaps

- 100% line and branch coverage achieved on base.js.
- All code paths exercised: N=0 quick return, K=0 identity output, K<N partial reflectors, K=N full reflectors, square and rectangular matrices.

## Complex number handling

- N/A: dorg2r is a real-valued routine. The complex analog is zung2r.
