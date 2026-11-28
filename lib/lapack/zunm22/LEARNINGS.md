# zunm22: Translation Learnings

## Translation pitfalls

- zunm22 is a near-mechanical port of dorm22. Structure is identical;
  only the trans enum values and dependency names change.
- TRANS mapping for z-prefix: `'C'` (conjugate) maps to
  `'conjugate-transpose'`, not `'transpose'`. The Fortran source writes
  `'Conjugate'` as the TRANS argument passed to ZTRMM/ZGEMM.
- WORK(1) = DCMPLX(LWKOPT): the Fortran writes a complex value. In JS,
  we reinterpret WORK as a Float64 view once at entry and write
  `WORKv[offsetWORK*2] = lwkopt; WORKv[offsetWORK*2+1] = 0.0` for all
  three exit paths (quick return, n1=0, n2=0, and normal).

## Dependency interface surprises

- zlacpy, ztrmm, zgemm all use complex-element strides (they internally
  do `sa1 = strideA1 * 2`). Pass sub-panel offsets in complex elements
  (not doubled), e.g., `offsetC + (n2 * strideC1) + (i * strideC2)`.
- ztrmm and zgemm take `alpha` (and `beta` for zgemm) as `Complex128`
  scalars, not separate real/imag. Hoisted `CONE = new Complex128(1,0)`
  at module scope to avoid allocations in the blocking loop.

## Complex number handling

- WORK is a Complex128Array; accessed via reinterpret just to write the
  lwkopt sentinel on exit. The loop body never touches WORK directly —
  it's passed through to zlacpy/ztrmm/zgemm which handle it.
- Fortran test uses EQUIVALENCE `(C, C_r)` to print complex matrix C as
  interleaved doubles; `arr(2*lda_val, *)` leading dimension accounts
  for 2 doubles per complex element.

## Missing automation

- The scaffolded benchmark.js/benchmark.ndarray.js default to
  Float64Array and use wrong dimensions (len=10^6) — always fix for
  z-prefix routines: use Complex128Array and size-based powers of 2.
  (Known: benchmark OOM trap.)
- `signature-conformance` ESLint rule does not understand routines
  with WORK + LWORK (emits warning "expected 13 params, got 18"). Safe
  to ignore for this routine family (dorm22, zunm22, etc.).
