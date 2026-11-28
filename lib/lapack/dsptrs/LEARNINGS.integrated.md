# dsptrs: Translation Learnings

## Translation pitfalls

- Packed storage indexing uses 1-based Fortran conventions internally. The packed index `kc` tracks the start of column k in the packed array. Accessing element at 1-based position `pos` requires `AP[ offsetAP + (pos-1)*strideAP ]`. Off-by-one errors here are the main danger.
- The upper and lower cases track `kc` differently. Upper: `kc` starts at `N*(N+1)/2 + 1` and decreases. Lower: `kc` starts at 1 and increases. The formulas for the off-diagonal and diagonal positions relative to `kc` differ between upper and lower.
- The 2x2 pivot solve reads three packed elements: `AKM1K` (off-diagonal), `AKM1` (one diagonal divided by off-diagonal), and `AK` (other diagonal divided by off-diagonal). The positions of these differ between upper and lower packed storage.

## Dependency interface surprises

- `dgemv` base.js takes `(trans, M, N, alpha, A, sa1, sa2, offsetA, x, sx, offsetx, beta, y, sy, offsety)` -- note it uses 2D strides for A but 1D strides for x and y. For dsptrs, the "matrix" A is actually B (the RHS matrix), and the "vector" x is a column of AP.
- `dger` base.js takes `(M, N, alpha, x, sx, offsetx, y, sy, offsety, A, sa1, sa2, offsetA)` -- rank-1 update where the output matrix A comes last.
- `dswap`/`dscal` base.js signatures: `(N, x, sx, ox, y, sy, oy)` / `(N, alpha, x, sx, ox)`.

## Automation opportunities

- The packed index tracking pattern (kc management) is identical between dsptrf and dsptrs. A shared helper or code generation template could reduce manual errors.

## Coverage gaps

- The swap branches (`kp !== k-1` in upper, `kp !== k` in lower) for 1x1 pivots require matrices where the factorization actually performs row interchanges with non-adjacent rows. The 4x4 indefinite tests trigger 2x2 pivots but the specific 1x1 swap conditions may not all fire. Line coverage is 95.85%, branch coverage is 80.65%.

## Complex number handling

- N/A: dsptrs is a real-valued routine.
