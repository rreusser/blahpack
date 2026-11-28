# zpstf2: Translation Learnings

## Translation pitfalls

- Pivot swap in Hermitian case requires conjugation of the in-between segment,
  not a simple value swap. Forgetting `CONJ` on the swap or on `A(J,PVT)` after
  the loop produces wrong results that are hard to debug since they only manifest
  when the pivot differs from the natural order.
- Diagonal elements must have imaginary part explicitly zeroed after writing
  (`Av[da+1] = 0.0`), because sqrt(ajj) only produces the real part.

## Dependency interface surprises

- All BLAS deps (zswap, zdscal, zgemv) use complex-element strides, matching the
  caller's convention. No stride conversion needed at call sites.
- zlacgv also uses complex-element strides. It conjugates in-place by negating
  the imaginary part of each element.

## Automation opportunities

- Fortran deps file generation misses BLAS-level dependencies (zswap, zdscal, etc.)
  but the build script links all BLAS sources automatically, so this is not an issue
  in practice. The deps file only needs LAPACK-level dependencies.

## Coverage gaps

- Non-positive/NaN early exit (lines 124-127) and positive-tol branch (lines 132-134)
  are not covered. These are edge cases that would require NaN or zero-diagonal input
  matrices. The dpstf2 tests have the same gap.

## Complex number handling

- WORK accumulates `|a_ij|^2 = re^2 + im^2` (modulus squared), not `a*a`. This is
  the key difference from the real version where `WORK[i] += a*a`.
- zlacgv is called before zgemv to conjugate the column/row vector, making the
  `'transpose'` gemv operation behave as conjugate-transpose. The conjugation is
  undone immediately after.
- zdscal (real scalar * complex vector) is used instead of zscal since the scale
  factor 1/ajj is always real.
- No complex division or absolute value needed, so cmplx.js is not required.
