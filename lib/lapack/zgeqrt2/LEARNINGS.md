# zgeqrt2: Translation Learnings

## Translation pitfalls

- **`T(0:i-1, i)` write target uses `strideT2`, not `strideT1`.** The Fortran
  `T( 1, I )` is the *top* of column `i` (Fortran 1-based row 1, 0-based row 0
  of column `i`). When translating to `offsetT + (i * strideT?)`, the correct
  stride is `strideT2` (column step), not `strideT1` (row step). I initially
  wrote `offsetT + (i * strideT1)`, which silently re-used the workspace
  cell `T(i, 0)` as the destination of the second-loop `zgemv` and `ztrmv`
  calls. Tests with `N=1` and tau(i)=0 will not catch this — the bug only
  surfaces for `N >= 2` with non-zero tau values.

- **`T(I, I) = T(I, 1)` (Fortran), not `T(I, I) = T(1, I)`.** The diagonal
  copy at the end of the second loop pulls tau out of the workspace cell
  in **row** `i`, **column** `0` (where `zlarfg` originally placed it),
  *not* from row `0`, column `i`. Read the Fortran subscript order
  carefully — the row index comes first.

- **`-CONJG(tau)` in loop 1.** The decomposition `−conj(τ_R + i·τ_I) =
  −τ_R + i·τ_I` means `alphaR = -Tv[tix]` and `alphaI = +Tv[tix+1]`. Easy
  to write `alphaI = -Tv[tix+1]` by analogy with the second loop's plain
  `−τ` (where both signs flip). Comment the sign derivation inline.

## Dependency interface surprises

- **`zgemv` `alpha`/`beta` are `Complex128` objects**, not scalars or
  `Float64Array(2)`. Hoist `CONE = new Complex128(1, 0)` and
  `CZERO = new Complex128(0, 0)` to module scope; allocate per-iteration
  `alpha = new Complex128(alphaR, alphaI)` only when alpha varies.

- **`zgerc` (rank-1 with conjugated y) is the right pendant of `dger`** for
  this routine — NOT `zgeru`. The Fortran source explicitly calls `ZGERC`
  (the `c` suffix is "conjugated"). The compact-WY recurrence requires
  `A := alpha * x * y^H + A`, which is exactly what `zgerc` computes.

- **`ztrmv` strides are in complex elements** (not Float64). Pass
  `strideT1`, `strideT2`, `offsetT` directly without doubling.

- **`zlarfg` complex-element offsets.** The `alpha` and `tau` arguments
  are passed as the *Complex128Array* and the *complex-element offset*
  (not the underlying Float64 index).

## Complex number handling

- **Save A(i,i) as a re/im pair** before overwriting with `1.0 + 0i`.
  Cannot just save the complex object — direct Float64 access is faster
  and avoids an allocation per iteration of the outer loop.

- **No complex division needed** in this routine — all complex
  arithmetic reduces to scalar negation/conjugation of `tau` and BLAS
  matrix-vector calls. No need to import `cmplx.js`.

## Coverage gaps

- **None.** All branches of `base.js` are covered (100/100/100). The
  trick was including a `2x2 real-only` test case that exercises the
  `alphi == 0` branch through `zlarfg`, plus an `N=1` quick-return-ish
  case that exercises the inner `if (i < N - 1)` skip.

## Process improvements

- The `init_routine.py` scaffold for z-prefix LAPACK routines still
  emits Float64Array-typed `ndarray.js`/`zgeqrt2.js`/`test.zgeqrt2.js`
  templates. Every translation has to manually flip these to
  `Complex128Array`. Worth a follow-up to teach the scaffold to detect
  z-prefix and emit the right typed-array imports + JSDoc.
