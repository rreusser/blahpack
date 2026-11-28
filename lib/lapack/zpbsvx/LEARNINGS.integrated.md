# zpbsvx: Translation Learnings

## Translation pitfalls

- The routine is a direct complex analogue of dpbsvx. The main differences are
  Complex128Array for AB, AFB, B, X, WORK (with strides/offsets in complex
  elements) and Float64Array for S, FERR, BERR, RWORK, rcond.
- Scaling B and X by real scaling factors S requires accessing the Float64 view
  via `reinterpret()` and multiplying both real and imaginary parts.
- No IWORK parameter (unlike dpbsvx). zpbcon uses RWORK instead of IWORK.

## Dependency interface surprises

- zpbequ returns an object `{ info, scond, amax }`, matching dpbequ convention.
- zlaqhb returns a string ('none' or 'yes'), matching dlaqsb convention.
- zlanhb takes norm string, not 'one-norm' mapped from Fortran '1'. Uses
  'one-norm' as the JS convention.
- zpbcon takes WORK (Complex128Array) and RWORK (Float64Array) separately,
  whereas dpbcon takes WORK (Float64Array) and IWORK (Int32Array).
- zcopy uses complex element strides (not Float64 strides).

## Automation opportunities

- The BLAS-style API (zpbsvx.js) could be auto-generated since it follows
  the same pattern as dpbsvx.js with stride2offset.
- lint-fix.sh `--fix` can clobber test files if validation fails after fix;
  need to verify test.js is not silently replaced.

## Coverage gaps

- FACT='F' with EQUED='Y' (pre-equilibrated input) path is not tested because
  zpbequ/zlaqhb with these small uniform-diagonal matrices don't trigger
  equilibration. The equed='none' path is verified across all tests.
- The `scond` variable is only used when `rcequ=true`, which requires
  equilibration to actually be applied. The Fortran test matrices have
  uniform diagonals (4,4,4) so zpbequ always returns `scond=1` and
  zlaqhb returns 'none'.

## Complex number handling

- All complex scaling (S[i]*B[i,j] and S[i]*X[i,j]) is done via
  reinterpret + direct Float64 multiply on both re and im parts.
- No complex arithmetic is needed in zpbsvx itself; all complex operations
  are delegated to the dependency routines (zcopy, zlacpy, zpbtrf, etc.).
