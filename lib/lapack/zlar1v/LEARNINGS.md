# zlar1v: Translation Learnings

## Relationship to dlar1v

- Structurally identical to `dlar1v`. The only difference is the output
  vector `Z`: real `Float64Array` in `dlar1v`, `Complex128Array` in
  `zlar1v`. All tridiagonal factors (`D`, `L`, `LD`, `LLD`) and the
  scalar shift `lambda` are real, so every arithmetic expression in
  the sweeps stays real. The imaginary parts of `Z` are explicitly
  written as `0.0` at each update.

- The Fortran source stores `DBLE(Z(I)*Z(I))` for the `ZTZ` accumulator
  because the product of two complex values is a complex, but since the
  imaginary parts are zero, `real(z*z) = zr*zr`. In JS we simply use
  `Zv[2*i] * Zv[2*i]`.

- The `ABS(Z(I))` in the gaptol check is `|zr + i*zi|`, which for
  `zi = 0` reduces to `|zr|`. Again we simply take `Math.abs(Zv[2*i])`.

## Complex128Array pattern

- Reinterpret once at function entry: `Zv = reinterpret( Z, 0 )`.
- Every `Z(i)` (Fortran 1-based) maps to the pair
  `Zv[2*(offsetZ + (i-1)*strideZ)]` / `Zv[2*(offsetZ + (i-1)*strideZ) + 1]`.
- The extra complex stride multiplier of 2 is outside of `strideZ`, so
  test cases with `strideZ = 2` on a complex array actually skip over
  four real slots between consecutive elements.

## Twist selection FP fragility

- Same as `dlar1v`: when `lambda` is at an eigenvalue and the initial
  `mgmval` rounds to `0.0`, the twist search loop's tie-breaking depends
  on bit-for-bit floating point agreement with Fortran. Tests verify
  the Rayleigh residual `||(T - lambda*I)*z|| / ||z||` instead of
  element-by-element equality. One test (`tridiag3_largest`) has an
  unambiguous twist and matches the fixture up to a global sign.

## Fortran test EQUIVALENCE

- Used `complex*16 :: Z(NMAX)` paired with a `double precision :: Z_r(2*NMAX)`
  via `equivalence (Z, Z_r)` to print the interleaved re/im pairs as a
  flat `2*N` array. No leading-dimension surprises because `Z` is a 1D
  array.

## Coverage

- `sawnan2` rerun (pivot-protected backward sweep) is unreachable in
  IEEE 754 double precision without handcrafted `LLD` values that
  exactly cancel. Marked with an inline note. Line/branch coverage
  still clears the 90%/85% thresholds on `base.js`.

## Automation opportunities

- Same as `dlar1v`: the scaffold should emit length-1 typed arrays for
  Fortran in/out scalar outputs rather than plain `number` parameters.
  `zlar1v` and `dlar1v` translated essentially byte-for-byte apart
  from the `Complex128Array` wiring, which argues for a templated
  transform in `bin/transform.py` for d-prefix → z-prefix routines
  where only the eigenvector container changes type.
