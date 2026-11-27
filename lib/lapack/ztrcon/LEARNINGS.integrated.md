# ztrcon: Translation Learnings

## Translation pitfalls

- String convention mismatch between zlantr and zlatrs: zlantr uses single-char uplo ('U'/'L') and diag ('U'/'N'), while zlatrs uses long-form ('upper'/'lower', 'unit'/'non-unit'). The ztrcon base.js must map between these conventions.
- Unlike dtrcon where dlantr and dlatrs both use long-form strings, the z-prefix versions are inconsistent. This is a potential trap for future routines.

## Dependency interface surprises

- zlantr(norm, uplo, diag, ...) expects uplo='U'/'L' and diag='U'/'N' (single-char), while zlatrs uses 'upper'/'lower' and 'unit'/'non-unit' (long-form). Had to add mapping variables.
- RWORK for ztrcon is only N elements (vs 2*N for zgecon), since ztrcon has only one CNORM workspace for zlatrs (not split between lower/upper).

## Missing automation

- The string convention mapping between zlantr and zlatrs could be automated if many routines need this pattern.

## Coverage gaps

- The scale-overflow bail-out path (return 0 with rcond=0) is hard to trigger. Would need carefully constructed near-singular triangular matrix.

## Complex number handling

- Only uses cabs1 inline (safe). Conjugate transpose solves via zlatrs handle all complex arithmetic internally.
