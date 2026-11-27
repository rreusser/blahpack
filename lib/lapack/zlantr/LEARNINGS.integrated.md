# zlantr: Translation Learnings

## Translation pitfalls

- Fortran loops `DO I = 1, MIN(M, J-1)` translate to `for (i = 0; i < M && i < j; i++)` -- the `MIN` with `J-1` maps to `i < j` in 0-based indexing since Fortran's J-1 upper bound for 1-based i is the same as j (exclusive) for 0-based i.
- Lower triangular unit diagonal, infinity norm: the Fortran sets `WORK(I) = ONE` for `I = 1, MIN(M,N)` and `WORK(I) = ZERO` for `I = N+1, M`. Must handle M > N case (trapezoidal) to zero out rows beyond N.
- Frobenius norm with unit diagonal: `SUM = MIN(M,N)` initializes the sum-of-squares count for the unit diagonal elements (each contributes 1.0 to the sum of squares).

## Dependency interface surprises

- zlassq takes Complex128Array with offset in complex elements (not Float64 indices). Returns `{scl, sumsq}` object. Must pass `offsetA + j * strideA2` for column offsets, where strideA2 is in complex elements.
- cmplx.absAt takes a Float64Array view and a Float64 index (not complex element index). So after `reinterpret()`, pass the doubled index.

## Automation opportunities

- The pattern of translating zlantr is nearly identical to zlange but with uplo/diag branching. A parameterized template covering zlange/zlantr/zlanhe/zlansy could generate all four norm routines from a single description of which triangle/diagonal to iterate over.
- Deps file generation missed `la_constants` and `la_xisnan` modules needed by `zlassq.f90`. The deps.py tool should detect transitive F90 module dependencies.

## Coverage gaps

- 93.10% branch coverage. The uncovered branches are likely the `M - j - 1 > 0` guard in the lower/unit/Frobenius path when M = j + 1 (single element column). This is exercised implicitly but the branch condition may not be counted by V8's coverage for the `> 0` false case at j = N-1 in a square matrix.

## Complex number handling

- Used `cmplx.absAt(Av, ai)` for all |z| computations, which computes `sqrt(re^2 + im^2)` with overflow protection. No complex division or other unsafe inlining needed.
- zlassq handles the actual scaled sum-of-squares accumulation for the Frobenius norm path -- no manual complex arithmetic needed beyond absAt for the other norm types.
