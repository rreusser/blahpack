# dgeqrfp: Translation Learnings

## Translation pitfalls

- `dgeqrfp` is a near-mechanical copy of `dgeqrf` with the single substitution
  `dgeqr2 -> dgeqr2p` for the panel factorization kernel. The only behavioral
  difference is that `dgeqr2p` (via `dlarfgp`) guarantees non-negative diagonal
  elements on `R`. Tests add explicit non-negativity checks on the diagonal.
- Scaffolder generated an `lwork` parameter in the signature because the
  Fortran prototype lists `LWORK`. In stdlib convention for this family
  (`dgeqrf`), the workspace query is not exposed; instead, if `WORK` is
  `null` or too small, the base routine internally allocates. We dropped
  `lwork` from all wrappers (ndarray.js, dgeqrfp.js, base.js, types, repl.txt)
  to match `dgeqrf`.

## Dependency interface surprises

- `dlarft` and `dlarfb` take long-form string flags (`'forward'`,
  `'columnwise'`, `'left'`, `'transpose'`) — mirror the dgeqrf usage directly.
- `NB` is hardcoded to 32 (ILAENV replacement), consistent with other blocked
  QR routines in this codebase.
