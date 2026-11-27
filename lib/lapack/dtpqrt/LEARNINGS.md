# dtpqrt: Translation Learnings

## Translation pitfalls

- The Fortran loop is `DO I = 1, N, NB` — outer iteration is over the
  **columns** of A (panels of width `nb`), unlike the LQ counterpart
  `dtplqt` which iterates over the **rows** of A. The 0-based JS form
  is the same shape (`for ( i = 0; i < N; i += nb )`) but every block
  call site differs in which dimension `ib` indexes.
- The condition `i + 1 >= l` (Fortran `I .GE. L`) and the `lb`
  recurrence carry over verbatim from `dtplqt` — `lb = mb - M + l - i`
  in 0-based indexing (the `-I_f + 1` becomes `-i` when `I_f = i + 1`).
  Reusing dtplqt's derivation and audit comments saved time.
- Scaffold's wrapper validators were wrong for QR: `scaffold.py`
  defaulted A's row-major LDA constraint to `>= max(1,N)` *and* the
  column-major to `>= max(1,M)`. Since A is `N`-by-`N` (square), both
  layouts must require `LDA >= max(1, N)`. Likewise, T is `nb`-by-`N`
  (column-major leading dim is `nb`, row-major is `N`), and B is
  `M`-by-`N`. Audited and rewrote the wrapper by hand per the
  "Compact-WY Block Reflector Routines" skill section.

## Dependency interface surprises

- `dtprfb` treats WORK as a logical 2D matrix with two strides
  (`strideWORK1`, `strideWORK2`). For dtpqrt's panel update, the WORK
  buffer is `ib`-by-`(N-i-ib)` column-major with leading dim `ib`, so
  the call site uses `(WORK, strideWORK, ib*strideWORK, offsetWORK)` —
  same convention as dtplqt's update, only the leading dim changes
  (`ib` here vs `M-i-ib` for LQ).
- `dtpqrt2` (the panel kernel) takes `(MB, IB, LB, A, ..., B, ..., T,
  ...)` with no `INFO` output in JS — it always returns 0 in the
  current implementation, matching the Fortran behavior since `dlarfg`
  cannot fail.

## Coverage gaps

- `dtpqrt/lib/dtpqrt.js` line 89-90 (the row-major LDT branch) is
  exercised but a separate branch for it requires picking specific
  parameter combinations not exercised by the simple `'row-major'`
  smoke test. Coverage on the layout wrapper is 98%/96%; base.js is
  100%/100%.

## Process

- Reusing `dtplqt`'s test scaffolding (Fortran test layout +
  `runCase` helper) was a copy-paste win — only the matrix shapes
  change (A becomes N-by-N, B is M-by-N, T is nb-by-N).
