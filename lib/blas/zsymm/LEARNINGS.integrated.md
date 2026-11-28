# zsymm: Translation Learnings

## Translation pitfalls

- Key difference from zhemm: zsymm has NO conjugation anywhere. Every place zhemm uses `conj(A[k,i])`, zsymm uses `A[k,i]` directly. This changes both the off-diagonal accumulation (`temp2`) and the right-side k-loop element access.
- Diagonal of A is fully complex in zsymm (not forced real as in zhemm). The diagonal multiply `temp1 * A[i,i]` requires a full complex multiply (`temp1R*aiiR - temp1I*aiiI`), not just real scaling (`temp1R*aiiR`). Missing the imaginary part of the diagonal would silently produce wrong results for matrices with non-real diagonal.
- The right-side path in zhemm has conjugation when reading across the triangle boundary (e.g., `conj(A[j,k])` for upper when k>j). In zsymm, both branches read the element directly without conjugation, making the right-side path structurally simpler.

## Dependency interface surprises

- N/A. zsymm is a leaf-level BLAS routine with no dependencies beyond stdlib array utilities.

## Automation opportunities

- The zsymm/zhemm pair differs only in conjugation and diagonal treatment. A parameterized generator could produce both from a single template. Worth considering if csymm (single-precision complex symmetric) is ever needed.

## Coverage gaps

- 97.92% branch coverage achieved. The only uncovered branch is likely the compound quick-return condition where `alpha=0 && beta=1` (the identity operation). All code paths (left/upper, left/lower, right/upper, right/lower, beta=0 vs beta!=0) are fully covered by the 13 test cases.

## Complex number handling

- All complex arithmetic in zsymm is addition, subtraction, and multiplication -- no division, absolute value, or square root. Everything is safely inlined without stability concerns.
- The `reinterpret()` pattern at function entry converts Complex128Array to Float64Array views, with strides and offsets multiplied by 2 for double-precision indexing.
- Complex multiply is expanded inline as `(aR*bR - aI*bI, aR*bI + aI*bR)` throughout.
