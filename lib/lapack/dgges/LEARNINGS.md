# dgges: Translation Learnings

## API changes from Fortran

- Removed `sdim`, `WORK`, `BWORK`, `lwork` from public API parameters. Workspace is allocated internally. `sdim` is returned as part of the result object `{ info, sdim }` rather than as an output parameter.
- `SELCTG` is a JS callback function `(alphar, alphai, beta) => boolean` instead of Fortran EXTERNAL.
- Returns `{ info, sdim }` object instead of just integer info code.

## Translation pitfalls

- Schur vectors have sign ambiguity per column. Tests must compare columns up to sign flip, not element-wise exact match.
- dhgeqz takes 0-based ilo/ihi while dggbal returns 1-based. Must convert: `ilo - 1, ihi - 1`.
- dgghrd takes 1-based ilo/ihi directly from dggbal.

## Dependency interface surprises

- dtgsen takes `M` as `Int32Array` where `M[0]` is output (dimension of selected cluster), and `pl`/`pr` as `Float64Array` outputs, not scalars.
- dtgsen's `SELECT` parameter uses `Uint8Array` with 0/1 values rather than boolean array.
- The `finalize` function handles the complex eigenvalue unscaling logic that is particularly tricky: it checks for potential overflow in alphar/safmax and alphai/safmax ratios and rescales via A diagonal elements.

## Fortran test deps

- dgges has deep transitive dependencies through dtgsen -> dtgexc -> dtgex2 -> dtgsy2 -> dgetc2/dgesc2/dlatdf -> dgecon -> dlatrs. The deps file needed iterative expansion to resolve all undefined references.
