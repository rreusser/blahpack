# dsaup2: Translation Learnings

dsaup2 is the IRLM driver: the most complex RC routine in the closure. It
orchestrates dgetv0, dsaitr, dseigt, dsgets, dsconv, dsortr, and dsapps, and
nests TWO reverse-communication sub-routines (dgetv0 and dsaitr) under its own
RC loop.

## Reverse communication: nested state, resume dispatch

-   SAVE flags `getv0`/`update`/`ushift`/`cnorm`/`initv` each mark a point where
    the routine returned to the caller. The Fortran resume block at the top
    (`if (getv0) go to 20`, ...) becomes an `entry`/`pc` program counter driving
    a `for(;;)` of `if (pc === <label>)` blocks. The labels map: getv0 -> the
    dgetv0 sub-loop; update -> 20 (dsaitr extend); ushift -> 50 (user shifts
    supplied); cnorm -> 100 (recompute B-norm); first entry (none set) -> 0
    (initial dsaitr call).
-   Two nested RC states: `state.gv0` (dgetv0, used only for the initial
    starting vector when `info=0`) and `state.saitr` (dsaitr, used every
    iteration). They share the single length-1 `ido` array threaded through.
    dsaitr in turn nests its OWN dgetv0 at `state.saitr.gv0` for restarts, so
    there are three levels of nested SAVE state, all self-consistent.
-   `nev`, `np`, and `mxiter` are length-1 Int32Array (in/out): the algorithm
    grows/shrinks nev and np each restart, and returns nconv in `np` and the
    iteration count in `mxiter` on exit. `state.rnorm` is a length-1 Float64Array
    that persists the residual B-norm across the dsaitr calls.

## Translation pitfalls

-   The routine has NO `info` INPUT parameter in the Fortran (info is
    intent(inout), read once at the top as `initv = (info == 0)` then always
    overwritten). But the first-call convention needs it, so the JS main API
    takes a trailing `infoIn` parameter and sets `state.initv = (infoIn !== 0)`.
    (Watch out: an earlier draft used `arguments[43]`, which was `undefined`
    because there was no such parameter; add the parameter explicitly.)
-   `h[offsetH]` (the `H(1,1)` slot) is overwritten with `rnorm` at convergence,
    per the Fortran, so dseupd can recover the final residual norm. Do not skip
    this line.
-   The convergence exit does a scale/sort/unscale of the Ritz values (dlascl
    twice around dsortr) to sort in the user's `which` ordering while carrying
    the bounds along; the `BE` case sorts differently (`dsgets` with opposite
    ordering) from `LM/SM/LA/SA`. `opposite(which)` maps LM<->SM, LA<->SA and is
    used when picking shifts vs. reporting.
-   With `ishift=1` (exact shifts) the `ido=3` user-shift path never fires: the
    shifts come from dsgets internally. The `ido=3` branch is translated but
    only reachable with `ishift=0`.

## Fixtures

-   Driven with OP=A (standard problem, B=I), `ishift=1`, `info=1` (user-supplied
    deterministic residual `1 + 0.1*i`). Three cases (LM/SA/LA) match the Fortran
    to ~1e-14 with EXACT nconv/mxiter/info (23/9/14 iterations respectively).
    Matching the iteration COUNT number-for-number proves the entire IRLM
    trajectory (every dsaitr/dseigt/dsgets/dsconv/dsortr/dsapps call) agrees with
    Fortran step for step, and validates dsaitr's restart path indirectly.

## Dependency interface surprises

-   `@stdlib/blas/base/dnrm2` is not installed in this repo; the fixture test
    uses a small inline `nrm2` helper instead of importing it (dsaitr's test made
    the same substitution).
-   Transitive Fortran deps beyond the direct callees: dlamch, dlanst, dlascl,
    dlasr, dlasrt, dlartg, dlaset, dlae2, dlaev2, disnan, dlaisnan, dlassq,
    dlapy2, plus the la_constants/la_xisnan f90 modules (must be listed before
    dlartg/dlascl in deps). Add them iteratively per the linker's undefined
    symbols.
