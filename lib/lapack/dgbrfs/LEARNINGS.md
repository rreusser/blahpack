# dgbrfs: Translation Learnings

## Translation pitfalls

- Fortran WORK array is length 3*N with three partitions: WORK(1:N) for absolute denominators, WORK(N+1:2N) for residuals, WORK(2N+1:3N) for dlacn2's V workspace. In JS these map to WORK offsets 0, N*stride, and 2*N*stride.
- Fortran IWORK is INTEGER array of length N, used as ISGN in dlacn2. In JS this becomes Int32Array.
- The dgbtrs call for the refinement step passes WORK(N+1) with LDB=N. In JS the strideB2 parameter corresponds to LDB, so we pass N*strideWORK.
- TRANS maps: Fortran 'N'->'no-transpose', 'T'->'transpose'. Unlike the complex zgbrfs which uses 'conjugate-transpose', the real version uses 'transpose' for the alternate case.

## Dependency interface surprises

- dlacn2 has an ISGN parameter (Int32Array) that does not exist in the complex zlacn2. The complex version works directly with complex vectors.
- dgbmv uses scalar alpha/beta (real numbers -1.0, 1.0) rather than Complex128 objects.
- The dlacn2 reverse communication interface uses V (offset 2*N) and X (offset N) from the same WORK array. The ISAVE/KASE/EST arrays are allocated internally per the zgbrfs pattern.

## Automation opportunities

- The deps_*.txt file generation missed dgbtrf, dgbtf2, dlaswp as transitive deps needed for Fortran test compilation. These were manually added.

## Coverage gaps

- All 7 test cases pass: no-transpose, transpose, multi-RHS, N=0, NRHS=0, wider bandwidth (KL=2,KU=1), and 1x1 system.
- The iterative refinement loop (count > 1) is not exercised because the initial solve from dgbtrs is already within machine precision for these well-conditioned test matrices. Would need an ill-conditioned matrix or a perturbed initial solution to exercise that path.

## Complex number handling

- N/A: dgbrfs is a real-valued routine.
