# dgemqrt: Translation Learnings

## Translation pitfalls

- **Iteration direction depends on `(side, trans)`.** The four cases split
  into two iteration patterns. Forward (`for i = 0; i < K; i += nb`):
  `(left, transpose)` and `(right, no-transpose)`. Backward
  (`for i = floor((K-1)/nb)*nb; i >= 0; i -= nb`): `(left, no-transpose)`
  and `(right, transpose)`. The Fortran computes `KF = ((K-1)/NB)*NB+1`
  (1-based). In JS the equivalent (0-based) is
  `kf = ((K-1)/nb | 0) * nb`. Use `| 0` (truncating int division) — `Math.floor` is fine here since `K-1 >= 0` after the quick return, but
  `| 0` matches the Fortran semantics in general.
- **`IB = MIN(NB, K-I+1)` (Fortran, 1-based) becomes `ib = min(nb, K-i)`
  (JS, 0-based).** For the first/last block at the edge, this trims to
  the leftover columns when `K % nb !== 0`.
- **No internal call to `dlarft`.** Unlike `dormqr`, the T factors are
  precomputed by `dgeqrt` and passed in directly. The base.js is much
  simpler — just block-step through V and T and call `dlarfb` per block.
- **WORK is logically a 2D buffer for `dlarfb`.** The Fortran signature
  hides this with `LDWORK`. The base.js synthesizes
  `(strideWORK1, strideWORK2) = (strideWORK, ldwork * strideWORK)` from
  the user's 1D `(WORK, strideWORK, offsetWORK)`. If the buffer is too
  small (`length < ldwork * nb`), allocate internally to keep callers
  honest without exploding when WORK is undersized.

## Dependency interface surprises

- **`dlarfb` WORK is `(WORK, strideWORK1, strideWORK2, offsetWORK)`** —
  takes **separate** first/second-dim strides. This differs from
  `dormqr`'s WORK contract which is a single stride (because dormqr
  internally also packs T into a custom WORK partition). Don't blindly
  copy `dormqr`'s WORK plumbing.
- **String params for `dlarfb`** are long-form: `'left'`/`'right'`,
  `'no-transpose'`/`'transpose'`, `'forward'`, `'columnwise'`. The
  Fortran `'L'/'T'/'F'/'C'` flags are the corresponding Fortran-only
  shorthand and must NOT appear in JS code.

## Coverage gaps

- The internal-WORK-allocation branch (`!WORK || WORK.length < need`)
  is exercised by an explicit "WORK auto-allocation when buffer is too
  small" test that passes `WORK = new Float64Array(1)`. Without a test
  like this, that branch is uncovered (and `dlarfb` will read past the
  WORK buffer).

## Fortran test deps

- `deps_dgemqrt.txt` needs the full `dgeqrt` chain (`dgeqrt`, `dgeqrt2`,
  `dgeqrt3`, `dlarfg`, `dgemv`, `dger`, `dtrmv`, `dlamch`, `dlapy2`,
  `disnan`, `dlaisnan`, `dnrm2`, `dscal`) plus the LAPACK utility
  shims (`ilaenv`, `ieeeck`, `iparmq`) because `dgeqrt3` calls
  `ILAENV` transitively. `python bin/deps.py dgemqrt` only sees the
  JS-side dependencies (`dlarfb` and its leaves) so the Fortran test
  deps file must be hand-augmented to compile the test harness.

## Validator semantics

- `K == 0` is a valid quick-return condition (K can be zero with the
  `M==0/N==0/K==0` early exit). Make sure `nb < 1 || (nb > K && K > 0)`
  bracketed correctly so `nb >= 1` is enforced unconditionally but the
  `nb > K` check is suppressed when `K == 0`.
