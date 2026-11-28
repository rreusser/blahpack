# dgetri: Translation Learnings

## Translation pitfalls

- WORK array is used as both 1D (unblocked path, indexed with strideWORK) and 2D (blocked path, strides 1 and ldwork=N). The blocked path indexes WORK directly with `offsetWORK + i + (jj-j)*ldwork`, ignoring strideWORK for the 2D layout since WORK is scratch space.
- Fortran's IPIV is 1-based; JS base.js IPIV is 0-based. The pivot swap loop (`JP = IPIV(J)` in Fortran) translates directly since both the index and the value are in the same base within each implementation.
- The Fortran loop `DO J = N-1, 1, -1` for applying pivots maps to `for (j = N-2; j >= 0; j--)` in 0-based JS. The last column (j=N-1) is never swapped.
- LWORK/ILAENV workspace query logic was removed; NB=32 hardcoded. The `lwork` parameter is retained in the API to allow callers to control workspace size, which controls whether the blocked or unblocked path is used.

## Dependency interface surprises

- dtrtri takes `(uplo, diag, N, A, sa1, sa2, offsetA)` — no IPIV, no WORK. Clean interface.
- dgemv's y parameter uses `(y, strideY, offsetY)` — same array stride as the matrix column stride `sa1` when y is a column of A.
- dtrsm and dgemm take 2D matrix parameters with `(A, sa1, sa2, offsetA)` for each matrix argument. WORK in the blocked path is passed with explicit strides `(1, ldwork)`.

## Automation opportunities

- The `init_routine.py` deps file generator does not include transitive deps needed by the Fortran test program (e.g., dgetrf and its deps). Had to manually add dgetrf, dgetrf2, dlamch, dlaswp, ieeeck, ilaenv, iparmq to deps_dgetri.txt. Could be automated by scanning test_*.f90 for CALL statements and merging all deps.

## Coverage gaps

- Lines 79-81 (workspace-constrained blocking fallback: `nb = lwork / ldwork`) are uncovered. This path is only hit when `lwork < N*NB` but `lwork >= N*2`, which is a narrow edge case. Coverage is 98% line / 95.65% branch without it, exceeding targets.
- No test for the exact singular diagonal detection path within dtrtri (tested indirectly via the singular matrix test which hits it through dtrtri).

## Complex number handling

- N/A — dgetri is a real-valued routine.
