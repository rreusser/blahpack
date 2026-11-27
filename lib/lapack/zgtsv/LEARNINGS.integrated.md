# zgtsv: Translation Learnings

## Translation pitfalls

- Fortran CABS1 is `|re| + |im|` (1-norm), not `sqrt(re^2 + im^2)`. Used `cmplx.abs1At` which matches.
- The Fortran zgtsv checks `DL(K) == ZERO` (both components exactly zero) as a separate branch from the CABS1 comparison. This three-way branch (zero subdiag, no-pivot, pivot) must be preserved.
- Fortran test printing of complex B matrix required a `pack_b` subroutine because `B(LDB,*)` has leading dimension larger than N, so raw EQUIVALENCE on the full array gives garbage in trailing slots.

## Dependency interface surprises

- zgtsv is self-contained (no external LAPACK deps). Only uses `cmplx.divAt` and `cmplx.abs1At` from the utility library.

## Automation opportunities

- Complex tridiagonal solvers (zgtsv, zgtsvx, etc.) follow the same structure as real dgtsv. A template-based generator could produce the complex version from the real one by substituting arithmetic operations.

## Coverage gaps

- Lines 179-180 (uncovered): the `N > 1` guard in backSolve for the second-to-last row. This only fires when N=1 which takes the quick-return path before reaching backSolve. Coverage is 99.25% line, 90.91% branch.

## Complex number handling

- Used `cmplx.divAt` for all complex divisions (MULT computation and back-solve divisions). Never inlined division.
- Used `cmplx.abs1At` for CABS1 comparison (pivoting decision).
- Inlined complex multiply for `MULT * DU(k)`, `MULT * B(k,j)`, etc. since multiply is safe to inline per project rules.
- All strides/offsets converted from complex-element units to Float64 units at function entry (`*2`).
