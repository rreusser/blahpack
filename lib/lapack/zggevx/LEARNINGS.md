# zggevx: Translation Learnings

## Translation pitfalls

- All four `sense` values are supported. For `sense != 'none'` the base
  routine runs a per-eigenvalue loop mirroring the Fortran reference:
  `ztgevc('selected')` recomputes a single left/right eigenvector pair of
  the Schur form `(S,T)`, then `ztgsna('selected')` fills one entry of
  `RCONDE`/`RCONDV`. Unlike the real `dggevx` variant, complex
  eigenvalues are always single columns (no conjugate pairs), so `mm=1`
  for every iteration and no pair-skipping logic is needed. The `sense`
  → `ztgsna` `job` mapping is `'eigenvalues' → 'eigenvalues'`,
  `'right-vectors' → 'eigenvectors'`, `'both' → 'both'`.

- `zggbal` returns 1-based `ilo`/`ihi`, matching the Fortran contract.
  `zhgeqz`, `zgghrd`, and `zggbak` all consume 1-based `ilo`/`ihi` in this
  codebase, so pass them through unchanged. (Contrast with `dhgeqz` in
  `dggev`, which takes 0-based bounds.)

- The original Fortran signature has `ilo`, `ihi`, `abnrm`, `bbnrm`,
  `lwork`, and the workspaces (`WORK`, `RWORK`, `IWORK`, `BWORK`) in its
  parameter list, but in LAPACK they are all outputs or scratch. The JS
  base routine drops them from the signature: workspaces are allocated
  internally, and the output scalars are returned in a result object
  `{ info, ilo, ihi, abnrm, bbnrm }`. This diverges from the Fortran
  signature and triggers a `stdlib/signature-conformance` warning, which
  is expected and matches the approach taken in `dggevx`/`zgges`.

## Dependency interface surprises

- `zlange` uses `'one-norm'` (not `'one'`) for the 1-norm branch. Passing
  `'one'` silently returns zero from the `'max'` fallthrough, which shows
  up as `abnrm = 0` in tests — a fast way to spot the typo.

- `dlascl` is used (not `zlascl`) to rescale the scalar `abnrm`/`bbnrm`
  values between scaled and original reference norms, mirroring the
  Fortran reference. A single-element `Float64Array` scratch buffer is
  sufficient.

- `ztgevc` expects a `BooleanArray`/`SELECT` argument that can be `null`
  when `howmny='backtransform'`. It also takes an `M` out-param as a
  1-element `Array<integer>`; the caller is responsible for allocating it.

## Complex number handling

- `ABS1 = |re| + |im|` on a `reinterpret()` Float64 view is the cheap
  complex absolute value used for the post-balance normalization loop.
  We inline this as a tiny helper rather than calling `cmplx.absAt` so
  the hot loop stays tight.

- Eigenvector normalization is unconditional (no complex-pair skip as in
  `dggev`) because complex eigenvalues are always single columns; the
  code mirrors `zggev` directly.
