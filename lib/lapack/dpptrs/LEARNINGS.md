# dpptrs: Translation Learnings

## Translation pitfalls

- Very straightforward routine: loops over RHS columns and calls dtpsv twice per column. No index arithmetic beyond computing the column offset in B.
- The B column offset is `offsetB + i * strideB2` (0-based loop variable), which maps cleanly from Fortran's `B(1, I)`.
- Packed storage AP is passed directly to dtpsv with stride/offset -- no special handling needed since dtpsv already supports packed format.

## Dependency interface surprises

- dtpsv takes `(uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX)` -- the x vector parameter maps to the column of B. The stride for x is strideB1 (row stride of B), not strideB2.
- No surprises with dtpsv string convention -- uses long-form strings as expected.

## Automation opportunities

- The Fortran test requires pre-factoring with dpptrf. A helper that dumps factored AP values for packed routines would save time. Used a separate Fortran program (test_dpptrs_factored.f90) to extract factored AP for hard-coding in JS tests.

## Coverage gaps

- 100% line, branch, and function coverage achieved. No gaps.
- The routine is simple enough that all paths (upper/lower, N=0, NRHS=0) are trivially exercisable.

## Complex number handling

- N/A: dpptrs is a real-valued routine.
