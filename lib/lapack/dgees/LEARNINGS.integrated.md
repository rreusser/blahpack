# dgees: Translation Learnings

## Translation pitfalls

- The Fortran `SELECT` parameter is an external function callback. In JS, it becomes a plain function parameter `select(wr, wi)` returning a boolean.
- The WORK array layout is critical: `[SCALE(0..N-1) from dgebal, TAU(0..N-1) from dgehrd, workspace...]`. The offsets ibal, itau, iwrk must be computed correctly.
- `dgebal` returns 1-based ilo/ihi. These are passed directly to dgehrd, dorghr, dhseqr, dgebak which all expect 1-based.
- `dhseqr` in this codebase does NOT take WORK/lwork parameters -- it allocates workspace internally. This differs from the Fortran reference.
- The `dlascl` 'H' type (Hessenberg) is used for unscaling the Schur form, not 'G'.
- The dcopy for re-extracting diagonal eigenvalues uses stride `strideA1 + strideA2` (diagonal stride).

## Dependency interface surprises

- `dlange` norm string: `'max'` not `'M'`.
- `dlacpy` uplo string: `'lower'` not `'L'`. Using `'L'` copies the full matrix (treated as unknown uplo).
- `dgebal` returns `{ info, ilo, ihi }` object.
- `dhseqr` returns scalar info (integer).
- `dtrsen` takes BWORK as Uint8Array with 0/1 values, not a proper boolean array.

## Missing automation

- The norm string convention mismatch (single-char vs full-word) is a repeated issue across routines. A transform or validation helper would prevent this class of bug.

## Coverage gaps

- The scaling branch (anrm < SMLNUM or anrm > BIGNUM) is not tested -- would need extreme-magnitude matrices.
- The `cscale === SMLNUM` post-processing path (WI fixup with column swaps) is not exercised.
- The SDIM recount loop at the end (checking for SORT='S' consistency) is exercised in the select test.

## Complex number handling

- N/A (real routine)
