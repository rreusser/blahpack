# dpotri: Translation Learnings

## Translation pitfalls

- This is a very simple driver routine (call dtrtri then dlauum), so no index
  or stride pitfalls arose. The only subtlety is passing `'N'` (non-unit) as
  the `diag` parameter to dtrtri, matching the Fortran `'Non-unit'` string.

## Dependency interface surprises

- dtrtri takes `(uplo, diag, N, A, strideA1, strideA2, offsetA)` -- the `diag`
  parameter is the second argument, before N. This matches the Fortran calling
  convention but is easy to overlook since dpotri's own signature has no `diag`.
- dlauum takes `(uplo, N, A, strideA1, strideA2, offsetA)` -- no `diag` parameter,
  straightforward.
- Both return integer info (0 = success).

## Automation opportunities

- The Fortran test deps file needed manual additions for dpotrf and its transitive
  dependencies (dpotrf2, ilaenv, ieeeck, iparmq, iparam2stage) since the test
  program calls dpotrf to set up inputs. The `init_routine.py` deps generator
  only includes deps of the routine itself, not deps of routines called only
  by the test harness. Could add a `--test-deps` flag.

## Coverage gaps

- 100% line, 100% branch, 100% function coverage on base.js. No gaps.

## Complex number handling

- N/A -- dpotri is a real-valued routine with no complex arithmetic.
