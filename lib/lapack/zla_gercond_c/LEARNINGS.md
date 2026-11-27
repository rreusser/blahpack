# zla_gercond_c: Translation Learnings

## Translation pitfalls

- Complex variant of dla_gercond, but with a **real** C vector and a
  **boolean** CAPPLY flag replacing dla_gercond's integer `cmode` (-1/0/1).
  The Fortran signature drops `cmode` entirely — `capply=true` is
  equivalent to `cmode=-1` (divide by C in the row-norm step, multiply
  by C in the reverse-communication apply step); `capply=false` is
  equivalent to `cmode=0` (no scaling). There is no analog of `cmode=1`.
- Because C is real, no `cmplx.div` is needed: scaling is real-scalar
  times complex, safely inlined as `WORKv[ir] *= c[ic]` / `WORKv[ir+1] *= c[ic]`.
- The Fortran routine uses `ANORM = MAX(ANORM, TMP)` and returns 0 early
  when `ANORM === 0`. This is distinct from dla_gercond, which does not
  have the ANORM-zero guard. Easy to miss because the dla_gercond
  template was the starting point.
- TRANS is `'no-transpose'` / `'conjugate-transpose'` only (no plain
  transpose), matching other complex matrix routines.

## Dependency interface surprises

- `zlacn2(N, V, strideV, offsetV, X, strideX, offsetX, EST, KASE, ISAVE, strideISAVE, offsetISAVE)`
  takes the Complex128Array directly with complex-element strides/offsets
  (no `*2`), unlike routines such as zgghrd that use double-based strides.
  Pattern mirrors zgerfs / zgecon usage.
- `zgetrs` signature is
  `(trans, N, nrhs, A, sA1, sA2, offsetA, IPIV, sIPIV, offsetIPIV, B, sB1, sB2, offsetB)`.
  For single-column WORK input, pass `strideB1=strideWORK`, `strideB2=N*strideWORK`.
- Fortran test needed `zgetf2`, `zgetrf`, `zgetrf2`, `zrscl`, `zdrscl`,
  `dlabad` added manually to `deps_zla_gercond_c.txt`; `deps.py` misses
  these transitive Fortran dependencies of zgetrf.

## Complex number handling

- CABS1 for `|A(i,j)|` is inlined as
  `Math.abs(Av[idx]) + Math.abs(Av[idx+1])` because the routine uses
  the infinity-norm-of-absolutes which is defined in terms of CABS1,
  not the true modulus.
- No `reinterpret` needed on AF (passed straight to zgetrs), but A and
  WORK are reinterpreted at function entry to access CABS1 components
  and apply real scalar scaling in place.
- The reverse-communication KASE=2 and KASE=1 branches both manipulate
  WORK in the reinterpreted Float64 view; `zlacn2` itself is given the
  original Complex128Array with complex-element strides.
