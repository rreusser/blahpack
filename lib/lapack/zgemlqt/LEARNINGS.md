# zgemlqt: Translation Learnings

Mechanical port from `dgemlqt` to its complex pendant. The core
structure (four side x trans branches, forward/backward block
iteration based on side x trans, kf computation, WORK auto-allocation)
is identical.

## Translation pitfalls

- `trans` accepts `'no-transpose'` and `'conjugate-transpose'` only —
  NOT `'transpose'`. The base.js `tran` flag is `trans === 'conjugate-transpose'`,
  not `trans === 'transpose'`. The wrappers reject `'transpose'`
  explicitly because `is-transpose-operation` would otherwise let it
  through silently and base.js would compute the wrong thing.
- Block iteration direction was preserved verbatim from the Fortran:
  forward for (left, no-trans) and (right, conj-trans); backward for
  the other two combinations.
- For LQ reflectors V is in the rows of A — `zlarfb` is called with
  `storev='rowwise'` and an opposite-sense `trans` per block (no-trans
  user request -> conj-trans block call).

## Dependency interface surprises

- `zlarfb` takes WORK as a logically 2D buffer with two strides
  (`strideWORK1`, `strideWORK2`). The wrapper here treats the user's
  1D WORK buffer as `ldwork`-by-`mb`: `sw1 = strideWORK`,
  `sw2 = ldwork * strideWORK`. This is the same convention as
  `dgemlqt`/`dlarfb`.
- All array strides/offsets passed to `zlarfb` are in **complex
  elements**, not Float64 elements — `zlarfb` does its own
  `reinterpret()` and stride doubling internally.

## Complex number handling

- The base.js never touches complex math directly: it just dispatches
  to `zlarfb`, which handles all complex arithmetic. So there's
  nothing to inline, no `cmplx.div` calls, no reinterpret needed in
  zgemlqt itself. The gate's "z-prefix uses reinterpret()" check is a
  spurious warning for this routine.
- Workspace is a `Complex128Array` (the Fortran's `COMPLEX*16 WORK`).
  Internal auto-allocation uses `new Complex128Array( ldwork * mb )`.

## Test infrastructure

- `zgelqt` and `zgelqt3` exist in `data/lapack-3.12.0/SRC/` but no
  JS module — that's fine: the Fortran test invokes ZGELQT directly
  to generate fixtures (V/T pairs), then exercises ZGEMLQT against
  them. The deps file needs `zgelqt`, `zgelqt3`, `zlarfg`, `zladiv`,
  `dladiv`, `dlamch`, `dlapy3` plus the standard ILAENV transitives
  (`ieeeck`, `ilaenv`, `iparmq`).
- Fortran `EQUIVALENCE` of `complex*16 A(K,Q)` to `double precision A_r(2,K,Q)`
  works without leading-dimension surprises here because we declare
  arrays at exact problem sizes (K x Q, MB x K, M x N).
