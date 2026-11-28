# dtfsm: Translation Learnings

## Translation pitfalls

- The routine has 32 dispatch paths (2 SIDE x 2 TRANSR x 2 UPLO x 2 TRANS x odd/even), each with different sub-block offset arithmetic. Careful line-by-line translation from the Fortran reference is essential.
- For SIDE='L', the relevant dimension for RFP structure is M. For SIDE='R', it is N. Each uses different M1/M2 or N1/N2 splits and different k/K variables.
- The Fortran `A(offset)` maps to `offsetA + (sa * offset)` in JS, and the Fortran LDA maps to `strideA2 = sa * LDA` while `strideA1 = sa`.
- The `!notrans` pattern (Fortran `IF (.NOT.NOTRANS)`) is preserved with `no-negated-condition` eslint disable, matching the Fortran structure exactly to reduce translation errors.
- dtfsm has no return value (void), unlike dpftrf which returns info.

## Dependency interface surprises

- `dtrsm` and `dgemm` both use 2D stride conventions (strideA1, strideA2, offsetA) for all matrix arguments, including the sub-blocks of the 1D RFP array A.
- For `dgemm`, the C output matrix uses the same stride/offset as B subsets, so `B, sb1, sb2, offsetB + (sb1 * m1)` maps to `B(M1, 0)` in Fortran.

## Fortran test pitfalls

- The `build_triangular` subroutine must accept an explicit leading dimension parameter to match the actual 2D array layout. Passing a `(20,20)` array to a function expecting `(n,n)` causes Fortran to reinterpret the storage with wrong strides.
- LDB in the dtfsm call must match the actual leading dimension of the B array. Using LDB=M when the Fortran array has leading dimension 20 causes data to be written to wrong positions.

## Automation opportunities

- The 8-path RFP dispatch pattern (odd/even x normal/trans x lower/upper) is shared between dpftrf, dtfsm, and likely other RFP routines. A template-based generator could reduce manual effort.
- The Fortran test pattern (build triangular -> dtrttf -> call routine -> print) is reusable across RFP routines.

## Coverage gaps

- All 32 computational dispatch paths are covered via fixture-based testing.
- M=1 special cases (where the lower/trans branches skip dgemm/dtrsm steps) are tested for both TRANSR='N' and TRANSR='T'.
- Edge cases: M=0, N=0, alpha=0.
- Unit diagonal variant tested for all four combination types.
- Larger matrices (M=5, M=6) test additional odd/even paths beyond the minimal 3/4.

## Complex number handling

- N/A: dtfsm is a real-valued routine.
