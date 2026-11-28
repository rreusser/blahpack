# dtrevc: Translation Learnings

## Translation pitfalls

- The `ip` variable tracks complex conjugate pair state across loop iterations using a state machine. In the right eigenvector loop (backward), `ip=-1` means "this is the second element of a complex pair" and the next iteration must skip (setting `ip=1`). In the left eigenvector loop (forward), `ip=1` means "this is the first element of a complex pair" and the next iteration must skip (setting `ip=-1`). Getting the polarity wrong causes eigenvectors to be computed twice or skipped entirely.

- The dtrevc3 JS translation uses an if-else chain at the top of each loop that always reassigns `ip`, making the state transitions implicit. This is cleaner than the Fortran GOTO approach (which has explicit transitions at the bottom of the loop). Matching dtrevc3's pattern exactly avoids subtle bugs.

- The `!over` condition (Fortran's `.NOT.OVER`) triggers `no-negated-condition` lint errors. Must swap if/else branches to use `if (over)` instead.

- WORK layout uses three N-length sections: `[0..N-1]` for column 1-norms, `[N..2N-1]` for real part, `[2N..3N-1]` for imaginary part. The Fortran uses 1-based `WORK(i+N)` and `WORK(i+N2)` which maps to 0-based `WORK[offsetWORK + N + i]` and `WORK[offsetWORK + n2 + i]`.

## Dependency interface surprises

- `dlaln2` returns `{ scale, xnorm }` as an object (not via output parameters). The X output is written to a pre-allocated scratch Float64Array. X is stored column-major in a 2x2 layout, so `X[0]`, `X[1]` are column 1 and `X[2]`, `X[3]` are column 2.

- `ddot` in the left eigenvector section uses transposed column access: `T[row, col]` with row stride `sT1` as the increment for the dot product, reflecting the transposed quasi-triangular solve.
