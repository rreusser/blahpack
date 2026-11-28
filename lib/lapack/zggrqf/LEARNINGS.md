# zggrqf: Translation Learnings

## Translation pitfalls

- zggrqf is the RQ counterpart to zggqrf. The key structural difference:
  zggrqf calls zgerqf first (not zgeqrf), then zunmrq (not zunmqr), then
  zgeqrf. The order is RQ-first, apply Q^H to B from the right, then QR on B.
- The zunmrq call uses `'right'` and `'conjugate-transpose'` (not `'left'`).
  This applies Q^H from the right: B := B * Q^H.
- The reflector offset for zunmrq must point to row max(0, M-N) of A
  (0-indexed), matching the Fortran `A(MAX(1,M-N+1), 1)`.
- All strides and offsets are in complex elements (not Float64 indices)
  because the three subroutines each do their own `*2` reinterpretation
  internally.

## Dependency interface surprises

- zgerqf, zunmrq, and zgeqrf all allocate workspace internally, making
  the WORK/lwork parameters effectively unused at the base.js level.
  They are kept in the signature for API consistency with the Fortran
  reference and with zggqrf.

## Automation opportunities

- The init_routine.py scaffold, gen_test.py, and lint-fix.sh worked smoothly.
  The Fortran test pattern from zggqrf was directly adaptable.

## Coverage gaps

- 100% line, branch, and function coverage on base.js. The routine is
  simple enough that all paths (M/N/P=0 quick return, general case)
  are easily exercisable.

## Complex number handling

- No inline complex arithmetic needed. The routine only calls subroutines
  that handle their own complex array processing. All arrays are passed
  as Complex128Array with complex-element strides.
