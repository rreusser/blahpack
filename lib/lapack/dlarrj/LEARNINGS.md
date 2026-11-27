# dlarrj: Translation Learnings

## Translation pitfalls

- The routine uses a linked-list structure in IWORK for tracking unconverged intervals. IWORK(2*I-1) stores the index of the next unconverged interval, while IWORK(2*I) stores the Sturm count. When converting to 0-based array access, the 1-based index K=2*I maps to array positions (K-2) and (K-1), i.e., IWORK[(2*I-2)*stride] and IWORK[(2*I-1)*stride].
- The PREV pointer update `IWORK(2*PREV-1) = NEXT` in the converged-interval removal must use `(2*PREV-2)*stride` for the 0-based offset. This is easy to get wrong.
- MAXITR uses `floor(log(spdiam+pivmin)/log(2)) + 2` -- the Fortran `INT()` truncates toward zero, matching JS `Math.floor()` for positive values. Since the argument is always positive (log of positive ratio), `floor` is correct here.
- The GO TO 20 / GO TO 50 backward jumps translate cleanly to `while (true) { ... break }` patterns.
- The GO TO 80 outer loop translates to `while (NINT > 0 && iter <= MAXITR)`.
- The GO TO 100 (skip to next iteration of DO 100) translates to `continue` in the for loop.

## Dependency interface surprises

- N/A: dlarrj has no external BLAS/LAPACK dependencies. It is self-contained.

## Automation opportunities

- The Fortran test file needs DLAMCH for PIVMIN, requiring dlamch/ieeeck/ilaenv/iparmq in the deps file even though dlarrj itself has no dependencies. This is a known issue with deps.py missing transitive test-only dependencies.

## Coverage gaps

- All code paths covered (100% line and branch coverage). The interval expansion loops (left boundary and right boundary) required test cases with deliberately misplaced initial estimates to trigger.
- The mixed converged/unconverged test was needed to exercise the linked-list pointer update when a converged interval appears between unconverged ones during initialization.

## Complex number handling

- N/A: dlarrj is a real-valued routine.
