# dsbevx: Translation Learnings

## Translation pitfalls

- The signature uses `out.M` (object output) instead of a scalar `M` parameter, matching the dsyevx convention. Fortran's `M` is an output-only integer, but JS doesn't have pass-by-reference for scalars.
- The back-transform uses `dgemv` (matrix-vector multiply with Q from dsbtrd) instead of `dormtr` (dsyevx uses dormtr because dsytrd stores Householder vectors in A, not as an explicit Q).
- The Fortran uses WORK as a scratch area for both the tridiagonal diagonal/off-diagonal AND the back-transform temporary. The dcopy+dgemv loop reuses WORK[offsetWORK..] for each column vector, which is safe because the tridiagonal data lives at `indd` and `inde` offsets.
- The N=1 case must read the diagonal element from the correct band storage position: `AB[offsetAB]` for lower, `AB[offsetAB + kd*strideAB1]` for upper.
- The fast path (ALLEIG or IL=1,IU=N with ABSTOL<=0) copies Q into Z and uses dsteqr with 'update', NOT dorgtr+dsteqr as in dsyevx. This is because dsbtrd produces Q explicitly, while dsytrd stores Householder reflectors.

## Dependency interface surprises

- `dstebz` takes `M` and `nsplit` as `Int32Array(1)` (array-of-one) for output. Must allocate `new Int32Array(1)` and read `Mout[0]`.
- `dlascl` uses `'lower-band'` and `'upper-band'` type strings (not just `'B'` and `'Q'` as in Fortran), matching the stdlib-js convention.
- `dstebz` return value (info) is not used in the Fortran code (it's checked via INFO=0 path), but the lint rule catches unused assignments, so we call without capturing the return.

## Automation opportunities

- The Fortran test needed separate array declarations for each LDAB size (AB1, AB2, AB3) because Fortran's 2D array physical dimensions must match LDAB. A single `AB(4, NMAX)` with `LDAB=1` causes column stride mismatch.

## Coverage gaps

- All main paths covered: fast path (all eigenvalues), selective by value range, selective by index range, eigenvalues only, eigenvalues+eigenvectors, upper/lower, N=0, N=1, KD=0 (diagonal), KD=1 (tridiagonal), KD=2 (pentadiagonal).
- The matrix scaling path (iscale=1) is not exercised by current tests (would require very small or very large matrix norms). Tolerated since the same code pattern is well-tested in dsbev.

## Complex number handling

- N/A: dsbevx is a real-valued routine. The complex analog would be zhbevx.
