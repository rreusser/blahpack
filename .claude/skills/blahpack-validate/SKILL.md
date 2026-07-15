---
name: blahpack-validate
description: Rigorously validate a BLAS/LAPACK routine's correctness using the property-based harness. Repeatable process — classify the routine, pick generator/scheme/property from fixed tables, sweep sizes and flags, fuzz layouts, record the level. The argument is the routine name (e.g. `dpotrf`).
argument-hint: <routine>
---

# Validate a Routine

Validate `$ARGUMENTS` to a known, recorded **validation level** using the
property-based harness in `test/harness/` (read its `README.md` once). This is a
**fixed procedure** — do the steps in order, use the tables, don't improvise. The
point is that every routine is validated the same way, so coverage is consistent
and comparable across the library.

Correctness means: matches the mathematics, verified against an **independent**
oracle, across the sizes and layouts that exercise the routine's branch
structure. Fixture equality and coverage % are NOT correctness.

## Definition of done

- [ ] Property check passes across the full size sweep and **all** flag combos.
- [ ] **Layout-invariance** fuzz passes (bit-exact across storage layouts).
- [ ] Level recorded via `ledger.checked(...)`; `node bin/validation-level.js`
      shows `$ARGUMENTS` at **L3 or higher**.
- [ ] Any bug found is logged in `test/harness/LEARNINGS.md` (before/with the fix).
- [ ] Test lives at `lib/<pkg>/base/$ARGUMENTS/test/test.validate.js` and passes:
      `node --test lib/<pkg>/base/$ARGUMENTS/test/test.validate.js 2>&1 | tail -20`

**Target: every routine reaches at least L3.** Reach L4 when a trusted-routine or
Fortran oracle is available (see step 6).

---

## Step 0 — Classify the routine (this drives everything)

Parse the name `[d|z|s|c][type-code][op]`:

- **Scalar**: `d`/`s` → `S.real`; `z`/`c` → `S.complex`. If both a `d` and `z`
  form exist, validate **both** (same test, loop the scalar).
- **Type-code** → storage scheme + structured generator (Step 1).
- **Operation** → validation property (Step 2).

## Step 1 — Storage scheme + generator (from the type-code)

| Type-code | Scheme | `logical` generator | `spec` |
|---|---|---|---|
| `ge` general dense | `schemes.dense` | `general(sc,rng,m,n)` | `{part:'full'}` |
| `gb` general band | `schemes.banded` | `banded(sc,rng,m,n,kl,ku)` | `{kl,ku}` |
| `sy`/`he` dense | `schemes.dense` | `symmetric`/`hermitian(sc,rng,n)` | `{part:uplo}` |
| `sp`/`hp` packed | `schemes.packed` | `symmetric`/`hermitian(sc,rng,n)` | `{part:uplo}` |
| `sb`/`hb` band | `schemes.banded` | `hermitianBanded(sc,rng,n,k)` | `{part:uplo,k}` |
| `tr` triangular dense | `schemes.dense` | `triangular(sc,rng,n,{uplo,unit})` | `{part:uplo,unit}` |
| `tp` triangular packed | `schemes.packed` | `triangular(...)` | `{part:uplo,unit}` |
| `po` SPD dense | `schemes.dense` | `positiveDefinite(sc,rng,n)` | `{part:uplo}` |
| `pp` SPD packed | `schemes.packed` | `positiveDefinite(...)` | `{part:uplo}` |
| `pb` SPD band | `schemes.banded` | `positiveDefiniteBanded(sc,rng,n,k)` | `{part:uplo,k}` |

If the type-code has **no scheme or generator yet** (`tb` banded-triangular, RFP
`rf`, tridiagonal `gt`/`pt`, bidiagonal): extend the harness first (add the
generator to `logical.js` and/or the scheme to `schemes.js`), and record the gap
+ what you added as a `LEARNINGS.md` note. Do NOT hand-roll storage inline in the
test — that defeats the consistency the harness exists to enforce.

## Step 2 — Validation property (from the operation)

Pick the check by what the routine *does*. All use the independent oracle in
`ref` / `check`; none compares against the library under test.

| Operation class | Examples | Property check |
|---|---|---|
| Cholesky factorization | `potrf`,`pbtrf`,`pptrf` | reconstruct `A = UᴴU` (upper) / `LLᴴ` (lower): `check.assertReconstruct(sc, ref.matmul(sc,F,F,{transa:'c'}...), A)` |
| LU factorization | `getrf`,`gbtrf` | reconstruct `P·A = L·U` (apply IPIV; unit-lower `L`, upper `U`) |
| QR/LQ factorization | `geqrf`,`gelqf` | reconstruct `A = Q·R` **and** `check.assertOrthonormal(sc, Q)` |
| Triangular/SPD solve | `trsm`,`trsv`,`potrs`,`getrs`,`tpsv` | `check.assertResidual(sc, A, x, b, {trans})` per RHS column |
| Matrix–vector | `gemv`,`symv`,`hemv`,`spmv`,`gbmv` | compare output to `ref.matvec` (`y = αAx + βy₀`) via `assertScaled` |
| Matrix–matrix | `gemm`,`symm`,`trmm`,`syrk`,`syr2k` | compare output to `ref.matmul` (`C = αAB + βC₀`) |
| Inverse | `getri`,`potri`,`trtri`,`tptri` | reconstruct `A·A⁻¹ = I` via `ref.matmul` |
| Rank update | `ger`,`syr`,`her`,`spr` | compare to `ref` outer product added to `A₀` |
| Reduction (produces zeros) | `geqr2` subcol, `gehrd`, `getf2` pivots | `check.assertZeroBlock(...)` on the annihilated region + reconstruction |

