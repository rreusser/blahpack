# zsteqr: Translation Learnings

## Translation pitfalls

- zsteqr is nearly identical to dsteqr. The only differences are: (1) Z is Complex128Array instead of Float64Array, (2) `dlaset` -> `zlaset` (takes Complex128 alpha/beta), (3) `dlasr` -> `zlasr` (takes Complex128Array with complex-element strides), (4) `dswap` -> `zswap` (takes Complex128Array with complex-element strides).
- The tridiagonal matrix itself (D and E) is still real. All the QL/QR iteration arithmetic operates on real scalars only. The complex matrix Z is only touched for rotation application and column swaps.
- For N=1 with COMPZ='I', setting Z(0,0)=1+0i must use `zlaset` or direct Complex128Array write. Using `Z[offsetZ] = 1.0` would fail because Z is Complex128Array. Used `zlaset('Full', 1, 1, CZERO, CONE, ...)` for consistency.
- Eigenvector sign is not unique -- fixture-based exact comparison fails because different platforms may choose different signs for eigenvectors. Tests should verify mathematical properties (orthogonality: Z^H*Z=I, eigenvector property: T*z_j = lambda_j*z_j) instead.
- The SIGN(R, G) idiom uses `Math.sign(g) || 1.0` to handle `g=0` case (Fortran returns +|R| when g=0).

## Dependency interface surprises

- `zlaset` takes Complex128 scalars (alpha, beta) constructed via `new Complex128(re, im)`. Must import Complex128 constructor.
- `zlasr` takes Complex128Array Z with strides in complex elements. The real C and S arrays use simple Float64Array strides. This asymmetry is easy to forget.
- `zswap` takes strides in complex elements and Complex128Array. Offset is also in complex elements. Same array can be passed for both arguments (different columns of Z).

## Automation opportunities

- A transform from dsteqr to zsteqr could be mostly mechanical: replace `dlaset` -> `zlaset` (with Complex128 params), `dlasr` -> `zlasr`, `dswap` -> `zswap`, change Z type annotation from Float64Array to Complex128Array. The QL/QR iteration body is identical.

## Coverage gaps

- Scaling paths (anorm > ssfmax, anorm < ssfmin) at lines 199-206 require extreme matrix values near overflow/underflow thresholds.
- Convergence failure path (jtot >= nmaxit) at lines 450-463 would require a matrix that fails to converge in 30*N iterations, which is rare for well-conditioned inputs.
- The `else` for dlae2 in the QR 2x2 block path (COMPZ=N with QR iteration) was not directly tested because our QR-triggering test used COMPZ=I and COMPZ=V. Adding COMPZ=N with |D(end)|<|D(start)| covers it.

## Complex number handling

- No complex arithmetic is performed in this routine. The complex matrix Z is only operated on through `zlaset`, `zlasr`, and `zswap`, all of which handle complex indexing internally.
- The WORK array stores real rotation parameters (cosines and sines), not complex values. This matches the Fortran where WORK is DOUBLE PRECISION.
- CZERO and CONE are pre-allocated Complex128 constants to avoid allocation in the hot path.
