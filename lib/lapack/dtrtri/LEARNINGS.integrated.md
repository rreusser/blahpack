# dtrtri: Translation Learnings

## Translation pitfalls

- [x] The Fortran source uses ILAENV to determine the block size NB at runtime. In JS, we use a fixed NB=2 (small for testing; in production, NB=64 would be typical). This means the blocked algorithm is always used for N>2.
- [x] The singularity check iterates through all diagonal elements and returns early with the 1-based index of the first zero diagonal. This happens BEFORE any matrix modification, so the matrix is unchanged on singular return.
- [x] The lower triangular blocked path starts from `nn = floor((N-1)/NB)*NB` and works backward. This is the 0-based equivalent of the Fortran `NN = ((N-1)/NB)*NB + 1`.
- [x] A linter bug was discovered in dtrmm's left-lower-notrans path: it reordered the diagonal multiply before the off-diagonal loop, causing the off-diagonal elements to use `temp` with the diagonal factor included. The fix applies the diagonal multiply only to B[K,J] itself, keeping `temp = alpha*B[K,J]` for the off-diagonal accumulation.

## Dependency interface surprises

- [x] DTRTRI calls DTRTI2 (unblocked), DTRMM (triangular matrix multiply), and DTRSM (triangular solve). All three use the same stride/offset API, so submatrix views are passed via offset arithmetic.
- [x] The DTRMM and DTRSM calls use the same backing array A for both the triangular operator and the rectangular matrix being modified. This in-place operation works correctly because DTRMM processes rows/columns in the right order.
- [x] ILAENV is not ported; replaced with a compile-time constant NB.

## Automation opportunities

- [x] The blocked algorithm structure (loop over blocks, call DTRMM+DTRSM on off-diagonal portion, call DTRTI2 on diagonal block) is a common LAPACK pattern also seen in dpotrf, dgetrf, etc. A generic "blocked triangular operation" template could generate these.

## Coverage gaps

- [x] Achieved 100% coverage with 11 tests: upper/lower x non-unit for 3x3, 4x4, 5x5 matrices, N=0, N=1 (unblocked path), singular (zero diagonal), unit diag, and identity.
- [x] With NB=2, the blocked code paths are exercised for all matrices with N>2, and the unblocked fallback is exercised for N=1.

## Complex number handling

- [x] N/A. Real-valued only. Complex equivalent (ztrtri) would have the same structure.
