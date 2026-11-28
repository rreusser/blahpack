# zpbequ: Translation Learnings

## Translation pitfalls

- The scaffold generator produced `scond` and `amax` as input parameters, but they are output-only scalars. Following dpbequ, they must be returned as part of the `{ info, scond, amax }` result object. The ndarray.js and zpbequ.js wrappers needed manual correction to drop these params.
- Complex band storage uses the same row/column structure as real band storage, but each element occupies 2 floats. After `reinterpret()`, multiplying strides and offset by 2 gives correct Float64 indexing. Reading only the real part (even index) of each diagonal element is all that zpbequ needs.

## Dependency interface surprises

- N/A: zpbequ has zero dependencies (leaf routine).

## Automation opportunities

- The `init_routine.py` scaffold should detect output-only scalar parameters (SCOND, AMAX for *pbequ routines) and exclude them from the base.js signature, returning them in an object instead. Currently this requires manual fixup every time.

## Coverage gaps

- N/A: 100% line, branch, and function coverage achieved. All code paths (upper/lower, N=0, N=1, non-positive diagonal at various positions) are covered.

## Complex number handling

- Only the real part of each diagonal element is accessed (via Float64Array view at even indices). No complex arithmetic is performed; the routine is mathematically identical to dpbequ except for the Complex128Array input type and the `reinterpret()` step.
