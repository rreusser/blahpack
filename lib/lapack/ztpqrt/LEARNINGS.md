# ztpqrt: Translation Learnings

## Translation pitfalls

- Mechanical port of `dtpqrt` to z-prefix. The blocked driver itself
  contains no complex arithmetic — all heavy lifting is in `ztpqrt2`
  (panel kernel) and `ztprfb` (block-applier), so the only meaningful
  change vs. dtpqrt was switching the `'transpose'` argument of the
  trailing-update call to `'conjugate-transpose'` (because Q^H is
  applied to B for complex Householder reflectors).
- Outer loop is `DO I = 1, N, NB` (column panels of A), 0-based JS:
  `for ( i = 0; i < N; i += nb )`. Same `mb`/`lb` recurrences as
  dtpqrt: `mb = min(M-l+i+ib, M)`, and when `i+1 < l`
  `lb = mb - M + l - i`; otherwise `lb = 0`.
- Scaffold defaults for the wrapper validators are wrong for QR:
  A is N-by-N (square), so `LDA >= max(1, N)` for both layouts; T's
  column-major leading dim is `nb`, row-major is `N`. Audit and rewrite
  the wrapper by hand per the "Compact-WY Block Reflector Routines"
  skill section. The same fixes were required in dtpqrt.
- The scaffold added a redundant `strideWORK` argument to the layout
  wrapper (`ztpqrt.js`); since WORK is logically a 1D contiguous buffer
  in the BLAS-style API, drop it and pass `WORK, 1, 0` to base. This
  matches dtpqrt.

## Dependency interface surprises

- `ztprfb` mirrors `dtprfb` exactly — same 28-arg signature with 2D
  WORK strides `(strideWORK1, strideWORK2)`. For the trailing update
  here the WORK buffer is `ib`-by-(N-i-ib) column-major with leading
  dim `ib`, so the call site uses `(WORK, strideWORK, ib*strideWORK,
  offsetWORK)`.
- `ztpqrt2` returns `0` and never fails (the unblocked panel kernel's
  only failure mode would come from `zlarfg`, which always succeeds).
  Drop the IINFO bookkeeping entirely.

## Complex number handling

- The driver itself does no complex arithmetic — it just dispatches to
  `ztpqrt2` and `ztprfb` and passes through Complex128Array buffers
  with element-stride/element-offset conventions. No `reinterpret()`
  needed in `base.js` (the gate flags this with a warning, which is a
  false positive for pure dispatchers like this one).
- The string change `'transpose' -> 'conjugate-transpose'` for the
  trans flag of `ztprfb` is the entire complex-vs-real difference for
  this routine.

## Process

- Reusing dtpqrt's test scaffolding (Fortran test layout, `runCase`
  helper, fixture column-major packing) was a copy-paste win — only
  the matrix entries change to be complex (each cell becomes
  `[re, im]`).
