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
  re-run — see generalization.
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

<!-- Add new entries above this line. -->
