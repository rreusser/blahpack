# Validation Learnings

**This file is the proof that the validation harness is actionable, not vanity.**
Every bug the property/fuzzing harness catches gets a permanent entry here, with a
reproducible trigger and the root cause. Over time this becomes a catalog of the
*classes* of error that survive naive fixture testing — which is exactly the
intelligence that lets us harden the tooling and the modules.

## 2026-07-18 — zspsvx layout-invariance OVER-asserted: a full-`layouts()` bit-exact fuzz of the complex-symmetric packed expert driver is invalid — negative packed AP stride is out of contract for the zsptrf factor, and row-major dense B/X benignly reorders the refinement

- **What**: The first-draft `zspsvx` validation asserted bit-exact
  X ++ rcond ++ FERR ++ BERR across the FULL `schemes.packed.layouts()` ×
  `schemes.dense.layouts()` product (copied from the `zppsvx`/`dppsvx` HERMITIAN/
  SPD mirror, whose Cholesky kernels have no pivot search and tolerate the full
  fuzz). Two distinct, legitimate divergences surfaced — neither a routine bug:
    1. **Negative packed AP stride → NaN in the factor (out of contract).** For
       `uplo='upper'`, packed stride `-1`/`-2`, `zsptrf` corrupts the
       factorization: previously-finite packed slots become NaN, so the composed
       `zspcon` (→ NaN `rcond`) AND the `zsptrs`/`zsprfs` solve (→ NaN X) both
       poison. This is the DOCUMENTED `zsptrf` contract: its Bunch-Kaufman pivot
       search calls `izamax` over the packed column, and reference BLAS `IZAMAX`
       returns `-1` for `INCX <= 0` (`INCX<=0 -> no index`), so a non-positive
       packed stride is out of contract for ANY diagonal-pivoting packed factor
       (`zsptrf`/`zhptrf`/`dsptrf` and every driver composing them). Manifested as
       `rcond=NaN` while `info=0`. (N=3 happened not to corrupt; N=5,9 did —
       out-of-contract behavior is simply undefined, not size-monotone.)
    2. **Row-major / negative / gapped dense B/X → ~few-ULP reorder.** With AP at
       unit stride, switching B/X to any row-major, negative-stride, or gapped
       dense layout shifted X by ~2e-15 (vs |X|~3.3, i.e. a few ULP), FERR by
       ~1e-14 — a benign floating-point reordering of the `zsprfs` iterative
       refinement / `zsptrs` packed-solve reductions, NOT an addressing bug (no
       NaN; magnitude is rounding-scale). The sibling `zsprfs`/`zsptrs` validations
       already certify only TIGHT col-major dense B/X for exactly this reason.
  Additionally, even POSITIVE non-unit packed stride (2,3) can flip `izamax` pivot
  TIES → a different (still correct) Bunch-Kaufman path → not bit-exact.
- **Repro**: `lib/lapack/base/zspsvx/test/test.validate.js`, `sc=complex`,
  `logical.symmetric` (complex-symmetric A=Aᵀ, NO conj), N=9, nrhs=2, seed
  `0xBEEF`. Factor NaN: `uplo='upper'`, `schemes.packed.layouts()[4]`
  (`{stride:-1,lead:4,tail:1}`) → `rcond=NaN`, `info=0`; `zsptrf` scan shows valid
  packed slots turned NaN post-factor (`NaN-in-factor=4` at N=5). Benign reorder:
  `uplo='upper'`, AP tight, B/X `layouts()[2]` (row-major) → `dX≈2.4e-15`,
  `dFERR≈1.4e-14`, `dBERR≈3e-17`, `drcond=0`.
- **Root cause**: `harness-over-assertion` / `fast-path-reorder` + out-of-contract
  layout — the invariance step asserted bit-exactness over layouts the composed
  kernels do not (and cannot) support. The mirror driver (`zppsvx`) tolerates the
  full fuzz only because Cholesky has no `izamax` pivot and its refinement doesn't
  reorder on B/X order; the complex-SYMMETRIC diagonal-pivoting family does both.
- **Fix (APPLIED, test-only — no routine change)**: scoped the bit-exact
  layout-invariance to a PURE-ADDRESSING family (unit positive stride, varying
  ONLY base offset via `lead`/`tail` for packed and `lead`/`tail`/`ldaExtra` for
  dense — `schemes.dense.pureAddrLayouts()`), which cannot reorder arithmetic nor
  change a pivot decision → genuinely bit-exact and still catches base-offset
  addressing bugs (the `zpptri` class). Cross-order correctness (non-unit packed +
  row-major/negative dense still SOLVE to tolerance) is certified by a separate
  cross-layout RESIDUAL sweep (POSITIVE packed strides 1,2,3 × EVERY dense layout),
  matching the `zsysvx` pattern. Final level: **L3-layout-fuzzed**. Base-vs-ndarray
  `rcond` agree bit-for-bit (`Object.is`) on the tight layout across the sweep.
- **Generalization**: every `*spsvx`/`*spcon`/`*sptrf`/`*hpsvx`/`*sysvx`-class
  diagonal-pivoting driver (packed OR dense) must (a) restrict factor/driver
  layout-invariance to a pure-addressing (base-offset) family, (b) sweep only
  POSITIVE packed / positive-leading-dim strides for the factor contract, and
  (c) keep dense B/X TIGHT col-major for bit-exactness, relying on a residual
  sweep for cross-order correctness. Any full-`layouts()` bit-exact assertion on
  these is an over-assertion. (Cf. `zsptrf`, `zsysvx`, `zspcon` validate notes and
  the RFP `pffamily` fast-path-reorder entry below.)

## 2026-07-18 — dgelqt WORK guard advertised `mb*N`, but the blocked LQ trailing update scales with trailing ROWS — for tall (M>N) inputs the true peak is `(M-min(mb,N))*min(mb,N)` → poisoned WORK of the advertised length leaked NaN into the factor

- **What**: The `dgelqt` ndarray wrapper AND the auto-alloc `dgelqt.js` wrapper both
  sized WORK as `mb*N` (copied verbatim from reference `DGELQT.f`'s documented
  `WORK dimension (MB*N)`). But `base.js` applies the trailing block update with
  `dlarfb('right', ..., 'rowwise', M-i-ib, N-i, ib, ..., WORK, 1, M-i-ib, ...)`,
  i.e. WORK is used as a `(M-i-ib)`-by-`ib` column-major scratch — its size scales
  with the trailing ROW count `M-i-ib`, NOT with `N`. The peak is the first block:
  `(M - min(mb,K))*min(mb,K)` (K=min(M,N)). This exceeds `mb*N` exactly when
  `M > N + mb` (tall LQ). `mb*N` is correct only for the standard wide case M≤N.
  A caller who sized WORK to the advertised `mb*N` on a tall input got
  out-of-bounds reads into poisoned/unallocated padding → `undefined`/NaN in the
  on/below-diagonal L (and V) of the factored A. This is the LQ dual of the dgeqrt
  QR case, where the trailing update instead scales with trailing COLUMNS `N-i-ib`
  and `mb*N` is always safe because dgeqrt requires M≥N.
- **Repro**: `lib/lapack/base/dgelqt/test/test.validate.js` Step 4c
  `assertWorkspaceSufficient`, `schemes.dense`, real trait, seed `0xB10C+M*7+N`.
  Case `M=40, N=20, mb=8` (K=20, M>N): advertised minimum probes to WORK length
  **160** (= mb*N); running at exactly 160 with a POISONED buffer yields a
  non-finite output component (index 8) — the routine reads past its own advertised
  workspace. The true peak is `(40-8)*8 = 256`. Also caught in the primary property
  sweep at `M=5, N=3, mb=1` (peak `(5-1)*1 = 4` vs advertised `mb*N = 3`): the
  reconstruction A=L·Q had a non-finite value at index 4. A brute-force check over
  all `0≤M,N≤40`, `1≤mb≤K` confirms the closed form
  `(M-min(mb,K))*min(mb,K)` equals the exact per-block peak everywhere (0
  mismatches), and `mb*N` under-counts by up to 200 elements for tall cases.
- **Root cause**: `convention` / workspace under-count — the guard copied the
  reference `MB*N` doc figure, which is a lower bound valid only for the M≤N regime
  the reference targets; our JS supports general M,N (base computes K=min(M,N) and
  factors tall inputs too) but never widened the WORK bound for M>N.
- **Fix (APPLIED)**: both `ndarray.js` and `dgelqt.js` now advertise
  `minWork = max( mb*N, (M-min(mb,K))*min(mb,K) )` when K>0 (else 0). The `max`
  preserves the reference-documented `mb*N` for the wide M≤N regime (faithful — it
  never LOWERS the documented minimum) and raises it to the exact peak only where
  M>N genuinely needs more. Step 4c now passes at the corrected advertised minimum
  (160→256 for 40×20×8, etc.) with reconstruction still holding there; the primary
  property sweep (which poisons WORK to exactly `mb*N`) passes because the test now
  sizes WORK from the same corrected formula.
- **Bug class**: `convention` (workspace-size boundary).
- **Generalization**: audit ALL `*lqt`/`*lq2`-style blocked LQ (and their complex
  `z` siblings, e.g. `zgelqt`) and any routine whose `dlarfb` update is
  `side='right'`/rowwise — their WORK scales with trailing ROWS, so a `mb*N` /
  `nb*N` guard silently under-counts for M>N. This is the ROW-trailing dual of the
  `dgeqrt`/`*qrt` COLUMN-trailing family (where `nb*N` is safe under the M≥N
  precondition). Check `zgelqt`, `dtplqt`/`dtplqt2`, `dgemlqt` next.

## 2026-07-18 — RFP-PD family harness (`pffamily.js`) over-asserted: dpftri is NOT bit-exact across ALL RFP strides — the real Cholesky-inverse (dlauum/dsyrk fast path) reorders arithmetic on any stride change

- **What**: `pffamily.js` originally claimed (docstring + `pftriInvariance` using the
  full stride-fuzzing `linearLayouts()`) that the *entire* RFP positive-definite family
  is bit-exact across ALL linear RFP layouts (stride sign AND magnitude). That claim is
  FALSE for **dpftri** (real RFP Cholesky inverse). The numeric reconstruct property
  A0·inv(A0)=I passes everywhere (routine is correct → L2), but the bit-exact layout
  fuzz fails.
- **Repro**: `lib/lapack/base/dpftri/test/test.validate.js`, `transr='transpose'`,
  `uplo='upper'`, `n=12`, seed `0xF00D`; RFP buffer `stride=2` vs `stride=1` differ at
  packed component 78: `0.14882374233484508` vs `0.1488237423348451` (1 ULP). Probe
  confirmed: **offset-only** changes (stride fixed at +1, vary lead/tail/base) are
  bit-exact (0 differing components); ANY stride change — including `stride=-1`,
  2, 3 — flips exactly 1 ULP.
- **Root cause**: NOT a bug in dpftri. dpftri delegates to `dlauum` + `dsyrk` + `dtrmm`
  (`lib/lapack/base/dpftri/lib/base.js:81-133`); `dlauum` is the RFP analog of the
  dense **dpotri/dlauum** family already documented in `schemes.js` (`pureAddrLayouts`)
  as legitimately reordering when a unit-stride (`incx==1`) BLAS fast path is taken.
  Changing the RFP stride changes the strides handed to those inner kernels, which
  switches their accumulation order → last-ULP differences. Faithful to reference LAPACK.
- **Why zpftri is immune**: the complex RFP inverse (ztfttri/zlauum/zherk/ztrmm) has no
  analogous unit-stride specialization in this codebase, so zpftri stays bit-exact across
  ALL RFP layouts (verified — its full-stride fuzz passes). Same asymmetry as the dense
  d-vs-z LAUUM/POTRI pair.
- **Bug class**: `harness-over-assertion` / `fast-path-reorder` (invariance level, not
  correctness). The *helper* asserted a stronger invariant than the code guarantees.
- **Fix**: `pffamily.js` — invariance drivers now take an optional RFP-layout list;
  added `pureAddrRfpLayouts()` (stride fixed at +1; vary lead/tail/base offset only —
  the RFP analog of `schemes.dense.pureAddrLayouts`). dpftri's L3 invariance uses it;
  its cross-order/stride correctness is certified by the reconstruct property swept over
  the sizes. All other pf* routines (dpftrf, zpftrf, zpftri, dpftrs, zpftrs) keep the
  full stride-fuzzing `linearLayouts()` and pass bit-exact.
