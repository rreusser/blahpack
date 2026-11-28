# zlarzb: Translation Learnings

## Translation pitfalls

- The Fortran `ZLARZB` for `SIDE='L'` does NOT conjugate `C` when building
  the workspace `W = C(1:K,1:N)^T` via `ZCOPY` — it uses a pure transpose,
  not a conjugate-transpose (even though the comment says `**H`). The
  subsequent `C(1:K,1:N) -= W(1:N,1:K)^T` update is also a pure transpose.
  This is consistent with the way `ZGEMM('T','C',...)` is then used: the
  first argument is `Transpose`, not `Conjugate transpose`. Replicate this
  exactly — do NOT "fix" the apparent asymmetry.
- For `SIDE='R'`, the complex version differs from `DLARZB` by (a)
  conjugating the lower triangle of `T` column-by-column via `ZLACGV`
  around the `ZTRMM` call (one `ZLACGV` per column, length `K-J+1`),
  and (b) conjugating each row of `V` around the final `ZGEMM` that
  updates `C(:, N-L+1:N)`. Both conjugations are done in-place, then
  undone.
- `L=0` quick-return for the `ZGEMM` calls must still run the copy,
  `ZTRMM`, and the difference update — only the `ZGEMM` calls are
  skipped. `L=0` is NOT a full quick return.

## Dependency interface surprises

- `zcopy` signature is `(N, x, strideX, offsetX, y, strideY, offsetY)` —
  no `incx`/`incy` separate from `strideX`/`strideY`. The generator
  reports an old `incx`/`incy` variant; trust the actual JS base file.
- `zlacgv(N, x, stride, offset)` — element units, not Float64 units.
- `ztrmm` expects `trans` as `'no-transpose'` / `'transpose'` /
  `'conjugate-transpose'` (string), and `side`/`uplo`/`diag` as
  `'left'`/`'right'` / `'upper'`/`'lower'` / `'unit'`/`'non-unit'`.

## Complex number handling

- Use `reinterpret(C, 0)` and `Complex128` constants (`ONE`, `NEGONE`)
  once at module top. No indexed complex arithmetic in hot paths — the
  per-element updates `C -= W^T` and `C -= W` only touch two Float64
  slots per element and don't need `cmplx.mul` et al.
- `zlacgv` handles all in-place conjugation needed for this routine;
  no manual conjugation of per-element loads is required.
