# zhbevx: Translation Learnings

## Translation pitfalls

- The signature uses `out.M` (object output) instead of a scalar `M` parameter. Fortran's `M` is an output-only integer, but JS doesn't have pass-by-reference for scalars.
- The back-transform uses `zgemv` (matrix-vector multiply with Q from zhbtrd) rather than `zunmtr`, because zhbtrd produces an explicit unitary Q, while zhetrd stores Householder reflectors.
- The N=1 case must extract the real part from the Complex128Array diagonal element. For lower storage it's `AB[offsetAB]`, for upper it's `AB[offsetAB + kd*strideAB1]`. The `reinterpret` view is used to access real/imag parts at `index*2` and `index*2+1`.
- The fast path (ALLEIG or IL=1,IU=N with ABSTOL<=0) copies Q into Z via `zlacpy` and uses `zsteqr` with `'update'`, because zhbtrd produces Q explicitly.

## Dependency interface surprises

- `dstebz` takes `M` and `nsplit` as `Int32Array(1)` (array-of-one) for output. Must allocate `new Int32Array(1)` and read `Mout[0]`.
- `zgemv` takes `Complex128` scalars (CONE, CZERO), not plain numbers. Must import and construct these.
- `zstein` produces real eigenvectors stored in a Complex128Array (imaginary parts zero). The back-transform via `zgemv` with the complex unitary Q produces complex eigenvectors.
- `zlascl` uses `'lower-band'` and `'upper-band'` type strings matching stdlib-js convention.

## Automation opportunities

- The Fortran test pattern for complex routines with EQUIVALENCE printing is well-established. Could auto-generate the Fortran test from a band matrix description.

## Coverage gaps

- All main paths covered: fast path (all eigenvalues), selective by value range, selective by index range, eigenvalues only, eigenvalues+eigenvectors, upper/lower, N=0, N=1, KD=0 implied through N=1, KD=1 (tridiagonal), KD=2 (pentadiagonal).
- Matrix scaling path (iscale=1) not exercised (would require extreme matrix norms). Same pattern well-tested in zhbev.

## Complex number handling

- Complex128Array accessed via `reinterpret` for element-level real/imag access (N=1 path).
- Complex scalars CONE and CZERO constructed as `new Complex128(1,0)` and `new Complex128(0,0)` for zgemv.
- Eigenvalues are real (Float64Array w), eigenvectors are complex (Complex128Array Z). This is inherent to Hermitian eigenproblems.