- **Generalization**: any RFP routine that bottoms out in a real `lauum`/`trmm`/`syrk`
  fast path (dtftri's inverse path, dsfrk via dsyrk) may reorder on stride change —
  fuzz it with `pureAddrRfpLayouts()` and lean on the numeric property for the
  cross-stride guarantee. Complex analogs generally stay fully bit-exact.

## 2026-07-18 — dggqrf/zggqrf/dggrqf/zggrqf (generalized QR & RQ) ndarray WORK guards + convenience auto-allocs UNDER-advertise the reference min `max(1,N,M,P)` but forward ONE shared WORK to three blocked sub-kernels (geqrf/ormqr/gerqf) that each store a trailing block-reflector T → silent NaN in the factored A/B

- **What**: All four generalized-QR/RQ wrappers guard the caller-owned WORK with the
  reference LAPACK lower bound `minWork = max(1, N, M, P)` (the UNBLOCKED minimum),
  with NO blocked branch. But each routine forwards ONE shared WORK straight into
  THREE blocked sub-kernels:
  - `dggqrf`/`zggqrf`: `geqrf(N,M)` + `ormqr('L',N,P,kA)` + `gerqf(N,P)`.
  - `dggrqf`/`zggrqf`: `gerqf(M,N)` + `ormrq('R',P,N,kA)` + `geqrf(P,N)`.
  Those sub-kernels hardcode `NB=32` and store a block-reflector `T` in a SEPARATE
  trailing WORK segment (the `geqrf`/`gerqf` need `dim*NB + NB*NB`; the `ormqr`/`ormrq`
  need `nw*NB + (NB+1)*NB`), and do NOT adapt `NB` down when WORK is small (the
  reference shrinks `NB` to fit `LWORK`; our JS does not). So each wrapper ACCEPTED a
  WORK buffer far too small for a blocked call; `dlarft`/`dlarfb` (`zlarft`/`zlarfb`)
  then write/read the `T` region past the buffer (silently dropped by the typed
  array, read back as `undefined`) → **NaN in the factored A/B**. No throw — a silent
  non-finite result. Same class as the whole `dgeqrf`/`dgerqf`/`dormqr`/`dormrq`
  family below; these are the composite drivers that inherit all of them. The
  convenience auto-allocators (`{d,z}ggqrf.js`, `zggrqf.js`, WORK=null path) used the
  SAME `max(1,N,M,P)` and so under-allocate identically; `dggrqf.js` alone used
  `max(1,M,P,N)*DEFAULT_NB` (NB=64) which happens to over-cover, but was aligned to
  the exact formula for provable safety.
- **Repro**: `lib/lapack/base/{dggqrf,zggqrf,dggrqf,zggrqf}/test/test.validate.js`
  Step 4c (`assertWorkspaceSufficient`), N=M=P=64 (all three sub-mins = 64 > NB=32 →
  blocked). Seed `factor`'s `0x51 + N*1e4 + M*100 + P` (ggqrf) / `0x71 + M*1e4 + P*100
  + N` (ggrqf). The advertised minimum probes to WORK length **64**; a poisoned buffer
  of exactly 64 yields the first non-finite output at flattened component **2048**
  (dggqrf, = N*NB, the geqrf/gerqf block seam) / **4096** (zggqrf, = 2·N·NB Float64s) /
  **0** (ggrqf; its first sub-call gerqf over-reads immediately). True need is
  `max(M*NB+NB*NB, P*NB+(NB+1)*NB, N*NB+NB*NB) = 3104` at 64/64/64. The property and
  col/row layout-invariance sweeps PASS at every size — they over-size WORK, so only
  Step 4c sees this.
- **Root cause**: `convention` — copied the reference unblocked `LWORK` lower bound as
  a hard guard for a driver that delegates to three non-adaptive blocked sub-kernels
  each consuming a trailing `T` block.
- **Fix (APPLIED)**: rewrote the WORK guard in all four `ndarray.js` (and the matching
  auto-alloc in all four convenience wrappers) to `NB=32; kA=min(...); kB=min(...);
  minWork = max(1, N, M, P, geqrfNeed, ormNeed, gerqfNeed)` mirroring the (already
  fixed) sub-kernel guards. Step 4c now passes at the corrected advertised minimum
  (3104 at 64/64/64), with both reconstructions still holding there.
- **Bug class**: `convention` (workspace-size boundary; unblocked LWORK lower bound
  used as a hard guard for non-adaptive blocked delegates that consume more).
- **Generalization**: composite drivers that thread ONE WORK through several blocked
  BLAS/LAPACK sub-kernels must advertise the MAX of the sub-kernels' blocked needs,
  not the reference's adaptive lower bound. Other multi-kernel WORK-sharing drivers to
  audit for the same tell (`max(1,·)` guard, no blocked branch): `dggsvp3`/`zggsvp3`,
  `dgejsv`, `dtgsja`, and the `d/zgels`-family expert drivers. Step 4c is the
  high-signal probe.

## 2026-07-18 — dggrqf/zggrqf (generalized RQ) base.js quick-return was too aggressive: `M===0` (and zggrqf's extra `p===0`) SKIPPED sub-factorizations that are INDEPENDENT of that dimension → the reference still computes them, leaving TAUB/TAUA + B/A unfactored (poisoned)

- **What**: `dggrqf/base.js` quick-returned on `if (M===0 || N===0)` and
  `zggrqf/base.js` on `if (M===0 || N===0 || p===0)`. But the reference `dggrqf.f`
  has NO top-level quick return — it always runs all three sub-factorizations, each
  trivializing independently on its OWN zero dimension. The QR of B
  (`dgeqrf(P,N,B)` → TAUB) is INDEPENDENT of M, so it must still run when `M===0` but
  `P,N>0`; and the RQ of A (`dgerqf(M,N,A)` → TAUA) is INDEPENDENT of P, so it must
  still run when `p===0` but `M,N>0`. The over-broad guards returned early and left
  those factors uncomputed (in the test, TAUB stayed poisoned → the Z (QR-Q of B)
  formation read NaN). The QR twin `dggqrf`/`zggqrf` guards on `N===0` ONLY (the sole
  case where ALL three sub-ops are trivial), so they were CORRECT — the RQ wrappers
  simply added `M===0`/`p===0` cases the reference does not skip.
- **Repro**: `lib/lapack/base/dggrqf/test/test.validate.js` (and `zggrqf`) Steps 2-3,
  triple `M=0, P=2, N=3` (A is 0×3 empty ⇒ Q=I_3; B is 2×3, its QR must still run),
  seed `0x71 + 0*1e4 + 2*100 + 3`. `assertOrthonormal` on Z fails with
  `non-finite value at index 0` (TAUB never written → poisoned NaN read back).
  `zggrqf` additionally reproduces at `p=0, M,N>0` (RQ of A skipped → TAUA poisoned).
- **Root cause**: `wrong-branch` — a quick-return condition that OR'd in dimensions on
  which only SOME of the sub-factorizations depend, skipping the independent ones.
- **Fix (APPLIED)**: removed the top-level quick return from both `base.js` (matching
  the reference), letting each sub-call trivialize on its own zero dimension. The
  full (N,M,P)/(M,P,N) sweep incl. all zero corners now passes; sub-calls are safe
  with a zero dimension (`kA`/`kB`=0 loops are empty).
- **Bug class**: `wrong-branch`.
- **Generalization**: any composite driver with a hand-added top-level quick return
  must OR only dimensions on which EVERY sub-step depends; if a sub-step depends on a
  disjoint subset of dims it must run whenever THAT subset is nonzero. Re-check other
  multi-factorization drivers that added a quick return not present in the reference:
  `dggqrf`/`zggqrf` (verified correct: `N===0` only), `dggsvp3`, `dtgsja`. Poisoned
  output arrays (TAU) at zero-dimension corners are what surfaced it.

## 2026-07-18 — dposvx (real SPD expert solve driver) base.js DROPPED the `rcond` output argument that its own ndarray wrapper, docs/types/repl, and the complex twin zposvx all declare → the documented ndarray API crashes (args shift by one; WORK binds to a scalar in dlansy)

- **What**: Reference LAPACK `DPOSVX` has `RCOND` as output argument #15 (a scalar
  passed by reference). The complex twin `zposvx` translates this faithfully:
  `rcond` is an explicit length-1 `Float64Array` out-param in `base.js`,
  `zposvx.js` (LDA-main), and `ndarray.js`, written on every return path AND echoed
  in the return object. `dposvx` was botched: `base.js` and `dposvx.js` (LDA-main)
  OMITTED the `rcond` param entirely (rcond only in the return object), while
  `ndarray.js` — plus the published `docs/types/index.d.ts` (ndarray line) and
  `docs/repl.txt` — DECLARE `rcond` after `offsetX`. So the ndarray function signed
  and documented a `rcond` argument that `base.js` did not accept. A caller
  following the documented ndarray signature (as the validation harness and the
  zposvx sibling test do — pass an explicit `rcond` array) shifts every subsequent
  argument by one inside `base.js`: `rcond`→base's `FERR`, `FERR`→`strideFERR`, …,
  `WORK`→a scalar. dposvx then calls `dlansy(..., WORK=<number>, ...)` and CRASHES
  (`TypeError: Cannot create property 'NaN' on number '0'`) — a silent API-contract
  break masked only because every EXISTING caller/test happened to use the LEGACY
  no-rcond positional layout, where the missing-param double-shift (test omits
  rcond → ndarray declares it → base omits it) accidentally re-aligned.
- **Repro**: `lib/lapack/base/dposvx/test/test.validate.js` (residual/rcond/FERR-BERR
  checks) — calling `ndarray(...,X,1,N,0, rcond, FERR,1,0, BERR,1,0, WORK,1,0,
  IWORK,1,0)` with an SPD 3×3 well-conditioned system throws inside `dlansy` before
  producing any output. Minimal: `not-factored`/`upper`, N=3, nrhs=1, any SPD A.
- **Root cause**: incomplete translation — the `rcond` output argument was dropped
  from `base.js` and `dposvx.js` during the d-translation but left in the ndarray
  wrapper and all three doc artifacts, so the wrapper's advertised contract was
  never actually implemented. Faithfulness/parity gap vs the correctly-translated
  `zposvx`, `dsysvx`, `zsysvx` (all carry `offsetX, rcond`).
- **Fix (APPLIED)**: added the `rcond` out-param to `dposvx/lib/base.js` mirroring
  `zposvx/lib/base.js` — `rcond[0]=1.0` on the N==0/nrhs==0 quick return,
  `rcond[0]=0.0` on the not-positive-definite return, `dpocon(...,rcond,...)` into
  the caller's array, `rcond[0]<EPS` singular check, and `'rcond': rcond[0]` in the
  return object (removed the vestigial local `RCOND` buffer). The LDA-main
  `dposvx.js` keeps its published arity (no rcond arg) by allocating a local
  `rcond` buffer and forwarding it to `base` (rcond still surfaced via the return
  object there). Updated `test.ndarray.js` and `benchmark.ndarray.js` to pass an
  explicit `rcond` array. No changes needed to `ndarray.js` or the `.d.ts`/repl —
  they already declared `rcond`; base.js now honors it.
- **Bug class**: `convention` / faithfulness (dropped a reference OUTPUT argument;
  wrapper + docs declared it but base never implemented it; masked by legacy
  positional callers whose omission double-shift accidentally realigned).
- **Generalization**: when an ndarray wrapper's parameter list is LONGER than what
  its `base` accepts, extra trailing/interior args are silently swallowed by JS and
  the whole tail shifts — invisible until a caller actually USES the extra
  argument. High-signal probe: DIFF the d/z twins' `base.js` signatures at the
  `offsetX, …` seam; any `svx`/`sv` expert driver must carry `rcond` as an out-array
  (it is a reference output argument), not merely a return-object field. The
  fixture tests missed it because they all used the legacy no-rcond call layout.

## 2026-07-18 — dormbr AND zunmbr (apply Q/P of a bidiagonal reduction) ndarray WORK guards lack a BLOCKED branch (dormbr's is also side-INDEPENDENT) → poisoned WORK of the advertised length leaks NaN into the applied C

- **What**: The `dormbr` and `zunmbr` ndarray wrappers guard the caller-owned WORK
  with only the UNBLOCKED minimum and no blocked branch. `dormbr` was worse: its
  guard was a bare `minWork = Math.max( 1, N )` — SIDE-INDEPENDENT, so for
  `side='right'` (true unblocked minimum M) it under-advertises whenever `M > N`
  even off the blocked path. `zunmbr` was side-correct (`need = side==='left' ? N :
  M`) but still had no blocked branch. Both delegate to the BLOCKED `dormqr`/`dormlq`
  (`zunmqr`/`zunmlq`) base kernels, which — when the reflector count reaching them
  exceeds `NB=32` — store the block reflector `T` in a SEPARATE trailing WORK segment
  and therefore consume `nw*NB + (NB+1)*NB` (nw = N for `side='left'`, M for
  `side='right'`), NOT the unblocked `nw`. So the wrapper ACCEPTED a WORK buffer far
  too small for a blocked apply; `dlarft`/`dlarfb` (`zlarft`/`zlarfb`) then
  write/read the `T` region past the buffer (silently dropped by the typed array,
  read back as `undefined`) → **NaN in the applied C**. No throw — a silent
  non-finite result. Same real-lags-complex / no-blocked-branch class as the
  `dgehrd`, `dorgbr`/`zungbr`, and `dormqr` entries; note the sibling `dormqr`,
  `zunmqr`, `zunmlq` wrappers ALREADY carried the correct blocked guard, so this was
  a `dormbr`/`zunmbr` wrapper omission, not a base-kernel bug.
- **Repro**: `lib/lapack/base/{dormbr,zunmbr}/test/test.validate.js` Step 4c
  (`assertWorkspaceSufficient`), any of vect∈{apply-Q,apply-P} × side∈{left,right}
  with m0=n0=40, freeN=50 (K = 40 > NB=32 → blocked), factor seed `0xB000+m0*100+n0`.
  The wrapper's advertised minimum probes to WORK length **50** (side=left, =max(1,N))
  or **40** (side=right, =M); running the blocked apply at exactly that length with a
  poisoned buffer yields a non-finite value at flattened component **0** — it
  actually needs `50*32 + 33*32 = 2656` (side=left). The unblocked path (reflector
  count ≤ NB) genuinely needs only `nw` and is unaffected.
- **Root cause**: both wrappers copied the reference LAPACK unblocked LWORK lower
  bound as a hard guard, but our JS hardcodes NB and does NOT adapt the block size
  down when WORK is small (the reference shrinks NB to fit LWORK; we do not). So the
  reference's minimum is not a safe minimum for our non-adaptive blocked path.
- **Fix (APPLIED)**: rewrote the WORK check in both wrappers to mirror `dormqr`:
  `nq = side==='left' ? M : N; nw = side==='left' ? max(1,N) : max(1,M); keff =
  (vect==='apply-Q') ? (nq>=K ? K : (nq>1 ? nq-1 : 0)) : (nq>K ? K : (nq>1 ? nq-1 :
  0)); minWork = (keff > NB) ? (nw*NB + (NB+1)*NB) : nw`. `keff` is the reflector
  count actually reaching `dormqr`/`dormlq` (K on the primary path, nq-1 on the
  secondary `nq<K` / `nq<=K` branch, matching `base.js`). Step 4c now passes at the
  (correctly larger) advertised minimum (2656 = 50*32+33*32 for the m0=n0=40,
  freeN=50 probe) and the op(Q/P) apply still matches the explicit-factor oracle
  there.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard for
  a non-adaptive blocked kernel that consumes more; dormbr additionally dropped the
  side dependence; both lagged the already-correct dormqr/zunmqr/zunmlq siblings).
- **Generalization**: same tell as the `dgehrd`/`dormqr` entries — a wrapper whose
  WORK guard is a bare `max(1,·)` with no blocked branch while it delegates to a
  base that documents a trailing `T` block. Step 4c is the high-signal probe; the
  property/layout tests miss it because they over-size WORK. When sibling
  apply/form routines already carry the correct guard, DIFF the wrappers first. The
  `dormbr` side-independence bug also shows: always test BOTH sides at Step 4c.

## 2026-07-18 — dorgbr AND zungbr (BOTH real and complex form-Q/Pᵀ from a bidiagonal reduction) ndarray WORK guards advertised `max(1,min(M,N))` but delegate to BLOCKED dorgqr/dorglq needing `dim*NB` → poisoned WORK of the advertised length leaked NaN into the formed Q/Pᵀ

- **What**: The `dorgbr` and `zungbr` ndarray wrappers each had the workspace guard
  `var minWork = Math.max( 1, Math.min( M, N ) );` — the reference LAPACK unblocked
  lower bound (`LWORK >= max(1,min(M,N))`). But `dorgbr`/`zungbr` do NO real work of
  their own: they DELEGATE to the BLOCKED `dorgqr`/`dorglq` (`zungqr`/`zunglq`),
  which store the block-reflector T factor + `dlarfb`/`zlarfb` scratch in WORK and
  need up to `dim*NB` (NB=32) elements — `N*NB` for the `dorgqr` (`vect='Q'`) path,
  `M*NB` for the `dorglq` (`vect='P'`) path (with the shifted `M<K`/`K>=N` sub-cases
  needing `(M-1)*NB`/`(N-1)*NB`). So both wrappers ADVERTISED a sufficient minimum of
  `min(M,N)` while the delegate actually reads `~min(M,N)*NB`. A caller who sized
  WORK to the advertised minimum got out-of-bounds reads → `undefined`/lost writes →
  **NaN in the formed Q/Pᵀ**. No throw — a silent non-finite result. Unlike the
  QR/RQ sibling families where only one scalar variant lagged, here BOTH the real
  `dorgbr` and complex `zungbr` wrappers copied the unblocked `max(1,min(M,N))`
  formula (same as the `dorglq`/`zunglq` and `dorgrq`/`zungrq` pairs).
- **Repro**: `lib/lapack/base/dorgbr/test/test.validate.js` (and `zungbr`) Step 4c
  (`assertWorkspaceSufficient`), `schemes.dense`. Four blocked cases, each forcing
  its delegate onto the blocked path (effective K > NB=32): `vect='Q'` M0=80,N0=64
  → `dorgqr(80,64,64)`; `vect='Q'` M0=64,N0=80 → `dorgqr(63,63,63)`; `vect='P'`
  M0=64,N0=80 → `dorglq(64,80,64)`; `vect='P'` M0=80,N0=64 → `dorglq(63,63,63)`.
  Seed `0xB10C + M0*7 + N0`. First failing case: `vect='Q'` M0=80,N0=64 — the
  wrapper's advertised minimum probes to WORK length **64** (= min(80,64)); running
  the blocked former at exactly 64 with a poisoned buffer yields a non-finite value
  at flattened component **2560** (col 40, the first block seam past the advertised
  workspace; it actually needs `N*NB = 64*32 = 2048`).
- **Root cause**: `lib/lapack/base/{dorgbr,zungbr}/lib/ndarray.js` copied the
  reference LAPACK unblocked LWORK lower bound (`max(1,min(M,N))`) as a hard guard,
  but our JS hardcodes NB and does NOT adapt the block size down when WORK is small
  (the reference shrinks NB to fit LWORK; we do not). So the reference's minimum is
  not a safe minimum for our non-adaptive blocked delegates.
  **Second copy of the same bug**: the ERGONOMIC top-level wrappers
  `{dorgbr,zungbr}/lib/dorgbr.js`/`zungbr.js` auto-allocate WORK when the caller
  passes `null` — and they used the SAME buggy `Math.max(1,Math.min(M,N))` formula,
  then call `base` DIRECTLY (bypassing the ndarray guard). So the null-WORK
  convenience path silently under-allocated on the blocked path too. Both the
  ndarray guard AND the auto-alloc size were fixed with identical branch logic.
- **Fix (APPLIED)**: rewrote the WORK check in both ndarray wrappers AND the
  auto-allocation in both top-level wrappers to mirror the delegate chosen by the
  same `vect`/(M,K)/(K,N) branch logic as `base.js`:
  `wantq ? (M>=K ? (K>NB? N*NB : N) : (M>1 ? (M-1>NB? (M-1)*NB : M-1) : 1))
        : (K<N ? (K>NB? M*NB : M) : (N>1 ? (N-1>NB? (N-1)*NB : N-1) : 1))`,
  then `minWork = max(1, min(M,N), that)`. Step 4c now passes at the (correctly
  larger) advertised minimum for all four cases (2048 / 2016 / 2048 / 2016), with
  orthonormality still holding there; the property (orthonormality + reconstruction
  A0=Q·B·Pᵀ) and col/row bit-exact layout-invariance were already L3-green (they
  over-size WORK, so they never saw it).
- **Bug class**: `convention` (workspace-size boundary — copied reference unblocked
  LWORK lower bound as a hard guard for a wrapper that delegates to a non-adaptive
  blocked kernel consuming `dim*NB`).
- **Generalization**: closes the `dorgbr`/`zungbr` item implied by the `dgehrd`
  entry's audit list ("`dorghr`/`zunghr`… form Q from a reduction — check whether
  their real wrapper's WORK guard has a blocked branch"). The `*orgbr`/`*ungbr`
  form-from-bidiagonal formers are pure delegators, so their guard must mirror the
  DELEGATE's need, not the reference's adaptive lower bound. Still-unaudited related
  formers: `dorgtr`/`zungtr` (form Q from tridiagonal reduction), `dorghr`/`zunghr`
  (from Hessenberg). Only the Step-4c poisoned-minimum probe catches this; the
  property/layout tests over-size WORK and miss it.

---

## 2026-07-18 — dormhr AND zunmhr (BOTH real and complex apply-Q from a Hessenberg reduction) ndarray WORK guards UNDER-advertise on the blocked path: accept `max(1,N)`/`max(1,M)` but the blocked dormqr/zunmqr they delegate to consumes `nw*NB+(NB+1)*NB` → silent NaN in C

- **What**: The `dormhr` and `zunmhr` ndarray wrappers each had a bare WORK guard
  `minWork = (side==='left') ? max(1,N) : max(1,M)` — the UNBLOCKED minimum, with
  NO `nh>NB` blocked branch. But both delegate (`dormhr/base.js` → `dormqr/base.js`,
  `zunmhr/base.js` → `zunmqr/base.js`) with `K = nh = ihi-ilo` reflectors and the
  SAME `WORK`/`offsetWork` forwarded straight through. `dormqr`/`zunmqr` store the
  block reflector `T` in a SEPARATE trailing WORK segment, so on the BLOCKED path
  (nh > NB=32) they consume `nw*NB + (NB+1)*NB` elements (nw = N for side='left',
  M for 'right'). The `*ormhr` wrappers therefore ACCEPTED a WORK buffer far too
  small for a blocked call; dlarft/dlarfb (zlarft/zlarfb) then write/read the `T`
  region past the buffer (silently dropped by the typed array, read back as
  `undefined`) → **NaN in the output C**. No throw — a silent non-finite result.
  UNLIKE the `dormqr`/`zunmqr` and `dgehrd` entries below (where only the REAL
  wrapper lagged an already-correct complex sibling), here BOTH the real `dormhr`
  and complex `zunmhr` guards were bare `max(1,·)` — the apply-Q wrappers one level
  up from the QR appliers never got the blocked branch their own delegate carries.
- **Repro**: `lib/lapack/base/dormhr/test/test.validate.js` (and `zunmhr`) Step 4c
  (`assertWorkspaceSufficient`), `side='left'`, M=48, N=40, ilo=1, ihi=48 (nq=M=48,
  nh=47 > NB=32 → blocked), seed `seedFor(48,40,'left')`. The wrapper's advertised
  minimum probes to WORK length **40** (= max(1,N)); running the blocked apply at
  exactly 40 with a poisoned buffer yields a non-finite `C[·]` at flattened
  component 1 (dormhr) / 2 (zunmhr) — it actually needs `40*32 + 33*32 = 2336`.
  side='right' M=40 N=48 (nq=N=48) is the symmetric M-side case. The unblocked
  fallback (`dorm2r`/`zunm2r`, nh ≤ NB) genuinely needs only nw and is unaffected.
- **Root cause**: `lib/lapack/base/{dormhr,zunmhr}/lib/ndarray.js` copied the
  reference LAPACK unblocked LWORK lower bound (`max(1,N)`/`max(1,M)`) as their
  guard, but our JS hardcodes NB and does NOT adapt the block size down when WORK
  is small (the reference shrinks NB to fit LWORK; we do not). So the reference's
  minimum is not a safe minimum for our non-adaptive blocked delegate.
- **Fix (APPLIED)**: rewrote the WORK check in both wrappers to mirror
  `dormqr`/`zunmqr` with `K = nh = ihi-ilo`: `nb=32; nw = left?max(1,N):max(1,M);
  minWork = (nb>=nh)?nw:(nw*nb+(nb+1)*nb)`, guarded by `M>0 && N>0 && nh>0` (the
  degenerate cases quick-return in base and touch no workspace — this also aligns
  `dormhr`, which had checked WORK unconditionally, with `zunmhr`'s existing
  `M>0 && N>0 && (ihi-ilo)!==0` gate). Step 4c now passes at the (correctly larger)
  advertised minimum for both sides — 2336 (left) / 2336 (right) at M=48/N=40 — and
  the apply still matches the explicit-Q (dorghr/zunghr) oracle there. The
  companion FORMERS `dorghr`/`zunghr` were CORRECT already (they advertise `nh*NB`,
  matching the `dorgqr`/`zungqr` they call — no `(NB+1)*NB` trailing T because the
  former writes T inside the same N-lead region).
- **SECOND instance in the SAME routines — the convenience wrapper's AUTO-ALLOCATOR
  (`{dormhr,zunmhr}/lib/dormhr.js`/`zunmhr.js`, WORK=null path)**: it allocated the
  UNBLOCKED size too — `dormhr.js` a flat `WORK = new Float64Array(max(1,N))` (not
  even side-aware: wrong for side='right', which needs M), `zunmhr.js` a side-aware
  but still unblocked `(side==='left')?max(1,N):max(1,M)`. So a caller of the MAIN
  entry point with WORK=null on a blocked problem got a silently under-sized buffer
  and **all-NaN C** — verified directly: main `dormhr('right',…,M=40,N=48,ilo=1,
  ihi=48,…,WORK=null)` (nq=48, nh=47>NB) returned **1880 NaN** (the entire 40×48 C).
  Fixed both auto-allocators to mirror the ndarray guard: `nb=32; nh=ihi-ilo;
  nw=left?max(1,N):max(1,M); size = (nb>=nh)?nw:(nw*nb+(nb+1)*nb)`. After the fix
  the WORK=null main-wrapper output is bit-exact to the generous-WORK ndarray call
  (0 NaN, maxdiff 0). The FORMER convenience wrappers `dorghr.js`/`zunghr.js`
  already auto-allocated `max(1,ihi-ilo)*NB = nh*NB` — correct.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard
  for a non-adaptive blocked delegate that consumes more; the apply-Q wrappers
  lagged their own already-correct `*ormqr` delegate).
- **Generalization**: this closes the `dorghr`/`zunghr`/`dormhr`/`zunmhr` item the
  dgehrd entry below named to audit — the FORMERS were fine, the APPLIERS were not.
  The tell is unchanged: a bare `max(1,N)`/`max(1,M)` guard with no `nh>NB` (or
  `K>NB`) branch while the routine forwards WORK to a blocked `*ormqr`/`*ormlq`/…
  that stores a trailing `T` block. Any OTHER `*ormXX`/`*unmXX` apply-Q wrapper
  that delegates to a blocked `*ormqr`/`*unmqr` (or `*ormlq`/`*ormql`/`*ormrq`)
  should be diffed against its delegate's guard. Still un-audited apply-Q wrappers
  built on these delegates: `dormtr`/`zunmtr` (apply Q from a tridiagonal
  reduction, delegates to `*ormql`/`*ormqr`) and `dormbr`/`zunmbr` (bidiagonal).
  Step 4c (poisoned buffer at the throw boundary on the blocked path) is the
  high-signal probe; property/layout tests miss it because they over-size WORK.

---

## 2026-07-18 — dorgtr/zungtr (form Q) AND dormtr/zunmtr (apply Q) — the tridiagonal-reduction Q wrappers — ALL FOUR under-advertise WORK on the blocked path: accept the unblocked `max(1,N-1)` / `max(1,N|M)` but forward the caller WORK to a NON-adaptive blocked sub-kernel that consumes far more → silent NaN in Q / C

- **What**: The four `*sytrd`/`*hetrd`-Q wrappers each carried the reference LAPACK
  UNBLOCKED LWORK lower bound as a hard guard, with NO blocked branch, while
  forwarding the caller's WORK straight into a hardcoded-NB, NON-adaptive blocked
  sub-kernel:
  - `dorgtr`/`zungtr` (form the N×N Q): guard `max(1, N-1)`, but shift the
    reflectors one column and call the BLOCKED `dorgql`/`dorgqr` (upper) or
    `dorgqr`/`zungqr` (lower) on the (N-1)×(N-1) submatrix, which store the
    block-reflector T (leading dim N-1) + dlarfb scratch in WORK and need
    `(N-1)*NB` (NB=32) once `N-1 > NB`.
  - `dormtr`/`zunmtr` (apply Q to C): guard `max(1,N)` (left) / `max(1,M)` (right),
    but call the BLOCKED `dormql`/`dormqr` (`zunmql`/`zunmqr`) on the (NQ-1)
    reflectors, which store the block reflector T in a trailing WORK segment and
    need `nw*NB + (NB+1)*NB` (nw = N for left, M for right) once `NQ-1 > NB`
    (NQ = M for left, N for right).
  Because the sub-kernels hardcode NB and do NOT adapt it down to fit a small
  LWORK (the reference shrinks NB; our JS does not), the wrappers ACCEPTED a WORK
  buffer far too small for a blocked call. dlarft/dlarfb then write/read the T
  region past the buffer (silently dropped by the typed array, read back as
  `undefined`) → **NaN in the output Q / C**. No throw — a silent non-finite
  result. Unlike the `dormqr`/`dgerqf`/`dgehrd` entries below (where only the REAL
  wrapper lagged an already-correct complex sibling), here BOTH the real and complex
  wrappers of each pair were wrong.
- **Repro** (all Step 4c, `assertWorkspaceSufficient`, poisoned buffer at the throw
  boundary on the BLOCKED path):
  - `dorgtr`/`zungtr` `test.validate.js`, `uplo='upper'`, N=64 (N-1=63 > NB), seed
    `0xB10C`. Advertised minimum probes to WORK length **63**; running at 63 with a
    poisoned buffer yields a non-finite Q[0,0] (it actually needs `63*32 = 2016`).
  - `dormtr`/`zunmtr` `test.validate.js`, `side='left'`, M=80, N=50, uplo='lower'
    (NQ=80, NQ-1=79 > NB), seed `seedFor(80,50,'left')+3`. Advertised minimum probes
    to WORK length **50**; running at 50 with a poisoned buffer yields a non-finite
    C (it needs `50*32 + 33*32 = 2656`).
  The property (reconstruct/orthonormal for form-Q; explicit-Q `dorgtr`/`zungtr`
  cross-oracle for apply-Q) and the col/row layout-invariance sweeps all PASS at
  every uplo/side/trans/size — they over-size WORK, so only Step 4c sees this.
- **Root cause**: `convention` — the guard copied the reference unblocked LWORK
  lower bound (`max(1,N-1)` / `max(1,N|M)`) and was never given a `>NB` blocked
  branch, though each wrapper's own sub-kernel documents the larger blocked need.
- **Fix (APPLIED)**: add the blocked branch to each of the four `ndarray.js`
  guards (`NB=32`):
  - `dorgtr`/`zungtr`: `minWork = (N-1 > NB) ? (N-1)*NB : max(1, N-1)`.
  - `dormtr`/`zunmtr`: `nw = left?max(1,N):max(1,M); nq = left?M:N;
    minWork = (nq-1 > NB) ? (nw*NB + (NB+1)*NB) : nw`.
  Step 4c now passes at the (correctly larger) advertised minimum for both
  uplo/side, and orthonormality (form-Q) / the explicit-Q oracle match (apply-Q)
  still hold there.
- **Bug class**: `convention` (workspace-size boundary; unblocked LWORK lower bound
  used as a hard guard for a non-adaptive blocked sub-kernel that consumes more).
- **Generalization**: this CLOSES the `dorgtr`/`zungtr` and `dormtr`/`zunmtr` items
  named on the `dorgrq`/`zungrq`, `dorglq`/`zunglq`, `dormqr` and `dgehrd` audit
  lists — the entire tridiagonal-reduction Q family (form + apply, real + complex)
  is now guarded. Note these are wrappers that DELEGATE to already-correct blocked
  sub-kernels (`dorgqr`/`dorgql`/`dormqr`/`dormql` + z), so the fix is purely the
  WORK guard formula — the arithmetic was correct. Still-open siblings of this
  "reduction-Q wrapper" shape to re-verify: `dorghr`/`zunghr` (form Q from a
  Hessenberg reduction) and `dormhr`/`zunmhr` (apply it), plus `dorgbr`/`dormbr`
  and their z-siblings (bidiagonal-reduction Q). The high-signal probe remains Step
  4c: derive the wrapper's throw boundary, run the BLOCKED path at that exact length
  with a poisoned buffer, require finite output.

---

## 2026-07-18 — dgehrd (REAL blocked Hessenberg reduction) ndarray WORK guard UNDER-advertises on the blocked path: accepts `max(1,N)` but the blocked path consumes `N*NB + LDT*NB` → silent NaN in the factored A

- **What**: The `dgehrd` ndarray wrapper's WORK-length guard was a bare
  `minWork = Math.max( 1, N )` — the UNBLOCKED (`dgehd2`) minimum, with NO blocked
  branch. But `dgehrd/lib/base.js` (matching reference `DGEHRD`) partitions WORK on
  the BLOCKED path (NH = ihi-ilo+1 > NB=32, and the loop bound `ihi-1-NX >= ilo`
  actually reached) into the N-by-NB panel scratch `Y` (`LDWORK=N`, so `N*NB`
  elements from `offsetWork`) followed by the block reflector `T` at
  `offsetWork + IWT` (`IWT = N*NB`) with leading dim `LDT = NBMAX+1 = 65` and up to
  NB columns (`LDT*NB`). So the blocked path needs `N*NB + LDT*NB = N*32 + 65*32`
  elements. The wrapper therefore ACCEPTED a WORK buffer far too small for a blocked
  call; `dlahr2`/`dlarfb` then write/read the `T` region past the buffer (silently
  dropped by the typed array, read back as `undefined`) → **NaN in the factored A**.
  No throw — a silent non-finite result. The COMPLEX sibling `zgehrd` ALREADY had
  the CORRECT guard (`need = (NB < NH) ? (N*NB + 65*NB) : N` under `if (NH > 1)`),
  so only the real `dgehrd` wrapper was wrong — the exact real-lags-complex
  asymmetry seen in the `dormqr`/`zunmqr`, `dgerqf`/`zgerqf`, `dormql`, `dormrq`
  entries below.
- **Repro**: `lib/lapack/base/dgehrd/test/test.validate.js` Step 4c
  (`assertWorkspaceSufficient`), N=64, ilo=1, ihi=64 (NH=64 > NB=32 → blocked; the
  block loop runs at i=1 since `ihi-1-NX = 64-1-32 = 31 >= 1`), seed `0xB10C + 64`.
  The wrapper's advertised minimum probes to WORK length **64** (= max(1,N));
  running the blocked reduction at exactly 64 with a poisoned buffer yields a
  non-finite value at flattened component **64** (= A[0,1], col-major) — it actually
  needs `64*32 + 65*32 = 4128`. The unblocked `dgehd2` remainder (N ≤ NB, or the
  sub-threshold N=33 where the block loop body never executes) genuinely needs only
  N and is unaffected.
- **Root cause**: `lib/lapack/base/dgehrd/lib/ndarray.js` copied the reference
  LAPACK unblocked LWORK lower bound (`max(1,N)`) as its guard, but our JS hardcodes
  NB and does NOT adapt the block size down when WORK is small (the reference
  shrinks NB to fit LWORK; we do not). So the reference's minimum is not a safe
  minimum for our non-adaptive blocked path.
- **Fix (APPLIED)**: rewrote the WORK check in `dgehrd/lib/ndarray.js` to mirror
  `zgehrd`: compute `NH = ihi - ilo + 1; if (NH > 1) { NB = 32; need = (NB < NH) ?
  (N*NB + 65*NB) : N; ... }`. Step 4c now passes at the (correctly larger)
  advertised minimum (4128 at N=64, 5280 at N=100), and reconstruction A = Q·H·Qᴴ
  still holds there.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard
  for a non-adaptive blocked kernel that consumes more; real wrapper lagged the
  already-correct complex sibling).
- **Generalization**: same tell as the `dormqr` entry — a wrapper whose WORK guard
  is a bare `max(1,N)`/`max(1,M)` with no blocked branch while its base.js documents
  a larger blocked requirement (here a trailing `T` block at `LDT=65`). Step 4c is
  the high-signal probe; the property/layout tests miss it because they over-size
  WORK. When a complex sibling already carries the correct guard, DIFF the two
  wrappers first. Remaining reduction routines to audit for the same class:
  `dsytrd`/`zhetrd` (tridiagonal reduction), `dgebrd`/`zgebrd` (bidiagonal
  reduction), `dorghr`/`zunghr` (form Q from a Hessenberg reduction) — check
  whether their real wrapper's WORK guard has a blocked branch or a bare `max(1,·)`.

---

## 2026-07-18 — dormql (REAL blocked apply-Q, QL) ndarray WORK guard UNDER-advertises on the blocked path: accepts `max(1,N)`/`max(1,M)` but the blocked path consumes `nw*NB+(NB+1)*NB` → silent NaN in C

- **What**: The `dormql` ndarray wrapper's WORK-length guard was a bare
  `minWork = (side==='left') ? max(1,N) : max(1,M)` — the UNBLOCKED minimum, with
  NO `K>NB` blocked branch. But `dormql/lib/base.js` (and its own JSDoc) partitions
  WORK into two contiguous segments on the BLOCKED path (K>NB=32): the first
  `ldwork*nb = nw*32` elements are dlarfb's scratch and the remaining `(nb+1)*nb =
  33*32` hold the block reflector T (`offsetT = offsetWork + nw*nb`). So on the
  blocked path it needs `nw*NB + (NB+1)*NB` elements (nw = N for left, M for
  right). The wrapper therefore ACCEPTED a WORK buffer far too small for a blocked
  call; dlarft/dlarfb then write/read the T region past the buffer (silently
  dropped by the typed array, read back as `undefined`) → **NaN in the output C**.
  No throw — a silent non-finite result.
- **Repro**: `lib/lapack/base/dormql/test/test.validate.js` Step 4c
  (`assertWorkspaceSufficient`), `side='left'`, M=80, N=50, K=40 (K>NB → blocked),
  seed `seedFor(80,50,40,'left')`. The wrapper's advertised minimum probes to WORK
  length **50** (= max(1,N)); running the blocked apply at exactly 50 with a
  poisoned buffer yields `C[0,0] = NaN` (it actually needs `50*32 + 33*32 = 2656`).
  The unblocked `dorm2l` is unaffected (it genuinely needs only nw).
- **Root cause**: `lib/lapack/base/dormql/lib/ndarray.js` copied the reference
  LAPACK unblocked LWORK lower bound (`max(1,N)`/`max(1,M)`) as its guard, but our
  JS hardcodes NB and does NOT adapt the block size down when WORK is small (the
  reference shrinks NB to fit LWORK; we do not). The COMPLEX sibling `zunmql`
  ALREADY had the CORRECT guard (`if (K>32) need = nw*32 + 33*32`), so only the
  real `dormql` wrapper was wrong — the exact same real-lags-complex asymmetry seen
  in the `dormqr`/`zunmqr` and `dgerqf`/`zgerqf` entries below.
- **Fix (APPLIED)**: rewrote the WORK check in `dormql/lib/ndarray.js` to compute
  `minWork = left ? max(1,N) : max(1,M); if (K>32) minWork = minWork*32 + 33*32;`
  under the `M/N/K>0` guard, matching `zunmql`. Step 4c now passes at the
  (correctly larger) advertised minimum for both sides, and the apply still matches
  the explicit-Q (dorgql) oracle there.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard
  for a non-adaptive blocked kernel that consumes more; real wrapper lagged the
  already-correct complex sibling).
- **Generalization**: this is the QL entry on the exact predicted list from the
  `dormqr` learning below ("the `*orm*/*unm*` family … `dormql`… blocked
  variants"). `dorm2l`/`zunm2l` (unblocked) and `zunmql` (complex, already fixed)
  are correct. Still un-audited from that list: `dormlq`/`dormrq`/`dormr2`-blocked
  wrappers, and the `*org*/*ung*` generators. The high-signal probe remains Step 4c:
  derive the wrapper's throw boundary, run the BLOCKED path at that exact length
  with a poisoned buffer, require finite output. A bare `max(1,N)`/`max(1,M)` guard
  with no `K>NB` branch while base.js documents a trailing-T segment is the tell;
  DIFF the real wrapper against its already-correct complex sibling first.

---

## 2026-07-18 — dormrq (REAL blocked apply-Q, RQ) ndarray WORK guard UNDER-advertises on the blocked path: accepts `max(1,N)`/`max(1,M)` but the blocked path consumes `nw*NB+(NB+1)*NB` → silent NaN in C

- **What**: The `dormrq` ndarray wrapper's WORK-length guard was a bare
  `minWork = (side==='left') ? max(1,N) : max(1,M)` — the UNBLOCKED minimum, with
  NO `K>NB` blocked branch. But `dormrq/lib/base.js` (and its JSDoc) stores the
  block reflector `T` in a SEPARATE trailing WORK segment
  (`offsetT = offsetWork + ldwork*NB`, `ldwork = nw`, `T = WORK`), so on the
  BLOCKED path (K>NB=32) it needs `nw*NB + (NB+1)*NB` elements (nw = N for left, M
  for right). The wrapper therefore ACCEPTED a WORK buffer far too small for a
  blocked call; dlarft/dlarfb then write the T region past the buffer (silently
  dropped by the typed array) and read it back as `undefined` → **NaN in the
  output C**. No throw — a silent non-finite result. The COMPLEX sibling `zunmrq`
  already had a CORRECT (in fact conservative) guard
  (`need = (ldwork*NB)+((NB+1)*NB)` under `if(K>0)`), so only the real `dormrq`
  wrapper was wrong — the exact real-lags-complex asymmetry seen in the
  `dgerqf`/`zgerqf` and `dormqr`/`zunmqr` entries.
- **Repro**: `lib/lapack/base/dormrq/test/test.validate.js` Step 4c
  (`assertWorkspaceSufficient`), `side='left'`, M=80, N=50, K=40 (K>NB → blocked),
  seed `seedFor(80,50,40,'left')`. The wrapper's advertised minimum probes to WORK
  length **50** (= max(1,N)); running the blocked apply at exactly 50 with a
  poisoned buffer yields `C[0,0] = NaN` (it actually needs `50*32 + 33*32 = 2656`).
  The unblocked fallback `dormr2` (K<=NB) is unaffected (genuinely needs only nw).
- **Root cause**: `lib/lapack/base/dormrq/lib/ndarray.js` copied the reference
  LAPACK unblocked LWORK lower bound (`max(1,N)`/`max(1,M)`) as its guard, but our
  JS hardcodes NB and does NOT adapt the block size down when WORK is small (the
  reference shrinks NB to fit LWORK; we do not). So the reference's minimum is not
  a safe minimum for our non-adaptive blocked path.
- **Fix (APPLIED)**: rewrote the WORK check in `dormrq/lib/ndarray.js` to compute
  `nb=32; ldwork = left?max(1,N):max(1,M); need = (nb>=K)?ldwork:(ldwork*nb+(nb+1)*nb)`
  under `if (K>0)`, matching the `dormqr` fix. Step 4c now passes at the (correctly
  larger) advertised minimum for both sides, and the apply still matches the
  explicit-Q (dorgrq) oracle there.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard
  for a non-adaptive blocked kernel that consumes more; real wrapper lagged the
  already-correct complex sibling).
- **Generalization**: this is the RQ apply-Q half of the `dormqr` entry's own
  predicted list (it explicitly named `dormrq` among the `*orm*/*unm*` blocked
  variants to audit). The remaining blocked appliers/formers to check for the same
  bare-`max(1,N)`/`max(1,M)` guard: `dormlq`/`dormql`, and the `*org*/*ung*`
  generators (`dorgrq`/`zungrq` guards are ALSO bare `max(1,M)` while their base
  needs `M*NB` — re-verify next; here they were used only as oracles with generous
  WORK). Step 4c (poisoned buffer at the throw boundary on the blocked path) is the
  high-signal probe; the property/layout tests miss it because they over-size WORK.

---

## 2026-07-18 — dorgrq AND zungrq (BOTH real and complex blocked RQ Q-formation) WORK guards advertised `max(1,M)` but the blocked path needs `M*NB` → poisoned WORK of the advertised length leaked NaN into Q

- **What**: The `dorgrq` and `zungrq` ndarray wrappers each had the workspace guard
  `var minWork = Math.max( 1, M );` — but their OWN JSDoc says "WORK must have
  length >= M*NB (NB=32)", and the blocked path (`dlarft`/`dlarfb`) stores the
  `ib×ib` block-reflector T factor with leading dimension `LDWORK = M` and reuses
  the same buffer at offset `ib` for the `dlarfb` scratch, consuming up to `M*NB`
  elements (matching reference `DORGRQ`'s `IWS = LDWORK*NB`). So both wrappers
  ADVERTISED a sufficient minimum of `M` while actually reading up to `M*NB`. A
  caller who sized WORK to the advertised `M` got out-of-bounds reads →
  `undefined`/lost writes → NaN in Q. As with the `dorglq`/`zunglq` LQ sibling
  (2026-07-17 entry below), BOTH the real and complex wrappers copied the unblocked
  `max(1,M)` formula (this pair was explicitly on that entry's audit list).
- **Repro**: `lib/lapack/base/dorgrq/test/test.validate.js` (and `zungrq`) Step 4c
  `assertWorkspaceSufficient`, `schemes.dense`, `M=N=80`, `K=80 > NB=32` (blocked),
  seed `0x100 + M*100 + N`. The wrapper's advertised minimum probes to WORK length
  **80** (= max(1,M)); running the blocked former at exactly 80 with a POISONED
  buffer yields `Q[0,0] = NaN` (component 0). A direct binary-search probe over the
  poisoned buffer confirms the TRUE minimum is `≤ M*NB` in every blocked case
  (e.g. 2544 ≤ 2560 at 80×80, 2048 = 2048 at 64×80, 3196 ≤ 3200 at 100×100), so
  `M*NB` is a safe (never under-counting) advertised minimum.
- **Root cause**: `convention` / workspace under-count — the guard formula copied
  the reference LAPACK unblocked LWORK lower bound (`max(1,M)`) and was never
  updated for the blocked T-factor + scratch storage; our JS hardcodes NB and does
  NOT adapt the block size down when WORK is small (the reference shrinks NB to fit
  LWORK; we do not).
- **Fix (APPLIED)**: mirror `dorglq`/`dgelqf` in both wrappers:
  `var NB = 32; var minWork = ( K > NB ) ? Math.max( 1, M*NB ) : Math.max( 1, M );`
  (row-wise `M*NB`, no separate `NB*NB` block — `dlarft` writes T inside the same
  `M`-lead WORK region, so `M*NB` is exact; distinct from the FACTORIZATION
  `dgerqf`/`zgerqf`, which store T in a SEPARATE trailing segment and need
  `M*NB + NB*NB`). Step 4c now passes at the corrected advertised minimum for both
  routines, with orthonormality + reconstruction still holding there.
- **Bug class**: `convention` (workspace-size boundary).
- **Generalization**: this closes the `dorgrq`/`zungrq` item on the 2026-07-17
  `dorglq`/`zunglq` audit list. The `org`/`ung` Q-formation formers mirror their
  `ge*f` factorizations' WORK but WITHOUT the extra `NB*NB`: `*orglq`/`*unglq` and
  `*orgrq`/`*ungrq` need `M*NB` (row-wise); `*orgqr`/`*ungqr` need `N*NB`
  (column-wise). Still-unaudited blocked formers from that list: `dorgql`/`zungql`,
  `dorgtr`/`zungtr`. The property/layout tests miss this (they over-size WORK);
  only the Step-4c poisoned-minimum probe catches it. The unblocked siblings
  (`dorgr2`/`zungr2`) genuinely need only `max(1,M)` and are correct.

---

## 2026-07-18 — dgerqf (REAL blocked RQ) ndarray WORK guard UNDER-advertises on the blocked path: accepts `max(1,M)` but the blocked path consumes `M*NB+NB*NB` → silent NaN in the factored A

- **What**: The `dgerqf` ndarray wrapper's WORK guard was a bare
  `minWork = max(1,M)` (the UNBLOCKED minimum), with NO `K>NB` blocked branch. But
  `dgerqf/lib/base.js` (and its JSDoc) stores the block-reflector `T` factor
  INSIDE WORK, right after the `ldwork*nb = M*NB` main scratch
  (`offsetT = offsetWork + ldwork*nb`, `T = WORK`), so on the BLOCKED path
  (K = min(M,N) > NB = 32) it needs `M*NB + NB*NB` elements. The wrapper therefore
  ACCEPTED a WORK buffer far too small for a blocked call; dlarft then writes the
  T region past the buffer (silently dropped by the typed array) and dlarfb reads
  it back as `undefined` → **NaN in the factored A**. No throw — a silent
  non-finite result.
- **Repro**: `lib/lapack/base/dgerqf/test/test.validate.js` Step 4c
  (`assertWorkspaceSufficient`), M=N=80 (K=80 > NB → blocked). The wrapper's
  advertised minimum probes to WORK length **80** (= max(1,M)); running the
  blocked factorization at exactly 80 with a poisoned buffer yields `A[0,0] = NaN`
  (it actually needs `80*32 + 32*32 = 3584`).
- **Root cause**: `lib/lapack/base/dgerqf/lib/ndarray.js` copied the reference
  LAPACK unblocked LWORK lower bound (`max(1,M)`) as its guard, but our JS
  hardcodes NB and does NOT adapt the block size down when WORK is small (the
  reference shrinks NB to fit LWORK; we do not). The COMPLEX sibling `zgerqf`
  ALREADY had the CORRECT guard (`need = (K>NB) ? (M*NB + NB*NB) : max(1,M)` under
  `if (K>0)`), so only the real `dgerqf` wrapper was wrong — the exact same
  real-lags-complex asymmetry seen in the 2026-07-17 `dormqr`/`zunmqr` entry
  below. (Note the sibling `dgelqf` needs only `M*NB` because it stores `T` in a
  SEPARATE allocation; `dgerqf` differs by keeping `T` inside WORK, so its need is
  `M*NB + NB*NB`, not `M*NB`.)
- **Fix (APPLIED)**: rewrote the WORK check in `dgerqf/lib/ndarray.js` to compute
  `K = min(M,N); NB = 32; need = (K>NB) ? (M*NB + NB*NB) : max(1,M)` under
  `if (K>0)`, matching `zgerqf`. Step 4c now passes at the (correctly larger)
  advertised minimum, and reconstruction A=R*Q still holds there.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard
  for a non-adaptive blocked kernel that consumes more; real wrapper lagged the
  already-correct complex sibling).
- **Generalization**: same tell as the dormqr entry below — a wrapper whose WORK
  guard is a bare `max(1,M)`/`max(1,N)` with no `K>NB` blocked branch while its
  base.js documents a larger blocked requirement. Step 4c is the high-signal
  probe. When a complex sibling already carries the correct guard, DIFF the two
  wrappers first.

---

## 2026-07-17 — dormqr (REAL blocked apply-Q) ndarray WORK guard UNDER-advertises on the blocked path: accepts `max(1,N)` but the blocked path consumes `nw*NB+(NB+1)*NB` → silent NaN in C

- **What**: The `dormqr` ndarray wrapper's WORK-length guard is `minWork =
  (side==='left') ? max(1,N) : max(1,M)` — the UNBLOCKED minimum. But `dormqr`'s
  own base.js (and its JSDoc) stores the block reflector `T` in a SEPARATE
  trailing WORK segment `offsetT = offsetWork + nw*NB`, so on the BLOCKED path
  (K>NB=32) it actually needs `nw*NB + (NB+1)*NB` elements (nw = N for left, M for
  right). The wrapper therefore ACCEPTS a WORK buffer far too small for a blocked
  call; dlarft/dlarfb then write past the buffer (silently dropped by the typed
  array) and read the T region back as `undefined` → **NaN in the output C**. No
  throw, no error — a silent wrong (non-finite) result.
- **Repro**: `lib/lapack/base/dormqr/test/test.validate.js` Step 4c
  (`assertWorkspaceSufficient`), `side='left'`, M=80, N=50, K=40 (K>NB → blocked),
  seed `seedFor(80,50,40,'left')`. The wrapper's advertised minimum probes to
  WORK length **50** (= max(1,N)); running the blocked apply at exactly 50 with a
  poisoned buffer yields `C[0,0] = NaN` (needs 50*32 + 33*32 = 2656). The
  unblocked `dorm2r` is unaffected (it genuinely needs only nw). The COMPLEX
  sibling `zunmqr` already had the CORRECT guard (`nb>=K ? nw : nw*nb+(nb+1)*nb`),
  so only the real `dormqr` wrapper was wrong.
- **Root cause**: `lib/lapack/base/dormqr/lib/ndarray.js` copied the reference
  LAPACK unblocked LWORK lower bound (`max(1,N)`/`max(1,M)`) as its guard, but our
  JS hardcodes NB and does NOT adapt the block size down when WORK is small (the
  reference shrinks NB to fit LWORK; we do not). So the reference's minimum is not
  a safe minimum for our non-adaptive blocked path. Fix: mirror `zunmqr`'s guard —
  `need = (NB >= K) ? nw : (nw*NB + (NB+1)*NB)`, guarded by `K>0`.
- **Fix (APPLIED)**: rewrote the WORK check in `dormqr/lib/ndarray.js` to compute
  `nb=32; nw = left?max(1,N):max(1,M); need = (nb>=K)?nw:(nw*nb+(nb+1)*nb)` under
  `if (K>0)`, matching `zunmqr`. Step 4c now passes at the (correctly larger)
  advertised minimum for both sides, and the apply still matches the explicit-Q
  oracle there.
- **Bug class**: `convention` (copied reference LWORK lower bound as a hard guard
  for a non-adaptive blocked kernel that consumes more).
- **Generalization**: audit EVERY blocked apply-Q / generate-Q / factorization
  wrapper that stores a block reflector `T` (or other scratch) in a trailing WORK
  segment for the same "advertised min = reference unblocked min" mistake — the
  `*orm*/*unm*` family (`dormlq`/`dormql`/`dormrq`/`dorm2l`… blocked variants),
  `*org*/*ung*` generators, and any `*trf` using dlarfb. The high-signal probe is
  exactly Step 4c: derive the wrapper's throw boundary, then run the BLOCKED path
  at that exact length with a poisoned buffer and require finite output. A wrapper
  whose guard is a bare `max(1,N)`/`max(1,M)` (no `K>NB` blocked branch) while its
  base.js documents a `nw*NB + (NB+1)*NB`-style requirement is the tell. Note
  `zungqr`/`dorgqr` guards are ALSO bare `max(1,N)` while their base needs `N*NB`
  — re-verify those next (they were only used here as oracles with generous WORK).

---

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

## 2026-07-17 — dorglq AND zunglq (BOTH real and complex blocked LQ Q-formation) WORK guards advertised `max(1,M)` but the blocked path needs `M*NB` → poisoned WORK of the advertised length leaked NaN into Q

- **What**: The `dorglq` and `zunglq` ndarray wrappers each had the workspace guard
  `var minWork = Math.max( 1, M );` — but their OWN JSDoc says "WORK must have
  length >= M*NB (NB=32)", and the blocked path (`dlarft`/`dlarfb`) stores the
  `ib×ib` block-reflector T factor with leading dimension `LDWORK = M` and reuses
  the same buffer at offset `ib` for `dlarfb` scratch, consuming up to `M*NB`
  elements (matching reference `DORGLQ`'s `IWS = LDWORK*NB`). So both wrappers
  ADVERTISED a sufficient minimum of `M` while actually reading `M*NB`. A caller
  who sized WORK to the advertised `M` got out-of-bounds reads → `undefined`/lost
  writes → NaN in Q. Unlike the QR sibling family (where only the COMPLEX `zungqr`
  wrapper was wrong and real `dorgqr` was correct), here BOTH the real `dorglq`
  and complex `zunglq` wrappers copied the unblocked `max(1,M)` formula.
- **Repro**: `dorglq`/`zunglq` validation harness (`test.validate.js`), Step 4c
  workspace probe, `schemes.dense`, `M=N=80`, `K=80 > NB=32` (blocked), seed
  `0x100 + M*100 + N`. `assertWorkspaceSufficient` found the smallest accepted WORK
  length = 80 (= M), ran a POISONED buffer of exactly 80, and Q came back with a
  NaN at component 32 (= column 32, the first block seam past the advertised
  workspace). Deterministic — purely the guard boundary, not data-dependent.
- **Root cause**: `convention` / workspace under-count — the guard formula was
  never updated for the blocked T-factor + scratch storage. Fix: mirror `dgelqf`:
  `var NB = 32; var minWork = ( K > NB ) ? Math.max( 1, M*NB ) : Math.max( 1, M );`
  (row-wise `M*NB`, no separate `NB*NB` block — `dlarft` writes T inside the same
  `M`-lead WORK region, so `M*NB` is exact; confirmed by re-running the poisoned
  probe at the new boundary).
- **Bug class**: `convention` (workspace-size boundary).
- **Generalization**: this is the LQ half of the `zungqr` learning's own predicted
  list. The `org`/`ung` Q-formation formers mirror their `ge*f` factorizations'
  WORK: `*orglq`/`*unglq` need `M*NB`, `*orgqr`/`*ungqr` need `N*NB`. Audit the
  remaining blocked formers (`dorgql`/`zungql`, `dorgrq`/`zungrq`, `dorgtr`/
  `zungtr`) and every `orm`/`unm` reflector-applier (`dormlq`/`zunmlq`,
  `dormqr`/`zunmqr`, side-dependent `M*NB`/`N*NB`) for a bare `max(1,M/N)` guard
  where the blocked path stores T in WORK. The property/layout tests miss this
  because they over-size WORK; only the Step-4c poisoned-minimum probe catches it.

---

## 2026-07-17 — zungqr (COMPLEX blocked QR Q-formation) WORK guard advertised `max(1,N)` but the blocked path needs `N*NB` → poisoned WORK of the advertised length leaked NaN into Q

- **What**: The `zungqr` ndarray wrapper's workspace guard was
  `var minWork = Math.max( 1, N );` — but its OWN JSDoc says "WORK must have
  length >= N*NB (NB=32)" and the blocked path (`zlarft`/`zlarfb`) stores the
  `NB×NB` block-reflector T factor (leading dim `N`) plus `zlarfb` scratch in
  WORK, consuming up to `N*NB` complex elements. So the wrapper ADVERTISED a
  sufficient minimum of `N` while actually reading `N*NB`. A caller who sized WORK
  to the advertised `N` got out-of-bounds reads → `undefined` → NaN in Q. The
  real (`dorgqr`) sibling had the correct guard
  `( K > NB ) ? Math.max( 1, N*NB ) : Math.max( 1, N )`; only the complex wrapper
  copied the unblocked `max(1,N)` formula.
- **Repro**: `zungqr` validation harness (`test.validate.js`), Step 4c workspace
  probe, scalar `complex`, `schemes.dense`, `M=N=80`, `K=80 > NB=32` (blocked).
  `assertWorkspaceSufficient` found the smallest accepted WORK length = 80, ran a
  POISONED buffer of exactly 80, and Q component 5120 (= complex element 2560 =
  `N*NB`, column 32 row 0) came back NaN. Deterministic (seed `0xB10C`); no RNG
  dependence — purely the guard boundary.
- **Root cause**: `convention` / workspace under-count — the guard formula was not
  updated for the blocked T-factor + scratch storage. Fix: mirror `dorgqr`:
  `var NB = 32; var minWork = ( K > NB ) ? Math.max( 1, N*NB ) : Math.max( 1, N );`.
- **Bug class**: `convention` (workspace-size boundary).
- **Generalization**: check EVERY blocked z-routine whose WORK stores a block
  reflector T or panel scratch and whose wrapper guard might have been copied from
  the unblocked `max(1,N)` formula — `zunglq`/`zunglq`-family, `zunmqr`/`zunmlq`
  (side-dependent `N*NB`/`M*NB`), `zgeqrf`/`zgelqf` (need `N*NB + NB*NB`), and any
  `z*` wrapper whose real `d*` sibling has a `( K > NB ) ? … : …` guard while the
  `z*` one has a bare `Math.max(1,N)`. The property/layout tests miss this because
  they over-size WORK; only the Step-4c poisoned-minimum probe catches it.

---

## 2026-07-17 — zgtts2 / zgttrs (COMPLEX tridiagonal solve) addressed the `B` operand in Float64-element units while every other complex operand used complex-element units → WRONG results for any caller passing the standard element-unit `B` strides

- **What**: `zgtts2` (and its wrapper `zgttrs`) reinterpret all complex operands
  to a Float64 view. DL/D/DU/DU2 were correctly scaled to complex-element units
  (`sdl = strideDL * 2`, `idl = offsetDL * 2`, …), but `B` was left in raw
  Float64 units (`sb1 = strideB1; sb2 = strideB2;` and `ib = offsetB + …`). So
  the routine's own JSDoc contradicted the library convention: it demanded `B`
  strides in "Float64 elements" while all sibling z-routines (`zgtsv`, `zgbtrs`,
  …) take complex-element strides for ALL operands. A caller passing standard
  element-unit `B` (contiguous column → `strideB1 = 1`) got half-element
  addressing: overlapping/garbage reads, and NaN once `i*strideB1` ran off the
  end of the buffer.
- **Repro**: `zgttrs`/`zgttrf` property harness (`test.validate.js`), scalar
  `complex`, storage `schemes.dense`, RESIDUAL property `op(A)*X = B`, any
  `trans`, `N ≥ 2`, `nrhs ≥ 1`. The dense scheme emits element-unit `B` args; the
  residual blew up (the validate tests had a `× sc.floatsPerElem` workaround
  bolted on just to feed the routine Float64-unit `B` strides — itself a red
  flag). Also reproduced directly: contiguous complex `B` with `strideB1 = 1`
  reads `B[0,0]`'s imaginary part as `B[1,0]`'s real part.
- **Root cause**: `convention` / `storage-mapping` — `B` base pointer and strides
  were never multiplied by 2 to convert complex-element units to the Float64
  view's real-component units. Fix: `sb1 = strideB1 * 2; sb2 = strideB2 * 2;` and
  every `ib = ( offsetB * 2 ) + …`; DL/D/DU/DU2 untouched. `zgttrs` forwards `B`
  strides straight through, so only JSDoc changed there. Three callers that had
  been pre-scaling `B`/`WORK` strides by 2 to match the OLD bug were de-scaled to
  pass element units: `zgtcon` (`sw*2, N*sw*2, offsetWork*2` → `sw, N*sw,
  offsetWork`), `zgtrfs` (`sw, N*sw, oW` → `strideWork, N*strideWork,
  offsetWork`, plus 5 direct test-setup `zgttrs` calls). `zgtsvx` already passed
  element-unit `X` strides — it had a latent wrong initial solve that iterative
  refinement in `zgtrfs` silently converged away, so its tests passed before AND
  after; now the initial solve is also correct.
- **Bug class**: `convention` / `storage-mapping`.
- **Generalization**: audit ANY complex routine whose JSDoc describes a complex
  operand's stride/offset as being in "Float64 elements" — that phrasing is the
  tell for this exact class. Grep: `grep -rn "Float64 elements" lib/**/lib/*.js`.
  Also suspect any caller that multiplies a complex operand's stride/offset by 2
  (or `floatsPerElem`) before handing it to another complex routine, and any
  validate/fixture test carrying a `× floatsPerElem` workaround on one operand
  but not the others.

---

## 2026-07-17 — zlatps (COMPLEX packed triangular solve) IGNORES `strideAP` in its base packed pointers → WRONG rcond / garbage for any strideAP ≠ 1; surfaced by ztpcon packed layout-invariance

- **What**: `ztpcon` (complex packed triangular condition estimator) passes its
  correctness PROPERTY and is bit-exact across stride-1 offset changes, but its
  packed layout-invariance sweep DIVERGES badly the moment the packed stride is
  non-unit or negative: `ztpcon one-norm upper non-unit layout variant 2`
  (`{stride:2}`) gives rcond `0.4439890764168357` vs `0.33182199866551526` at
  stride 1 — a ~34% error, and `{stride:3,-1,-2}` collapse rcond to **0**. Not a
  ~1 ULP reorder: a real wrong-answer. The REAL sibling `dtpcon` is bit-exact
  across ALL packed layouts (strides 1/2/3/−1/−2), so only the complex path is
  broken.
- **Repro**: `sc=complex`, `schemes.packed`, `uplo='upper'`, `diag='non-unit'`,
  `norm='one-norm'`, N=9, seed `0x100+N`. Isolation: `zlantp` returns the correct
  norm at EVERY stride (so the norm dep is fine); the corruption is in the SOLVE.
  Driving `zlatps` directly (`_probe`: same upper non-unit triangular, N=6, seed
  42, RHS ones) — `{stride:1}` and `{stride:2}` agree (both take the ztpsv FAST
  path, which handles strides), but `{stride:-1}` returns garbage `x=[1,0,0,0,0,0]`
  with `scale=0` (the grow-estimate picked the CAREFUL path off a mis-indexed
  diagonal, then the careful solve mis-indexed too). In `ztpcon` the alternating
  dlacn2 RHS drives more calls onto the careful/CNORM path, so stride 2 already
  diverges there.
- **Root cause** (`lib/lapack/base/zlatps/lib/base.js`): `ip` is carried as a
  **Float64 pointer** initialized `ip = ( offsetAP + packedLinearIndex ) * 2` (lines
  ~260, 267, 316, 367, 416, 551, 674) and walked by `ip ± jlen*sap` where
  `sap = strideAP*2`. The WALK includes the stride, but the BASE omits it: the
  physical Float64 address of packed slot `p` is `(offsetAP + p*strideAP)*2`, yet
  the code uses `(offsetAP + p)*2`. Every derived access inherits the error — the
  CNORM `dzasum` bases `offsetAP + (j*(j+1))/2` / `offsetAP + ip/sap + 1` (lines
  262, 269), the `zaxpy`/`zdotc` start offsets `(ip/2) - j` and `(ip/2) + 1` (lines
  446, 451, 530, 535 and `computeTransposeSum` 123/128/134/139), and the diagonal
  reads `cabs1(av, ip)` — all assume `strideAP == 1`. With stride 1 the two
  coincide, so every unit-stride fixture and the stride-1 property pass. The REAL
  `dlatps` does it correctly: `ip` stays a PURE 0-based packed index (`ip += (j+1)`,
  `ip -= (j+1)`) and EVERY access scales — `offsetAP + (ip*sa)`,
  `offsetAP + ((ip-j)*sa)`, `offsetAP + ((ip+1)*sa)` (dlatps lines 129/136/181/265/
  286/295/399/401/405/409).
- **Fix (APPLIED)**: rewrote the addressing in `lib/lapack/base/zlatps/lib/base.js`
  to the `dlatps` index-then-scale pattern. The five diagonal `ip` base inits
  `( offsetAP + (jfirst*(jfirst+1)/2 + jfirst) ) * 2` now scale the packed linear
  index by `strideAP`: `( offsetAP + ((jfirst*(jfirst+1)/2 + jfirst) * strideAP) )
  * 2` (the `ip ± jlen*sap` walks, `sap = strideAP*2`, were already stride-aware,
  so a correct base makes every relative `av[ip ± k*sap]` read correct). The two
  CNORM loops now carry a PURE packed index and address as
  `offsetAP + idx*strideAP` (upper: `dzasum(j, AP, strideAP, offsetAP + ip*strideAP)`;
  lower: `... offsetAP + (ip+1)*strideAP`). The derived `zaxpy`/`zdotc`/`zdotu`
  start offsets became `(ip/2) - j*strideAP` and `(ip/2) + strideAP` (from `-j` /
  `+1`) at all 8 sites (4 in `computeTransposeSum`, 4 in the no-transpose careful
  solve). VERIFIED: driving `zlatps` directly across the full packed layout sweep
  (strides 1/2/3/−1/−2 + offset/pad) for every uplo × trans × diag now reproduces
  the stride-1 solution BIT-EXACTLY (max deviation 0.0), no non-finite. `ztpcon`
  correctness + full-`schemes.packed.layouts()` bit-exact layout-invariance now
  pass; `dtpcon` (real, unaffected) unchanged. Other `zlatps` callers should be
  re-run — see generalization. **CORRECTION 2026-11-18**: the negative-stride
  part of this holds only on the fast path. On the careful path with
  `normin='no'`, a negative stride still yields zero CNORM because `dzasum`
  returns 0 for a non-positive stride (tickets/0044).
- **Bug class**: `storage-mapping` (packed-index-vs-strided-offset conflation) —
  the SAME defect as the zpptri entry below, in a different complex packed routine.
- **Generalization**: audit every complex packed routine that carries a Float64
  `ip`-pointer of the form `(offsetAP + linear)*2` (rather than a pure index scaled
  at access): the whole `zlatps`/`ztpcon`/`ztbcon`-adjacent family, `zlatrs`'s
  packed cousins, and any `ztpmv`/`ztpsv`/`zhpr`/`zspr` caller that precomputes a
  running packed base. The real (`d`) siblings, validated against strided packed
  layouts, are the correct template. The high-signal probe is exactly this: run the
  routine at packed stride ∈ {2,3,−1,−2} and compare to stride 1 — unit-stride
  fixtures never see it.

---

## 2026-07-17 — zhptrf UPPER path produces a WRONG Hermitian packed factorization (lower path is correct); surfaced while validating zhptri

- **What**: Validating `zhptri` (inverse from a packed Hermitian Bunch-Kaufman
  factor) via the natural pipeline `zhptrf` → `zhptri`, the reconstruction
  `A0·inv(A0)=I` FAILED LOUDLY for **uplo='upper'** at every size — e.g.
  `zhptri upper n=3: relative error 4.477e-1 exceeds tolerance 6.661e-14`
  (residual 1.4e1). Not a NaN and NOT layout-dependent: the same wrong result
  appears bit-identically across ALL packed layouts (tight, strided, negative),
  so it is an ARITHMETIC/factor error, not an addressing bug. The **lower** path
  of the very same pipeline reconstructs correctly (~1e-15) at every size. The
  defect is in **zhptrf** (the FACTOR), NOT in zhptri.
- **Repro**: `sc=complex`, `logical.hermitian`, seed `0x100+n`, `uplo='upper'`,
  any `n≥3` (n=3 is the minimal reproducer; residual grows with n: 1.4e1 @ n=3,
  4.2e1 @ n=8, 1.9e2 @ n=33). Minimal: factor A0 with `zhptrf('upper',…)`, then
  compare the packed factor against the DENSE `zhetrf('upper',…)` factor of the
  SAME A0 packed into the upper triangle — they DIFFER, with the differences being
  **complex conjugations** of off-diagonal multipliers (e.g. factor(0,2) imag
  `+0.3283` vs correct `−0.3283`; factor(1,2) imag `−0.8314` vs `+0.8314`) plus a
  downstream-corrupted leading block (diagonal D(0,0) `0.3780` vs `0.4038`).
  `zhetrf` is the trustworthy oracle here: dense `zhetri` inverts the dense factor
  to ~1e-15 (dense pipeline is validated), so the DENSE factor is correct and the
  PACKED (`zhptrf` upper) factor is wrong.
- **Root cause (FOUND & FIXED 2026-07-17)**: an OFF-BY-ONE on the running packed
  index `KX` in the upper-triangle interchange (`lib/lapack/base/zhptrf/lib/base.js`
  "swap and conjugate rows kp+1..kk-1" loop). Reference ZHPTRF initializes
  `KX = KPC + KP - 1` and, after swapping the conjugated inner elements, conjugates
  the interchanged column element `AP(KX+KK-1)`. The JS had instead set
  `kx = kpc + kp` (Fortran KX **+1**) and compensated with a `-2` in the in-loop
  addressing — but the POST-loop conjugation line (`kx + kk - 2`) did NOT carry the
  same compensation, so it conjugated the element ONE SLOT PAST `A(kp,kk)`,
  corrupting the interchanged column and every downstream update. Because it
  conjugates the *wrong* off-diagonal element, the symptom read as "conjugation
  slips" — but the operand was misindexed, not mis-signed. Fix: make `kx` track the
  reference exactly (`kx = kpc + kp - 1`; in-loop `p2 = oAP + (kx-1)*sap`), so the
  post-loop `oAP + (kx+kk-2)*sap` now hits `A(kp,kk)`. The rank-1/rank-2 updates and
  all conjugation *signs* were already correct. Two oracles confirmed the fix: the
  dense `zhetrf` factor of the same A0 (element-diff now matches), and the
  factor+solve residual `A0·X=B0` via `zhptrs` (now ~1e-15 for BOTH uplo at every N).
- **SECOND bug caught by the harness during the fix (stride, both paths)**: with
  the poisoned-storage `zhptrf` validate sweeping non-unit packed strides (2,3), the
  factor returned NaN at `strideAP∈{2,3}` for BOTH uplo. Root cause: the private
  packed-index helpers `iupp`/`ilow` hardcoded `* 2` (a UNIT-stride Float64 offset)
  instead of `* sap` (`sap = strideAP*2`), so the 2×2-pivot rank-2 update read/wrote
  the poisoned inter-element gaps. This is the exact `zpptri` packed stride-mapping
  class (`offset+idx` vs `offset+idx*stride`). Fix: thread `sap` into `iupp`/`ilow`
  and multiply by it. The rest of `zhptrf` already used `oAP + (pos-1)*sap`; only the
  two helpers were stride-blind. This bug was invisible to the unit-stride fixture
  suite and only surfaced under the poisoned non-unit-stride sweep.
- **Bug class**: `uplo/trans/diag-handling` (upper-branch off-by-one interchange
  index) + `storage-mapping` (stride-blind packed index helper).
- **zhptri itself is CORRECT**: fed a VALID factor+IPIV it reconstructs
  `A0·inv=I` to ~1e-13 for BOTH uplo across n=1..64. During the bug it temporarily
  sourced its factor from the dense `zhetrf` re-packed; now that `zhptrf` is fixed,
  `lib/lapack/base/zhptri/test/test.validate.js` sources the factor from the natural
  packed `zhptrf` again (the full zhptrf→zhptri pipeline is validated end-to-end for
  BOTH uplo at L3). `zhptrf` and `zhptrs` are now their own L3 validate suites
  (`test.validate.js`) with factor+solve residual + IPIV structural + layout fuzz.
- **Generalization**: audit the UPPER branch of every complex Hermitian packed
  factorization / two-sided update for the same conjugation-sign slip — `zhptrf`
  (fix), and re-check `zhptrd` (Hermitian packed tridiagonal reduction),
  `zhpgst`, and any `hp` routine with a "swap-and-conjugate" interchange loop. The
  high-signal probe is exactly this one: factor the SAME Hermitian matrix with the
  DENSE (`he`) sibling and the PACKED (`hp`) routine and diff the factors
  element-by-element per uplo — the reference-faithful dense routine is the oracle,
  and conjugation slips show up as sign-flipped imaginary parts. A same-uplo-only
  fixture suite (or one that only checks `info`) will never catch it.

---

## 2026-07-17 — zlatps (COMPLEX packed triangular solve, CONJUGATE-TRANSPOSE) is NOT bit-exact under a change of AP BASE OFFSET alone → ~1 ULP offset-dependent reorder; surfaced by zppcon lower layout-invariance

- **What**: While validating `zppcon`/`zpocon` (SPD condition-number estimators),
  the pure-addressing layout-invariance check (fixed unit stride, vary ONLY the
  base offset) FAILED for `zppcon` **lower** by ~1 ULP:
  `zppcon lower pure-addressing packed layout invariance [variant 1 vs 0]: differ
  at component 0: 0.18439386606890998 vs 0.18439386606891003`. The PACKED DENSE
  sibling `zpocon` (which uses `zlatrs`, the dense solver) is bit-exact for BOTH
  uplo; only the PACKED `zppcon` (which uses `zlatps`) breaks, and only for the
  path that performs a CONJUGATE-TRANSPOSE solve (`lower` = `L·y=x` then
  `L^H·x=y`; the `L^H` solve is the offender). The `zppcon` CORRECTNESS property
  (`rcond ≈ 1/κ₁`) PASSES at every size/uplo (estimate 0.1844 vs true 0.1424,
  ratio ~1.3, well within the factor-3 bound), so this is BENIGN — a bit-exactness
  defect, not a correctness defect.
- **Repro**: `sc=complex`, `uplo='lower'`, `trans='conjugate-transpose'`, N=9,
  seed 7 for the triangular operand. Realize the SAME lower packed triangular
  matrix at `{stride:1, lead:off}` for `off ∈ {0,1,2,3,...}`, solve with `zlatps`
  and compare the output x. Result: `off ∈ {0,1}` give one value, `off ≥ 2` give
  another, ~5.5e-17 apart (first divergence at x[0], the last-solved element);
  `tail` (buffer length) has NO effect, and varying only the X (solution vector)
  offset is bit-EXACT. So it is specifically the AP base offset that perturbs the
  arithmetic. `ztpsv` (the fast-path packed solve `zlatps` delegates to) and
  `zdotc`/`zaxpy` are each independently offset-invariant when tested directly —
  the reorder lives in `zlatps`'s own conjugate-transpose loop
  (`lib/lapack/base/zlatps/lib/base.js`, the `else // Solve A^H*x=b` branch ~L672+
  and its `computeTransposeSum`), where the diagonal `av[ip]` / `(ip/2)+1` reads
  and the `uscal≠1` vs `uscal==1` (zdotc fast-path vs manual-scaled-loop) branch
  selection appear to straddle differently once a prior ~1 ULP shift propagates.
  Every AP element read is numerically identical across offsets, so the divergence
  is a genuine arithmetic-order sensitivity, not an out-of-bounds read (poisoned
  padding never trips: outputs are always finite).
- **UPDATE 2026-11-18 (RESOLVED, tickets/0019)**: localized. The lower CNORM
  loop counted `offsetAP` twice (`ip = offsetAP*2`, then `offsetAP + ip/sap + 1`).
  Fixed incidentally by 549b87df; see the 2026-11-18 `*latrs`/`*latps`/`*latbs`
  entry at the end of this file. The text below is the original, superseded analysis.
- **Root cause**: NOT localized to a single line and NOT fixed here (out of scope:
  `zlatps` is a shared, already-validated dependency of the whole packed-complex
  con/solve family; a change risks its many callers). Best current understanding:
  an offset-dependent ~1 ULP reorder inside the conjugate-transpose packed loop,
  possibly the incremental `ip` diagonal walk vs the `(ip/2)+1` sub-column base
  used by `zdotc`/the scaled manual loop. A correct routine MUST be base-offset
  invariant, so this is a latent bug worth a targeted fix later.
- **Bug class**: `other` (offset-dependent arithmetic reorder / latent
  addressing-order sensitivity), benign at ~1 ULP.
- **Generalization**: check every caller of `zlatps` with a CONJUGATE-TRANSPOSE
  solve (`zppcon` upper's first solve is `U^H`, lower's second solve is `L^H`;
  `zppsv`/`zpptrs` do not use `zlatps`; `ztrsv`-based paths are unaffected). The
  DENSE analogue `zlatrs` is clean (zpocon bit-exact), so the defect is specific
  to the PACKED indexing in `zlatps`. When validating a routine whose only
  non-bit-exact axis is an offset change routed through `zlatps` conj-transpose,
  assert a TIGHT few-ULP tolerance on that axis (not bit-exact) and cite this
  entry — that is what `zppcon`'s lower layout-invariance now does; `zppcon` upper
  and both `zpocon` uplo remain bit-exact.

---

## 2026-07-17 — zhetrf (COMPLEX Bunch-Kaufman LDL^H) layout-invariance: negative COLUMN stride flips a PIVOT decision → totally different (but valid) factorization; use a PURE-ADDRESSING family

- **What**: The col/row-split bit-exact invariance pattern FAILS for `zhetrf`,
  not by ~1 ULP but by a LARGE amount: `zhetrf upper layout invariance col-major
  [variant 2 vs 0]: differ at component 0: 19.197639682756908 vs
  9.015329990819664`. Variant 2 is the negative-COLUMN-stride col-major layout
  (dense layout index 5, `sgn2=-1`), which `schemes.dense.pivotLayouts()`
  deliberately keeps in-contract (only negative FIRST/row stride is excluded for
  the pivoting family). The factor+solve RESIDUAL `A0·X=B0` PASSES across every
  in-contract layout at every size — so `zhetrf` is CORRECT; only bit-exact
  factor-equality across storage layouts breaks.
- **Repro**: `sc=complex`, seed `0xF00D`, `uplo='upper'`. Factor the SAME
  Hermitian matrix at dense layout 0 (tight col-major) vs layout 5 (col-major,
  negative column stride) and compare the flattened factor triangle + IPIV. Size
  dependence (this seed): BIT-IDENTICAL at N=8,16,33,64 but DIVERGES at N=32
  (IPIV first differs at index 2, maxAbsDiff 2.2e1) and N=40 (IPIV first differs
  at index 1, maxAbsDiff 2.6e1). A pure-addressing family (positive unit stride,
  col-major, varying ONLY base offset / lead / tail / leading-dim pad) is
  bit-exact across ALL sizes and both uplo.
- **Root cause**: NOT a bug. Bunch-Kaufman makes DISCRETE pivot choices (1×1 vs
  2×2, and which row) by comparing computed magnitudes (`COLMAX`/`ROWMAX`, the
  `ALPHA` threshold). A last-ULP arithmetic difference introduced by the negative
  column stride (addressing reorders how the inner `zgemv`/`zgeru` panel updates
  in `zlahef`/`zhetf2` touch memory) can straddle a near-tie threshold and FLIP a
  pivot decision, which then cascades into an entirely different — but equally
  valid — LDL^H factorization. The residual is invariant (both factorizations
  solve the system); the stored factor and IPIV are not. This is the discrete-
  decision amplification of the same reorder-sensitivity as the dpotri entry
  below.
- **Bug class**: `tolerance` (benign floating-point reordering amplified by a
  discrete pivot branch; test design, not a routine defect).
- **Fix (test design)**: assert bit-exactness only across a PURE-ADDRESSING
  family — identical strides AND signs (positive unit stride, col-major), varying
  only base offset, leading pad, and leading-dimension padding — which cannot
  change arithmetic order or the pivot path. Cross-order / stride-sign
  correctness is covered by the factor+solve residual swept over all in-contract
  layouts (`pivotLayouts`: negative column stride + row-major included). Records
  L3 honestly. The solve `zhetrs` (no pivot search of its own; consumes a FIXED
  factor+IPIV) tolerates the FULL col/row families and stays bit-exact, so it
  keeps the col/row split.
- **Generalization**: EVERY pivoting factorization with data-dependent DISCRETE
  pivot choices is vulnerable to this cascade under any layout that perturbs
  rounding — check the whole Bunch-Kaufman family (`zsytrf`/`dsytrf`/`ssytrf`/
  `csytrf`, `zhetrf`/`chetrf`, and the packed `*sptrf`/`*hptrf`) and, more
  broadly, any `*trf` whose pivot comparison can hit a near-tie. Use the
  pure-addressing family for their factor bit-exact tests; certify cross-layout
  correctness by the solve residual, never by factor bit-equality. The paired
  `*trs` solves (no internal pivot search) may keep the wider col/row families.

---

## 2026-07-17 — dpotri/dpptri (REAL inverse-from-Cholesky) layout-invariance: NOT bit-exact even within one col/row family — real BLAS `incx==1` fast paths + blocked reorder shift summation on stride sign/gap/order/uplo; use a PURE-ADDRESSING family

- **What**: A col/row-split bit-exact layout-invariance test (the pattern that
  works for UNBLOCKED `dpotf2`/`dtrti2`) FAILS by ~1 ULP for `dpotri` and
  `dpptri`. `dpotri upper n=12 layout invariance row-major [variant 1 vs 0]:
  differ at component 0: 0.10396254424060729 vs 0.1039625442406073`; `dpptri
  lower n=9 [variant 2 vs 0]: 0.11804071458173002 vs ...173003`. Reconstruction
  `A·inv(A)=I` PASSES across all layouts — so the routines are CORRECT; only
  bit-exactness across storage layouts breaks.
- **Repro**: `sc=real`, seed `0xF00D`. `dpotri` `schemes.dense`: enumerate the 7
  layouts, factor+invert, flatten the uplo triangle → equivalence classes depend
  on (order, inner-stride gap g, stride sign, uplo, n). E.g. dense uplo='lower'
  n=40 splits `{col g1 +}`, `{row}`, and `{col g1, negative row stride}` into
  THREE classes; dpptri packed uplo='lower' n=9 splits `{stride 1}` vs `{stride
  2,3,−1,−2}`. Complex `zpotri`/`zpptri` do NOT split (bit-exact across full
  col/row / all-packed families).
- **Root cause**: NOT a bug. `dpotri`=`dtrtri`+`dlauum`, `dpptri`=`dtptri`+
  packed assembly — both bottom out in real reference BLAS `ddot`/`dgemv`/`dsyrk`/
  `dtrmm`/`dtrsm`/`dtpmv`, which special-case `incx==1` (and block by cache),
  choosing a different (equally valid) summation order for unit vs non-unit /
  negative strides and across the col<->row flip. Different order → last-ULP
  rounding differences. The real `d` kernels have these fast paths; our complex
  `z` kernels do not, which is why only the real routines split.
- **Bug class**: `tolerance` (benign floating-point reordering; harness/test
  design, not a routine defect).
- **Fix (test design)**: assert bit-exactness only across a PURE-ADDRESSING
  family — identical strides AND signs, varying only base offset, leading pad,
  and leading-dimension padding (dense: tight col-major g=1 positive; packed:
  unit stride) — which cannot change arithmetic order, so any residual diff is a
  real offset/stride-base addressing bug. Cross-order/sign/gap/stride correctness
  is covered by the reconstruction property swept over ALL 7 (dense) / 6 (packed)
  layouts. Records L3 honestly.
- **Generalization**: EVERY real routine that reaches BLOCKED Level-3 BLAS or a
  unit-stride-fast-path Level-2 kernel needs the pure-addressing family, not
  col/row — check `dsytri`/`dsptri`, `dtrtri`, `dlauum`, `dpotrs`/`dpptrs`,
  `dgetri`, and the `sy/sp` inverse family. Unblocked Level-2-only routines
  (`dpotf2`, `dtrti2`, `dgetf2`) keep col/row. Complex siblings currently tolerate
  the full family, but do NOT assume it — re-verify per routine.

---

## 2026-07-17 — zpptri: packed stride ignored — linear packed indices conflated with element offsets → NaN / garbage for any strideAP ≠ 1

- **What**: Property reconstruction `A0·inv(A0) = I` and packed layout-invariance
  fuzz on `zpptri` both fail: `zpptri upper n=2 (residual): non-finite value at
  (0,0)` and layout-invariance `[variant 2 vs 0]: differ at component 0: ... vs
  NaN`. The stride-1 layouts (packed variants 0,1) pass; **every** non-unit /
  negative packed stride (variants 2–5: stride 2, 3, −1, −2) returns NaN and
  garbage.
- **Repro**: `sc = complex`, `schemes.packed`, `uplo='upper'` and `'lower'`,
  n=2 (and all larger), seed `0x100+n` for the property / `0xF00D` for
  invariance. Minimal: realize an HPD matrix packed with `{stride:2}`, run
  `zpptrf` then `zpptri` → diagonal reads back `NaN`. `dpptri` (real sibling) is
  **correct** on the identical 6-layout packed sweep.
- **Root cause**: `zpptri/lib/base.js` computed the running packed pointers as
  `offset + linear_index` and then passed them straight through as BLAS element
  offsets with the real `stride`: `jj = offset - 1; … jc = jj + 1; jj += j;` then
  `zhpr(...,AP,stride,jc,...)`, `APv[jj*2]`, `zdscal(j,ajj,AP,stride,jc)` (upper)
  and `ztpmv(...,AP,stride,jjn,AP,stride,jj+1)` (lower). The physical address of
  packed slot `p` is `offset + p*stride`, but the code used `offset + p` — the
  stride multiply was dropped for every base pointer (it survived only as the
  BLAS `strideX` walking each vector, from a wrong starting element). With
  `stride=1` the two coincide, so unit-stride fixtures never caught it. The real
  `dpptri` does it right: keep `jj/jc/jjn` as pure 0-based packed indices and
  address as `offsetAP + (idx * strideAP)`.
- **Fix**: rewrote `zpptri/lib/base.js` to mirror `dpptri`'s index-then-scale
  pattern (pure packed indices `jj/jc/jjn`, every access `offset + idx*stride`).
- **Bug class**: `storage-mapping` (packed-index-vs-strided-offset conflation).
- **Generalization**: audit every complex PACKED routine that maintains running
  `jj/jc/jjn`-style packed pointers for the same `offset + idx` (missing
  `*stride`) mistake — `zhptrf`, `zhptri`, `zpptrf`, `ztptri`, `zspr/zhpr`
  callers, `ztpmv/ztpsv` callers. The real (`d`) siblings, which were validated
  against the strided packed layouts, are the correct template. Unit-stride
  fixtures and unit-stride-only tests will NOT catch this; the packed
  layout-invariance sweep (strides 2/3/−1/−2) is what surfaces it.

---

## 2026-07-17 — zgelq2 validation ORACLE: complex LQ has Q = H(k-1)ᴴ…H(0)ᴴ (conjugate-transposed reflector product); a `tau` reconstruction (vs `conj(tau)`) is wrong

- **What**: While validating `zgelq2` (and `dgelq2`), the independent
  reconstruction oracle `A = L·Q` disagreed with A0. `dgelq2` passed; `zgelq2`
  failed loudly on the SMALLEST case — `zgelq2 M=1 N=1 layout=0`: `relative error
  1.930e+0 exceeds tolerance 4.441e-15`. The bug was in the TEST oracle, not the
  routine: `zgelq2` itself reconstructs correctly once the oracle is fixed.
- **Repro**: complex scalar, `schemes.dense`, any layout, M=N=1, seed `0x100 +
  M*100 + N`. The 1×1 complex case is the sharpest probe: `zlarfg` produces a
  NON-zero `tau` even with no sub-vector, because it must rotate a complex `alpha`
  to a REAL `beta`. So `H(0) = 1 - tau` is a genuine (unitary) reflector and the
  `tau`-vs-`conj(tau)` distinction can no longer hide.
- **Root cause**: real DGELQ2 has `Q = H(k-1)…H(0)` with symmetric `H(i) = I -
  tau·vvᵀ`, so right-applying `C·H(i) = C - tau·(Cv)·vᵀ` reconstructs. COMPLEX
  ZGELQ2 has `Q = H(k-1)ᴴ…H(0)ᴴ` (note the ᴴ on every factor), so `A = L·Q`
  requires right-applying `C·H(i)ᴴ = C - conj(tau)·(Cv)·vᴴ`. The oracle used
  `tau`; correct is `conj(tau)`. Verified analytically at n=1: `conj(1-tau) =
  1/(1-tau)` because `1-tau` is unitary, which is exactly what closes `L·H(0)ᴴ =
  A0`. (The stored row already equals `conjg(v)`, so using the stored row directly
  as the row vector `w` with `conj(w)` in the inner product recovers `v` — that
  half was right; only the `tau` conjugation was wrong.)
- **Bug class**: `convention` (complex reflector-product conjugation).
- **Fix**: oracle `applyHRight` uses `ctau = sc.conj(tau)` for the rank-1 update.
  No-op for the real trait (`conj(tau)=tau`), so `dgelq2` is unaffected and both
  share one code path. Orthonormality was insensitive to the bug (Q is unitary
  either way), so ONLY the reconstruction property caught it — a reminder that
  reconstruction and orthogonality are independent, non-redundant checks.
- **Generalization**: every complex Householder factorization whose docs write `Q
  = H(k)ᴴ…H(1)ᴴ` (LQ) or `Q = H(1)…H(k)` applied with conjugated tau — validate
  `zgeqr2`/`zgeqrf` (QR, `Q = H(1)…H(k)`, reflectors are COLUMNS not rows),
  `zgelqf`, and the `zunml2`/`zunmlq`/`zung*` reflector-application family with the
  same `conj(tau)` care. A 1×1 (and 1×n / n×1) complex case is the cheapest
  regression probe for this whole class.

## 2026-07-17 — getrf/getf2 pivoting family: negative FIRST-dimension stride (strideA1 < 0) is out of contract; idamax/izamax return -1 → IPIV=-1 and out-of-bounds reads (poisoned NaN)

- **What**: Layout-invariance fuzz over the full 7-layout dense set on `dgetrf`,
  `zgetrf`, `dgetrf2`, `zgetrf2` (and the pre-existing, already-RED `dgetf2`/
  `zgetf2` validate tests) trips `assertAllExactEqual` / `assertFinite` with a
  **NaN** in the factored output: e.g. `dgetrf` "col-major [variant 2 vs 0]:
  differ at component 0: 2.2601... vs NaN". `IPIV[0]` comes back as **-1**.
- **Repro**: real AND complex, `schemes.dense`, any layout whose first-dimension
  stride is negative — `denseLayouts()` variant 4 `{order:'col', sgn1:-1}`
  (strideA1 = -1) and variant 6 `{order:'row', sgn1:-1}`. Seed `0xF00D`, M=N=40
  (blocked) and M=N=8/9 (unblocked) all reproduce; data/pivot-dependent, so the
  property sweep at other seeds sometimes slips past. Minimal: `dgetf2(8,8,A,-1,
  s2,off,IPIV,1,0)` on a negative-row-stride realization → `IPIV[0] = -1`,
  trailing reads walk out of the logical matrix into poisoned padding.
- **Root cause**: NOT an indexing bug in getrf. The pivot search is
  `idamax(M-j, A, strideA1, ...)` (dgetf2/dgetrf2 base.js), which walks the
  sub-column with stride `strideA1`. `idamax`/`izamax` faithfully implement the
  reference BLAS contract `IF (N.LT.1 .OR. INCX.LE.0) RETURN 0` — here the
  0-based analog **returns -1 for `strideX <= 0`** (idamax/base.js line 29:
  `if ( N < 1 || strideX <= 0 ) { return -1; }`). So a negative row stride makes
  the pivot index -1; the subsequent `dswap`/`dlaswp`/`dger` then address row -1
  (out of bounds) and read poisoned NaN. Negative *column* stride (`strideA2<0`,
  variants 3 & 5) is fine — idamax never walks it.
- **Bug class**: `convention` (out-of-contract input; negative first-dimension
  stride is unsupported for LU-with-pivoting by inheritance from the BLAS
  IDAMAX/IZAMAX contract — matching reference LAPACK, which only ever factors
  column-major storage with positive leading dimension). Fixing getrf to accept
  it would require a non-faithful replacement of the pivot search, so the fix is
  at the TEST layer, not the routine.
- **Fix**: restrict the reconstruction sweep and the layout-invariance families to
  layouts with **positive first-dimension stride** (`L.sgn1 !== -1`) for every
  pivoting routine. This still fuzzes offset, leading-dim padding, negative
  COLUMN stride, and the col<->row storage-order flip (the real indexing-bug
  detectors) — only the genuinely-unsupported negative row stride is dropped.
  Applied to `d/zgetrf`, `d/zgetrf2`, and the previously-red `d/zgetf2` tests.
- **Generalization**: hits ANY routine whose inner pivot search calls
  `idamax`/`izamax`/`isamax`/`icamax` over a strided column — the whole `*getrf`/
  `*getf2`/`*gbtrf`/`*getc2`/`*laswp`-driven family, plus `*sytrf`/`*hetrf`
  (Bunch-Kaufman) and `*gesv`/`*gels` wrappers that call them. Any future
  `blahpack-validate` of a pivoting routine must partition dense layouts on
  `sgn1` (positive row stride only), exactly as the potf2/dgels split partitions
  on `order` for optimized-kernel reordering.

## 2026-07-17 — zpotf2/dpotf2 (UNBLOCKED potf2) not bit-exact across col↔row storage order (benign optimized-zgemv form switch)

- **What**: `zpotf2` layout-invariance fuzz over the full 7-layout set tripped
  `assertAllExactEqual` at ~1 ULP between column-major and row-major storage
  (e.g. `-0.47117231018270495` vs `-0.47117231018270506`). The reconstruction
  property (`A = UᴴU / LLᴴ`) passes at every size/uplo, so the factor is correct.
- **Repro**: complex scalar, `schemes.dense`, `uplo='upper'` (and `'lower'`),
  `n=12`, seed `0xF00D`; fails at `layouts()` variant 2 (row-major) vs 0
  (col-major). Real analog `dpotf2` fails identically (`n=12`, seed `0xF00D`,
  differ ~1e-17). WITHIN each storage-order family it is bit-exact: col-major
  variants {0,1,4,5} (incl. padded leading dim, offset, and **negative
  strides**) all agree; row-major variants {2,3,6} all agree.
- **Root cause**: NOT an indexing bug. The unblocked panel update calls the
  optimized `zgemv`, which selects between a **dot form** and an **axpy form**
  by `abs(sb2) <= abs(sb1)` (base.js line ~193 — "picks whichever of two forms
  walks B's smaller-stride dimension in the inner loop"; both forms "reorder the
  summation relative to the reference"). Swapping `strideA1`/`strideA2` on the
  col↔row flip flips which form is chosen, changing floating-point summation
  order → different rounding. Offset/padding/stride-sign changes leave the form
  (and arithmetic order) intact and remain bit-exact.
- **Bug class**: `tolerance` (bit-exactness is unattainable across the storage-
  order flip when the optimized `zgemv` reorders; it is NOT a defect).
- **Generalization**: extends the 2026-07-15 dgels finding (which attributed the
  col↔row split to the BLOCKED `dgemm`/`dlarfb` path) to **unblocked Level-2
  routines** — any routine whose inner loop calls the optimized `zgemv`/`dgemv`,
  `zgemm`, `zher`/`zsyr`, etc. Fix at the TEST layer (as zgels already does):
  assert bit-exactness only WITHIN a storage-order family (`L.order !== 'row'`
  vs `=== 'row'`), which still fuzzes offset/padding/negative-stride — the real
  indexing-bug detectors — and rely on the reconstruction property to catch a
  genuine row/col transpose bug (it would make the row-major result WRONG, not
  merely reordered). Check the other unblocked `*potf2`/`*pptf2`/`*sytf2`/
  `*hetf2` siblings that call an optimized Level-2 kernel.

## 2026-07-17 — zpbtf2: `KLD` diagonal-walk stride clamped with `Math.max(1, …)` breaks row-major / negative-stride band storage

- **What**: `zpbtf2` (complex unblocked banded Cholesky) passes reconstruction
  on the default (tight col-major) layout but FAILS layout-invariance. The band
  super-row scaled by `ZDSCAL`/updated by `ZHER` walks the wrong direction in
  memory for any layout whose geometric diagonal stride is negative.
- **Repro**: `node --test lib/lapack/base/zpbtf2/test/test.validate.js`
  (complex, `schemes.banded`, seed `0xF00D`, n=12, k=3, `uplo='upper'`). Layout
  variant 2 (`{order:'row', lead:4}`, i.e. row-major → strideAB1=12, strideAB2=1)
  differs from variant 0 (tight col-major) at component 48. Property sweep alone
  never catches it because layout 0 has a positive diagonal stride.
- **Root cause** (`lib/base.js`): `kld = Math.max( 1, strideAB2 - strideAB1 )`.
  `KLD` is the memory stride for stepping (column +1, band-row −1) along a super-
  row of the band — geometrically exactly `strideAB2 - strideAB1`. The Fortran
  `KLD = MAX(1, LDAB-1)` clamp exists only to avoid a 0 stride when `LDAB=1`
  (kd=0), a case where `KN=0` so the strided ops are never issued. In a general-
  strided world `strideAB2 - strideAB1` is legitimately **negative** (row-major,
  negative col stride, etc.), and `Math.max(1, …)` silently rewrites that
  negative stride to `+1`, so `zdscal`/`zher`/`zlacgv` walk forward through
  memory instead of backward. Fix: `kld = strideAB2 - strideAB1;` (drop the
  clamp — for kd≥1 tight col-major it equals `ldab-1 ≥ 1` anyway; for kd=0 it is
  unused).
- **Bug class**: `stride-sign` (a `Math.max`/`abs`-style clamp destroying a
  legitimately-negative geometric stride) — same family as the dtpsv
  positive-stride assumption.
- **Generalization**: audit EVERY band routine that derives a `KLD`/diagonal
  stride via `MAX(1, LDAB-1)`: `zpbtrf`, `dpbtf2`, `dpbtrf` (blocked + unblocked,
  real + complex), and band solves/mv `ztbsv`, `dtbsv`, `zhbmv`, `dsbmv`,
  `ztbmv`, `zgbtf2`/`zgbtrf`. Any `Math.max(1, …)` or `Math.abs(…)` applied to a
  stride *difference* (as opposed to a raw stride whose sign is meaningful) is
  suspect. The correct translation of a Fortran `MAX(1, LDAB-1)` diagonal stride
  is the bare difference `strideAB2 - strideAB1`.

---

## 2026-07-17 — dpotf2 layout-invariance: full `dense.layouts()` bit-exactness is INVALID across a col<->row storage-order FLIP for any routine whose inner kernel is the optimized `dgemv`/`ddot`

- **What**: `dpotf2` (real unblocked Cholesky) fails a naive
  `layoutInvariant(schemes.dense.layouts(), ...)` bit-exact check. This is NOT a
  routine bug — the factorization is correct at every layout — but the same
  **methodology trap** the `dgels` entry describes: `dense.layouts()` mixes
  column-major and row-major variants and asserts all seven produce identical
  bits, which is false for a routine that delegates to the optimized inner
  kernels.
- **Repro**: `node --test lib/lapack/base/dpotf2/test/test.validate.js` before
  the family split (seed `0xF00D`, N=12, `uplo='upper'`, real). Variant 2
  (row-major) differs from variant 0 (col-major) at component 74:
  `0.11965696503904552` vs `0.1196569650390455` (~1 ULP). Reconstruction
  property passes at all layouts.
- **Root cause** (NOT in `dpotf2`): `dpotf2` computes the trailing panel with
  `dgemv('transpose'/'no-transpose', ...)` (`lib/lapack/base/dpotf2/lib/base.js`
  lines 65, 83) and the diagonal with `ddot`. The optimized `dgemv`
  (`lib/blas/base/dgemv/lib/base.js`) selects between a **dot form** and an
  **axpy form** based on `Math.abs(sb2) <= Math.abs(sb1)` — i.e. on whether the
  operand is col- or row-major. The two forms reorder the summation (documented
  in that file's header: "Both forms reorder the summation relative to the
  reference"). A col<->row flip therefore legitimately changes rounding by
  ~1e-16. It is NOT an addressing defect.
- **Bug class**: `tolerance` (methodology / test-harness expectation), same
  family as the `dgels` and `asum` entries — not a routine defect.
- **Fix**: split `dense.layouts()` into col-major and row-major families and run
  `layoutInvariant` on each separately (bit-exact WITHIN a family; offset,
  leading-dim padding, and stride-sign fuzzing all remain, so addressing bugs
  still surface). Cross-order **correctness** is certified instead by sweeping
  the reconstruction property over ALL layouts (backward-error tolerance). This
  mirrors `lib/lapack/base/dgels/test/test.validate.js`.
- **Generalization**: applies to EVERY routine whose validation drives the
  optimized `dgemv`/`dger`/`ddot`/`dgemm` and whose output is read back for
  bit-exact layout invariance. `dpotrf`/`dpotrf2` escape this only because they
  route through `dtrsm`/`dsyrk`/`dgemm`, which happen to be bit-exact across the
  order flip. Any unblocked Level-2 LAPACK routine (`d*t2`, `dsytf2`, `dgetf2`,
  `dlauu2`, `dtrti2`, ...) that calls `dgemv`/`dger`/`ddot` must use the
  col/row family split for its layout-invariance layer.

---

## 2026-07-17 — dpbtf2 banded Cholesky: `Math.max(1, sa2-sa1)` clamps the diagonal band step, breaking row-major / negative-stride layouts

- **What**: `dpbtf2` (real, unblocked banded Cholesky) passes the property
  reconstruction sweep at the tight col-major layout but FAILS layout-invariance:
  the factor differs across storage layouts whenever the band-array row stride
  exceeds its column stride (row-major) or a stride is negative.
- **Repro**: `node --test lib/lapack/base/dpbtf2/test/test.validate.js` — layout
  test, seed `0xF00D`, `uplo='upper'`, `n=12`, `k=3`. `schemes.banded.layouts()`
  variant 2 (ROW-major: `{order:'row', sgn1:1, sgn2:1}`) differs from variant 0
  (tight col-major) at flattened component 24: `-0.4736…` vs `-1.0336…`. Same
  class hits variants 4/5/6 (negative strides).
- **Root cause** (`lib/lapack/base/dpbtf2/lib/base.js`): the diagonal band step —
  moving from `AB(r,c)` to `AB(r-1,c+1)`, flat delta `sa2 - sa1` — was computed as
  `kld = Math.max( 1, sa2 - sa1 )`. This is a faithful port of the Fortran
  `KLD = MAX(1, LDAB-1)`, which is only correct for the reference's tight
  column-major storage (`sa1=1`, `sa2=LDAB`, so `sa2-sa1 = LDAB-1 > 0`). In
  row-major storage `sa1` is large and `sa2` is small, so `sa2-sa1 < 0` and
  `Math.max(1, …)` collapses the true negative step to `+1`, corrupting the DSCAL
  vector stride (upper) and the DSYR column stride (`strideA2`, both uplo). The
  `MAX(1, …)` guard only ever mattered to avoid a zero/degenerate stride when
  `LDAB=1`, but in that case `kd=0` ⇒ `kn=0` and neither DSCAL nor DSYR is called,
  so the clamp is pure downside for general strides.
- **Fix**: `kld = sa2 - sa1;` (the genuine signed diagonal step). BLAS DSCAL/DSYR
  already handle negative strides via offset-walking, so no other change is
  needed. All 7 banded layouts now bit-match.
- **Bug class**: `stride-sign` / `storage-mapping` (band-row index step).
- **Generalization**: any band routine that hoists the Fortran `KLD = MAX(1,
  LDAB-1)` idiom into a strided address computation has the same latent bug.
  Check the sibling band-storage routines next: `dpbtrf` (blocked — already in
  the harness reconstruction test, but was it layout-fuzzed with row-major?),
  `dpbsv`, `dpbtrs`, `dtbsv`/`dtbmv`, `dgbmv`/`dsbmv`, `dgbtf2`/`dgbtrf`. Any
  `Math.max(1, strideA2 - strideA1)` (or `LDAB-1`-derived) expression that is
  used as an actual stride is suspect under row-major or negative-stride layouts.

## 2026-07-17 — asum-family layout-invariance: full `vectorLayouts()` bit-exactness is INVALID for stride-specialized / non-negative-stride-only reductions

- **What**: `dasum` and `dzasum` fail generic `layoutInvariant(schemes.vectorLayouts(), ...)`
  bit-exact checks. This is NOT a routine bug — both faithfully mirror the
  reference BLAS — but a **harness/methodology** trap: `vectorLayouts()` mixes
  stride-1, general positive strides, AND negative strides, and asserts all six
  produce identical bits. That assumption is false for these two routines.
- **Repro**: `node --test lib/blas/base/dasum/test/test.validate.js` (seed
  `0xF00D`, N=17, real). `dasum` variant 2 (`{stride:2,lead:1}`) differs from
  variant 0 (`{stride:1}`) by 1 ULP: `14.40194947625754` vs `...542`. `dzasum`
  (same seed/N, complex) variant 4 (`{stride:-1,lead:4}`) returns `0` vs
  `27.800...` for stride 1.
- **Root cause** (both faithful to `data/BLAS-3.12.0/dasum.f`, `dzasum.f`):
  1. `IF (N.LE.0 .OR. INCX.LE.0) RETURN` — a NEGATIVE (or zero) stride yields
     `0`, by design. The reference asum family does not support negative strides
     (unlike axpy/dot/nrm2, which offset-walk). So negative-stride layouts (4,5)
     can never match positive ones. `base.js` reproduces this with
     `if ( N <= 0 || stride <= 0 ) return 0`.
  2. `dasum` uses a **6-way unrolled** accumulation for `INCX==1`
     (`dtemp += |x0|+|x1|+...+|x5|`, one grouped add) but a one-at-a-time
     accumulation for `INCX!=1`. Different summation grouping ⇒ different
     rounding ⇒ stride-1 result is NOT bit-identical to stride-2, even though
     both walk ascending indices. (`dzasum` has no such split — all positive
     strides share one-at-a-time order and ARE mutually bit-exact.)
  Contrast `dnrm2`/`dznrm2`: those were written to keep the SAME 4-accumulator
  grouping for stride-1 and general strides (only addressing changes) and to
  offset-walk negative strides, so they pass full `vectorLayouts()` bit-exactly.
- **Fix** (test-side, no routine change): validate layout invariance only over
  layout sets that share ONE arithmetic path and a supported stride sign.
  `dasum` — two groups: general positive strides `>=2` (varying lead/tail), and a
  separate stride-1 offset group (the unrolled path). `dzasum` — all POSITIVE
  strides (incl. 1). Negative-stride behavior is asserted separately as "returns
  0" to pin the faithful contract rather than treated as an invariance variant.
- **Bug class**: `tolerance` / `convention` (harness assumption, not a defect).
- **Generalization**: before applying full `vectorLayouts()` bit-exactness to any
  Level-1 reduction, check the reference for (a) an `INCX<=0` early return
  (asum/nrm2-classic/iamax families — negative strides give 0, so exclude them)
  and (b) an `INCX==1` special-cased/unrolled arithmetic path that regroups the
  sum differently from the general loop (`dasum`, `dsdot`, `sdsdot`, and any
  hand-unrolled kernel — stride-1 is a distinct rounding class). Routines with a
  single stride-agnostic accumulation and offset-walked negative strides
  (`dnrm2`, `dznrm2`, `ddot`, `daxpy`) are safe for the full sweep.

---

## 2026-07-17 — dtpsv infinite-loops on negative packed stride (strideAP < 0)

- **What**: `dtpsv` (real triangular packed solve) HANGS (infinite loop) whenever
  the packed matrix `AP` is passed with a negative `strideAP`. The layout-
  invariance fuzz never returns; `node --test` reports the file as a pending
  Promise after the 100s watchdog.
- **Repro**: `node --test lib/blas/base/dtpsv/test/test.validate.js`. Minimal:
  real scalar, `uplo='upper'`, `trans='no-transpose'`, `diag='non-unit'`, N=9,
  packed layout `{ stride:-1 }` (from `schemes.packed.layouts()` index 4), seed
  `0xF33E`. First hanging call is upper/no-transpose/non-unit with `strideAP=-1`.
  All four algorithm branches are affected under a negative `strideAP`.
- **Root cause**: `lib/blas/base/dtpsv/lib/base.js` drove its inner substitution
  loops by POINTER COMPARISON against a computed bound, e.g. upper no-transpose:
  `for ( ; ip >= kk - ( j * strideAP ); ip -= strideAP )`. These bounds silently
  assume `strideAP > 0`. With `strideAP = -1`, `ip -= strideAP` INCREASES `ip`
  (moving away from the bound) while the condition `ip >= kk + j` stays true once
  entered — so the loop never terminates. (Positive-stride under-execution in the
  other three branches is the same latent defect.) The reference BLAS uses plain
  element-count loops (`DO I = J-1,1,-1`); the pointer-bound rewrite introduced
  the stride-sign dependence. Sibling `ztpsv` was already correct because it
  counts elements (`for ( i = j-1; i >= 0; i -= 1 )`) and steps `ip`/`ix` inside.
- **Fix**: rewrote all four inner loops in dtpsv `base.js` to count elements like
  ztpsv (loop over `i`, advance `ip`/`ix` by `strideAP`/`strideX` in-body), and
  index the diagonal for the transpose branches by `kk + j*strideAP` /
  `kk - (N-1-j)*strideAP`. This restores reference faithfulness and is
  stride-sign agnostic. Residual + layout-invariance now pass for real, complex.
- **Bug class**: `stride-sign`.
- **Generalization**: any packed (`tp`/`sp`/`hp`) or otherwise strided kernel that
  bounds an inner loop by comparing a running pointer to a stride-scaled endpoint
  (`ip <= base + k*stride`) breaks under negative stride. Prefer counted loops.
  Audit siblings that share this packed-solve/mv shape for pointer-bound inner
  loops: `dtpmv` (packed triangular mv), `dspmv`/`dspr`/`dspr2`,
  `dtbsv`/`dtbmv` (banded). The z-variants here use counted loops and are safe;
  the d-variants are the ones to check.

---

## 2026-07-17 — harness gap: no triangular-banded (`tb`) generator

- **What**: gap, not a bug. The `tb` type-code (triangular banded — `dtbmv`,
  `ztbmv`, `dtbsv`, `ztbsv`) had a working storage scheme (`schemes.banded` already
  honors `{ part:uplo, k, unit }`: upper => kl=0/ku=k, lower => kl=k/ku=0) but NO
  logical generator, so those routines could not be validated without hand-rolling
  band storage inline (which the consistency rules forbid).
- **Fix**: added `logical.triangularBanded( sc, rng, n, k, { uplo, unit } )` to
  `test/harness/logical.js` — exact zero outside the band and in the opposite
  triangle, diagonally dominant non-unit diagonal `(n+1)·sign` (well-conditioned
  for `tbsv`), unit diagonal stores 1. Verified round-trip + zero-outside-band
  against `schemes.banded.realize` for real+complex × upper/lower × unit/non-unit.
- **Bug class**: `other` (missing-coverage).
- **Generalization**: still-missing generators for the remaining "no scheme/gen"
  type-codes: RFP (`rf`), tridiagonal (`gt`/`pt`), bidiagonal. Add each before
  validating routines of that code; never hand-roll storage in a test.

---

## 2026-07-17 — dtrmm ignored `conjugate-transpose` for the real routine

- **What**: `dtrmm` produced the wrong result whenever `transa =
  'conjugate-transpose'`. For a real routine conjugation is a no-op, so `'c'`
  must behave EXACTLY like `'t'` (transpose); instead A was applied
  un-transposed.
- **Repro**: `node --test lib/blas/base/dtrmm/test/test.validate.js` →
  `dtrmm left upper conjugate-transpose non-unit M=2 N=2: relative error 7.064e-1
  exceeds tolerance 4.441e-14`. Real scalar, dense scheme, `side='left'`,
  `uplo='upper'`, `transa='conjugate-transpose'`, `diag='non-unit'`, M=N=2,
  harness seed `0x100 + M*10 + N = 0x100 + 22`. Reproduces for every
  `side`/`uplo`/`diag` combination with `transa='conjugate-transpose'`.
- **Root cause**: `lib/blas/base/dtrmm/lib/base.js` line 134 folded the transpose
  into effective strides with `if ( transa === 'transpose' )`. The literal
  string test misses `'conjugate-transpose'`, so that flag fell through the
  branch and A was treated as non-transposed. The reference BLAS decides via
  `LSAME(TRANSA,'N')` — anything that is NOT no-transpose transposes. Fix:
  `if ( transa !== 'no-transpose' )`. Sibling `dtrsm` was already correct
  (it keys off `transa === 'no-transpose'`).
- **Bug class**: `uplo/trans/diag-handling` (`wrong-branch`).
- **Generalization**: Any real (`d`/`s`) routine that accepts a `transa`/`trans`
  flag and branches on the literal `=== 'transpose'` (rather than
  `!== 'no-transpose'`) silently mishandles the perfectly-valid
  `'conjugate-transpose'` alias. `isMatrixTranspose` accepts all three spellings,
  so callers CAN pass `'conjugate-transpose'` to a real routine. Grep real BLAS/
  LAPACK kernels for `=== 'transpose'` and audit: dtrmm was the offender here;
  check dsymm/dsyrk/dsyr2k/dtrsm-family and any hand-written transpose fold.
  A full flag cross-product sweep (including `conjugate-transpose` on the real
  routine) is what surfaced this; a `d`-suite that only tests `n`/`t` would miss it.

---

## 2026-07-16 — dznrm2 unit-stride fast path broke layout invariance (zgels)

- **What**: `zgels` layout-invariance check failed — output not bit-exact within
  the row-major storage family. Root-caused down the call chain
  `zgels → zgelqf → zgelq2 → zlarfg → dznrm2`.
- **Repro**: `node --test lib/lapack/base/zgels/test/test.validate.js` →
  `zgels layout invariance row-major no-transpose 33x40 [variant 1 vs 0]: differ
  at component 0: -0.29653930753419944 vs -0.296539307534199`. Complex scalar,
  dense scheme, `trans='no-transpose'`, M=33 N=40 nrhs=2, harness seed
  `0x6000 + M*17 + N`. Variant 0 = tight row-major (element stride 1), variant 1 =
  gapped row-major (element stride 2). Divergence first appears at `A(12,12)`:
  iteration i=12 calls `dznrm2` with N=27 (**odd**) — the trigger.
- **Root cause**: `lib/blas/base/dznrm2/lib/base.js` had a `strideX === 1` fast
  path whose **tail loop** (leftover complex element when N is odd) added *both*
  re² and im² to accumulator `s0` (`for (;i<2*N;i++) s0 += v0*v0`), while the
  strided path's tail adds re²→`s0`, im²→`s1`. Same math, different running-sum
  grouping ⇒ different rounding ⇒ last-ULP difference. The two paths' main loops
  were already identical; only the odd-N tail diverged. Fix: unit-stride tail now
  walks the leftover complex element as `s0 += re²; s1 += im²`, matching the
  strided tail exactly. Verified bit-exact over N=1..40 × strides {1,2,3,-1,-2}
  (1280 checks, 0 mismatches).
- **Bug class**: `convention` (FP-associativity / stride-fast-path reproducibility).
- **Generalization**: ANY optimized BLAS/LAPACK kernel with a `stride === 1`
  fast path is a layout-invariance risk if its accumulation ORDER (accumulator
  assignment, unroll grouping, or tail handling) differs from the strided path —
  even when both are mathematically equal. The high-signal probe is exactly this
  one: bit-exact output across unit vs non-unit stride. I audited every existing
  double-precision reduction kernel this way:
    - `dznrm2` — **BUG (fixed here)**: stdlib fast path with a self-inconsistent
      tail. Both paths are stdlib optimizations that MUST agree → align them.
    - `dnrm2`, `dzasum`, `zdotc`, `zdotu` — bit-exact (safe). `dnrm2` shares one
      tail loop across both branches, which is why it's correct.
    - `dasum` (unroll-6) and `ddot` (unroll-5) — **DIVERGE across strides, but
      DO NOT "fix"**: the unit-stride unroll IS the reference BLAS algorithm
      (DASUM/DDOT unroll only for `incx==1`), so the stride dependence is
      faithful to reference and no test requires bit-exactness. Changing them
      would deviate from reference numerics for no gain. If a routine's
      layout-invariance test ever traces to `dasum`/`ddot`, that is the moment to
      revisit — with a scoped decision, not a blanket patch.
  Rule of thumb: **fix a stdlib-introduced fast-path inconsistency (align the
  paths, keep the optimization); leave a reference-faithful unroll alone.** The
  untranslated single-precision siblings (`snrm2`, `scnrm2`, `sasum`, `sdot`)
  should get the same probe when they land.

## 2026-07-15 — SWEEP of LD wrappers: zgels/zgelss broken (LDB + blocked-path workspace, base AND wrapper)

- **What**: Systematic sweep of every LAPACK LD wrapper for the two dgels bug
  classes (LDB output-growth; blocked-path WORK under-allocation). Triage +
  confirmed complex-LS bugs below. **These fixes are NOT yet applied** — zgels &
  zgelss need a full validation pass (harness extended to complex) rather than
  hand-patching, so this entry is the runnable-repro handoff.
- **⚠ CORRECTION (workspace strategy)**: an earlier draft of this entry (and my
  first zgels/zgelss patch) treated **base.js allocating WORK internally** as
  acceptable — "pass `WORK=null` through to base." That is WRONG.
  **base.js and ndarray.js must NEVER allocate a problem-sized workspace**; only
  the `<routine>.js` wrapper allocates, on a null `work` arg. Reasons: (a) these
  routines model C — if C doesn't allocate, JS shouldn't; (b) the ndarray layer
  reuses ONE workspace across same-size batches, so per-call allocation defeats
  batching. Enforced now by the `no-internal-workspace-alloc` ESLint rule
  (flags 37 base.js routines incl. zgels/zgelss). So the real fix for zgels/zgelss
  is the dgels template: base+ndarray take caller-owned WORK (no alloc), ndarray
  asserts the size (loud RangeError, not silent NaN), wrapper auto-allocs on null,
  drop `lwork`. The blocked-path *sizing insight* below is still correct; where it
  says "fix base's formula" read "size the wrapper's allocation / ndarray's assert."
- **Triage — LDB output-growth class is confined to the LS/min-norm family**
  (`gels`/`gelss`): only there does the solution overwrite `B` with MORE rows
  (`max(M,N)`) than the RHS (`M`). All other ~150 `LDB < max(1,N)` solves keep `B`
  at `N×NRHS`, so `LDB >= N` is correct — NOT the bug class. Real `dgels`/`dgelss`
  LDB fixed (Stephan Schiffels, cherry-picked). `dgelss` blocked workspace spot-
  checked finite.
- **CONFIRMED BUG — zgels** (`lib/lapack/base/zgels/`), three defects:
  1. `lib/base.js:109` WORK=null auto-alloc `MN + max(MN,nrhs)*32` **under-allocates
     the blocked path** (min(M,N) > 32): all-NaN solution. Repro: `zgels('no-
     transpose',40,33,2,A,1,40,0,B,1,40,0,null,1,0,-1)` with Complex128Array A/B →
     NaN; `33×40`, `64×64` too. `3×5` (unblocked) is fine. Base is CORRECT with
     adequate WORK (residual ~1e-16). Complex `zgeqrf`/`zunmqr` store `T` separately
     (TAU is already a separate array here), so scratch needs
     `max(MN,nrhs)*NB + (NB+1)*NB`, not `MN + max(MN,nrhs)*NB`.
  2. `lib/zgels.js:52` wrapper auto-alloc references undefined `MN`/`NRHS`
     → ReferenceError on `WORK=null` (params are `M`,`N`,`nrhs`). Correct fix: the
     WRAPPER allocates a correctly-sized Complex128Array (NOT defer to base — see
     CORRECTION above); base must not allocate.
  3. `lib/zgels.js:72` `LDB < max( 1, M )` → must be `max( 1, max(M,N) )`
     (column-major; no `order` param). Repro: `ldb=3` for `M=3,N=5` is accepted and
     the 5-row solution overflows → NaN.
- **CONFIRMED BUG — zgelss** (`lib/lapack/base/zgelss/lib/zgelss.js:81`):
  `LDB < max( 1, M )` → `max( 1, max(M,N) )` (same output-growth class). Workspace
  path is a query stub (`minWork=1`); its blocked sufficiency needs the same check.
- **Bug class**: `storage-mapping` (LDB) + `convention` (workspace under-alloc,
  same JS-hardcoded-NB / separate-T root cause as dgels).
- **Next step (the right way, per the procedure)**: extend `leadingdim.js` /
  `workspace.js` to complex (Complex128Array operands, `2*len` poison), then run
  `/blahpack-validate zgels` and `zgelss` — the LD-guard + workspace-conformance
  steps will drive out defects 1–3 and defect above, and property/cross-val will
  confirm the fixes. Do NOT ship LDB alone: base still NaNs on blocked until (1) is
  fixed, so a partial fix gives false confidence.

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

## 2026-07-19 — zlaqr3 fails to deflate the top 1×1 window (OOB spike read) → zhseqr large-N NaN [FIXED]

- **What**: `zhseqr` (complex Hessenberg eigenvalue/Schur) returned `info=1` and
  NaN eigenvalues for `N > NMIN=75` — the branch dispatching to `zlaqr0`
  (aggressive early-deflation QR). The small-N `zlahqr` path was always correct.
- **Repro**: any complex upper-Hessenberg with a zero/tiny subdiagonal at the top
  triggers it deterministically — cleanest is an upper-**triangular** matrix
  (all subdiagonals zero), `N>=76`, via `zhseqr('eigenvalues','none',...)`. The
  spectral trace invariant `sum(eigenvalues) == trace(H)` yields NaN. `N<=75`
  (same construction) passes exactly. Some random Hessenberg seeds also hit it
  (whenever the last active block reaches `ktop==kbot==ilo==1`).
- **Caught by**: an ad-hoc trace-invariant check written while removing the
  vestigial `lwork` param. Instrumenting `zlaqr0`'s main loop showed the QR
  deflated eigenvalues 76→2 fine (ld=1 each) but spun forever on the final
  block `ktop==kbot==1` (ld=0), exhausting `itmax` → `info=1`.
- **Root cause**: `zlaqr3.js` (and by inspection the same pattern lives wherever
  this was copied). In the 1×1-deflation-window case (`kbot === kwtop`), the
  convergence test read the subdiagonal `H(kwtop, kwtop-1)` **directly**. The
  reference LAPACK tests the spike scalar `S`, which is explicitly set to `0`
  when `kwtop === ktop` (no element sits above the window). When
  `kwtop === ktop === 1`, `H(1,0)` is out of bounds → indexes
  `Hv[offsetH - strideH2]` → `undefined` → `cabs1` = NaN → `NaN <= tol` is
  false → the top eigenvalue never deflates.
- **Fix**: test the spike magnitude `|Re(S)| + |Im(S)|` (the `sR`/`sI` already
  computed a few lines above, and correctly `0` for `kwtop === ktop`) instead of
  re-reading `H(kwtop, kwtop-1)`. One line in `zlaqr3.js`; exactly matches
  reference `CABS1(S)`. Verified: triangular N=76/80/100, random Hessenberg
  N=100/200, and the small-N path all pass; zlaqr0/zlaqr3/zlaqr4/zhseqr/zgeev/
  zgees test suites green.
- **Bug class**: `off-by-one` / `out-of-bounds-read` / `untested-code-path`.
- **Generalization**: (1) Every deflation/spike test in the QR family must use
  the guarded spike scalar, never a raw `H(k,k-1)` read — audit `dlaqr2/3`,
  `zlaqr2`, `dlaqr0` for the same `kbot===kwtop` block. (2) It hid because every
  committed `zhseqr` fixture is `N<=6` — below all size thresholds
  (`NTINY=15`, `NL=49`, `NMIN=75`); fixtures MUST span a routine's size-based
  dispatch cutoffs. Added a large-N regression test.

## 2026-07-19 — dtrsna: vestigial `M` param shifted the workspace args (SEP path crash) [FIXED]

- **What**: `dtrsna` (eigenvalue/eigenvector condition numbers) crashed (or
  silently corrupted results) whenever the eigenvector-condition path ran —
  `job = 'eigenvectors'` or `'both'`. A caller using the *documented* wrapper
  signature got `TypeError: Cannot create property 'NaN' on number` from inside
  `dlacpy`/`dlacn2`.
- **Repro**: `dtrsna( 'column-major', 'both', 'all', SELECT, 1, 3, T, 3, VL, 3,
  VR, 3, s, 1, SEP, 1, 3, /*M*/3, WORK, 3, IWORK, 1, 0 )` on any `N>=1`. Crashes
  on the `SEP` (`dtrexc`/`dtrsyl`) workspace use.
- **Root cause**: `base.js` returns the output count `m` in its result object
  and has **no `M` parameter** (32 params). But `ndarray.js` and the layout
  wrapper `dtrsna.js` both carried a vestigial `M` *input* param and passed it
  to `base()` — 33 args to a 32-param function — so `base`'s `WORK` received the
  `M` value, `strideWork1` received the `WORK` array, and every workspace arg
  shifted by one. Harmless for `job='eigenvalues'` (WORK unused); fatal for the
  SEP path. The wrapper also wrongly validated `LDT/LDVL/LDVR/LDWORK` against
  `max(1, M)` (an uninitialized output) instead of `max(1, N)`.
- **Why it hid**: **two compensating bugs.** Every existing test helper AND the
  only real caller (`dgeevx`, which imports `base.js` directly) *omitted* `M`
  from the call — that −1 shift exactly canceled the +1 shift `ndarray.js` added,
  so `base` received correct args and the fixture tests passed. Nothing exercised
  the actual documented signature.
- **Fix**: removed the `M` param from `ndarray.js` and `dtrsna.js` (signature +
  the `base()` call + the obsolete `M < 0` check); corrected the column-major
  `LD*` validations to use `N`. Now all three layers agree on 32 base params.
  Verified: `job='both'` on `diag(1,2,3)` yields `s=[1,1,1]` and `SEP=[1,1,1]`
  (both correct); dtrsna + dgeevx suites green.
- **Bug class**: `signature-drift` / `off-by-one-argument` / `untested-code-path`.
- **Generalization**: an output-only scalar (LAPACK `M`, `INFO`, ...) must be
  *returned*, never carried as a positional param that the wrapper forwards —
  a forwarded output param silently shifts everything after it. Audit any
  routine whose base returns a value the wrapper also lists as a param
  (grep `mm, M,` / `, INFO,` in `<routine>.js`/`ndarray.js`). Compensating
  caller bugs mean fixture tests are NOT enough — test the documented signature.

## 2026-07-19 — Systematic sweep of the forwarded-output-param class (15 siblings)

- **Trigger**: the dtrsna entry above prescribed auditing "any routine whose
  `base` returns a value that the wrapper also lists as a param." Ran that audit
  across all LAPACK modules (compare `base.js` param count vs. the args passed in
  `ndarray.js`'s `base()` call; any extra ndarray param is a forwarded output).
- **Found 15 siblings, two severities:**
  - **Interior shift → CRASH (6, same failure mode as dtrsna):** `dlaqps` (`kb`),
    `zgesvx` (`rcond`), `dgebal` + `zgebal` (`ilo, ihi`), `zlahef` (`kb`), plus
    `dtrsna` itself. The vestigial output sat *before* real trailing args
    (WORK/strides), so forwarding it shifted them by one → out-of-bounds /
    wrong-array workspace use on the documented signature.
  - **Trailing forward → silent, no crash (10):** `dlaqge`/`zlaqge`/`dlaqsy`/
    `zlaqhe` (`equed`), `dgeequ`/`zgeequ` (`rowcnd, colcnd, amax`), `dpoequ`/
    `zpoequ` (`scond, amax`), `dlags2` (`csu…snq`), `dlaln2` (`scale, xnorm`).
    The extra params were *last*, so `base` (fewer params) simply ignored them —
    no shift, no crash. But the docs advertised these as writable out-params
    while `base` actually returns them in its result object, so a caller
    following the docs would read never-written arrays. Dual-API inconsistency,
    not a crash.
- **Fix**: removed every vestigial output param from the affected `ndarray.js`
  (and `dtrsna.js`/`dgebal.js`-style wrappers), so all layers pass exactly
  `base.length` args. Outputs are surfaced only via the result object. All 16
  modules: tests + lint + conformance green; callers (`dgeevx`, `dgeqp3`,
  `zgehrd`, …, which import `base.js` directly) unaffected.
- **Bug class**: `signature-drift` / `off-by-one-argument`. Interior = crash;
  trailing = silent doc/impl divergence.
- **Prevention**: the reliable detector is a direct **`base.js` param-count vs.
  `ndarray.js` `base()` arg-count** comparison — any surplus arg is a forwarded
  output. The `signature-conformance` ESLint rule did NOT catch these: its
  flexible achievable-counts model (outputs may be present or absent) happened to
  admit the inflated counts. A dedicated conformance check that asserts
  `ndarray`/wrapper pass exactly `base.length` args to `base()` would close this
  gap deterministically; the linter's fuzzy count model cannot.

## 2026-07-19 — base-arity check exposed 24 unimplemented layout wrappers

- **Trigger**: added a deterministic `base-arity` conformance check
  (`bin/conformance/checks/base-arity.js`) — asserts every `base(...)` call in
  `ndarray.js` and the layout wrapper `<routine>.js` passes exactly
  `base.length` args (the invariant the forwarded-output-param class violated).
- **Unexpected find**: beyond the 16 forwarded-output modules, the check flagged
  **24 modules whose layout wrapper is an un-implemented scaffold stub** —
  `function dlantr( a, b ) { return base( a, b ); }` with `@param a - a`
  placeholders — passing 2 args to a 12–41-param kernel. The `base.js` and
  `ndarray.js` layers are fully implemented; only the public layout wrapper
  (the default export used by `require('@stdlib/lapack/base/<r>')`) is a stub.
  Affected: `dlantr`, `dlaqr0`, `dlaqr5`, `zgbcon`, `zgecon`, `zgeequ`,
  `zgerfs`, `zgttrf`, `zhetrs`, `zhetrs2`, `zlahef`, `zlahqr`, `zlaqr0`,
  `zlaqr1`, `zlaqr4`, `zlaqr5`, `zlatbs`, `zlatrs`, `zpbcon`, `zpocon`,
  `zporfs`, `ztbrfs`, `ztrcon`, `ztrevc3`.
- **Why it hid**: all were marked `[complete]`. The wrapper's own test
  (`test.<routine>.js`) asserts ONLY `typeof === 'function'` and
  `.length === 2` — both satisfied by the stub. No check compared the wrapper's
  `base()` call to the kernel arity, so a non-functional public entry point read
  as done. Classic "tests that assert nothing meaningful inflate coverage."
- **Bug class**: `unimplemented-wrapper` / `vacuous-test`. Detector is the
  `base-arity` check; the corrected count is 857 complete / 42 in-progress
  (was mis-reported as 881/18).
- **Prevention**: `base-arity` demotes any such module to `in-progress` until
  the wrapper is genuinely implemented (order/`LD*` → stride derivation +
  validation + WORK auto-alloc). The vacuous wrapper tests are replaced with
  real round-trip assertions against the ndarray form.
- **Resolution (2026-07-19)**: all 24 wrappers were implemented one at a time,
  each mirroring a completed real/complex sibling (`dgecon`→`zgecon`,
  `zgetrs`→`zhetrs`, `dlaqr4`→`zlaqr0`/`zlaqr4`/`dlaqr0`, etc.) and verified
  green (tests + lint + base-arity + conformance). Two incidental correctness
  improvements over the siblings were made rather than propagated: banded LD
  checks use the correct `kd+1` / `2*kl+ku+1` bounds (several real siblings used
  a loose `max(1,N)`), and eigenvector wrappers validate `LD*` against `N` not
  the output count `M`. Count restored to 881 complete / 18 in-progress — now
  honest; the 18 remaining are the workspace-tier refactor (incl. `dporfs`,
  `zhetrf`), the only two modules `base-arity` still flags.

## 2026-11-17 — ztgevc ignored offsetWork/strideWork (exposed by zggevx caller-owned WORK)

- **Trigger**: migrating `zggevx` to caller-owned WORK with the reference layout
  (sensitivity loop: left eigenvector at WORK(1:N), right at WORK(N+1:2N),
  ztgevc/ztgsna scratch at WORK(2N+1)). The `rconde` fixtures for
  `sense='eigenvalues'`/`'both'` immediately diverged
  (2.5015 expected vs 2.8753 got, N=4 fixture case `test.ndarray.js:187`).
- **Reproduce**: `ztgevc( 'both', 'selected', ..., WORK, 1, offsetWork>0, ... )`
  with any nonzero `offsetWork` — scalar complex, dense, any N >= 1. The
  regression test is `zggevx: results are bit-identical for any
  WORK/RWORK/IWORK/BWORK offset` (zggevx `test.ndarray.js`, N=4, PAD=5, all four
  `sense` values); it fails against the old ztgevc.
- **Root cause**: `ztgevc/lib/base.js` reinterpreted WORK and indexed it from 0
  (`WORKv[ jr * 2 ]`, `zgemv(..., WORK, 1, je, ..., WORK, 1, N)`), silently
  ignoring both `offsetWork` and `strideWork`. Every prior caller (zggev,
  the old zggevx, dtgevc-style drivers) passed `offsetWork = 0`, so it never
  showed. With a nonzero offset, ztgevc scribbled over WORK(1:2N) — the
  eigenvector pair zggevx had stored there — and ztgsna then measured garbage.
- **Bug class**: `ignored-offset` (a declared offset/stride parameter that the
  kernel never reads). Fixed: all WORK accesses are now
  `oW + (k * sW)` with `oW = offsetWork*2`, `sW = strideWork*2`.
- **Where else it hides**: a scan for base.js files that declare
  `offsetWork`/`offsetRWork`/`offsetIWork`/`offsetBWork` but never reference it
  in the body found `zgelss`, `zgesvd` (offsetWork unused — open follow-up) and
  `zhgeqz` (benign: never touches complex WORK). Several kernels also ignore a
  workspace STRIDE (e.g. `ztgsna` hardcodes stride 1 for its DIF-path WORK;
  `dgeqrf`/`zgeqrf` pass `WORK, 1, ldwork` to dlarfb). Offsets matter — they are
  how a driver sub-allocates one caller WORK among its callees — whereas a
  stride on opaque scratch has no use case; prefer dropping workspace strides
  over "fixing" them.

## 2026-11-18 — ztgsen/ztgsyl tests ran with scrambled workspace arguments

- **Trigger**: adding the unit-workspace-stride assertion to every `ndarray.js`
  (CONVENTIONS.md D5). `ztgsen` and `ztgsyl` `test.ndarray.js` immediately threw
  "`strideIWork` must be 1 … Value: `0`".
- **Root cause**: the tests still passed the removed `lwork`/`liwork` arguments
  (`WK, 1, 0, -1, IWK, 1, 0, -1` and `null, 1, 0, -1, IWORK, 1, 0`). Every argument
  after `offsetWork` was shifted by one: `IWORK` received `-1`, `strideIWork`
  received the IWORK array, and so on. The tests passed anyway because the paths
  they exercise never touch IWORK, so the call looked fine.
- **Bug class**: `stale-arity-in-tests` — a signature change (dropping `lwork`) that
  left surplus arguments in test calls. Nothing compares test call arity against
  the function's arity; test files are also excluded from ESLint.
- **Where else it hides**: any test calling an ndarray function with more
  arguments than it declares. An argument-count check on test calls (like the
  `base-arity` conformance check, but for tests) would catch the class.

## 2026-11-18 — dgehrd/zgehrd strided wrappers under-allocated WORK on `null`

- **Trigger**: rewriting the zgehrd strided wrapper for the signature projection
  (PR #19 residue). A blocked-path test (`N = 40`, `WORK = null`) made zgehrd base
  throw "WORK array must have at least 3360 elements … Provided length: 40".
- **Repro (dgehrd, before fix)**: `dgehrd( 'column-major', 40, 1, 40, A, 40, TAU, 1, null )`
  with a full-rank A returns info 0 and an A full of NaN; the same call with
  `new Float64Array( 40*32 + 65*32 )` gives finite results. Real scalar, dense
  column-major, ilo = 1, ihi = N = 40.
- **Root cause**: the wrappers allocated `max(1, N)` elements, the *unblocked*
  dgehd2 size. Once `NH > NB = 32` base.js takes the blocked path and needs
  `N*NB + LDT*NB` (LDT = 65). zgehrd's base asserts the size and threw; dgehrd's
  base does not, so typed-array out-of-range writes were silently dropped and the
  factorization produced NaN.
- **Bug class**: `wrapper-null-work-undersized` — the same silent
  workspace-underallocation family as the dgeev/dhseqr pipeline bugs. Fixtures
  and the harness exercise base/ndarray with caller-owned WORK, so the wrappers'
  `null` auto-allocation path at blocked sizes is untested.
- **Fix**: both wrappers allocate `max(1, N*32 + 65*32)`; dgehrd gets a regression
  test comparing `null` against a caller buffer at N = 40.
- **Where else it hides**: every blocked routine whose strided wrapper
  auto-allocates WORK (`?ge*rf`, `?or*`/`?un*` blocked, `?sytrd`, …). A check that
  calls each wrapper with `WORK = null` at a size above NB and compares against
  a generously sized caller buffer would catch the class; base.js routines that
  do not assert WORK length should also be made to.

## 2026-11-18 — ztgsna passed a stale `lwork` to ztgsyl (found by the benchmark smoke run)

- **Trigger**: the regenerated `ztgsna` benchmark (job = 'both', howmny = 'all')
  threw "Cannot create property 'NaN' on number '-1'" inside ztgsyl at N = 100.
- **Repro (before fix)**: `ztgsna( 'both', 'all', SELECT, 1, 0, 40, A, 1, 40, 0, B, 1, 40, 0, VL, 1, 40, 0, VR, 1, 40, 0, s, 1, 0, DIF, 1, 0, 40, 0, WORK, 1, 0, IWORK, 1, 0 )`
  with an upper-triangular complex pair (see the N = 40 test in
  `lib/lapack/base/ztgsna/test/test.ndarray.js`). Complex scalar, dense column-major.
- **Root cause**: ztgsna/base.js called ztgsyl with `…, WORK, 1, offset, -1, IWORK, …` —
  a leftover `lwork` argument from before the caller-owns-WORK migration. Every
  argument after it shifted: ztgsyl's `IWORK` received `-1`. Only ztgsyl's
  blocked path (M or N > 32) writes IWORK, so the N <= 4 fixtures passed.
- **Bug class**: `stale-arity-in-internal-call` — the same signature-drift as
  `stale-arity-in-tests` above, but in library code calling a dependency.
- **Fix**: drop the `-1`; add the N = 40 regression test.
- **Where else it hides**: any base.js call to a dependency's base with surplus
  or missing arguments, reachable only on blocked/large-N paths. A static check
  comparing each internal call's argument count with the callee's declared
  arity would catch the whole class.

<!-- Add new entries above this line. -->

## 2026-11-18 — `tsc --checkJs` sweep: stale call signatures, dead WORK sizing, wrong option/LD validation

- **Trigger**: ran the TypeScript checker over every `lib/*/base/*/lib/*.js` using the
  existing JSDoc (`npm run typecheck`, config in `tsconfig.json` +
  `types/jsdoc-aliases.d.ts`). 222 errors → 0. Not a harness find, but recorded here
  because several are silent-wrong-answer bugs and each is a reusable bug class.
- **Silent wrong answers found:**
  - `zlaqr2`/`zlaqr3` (AED, only reached for N > 75): `zcopy( ns, V, strideV1, … )`
    copied V's first COLUMN, reference `ZCOPY( NS, V, LDV, … )` copies the first ROW
    → must be `strideV2` (same bug as the 2026-05-17 `dlaqr2` fix; the "isolated"
    audit then missed the complex twin). Also `zlarf` was called with a stale
    signature (a `Complex128` scalar instead of `(tauArray, offsetTau)`), shifting every
    later argument. Effect: `zgeev`/`zgees`/`zgeevx` returned info=0 with
    eigen-residuals ~1e-1 for N > 75. Repro + regression: `zgeev/test/test.ndarray.js`
    (random complex N=80, 120; `max |A v − w v|`).
  - `zggsvd3` forwarded `jobu='compute-U'` to `ztgsja`, which only recognized
    `'compute-vectors'` → Jacobi rotations never applied to U/V/Q (GSVD shared-R
    residual ~1). Fixed by making `dtgsja`/`ztgsja` use LAPACK's meaning
    (`'update'`/`'initialize'`/`'none'`) and having both GSVD drivers map their
    `'compute-*'` to `'update'` (reference xGGSVD3 forwards 'U'/'V'/'Q', which xTGSJA
    reads as "update"). Regression: `zggsvd3/test/test.ndarray.js` (shapes 5×4/4,
    6×5/3, 4×6/5; seed 7). The `dtgsja.ndarray` validation also accepted `'compute'`,
    which base silently treated as `'none'` (the benchmark timed the wrong path).
  - `dtrsna`/`ztrsna` default WORK was `max(1, LDWORK, N+6)` for a reference
    `WORK(LDWORK, N+6)` / `(LDWORK, N+1)` matrix → all SEP = NaN when WORK omitted.
    Same class in `dlarfb`/`zlarfb` (`max(1, LDWORK, K)` for an LDWORK-by-K matrix).
  - `ztgsen` passed a stale `lwork = -1` to `ztgsyl`, so `IWORK = -1` (only read on the
    blocked path, n1 or n2 > block size).
  - `dsaup2` computed `nev + np` on two length-1 `Int32Array`s (string concatenation).
- **Crashes on documented signatures:** 11 z-routines' default-WORK sizing used
  Fortran names (`NB`, `MB`, `NBLOCAL`, `N`, `lwork`) undefined in JS
  (`zgeqrt`, `zhetri2`, `zhetri2x`, `zsytri2x`, `zla_porpvgrw`, `zlatsqr`, `ztplqt`,
  `ztpqrt`, `zungtsqr`, `zungtsqr_row`, `zggbal`); `zhseqr` lacked the
  `Complex128Array` import → ReferenceError whenever WORK was omitted.
- **Option-validation class (new `option-parity` conformance check):** ~70 layout
  wrappers accepted a different option set than `ndarray.js` — generated from only the
  values seen in fixtures (e.g. `zgeev` rejected `'no-vectors'`, `dlarfb` rejected
  `'backward'`/`'rowwise'`, the xTREVC/xTGEVC/xHSEIN family rejected `side='both'`,
  xLACPY/xLASET rejected `uplo='all'`, RFP routines rejected `transr='transpose'`).
  Where `ndarray.js` was the over-permissive side it was tightened to the Fortran set:
  xGECON/xGBCON/xGTCON `norm` ('max'/'frobenius' silently computed the inf-norm
  estimate), xTREXC/xTRSEN `compq` ('initialize' silently skipped Q), RFP `transr`
  (real: N/T, complex: N/C). The conventions check's name-based demand for
  `isOperationSide`/`isMatrixTriangle` was what forced the narrow wrappers; it now
  accepts an explicit literal validation chain.
- **Leading-dimension class:** scaffolded wrapper LD checks ("rows if column-major,
  cols if row-major") ignored the option that makes a matrix optional
  (reference: `LDZ >= 1, and >= N when WANTZ`), used the wrong dimension
  (`dtgsja` LDV/LDQ vs M; `dlarfb` LDT vs M), or compared against an OUTPUT array
  (`max( 1, M )` with `M` an Int32Array → NaN → dead check: dstevx, dtgsen, dtgsna,
  dtrsen, ztgevc, ztrsen, ztrsna). Rewritten from the reference rules for the
  affected routines. **Where else it might hide:** any other wrapper whose LD check
  is not conditional on the corresponding job flag — the remaining wrappers were not
  audited against Fortran in this pass.
- **Also fixed**: 21 `ndarray.js` doc blocks were copied from a `base.js` helper
  (e.g. `zgecon` documented as "CABS1"); `ztrevc3`/`dtrevc3`/`ztrevc` never write the
  `M` output (documented, not changed).

## 2026-11-18 — Leading-dimension audit: wrapper LD checks regenerated from the reference rules

- **Method**: new cache `data/fortran-ld-rules.json` (`npm run gen:fortran-ld-rules`)
  records every routine's Fortran argument-check conditions on `LD*` plus the locals
  they use. `bin/conformance/ld-rules.js` translates them (flags inlined from
  base.js or translated from `LSAME`, option letters matched against the values
  ndarray.js accepts, cascades → ternaries); column-major = the Fortran rule,
  row-major = same rule with the bound replaced by the declared column count.
  `bin/codemod-ld-checks.js` rewrote 526 wrappers; the `ld-rules` conformance
  check now enforces the exact checks.
- **Classes found (≈220 wrappers had a real defect):**
  - *Rejected valid input*: BLAS-3 checked `LDA >= M` regardless of `transa`
    (`A` is K-by-M when transposed); every band routine (xGBMV, xSBMV, xTBMV/SV,
    xGBCON, xGBBRD, …) required `LDA >= M`/`N` instead of `KL+KU+1` / `K+1`, so
    standard band storage was unusable from the layout wrapper; vector arrays were
    required `>= N` even when not computed (Fortran: `>= 1` then).
  - *Accepted out-of-bounds input*: the same checks when `K > M`; `dggrqf` checked
    `LDB >= M` for a P-by-N `B`; several drivers (xGGES, xGGEV, …) had no LD check
    at all.
  - *Row-major aliasing*: `dtplqt`/`ztplqt` tests passed `LDT = 2` for a 2x3
    row-major `T` (rows overlapped); the tests only asserted `info === 0`. They now
    compare `T` against the column-major factorization (agrees to 1e-14).
- **LAPACK documentation errors found** (declared shapes that contradict the code,
  overridden in ld-rules.js): xGELQT3 and xTPLQT document `T` as `(LDT,N)` but use
  `(LDT,M)` (M reflectors); ZTRSNA documents `WORK(LDWORK,N+6)` (copied from DTRSNA)
  but only uses column N+1.
- **Spin-off bug class — binary `max`/`min`**: the stdlib `max`/`min` (and `fast/`)
  are binary; `max( 1, M, N )` silently returns `max( 1, M )`. Found because the
  translator emitted `max( 1, M, N )` for xGELS; 11 pre-existing call sites were
  wrong too, mostly default WORK sizes. Repro: `zgebrd( 'column-major', 3, 8, … )`
  with WORK omitted returned NaN in `d`/`e` (allocated `max(1,M)` instead of
  `max(M,N)`). New lint rule `no-nary-stdlib-minmax`; all sites nested.
- **Not verified (documented, enforced column-major only)**: row-major layouts of
  the block-structured TSQR/TSLQ `T` arrays (xLATSQR, xLASWLQ, xLAMTSQR, xLAMSWLQ,
  xORGTSQR(_ROW), xORHR_COL and complex twins) — marked `'skip'` in ld-rules.js;
  their existing row-major checks were kept unchanged.

## 2026-11-18 — Option values accepted beyond the reference: `trans` in 52 arguments (tickets/0014)

- **What**: real routines validated `trans` with stdlib's `isTransposeOperation`,
  which accepts `'conjugate-transpose'`, though reference DORMQR/DGEMQRT/DGELS/…
  accept only N and T; complex routines accepted `'transpose'`, though reference
  ZUNMQR/ZGELS/… accept only N and C. `base.js` sent the extra value down whichever
  branch its comparisons left over:
  - `dgemqrt`, `dgemlqt`, `dgels`, `dlamtsqr`, `dlamswlq`, `dtpmqrt`, `dtpmlqt`
    branch on `=== 'transpose'`. `dgemqrt( 'left', 'conjugate-transpose', … )`
    matched no branch and returned C unchanged, with `info = 0`.
  - Complex `zunm*`/`zgels`/… given `'transpose'` silently applied Qᴴ instead of
    rejecting.
  - Conversely `dtrsyl` rejected `'conjugate-transpose'`, which DTRSYL accepts.
- **Repro**: `dgemqrt( 'left', 'conjugate-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 )`
  before the fix: no error, C unchanged. Regression tests in
  `dgemqrt`/`zunmqr`/`dtrsyl` `test/test.ndarray.js`.
- **Root cause**: nothing compared accepted option values with the reference.
  `option-parity` only compares the wrapper against `ndarray.js`, and the
  `no-dprefix-conjugate-transpose` lint rule bans the *literal* in real routines
  but not its acceptance through the helper. The `dtrmm` instance of this class
  (2026-07-17) was fixed in that routine only.
- **Bug class**: `option-vocabulary` (accepted set ≠ reference set).
- **Fix (APPLIED)**:
  - `bin/gen_fortran_option_rules.js` evaluates each reference argument check
    letter by letter (A–Z, LSAME semantics, locals and IF/ELSE cascades,
    three-valued logic) → `data/fortran-option-rules.json`.
  - The new `option-rules` conformance check holds `ndarray.js` to it: exact for
    TRANS*/SIDE/UPLO/DIAG, by count otherwise.
  - `option-parity` now also fails on options the wrapper takes but never
    validates; 41 found, e.g. `dpftrs` forwarded `transr` unchecked.
  - `bin/codemod-option-rules.js` rewrote 104 files and inserted the 41
    validations.
  - Fixing them exposed 13 scaffolded tests that passed invalid option values
    (`transr = 2`, `'no-transpose'` as `direct`) and only passed because the
    wrapper didn't validate.
  - `tsc` then narrowed `trans` and flagged 4 now-unreachable `=== 'transpose'`
    checks in `zgemqrt`/`zlamtsqr`, which were removed.
