# zggsvd3: Translation Learnings

## Translation pitfalls

- The driver passes `WORK` twice to `zggsvp3`: once as `TAU` (the first N
  complex elements) and once as the inner `WORK` (from offset `N`).
  In JS we compute `oWt = offsetWORK` and `oWi = offsetWORK + N*strideWORK`
  and pass both as slices into the same Complex128Array.
- The workspace-query path in our `zggsvp3` doesn't actually short-circuit
  on `lwork === -1`; like the Fortran reference, it runs `zgeqp3` which
  ignores `lwork`. The "optimal" lwork we report is whatever ends up in
  `WORK[0].re` after that run plus `N`, consistent with how the real
  `dggsvd3` driver also behaves in this codebase.

## Dependency interface surprises

- `zlange` and `dlamch` take long-form string flags (`'one-norm'`,
  `'Precision'`, `'Safe Minimum'`) — not the single-char LAPACK codes.
- `ztgsja` in this codebase takes `K` and `l` as integer inputs (not
  pointer-outs) — we have to deref `K[0]` and `l[0]` after `zggsvp3`.

## Complex number handling

- `WORK` is a `Complex128Array`. To read/write `WORK[0]`'s real part
  (used for the optimal-lwork scalar), we `reinterpret(WORK, 0)` once
  and then index `Wv[offsetWORK*2]` for the real part and
  `Wv[offsetWORK*2 + 1]` for the imaginary — the standard double-stride
  pattern. Using `WORK.get(...).re` would also work but is less uniform
  with the rest of the codebase.
- `ALPHA` / `BETA` / `RWORK` are all `Float64Array` (real), even though
  the routine is a "z" (complex) driver. Only `A`, `B`, `U`, `V`, `Q`,
  and `WORK` are complex.
