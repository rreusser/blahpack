# dsytf2_rk: Translation Learnings

## Translation pitfalls

- The `_rk` variant differs from `dsytf2` in three key ways worth keeping in
  mind for future `*trf_rk`/`*tf2_rk` translations:
  1. Off-diagonal entries of `D` are returned in a separate `e` vector;
     the diagonal of `A` holds the pure diagonal of `D`.
  2. The rook pivoting search loops inside a column/row until either a
     satisfactory diagonal pivot is found or a 2x2 block is accepted,
     unlike classical Bunch-Kaufman which is single-shot.
  3. There is a separate `P` swap (first swap) when a 2x2 block is chosen
     with `P != K`, in addition to the usual `KK <-> KP` swap.
- The `p` variable is carried across rook iterations. Initialize `p = k`
  at the top of each main-loop iteration; inside the rook loop the
  cycle branch reassigns `p = imax` before `imax` shifts to `jmax`.
- `IPIV` 2x2 encoding: `IPIV[k] = ~p` and `IPIV[k-1] = ~kp` in the
  upper case (and `IPIV[k] = ~p`, `IPIV[k+1] = ~kp` in the lower case).
  Fortran stores 1-based negated values; `~(n-1) === -n`, so the raw
  integer matches between Fortran and JS.
- The SFMIN rescaling branch (`|A(k,k)| < SFMIN`) uses `D11 = A(k,k)` (not
  its reciprocal) to avoid overflow, divides the column in a manual loop,
  then still calls `dsyr` with the un-inverted `-D11`. Don't be tempted
  to factor it into a single code path.

## Test-design pitfalls

- Tests that only exercise the "easy" path (well-conditioned with large
  diagonal) will miss the rook-cycle and swap branches. Target pivot
  branches with matrices that have **tiny diagonal + large off-diagonal**.
  To force the `p != k` first-swap branch, you need the rook loop to
  actually cycle at least once (case 4 → case 3), which requires
  `rowmax > colmax` on the first iteration.
- The stdlib `stdlib/vars-order` codemod applied to test files will
  reorder declarations by name length WITHIN each function. If a helper
  `runCase()` is used, declare all vars at the top first (longest first)
  and only assign them later — otherwise the codemod can reorder
  assignment statements and break data dependencies.

## Dependency interface surprises

- None beyond the standard `dsyr`/`dscal`/`dswap`/`idamax` conventions
  already documented. `idamax` returns a 0-based index in JS.
