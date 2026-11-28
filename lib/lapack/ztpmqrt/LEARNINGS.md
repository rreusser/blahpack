# ztpmqrt: Translation Learnings

## Translation pitfalls

- The translation is a near-mechanical mirror of `dtpmqrt`: same block
  iteration, same forward/backward direction by SIDE×TRANS, same WORK
  2-D layout. The only structural change is `'transpose'` →
  `'conjugate-transpose'` for `trans` (because Q is unitary, not
  orthogonal). Reused the dtpmqrt index arithmetic verbatim — no
  off-by-ones surfaced.
- Wrappers must explicitly REJECT plain `'transpose'`. `is-operation-side`
  / `is-transpose-operation` accept the full set including
  `'transpose'`, so the validator must add a second `!== 'transpose'`
  guard or callers will silently get garbage (the base would not
  recognize the value and short-circuit through its dispatch chain).
  Modeled the rejection on `zgemqrt`'s wrappers.
- Workspace size formulas reuse `ldwork = nb` (left) / `ldwork =
  max(M,1)` (right) just like dtpmqrt. The 2-D treatment of WORK
  matters: ztprfb expects `(strideWORK1, strideWORK2)` not a single
  flat stride.

## Dependency interface surprises

- `ztprfb` uses **complex-element strides** at its API surface (not
  doubled Float64 strides). The Fortran call `ZTPRFB('L','C','F','C',
  ..., WORK, IB)` passes `IB` as the leading dimension; in JS we map
  this to `(sw1=strideWORK, sw2=ldwork*strideWORK)` with `ldwork = nb`
  for the left side. This is identical to dtprfb and dtpmqrt.
- ztprfb internally calls `reinterpret()` on V, T, A, B, WORK — so
  ztpmqrt can pass Complex128Array directly without doing any
  reinterpret of its own. The gate's "z-prefix uses reinterpret()"
  warning is a false positive in this case (the routine is purely a
  loop-and-dispatch shell — all complex arithmetic happens in ztprfb).

## Complex number handling

- No complex arithmetic is performed in this routine — it is purely a
  block-iteration scheduler that delegates all computation to
  `ztprfb`. The only complex-aware bit is the `Complex128Array`
  fallback allocation when WORK is too small.

## Fortran test setup

- The deps file needs the full ZTPQRT chain: `ztpqrt`, `ztpqrt2`,
  `zlarfg`, `dlamch`, `dlapy3`, `zladiv`, `dladiv`, plus
  `ilaenv`/`ieeeck`/`iparmq` and `disnan`/`dlaisnan`. Do NOT include
  `xerbla`, `lsame`, `zgemv`, `zgerc`, `ztrmv`, `ztrmm`, `zgemm`,
  `dznrm2`, `zdscal`, `zscal` — those are pulled automatically from
  BLAS-3.12.0 by `run_fortran.sh` and including them causes
  multiple-definition link errors.
- For complex test arrays, EQUIVALENCE the `complex*16` array to a
  `double precision` array of length `2*N` and print via the real
  view. Watch out for the "leading dimension vs EQUIVALENCE stride
  mismatch" trap from the skill — declare arrays at exactly the test
  size, not a shared NMAX, when printing 2D matrices.

## Coverage / test design

- Six `(SIDE, TRANS)` cases × multiple shapes (basic / blocked / L=0
  / L=K / NB=K) gave 100% line, 97.87% branch coverage on base.js
  with no special tricks. The single uncovered branch is the `M < 1`
  guard on the WORK ldwork computation, which is unreachable because
  M=0 short-circuits earlier.
- For Case C and Case F the input matrices are too large to inline
  comfortably as literals, so initialization is delegated to two
  helper functions placed AFTER the `// TESTS //` block. Smaller
  cases inline their interleaved real/imag arrays directly.
