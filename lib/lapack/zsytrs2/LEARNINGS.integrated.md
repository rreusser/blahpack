# zsytrs2: Translation Learnings

## Translation pitfalls

- The dsytrs2 reference implementation was the primary guide. The complex version is structurally identical; the main difference is that all scalar arithmetic (division by diagonal elements, 2x2 block solve) becomes complex.
- The Fortran test IPIV values are 1-based; JS IPIV is 0-based. zsytrf already produces 0-based IPIV, so no conversion was needed in the test harness.
- The Fortran deps file for the test must include zsytrf and all its transitive dependencies (zsytf2, zlasyf, zsyr, etc.) to compile.

## Dependency interface surprises

- ztrsm takes long-form string parameters: 'left'/'right', 'upper'/'lower', 'no-transpose'/'transpose'/'conjugate-transpose', 'unit'/'non-unit'. This differs from the Fortran convention ('L','U','N','T','C','U','N'). Initially used short-form strings which caused silent incorrect results (ztrsm treated unknown strings as false for all boolean flags).
- zsyconv takes 'U'/'L' (short form) for uplo, matching the convention used by zsytrs2 itself.
- zswap, zscal, and ztrsm all use complex-element strides/offsets at the API boundary.
- zscal takes a Complex128 scalar, not separate re/im parts.

## Automation opportunities

- N/A for this routine. The translation was straightforward given the dsytrs2 template.
- A general rule could be added: when translating from a real routine to its complex counterpart, auto-replace `dtrsm -> ztrsm`, `dswap -> zswap`, `dscal -> zscal`, `dsyconv -> zsyconv`, and add reinterpret + Complex128 boilerplate.

## Coverage gaps

- 97.95% line, 86.67% branch coverage achieved. Uncovered lines are the `k > 0` / `k < N - 1` guard conditions in 2x2 pivot swap paths for upper (undo permutations) and lower (apply permutations). These would require a 2x2 pivot block at the very first or last position, which is matrix-dependent and hard to control.

## Complex number handling

- All 2x2 block diagonal divisions use `cmplx.divAt` (NEVER inlined complex division). This includes: dividing B entries by akm1k, computing akm1=A(i-1,i-1)/akm1k, computing ak=A(i,i)/akm1k, and dividing the final results by denom.
- Complex multiplication (akm1*ak, ak*bkm1, etc.) is safely inlined since it only involves mul/sub/add.
- The 1x1 pivot path computes 1/A(i,i) via `cmplx.divAt(scratch, 2, [1,0], Av, ia)` and then passes the result as a `new Complex128` to zscal.
- A module-level scratch Float64Array(6) is used for temporary complex values during the block diagonal solve, avoiding per-call allocation.
