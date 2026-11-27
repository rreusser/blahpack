# zgsvj1: Translation Learnings

## Translation pitfalls

- `zgsvj1` is the complex analogue of `dgsvj1` but **structurally simpler**.
  The `D` scaling array in the d-prefix routine forces an elaborate
  4-way tree (`d[p]/d[q]` magnitudes drive different rotation paths) that
  the z-prefix routine sidesteps: complex Jacobi rotations are unitary
  and `D` only accumulates unit-modulus phase factors (`D(p) = -D(q)*OMPQ`).
  So the rotation always uses a single `zrot` call with real `cs` and
  complex `sn`, no `daxpy`-style fast variants. Modelling on dgsvj1 is a
  trap — the equivalent z-prefix Fortran is the cleaner template.
- `ZDOTC` returns the conjugated dot `sum_k conj(A_kp) * A_kq`. Pass that
  to `OMPQ = AAPQ / ABS(AAPQ)`, then call `zrot` with **`conj(OMPQ) * sn`**
  as the complex sine. The conjugation is critical: `zrot`'s update rule
  is `cy = c*cy - conj(s)*cx`, so passing `conj(OMPQ)*sn` (not `OMPQ*sn`)
  is what makes the off-diagonal block of the Gram matrix decrease.
- `AAPQ1 = -|AAPQ|`: Fortran keeps `aapq1` as the **negated** modulus and
  uses it as `-aapq1` for the running max. Don't "simplify" by storing
  `|AAPQ|` directly — the sign flip propagates into `theta` and `thsign`,
  which need the Fortran convention to choose the correct rotation
  direction.
- Argument-error indices match the Fortran positional slot numbering of
  `ZGSVJ1`, not the JS parameter index. `tol` -> `-21`, `nsweep` -> `-24`,
  `lwork` -> `-28`. These were carried over from `dgsvj1` (same Fortran
  signature shape) and audited against the source.
- `LDV` validation in the layout wrapper fires unconditionally, even when
  `jobv === 'no-v'` (V is unreferenced). Both `dgsvj1.js` and `zgsvj1.js`
  enforce this rule; callers must size `V` so `LDV >= max(1, M)` even for
  the no-vectors case. The example uses an oversized 4-element `V` for
  this reason.

## Dependency interface surprises

- `zrot` expects its complex sine as a **`Float64Array(2)`** containing
  `[re, im]`, not a `Complex128`. Reuse a hoisted `sRot = new Float64Array(2)`
  scratch buffer across calls — there are two `zrot` sites per rotation
  (one for `A`, one for `V`), both consuming the same `s` value.
- `zlascl( 'general', 0, 0, ... )` accepts complex matrices and rescales
  by `cfrom -> cto` exactly as `dlascl` does for reals.
- `zlassq` returns `{ scl, sumsq }` — same shape as `dlassq`.
- `zaxpy`'s scalar is a `Complex128`. Build it with `new Complex128(...)`,
  not a plain `{re, im}` object. (It will technically work because
  `@stdlib/complex/float64/real` does `z.re`, but use the proper ctor
  for type-safety and to keep the call site discoverable.)

## Complex number handling

- `D(p) = -D(q) * OMPQ` is inlined as a complex multiply-and-negate
  through the `dv` (reinterpret) view. Safe to inline because no
  division is involved — only multiplication and sign flip.
- Both Gram-Schmidt fallback branches need a fresh `Complex128`:
  one for `-aapq` and one for `-conj(aapq) = (-aapqR, +aapqI)`. Easy
  to get the sign wrong; `conj(z) = (zR, -zI)`, so
  `-conj(z) = (-zR, +zI)`.
- For coverage, the small-norm (`aaqq < 1`) and large-norm
  (`aapp >= big/aaqq`) safe-Gram branches are exercised by separate
  test cases that scale the input matrix to ~1e-2 and ~1e155 respectively.

## Test design

- Test fixtures mirror `dgsvj1`'s case-by-case structure (`novec_4x3_n1_1`,
  `vec_5x4_n1_2`, `apply_4x3_n1_1`, `vec_14x14_block`, `novec_n1_eq_n`,
  `novec_n1_0`) but inject imaginary parts into both `A` and any
  pre-computed inputs. `D` stays purely real on entry but picks up
  phase factors during the sweep.
- Use the EQUIVALENCE-with-packed-1D-array trick from `test_zgsvj0.f90`
  (declare `complex*16 :: a(128); double precision :: a_r(256);
  equivalence (a, a_r)`) to round-trip complex values through Fortran's
  `print_array` (double-precision real only).
- `KBL = min(8, N)` means small-N cases yield only a single row-tile;
  the `vec_14x14_block` case (N=14, n1=5 -> nblr=1, nblc=2) exercises
  multiple column tiles.

## Coverage gaps

- The swband-related steering branches (`i <= swband && ijblsk >= blskip`,
  `i <= swband && pskipped > rowskip`, and the `aapp <= 0` / `aapp < 0`
  sentinel resets) require `swband > 0`, which only gets set when
  convergence-like conditions are met inside the sweep loop. Random
  fixture inputs at `nsweep <= 5` rarely converge; this leaves ~10
  lines uncovered. Final coverage is **96.10% line / 88.10% branch**,
  comfortably above the 90/85 thresholds.

## Lint

- The `no-mixed-operators` rule fires on every `offset + (i-1)*stride`
  expression. Whitelisted at file level alongside the standard `max-*`
  family in the leading `/* eslint-disable ... */` block.
