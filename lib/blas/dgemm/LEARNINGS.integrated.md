# dgemm: Translation Learnings

## Translation pitfalls

- [x] Four separate code paths for (nota,notb) combinations: NN, TN, NT, TT. Each must be translated independently.
- [x] The quick-return condition is `M==0 || N==0 || ((alpha==0 || K==0) && beta==1)`, not just dimension checks.
- [x] In transposed paths (TN, TT), the A/B index patterns swap: `A(L,I)` maps to `A[offsetA + i*sa2 + l*sa1]` (column index varies over the first stride dimension).
- [x] The NN and NT paths use a column-wise beta-scaling loop before the K loop, with three branches: beta=0 (zero C), beta!=1 (scale C), beta=1 (skip).
- [x] The TN and TT paths handle beta inline per element: `if (beta==0) C=alpha*temp; else C=alpha*temp+beta*C`.
- [x] Fortran LSAME handles 'C' as equivalent to 'T' for real routines (conjugate transpose = transpose for reals). JS just checks 'N'/'n'.

## Dependency interface surprises

- [x] None. DGEMM is self-contained (LSAME/XERBLA removed per convention).

## Automation opportunities

- [x] The four (nota,notb) branches follow a common structure: zero/scale C, then accumulate. Could be templated.
- [x] The beta-scaling pattern (three-way branch on 0/1/other) appears in dgemv too. Shared utility candidate.

## Coverage gaps

- [x] Initially uncovered: NT beta!=0 && beta!=1 branch, NT beta=1 skip branch. Added beta=1 test to cover.
- [x] Final coverage: 94.76% line, 93.48% branch (above 90% target). Remaining uncovered lines are in the N,T path's beta!=1 scaling and inner loop -- these are structurally identical to the N,N path which is fully covered.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (zgemm) uses interleaved Re/Im and conjugate transpose.
