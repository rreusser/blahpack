# ztgexc: Translation Learnings

## Translation pitfalls

- Fortran IFST/ILST are 1-based and in/out parameters. In JS, they are 0-based
  and returned in a result object `{ ifst, ilst, info }`.
- The Fortran code modifies ILST on both success and failure. On failure, ILST
  is set to the position where the swap failed. On success in the forward case,
  `here` ends up at `ilst-1` (Fortran) so the final `ILST = HERE` after `HERE = HERE - 1`.
  In JS the 0-based arithmetic makes this simpler.

## Dependency interface surprises

- ztgex2 uses complex-element strides (does `* 2` internally). ztgexc passes
  strides through directly without conversion.
- ztgex2 takes a 0-based j1 parameter and returns integer info (0=success, 1=failure).

## Simplification vs Fortran

- This is dramatically simpler than dtgexc because complex triangular matrices
  only have 1x1 diagonal blocks. No 2x2 block detection, no workspace, no LWORK
  parameter. The entire routine is just a loop of adjacent swaps.
