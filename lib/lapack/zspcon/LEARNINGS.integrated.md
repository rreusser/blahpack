# zspcon: Translation Learnings

## Translation pitfalls

- Packed storage diagonal indexing differs between upper and lower. Upper traverses backward from N*(N+1)/2 - 1 decrementing by (i+1); lower starts at 0 incrementing by (N-i). The Fortran uses 1-based IP which must be converted to 0-based.
- The Fortran `AP(IP).EQ.ZERO` checks the complex diagonal element for exact zero. In JS this means checking both real and imaginary parts of the reinterpreted Float64Array.

## Dependency interface surprises

- zlacn2 base.js takes V and X as separate array/stride/offset triples (both pointing into the same WORK array at different offsets), plus EST (Float64Array[1]), KASE (Int32Array[1]), and ISAVE (Int32Array[3]) with their own stride/offset.
- zsptrs base.js treats B as a 2D array (strideB1, strideB2, offsetB). For a single RHS, strideB1=sw and strideB2=N*sw.
- ZLANSP (packed symmetric 1-norm) uses ZLASSQ which is a .f90 file with module dependencies, making it impossible to compile with the Fortran test harness. Worked around by implementing the 1-norm computation inline in the Fortran test.

## Automation opportunities

- The Fortran test helper `packed_sym_1norm` could be added to test_utils.f90 for reuse by other packed-storage routines.
- The `convertIPIV` and `buildComplex` helpers in test files are duplicated across zsptrs and zspcon tests. They could be extracted to a shared test utility.

## Coverage gaps

- Lower-triangle singular early return (lines 117-118 in base.js) is not covered. All singular test cases use upper triangle. Adding a lower singular test would be trivial but 98.79% coverage was deemed sufficient.

## Complex number handling

- No explicit complex arithmetic needed in zspcon itself. The complex work is delegated to zlacn2 (norm estimation) and zsptrs (solve). The only complex-aware code is the diagonal singularity check, which examines reinterpreted Float64Array pairs for exact zero.
- Complex symmetric (not Hermitian): uses U*D*U^T (transpose, no conjugation), which is correctly handled by the zsptrf/zsptrs pair.
