# dggsvd3: Translation Learnings

## Translation pitfalls

- K and l are output parameters (Int32Array of length 1 each). dggsvp3 sets K[0] and l[0].
- JOBU/JOBV/JOBQ are passed directly to both dggsvp3 and dtgsja. dggsvp3 treats 'U' as "compute U from scratch", then dtgsja treats 'U' as "postmultiply existing U with new rotations".
- TAU (for dggsvp3) and WORK share the same WORK array: TAU = WORK[0..N-1], inner WORK = WORK[N..lwork-1]. This aliasing is safe because they occupy non-overlapping ranges.
- The sorting loop at the end only rearranges the WORK copy of ALPHA and stores permutation indices in IWORK. ALPHA and BETA themselves are NOT rearranged. This means tests should compare unsorted ALPHA/BETA, or use property-based checks.
- The GSVD is not unique: different implementations can converge to different (but mathematically equivalent) decompositions. Tests should verify properties (alpha^2 + beta^2 = 1) rather than exact values.

## Dependency interface surprises

- **dlange did not accept single-char norm parameters ('1', 'I', 'M', 'F')** -- it only accepted long-form strings ('one-norm', 'inf-norm', etc.). This caused dlange to return 0 for norm='1', which made tola/tolb = 0, which made dtgsja fail to converge. Fixed by adding single-char comparisons to dlange.
- dggsvp3 takes TAU and WORK as separate array parameters, both carved from the same WORK buffer.

## Missing automation

- N/A

## Coverage gaps

- 100% line and branch coverage on dggsvd3/lib/base.js itself.
- Property-based testing (alpha^2 + beta^2 = 1) used for the diagonal 4x4 case where exact values differ between JS and Fortran.

## Complex number handling

- N/A -- real-only routine.
