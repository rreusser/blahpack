# dla_geamv: Translation Learnings

## Translation pitfalls

- **TRANS is INTEGER in Fortran, not CHARACTER.** `dla_geamv` takes an
  integer `TRANS` code set by `ILATRANS` (111 = no-trans, 112 = trans,
  113 = conj-trans). The Fortran test program must declare these as
  `integer, parameter` and pass the code directly. At the JS API
  boundary we convert to the stdlib string convention
  (`'no-transpose'` / `'transpose'`); conjugate-transpose is equivalent
  to transpose for a real routine, so only two strings are exposed.
- **Symbolic-zero logic must not be optimized away.** The inner loop
  must short-circuit `symbZero = symbZero && ( x[j] === 0 || |A| === 0 )`
  for *every* term. Rewriting the condition (e.g. only checking on the
  last term) breaks the "symbolic zero" semantics that keeps zero rows
  of `|A|*|x|` from getting the `(N+1)*safmin` perturbation.
- **`SIGN(SAFE1, Y(IY))` vs ternary.** Fortran `SIGN(a, 0.0)` returns
  `+|a|`. A `(y >= 0 ? safe1 : -safe1)` matches; using `> 0` would
  misroute zero to `-safe1`.
- **Negative stride offsets are caller-supplied.** In the ndarray API
  we do NOT recompute `KX = 1 - (LENX-1)*INCX` inside `base.js`. The
  layout wrapper (`dla_geamv.js`) uses `stride2offset(lenx, strideX)`
  to supply the initial offset; `base.js` just iterates `offset +=
  stride`. I briefly added the Fortran-style recomputation into base
  and it double-shifted for negative strides — the fix was to trust
  the caller-supplied offset, matching `dgemv/base.js`.
- **`strideA1`/`strideA2` swap on transpose.** Unlike `dgemv`, the
  Fortran source indexes `A(I, J)` for no-transpose and `A(J, I)` for
  transpose, where `I` is the outer loop over `leny`. In the strided
  translation that becomes `ia = offsetA + i*sa1` (step `sa2` per
  inner iter) for no-transpose, and `ia = offsetA + i*sa2` (step
  `sa1` per inner iter) for transpose.
- **Benchmark scaffold allocates `N*N` for `x` and `y`.** The stock
  scaffold produces `x = uniform(N*N, ...); y = uniform(N*N, ...)` —
  at N=1000 that's 24 MB of wasted allocation per vector, and at N=1e6
  (if the exponent is bumped) it's the documented 8 TB OOM trap. Fix
  the scaffold template or patch benchmark.js manually (here, both).

## Dependency interface surprises

- `dlamch('safe-minimum')` is the stdlib key (hyphenated), not
  `'Safe minimum'` as in Fortran. Hoist the constant to module scope
  so the per-call `(N+1)*SAFMIN` computation doesn't re-enter `dlamch`.

## Linter / scaffold gotchas

- `test.js` must begin with a leading blank line so that
  `'use strict';` isn't line 1. Otherwise `stdlib/section-header-empty-lines`
  fights with `codemod-tests.js` in a lint-fix ↔ re-lint cycle: the
  codemod wants two blank lines before `// MODULES //`, the rule
  accepts only one when `'use strict';` is the first statement.
  Starting with a blank line before the eslint-disable comment breaks
  the cycle (matches the `dla_lin_berr` convention).
- The `camelcase` rule flags identifiers with underscores (`dla_geamv`).
  Every file that names a `dla_*` variable needs
  `/* eslint-disable camelcase */` — `base.js`, `ndarray.js`,
  `dla_geamv.js`, `main.js`, and all test files.
- The generated `examples/index.js` scaffold had a generic
  `TODO: Adjust call` plus a stale `A/B/C` triple intended for Level-3
  routines. Needs rewriting for the level-2 `A/x/y` signature.
