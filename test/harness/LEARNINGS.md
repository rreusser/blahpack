# Validation Learnings

**This file is the proof that the validation harness is actionable, not vanity.**
Every bug the property/fuzzing harness catches gets a permanent entry here, with a
reproducible trigger and the root cause. Over time this becomes a catalog of the
*classes* of error that survive naive fixture testing — which is exactly the
intelligence that lets us harden the tooling and the modules.

## MANDATORY LOGGING RULE (read before you "just fix it")

> When the harness (or any test) surfaces a defect, **you MUST add an entry to
> this file BEFORE or ALONGSIDE the fix** — never fix silently. This applies to
> bugs in a translated routine AND bugs in the harness itself. A fix without a
> learning throws away the most valuable output of the whole exercise: knowing
> what kind of mistake was made and where else it might hide.

Each entry MUST contain:

1. **What** — the routine (or harness component) and the symptom.
2. **Repro** — the exact trigger: scalar type, storage scheme, `uplo`/`trans`/
   `diag`, dimensions, and the **RNG seed**. A reader must be able to reproduce it
   from the entry alone.
3. **Root cause** — the specific indexing/branch/convention error, quoted if
   possible.
4. **Bug class** — one of: `off-by-one`, `0-vs-1-index`, `wrong-branch`,
   `row-col-transpose`, `stride-sign`, `uplo/trans/diag-handling`,
   `storage-mapping`, `tolerance`, `convention`, `other`.
5. **Generalization** — "where else might this hide?" Name sibling routines or
   storage schemes to check next. This is the payoff.

Keep entries short. Newest first.

---

## 2026-07-15 — HARNESS GAP + dgels LDB under/over-constraint (leading-dim wrapper unvalidated)

- **What**: `dgels`'s `order`+`LDA`+`LDB` wrapper (`lib/dgels.js`) had two wrong
  leading-dimension constraints: column-major required only `LDB >= M` (should be
  `max(M,N)`), and row-major required `LDB >= N` (should be `nrhs`). For an
  underdetermined system (`M<N`) the solution has `N` rows, so accepting `LDB=M`
  lets the routine write past the caller's buffer — a **silent out-of-bounds
  write**. (Independently fixed upstream in stschiff/blahpack@09c542d; found here by
  fixing the harness, not by reading that commit.)
- **The deeper failure was OURS — the fuzzing procedure could not see it**: the
  property and layout-invariance layers drive only `ndarray.js` (explicit
  strides/offset) with buffers sized to each operand's FULL logical shape. That
  bypasses the leading-dimension wrapper entirely (G1) and never stresses a routine
  whose OUTPUT region exceeds its INPUT region in a shared buffer (G2: dgels `M<N`
  grows `B` from `M` to `N` rows in place). No probe existed for the class.
- **Repro**: `dgels.js`, `order='column-major'`, `trans='no-transpose'`, `M=3,N=5,
  nrhs=2`, `LDB=4` (= max(M,N)-1). Wrapper returns `info=0` instead of throwing;
  the length-`4*nrhs` buffer cannot hold the 5-row solution. Row-major facet:
  `LDB=nrhs` is (wrongly) rejected because `nrhs < N`.
- **Root cause**: constraint derived from the wrong dimension — `M`/`N` instead of
  the operand's output-inclusive extent (`max(M,N)` col-major; `nrhs` row-major).
- **Bug class**: `storage-mapping` (leading-dimension constraint) in the routine;
  `other` (coverage gap) in the harness.
- **Harness fix (the real deliverable)**: added `test/harness/leadingdim.js` —
  `realizeLD` (poisoned LD-convention buffer + full-shape readback),
  `requiredLD(order,rows,cols)` (the math oracle: col→rows, row→cols), and
  `assertLeadingDimGuard(call, required, label)` (wrapper must reject `required-1`
  and accept `required`). New mandatory validate step: drive `<routine>.js` and pin
  every matrix operand's LD to its **output-inclusive** logical shape. Added to the
  blahpack-validate skill.
