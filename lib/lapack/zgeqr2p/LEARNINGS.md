# zgeqr2p: Translation Learnings

## Translation pitfalls

- Structurally identical to `zgeqr2`. The only difference is the use of
  `zlarfgp` instead of `zlarfg` to generate reflectors with real,
  non-negative `beta` (the `R` diagonal). No other logic changes.
- `zlarfgp` has the same JS calling convention as `zlarfg`
  (`N, alpha, offsetAlpha, x, strideX, offsetX, tau, offsetTau`), so
  the call site is a one-token substitution.
- Camel-case linter: local vars must be `alphaRe`/`alphaIm`/`conjTau`/
  `conjF64`/`tauF64` — the reference `zgeqr2` base.js has underscored
  names (predates the rule). Copy-pasting will trip 8 camelcase errors.

## Dependency interface surprises

- None. `zlarf` still uses `conj(tau)` for left (H^H) application —
  the conjugation is done manually into a scratch Complex128Array(1),
  identical to `zgeqr2`.

## Complex number handling

- The `R` diagonal is guaranteed real and non-negative, but is still
  stored as Complex128 (imag = 0). The fixture and `assert.equal(..., 0)`
  checks confirm imaginary parts are exactly zero.
- Scratch `conjTau` is allocated once per call (same as `zgeqr2`).
  Could be hoisted to module scope for a micro-optimization.

## Testing notes

- Fortran test uses EQUIVALENCE with N matching LDA so row-vs-column
  stride is unambiguous. `test_zgeqr2.f90` served as a direct template.
- Added `a[i,i].re >= 0` and `a[i,i].im === 0` assertions in every
  non-quick-return case — the defining property of `zgeqr2p` vs `zgeqr2`.
- Coverage was 100% line/branch with 7 fixture-based cases; no hard-to-
  reach branches.
