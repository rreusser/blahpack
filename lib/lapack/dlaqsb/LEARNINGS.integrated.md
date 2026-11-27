# dlaqsb: Translation Learnings

## Translation pitfalls

- Band storage indexing requires careful attention: for upper, the Fortran formula `AB(KD+1+i-j, j)` maps to 0-based `AB[offsetAB + (kd+i-j)*strideAB1 + j*strideAB2]`. The key insight is that `kd+i-j` is always non-negative for the upper case since `i >= j-kd`.
- The EQUED output is a Fortran CHARACTER output parameter, but in JS it maps to a return value (string `'none'` or `'yes'`), not an input parameter. The scaffold generator initially included `equed` as a parameter -- had to remove it.
- The `min`/`max` helper functions triggered a false positive from the `stdlib/signature-conformance` lint rule, which counted helper function params against the expected Fortran signature param count.

## Dependency interface surprises

- No dependencies other than dlamch constants (hoisted to module scope as SMALL/LARGE). Straightforward translation.

## Automation opportunities

- The scaffold generator includes `equed` as an input parameter for routines that return EQUED as a string. A heuristic to detect CHARACTER output-only params and convert them to return values would save manual cleanup.

## Coverage gaps

- 100% line and branch coverage achieved. All code paths (upper, lower, equilibrate, no-equilibrate, quick return) are exercised by the fixture tests.

## Complex number handling

- N/A: dlaqsb is a real-valued routine.
