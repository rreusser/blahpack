# zungtsqr: Translation Learnings

## Translation pitfalls

- **WORK is logically partitioned into two pieces** of complex elements:
  `WORK[0 .. M*N-1]` is the `M`-by-`N` workspace matrix `C` (initialized to
  the identity, overwritten with `Q`); `WORK[M*N .. M*N + N*nblocal - 1]`
  is the scratch passed to `zlamtsqr`. The Fortran code passes
  `WORK(LC+1)` as the second buffer; in JS this becomes
  `offsetWORK + lc * strideWORK`. Both segments share the same `WORK`
  array and `strideWORK`.
- **The trailing `zcopy` loop is needed** because `zlamtsqr` writes into
  the workspace matrix, not directly into `A` (which still holds the
  reflector vectors during the apply). Inlining the copy as a flat
  Float64 loop (after `reinterpret`) avoids per-element `Complex128`
  allocations.
- **`mb` is exposed as an explicit JS parameter** rather than queried via
  ILAENV. Same convention as the other compact-WY routines.
- **No LWORK validation in JS.** The Fortran `LWORK = -1` workspace query
  pattern is dropped; the wrapper only validates that `WORK` is provided.
  Callers are responsible for sizing `WORK >= (M + nb)*N` complex elements.

## Dependency interface surprises

- **`zlaset`'s third argument is `uplo`** (`'upper'`/`'lower'`/anything
  else means full). The Fortran call uses `'F'`; in JS pass `'full'`
  (the literal `else` branch is what runs for any non-`'upper'`,
  non-`'lower'` value). Set `alpha = (0, 0)` and `beta = (1, 0)` to get
  an identity matrix.
- **`zlamtsqr` has 24 parameters** (side, trans, M, N, K, mb, nb, plus
  three (array, stride1, stride2, offset) tuples for A/T/C, plus
  (WORK, strideWORK, offsetWORK, lwork)). The `lwork` parameter is
  informational only — `zlamtsqr` allocates internally if undersized.

## Complex number handling

- **Constants `CZERO` and `CONE` are hoisted to module scope** as
  `Complex128` instances so they are constructed once per module load,
  not on every call.
- **The final copy uses `reinterpret` once on `A` and once on `WORK`,**
  then iterates with Float64 indexes (re/im interleaved) to avoid the
  per-element overhead of `Complex128Array.set( i, complex128 )`.
- **Strides are doubled for Float64 indexing** (`sa1 = strideA1 * 2`,
  etc.). Standard z-prefix pattern.
