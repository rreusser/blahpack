# dla_gbrcond: Translation Learnings

## Translation pitfalls

- Fortran uses 1-based band indexing (KD=KU+1, KE=KL+1); JS uses 0-based (kd=ku, ke=kl).
- The transpose logic is inverted between KASE branches in the dlacn2 loop: when notrans, KASE===2 uses 'no-transpose' for dgbtrs, but KASE===1 uses 'transpose'. This is intentional (estimating inv(A) norm requires both A and A^T solves).
- Mixed operator lint: `(2*N+i)` must be `((2*N)+i)` for eslint no-mixed-operators rule.
- The N=1 edge case in the Fortran test requires KL=0,KU=0 since KL must be <= N-1.

## Dependency interface surprises

- dgbtrs takes strideB2 as the leading dimension for the RHS matrix; for a single RHS column vector, pass N*sw (not just 1).
- dlacn2 uses IWORK (Int32Array) as the ISGN array, not as general integer workspace.
- WORK layout spans 3*N elements: [0..N-1] = x vector for dlacn2, [N..2N-1] = v workspace for dlacn2, [2N..3N-1] = cached absolute row sums.
