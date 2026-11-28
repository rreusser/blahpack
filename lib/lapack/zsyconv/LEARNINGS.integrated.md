# zsyconv: Translation Learnings

## Translation pitfalls

- Direct port of dsyconv with complex array handling. The structure is identical -- only the element access differs (each complex element = 2 Float64 values).
- IPIV encoding is the same as dsyconv: positive values are 0-based indices, negative values use bitwise NOT (`~IPIV[i]`) to extract the 0-based interchange index. Fortran's `-p` (1-based) maps to JS `~(p-1) = -p`, so the raw numeric value is preserved.
- The N=1 edge case works correctly: upper convert value loop starts at `i = N-1 = 0`, `while (i > 0)` exits immediately, but `E[0] = 0+0i` is set before the loop.

## Dependency interface surprises

- N/A -- zsyconv is a leaf routine with no external LAPACK/BLAS dependencies.

## Automation opportunities

- The translation from dsyconv to zsyconv was mechanical: every scalar read/write became a pair of re/im operations, every zero assignment became two zero assignments, every swap became a 4-value swap (re+im for each side). This pattern (real -> complex lift) could be automated as a transform for any routine that only does assignments and swaps on array elements (no arithmetic).
- The Fortran test for zsyconv is structurally identical to dsyconv's test, just with complex data types and EQUIVALENCE for printing. A template generator for "complex version of existing real test" would save time.

## Coverage gaps

- Lines 274-284 and 314-324 (lower convert/revert 2x2 permutation swap when `i > 0`) are uncovered because the test fixture's 2x2 pivot block occurs at position 0 (IPIV = [-2, -2, 3, 4] in Fortran), so `i > 0` is false when the 2x2 branch is entered. Same gap as dsyconv. A larger matrix with a 2x2 pivot block in the interior would cover these lines. Overall coverage: 93.7% line, 95.5% branch -- above thresholds.

## Complex number handling

- No complex arithmetic is performed -- zsyconv only copies, zeros, and swaps complex values. All operations are on Float64 views of the Complex128Array (`reinterpret()`), treating each complex number as a (re, im) pair.
- Strides and offsets are passed in complex-element units at the API boundary, then doubled internally (`sa1 = strideA1 * 2`) for Float64 indexing. This follows the standard convention for routines that do `*2` internally.
- No need for `cmplx.js` -- no division, absolute value, multiplication, or any other complex arithmetic operation.
