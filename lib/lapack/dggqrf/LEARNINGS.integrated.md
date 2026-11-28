# dggqrf: Translation Learnings

## Translation pitfalls

- dggqrf is a thin wrapper over dgeqrf + dormqr + dgerqf, making it one of the simplest LAPACK driver routines. No index arithmetic issues.
- The Fortran LWORK/-1 workspace query pattern was dropped entirely since JS allocates workspace internally.
- The ILAENV calls for optimal block sizes were removed; the underlying routines use their own DEFAULT_NB constants.

## Dependency interface surprises

- dormqr uses long-form strings: 'left'/'right' for side, 'transpose'/'no-transpose' for trans. This is consistent with other stdlib-js conventions but differs from Fortran's single chars.
- dormqr's K parameter is min(N, M), i.e., the number of reflectors from the QR factorization, not the matrix dimensions themselves.

## Automation opportunities

- N/A: the implementation was straightforward with no mechanical steps.

## Coverage gaps

- The N=0 quick return covers the early exit but the main body (dgeqrf/dormqr/dgerqf calls) gets low branch coverage due to the underlying blocked vs unblocked paths being data-size-dependent. The tall_skinny test exercises a non-square case.
- dlarfb and dlarft show low coverage because the test matrices are small enough that only the unblocked path (dgeqr2/dgerq2/dorm2r) is used.

## Complex number handling

- N/A: dggqrf is a real-valued routine.
