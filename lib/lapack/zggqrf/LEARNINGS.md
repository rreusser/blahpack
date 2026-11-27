# zggqrf: Translation Learnings

## Translation pitfalls

- zggqrf is a thin wrapper around zgeqrf, zunmqr, and zgerqf, so the
  translation is straightforward. The key difference from dggqrf is using
  `'conjugate-transpose'` instead of `'transpose'` in the zunmqr call.
- All strides and offsets are in complex elements (not Float64 indices)
  because the three subroutines each do their own `*2` reinterpretation
  internally.

## Dependency interface surprises

- zgeqrf, zunmqr, and zgerqf all allocate workspace internally, making
  the WORK/lwork parameters effectively unused at the base.js level.
  They are kept in the signature for API consistency with dggqrf and
  the Fortran reference.

## Automation opportunities

- N/A. The init_routine.py scaffold worked well. The lint-fix.sh script
  overwrote the test file with examples/index.js content due to a file
  confusion during revert -- this is a known fragility of the revert
  logic in lint-fix.sh.

## Coverage gaps

- 100% line, branch, and function coverage on base.js. The routine is
  simple enough that all paths (N=0 quick return, N>0 factorization)
  are easily exercisable.

## Complex number handling

- No inline complex arithmetic needed. The routine only calls subroutines
  that handle their own complex array processing. All arrays are passed
  as Complex128Array with complex-element strides.
