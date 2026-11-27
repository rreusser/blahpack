# dsaitr: Translation Learnings

## Reverse communication with FIVE resume points + a nested RC sub-routine

dsaitr is the largest RC routine so far. It reuses the dgetv0 state-object
pattern but with a richer state machine:

-   SAVE flags step3/step4/orth1/orth2/rstart each mark a distinct point where
    the routine returned to the caller for OP*x or B*x. The Fortran `go to`
    dispatch (`if (step3) go to 50`, ...) becomes an `entry`/`pc` program
    counter driving a `for(;;)` of `if (pc === <label>)` blocks, with the main
    Arnoldi loop (label 1000) and the reorthogonalization loop (labels 80<->90)
    as backward jumps.
-   `ido`/`rnorm` are length-1 typed arrays; `ipntr` is 0-based; `info` is the
    return value; `j` is kept 1-based (convert to 0-based column `j-1` for V/H).
-   The RESTART path calls dgetv0, which is ITSELF reverse-communication and
    shares the same `ido`. dgetv0's state is nested at `state.gv0` (created once
    so its random seed persists across restarts, matching Fortran SAVE).

## Fixture gotchas

-   The loop invariant requires `workd(ipj) = B*resid` set by the CALLER before
    the first `ido=0` call (the driver sets workd(0:N-1)=resid for B=I).
-   The restart path (invariant subspace -> dgetv0 random vector) is genuinely
    hard to reproduce in a standalone fixture: it depends on dgetv0's SAVE
    `iseed` across the dsaitr->dgetv0 boundary, and a symmetric matrix + start
    can hit an invariant subspace after fewer than np steps. So all fixture
    cases use ASYMMETRIC matrices/starts (full-rank Krylov space -> no restart,
    deterministic). The restart logic is translated line-for-line and is
    exercised end-to-end by dsaup2. A `bmat='generalized'` case with B=I
    exercises the ido=2 returns and cross-checks against the standard case.

## Dependencies

-   dgetv0 (nested RC), dlascl + dlamch (LAPACK), daxpy/dcopy/dscal/dgemv/ddot/
    dnrm2 (BLAS). rnorm is IN/OUT (overwritten with the final residual norm) -
    capture the initial value before the loop if you need it.
