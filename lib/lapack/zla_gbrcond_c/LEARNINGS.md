# zla_gbrcond_c: Translation Learnings

## Translation pitfalls

- Almost mechanically identical to `dla_gbrcond` — the main structural
  difference is that `cmode` is replaced by a boolean `capply` and
  `trans='T'` becomes `'conjugate-transpose'` (the Fortran source actually
  treats `'T'` as `'C'` inside `ZGBTRS`). The rcond code itself does not
  need an explicit `transpose` case.
- `ANORM == 0` early-return (unlike `dla_gbrcond`) is the distinguishing
  quick-return: a zero matrix returns 0, not 1.
- `CABS1(A) = |Re(A)| + |Im(A)|` is inlined using the interleaved Float64
  view (`abView[idx] / abView[idx+1]`). No need for the `cmplx.abs` helper
  since we are only summing absolute values of components.

## Dependency interface surprises

- `zlacn2` uses complex-element strides (`strideV * 2` internally). Pass
  `strideWORK` directly, NOT `strideWORK * 2`.
- `zgbtrs` workspace convention: for the rev-comm loop we use
  `WORK[0..N-1]` as X and pass `offsetWORK` to `zgbtrs` — no reinterpret
  needed because `zgbtrs` takes a `Complex128Array`.
- Complex scalar multiplication by a real scalar is cheaper as two
  Float64 multiplies on the interleaved view than constructing a
  `Complex128` object.

## Complex number handling

- The only complex-arithmetic operation in the whole routine is
  real-scalar scaling (`WORK[i] *= RWORK[i]`, `WORK[i] *= C[i]`), which
  is safe to inline as two Float64 multiplies via a reinterpret view of
  `WORK`.
- No complex division, absolute value (in the stdlib sense), or square
  root appears, so we avoid `lib/cmplx.js` entirely.
- CABS1 is NOT the same as `cmplx.abs` — it is `|Re| + |Im|`, the
  1-norm on R^2, not the 2-norm. Keep the inline form.

## Test setup

- JS tests use `zgbtrf` to re-factor AFB inside each test, mirroring the
  Fortran test, so the fixture values come out identically without
  embedding hand-computed LU factors.
- AFB has `KL` extra rows above the band for `zgbtrf` workspace; we copy
  AB into rows `KL..KL+LDAB-1` of AFB before calling `zgbtrf`.
