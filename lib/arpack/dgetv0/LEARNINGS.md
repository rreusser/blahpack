# dgetv0: Translation Learnings

## The reverse-communication state-object pattern (first of its kind)

dgetv0 is blahpack's first reverse-communication routine and establishes the
pattern reused by dsaitr/dsaup2/dsaupd:

-   The Fortran `SAVE` variables (`first`, `orth`, `iter`, `rnorm0`, `iseed`)
    become fields on a caller-supplied `state` object. The caller creates
    `const state = {}` once and threads it through every call.
-   `ido` (the RC flag) and `rnorm` are **length-1 typed arrays** (in/out).
    `info`/`ierr` is the return value.
-   `ipntr` is written **0-based** (the reference uses 1-based Fortran workd
    indices); the caller reads `workd[ ipntr[0] .. ]` / `workd[ ipntr[1] .. ]`.
-   The Fortran resume `go to`s (labels 20/40, gated on `first`/`orth`) become a
    **resume dispatch** at function entry: `ido==0` → fresh start; else
    `first` → label 20; else `orth` → label 40; else → the "after OP*x"
    fall-through. The backward reorthogonalization loop (label 30 <-> 40) is a
    plain `for(;;)` with an `entry` program-counter.

## Fixture gotchas

-   `iseed` is `SAVE` and persists across ALL calls in a Fortran program, so a
    multi-case driver evolves one seed. To keep fixture cases independently
    reproducible in JS, only ONE case uses `initv=.false.` (the random path);
    the rest pass a known `resid` with `initv=.true.`, which never touches the
    seed. Case 1 (random) confirms `dlarnv` matches Fortran bit-for-bit.
-   A `bmat='G'` case with `B = I` exercises the `ido=2` returns and must give
    the same result as the corresponding `bmat='I'` case — a useful cross-check.

## Dependency / tooling

-   `dnrm2` is a self-contained BLAS `.f90` (not `.f`); `run_fortran.sh` now
    globs `$BLAS_DIR/*.f90` for arpack builds. `dlarnv` pulls in `dlaruv`.
-   Uses `dlarnv` (LAPACK) + `dcopy`/`dgemv`/`ddot`/`dnrm2` (BLAS). `iseed` must
    be an `Int32Array` for `dlarnv`'s integer seed arithmetic.
