# drscl: Translation Learnings

## Translation pitfalls

- The routine uses a `do-while` pattern via `GO TO 10` with a trailing `IF(.NOT.DONE) GO TO 10`. Translated to `while(true) { ... if (done) break; }`.
- The signature from `signature.py` included an `incx` parameter separate from `stride`. In the JS implementation, `strideX` replaces both `INCX` and the stride concept, so `incx` is redundant. The Fortran `INCX` is passed directly to `DSCAL`, which maps to `strideX` in our convention.
- SMLNUM and BIGNUM constants are computed from DLAMCH('S'). Since these are fixed IEEE 754 values, they are hardcoded as module-level constants rather than calling dlamch at runtime.

## Dependency interface surprises

- dscal takes `(N, da, x, strideX, offsetX)` — no separate incx parameter. The stride IS the incx.

## Automation opportunities

- N/A — this routine is simple enough that no mechanical steps were repeated.

## Coverage gaps

- 100% line and branch coverage achieved. The iterative scaling branches require extreme values (sa > ~4.5e307 for SMLNUM branch, sa < ~2.225e-308 for BIGNUM branch).

## Complex number handling

- N/A — this is a real-valued routine.
