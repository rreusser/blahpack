# dsyconv: Translation Learnings

## Translation pitfalls

- Negative IPIV extraction: In Fortran, `IP = -IPIV(I)` gives a 1-based row index. In JS with 0-based IPIV convention, the correct extraction is `ip = -IPIV[i]` (NOT `-IPIV[i] - 1`). The stored negative value's magnitude IS the 0-based index directly. Initially used `-IPIV[i] - 1` which caused an off-by-one in the 2x2 pivot permutation swaps.
- The four main code paths (upper/lower x convert/revert) each have two sub-phases (value extraction + permutation, or permutation + value reinsertion). The ordering of these sub-phases differs between convert and revert, which is load-bearing.
- N=1 edge case: The upper convert value loop starts at `i = N-1 = 0` and the `while (i > 0)` check immediately terminates, but `E[0] = 0` is set before the loop. For lower convert N=1, `E[N-1] = 0` is set before the loop. Both are correct.

## Dependency interface surprises

- N/A -- dsyconv is a leaf routine with no external LAPACK/BLAS dependencies.

## Automation opportunities

- The IPIV conversion pattern (Fortran 1-based to JS 0-based) with negative values is a recurring pattern across LAPACK routines. The conversion rule is: positive values subtract 1, negative values add 1 (i.e., `sign(v) * (|v| - 1)`). This could be a shared test utility.
- The Fortran test deps file needed manual addition of `ilaenv`, `ieeeck`, `iparmq` for dsytrf. The `deps.py` tool only lists direct LAPACK dependencies but not these utility routines that LAPACK routines depend on internally. Could be improved.

## Coverage gaps

- Lines 206-211 and 236-241 (lower convert/revert 2x2 permutation swap when `i > 0`) are uncovered because the test fixture's 2x2 pivot block occurs at position 0 (IPIV = [-1, -1, 2, 3] in 0-based), so `i > 0` is false when the 2x2 branch is entered. A larger matrix with the 2x2 block in the middle would cover this. Overall coverage: 95.5% line, 95.5% branch -- above thresholds.

## Complex number handling

- N/A -- dsyconv operates only on real (double precision) data.
