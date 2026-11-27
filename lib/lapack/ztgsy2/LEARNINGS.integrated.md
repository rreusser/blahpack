# ztgsy2: Translation Learnings

## Translation pitfalls

- Complex Schur form is always truly triangular (1x1 blocks only), unlike
  real Schur form which has quasi-triangular 2x2 blocks. This makes ztgsy2
  much simpler than dtgsy2: no block structure detection (IWORK/PQ), no
  dgemm/dgemv/dger/dcopy calls, and only a 2x2 Z matrix (LDZ=2) instead
  of the 8x8 used by dtgsy2.
- The conjugate-transpose branch uses DCONJG, which maps to manually
  negating the imaginary part when writing Z entries and when doing the
  inline update loops for F and C.

## Dependency interface surprises

- zscal and zaxpy take Complex128 scalars (not raw Float64 pairs). To pass
  a real scalar like scaloc, wrap as `new Complex128(scaloc, 0.0)`.
- zlatdf returns `{ rdsum, rdscal }` as an object, not via output arrays.
  The caller must unpack and write back into the Float64Array outputs.
- zgesc2 writes `scale[0]` into a Float64Array (not Complex128Array).
- Fortran deps file needed manual additions: zladiv, la_xisnan, la_constants,
  zgeru, zswap (transitive deps not captured by deps.py).

## Automation opportunities

- None identified beyond existing tooling.

## Coverage gaps

- The scaloc != ONE branch in the conjugate-transpose path (lines 232-244,
  325-336) is not exercised because well-conditioned test matrices never
  trigger rescaling. This matches the dtgsy2 pattern.
- The ierr > 0 / info path (near-singular Z) would require crafting nearly
  singular diagonal entries in A/D/B/E to trigger.

## Complex number handling

- All six matrices (A, B, C, D, E, F) are Complex128Array. Strides/offsets
  are in complex element units; Float64 views use stride*2 and offset*2.
- Z and RHS are small local Complex128Arrays (LDZ=2), reinterpreted as
  Float64Array (Zv, Rv) for direct element access.
- Conjugate multiply `conj(a)*b` is inlined in the transpose update loops:
  `re = a_re*b_re + a_im*b_im; im = -a_im*b_re + a_re*b_im`. This avoids
  Complex128 allocation in hot inner loops.
- Complex negate for alpha uses `new Complex128(-Rv[0], -Rv[1])` which is
  only called once per (i,j) iteration, so allocation overhead is negligible.
