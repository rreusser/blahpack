# dlar1v: Translation Learnings

## Signature design

- `dlar1v` returns **seven scalar outputs** (`negcnt`, `ztz`, `mingma`, `r`,
  `nrminv`, `resid`, `rqcorr`) plus the vector `Z` and the array `ISUPPZ`. The
  scaffold-generated base.js signature passed each scalar as a plain `number`,
  which does not match the Fortran in/out semantics. Convention followed here:
  each scalar output is a length-1 `Float64Array` or `Int32Array`, written
  via `arr[ 0 ] = value` inside `base.js`. `r` is in/out (0 = auto-select).

## Twist selection is FP-fragile

- When `lambda` is exactly an eigenvalue, the backward sweep's final
  `WORK(INDP+R1-1)` can round to exactly `0.0`, and then the twist-search
  loop's `EPS * WORK(INDS+I)` updates are not strictly `<=` the running
  `mingma`. Tiny differences in intermediate arithmetic between GNU Fortran
  and V8 cause the JS build to pick a different twist index `R` than the
  reference. The result is still a valid eigenvector, but it invalidates
  element-by-element fixture comparison of `Z`.

- **Test strategy:** verify the Rayleigh residual
  `||(T - lambda*I)*z|| / ||z|| < 1e-10` and check identities like
  `nrminv = 1/sqrt(ztz)`, `resid = |mingma|*nrminv`, `rqcorr = mingma/ztz`.
  One case (`tridiag3_largest`) has an unambiguous twist and matches the
  Fortran fixture up to a global sign.

## Index arithmetic

- Kept the Fortran 1-based constants (`inds = 2*N+1`, `indp = 3*N+1`,
  `indlpl = 0`, `indumn = N`) literally and mapped every `WORK(INDS+I-1)`
  access to `WORK[offsetWORK + ((inds + i - 2) * strideWORK)]` (0-based).
  Using 1-based internals made the translation mechanical and easier to
  audit against the Fortran source.

## Coverage gaps

- Lines 195-210 (`sawnan2` rerun with pivot protection) are unreachable in
  IEEE 754 double precision with realistic inputs: triggering them requires
  a progressive-sweep NaN which only appears with artificial `LLD`/`D`
  cancellations. Marked with an inline TODO. Line/branch coverage still
  clears the 90%/85% gate (93.2% / 94.6%).

## Automation opportunities

- The scaffold should recognize multi-output LAPACK signatures and emit
  length-1 typed arrays for in/out scalars rather than plain `number`
  parameters. Several RRR routines (`dlar1v`, `dlarrv`, etc.) share this
  pattern.
