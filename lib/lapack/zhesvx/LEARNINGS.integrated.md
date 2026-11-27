# zhesvx: Translation Learnings

## Translation pitfalls

- Direct mirror of zsysvx. Only changes: zsy* -> zhe* for all dependencies, zlansy -> zlanhe.
- zlanhe uses 'inf-norm' string (not 'infinity-norm' or 'I') for the infinity norm.
- LWORK parameter and workspace query logic removed (workspace allocated internally).

## Dependency interface surprises

- zlanhe('inf-norm', ...) - the norm string differs from the single-char Fortran 'I'. Check zlanhe source for accepted strings.
- zlacpy('all', ...) - the 'all' string triggers the full-copy path (neither upper nor lower).

## Missing automation

- N/A: trivial driver routine that chains existing modules.

## Coverage gaps

- No test for the singular factorization path (info > 0 from zhetrf). Would need a singular Hermitian matrix.
- No test for rcond < epsilon warning (info = N+1).

## Complex number handling

- No direct complex arithmetic in this driver. All complexity is in zherfs and zhetrf.
