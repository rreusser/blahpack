# ztpttf: Translation Learnings

## Translation pitfalls

- The Fortran TRANSR parameter uses 'N'/'C' (not 'N'/'T' as in dtpttf). In JS this maps to 'no-transpose'/'conjugate-transpose'. The dtpttf d-prefix counterpart uses 'no-transpose'/'transpose' -- do not copy its string comparisons blindly.
- DCONJG in the Fortran source translates to simply negating the imaginary part of the Float64 pair (copy real, negate imag). No need for stdlib complex conjugate functions since this is a pure data shuffle with conjugation, not arithmetic.
- The scaffolder only detected uplo validation for ndarray.js but missed transr. Had to manually add isTransposeOperation validation.

## Dependency interface surprises

- N/A -- ztpttf has no BLAS/LAPACK dependencies. It is a pure data rearrangement routine.

## Automation opportunities

- The scaffold generator should detect the TRANSR parameter and auto-add isTransposeOperation validation to ndarray.js. Currently it only recognizes uplo/trans/side/diag but not transr specifically.

## Coverage gaps

- 100% line and branch coverage achieved. All 8 code paths (odd/even x normal/conj-trans x upper/lower) are covered by N=5,6,7,8 test sizes.

## Complex number handling

- Used reinterpret() at function entry to get Float64Array views of both AP and ARF.
- Complex strides/offsets are multiplied by 2 at function entry for Float64 indexing.
- DCONJG is inlined as `RFv[ir] = APv[ip]; RFv[ir+1] = -APv[ip+1]` -- safe since conjugation is just sign negation on the imaginary part (no division, abs, or sqrt involved).
- Plain copy is `RFv[ir] = APv[ip]; RFv[ir+1] = APv[ip+1]`.
