# dhgeqz: Translation Learnings

## Translation pitfalls

- **GOTO control flow complexity**: This routine has 10+ GOTO targets with
  complex interactions (labels 40, 50, 60, 70, 80, 110, 120, 130, 200, 250,
  290, 350, 380, 420). Restructured using nested closures (checkDeflation,
  doLabel70, doLabel80, doLabel110, doRealShiftQZStep, doComplexShift,
  do2x2Block, doDoubleShiftQZStep) sharing state via closure variables.

- **Done flag needed**: After `doLabel80` deflates the last eigenvalue and
  calls `handleLowEigenvalues`, control returns through nested closures back
  to the outer loop. A `done` flag is required to break out of the main
  `for(jiter...)` loop, since the closures can't directly `return` from the
  enclosing function.

- **dlarfg x-vector initialization**: When calling `dlarfg(3, alpha, 0, x,
  stride, offset, tau, 0)`, the x-vector (v2, v3 values) must be written
  into the WORK array _before_ the call. Missing this caused the double-shift
  QZ step to silently produce garbage, leading to non-convergence.

## Dependency interface surprises

- **dlag2 returns an object**: `{scale1, scale2, wr1, wr2, wi}` rather than
  writing to output arrays. Each field must be destructured.

- **dlasv2 returns an object**: `{ssmin, ssmax, snr, csr, snl, csl}`.

- **dlartg writes to an output array**: `dlartg(f, g, out)` writes
  `[c, s, r]` to `out[0..2]`. Reuse a module-scope scratch array.

- **dlarfg alpha is array-based**: `dlarfg(N, alpha, offsetAlpha, x,
  strideX, offsetX, tau, offsetTau)` — alpha and tau are arrays with
  offsets, not plain scalars.
