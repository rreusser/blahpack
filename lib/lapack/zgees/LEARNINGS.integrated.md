# zgees: Translation Learnings

## Translation pitfalls

- Complex Schur form is upper triangular (not quasi-triangular like real case), simplifying both zgees and its dependencies (no 2x2 block handling needed).
- The SELECT callback receives a Complex128 scalar (not two separate floats as in dgees).
- ZCOPY of diagonal elements uses stride = strideA1 + strideA2 (sum of both matrix strides) to walk the diagonal in column-major storage.
- After scaling, eigenvalue extraction from diagonal uses the same diagonal-stride trick.

## Dependency interface surprises

- zgebal returns an object `{ info, ilo, ihi }` with 1-based indices.
- ztrsen takes BWORK as Uint8Array (not boolean array), and M/S/SEP as Float64Array(1) output containers.
- zhseqr W parameter is a Complex128Array (single array, unlike dhseqr which has separate WR/WI arrays).
- ztrexc uses 1-based indices for ifst/ilst (Fortran convention), not 0-based.

## Automation opportunities

- N/A for this driver routine. The pattern closely follows dgees.

## Coverage gaps

- zlaqr0 (aggressive early deflation for complex) is not yet implemented. zhseqr currently uses zlahqr for all matrix sizes, meaning large matrices use slower single-shift QR.
- The zlaqr* chain (zlaqr0-5) needs implementation for production-quality large-matrix eigenvalue computation.
- No test for scaling paths (ANRM near underflow/overflow thresholds).

## Complex number handling

- All complex arrays use Complex128Array at the API boundary.
- Inside routines, reinterpret() provides Float64Array views with 2x strides/offsets.
- Complex multiplication is inlined throughout zlahqr for performance in the QR sweep inner loop.
- Complex sqrt and division use dedicated helper functions (csqrt in zlahqr, zladiv).
