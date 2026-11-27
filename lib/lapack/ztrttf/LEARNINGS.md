# ztrttf: Translation Learnings

## Translation pitfalls

- **LDA mismatch in Fortran test:** When A is declared as `A(NMAX, NMAX)` with NMAX > N, passing LDA=N to ztrttf causes the routine to read from wrong memory locations because the subroutine's column stride is LDA, not the array's actual leading dimension NMAX. Always pass `LDA=NMAX` when the test array is larger than N. This caused garbage output in 4 out of 15 ARF entries per test case.
- **TRANSR='C' (conjugate-transpose) vs TRANSR='T' (transpose):** The complex version ztrttf uses `'C'` / `'conjugate-transpose'` while the real version dtrttf uses `'T'` / `'transpose'`. Both map to `isTransposeOperation` validator but the base.js comparison must use `'no-transpose'` (not `'transpose'`).
- **DCONJG in output:** The DCONJG calls in the Fortran source negate the imaginary part. Simple sign flip on the imaginary component of the Float64 view (`Rv[ir+1] = -Av[ia+1]`).

## Dependency interface surprises

- N/A - ztrttf is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The Fortran test pattern for complex RFP routines (EQUIVALENCE, packing 2D arrays, zeroing) is highly repetitive. Could automate test generation for the z-prefix RFP family (ztrttf, ztfttr, ztpttf, etc.).

## Coverage gaps

- N/A - achieved 100% line, branch, and function coverage with 4 parameter combinations (N/C x U/L) tested at each of 4 matrix sizes (N=5,6,7,8 covering odd/even). Edge cases N=0 and N=1 also covered.

## Complex number handling

- Only conjugation (sign flip on imaginary part) and direct copy needed. No complex arithmetic operations (mul/div/abs) required. All operations inlined as simple `Rv[ir+1] = -Av[ia+1]` for conjugate and `Rv[ir+1] = Av[ia+1]` for direct copy.
- Used `reinterpret()` at function entry for Float64Array views; strides/offsets converted from complex-element to double-based via `*2` multiplication.