- **Not covered**: options `ndarray.js` never validates (88 arguments) are
  skipped by the check; see tickets/0022.

## 2026-11-18 — Generated LD checks compared against output arguments (tickets/0001)

- **What**: the leading-dimension checks generated earlier the same day gave
  three wrappers row-major bounds built from the routine's *output* count `M`:
  - `dstevx`: `LDZ < max( 1, max( 1, M ) )`;
  - `dtgsna`/`ztgsna`: `LDVL`/`LDVR < max( 1, M )`.

  In `dstevx`/`dtgsna` `M` is an `Int32Array`, so `max( 1, M )` is `NaN` and the
  check could never fire. In `ztgsna` `M` is a scalar the caller passes and
  `base.js` overwrites, so the check compared against a meaningless input.
  Undersized row-major `Z`/`VL`/`VR` were accepted and then read and written
  out of bounds.
- **Repro**: `dstevx( 'row-major', 'compute-vectors', 'all', 3, …, Z, 1, … )`
  returned instead of throwing. Regression tests are in `test.dstevx.js` and
  `test.dtgsna.js`; both fail on the old checks.
- **Root cause**: `bin/conformance/ld-rules.js` substituted any same-named
  wrapper parameter for a Fortran identifier. The `ld-rules` check verifies
  wrappers against that same translation, so it passed the bad checks. Found by
  type-checking with stdlib's declarations loaded (tickets/0003): `max` takes
  `(number, number)`.
