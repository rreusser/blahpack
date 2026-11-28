# dsyrk: Translation Learnings

## Translation pitfalls

- [x] The no-transpose path (C := alpha*A*A^T + beta*C) accesses A with `A[offsetA + j*sa1 + l*sa2]` for the outer element (row j, col l), and the inner loop iterates over rows 0..j (upper) or j..N-1 (lower). The key insight is that the inner A access shares the same column l but varies the row.
- [x] The transpose path (C := alpha*A^T*A + beta*C) has a different structure: the inner loop over K computes a dot product `sum_l A(l,i)*A(l,j)`, then applies alpha and beta inline per element. This avoids the beta pre-scaling loop used in the no-transpose path.
- [x] The quick-return condition includes `(alpha==0 || K==0) && beta==1` -- if beta is not 1, we must still scale C even when alpha is zero or K is zero.

## Dependency interface surprises

- [x] N/A. dsyrk is self-contained with no BLAS/LAPACK dependencies.

## Automation opportunities

- [x] The four (upper/lower) x (nota/transpose) code paths follow repetitive patterns. The upper/lower distinction only changes the inner loop range (0..j vs j..N-1). Could potentially template this, but the paths are short enough that manual translation is straightforward.

## Coverage gaps

- [x] Lines 167, 181 uncovered: these are the `A[j,l] !== 0` guard branches in the lower no-transpose path when all A elements happen to be nonzero. 98.97% line, 96.43% branch coverage achieved.

## Complex number handling

- [x] N/A. Real-valued only. The complex equivalent (zherk) uses conjugate transpose and would need Re/Im handling.
