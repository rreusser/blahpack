# dgels: Translation Learnings

## Translation pitfalls

- DGELS assumes full rank. It does NOT detect rank-deficient matrices
  reliably -- `dtrtrs` only catches exact zeros on the diagonal of R or L
  after factorization. Near-singular matrices (e.g., `[1 2; 2 4]`) produce
  tiny but nonzero diagonal elements that pass the check. This is documented
  behavior (use DGELSY/DGELSD/DGELSS for rank-deficient systems).
- The signature was simplified from the Fortran version: WORK and LWORK
  are allocated internally (matching the pattern used by dgesv and other
  driver routines). TAU is also allocated internally since it's purely
  workspace. This means the caller doesn't need to worry about workspace
  sizing.
- The Fortran DGELS uses `DTRTRS` (not `DTRSM` directly). DTRTRS adds a
  singularity check before calling DTRSM, which is needed because DGELS
  returns `info > 0` when the triangular factor has a zero diagonal.
- B must be sized `max(M,N) x NRHS` even if only M (or N) rows are used as
  input, because the solution may need more rows (underdetermined case
  writes N > M rows).

## Dependency interface surprises

- `dlange` returns a number (the norm value), not an info code. Called as
  `anrm = dlange('M', M, N, A, ...)`.
- `dlascl` returns info (always 0 in practice). Called with type `'G'` for
  general matrix, kl=0, ku=0 for non-banded.
- `dormqr`/`dormlq` take a `lwork` parameter (last argument), which is the
  workspace size. They allocate their own internal workspace (T matrix) but
  use the provided WORK array for dlarfb operations.

## Automation opportunities

- The Fortran deps file generation (`init_routine.py`) doesn't include
  indirect LAPACK dependencies like `dtrtrs` (which dgels calls but
  `deps.py` doesn't trace). Also doesn't include Fortran build-only deps
  like `ilaenv`, `ieeeck`, `iparmq`, `la_constants`, `la_xisnan`, `xerbla`.
  These had to be manually added. A more complete deps scanner would help.

## Coverage gaps

- Achieved 100% line and branch coverage on base.js.
- Scaling paths (iascl/ibscl = 1 or 2) require matrix/RHS norms outside
  `[smlnum, bignum]` where `smlnum ~ 1e-292`. Using `scale = 1e-300` and
  `scale = 1e300` was needed to trigger these branches.
- Singularity detection in all 4 code paths (M>=N/N, M>=N/T, M<N/N, M<N/T)
  tested using matrices with exact zeros (e.g., `[1 0; 0 0]`).

## Complex number handling

- N/A: dgels is a real-valued routine.
