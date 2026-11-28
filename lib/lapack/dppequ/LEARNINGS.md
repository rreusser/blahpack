# dppequ: Translation Learnings

## Translation pitfalls

- Packed storage diagonal positions differ between upper and lower triangle. Upper diag at 0-based positions `i*(i+1)/2` (increments by `i+1`); lower diag at positions that increment by `N-i+1`. Must track JJ incrementally as Fortran does rather than computing positions directly.
- The signature generator includes `scond` and `amax` as parameters, but following dpoequ/dpbequ convention, these are returned as object properties `{ info, scond, amax }`. The generated ndarray.js/dppequ.js wrappers needed manual adjustment to remove those params.

## Dependency interface surprises

- N/A: dppequ is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The scaffold generator could detect scalar output-only parameters (SCOND, AMAX) and automatically use the object-return pattern instead of including them as function parameters. This required manual fixup of ndarray.js and dppequ.js.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.

## Complex number handling

- N/A: dppequ is a real-valued routine.
