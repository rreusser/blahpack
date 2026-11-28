# zpttrf: Translation Learnings

## Translation pitfalls

- The Fortran uses DBLE(E(I)) and DIMAG(E(I)) to extract real/imag parts. In JS, after reinterpret, these map to ev[ie] and ev[ie+1] respectively. Straightforward once you have the Float64 view.
- The 4-unrolled loop structure is identical to dpttrf. The only difference is that each E element occupies 2 Float64 slots (real + imag) instead of 1.
- Stride for E must be multiplied by 2 when converting from complex-element strides to Float64 strides (se = strideE * 2).
- The update formula d[i+1] -= f*eir + g*eii computes |e[i]|^2 / d[i] (the squared modulus), which keeps D real throughout the factorization, matching Hermitian LDL^H properties.

## Dependency interface surprises

- N/A: zpttrf is a leaf routine with no BLAS/LAPACK dependencies.

## Automation opportunities

- The zpttrf/dpttrf pair suggests a pattern: real-to-complex variants of tridiagonal routines differ only in E array handling. A transform could auto-generate zpttrf from dpttrf by: (1) adding reinterpret import, (2) doubling E stride/offset, (3) splitting e[ie] into eir/eii pair with the modulus-squared update. Not yet worth automating with only one instance.

## Coverage gaps

- All branches covered (100% line and branch coverage). The 4-unrolled loop required 5 extra targeted tests to hit every early-exit branch (fail at positions 1-4 within the unrolled block, plus the final d[N] check).

## Complex number handling

- E is Complex128Array at the API boundary, but internally accessed via reinterpret() as Float64Array. All complex arithmetic is trivially inlined: real/imag extraction, real-scalar division (f = eir/d[i], g = eii/d[i]), and modulus-squared (f*eir + g*eii). No need for cmplx library functions since there is no complex division, abs, or sqrt.