If none fits, use **cross-validation** (Step 6) as the primary check.

## Step 3 — Sweep sizes and ALL flag combinations

Non-negotiable, this is where hidden branches live:

- Sizes: iterate `SIZES` (or `SIZES_SMALL` for O(n³)) — they straddle unrolled-
  remainder (`n%4≠0`) and block crossovers (NB=32/64).
- Flags: take the **full cross product** of every applicable string flag the
  routine accepts: `uplo∈{upper,lower}`, `trans∈{no-transpose,transpose,
  conjugate-transpose}`, `diag∈{unit,non-unit}`, `side∈{left,right}`. Each flag
  selects a distinct code path.
- Bandwidths (banded types): `k`/`(kl,ku) ∈ {0, 1, small, ≈n-1}`.
- Seed every case from a fixed formula (e.g. `new RNG(0x100 + n)`) so a failure
  reproduces exactly. **Log the seed** in any `LEARNINGS.md` entry.

## Step 4 — Layout-invariance fuzz (required for L3)

Same routine, same values (fix the seed), re-run under every layout the scheme
exposes; assert the output is **bit-for-bit** identical. This is the cheapest,
highest-signal test for offset/stride/row-vs-col-major bugs.

```js
// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { layoutInvariant } from '../../../../../test/harness/invariance.js';
layoutInvariant( schemes.<scheme>.layouts(), ( layout, idx ) => {
  const rng = new RNG( FIXED_SEED );            // identical values every variant
  const A = logical.<gen>( sc, rng, ... );
  const R = schemes.<scheme>.realize( sc, A, spec, layout );
  const V = schemes.realizeVector( sc, vals, schemes.vectorLayouts()[ idx % 6 ] );
  routine( ...flags, dims, R.data, ...R.args, V.data, ...V.args );
  const out = /* read output back via R.read / V.read into a LogicalMatrix */;
  return check.flattenLogical( sc, out );       // canonical, layout-independent
}, { label: '$ARGUMENTS layout invariance' } );
```

Fuzz **every** operand's layout (the matrix scheme AND the vectors), including
negative strides and row-major, which `schemes.dense.layouts()` /
`vectorLayouts()` already include.

## Step 5 — Record the level (honestly)

Wrap each real check so it only counts when it passes:

```js
import { checked } from '../../../../../test/harness/ledger.js';
checked( '$ARGUMENTS', 'reconstruct', () => check.assertReconstruct( sc, recon, A ) );
checked( '$ARGUMENTS', 'layout-invariance', () => layoutInvariant( ... ) );
```

Kinds → levels: `residual|reconstruct|structural|orthonormal` = L2,
`layout-invariance` = L3, `cross-validation|differential` = L4. Then:

```bash
node --test lib/<pkg>/base/$ARGUMENTS/test/test.validate.js 2>&1 | tail -20
node bin/validation-level.js            # confirm $ARGUMENTS is L3+
```

## Step 6 — (Optional, for L4) cross-validate / differential

- **Cross-validation**: express the routine via an already-trusted routine and
  compare. E.g. validate `symm`/`hemv`/packed forms against `gemm`/`gemv` on the
  densified logical matrix. Record kind `cross-validation`. Builds structural
  rigidity: trusted routines become oracles for others.
- **Differential vs Fortran**: compare against the reference Fortran fixture/
  program for identical generated inputs. Record kind `differential`. The Fortran
  is the correctness baseline.

## Step 7 — On ANY failure: log before you fix

**Mandatory.** Add an entry to `test/harness/LEARNINGS.md` (newest first):
routine, reproducing **seed** + scalar + scheme + flags + dims, **root cause**,
**bug class** (`off-by-one`/`0-vs-1-index`/`wrong-branch`/`row-col-transpose`/
`stride-sign`/`uplo-trans-diag-handling`/`storage-mapping`/`tolerance`/
`convention`), and **generalization** (which sibling routines to check next).
Then fix. Never fix silently — the learning is the deliverable.

---

## Consistency rules (apply to every routine, no exceptions)

1. Never allocate storage by hand in a test — always via a `schemes.*` realizer
   (poisoning + layout freedom come for free). Extend the harness if a scheme is
   missing.
2. Always validate against `ref`/`check` (independent oracle), never against the
   library under test — except the explicit `cross-validation` layer.
3. Always sweep the full size list and the full flag cross-product.
4. Always run the layout-invariance fuzz (bit-exact). No routine ships below L3.
5. Always record via `checked(...)` so the level is honest.
6. Validate `d` and `z` forms together when both exist.
7. Any failure → `LEARNINGS.md` entry first.

## Batch validation

To validate many routines, dispatch each to its own background agent (per the
batch workflow in `CLAUDE.md`) with a self-contained prompt embedding this
procedure and the routine's Step-0 classification. Do NOT validate in the main
context. After agents finish, run `node bin/validation-level.js` and
`bin/test-failures.sh 2>&1 | tail -30`.