- **Bug class**: `generator-self-validation`, a check that compares code to the
  output of the generator that produced it inherits the generator's mistakes.
  Here the specific mistake was output-as-bound.
- **Fix (APPLIED)**: the translator refuses array-typed parameters (detected
  from the JSDoc type *or* from `base.js` indexing the parameter, since the JSDoc
  is unreliable; see tickets/0002) and reference `INTENT(OUT)` arguments. Such a
  rule is reported unresolved until `COLS` gives the column count:
  - `stevx`: `range === 'index' ? iu - il + 1 : N`, as for `syevx`;
  - `tgsna`: `mm`, as for `trsna`.

  Exactly these three wrappers changed.

---

## 2026-11-18 — `*latrs`/`*latps`/`*latbs` (all six scaled triangular solvers) routed overflowing no-transpose non-unit solves to the unscaled fast path → NaN with `scale = 1`; root cause of the old zlatps offset entry (tickets/0019)

- **What**: the new `zlatps` harness validation (`lib/lapack/base/zlatps/test/test.validate.js`)
  added a `stress` family (off-diagonals × 1e40) so that the careful,
  rescaling path is actually exercised; earlier fixtures and properties only
  ever reached the `ztpsv` fast path. For `trans='no-transpose'`,
  `diag='non-unit'`, N ≥ 9, `zlatps` returned `scale = 1` and a solution full of
  NaN, which violates the routine's contract that it never overflows. The same
  input shape breaks `dlatps`, `dlatrs`, `zlatrs`, `dlatbs` and `zlatbs`. In a
  sweep of N ∈ {9,12,16} × uplo × trans × diag × 5 seeds, about 30 cases per
  routine were non-finite, all of them no-transpose non-unit.
