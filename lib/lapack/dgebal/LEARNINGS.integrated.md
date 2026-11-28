# dgebal: Translation Learnings

## Translation pitfalls

- The routine has two separate permutation phases (row isolation scanning backward from L, then column isolation scanning forward from K). Each has its own `DO WHILE(NOCONV)` loop. Getting the restart logic right requires careful tracking of which loop restarts vs falls through.
- SCALE stores 1-based Fortran permutation indices for permuted rows/columns (j=1..ILO-1 and j=IHI+1..N), but scaling factors for the balanced submatrix (j=ILO..IHI). This dual meaning is load-bearing for dgebak.
- The `idamax` call returns a 0-based index in JS, but the Fortran uses 1-based. The offset arithmetic `A(I, IRA+K-1)` translates to `A[oA + (i-1)*sA1 + (ira+k-1)*sA2]` where `ira` is already 0-based from the JS idamax, so no further adjustment is needed -- the `+K-1` in Fortran becomes `+k-1` in JS and the 1-to-0 base adjustment cancels with the missing Fortran `-1`.
- Return value is an object `{info, ilo, ihi}` since JS cannot return multiple scalars by reference. This matches the zggbal convention.

## Dependency interface surprises

- `dswap(N, x, strideX, offsetX, y, strideY, offsetY)` -- the two-array signature with separate strides/offsets made the column-swap and row-swap calls clean.
- `dnrm2(N, x, stride, offset)` -- single array, stride, offset. No surprises.
- `idamax(N, x, strideX, offsetX)` -- returns 0-based index. Standard but must remember when translating Fortran's 1-based usage.

## Automation opportunities

- N/A -- straightforward scalar real routine with no complex arithmetic or unusual patterns.

## Coverage gaps

- NaN guard path (lines 166-170): requires a matrix with NaN values to trigger. Could add a targeted test but low priority.
- Underflow/overflow safety checks in the scaling loop (lines 212-213, 217-218): these guard against `f*SCALE(i) <= sfmin1` and `SCALE(i) >= sfmax1/f`. Would require inputs near machine epsilon or overflow threshold to exercise.
- The second scaling while-loop (lines 250-256, the `g >= r` direction) is harder to trigger as it requires column norms much larger than row norms initially.
- Overall: 95.3% line, 90.0% branch coverage on base.js, meeting targets.

## Complex number handling

- N/A -- dgebal is a real-valued routine (d-prefix). The complex equivalent would be zgebal.
