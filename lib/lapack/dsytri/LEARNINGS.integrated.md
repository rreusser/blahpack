# dsytri: Translation Learnings

## Translation pitfalls

- IPIV uses 0-based bitwise-NOT encoding for 2x2 pivots: `IPIV[k] = ~p` where `p` is the 0-based row/column. Fortran uses negative values with 1-based indices. The conversion `kp = ~IPIV[k]` followed by `kp += 1` recovers the 1-based pivot index used in the swap logic.
- The diagonal singularity check loop uses 1-based indexing internally (k from 1 to N) with `(k-1)` array offsets, matching the Fortran loop structure for correct INFO return values.
- The 2x2 block inversion computes `d = t * (ak * akp1 - 1)` where `t = |A[k,k+1]|`; all three elements of the 2x2 block are divided by `t` before computing the determinant to avoid overflow.

## Dependency interface surprises

- dsymv is called with full stride parameters (sa1, sa2, offsetA) rather than just LDA, which differs from the typical BLAS calling convention. The alpha/beta scalar arguments are inlined as -1.0 and 0.0.
- ddot and dcopy use the column stride (sa1) as the step between elements within a column, and the column offset is computed as `offsetA + col * sa2`.

## Automation opportunities

- The upper/lower branches are nearly mirror images; a template could generate both from one annotated branch.

## Coverage gaps

- All code paths covered: 1x1 pivots, 2x2 pivots, upper and lower triangle, N=0, N=1, and mixed pivot sizes.
- The singular matrix (zero diagonal) early-return path is tested via fixture data.

## Complex number handling

- N/A: dsytri is a real-valued routine.
