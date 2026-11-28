# dlaln2: Translation Learnings

## Translation pitfalls

- The Fortran EQUIVALENCE trick (CR(2,2) aliased to CRV(4)) for column-major iteration over CR is replaced by a flat Float64Array with explicit column-major indexing: cr[0]=CR(1,1), cr[1]=CR(2,1), cr[2]=CR(1,2), cr[3]=CR(2,2).
- IPIVOT is a 4x4 lookup table stored column-major in Fortran DATA. Converted to 0-based indexing: IPIVOT[row + col*4].
- The ZSWAP and RSWAP boolean arrays from Fortran DATA are stored as JS arrays (0-based indexing matching the 0-based ICMAX).
- SCALE and XNORM are output parameters in Fortran (passed by reference). In JS, they are returned as properties of an object: `{ info, scale, xnorm }`.
- The Fortran uses local X(2,2) array; JS uses module-level scratch via dlaln2's callers who reference X directly.

## Dependency interface surprises

- dladiv takes (a, b, c, d, out) where out is a Float64Array[2] for the result. This is different from the Fortran which returns via two output arguments.

## Automation opportunities

- N/A. The routine has unique structure (lookup tables, EQUIVALENCE trick) that doesn't generalize.

## Coverage gaps

- dlaln2 is exercised indirectly through dtrevc3 which is called by dgeev. No standalone test file was created (it could be added for completeness).
- The complex 2x2 case (na=2, nw=2) with ICMAX in {0,3} vs {1,2} branches depends on which pivot element is largest, which depends on the specific Schur form produced by dhseqr.

## Complex number handling

- Uses dladiv for complex division in the complex 2x2 case — never inlined.
- All complex arithmetic in the 2x2 case is done in real arithmetic with explicit real/imaginary separation.
