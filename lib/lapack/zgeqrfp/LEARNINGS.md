# zgeqrfp: Translation Learnings

## Translation pitfalls

- Near-mechanical port of zgeqrf, substituting the unblocked panel routine
  zgeqr2 -> zgeqr2p. The P ("positive") variant differs from the plain QR
  only inside zlarfgp, which chooses a Householder reflector whose
  corresponding R diagonal element is non-negative. zgeqrf itself is
  structurally identical.
- Signature generator emits an `lwork` parameter; per the dgeqrfp
  convention, it is dropped and WORK is auto-reallocated internally when
  the caller passes `null` or a too-small array.
- Hardcoded NB = 32 at module scope (no ILAENV lookup) — same as zgeqrf and
  dgeqrfp. NBMIN = 2, NX = 0: the routine always takes the blocked path
  when 2 <= NB < K = min(M,N) and otherwise falls through to a single
  unblocked call on the remainder.
- WORK layout: panel workspace of size `iws = ldwork * nb` (ldwork = N),
  followed by the nb-by-nb T block at `offsetT = offsetWORK + iws`. When
  reallocating internally, size = `iws + nb*nb`.

## Dependency interface surprises

- zgeqr2p, zlarft, zlarfb all use **complex-element strides**
  (`strideA1 * 2` internally). Pass strides/offsets in complex elements
  throughout; do not pre-double them.
- zlarfb: calling convention for the T matrix uses `(1, nb, offsetT)` and
  the sub-panel offset `offsetA + i*strideA1 + (i+ib)*strideA2` — matches
  zgeqrf exactly.

## Complex number handling

- R diagonal elements are guaranteed real and non-negative; tests verify
  both the non-negativity and that the imaginary part is exactly zero for
  every diagonal entry after factorization.
- Fortran test uses EQUIVALENCE (`zx` / `zx_r`) to dump interleaved
  real/imag pairs into the JSONL fixture; the JS test reads the same
  layout via `reinterpret( a, 0 )`.

## Test coverage

- Covered the unblocked path (3x3, 4x3, 3x4), the blocked path with
  cleanup step (40x35 and 65x65), quick-return edge cases (M=0, N=0),
  WORK=null internal allocation, and M/N range validation in ndarray.js.
- 65x65 specifically exercises NB=32 blocked iterations plus the final
  unblocked cleanup call on the last (65 - 64 = 1)-column block.
