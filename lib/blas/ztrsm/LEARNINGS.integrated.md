# LEARNINGS: ztrsm (complex double-precision triangular solve)

## Translation pitfalls

- The Fortran right-side branches pre-compute `TEMP = ONE/A(J,J)` (complex reciprocal) and then multiply all column elements by it. In JS, this requires using `cmplx.divAt()` with a scratch buffer to compute `1/A[j,j]`, then inlining the multiply. A 6-element Float64Array scratch buffer (`scratch[0..1]` = numerator, `[2..3]` = denominator, `[4..5]` = result) works well for the three-argument pattern.
- For conjugate-transpose with non-unit diagonal, the division `temp / conj(A[i,i])` requires placing the conjugated value into the scratch buffer before calling `cmplx.divAt`. Cannot directly use `Av[ia]` since we need the conjugated version.
- The `continue` statement in the trans/conj-trans inner loops (after `cmplx.divAt`) is needed because the division writes directly to `Bv[ib]`, replacing the `temp -> Bv` assignment that would happen at the end of the if/else.

## Dependency interface surprises

- N/A -- ztrsm has no BLAS/LAPACK dependencies beyond the basic complex arithmetic utilities in `cmplx.js`.

## Missing automation

- The pattern of translating complex BLAS level-3 routines (ztrmm, ztrsm, zherk, etc.) is highly repetitive. The `cmplx.divAt` scratch buffer pattern for reciprocal computation could be factored into a `cmplx.recipAt()` utility function.
- The Fortran test template for complex routines (with EQUIVALENCE and print_cmatrix) is duplicated verbatim between ztrmm and ztrsm. Could be a template in gen_test.py.

## Coverage gaps

- Lines 172-180, 337-345, 385-393 (alpha-scaling branches in left/lower/no-trans, right/upper/no-trans, right/lower/no-trans) are only reached when alpha != (1,0) AND that specific side/uplo/trans combination is chosen. These branches are exercised for left/upper/no-trans via the `complex_alpha_nonidentity` test but not for all three remaining no-trans variants.
- Overall coverage: 95.23% line, 93.27% branch -- exceeds targets.

## Complex number handling

- Used `cmplx.divAt()` for all complex divisions (never inlined).
- Used a module-level `scratch` Float64Array(6) for computing complex reciprocals in the right-side branches where Fortran does `TEMP = ONE/A(J,J)`.
- For conjugate-transpose branches, flipped imaginary sign when reading A elements (`ai = -Av[ia+1]`) rather than creating conjugated copies.
- Complex multiply/subtract inlined directly (safe per CLAUDE.md guidelines).
