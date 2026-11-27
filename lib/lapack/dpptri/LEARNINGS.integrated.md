# dpptri: Translation Learnings

## Translation pitfalls

- The Fortran code uses 1-based indexing with JJ starting at 0 (before the loop for upper) and 1 (for lower). For the upper case, the 0-based translation uses `jj = -1` initially, then `jc = jj + 1; jj += j + 1` to track column start and diagonal position. Getting these off by one produces silent wrong results.
- In the lower case, the Fortran `JJN = JJ + N - J + 1` translates directly to `jjn = jj + N - j` in 0-based (the +1/-1 from index conversion cancels).
- dpptri itself is a thin wrapper: first call dtptri (triangular inverse in packed storage), then form the symmetric product. The complexity is in the BLAS calls with correct packed offsets rather than in dpptri's own loop logic.

## Dependency interface surprises

- dspr signature: `(uplo, N, alpha, x, strideX, offsetX, AP, strideAP, offsetAP)` -- AP comes after x. The x vector in this case points into the same AP array with a different offset.
- dtpmv signature: `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)` -- 10 params. When used here for the lower case, the AP argument points to a sub-matrix starting at the next column's diagonal, not at the start of AP.
- ddot returns a scalar, not an info code. Other BLAS routines like dspr/dtpmv modify arrays in-place and return void.
- dtptri: `(uplo, diag, N, AP, strideAP, offsetAP)` returns an integer info code. The 'non-unit' diag string must be used here since Cholesky factors are non-unit triangular.

## Automation opportunities

- Scaffold generator produces files with blank leading lines that fail lint. A post-scaffold lint-fix pass would eliminate this manual cleanup.

## Coverage gaps

- 100% line and branch coverage achieved. The singular factor test cases (zero diagonal) exercise the early return from dtptri.

## Complex number handling

- N/A: dpptri is a real-valued routine.
