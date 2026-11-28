# zhpsv: Translation Learnings

## Translation pitfalls

- zhpsv is a trivial driver routine (call zhptrf, check info, call zhptrs). No index arithmetic or stride issues in the driver itself.
- The Fortran test required `dlamch` in deps_zhpsv.txt as a transitive dependency through dlapy2. This was not auto-detected by `deps.py`.

## Dependency interface surprises

- Pre-existing bug in JS zhptrf/zhptrs: upper 4x4 matrices with 2x2 Bunch-Kaufman pivots produce an incorrect solution (A*x != b, maxErr ~ 2.09). The lower case with 2x2 pivots works correctly. The zhpsv driver is correct; the bug is in the underlying zhptrf or zhptrs.

## Automation opportunities

- N/A. The init_routine.py + gen_test.py pipeline handled scaffolding well.

## Coverage gaps

- 100% line and branch coverage on base.js (simple driver with only one branch).

## Complex number handling

- No complex arithmetic in the driver itself. All complex operations are delegated to zhptrf and zhptrs.