- **Repro**: `sc=complex`, `logical.triangular(sc, new RNG(0x200+N), N, {uplo})`
  with every off-diagonal scaled by `1e40`, RHS `sc.random`, N=16, any uplo,
  `zlatps(uplo,'no-transpose','non-unit','no',…)`: `scale[0] === 1` and `x`
  contains NaN. The regression cases in each module's `test.ndarray.js` use a
  deterministic N=12 matrix and fail on the old code.
- **Root cause**: the growth-bound loop for the no-transpose non-unit case
  exits with `IF( GROW.LE.SMLNUM ) GO TO 60` (`GO TO 50` in the real routines).
  Label 60 sits *after* the `GROW = XBND` that follows the loop, so the early
  exit keeps the tiny `GROW` and forces the careful path. The translation used
  `break`, which falls through into `grow = xbnd`. `xbnd` is the bound from
  the *previous* step (about 1e-280 here), well above `SMLNUM`, so the solve
  went to the unscaled `*tpsv`/`*trsv`/`*tbsv` and overflowed. The transpose
  loops have the same `GO TO 90` shape, but their post-loop statement is
  `grow = min(grow, xbnd)`, which keeps an already-small `grow`, so they were
  unaffected. The complex routines also dropped the
  `IF( TJJ.GE.SMLNUM ) … ELSE XBND = ZERO` branch in both non-unit loops.
- **Fix (APPLIED)**: in all six, `grow = xbnd` now runs only when the loop ran
  to completion (`if ( j === jlast )`). The complex routines restore the
  `XBND = ZERO` branch in both loops.
- **Explains tickets/0019 / the 2026-07-17 zlatps AP-offset entry**: that ~1 ULP
  offset dependence was a separate defect, already fixed by 549b87df. The
  lower CNORM loop started `ip` at `offsetAP*2` and then read
  `offsetAP + ip/sap + 1`, which counted `offsetAP` twice. Any nonzero offset
  fed wrong column norms into `normin='no'`, and `zppcon` lower then reused
  them (`normin='yes'`) in its `Lᴴ` solve, which is why the symptom showed up
  there. Run against the pre-549b87df `zlatps`, the stress sweep gives 1,950
  stride-1 offset failures; the current code gives 0 of 8,400. The new
  validation checks bit-exact x, scale and CNORM across offsets and positive
  strides on both paths, so a recurrence fails loudly.
- **Bug class**: `goto-translation` (a `GO TO` past a post-loop statement
  translated as `break`). A `break` is only equivalent when nothing sits
  between the loop end and the target label. Now a row in
  `docs/goto-patterns.md`.
- **Generalization**: the same bug was copy-translated into all six members of
  the family, so it was searched for and fixed in all six (tickets/0018).
  Before trusting any `break`, look for any Fortran routine whose `GO TO`
  target lies past code between the loop end and the label. Separately, the
  stress sweep showed that a negative packed/band stride breaks the CNORM
  computation in the whole family, because `dasum`/`dzasum` return 0 for a
  non-positive stride (tickets/0044).

---

## 2026-11-18 — zgsvj1 convergence test used the REAL variant's `N*TOL` instead of `SQRT(N)*TOL` → could report convergence one sweep early

- **What**: found while triaging `bin/break-mutants.mjs` survivors in the
  `*gsvj0`/`*gsvj1` family (tickets/0045). `zgsvj1.f:661` stops sweeping when
  `MXAAPQ < SQRT(DBLE(N))*TOL`; the JS used `mxaapq < N * tol`, the threshold of
  the real `dgsvj0`/`dgsvj1` (`zgsvj0` was already correct).
- **Effect**: a looser test than the reference, so `info = 0` could come back a
  sweep early with less-orthogonalized columns. Easy to trigger: many 4×4
  inputs with `n1 = 1` give `info = 0` where the reference gives `nsweep - 1`.
- **Repro**: regression test in `lib/lapack/base/zgsvj1/test/test.ndarray.js`
  (M=N=4, n1=1, tol=1e-2): after one sweep, the first pair of sweep 2 has
  |cos| = 2.75·tol, which lies in [√N·tol, N·tol), so the reference keeps going
  and `nsweep = 2` must return `info = 1`. Fails on the old code with `info = 0`.
