# zsysvx: Translation Learnings

## Translation pitfalls
- Direct analog of dsysvx but with complex arrays.
- zlansy uses single-char norm codes ('I') not long-form ('inf-norm').
- zlacpy uses 'all' for full matrix copy, uplo for triangle copy.
- Allocates Float64Array(N) for RWORK internally for zlansy workspace.

## Dependency interface surprises
- zsycon takes anorm as scalar, rcond as single-element Float64Array.
- zlansy norm parameter: 'I' not 'inf-norm'.

## Missing automation
- N/A.

## Coverage gaps
- Tested N, F (not-factored) mode with upper and lower. Factored mode ('F') not tested.

## Complex number handling
- Delegates all complex work to dependencies.
