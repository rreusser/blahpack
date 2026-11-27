# zlagtm: Translation Learnings

## Translation pitfalls

- Straightforward translation from dlagtm with complex arithmetic added. The structure is identical: beta scaling, then alpha*A*X with three branches for trans.
- The transpose branch swaps DL/DU roles (row i of A^T uses DU[i-1] for sub-diagonal, DL[i] for super-diagonal). The conjugate-transpose branch additionally negates the imaginary parts of DL/D/DU elements.
- Fortran EQUIVALENCE offset for 2D arrays: `b(10,4)` with EQUIVALENCE to `b_r(80)` means column 2 starts at b_r(21), not b_r(9). Each column has LDA=10 complex elements = 20 doubles.

## Dependency interface surprises

- N/A -- zlagtm is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- Complex tridiagonal multiply is mechanically derived from the real version. A tool that adds conjugation/reinterpret patterns to a real-valued base.js would eliminate most of the manual work.

## Coverage gaps

- 100% line, branch, and function coverage achieved. All six trans*alpha combinations tested for both N=1 and N>1 cases.

## Complex number handling

- All complex multiplications are inlined (safe: only addition, subtraction, multiplication). No division or absolute value is needed.
- Pattern: `tr = ar*xr - ai*xi; ti = ar*xi + ai*xr` for complex multiply, with `ai = -ai` for conjugation.
- Alpha and beta are real scalars (not complex), so beta scaling is just real negate/zero, matching dlagtm exactly.
