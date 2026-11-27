# dspsv: Translation Learnings

## Translation pitfalls

- None. This is a trivial driver: call dsptrf, check info, call dsptrs.
  No index arithmetic, no loops, no branching beyond the quick return
  and the info check.

## Dependency interface surprises

- dsptrf returns 1-based INFO for singular matrices. The JS dsptrf
  implementation may return a different k than the reference Fortran
  for the same singular matrix (e.g., info=2 vs info=1 for a rank-1
  matrix in upper packed storage). Both are correct in the sense that
  D(k,k) is zero, but the specific pivot where singularity is detected
  can differ due to implementation-dependent pivot ordering. Tests
  check `info > 0` rather than exact value for singular cases.

## Automation opportunities

- None identified. The scaffold + lint-fix pipeline handled everything.

## Coverage gaps

- ndarray.js line 77 (early return for N=0 || nrhs=0) is exercised
  via base.js directly. 100% coverage on base.js.

## Complex number handling

- N/A: dspsv is a real-valued routine.
