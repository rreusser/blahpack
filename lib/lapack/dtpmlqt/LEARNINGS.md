# dtpmlqt: Translation Learnings

## Translation pitfalls

- **Block-iteration direction is mirrored relative to dtpmqrt.** The QR
  applier (`dtpmqrt`) iterates forward for (left, transpose) and
  (right, no-transpose); the LQ applier (`dtpmlqt`) iterates forward
  for (left, no-transpose) and (right, transpose) instead — exactly
  the opposite mapping. The Fortran source's branches are arranged in
  the same `LEFT&NOTRAN`/`RIGHT&TRAN`/`LEFT&TRAN`/`RIGHT&NOTRAN`
  order, so it is easy to copy structure from dtpmqrt and end up
  with the wrong dispatch direction. Read the Fortran branches in
  full before transcribing.
- **`LB` is identically zero for both left-side branches in dtpmlqt.**
  The Fortran source has both the `IF (I.GE.L)` and `ELSE` arms set
  `LB = 0` for `LEFT&NOTRAN` and `LEFT&TRAN`. The right-side branches
  use the familiar `LB = NB - N + L - I + 1` formula. (In dtpmqrt's
  4 branches, `LB` is non-zero in two of them.) Translating `LB`
  blindly from the QR sister routine will not match the Fortran spec.
- The `MB = MIN( M-L+I+IB-1, M )` formula appears in left-side
  branches; the right-side analog uses `N-L+...` with `N` substituted.
  In 0-based JS the `+1` from `I-1` and the `-1` cancel, so this
  becomes `mb = MIN( M-l+i+ib, M )` (or with `N`).
- **V is K-by-M (or K-by-N), not M-by-K.** dtplqt stores reflectors
  *row-wise* (one reflector per row), the LQ counterpart of dtpqrt's
  column-wise V. Therefore LDV >= K (column-major), and the per-block
  V offset is `i * strideV1` (advancing rows) rather than
  `i * strideV2` (which is what dtpmqrt uses for its column-wise V).
  The wrapper validator must enforce LDV >= K, not LDV >= max(1,M).

## Dependency interface surprises

- `dtprfb` is called with `direct='forward'`, `storev='rowwise'`
  (vs. `'columnwise'` for the QR sister). The four (side, trans)
  combinations in dtpmlqt's source pass `'L'/'T'`, `'R'/'N'`,
  `'L'/'N'`, `'R'/'T'` — note that the trans value passed to
  `dtprfb` is *flipped* relative to the outer `TRANS` (because Q
  for LQ is V^T applied as a sequence of right-side reflectors, and
  the flip is encoded in dtprfb's own dispatch). This is the
  opposite of dtpmqrt where the outer trans flows directly through.
- `dtprfb` accepts WORK as `(WORK, strideWORK1, strideWORK2,
  offsetWORK)` — two strides — so we split the user's flat-stride
  WORK into row/column strides (`sw1 = strideWORK`,
  `sw2 = ldwork * strideWORK`).

## Fortran test compilation

- `deps.py` returns only `dtprfb` for dtpmlqt, but the Fortran test
  also calls `dtplqt` to build the V/T pair. The deps file
  (`test/fortran/deps_dtpmlqt.txt`) must additionally include
  `dtplqt`, `dtplqt2`, `disnan`, `dlaisnan`, `dlamch`, `dlapy2`,
  `dlarfb`, `dlarfg`, `dlarft`, `dnrm2`, `ieeeck`, `iparmq`,
  `ilaenv` (same set as dtpmqrt minus the QR-only routines, plus
  the LQ-only `dtplqt`/`dtplqt2`).

## Coverage gap

- The lone branch gap on `base.js` (one branch on the `M > 1` guard
  inside the workspace-stride computation) is exercised whenever
  the right-side fallback is taken with `M >= 1`; the `M = 0` path
  is short-circuited earlier by the quick-return check, so the
  ternary's false arm is unreachable from the public API.

## Workspace sizing

- The user-facing WORK size matches Fortran: `N*MB` doubles
  (`side='left'`) or `M*MB` (`side='right'`). The internal-allocation
  fallback uses the same size. Same caveat as dtpmqrt: sizing the
  internal buffer as `mb*mb` would silently NaN whenever `N > mb`.
