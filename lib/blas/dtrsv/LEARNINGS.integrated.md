# dtrsv: Translation Learnings

## Translation pitfalls

- The Fortran has separate code paths for INCX=1 (unit stride) vs non-unit stride. The JS translation unifies these since the stride/offset API handles both cases uniformly -- no stride-1 specialization needed.
- dtrsv is structurally very similar to dtrmv: same UPLO/TRANS/DIAG branching, same loop structure. The key difference is division instead of multiplication on the diagonal, and subtraction of off-diagonal contributions (solving vs accumulating).
- Care needed with the "x[j] != 0" optimization in the no-transpose cases: after dividing by the diagonal, the value of x[j] is used for the remaining substitutions. The transpose cases accumulate into temp first, then divide.

## Dependency interface surprises

- N/A -- dtrsv has no external BLAS/LAPACK dependencies.

## Automation opportunities

- The dtrsv and dtrmv implementations are nearly identical in structure (same branching, same pointer setup). A parameterized template or transform could generate both from a single description of the triangular matrix-vector operation pattern.

## Coverage gaps

- 100% line, branch, and function coverage achieved.
- All 8 UPLO/TRANS/DIAG combinations tested (2x2x2 = 8 tests).
- Edge cases N=0, N=1 (unit and non-unit), non-unit stride, negative stride, non-zero offsets, and zero RHS entries all covered.

## Complex number handling

- N/A -- dtrsv is a real (double precision) routine.
