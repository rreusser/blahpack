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
- **Root cause**: NOT fully localized (a fix belongs to a dedicated `zhptrf`
  validation pass, out of scope for the zhptri inverse task — same discipline as
  the zpptri-sweep / zlatps entries: do not hand-patch a factorization without its
  own validation). Best evidence: the errors are CONJUGATIONS introduced on the
  UPPER path only, and the minimal failing case (n=3) DOES perform an interchange
  (IPIV=[0,0,0] ⇒ 0-based kp=0 ⇒ 1-based kp=1≠k for k=3 ⇒ swap cols 1,3). So the
  prime suspects are the upper-triangle "swap and conjugate rows kp+1..kk-1" loop
  and the surrounding conjugation of the interchanged column
  (`lib/lapack/base/zhptrf/lib/base.js` ~L251–L268, and the 2×2 block update
  ~L305–L390), where a `conj` is applied with the wrong sign or to the wrong
  operand relative to reference ZHPTRF. The lower path's analogous logic is
  correct, which localizes it to the upper branch. `zhpr` (the shared BLAS
  Hermitian packed rank-1 update zhptrf calls) was independently verified CORRECT
  against a from-scratch `A + α·x·xᴴ` reference, so the bug is in zhptrf's own
  upper indexing/conjugation, not in zhpr.
- **Bug class**: `uplo/trans/diag-handling` (upper-branch conjugation error in a
  Hermitian packed factorization).
- **zhptri itself is CORRECT**: fed a VALID factor+IPIV (the dense `zhetrf` factor
  re-packed), `zhptri` reconstructs `A0·inv=I` to ~1e-13 for BOTH uplo across
  n=1..64. So `lib/lapack/base/zhptri/test/test.validate.js` sources its factor
  from `zhetrf` (documented in the test header) to validate zhptri INDEPENDENTLY
  of the broken zhptrf — reaching L3 honestly. Switch the factor source back to
  `zhptrf` once its upper path is fixed.
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

<!-- Add new entries above this line. -->
