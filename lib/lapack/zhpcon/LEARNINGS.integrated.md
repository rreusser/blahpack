# zhpcon: Translation Learnings

## Translation pitfalls

- Nearly identical to zspcon. The only code difference is calling zhptrs (Hermitian solve) instead of zsptrs (symmetric solve). The packed storage diagonal indexing, singularity check, and zlacn2 reverse-communication loop are identical.
- Packed storage diagonal indexing differs between upper and lower. Upper traverses backward from N*(N+1)/2 - 1 decrementing by (i+1); lower starts at 0 incrementing by (N-i). Fortran 1-based IP converted to 0-based.

## Dependency interface surprises

- zlacn2 base.js takes V and X as separate array/stride/offset triples (both pointing into the same WORK array at different offsets), plus EST (Float64Array[1]), KASE (Int32Array[1]), and ISAVE (Int32Array[3]) with their own stride/offset.
- zhptrs base.js treats B as a 2D array (strideB1, strideB2, offsetB). For a single RHS, strideB1=sw and strideB2=N*sw.

## Automation opportunities

- The Fortran test helper `packed_herm_1norm` could be added to test_utils.f90 for reuse by other Hermitian packed-storage routines.
- The `convertIPIV` and `buildComplex` helpers in test files are duplicated across multiple packed-storage tests. They could be extracted to a shared test utility.

## Coverage gaps

- Lower-triangle singular early return (lines 113-114 in base.js) is not covered. All singular test cases use upper triangle. Coverage is 98.66% which is sufficient.

## Complex number handling

- No explicit complex arithmetic needed in zhpcon itself. The complex work is delegated to zlacn2 (norm estimation) and zhptrs (solve). The only complex-aware code is the diagonal singularity check, which examines reinterpreted Float64Array pairs for exact zero.
- Complex Hermitian (not symmetric): uses U*D*U^H (conjugate transpose), which is correctly handled by the zhptrf/zhptrs pair.
