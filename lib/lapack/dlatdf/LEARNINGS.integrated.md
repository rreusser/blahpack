# dlatdf: Translation Learnings

## Translation pitfalls

- rdsum and rdscal are in/out scalars. Cannot pass by reference in JS. Solution: return an object `{rdsum, rdscal}`.
- IPIV/JPIV are 0-based from JS dgetc2. The Fortran reference uses 1-based. Test must call JS dgetc2 (not use fixture IPIV/JPIV directly).
- Fortran calls DLASWP on RHS treated as a 1-column matrix. In JS, replaced with manual swap loops to avoid awkward 2D interpretation of a 1D vector.
- dlassq returns an object `{scl, sumsq}`, not in-place. Must destructure: `res = dlassq(...); rdscal = res.scl; rdsum = res.sumsq`.
- dgecon in JS uses `rcond` as output Float64Array and `IWORK` as Int32Array. The internal WORK from dgecon contains the approximate nullvector at positions N..2N-1.

## Dependency interface surprises

- dlassq uses Blue's scaling algorithm and returns `{scl, sumsq}` rather than modifying in-place.
- dgecon stores the approximate nullvector in WORK[N:2N] (0-based), used by IJOB=2 path.

## Missing automation

- N/A

## Coverage gaps

- Tolerance needed to be relaxed from 1e-14 to 1e-12 for 3x3 and 4x4 systems due to accumulated floating-point differences between Fortran and JS.
- All IJOB=1 and IJOB=2 paths are covered. All sizes (2x2, 3x3, 4x4) are tested.

## Complex number handling

- N/A -- real-only routine.
