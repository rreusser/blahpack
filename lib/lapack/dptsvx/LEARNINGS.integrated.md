# dptsvx: Translation Learnings

## Translation pitfalls

- The Fortran DPTSVX uses RCOND as a scalar, but the JS convention passes it as a Float64Array(1) output parameter.
- The Fortran routine calls DLACPY with 'Full' to copy B to X; in JS this maps to dlacpy('all', ...).
- DLANST norm parameter: Fortran uses '1' for one-norm; JS uses 'one-norm'.
- FACT parameter maps from 'N'/'F' to 'not-factored'/'factored'.

## Dependency interface surprises

- dptrfs WORK array needs length 2*N (not 3*N like symmetric packed drivers).
- dptcon takes `anorm` as a scalar number, but `rcond` as a Float64Array(1) for output.
- dlanst does not take a WORK parameter (unlike dlansp which does).
- dpttrs returns an integer info but always returns 0 (no error path).

## Automation opportunities

- The lint-fix codemod script (bin/lint-fix.sh) can overwrite test files if the codemod transforms them incorrectly. Need to be cautious with test file content.

## Coverage gaps

- The Fortran deps file needed `la_constants` and `la_xisnan` added manually for compilation (dlassq's module dependencies). These are not JS deps but are needed for Fortran linking.
- The signature conformance lint rule warns about WORK having stride/offset (3 extra params vs expected 30), but this matches the established convention in other expert drivers.

## Complex number handling

- N/A: dptsvx is a real-valued routine.
