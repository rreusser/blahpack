# dsyconvf: Translation Learnings

## Translation pitfalls

- **IPIV format differs between dsyconvf and dsytrf_rk.** `dsytrf` stores 2-by-2 pivot blocks by writing `-p` at BOTH consecutive IPIV entries. After convert, dsyconvf replaces one of those entries with a positive self-index: for Upper storage it sets `IPIV(I) = I` at the UPPER index of the block, leaving `IPIV(I-1) = -p`; for Lower storage it sets `IPIV(I) = I` at the LOWER index, leaving `IPIV(I+1) = -p`. This asymmetry trips up anyone copying the Upper implementation to Lower: the "active" and "passive" ends of the block are swapped.

- **Phantom row index in reference LAPACK dsyconvf (Upper/Lower Revert).** The Fortran source computes `IP = -IPIV(I)` AFTER the `I = I + 1` (or `I - 1`) advance in the 2-by-2 pivot branch. At this point `IPIV(I)` holds the positive self-index written by Convert, so `IP = -I` — a negative Fortran 1-based row index that addresses memory BEFORE `A(1,1)`. The subsequent `DSWAP` call then reads and writes past the start of the array. For the Upper-Revert case the offset happens to remain in-bounds because the swap range `(I+1):N` shifts the effective memory offsets positive; for Lower-Revert the swap range is `1:I-1`, so the first element always accesses `A(IP-1, 0) = mem[-|I|-1]`. This is undefined behavior that only "works" due to stack layout.

- **Fixture design must avoid the UB.** I initially generated a 5-by-5 fixture with 2-by-2 blocks at the bottom-right of a Lower matrix and spent a long time trying to reconcile JS output with Fortran's out-of-bounds reads. The fix was to restrict the Lower 2-by-2 test to a 3-by-3 matrix with the block at rows (1,2), where the `I > 1` guard skips the swap entirely. Lesson for future translations: **when a routine has a branch that depends on stack memory values, choose fixture inputs that do not trigger that branch**. Verify by inspecting `a_factored != a_reverted` — if a supposed round-trip differs, suspect UB.

- **Mapping Fortran row `-I` to a JS array offset.** In 0-based JS with the positive value `IPIV[i] = i`, Fortran `-IPIV(I)` has to produce JS row index `-(i+2)` (so that `offsetA + ip*strideA1 + j*strideA2` matches Fortran's `(IP-1) + (J-1)*LDA`). I encoded this as `ip = -IPIV[i] - 2`. The usual `~IPIV[i]` shortcut works only for the 2-by-2 encoding (Fortran `-p` ↔ JS `~(p-1)`) — not for this "phantom" case where the source value is positive.

- **Auto-lint codemod reorders var declarations incorrectly.** Running `bin/lint-fix.sh` on a test file with late `var` declarations HOISTED the declarations to the top of each function but preserved the original source order, producing `var X = compute(Y)` lines BEFORE `var Y = ...` (use-before-define). Workaround: write the test file with all vars declared at the top in one block up front, before any assignments.

## Dependency interface surprises

- `dsyconvf` only depends on `dswap` in its JS implementation, but the Fortran test also needs `dsytrf` (and its transitive deps `dsytf2`, `dlasyf`, `disnan`, `dlaisnan`, `ilaenv`, `ieeeck`, `iparmq`) in `test/fortran/deps_dsyconvf.txt` to produce realistic factored fixtures. Pattern: the same transitive set applies to any `dsyconv*` variant.

## Coverage gaps

- Fixture-based DSYTRF inputs on well-conditioned matrices produce identity permutations, so the swap loop bodies inside base.js are NEVER exercised by fixture tests alone. Required several hand-crafted test cases (with explicit non-identity IPIV arrays and small matrices built from ascending integers) to drive coverage to 100%. Pattern: for pivot-applying routines, **always supplement fixture tests with targeted IPIV cases**; do not trust DSYTRF to produce interesting permutations.