- **Generalization**: EVERY LD-wrapper routine is suspect, especially those whose
  output grows in a shared buffer or whose RHS/solution shapes differ: `dgels`,
  `dgelss`, `dgesv`/`dgbsv`/`dgesvx`, `dgetrs`/`dgbtrs`, `dgerfs`/`dgbrfs`, `dtrtrs`,
  and every `zge*`/`z*` analog. Run the new LD-guard step on each. `grep -rE
  'LDB < max\( 1, (M|N) \)' lib/**/lib/*.js` is a fast first pass.

## 2026-07-15 — dgels blocked path not bit-exact across col↔row storage order (benign dgemm reordering)

- **What**: `dgels` layout-invariance fuzz failed **only on the blocked path**
  (`min(M,N) > 32`): the output differed at ~3e-16 between column-major and
  row-major storage of A/B. NOT bit-exact, so `assertAllExactEqual` tripped.
- **Repro**: real scalar, `schemes.dense`, `trans='no-transpose'`, `M=40,N=33,
  nrhs=2`, seed `0x1234`. Column-major variants (tight, padded, **negative
  strides** — layout indices 0,1,4,5) are **bit-identical**; row-major variants
  (2,3,6) agree with each other and differ from col-major by 3.05e-16. Unblocked
  sizes (5×3, 3×5, 4×4) are bit-exact across **all** 7 layouts.
- **Root cause**: NOT an indexing bug. Both results are correct least-squares
  solutions (optimality residual 1.3e-17 vs 1.5e-17). The blocked path runs an
  optimized `dgemm` (through `dlarfb`) whose loop/accumulation order depends on
  operand storage order, so a col↔row flip changes floating-point summation order
  → different rounding. Pure addressing changes (offset, leading-dim padding,
  stride magnitude **and sign**) leave the arithmetic order intact and remain
  bit-exact — exactly the invariants that catch real indexing bugs.
- **Bug class**: `tolerance` (bit-exactness is unattainable across the storage-
  order flip when an optimized BLAS kernel reorders; it is NOT a defect).
- **Generalization**: this affects **every blocked LAPACK routine that reaches an
  optimized `dgemm`/`dsyrk` via `dlarfb`/`dlarft`** — `dgeqrf`, `dgelqf`, `dormqr`,
  `dormlq`, `dgels`, `dgelss`, `dpotrf` (large N), etc. When layout-fuzzing such a
  routine for L3: keep the **full** layout set for the unblocked path, but for the
  blocked path assert bit-exactness only within a single arithmetic-order family
  (e.g. the col-major layouts, which still fuzz offset/padding/negative-stride —
  the indexing-bug detectors) and verify the **other** storage orders by the
  correctness *property* instead of bit-equality. A row/col transpose *bug* would
  still be caught: it makes the row-major result WRONG (fails the property), not
  merely reordered.

## 2026-07-15 — dgels workspace under-allocation on blocked path (all-NaN solution)

- **What**: `dgels` returned an **all-NaN** solution (and NaN-poisoned WORK)
  whenever the blocked factorization path was taken, i.e. `min(M,N) > 32` (NB).
  `info` was still `0` — a silent wrong-answer. Caught by the validation harness:
  poisoned WORK padding read back into the solution, tripped by the cross-
  validation `assertFinite`/relative-error check.
- **Repro**: real scalar, `schemes.dense`, `trans='no-transpose'`, `M=40,N=33,
  nrhs=1`, seed `0x666` (also `M=64,N=33`; `M=64,N=64`; any `min(M,N)>32`).
  `M=33,N=20` (min=20, unblocked) is fine. With exactly the documented workspace
  `MN + max(MN,nrhs)*NB` it NaNs; doubling WORK makes it correct.
