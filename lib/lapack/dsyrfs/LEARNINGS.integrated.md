# dsyrfs: Translation Learnings

## Translation pitfalls

- dsyrfs is structurally identical to dgerfs, with dsymv replacing dgemv and dsytrs replacing dgetrs. The symmetric structure means A = A^T, so the KASE=1 and KASE=2 branches of dlacn2 both use the same uplo (no transpose distinction needed, unlike dgerfs which swaps trans/transt).
- The abs(A)*abs(X)+abs(B) computation must use the symmetric structure: upper triangle loops i=0..k-1 for each column k, accumulating both row and column contributions in one pass. This matches the Fortran exactly.
- WORK and IWORK are allocated internally (matching dgerfs pattern), so the caller-provided WORK/IWORK parameters are unused.

## Dependency interface surprises

- dsymv signature: `dsymv(uplo, N, alpha, A, sa1, sa2, oA, x, sx, ox, beta, y, sy, oy)` -- note it takes stride+offset for both x and y vectors, not just stride.
- dsytrs takes B as `(B, strideB1, strideB2, offsetB)` -- when passing the internal WORK array as B, use `(WRK, 1, N, N)` where N is both the leading dimension and the offset to the second segment.

## Automation opportunities

- The dsyrfs translation followed the exact same pattern as dgerfs. The only differences are: (1) dsymv vs dgemv, (2) dsytrs vs dgetrs, (3) symmetric abs(A)*abs(X) accumulation vs full-matrix version, (4) no trans parameter. A template or transform could generate dsyrfs from dgerfs mechanically.

## Coverage gaps

- Lines 181-182 and 209-210 (safe1/safe2 branches) require matrix elements or residuals near underflow threshold (~5e-324). These paths are effectively unreachable with normal floating-point test data. Coverage: 98.44% line, 93.55% branch.
- The iterative refinement loop (lines 188-195) was covered by adding a test with a deliberately perturbed initial solution.

## Complex number handling

- N/A: dsyrfs is a real (double-precision) routine. The complex analog would be zsyrfs or zherfs.
