# dorgtr: Translation Learnings

## Translation pitfalls

- The Fortran code operates on a (N-1)x(N-1) submatrix for both UPLO paths. For UPLO='U', dorgql is called on the leading (N-1)x(N-1) block. For UPLO='L', dorgqr is called on the trailing (N-1)x(N-1) block starting at A(1,1) (0-based). The offset calculation for the 'L' case is `offsetA + strideA1 + strideA2`.
- UPLO='U' shifts reflector columns left (j gets j+1), while UPLO='L' shifts them right (j gets j-1). The shift directions are opposite, matching how dsytrd stores reflectors in upper vs lower triangle.
- The N=1 case produces Q = [1.0] (identity) because dsytrd produces no reflectors. The N=0 case is a simple quick return.

## Dependency interface surprises

- dorgqr and dorgql both take (M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork). They share identical signatures, making dorgtr straightforward to implement.
- WORK is allocated internally by dorgqr/dorgql (they ignore the passed-in WORK/lwork), but we still pass them through to match the API.

## Automation opportunities

- N/A. This routine is simple enough that manual translation was efficient. No repeated mechanical patterns observed.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.
- The routine is thin enough that all code paths (UPLO='U', UPLO='L', N=0, N=1) are easily covered.

## Complex number handling

- N/A. This is a real (double precision) routine only. The complex analog is zungtr.
