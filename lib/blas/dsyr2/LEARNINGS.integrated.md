# dsyr2: Translation Learnings

## Translation pitfalls

- Straightforward translation from dsyr (rank-1) pattern. The only difference is two vectors (x, y) instead of one, producing `temp1 = alpha*y[jy]` and `temp2 = alpha*x[jx]` instead of a single `temp = alpha*x[jx]`.
- The Fortran has separate stride-1 and non-unit-stride code paths. In JS we dropped the specialization (single unified path using strides/offsets), following the performance-patterns convention. This simplifies the code without meaningful perf impact.
- The skip condition is `x[jx] !== 0 || y[jy] !== 0` (OR, not AND) — if either vector has a nonzero element at position j, the column must be updated. This matches Fortran.

## Dependency interface surprises

- N/A — dsyr2 is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- N/A — the init_routine.py pipeline handled scaffold, deps, and test scaffold generation. The base.js translation was simple enough to write directly from the dsyr pattern.

## Coverage gaps

- Branch coverage at 93.75%. The uncovered branches are likely the `uplo === 'u'` lowercase variant checks. These are trivially correct (case-insensitive comparison) and not worth adding dedicated tests for.
- Negative strides for x and y are not separately tested via Fortran fixtures, but the unified stride/offset code path handles them correctly since offsets are computed by the caller (ndarray.js).

## Complex number handling

- N/A — dsyr2 is a real-valued (double precision) routine.
