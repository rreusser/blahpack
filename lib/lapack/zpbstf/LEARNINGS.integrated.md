# zpbstf: Translation Learnings

## Translation pitfalls

- The Fortran uses `DBLE(AB(...))` to read the real part of diagonal elements.
  In JS, this means reading `Av[da]` where `da` is the Float64 index (offsetAB*2
  + stride offsets), skipping the imaginary part at `da+1`.
- Diagonal writes must force the imaginary part to zero (`Av[da+1] = 0.0`) since
  the matrix is Hermitian.

## Dependency interface surprises

- `zdscal`, `zher`, and `zlacgv` all take strides and offsets in complex-element
  units, but internally reinterpret to Float64 and multiply by 2. This means
  the caller passes complex-element strides (e.g. `strideAB1`, `kld`), not
  Float64 strides.
- `kld` is computed as `max(1, strideAB2 - strideAB1)` in complex-element space,
  matching the Fortran `MAX(1, LDAB-1)`.

## Automation opportunities

- The split Cholesky pattern (upper backward loop + upper forward loop, lower
  backward + lower forward) is structurally identical to `dpbstf` plus zlacgv
  calls. Could consider a transform that mechanically adds zlacgv wrapping to
  the real version.

## Coverage gaps

- All four branches covered: upper backward (L^H*L), upper forward (U^H*U),
  lower backward, lower forward.
- Non-positive-definite early returns tested for both upper and lower.

## Complex number handling

- Diagonal elements are always real for Hermitian matrices. The code reads only
  the real part and forces imaginary to zero on write.
- The upper forward loop and lower backward loop require zlacgv (conjugation)
  before and after zher, matching exactly the Fortran pattern.
- The upper backward loop and lower forward loop do NOT use zlacgv, matching
  the Fortran where these loops call zdscal+zher without conjugation.
