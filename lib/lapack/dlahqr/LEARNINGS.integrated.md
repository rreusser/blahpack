# dlahqr: Translation Learnings

## Translation pitfalls

- GOTO restructuring was the main challenge. The Fortran has a complex
  outer while loop (label 20, deflation pointer I going downward), an
  inner for loop (ITS iterations), and a convergence break (label 150)
  that exits the ITS loop and does deflation handling. Restructured using
  a `converged` boolean flag and a `while (i >= ilo)` outer loop.
- The `dcopy` call in the bulge chase copies from H column (k-1) into
  the local `v` array. The stride for source is `strideH1` (row stride),
  and the offset must point to H(k, k-1) in 0-based indexing.
- dlarfg interface: alpha is `(array, offset)`, not scalar. Had to pass
  `(v, 0, v, 1, 1, tau, 0)` where v[0] is alpha and v[1..] is the vector.
- All indices (ilo, ihi, iloz, ihiz, i1, i2) remain 1-based throughout
  the algorithm, matching Fortran. Only convert at array access time with
  `(idx - 1) * stride` pattern.
- The Fortran fixture uses `print_matrix(name, H, LDH, N, N)` which
  outputs N rows (not LDH rows) per column, so fixture data is packed
  N*N, not LDH*N. Initial test code incorrectly assumed LDH=6 stride.

## Dependency interface surprises

- dlanv2 returns an object `{a, b, c, d, rt1r, rt1i, rt2r, rt2i, cs, sn}`
  rather than modifying arrays in place. Must write all 4 matrix elements
  and 4 eigenvalue components back from the return object.
- drot takes `(N, x, strideX, offsetX, y, strideY, offsetY, c, s)` with
  separate arrays for x and y. When applying to rows of H (column stride),
  the stride is strideH2; when applying to columns, the stride is strideH1.
- dlarfg writes tau to `tau[offsetTau]`, not as a return value. Must
  allocate a 1-element Float64Array for it.

## Automation opportunities

- N/A - this is a one-off complex routine with heavy GOTO restructuring.
  Not amenable to further automation beyond what exists.

## Coverage gaps

- Exceptional shift paths (lines 243-255): require 10+ or 20+ consecutive
  iterations without convergence. Would need a pathologically difficult
  matrix to trigger. These are defensive fallbacks in the algorithm.
- Zero-shift case (s === 0, lines 266-269): requires all four elements of
  the 2x2 shift block to be exactly zero. Extremely rare in practice.
- Non-convergence return (info = i): would require a matrix that doesn't
  converge in 30*max(10,NH) iterations. Not tested.

## Complex number handling

- N/A - dlahqr is a real (double precision) routine. No complex arithmetic.
