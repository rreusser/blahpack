# zher2k: Translation Learnings

## Translation pitfalls

- The key difference from dsyr2k (real symmetric rank-2k) is that beta is REAL
  (not complex) and alpha is complex. The Fortran signature makes this explicit:
  `COMPLEX*16 ALPHA` vs `DOUBLE PRECISION BETA`. This means beta scaling of C
  uses real multiplication only, not complex multiplication.
- The diagonal of C must remain real after the update. In the TRANS='N' path,
  this means accumulating only the real part of `A[j,l]*temp1 + B[j,l]*temp2`
  onto the diagonal. In the TRANS='C' path, the full `alpha*temp1 + conj(alpha)*temp2`
  is computed and only its real part is stored on the diagonal.
- The temp2 computation differs from dsyr2k: it is `conj(alpha * A[j,l])`, not
  `alpha * A[j,l]`. This is because the operation is `conj(alpha)*B*A^H`, so
  `temp2 = conj(alpha) * conj(A[j,l]) = conj(alpha * A[j,l])`.

## Dependency interface surprises

- N/A (leaf routine, no dependencies)

## Automation opportunities

- The pattern of complex BLAS Level 3 routines (reinterpret, stride*2, Float64
  view indexing) is very similar across zgemm, zherk, zher2k. Could potentially
  have a template that generates the boilerplate.

## Coverage gaps

- 91.18% branch coverage achieved. The uncovered branches are likely the
  `beta !== 1.0` vs `beta === 1.0` edge in the TRANS='C' path, which always
  takes the `beta === 0.0` or `beta !== 0.0` branches in our test cases.
  Not a concern since the logic is straightforward real multiplication.

## Complex number handling

- All complex arithmetic is inlined (addition, subtraction, multiplication,
  conjugation, real-scalar scaling) -- no calls to cmplx.js needed since
  zher2k does not use complex division, absolute value, or square root.
- The `alpha * conj(B[j,l])` pattern expands to:
  `(alphaR + alphaI*i) * (bjR - bjI*i) = (alphaR*bjR + alphaI*bjI) + (alphaI*bjR - alphaR*bjI)*i`
- The `conj(alpha * A[j,l])` pattern: first compute `alpha*A`, then negate
  the imaginary part.
- In the TRANS='C' path, `conj(alpha)*temp2` is computed as:
  `(alphaR - alphaI*i) * (t2R + t2I*i) = (alphaR*t2R + alphaI*t2I) + (alphaR*t2I - alphaI*t2R)*i`
