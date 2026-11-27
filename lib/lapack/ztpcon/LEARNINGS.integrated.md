# ztpcon: Translation Learnings

## Translation pitfalls

- The packed storage version closely parallels ztrcon (full storage), with the key difference being the use of zlantp/zlatps instead of zlantr/zlatrs. No strideA1/strideA2 parameters; only strideAP/offsetAP since packed storage is 1D.
- RCOND is an output Float64Array of length 1 (not a scalar), matching the Fortran convention of returning a scalar through an array parameter.

## Dependency interface surprises

- zlatps uses the same `normin` flag as zlatrs ('no'/'yes') to control whether CNORM (passed as RWORK) has been precomputed. The first call uses 'no', subsequent calls use 'yes'.
- zlacn2 reverse communication loop: V occupies WORK[N..2N-1] and X occupies WORK[0..N-1], requiring offset arithmetic with `ow + (N * sw)`.

## Automation opportunities

- The ztpcon/ztrcon/ztbcon family all share the same reverse-communication pattern with zlacn2. A template or shared helper could eliminate repetition.
- The lint-fix.sh codemod incorrectly replaced test file content with ztbcon code; codemod matching logic may need guarding against cross-module contamination.

## Coverage gaps

- The early-return path when `scale[0] < xnorm * smlnum` is difficult to trigger with moderate-sized test matrices. It requires a nearly singular matrix where the triangular solve produces very large intermediate results.

## Complex number handling

- Uses `reinterpret()` to get Float64Array views for CABS1 computation (|re| + |im|) on complex WORK array entries.
- izamax returns a 0-based index into the complex array; the CABS1 lookup converts to Float64 index via `(ow + (ix * sw)) * 2`.
