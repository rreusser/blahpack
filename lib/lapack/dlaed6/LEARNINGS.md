# dlaed6: Translation Learnings

## Translation pitfalls

- The Fortran uses `GO TO 60` to break out of the inner loop (label 40) and the outer DO 50 loop simultaneously. In JS, this was restructured by checking for exact pole hits (`dscale[i] - tau[0] === 0.0`) and returning immediately with the undo-scaling logic.
- The `tau` output parameter is a Float64Array(1), consistent with other scalar output conventions (like dlaed5's dlam).
- The DLAMCH scaling constants (SMALL1, SMALL2, SMINV1, SMINV2) must be hoisted to module scope. Computing `BASE^(INT(LOG(SAFMIN)/LOG(BASE)/3))` at module load is correct since these are machine-dependent constants.
- The routine reuses `niter` both as a counter and as the loop variable in the DO 50 loop. In JS, `iter` stores the starting value and the for-loop uses `niter` directly.

## Dependency interface surprises

- N/A: dlaed6 has no JS dependencies (dlamch is replaced with constants).

## Automation opportunities

- The `init_routine.py` scaffold generates `main.js` using `Object.defineProperty` which the linter rejects. It should use `@stdlib/utils/define-read-only-property` instead. This required manual fix.
- The scaffold's `dlaed6.js` is a stub with `throw new Error('not yet implemented')`. For simple routines where the BLAS-style API just forwards with stride=1, offset=0, auto-generating the wrapper from the signature would save time.

## Coverage gaps

- `c === 0.0` branch in the quadratic formula (both in kniter=2 initialization and iteration loop): requires the cubic coefficient to be exactly zero, which is extremely unlikely with floating-point arithmetic.
- `abs(f) <= 0.0` early convergence: requires the secular equation to evaluate to exact zero before the iteration loop begins.
- `info = 1` convergence failure: requires 40 iterations without meeting the convergence criteria, needing pathological inputs.
- These are documented with inline TODO comments in base.js.

## Complex number handling

- N/A: dlaed6 is a real-valued routine.
