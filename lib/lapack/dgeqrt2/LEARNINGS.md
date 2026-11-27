# dgeqrt2: Translation Learnings

## Translation pitfalls

- The Fortran source stores `tau(i)` in `T(i, 1)` (the first column of `T`)
  during the reflector-generation pass, then later moves it to `T(i, i)`
  while building the upper triangular block factor. In the JS port this
  shows up as: in loop 1, `dlarfg`'s tau slot is `offsetT + i*strideT1`
  (column 0); in loop 2, after the `dgemv`/`dtrmv` build, copy from that
  cell into `T(i, i)` and then zero out `T(i, 0)`.
- The reference Fortran uses `T(:, N)` (the last column of `T`) as scratch
  during reflector application. We replicate this exactly — the workspace
  pointer in loop 1 is `offsetT + (N-1)*strideT2`. This requires no extra
  allocation but means the last column is dirty until loop 2 overwrites it.
- The Fortran `IF( I.LT.N )` condition (skip the application step on the
  final reflector when M==N) translates to `if ( i < N - 1 )` in 0-based
  JS, NOT `if ( i < N )`.
- Loop 2 starts at `I = 2` in Fortran (i.e. `i = 1` in 0-based JS) — the
  first column of `T` only ever holds tau values, never a triangular
  product, so it does not need a build step.

## Dependency interface surprises

- `dlarfg`'s tau output slot is `(tauArray, offsetTau)` — a single scalar
  cell, not a stride/length pair. Convenient here because we want tau to
  land directly in `T(i, 0)`.
- The compact-WY family (`dgeqrt2`, `dtplqt2`, `dgelqt3`) has a recurring
  structural pattern: a Householder pass that uses the last row/column of
  `T` as workspace, followed by a triangular build pass that uses
  `dgemv`/`dtrmv` against a temporarily-unitized diagonal of `A`. Pattern
  is very mechanical once recognized.

## Coverage

- 100% line / 100% branch on `base.js` from the six Fortran fixture cases
  plus an `n=0` quick-return test. No hard-to-reach branches.
