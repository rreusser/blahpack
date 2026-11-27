# dorm22: Translation Learnings

## Translation pitfalls

- dorm22 uses WORK as a 2D column-major scratch with leading dimension `ldwork` that changes per branch: `M` in the left cases and `len` (current block size) in the right cases. Computed `sw2 = ldwork * strideWORK` at the top of each iteration and used `(strideWORK, sw2, offsetWORK)` as the WORK ndarray strides.
- Partitioning into the top/bottom (left cases) or left/right (right cases) halves of WORK uses different offsets: left partitions rows by `n1 * strideWORK`, right partitions columns by `n2 * sw2`. Getting these swapped silently corrupts the unused half of WORK.
- The block structure of `Q` is unusual: `Q(1:n1, n2+1:nq)` is the N1xN1 *lower*-triangular block (not upper), and `Q(n1+1:nq, 1:n2)` is the N2xN2 *upper*-triangular block. The Fortran comments in dorm22 are correct but easy to misread.
- Degenerate cases `n1=0` and `n2=0` reduce to a single `dtrmm` call on a pure upper or lower triangular matrix respectively; both must be handled before the blocked path since NB is computed from `nq` which would divide by zero.

## Dependency interface surprises

- `dlacpy` in this codebase accepts `'upper'`, `'lower'`, or anything else (the else branch copies the full matrix). We pass `'all'` to signal the full-copy branch. The Fortran uses `'All'` which maps to lowercase `'all'`.

## Testing

- The Fortran `print_matrix` helper prints `M*N` packed column-major entries, not `LDA*N`, so the JS fixture comparison uses `M*N` as the expected array length regardless of the `LDC=8` used in the Fortran driver.
- Built a minimal set of Q matrices satisfying the banded block structure for the fixture tests and an additional `-12` lwork-too-small test to cover that branch.

## Coverage gaps

- base.js reaches 100% line/branch/function coverage in the final run; no uncovered branches.
