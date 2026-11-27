# zgbmv: Translation Learnings

## Translation pitfalls

- Fortran test comments were wrong about which band storage indices correspond to which full matrix elements. The comment `a(14) = A(2,4)` was incorrect; a(14) actually maps to A(3,4) because band row 2 for column j=4 with KU=2 is i = 2+4-2-1 = 3 (1-based). The fixtures were correct (computed by Fortran), but the JS test initially used the wrong band layout. Lesson: always verify band storage mapping with the formula `A_band(KU+1+i-j, j) = A_full(i,j)` rather than trusting comments.
- The `ky` pointer advancement for non-unit stride in the no-transpose branch (`if (j >= ku) ky += sy`) must be outside the inner loop but inside the outer loop. Matching the dgbmv real-valued template made this straightforward.
- For the transpose/conjugate-transpose branches, `kx` must be recomputed at the start of each column rather than carried across columns as in the no-transpose branch. The Fortran uses `IX = KX` with KX tracking the start, while the JS implementation computes `kx = oX + (max(0, j-ku) * sx)` directly.

## Dependency interface surprises

- N/A. zgbmv is a leaf BLAS routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The Fortran test band matrix setup is error-prone due to 1-based column-major indexing. A helper script that generates band storage data from a full matrix description would reduce bugs. This applies to all banded routines (dgbmv, zgbmv, zhbmv, ztbmv, etc.).

## Coverage gaps

- N/A. Achieved 100% line and 100% branch coverage on base.js.

## Complex number handling

- All complex arithmetic (multiply, add, scale) is inlined as real/imag component operations. No cmplx.div or cmplx.abs needed since zgbmv only performs multiply-accumulate operations.
- Conjugation for the `A^H` path is done by negating the imaginary part: `aijI = -Av[ia+1]`. This is safe to inline per the project rules.
- The `reinterpret()` pattern converts Complex128Array to Float64Array view at function entry, with all strides and offsets multiplied by 2 for double-based indexing.
