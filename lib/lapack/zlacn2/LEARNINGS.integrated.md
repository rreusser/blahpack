# zlacn2: Translation Learnings

## Translation pitfalls
- Straightforward translation from Fortran reference.

## Dependency interface surprises
- N/A

## Automation opportunities
- N/A

## Coverage gaps
- N/A (all paths exercised after fixing test string convention bug).

## Process lesson: string convention bugs in tests
- Initial tests passed short-form strings (`'N'`, `'C'`) to zgemv, which expects long-form (`'no-transpose'`, `'conjugate-transpose'`). This caused zgemv to silently return zeros, making zlacn2 appear to diverge from Fortran. Always use long-form strings when calling BLAS/LAPACK deps from tests.

## Complex number handling
- Uses reinterpret() for Float64Array views of Complex128Array data.
- Strides/offsets in complex elements at API boundary, multiplied by 2 internally for Float64 indexing.
