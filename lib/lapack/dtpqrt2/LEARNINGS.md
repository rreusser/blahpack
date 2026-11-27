# dtpqrt2: Translation Learnings

## Translation pitfalls

- The Fortran source uses **column N of T as scratch workspace** during the first phase (`T(:, N)` holds W). The `IF (I .LT. N)` guard is what keeps the workspace column from being written during the final iteration where the workspace and the column being built would otherwise overlap. In JS this maps to `if (i < N - 1)` — easy off-by-one if you write `i < N` because Fortran's I goes 1..N inclusive but the guard is strict less-than.
- Unlike the LQ counterpart `dtplqt2`, **`dtpqrt2` does NOT have a final transpose loop** to flip lower→upper. The QR routine writes T directly upper-triangular (uses `T(j, i)` with j ≤ i throughout phase 2). The LQ version builds T's reflectors row-by-row in the lower triangle and then transposes at the end. Trying to mirror dtplqt2's final transpose loop would zero out half of T.
- `MP = MIN(M-L+1, M)` (1-based) → JS `mp = min(M-l, M-1)` (0-based). The off-by-one is naturally handled by subtracting 1 inside the `min`. Defensive `if (mp < 0) mp = 0` is unreachable because `0 ≤ l ≤ M` and the M=0 case quick-returns; removed it to keep coverage at 100%.
- **Layout-wrapper LDA/LDB/LDT validation depends on the routine's actual matrix shapes.** The scaffold templates assume A is M-by-N which is wrong for dtpqrt2 (A is N-by-N, B is M-by-N, T is N-by-N). LDA/LDT must validate against N (both layouts), and only LDB depends on layout (column-major→M, row-major→N). The dtplqt2 scaffold happens to be correct because its A is M-by-M, but a copy-paste from there would still need LDB and LDT swapped. **Don't trust the scaffolded LD validations — re-derive them per routine from the matrix shapes.**

## Dependency interface surprises

- `dlarfg` is called with `B` as the x-array starting at `B(0, i)` with stride `strideB1` (traversing down a column). Easy mistake to use `strideB2`.
- `dtrmv` for the triangular B2 multiply takes the upper-triangular submatrix at `B(mp, 0)` (rows mp..mp+p-1, cols 0..p-1). The submatrix offset uses `mp*strideB1` only — the column offset is implicit because we start at column 0.
- `dgemv('transpose', ...)` swaps the meanings of M and N relative to the matrix dimensions (M = rows of A as stored, output length = N). For "B(0:p-1, i+1:N-1)^T * B(0:p-1, i)" the call is `dgemv('transpose', p, N-i-1, ...)` — **p is the row dimension of the as-stored matrix**, not the output length. Reading the Fortran spec carefully: `DGEMV('T', M, N, ...)` means A is M-by-N stored, op(A) is N-by-M, y has length N.

## Coverage notes

- 100% line / 100% branch coverage on `base.js` after removing the unreachable `mp < 0` guard. All paths exercised by combinations of `(M, N, L)` covering: rectangular B (L=0), fully trapezoidal B (L=M=N), partial trapezoidal (L=2 with M=N=3), tall (M>N), wide (M<N=2), and degenerate (M=1, N=1). Both column-major and row-major layouts tested.