- **Root cause**: `dgels` sizes its factorization scratch with the **reference-
  LAPACK** formula `max(MN,nrhs)*NB` (which works in Fortran because DGEQRF packs
  its `T` factor inside that same `N*NB` buffer). But the JS `dgeqrf`/`dgelqf`
  store `T` in a **separate** trailing `NB*NB` block (`N*NB + NB*NB`), and the JS
  `dormqr`/`dormlq` need `nrhs*NB + (NB+1)*NB`. So the blocked path over-reads the
  provided scratch by up to `(NB+1)*NB = 1056` elements — off the end of the
  caller's array → NaN. Fix: enlarge the workspace formula (guard in
  `lib/ndarray.js` and the doc in `lib/base.js`) to
  `MN + (max(MN,nrhs) + NB + 1)*NB`. Verified sufficient (exact-size WORK, no NaN,
  property residual < 1e-10) across 90 cases: both `trans`, tall/wide/square,
  `nrhs∈{1,3,40}`, sizes straddling NB=32.
- **Bug class**: `convention` (workspace-contract mismatch: reference-LAPACK
  LWORK formula assumed, but JS deps use a different, larger workspace layout).
- **Generalization**: audit **every driver/wrapper that reuses a reference LWORK
  formula while calling a JS blocked routine that stores `T` separately** — the
  Fortran formula silently under-counts by ~`NB*NB` per blocked factorization and
  ~`(NB+1)*NB` per `dorm{qr,lq}` application. Check siblings: `dgelqf`-based paths,
  `dgelss`, `dgeqrs`, `zgels` (same structure, complex T block), and any routine
  whose deps' docstrings say `... + NB*NB` / `... + (NB+1)*NB`. This is the same
  *silent workspace-underallocation* failure mode recorded for the eig pipeline.
- **Harness gap now closed**: added `test/harness/workspace.js`
  (`assertWorkspaceSufficient` — probe the wrapper's advertised WORK minimum from
  its throw boundary, then run poisoned at exactly that length on the blocked path
  and require finite output; `poisonedWork`). New mandatory validate Step 4c.
  Verified it catches this exact bug: sizing WORK to the old formula (1089 for
  40×33) yields NaN at output component 0. Why Fortran was immune: reference DGELS
  passes `LWORK-MN` down and DGEQRF *adapts* NB to it (`dgeqrf.f:227-232`
  `IF(LWORK.LT.IWS) NB=LWORK/LDWORK`), and its optimal is `N*NB` with T packed
  inside — our JS hardcodes NB, never adapts, and stores T in a separate `NB*NB`
  block, so the copied `LWORK` formula is exact-and-wrong instead of a safe hint.

## 2026-07-15 — harness packed-scheme lower-triangle index collision

- **What**: `schemes.packed` produced NaN outputs from `dspmv`/`zhpmv` with
  `uplo='lower'` at small `n`. Caught by `assertFinite` (poisoned storage) during
  the harness's own bring-up.
- **Repro**: real scalar, packed scheme, `uplo='lower'`, `n=2`, any seed. Logical
  element `(1,1)` and `(1,0)` both mapped to packed index 1.
- **Root cause**: lower-triangle column-start term written as
  `j*(2N - j - 1)/2`; correct term is `j*(2N - j + 1)/2` (i.e.
  `j*N - j*(j-1)/2`). The sign error collapsed two distinct elements onto one
  slot, so the routine read an unwritten (NaN-poisoned) slot.
- **Bug class**: `storage-mapping` / `off-by-one`.
- **Generalization**: audit every other place that hand-codes the packed
  lower-triangle index (band-storage lower map, any `sp`/`hp`/`tp` reconstruction
  helper). Confirmed the upper formula `i + j*(j+1)/2` is correct. This is *the*
  reason the packed scheme poisons unused slots — an index collision reads a NaN
  instead of silently returning a plausible-but-wrong number.

<!-- Add new entries above this line. -->
