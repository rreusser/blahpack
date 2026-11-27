# dorm2r: Translation Learnings

## Translation pitfalls

- Straightforward translation from Fortran. The real-valued dorm2r is much simpler than its complex counterpart zunm2r because there is no conjugation logic needed for the transpose case.
- The iteration direction logic (forward vs backward) maps cleanly to 0-based indexing: forward is `i = 0, 1, ..., K-1` and backward is `i = K-1, ..., 1, 0`, using `i !== i2` as the loop termination condition (matching the zunm2r pattern).
- dlarf takes tau as a plain scalar for the real case, unlike zlarf which takes a Complex128Array. This is a key simplification.

## Dependency interface surprises

- dlarf's signature for the real case: `dlarf(side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK)` where tau is a plain `number`, not an array+offset. This differs from zlarf which takes a Complex128Array.
- The reflector vector v is passed as the A array with an offset pointing to A(i,i), and strideV = strideA1 (stride along the column). This is the same pattern as zunm2r.

## Automation opportunities

- N/A. The translation was clean and followed the existing zunm2r pattern closely.

## Coverage gaps

- Achieved 100% line and 100% branch coverage on base.js.
- All four SIDE x TRANS combinations tested with both square (identity) and rectangular matrices.
- Quick return paths (M=0, N=0, K=0) all tested.
- K=1 single-reflector case tested.
- Orthogonality check (Q * Q^T = I) provides a mathematical verification beyond fixture comparison.

## Complex number handling

- N/A. dorm2r is a real-valued routine (no complex arithmetic).

## Fortran test gotchas

- When testing right-side multiplication with a rectangular C (M x N where M < N), the C array must be declared with its actual leading dimension matching M (e.g., `CR(2,4)` for M=2). Using a larger array like `C(4,4)` with `LDC=2` in the Fortran call creates a mismatch between the declared array stride (4) and the passed LDC (2), producing incorrect fixture values.
