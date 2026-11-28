# dgeqr2p: Translation Learnings

## Translation pitfalls

`dgeqr2p` is nearly identical to `dgeqr2`; the only difference is that it
calls `dlarfgp` in place of `dlarfg` so that the diagonal entries of the
resulting upper-triangular factor `R` are guaranteed to be non-negative.
All other indexing, stride, and workspace semantics are unchanged, so the
translation is a mechanical copy of `dgeqr2/base.js` with the dependency
swap.

Note that `dlarfgp` may still produce a zero on the diagonal when the
column below the diagonal (and the pivot itself) is exactly zero; there is
no sign flip in that case. Tests should therefore assert `>= 0` rather
than `> 0` for `R` diagonal entries.

## Dependency interface surprises

`dlarfgp` exposes the same 1D array API as `dlarfg` in blahpack — it takes
`(N, ALPHA, iAlpha, X, strideX, offsetX, TAU, offsetTAU)` — so no
call-site adjustments are required beyond renaming the require.
