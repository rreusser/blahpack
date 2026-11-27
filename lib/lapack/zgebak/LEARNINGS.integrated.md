# zgebak: Translation Learnings

## Translation pitfalls

- Straightforward port from dgebak. The only difference is V is Complex128Array
  and uses zdscal/zswap instead of dscal/dswap.
- SCALE remains a Float64Array (real values), same as dgebak. ILO/IHI remain 1-based.
- SCALE stores 1-based Fortran row indices for permutations; must subtract 1 for 0-based JS.

## Dependency interface surprises

- zdscal and zswap take strides and offsets in complex elements (not doubles).
  This matches the convention that strideV1/strideV2/offsetV are in complex elements.
  No stride multiplication by 2 needed at the zgebak level -- zdscal/zswap handle
  the Float64 conversion internally via reinterpret().

## Automation opportunities

- zgebak is structurally identical to dgebak except for the complex array type
  and BLAS calls. A template-based generator could produce z-prefix versions
  from d-prefix versions by substituting dscal->zdscal, dswap->zswap,
  Float64Array->Complex128Array.

## Coverage gaps

- Left-side permutation with i < ilo0 (lines 114-123) not covered because the
  test matrix yields ILO=1 from zgebal, so ilo0=0 and no row index can be < 0.
  Would need a matrix where zgebal returns ILO > 1 to cover this path for SIDE='L'.
- Line coverage 90.98%, branch coverage 93.10% -- meets targets.

## Complex number handling

- No complex arithmetic needed in zgebak itself. The routine only scales rows
  by real factors (via zdscal) and swaps rows (via zswap). All complex math
  is delegated to the BLAS routines.
- V uses Complex128Array at the API boundary; strides/offsets are in complex elements.
