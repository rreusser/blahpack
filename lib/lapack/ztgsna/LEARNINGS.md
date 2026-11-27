# ztgsna: Translation Learnings

## Translation pitfalls

- The condition-number loop indexes VL and VR by column `ks` (the number
  of selected eigenpairs so far), not by `k` (the eigenvalue index in
  the Schur form). With `howmny='all'` these coincide, but with
  `howmny='selected'` they diverge.
- The eigenvector-condition path packs copies of A and B into a single
  flat workspace (LD=N, contiguous) and then calls `ztgexc` on the
  packed copies with dummy 1x1 Q/Z (both `wantq`/`wantz` false). The
  move target is `ifst=k`, `ilst=0` (0-based).
- After the move, ztgsyl is called on six overlapping views into that
  same workspace: six offsets of the form `N*n1+n1`, `0`, `n1`,
  `(N*n1+n1)+N*N`, `N*N`, and `n1+N*N` with n1=1, n2=N-1. These come
  straight from the 1-based Fortran indices `WORK(N*N1+N1+1)` etc.
  minus 1.

## Dependency interface surprises

- `ztgexc` uses 0-based `ifst`/`ilst` (documented in its JSDoc). The
  Fortran source uses 1-based; be sure to subtract 1 when matching.
- `ztgsyl` takes `scale` and `dif` as single-element `Float64Array`
  out-params (not return values), so allocate them with
  `new Float64Array(1)`.
- `zdotc` returns a `Complex128` object, not a tuple; use
  `cmplx.abs(...)` on the result (never inline the magnitude).
- `zgemv` takes its `alpha`/`beta` as `Complex128` objects, not as
  separate real/imag pairs.

## Complex number handling

- `dlapy2(|yhax|, |yhbx|)` computes the eigenvalue-cluster condition
  numerator. Use `cmplx.abs` (the overflow-safe routine) on the two
  complex dot products before passing them to `dlapy2`.
- For the `N=1` path, the pair `(A(1,1), B(1,1))` collapses to
  `dlapy2(dlapy2(re(A), im(A)), dlapy2(re(B), im(B)))`.
- The workspace lives as a single `Complex128Array`; all passes to
  sub-routines use complex-element strides (the `*2` happens inside
  each callee).
