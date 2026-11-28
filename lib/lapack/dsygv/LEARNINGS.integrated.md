# dsygv: Translation Learnings

## Translation pitfalls

- dsyev uses 'compute'/'none' for the JOBZ parameter, not 'V'/'N'. This is the stdlib-js long-form convention. The Fortran DSYGV uses 'V'/'N' but the JS wrapper normalizes.
- The LWORK parameter and workspace query (LWORK=-1) from the Fortran are not implemented in base.js since workspace is managed by the caller. The implementation allocates no workspace internally.
- When dpotrf fails (B not positive definite), the return value is N + info, not just info. This offset convention matches the Fortran exactly.
- Eigenvectors may differ by sign between JS and Fortran. Tests compare absolute values of eigenvector components to avoid false negatives.

## Dependency interface surprises

- dsyev returns info as a scalar (0 = success, >0 = convergence failure at step info). The caller must check info after dsyev and handle partial convergence (neig = info - 1 converged eigenvalues).
- dpotrf returns 0 on success, k>0 if the k-th leading minor is not positive definite. dsygv adds N to this to distinguish dpotrf failures from dsyev failures.
- dtrsm and dtrmm use consistent long-form strings ('left', 'right', 'transpose', 'no-transpose', 'non-unit', 'upper', 'lower').

## Automation opportunities

- The Fortran deps file needed manual addition of la_constants and la_xisnan modules (required by dlassq). The init_routine.py script should detect module dependencies transitively.

## Coverage gaps

- 97.8% line coverage, 86.7% branch coverage. The uncovered branches are: info>0 from dsyev (convergence failure case, lines 104-105) and the itype=3 + upper path (line 122, not tested because we only test itype=3 + lower).
- Testing dsyev convergence failure would require a specially constructed ill-conditioned matrix.

## Complex number handling

- N/A -- real-only routine.
