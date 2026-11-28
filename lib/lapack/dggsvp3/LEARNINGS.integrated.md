# dggsvp3: Translation Learnings

## Translation pitfalls

- K and L are output integer parameters in Fortran. In JS, they must be passed as arrays (K[0], l[0]) since JS has no pass-by-reference for scalars. This follows the same pattern as dgelss's rank parameter.
- dgeqp3 returns 1-based JPVT/IWORK indices. dlapmt expects 0-based indices. Must subtract 1 from each IWORK entry after dgeqp3 and before dlapmt.
- The Fortran uses LSAME for character comparison; JS uses direct string equality with single characters ('U', 'V', 'Q', 'N').
- The matrix [1,2,3,4; 5,6,7,8; 9,10,11,12] is rank-2, causing the third Householder reflector in dgeqr2 to differ from Fortran's dgeqr2 due to near-zero pivot. Orthogonal matrices from rank-deficient inputs may differ between JS and Fortran while both being mathematically valid. Tests should verify orthogonality properties rather than exact element values for such cases.

## Dependency interface surprises

- dgeqp3: returns 1-based JPVT indices, unlike dlapmt which expects 0-based. This conversion is not documented in the dependency interface.
- dorg2r: with K=0, produces identity matrix (correct but non-obvious edge case).
- dlapmt: takes boolean `forwrd` parameter (JS true/false), not a character.

## Automation opportunities

- The IWORK 1-based to 0-based conversion after dgeqp3 is a repeating pattern in any routine that chains dgeqp3 -> dlapmt. Could be worth documenting in dependency-conventions.md.

## Coverage gaps

- 100% line and branch coverage achieved. All code paths exercised through 9 test cases covering: UVQ computation, NNN (no orthogonal matrices), M=0/N=0/P=0 edge cases, rank-deficient B, wide matrices, diagonal matrices, and tall B.

## Complex number handling

- N/A: dggsvp3 is a real-valued routine.
