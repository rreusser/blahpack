# zgtsvx: Translation Learnings

## Translation pitfalls

- No index or stride pitfalls. zgtsvx is a thin driver that delegates
  entirely to zcopy, zgttrf, zgttrs, zlangt, zgtcon, zgtrfs, zlacpy.
  No direct array manipulation required.

## Dependency interface surprises

- zlangt uses `'inf-norm'` while dlangt uses `'infinity-norm'` for the
  infinity norm string. zgtcon accepts either (it only checks for
  `'one-norm'`), so using `'inf-norm'` consistently works for both
  zlangt and zgtcon.
- WORK is Complex128Array (2*N), RWORK is Float64Array (N). This differs
  from the real dgtsvx which uses Float64Array WORK (3*N) and Int32Array
  IWORK (N). The complex driver does not need IWORK at all.
- Fortran RCOND is a scalar passed by reference; in JS it becomes
  Float64Array(1), same as dgtsvx.

## Automation opportunities

- The signature generator correctly identified the 49-param complex
  signature. The scaffold + init_routine pipeline handled this well.
- deps.py missed `zlacpy`, `la_xisnan`, and `zcopy` in the Fortran
  deps file; these had to be added manually.

## Coverage gaps

- N=0 quick return is tested but does not exercise any sub-calls.
  All other paths (factored/not-factored, no-transpose/transpose/
  conjugate-transpose, singular, multi-RHS, pivoting) are covered.
- The workspace arrays (WORK, RWORK) are passed through to zgtcon
  and zgtrfs without validation of minimum size.

## Complex number handling

- No direct complex arithmetic in this driver. All complex operations
  are delegated to the dependency routines (zcopy, zgttrf, etc.).
- All complex arrays use Complex128Array with complex-element strides
  and offsets, consistent with the dependency conventions.
