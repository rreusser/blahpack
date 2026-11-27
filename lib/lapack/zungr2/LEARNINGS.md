# zungr2: Translation Learnings

## Translation pitfalls

- The Fortran II index is 1-based: `II = M - K + I`. In 0-based JS, `ii = M - K + i` gives the same value because both the loop variable i and the row index shift by -1, canceling out. The column index `N-M+II` similarly maps directly.
- The `ZLACGV(N-M+II-1, ...)` count with 1-based II translates to `N-M+ii` elements in 0-based, since `N-M+(ii+1)-1 = N-M+ii`.
- The initialization loop has a subtle column-offset condition: Fortran `J > N-M AND J <= N-K` becomes 0-based `j >= N-M AND j < N-K`. The row index `M-N+J` also maps directly to 0-based.

## Dependency interface surprises

- `zlarf` takes tau as `(Complex128Array, offset)`, not a plain scalar. When passing conjugated tau, create `new Complex128Array([re, -im])` with offset 0.
- `zscal` takes a `Complex128` object for the scalar (uses `real(za)`, `imag(za)`), constructed via `new Complex128( re, im )`.
- `zlacgv` uses complex-element strides and offsets at the API boundary. The stride parameter is `strideA2` (column stride) since we conjugate along a row.

## Complex number handling

- `DCONJG(TAU(I))` for zlarf: create a temporary `Complex128Array([tauR, -tauI])` since zlarf reads from a typed array with offset.
- `-TAU(I)` for zscal: create `new Complex128(-tauR, -tauI)` since zscal takes a Complex128 scalar.
- `ONE - DCONJG(TAU(I))` is written as `Av[ia] = 1.0 - tauR; Av[ia+1] = tauI;` (positive imag because negating the conjugate's negative).