- **Fix (APPLIED)**: `mxaapq < Math.sqrt( N ) * tol`.
- **Bug class**: `real-complex-constant-drift`: a complex routine translated from
  (or alongside) its real sibling inherits a constant that differs between the two
  reference sources. Line coverage cannot see it, and a fixture only catches it if
  some input lands between the two thresholds.
- **Generalization**: diff numeric thresholds between each `d`/`z` pair of
  reference sources where they differ, and check that the JS follows each
  source, not its sibling. Candidates: `zgesvj`/`zgejsv` and other Jacobi or
  iterative routines with tolerance tests (tickets/0007 covers d/z contract parity).

---

## 2026-11-18 — dsterf QR deflation search: a "loop completed" fix-up also fired on a break at `m = lend + 1` → lost a decoupled eigenvalue

- **What**: found by `bin/break-mutants.mjs` (tickets/0045). Its mutants at the
  QR search loop survived, and triage showed why: the post-loop code was wrong
  in a way no test could see. The second bug of the GO TO-as-break class today,
  after the `*latrs`/`*latps`/`*latbs` growth bound.
- **Root cause**: the Fortran is `DO 110 M = L, LEND+1, -1; IF(...) GO TO 120;
  110 CONTINUE; M = LEND; 120 CONTINUE`. The JS loop
  `for ( m = l; m > lend; m-- ) { … break; }` already leaves `m = lend` when it
  completes. Its comments wrongly assumed it exits at `lend + 1`, and added
  `if ( m === lend + 1 ) m = lend`. That fix-up never fires on completion. It
  fires exactly when the loop BREAKS at `m = lend + 1`, overwriting the split
  the Fortran keeps: `E(LEND)` was not zeroed, and the negligible element was
  folded back into the next QR sweep or `dlae2` 2×2.
- **Repro**: `dsterf(3, d=[1e-20, 1e-20, 0.5e-20], e=[1e-20, 1e300])`. The
  1e300 norm triggers scaling, the scaled `e[0]²` underflows, and the QR search
  breaks at `lend + 1`. Old output `[-1e300, 0, 1e300]`, fixed (reference
  semantics) `[-1e300, 1e-20, 1e300]`. Regression test in
  `lib/lapack/base/dsterf/test/test.ndarray.js`.
- **Fix (APPLIED)**: removed the fix-up. Also removed two empty
  `if ( m === … ) { /* comments */ }` blocks after the other search loops, whose
  comments repeated the same confusion.
- **Bug class**: `goto-translation`, in the form "a completion guard that tests
  an index value a break can also produce". `j === jlast` is a safe completion
  test only when the loop's test is `j !== jlast` (the break index can never
  equal it). `m === lend + 1` after `m > lend` is not safe.
- **Generalization**: grep found no other `m === lend + 1` fix-ups; `dsteqr`,
  `zsteqr` and `dstqrb` use the correct form. The mutation check catches the
  class wherever a test can make the two exits differ.

---

## 2026-11-18 — dlaqr4 hardcoded its ILAENV tuning values and dlaqr0 mis-rounded the IPARMQ shift count → valid Schur forms in a different order than the reference (tickets/0046)

- **What**: surfaced while triaging `bin/break-mutants.mjs` survivors in the
  shift-pairing code (tickets/0045). A bit-exact `dlaqr0` vs `dlaqr4` oracle
  (the reference sources are identical apart from the AED routine) failed
  because `dlaqr4` used `nwr = 4, nsr = 2, nmin = 15, kacc22 = 0` instead of the
  IPARMQ values the reference gets through ILAENV. Separately, `dlaqr0`'s
  `iparmqShifts` computed `round(nh / log2(nh))` where IPARMQ has
  `NH / NINT(LOG(NH)/LOG(2))` (integer division by the rounded log): nh = 200
  gave 26 shifts instead of 24.
- **Repro**: `dlaqr4` on `test/fortran/test_dlaqr4.f90` tests 9/10 (40×40,
  80×80). The unsorted eigenvalues differed from the reference fixtures by 13.5
  and 30.0 (the sorted ones agreed). Those fixtures existed but were never loaded
  (tickets/0048). Now within ~4e-13; the tests fail on the old code.
- **Fix (APPLIED)**: `dlaqr4` shares `dlaqr0`'s IPARMQ constants and helper;
  the NS formula is `Math.floor( nh / Math.round( log2( nh ) ) )`.
- **Bug class**: `tuning-parameter-drift`. A wrong ILAENV substitute still yields
  a valid decomposition, so every property test passes; only an unsorted
  comparison against the reference shows it.
- **Generalization**: `dlaqr3`'s `nmin = 12` (reference 75) and
  `zlaqr0`/`zlaqr4`'s fixed NWR/NSR remain (tickets/0049).

---

## 2026-11-19 — dpocon/dppcon/dpbcon/zpbcon: the overflow bail of the DLACN2 loop fell into the RCOND computation the Fortran skips → rcond ≈ 2.9e-308 instead of 0

- **What**: found while triaging `bin/break-mutants.mjs` survivors in the
  `*con` family (tickets/0045). The siblings `zpocon`/`zppcon` were correct.
  These four were not on the triage list and had no survivor at all, because the
  tool treated both exits of the loop alike.
- **Root cause**: the Fortran leaves the DLACN2 loop on overflow with
  `IF( SCALE.LT.ABS( WORK( IX ) )*SMLNUM .OR. SCALE.EQ.ZERO ) GO TO 20`, where
  label 20 lies past `IF( AINVNM.NE.ZERO ) RCOND = ( ONE / AINVNM ) / ANORM`. The
  JS used `KASE[ 0 ] = 0; break;`, which runs that computation.
- **Repro**: `dpocon( uplo, 2, [1, 0, 0, 1.2e-154], 1, 2, 0, 1.0, … )` (and the
  packed and band equivalents). The second solve overflows while EST is already
  about 3.5e307, so the reference gives rcond = 0 but the old code gave
  2.88e-308. Regression tests in each module fail on the old code.
- **Fix (APPLIED)**: `return 0;` at the bail (rcond is already 0).
- **Bug class**: `goto-translation`, the third instance this week: a `GO TO`
  past post-loop code translated as `break`. This time only ONE of the loop's
  two exits must skip the code.
- **Detection**: `bin/break-mutants.mjs` now adds a `skip-after-this-break`
  mutant per `break` when a loop has several. It also no longer wraps a
  `const`/`let` declaration (that caused a ReferenceError and a false "killed").
  On the old `dpocon` it reports the bail exit as SURVIVED.

---

## 2026-11-19 — zlasyf_rk mixed two variants of the KP≠KK column interchange → wrong factorization whenever rook pivoting needs a real interchange

- **What**: found while triaging break mutants in the `*sytrf_rk` panel family
  (tickets/0045). A new residual test (rook-forcing 6×6 matrix, one panel,
  solved with `zsytrs_3`) gave solve errors of 0.16 (upper) and 1.08 (lower),
  against about 2e-15 from the unblocked `zsytf2_rk`.
- **Root cause**: the reference sets `A(KP,K) = A(KK,K)` and counts the following
  copies from K. The JS kept that assignment but used the copy counts of the
  OTHER variant (which sets `A(KP,KP) = A(KK,KK)` and counts from KK):
  `kk-1-kp` instead of `K-1-KP` (upper) and `kp-kk-1` from row kk+1 instead of
  `KP-K-1` from row K+1 (lower). The upper column copy also dropped Fortran's
  1-based count `KP`, copying `kp` instead of `kp+1` elements.
- **Fix (APPLIED)**: counts as in `zlasyf_rk.f` lines 526/528/843. The panel now
  matches `zsytf2_rk` to 3e-16. Affects `zsytrf_rk` for N > nb.
- **Bug class**: `variant-mixing`: a translation that combines two valid forms of
  the same step but takes index bounds from the wrong one. It only shows with a
  rook search that needs a KP ≠ KK interchange, which the Fortran fixtures never
  exercised.
- **Generalization**: grep of every `kk-1-kp` / `kp-kk-1` site in the
  `*lasyf*`/`*lahef*` routines found zlasyf_rk the only mixed one; `dlasyf_rk`
  and `zlasyf_rook` use the other variant consistently.

---

## 2026-11-20 — Callees handed a literal or another array's stride: 21 call sites in 7 routines walked the wrong elements under any non-default layout (lint `stride-provenance`, CONVENTIONS S13)

- **What**: `base.js` passed one of its own arrays to a callee with a stride
  that wasn't that array's. Fortran's `X(1,K), 1` (walk a column, unit stride
  in column-major) was translated literally as `1` instead of the array's row
  stride, or a vector was handed to a matrix routine with its stride in the
  wrong slot. With unit-stride, column-major, zero-offset fixtures every one of
  these is invisible.
  - `dsterf` (6): `dlascl( …, n, 1, d, 1, strideD, … )`, scaling `d`/`e` as an
    N×1 matrix with row stride `1`.
  - `dgees` (4), `zgees` (1): the same pattern on `WR`/`WI`/`W` during sorting.
  - `ztgsna` (6): `dznrm2( N, VR, 1, … )`, and `zgemv`/`zdotc` on columns of
    `VR`/`VL` with stride `1`, where the stride should be `strideVR1`/`strideVL1`.
  - `zgbbrd` (2): `zrot( kumu, AB, 1, …, AB, 1, … )` down a band column; the
    stride should be `strideAB1`. The sibling call two blocks up was right
    (`strideAB2 - strideAB1` for `LDAB-1`).
  - `dorbdb3`, `zunbdb3` (1 each): `X21` rotated with `X11`'s stride
    `strideX112`. **The reference has the same typo** (`X21(I,I), LDX11`); see
    those modules' `DIFFERENCES.md`.
- **Repro**: `lib/lapack/base/<routine>/test/test.layout.js`, via
  `test/harness/spec-layout.js`. Each one fails on the code before this fix
  and passes after. On the old code:
  - `dsterf` row-major returned `info = 4` (no convergence) instead of 0;
  - `dgees` negative stride gave `WI[1]` −1.8e138 instead of −5.9e149;
  - `zgees` row-major sorted 3 eigenvalues instead of 5;
  - `ztgsna` row-major gave `s[0]` 0.544 instead of 0.514;
  - `zgbbrd` row-major changed `AB`;
  - `dorbdb3`/`zunbdb3` with distinct leading dimensions returned NaN in `X11`.

  Seeds and sizes are in the tests.
- **Root cause**: line-by-line translation of Fortran increments. A literal
  `1` (or `LDx`) in a Fortran call is a statement about column-major storage.
  In the strided form it has to become the corresponding stride
  (`1` → `strideX1`, `LDX` → `strideX2`) of *that* array.
- **Bug class**: `literal-stride` / `foreign-stride`: a callee argument slot
  for array A's stride, filled with a constant or another array's stride.
- **Where else**: the rule now checks every `base.js`. 81 more sites had the
  same shape but were harmless: the column stride of an N×1 view, a length-1
  `zscal`, `nrhs = 1` extents. They were conformed anyway; the rule has no
  exemptions. Not yet covered: an element access inside `base.js` that mixes
  strides of two arrays (rule P2, which needs the one-index-variable-per-array
  convention first), and calls into routines whose base signature isn't in a
  spec.
- **Fix (APPLIED)**:
  - The 1-D sites were fixed by the rule's autofix: an array with a single
    stride can only mean that stride.
  - The 2-D sites were fixed by hand against the Fortran: which stride a
    callee should walk is a translation judgment.
- **Harness note**: `spec-layout.js` NaN poison can't see a write that only
  *scales* a slot (V8 keeps NaN payloads through arithmetic). The `zgees`
  test therefore uses a magnitude-based `select`: `W` is recomputed afterwards,
  so the sort decisions are the only observable trace of a mis-scaled `W`.
- **Separate bug found along the way**: `zgees` returns NaN with `info = 0`
  for inputs below `smlnum` (about 1e-140). It's not stride-related.
  tickets/0026.

## 2026-11-20 — `dcabs1` returned NaN for every documented input (found by the benchmark generator)

- **Found by**: `bin/gen-benchmark.mjs lib/blas/base/dcabs1`. The probe passed
  the documented `{Complex128}` and got `NaN result`. No seed is needed; every
  input fails: `dcabs1( new Complex128( 3, -4 ) )` returned `NaN`.
  Scalar complex, no storage scheme, no flags.
- **Root cause**: the JSDoc codemod (229c433e5) brought the JSDoc in line with
  `spec/dcabs1.json` (`z`: complex128 scalar). `base.js` still read `z[ 0 ]` /
  `z[ 1 ]`, i.e. a 2-element `Float64Array`, and the d.ts, repl.txt, README,
  example and tests all still used that array form. Every public call that
  followed the spec read `undefined`.
  The tests passed because they used the old array form too.
- **Bug class**: `doc-impl-type-drift`: the JSDoc type changed to match the
  spec, but the implementation and its tests kept the old representation.
  The tests share the stale assumption, so they can't catch it.
- **Where else**: any scalar complex parameter (`role: scalar`, `dtype:
  complex128` in spec/) whose base reads it by index. The benchmark generator
  probes every public signature with its documented types, so a full
  `gen-benchmark.mjs` run (no `--write`) surfaces these as `NaN result` or
  type errors. Only `dcabs1` showed up across all 915 modules. A lint rule
  could flag `<param>[ 0 ]` in a base.js whose spec says that param is a
  complex128 scalar.
- **Fix (APPLIED)**: base reads `real( z )` / `imag( z )`. The tests, example,
  README, repl.txt and d.ts now take `Complex128`.
