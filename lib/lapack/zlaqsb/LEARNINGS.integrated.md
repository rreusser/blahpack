# zlaqsb: Translation Learnings

## Translation pitfalls

- The Fortran routine scales complex elements by real scaling factors. The
  scaling `AB(i,j) = S(i) * AB(i,j) * S(j)` applies the same real scalar
  to both real and imaginary parts independently.
- Unlike zlaqhe (dense Hermitian), zlaqsb does NOT force the diagonal real
  or zero the imaginary part. The Fortran reference simply scales all band
  elements uniformly, including the diagonal. This is because the band
  storage does not distinguish diagonal from off-diagonal in the scaling
  loop; both use `CJ * S(I) * AB(...)`.

## Dependency interface surprises

- No JS dependencies beyond `dlamch` (threshold constants) and `reinterpret`
  (Float64 view of Complex128Array). The LSAME call in Fortran maps to a
  simple string comparison `uplo === 'upper'`.

## Automation opportunities

- The pattern of translating a real band routine (dlaqsb) to its complex
  counterpart (zlaqsb) is very mechanical: replace Float64Array with
  Complex128Array, add reinterpret, multiply strides by 2, and apply the
  scalar to both real and imaginary parts separately.

## Coverage gaps

- All code paths covered: upper/lower, KD=0/1/2, N=0/1/4, no-equil,
  small/large amax triggers.

## Complex number handling

- Scaling by a real factor: `z *= s` is done as `re *= s; im *= s` on the
  reinterpreted Float64 view. No complex multiplication needed since
  scaling factors S are real-valued.
