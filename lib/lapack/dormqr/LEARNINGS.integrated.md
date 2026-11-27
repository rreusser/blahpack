# dormqr: Translation Learnings

## Translation pitfalls

- Direct port from zunmqr (complex analog) was straightforward: remove
  Complex128Array/reinterpret, use Float64Array directly, change 'C' (conjugate
  transpose) to 'T' (transpose) in parameter checks.
- Fortran's NBMAX=64, but we hardcode NB=32 like zunmqr. The blocked path
  triggers when K > NB (i.e., K >= 33).
- The LDT parameter in Fortran is NBMAX+1=65, but in JS we compute ldt = nb+1 = 33.
  This is correct because we use our own NB, not Fortran's NBMAX.

## Dependency interface surprises

- dlarfb takes 2D WORK strides (strideWORK1, strideWORK2), not 1D. Same as zlarfb.
  This was already documented in dependency-conventions.md.
- dlarft signature: `(direct, storev, N, K, V, strideV1, strideV2, offsetV,
  TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT)` -- uses 2D T strides.

## Automation opportunities

- The real-valued dormqr is nearly a line-by-line copy of zunmqr with
  Float64Array instead of Complex128Array, no reinterpret, and 'T' instead of 'C'.
  If more real/complex pairs arise, a mechanical transform could handle this.

## Coverage gaps

- Lines 117-120 (internal WORK allocation when WORK is null/too small) are uncovered.
  All tests pass adequate WORK buffers. This is a defensive fallback path.
- Coverage is 97.79% line, 96.77% branch -- well above targets.

## Complex number handling

- N/A: dormqr is a real-valued routine. No complex arithmetic needed.