- **Sweep (2026-11-20)**: every spec param with `role: scalar`, `dtype:
  complex128` checked for `<name>[ 0|1 ]` in its base.js. One more hit:
  `zrot`'s `s`, where `zrot( N, x, 1, y, 1, c, new Complex128( 0.8, 0 ) )`
  returned NaN (found the same way, by the generator's NaN-result probe).
  There, 11 internal callers (ztgsja, zhgeqz, ztrexc, ...) pass `s` to the
  base as zlartg's in-place `[re, im]` output in hot loops. So the base keeps
  that pair, and the public wrappers (strided, ndarray) convert the documented
  `Complex128` to it. The tests and example now use `Complex128`.

---

## 2026-11-20 — dhsein passed `'infinity'` to dlanhs, which accepts `'inf-norm'` → EPS3 was always SMLNUM, and equal selected eigenvalues could loop forever

- **What**: found by break-mutant triage (ticket 0045, wave 2b). The mutants at
  the eigenvalue-perturbation loop survived because no test had near-equal
  selected eigenvalues.
- **Root cause**: `hnorm = dlanhs( 'infinity', … )`. Base `dlanhs` tests
  `'max'`, `'one-norm'`, `'inf-norm'` and `'frobenius'`, and returns 0 for
  anything else. So `eps3 = hnorm * ULP` collapsed to `smlnum`.
- **Effect**: eigenvalues closer than ||H||·ULP were never perturbed apart.
  With two exactly equal selected eigenvalues in one block, `wkr += smlnum`
  leaves `wkr` unchanged and the perturbation loop never ends (repro:
  `H = [[1,1],[0,1]]`, `WR = [1,1]`, all selected). `dlaein` also received the
  wrong EPS3.
- **Fix (APPLIED)**: `'inf-norm'`. The test "EPS3 is scaled by the infinity
  norm of H" fails on the old code.
- **Bug class**: `internal-option-string`: a misspelled option between two base
  functions, where the callee silently defaults.
- **What allowed it**: public wrappers validate option strings, but nothing
  checks base-to-base calls (ticket 0056). Fixtures never had near-equal
  eigenvalues, and EPS3 only shows in the vectors at ULP level.

---

## 2026-11-20 — zhbgst kept a superseded draft line that corrupted AB(1, I-K+KA) before the rotation read it

- **What**: found by break-mutant triage (ticket 0045, wave 2b). The upper
  kb >= 2 bulge chase ran `Ab[p] = abi*tr + bbr2*ti + abr*Ab[p]; // wrong: ...`
  before `abr = Ab[p] // save old`, so the rotation (Fortran lines 414–418)
  used a corrupted value. A dead `while ( true ) { … break; }` scaffold with
  "Let me restructure" comments sat nearby.
- **Fix (APPLIED)**: removed both. X for `upper_n7_ka2_kb2_vect` now matches the
  reference to 5.6e-17 (the test fails on the old code with relErr 1.5e-5).
- **Not fixed**: AB in the kb >= 2 cases still differs from the reference by up
  to 1e-1, upper and lower (ticket 0053).
- **Bug class**: `draft-remnant`: an abandoned first attempt left in the code.
- **What allowed it**: no check looks for drafting remnants (ticket 0054). The
  module's kb >= 2 tests were weakened to "info = 0 and finite", and the known
  discrepancy was recorded in a test comment rather than a ticket (ticket 0055).

---

## 2026-11-22 — zhbgst kb >= 2: ZLARTG outputs aliased onto live storage, and upper phase-1 ZLARTV rows off by one (resolves ticket 0053)

- **What**: the kb >= 2 bulge chase of `zhbgst` differed from the reference
  by up to 6e-2 in AB (and up to 1.8e-2 in X), for both upper and lower. The
  six affected tests had been weakened to "info = 0 and finite". Found while
  checking the code behind drafting-remnant comments (ticket 0054).
- **Bug 1, all four bulge-rotation sites**: the Fortran
  `ZLARTG( AB(…), RA1, RWORK(…), WORK(…), RA )` uses local scalars RA1 and RA.
  The JS put RA1 into `WORK(1)`, which holds a live rotation sine, and wrote
  R back into the AB input element. The later ZLARTV then rotated that
  element a second time. Fixed with module-level scratch, so ZLARTG writes
  neither AB nor WORK.
- **Bug 2, upper phase 1 (Fortran loops 110, 140, 190, 220)**: ZLARTV "from
  the left" used rows `l`/`l+1` for Fortran `AB(L,…)`/`AB(L+1,…)` instead of
  `l-1`/`l`. Phase 2 had them right. Each bug matters on its own (bug 2
  alone leaves 2.7e-2 to 3.4e-2).
- **Repro / tests**: the six kb >= 2 tests now compare AB and X against the
  Fortran fixtures at 1e-12. All six fail on the old code. Errors after the
  fix are below 5e-16.
- **Bug classes**: `scalar-output-aliased-onto-storage` (a Fortran local mapped
  onto an array slot) and `off-by-one-index-conversion`.
- **What allowed it**: tests weakened to finiteness checks (now caught: a
  comment admitting the gap must cite a ticket, ticket 0055); draft code
  left in place (now linted, ticket 0054); and no layout-fuzzed harness
  validation for `zhbgst`.
- **Where else**: the real sibling `dsbgst` uses local scratch for DLARTG and
  correct DLARTV rows. Across the corpus, `zgbbrd` and `zhbtrd` also route
  ZLARTG's R to local scratch, as the reference does.

## 2026-11-22 — Public wrappers given `WORK = null` allocated too little, and typed arrays dropped the overflow silently (resolves ticket 0060)

- **What**: 15 `<routine>.js` wrappers allocated an insufficient workspace
  when the caller passed `null`. Writes past a typed array's end are no-ops
  and reads return `undefined`, so results were NaN or quietly wrong with no
  error. Example: `dlarf( 'column-major', 'left', 3, 3, v, 1, 1.5, C, 3, null )`
  returned NaN in 6 of 9 outputs.
- **Instances**:
  - Ten length-1 placeholders left by the caller-owns-WORK codemod
    (d9987da56), each under a "set correct size" comment: `dlarf`, `dopmtr`,
    `dorm2l`, `dorm2r`, `dorml2`, `dormr2`, `dormr3`, `dtpmqrt`, `dtprfb`,
    `zgemqrt`. The reference size depends on SIDE: `(N)` if SIDE = 'L', `(M)`
    if SIDE = 'R'.
  - `ztrsen`, length 1; the reference LWORK depends on JOB and on M, the
    number of selected eigenvalues.
  - Four found by the new guard: `ztgsen` (WORK and IWORK of length 1);
    `dorbdb2`/`zunbdb2` (M-Q instead of LWORKMIN = 1+MAX(P-1,M-P,Q-1)); and
    `dlaqz4` (N instead of N*NBLOCK_DESIRED).
- **Repro / tests**: `test/harness/nullwork.js` calls a wrapper on identical
  inputs with `WORK = null` and with an ample workspace, and requires
  bit-identical outputs. Tests in the 12 wrappers without one (both sides; every JOB of
  `ztrsen`; IJOB 0-5 of `ztgsen` with a proper subset selected) fail on the
  old code. `dorbdb2`, `zunbdb2` and `dlaqz4` were already exercised by their
  own tests, so the guard covers them.
- **Bug class**: `workspace-undersized-on-null` (an allocation copied from
  one branch of a conditional reference size, or a placeholder never sized).
- **What allowed it**: CONVENTIONS D5c says "sufficient", but its enforcers
  checked only that a null branch exists. The spec records one branch of
  SIDE-conditional sizes (ticket 0062), so it could not serve as the
  reference. The wrapper tests only checked argument errors, so no test
  called the null branch (ticket 0063: 270 of 420 allocating wrappers are
  still unexercised).
- **Enforcer**: `bin/workspace-guard.mjs` (CI job `workspace`, changed
  modules). It reruns a module's own tests with each null-allocated workspace
  forced to `null` and allocated through a sentinel guard region. Any changed
  sentinel fails the job.
- **Harness lessons (the guard's own bugs, found before it shipped)**:
  1. Routines that size their blocking from `WORK.length` (`zgebrd`'s lwork)
     legitimately used the guard region. That gave false overruns in
     `zgelss`, `dorbdb2`, `zunbdb2` and `dlaqz4`. Fix: the guarded array
     reports `length = n`.
  2. `zgelss` re-bases with `WORK.subarray( offsetWork )`, which rebuilt the
     full length. Fix: `subarray` keeps the clamp but still extends into the
     guard.
  3. Clamping `length` also cut short the exit scan for real arrays (the
     scan looped to `view.length`), so the guard missed everything real-typed
     until the old `dlarf` was checked again. Fix: record the real extent
     before clamping.

  Every guard change was re-verified against a known-bad wrapper: run the
  old code and require the guard to fail.
- **Where else**: any wrapper that sizes a workspace from a conditional
  reference formula. The corpus run (420 wrappers) reports 0 overruns in the
  150 that are exercised. The other 270 are unchecked until ticket 0063.

## 2026-11-23 — Wrapper replay: public wrappers disagreed with ndarray.js in about 235 of 912 modules (tickets 0065, 0068, 0072–0074)

- **What**: `bin/wrapper-replay.mjs` (test/harness/replay.js) records every
  valid `ndarray.js` call a module's own tests make. It replays each call
  through `<routine>.js` in several variants:
  - exact, with the recorded workspaces;
  - `WORK = null`;
  - transposed (row-major);
  - zero-size;
  - validation (each throw statement, one argument made invalid).

  It also audits each vector length the wrapper assumes, by instrumenting
  its `stride2offset` calls. The first whole-corpus run flagged 235
  modules.
- **Bug classes found** (each with tests that fail on the old code):
  - `wrapper-vector-length`: a wrapper computed a negative-stride offset
    from the main dimension instead of the vector's length:
    - TAU uses `min(M,N)` or K;
    - off-diagonals use N-1;
    - FERR/BERR use NRHS;
    - SIDE- and TRANS-dependent lengths (`dlarf` v, `dgemv`/`dgbmv` x and
      y, `dormtr` TAU).

    161 wrappers were fixed by `bin/codemod-vector-lengths.mjs`, verified
    by the replay; more followed by hand and in agent waves. With a
    negative stride the old offset addressed the wrong elements, giving
    NaN (`dlarf`, `dgbmv`: y = [NaN, NaN, NaN, 86, 88]).
  - `workspace-undersized-on-null` again (ticket 0072): `base.js` blocks
    with NB = 32 and needs LDWORK*NB (+ the T block), while the wrapper
    allocated the unblocked minimum. Affected:
    - `dorglq`, `dorgrq`, `dorgtr`, `zunglq`, `zungqr`, `zungtr`;
    - `dormql`, `dormrq`, `dormtr`, `zunmtr`;
    - `zungtr` at N = 0 (`new Complex128Array(-1)`).
  - `layers-disagree` (ticket 0074): `ndarray.js` and the wrapper behaved
    differently on the same call:
    - `dlacn2`'s `ndarray.js` had an N = 0 quick return the reference
      lacks;
    - `zgehrd`'s `ndarray.js` returned undefined for N = 0;
    - `zlar1v` skipped its WORK check at N = 0 although base reads
      WORK[0].
  - `wrapper-rejects-valid-call` (ticket 0073):
    - `dlabrd`/`zlabrd` checked LDX/LDY against the wrong dimension;
    - `ddisna` threw for N < 0 where the reference returns INFO = -3 only
      when K < 0.
  - `undersized-test-output`: `dgesvd`'s own test passed a 1-element U for
    jobu = 'all-columns' (3-by-3); typed arrays drop the writes, so the
    test passed.
- **Spec generator fixes the replay forced**:
  - flag-conditional 1-D extents (`(N) if SIDE = 'L' or (M) if SIDE =
    'R'`, BLAS `… otherwise`; ticket 0062, 2-D still open);
  - an unreachable `: -1` option-code arm (dsteqr LDZ);
  - option tests folded inside a guarded check (the expert drivers'
    EQUED).

  Each had left generated code with a branch no input can take.
- **What allowed it**:
  - The wrapper layer had no valid-input tests: 299 of 420 allocating
    wrappers had only shape and throw tests (ticket 0065).
  - The coverage check measured only `test.js` and `base.js` (ticket
    0064).
  - The spec flattened conditional sizes, so it could not serve as an
    oracle (ticket 0062).
  - Nothing compared the layers with each other.
- **Harness lessons (the replay's own false positives, each fixed before
  trusting a finding)**:
  - LD groups share their offset with the next group (the map-back
    overwrote a matrix with its row-major copy).
  - A returned argument (`daxpy`'s y) must not count as an extra output
    when probing.
  - Workspace-dependent blocking changes rounding, so `WORK = null` needs
    a tolerance.
  - Col/row kernel switches reorder arithmetic, so the transposed variant
    checks structure only.
  - Error-estimate outputs (FERR/BERR) are compared within a factor 2.
  - Integer-typed outputs are compared exactly, floats are not.
  - A wrapper replaces `null` by an allocation before its checks, so a
    violation counts only once some candidate actually throws.
  - Lint-enforced code may contain branches no input can take; that is
    fixed at the generator.

  Every change was re-checked against a known-bad module.
- **Where else**:
  - negative strides inside `base.js` itself (`dlassq`/`zlassq` re-apply
    the BLAS start index; ticket 0078; the replay cannot see these because
    both layers share `base.js`);
  - caller-provided undersized WORK passed through unchecked (ticket
    0077);
  - quick returns guarded by related arguments (ticket 0076).

## 2026-11-24 — Wrapper replay: one probe that never returned hid every finding of 20 modules, and cost 180 s each per corpus run (ticket 0070)

- **Symptom**: a cold `node bin/wrapper-replay.mjs --all` reported 20 modules as `timed out` (dlaqr5, dlarrb, dlarrj, dlasyf, dlasyf_rk, dlasyf_rook, dsytri2x, dsytri_3x, zgeev, zhetrd_he2hb, zhetri2x, zhetri_3x, zlahef, zlahef_rk, zlahef_rook, zlasyf, zlasyf_rk, zlasyf_rook, zsytri2x, zsytri_3x). Their tests take under a second. Because errors are never cached, every warm rerun paid 20 × 180 s again.
- **Reproduce**: on the parent of this commit, `node bin/wrapper-replay.mjs dlasyf` (180 s, then `timed out`).
- **Root cause**: the replay's probes run a routine outside its domain, and the harness called it with no bound. A paused debugger (`node --inspect` with `Debugger.pause`) showed:
  - zero-size probe with `nb = 0`: dlasyf and dsytri2x loop forever (`eachDim` → dgemm/dtrmm);
  - the length audit's NaN-poisoned storage: dlarrb bisects NaN for most of a second per trial, over hundreds of trials (`touchedHigh`).

  The child-process timeout then threw away every result of the module: valid findings sat behind the hang, for example dsytri2x's `null-work` giving NaN (an undersized wrapper allocation).
- **Fix**:
  - Every call the replay makes goes through `bounded()` (`vm.Script.runInContext` with `timeout`, which interrupts synchronous module code). The budget is at least 2 s, or 50 × the recorded call's own time.
  - If `ndarray.js` does not return on a zero-size probe, the input is outside the domain: the probe is skipped and counted under `skipped`.
  - If `ndarray.js` returns but the wrapper does not, that is reported.
  - The length audit's trials get a tight budget (100 ms, or 10 × the recorded call), and the first timeout ends that parameter's audit: a timeout there can only mean "unknown", never a finding.
- **Bug class**: a check whose own failure mode (hang → whole-module timeout) hides all of its results. It is a check that can fail silently in the coarsest possible unit.
- **What allowed it**:
  - Only the per-module wall-clock timeout bounded the replay. A timeout was an error with no detail, and no run had ever been done over the whole corpus with the pool and the cache, where such modules stand out (every warm run recomputed them).
- **Where else**:
  - `bin/workspace-guard.mjs` and `bin/coverage.mjs` also bound only the whole test run, so a hanging test loses that module's whole report. They run only the module's own tests, which pass in the unit suite, so a hang there would already fail `npm run test:unit`; the guard's forced `WORK = null` is the exception (a hang under it shows as an error, not a finding).

## 2026-11-25 — An ungated type check: 22 type errors in 13 modules, including two wrong results (tickets 0029, 0003)

- **Found by**: `npm run typecheck` (`tsc --checkJs`), with stdlib imports now resolved to stdlib's own `docs/types/index.d.ts` (`paths` in tsconfig.json; previously every stdlib value was `any`). The check had existed since PR #21 but was never run in CI, and had drifted to 19 errors (22 with stdlib's types).
- **Wrong results**:
  - **dseupd**: `select` is documented as a `Uint8Array`, but the code stored `true`/`false` and tested `select[ r ] === false`. A `Uint8Array` stores `false` as `0`, and `0 === false` is false, so the reorder loop swapped columns it should have skipped. The Fortran is `.NOT.SELECT(RGHTPTR)`. Every test passed a plain boolean `Array`, which hid it. With a `Uint8Array`, none of the 9 reorders in the fixtures reaches the divergent step (both ends unselected), so no fixture shows it; the type check is the enforcer. The tests now run every case with both array kinds.
  - **zgges**: the `ztgsen` status was wrapped in `{ info, m, pl, pr }` and then compared `=== 1`. So a failed reordering never set `INFO = N+3` and returned success. dgges was correct. Shown by a test that substitutes a failing ztgsen (new `importWithDependencies`, test/harness/constants.js, the module substitution ticket 0051 anticipated). It fails before the fix.
- **Checks that could not work**:
  - **ztgsen ndarray.js** sized WORK/IWORK from `M * ( N - M )` with `M` the output array. A length-1 array coerces to its element, so this read whatever the caller left in `M[ 0 ]` (usually 0), and the size check almost never applied. It now counts `SELECT`, as the wrapper does, and only for `IJOB > 0`. A new test rejects WORK/IWORK one element short.
  - **dtgsen, ztgevc wrappers**: `M < 0` on an `Int32Array` output, plus two tests that passed `M = -1`, a number, where the contract is an array. Test files are outside lint and the type check (tickets 0081, 0004), which is how those tests got in.
- **Latent, right only by coercion**:
  - **dlasq3 wrapper**: `stride2offset( 4 * n0, strideZ )` with `n0` an `Int32Array`: `4 * new Int32Array( [ 4 ] )` is `16`. The root cause is `bin/codemod-vector-lengths.mjs` (ticket 0068), which copied the spec length `4 * n0` without the name map the generated prologue uses (`n0[ 0 ]` for an output or input/output scalar, S10). The codemod now shares `lint/lib/prologue.cjs`'s `nameMap`/`rename`. A scan of every wrapper's `stride2offset` lengths found no other such case.
  - **dgees, zgees**: the `M` output of dtrsen/ztrsen was allocated as a `Float64Array`.
  - **zggev, zggevx**: the `M` output was passed as a plain `[ 0 ]`.
  - **dtrevc, dtrevc3**: booleans were stored into `SELECT` (read only by truthiness).
  - **dtgsna**: an integer status was wrapped in an object and unwrapped by `typeof`.
- **Bug class**: a value of the wrong kind that still runs. JS coerces one-element arrays, `Uint8Array` coerces booleans, and an object compared with `===` is just unequal. The result is right by accident, or silently wrong on one path.
- **What allowed it**: the only check that sees kinds was ungated. Each fix was found once, by hand, and nothing stopped the next. Lint (S9 `base-arity`) checks the argument count into `base()` only. Test files are checked by neither.
- **Gate**: `npm run typecheck` now runs in CI's lint job (CONVENTIONS S14), and `lint/verify-no-escape-hatches.cjs` rejects `@ts-ignore`/`@ts-nocheck`/`@ts-expect-error`. The check is still non-strict and complex arrays are still `any` (ticket 0023, next). Test files are not yet checked (ticket 0004).
- **Where else**: anything typed `any` in `types/jsdoc-aliases.d.ts` (Complex128Array, TypedArray, option strings) can still hide the same class.
- **Replay gaps found on the way** (the changed modules must pass the replay gate):
  - dgees, zgees and zgges recorded no calls, because their callback argument could not be serialized. Callbacks are now recorded as source and rebuilt (ticket 0075).
  - `null-work` passed `null` for dseupd's WORKL, which carries dsaupd's state. A workspace with intent `in`/`inout` now keeps its contents (ticket 0082).
  - The replay exposed a real wrapper bug: dtgsna allocated `max(1, N)` WORK for every `job`, but `job` = `'eigenvectors'`/`'both'` needs `2*N*(N+2)+16`. `s` and `DIF` came back 0. ndarray.js already checked the right size; the wrapper now allocates it, and a test compares it with the reference fixture (ticket 0072).

## 2026-11-25 — Array types tightened: zlag2c threw on its documented output type, and zlatrz's wrapper allocated the wrong array kind (ticket 0023)

- **Found by**: `npm run typecheck` once `types/jsdoc-aliases.d.ts` aliased `Complex128Array`/`Complex64Array` to stdlib's real types (they were `any`). There were 113 errors in 25 modules:
  - 81 were calls into zrot, whose base takes a `Float64Array` pair against its spec (ticket 0085), so the complex scalar alias stays `any` for now;
  - 20 were `Complex128Array.get()` results typed `Complex128 | void`;
  - 2 were real bugs.
- **zlag2c**: `SA` is a `Complex64Array` per the spec, the JSDoc and the reference (COMPLEX). base.js reinterpreted it with `reinterpret-complex128`, so any call with the documented type threw `Invalid typed array length`. Every test passed a `Complex128Array` instead. Its triangular sibling zlat2c used `reinterpret-complex64` correctly. With the tests moved to `Complex64Array`, 18 of 31 fail before the fix.
- **zlatrz wrapper**: `work = null` allocated a `Float64Array`, but base.js uses `work` as a `Complex128Array`. The replay had already listed zlatrz among the rejected calls (ticket 0073) without the cause. A new test compares `work = null` with an explicit complex workspace; it fails before the fix.
- **zpbtrf, zunbdb2**: `X.get( i )` results (typed `Complex128 | void`) were passed on or dereferenced. They now copy through the Float64 views, with no allocation per element.
- **Bug class**: an array of the wrong element kind, invisible while every array type is `any`. A test that uses the wrong kind consistently passes. The wrapper's own allocation is never type-checked against what base.js needs.
- **What allowed it**: the alias file said "Loose for now", and nothing tracked tightening it. The JSDoc said `Complex64Array`; neither the code nor the tests were checked against it.
- **Gate**: `lint/typecheck-config.test.cjs` pins the tightened aliases and flags, so they cannot be loosened without a visible change to that test.
- **Where else**: complex scalars (ticket 0085); option parameters documented as `{string}` (ticket 0056).

## 2026-11-25 — noImplicitAny on; the replay can now check ARPACK, which exposed a stale test argument and a wrapper length bug (tickets 0023, 0075, 0004)

- **Type check**: `noImplicitAny` had 2,675 errors in 64 modules, almost all one cause: `let a, b, c;` read inside nested helper functions, where control-flow typing cannot follow. `bin/codemod-implicit-any.mjs` annotates them from the checker's own inference; see ticket 0023.
- **Replay, ARPACK**: the recorder encoded only arrays, numbers, strings and callbacks, so every call taking ARPACK's plain-object state was dropped. dgetv0, dsaitr, dsaup2 and dsaupd were never checked. Plain objects are now encoded property by property.
  - dsaup2 then failed `null-work`: its spec gave WORKL intent `out`, but WORKL carries the Lanczos state between calls. Fixed by a spec override (ticket 0082).
- **dlaqr4**: its tests passed a stale trailing `lwork` in 16 calls, which JS ignores. The replay skipped every call because the argument count differed from the spec. Without the stale argument, the replay found the wrapper sizing the negative-stride offsets of WR/WI from `N`, where the reference length is `IHI` (ticket 0068 class).
- **dlamch**: `test.ndarray.js` imported `index.js`, so `ndarray.js` was untested.
- **Bug class**: a check that silently skips what it cannot encode ("untested" is reported, but whole families sat there), and test files that nothing checks (ticket 0004).
- **What allowed it**: the gate fails on "untested", but only for changed modules, and these modules had not changed since the replay existed.


## 2026-11-25 — importWithDependencies (and longer importWithConstants values) attributed coverage to the wrong lines (harness)

- **Found by**: a coverage agent for zlaqr0/zlaqr4 (ticket 0069). The lcov records of modules loaded through `importWithDependencies` showed hits on lines those copies never ran (an iteration-limit return), and no hits on lines they did run.
- **Root cause**: node records V8 coverage by character offset into the source it ran, and maps it onto the file on disk. The hook replaced an import specifier (`'../../zlahqr/lib/base.js'`) with a much longer `data:` URL, so every later offset in the copy pointed into the wrong part of the file. `importWithConstants` had the same flaw whenever the new value's text was longer or shorter than the original expression. Earlier tests happened to set `0` in place of a one-digit or longer number, which shifted later lines by a few characters.
- **Effect**: coverage of a module tested this way was partly fictional, both too high and too low. `bin/lib/lcov.mjs` merges copies by maximum, so the false hits counted. zlaqr0 read 100% lines; the honest figure before the fix was 90.1%.
- **Fix**:
  - `importWithDependencies` no longer edits the source: a `resolve` hook redirects the named specifier when the importing module's URL carries `?deps=`.
  - `importWithConstants` pads a shorter value to the original length, and throws for a longer one, saying why.
  - The source still comes from the next hook for the bare URL, so both still compose with bin/break-mutants.mjs.
- **Bug class**: a test-time source rewrite that changes character offsets silently corrupts every offset-based measurement of that module (coverage, and anything else that maps positions back to the file).
- **Where else**: any loader that rewrites source. `test/harness/replay-offsets.mjs` and `bin/workspace-guard-loader.mjs` wrap expressions, but their runs are not used for coverage. `replay-record.mjs` rewrites `export default x` → `export default globalThis.__replayRecord( x )` on the last line only, so nothing after it shifts.

## 2026-11-25 — dtrsyl set INFO from dlasy2's scale factor instead of its return code (2x2-by-2x2 blocks, all four trana/tranb branches)

- **Found by**: a coverage agent bringing dtrsyl to its floor (ticket 0069). It wrote the reference INFO into a near-singular test, and that test failed.
- **Reproduce**: M = N = 2, A = [[1,1],[-1,1]] (eigenvalues 1±i), B = [[-1,1],[-1,-1]] (eigenvalues -1±i), isgn = +1, C = [1,2,3,4]. Since λ(A) + μ(B) = 0, dlasy2 perturbs and returns IERR = 1 with scale 1. dtrsyl returned INFO = 0; the reference returns 1. Conversely, A = B = [[1e-3,1e-3],[-1e-3,1e-3]] with C = 1e300 everywhere: dlasy2 scales (6.25e-302) and returns IERR = 0, but dtrsyl returned INFO = 1.
- **Root cause**: `dlasy2( ... ); if ( SCALOC_ARR[ 0 ] !== ONE ) { info = 1; }` discarded dlasy2's return value and tested the scale factor instead. `dtrsyl.f` does `CALL DLASY2( ..., IERR ); IF( IERR.NE.0 ) INFO = 1`. The dlaln2 calls in the same file were translated correctly.
- **Bug class**: a callee's status replaced by a correlated, but different, output. The two usually agree on the happy path, which is the only path the fixture tests covered.
- **Where else**: every other base.js call to dlasy2/dlaln2 discards the status (dlaexc, dtgevc, dtrevc, dtrevc3). The reference ignores IERR/IINFO there as well, so those translations are faithful.
- **What allowed it**: no test reached the near-singular or scaling paths (dtrsyl base.js was at 80.7% lines). The coverage floor, applied because the PR touched dtrsyl's JSDoc, is what forced a test there.

## 2026-11-25 — strict mode on: 3,434 "possibly undefined" reports, two real bugs among them (ticket 0023)

- **Shape of the reports**: almost all were a `let` that Fortran-style control flow assigns on correlated branches: `k` only when M is even, read only under `if ( !misodd )`. TypeScript cannot correlate the conditions.
- **Fix that changes nothing at runtime**: `bin/codemod-strict-null.mjs` initialises such a variable to `NaN` when every value assigned to it is a number. For numbers, `NaN` and `undefined` behave the same in arithmetic, comparisons, truthiness, bitwise operations, typed-array stores and indexing. So a real read before assignment still yields NaN, and the harness's poisoned inputs still catch it. A blanket `= 0` would have hidden such reads.
  - The codemod skips any variable compared with `undefined` or tested with `typeof`.
  - About 360 variables in 130 files. All unit tests pass unchanged.
- **Real bugs the remaining reports showed**:
  - dlasyf/zlasyf `ndarray.js` returned `undefined` for N = 0. The reference returns INFO = 0 with KB = 0, and the replay had listed it under ticket 0074.
  - The dseupd and dsaup2 wrappers did not require `workl`/`workd`. Those arrays carry dsaupd's state, so a `null` reached base.js and failed there (ticket 0082).
- **False alarms resolved structurally, not by casts**:
  - the geev drivers compute the eigenvector side from the two flags;
  - zlahqr/zlaqr5 use an empty Z view when `wantz` is false, since every read is under `if ( wantz )`;
  - arguments the callee ignores in that mode get small module constants instead of `null`;
  - ARPACK state typedefs list required properties, and the public forms cast `{}` once, at the boundary.
- **Found while clearing the module gates on the touched modules**:
  - dsbgst/zhbgst rejected `vect = 'none'`: `spec/options.json` had no values for the family, so no check was generated, and a wrong one was written by hand. 25 more options are in that state (ticket 0022).
  - zlahef_rook's "row swaps" test passed W at half its required size and asserted only `kb` (ticket 0077).
- **Gate**: tsconfig.json runs `"strict": true`. `lint/typecheck-config.test.cjs` fails if any strict sub-flag is switched off.

## 2026-11-25 — zsytf2 and zhetf2 (upper) searched the pivot row one element short, and chose a zero 1x1 pivot

- **Found by**: a coverage agent writing a pivot-structure oracle for the symmetric factorisations (ticket 0069).
- **Reproduce**: `zsytf2( 'upper', 2, [[0,1],[1,0]] )` (complex) returned INFO = 1, IPIV = [0,0] and NaN in A. The reference, and the `'lower'` path, give INFO = 0, IPIV = [-1,-1] (one 2x2 pivot) and A unchanged. zhetf2 behaves the same.
- **Root cause**: `jmax = imax + 1 + izamax( k - imax - 1, … )` where `zsytf2.f`/`zhetf2.f` has `JMAX = IMAX + IZAMAX( K-IMAX, A( IMAX, IMAX+1 ), LDA )`. The count was one short, so A(IMAX,K) was never seen.
  - For IMAX = K-1 the count was 0, `izamax` returned -1, and ROWMAX became the diagonal |A(IMAX,IMAX)|.
  - For a zero diagonal, the 1x1-with-interchange test `0 >= ALPHA*0` then held, and the routine divided by a zero pivot.
- **Bug class**: an off-by-one count in a 0-based translation of a 1-based `IAMAX( K-IMAX, A(IMAX,IMAX+1), LDA )`. The same line is correct in dsytf2 and in every `_rook`/`_rk` variant; only the two complex Bunch-Kaufman routines had it. Its lower-triangle twin was right.
- **What allowed it**: the fixtures never put the row maximum in column K for the upper path. The existing tests reached neither branch's interchange code (lines 142–167 and 344–369 uncovered).
- **Tests**: a regression test in each module fails before the fix.

## 2026-11-25 — The wrong machine epsilon: dlatrs/dlatbs/dlatps hard-coded DLAMCH('E') where the reference uses 'P'; 33 more modules choose the wrong dlamch argument (ticket 0089)

- **Found by**: a coverage agent comparing dlatrs's scale with the reference formula.
- **Reproduce**: dlatrs with N = 1, A = [1], b = [1e300], upper / no-transpose / non-unit, normin 'no'. JS gave scale 4.99e-9; the reference gives BIGNUM/xmax = 9.98e-9. Both satisfy A·x = scale·b, so residual tests cannot tell them apart.
- **Root cause**: `const SMLNUM = 2.2250738585072014e-308 / 1.1102230246251565e-16`. That divides by `DLAMCH('E')` (2^-53), where `dlatrs.f:316` has `DLAMCH( 'Safe minimum' ) / DLAMCH( 'Precision' )` (2^-52).
- **Bug class**: LAPACK's two epsilons, 'E' (the rounding unit) and 'P' (eps·base), confused in translation. Thresholds built from them (SMLNUM, BIGNUM, RMIN/RMAX, tolerances) are then off by 2x or √2. A borderline input takes a different path; the answer stays acceptable but no longer matches the reference.
- **Where else**: 32 modules call `dlamch( 'epsilon' )` where their reference uses only 'Precision' (the eigen drivers, the equilibration routines laq*, zlatrs, zlatbs, dlaqr5), and dtgevc does the reverse. Listed in ticket 0089, with a proposed check comparing each module's machine constants with its Fortran source.
- **What allowed it**: nothing compares constants with the reference. Fixtures exercise the normal range, where the choice does not change the path taken.

## 2026-11-25 — dlamch: seven call sites got 0 from a misspelled key; 38 modules used the wrong epsilon; zlargv precomputed the wrong constant (ticket 0089)

- **Found by**: the inventory for ticket 0089 (every `dlamch` argument, stdlib epsilon import and epsilon literal in `lib/`, set against the `DLAMCH` letters of each reference source).
- **Unknown keys returned 0**: `dlamch( 'safe minimum' )` (dtgsna, dtgsen, ztgsen, dlarrf), `dlamch( 'Safe Minimum' )` (dggsvd3, zggsvd3) and `dlamch( 'eps' )` (zla_herfsx_extended) are not keys of dlamch's table. Like the reference, it returns 0 for an unknown query. So dtgsna and dtgsen passed SMLNUM = 0 on to dlag2 and dlassq, and zla_herfsx_extended had EPS = 0 and INCR_THRESH = 0, so its convergence tests `dx_x <= EPS` held only for an exact zero.
- **Wrong epsilon**: 33 modules used 'E' (2^-53) where the reference queries 'P' (2^-52): the eigen drivers, laq* equilibration, zlatrs/zlatbs, dlaqr5 and dlarrr. Another 5 used 'P' where it queries 'E': dtgevc, dla_gbrfsx_extended, dlasd2 (via `@stdlib/constants/float64/eps`, which is 'P'), dlartgp and dlartgs (literals). RMIN, SMLNUM and tolerances were off by 2x or √2.
- **Precomputed constant**: zlargv had `SAFMN2 = 1.4916681462400413e-154` (2^-511, the f90 zlartg's sqrt(SAFMIN)). Its reference formula `BASE**INT( LOG( SAFMIN / EPS ) / LOG( BASE ) / 2 )`, with EPS = 'E', gives 2^-484. dlanv2 wrote Fortran's INT as `Math.floor`; that is harmless for its exact −485, but wrong in general (INT truncates).
- **Tests copied the bug**: the coverage tests for dsbevx, zhbevx, zheevx and zhpevx computed their expected scale factor with `dlamch( 'epsilon' )`, mirroring the implementation. They failed once the implementation was fixed. An oracle has to come from the reference, not from the code under test.
- **Bug class**: machine-constant query mismatched with the reference. Typos fail silently (the value is 0, not an error); class swaps move thresholds, which residual and fixture tests rarely cross.
- **What allowed it**: `cmach` was typed `{string}`, so neither lint nor `tsc` saw the keys; nothing compared constants with the reference; derived constants were written as values.
- **Now enforced**: `cmach` is typed `MachineParameter`, the union of the canonical values (spec/options.json family `type`), so `tsc` rejects any other key. `conf:machine-constants` fails a module whose epsilon is a class its reference never queries, reading `dlamch` letters that bin/spec-gen/extract.cjs records in data/fortran-checks.json. CONVENTIONS X4 asks for derived constants as formulas.

## 2026-11-25 — dlasq1 left E(N) stale when dlasq2 does not converge (INFO = 2)

- **Found by**: a coverage agent for the ticket 0089 gate. It stubbed dlasq2 to return 2 via `importWithDependencies` and compared the result with dlasq1.f's INFO.EQ.2 branch.
- **Root cause**: dlasq1.f copies `D(I) = SQRT(WORK(2I-1))` and `E(I) = SQRT(WORK(2I))` for I = 1..N, then rescales N elements of each. The JS skipped `E(N)` (`if ( i < N - 1 )`) but still rescaled N elements, so the caller's stale `e[N-1]` was scaled by SIGMX/SCALE instead of being replaced with 0. `ndarray.js` also documented `e` as length N−1, where the reference and spec/dlasq1.json say N.
- **Why the first test missed it**: the stale value 99 was scaled to about 1.6e-145, which an absolute tolerance of 1e-14 accepts as 0. A test of a value that should be exactly zero has to assert it exactly.
- **Bug class**: a loop bound taken from the input contract (E(1:N−1) holds the off-diagonal) rather than from the output contract (E has dimension N and is overwritten). It hides on rarely reached failure branches.
- **Where else**: other routines whose E argument is dimension N but carries N−1 values (dlasq2's callers, dbdsqr, the d/zstein family) on their failure or non-convergence paths.

## 2026-11-25 — Option strings: dtgsja's validator and dispatch disagreed; dgges asked dlascl for a type it doesn't have (ticket 0022)

- **Found by**: `tsc`, once every option parameter was typed as the literal union of its values. Neither came from a test or the harness.
- **dtgsja/ztgsja**: spec/options.json mapped JOBU/JOBV/JOBQ = 'U'/'V'/'Q' to `'compute-vectors'`, so the generated `ndarray.js` accepted only that. `base.js` (and its callers dggsvd3/zggsvd3) dispatch on `'update'`. `dtgsja( 'compute-vectors', ... )` therefore passed validation and computed `wantu = false`: U, V and Q came back untouched. tsc reported `jobu === 'update'` as a comparison with no overlap.
- **dgges**: it undid the scaling of A with `dlascl( 'hessenberg', ... )`. dlascl knows `'upper-hessenberg'` and returns -1 for anything else, and dgges ignored the return value. For an input with norm below SMLNUM or above BIGNUM, the Schur form S came back at the scaled magnitude. Two tests ran that branch, but asserted only `info`.
- **Bug class**: an option string that is valid at one layer and unknown at another. A misspelled option fails silently, because the routine either falls through to a default branch or returns an error code nobody reads. Tests miss it unless they assert the output of the exact branch.
- **Where else**: nowhere now in code that `tsc` checks. Every remaining mismatch would be a type error. Plain-JS callers still depend on the runtime validators, and options the reference doesn't validate have none (ticket 0092).
- **What allowed it**: options were typed `{string}`. N8's "validator ≡ base-dispatch set" check was never built (it was listed as unbuilt), and a test that covers a branch without asserting its result counts toward coverage just the same.

## 2026-11-25 — dpbstf/zpbstf clamped a signed diagonal stride, so the row-major layout gave wrong factors (ticket 0069)

- **Found by**: a coverage agent for ticket 0069. It compared the dpbstf wrapper with `ndarray.js` and with the column-major factor in row-major.
- **Reproduce**: a diagonally dominant positive definite band matrix: N = 6, kd = 2, upper; diagonal 10+j, off-diagonals `1/(d+1+0.5j) - 0.1d`. Run `dpbstf( 'row-major', 'upper', 6, 2, AB, 7 )`. Band entry (r=0, j=2) stays at its input 0.05, where the column-major call (fixture-checked against Fortran) gives 0.015811388300841892. zpbstf fails the same way at (r=0, j=4).
- **Root cause**: dpbstf.f has `KLD = MAX( 1, LDAB-1 )`, the step along a band anti-diagonal (one column right, one row up). The JS wrote it as `max( 1, sa2 - sa1 )`. In column-major that is LDAB-1 ≥ 1, as in Fortran. In row-major (sa1 = LDAB, sa2 = 1) it is 1-LDAB < 0, so the clamp replaced it with 1, and the dscal/dsyr/zher/zlacgv calls on the anti-diagonal walked the wrong elements. dpbtf2 has the same KLD, but its translation used the signed `sa2 - sa1` and was correct.
- **Bug class**: a Fortran guard on a leading-dimension expression, translated literally into a stride expression that can be negative. `MAX(1, ...)` exists only for LDAB = 1; on a signed stride it changes the stride itself.
- **Where else**: only dpbstf and zpbstf use `max( 1, <stride2> - <stride1> )` (`grep -rnE "max\(\s*1,\s*\(?\s*(s[a-zA-Z0-9]*2|stride[A-Z]+2)\s*-" lib`). Other `MAX(1, LD...)` guards that became strides could still hide under other names.
- **What allowed it**: no test ran the wrapper's row-major path, and both modules were below the wrapper coverage floor (ticket 0069). Neither has a layout-fuzzed harness level (L3). The fixtures are column-major, where the clamp is a no-op.

## 2026-11-25 — Wrapper replay on the ticket 0022 PR: wrapper workspace and length bugs in 25 modules (tickets 0068, 0074)

- **Found by**: `bin/wrapper-replay.mjs --changed`, once the ticket 0069 coverage tests recorded calls that reached the wrapper paths. Each fix has a regression test that fails on the old code.
- **Undersized `WORK = null` allocation (NaN or LWORK errors)**:
  - dormbr/zunmbr ignored the side and the blocked callee's `nw*NB + (NB+1)*NB`.
  - zungrq allocated the unblocked M where the NB = 32 path needs `M*NB`.
  - dorm22 allocated `M*N` without the required minimum NQ.
  - dorbdb4 took the LWORK doc (M-Q) where the code checks a larger LWORKMIN.
  - dsytri2x allocated `max(rows, cols)` for a 2-D `rows*cols` workspace.
  - dlatrs3 kept the reference LWORK, but base.js also stores the reference's local arrays in WORK.
  - dsapps/dseigt documented a nullable workspace and never allocated it.
- **Wrong `stride2offset` length (negative strides)**:
  - gbtf2/gbtrf IPIV used N where it should be min(M,N).
  - orgbr TAU used N where it should be min(M,K) or min(N,K).
  - ormbr/unmbr TAU used N where it should be min(NQ,K).
  - zlaswp IPIV used N where it should be |k2-k1|+1; the spec's Fortran formula assumed absolute 1-based indexing.
  - dlaed2 Q2 used the documented N1²+(N-N1)², but the reference writes up to N², which DLAED1's larger WORK absorbs.
- **The layers disagree on a quick return or check**: dgecon, dpocon, iladlr, ilazlr, ztrtrs, dtrtrs, zlamtsqr, zlanhb, zlansy (see ticket 0074's resolution).
- **Bug class**: a wrapper is a second implementation of argument handling: workspace sizes, vector extents and quick returns. Each one diverged where its author copied a documented size, or a matrix dimension, rather than what base.js actually touches.
- **What allowed it**: wrapper paths were untested (ticket 0069). The replay audits only the calls the tests make, so a module's own coverage decides what it can see.
- **The d/z twins**: the replay flagged only the variant whose tests reached the bad path. A review of the twins of every fixed module found the same bugs in zgbtf2/zgbtrf (IPIV), zungbr (TAU; harmless, since the argument checks make the two lengths equal), zunm22 and zunbdb4 (WORK). Each was fixed with a test that fails on the old code where a valid input can tell the old and new versions apart. When fixing a wrapper, check its d/z twin.

## 2026-11-25 — Corpus-wide wrapper replay and coverage on the ticket 0094 PR: vector lengths, a never-allocated WORK, and stale zero-size outputs (tickets 0068, 0074, 0099)

- **Found by**: `bin/wrapper-replay.mjs --changed` and `bin/coverage.mjs --changed`. The ticket 0094 PR changes every module's `main.js`, so for the first time both checks ran over all 912 modules. Each fix has a regression test that fails on the old code.
- **Wrong `stride2offset` length that hangs instead of failing**: dlarrb's LLD and dlarrj's E2 have N-1 elements, but the wrapper offset them by N. With a negative stride the routine reads one element past the end. In these bisection routines the NaN it reads makes the loop run forever, so the old code hangs rather than throwing. The regression tests wrap the array in a guard that throws on an out-of-bounds read.
- **A spec length that copied the reference's docs, not its code**: dlarrb's WGAP is documented as (N-1), but `RGAP = WGAP( II )` reaches WGAP(N) on a valid call (ILAST = N, OFFSET = 0). The caller dlarrv documents it as (N). `spec/overrides/dlarrb.json` now records N. Where a reference's argument docs and its code disagree on a length, the code (and the caller's docs) decide.
- **A nullable WORK that was never allocated**: dstqrb documented `WORK` as `(Float64Array|null)`, but it only validated the length and threw on null. This is the dsapps/dseigt class from the ticket 0022 PR.
- **A stale zero-size output**: dlarfg, zlarfg and zlarfgp (`tau`), and dgelss (`rank`), repeated the quick return in `ndarray.js` (and zlarfgp's wrapper) without the reference's `TAU = ZERO` / `RANK = 0`. A caller's previous value came back.
- **What allowed it**:
  - Both checks ran only on modules a PR touched, so these modules' wrapper paths had never been replayed.
  - The replay compares the two entry points with each other, so a quick return both share is invisible to it (ticket 0099).
  - The existing zero-size tests started `tau` and `rank` at 0, so a skipped write of 0 passed them.
- **Where else**: ticket 0099's reproduce lists five more `ndarray.js` quick returns whose spec says the reference sets an output.

## 2026-11-25 — Declared workspace minimums too small for what base.js uses, in 32 modules (ticket 0096)

- **Found by**: the new `min-work` replay variant, which replays every recorded `ndarray.js` call with each workspace cut to the minimum `ndarray.js` itself demands. dggsvd3 was found first, while its example was being written (ticket 0094). Then direct tests at sizes past the blocking threshold, which the replay cannot reach. Each fix has a regression test that fails, or hangs, on the old code.
- **Reproduce** (dggsvd3): M = N = P = 3, A = [1,2,3,4,5,6,7,8,10], B = [2,0,1,1,3,0,0,1,4] column-major. With WORK of 6 it returned info = 0, L = 1 and alpha = 0; with WORK of 11 or more, L = 3.
- **Bug classes**:
  - **A callee assumed to allocate its own workspace**: dggsvp3 and zggsvp3 believed xGEQP3 allocates internally, and checked only max(1, M, N, p).
  - **A partitioned WORK whose minimum covered one use, not the offset plus the sub-call**: dggsvd3 and zggsvd3 (TAU at WORK[0:N], then dggsvp3 at WORK[N:]).
  - **The reference's documented LWORK copied, where the code enforces a larger LWORKMIN**: dorbdb2, dorbdb3, zunbdb2, zunbdb3 and zunbdb4 (`LWORK >= M-Q`, but the code requires `max(ILARF+LLARF-1, IORBDB5+LORBDB5-1)`). Also dorm22 and zunm22: they accepted 1 and left the reference's `LWORK >= NQ` check to base's silent INFO = -12.
  - **A minimum computed without a size known only inside base**: dtrsen and ztrsen accepted 1 for every job. The condition-number paths need M(N-M) or 2M(N-M), with M counted from SELECT. dtrsen's IWORK was never checked.
  - **The reference minimum assumes the blocked callee shrinks NB, but the JS callee always blocks at NB = 32** (ticket 0100):
    - dgeev, dgees, zgees, dgeevx, zgeevx and zgeev (through dgehrd/zgehrd), dgelss and zgelss, dormlq, the dlaqr2/3 family, the dlaqr0/4 family (whose AED window cap assumes a 2·nw callee), and dhseqr/zhseqr, which forward WORK to dlaqr0/zlaqr0;
    - the overrun reads `undefined`, which becomes NaN, and the QR iteration then spins to itmax, so zgeev showed up as a replay timeout.
- **What allowed it**:
  - `workspace-guard` checks only that the wrapper allocates at least the `ndarray.js` minimum;
  - `harness:assertWorkspaceSufficient` ran only where a test called it;
  - a typed array silently drops writes past its end, so a short WORK never throws.
- **Where else**: the `min-work` variant now gates every module, but only at the sizes its tests reach. Blocked paths start past about 33, where most tests don't go (ticket 0100).

## 2026-11-26 — Rook-pivot panel kernels miscopy column K into column P on a 2x2 pivot with P != K (ticket 0102)

- **Found by**: making dsytrf_rk, dsytrf_rook, zsytrf_rk and zsytrf_rook adapt to their WORK (ticket 0100). On a matrix that needs heavy rook pivoting, the blocked path gave normwise solve residuals near 1e-2. Fixed with a fixture test per kernel that fails on the old code.
- **Reproduce**: N = 40 (or 70), `a_ij = sin((i+1)(j+1)+i+j)` (0-based; for z, add `i*cos((i+1)(j+1)-i-j)`), NB = 32, either uplo. One `dlasyf_rk( 'upper', 40, 32, ... )` differs from gfortran's by O(1) in A (fixture `upper_40x40_pivot40_nb32`; first mismatch `a[41]`: 2.347 expected, 1.073 got). dsytrf_rk + dsytrs_3 at N = 70 gave residual 2.4e-2 (zsytrf_rk: 8.2e-3); with the fix, about 1e-16.
- **Bug class**: a 1-based extent translated as if it were exclusive. The reference copies column K into column P with `DCOPY( K-P, A(P+1,K), 1, A(P,P+1), LDA )` then `DCOPY( P, A(1,K), 1, A(1,P), 1 )`. The first copy parks A(K,K) in A(P,K), and the second, of P elements (rows 1..P), carries it into A(P,P). The JS copied `p` elements (0-based rows 0..p-1) and so left A(p,p) stale. The upper branch had this bug in all four kernels: dlasyf_rk, dlasyf_rook, zlasyf_rk and zlasyf_rook. In dlasyf_rk's lower branch, a dsytf2-style rewrite set `A(p,p) = A(k,k)` and then copied `N-p` elements from row p of column k, which overwrote it with the stale A(p,k). The lower branch now matches the reference (`DCOPY( P-K, ... )`, `DCOPY( N-P+1, ... )`, and a swap of K columns). The KP != KK interchanges were checked against the reference too. Some are written dsytf2-style (A(kp,kp) set directly, with shorter copies and swaps), but they differ only in columns K and KK, which the kernel then overwrites from W, so they are equivalent. zlahef_rk and zlahef_rook use the Hermitian form (`A(P,P) = DBLE(A(K,K))`, then `ZCOPY( P-1, ... )`), and their JS is correct.
- **What allowed it**:
  - The blocked fixtures (33x33, 50x50) were diagonally dominant, so rook pivoting never took a 2x2 pivot with P != K on the blocked path.
  - The kernels' own fixtures were 4x4 to 6x6 with NB >= N or NB = 3. There, the P != K branch either never ran or wrote only entries the kernel later overwrites.
  - The ticket 0100 tests shifted the diagonal by ±6 to stay out of the branch. Those tests now use the unshifted matrix.
  - The property harness does not sweep these drivers past the blocking threshold.
- **Where else**: any blocked panel kernel that ports a "copy non-updated column" step, where the reference relies on copy order to move a diagonal entry (dlasyf, zlasyf, zlahef and the _aa/_rk/_rook variants). Check every 1-based DCOPY count that starts at row 1. A test needs N > NB and a matrix that forces 2x2 pivots with P != K. A diagonally dominant matrix doesn't.

## 2026-11-26 — Blocked routines ignored the workspace they were given, in 46 modules (ticket 0100)

- **Found by**: ticket 0096's fixes, which had to raise callers' minimums above the reference's because the JS callee always blocked at NB = 32. The new lint rule `workspace-adaptive` then listed every module whose reference picks its path from LWORK while its base.js never read the workspace's length: 46, including dgesvd, dsysv and dtrevc3, whose fixed paths were safe but not the reference's.
- **Reproduce** (dgesvd): 70x40, jobu = jobvt = 's', old base.js called directly with the reference's MINWRK = 230: info = 39, NaN singular values. zgeev at N = 80 with WORK = 2N spun to info = 80 with NaN eigenvalues (ticket 0100's evidence).
- **Bug classes**:
  - **A block size fixed where the reference shrinks it**: the dgeqrf, dorgqr, dormqr, dgehrd, dgeqp3 and dsytrf_rk/rook/aa families, and dtzrzf, all partitioned WORK on NB = 32 whatever its length.
  - **A WORK layout of the JS's own**: dgeqrf, dgeqlf, dgerqf and their z twins kept T after `LDWORK*NB` (needing `+ NB*NB`); dgelqf and dtzrzf allocated T inside base.js on every call; zgeqp3 placed F at a fixed offset (needing `(N+2)*NB`). The reference keeps T in `WORK(1:IB,1:IB)` at LDWORK; the dormqr family and dgehrd keep it in a TSIZE part.
  - **Only the large-workspace branch translated**: dgesvd had only its fast branches (and NaN at the reference's minimum, hidden by an inflated `ndarray.js` minimum); zgesvd lacked 16 of its 20 paths.
  - **A reference sizing bug**: DGEQP3 sizes its blocked path with `2*SN + (SN+1)*NB` and shrinks NB with `(LWORK-2*SN)/(SN+1)`, but DLAQPS uses `2N + (SN+1)*JB`, so with NFXD fixed columns a WORK near that bound is overrun by 2·NFXD (200x200, 10 fixed columns, LWORK = 6492: NaN). The JS uses 2N.
  - **Found alongside**: zgeqp3 used NX = 0 where ILAENV(3) is 128 (ticket 0049 for the rest); dtrevc3 hoisted SMLNUM to module scope as if N = 1 (the reference scales by N); dsysv returned before factoring when NRHS = 0; the rook-pivot panels' miscopy (ticket 0102, entry above); workspace-guard matched only an upper-case `WORK`, so 16 wrappers whose parameter is `work` (dgeev, dgels, dgesvd, dhseqr, ...) were never guarded. Lowering minimums to the reference's exposed two layout bugs the raised minimums had hidden: zggev handed zhgeqz and ztgevc WORK from N (short of ztgevc's 2N), and dgeevx without vectors asked dhseqr for eigenvalues only where the reference asks for the Schur form whenever SENSE needs dtrsna, so RCONDV was wrong for SENSE = right-vectors (0.170 for 0.187). The replay harness's `describe()` crashed on a recorded callback (zgees's `select`), so a mismatch there was reported as an ERROR; it now describes callbacks and option objects (`test/harness/test.harness.js`).
- **What allowed it**:
  - nothing compared a base.js with the reference's path selection; the spec had no record that the reference adapts (now spec `adaptive`, generated, and `lint:workspace-adaptive`, CONVENTIONS W6);
  - the `min-work` replay only reaches the sizes tests use, and blocked paths start past 32 (dgeqp3: past 128);
  - `ndarray.js` minimums inflated to the always-blocked need made a short WORK throw instead of exposing the overrun.
- **Testing notes**:
  - Blocked and unblocked runs differ by rounding, so the regression tests compare minimum and optimum WORK by tolerance or by property. dgeqrfp's Householder entries differ by about 6e-12 relative (dlarfgp's formula amplifies rounding) while both reconstruct A to 2e-14.
  - Pivoting routines (dsytrf_aa, xGEQP3 callers such as zggsvp3) can pick different pivots on near ties between paths. The reference does the same, so those outputs are spec `workDependent`, and tests compare residuals or invariants (generalized singular values).
  - RCONDV is sensitive to rounding: at N = 12, all unblocked, a 1.1e-15 difference in dgehrd's output flips the standardization of one 2x2 Schur block, and DLACN2's estimate moves 16% (0.0861 against the reference's 0.1000). Fixture tests on RCONDV need a loose tolerance.
  - An "ample WORK" in a bit-exact `WORK = null` test must reach the callee's optimum, or the two runs take different paths: the dormqr family's optimum is now `nw*32 + 4160` (TSIZE) and dgehrd's `N*32 + 4160`. The reference's own LWKOPT for xORMBR/xORMHR/xORMTR (`NW*NB`) is below that of the xORMQR it wraps, so the wrappers allocate the callee's optimum.
- **Where else**: nothing yet checks that a wrapper's `null` allocation reaches the optimum, rather than just the minimum (ticket 0103). Wrappers still pass a caller's WORK to base.js unchecked (ticket 0077).

## 2026-11-26 — Copied ILAENV constants differed from the reference's, in 140 modules (ticket 0049)

- **Found by**: translating ILAENV, IPARMQ and IEEECK (they match the reference on every fixture row: 95,342 ILAENV comparisons over every (NAME, OPTS) pair a d/z routine queries, and IPARMQ over NH from -2 to 10000), then the new lint rule `tuning-from-ilaenv`, which requires each base.js whose reference queries ILAENV to call the module with the reference's arguments. The spec's `tuning` list is generated from the reference's calls.
- **Reproduce** (dgeqrf): K = 64 with WORK = N*32 NaN-poisoned past N. The old code (NX = 0) blocks and writes past N; the reference (NX = ILAENV(3) = 128) runs unblocked and does not.
- **Bug classes**:
  - **Wrong crossover**: NX = 0 (QR family, orgqr family) or 32 (dgehrd, dgebrd) where ILAENV(3) gives 128: blocked for 33..128 columns where the reference is unblocked.
  - **Wrong block size**: dlauum 32, zlauum/dtrtri/ztrtri 2, dgetri 32, the sytrf families 32 (and NBMIN 2 for 8) where ILAENV gives 64; dgbtrf/dpbtrf 32 where it gives 1 until KU/KD > 64; dsytri2/zsytri2 32 where it gives 1; dtgsyl 32 for 2; dlatrs3 8 for 32; zlaunhr_col_getrfnp 32 where ILAENV, matching only `xLAORH`, gives 1 (its blocked loop is unreachable in the reference; kept and tested through an exported `factor( nb, ... )`).
  - **QR sweep tuning**: dlaqr3's NMIN 12 for ILAENV(12) = 75 (the translate skill's idiom table once read the query number as the value); zlaqr0/4's fixed NWR = 5 and NSR = 14 where IPARMQ's depend on NH, KACC22 tested against the clipped NSR, and max(2, NSR) applied before dropping its odd bit. The eigenvalue order then differed from the reference's by about 1.5.
  - **A null WORK allocated only the minimum**, so wrapper callers never got the blocked path: dgebrd, dgetri, dsyev, dsyevr, dsyevx, dsygv, dsygvx, dgges, dsysvx, zhesv (one element) and twins; dsysv kept N*32 after dsytrf's NB became 64; dgelss's MAXWRK differed from the reference's LWORK = -1 query on almost every shape (4248 for 600 at 10x8).
  - **Found alongside**: dtgsyl/ztgsyl made a last single row or column its own block where the reference's `IF( I.GE.M ) GO TO 50` merges it (a GOTO loop exit dropped in a `while` translation; reachable at M = 33 with the old MB and common with MB = 2). dstevr, dsyevr and zheevr took their all-eigenvalues path only for RANGE = 'all', missing the reference's TEST flag (an index range 1..N, with IEEEOK = ILAENV(10)). zgges demanded 9N WORK and 10N RWORK where the reference and its own spec say 2N and 8N.
  - **Checks with holes**: conformance's single-char-flag checks (base.js and examples/benchmarks) skipped any line containing `//`, so a trailing comment hid a flag; workspace-guard instrumented only assignments to the workspace parameter, so allocations into a local (dgelss's `W = new ...`) went unguarded.
- **What allowed it**:
  - CONVENTIONS X3 said ILAENV "becomes hardcoded block sizes", with no table of the reference's values to read or compare against, so each module copied its own;
  - a wrong tuning value still gives a valid result, so property tests can't see it; only reference fixtures at the affected sizes can, and the blocked fixtures sat below or above the thresholds that changed;
  - a wrapper's null allocation is checked against the minimum only (ticket 0103), and an optimum the reference takes from a callee's workspace query is invisible to `tuning-from-ilaenv`.
- **Testing notes**:
  - ILAENV's OPTS are built from the JS options with `opt.charAt( 0 ).toUpperCase()`; a literal letter in an ilaenv call is the reference's own OPTS and is exempt from the single-char check.
  - Raising NX to 128 moved the ticket-0100 blocked tests past 128 (140–200), so the blocked branches stay covered.
  - Complex Schur forms compare with the reference only up to a diagonal phase in Z; some AED windows amplify a one-ulp change to about 1e-3 in H and Z, so compare eigenvalue order and similarity there, not H and Z elementwise.
  - Fixtures regenerated here differ from committed ones in the last bits; append new cases rather than regenerating old ones.
- **Where else**: the remaining *evr drivers' eigenvector path still replaces DSTEMR (ticket 0105); nothing yet checks a null allocation against the optimum (ticket 0103).

## 2026-11-26 — Null-workspace allocations below the reference's optimum, unchecked (ticket 0103)

- **Found by**: the new check `bin/workspace-optimum.mjs`, against the reference's own workspace queries recorded by `bin/gen-lwkopt.mjs` (158 routines, 26,807 rows: every routine whose reference answers LWORK = -1, swept over dimensions and options). It calls each wrapper with null workspaces, captures the allocation's size without running the algorithm, and fails below the optimum.
- **Reproduce** (dtgsen): N = 14 with 7 eigenvalues selected, IJOB = 3, WORK = IWORK = null: the old wrapper allocated WORK 4N+16 and IWORK 1, and dtgsen returned info = -22.
- **Bug classes**:
  - **An allocation below the reference's minimum**, not just its optimum: dtgsen (the IJOB >= 1 terms 2M(N-M), 4M(N-M) missing, IWORK not checked at all), ztgsna (2N^2 skipped at N = 1), dlamswlq (nb*mb where the reference needs N*MB, so a null WORK overran on the blocked path and gave NaN).
  - **Off by one against the reference's LWORKOPT**: dorbdb3, zunbdb3 (the reference addresses WORK from 2; the JS from 1, so it never overran).
  - **The reference's own size too small for its callees**: DLAMTSQR's SIDE = 'R' LW = MB*NB, but DGEMQRT/DTPMQRT address M*NB (ZLAMTSQR has M*NB). The JS allocates the larger; the check, which compares with the reference's figure, cannot see this class.
  - **Validation the reference doesn't make**: dlamswlq/dlamtsqr rejected mb < 1 / nb < 1 and K > M for SIDE = 'L', and threw for SIDE = 'R', K > N even at N = 0 where the reference quick-returns; ztgsna demanded IWORK N+6 for N+2. SIDE = 'R', K > N still throws otherwise: the reference's callee rejects it or addresses outside C.
  - **The query's own coverage**: the generator first detected a query by an `LQUERY` variable, which missed dlaqr0/2/3/4, zlaqr0/2/3/4 and dlaqz4 (they test LWORK = -1 directly); it now detects the test itself. And it first skipped a routine it couldn't sweep, which `lint:escape-hatches` rejected: a routine with a query that can't be swept is now an error.
- **What allowed it**: workspace-guard checked a null allocation against the `ndarray.js` minimum only, and the minimum was hand-written too; no per-routine optimum was recorded anywhere. The last two PRs found about twenty such wrappers only by reading code.
- **Where else**: an optimum that depends on array contents beyond SELECT and 2x2 blocks would need its data swept; the generator's scan found only dtrsen, dtgsen, dtgsna, dtrevc3 and twins reading data before their query returns. Rows the reference's query accepts but the call itself rejects (DLAMSWLQ/DLAMTSQR SIDE = 'R', K > N) are reported as not run, not failed.

## 2026-11-26 — Hand-written workspace minimums disagreed with the reference's, in 46 modules (ticket 0016)

- **Found by**: the new check `bin/workspace-minimum.mjs`, against the reference's minimum recorded by `bin/gen-lwmin.mjs` (compiled drivers, the lwkopt grid, LWORK bisected per workspace with the others ample). The minimum is the smallest length that neither the routine nor a callee rejects and past which nothing is written, on zero, seeded random and rank-deficient random data. The check replays each row through `ndarray.js` at that minimum and one below, with `base.js` stopped.
- **Reproduce** (dtgsyl): M = N = 140, IJOB = 0, WORK of length 1: the old `ndarray.js` threw, demanding 2MN = 39200; the reference accepts 1 (only the two-round solve, IJOB 1/2 with TRANS = 'N', uses WORK).
- **Bug classes**:
  - **No check at all** on a workspace: d/z gsvj0/1, dlatrs3, zhetrd_he2hb past its quick return, the IWORK of dstevr/dsyevr/dsyevx/zheevx/ztgsyl/ztgsen, the RWORK of zheev/zheevx and the GSVD routines.
  - **A check skipped on an edge**: N = 1 (d/z sytrf_aa, zheev, zheevx, dtgexc), no reflectors (d/z orghr/unghr, d/z ormhr/unmhr).
  - **Too high**: a formula for one option applied to all (dtgsyl, the GSVD routines' max(M, N, P)), the documented size where the code checks less (zungtsqr), demands on the reference's quick returns (dtgex2, d/z orbdb5/6), declared extents overstated (zggevx IWORK N+6 for N+2, dgeevx).
  - **The reference's own check is not a safe minimum**: d/z orgtsqr_row/ungtsqr_row check LWORK >= 1 but write NB*max(NB, N-NB); dlamtsqr's SIDE = 'R' check MB*NB but DGEMQRT writes M*NB; d/z tgsen document 2MN but their own TGSYL call rejects it (2MN+1). d/z laqr0/4 document max(1,N) but neither check nor need it. Each is recorded in the module's DIFFERENCES.md.
  - **Found alongside**: dlatrs3 kept dlange's scratch and a norm cache in WORK past the reference's LSCALE + LANRM (the reference has local arrays), so it overran at the reference's minimum. dtgex2's quick return was off by one for the 0-based j1, so it swapped a block running past N.
- **What allowed it**: every minimum was hand-written from the reference's LWORK documentation, which is not always what the reference checks or needs, and `conf:work-assert` checked only that a WORK guard existed. The specs' `minLength` came from the same documentation and was compared with nothing.
- **Testing notes**:
  - Measuring needs more than rejections. Watch for writes past the length (a sentinel tail). Use data that reaches the full path: zero data gave the GSVD routines rank 0, and only rank-deficient random data reached their callees' M-sized writes.
  - A sampled minimum is a lower bound, so a JS minimum that covers a worst case the samples miss is set from the reference's callees (ticket 0106).
- **Where else**: reads past the minimum, and paths only structured input reaches, are not measured (ticket 0106). Wrappers still pass a caller's WORK to base.js unchecked (ticket 0077).

## 2026-11-26 — Wrappers handed a caller's short workspace to base.js; ndarray.js quick returns skipped outputs (ticket 0077)

- **Found by**: the wrapper replay's new `short-work` variant (`test/harness/replay.js`): each recorded call replayed through the WRAPPER with each workspace one element shorter than the minimum `ndarray.js` demands (read from its RangeError for an empty workspace) must throw that RangeError. Run before the fix, 394 of 915 modules failed it (1,177 findings reported; 1,060 of them the wrapper accepting the short buffer, the rest a TypeError or a timeout from base.js reading `undefined`, e.g. zgbcon's "Real component must be a number", dsytrf_aa not returning).
- **Reproduce** (dormql): `dormql( 'column-major', 'left', 'no-transpose', 4, 3, 2, A, 4, TAU, 1, C, 4, new Float64Array( 2 ) )` returned 0 with C wrong; ndarray.js demands max( 1, N ) = 3. The fixture `test/harness/fixtures/short-work/dormql` keeps the old wrapper.
- **Bug classes**:
  - **Validation hand-copied into two layers**: 452 wrappers called base.js; 12 carried their own copy of a workspace check (dtbcon, zunmlq, …), the rest none. Fixed by D5d: the wrapper calls ndarray.js (`bin/codemod-wrapper-ndarray.mjs`, `lint:wrapper-calls-ndarray`).
  - **An ndarray.js quick return that skips an output the reference writes**: dporfs and dptrfs returned 0 at N = 0 before base.js's quick return, which (as the reference) zeroes FERR(1:NRHS) and BERR(1:NRHS). Hidden while wrappers called base.js; found by a strengthened `zero-size` variant that compares ndarray.js with base.js at each zero dimension with every non-workspace float array filled with the same sentinel (a recorded FERR already 0 had hidden it).
  - **ndarray.js demanding more than the reference at a zero dimension**: d/z sytri_rook, zhetri_rook required max( 1, N ) for WORK( N ) (W3 forbids it).
  - **Null-branch allocations below ndarray.js's minimum at N = 0**: d/z lansb, lansf, lansp, lantb, lantp, zlanhp, zlansp and d orgtsqr(_row) allocated 0 elements where ndarray.js (the reference's MAX(1,LWORK) extent) wants 1; invisible while the wrapper called base.js.
  - **Callers sizing workspaces below the reference's minimum**: tests of dsbgv (WORK 8 for 3N = 9), ztgsna (WORK 1 for 2N² = 2), dtgsen (98 for its 99 at IJOB = 1), the examples/READMEs of d/z sytri_3x, zhetri_3x (6 for (N+NB+1)(NB+3) = 12), the dorbdb3/zunbdb3 benchmarks (max(P,Q) for max(P, M-P-1, Q-1)+1).
- **Testing notes**: the recorder (`replay-record.mjs`) wraps ndarray.js, so once the wrapper calls it, the wrapper's own calls were recorded too and crowded the tests' calls out of the sample; it now skips a call whose caller frame is the module's wrapper. The `zero-size` wrapper-vs-ndarray comparison no longer reaches base.js, hence the added ndarray-vs-base comparison.
- **Where else**: 263 ndarray.js files return early at a zero dimension; the `zero-size` variant samples only the first four recorded calls and their positive dimensions, so a skipped output on another path is not seen. The ARPACK wrappers (dsaupd, dseupd, dsaup2, …) kept their own checks on `workd`/`workl`, two of which ndarray.js lacked (dsaup2 `workl`, dseupd `workd`); both are now in ndarray.js. 75 declared-extent workspaces (IWORK, RWORK, BWORK) have no ndarray.js check at all, so `short-work` cannot reach them (ticket 0107).

## 2026-11-26 — The replay timed out a valid call whose cost depends on its workspace (dlaqr0, ticket 0077 PR)

- **Found by**: CI's `Wrapper replay (changed modules)` on the D5d PR: `REJECTED dlaqr0 null-work column-major: did not return within 2000 ms`. Locally it passed at 1.4 s, so it timed out only on the slower runner.
- **Reproduce**: `REPLAY_CALL_MS=300 node bin/wrapper-replay.mjs dlaqr0 --check --no-cache` on the old `replay.js`; or the self-test "a routine that does more work with more workspace" in `test/harness/test.harness.js`, with `budgetFloorMs: 50`. Real scalar, dense storage, wantt = wantz = true, N = 300 cyclic shift, recorded WORK of length 1.
- **Root cause**: every call made from a recorded call had a watchdog budget of max(2 s, 50 × the recorded call's time). The recorded call was dlaqr0's ticket 0016 test with WORK = 1, where it, like the reference, makes no progress and returns INFO = N in about 16 ms. The null-work variant gives it the wrapper's optimal WORK, and it then solves the problem, which takes about 100 times longer. That is legitimate (W6, spec `returns.workDependent`). It was hidden until this PR's recorder change stopped the wrapper's own ndarray.js calls from crowding that test call out of the sample.
- **Bug class**: harness assumption. A variant's cost was assumed to track the recorded call's, but a variant that changes only a workspace can change how much work the routine does.
- **Fix**: null-work (the wrapper call and its sized ndarray.js comparison) and min-work keep the recorded valid inputs, so they get the recorded call's own cap (60 s). The tight budget stays for the domain probes it exists for (ticket 0070).
- **Where else**: any routine whose algorithm or blocking depends on the workspace size (d/z laqr0/laqr4, the blocked drivers that fall back to unblocked code under W6). The `exact` and `zero-size` budgets are unchanged; `exact` repeats the recorded call, so its cost does match.

## 2026-11-26 — 75 workspaces had no length check, 7 more only on some paths (ticket 0107)

- **Found by**: the new lint rule `workspace-length-guard` (every spec workspace whose `minLength.js` is known has a guard in `ndarray.js` that throws `RangeError`) and `bin/workspace-minimum.mjs` with `below declared` made a failure (accepting less than a declared extent at non-zero dimensions).
- **Reproduce** (zpbsvx, complex, dense band storage, FACT = 'N', UPLO = 'U', N = 3, KD = 1, NRHS = 1, AB = [ 0, 4; 1+i, 4; 1-i, 4 ], B = [ 1, 2, 3 ]): with `RWORK = new Float64Array( 1 )` the old `ndarray.js` (and base.js) returned INFO = 0 with RCOND = 0.3246 instead of 0.2574, and FERR = BERR = NaN; RWORK( N ) was never checked. Now RangeError `RWORK array must have at least 3 elements from offset 0`.
- **Bug classes**:
  - **No check at all** on a declared workspace with no length argument: 74 workspaces in 69 modules (plus dsband's IWORK, declared `IWORK( * )` and so with no spec minimum; its doc's N is now an override), IWORK( N ) in the d `*con`/`*rfs`/`*svx` routines, RWORK( N )/( 2*N ) in the z siblings, BWORK( N ) in d/z gees, IWORK( 5*N ) in the d `*evx`/`*gvx` and z `*evx`/`*gvx`, zlacrm/zlarcm RWORK( 2*M*N ), dlaebz IWORK( MMAX ), dtgsna IWORK( N+6 ). Fixed by `bin/codemod-workspace-guard.mjs` from the spec's `minLength.js`.
  - **A check only on the paths that reference the workspace**, below the declared extent elsewhere: dggevx IWORK/BWORK and zggevx IWORK/BWORK (only for the SENSE values that use them), dtrsna and ztgsna IWORK (only for JOB = 'V'/'B'), dsyevx IWORK (none at N = 1). Now each demands the declared extent on every path but N = 0.
  - **Callers sized to the old checks**: tests of dgbrfs and zpprfs (NRHS = 0 with IWORK/RWORK of 1 for N = 4 / 3), dggevx (asserted the old `Iwork`/`Bwork` messages), dsyevx (asserted that N = 1 needs no IWORK), zggevx (IWORK/BWORK of 1 with SENSE = 'N'), ztgsna (IWORK `null` and of length 1 at N = 1).
- **What allowed it**: `conf:work-assert` required a guard for `WORK` only. W3 let `workspace-minimum` accept less than a declared extent as "reported", and most of these routines have no row in `data/fortran-lwmin.json` anyway. The replay's `short-work` variant reads the minimum from ndarray.js's own RangeError, so with no guard it had no minimum and skipped the workspace: over the 69 modules it now runs 2,095 more variants (7,103 to 9,198), with no mismatch.
- **Where else**: zggevx's four guards used a message (`` `WORK` must have at least ... (stride ``) the replay cannot parse, so `min-work`/`short-work` skipped them; now canonical. 23 other modules still have such messages (ticket 0108). A workspace whose spec `minLength` is null (zggevx RWORK) is outside the rule. The guard is only as right as the spec's `minLength`, and modules without a `data/fortran-lwmin.json` row are checked against nothing behavioral but the replay.

## 2026-11-27 — zlahef's upper row-max skipped row K; found once zhetrf's guard message became readable (ticket 0108)

- **Found by**: the wrapper replay's `min-work` variant on zhetrf. It had always skipped zhetrf, because the guard's message (`` `WORK` must have at least 1 element starting at offset %d ``) gave it no minimum. Once the 24 guards were made canonical, it reported `zhetrf min-work WORK=1 (of 490): ... argument 6[4] -5 vs 4`, and the same at WORK 140.
- **Reproduce**: zhetrf, complex, dense, UPLO = 'U', N = 66, the seeded LCG Hermitian matrix of `test/fortran/test_zhetrf.f90` (seed 1, entries in [-0.5, 0.5)), WORK = 66×64 or 66×2. Tests `zhetrf: upper_66_blocked_nb64/nb2 ...` in `lib/lapack/base/zhetrf/test/test.ndarray.js` fail on the old zlahef. The recorded calls came from `test.validate.js`'s random Hermitian N = 70 at WORK 490 and 140 (NB = 7 and 2).
- **Root cause**: in the upper branch, `lib/lapack/base/zlahef/lib/base.js:163` searched the row max with `izamax( k - imax - 1, ... )`. The reference's `IZAMAX( K-IMAX, W( IMAX+1, KW-1 ), 1 )` covers rows IMAX+1..K, i.e. `k - imax` elements 0-based. Row K was never compared, so a pivot decision could differ from the reference's. The reference gives the same pivots at every LWORK on these matrices. The old JS differed from it in 49 of 70 pivots at every NB ≥ 2, and nearly every random upper matrix with N > 64 triggers it. The factorization stayed valid (residual tests pass), but its pivots were not the reference's. dlasyf, zlasyf and every `_rook`/`_rk` sibling had it right; the copy two lines up (`zcopy( k - imax, ... )`) did too.
- **Bug class**: 0-based off-by-one in a count, in a branch whose tests compared only with themselves.
- **What allowed it**:
  - zlahef's only reference fixture is a lower case; its upper tests assert self-consistency.
  - zhetrf's upper N = 70 blocked tests assert only `info === 0`.
  - `test.validate.js` checks the residual, which a different but valid pivot choice passes.
  - Coverage counted the branch as tested (ticket 0093).
  - The replay's `min-work` comparison, which compares the blocked path with the unblocked one, was blind to zhetrf because of the guard message (ticket 0108).
- **Where else**: any pivoting kernel tested by residual alone, on a branch with no reference fixture. Residual properties cannot see pivot selection. The fix here compares IPIV and A with a Fortran fixture on the blocked upper path. The `min-work` variant gives some cross-path coverage wherever the workspace picks the algorithm.


## 2026-11-27 — NaN-blind comparison helpers in 11 test files passed results that were NaN; found by the first value-mutants survey (ticket 0093)

- **Found by**: `bin/value-mutants.mjs zsyr`. Deleting `tempR = ...` or `tempI = ...` in either branch of zsyr's base.js (so the update multiplies by `undefined`, and A fills with NaN) survived every test, although `test.ndarray.js` compares A with Fortran fixtures. 11 of zsyr's 14 mutants survived.
- **Reproduce**: complex and real, dense, no harness scheme: `node bin/value-mutants.mjs zsyr` on the old test file reports the 8 `delete-stmt` survivors at lines 74–98. Any of the fixture tests (e.g. `zsyr: upper alpha=1`, N = 3) passes on a mutant whose A is all NaN.
- **Root cause**: the test's helper checked `if ( Math.abs( actual - expected ) > tol ) { assert.fail(...) }`. Every comparison with NaN is false, so a NaN result never failed. The same helper, or an inline copy of it, was in `dlamswlq`, `dlamtsqr`, `dorgtsqr`, `zhetrd_he2hb`, `zhetrs`, `zsyr`, `zsytf2`, `zsytrf` (`test.ndarray.js` helpers) and `dlarft`, `dlarfy`, `dlarzt` (inline checks). Each now fails unless `Math.abs( actual - expected ) <= tol` holds (`if ( !( … <= tol ) )`). All 11 suites still pass, so no current result was NaN; the defect was in what the tests could see.
- **Bug class**: a test assertion that is vacuous for NaN. `assert.ok( err <= tol )` is safe; `if ( err > tol ) fail` and `assert.ok( !( err > tol ) )` are not.
- **Also found in the same survey**: zaxpy, dscal and zsyr's upper loop survived `i < N` -> `i <= N`: the extra iteration writes one element past the N the call owns, and every test sized its arrays exactly, so the write fell off the end of the typed array. Tests now give a longer buffer and check the tail is untouched.
- **Where else**: any test helper of the form `if ( Math.abs( a - b ) > tol )`, `if ( diff > tol )`, or `if ( relErr > tol )` followed by a throw. Test files are not linted (ticket 0081), so nothing stops a new one; value-mutants finds them only where a mutant makes the result NaN. Tests that size every array exactly cannot see writes past the end; give at least one test a longer, poisoned buffer.


## 2026-11-27 — 21 more NaN-blind test comparisons, and one in the harness's `assertZeroBlock`; found by linting test files (ticket 0081)

- **Found by**: the new lint rule `no-nan-blind-comparison`, once test files were linted at all (`eslint.config.cjs` had ignored `lib/**/test/**` and `test/**`).
- **Reproduce**: real, dense, no seed: `check.assertZeroBlock( S.real, M, 1, 3, 0, 1, { 'scale': NaN } )` on a 3×3 zero M with `M( 2, 0 ) = 1` passed on the old `test/harness/checks.js`. Test `assertZeroBlock: a nonzero entry fails even when the scale is NaN` in `test/harness/test.harness.js` fails on the old code.
- **Root cause**: `assertZeroBlock` failed on `if ( mag > t * ( scale + EPS ) )`. Each entry is checked with `isFinite` first, so `mag` is never NaN, but a NaN caller `scale` made the threshold NaN, and every entry passed. It now fails unless `mag <= t * ( scale + EPS )`. No caller passes a scale today, so no result was hidden. The same shape was in 21 comparisons in 20 module test helpers that ticket 0093's survey had not reached: `relErr > tol` in dger, dtrmm, dgeql2, dgeqr2, dgeqr2p, dgeqrf, dgeqrfp, dlarf, dlarfb, dlarzb, zlarfy, and another helper each in dlarft, dlarfy, dlarzt; `diff > tol && diff / … > tol` in zgehd2, zgehrd, zlahr2; a pass flag cleared on `relErr > tol` in dgges (twice); `Math.abs( H[…] ) > tol` then `return false` in dlaqr5; and a second helper in zsytrs. All 20 suites still pass after the change, so no current result was NaN.
- **Bug class**: a test assertion that is vacuous for NaN (as in ticket 0093's entry above), here also in a threshold built from a caller's input.
- **Where else**: any failure guarded by an ordered comparison. The rule now gates `lib/**/test/**` and `test/harness/**`. It recognizes floating-point comparisons by their operands (Math functions, division, tolerance-like names). A NaN-blind check on a value with an integer-looking name (`if ( x > 3 ) throw`) is not reported; see the rule's README.

## 2026-11-27 — dgsvj0/zgsvj0 wrote SVA(0), outside the array, at N = 0; found by value-mutants triage (ticket 0110)

- **Found by**: triaging `bin/value-mutants.mjs dgsvj0` survivors. `M < 0` -> `M <= 0` and `N < 0` -> `N <= 0` survived, so the N = 0 path was examined against the reference.
- **Reproduce**: real and complex, dense, no harness scheme. `dgsvj0( 'no-v', 2, 0, A, 1, 2, 0, d, 1, 1, sva = [7,7,7], 1, 2, 0, V, 1, 1, 0, eps, sfmin, 1e-10, 3, work, 1, 0 )` returns 0 and leaves `sva = [7, NaN, 7]`: it wrote `sva[ offsetSVA - strideSVA ]`. zgsvj0 the same with Complex128Array A/d/V. Base with M = N = 0 does the same. Tests `dgsvj0: N = 0 (also with M = 0) returns 0 and writes nothing ...` (`test/test.js`) and `ndarray: N = 0 returns 0 and writes nothing ...` / `base: M = 0 and N = 0 returns 0` (zgsvj0 `test/test.ndarray.js`) fail on the old code.
- **Root cause**: the reference has no N = 0 quick return; it computes KBL = MIN(8,N) = 0 and NBL = N/KBL, an integer division by zero, so N = 0 is outside what the reference defines (xGESVJ quick-returns before calling it). The JS computes `( 0 / 0 ) | 0 = 0` blocks, skips every loop, and then runs the end-of-sweep `SVA(N)` update with N = 0, i.e. at index `offsetSVA - strideSVA` (and reads column `offsetA - strideA2` and `d[ offsetD - strideD ]`). Fixed with `if ( N === 0 ) return 0;` after the argument checks (`lib/lapack/base/dgsvj0/lib/base.js:145`, `lib/lapack/base/zgsvj0/lib/base.js:102`).
- **Bug class**: write outside the caller's array on an empty problem, where the reference itself is undefined (integer division by zero), so no fixture could exist.
- **What allowed it**: every test sized `sva` exactly, so at offset 0 the write went to index -1 of the typed array and vanished; zgsvj0's existing N = 0 test asserted only `info`.
- **Where else**: dgsvj1 and zgsvj1 have the same code and the same write (checked: `[7, NaN, 7]`); any translation of a reference routine that divides by MIN(NB, N) or similar with no N = 0 quick return. Look for `( N / kbl ) | 0` and end-of-loop updates indexed by `N - 1`.
- **Fixed in the same PR**: dgsvj1 and zgsvj1 had the same N = 0 write (`[7, NaN, 7]`); they get the same quick return, with regression tests that fail on the old code.

## 2026-11-27 — dlarrd went on after DLAEBZ failed to converge, where the reference returns INFO = IINFO; found while triaging value mutants (ticket 0110)

- **Found by**: comparing `lib/lapack/base/dlarrd/lib/base.js` with `data/lapack-3.12.0/SRC/dlarrd.f` while triaging dlarrd's surviving value mutants (the survivors at the non-convergence branch `j > iout - 1 - iinfo`).
- **Reproduce**: real, tridiagonal, no harness scheme, no seed: D = [ 1, 2, -1, 3, 1, 0.5, 4 ], E = [ 0, 0.5, 0.7, 0, 0, 1, 0 ], ISPLIT = [ 1, 4, 5, 7 ] (four blocks, two 1x1), RANGE = 'all', ORDER = 'entire', RELTOL = 0, PIVMIN = SAFMIN, GERS the block Gershgorin intervals. Reference (`given_r_reltol0` in `test/fixtures/dlarrd.jsonl`): INFO = 3, M = 1 (only the first 1x1 block). Old JS: INFO = 1, M = 7, with the 3x3 and 2x2 blocks' eigenvalues stored and their IBLOCK negated. Test `ndarray: reltol=0 cannot converge below one ulp: as in the reference, DLAEBZ's IINFO is returned ...` in `lib/lapack/base/dlarrd/test/test.ndarray.js` fails on the old code.
- **Root cause**: after the bisection call (DLAEBZ, IJOB = 2) the reference has `IF( IINFO .NE. 0 ) THEN INFO = IINFO; RETURN`. The JS tested `iinfo < 0` (lib/lapack/base/dlarrd/lib/base.js:323), apparently borrowing DSTEBZ's handling, where a positive IINFO marks unconverged eigenvalues and the routine carries on. With that, the reference's dead branch (`J.GT.IOUT-IINFO`: NCNVRG, IB = -JBLK, INFO + 1) became live in JS.
- **Bug class**: error-return condition narrowed (`.NE. 0` translated as `< 0`), copying a sibling routine's convention instead of the reference's.
- **What allowed it**: the test for this input was written against the JS output (it asserted INFO = 1 and negative IBLOCK entries), not against a Fortran fixture; no fixture had an unconverged bisection; DLARRE, the reference caller, treats any nonzero INFO as failure, so no caller-level test noticed.
- **Where else**: routines that call DLAEBZ or DLARRB/DLARRK and check a returned info (dstebz, dlarre, dlarrv, dstemr), and any translation that has a near-twin in LAPACK (dlarrd/dstebz, dlarrk/dstebz): check each `IF( IINFO.NE.0 )` against its JS condition.

## 2026-11-27 — dgeevx's N = 1 shortcut returned RCONDV = 1 where the reference returns `|A(1,1)|`, and wrote condition numbers SENSE did not ask for; found by value-mutants triage (ticket 0110)

- **Found by**: triaging `node bin/value-mutants.mjs dgeevx` (94 of 143 mutants survived). Deleting `WI = ZERO`, `SCALE = ONE` or `RCONDV = ONE` in base.js's `if ( N === 1 )` block survived every test. The reference has no such block: for N = 1 it runs the general path, where DTRSNA's N = 1 case sets `SEP(1) = ABS(T(1,1))` and `S(1) = ONE`, each only when SENSE asks for it. A new Fortran battery in `test/fortran/test_dgeevx.f90` compared every output and failed on the old code.
- **Reproduce**: real, dense, no harness scheme, N = 1, any BALANC, A = [-2.5], JOBVL = JOBVR = 'compute-vectors'. SENSE = 'both' gave RCONDV = 1; the reference gives 2.5. SENSE = 'right-vectors' also wrote RCONDE = 1, which the reference leaves unchanged. SENSE = 'eigenvalues' also wrote RCONDV = 1. With |A| scaled to 1e-150 or 1e150, RCONDV = 1 where the reference gives ~5e-151 / 5e149. Failing tests on the old code: `dgeevx: N = 1 runs the reference's path: ...` and the `bat_n1_*` battery cases in `lib/lapack/base/dgeevx/test/test.ndarray.js` (49 failures).
- **Root cause**: `lib/lapack/base/dgeevx/lib/base.js` had a hand-written N = 1 early return (old lines 199–218) that is not in the reference. It hard-coded RCONDE = RCONDV = 1 whenever SENSE != 'none'. The fix deletes the block, so N = 1 takes the reference's path; the reference's minimum WORK (3 or 7) suffices there.
- **Bug class**: an invented special case that is not in the reference, giving a plausible constant (1) for an output whose reference value depends on the data.
- **What allowed it**:
  - The N = 1 test asserted WR, WI, VL, VR and ilo/ihi, but never RCONDE or RCONDV.
  - None of the module's tests read its Fortran fixtures. `test_dgeevx.f90` prints VL, VR and A with `print_matrix( name, M, N, N, NMAX )`, i.e. LDA = N on an NMAX-leading array, so those fixture fields are garbled (a separate ticket covers this).
  - Coverage counted the block as covered.
- **Where else**: `lib/lapack/base/zgeevx/lib/base.js:177` has the same N = 1 block. It also sets RCONDE = RCONDV = 1 (ZTRSNA's N = 1 case gives SEP(1) = ABS(T(1,1))), and it does not set ABNRM. More generally, look for any `if ( N === 1 )` early return in a driver whose reference has none, and compare each output it writes with the reference's general path at N = 1.
- **Fixed in the same PR**: zgeevx had the same invented N = 1 block (RCONDE = RCONDV = 1, and an existing test asserted it). The block is removed; a Fortran case `n1_sense_b` (RCONDV = |A(1,1)| = 3.6055…) replaces the test's assertions and fails on the old code.
