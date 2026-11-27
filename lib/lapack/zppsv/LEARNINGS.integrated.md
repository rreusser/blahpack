# zppsv: Translation Learnings

## Translation pitfalls

- None. This is a thin driver that delegates entirely to zpptrf and zpptrs.
  The structure is identical to the real counterpart dppsv with only type
  changes (Float64Array -> Complex128Array, symmetric -> Hermitian).

## Dependency interface surprises

- zpptrf and zpptrs both use complex-element strides/offsets (not
  Float64-element), matching the Complex128Array convention. No conversion
  needed since zppsv passes them through directly.

## Automation opportunities

- Simple driver routines (zppsv, dppsv, etc.) that just validate inputs,
  call factorize, then call solve could potentially be auto-generated from
  their real counterparts by swapping dep names and types.

## Coverage gaps

- None. 100% line, branch, and function coverage on base.js. Both the
  early-return path (N=0 or nrhs=0), the success path, and the info>0 path
  (not positive definite) are all covered.

## Complex number handling

- No direct complex arithmetic in zppsv itself. All complex operations are
  delegated to zpptrf and zpptrs. The AP and B arrays are Complex128Array
  instances with complex-element strides/offsets throughout.
